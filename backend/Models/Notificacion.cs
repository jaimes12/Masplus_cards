namespace MasplusCards.Api.Models;

/// <summary>Notificación en el panel de empresa (no confundir con los push de Apple Wallet,
/// que son para el celular del cliente final, no para el negocio).</summary>
public class Notificacion
{
    public int Id { get; set; }
    public int EmpresaId { get; set; }

    /// <summary>"tarjeta_completada" | "pago_procesado" | "diseno_pausado" | "diseno_reactivado".</summary>
    public string Tipo { get; set; } = string.Empty;

    public string Titulo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;

    /// <summary>Sección del panel a la que lleva el botón de acción (p.ej. "escaner", "configuracion").</summary>
    public string? LinkView { get; set; }

    public bool Leida { get; set; }
    public DateTime CreatedAt { get; set; }

    public Empresa? Empresa { get; set; }
}
