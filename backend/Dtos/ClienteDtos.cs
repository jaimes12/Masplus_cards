namespace MasplusCards.Api.Dtos;

/// <summary>Estado derivado del cliente para segmentación en el panel:
/// "inactivo" (60+ días sin visita) | "canje-listo" (tiene una tarjeta lista para canjear) |
/// "frecuente" (4+ sellos en los últimos 30 días) | "nuevo" (registrado hace 7 días o menos) |
/// "activo" (todo lo demás).</summary>
public record ClienteDto(
    int Id, int EmpresaId, string? Nombre, string Telefono, string? Email, DateTime CreatedAt,
    string Estado,
    int? TarjetaPrincipalId, string? TarjetaPrincipalNombre, string? TarjetaPrincipalTipo,
    int SellosActuales, int SellosRequeridos, int PremiosCanjeados,
    DateTime? UltimaVisita, int TarjetasCount);

public record ClienteEditRequest(string Nombre, string? Email);

public record ClienteHistorialItemDto(int Id, string Accion, int? SellosAgregados, string? Descripcion, string? TarjetaNombre, DateTime CreatedAt);
