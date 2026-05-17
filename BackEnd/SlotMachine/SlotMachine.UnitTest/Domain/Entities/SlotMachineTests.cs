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
            var player = new Player("Vencedor", 50m);
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0); // Cai na Cereja 🍒 em todas as 9 posições

            // Act
            var result = _slotMachine.Spin(player, _rngMock);

            // Assert
            // Aposta fixa: 3.00
            // Cereja multiplicador: 2.0x → 3.00 * 2.0 = 6.00 por linha pagante
            // 5 linhas pagantes (3 horizontais + 2 diagonais) com 🍒🍒🍒 = 5 * 6.00 = 30.00
            result.PrizeWon.Should().Be(30m);
            player.Balance.Should().Be(77m); // 50 - 3 (aposta) + 30 (prêmio) = 77
        }

        [Fact]
        public void Spin_WhenOnlyMainDiagonalMatches_ShouldPayOnlyThatLine()
        {
            // Arrange
            // Vamos forçar o RNG a alternar entre Cereja (0) e Vazio (132 - 60 = 72) para
            // garantir que só a diagonal principal (posições [0,0], [1,1], [2,2]) seja 🍒.
            // Posições no grid sorteadas em ordem: row1=[0,1,2], row2=[0,1,2], row3=[0,1,2]
            // Diagonal principal: row1[0], row2[1], row3[2] → posições 0, 4, 8
            // Resto deve ser ❌ pra não fechar outras linhas.

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
            var result = _slotMachine.Spin(player, _rngMock);

            // Assert
            // Apenas a diagonal principal venceu → 1 linha pagante de Cereja = 6.00
            result.PrizeWon.Should().Be(6m);
            player.Balance.Should().Be(53m); // 50 - 3 + 6 = 53
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