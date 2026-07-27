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

    public static byte[] Render(string? backgroundHex, string? foregroundHex, int sellosRequeridos, int sellosActuales, byte[]? iconPng)
    {
        var background = ParseColor(backgroundHex, new Rgba32(24, 24, 27));
        var foreground = ParseColor(foregroundHex, new Rgba32(250, 250, 250));

        sellosRequeridos = Math.Clamp(sellosRequeridos, 1, 20);
        sellosActuales = Math.Clamp(sellosActuales, 0, sellosRequeridos);

        var columns = Math.Min(sellosRequeridos, 10);
        var rows = (int)Math.Ceiling(sellosRequeridos / (double)columns);

        using var image = new Image<Rgba32>(Width, Height);

        Image<Rgba32>? icon = null;
        if (iconPng is { Length: > 0 })
        {
            try { icon = Image.Load<Rgba32>(iconPng); }
            catch { icon = null; }
        }

        image.Mutate(ctx =>
        {
            ctx.Fill(background);

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

                ctx.Draw(WithAlpha(foreground, filled ? 0.95f : 0.35f), 4f, ring);

                if (icon != null)
                {
                    var iconSize = (int)(circleRadius * 1.15f);
                    using var resized = icon.Clone(x => x.Resize(iconSize, iconSize));
                    var pos = new Point((int)(cx - iconSize / 2f), (int)(cy - iconSize / 2f));
                    ctx.DrawImage(resized, pos, filled ? 1f : 0.35f);
                }
                else if (filled)
                {
                    var dot = new EllipsePolygon(cx, cy, circleRadius * 0.4f);
                    ctx.Fill(foreground, dot);
                }
            }
        });

        icon?.Dispose();

        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
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
