using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Passbook.Generator;
using Passbook.Generator.Fields;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
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
    private readonly ILogger<AppleWalletPassService> _logger;

    public AppleWalletPassService(
        IOptions<AppleWalletConfiguration> options, IHttpClientFactory httpFactory, IMemoryCache cache,
        ILogger<AppleWalletPassService> logger)
    {
        _cfg = options.Value;
        _httpFactory = httpFactory;
        _cache = cache;
        _logger = logger;
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

        _logger.LogInformation(
            "Descarga Apple Wallet: codigoQr={CodigoQr} input.Tipo={Tipo} rama={Rama}",
            input.CodigoQr, input.Tipo, input.Tipo == "cupon" ? "BuildCuponAsync" : "BuildSellosAsync");

        var request = input.Tipo == "cupon"
            ? await BuildCuponAsync(baseRequest, input, backgroundColor, cancellationToken)
            : await BuildSellosAsync(baseRequest, input, backgroundColor, foregroundColor, cancellationToken);

        request.AddBarcode(BarcodeType.PKBarcodeFormatQR, input.CodigoQr, "UTF-8", "Powered by Masplus");

        _logger.LogInformation(
            "Descarga Apple Wallet: codigoQr={CodigoQr} request.Style={Style}", input.CodigoQr, request.Style);

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

        var fondoPase = StampStripRenderer.RenderSellosBackground(
            backgroundColor, foregroundColor, input.SellosRequeridos, input.SellosActuales, stampIcon, fondo);

        // EventTicket (no Coupon/StoreCard): es el único estilo, junto con Generic, que Apple permite
        // usar con clientes finales sin campos de reserva raros; y a diferencia de Generic (que según
        // la documentación oficial de PassKit NO admite ninguna imagen grande, solo logo/icon/thumbnail),
        // EventTicket sí admite "background", la única imagen que cubre TODA la tarjeta (a diferencia de
        // "strip", que es un banner acotado con una franja de color separada debajo). El grid de sellos
        // ya viene dibujado dentro de la propia imagen (ver StampStripRenderer.RenderSellosBackground).
        request.Style = PassStyle.EventTicket;
        request.Description = $"Tarjeta de fidelidad {input.OrganizationName}";
        request.Images.Add(PassbookImage.Background, fondoPase);
        request.Images.Add(PassbookImage.Background2X, fondoPase);
        request.Images.Add(PassbookImage.Background3X, fondoPase);

        var faltan = Math.Max(input.SellosRequeridos - input.SellosActuales, 0);
        request.AddHeaderField(new StandardField("premios", "PREMIOS", input.PremiosCanjeados.ToString()));
        request.AddPrimaryField(new StandardField(
            "restantes", "", faltan > 0 ? $"Faltan {faltan} sello{(faltan == 1 ? "" : "s")}" : "¡Premio disponible!"));
        request.AddSecondaryField(new StandardField("cliente", "CLIENTE", input.ClienteNombre));

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

        // EventTicket (no Coupon): según la documentación oficial de PassKit, "background" (la única
        // imagen que cubre TODA la tarjeta, como en los pases de referencia: museo, food truck,
        // gimnasio) solo es válida en EventTicket — Coupon/StoreCard solo admiten "strip" (banner
        // acotado, con una franja de color separada debajo) y Generic no admite ninguna imagen grande.
        request.Style = PassStyle.EventTicket;
        request.Description = NonEmpty(input.Descripcion) ?? $"Cupón {input.OrganizationName}";
        // ExpirationDate no se ve en el frente del pase (Apple solo la usa para archivar el pase
        // automáticamente en "Pases caducados"); el vencimiento visible va en el auxiliaryField de abajo.
        request.ExpirationDate = input.Vencimiento;

        if (fondo != null)
        {
            var fondoPase = StampStripRenderer.RenderCuponBackground(backgroundColor, fondo);
            request.Images.Add(PassbookImage.Background, fondoPase);
            request.Images.Add(PassbookImage.Background2X, fondoPase);
            request.Images.Add(PassbookImage.Background3X, fondoPase);
        }

        var vencido = input.Vencimiento.HasValue && input.Vencimiento.Value < MexicoCityTime.Now();
        var estado = input.CuponRedimido ? "CANJEADO" : vencido ? "VENCIDO" : "VIGENTE";

        request.AddHeaderField(new StandardField("estado", "ESTADO", estado));
        request.AddPrimaryField(new StandardField(
            "oferta", "", NonEmpty(input.Descripcion) ?? "Cupón especial"));
        request.AddSecondaryField(new StandardField("cliente", "CLIENTE", input.ClienteNombre));
        request.AddAuxiliaryField(new StandardField(
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
