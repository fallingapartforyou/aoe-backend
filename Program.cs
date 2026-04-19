using aoe.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ======================
// DEBUG LOG (RẤT QUAN TRỌNG)
// ======================
var connStr = builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine("CONN: " + connStr);
Console.WriteLine("JWT KEY: " + builder.Configuration["Jwt:Key"]);


// ======================
// DATABASE (FIX TRANSIENT + SSL)
// ======================
builder.Services.AddDbContext<AoeDbContext>(options =>
    options.UseNpgsql(connStr, npgsqlOptions =>
    {
        // 🔥 FIX lỗi transient failure
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
// JWT AUTH (CHUẨN)
// ======================
var jwt = builder.Configuration.GetSection("Jwt");
var key = jwt["Key"];

if (string.IsNullOrEmpty(key))
{
    throw new Exception("JWT KEY IS NULL ❌");
}

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
                    Encoding.UTF8.GetBytes(key)
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
// GLOBAL ERROR LOG (RẤT NÊN CÓ)
// ======================
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var error = context.Features.Get<
            Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();

        Console.WriteLine("🔥 ERROR: " + error?.Error?.Message);

        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new
        {
            error = error?.Error?.Message
        });
    });
});


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
        Console.WriteLine("Migrating database...");
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