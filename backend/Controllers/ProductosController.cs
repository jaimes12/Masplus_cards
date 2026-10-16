using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

/// <summary>Catálogo público de /productos.</summary>
[ApiController]
[Route("api/productos")]
[AllowAnonymous]
public class ProductosController : ControllerBase
{
    private readonly IProductosService _productos;

    public ProductosController(IProductosService productos)
    {
        _productos = productos;
    }

    [HttpGet]
    public async Task<ActionResult<CatalogoDto>> GetCatalogo() => Ok(await _productos.GetCatalogoAsync());
}
