using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IPassKitService
{
    /// <summary>Compara el token "ApplePass &lt;token&gt;" del header Authorization contra el codigo_qr de la tarjeta.</summary>
    Task<bool> ValidateTokenAsync(string serialNumber, string? authorizationHeader);

    Task<RegisterDeviceResult> RegisterDeviceAsync(string deviceLibraryIdentifier, string serialNumber, string pushToken);

    Task<bool> UnregisterDeviceAsync(string deviceLibraryIdentifier, string serialNumber);

    Task<RegisteredSerialNumbersResponse?> GetUpdatedSerialNumbersAsync(string deviceLibraryIdentifier, string? passesUpdatedSince);

    Task<List<string>> GetPushTokensForTarjetaAsync(string codigoQr);
}
