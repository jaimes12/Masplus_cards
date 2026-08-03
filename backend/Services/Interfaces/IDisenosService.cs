using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IDisenosService
{
    Task<List<DisenoDto>> GetByEmpresaAsync(int empresaId);
    Task<DisenoDto?> GetByIdAsync(int empresaId, int id);
    Task<DisenoDto> CreateAsync(int empresaId, DisenoUpsertRequest request);
    Task<DisenoDto?> UpdateAsync(int empresaId, int id, DisenoUpsertRequest request);
    Task<DisenoDto?> ActivarAsync(int empresaId, int id);
    Task<DisenoDto?> PausarAsync(int empresaId, int id);
    Task<DisenoDto?> ReactivarAsync(int empresaId, int id);
    Task<DisenoDto?> DuplicarAsync(int empresaId, int id);
    Task<bool> DeleteAsync(int empresaId, int id);
}
