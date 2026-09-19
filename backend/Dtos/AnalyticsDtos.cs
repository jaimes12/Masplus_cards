namespace MasplusCards.Api.Dtos;

/// <summary>Un evento del tracker del sitio público. Nombres cortos a propósito: viaja en batches
/// desde el navegador (sendBeacon) y conviene que pese poco.</summary>
public record VisitaEventoRequest(
    string V,          // visitanteId
    string S,          // sesionId
    string Tipo,       // pageview | etapa | fin
    string? Valor,     // ruta o etapa
    int? Dur,          // segundos (solo fin)
    string? Ref,       // referrer
    string? D,         // mobile | desktop
    int? EmpresaId);   // solo etapa registro_completado

public record AnaliticaKpisDto(
    int VisitantesUnicos,
    int Sesiones,
    int Pageviews,
    int DuracionPromedioSegundos,
    int RegistrosEmpresas,
    double ConversionPorciento,
    int DisenosCreados,
    int TarjetasEmitidas,
    int ClientesRegistrados);

public record AnaliticaFunnelPasoDto(string Etapa, string Nombre, int Visitantes);

public record AnaliticaDiaDto(string Fecha, int Visitantes, int Registros);

public record AnaliticaVisitanteDto(
    string VisitanteId,
    DateTime PrimeraVisita,
    DateTime UltimaVisita,
    int Sesiones,
    int Pageviews,
    int DuracionTotalSegundos,
    string EtapaMax,
    string? Dispositivo,
    string? Referrer,
    string? EmpresaNombre);

public record AnaliticaRegistroDto(int EmpresaId, string? Nombre, string? Email, DateTime CreatedAt, string? Plan, int Disenos, int Tarjetas);

public record AdminAnaliticaDto(
    AnaliticaKpisDto Kpis,
    List<AnaliticaFunnelPasoDto> Funnel,
    List<AnaliticaDiaDto> PorDia,
    List<AnaliticaVisitanteDto> VisitantesRecientes,
    List<AnaliticaRegistroDto> RegistrosRecientes);
