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

/// <summary>Vista completa de un plan para el panel de administración (incluye inactivos y orden).</summary>
public record PlanAdminDto(
    int Id,
    string Nombre,
    string? Descripcion,
    decimal PrecioMensual,
    int? LimiteDisenos,
    int? LimiteTarjetas,
    List<string> Caracteristicas,
    bool Destacado,
    int Orden,
    bool Activo);

public record PlanUpdateRequest(
    string Nombre,
    string? Descripcion,
    decimal PrecioMensual,
    int? LimiteDisenos,
    int? LimiteTarjetas,
    List<string> Caracteristicas,
    bool Destacado,
    int Orden,
    bool Activo);
