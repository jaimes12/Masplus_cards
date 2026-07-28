namespace MasplusCards.Api.Dtos;

public record DisenoDto(
    int Id,
    int EmpresaId,
    int? TemplateId,
    string? Nombre,
    string Tipo,
    string? Logo,
    string? ColorPrimario,
    string? ColorSecundario,
    string? ColorTexto,
    string? IconoSello,
    string? FondoUrl,
    int SellosRequeridos,
    DateTime? Vencimiento,
    string? Descripcion,
    string? Configuracion,
    bool Activo,
    bool EsActivoDeEmpresa,
    int TarjetasCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record DisenoUpsertRequest(
    int? TemplateId,
    string Nombre,
    string Tipo,
    string? Logo,
    string? ColorPrimario,
    string? ColorSecundario,
    string? ColorTexto,
    string? IconoSello,
    string? FondoUrl,
    int SellosRequeridos,
    DateTime? Vencimiento,
    string? Descripcion,
    string? Configuracion);
