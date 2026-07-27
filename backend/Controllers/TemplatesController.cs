using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/templates")]
public class TemplatesController : ControllerBase
{
    private readonly ITemplatesService _service;

    public TemplatesController(ITemplatesService service)
    {
        _service = service;
    }

    /// <summary>Público: las empresas navegan el catálogo de templates para elegir uno.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<TemplateDto>>> GetAll([FromQuery] bool soloActivos = true)
    {
        return Ok(await _service.GetAllAsync(soloActivos));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<TemplateDto>> GetById(int id)
    {
        var template = await _service.GetByIdAsync(id);
        return template == null ? NotFound() : Ok(template);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TemplateDto>> Create([FromBody] TemplateUpsertRequest request)
    {
        var adminId = User.GetUserId();
        var created = await _service.CreateAsync(adminId, request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TemplateDto>> Update(int id, [FromBody] TemplateUpsertRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _service.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
