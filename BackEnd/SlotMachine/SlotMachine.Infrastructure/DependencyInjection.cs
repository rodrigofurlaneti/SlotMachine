using Microsoft.Extensions.DependencyInjection;
using SlotMachine.Domain.Interfaces;
using SlotMachine.Infrastructure.Repositories;
using SlotMachine.Infrastructure.Services;
using SlotMachine.Infrastructure.Logging; 

namespace SlotMachine.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            services.AddSingleton<IPlayerRepository, InMemoryPlayerRepository>();
            services.AddSingleton<IGlobalJackpotRepository, InMemoryGlobalJackpotRepository>();
            services.AddSingleton<IRandomGenerator, SystemRandomGenerator>();
            services.AddSingleton<IAuditLogger, FileAuditLogger>();
            return services;
        }
    }
}