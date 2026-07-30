using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Passbook.Generator;
using Passbook.Generator.Fields;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;

namespace MasplusCards.Api.Services;

public sealed class AppleWalletPassService : IAppleWalletPassService
{
    public const string HttpClientName = nameof(AppleWalletPassService);
    private const string CachePrefix = "apple-wallet:img:";

    private const string DefaultBackgroundColor = "#18181B";
    private const string DefaultForegroundColor = "#FAFAFA";
    private const string DefaultLabelColor = "#A1A1AA";
    private const string DefaultIconFallback = "https://picsum.photos/seed/masplus-icon/87/87";
    private const string DefaultLogoFallback = "https://picsum.photos/seed/masplus-logo/160/50";

    private readonly AppleWalletConfiguration _cfg;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IMemoryCache _cache;

    public AppleWalletPassService(IOptions<AppleWalletConfiguration> options, IHttpClientFactory httpFactory, IMemoryCache cache)
    {
        _cfg = options.Value;
        _httpFactory = httpFactory;
        _cache = cache;
    }

    public async Task<byte[]> GenerateStoreCardAsync(AppleWalletPassInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_cfg.PassTypeIdentifier))
            throw new InvalidOperationException("PassTypeIdentifier no está configurado en AppleWalletConfiguration.");

        var wwdrCert = _cfg.AppleWWDRCACertificate();
        var passbookCert = _cfg.PassbookCertificate();

        var logoUrl = NonEmpty(input.Logo) ?? NonEmpty(_cfg.LogoUrl) ?? DefaultLogoFallback;
        var iconUrl = NonEmpty(_cfg.IconUrl) ?? DefaultIconFallback;

        var logo = await GetBytesCachedAsync($"{CachePrefix}logo:{logoUrl.GetHashCode():X}", logoUrl, cancellationToken);
        var icon = await GetBytesCachedAsync($"{CachePrefix}icon:{iconUrl.GetHashCode():X}", iconUrl, cancellationToken);

        var backgroundColor = NonEmpty(input.ColorPrimario) ?? DefaultBackgroundColor;
        var foregroundColor = NonEmpty(input.ColorTexto) ?? DefaultForegroundColor;

        var baseRequest = new PassGeneratorRequest
        {
            PassTypeIdentifier = _cfg.PassTypeIdentifier,
            SerialNumber = input.SerialNumber,
            OrganizationName = input.OrganizationName,
            BackgroundColor = HexToRgb(backgroundColor),
            ForegroundColor = HexToRgb(foregroundColor),
            LabelColor = HexToRgb(DefaultLabelColor),
            AppleWWDRCACertificate = wwdrCert,
            PassbookCertificate = passbookCert,
            LogoText = input.OrganizationName,
            WebServiceUrl = input.WebServiceUrl,
            AuthenticationToken = input.WebServiceUrl != null ? input.CodigoQr : null,
            Images = { { PassbookImage.Icon, icon }, { PassbookImage.Icon2X, icon }, { PassbookImage.Icon3X, icon },
                       { PassbookImage.Logo, logo }, { PassbookImage.Logo2X, logo }, { PassbookImage.Logo3X, logo } },
        };

        var request = input.Tipo == "cupon"
            ? await BuildCuponAsync(baseRequest, input, backgroundColor, cancellationToken)
            : await BuildSellosAsync(baseRequest, input, backgroundColor, foregroundColor, cancellationToken);

        request.AddBarcode(BarcodeType.PKBarcodeFormatQR, input.CodigoQr, "UTF-8", "Powered by Masplus");

        return new PassGenerator().Generate(request);
    }

    private async Task<PassGeneratorRequest> BuildSellosAsync(
        PassGeneratorRequest request, AppleWalletPassInput input, string backgroundColor, string foregroundColor, CancellationToken cancellationToken)
    {
        byte[]? stampIcon = null;
        if (NonEmpty(input.IconoSello) is { } stampIconUrl)
        {
            try { stampIcon = await GetBytesCachedAsync($"{CachePrefix}stamp:{stampIconUrl.GetHashCode():X}", stampIconUrl, cancellationToken); }
            catch { stampIcon = null; }
        }

        byte[]? fondo = null;
        if (NonEmpty(input.FondoUrl) is { } fondoUrl)
        {
            try { fondo = await GetBytesCachedAsync($"{CachePrefix}fondo:{fondoUrl.GetHashCode():X}", fondoUrl, cancellationToken); }
            catch { fondo = null; }
        }

        var strip = StampStripRenderer.Render(backgroundColor, foregroundColor, input.SellosRequeridos, input.SellosActuales, stampIcon, fondo);

        request.Style = PassStyle.StoreCard;
        request.Description = $"Tarjeta de fidelidad {input.OrganizationName}";
        request.Images.Add(PassbookImage.Strip, strip);
        request.Images.Add(PassbookImage.Strip2X, strip);
        request.Images.Add(PassbookImage.Strip3X, strip);

        // Sin primaryField a propósito: en el estilo storeCard Apple lo dibuja SUPERPUESTO
        // sobre el strip, y ahí ya está el grid de sellos. El resumen va en el header (no se
        // superpone) y el detalle en secondary/auxiliary, que se muestran debajo del strip.
        var faltan = Math.Max(input.SellosRequeridos - input.SellosActuales, 0);
        request.AddHeaderField(new StandardField(
            "restantes", faltan > 0 ? "FALTAN" : "LISTO", faltan > 0 ? faltan.ToString() : "🎁"));
        request.AddSecondaryField(new StandardField("cliente", "CLIENTE", input.ClienteNombre));
        request.AddAuxiliaryField(new StandardField("premios", "PREMIOS", input.PremiosCanjeados.ToString()));

        // Back field siempre presente (aunque sin recordatorios todavía) para que Wallet tenga
        // un valor previo con el que comparar: así, cuando el recordatorio semanal cambia este
        // valor, ChangeMessage dispara el aviso visible en el push.
        request.AddBackField(new StandardField(
            "recordatorio", "Recordatorio", NonEmpty(input.RecordatorioMensaje) ?? "Sin recordatorios por ahora.")
        {
            ChangeMessage = "%@",
        });

        return request;
    }

    private async Task<PassGeneratorRequest> BuildCuponAsync(
        PassGeneratorRequest request, AppleWalletPassInput input, string backgroundColor, CancellationToken cancellationToken)
    {
        byte[]? fondo = null;
        if (NonEmpty(input.FondoUrl) is { } fondoUrl)
        {
            try { fondo = await GetBytesCachedAsync($"{CachePrefix}fondo:{fondoUrl.GetHashCode():X}", fondoUrl, cancellationToken); }
            catch { fondo = null; }
        }

        // EventTicket (no Generic): es el estilo que de verdad renderiza la imagen "background"
        // de forma confiable en la pantalla de "Agregar" (probado en producción en otro proyecto).
        request.Style = PassStyle.EventTicket;
        request.Description = NonEmpty(input.Descripcion) ?? $"Cupón {input.OrganizationName}";

        if (fondo != null)
        {
            var fondoPase = StampStripRenderer.RenderCuponBackground(backgroundColor, fondo);
            request.Images.Add(PassbookImage.Background, fondoPase);
            request.Images.Add(PassbookImage.Background2X, fondoPase);
            request.Images.Add(PassbookImage.Background3X, fondoPase);
        }

        request.AddHeaderField(new StandardField(
            "estado", "ESTADO", input.CuponRedimido ? "CANJEADO" : "VIGENTE"));
        request.AddPrimaryField(new StandardField(
            "oferta", "", NonEmpty(input.Descripcion) ?? "Cupón especial"));
        request.AddSecondaryField(new StandardField("cliente", "CLIENTE", input.ClienteNombre));
        request.AddSecondaryField(new StandardField(
            "vence", "VENCE", input.Vencimiento?.ToString("dd/MM/yyyy") ?? "Sin vencimiento"));

        return request;
    }

    private static string? NonEmpty(string? value) => string.IsNullOrWhiteSpace(value) ? null : value;

    private static string HexToRgb(string hex)
    {
        hex = hex.TrimStart('#');
        if (hex.Length != 6) return "rgb(24,24,27)";
        var r = Convert.ToInt32(hex[..2], 16);
        var g = Convert.ToInt32(hex.Substring(2, 2), 16);
        var b = Convert.ToInt32(hex.Substring(4, 2), 16);
        return $"rgb({r},{g},{b})";
    }

    private async Task<byte[]> GetBytesCachedAsync(string cacheKey, string url, CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(cacheKey, out byte[]? cached) && cached != null)
            return cached;

        var client = _httpFactory.CreateClient(HttpClientName);
        var bytes = await client.GetByteArrayAsync(url, cancellationToken);
        _cache.Set(cacheKey, bytes, TimeSpan.FromMinutes(30));
        return bytes;
    }
}
