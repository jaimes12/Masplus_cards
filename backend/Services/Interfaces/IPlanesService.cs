using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IPlanesService
{
    Task<List<PlanDto>> GetCatalogoAsync();
    Task<EmpresaPlanDto> GetActualAsync(int empresaId);
    Task<EmpresaPlanDto> CambiarPlanAsync(int empresaId, int planId);

    /// <summary>Todos los planes (activos e inactivos) para el editor de administración.</summary>
    Task<List<PlanAdminDto>> GetCatalogoAdminAsync();
    Task<PlanAdminDto> ActualizarAsync(int planId, PlanUpdateRequest request);
}
