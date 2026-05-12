using Microsoft.Extensions.DependencyInjection;
using SlotMachine.Domain.Interfaces;
using SlotMachine.Infrastructure.Repositories;
using SlotMachine.Infrastructure.Services;
using SlotMachine.Infrastructure;

namespace SlotMachine.Test.UnitTest.Infrastructure
{
    public class InfrastructureDependencyInjectionTests
    {
        [Fact]
        public void AddInfrastructure_ShouldRegisterRequiredServices()
        {
            // Arrange
            var services = new ServiceCollection();

            // Act
            services.AddInfrastructure();
            var serviceProvider = services.BuildServiceProvider();

            // Assert - Verificamos se o Repositório foi registrado
            var repository = serviceProvider.GetService<IPlayerRepository>();
            repository.Should().NotBeNull();
            repository.Should().BeOfType<InMemoryPlayerRepository>();

            // Assert - Verificamos se o Gerador Random foi registrado
            var generator = serviceProvider.GetService<IRandomGenerator>();
            generator.Should().NotBeNull();
            generator.Should().BeOfType<SystemRandomGenerator>();
        }

        [Fact]
        public void Services_ShouldBeRegisteredAsSingleton()
        {
            // Arrange
            var services = new ServiceCollection();
            services.AddInfrastructure();
            var serviceProvider = services.BuildServiceProvider();

            // Act - Pedimos a mesma instância duas vezes
            var repo1 = serviceProvider.GetService<IPlayerRepository>();
            var repo2 = serviceProvider.GetService<IPlayerRepository>();

            // Assert
            // Para o repositório em memória, PRECISA ser a mesma instância (Singleton)
            // caso contrário, os dados seriam perdidos entre requisições.
            repo1.Should().BeSameAs(repo2);
        }
    }
}