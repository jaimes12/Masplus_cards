namespace MasplusCards.Api.Dtos;

public record PlanDto(
    int Id,
    string Nombre,
    string? Descripcion,
    decimal PrecioMensual,
    int? LimiteDisenos,
    int? LimiteTarjetas,
    List<string> Caracteristicas,
    bool Destacado);

public record EmpresaPlanDto(
    PlanDto? PlanActual,
    DateTime? RenuevaEl,
    int DisenosUsados,
    int TarjetasUsadas,
    List<PlanDto> Planes);
