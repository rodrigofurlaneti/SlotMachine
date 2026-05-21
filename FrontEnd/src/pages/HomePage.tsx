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
    if (!trimmed) return toast.error("Informe seu nome para comecar.");
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
        <div className="text-7xl mb-3">{"\u{1F42F}"}</div>
        <h1 className="text-imperial text-4xl sm:text-5xl imperial-text">FORTUNE SPIN</h1>
        <p className="text-fortune-goldLight/80 mt-2">
          Caca-niquel 4x4 com 10 linhas pagantes e jackpot progressivo - regras direto da nossa API .NET.
        </p>
      </motion.div>

      {player ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-fortune-redDeep/60 border-2 border-fortune-gold/40 rounded-2xl p-6 shadow-imperial"
        >
          <div className="text-sm text-fortune-goldLight/70">Continuando como</div>
          <div className="text-2xl font-bold mb-1">{player.name}</div>
          <div className="text-fortune-gold text-xl tabular-nums mb-1">{formatBRL(player.balance)}</div>
          {typeof player.jackpotPot === "number" && player.jackpotPot > 0 && (
            <div className="text-xs text-fortune-jade mb-4">
              Pote de jackpot acumulado: {formatBRL(player.jackpotPot)}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate("/game")}
              className="flex-1 px-4 py-3 rounded-lg bg-fortune-gold text-black font-semibold hover:brightness-110"
            >
              Continuar jogando
            </button>
            <button
              onClick={() => reset()}
              className="px-4 py-3 rounded-lg border border-fortune-gold/30 text-fortune-goldLight hover:bg-fortune-red/20"
            >
              Trocar jogador
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-fortune-redDeep/60 border-2 border-fortune-gold/40 rounded-2xl p-6 shadow-imperial"
        >
          <label className="block text-sm text-fortune-goldLight mb-1">Seu nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Rodrigo"
            className="w-full bg-black/40 border border-fortune-gold/30 rounded-lg px-3 py-2 mb-4 outline-none focus:border-fortune-gold"
          />
          <label className="block text-sm text-fortune-goldLight mb-1">Saldo inicial (R$)</label>
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            className="w-full bg-black/40 border border-fortune-gold/30 rounded-lg px-3 py-2 mb-4 outline-none focus:border-fortune-gold tabular-nums"
          />
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-b from-fortune-gold to-fortune-goldDeep text-black font-semibold disabled:opacity-50"
          >
            {loading ? "Conectando..." : "Comecar a jogar"}
          </button>
        </motion.div>
      )}

      <div className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-fortune-goldLight/70 mb-3">
          Tabela de pagamentos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SYMBOLS.map((s) => (
            <div
              key={s.face}
              className="bg-fortune-redDeep/40 border border-fortune-gold/20 rounded-lg p-3 text-center"
            >
              <div className="text-3xl">{s.face}</div>
              <div className="text-sm font-semibold mt-1" style={{ color: s.color }}>
                {s.payout > 0 ? `${s.payout}x` : "-"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-fortune-goldLight/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-fortune-goldLight/70 mt-3 leading-relaxed">
          Aposta: R$ 0,50 a R$ 30,00 por giro · grid 4x4 com 10 linhas pagantes
          (4 horizontais + 4 verticais + 2 diagonais) · paga quando os 4 simbolos
          da linha sao iguais (premio = aposta x multiplicador).
        </p>
        <p className="text-xs text-fortune-jade mt-2">
          {"\u{1F451}"} Jackpot progressivo: 1% de cada aposta vai pro seu pote pessoal.
          Linha completa de 4 dragoes leva o pote inteiro!
        </p>
      </div>
    </div>
  );
}
