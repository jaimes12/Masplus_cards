namespace MasplusCards.Api.Models;

/// <summary>Plantilla base creada por un admin; las empresas la eligen y personalizan como Diseno.</summary>
public class Template
{
    public int Id { get; set; }
    public int? AdminId { get; set; }
    public string? Nombre { get; set; }
    public string? Descripcion { get; set; }
    public string? PreviewImg { get; set; }

    /// <summary>Tipo de tarjeta que define este template: "sellos" (tarjeta de estampas) o "cupon".</summary>
    public string TipoRecompensa { get; set; } = "sellos";

    /// <summary>JSON con la configuración base: colores por defecto, cantidad de sellos, estilo de ícono, layout.</summary>
    public string? Estructura { get; set; }

    public bool Activo { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public Admin? Admin { get; set; }
    public List<Diseno> Disenos { get; set; } = new();
}
