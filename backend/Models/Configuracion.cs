namespace MasplusCards.Api.Models;

/// <summary>Ajustes globales editables desde el admin, como clave-valor (ej. el contexto
/// personalizado de la IA de ventas de WhatsApp).</summary>
public class Configuracion
{
    public int Id { get; set; }
    public string Clave { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
