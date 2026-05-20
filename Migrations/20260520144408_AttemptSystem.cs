using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aoe.Migrations
{
    /// <inheritdoc />
    public partial class AttemptSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ResultId",
                table: "student_answers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "attempt_number",
                table: "results",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "time_spent_seconds",
                table: "results",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResultId",
                table: "student_answers");

            migrationBuilder.DropColumn(
                name: "attempt_number",
                table: "results");

            migrationBuilder.DropColumn(
                name: "time_spent_seconds",
                table: "results");
        }
    }
}
