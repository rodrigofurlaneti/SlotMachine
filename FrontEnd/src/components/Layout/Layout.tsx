import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { usePlayerStore } from "../../store/playerStore";
import { useAchievementsStore, xpProgress } from "../../store/achievementsStore";
import { formatBRL } from "../../utils/format";

export function Layout() {
  const location = useLocation();
  const player = usePlayerStore((s) => s.player);
  const xp = useAchievementsStore((s) => s.xp);
  const registerLogin = useAchievementsStore((s) => s.registerLogin);
  const resetDaily = useAchievementsStore((s) => s.resetDailyIfNeeded);

  useEffect(() => {
    registerLogin();
    resetDaily();
  }, [registerLogin, resetDaily]);

  const progress = xpProgress(xp);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-casino-bg/80 border-b border-casino-gold/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              🎰
            </motion.span>
            <span className="text-display text-xl gold-text">LUCKY SPIN</span>
          </NavLink>

          <nav className="hidden sm:flex gap-1">
            {[
              { to: "/", label: "Início" },
              { to: "/game", label: "Jogar" },
              { to: "/history", label: "Histórico" },
              { to: "/achievements", label: "Conquistas" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition ${
                    isActive
                      ? "bg-casino-gold/20 text-casino-gold"
                      : "text-neutral-300 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {player && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-neutral-400">{player.name}</span>
                <span className="text-casino-gold font-semibold tabular-nums">
                  {formatBRL(player.balance)}
                </span>
              </div>
            )}
            <div className="flex flex-col items-end min-w-[120px]">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-casino-neon font-bold">Lv {progress.level}</span>
                <span className="text-neutral-500">{progress.current}/{progress.needed} XP</span>
              </div>
              <div className="h-1.5 w-28 bg-neutral-800 rounded-full overflow-hidden mt-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-casino-neonCyan to-casino-neon"
                  initial={false}
                  animate={{ width: `${progress.pct}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="sm:hidden flex justify-around border-t border-casino-gold/20 py-1">
          {[
            { to: "/", label: "Início" },
            { to: "/game", label: "Jogar" },
            { to: "/history", label: "Histórico" },
            { to: "/achievements", label: "Trofeus" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `text-xs px-2 py-1 rounded ${
                  isActive ? "text-casino-gold" : "text-neutral-400"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="py-4 text-center text-xs text-neutral-500 border-t border-white/5">
        Lucky Spin · Apenas demonstração · 18+
      </footer>
    </div>
  );
}
