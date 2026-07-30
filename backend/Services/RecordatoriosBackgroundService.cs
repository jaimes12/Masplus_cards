using MasplusCards.Api.Services.Interfaces;

namespace MasplusCards.Api.Services;

/// <summary>Job recurrente que manda los recordatorios semanales de sellos pendientes
/// (ver ITarjetasService.EnviarRecordatoriosSemanalesAsync). Corre para todas las empresas;
/// cada tarjeta se filtra internamente por si su diseño tiene los recordatorios activados.</summary>
public class RecordatoriosBackgroundService : BackgroundService
{
    private static readonly TimeSpan IntervaloEntreCorridas = TimeSpan.FromHours(12);
    private static readonly TimeSpan EsperaAlArrancar = TimeSpan.FromMinutes(2);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RecordatoriosBackgroundService> _logger;

    public RecordatoriosBackgroundService(IServiceScopeFactory scopeFactory, ILogger<RecordatoriosBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(EsperaAlArrancar, stoppingToken);
        }
        catch (TaskCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var tarjetas = scope.ServiceProvider.GetRequiredService<ITarjetasService>();
                var enviados = await tarjetas.EnviarRecordatoriosSemanalesAsync(empresaId: null, ct: stoppingToken);
                if (enviados > 0)
                    _logger.LogInformation("Recordatorios semanales enviados: {Count}", enviados);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Error enviando recordatorios semanales.");
            }

            try
            {
                await Task.Delay(IntervaloEntreCorridas, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                return;
            }
        }
    }
}
