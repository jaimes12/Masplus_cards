using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface ITemplatesService
{
    Task<List<TemplateDto>> GetAllAsync(bool soloActivos);
    Task<TemplateDto?> GetByIdAsync(int id);
    Task<TemplateDto> CreateAsync(int adminId, TemplateUpsertRequest request);
    Task<TemplateDto?> UpdateAsync(int id, TemplateUpsertRequest request);
    Task<bool> DeleteAsync(int id);
}
