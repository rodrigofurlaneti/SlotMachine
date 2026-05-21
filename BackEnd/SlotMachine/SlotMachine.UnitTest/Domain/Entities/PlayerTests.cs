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

        [Fact]
        public void NewPlayer_ShouldHaveZeroJackpotPot()
        {
            var player = new Player("Danilo", 100m);
            player.JackpotPot.Should().Be(0m);
        }

        [Fact]
        public void ContributeJackpot_ShouldAccumulate()
        {
            var player = new Player("Danilo", 100m);
            player.ContributeJackpot(0.03m);
            player.ContributeJackpot(0.05m);
            player.JackpotPot.Should().Be(0.08m);
        }

        [Fact]
        public void ContributeJackpot_WithNegative_ShouldThrow()
        {
            var player = new Player("Danilo", 100m);
            Action action = () => player.ContributeJackpot(-1m);
            action.Should().Throw<ArgumentOutOfRangeException>();
        }

        [Fact]
        public void ClaimJackpot_ShouldReturnPotAndZeroIt()
        {
            var player = new Player("Danilo", 100m);
            player.ContributeJackpot(50m);

            var won = player.ClaimJackpot();

            won.Should().Be(50m);
            player.JackpotPot.Should().Be(0m);
        }
    }
}
