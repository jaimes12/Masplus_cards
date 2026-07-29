namespace MasplusCards.Api.Dtos;

public record DiscountCodeDto(
    int Id,
    string Codigo,
    string TipoDescuento,
    decimal Valor,
    int? PlanId,
    string? PlanNombre,
    int? UsosMaximos,
    int UsosActuales,
    DateTime? FechaExpiracion,
    bool Activo,
    DateTime CreatedAt);

public record DiscountCodeUpsertRequest(
    string Codigo,
    string TipoDescuento,
    decimal Valor,
    int? PlanId,
    int? UsosMaximos,
    DateTime? FechaExpiracion);

public record ValidarCodigoRequest(string Codigo, int PlanId);

public record ValidarCodigoResultDto(
    bool Valido,
    string? Error,
    string? Codigo,
    string? TipoDescuento,
    decimal? Valor,
    decimal? PrecioOriginal,
    decimal? PrecioConDescuento);
