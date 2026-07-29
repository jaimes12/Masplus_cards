using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _service;
    private readonly IPlanesService _planes;

    public AdminController(IAdminService service, IPlanesService planes)
    {
        _service = service;
        _planes = planes;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        return Ok(await _service.GetStatsAsync());
    }

    [HttpGet("empresas")]
    public async Task<ActionResult<List<AdminEmpresaListItemDto>>> GetEmpresas()
    {
        return Ok(await _service.GetEmpresasAsync());
    }

    /// <summary>Catálogo de planes, para elegir a cuál restringir un código de descuento.</summary>
    [HttpGet("planes")]
    public async Task<ActionResult<List<PlanDto>>> GetPlanes() => Ok(await _planes.GetCatalogoAsync());

    /// <summary>Todos los planes (incluye inactivos) para editar precios y características.</summary>
    [HttpGet("planes/todos")]
    public async Task<ActionResult<List<PlanAdminDto>>> GetPlanesAdmin() => Ok(await _planes.GetCatalogoAdminAsync());

    [HttpPut("planes/{id:int}")]
    public async Task<ActionResult<PlanAdminDto>> ActualizarPlan(int id, [FromBody] PlanUpdateRequest request)
    {
        try
        {
            return Ok(await _planes.ActualizarAsync(id, request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
