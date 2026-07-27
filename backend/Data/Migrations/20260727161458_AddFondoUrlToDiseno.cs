using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFondoUrlToDiseno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "fondo_url",
                table: "disenos",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fondo_url",
                table: "disenos");
        }
    }
}
