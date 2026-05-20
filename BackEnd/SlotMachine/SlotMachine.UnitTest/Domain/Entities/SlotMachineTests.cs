using NSubstitute;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Test.UnitTest.Domain.Entities
{
    public class SlotMachineTests
    {
        private readonly IRandomGenerator _rngMock;
        private readonly SlotMachine.Domain.Entities.SlotMachine _slotMachine;

        public SlotMachineTests()
        {
            _rngMock = Substitute.For<IRandomGenerator>();
            _slotMachine = new SlotMachine.Domain.Entities.SlotMachine();
        }

        [Fact]
        public void Spin_ShouldDebitBalance_RegardlessOfResult()
        {
            // Arrange
            var player = new Player("Teste", 100m);
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0);

            // Act
            _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert
            player.Balance.Should().NotBe(100m);
        }

        [Fact]
        public void Spin_WhenPlayerWins_ShouldCreditPrizeCorrectly()
        {
            // Arrange
            var player = new Player("Vencedor", 50m);
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0); // Cai na Cereja 🍒 em todas as 9 posições

            // Act
            var result = _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert
            // Aposta: 3.00 · Cereja x2.0 → 6.00 por linha pagante
            // 5 linhas pagantes (3 horizontais + 2 diagonais) com 🍒🍒🍒 = 5 * 6.00 = 30.00
            result.PrizeWon.Should().Be(30m);
            result.BetAmount.Should().Be(3.00m);
            player.Balance.Should().Be(77m); // 50 - 3 (aposta) + 30 (prêmio) = 77
        }

        [Fact]
        public void Spin_WhenPlayerWins_WithDifferentBet_ShouldScalePrizeProportionally()
        {
            // Arrange
            var player = new Player("Vencedor", 100m);
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0);

            // Act – aposta agora R$ 5,00
            var result = _slotMachine.Spin(player, _rngMock, 5.00m);

            // Assert – prêmio escala: 5.00 * 2.0 = 10.00 por linha · 5 linhas = 50.00
            result.PrizeWon.Should().Be(50m);
            result.BetAmount.Should().Be(5.00m);
            player.Balance.Should().Be(145m); // 100 - 5 + 50
        }

        [Fact]
        public void Spin_WhenOnlyMainDiagonalMatches_ShouldPayOnlyThatLine()
        {
            // Arrange
            var player = new Player("Sortudo", 50m);
            var sequence = new[]
            {
                0,   // row1[0] = 🍒
                72,  // row1[1] = ❌
                72,  // row1[2] = ❌
                72,  // row2[0] = ❌
                0,   // row2[1] = 🍒
                72,  // row2[2] = ❌
                72,  // row3[0] = ❌
                72,  // row3[1] = ❌
                0    // row3[2] = 🍒
            };
            var callCount = 0;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>())
                .Returns(_ => sequence[callCount++]);

            // Act
            var result = _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert
            // Apenas a diagonal principal venceu → 1 linha pagante de Cereja = 6.00
            result.PrizeWon.Should().Be(6m);
            player.Balance.Should().Be(53m); // 50 - 3 + 6 = 53
        }

        [Fact]
        public void Spin_WithInsufficientBalance_ShouldThrowException()
        {
            // Arrange
            var player = new Player("Pobre", 0.50m);

            // Act
            Action action = () => _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert
            action.Should().Throw<Exception>()
                  .WithMessage("Saldo insuficiente para girar.");
        }

        [Theory]
        [InlineData(0.49)]
        [InlineData(30.01)]
        [InlineData(0)]
        [InlineData(-1)]
        public void Spin_WithBetOutOfRange_ShouldThrowArgumentOutOfRange(decimal bet)
        {
            // Arrange
            var player = new Player("Teste", 1000m);

            // Act
            Action action = () => _slotMachine.Spin(player, _rngMock, bet);

            // Assert
            action.Should().Throw<ArgumentOutOfRangeException>();
        }

        [Fact]
        public void Spin_WithFractionalCents_ShouldThrow()
        {
            // Arrange
            var player = new Player("Teste", 1000m);

            // Act
            Action action = () => _slotMachine.Spin(player, _rngMock, 1.005m);

            // Assert
            action.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void ValidateBet_ShouldAcceptBoundaryValues()
        {
            // 0.50 e 30.00 são os extremos válidos
            FluentActions.Invoking(() => SlotMachine.Domain.Entities.SlotMachine.ValidateBet(0.50m))
                .Should().NotThrow();
            FluentActions.Invoking(() => SlotMachine.Domain.Entities.SlotMachine.ValidateBet(30.00m))
                .Should().NotThrow();
        }
    }
}
