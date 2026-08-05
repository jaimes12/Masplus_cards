namespace MasplusCards.Api.Dtos;

/// <summary>Mensaje entrante reportado por el bot de WhatsApp (whatsapp-bot/).</summary>
public record WhatsAppInboundRequest(string Telefono, string Texto, string? NombreContacto, string WhatsAppMessageId);

public record WhatsAppMensajeDto(int Id, string Rol, string Texto, string EstadoEnvio, DateTime CreatedAt);

public record WhatsAppConversacionDto(
    int Id, string Telefono, string? NombreContacto, string Etapa, bool IaActiva, string? Notas,
    DateTime UltimoMensajeEn, DateTime CreatedAt, string? UltimoMensajeTexto);

public record ActualizarEtapaRequest(string Etapa);

public record ActualizarNotasRequest(string? Notas);

public record ActualizarTelefonoRequest(string Telefono);

public record CrearConversacionRequest(string Telefono, string? NombreContacto);

/// <summary>Contexto editable de la IA: Contexto es la personalización guardada (null si se usa
/// el default) y ContextoDefault el texto hardcodeado, para mostrarlo y poder restaurarlo.</summary>
public record IaContextoDto(string? Contexto, string ContextoDefault);

public record ActualizarIaContextoRequest(string? Contexto);

public record ResponderManualRequest(string Texto);

public record WhatsAppBotStatusDto(bool Conectado, string? QrDataUrl);
