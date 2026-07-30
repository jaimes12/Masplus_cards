namespace MasplusCards.Api.Dtos;

/// <summary>Datos ya resueltos (empresa + diseño + estado) necesarios para generar el .pkpass de una tarjeta.</summary>
public record AppleWalletPassInput(
    string SerialNumber,
    string OrganizationName,
    string Tipo,
    string? Logo,
    string? ColorPrimario,
    string? ColorTexto,
    string? IconoSello,
    string? FondoUrl,
    string ClienteNombre,
    int SellosActuales,
    int SellosRequeridos,
    int PremiosCanjeados,
    DateTime? Vencimiento,
    string? Descripcion,
    bool CuponRedimido,
    string CodigoQr,
    string? WebServiceUrl = null,
    string? RecordatorioMensaje = null,
    bool EstiloCuponPoster = false);
