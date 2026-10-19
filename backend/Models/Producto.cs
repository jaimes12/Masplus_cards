namespace MasplusCards.Api.Models;

/// <summary>Categoría del catálogo público de productos (/productos), administrada desde el admin.</summary>
public class ProductoCategoria
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public int Orden { get; set; }

    public List<Producto> Productos { get; set; } = new();
}

/// <summary>Producto del catálogo público. El precio es informativo; la compra sale por el
/// LinkCompra (WhatsApp, marketplace, lo que sea) si está definido.</summary>
public class Producto
{
    public int Id { get; set; }
    public int? CategoriaId { get; set; }
    public string Nombre { get; set; } = "";

    /// <summary>Clave corta y única del producto (ej. "SOP-003"). Se genera sola al crear
    /// (prefijo de la categoría + id) si el admin no escribe una.</summary>
    public string? Sku { get; set; }
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public string? LinkCompra { get; set; }
    public bool Activo { get; set; } = true;
    public int Orden { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ProductoCategoria? Categoria { get; set; }
    public List<ProductoMedia> Medias { get; set; } = new();
}

/// <summary>Banner del catálogo público (/productos): imagen ancha con texto opcional encima,
/// administrado desde el panel. Si hay varios activos, rotan en carrusel.</summary>
public class ProductoBanner
{
    public int Id { get; set; }
    public string ImagenUrl { get; set; } = "";
    public string? Titulo { get; set; }
    public string? Subtitulo { get; set; }
    public string? Link { get; set; }
    public int Orden { get; set; }
    public bool Activo { get; set; } = true;
}

/// <summary>Imagen o video de un producto, en el orden en que aparece en el carrusel.</summary>
public class ProductoMedia
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string Url { get; set; } = "";

    /// <summary>"imagen" | "video".</summary>
    public string Tipo { get; set; } = "imagen";

    public int Orden { get; set; }

    public Producto? Producto { get; set; }
}
