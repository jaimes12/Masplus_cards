namespace MasplusCards.Api.Models;

/// <summary>Configuración de Stripe para cobrar los planes de suscripción.
/// No se llama StripeConfiguration a propósito: choca con Stripe.StripeConfiguration del SDK.</summary>
public class StripeSettings
{
    public string PublishableKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string? WebhookSecret { get; set; }
}
