using System;
using System.Linq;
using SlotMachine.Application.DTOs;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;
using SlotMachine.Domain.Services;

namespace SlotMachine.Application.Services
{
    public class SlotAppService : ISlotAppService
    {
        private readonly IPlayerRepository _playerRepository;
        private readonly IRandomGenerator _randomGenerator;
        private readonly IAuditLogger _auditLogger; // Adicionado para conformidade
        private readonly Domain.Entities.SlotMachine _slotMachine;

        public SlotAppService(
            IPlayerRepository playerRepository,
            IRandomGenerator randomGenerator,
            IAuditLogger auditLogger) // Injeção do novo serviço de Log
        {
            _playerRepository = playerRepository;
            _randomGenerator = randomGenerator;
            _auditLogger = auditLogger;
            _slotMachine = new Domain.Entities.SlotMachine();
        }

        public PlayerDto CreatePlayer(string name, decimal initialBalance)
        {
            var player = new Player(name, initialBalance);
            _playerRepository.Save(player);

            // Log Assíncrono da criação do jogador
            _auditLogger.LogAction("PLAYER_CREATED", new
            {
                player.Id,
                player.Name,
                player.Balance,
                Timestamp = DateTime.UtcNow
            });

            return new PlayerDto(player.Id, player.Name, player.Balance);
        }

        public SpinResponseDto PlaySpin(Guid playerId, decimal betAmount)
        {
            var player = _playerRepository.GetById(playerId);
            if (player == null)
                throw new Exception("Jogador não encontrado.");

            var balanceBefore = player.Balance;

            // Realiza o giro com a aposta informada pelo cliente.
            // A validação de range (R$ 0,50 ≤ bet ≤ R$ 30,00) acontece dentro do Domain.
            var spinResult = _slotMachine.Spin(player, _randomGenerator, betAmount);

            // Persiste a mudança de saldo
            _playerRepository.Save(player);

            // Log Assíncrono detalhado para auditoria futura
            _auditLogger.LogAction("SLOT_SPIN", new
            {
                PlayerId = player.Id,
                BetAmount = spinResult.BetAmount,
                PrizeWon = spinResult.PrizeWon,
                BalanceBefore = balanceBefore,
                BalanceAfter = player.Balance,
                Matrix = spinResult.Rows.Select(row => row.Select(s => s.Face).ToArray()).ToArray(),
                IsWinner = spinResult.IsWinner,
                Timestamp = DateTime.UtcNow
            });

            return new SpinResponseDto(
                Rows: spinResult.Rows.Select(row => row.Select(s => s.Face).ToArray()).ToArray(),
                PrizeWon: spinResult.PrizeWon,
                CurrentBalance: player.Balance,
                IsWinner: spinResult.IsWinner,
                BetAmount: spinResult.BetAmount
            );
        }

        public AuditResultDto RunAuditSimulation(int numberOfSpins)
        {
            var auditor = new SlotAuditor();

            // Auditoria técnica em memória
            auditor.RunSimulation(_slotMachine, _randomGenerator, numberOfSpins);

            var result = new AuditResultDto(
                TotalSpins: auditor.TotalSpins,
                ExpectedRTP: Math.Round(auditor.CalculateRTP(), 2),
                HouseEdge: Math.Round(auditor.CalculateHouseEdge(), 2)
            );

            // Log da simulação de auditoria
            _auditLogger.LogAction("AUDIT_SIMULATION_RUN", new
            {
                Spins = numberOfSpins,
                result.ExpectedRTP,
                result.HouseEdge
            });

            return result;
        }
    }
}