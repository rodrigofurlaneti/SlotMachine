import { motion } from "framer-motion";
import { useAchievementsStore, xpProgress } from "../store/achievementsStore";

export function AchievementsPage() {
  const xp = useAchievementsStore((s) => s.xp);
  const streakDays = useAchievementsStore((s) => s.streakDays);
  const achievements = useAchievementsStore((s) => s.achievements);
  const dailyMissions = useAchievementsStore((s) => s.dailyMissions);
  const progress = xpProgress(xp);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-casino-panel border border-casino-neon/30 rounded-xl p-4">
          <div className="text-xs uppercase tracking-widest text-neutral-400">Nível</div>
          <div className="text-3xl font-bold gold-text">Lv {progress.level}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {progress.current}/{progress.needed} XP
          </div>
          <div className="h-2 mt-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-casino-neonCyan to-casino-neon"
              initial={false}
              animate={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
        <div className="bg-casino-panel border border-casino-gold/30 rounded-xl p-4">
          <div className="text-xs uppercase tracking-widest text-neutral-400">Streak diária</div>
          <div className="text-3xl font-bold text-casino-gold">🔥 {streakDays} {streakDays === 1 ? "dia" : "dias"}</div>
          <div className="text-xs text-neutral-500 mt-1">Volte amanhã para manter o streak.</div>
        </div>
        <div className="bg-casino-panel border border-white/5 rounded-xl p-4">
          <div className="text-xs uppercase tracking-widest text-neutral-400">XP total</div>
          <div className="text-3xl font-bold text-casino-neonCyan tabular-nums">{xp}</div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-3">Missões diárias</h2>
        <div className="space-y-2">
          {dailyMissions.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border ${
                m.completed
                  ? "border-casino-neonCyan/40 bg-casino-neonCyan/5"
                  : "border-white/5 bg-casino-panel"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span>{m.title}</span>
                <span className="tabular-nums text-neutral-400">
                  {m.progress}/{m.goal} · +{m.reward} XP
                </span>
              </div>
              <div className="h-1.5 mt-2 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-casino-neonCyan"
                  initial={false}
                  animate={{ width: `${(m.progress / m.goal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`relative p-3 rounded-xl border text-center transition ${
                a.unlocked
                  ? "border-casino-gold/50 bg-casino-gold/10"
                  : "border-white/5 bg-casino-panel opacity-60"
              }`}
            >
              <div className={`text-4xl mb-1 ${a.unlocked ? "" : "grayscale"}`}>{a.icon}</div>
              <div className="text-sm font-semibold">{a.title}</div>
              <div className="text-[11px] text-neutral-400 mt-1">{a.description}</div>
              {a.unlocked && (
                <div className="absolute top-1 right-1 text-[10px] bg-casino-gold text-black rounded-full px-2 py-0.5 font-bold">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
