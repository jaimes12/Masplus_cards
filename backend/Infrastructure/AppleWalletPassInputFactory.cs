using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Infrastructure;

public static class AppleWalletPassInputFactory
{
    public static AppleWalletPassInput From(TarjetaDto tarjeta, string? webServiceUrl) => new(
        SerialNumber: tarjeta.CodigoQr,
        OrganizationName: tarjeta.EmpresaNombre ?? "Masplus Cards",
        Logo: tarjeta.Logo,
        ColorPrimario: tarjeta.ColorPrimario,
        ColorTexto: tarjeta.ColorTexto,
        IconoSello: tarjeta.IconoSello,
        ClienteNombre: tarjeta.ClienteNombre ?? "",
        SellosActuales: tarjeta.SellosActuales,
        SellosRequeridos: tarjeta.SellosRequeridos,
        PremiosCanjeados: tarjeta.PremiosCanjeados,
        CodigoQr: tarjeta.CodigoQr,
        WebServiceUrl: webServiceUrl);
}
