using Microsoft.Extensions.DependencyInjection;
using SlotMachine.Application.Services;

namespace SlotMachine.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<ISlotAppService, SlotAppService>();
            return services;
        }
    }
}