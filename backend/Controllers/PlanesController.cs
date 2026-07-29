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
    private readonly IDiscountCodesService _codigos;

    public PlanesController(IPlanesService service, IDiscountCodesService codigos)
    {
        _service = service;
        _codigos = codigos;
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

    /// <summary>Valida un código de descuento contra un plan sin canjearlo todavía (el canje real ocurre al cobrar).</summary>
    [HttpPost("api/empresa/codigo-descuento/validar")]
    public async Task<ActionResult<ValidarCodigoResultDto>> ValidarCodigo([FromBody] ValidarCodigoRequest request) =>
        Ok(await _codigos.ValidarAsync(User.GetEmpresaId(), request));
}
