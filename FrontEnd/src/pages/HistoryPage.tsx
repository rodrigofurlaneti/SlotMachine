import { useMemo } from "react";
import { useGameStore } from "../store/gameStore";
import { formatBRL, formatTime } from "../utils/format";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function HistoryPage() {
  const history = useGameStore((s) => s.history);
  const totalSpins = useGameStore((s) => s.totalSpins);
  const totalWagered = useGameStore((s) => s.totalWagered);
  const totalWon = useGameStore((s) => s.totalWon);
  const reset = useGameStore((s) => s.resetHistory);

  const chartData = useMemo(
    () =>
      [...history]
        .reverse()
        .map((h, i) => ({ idx: i + 1, saldo: h.balanceAfter, premio: h.prizeWon })),
    [history]
  );

  const winRate = totalSpins ? ((history.filter((h) => h.isWinner).length / totalSpins) * 100).toFixed(1) : "0.0";
  const rtp = totalWagered ? ((totalWon / totalWagered) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-display gold-text">Histórico & Estatísticas</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total de giros" value={totalSpins.toString()} />
        <StatCard label="Total apostado" value={formatBRL(totalWagered)} />
        <StatCard label="Total ganho" value={formatBRL(totalWon)} accent="cyan" />
        <StatCard label="Taxa de vitória" value={`${winRate}% · RTP ${rtp}%`} accent="gold" />
      </div>

      <div className="bg-casino-panel border border-white/5 rounded-xl p-4 mb-6">
        <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-3">Evolução do saldo</h2>
        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500">
              Sem dados ainda — gire algumas vezes!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="idx" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161616",
                    border: "1px solid #f5c51866",
                    borderRadius: 8,
                  }}
                />
                <Line type="monotone" dataKey="saldo" stroke="#f5c518" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-casino-panel border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm uppercase tracking-widest text-neutral-400">Últimos giros</h2>
          {history.length > 0 && (
            <button
              onClick={reset}
              className="text-xs text-neutral-400 hover:text-casino-neon"
            >
              Limpar histórico
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-neutral-500 text-sm">Você ainda não jogou.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {history.slice(0, 30).map((h) => (
              <div key={h.at} className="py-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-500 w-24">{formatTime(h.at)}</span>
                  <span className="flex gap-1">
                    {h.rows.map((row, i) => (
                      <span key={i} className="text-base">
                        {row.join(" ")}
                      </span>
                    ))}
                  </span>
                </div>
                <div
                  className={`tabular-nums ${
                    h.isWinner ? "text-casino-neonCyan" : "text-neutral-500"
                  }`}
                >
                  {h.isWinner ? `+ ${formatBRL(h.prizeWon)}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold" | "cyan";
}) {
  const color =
    accent === "gold" ? "text-casino-gold" : accent === "cyan" ? "text-casino-neonCyan" : "text-white";
  return (
    <div className="bg-casino-panel border border-white/5 rounded-xl p-3">
      <div className="text-xs uppercase tracking-widest text-neutral-400">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
