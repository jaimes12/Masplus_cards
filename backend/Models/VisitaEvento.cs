namespace MasplusCards.Api.Models;

/// <summary>Evento de analítica propia del sitio público (landing, registro, wallet web).
/// Sin PII: el visitante es un id aleatorio generado en su navegador (localStorage).</summary>
public class VisitaEvento
{
    public long Id { get; set; }

    /// <summary>Id anónimo del navegador (persistente entre visitas).</summary>
    public string VisitanteId { get; set; } = "";

    /// <summary>Id de la sesión de navegación (se renueva al cerrar la pestaña o tras inactividad).</summary>
    public string SesionId { get; set; } = "";

    /// <summary>"pageview" | "etapa" | "fin" (fin de sesión, trae la duración).</summary>
    public string Tipo { get; set; } = "";

    /// <summary>Ruta (pageview) o nombre de etapa del funnel (etapa):
    /// vio_como_funciona, vio_precios, cta_registro, registro_form, registro_completado…</summary>
    public string? Valor { get; set; }

    /// <summary>Solo tipo "fin": segundos activos de la sesión en la página.</summary>
    public int? DuracionSegundos { get; set; }

    public string? Referrer { get; set; }

    /// <summary>"mobile" | "desktop".</summary>
    public string? Dispositivo { get; set; }

    /// <summary>Se llena cuando el visitante completa el registro de empresa: enlaza visita → cuenta.</summary>
    public int? EmpresaId { get; set; }

    public DateTime CreatedAt { get; set; }
}
