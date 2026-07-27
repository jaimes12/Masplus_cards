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
/// primer request. APNs exige HTTP/2 sí o sí (rechaza HTTP/1.1), así que no hay downgrade posible.
/// curl (libcurl + OpenSSL) no tiene ese bug, así que el push se manda como subproceso.
///
/// El .p12 original se generó con cifrado "legacy" (RC2/3DES viejo), que OpenSSL 3.x desactivó por
/// defecto — por eso el contenedor tiraba "could not parse PKCS12 file ... digital envelope
/// routines::unsupported". Se convierte primero a PEM con `openssl pkcs12 -legacy` (que sí soporta
/// leer ese formato viejo) y curl usa ese PEM en vez de leer el .p12 directo.
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
        var p12Path = Path.Combine(Path.GetTempPath(), $"apns-{Guid.NewGuid():N}.p12");
        var pemPath = Path.Combine(Path.GetTempPath(), $"apns-{Guid.NewGuid():N}.pem");

        try
        {
            await File.WriteAllBytesAsync(p12Path, Convert.FromBase64String(_cfg.PassbookCertificateBase64), cancellationToken);

            var converted = await ConvertToPemAsync(p12Path, pemPath, cancellationToken);
            if (!converted) return;

            var (exitCode, stdout, stderr) = await RunAsync(
                "curl",
                [
                    "--cert", pemPath,
                    "--key", pemPath,
                    "--http2",
                    "--silent", "--show-error",
                    "--max-time", "15",
                    "-o", "/dev/null",
                    "-w", "%{http_code}",
                    "-H", $"apns-topic: {_cfg.PassTypeIdentifier}",
                    "-H", "apns-push-type: background",
                    "-d", "{}",
                    $"https://api.push.apple.com/3/device/{pushToken}",
                ],
                cancellationToken);

            if (int.TryParse(stdout.Trim(), out var statusCode) && statusCode is >= 200 and < 300)
            {
                _logger.LogInformation("APNs OK ({Status}) para el token {Token}", statusCode, pushToken);
            }
            else
            {
                _logger.LogWarning(
                    "APNs respondió {Status} para el token {Token}. exitCode={ExitCode} stderr={Stderr}",
                    stdout.Trim(), pushToken, exitCode, stderr.Trim());
            }
        }
        catch (Exception ex)
        {
            // Un push individual fallido (token vencido, red, etc.) no debe tumbar el flujo de negocio.
            _logger.LogWarning(ex, "No se pudo enviar el push APNs al token {Token}", pushToken);
        }
        finally
        {
            TryDelete(p12Path);
            TryDelete(pemPath);
        }
    }

    private async Task<bool> ConvertToPemAsync(string p12Path, string pemPath, CancellationToken cancellationToken)
    {
        // -passin por archivo (no argv) para que la contraseña no quede visible en `ps`.
        var passFile = Path.Combine(Path.GetTempPath(), $"apns-{Guid.NewGuid():N}.pass");
        try
        {
            await File.WriteAllTextAsync(passFile, _cfg.PassbookPassword, cancellationToken);

            var (exitCode, _, stderr) = await RunAsync(
                "openssl",
                ["pkcs12", "-legacy", "-in", p12Path, "-out", pemPath, "-nodes", "-passin", $"file:{passFile}"],
                cancellationToken);

            if (exitCode != 0)
            {
                _logger.LogWarning("No se pudo convertir el certificado P12 a PEM (openssl exitCode={ExitCode}): {Stderr}", exitCode, stderr.Trim());
                return false;
            }

            return true;
        }
        finally
        {
            TryDelete(passFile);
        }
    }

    private static async Task<(int ExitCode, string Stdout, string Stderr)> RunAsync(
        string fileName, IEnumerable<string> args, CancellationToken cancellationToken)
    {
        var psi = new ProcessStartInfo
        {
            FileName = fileName,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        foreach (var arg in args) psi.ArgumentList.Add(arg);

        using var process = Process.Start(psi) ?? throw new InvalidOperationException($"No se pudo iniciar el proceso {fileName}.");

        var stdoutTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
        var stderrTask = process.StandardError.ReadToEndAsync(cancellationToken);
        await process.WaitForExitAsync(cancellationToken);

        return (process.ExitCode, await stdoutTask, await stderrTask);
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
