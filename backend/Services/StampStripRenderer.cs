using System.Globalization;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace MasplusCards.Api.Services;

/// <summary>Genera la imagen del strip del pase Apple Wallet: el mismo grid de sellos que se ve en la wallet web.</summary>
public static class StampStripRenderer
{
    // Tamaño @3x de la imagen "background" documentado por Apple (180x220pt @1x). A diferencia del
    // "strip" (banner acotado, con una franja de color separada debajo para los campos), "background"
    // cubre TODA la tarjeta y Apple dibuja header/primary/secondary/auxiliary ENCIMA de la foto — así
    // se logra el look de los pases de referencia (museo, food truck, gimnasio), sin el corte entre
    // foto y bloque de color. "background" solo es válido en el estilo EventTicket (y Generic, que no
    // soporta ninguna imagen grande) según la documentación oficial de PassKit.
    public const int BackgroundWidth = 540;
    public const int BackgroundHeight = 660;

    /// <summary>Imagen "background" del pase (estilo EventTicket) para tarjetas tipo cupón: la foto cubre
    /// toda la tarjeta. Apple dibuja logo/header arriba y primary/secondary/auxiliary abajo ENCIMA de
    /// esta imagen, así que le agregamos velos (oscuro arriba, degradado hacia el backgroundColor del
    /// pase abajo) para que ese texto sea legible sin importar la foto. Apple además recorta y difumina
    /// un poco esta imagen automáticamente (documentado); remuestreamos con Lanczos3 y afilamos después
    /// para compensar ese blur.</summary>
    public static byte[] RenderCuponBackground(string? backgroundHex, byte[]? backgroundImagePng)
    {
        var background = ParseColor(backgroundHex, new Rgba32(24, 24, 27));
        var width = BackgroundWidth;
        var height = BackgroundHeight;

        using var image = new Image<Rgba32>(width, height);

        Image<Rgba32>? backgroundImage = null;
        if (backgroundImagePng is { Length: > 0 })
        {
            try { backgroundImage = Image.Load<Rgba32>(backgroundImagePng); }
            catch { backgroundImage = null; }
        }

        image.Mutate(ctx =>
        {
            ctx.Fill(background);

            if (backgroundImage != null)
            {
                backgroundImage.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(width, height),
                    Mode = ResizeMode.Crop,
                    Position = AnchorPositionMode.Center,
                    Sampler = KnownResamplers.Lanczos3,
                }));
                ctx.DrawImage(backgroundImage, new Point(0, 0), 1f);
                ctx.GaussianSharpen(6f);
                ApplyLegibilityVeils(ctx, width, height, background, bottomStartFraction: 0.55f);
            }
        });

        backgroundImage?.Dispose();

        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }

    /// <summary>Imagen "background" del pase (también EventTicket, ahora usado para sellos) con la misma
    /// foto a toda la tarjeta + velos que <see cref="RenderCuponBackground"/>, pero con el grid de sellos
    /// dibujado dentro de la franja inferior ya oscurecida por el degradado (o sobre el color sólido si
    /// no hay foto), para que sea legible sin necesitar un overlay parejo sobre toda la imagen.</summary>
    public static byte[] RenderSellosBackground(
        string? backgroundHex, string? foregroundHex, int sellosRequeridos, int sellosActuales,
        byte[]? iconPng, byte[]? backgroundImagePng)
    {
        var background = ParseColor(backgroundHex, new Rgba32(24, 24, 27));
        var foreground = ParseColor(foregroundHex, new Rgba32(250, 250, 250));

        sellosRequeridos = Math.Clamp(sellosRequeridos, 1, 20);
        sellosActuales = Math.Clamp(sellosActuales, 0, sellosRequeridos);

        var width = BackgroundWidth;
        var height = BackgroundHeight;

        using var image = new Image<Rgba32>(width, height);

        Image<Rgba32>? icon = null;
        if (iconPng is { Length: > 0 })
        {
            try { icon = Image.Load<Rgba32>(iconPng); }
            catch { icon = null; }
        }

        Image<Rgba32>? backgroundImage = null;
        if (backgroundImagePng is { Length: > 0 })
        {
            try { backgroundImage = Image.Load<Rgba32>(backgroundImagePng); }
            catch { backgroundImage = null; }
        }

        var gridTop = (int)(height * 0.58f);

        image.Mutate(ctx =>
        {
            ctx.Fill(background);

            if (backgroundImage != null)
            {
                backgroundImage.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(width, height),
                    Mode = ResizeMode.Crop,
                    Position = AnchorPositionMode.Center,
                    Sampler = KnownResamplers.Lanczos3,
                }));
                ctx.DrawImage(backgroundImage, new Point(0, 0), 1f);
                ctx.GaussianSharpen(6f);
                ApplyLegibilityVeils(ctx, width, height, background, bottomStartFraction: 0.48f);
            }

            const int padding = 40;
            var columns = Math.Min(sellosRequeridos, 4);
            var rows = (int)Math.Ceiling(sellosRequeridos / (double)columns);
            var gridHeight = height - gridTop;
            var cellSize = Math.Min((width - padding * 2) / columns, (gridHeight - padding * 2) / rows);
            var circleRadius = cellSize * 0.34f;
            var gapX = (width - columns * cellSize) / 2f;
            var gapY = gridTop + (gridHeight - rows * cellSize) / 2f;

            for (var i = 0; i < sellosRequeridos; i++)
            {
                var col = i % columns;
                var row = i / columns;
                var cx = gapX + col * cellSize + cellSize / 2f;
                var cy = gapY + row * cellSize + cellSize / 2f;
                var filled = i < sellosActuales;

                var ring = new EllipsePolygon(cx, cy, circleRadius);

                if (filled)
                    ctx.Fill(WithAlpha(foreground, 0.16f), ring);

                if (icon != null)
                {
                    var iconDiameter = (int)(circleRadius * 1.9f);
                    using var resized = icon.Clone(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(iconDiameter, iconDiameter),
                        Mode = ResizeMode.Crop,
                        Position = AnchorPositionMode.Center,
                    }));
                    var iconRing = new EllipsePolygon(cx, cy, iconDiameter / 2f);
                    var opacity = filled ? 1f : 0.35f;
                    ctx.Fill(new DrawingOptions { GraphicsOptions = new GraphicsOptions { BlendPercentage = opacity } }, new ImageBrush(resized), iconRing);
                }
                else if (filled)
                {
                    DrawCheckmark(ctx, cx, cy, circleRadius, foreground);
                }

                ctx.Draw(WithAlpha(foreground, filled ? 0.95f : 0.35f), 4f, ring);
            }
        });

        icon?.Dispose();
        backgroundImage?.Dispose();

        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }

    /// <summary>Velo oscuro arriba (para el logo/header que Apple dibuja encima) y degradado abajo que se
    /// funde con el backgroundColor del pase (para primary/secondary/auxiliary), sobre una foto de fondo
    /// a toda la tarjeta.</summary>
    private static void ApplyLegibilityVeils(
        IImageProcessingContext ctx, int width, int height, Rgba32 background, float bottomStartFraction)
    {
        var topEnd = (int)(height * 0.22f);
        var topBrush = new LinearGradientBrush(
            new PointF(0, 0), new PointF(0, topEnd), GradientRepetitionMode.None,
            new ColorStop(0f, WithAlpha(new Rgba32(0, 0, 0), 0.5f)),
            new ColorStop(1f, WithAlpha(new Rgba32(0, 0, 0), 0f)));
        ctx.Fill(topBrush, new RectangularPolygon(0, 0, width, topEnd));

        var bottomStart = (int)(height * bottomStartFraction);
        var bottomBrush = new LinearGradientBrush(
            new PointF(0, bottomStart), new PointF(0, height), GradientRepetitionMode.None,
            new ColorStop(0f, WithAlpha(background, 0f)),
            new ColorStop(1f, WithAlpha(background, 1f)));
        ctx.Fill(bottomBrush, new RectangularPolygon(0, bottomStart, width, height - bottomStart));
    }

    private static void DrawCheckmark(IImageProcessingContext ctx, float cx, float cy, float radius, Rgba32 color)
    {
        var s = radius * 0.85f;
        var path = new PathBuilder()
            .AddLines(
                new PointF(cx - s * 0.55f, cy + s * 0.05f),
                new PointF(cx - s * 0.12f, cy + s * 0.45f),
                new PointF(cx + s * 0.6f, cy - s * 0.4f))
            .Build();

        var pen = new SolidPen(new PenOptions(color, radius * 0.22f)
        {
            JointStyle = JointStyle.Round,
            EndCapStyle = EndCapStyle.Round,
        });
        ctx.Draw(pen, path);
    }

    private static Rgba32 WithAlpha(Rgba32 color, float alpha) =>
        new(color.R, color.G, color.B, (byte)Math.Clamp(alpha * 255f, 0f, 255f));

    private static Rgba32 ParseColor(string? hex, Rgba32 fallback)
    {
        if (string.IsNullOrWhiteSpace(hex)) return fallback;
        hex = hex.TrimStart('#');
        if (hex.Length != 6) return fallback;

        try
        {
            var r = byte.Parse(hex[..2], NumberStyles.HexNumber, CultureInfo.InvariantCulture);
            var g = byte.Parse(hex.Substring(2, 2), NumberStyles.HexNumber, CultureInfo.InvariantCulture);
            var b = byte.Parse(hex.Substring(4, 2), NumberStyles.HexNumber, CultureInfo.InvariantCulture);
            return new Rgba32(r, g, b);
        }
        catch (FormatException)
        {
            return fallback;
        }
    }
}
