using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanesYSuscripcion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "plan_id",
                table: "empresas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "plan_renueva_el",
                table: "empresas",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "planes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    nombre = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    descripcion = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    precio_mensual = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    limite_disenos = table.Column<int>(type: "int", nullable: true),
                    limite_tarjetas = table.Column<int>(type: "int", nullable: true),
                    caracteristicas = table.Column<string>(type: "json", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    destacado = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    orden = table.Column<int>(type: "int", nullable: false),
                    activo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_planes", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "planes",
                columns: new[] { "id", "nombre", "descripcion", "precio_mensual", "limite_disenos", "limite_tarjetas", "caracteristicas", "destacado", "orden", "activo", "created_at" },
                values: new object[,]
                {
                    {
                        1, "Starter", "Para arrancar tu primer programa de lealtad.", 349m, 1, 150,
                        "[\"Hasta 150 tarjetas activas\",\"1 diseño de tarjeta\",\"Clientes ilimitados\",\"Sellos por escaneo de QR\",\"Actualización automática en Apple Wallet\",\"Soporte por correo\"]",
                        false, 1, true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                    },
                    {
                        2, "Crece", "Cuando ya tienes clientes recurrentes.", 549m, null, 750,
                        "[\"Hasta 750 tarjetas activas\",\"Diseños de tarjeta ilimitados\",\"Todo lo de Starter\",\"Historial de sellos y premios por cliente\",\"Soporte prioritario\"]",
                        true, 2, true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                    },
                    {
                        3, "Ilimitado", "Para negocios con varios puntos de atención.", 899m, null, null,
                        "[\"Tarjetas ilimitadas\",\"Diseños ilimitados\",\"Todo lo de Crece\",\"Usuarios ilimitados del panel\",\"Onboarding personalizado\",\"Soporte prioritario 24/7\"]",
                        false, 3, true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                    },
                });

            migrationBuilder.CreateIndex(
                name: "IX_empresas_plan_id",
                table: "empresas",
                column: "plan_id");

            migrationBuilder.AddForeignKey(
                name: "FK_empresas_planes_plan_id",
                table: "empresas",
                column: "plan_id",
                principalTable: "planes",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_empresas_planes_plan_id",
                table: "empresas");

            migrationBuilder.DropTable(
                name: "planes");

            migrationBuilder.DropIndex(
                name: "IX_empresas_plan_id",
                table: "empresas");

            migrationBuilder.DropColumn(
                name: "plan_id",
                table: "empresas");

            migrationBuilder.DropColumn(
                name: "plan_renueva_el",
                table: "empresas");
        }
    }
}
