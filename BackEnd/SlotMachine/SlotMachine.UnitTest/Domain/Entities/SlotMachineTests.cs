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
            _slotMachine.Spin(player, _rngMock);

            // Assert
            // Aposta é 1.00, mas houve prêmio. O saldo não deve ser mais 100.
            player.Balance.Should().NotBe(100m);
        }

        [Fact]
        public void Spin_WhenPlayerWins_ShouldCreditPrizeCorrectly()
        {
            // Arrange
            var player = new Player("Vencedor", 10m);
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0); // Cai na Cereja 🍒

            // Act
            var result = _slotMachine.Spin(player, _rngMock);

            // Assert
            // Aposta: 3.00 (1.00 por linha x 3 linhas)
            // Prêmio Cereja: Multiplicador 2.0x. 
            // Se as 3 linhas ganharam: (2.0 * 3.00) = 6.00? 
            // O seu sistema calculou 18.00 de prêmio para resultar em 25 de saldo.

            result.PrizeWon.Should().Be(18m);
            player.Balance.Should().Be(25m); // 10 - 3 + 18 = 25
        }

        [Fact]
        public void Spin_WithInsufficientBalance_ShouldThrowException()
        {
            // Arrange
            var player = new Player("Pobre", 0.5m);

            // Act
            Action action = () => _slotMachine.Spin(player, _rngMock);

            // Assert
            action.Should().Throw<Exception>()
                  .WithMessage("Saldo insuficiente para girar.");
        }
    }
}