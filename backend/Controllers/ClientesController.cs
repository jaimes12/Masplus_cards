using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/clientes")]
[Authorize(Roles = "Empresa")]
public class ClientesController : ControllerBase
{
    private readonly IClientesService _service;

    public ClientesController(IClientesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClienteDto>>> GetAll()
    {
        return Ok(await _service.GetByEmpresaAsync(User.GetEmpresaId()));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteDto>> GetById(int id)
    {
        var cliente = await _service.GetByIdAsync(User.GetEmpresaId(), id);
        return cliente == null ? NotFound() : Ok(cliente);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClienteDto>> Editar(int id, [FromBody] ClienteEditRequest request)
    {
        try
        {
            var cliente = await _service.EditarAsync(User.GetEmpresaId(), id, request);
            return cliente == null ? NotFound() : Ok(cliente);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/historial")]
    public async Task<ActionResult<List<ClienteHistorialItemDto>>> GetHistorial(int id)
    {
        return Ok(await _service.GetHistorialAsync(User.GetEmpresaId(), id));
    }
}
