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

    public AdminController(IAdminService service)
    {
        _service = service;
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
}
