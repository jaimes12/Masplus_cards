namespace MasplusCards.Api.Services.Interfaces;

public interface IApnsPushService
{
    /// <summary>Push "vacío" (background) que le dice al dispositivo que vuelva a pedir el pase actualizado.</summary>
    Task SendUpdateAsync(string pushToken, CancellationToken cancellationToken = default);
}
