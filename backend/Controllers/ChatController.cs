using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MasplusCards.Api.Controllers;

public record ChatMensajeDto(string Rol, string Texto);
public record ChatRequest(List<ChatMensajeDto> Mensajes);
public record ChatResponse(string Respuesta);

/// <summary>Chat público de la landing: el visitante habla directo con Ricardo (la misma IA y el
/// mismo contexto editable que atiende WhatsApp), sin salir de la página. Nada se persiste: el
/// historial viaja completo desde el navegador en cada turno.</summary>
[ApiController]
[Route("api/chat")]
[AllowAnonymous]
public class ChatController : ControllerBase
{
    private const int MaxMensajes = 16;
    private const int MaxLargoMensaje = 500;
    private const int MaxTurnosPorHora = 25;

    private readonly IOpenRouterService _ia;
    private readonly IPlanesService _planes;
    private readonly IWhatsAppService _whatsApp;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ChatController> _logger;

    public ChatController(
        IOpenRouterService ia, IPlanesService planes, IWhatsAppService whatsApp,
        IMemoryCache cache, ILogger<ChatController> logger)
    {
        _ia = ia;
        _planes = planes;
        _whatsApp = whatsApp;
        _cache = cache;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<ChatResponse>> Responder([FromBody] ChatRequest request, CancellationToken ct)
    {
        if (request?.Mensajes == null || request.Mensajes.Count == 0)
            return BadRequest(new { message = "Sin mensajes." });
        if (request.Mensajes.Count > MaxMensajes)
            return BadRequest(new { message = "La conversación es muy larga; recarga la página para empezar de nuevo." });
        if (request.Mensajes.Any(m => string.IsNullOrWhiteSpace(m.Texto) || m.Texto.Length > MaxLargoMensaje))
            return BadRequest(new { message = "Mensaje inválido." });
        if (request.Mensajes[^1].Rol != "cliente")
            return BadRequest(new { message = "El último mensaje debe ser del visitante." });

        // La IA se paga por uso: freno básico por IP para que un curioso con un script no
        // queme la cuota. Suficiente contra abuso casual; no pretende parar a un atacante serio.
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "?";
        var cacheKey = $"chat-rl:{ip}";
        var usados = _cache.Get<int>(cacheKey);
        if (usados >= MaxTurnosPorHora)
            return StatusCode(429, new { message = "Demasiados mensajes por ahora. Intenta de nuevo en un rato." });
        _cache.Set(cacheKey, usados + 1, TimeSpan.FromHours(1));

        var ahora = DateTime.UtcNow;
        var historial = request.Mensajes
            .Select((m, i) => new WhatsAppMensaje
            {
                Rol = m.Rol == "cliente" ? "cliente" : "ia",
                Texto = m.Texto.Trim(),
                CreatedAt = ahora.AddSeconds(i - request.Mensajes.Count),
            })
            .ToList();

        var planes = await _planes.GetCatalogoAsync();
        var contexto = await _whatsApp.GetContextoIaAsync();

        // Mismo Ricardo que WhatsApp, con una aclaración: este visitante YA está en la página,
        // así que el cierre natural es mandarlo al registro con un clic.
        var contextoWeb = (contexto ?? Services.OpenRouterService.ContextoPersonaDefault) + """


            Nota importante: en esta conversación NO estás en WhatsApp; estás en el chat de la propia página maspluss.com. El visitante ya está navegando el sitio, así que cuando notes interés dile que se registre ahí mismo en https://www.maspluss.com/empresa/registro (le toma un minuto). Mantén las respuestas cortas (2 a 4 oraciones), es un chat de página web.
            """;

        try
        {
            var respuesta = await _ia.GenerarRespuestaAsync(historial, planes, contextoWeb, ct);
            return Ok(new ChatResponse(respuesta));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat web: fallo generando respuesta de la IA");
            return StatusCode(502, new { message = "No pude responder ahora mismo. Intenta de nuevo en un momento." });
        }
    }
}
