using System.IO.Compression;
using System.Security.Cryptography;
using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;

namespace MasplusCards.Api.Services;

/// <summary>Genera a mano un .pkpass estilo "posterGeneric" (anunciado por Apple en el WWDC 2026,
/// requiere iOS 27+). dotnet-passbook —la librería que usamos para todo lo demás, versión 4.0.1, la más
/// reciente disponible— todavía no lo soporta: su enum PassStyle no incluye posterGeneric, y no expone
/// ningún método público para firmar un manifest arbitrario (solo PassGeneratorRequest con su Style de
/// toda la vida). Por eso este builder reimplementa, leyendo el código fuente real de dotnet-passbook
/// para copiar exactamente su mismo mecanismo: hash SHA1 por archivo para manifest.json, y firma
/// PKCS#7/CMS con SignedCms + CmsSigner (misma API de .NET que usa la librería, no una reinvención).
///
/// El pass.json combina "posterGeneric" (foto completa, solo se ve en iOS 27+) con el "generic" clásico
/// (sin foto grande, solo logo/ícono/thumbnail) en el MISMO archivo, tal como lo documenta Apple en su
/// propio ejemplo oficial (sesión "What's new in Wallet", WWDC 2026) — así los clientes en iOS 26 o
/// anterior no se quedan sin poder agregar el pase, solo ven una versión sin la foto grande.
///
/// Nota: Apple todavía no publicó el nombre exacto de archivo de imagen para posterGeneric (su propia
/// documentación JSON en developer.apple.com no lo tiene todavía). Asumimos que reusa la convención
/// clásica "background.png"/"background@2x.png"/"background@3x.png", ya usada por EventTicket, porque
/// es la única evidencia disponible (nombres de archivo estables entre estilos desde siempre). Si Apple
/// terminó usando otro nombre, en el peor caso ese archivo específico simplemente no se muestra —el
/// resto del pase (firma, campos, logo) sigue siendo válido.</summary>
public static class PosterGenericPassBuilder
{
    public static byte[] Generate(
        AppleWalletConfiguration cfg, AppleWalletPassInput input,
        byte[] icon, byte[] logo, byte[]? backgroundPng, byte[]? thumbnailPng)
    {
        var passJson = BuildPassJson(cfg, input);

        var files = new Dictionary<string, byte[]>
        {
            ["pass.json"] = passJson,
            ["icon.png"] = icon,
            ["icon@2x.png"] = icon,
            ["icon@3x.png"] = icon,
            ["logo.png"] = logo,
            ["logo@2x.png"] = logo,
            ["logo@3x.png"] = logo,
        };

        if (backgroundPng is { Length: > 0 })
        {
            files["background.png"] = backgroundPng;
            files["background@2x.png"] = backgroundPng;
            files["background@3x.png"] = backgroundPng;
        }

        if (thumbnailPng is { Length: > 0 })
        {
            files["thumbnail.png"] = thumbnailPng;
            files["thumbnail@2x.png"] = thumbnailPng;
            files["thumbnail@3x.png"] = thumbnailPng;
        }

        var manifest = BuildManifest(files);
        files["manifest.json"] = manifest;
        files["signature"] = SignManifest(cfg, manifest);

        return ZipFiles(files);
    }

