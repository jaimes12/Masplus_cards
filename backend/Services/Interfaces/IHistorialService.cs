using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IHistorialService
{
    Task<HistorialPageDto> GetAsync(int empresaId, int page, int pageSize, string? accion, DateTime? desde, DateTime? hasta, string? q);
}
