namespace MasplusCards.Api.Models;

/// <summary>Cliente final de una empresa (portador de tarjeta de fidelidad).</summary>
public class Cliente
{
    public int Id { get; set; }
    public int EmpresaId { get; set; }
    public string? Nombre { get; set; }
    public string Telefono { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; }

    public Empresa? Empresa { get; set; }
    public List<Tarjeta> Tarjetas { get; set; } = new();
}
