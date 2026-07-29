using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "discount_codes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    codigo = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tipo_descuento = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    valor = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    plan_id = table.Column<int>(type: "int", nullable: true),
                    usos_maximos = table.Column<int>(type: "int", nullable: true),
                    usos_actuales = table.Column<int>(type: "int", nullable: false),
                    fecha_expiracion = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    activo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_discount_codes", x => x.id);
                    table.ForeignKey(
                        name: "FK_discount_codes_planes_plan_id",
                        column: x => x.plan_id,
                        principalTable: "planes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "discount_code_redemptions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    discount_code_id = table.Column<int>(type: "int", nullable: false),
                    empresa_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_discount_code_redemptions", x => x.id);
                    table.ForeignKey(
                        name: "FK_discount_code_redemptions_discount_codes_discount_code_id",
                        column: x => x.discount_code_id,
                        principalTable: "discount_codes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_discount_code_redemptions_empresas_empresa_id",
                        column: x => x.empresa_id,
                        principalTable: "empresas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_discount_code_redemptions_discount_code_id_empresa_id",
                table: "discount_code_redemptions",
                columns: new[] { "discount_code_id", "empresa_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_discount_code_redemptions_empresa_id",
                table: "discount_code_redemptions",
                column: "empresa_id");

            migrationBuilder.CreateIndex(
                name: "IX_discount_codes_codigo",
                table: "discount_codes",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_discount_codes_plan_id",
                table: "discount_codes",
                column: "plan_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "discount_code_redemptions");

            migrationBuilder.DropTable(
                name: "discount_codes");
        }
    }
}
