using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<List<AdminEmpresaListItemDto>> GetEmpresasAsync();
    Task<AdminAnaliticaDto> GetAnaliticaAsync(int dias);
    Task<AdminEmpresaDetalleDto?> GetEmpresaDetalleAsync(int empresaId);
}
