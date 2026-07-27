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

    /// <summary>Valor único codificado en el QR/código de barras de la tarjeta.</summary>
    public string CodigoQr { get; set; } = string.Empty;

    /// <summary>"web" (wallet web) o "apple_wallet".</summary>
    public string WalletTipo { get; set; } = "web";

    /// <summary>Serial number del pass de Apple Wallet, usado para notificaciones push (APNs) de actualización.</summary>
    public string? AppleSerialNumber { get; set; }

    public string Estado { get; set; } = "activa";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Cliente? Cliente { get; set; }
    public Empresa? Empresa { get; set; }
    public Diseno? Diseno { get; set; }
    public List<TarjetaLog> Logs { get; set; } = new();
    public List<PassRegistration> PassRegistrations { get; set; } = new();
}
