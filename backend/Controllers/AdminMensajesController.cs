using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/admin/mensajes")]
[Authorize(Roles = "Admin")]
public class AdminMensajesController : ControllerBase
{
    private readonly IWhatsAppService _service;

    public AdminMensajesController(IWhatsAppService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<WhatsAppConversacionDto>>> GetConversaciones()
    {
        return Ok(await _service.GetConversacionesAsync());
    }

    [HttpPost]
    public async Task<ActionResult<WhatsAppConversacionDto>> CrearConversacion([FromBody] CrearConversacionRequest request)
    {
        try
        {
            return Ok(await _service.CrearConversacionAsync(request.Telefono, request.NombreContacto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}/mensajes")]
    public async Task<ActionResult<List<WhatsAppMensajeDto>>> GetMensajes(int id)
    {
        return Ok(await _service.GetMensajesAsync(id));
    }

    [HttpPut("{id:int}/etapa")]
    public async Task<ActionResult<WhatsAppConversacionDto>> ActualizarEtapa(int id, [FromBody] ActualizarEtapaRequest request)
    {
        try
        {
            var conversacion = await _service.ActualizarEtapaAsync(id, request.Etapa);
            return conversacion == null ? NotFound() : Ok(conversacion);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/responder")]
    public async Task<ActionResult<WhatsAppConversacionDto>> Responder(int id, [FromBody] ResponderManualRequest request)
    {
        var conversacion = await _service.ResponderManualAsync(id, request.Texto);
        return conversacion == null ? NotFound() : Ok(conversacion);
    }

    [HttpPost("{id:int}/reactivar-ia")]
    public async Task<ActionResult<WhatsAppConversacionDto>> ReactivarIa(int id)
    {
        var conversacion = await _service.ReactivarIaAsync(id);
        return conversacion == null ? NotFound() : Ok(conversacion);
    }

    [HttpPut("{id:int}/notas")]
    public async Task<ActionResult<WhatsAppConversacionDto>> ActualizarNotas(int id, [FromBody] ActualizarNotasRequest request)
    {
        var conversacion = await _service.ActualizarNotasAsync(id, request.Notas);
        return conversacion == null ? NotFound() : Ok(conversacion);
    }

    [HttpPut("{id:int}/telefono")]
    public async Task<ActionResult<WhatsAppConversacionDto>> ActualizarTelefono(int id, [FromBody] ActualizarTelefonoRequest request)
    {
        try
        {
            var conversacion = await _service.ActualizarTelefonoAsync(id, request.Telefono);
            return conversacion == null ? NotFound() : Ok(conversacion);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("ia-contexto")]
    public async Task<ActionResult<IaContextoDto>> GetIaContexto()
    {
        return Ok(new IaContextoDto(await _service.GetContextoIaAsync(), OpenRouterService.ContextoPersonaDefault));
    }

    [HttpPut("ia-contexto")]
    public async Task<ActionResult<IaContextoDto>> ActualizarIaContexto([FromBody] ActualizarIaContextoRequest request)
    {
        var contexto = await _service.ActualizarContextoIaAsync(request.Contexto);
        return Ok(new IaContextoDto(contexto, OpenRouterService.ContextoPersonaDefault));
    }

    [HttpGet("whatsapp/status")]
    public async Task<ActionResult<WhatsAppBotStatusDto>> GetEstadoWhatsApp()
    {
        return Ok(await _service.GetEstadoBotAsync());
    }
}
