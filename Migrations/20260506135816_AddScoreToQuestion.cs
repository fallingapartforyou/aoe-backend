using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aoe.Migrations
{
    public partial class AddScoreToQuestion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "score",
                table: "questions",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "score",
                table: "questions");
        }
    }
}