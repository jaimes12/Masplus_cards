using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Infrastructure;

public static class AppleWalletPassInputFactory
{
    public static AppleWalletPassInput From(TarjetaDto tarjeta, string? webServiceUrl) => new(
        SerialNumber: tarjeta.CodigoQr,
        OrganizationName: tarjeta.EmpresaNombre ?? "Masplus Cards",
        Tipo: tarjeta.Tipo,
        Logo: tarjeta.Logo,
        ColorPrimario: tarjeta.ColorPrimario,
        ColorTexto: tarjeta.ColorTexto,
        IconoSello: tarjeta.IconoSello,
        FondoUrl: tarjeta.FondoUrl,
        ClienteNombre: tarjeta.ClienteNombre ?? "",
        SellosActuales: tarjeta.SellosActuales,
        SellosRequeridos: tarjeta.SellosRequeridos,
        PremiosCanjeados: tarjeta.PremiosCanjeados,
        Vencimiento: tarjeta.Vencimiento,
        Descripcion: tarjeta.Descripcion,
        CuponRedimido: tarjeta.CuponRedimido,
        CodigoQr: tarjeta.CodigoQr,
        WebServiceUrl: webServiceUrl,
        RecordatorioMensaje: tarjeta.RecordatorioMensaje,
        EstiloCuponPoster: tarjeta.EstiloCuponPoster);
}
