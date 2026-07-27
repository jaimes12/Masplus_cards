using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<List<AdminEmpresaListItemDto>> GetEmpresasAsync();
}
