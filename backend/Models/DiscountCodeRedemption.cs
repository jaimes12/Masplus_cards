namespace MasplusCards.Api.Models;

/// <summary>Registro de que una empresa ya usó un código de descuento (evita reuso del mismo código).</summary>
public class DiscountCodeRedemption
{
    public int Id { get; set; }
    public int DiscountCodeId { get; set; }
    public int EmpresaId { get; set; }
    public DateTime CreatedAt { get; set; }

    public DiscountCode? DiscountCode { get; set; }
    public Empresa? Empresa { get; set; }
}
