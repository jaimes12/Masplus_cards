namespace MasplusCards.Api.Models;

/// <summary>Un mensaje individual dentro de una WhatsAppConversacion.</summary>
public class WhatsAppMensaje
{
    public int Id { get; set; }
    public int ConversacionId { get; set; }

    /// <summary>"cliente" | "ia" | "admin".</summary>
    public string Rol { get; set; } = string.Empty;

    public string Texto { get; set; } = string.Empty;

    /// <summary>ID de mensaje de WhatsApp (solo en mensajes de rol "cliente"), usado para
    /// deduplicar reintentos de Baileys tras una reconexión — Baileys puede reenviar el mismo
    /// evento "messages.upsert" más de una vez.</summary>
    public string? WhatsAppMessageId { get; set; }

    /// <summary>Solo aplica a mensajes salientes (ia/admin): "enviado" | "fallido" | "n/a".</summary>
    public string EstadoEnvio { get; set; } = "n/a";

    public DateTime CreatedAt { get; set; }

    public WhatsAppConversacion? Conversacion { get; set; }
}
