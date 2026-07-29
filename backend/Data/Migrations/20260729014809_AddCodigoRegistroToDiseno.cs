using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCodigoRegistroToDiseno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "codigo_registro",
                table: "disenos",
                type: "varchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            // Backfill: cada diseño existente necesita un código único antes de poder indexarlo como tal.
            migrationBuilder.Sql("UPDATE disenos SET codigo_registro = REPLACE(UUID(), '-', '')");

            migrationBuilder.CreateIndex(
                name: "IX_disenos_codigo_registro",
                table: "disenos",
                column: "codigo_registro",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_disenos_codigo_registro",
                table: "disenos");

            migrationBuilder.DropColumn(
                name: "codigo_registro",
                table: "disenos");
        }
    }
}
