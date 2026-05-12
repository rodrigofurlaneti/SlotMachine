using FluentAssertions;
using NSubstitute;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;
using SlotMachine.Domain.ValueObjects;
using System;
using System.Globalization;
using TechTalk.SpecFlow;

namespace SlotMachine.Test.Specs.StepDefinitions
{
    [Binding]
    public class SlotMachineSteps
    {
        private Player _player;
        private readonly Domain.Entities.SlotMachine _slotMachine;
        private readonly IRandomGenerator _rngMock;
        private SpinResult? _lastResult;
        private Exception? _lastException;

        public SlotMachineSteps()
        {
            _slotMachine = new Domain.Entities.SlotMachine();
            _rngMock = Substitute.For<IRandomGenerator>();
        }

        [Given(@"que eu sou um jogador chamado ""(.*)""")]
        public void DadoQueEuSouUmJogadorChamado(string nome)
        {
            _player = new Player(nome, 0m);
        }

        // Usamos string nos parâmetros para garantir que o Parse manual respeite o ponto como decimal
        [Given(@"que eu possuo um saldo inicial de (.*)")]
        [Given(@"eu possuo um saldo inicial de (.*)")]
        public void DadoEuPossuoUmSaldoInicialDe(string saldoTexto)
        {
            decimal saldo = decimal.Parse(saldoTexto, CultureInfo.InvariantCulture);
            _player = new Player(_player.Name, saldo);
        }

        [Given(@"que a máquina está configurada para retornar sempre o símbolo ""(.*)""")]
        public void DadoQueAMaquinaEstaConfiguradaParaRetornarSempreOSimbolo(string simbolo)
        {
            // Forçamos o retorno 0 para o símbolo de maior peso/cereja
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(0);
        }

        [Given(@"que a máquina está configurada para retornar símbolos variados sem prêmio")]
        public void DadoQueAMaquinaEstaConfiguradaParaRetornarSimbolosVariadosSemPremio()
        {
            // Peso alto para cair no símbolo 'X' (derrota)
            _rngMock.Next(Arg.Any<int>(), Arg.Any<int>()).Returns(100);
        }

        [When(@"eu clico no botão de girar")]
        public void QuandoEuClicoNoBotaoDeGirar()
        {
            try
            {
                _lastResult = _slotMachine.Spin(_player, _rngMock);
                _lastException = null;
            }
            catch (Exception ex)
            {
                _lastException = ex;
                _lastResult = null;
            }
        }

        [Then(@"o sistema deve debitar (.*) do meu saldo")]
        public void EntaoOSistemaDeveDebitarDoMeuSaldo(string valorTexto)
        {
            decimal valorEsperado = decimal.Parse(valorTexto, CultureInfo.InvariantCulture);
            _lastResult.Should().NotBeNull("O giro deveria ter ocorrido com sucesso.");
            _lastResult!.BetAmount.Should().Be(valorEsperado);
        }

        [Then(@"o meu saldo atualizado deve ser (.*)")]
        public void EntaoOMeuSaldoAtualizadoDeveSer(string saldoTexto)
        {
            decimal saldoEsperado = decimal.Parse(saldoTexto, CultureInfo.InvariantCulture);
            _player.Balance.Should().Be(saldoEsperado);
        }

        [Then(@"o resultado deve indicar que eu sou um vencedor com prêmio de (.*)")]
        public void EntaoOResultadoDeveIndicarQueEuSouUmVencedorComPremioDe(string premioTexto)
        {
            decimal premioEsperado = decimal.Parse(premioTexto, CultureInfo.InvariantCulture);
            _lastResult.Should().NotBeNull();
            _lastResult!.PrizeWon.Should().Be(premioEsperado);
            _lastResult.IsWinner.Should().BeTrue();
        }

        [Then(@"o resultado deve indicar que eu não ganhei prêmios")]
        public void EntaoOResultadoDeveIndicarQueEuNaoGanheiPremios()
        {
            _lastResult.Should().NotBeNull();
            _lastResult!.IsWinner.Should().BeFalse();
            _lastResult.PrizeWon.Should().Be(0m);
        }

        [Then(@"o sistema deve impedir o giro")]
        public void EntaoOSistemaDeveImpedirOGiro()
        {
            _lastException.Should().NotBeNull("Uma exceção de saldo insuficiente era esperada.");
        }

        [Then(@"exibir a mensagem de erro ""(.*)""")]
        public void EntaoExibirAMensagemDeErro(string mensagemEsperada)
        {
            _lastException?.Message.Should().Be(mensagemEsperada);
        }
    }
}