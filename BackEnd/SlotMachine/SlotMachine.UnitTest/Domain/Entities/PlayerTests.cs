using System;
using SlotMachine.Domain.Entities;
using Xunit;
using FluentAssertions;

namespace SlotMachine.Test.UnitTest.Domain.Entities
{
    public class PlayerTests
    {
        [Fact]
        public void CreatePlayer_WithValidData_ShouldInitializeCorrectly()
        {
            // Arrange
            string name = "Danilo";
            decimal balance = 100m;

            // Act
            var player = new Player(name, balance);

            // Assert
            player.Name.Should().Be(name);
            player.Balance.Should().Be(balance);
            player.Id.Should().NotBeEmpty();
        }

        [Fact]
        public void Debit_WithSufficientBalance_ShouldReduceBalance()
        {
            // Arrange
            var player = new Player("Danilo", 100m);
            decimal debitAmount = 30m;

            // Act
            player.Debit(debitAmount);

            // Assert
            player.Balance.Should().Be(70m);
        }

        [Fact]
        public void Debit_WithInsufficientBalance_ShouldThrowException()
        {
            // Arrange
            var player = new Player("Danilo", 10m);
            decimal debitAmount = 30m;

            // Act
            Action action = () => player.Debit(debitAmount);

            // Assert
            action.Should().Throw<Exception>()
                  .WithMessage("Saldo insuficiente.");
        }

        [Fact]
        public void Credit_ShouldIncreaseBalance()
        {
            // Arrange
            var player = new Player("Danilo", 100m);
            decimal prize = 50m;

            // Act
            player.Credit(prize);

            // Assert
            player.Balance.Should().Be(150m);
        }
    }
}