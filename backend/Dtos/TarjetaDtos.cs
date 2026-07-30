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
    string Tipo,
    string? Logo,
    string? ColorPrimario,
    string? ColorSecundario,
    string? ColorTexto,
    string? IconoSello,
    string? FondoUrl,
    int SellosActuales,
    int SellosRequeridos,
    int PremiosCanjeados,
    DateTime? Vencimiento,
    string? Descripcion,
    bool CuponRedimido,
    string CodigoQr,
    string WalletTipo,
    string Estado,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? RecordatorioMensaje = null,
    bool EstiloCuponPoster = false);

/// <summary>La empresa emite una tarjeta a un cliente (se crea el cliente si no existe, por telefono).
/// Si DisenoId es null, se usa el diseño activo de la empresa.</summary>
public record EmitirTarjetaRequest(string Nombre, string Telefono, string? Email, string WalletTipo, int? DisenoId = null);

public record TarjetaLogDto(int Id, string Accion, int? SellosAgregados, string? Descripcion, DateTime CreatedAt);

/// <summary>Ajusta el contador de sellos a un valor exacto (corrección manual).</summary>
public record EditarSellosRequest(int SellosActuales);
