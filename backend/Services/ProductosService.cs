using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class ProductosService : IProductosService
{
    private readonly AppDbContext _db;

    public ProductosService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CatalogoDto> GetCatalogoAsync()
    {
        var banners = await _db.ProductoBanners
            .Where(b => b.Activo)
            .OrderBy(b => b.Orden).ThenBy(b => b.Id)
            .Select(b => new ProductoBannerDto(b.Id, b.ImagenUrl, b.Titulo, b.Subtitulo, b.Link, b.Orden, b.Activo))
            .ToListAsync();

        var productos = await _db.Productos
            .Where(p => p.Activo)
            .Include(p => p.Categoria)
            .Include(p => p.Medias)
            .OrderBy(p => p.Orden).ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        var categorias = productos
            .Where(p => p.Categoria != null)
            .GroupBy(p => p.Categoria!)
            .OrderBy(g => g.Key.Orden).ThenBy(g => g.Key.Nombre)
            .Select(g => new ProductoCategoriaDto(g.Key.Id, g.Key.Nombre, g.Key.Orden, g.Count()))
            .ToList();

        return new CatalogoDto(banners, categorias, productos.Select(ToDto).ToList());
    }

    public async Task<CatalogoStatsDto> GetCatalogoStatsAsync(int dias)
    {
        dias = Math.Clamp(dias, 1, 365);
        var desde = MexicoCityTime.Now().Date.AddDays(-(dias - 1));
        var vistas = _db.VisitasEventos
            .Where(e => e.Tipo == "pageview" && e.Valor == "/productos" && e.CreatedAt >= desde);
        return new CatalogoStatsDto(
            await vistas.Select(e => e.VisitanteId).Distinct().CountAsync(),
            await vistas.CountAsync(),
            dias);
    }

    public async Task<List<ProductoBannerDto>> GetBannersAsync()
    {
        return await _db.ProductoBanners
            .OrderBy(b => b.Orden).ThenBy(b => b.Id)
            .Select(b => new ProductoBannerDto(b.Id, b.ImagenUrl, b.Titulo, b.Subtitulo, b.Link, b.Orden, b.Activo))
            .ToListAsync();
    }

    public async Task<ProductoBannerDto> CrearBannerAsync(ProductoBannerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ImagenUrl))
            throw new InvalidOperationException("El banner necesita una imagen.");

        var banner = new ProductoBanner
        {
            ImagenUrl = request.ImagenUrl.Trim(),
            Titulo = Limpio(request.Titulo),
            Subtitulo = Limpio(request.Subtitulo),
            Link = Limpio(request.Link),
            Orden = request.Orden,
            Activo = request.Activo,
        };
        _db.ProductoBanners.Add(banner);
        await _db.SaveChangesAsync();
        return new ProductoBannerDto(banner.Id, banner.ImagenUrl, banner.Titulo, banner.Subtitulo, banner.Link, banner.Orden, banner.Activo);
    }

    public async Task<ProductoBannerDto?> ActualizarBannerAsync(int id, ProductoBannerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ImagenUrl))
            throw new InvalidOperationException("El banner necesita una imagen.");

        var banner = await _db.ProductoBanners.FirstOrDefaultAsync(b => b.Id == id);
        if (banner == null) return null;

        banner.ImagenUrl = request.ImagenUrl.Trim();
        banner.Titulo = Limpio(request.Titulo);
        banner.Subtitulo = Limpio(request.Subtitulo);
        banner.Link = Limpio(request.Link);
        banner.Orden = request.Orden;
        banner.Activo = request.Activo;
        await _db.SaveChangesAsync();
        return new ProductoBannerDto(banner.Id, banner.ImagenUrl, banner.Titulo, banner.Subtitulo, banner.Link, banner.Orden, banner.Activo);
    }

    public async Task<bool> EliminarBannerAsync(int id)
    {
        var banner = await _db.ProductoBanners.FirstOrDefaultAsync(b => b.Id == id);
        if (banner == null) return false;
        _db.ProductoBanners.Remove(banner);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProductoDto>> GetAllAsync()
    {
        var productos = await _db.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Medias)
            .OrderBy(p => p.Orden).ThenByDescending(p => p.CreatedAt)
            .ToListAsync();
        return productos.Select(ToDto).ToList();
    }

    public async Task<List<ProductoCategoriaDto>> GetCategoriasAsync()
    {
        return await _db.ProductoCategorias
            .OrderBy(c => c.Orden).ThenBy(c => c.Nombre)
            .Select(c => new ProductoCategoriaDto(c.Id, c.Nombre, c.Orden, c.Productos.Count))
            .ToListAsync();
    }

    public async Task<ProductoCategoriaDto> CrearCategoriaAsync(ProductoCategoriaRequest request)
    {
        var nombre = request.Nombre?.Trim();
        if (string.IsNullOrWhiteSpace(nombre))
            throw new InvalidOperationException("La categoría necesita un nombre.");

        var categoria = new ProductoCategoria { Nombre = nombre, Orden = request.Orden };
        _db.ProductoCategorias.Add(categoria);
        await _db.SaveChangesAsync();
        return new ProductoCategoriaDto(categoria.Id, categoria.Nombre, categoria.Orden, 0);
    }

    public async Task<bool> EliminarCategoriaAsync(int id)
    {
        var categoria = await _db.ProductoCategorias.FirstOrDefaultAsync(c => c.Id == id);
        if (categoria == null) return false;
        // Los productos quedan sin categoría (FK SetNull), no se borran.
        _db.ProductoCategorias.Remove(categoria);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ProductoDto> CrearAsync(ProductoRequest request)
    {
        Validar(request);
        var ahora = MexicoCityTime.Now();
        var producto = new Producto
        {
            Nombre = request.Nombre.Trim(),
            Sku = Limpio(request.Sku),
            Descripcion = Limpio(request.Descripcion),
            Precio = request.Precio,
            LinkCompra = Limpio(request.LinkCompra),
            CategoriaId = request.CategoriaId,
            Activo = request.Activo,
            Orden = request.Orden,
            CreatedAt = ahora,
            UpdatedAt = ahora,
            Medias = MapMedias(request.Medias),
        };
        _db.Productos.Add(producto);
        await _db.SaveChangesAsync();

        if (string.IsNullOrWhiteSpace(producto.Sku))
        {
            producto.Sku = await GenerarSkuAsync(producto);
            await _db.SaveChangesAsync();
        }

        return await GetByIdAsync(producto.Id) ?? ToDto(producto);
    }

    public async Task<ProductoDto?> ActualizarAsync(int id, ProductoRequest request)
    {
        Validar(request);
        var producto = await _db.Productos.Include(p => p.Medias).FirstOrDefaultAsync(p => p.Id == id);
        if (producto == null) return null;

        producto.Nombre = request.Nombre.Trim();
        producto.Sku = Limpio(request.Sku);
        producto.Descripcion = Limpio(request.Descripcion);
        producto.Precio = request.Precio;
        producto.LinkCompra = Limpio(request.LinkCompra);
        producto.CategoriaId = request.CategoriaId;
        producto.Activo = request.Activo;
        producto.Orden = request.Orden;
        producto.UpdatedAt = MexicoCityTime.Now();

        // Las medias se reemplazan completas: el admin manda la lista final en orden.
        _db.ProductoMedias.RemoveRange(producto.Medias);
        producto.Medias = MapMedias(request.Medias);

        if (string.IsNullOrWhiteSpace(producto.Sku))
            producto.Sku = await GenerarSkuAsync(producto);

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var producto = await _db.Productos.FirstOrDefaultAsync(p => p.Id == id);
        if (producto == null) return false;
        _db.Productos.Remove(producto);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task<ProductoDto?> GetByIdAsync(int id)
    {
        var producto = await _db.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Medias)
            .FirstOrDefaultAsync(p => p.Id == id);
        return producto == null ? null : ToDto(producto);
    }

    private static void Validar(ProductoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nombre))
            throw new InvalidOperationException("El producto necesita un nombre.");
        if (request.Precio < 0)
            throw new InvalidOperationException("El precio no puede ser negativo.");
        if (request.Medias != null && request.Medias.Count > 10)
            throw new InvalidOperationException("Máximo 10 fotos/videos por producto.");
    }

    private static List<ProductoMedia> MapMedias(List<ProductoMediaRequest>? medias) =>
        (medias ?? new List<ProductoMediaRequest>())
            .Where(m => !string.IsNullOrWhiteSpace(m.Url))
            .Select((m, i) => new ProductoMedia
            {
                Url = m.Url.Trim(),
                Tipo = m.Tipo == "video" ? "video" : "imagen",
                Orden = i,
            })
            .ToList();

    /// <summary>SKU automático: prefijo de 3 letras de la categoría (sin acentos) + id con ceros,
    /// ej. "SOP-004". Legible para dictarlo por WhatsApp y único porque lleva el id.</summary>
    private async Task<string> GenerarSkuAsync(Producto producto)
    {
        var nombreCategoria = producto.CategoriaId.HasValue
            ? (await _db.ProductoCategorias.Where(c => c.Id == producto.CategoriaId.Value)
                .Select(c => c.Nombre).FirstOrDefaultAsync())
            : null;
        var limpio = new string((nombreCategoria ?? "PRD")
            .Normalize(System.Text.NormalizationForm.FormD)
            .Where(ch => char.IsAsciiLetter(ch))
            .ToArray());
        var prefijo = (limpio.Length >= 3 ? limpio[..3] : "PRD").ToUpperInvariant();
        return $"{prefijo}-{producto.Id:D3}";
    }

    private static string? Limpio(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static ProductoDto ToDto(Producto p) => new(
        p.Id, p.Nombre, p.Sku, p.Descripcion, p.Precio, p.LinkCompra, p.Activo, p.Orden,
        p.CategoriaId, p.Categoria?.Nombre,
        p.Medias.OrderBy(m => m.Orden).Select(m => new ProductoMediaDto(m.Id, m.Url, m.Tipo, m.Orden)).ToList());
}
