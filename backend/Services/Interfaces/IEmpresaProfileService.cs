using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IEmpresaProfileService
{
    Task<EmpresaProfileDto?> GetAsync(int empresaId);
    Task<EmpresaProfileDto?> UpdateAsync(int empresaId, EmpresaProfileUpdateRequest request);
    Task CambiarPasswordAsync(int empresaId, CambiarPasswordRequest request);
}
