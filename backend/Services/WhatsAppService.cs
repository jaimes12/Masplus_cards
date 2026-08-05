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
    private const string ClaveContextoIa = "whatsapp_ia_contexto";

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
            var contextoIa = await GetContextoIaAsync();

            var respuesta = await _ia.GenerarRespuestaAsync(historial, planes, contextoIa, ct);
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

    public async Task<WhatsAppConversacionDto?> ActualizarNotasAsync(int conversacionId, string? notas)
    {
        var conversacion = await _db.WhatsAppConversaciones.FirstOrDefaultAsync(c => c.Id == conversacionId);
        if (conversacion == null) return null;

        conversacion.Notas = string.IsNullOrWhiteSpace(notas) ? null : notas.Trim();
        await _db.SaveChangesAsync();
        return ToDto(conversacion, null);
    }

    public async Task<WhatsAppConversacionDto?> ActualizarTelefonoAsync(int conversacionId, string telefono)
    {
        var normalizado = telefono.Trim();
        if (normalizado.Length == 0)
            throw new InvalidOperationException("El teléfono no puede estar vacío.");

        var conversacion = await _db.WhatsAppConversaciones.FirstOrDefaultAsync(c => c.Id == conversacionId);
        if (conversacion == null) return null;

        var enUsoPorOtra = await _db.WhatsAppConversaciones.AnyAsync(c => c.Id != conversacionId && c.Telefono == normalizado);
        if (enUsoPorOtra)
            throw new InvalidOperationException("Ya existe otra conversación con ese teléfono.");

        conversacion.Telefono = normalizado;
        await _db.SaveChangesAsync();
        return ToDto(conversacion, null);
    }

    public async Task<WhatsAppConversacionDto> CrearConversacionAsync(string telefono, string? nombreContacto)
    {
        var digitos = new string(telefono.Where(char.IsDigit).ToArray());

        // Normalización al formato JID de WhatsApp, pensada para México (el mercado del
        // producto): los celulares mexicanos usan 521 + 10 dígitos. Otros países se aceptan
        // en formato internacional completo (E.164 sin el '+').
        var normalizado = digitos switch
        {
            { Length: 10 } => "521" + digitos,
            { Length: 12 } when digitos.StartsWith("52") => "521" + digitos[2..],
            { Length: >= 11 and <= 15 } => digitos,
            _ => throw new InvalidOperationException(
                "Número inválido. Usa 10 dígitos para México (ej. 4494250350) o el formato internacional completo con código de país."),
        };

        var existente = await _db.WhatsAppConversaciones.FirstOrDefaultAsync(c => c.Telefono == normalizado);
        if (existente != null) return ToDto(existente, null);

        var conversacion = new WhatsAppConversacion
        {
            Telefono = normalizado,
            NombreContacto = string.IsNullOrWhiteSpace(nombreContacto) ? null : nombreContacto.Trim(),
            // Chat iniciado por el admin: arranca en manual para que la IA no salude sola
            // a alguien que nunca escribió. Se puede reactivar desde el modal.
            IaActiva = false,
            UltimoMensajeEn = MexicoCityTime.Now(),
        };
        _db.WhatsAppConversaciones.Add(conversacion);
        await _db.SaveChangesAsync();
        return ToDto(conversacion, null);
    }

    public async Task<string?> GetContextoIaAsync() =>
        (await _db.Configuraciones.AsNoTracking().FirstOrDefaultAsync(c => c.Clave == ClaveContextoIa))?.Valor;

    public async Task<string?> ActualizarContextoIaAsync(string? contexto)
    {
        var limpio = string.IsNullOrWhiteSpace(contexto) ? null : contexto.Trim();
        var fila = await _db.Configuraciones.FirstOrDefaultAsync(c => c.Clave == ClaveContextoIa);

        if (limpio == null)
        {
            // Vacío = volver al contexto default (se borra la personalización).
            if (fila != null) _db.Configuraciones.Remove(fila);
        }
        else if (fila == null)
        {
            _db.Configuraciones.Add(new Configuracion { Clave = ClaveContextoIa, Valor = limpio });
        }
        else
        {
            fila.Valor = limpio;
        }

        await _db.SaveChangesAsync();
        return limpio;
    }

    public Task<WhatsAppBotStatusDto> GetEstadoBotAsync() => _bot.ObtenerEstadoAsync();

    private static WhatsAppConversacionDto ToDto(WhatsAppConversacion c, string? ultimoMensajeTexto) => new(
        c.Id, c.Telefono, c.NombreContacto, c.Etapa, c.IaActiva, c.Notas, c.UltimoMensajeEn, c.CreatedAt, ultimoMensajeTexto);
}
