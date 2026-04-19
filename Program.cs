using aoe.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ======================
// DEBUG LOG (RẤT QUAN TRỌNG)
// ======================
Console.WriteLine("CONN: " +
    builder.Configuration.GetConnectionString("DefaultConnection"));

Console.WriteLine("JWT KEY: " +
    builder.Configuration["Jwt:Key"]);


// ======================
// DATABASE (PostgreSQL)
// ======================
builder.Services.AddDbContext<AoeDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);


// ======================
// CONTROLLERS
// ======================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
    );


// ======================
// JWT AUTH (FIX CHUẨN)
// ======================
var jwt = builder.Configuration.GetSection("Jwt");
var key = jwt["Key"];

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(key!)
                )
        };
});


// ======================
// AUTHORIZATION
// ======================
builder.Services.AddAuthorization();


// ======================
// CORS
// ======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
            .WithOrigins(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "https://aoe-frontend.onrender.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
});


// ======================
// SWAGGER
// ======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// ======================
// BUILD APP
// ======================
var app = builder.Build();


// ======================
// MIDDLEWARE
// ======================
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


// ======================
// AUTO MIGRATE DATABASE (SAFE)
// ======================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AoeDbContext>();

    try
    {
        db.Database.Migrate();
        Console.WriteLine("Database migrated successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine("Migration error: " + ex.Message);
    }
}


// ======================
app.Run();