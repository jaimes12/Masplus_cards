using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoTarjetaYCupon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "cupon_redimido",
                table: "tarjetas",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "tipo",
                table: "disenos",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "sellos")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "vencimiento",
                table: "disenos",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cupon_redimido",
                table: "tarjetas");

            migrationBuilder.DropColumn(
                name: "tipo",
                table: "disenos");

            migrationBuilder.DropColumn(
                name: "vencimiento",
                table: "disenos");
        }
    }
}
