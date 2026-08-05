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
    Task<WhatsAppBotStatusDto> GetEstadoBotAsync();
}
