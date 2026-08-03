using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IEstadisticasService
{
    Task<EstadisticasDto> GetAsync(int empresaId);
}
