using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Authorize(Roles = "Empresa")]
public class PlanesController : ControllerBase
{
    private readonly IPlanesService _service;

    public PlanesController(IPlanesService service)
    {
        _service = service;
    }

    [HttpGet("api/planes")]
    public async Task<ActionResult<List<PlanDto>>> GetCatalogo() => Ok(await _service.GetCatalogoAsync());

    [HttpGet("api/empresa/plan")]
    public async Task<ActionResult<EmpresaPlanDto>> GetActual() => Ok(await _service.GetActualAsync(User.GetEmpresaId()));

    [HttpPost("api/empresa/plan/{planId:int}")]
    public async Task<ActionResult<EmpresaPlanDto>> Cambiar(int planId)
    {
        try
        {
            return Ok(await _service.CambiarPlanAsync(User.GetEmpresaId(), planId));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
