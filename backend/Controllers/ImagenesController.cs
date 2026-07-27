using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/imagenes")]
[Authorize(Roles = "Empresa")]
public class ImagenesController : ControllerBase
{
    private readonly IImagenesService _imagenes;

    public ImagenesController(IImagenesService imagenes)
    {
        _imagenes = imagenes;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(6_000_000)]
    public async Task<IActionResult> Upload(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No se recibió ningún archivo." });

        try
        {
            await using var stream = file.OpenReadStream();
            var url = await _imagenes.UploadAsync(stream, file.Length, file.ContentType, cancellationToken);
            return Ok(new { url });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
