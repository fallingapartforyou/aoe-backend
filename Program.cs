using aoe.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ======================
// 🔥 FIX ENV CONNECTION STRING (QUAN TRỌNG NHẤT)
// ======================
var connStr =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings__DefaultConnection"];

Console.WriteLine("🔥 CONN RAW: " + connStr);
Console.WriteLine("🔥 JWT KEY: " + builder.Configuration["Jwt:Key"]);

if (string.IsNullOrEmpty(connStr))
{
    throw new Exception("❌ CONNECTION STRING IS NULL");
}

// ======================
// DATABASE (POSTGRESQL)
// ======================
builder.Services.AddDbContext<AoeDbContext>(options =>
    options.UseNpgsql(connStr, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null
        );
    })
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
// JWT AUTH
// ======================
var jwt = builder.Configuration.GetSection("Jwt");
var key = jwt["Key"];

if (string.IsNullOrEmpty(key))
{
    throw new Exception("❌ JWT KEY IS NULL");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
                    Encoding.UTF8.GetBytes(key)
                )
        };
});

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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ======================
var app = builder.Build();

// ======================
// GLOBAL ERROR
// ======================
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var error = context.Features.Get<
            Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();

        Console.WriteLine("🔥 ERROR: " + error?.Error?.ToString());

        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new
        {
            error = error?.Error?.Message
        });
    });
});

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
// 🔥 MIGRATION DEBUG (QUAN TRỌNG)
// ======================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AoeDbContext>();

    try
    {
        Console.WriteLine("🔥 START MIGRATION");

        db.Database.OpenConnection();
        Console.WriteLine("✅ DB CONNECTED");

        db.Database.Migrate();
        Console.WriteLine("✅ MIGRATION DONE");
    }
    catch (Exception ex)
    {
        Console.WriteLine("❌ MIGRATION ERROR: " + ex.ToString());
    }
}

// ======================
app.Run();