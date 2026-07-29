namespace MasplusCards.Api.Models;

/// <summary>Plan de suscripción del catálogo. Las empresas eligen uno para operar el panel.</summary>
public class Plan
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioMensual { get; set; }

    /// <summary>Null = ilimitado.</summary>
    public int? LimiteDisenos { get; set; }

    /// <summary>Null = ilimitado.</summary>
    public int? LimiteTarjetas { get; set; }

    /// <summary>JSON con la lista de strings de características a mostrar en la tarjeta del plan.</summary>
    public string? Caracteristicas { get; set; }

    /// <summary>Se resalta como "Más popular" en el listado.</summary>
    public bool Destacado { get; set; }

    public int Orden { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    /// <summary>Id del Price recurrente en Stripe para este plan (se crea solo la primera vez que se usa).</summary>
    public string? StripePriceId { get; set; }

    public List<Empresa> Empresas { get; set; } = new();
}
