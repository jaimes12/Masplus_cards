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

/// <summary>EnPrueba/PruebaTerminaEl: la empresa está usando PlanActual en su periodo de prueba
/// gratis (sin suscripción). DiasPrueba: duración configurada, para mostrarla en el registro.</summary>
public record EmpresaPlanDto(
    PlanDto? PlanActual,
    DateTime? RenuevaEl,
    bool EnPrueba,
    DateTime? PruebaTerminaEl,
    int DiasPrueba,
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
