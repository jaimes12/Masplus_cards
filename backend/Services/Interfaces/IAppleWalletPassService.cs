using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IAppleWalletPassService
{
    Task<byte[]> GenerateStoreCardAsync(AppleWalletPassInput input, CancellationToken cancellationToken = default);
}
