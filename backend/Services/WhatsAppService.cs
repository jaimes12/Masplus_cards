using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class WhatsAppService : IWhatsAppService
{
    private static readonly string[] EtapasValidas = ["nuevo", "en_platica", "calificado", "convertido", "perdido"];
    private const int MensajesDeContexto = 20;

    private readonly AppDbContext _db;
    private readonly IOpenRouterService _ia;
    private readonly IWhatsAppBotClient _bot;
    private readonly IPlanesService _planes;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(AppDbContext db, IOpenRouterService ia, IWhatsAppBotClient bot, IPlanesService planes, ILogger<WhatsAppService> logger)
    {
        _db = db;
        _ia = ia;
        _bot = bot;
        _planes = planes;
        _logger = logger;
    }

    public async Task ProcesarEntranteAsync(WhatsAppInboundRequest request, CancellationToken ct = default)
    {
        var yaProcesado = await _db.WhatsAppMensajes.AnyAsync(m => m.WhatsAppMessageId == request.WhatsAppMessageId, ct);
        if (yaProcesado)
        {
            _logger.LogInformation("Mensaje de WhatsApp {MessageId} ya procesado, se ignora (reintento).", request.WhatsAppMessageId);
            return;
        }

        var conversacion = await _db.WhatsAppConversaciones.FirstOrDefaultAsync(c => c.Telefono == request.Telefono, ct);
        if (conversacion == null)
        {
            conversacion = new WhatsAppConversacion { Telefono = request.Telefono, NombreContacto = request.NombreContacto };
            _db.WhatsAppConversaciones.Add(conversacion);
            await _db.SaveChangesAsync(ct);
        }
        else if (!string.IsNullOrWhiteSpace(request.NombreContacto))
        {
            conversacion.NombreContacto = request.NombreContacto;
        }

        conversacion.UltimoMensajeEn = MexicoCityTime.Now();
        if (conversacion.Etapa == "nuevo") conversacion.Etapa = "en_platica";

        _db.WhatsAppMensajes.Add(new WhatsAppMensaje
        {
            ConversacionId = conversacion.Id,
            Rol = "cliente",
            Texto = request.Texto,
            WhatsAppMessageId = request.WhatsAppMessageId,
            EstadoEnvio = "n/a",
        });
        await _db.SaveChangesAsync(ct);

        if (!conversacion.IaActiva) return;

        try
        {
            var historial = await _db.WhatsAppMensajes
                .Where(m => m.ConversacionId == conversacion.Id)
                .OrderByDescending(m => m.CreatedAt)
                .Take(MensajesDeContexto)
                .ToListAsync(ct);
            var planes = await _planes.GetCatalogoAsync();

            var respuesta = await _ia.GenerarRespuestaAsync(historial, planes, ct);
            var enviado = await _bot.EnviarAsync(conversacion.Telefono, respuesta, ct);

            conversacion.UltimoMensajeEn = MexicoCityTime.Now();
            _db.WhatsAppMensajes.Add(new WhatsAppMensaje
            {
                ConversacionId = conversacion.Id,
                Rol = "ia",
                Texto = respuesta,
                EstadoEnvio = enviado ? "enviado" : "fallido",
            });
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            // Un fallo de la IA (rate limit, OpenRouter caído, etc.) no debe tumbar el webhook —
            // el mensaje del cliente ya quedó guardado y visible para que un admin responda.
            _logger.LogWarning(ex, "No se pudo generar/enviar la respuesta de IA para la conversación {ConversacionId}", conversacion.Id);
        }
    }

    public async Task<List<WhatsAppConversacionDto>> GetConversacionesAsync()
    {
        var conversaciones = await _db.WhatsAppConversaciones.OrderByDescending(c => c.UltimoMensajeEn).ToListAsync();
        var ids = conversaciones.Select(c => c.Id).ToList();

        var mensajes = await _db.WhatsAppMensajes
            .Where(m => ids.Contains(m.ConversacionId))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
        var ultimoTexto = mensajes.GroupBy(m => m.ConversacionId).ToDictionary(g => g.Key, g => g.First().Texto);

        return conversaciones.Select(c => ToDto(c, ultimoTexto.GetValueOrDefault(c.Id))).ToList();
    }

    public async Task<List<WhatsAppMensajeDto>> GetMensajesAsync(int conversacionId)
    {
        return await _db.WhatsAppMensajes
            .Where(m => m.ConversacionId == conversacionId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new WhatsAppMensajeDto(m.Id, m.Rol, m.Texto, m.EstadoEnvio, m.CreatedAt))
            .ToListAsync();
    }

    public async Task<WhatsAppConversacionDto?> ActualizarEtapaAsync(int conversacionId, string etapa)
    {
        if (!EtapasValidas.Contains(etapa))
            throw new InvalidOperationException($"Etapa inválida. Debe ser una de: {string.Join(", ", EtapasValidas)}.");

        var conversacion = await _db.WhatsAppConversaciones.FirstOrDefaultAsync(c => c.Id == conversacionId);
        if (conversacion == null) return null;

        conversacion.Etapa = etapa;
        await _db.SaveChangesAsync();
        return ToDto(conversacion, null);
    }

    public async Task<WhatsAppConversacionDto?> ResponderManualAsync(int conversacionId, string texto)
    {
        var conversacion = await _db.WhatsAppConversaciones.FirstOrDefaultAsync(c => c.Id == conversacionId);
        if (conversacion == null) return null;

        var enviado = await _bot.EnviarAsync(conversacion.Telefono, texto);

        conversacion.IaActiva = false;
        conversacion.UltimoMensajeEn = MexicoCityTime.Now();
        _db.WhatsAppMensajes.Add(new WhatsAppMensaje
        {
            ConversacionId = conversacion.Id,
            Rol = "admin",
            Texto = texto,
            EstadoEnvio = enviado ? "enviado" : "fallido",
        });
        await _db.SaveChangesAsync();
        return ToDto(conversacion, texto);
    }

    public async Task<WhatsAppConversacionDto?> ReactivarIaAsync(int conversacionId)
    {
        var conversacion = await _db.WhatsAppConversaciones.FirstOrDefaultAsync(c => c.Id == conversacionId);
        if (conversacion == null) return null;

        conversacion.IaActiva = true;
        await _db.SaveChangesAsync();
        return ToDto(conversacion, null);
    }

    public Task<WhatsAppBotStatusDto> GetEstadoBotAsync() => _bot.ObtenerEstadoAsync();

    private static WhatsAppConversacionDto ToDto(WhatsAppConversacion c, string? ultimoMensajeTexto) => new(
        c.Id, c.Telefono, c.NombreContacto, c.Etapa, c.IaActiva, c.UltimoMensajeEn, c.CreatedAt, ultimoMensajeTexto);
}
