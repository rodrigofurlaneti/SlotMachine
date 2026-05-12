namespace SlotMachine.Domain.Entities
{
    public class Player
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public decimal Balance { get; private set; }

        public Player(string name, decimal initialBalance)
        {
            Id = Guid.NewGuid();
            Name = name;
            Balance = initialBalance;
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
    }
}