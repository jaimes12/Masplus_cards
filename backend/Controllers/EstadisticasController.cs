using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/estadisticas")]
[Authorize(Roles = "Empresa")]
public class EstadisticasController : ControllerBase
{
    private readonly IEstadisticasService _service;

    public EstadisticasController(IEstadisticasService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<EstadisticasDto>> Get()
    {
        return Ok(await _service.GetAsync(User.GetEmpresaId()));
    }
}
