using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface ITarjetasService
{
    Task<List<TarjetaDto>> GetByEmpresaAsync(int empresaId);
    Task<TarjetaDto?> GetByIdAsync(int empresaId, int id);
    Task<TarjetaDto?> GetByCodigoQrAsync(string codigoQr);
    Task<TarjetaDto> EmitirAsync(int empresaId, EmitirTarjetaRequest request);
    Task<TarjetaDto?> SumarSelloAsync(int empresaId, int id);
    Task<TarjetaDto?> SumarSelloPorCodigoAsync(int empresaId, string codigoQr);
    Task<TarjetaDto?> RestarSelloAsync(int empresaId, int id);
    Task<TarjetaDto?> EditarSellosAsync(int empresaId, int id, int sellosActuales);
    Task<TarjetaDto?> CanjearPremioAsync(int empresaId, int id);
    Task<TarjetaDto?> CanjearCuponAsync(int empresaId, int id);
    Task<List<TarjetaLogDto>> GetLogsAsync(int empresaId, int id);

    /// <summary>Manda un push "aprovecha tus sellos" a las tarjetas con sellos pendientes que no
    /// volvieron en 7 días (y no recibieron otro recordatorio en ese lapso). Si empresaId es null,
    /// corre para todas las empresas (uso del job en background); si no, sólo para esa empresa
    /// (uso del botón manual). Devuelve cuántas tarjetas recibieron el recordatorio.</summary>
    Task<int> EnviarRecordatoriosSemanalesAsync(int? empresaId = null, CancellationToken ct = default);
}
