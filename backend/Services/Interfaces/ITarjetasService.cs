using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface ITarjetasService
{
    Task<List<TarjetaDto>> GetByEmpresaAsync(int empresaId);
    Task<TarjetaDto?> GetByIdAsync(int empresaId, int id);
    Task<TarjetaDto?> GetByCodigoQrAsync(string codigoQr);
    Task<TarjetaDto> EmitirAsync(int empresaId, EmitirTarjetaRequest request);
    Task<TarjetaDto?> SumarSelloAsync(int empresaId, int id);
    Task<TarjetaDto?> CanjearPremioAsync(int empresaId, int id);
    Task<List<TarjetaLogDto>> GetLogsAsync(int empresaId, int id);
}