    private static byte[] BuildPassJson(AppleWalletConfiguration cfg, AppleWalletPassInput input)
    {
        var vencido = input.Vencimiento.HasValue && input.Vencimiento.Value < MexicoCityTime.Now();
        var estado = input.CuponRedimido ? "CANJEADO" : vencido ? "VENCIDO" : "VIGENTE";
        var oferta = string.IsNullOrWhiteSpace(input.Descripcion) ? "Cupón especial" : input.Descripcion;

        JsonObject FieldGroup() => new()
        {
            ["headerFields"] = new JsonArray(
                new JsonObject { ["key"] = "estado", ["label"] = "ESTADO", ["value"] = estado }),
            ["primaryFields"] = new JsonArray(
                new JsonObject { ["key"] = "oferta", ["value"] = oferta }),
            // Apple solo muestra el primer footerField aunque mandes más de uno, así que va uno solo.
            ["footerFields"] = new JsonArray(
                new JsonObject { ["key"] = "cliente", ["value"] = input.ClienteNombre }),
        };

        var root = new JsonObject
        {
            ["formatVersion"] = 1,
            ["passTypeIdentifier"] = cfg.PassTypeIdentifier,
            ["serialNumber"] = input.SerialNumber,
            ["teamIdentifier"] = ExtractTeamIdentifier(cfg),
            ["organizationName"] = input.OrganizationName,
            ["description"] = oferta,
            ["logoText"] = input.OrganizationName,
            ["foregroundColor"] = HexToRgb(input.ColorTexto ?? "#FFFFFF"),
            ["backgroundColor"] = HexToRgb(input.ColorPrimario ?? "#18181B"),
            ["labelColor"] = "rgb(161,161,170)",
            ["barcodes"] = new JsonArray(new JsonObject
            {
                ["format"] = "PKBarcodeFormatQR",
                ["message"] = input.CodigoQr,
                ["messageEncoding"] = "UTF-8",
                ["altText"] = "Powered by Masplus",
            }),
            ["posterGeneric"] = FieldGroup(),
            ["generic"] = FieldGroup(),
        };

        if (input.Vencimiento.HasValue)
            root["expirationDate"] = input.Vencimiento.Value.ToString("yyyy-MM-ddTHH:mm:sszzz");

        if (!string.IsNullOrWhiteSpace(input.WebServiceUrl))
        {
            root["webServiceURL"] = input.WebServiceUrl;
            root["authenticationToken"] = input.CodigoQr;
        }

        return JsonSerializer.SerializeToUtf8Bytes(root);
    }

    /// <summary>El Team ID de Apple no está en ningún campo de configuración nuestro: dotnet-passbook lo
    /// lee del propio certificado (verificado inspeccionando el cert real: viene en el campo OU del
    /// Subject, ej. "OU=8A9SBGPLCJ"). Replicamos esa misma extracción.</summary>
    private static string ExtractTeamIdentifier(AppleWalletConfiguration cfg)
    {
        using var cert = cfg.PassbookCertificate();
        var match = Regex.Match(cert.Subject, @"OU=([^,]+)");
        if (!match.Success)
            throw new InvalidOperationException("No se pudo extraer el Team ID del certificado (campo OU no encontrado).");
        return match.Groups[1].Value;
    }

    private static string HexToRgb(string hex)
    {
        hex = hex.TrimStart('#');
        if (hex.Length != 6) return "rgb(24,24,27)";
        var r = Convert.ToInt32(hex[..2], 16);
        var g = Convert.ToInt32(hex.Substring(2, 2), 16);
        var b = Convert.ToInt32(hex.Substring(4, 2), 16);
        return $"rgb({r},{g},{b})";
    }

    private static byte[] BuildManifest(Dictionary<string, byte[]> files)
    {
        var manifest = new JsonObject();
        foreach (var (name, bytes) in files)
            manifest[name] = Sha1Hex(bytes);
        return JsonSerializer.SerializeToUtf8Bytes(manifest);
    }

    private static string Sha1Hex(byte[] bytes) =>
        Convert.ToHexStringLower(SHA1.HashData(bytes));

    /// <summary>Idéntico al SignManifestFile privado de dotnet-passbook (mismo SubjectIdentifierType,
    /// mismo IncludeOption.None, mismo Pkcs9SigningTime) para que Apple valide la firma igual que con
    /// el resto de nuestros pases.</summary>
    private static byte[] SignManifest(AppleWalletConfiguration cfg, byte[] manifestBytes)
    {
        using var wwdrCert = cfg.AppleWWDRCACertificate();
        using var passCert = cfg.PassbookCertificate();

        var contentInfo = new ContentInfo(manifestBytes);
        var signedCms = new SignedCms(contentInfo, detached: true);

        var signer = new CmsSigner(SubjectIdentifierType.SubjectKeyIdentifier, passCert)
        {
            IncludeOption = X509IncludeOption.None,
        };
        signer.Certificates.Add(wwdrCert);
        signer.Certificates.Add(passCert);
        signer.SignedAttributes.Add(new Pkcs9SigningTime());

        signedCms.ComputeSignature(signer);
        return signedCms.Encode();
    }

    private static byte[] ZipFiles(Dictionary<string, byte[]> files)
    {
        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var (name, bytes) in files)
            {
                var entry = archive.CreateEntry(name, CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                entryStream.Write(bytes, 0, bytes.Length);
            }
        }
        return ms.ToArray();
    }
}
