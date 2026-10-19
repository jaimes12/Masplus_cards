using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IProductosService
{
    Task<CatalogoDto> GetCatalogoAsync();
    Task<List<ProductoDto>> GetAllAsync();
    Task<List<ProductoCategoriaDto>> GetCategoriasAsync();
    Task<ProductoCategoriaDto> CrearCategoriaAsync(ProductoCategoriaRequest request);
    Task<bool> EliminarCategoriaAsync(int id);
    Task<CatalogoStatsDto> GetCatalogoStatsAsync(int dias);
    Task<List<ProductoBannerDto>> GetBannersAsync();
    Task<ProductoBannerDto> CrearBannerAsync(ProductoBannerRequest request);
    Task<ProductoBannerDto?> ActualizarBannerAsync(int id, ProductoBannerRequest request);
    Task<bool> EliminarBannerAsync(int id);
    Task<ProductoDto> CrearAsync(ProductoRequest request);
    Task<ProductoDto?> ActualizarAsync(int id, ProductoRequest request);
    Task<bool> EliminarAsync(int id);
}
