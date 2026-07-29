using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IDiscountCodesService
{
    Task<List<DiscountCodeDto>> GetAllAsync();
    Task<DiscountCodeDto> CreateAsync(DiscountCodeUpsertRequest request);
    Task<bool> SetActivoAsync(int id, bool activo);
    Task<bool> DeleteAsync(int id);
    Task<ValidarCodigoResultDto> ValidarAsync(int empresaId, ValidarCodigoRequest request);

    /// <summary>Marca el código como usado por esta empresa (incrementa usos, registra la redención).
    /// Se llama solo después de que el cobro en Stripe se confirma.</summary>
    Task RedimirAsync(int empresaId, string codigo);
}
