using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace MasplusCards.Api.Controllers;

[ApiController]
public class StripeController : ControllerBase
{
    private readonly IStripeService _stripe;

    public StripeController(IStripeService stripe)
    {
        _stripe = stripe;
    }

    [HttpPost("api/empresa/stripe/setup-intent")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<IniciarPagoDto>> CrearSetupIntent(CancellationToken ct)
    {
        try
        {
            return Ok(await _stripe.CrearSetupIntentAsync(User.GetEmpresaId(), ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StripeException ex)
        {
            return BadRequest(new { error = ex.StripeError?.Message ?? ex.Message });
        }
    }

    [HttpPost("api/empresa/stripe/suscripcion")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<CrearSuscripcionResultDto>> CrearSuscripcion([FromBody] CrearSuscripcionRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _stripe.CrearSuscripcionAsync(User.GetEmpresaId(), request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StripeException ex)
        {
            return BadRequest(new { error = ex.StripeError?.Message ?? ex.Message });
        }
    }

    /// <summary>Canjea un código de descuento 100% sin pasar por Stripe (no pide tarjeta).</summary>
    [HttpPost("api/empresa/stripe/canjear-gratis")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<CrearSuscripcionResultDto>> CanjearGratis([FromBody] CanjearGratisRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _stripe.CanjearCodigoGratisAsync(User.GetEmpresaId(), request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StripeException ex)
        {
            return BadRequest(new { error = ex.StripeError?.Message ?? ex.Message });
        }
    }

    /// <summary>Webhook de Stripe: renovaciones, cancelaciones, etc. Sin autenticación de usuario
    /// (Stripe firma el cuerpo con Stripe:WebhookSecret, verificado adentro).</summary>
    [HttpPost("api/stripe/webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync(ct);
        try
        {
            await _stripe.ProcesarWebhookAsync(json, Request.Headers["Stripe-Signature"]!, ct);
            return Ok();
        }
        catch (StripeException)
        {
            return BadRequest();
        }
    }
}
