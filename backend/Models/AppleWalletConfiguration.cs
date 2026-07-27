using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace MasplusCards.Api.Models;

/// <summary>Configuración para firmar pases Apple Wallet (.pkpass).</summary>
public class AppleWalletConfiguration
{
    /// <summary>
    /// Sin <see cref="X509KeyStorageFlags.EphemeralKeySet"/>: en macOS (y otros) .NET lanza
    /// "This platform does not support loading with EphemeralKeySet".
    /// </summary>
    private static readonly X509KeyStorageFlags Pkcs12Flags =
        X509KeyStorageFlags.Exportable | X509KeyStorageFlags.MachineKeySet;

    public string WWDRCertificateBase64 { get; set; } = "";
    public string PassTypeIdentifier { get; set; } = "";
    public string PassbookCertificateBase64 { get; set; } = "";
    public string PassbookPassword { get; set; } = "";
    public string IconUrl { get; set; } = "";
    public string LogoUrl { get; set; } = "";
    public string? BackgroundBase64 { get; set; }
    public string? WWDRCertificatePassword { get; set; }

    public X509Certificate2 AppleWWDRCACertificate()
    {
        if (string.IsNullOrWhiteSpace(WWDRCertificateBase64))
            throw new InvalidOperationException("WWDRCertificateBase64 no está configurado.");

        var bytes = Convert.FromBase64String(WWDRCertificateBase64);

        try
        {
            return X509CertificateLoader.LoadCertificate(bytes);
        }
        catch (CryptographicException)
        {
            return X509CertificateLoader.LoadPkcs12(bytes, string.Empty, Pkcs12Flags);
        }
    }

    public X509Certificate2 PassbookCertificate() =>
        X509CertificateLoader.LoadPkcs12(Convert.FromBase64String(PassbookCertificateBase64), PassbookPassword, Pkcs12Flags);
}
