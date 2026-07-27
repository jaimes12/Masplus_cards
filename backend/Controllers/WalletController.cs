using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/wallet")]
[AllowAnonymous]
public class WalletController : ControllerBase
{
    private readonly ITarjetasService _tarjetas;
    private readonly IAppleWalletPassService _appleWallet;

    public WalletController(ITarjetasService tarjetas, IAppleWalletPassService appleWallet)
    {
        _tarjetas = tarjetas;
        _appleWallet = appleWallet;
    }

    /// <summary>Descarga el .pkpass de la tarjeta para agregarla a Apple Wallet.</summary>
    [HttpGet("apple/{codigoQr}")]
    public async Task<IActionResult> DownloadApplePass(string codigoQr, CancellationToken cancellationToken)
    {
        var tarjeta = await _tarjetas.GetByCodigoQrAsync(codigoQr);
        if (tarjeta == null) return NotFound();

        var input = new AppleWalletPassInput(
            SerialNumber: tarjeta.CodigoQr,
            OrganizationName: tarjeta.EmpresaNombre ?? "Masplus Cards",
            Logo: tarjeta.Logo,
            ColorPrimario: tarjeta.ColorPrimario,
            ColorTexto: tarjeta.ColorTexto,
            ClienteNombre: tarjeta.ClienteNombre ?? "",
            SellosActuales: tarjeta.SellosActuales,
            SellosRequeridos: tarjeta.SellosRequeridos,
            PremiosCanjeados: tarjeta.PremiosCanjeados,
            CodigoQr: tarjeta.CodigoQr);

        var pkpass = await _appleWallet.GenerateStoreCardAsync(input, cancellationToken);
        return File(pkpass, "application/vnd.apple.pkpass", $"{tarjeta.CodigoQr}.pkpass");
    }
}
