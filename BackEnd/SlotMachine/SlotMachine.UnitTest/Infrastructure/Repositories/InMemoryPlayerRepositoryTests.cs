using SlotMachine.Domain.Entities;
using SlotMachine.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SlotMachine.Test.UnitTest.Infrastructure.Repositories
{
    public class InMemoryPlayerRepositoryTests
    {
        private readonly InMemoryPlayerRepository _repository;

        public InMemoryPlayerRepositoryTests()
        {
            _repository = new InMemoryPlayerRepository();
        }

        [Fact]
        public void Save_ShouldAddPlayerToDictionary()
        {
            // Arrange
            var player = new Player("Danilo", 100m);

            // Act
            _repository.Save(player);
            var savedPlayer = _repository.GetById(player.Id);

            // Assert
            savedPlayer.Should().NotBeNull();
            savedPlayer.Id.Should().Be(player.Id);
            savedPlayer.Name.Should().Be("Danilo");
        }

        [Fact]
        public void GetById_WhenPlayerDoesNotExist_ShouldReturnNull()
        {
            // Act
            var result = _repository.GetById(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public void Save_ShouldUpdateExistingPlayer()
        {
            // Arrange
            var player = new Player("Danilo", 100m);
            _repository.Save(player);

            // Act - Simulando uma vitória e atualização de saldo
            player.Credit(50m);
            _repository.Save(player);

            var updatedPlayer = _repository.GetById(player.Id);

            // Assert
            updatedPlayer.Balance.Should().Be(150m);
        }
    }
}