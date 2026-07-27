using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet<T> se agregarán aquí conforme se defina el esquema de la base de datos.
}
