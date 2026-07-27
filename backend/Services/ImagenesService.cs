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

    public async Task<string> UploadAsync(Stream content, long length, string contentType, CancellationToken cancellationToken = default)
    {
        if (!AllowedContentTypes.Contains(contentType))
            throw new InvalidOperationException("Formato no soportado. Usá PNG, JPG o WEBP.");

        if (length <= 0 || length > MaxSizeBytes)
            throw new InvalidOperationException("La imagen no puede pesar más de 5 MB.");

        if (string.IsNullOrWhiteSpace(_cfg.AccessKey) || string.IsNullOrWhiteSpace(_cfg.Endpoint) || string.IsNullOrWhiteSpace(_cfg.Bucket))
            throw new InvalidOperationException("La subida de imágenes no está configurada.");

        var extension = contentType switch
        {
            "image/png" => "png",
            "image/webp" => "webp",
            _ => "jpg",
        };
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
