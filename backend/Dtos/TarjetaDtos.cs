namespace MasplusCards.Api.Dtos;

public record TarjetaDto(
    int Id,
    int ClienteId,
    string? ClienteNombre,
    string? ClienteTelefono,
    int EmpresaId,
    string? EmpresaNombre,
    int DisenoId,
    string? DisenoNombre,
    string? Logo,
    string? ColorPrimario,
    string? ColorSecundario,
    string? ColorTexto,
    string? IconoSello,
    int SellosActuales,
    int SellosRequeridos,
    int PremiosCanjeados,
    string CodigoQr,
    string WalletTipo,
    string Estado,
    DateTime CreatedAt,
    DateTime UpdatedAt);

/// <summary>La empresa emite una tarjeta a un cliente (se crea el cliente si no existe, por telefono).</summary>
public record EmitirTarjetaRequest(string Nombre, string Telefono, string? Email, string WalletTipo);

public record TarjetaLogDto(int Id, string Accion, int? SellosAgregados, string? Descripcion, DateTime CreatedAt);
