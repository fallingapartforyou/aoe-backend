using aoe.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AoeDbContext _context;

        public AdminController(AoeDbContext context)
        {
            _context = context;
        }

        // =====================================
        // DASHBOARD STATISTICS
        // =====================================

        [HttpGet("dashboard")]
        public IActionResult Dashboard()
        {
            var totalUsers =
                _context.Users.Count();

            var totalTeachers =
                _context.Users.Count(x =>
                    x.Role == "teacher");

            var totalStudents =
                _context.Users.Count(x =>
                    x.Role == "student");

            var totalClasses =
                _context.Classes.Count();

            var totalAssignments =
                _context.Assignments.Count();

            var totalResults =
                _context.Results.Count();

            var suspiciousResults =
                _context.Results.Count(x =>
                    x.Suspicious);

            var averageScore =
                _context.Results.Any()
                ?
                Math.Round(
                    _context.Results.Average(x =>
                        x.Score),
                    2
                )
                :
                0;

            return Ok(new
            {
                totalUsers,
                totalTeachers,
                totalStudents,
                totalClasses,
                totalAssignments,
                totalResults,
                suspiciousResults,
                averageScore
            });
        }

        // =====================================
        // GET USERS
        // =====================================

        [HttpGet("users")]
        public IActionResult GetUsers(
            string? keyword = null,
            string? role = null)
        {
            var query =
                _context.Users.AsQueryable();

            // ===== SEARCH =====

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword =
                    keyword.Trim().ToLower();

                query =
                    query.Where(x =>

                        x.Name.ToLower()
                            .Contains(keyword)

                        ||

                        x.Email.ToLower()
                            .Contains(keyword)
                    );
            }

            // ===== ROLE FILTER =====

            if (!string.IsNullOrWhiteSpace(role))
            {
                role =
                    role.Trim().ToLower();

                query =
                    query.Where(x =>
                        x.Role == role);
            }

            var users =
                query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Email,
                    x.Phone,
                    x.Password,
                    x.Role,
                    x.CreatedAt,
                    x.IsBanned,
                    x.LastLoginAt
                })
                .ToList();

            return Ok(users);
        }

        // =====================================
        // CREATE USER
        // =====================================

        [HttpPost("create-user")]
        public IActionResult CreateUser(
            [FromBody] User dto)
        {
            if (dto == null)
                return BadRequest(
                    "Invalid request");

            dto.Name =
                dto.Name?.Trim();

            dto.Email =
                dto.Email?.Trim()
                    .ToLower();

            dto.Phone =
                dto.Phone?.Trim();

            dto.Password =
                dto.Password?.Trim();

            dto.Role =
                dto.Role?.Trim()
                    .ToLower();

            if (dto.Role == "admin")
            {
                return BadRequest(
                    "Cannot create admin"
                );
            }

            if (_context.Users.Any(x =>
                x.Email == dto.Email))
            {
                return BadRequest(
                    "Email already exists");
            }

            if (_context.Users.Any(x =>
                x.Phone == dto.Phone))
            {
                return BadRequest(
                    "Phone already exists");
            }

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Password = dto.Password,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            _context.SaveChanges();

            return Ok(new
            {
                message =
                    "User created successfully"
            });
        }

        // =====================================
        // DELETE USER
        // =====================================

        [HttpDelete("delete-user/{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user =
                _context.Users
                    .FirstOrDefault(x =>
                        x.Id == id);

            if (user == null)
            {
                return NotFound(
                    "User not found");
            }

            // ===== PREVENT DELETE ADMIN =====

            if (user.Role == "admin")
            {
                return BadRequest(
                    "Cannot delete admin");
            }

            var hasData =

    _context.Results.Any(x =>
        x.StudentId == user.Id)

    ||

    _context.Classes.Any(x =>
        x.TeacherId == user.Id)

    ||

    _context.StudentAnswers.Any(x =>
        x.StudentId == user.Id);

            if (hasData)
            {
                return BadRequest(
                    "Cannot delete user with existing activity"
                );
            }

            _context.Users.Remove(user);

            _context.SaveChanges();

            return Ok(new
            {
                message =
                    "User deleted successfully"
            });
        }

// =====================================
// BAN USER
// =====================================

[HttpPut("ban/{id}")]
public IActionResult BanUser(int id)
        {
            var user =
                _context.Users
                    .FirstOrDefault(x =>
                        x.Id == id);

            if (user == null)
            {
                return NotFound(
                    "User not found");
            }

            if (user.Role == "admin")
            {
                return BadRequest(
                    "Cannot ban admin");
            }

            user.IsBanned = true;

            _context.SaveChanges();

            return Ok(new
            {
                message = "User banned"
            });
        }

        // =====================================
        // UNBAN USER
        // =====================================

        [HttpPut("unban/{id}")]
        public IActionResult UnbanUser(int id)
        {
            var user =
                _context.Users
                    .FirstOrDefault(x =>
                        x.Id == id);

            if (user == null)
            {
                return NotFound(
                    "User not found");
            }

            user.IsBanned = false;

            _context.SaveChanges();

            return Ok(new
            {
                message = "User unbanned"
            });
        }

    }
}

