using MasplusCards.Api.Infrastructure;
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

        // Railway hace TLS-termination en el borde; puertas adentro Request.Scheme puede llegar como
        // "http". Wallet exige https salvo en localhost (donde igual no puede alcanzar el dispositivo).
        var scheme = Request.Host.Host.Contains("localhost") ? Request.Scheme : "https";
        var webServiceUrl = $"{scheme}://{Request.Host}/";
        var input = AppleWalletPassInputFactory.From(tarjeta, webServiceUrl);

        var pkpass = await _appleWallet.GenerateStoreCardAsync(input, cancellationToken);
        return File(pkpass, "application/vnd.apple.pkpass", $"{tarjeta.CodigoQr}.pkpass");
    }
}
