using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IPlanesService
{
    Task<List<PlanDto>> GetCatalogoAsync();
    Task<EmpresaPlanDto> GetActualAsync(int empresaId);
    Task<EmpresaPlanDto> CambiarPlanAsync(int empresaId, int planId);
}
