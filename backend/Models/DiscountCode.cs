namespace MasplusCards.Api.Models;

/// <summary>Código de descuento creado por un admin, aplicable al elegir/cambiar de plan.</summary>
public class DiscountCode
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;

    /// <summary>"porcentaje" (0-100) o "monto_fijo" (MXN).</summary>
    public string TipoDescuento { get; set; } = "porcentaje";

    public decimal Valor { get; set; }

    /// <summary>Si no es null, el código solo aplica a ese plan específico.</summary>
    public int? PlanId { get; set; }

    /// <summary>Null = usos ilimitados.</summary>
    public int? UsosMaximos { get; set; }

    public int UsosActuales { get; set; }

    /// <summary>Null = sin fecha de expiración.</summary>
    public DateTime? FechaExpiracion { get; set; }

    public bool Activo { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public Plan? Plan { get; set; }
    public List<DiscountCodeRedemption> Redenciones { get; set; } = new();
}
