namespace MasplusCards.Api.Dtos;

/// <summary>Info pública de un diseño para la página de autorregistro (sin datos sensibles de la empresa).</summary>
public record RegistroDisenoPublicoDto(
    string EmpresaNombre,
    string? DisenoNombre,
    string Tipo,
    string? Logo,
    string? IconoSello,
    string? FondoUrl,
    string? ColorPrimario,
    string? ColorTexto,
    int SellosRequeridos,
    DateTime? Vencimiento,
    string? Descripcion);

public record RegistroClienteRequest(string Nombre, string Telefono);

public record RegistroResultDto(string CodigoQr);
