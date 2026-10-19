using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/admin/productos")]
[Authorize(Roles = "Admin")]
public class AdminProductosController : ControllerBase
{
    private readonly IProductosService _productos;
    private readonly IImagenesService _imagenes;

    public AdminProductosController(IProductosService productos, IImagenesService imagenes)
    {
        _productos = productos;
        _imagenes = imagenes;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductoDto>>> GetAll() => Ok(await _productos.GetAllAsync());

    [HttpPost]
    public async Task<ActionResult<ProductoDto>> Crear([FromBody] ProductoRequest request)
    {
        try { return Ok(await _productos.CrearAsync(request)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductoDto>> Actualizar(int id, [FromBody] ProductoRequest request)
    {
        try
        {
            var producto = await _productos.ActualizarAsync(id, request);
            return producto == null ? NotFound() : Ok(producto);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id) =>
        await _productos.EliminarAsync(id) ? NoContent() : NotFound();

    [HttpGet("stats")]
    public async Task<ActionResult<CatalogoStatsDto>> GetStats([FromQuery] int dias = 30) =>
        Ok(await _productos.GetCatalogoStatsAsync(dias));

    [HttpGet("banners")]
    public async Task<ActionResult<List<ProductoBannerDto>>> GetBanners() => Ok(await _productos.GetBannersAsync());

    [HttpPost("banners")]
    public async Task<ActionResult<ProductoBannerDto>> CrearBanner([FromBody] ProductoBannerRequest request)
    {
        try { return Ok(await _productos.CrearBannerAsync(request)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("banners/{id:int}")]
    public async Task<ActionResult<ProductoBannerDto>> ActualizarBanner(int id, [FromBody] ProductoBannerRequest request)
    {
        try
        {
            var banner = await _productos.ActualizarBannerAsync(id, request);
            return banner == null ? NotFound() : Ok(banner);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("banners/{id:int}")]
    public async Task<IActionResult> EliminarBanner(int id) =>
        await _productos.EliminarBannerAsync(id) ? NoContent() : NotFound();

    [HttpGet("categorias")]
    public async Task<ActionResult<List<ProductoCategoriaDto>>> GetCategorias() =>
        Ok(await _productos.GetCategoriasAsync());

    [HttpPost("categorias")]
    public async Task<ActionResult<ProductoCategoriaDto>> CrearCategoria([FromBody] ProductoCategoriaRequest request)
    {
        try { return Ok(await _productos.CrearCategoriaAsync(request)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("categorias/{id:int}")]
    public async Task<IActionResult> EliminarCategoria(int id) =>
        await _productos.EliminarCategoriaAsync(id) ? NoContent() : NotFound();

    /// <summary>Sube una imagen o video del producto. 55 MB de tope para dar aire al límite
    /// real de 50 MB del video (el multipart agrega overhead).</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(55_000_000)]
    [RequestFormLimits(MultipartBodyLengthLimit = 55_000_000)]
    public async Task<IActionResult> Upload(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No se recibió ningún archivo." });

        try
        {
            await using var stream = file.OpenReadStream();
            var (url, tipo) = await _imagenes.UploadMediaAsync(stream, file.Length, file.ContentType, cancellationToken);
            return Ok(new { url, tipo });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
