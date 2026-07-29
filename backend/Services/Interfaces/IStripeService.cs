using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IStripeService
{
    string PublishableKey { get; }

    /// <summary>Crea un SetupIntent para que el frontend capture una tarjeta con Stripe Elements.</summary>
    Task<IniciarPagoDto> CrearSetupIntentAsync(int empresaId, CancellationToken ct = default);

    /// <summary>Cobra la primera mensualidad y crea la suscripción recurrente en Stripe.</summary>
    Task<CrearSuscripcionResultDto> CrearSuscripcionAsync(int empresaId, CrearSuscripcionRequest request, CancellationToken ct = default);

    /// <summary>Canjea un código de descuento que cubre el 100% del plan sin pasar por Stripe
    /// (no pide tarjeta). Si la empresa ya tenía una suscripción de pago, se cancela.</summary>
    Task<CrearSuscripcionResultDto> CanjearCodigoGratisAsync(int empresaId, CanjearGratisRequest request, CancellationToken ct = default);

    /// <summary>Procesa un evento de webhook de Stripe (renovación, cancelación, etc.).</summary>
    Task ProcesarWebhookAsync(string json, string firmaHeader, CancellationToken ct = default);
}
