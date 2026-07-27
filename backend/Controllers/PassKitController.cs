using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

/// <summary>
/// PassKit Web Service (protocolo de Apple Wallet para push updates de pases).
/// Rutas fijas por spec de Apple: {webServiceURL}v1/... — sin el prefijo /api de las demás.
/// </summary>
[ApiController]
[Route("v1")]
[AllowAnonymous]
public class PassKitController : ControllerBase
{
    private readonly IPassKitService _passKit;
    private readonly ITarjetasService _tarjetas;
    private readonly IAppleWalletPassService _appleWallet;

    public PassKitController(IPassKitService passKit, ITarjetasService tarjetas, IAppleWalletPassService appleWallet)
    {
        _passKit = passKit;
        _tarjetas = tarjetas;
        _appleWallet = appleWallet;
    }

    [HttpPost("devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}")]
    public async Task<IActionResult> RegisterDevice(
        string deviceLibraryIdentifier, string passTypeIdentifier, string serialNumber, [FromBody] RegisterDeviceRequest request)
    {
        if (!await _passKit.ValidateTokenAsync(serialNumber, Request.Headers.Authorization))
            return Unauthorized();

        var result = await _passKit.RegisterDeviceAsync(deviceLibraryIdentifier, serialNumber, request.PushToken);
        return result switch
        {
            RegisterDeviceResult.NotFound => NotFound(),
            RegisterDeviceResult.AlreadyRegistered => Ok(),
            _ => StatusCode(StatusCodes.Status201Created),
        };
    }

    [HttpDelete("devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}")]
    public async Task<IActionResult> UnregisterDevice(string deviceLibraryIdentifier, string passTypeIdentifier, string serialNumber)
    {
        if (!await _passKit.ValidateTokenAsync(serialNumber, Request.Headers.Authorization))
            return Unauthorized();

        var ok = await _passKit.UnregisterDeviceAsync(deviceLibraryIdentifier, serialNumber);
        return ok ? Ok() : NotFound();
    }

    [HttpGet("devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}")]
    public async Task<IActionResult> GetUpdatedSerialNumbers(
        string deviceLibraryIdentifier, string passTypeIdentifier, [FromQuery] string? passesUpdatedSince)
    {
        var result = await _passKit.GetUpdatedSerialNumbersAsync(deviceLibraryIdentifier, passesUpdatedSince);
        return result == null ? NoContent() : Ok(result);
    }

    [HttpGet("passes/{passTypeIdentifier}/{serialNumber}")]
    public async Task<IActionResult> GetLatestPass(string passTypeIdentifier, string serialNumber, CancellationToken cancellationToken)
    {
        if (!await _passKit.ValidateTokenAsync(serialNumber, Request.Headers.Authorization))
            return Unauthorized();

        var tarjeta = await _tarjetas.GetByCodigoQrAsync(serialNumber);
        if (tarjeta == null) return NotFound();

        if (Request.Headers.TryGetValue("If-Modified-Since", out var ifModifiedSince) &&
            DateTimeOffset.TryParse(ifModifiedSince, out var since) &&
            tarjeta.UpdatedAt <= since.UtcDateTime)
        {
            return StatusCode(StatusCodes.Status304NotModified);
        }

        var scheme = Request.Host.Host.Contains("localhost") ? Request.Scheme : "https";
        var input = AppleWalletPassInputFactory.From(tarjeta, $"{scheme}://{Request.Host}/");

        var pkpass = await _appleWallet.GenerateStoreCardAsync(input, cancellationToken);
        Response.Headers.LastModified = tarjeta.UpdatedAt.ToUniversalTime().ToString("R");
        return File(pkpass, "application/vnd.apple.pkpass");
    }

    [HttpPost("log")]
    public IActionResult Log([FromBody] PassKitLogRequest request)
    {
        return Ok();
    }
}
