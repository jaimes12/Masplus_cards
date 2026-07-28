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

    public EmpresaController(IEmpresaProfileService service)
    {
        _service = service;
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
}
