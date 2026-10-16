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
