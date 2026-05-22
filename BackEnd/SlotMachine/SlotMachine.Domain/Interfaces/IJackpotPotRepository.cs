namespace SlotMachine.Domain.Interfaces
{
    /// <summary>
    /// Pote progressivo GLOBAL do jackpot — compartilhado entre todos os jogadores.
    /// Cada giro contribui 1% da aposta para este pote, e quando algum jogador
    /// alinha 4 envelopes 🧧 em uma linha, ele leva o pote inteiro e ele zera.
    /// </summary>
    public interface IJackpotPotRepository
    {
        /// <summary>Valor atual acumulado do pote (R$).</summary>
        decimal GetCurrentPot();

        /// <summary>Adiciona uma contribuicao ao pote (chamado a cada giro).</summary>
        void Contribute(decimal amount);

        /// <summary>
        /// Drena o pote completamente: retorna o valor acumulado e zera.
        /// Usado quando um jogador vence o jackpot.
        /// </summary>
        decimal Claim();
    }
}
