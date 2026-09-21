namespace MasplusCards.Api.Dtos;

public record AdminStatsDto(
    int TotalEmpresas,
    int TotalTemplates,
    int TotalDisenos,
    int TotalTarjetas,
    int TotalClientes,
    int PremiosCanjeados);

public record AdminEmpresaListItemDto(
    int Id,
    string? Nombre,
    string Email,
    string Estado,
    DateTime CreatedAt,
    int TotalDisenos,
    int TotalTarjetas,
    string? PlanNombre);

public record AdminDisenoDetalleDto(
    int Id,
    string? Nombre,
    string Tipo,
    bool Activo,
    bool EstiloPoster,
    string? Logo,
    string? ColorPrimario,
    string? ColorTexto,
    string? IconoSello,
    string? FondoUrl,
    int SellosRequeridos,
    DateTime? Vencimiento,
    string? Descripcion,
    DateTime CreatedAt,
    int Tarjetas,
    int ClientesEscanearon,
    int Escaneos,
    int PremiosCanjeados);

public record AdminActividadDto(
    string Accion,
    string? Descripcion,
    string? ClienteNombre,
    string? DisenoNombre,
    DateTime CreatedAt);

public record AdminEmpresaDetalleDto(
    int Id,
    string? Nombre,
    string Email,
    string? Telefono,
    string? Logo,
    string Estado,
    DateTime CreatedAt,
    string? PlanNombre,
    DateTime? PruebaTerminaEl,
    bool TienePagoStripe,
    int TotalClientes,
    int TotalTarjetas,
    int ClientesEscanearon,
    int EscaneosTotal,
    int SellosOtorgados,
    int PremiosCanjeados,
    List<AdminDisenoDetalleDto> Disenos,
    List<AdminActividadDto> ActividadReciente);
