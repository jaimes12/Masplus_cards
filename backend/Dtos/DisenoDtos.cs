namespace MasplusCards.Api.Dtos;

public record DisenoDto(
    int Id,
    int EmpresaId,
    int? TemplateId,
    string? Nombre,
    string? Logo,
    string? ColorPrimario,
    string? ColorSecundario,
    string? ColorTexto,
    string? IconoSello,
    int SellosRequeridos,
    string? Descripcion,
    string? Configuracion,
    bool Activo,
    bool EsActivoDeEmpresa,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record DisenoUpsertRequest(
    int? TemplateId,
    string Nombre,
    string? Logo,
    string? ColorPrimario,
    string? ColorSecundario,
    string? ColorTexto,
    string? IconoSello,
    int SellosRequeridos,
    string? Descripcion,
    string? Configuracion);
