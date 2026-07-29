namespace MasplusCards.Api.Models;

public class Empresa
{
    public int Id { get; set; }
    public string? Nombre { get; set; }
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public string? Telefono { get; set; }
    public string? Logo { get; set; }

    /// <summary>Diseño actualmente activo/publicado, usado para emitir nuevas tarjetas.</summary>
    public int? DisenoActivoId { get; set; }

    public int? PlanId { get; set; }

    /// <summary>Próxima fecha de renovación del plan actual. Null si nunca eligió uno.</summary>
    public DateTime? PlanRenuevaEl { get; set; }

    /// <summary>Id del Customer en Stripe, para cobrar sin volver a pedir los datos de tarjeta cada vez.</summary>
    public string? StripeCustomerId { get; set; }

    /// <summary>Id de la suscripción activa en Stripe (null si nunca pagó o si la canceló).</summary>
    public string? StripeSubscriptionId { get; set; }

    public string Estado { get; set; } = "activa";
    public DateTime CreatedAt { get; set; }

    public Diseno? DisenoActivo { get; set; }
    public Plan? Plan { get; set; }
    public List<Diseno> Disenos { get; set; } = new();
    public List<Cliente> Clientes { get; set; } = new();
    public List<Tarjeta> Tarjetas { get; set; } = new();
}
