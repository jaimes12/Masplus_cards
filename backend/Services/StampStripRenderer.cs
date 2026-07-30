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
    public const int Width = 1125;
    public const int Height = 369;

    public static byte[] Render(
        string? backgroundHex, string? foregroundHex, int sellosRequeridos, int sellosActuales,
        byte[]? iconPng, byte[]? backgroundImagePng = null)
    {
        var background = ParseColor(backgroundHex, new Rgba32(24, 24, 27));
        var foreground = ParseColor(foregroundHex, new Rgba32(250, 250, 250));

        sellosRequeridos = Math.Clamp(sellosRequeridos, 1, 20);
        sellosActuales = Math.Clamp(sellosActuales, 0, sellosRequeridos);

        var columns = Math.Min(sellosRequeridos, 4);
        var rows = (int)Math.Ceiling(sellosRequeridos / (double)columns);

        using var image = new Image<Rgba32>(Width, Height);

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

        image.Mutate(ctx =>
        {
            ctx.Fill(background);

            if (backgroundImage != null)
            {
                backgroundImage.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(Width, Height),
                    Mode = ResizeMode.Crop,
                    Position = AnchorPositionMode.Center,
                }));
                ctx.DrawImage(backgroundImage, new Point(0, 0), 1f);
                // Overlay semitransparente para que el grid de sellos siga siendo legible sobre la foto.
                ctx.Fill(WithAlpha(background, 0.55f), new RectangularPolygon(0, 0, Width, Height));
            }

            const int padding = 60;
            var cellSize = Math.Min((Width - padding * 2) / columns, (Height - padding * 2) / rows);
            var circleRadius = cellSize * 0.34f;
            var gapX = (Width - columns * cellSize) / 2f;
            var gapY = (Height - rows * cellSize) / 2f;

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

    // Tamaño @3x de la imagen "background" (180x220pt @1x); se reusa la misma imagen para @1x/@2x/@3x.
    public const int BackgroundWidth = 540;
    public const int BackgroundHeight = 660;

    // Strip del pase estilo Coupon: mucho más alto que el de storeCard (375x300pt @1x) porque en Coupon
    // la foto es el elemento dominante de la tarjeta (como en los pases reales de referencia: museo,
    // food truck, gimnasio), no solo un banner arriba.
    public const int CouponStripWidth = 1125;
    public const int CouponStripHeight = 1500;

    /// <summary>Strip del pase (estilo Coupon) para tarjetas tipo cupón: la foto domina toda la tarjeta.
    /// Apple dibuja los campos (premio/cliente/estado) y el QR en la franja debajo del strip usando el
    /// backgroundColor del pase; para que no se vea como una foto con un bloque de color "pegado" abajo,
    /// el propio strip se funde con ese mismo color en su tercio inferior (degradado), como en los pases
    /// reales de referencia (foto de fondo con el texto flotando sobre un velo oscuro, sin corte visible).
    /// Apple Wallet además aplica su propio blur automático a las imágenes de pase (no es algo que
    /// podamos desactivar). Para que no se note tanto, remuestreamos con Lanczos3 (más nítido que el
    /// resize por defecto) y afilamos el resultado antes de guardar, para compensar el blur de Apple.</summary>
    public static byte[] RenderCuponStrip(string? backgroundHex, byte[]? backgroundImagePng)
    {
        var background = ParseColor(backgroundHex, new Rgba32(24, 24, 27));
        var width = CouponStripWidth;
        var height = CouponStripHeight;

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
                ctx.GaussianSharpen(1.6f);

                var gradientStart = (int)(height * 0.55f);
                var brush = new LinearGradientBrush(
                    new PointF(0, gradientStart), new PointF(0, height), GradientRepetitionMode.None,
                    new ColorStop(0f, WithAlpha(background, 0f)),
                    new ColorStop(1f, WithAlpha(background, 1f)));
                ctx.Fill(brush, new RectangularPolygon(0, gradientStart, width, height - gradientStart));
            }
        });

        backgroundImage?.Dispose();

        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
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
