namespace MasplusCards.Api.Models;

/// <summary>Historial de eventos de una tarjeta (sello agregado, premio canjeado, etc.).</summary>
public class TarjetaLog
{
    public int Id { get; set; }
    public int TarjetaId { get; set; }

    /// <summary>Denormalizado desde Tarjeta.EmpresaId para poder armar el feed de Historial
    /// de una empresa sin tener que unir contra cada tarjeta.</summary>
    public int EmpresaId { get; set; }

    /// <summary>"tarjeta_creada" | "sello_agregado" | "premio_canjeado".</summary>
    public string Accion { get; set; } = string.Empty;

    public int? SellosAgregados { get; set; }
    public string? Descripcion { get; set; }
    public DateTime CreatedAt { get; set; }

    public Tarjeta? Tarjeta { get; set; }
}
