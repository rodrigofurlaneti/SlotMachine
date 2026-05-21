using System;
using SlotMachine.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using SlotMachine.Application.Services;
using DomainSlotMachine = SlotMachine.Domain.Entities.SlotMachine;

namespace SlotMachine.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlotController : ControllerBase
    {
        private readonly ISlotAppService _appService;

        public SlotController(ISlotAppService appService)
        {
            _appService = appService;
        }

        [HttpPost("player")]
        public IActionResult CreatePlayer([FromBody] CreatePlayerRequest request)
        {
            try
            {
                var player = _appService.CreatePlayer(request.Name, request.Balance);
                return Ok(player);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Executa um giro para o jogador informado, aceitando aposta variável
        /// (R$ 0,50 a R$ 30,00). O body é opcional para compatibilidade com
        /// clientes antigos — quando não informado, usamos R$ 3,00 como antes.
        /// </summary>
        [HttpPost("spin/{playerId}")]
        public IActionResult Spin(Guid playerId, [FromBody] SpinRequestDto? request)
        {
            try
            {
                // Compatibilidade: se o cliente não enviar body, mantém o comportamento legado (R$ 3,00).
                var betAmount = request?.BetAmount ?? 3.00m;
                var result = _appService.PlaySpin(playerId, betAmount);
                return Ok(result);
            }
            catch (ArgumentOutOfRangeException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Retorna o valor atual do pote progressivo GLOBAL.
        /// O frontend chama isto no carregamento da pagina de jogo
        /// para mostrar o jackpot ja acumulado.
        /// </summary>
        [HttpGet("jackpot")]
        public IActionResult GetJackpot()
        {
            try
            {
                var pot = _appService.GetCurrentJackpot();
                return Ok(new { JackpotPot = pot });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Retorna a configuração da aposta (limites e presets sugeridos para a UI).
        /// </summary>
        [HttpGet("bet-config")]
        public IActionResult GetBetConfig()
        {
            return Ok(new
            {
                MinBetAmount = DomainSlotMachine.MinBetAmount,
                MaxBetAmount = DomainSlotMachine.MaxBetAmount,
                Presets = DomainSlotMachine.PresetBetAmounts
            });
        }

        [HttpGet("audit")]
        public IActionResult RunAudit([FromQuery] int spins = 100000)
        {
            try
            {
                var result = _appService.RunAuditSimulation(spins);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
