using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aoe.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherIdToAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ===== ADD COLUMN =====
            migrationBuilder.AddColumn<int>(
                name: "teacher_id",
                table: "assignments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // ===== FIX EXISTING SEED DATA =====
            // gán toàn bộ assignment cũ cho teacher id = 1
            migrationBuilder.Sql(@"
                UPDATE assignments
                SET teacher_id = 1
                WHERE teacher_id = 0
            ");

            // ===== OPTIONAL FK =====
            migrationBuilder.CreateIndex(
                name: "IX_assignments_teacher_id",
                table: "assignments",
                column: "teacher_id");

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_users_teacher_id",
                table: "assignments",
                column: "teacher_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_assignments_users_teacher_id",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_assignments_teacher_id",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "teacher_id",
                table: "assignments");
        }
    }
}