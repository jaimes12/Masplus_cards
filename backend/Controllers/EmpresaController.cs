using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/empresa")]
[Authorize(Roles = "Empresa")]
public class EmpresaController : ControllerBase
{
    private readonly IEmpresaProfileService _service;
    private readonly IHistorialService _historial;
    private readonly INotificacionesService _notificaciones;

    public EmpresaController(IEmpresaProfileService service, IHistorialService historial, INotificacionesService notificaciones)
    {
        _service = service;
        _historial = historial;
        _notificaciones = notificaciones;
    }

    [HttpGet("perfil")]
    public async Task<ActionResult<EmpresaProfileDto>> GetPerfil()
    {
        var perfil = await _service.GetAsync(User.GetEmpresaId());
        return perfil == null ? NotFound() : Ok(perfil);
    }

    [HttpPut("perfil")]
    public async Task<ActionResult<EmpresaProfileDto>> UpdatePerfil([FromBody] EmpresaProfileUpdateRequest request)
    {
        var perfil = await _service.UpdateAsync(User.GetEmpresaId(), request);
        return perfil == null ? NotFound() : Ok(perfil);
    }

    [HttpPost("perfil/password")]
    public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordRequest request)
    {
        try
        {
            await _service.CambiarPasswordAsync(User.GetEmpresaId(), request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("historial")]
    public async Task<ActionResult<HistorialPageDto>> GetHistorial(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? accion = null,
        [FromQuery] DateTime? desde = null, [FromQuery] DateTime? hasta = null, [FromQuery] string? q = null)
    {
        return Ok(await _historial.GetAsync(User.GetEmpresaId(), page, pageSize, accion, desde, hasta, q));
    }

    [HttpGet("notificaciones")]
    public async Task<ActionResult<List<NotificacionDto>>> GetNotificaciones()
    {
        return Ok(await _notificaciones.GetAsync(User.GetEmpresaId()));
    }

    [HttpGet("notificaciones/no-leidas")]
    public async Task<ActionResult<int>> ContarNotificacionesNoLeidas()
    {
        return Ok(await _notificaciones.ContarNoLeidasAsync(User.GetEmpresaId()));
    }

    [HttpPost("notificaciones/marcar-leidas")]
    public async Task<IActionResult> MarcarNotificacionesLeidas()
    {
        await _notificaciones.MarcarLeidasAsync(User.GetEmpresaId());
        return NoContent();
    }
}
