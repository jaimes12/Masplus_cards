using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;

namespace MasplusCards.Api.Services;

public class ImagenesService : IImagenesService
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png", "image/jpeg", "image/webp",
    };

    private const long MaxSizeBytes = 5 * 1024 * 1024;

    private readonly R2Configuration _cfg;

    public ImagenesService(IOptions<R2Configuration> options)
    {
        _cfg = options.Value;
    }

    private static readonly HashSet<string> AllowedVideoContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "video/mp4", "video/webm", "video/quicktime",
    };

    private const long MaxVideoSizeBytes = 50 * 1024 * 1024;

    public async Task<string> UploadAsync(Stream content, long length, string contentType, CancellationToken cancellationToken = default)
    {
        if (!AllowedContentTypes.Contains(contentType))
            throw new InvalidOperationException("Formato no soportado. Usá PNG, JPG o WEBP.");

        if (length <= 0 || length > MaxSizeBytes)
            throw new InvalidOperationException("La imagen no puede pesar más de 5 MB.");

        return await SubirAsync(content, contentType, ExtensionImagen(contentType), cancellationToken);
    }

    public async Task<(string Url, string Tipo)> UploadMediaAsync(Stream content, long length, string contentType, CancellationToken cancellationToken = default)
    {
        var esVideo = AllowedVideoContentTypes.Contains(contentType);
        var esImagen = AllowedContentTypes.Contains(contentType);
        if (!esVideo && !esImagen)
            throw new InvalidOperationException("Formato no soportado. Imágenes PNG/JPG/WEBP o videos MP4/WEBM/MOV.");

        var limite = esVideo ? MaxVideoSizeBytes : MaxSizeBytes;
        if (length <= 0 || length > limite)
            throw new InvalidOperationException(esVideo
                ? "El video no puede pesar más de 50 MB."
                : "La imagen no puede pesar más de 5 MB.");

        var extension = esVideo
            ? contentType.ToLowerInvariant() switch
            {
                "video/webm" => "webm",
                "video/quicktime" => "mov",
                _ => "mp4",
            }
            : ExtensionImagen(contentType);

        var url = await SubirAsync(content, contentType, extension, cancellationToken);
        return (url, esVideo ? "video" : "imagen");
    }

    private static string ExtensionImagen(string contentType) => contentType.ToLowerInvariant() switch
    {
        "image/png" => "png",
        "image/webp" => "webp",
        _ => "jpg",
    };

    private async Task<string> SubirAsync(Stream content, string contentType, string extension, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_cfg.AccessKey) || string.IsNullOrWhiteSpace(_cfg.Endpoint) || string.IsNullOrWhiteSpace(_cfg.Bucket))
            throw new InvalidOperationException("La subida de imágenes no está configurada.");

        var key = $"uploads/{Guid.NewGuid():N}.{extension}";

        using var client = new AmazonS3Client(_cfg.AccessKey, _cfg.SecretKey, new AmazonS3Config
        {
            ServiceURL = _cfg.Endpoint,
            ForcePathStyle = true,
            AuthenticationRegion = "auto",
        });

        await client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _cfg.Bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            AutoCloseStream = false,
            DisablePayloadSigning = true,
        }, cancellationToken);

        return $"{_cfg.PublicUrl.TrimEnd('/')}/{key}";
    }
}
