using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

/// <summary>Recibe mensajes entrantes desde whatsapp-bot/ (Node + Baileys). No usa
/// [Authorize] — lo llama el bot, no un usuario logueado — está protegido por
/// [SharedSecretAuth] en su lugar.</summary>
[ApiController]
[Route("api/whatsapp")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly IWhatsAppService _service;

    public WhatsAppWebhookController(IWhatsAppService service)
    {
        _service = service;
    }

    [HttpPost("inbound")]
    [SharedSecretAuth]
    public async Task<IActionResult> Inbound([FromBody] WhatsAppInboundRequest request)
    {
        await _service.ProcesarEntranteAsync(request);
        return NoContent();
    }
}
