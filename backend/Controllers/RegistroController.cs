using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

/// <summary>Autorregistro público (sin login): un cliente escanea el QR de un diseño, pone su nombre
/// y teléfono, y recibe su propia tarjeta.</summary>
[ApiController]
[Route("api/registro")]
[AllowAnonymous]
public class RegistroController : ControllerBase
{
    private readonly IRegistroService _service;

    public RegistroController(IRegistroService service)
    {
        _service = service;
    }

    [HttpGet("{codigo}")]
    public async Task<ActionResult<RegistroDisenoPublicoDto>> GetDiseno(string codigo)
    {
        var diseno = await _service.GetDisenoPublicoAsync(codigo);
        return diseno == null ? NotFound() : Ok(diseno);
    }

    [HttpPost("{codigo}")]
    public async Task<ActionResult<RegistroResultDto>> Registrar(string codigo, [FromBody] RegistroClienteRequest request)
    {
        try
        {
            return Ok(await _service.RegistrarAsync(codigo, request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
