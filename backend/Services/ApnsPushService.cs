using System.Net;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;

namespace MasplusCards.Api.Services;

/// <summary>
/// Envía pushes "vacíos" a APNs para que Apple Wallet vuelva a pedir el pase actualizado.
/// Usa mTLS con el mismo certificado del Pass Type ID (no hace falta un certificado de push aparte).
/// </summary>
public class ApnsPushService : IApnsPushService
{
    private readonly AppleWalletConfiguration _cfg;
    private readonly ILogger<ApnsPushService> _logger;

    public ApnsPushService(IOptions<AppleWalletConfiguration> options, ILogger<ApnsPushService> logger)
    {
        _cfg = options.Value;
        _logger = logger;
    }

    public async Task SendUpdateAsync(string pushToken, CancellationToken cancellationToken = default)
    {
        using var handler = new HttpClientHandler
        {
            ClientCertificateOptions = ClientCertificateOption.Manual,
        };
        // APNs valida la cadena completa: certificado del Pass Type ID + intermedio WWDR.
        handler.ClientCertificates.Add(_cfg.PassbookCertificate());
        handler.ClientCertificates.Add(_cfg.AppleWWDRCACertificate());

        using var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.push.apple.com"),
            DefaultRequestVersion = HttpVersion.Version20,
            DefaultVersionPolicy = HttpVersionPolicy.RequestVersionExact,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, $"/3/device/{pushToken}")
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
        };
        request.Headers.Add("apns-topic", _cfg.PassTypeIdentifier);
        request.Headers.Add("apns-push-type", "background");
        request.Headers.Add("apns-priority", "5");

        try
        {
            using var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("APNs respondió {Status} para el token {Token}: {Body}", response.StatusCode, pushToken, body);
            }
        }
        catch (Exception ex)
        {
            // Un push individual fallido (token vencido, red, etc.) no debe tumbar el flujo de negocio.
            _logger.LogWarning(ex, "No se pudo enviar el push APNs al token {Token}", pushToken);
        }
    }
}
