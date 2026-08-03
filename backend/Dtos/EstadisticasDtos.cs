namespace MasplusCards.Api.Dtos;

public record EstadisticasKpisDto(
    int ClientesTotal, int ClientesNuevos30d, int ClientesActivos30d,
    int Sellos30d, int Canjes30d, double TasaRetorno);

public record SeriePuntoDto(string Etiqueta, int Valor);

public record SerieSemanaDto(string Etiqueta, int Sellos, int Canjes);

public record ComposicionBaseDto(int Frecuente, int Activo, int Nuevo, int CanjeListo, int Inactivo);

public record CohorteRetencionDto(string Mes, int ClientesRegistrados, double PorcentajeRetenido);

public record EstadisticasDto(
    EstadisticasKpisDto Kpis,
    List<SeriePuntoDto> ClientesAcumulados,
    List<SerieSemanaDto> ActividadSemanal,
    ComposicionBaseDto Composicion,
    List<CohorteRetencionDto> Retencion);
