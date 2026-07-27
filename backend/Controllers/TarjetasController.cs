using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/tarjetas")]
public class TarjetasController : ControllerBase
{
    private readonly ITarjetasService _service;

    public TarjetasController(ITarjetasService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<List<TarjetaDto>>> GetAll()
    {
        return Ok(await _service.GetByEmpresaAsync(User.GetEmpresaId()));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<TarjetaDto>> GetById(int id)
    {
        var tarjeta = await _service.GetByIdAsync(User.GetEmpresaId(), id);
        return tarjeta == null ? NotFound() : Ok(tarjeta);
    }

    /// <summary>Vista pública de la tarjeta (wallet web) para el cliente final, sin autenticación.</summary>
    [HttpGet("publica/{codigoQr}")]
    [AllowAnonymous]
    public async Task<ActionResult<TarjetaDto>> GetByCodigoQr(string codigoQr)
    {
        var tarjeta = await _service.GetByCodigoQrAsync(codigoQr);
        return tarjeta == null ? NotFound() : Ok(tarjeta);
    }

    [HttpGet("{id:int}/logs")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<List<TarjetaLogDto>>> GetLogs(int id)
    {
        return Ok(await _service.GetLogsAsync(User.GetEmpresaId(), id));
    }

    [HttpPost("emitir")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<TarjetaDto>> Emitir([FromBody] EmitirTarjetaRequest request)
    {
        try
        {
            var created = await _service.EmitirAsync(User.GetEmpresaId(), request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/sello")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<TarjetaDto>> SumarSello(int id)
    {
        var updated = await _service.SumarSelloAsync(User.GetEmpresaId(), id);
        return updated == null ? NotFound() : Ok(updated);
    }

    /// <summary>Suma un sello buscando la tarjeta por su codigo_qr (flujo de escaneo en el punto de venta).</summary>
    [HttpPost("escanear/{codigoQr}/sello")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<TarjetaDto>> SumarSelloPorCodigo(string codigoQr)
    {
        var updated = await _service.SumarSelloPorCodigoAsync(User.GetEmpresaId(), codigoQr);
        return updated == null ? NotFound(new { error = "No se encontró una tarjeta de tu empresa con ese código." }) : Ok(updated);
    }

    [HttpPost("{id:int}/canjear")]
    [Authorize(Roles = "Empresa")]
    public async Task<ActionResult<TarjetaDto>> CanjearPremio(int id)
    {
        try
        {
            var updated = await _service.CanjearPremioAsync(User.GetEmpresaId(), id);
            return updated == null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
