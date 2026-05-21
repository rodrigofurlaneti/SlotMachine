namespace SlotMachine.Domain.Entities
{
    public class Player
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public decimal Balance { get; private set; }

        /// <summary>
        /// Pote progressivo pessoal do jogador. Cresce 1% de cada aposta
        /// e eh pago integralmente quando o jogador alinha uma linha de
        /// 4 dragoes no grid 4x4.
        /// </summary>
        public decimal JackpotPot { get; private set; }

        public Player(string name, decimal initialBalance)
        {
            Id = Guid.NewGuid();
            Name = name;
            Balance = initialBalance;
            JackpotPot = 0m;
        }

        // Método para Aposta
        public void Debit(decimal amount)
        {
            if (amount > Balance) throw new Exception("Saldo insuficiente.");
            Balance -= amount;
        }

        // Método para Prêmio
        public void Credit(decimal amount)
        {
            Balance += amount;
        }

        /// <summary>Adiciona valor ao pote progressivo.</summary>
        public void ContributeJackpot(decimal amount)
        {
            if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount));
            JackpotPot += amount;
        }

        /// <summary>Drena o pote (retorna o valor e zera).</summary>
        public decimal ClaimJackpot()
        {
            var won = JackpotPot;
            JackpotPot = 0m;
            return won;
        }
    }
}
