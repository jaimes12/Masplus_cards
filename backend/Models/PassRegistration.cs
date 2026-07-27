namespace MasplusCards.Api.Models;

/// <summary>Un dispositivo que agregó una Tarjeta a Apple Wallet, registrado para recibir push updates.</summary>
public class PassRegistration
{
    public int Id { get; set; }
    public int TarjetaId { get; set; }
    public string DeviceLibraryIdentifier { get; set; } = string.Empty;
    public string PushToken { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Tarjeta? Tarjeta { get; set; }
}
