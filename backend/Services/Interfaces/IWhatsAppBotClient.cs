using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

/// <summary>Cliente HTTP delgado hacia whatsapp-bot/ (Node + Baileys) — el bot es solo
/// transporte, toda la lógica de negocio vive del lado del backend.</summary>
public interface IWhatsAppBotClient
{
    /// <summary>Devuelve false (nunca lanza) si el bot no responde o falla el envío —
    /// el llamador decide qué hacer con eso (marcar el mensaje como fallido).</summary>
    Task<bool> EnviarAsync(string telefono, string texto, CancellationToken ct = default);

    Task<WhatsAppBotStatusDto> ObtenerEstadoAsync(CancellationToken ct = default);
}
