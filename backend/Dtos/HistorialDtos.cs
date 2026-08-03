namespace MasplusCards.Api.Dtos;

public record HistorialItemDto(
    int Id, string Accion, int? SellosAgregados, string? Descripcion,
    int? ClienteId, string? ClienteNombre, int? DisenoId, string? DisenoNombre,
    DateTime CreatedAt);

public record HistorialPageDto(List<HistorialItemDto> Items, int Total, int Page, int PageSize);
