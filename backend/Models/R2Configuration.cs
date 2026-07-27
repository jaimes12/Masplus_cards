namespace MasplusCards.Api.Models;

/// <summary>Configuración de Cloudflare R2 (S3-compatible) para subir imágenes (logos, íconos de sello).</summary>
public class R2Configuration
{
    public string AccessKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string Bucket { get; set; } = "";
    public string Endpoint { get; set; } = "";
    public string PublicUrl { get; set; } = "";
}
