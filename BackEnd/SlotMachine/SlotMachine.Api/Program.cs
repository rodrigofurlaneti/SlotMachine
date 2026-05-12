using Scalar.AspNetCore;
using SlotMachine.Application;
using SlotMachine.Infrastructure;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddInfrastructure();
builder.Services.AddApplication();
var app = builder.Build();
app.MapOpenApi();   
app.MapScalarApiReference(); 
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
public partial class Program { }