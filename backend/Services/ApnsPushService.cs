using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;

namespace MasplusCards.Api.Services;

/// <summary>
/// Envía pushes "vacíos" a APNs para que Apple Wallet vuelva a pedir el pase actualizado.
/// Usa mTLS con el mismo certificado del Pass Type ID (no hace falta un certificado de push aparte).
/// </summary>
/// <remarks>
/// .NET tiene un bug/limitación documentada (dotnet/runtime #72177, #98177 y otros): SocketsHttpHandler
/// negocia perfecto el handshake TLS + certificado de cliente + ALPN h2 (verificado con SslStream a
/// mano), pero la conexión HTTP/2 se corta con "The response ended prematurely" apenas se manda el
/// primer request — pasa igual en HTTP/1.1, en Linux y en macOS. APNs exige HTTP/2 sí o sí (rechaza
/// HTTP/1.1 con "Unexpected HTTP/1.x request"), así que no hay downgrade posible. curl (libcurl con
/// OpenSSL) no tiene este bug y probado contra este certificado responde bien, así que se usa como
/// subproceso en vez de HttpClient.
/// </remarks>
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
        var certPath = Path.Combine(Path.GetTempPath(), $"apns-{Guid.NewGuid():N}.p12");
        var configPath = Path.Combine(Path.GetTempPath(), $"apns-{Guid.NewGuid():N}.curlrc");

        try
        {
            await File.WriteAllBytesAsync(certPath, Convert.FromBase64String(_cfg.PassbookCertificateBase64), cancellationToken);
            // La contraseña va en un archivo de config (no en argv) para que no quede visible en `ps`.
            await File.WriteAllTextAsync(
                configPath,
                $"cert = \"{certPath}:{_cfg.PassbookPassword}\"\ncert-type = \"P12\"\n",
                cancellationToken);

            var psi = new ProcessStartInfo
            {
                FileName = "curl",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            };
            psi.ArgumentList.Add("-K");
            psi.ArgumentList.Add(configPath);
            psi.ArgumentList.Add("--http2");
            psi.ArgumentList.Add("--silent");
            psi.ArgumentList.Add("--show-error");
            psi.ArgumentList.Add("--max-time");
            psi.ArgumentList.Add("15");
            psi.ArgumentList.Add("-o");
            psi.ArgumentList.Add("/dev/null");
            psi.ArgumentList.Add("-w");
            psi.ArgumentList.Add("%{http_code}");
            psi.ArgumentList.Add("-H");
            psi.ArgumentList.Add($"apns-topic: {_cfg.PassTypeIdentifier}");
            psi.ArgumentList.Add("-H");
            psi.ArgumentList.Add("apns-push-type: background");
            psi.ArgumentList.Add("-d");
            psi.ArgumentList.Add("{}");
            psi.ArgumentList.Add($"https://api.push.apple.com/3/device/{pushToken}");

            using var process = Process.Start(psi)
                ?? throw new InvalidOperationException("No se pudo iniciar el proceso curl.");

            var stdoutTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
            var stderrTask = process.StandardError.ReadToEndAsync(cancellationToken);
            await process.WaitForExitAsync(cancellationToken);
            var stdout = (await stdoutTask).Trim();
            var stderr = (await stderrTask).Trim();

            if (int.TryParse(stdout, out var statusCode) && statusCode is >= 200 and < 300)
            {
                _logger.LogInformation("APNs OK ({Status}) para el token {Token}", statusCode, pushToken);
            }
            else
            {
                _logger.LogWarning(
                    "APNs respondió {Status} para el token {Token}. exitCode={ExitCode} stderr={Stderr}",
                    stdout, pushToken, process.ExitCode, stderr);
            }
        }
        catch (Exception ex)
        {
            // Un push individual fallido (token vencido, red, etc.) no debe tumbar el flujo de negocio.
            _logger.LogWarning(ex, "No se pudo enviar el push APNs al token {Token}", pushToken);
        }
        finally
        {
            TryDelete(certPath);
            TryDelete(configPath);
        }
    }

    private static void TryDelete(string path)
    {
        try
        {
            if (File.Exists(path)) File.Delete(path);
        }
        catch
        {
            // best-effort
        }
    }
}
