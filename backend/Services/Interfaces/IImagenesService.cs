namespace MasplusCards.Api.Services.Interfaces;

public interface IImagenesService
{
    /// <summary>Sube una imagen a R2 y devuelve su URL pública.</summary>
    Task<string> UploadAsync(Stream content, long length, string contentType, CancellationToken cancellationToken = default);
}
