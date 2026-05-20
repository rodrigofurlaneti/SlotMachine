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
        public void Spin_WhenAllSymbolsAreTiger_ShouldPayAll10Lines()
        {
            // Arrange — peso 0 cai no primeiro símbolo (🐯, multiplicador 2x).
            // Em um grid 4x4 totalmente preenchido com 🐯, todas as 10 linhas pagantes
            // (4 horizontais + 4 verticais + 2 diagonais) vencem.
            var player = new Player("Vencedor", 50m);
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0);

            // Act
            var result = _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert
            // Aposta: 3.00 · 🐯 x2.0 → 6.00 por linha pagante
            // 10 linhas pagantes (4H + 4V + 2 diagonais) = 60.00
            result.PrizeWon.Should().Be(60m);
            result.BetAmount.Should().Be(3.00m);
            player.Balance.Should().Be(107m); // 50 - 3 + 60
            result.Rows.Should().HaveCount(4);
            result.Rows[0].Should().HaveCount(4);
        }

        [Fact]
        public void Spin_WhenAllTiger_WithDifferentBet_ShouldScalePrizeProportionally()
        {
            // Arrange
            var player = new Player("Vencedor", 200m);
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0);

            // Act – aposta R$ 5,00
            var result = _slotMachine.Spin(player, _rngMock, 5.00m);

            // Assert – prêmio escala: 5.00 * 2.0 = 10.00 por linha · 10 linhas = 100.00
            result.PrizeWon.Should().Be(100m);
            result.BetAmount.Should().Be(5.00m);
            player.Balance.Should().Be(295m); // 200 - 5 + 100
        }

        [Fact]
        public void Spin_WhenOnlyMainDiagonalMatches_ShouldPayOnlyThatLine()
        {
            // Arrange — 16 sorteios para um grid 4x4.
            // Diagonal principal: (0,0), (1,1), (2,2), (3,3) → índices lineares 0, 5, 10, 15.
            // Demais posições devem retornar 🎋 (peso >= 72 cai no bambu).
            // Importante: as colunas 0 e 3 NÃO podem ter 4 símbolos iguais; usando 🎋 nas
            // outras posições garante que apenas a diagonal vence (🎋 não paga porque mult=0,
            // mesmo se alinhasse, e aqui ele nem alinha sozinho na coluna 0 por ex.).
            //
            // Posições no array sorteado em ordem:
            //   row0: 0,1,2,3   row1: 4,5,6,7   row2: 8,9,10,11   row3: 12,13,14,15
            // Diagonal principal ocupa: 0, 5, 10, 15
            var player = new Player("Sortudo", 50m);
            var sequence = new int[16];
            for (int i = 0; i < 16; i++) sequence[i] = 72; // bambu por default
            sequence[0] = 0;
            sequence[5] = 0;
            sequence[10] = 0;
            sequence[15] = 0;

            var callCount = 0;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>())
                .Returns(_ => sequence[callCount++]);

            // Act
            var result = _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert
            // Apenas a diagonal principal de tigres venceu → 1 linha pagante = 6.00
            result.PrizeWon.Should().Be(6m);
            player.Balance.Should().Be(53m); // 50 - 3 + 6
        }

        [Fact]
        public void Spin_WhenSingleHorizontalRowMatches_ShouldPayOnlyThatRow()
        {
            // Arrange — só a linha 0 com tigres, restante 🎋
            var player = new Player("Sortudo", 50m);
            var sequence = new int[16];
            for (int i = 0; i < 16; i++) sequence[i] = 72;
            sequence[0] = 0;
            sequence[1] = 0;
            sequence[2] = 0;
            sequence[3] = 0;

            var callCount = 0;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>())
                .Returns(_ => sequence[callCount++]);

            // Act
            var result = _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert — apenas 1 linha horizontal venceu
            result.PrizeWon.Should().Be(6m);
        }

        [Fact]
        public void Spin_WhenSingleVerticalColumnMatches_ShouldPayOnlyThatColumn()
        {
            // Arrange — só a coluna 0 com tigres
            var player = new Player("Sortudo", 50m);
            var sequence = new int[16];
            for (int i = 0; i < 16; i++) sequence[i] = 72;
            sequence[0] = 0;
            sequence[4] = 0;
            sequence[8] = 0;
            sequence[12] = 0;

            var callCount = 0;
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>())
                .Returns(_ => sequence[callCount++]);

            // Act
            var result = _slotMachine.Spin(player, _rngMock, 3.00m);

            // Assert — apenas 1 coluna venceu
            result.PrizeWon.Should().Be(6m);
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
            var player = new Player("Teste", 1000m);
            Action action = () => _slotMachine.Spin(player, _rngMock, bet);
            action.Should().Throw<ArgumentOutOfRangeException>();
        }

        [Fact]
        public void Spin_WithFractionalCents_ShouldThrow()
        {
            var player = new Player("Teste", 1000m);
            Action action = () => _slotMachine.Spin(player, _rngMock, 1.005m);
            action.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void ValidateBet_ShouldAcceptBoundaryValues()
        {
            FluentActions.Invoking(() => SlotMachine.Domain.Entities.SlotMachine.ValidateBet(0.50m))
                .Should().NotThrow();
            FluentActions.Invoking(() => SlotMachine.Domain.Entities.SlotMachine.ValidateBet(30.00m))
                .Should().NotThrow();
        }

        [Fact]
        public void GridSize_ShouldBe4()
        {
            SlotMachine.Domain.Entities.SlotMachine.GridSize.Should().Be(4);
        }
    }
}
