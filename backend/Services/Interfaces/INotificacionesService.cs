using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface INotificacionesService
{
    Task<List<NotificacionDto>> GetAsync(int empresaId);
    Task<int> ContarNoLeidasAsync(int empresaId);
    Task MarcarLeidasAsync(int empresaId);
    Task CrearAsync(int empresaId, string tipo, string titulo, string mensaje, string? linkView = null);
}
