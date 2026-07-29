using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/admin/codigos-descuento")]
[Authorize(Roles = "Admin")]
public class AdminDiscountCodesController : ControllerBase
{
    private readonly IDiscountCodesService _service;

    public AdminDiscountCodesController(IDiscountCodesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<DiscountCodeDto>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<ActionResult<DiscountCodeDto>> Create([FromBody] DiscountCodeUpsertRequest request)
    {
        try
        {
            return Ok(await _service.CreateAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/activar")]
    public async Task<IActionResult> Activar(int id) => await _service.SetActivoAsync(id, true) ? NoContent() : NotFound();

    [HttpPost("{id:int}/desactivar")]
    public async Task<IActionResult> Desactivar(int id) => await _service.SetActivoAsync(id, false) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
