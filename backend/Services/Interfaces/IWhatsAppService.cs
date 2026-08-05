using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IWhatsAppService
{
    /// <summary>Procesa un mensaje entrante reportado por whatsapp-bot/: crea o encuentra la
    /// conversación, deduplica por WhatsAppMessageId, y si la IA está activa genera y envía
    /// una respuesta.</summary>
    Task ProcesarEntranteAsync(WhatsAppInboundRequest request, CancellationToken ct = default);

    Task<List<WhatsAppConversacionDto>> GetConversacionesAsync();
    Task<List<WhatsAppMensajeDto>> GetMensajesAsync(int conversacionId);
    Task<WhatsAppConversacionDto?> ActualizarEtapaAsync(int conversacionId, string etapa);
    Task<WhatsAppConversacionDto?> ResponderManualAsync(int conversacionId, string texto);
    Task<WhatsAppConversacionDto?> ReactivarIaAsync(int conversacionId);
    Task<WhatsAppConversacionDto?> ActualizarNotasAsync(int conversacionId, string? notas);
    Task<WhatsAppConversacionDto?> ActualizarTelefonoAsync(int conversacionId, string telefono);

    /// <summary>Crea una conversación iniciada por el admin (o devuelve la existente si el
    /// teléfono ya tiene una). Normaliza el número al formato JID de WhatsApp.</summary>
    Task<WhatsAppConversacionDto> CrearConversacionAsync(string telefono, string? nombreContacto);
    /// <summary>Contexto personalizado de la IA (null = se usa el default hardcodeado).</summary>
    Task<string?> GetContextoIaAsync();
    Task<string?> ActualizarContextoIaAsync(string? contexto);

    Task<WhatsAppBotStatusDto> GetEstadoBotAsync();
}
