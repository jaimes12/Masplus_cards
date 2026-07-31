using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/disenos")]
[Authorize(Roles = "Empresa")]
public class DisenosController : ControllerBase
{
    private readonly IDisenosService _service;

    public DisenosController(IDisenosService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<DisenoDto>>> GetAll()
    {
        return Ok(await _service.GetByEmpresaAsync(User.GetEmpresaId()));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DisenoDto>> GetById(int id)
    {
        var diseno = await _service.GetByIdAsync(User.GetEmpresaId(), id);
        return diseno == null ? NotFound() : Ok(diseno);
    }

    [HttpPost]
    public async Task<ActionResult<DisenoDto>> Create([FromBody] DisenoUpsertRequest request)
    {
        try
        {
            var created = await _service.CreateAsync(User.GetEmpresaId(), request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DisenoDto>> Update(int id, [FromBody] DisenoUpsertRequest request)
    {
        var updated = await _service.UpdateAsync(User.GetEmpresaId(), id, request);
        return updated == null ? NotFound() : Ok(updated);
    }

    /// <summary>Marca este Diseno como el vigente de la empresa para emitir tarjetas nuevas.</summary>
    [HttpPost("{id:int}/activar")]
    public async Task<ActionResult<DisenoDto>> Activar(int id)
    {
        var activated = await _service.ActivarAsync(User.GetEmpresaId(), id);
        return activated == null ? NotFound() : Ok(activated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var ok = await _service.DeleteAsync(User.GetEmpresaId(), id);
            return ok ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
