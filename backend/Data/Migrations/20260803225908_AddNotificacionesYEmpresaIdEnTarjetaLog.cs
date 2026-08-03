using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificacionesYEmpresaIdEnTarjetaLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "empresa_id",
                table: "tarjeta_logs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Backfill: las filas existentes se crearon antes de que TarjetaLog tuviera EmpresaId propio.
            migrationBuilder.Sql(@"
                UPDATE tarjeta_logs tl
                JOIN tarjetas t ON t.id = tl.tarjeta_id
                SET tl.empresa_id = t.empresa_id;
            ");

            migrationBuilder.CreateTable(
                name: "notificaciones",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    empresa_id = table.Column<int>(type: "int", nullable: false),
                    tipo = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    titulo = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    mensaje = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    link_view = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    leida = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificaciones", x => x.id);
                    table.ForeignKey(
                        name: "FK_notificaciones_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_tarjeta_logs_empresa_id_created_at",
                table: "tarjeta_logs",
                columns: new[] { "empresa_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_notificaciones_empresa_id_created_at",
                table: "notificaciones",
                columns: new[] { "empresa_id", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notificaciones");

            migrationBuilder.DropIndex(
                name: "IX_tarjeta_logs_empresa_id_created_at",
                table: "tarjeta_logs");

            migrationBuilder.DropColumn(
                name: "empresa_id",
                table: "tarjeta_logs");
        }
    }
}
