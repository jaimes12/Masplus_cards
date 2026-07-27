namespace MasplusCards.Api.Dtos;

/// <summary>Datos ya resueltos (empresa + diseño + estado) necesarios para generar el .pkpass de una tarjeta.</summary>
public record AppleWalletPassInput(
    string SerialNumber,
    string OrganizationName,
    string? Logo,
    string? ColorPrimario,
    string? ColorTexto,
    string? IconoSello,
    string ClienteNombre,
    int SellosActuales,
    int SellosRequeridos,
    int PremiosCanjeados,
    string CodigoQr,
    string? WebServiceUrl = null);
