import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createPlayer } from "../api/slot";
import { usePlayerStore } from "../store/playerStore";
import { formatBRL } from "../utils/format";
import { SYMBOLS } from "../utils/symbols";

export function HomePage() {
  const navigate = useNavigate();
  const player = usePlayerStore((s) => s.player);
  const setPlayer = usePlayerStore((s) => s.setPlayer);
  const reset = usePlayerStore((s) => s.reset);

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("100");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    const trimmed = name.trim();
    const initial = Number(balance);
    if (!trimmed) return toast.error("Informe seu nome para começar.");
    if (!Number.isFinite(initial) || initial <= 0)
      return toast.error("Saldo inicial deve ser maior que zero.");

    setLoading(true);
    try {
      const p = await createPlayer({ name: trimmed, balance: initial });
      setPlayer(p);
      toast.success(`Bem-vindo, ${p.name}!`);
      navigate("/game");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar jogador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="text-7xl mb-3">🎰</div>
        <h1 className="text-display text-4xl sm:text-5xl gold-text">LUCKY SPIN</h1>
        <p className="text-neutral-400 mt-2">
          Caça-níquel 3x3 com regras vindas direto da nossa API .NET.
        </p>
      </motion.div>

      {player ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-casino-panel border border-casino-gold/30 rounded-2xl p-6"
        >
          <div className="text-sm text-neutral-400">Continuando como</div>
          <div className="text-2xl font-bold mb-1">{player.name}</div>
          <div className="text-casino-gold text-xl tabular-nums mb-4">{formatBRL(player.balance)}</div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/game")}
              className="flex-1 px-4 py-3 rounded-lg bg-casino-gold text-black font-semibold hover:brightness-110"
            >
              Continuar jogando
            </button>
            <button
              onClick={() => reset()}
              className="px-4 py-3 rounded-lg border border-white/10 text-neutral-300 hover:bg-white/5"
            >
              Trocar jogador
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-casino-panel border border-casino-gold/30 rounded-2xl p-6"
        >
          <label className="block text-sm text-neutral-300 mb-1">Seu nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Rodrigo"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 mb-4 outline-none focus:border-casino-gold"
          />
          <label className="block text-sm text-neutral-300 mb-1">Saldo inicial (R$)</label>
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 mb-4 outline-none focus:border-casino-gold tabular-nums"
          />
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-b from-casino-gold to-casino-goldDark text-black font-semibold disabled:opacity-50"
          >
            {loading ? "Conectando..." : "Começar a jogar"}
          </button>
        </motion.div>
      )}

      <div className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">Tabela de pagamentos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SYMBOLS.map((s) => (
            <div
              key={s.face}
              className="bg-casino-panel border border-white/5 rounded-lg p-3 text-center"
            >
              <div className="text-3xl">{s.face}</div>
              <div className="text-sm font-semibold mt-1" style={{ color: s.color }}>
                {s.payout > 0 ? `${s.payout}x` : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-3">
          Aposta fixa: R$ 3,00 por giro · 3 linhas · pagamento = aposta × multiplicador (3 iguais por linha).
        </p>
      </div>
    </div>
  );
}
