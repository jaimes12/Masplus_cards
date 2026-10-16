namespace MasplusCards.Api.Services.Interfaces;

public interface IImagenesService
{
    /// <summary>Sube una imagen a R2 y devuelve su URL pública.</summary>
    Task<string> UploadAsync(Stream content, long length, string contentType, CancellationToken cancellationToken = default);

    /// <summary>Sube una imagen o un video (catálogo de productos) a R2 y devuelve su URL pública
    /// junto con el tipo detectado ("imagen" | "video").</summary>
    Task<(string Url, string Tipo)> UploadMediaAsync(Stream content, long length, string contentType, CancellationToken cancellationToken = default);
}
