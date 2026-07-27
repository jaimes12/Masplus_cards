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
    int TotalTarjetas);
