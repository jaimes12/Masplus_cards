using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IClientesService
{
    Task<List<ClienteDto>> GetByEmpresaAsync(int empresaId);
    Task<ClienteDto?> GetByIdAsync(int empresaId, int id);
    Task<ClienteDto?> EditarAsync(int empresaId, int id, ClienteEditRequest request);
    Task<List<ClienteHistorialItemDto>> GetHistorialAsync(int empresaId, int id);
}
