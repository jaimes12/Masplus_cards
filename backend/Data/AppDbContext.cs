using Microsoft.EntityFrameworkCore;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;

namespace MasplusCards.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Empresa> Empresas => Set<Empresa>();
    public DbSet<Template> Templates => Set<Template>();
    public DbSet<Diseno> Disenos => Set<Diseno>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Tarjeta> Tarjetas => Set<Tarjeta>();
    public DbSet<TarjetaLog> TarjetaLogs => Set<TarjetaLog>();
    public DbSet<PassRegistration> PassRegistrations => Set<PassRegistration>();

    public override int SaveChanges()
    {
        StampTimestamps();
        return base.SaveChanges();
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        StampTimestamps();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        StampTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        StampTimestamps();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void StampTimestamps()
    {
        var now = MexicoCityTime.Now();

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified)) continue;

            if (entry.State == EntityState.Added)
            {
                var created = entry.Properties.FirstOrDefault(p =>
                    p.Metadata.Name == "CreatedAt" && p.Metadata.ClrType == typeof(DateTime));
                if (created != null && created.CurrentValue is DateTime dt && dt == default)
                    created.CurrentValue = now;
            }

            var updated = entry.Properties.FirstOrDefault(p =>
                p.Metadata.Name == "UpdatedAt" && p.Metadata.ClrType == typeof(DateTime));
            if (updated != null)
                updated.CurrentValue = now;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Admin>(e =>
        {
            e.ToTable("admins");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(100);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
            e.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Empresa>(e =>
        {
            e.ToTable("empresas");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(150);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
            e.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255);
            e.Property(x => x.Telefono).HasColumnName("telefono").HasMaxLength(20);
            e.Property(x => x.Logo).HasColumnName("logo").HasMaxLength(255);
            e.Property(x => x.DisenoActivoId).HasColumnName("diseno_activo_id");
            e.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(20);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasIndex(x => x.Email).IsUnique();

            e.HasOne(x => x.DisenoActivo)
                .WithMany()
                .HasForeignKey(x => x.DisenoActivoId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Template>(e =>
        {
            e.ToTable("templates");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.AdminId).HasColumnName("admin_id");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(100);
            e.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(500);
            e.Property(x => x.PreviewImg).HasColumnName("preview_img").HasMaxLength(255);
            e.Property(x => x.TipoRecompensa).HasColumnName("tipo_recompensa").HasMaxLength(20);
            e.Property(x => x.Estructura).HasColumnName("estructura").HasColumnType("json");
            e.Property(x => x.Activo).HasColumnName("activo");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Admin)
                .WithMany(x => x.Templates)
                .HasForeignKey(x => x.AdminId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Diseno>(e =>
        {
            e.ToTable("disenos");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.EmpresaId).HasColumnName("empresa_id");
            e.Property(x => x.TemplateId).HasColumnName("template_id");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(100);
            e.Property(x => x.Tipo).HasColumnName("tipo").HasMaxLength(20);
            e.Property(x => x.Logo).HasColumnName("logo").HasMaxLength(255);
            e.Property(x => x.ColorPrimario).HasColumnName("color_primario").HasMaxLength(20);
            e.Property(x => x.ColorSecundario).HasColumnName("color_secundario").HasMaxLength(20);
            e.Property(x => x.ColorTexto).HasColumnName("color_texto").HasMaxLength(20);
            e.Property(x => x.IconoSello).HasColumnName("icono_sello").HasMaxLength(255);
            e.Property(x => x.FondoUrl).HasColumnName("fondo_url").HasMaxLength(255);
            e.Property(x => x.SellosRequeridos).HasColumnName("sellos_requeridos");
            e.Property(x => x.Vencimiento).HasColumnName("vencimiento");
            e.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(500);
            e.Property(x => x.Configuracion).HasColumnName("configuracion").HasColumnType("json");
            e.Property(x => x.Activo).HasColumnName("activo");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            e.HasOne(x => x.Empresa)
                .WithMany(x => x.Disenos)
                .HasForeignKey(x => x.EmpresaId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Template)
                .WithMany(x => x.Disenos)
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("clientes");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.EmpresaId).HasColumnName("empresa_id");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(150);
            e.Property(x => x.Telefono).HasColumnName("telefono").HasMaxLength(20).IsRequired();
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(150);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasIndex(x => new { x.EmpresaId, x.Telefono }).IsUnique();

            e.HasOne(x => x.Empresa)
                .WithMany(x => x.Clientes)
                .HasForeignKey(x => x.EmpresaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Tarjeta>(e =>
        {
            e.ToTable("tarjetas");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ClienteId).HasColumnName("cliente_id");
            e.Property(x => x.EmpresaId).HasColumnName("empresa_id");
            e.Property(x => x.DisenoId).HasColumnName("diseno_id");
            e.Property(x => x.SellosActuales).HasColumnName("sellos_actuales");
            e.Property(x => x.PremiosCanjeados).HasColumnName("premios_canjeados");
            e.Property(x => x.CuponRedimido).HasColumnName("cupon_redimido");
            e.Property(x => x.CodigoQr).HasColumnName("codigo_qr").HasMaxLength(255).IsRequired();
            e.Property(x => x.WalletTipo).HasColumnName("wallet_tipo").HasMaxLength(20);
            e.Property(x => x.AppleSerialNumber).HasColumnName("apple_serial_number").HasMaxLength(100);
            e.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(20);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            e.HasIndex(x => x.CodigoQr).IsUnique();

            e.HasOne(x => x.Cliente)
                .WithMany(x => x.Tarjetas)
                .HasForeignKey(x => x.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Empresa)
                .WithMany(x => x.Tarjetas)
                .HasForeignKey(x => x.EmpresaId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Diseno)
                .WithMany(x => x.Tarjetas)
                .HasForeignKey(x => x.DisenoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TarjetaLog>(e =>
        {
            e.ToTable("tarjeta_logs");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TarjetaId).HasColumnName("tarjeta_id");
            e.Property(x => x.Accion).HasColumnName("accion").HasMaxLength(50).IsRequired();
            e.Property(x => x.SellosAgregados).HasColumnName("sellos_agregados");
            e.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(500);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Tarjeta)
                .WithMany(x => x.Logs)
                .HasForeignKey(x => x.TarjetaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PassRegistration>(e =>
        {
            e.ToTable("pass_registrations");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TarjetaId).HasColumnName("tarjeta_id");
            e.Property(x => x.DeviceLibraryIdentifier).HasColumnName("device_library_identifier").HasMaxLength(100).IsRequired();
            e.Property(x => x.PushToken).HasColumnName("push_token").HasMaxLength(255).IsRequired();
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasIndex(x => new { x.DeviceLibraryIdentifier, x.TarjetaId }).IsUnique();

            e.HasOne(x => x.Tarjeta)
                .WithMany(x => x.PassRegistrations)
                .HasForeignKey(x => x.TarjetaId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
