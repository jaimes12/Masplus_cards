namespace MasplusCards.Api.Models;

public class Admin
{
    public int Id { get; set; }
    public string? Nombre { get; set; }
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<Template> Templates { get; set; } = new();
}
