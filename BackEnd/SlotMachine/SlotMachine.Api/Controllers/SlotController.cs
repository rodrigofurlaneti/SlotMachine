using System;
using SlotMachine.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using SlotMachine.Application.Services;

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

        [HttpPost("spin/{playerId}")]
        public IActionResult Spin(Guid playerId)
        {
            try
            {
                var result = _appService.PlaySpin(playerId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
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