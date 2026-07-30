namespace MasplusCards.Api.Models;

/// <summary>Tarjeta de fidelidad emitida a un Cliente por una Empresa, vinculada al Diseno vigente al emitirla.</summary>
public class Tarjeta
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public int EmpresaId { get; set; }
    public int DisenoId { get; set; }

    public int SellosActuales { get; set; }
    public int PremiosCanjeados { get; set; }

    /// <summary>Si el Diseno es de tipo "cupon", indica si ya se usó.</summary>
    public bool CuponRedimido { get; set; }

    /// <summary>Valor único codificado en el QR/código de barras de la tarjeta.</summary>
    public string CodigoQr { get; set; } = string.Empty;

    /// <summary>"web" (wallet web) o "apple_wallet".</summary>
    public string WalletTipo { get; set; } = "web";

    /// <summary>Serial number del pass de Apple Wallet, usado para notificaciones push (APNs) de actualización.</summary>
    public string? AppleSerialNumber { get; set; }

    public string Estado { get; set; } = "activa";

    /// <summary>Última vez que se sumó un sello (para saber si el cliente dejó de visitar).</summary>
    public DateTime? UltimoSelloEn { get; set; }

    /// <summary>Última vez que se le envió un recordatorio semanal de sellos pendientes.</summary>
    public DateTime? UltimoRecordatorioEn { get; set; }

    /// <summary>Texto del último recordatorio enviado; viaja como back field con changeMessage
    /// en el pase de Apple Wallet para que el push muestre este mensaje.</summary>
    public string? UltimoRecordatorioMensaje { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Cliente? Cliente { get; set; }
    public Empresa? Empresa { get; set; }
    public Diseno? Diseno { get; set; }
    public List<TarjetaLog> Logs { get; set; } = new();
    public List<PassRegistration> PassRegistrations { get; set; } = new();
}
