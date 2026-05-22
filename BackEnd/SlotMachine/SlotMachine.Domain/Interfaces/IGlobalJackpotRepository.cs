namespace SlotMachine.Domain.Interfaces
{
    /// <summary>
    /// Repositório do pote de jackpot GLOBAL, compartilhado entre todos os jogadores.
    /// Cada aposta contribui 1% para este pote. O primeiro jogador a alinhar
    /// 4 símbolos de jackpot ganha o pote inteiro, que então reinicia do zero.
    /// </summary>
    public interface IGlobalJackpotRepository
    {
        /// <summary>Retorna o valor atual do pote global.</summary>
        decimal GetPot();

        /// <summary>Adiciona <paramref name="amount"/> ao pote global (thread-safe).</summary>
        void AddContribution(decimal amount);

        /// <summary>
        /// Drena o pote global: retorna o valor acumulado e zera o pote.
        /// Thread-safe — apenas um vencedor pode reivindicar por vez.
        /// </summary>
        decimal ClaimPot();
    }
}
