namespace MasplusCards.Api.Dtos;

public record ProductoMediaDto(int Id, string Url, string Tipo, int Orden);

public record ProductoDto(
    int Id,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    string? LinkCompra,
    bool Activo,
    int Orden,
    int? CategoriaId,
    string? CategoriaNombre,
    List<ProductoMediaDto> Medias);

public record ProductoCategoriaDto(int Id, string Nombre, int Orden, int ProductosCount);

/// <summary>Catálogo público: solo categorías con productos activos y los productos activos.</summary>
public record CatalogoDto(List<ProductoCategoriaDto> Categorias, List<ProductoDto> Productos);

public record ProductoMediaRequest(string Url, string Tipo);

public record ProductoRequest(
    string Nombre,
    string? Descripcion,
    decimal Precio,
    string? LinkCompra,
    int? CategoriaId,
    bool Activo,
    int Orden,
    List<ProductoMediaRequest>? Medias);

public record ProductoCategoriaRequest(string Nombre, int Orden);
