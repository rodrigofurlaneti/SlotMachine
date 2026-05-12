using System;
using System.Collections.Concurrent;
using SlotMachine.Domain.Entities;
using SlotMachine.Domain.Interfaces;

namespace SlotMachine.Infrastructure.Repositories
{
    public class InMemoryPlayerRepository : IPlayerRepository
    {
        private static readonly ConcurrentDictionary<Guid, Player> _database = new();

        public Player GetById(Guid id)
        {
            _database.TryGetValue(id, out var player);
            return player;
        }

        public void Save(Player player)
        {
            _database[player.Id] = player;
        }
    }
}