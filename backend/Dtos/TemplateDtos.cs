namespace MasplusCards.Api.Dtos;

public record TemplateDto(
    int Id,
    string? Nombre,
    string? Descripcion,
    string? PreviewImg,
    string TipoRecompensa,
    string? Estructura,
    bool Activo,
    DateTime CreatedAt);

public record TemplateUpsertRequest(
    string Nombre,
    string? Descripcion,
    string? PreviewImg,
    string TipoRecompensa,
    string? Estructura,
    bool Activo);
