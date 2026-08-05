using MasplusCards.Api.Dtos;
using MasplusCards.Api.Models;

namespace MasplusCards.Api.Services.Interfaces;

public interface IOpenRouterService
{
    /// <summary>Genera la respuesta de la IA dado el historial de la conversación (ordenado
    /// cronológicamente) y el catálogo de planes vigente, resuelto en cada llamada para que la
    /// IA siempre responda con precios reales. contextoPersona reemplaza la parte editable del
    /// system prompt (personalidad/instrucciones de venta); null usa el default.</summary>
    Task<string> GenerarRespuestaAsync(List<WhatsAppMensaje> historial, List<PlanDto> planes, string? contextoPersona = null, CancellationToken ct = default);
}
