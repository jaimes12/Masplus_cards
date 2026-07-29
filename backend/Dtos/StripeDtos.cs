namespace MasplusCards.Api.Dtos;

/// <summary>Datos para que el frontend inicialice Stripe.js y capture una tarjeta.</summary>
public record IniciarPagoDto(string ClientSecret, string PublishableKey);

public record CrearSuscripcionRequest(int PlanId, string PaymentMethodId, string? CodigoDescuento);

/// <summary>Resultado de intentar crear la suscripción. Si RequiereAccion es true, el frontend debe
/// completar la autenticación (3D Secure) con ClientSecret antes de darla por confirmada.</summary>
public record CrearSuscripcionResultDto(bool RequiereAccion, string? ClientSecret, EmpresaPlanDto? Plan);
