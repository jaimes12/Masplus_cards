namespace MasplusCards.Api.Models;

/// <summary>Un hilo de conversación de WhatsApp con un lead (dueño de negocio interesado).
/// No tiene relación con Empresa — estos son prospectos, no clientes registrados todavía.</summary>
public class WhatsAppConversacion
{
    public int Id { get; set; }

    /// <summary>Número en formato internacional, tal como lo entrega Baileys (sin "+").</summary>
    public string Telefono { get; set; } = string.Empty;

    /// <summary>Nombre de perfil de WhatsApp del contacto, si lo tiene.</summary>
    public string? NombreContacto { get; set; }

    /// <summary>"nuevo" | "en_platica" | "calificado" | "convertido" | "perdido".</summary>
    public string Etapa { get; set; } = "nuevo";

    /// <summary>Si es false, la IA no responde en este hilo — un admin tomó control manual.</summary>
    public bool IaActiva { get; set; } = true;

    public DateTime UltimoMensajeEn { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<WhatsAppMensaje> Mensajes { get; set; } = new();
}
