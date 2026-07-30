namespace MasplusCards.Api.Models;

/// <summary>Personalización que una empresa hace sobre un Template (o desde cero): su tarjeta lista para emitir.</summary>
public class Diseno
{
    public int Id { get; set; }
    public int EmpresaId { get; set; }
    public int? TemplateId { get; set; }

    public string? Nombre { get; set; }

    /// <summary>"sellos" (tarjeta de estampas) o "cupon". Determina qué campos aplican y cómo se genera el pase.</summary>
    public string Tipo { get; set; } = "sellos";

    public string? Logo { get; set; }
    public string? ColorPrimario { get; set; }
    public string? ColorSecundario { get; set; }
    public string? ColorTexto { get; set; }
    public string? IconoSello { get; set; }

    /// <summary>Imagen de fondo de la tarjeta (wallet web y strip del pase de Apple Wallet).</summary>
    public string? FondoUrl { get; set; }

    /// <summary>Cantidad de sellos necesarios para canjear un premio (si Tipo = "sellos").</summary>
    public int SellosRequeridos { get; set; } = 10;

    /// <summary>Fecha límite del cupón (si Tipo = "cupon"). Null = sin vencimiento.</summary>
    public DateTime? Vencimiento { get; set; }

    /// <summary>Premio (tipo "sellos") o descripción de la oferta (tipo "cupon", ej. "2x1 en combo").</summary>
    public string? Descripcion { get; set; }

    /// <summary>JSON con overrides libres de layout/estilo sobre la Estructura del Template.</summary>
    public string? Configuracion { get; set; }

    /// <summary>Si es false, queda oculto para nuevas emisiones.</summary>
    public bool Activo { get; set; } = true;

    /// <summary>Si es true, a las tarjetas con sellos pendientes que no vuelven en 7 días se les
    /// manda un recordatorio push a Apple Wallet ("aprovecha tus sellos"). Off por defecto: es
    /// mensajería automática a clientes, la empresa la tiene que prender a propósito.</summary>
    public bool RecordatoriosActivos { get; set; } = false;

    /// <summary>Código público (no adivinable) usado en la URL de autorregistro y su QR. Se genera al crear el diseño.</summary>
    public string CodigoRegistro { get; set; } = Guid.NewGuid().ToString("N");

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa? Empresa { get; set; }
    public Template? Template { get; set; }
    public List<Tarjeta> Tarjetas { get; set; } = new();
}
