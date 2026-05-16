import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface DailyMission {
  id: string;
  title: string;
  goal: number;
  progress: number;
  reward: number; // XP reward
  completed: boolean;
}

interface AchievementsState {
  xp: number;
  level: number;
  streakDays: number;
  lastLoginDate: string | null;
  achievements: Achievement[];
  dailyMissions: DailyMission[];
  missionsDate: string | null;

  addXp: (amount: number) => { leveledUp: boolean; newLevel: number };
  registerLogin: () => { newStreak: boolean; days: number };
  unlock: (id: string) => Achievement | null;
  progressMission: (id: string, amount: number) => DailyMission | null;
  resetDailyIfNeeded: () => void;
}

const baseAchievements: Achievement[] = [
  { id: "first_spin", title: "Primeira tentativa", description: "Dê seu primeiro giro", icon: "🎰", unlocked: false },
  { id: "first_win", title: "Sorte de iniciante", description: "Ganhe pela primeira vez", icon: "🍀", unlocked: false },
  { id: "ten_spins", title: "Aquecendo", description: "Complete 10 giros", icon: "🔥", unlocked: false },
  { id: "fifty_spins", title: "Veterano", description: "Complete 50 giros", icon: "🎯", unlocked: false },
  { id: "hundred_spins", title: "Centurião", description: "Complete 100 giros", icon: "💯", unlocked: false },
  { id: "diamond_line", title: "Caçador de diamantes", description: "Faça uma linha de 💎", icon: "💎", unlocked: false },
  { id: "big_win", title: "Big Win!", description: "Ganhe R$ 100 ou mais em um giro", icon: "💰", unlocked: false },
  { id: "jackpot", title: "JACKPOT", description: "Ganhe três linhas de diamante", icon: "👑", unlocked: false },
  { id: "streak_3", title: "Consistente", description: "3 dias seguidos jogando", icon: "📅", unlocked: false },
  { id: "streak_7", title: "Lendário", description: "7 dias seguidos jogando", icon: "🏆", unlocked: false },
];

function buildDailyMissions(): DailyMission[] {
  return [
    { id: "daily_spins_10", title: "Gire 10 vezes hoje", goal: 10, progress: 0, reward: 50, completed: false },
    { id: "daily_win_3", title: "Vença 3 vezes hoje", goal: 3, progress: 0, reward: 80, completed: false },
    { id: "daily_diamond", title: "Tire um 💎 hoje", goal: 1, progress: 0, reward: 120, completed: false },
  ];
}

function xpForLevel(level: number): number {
  return 100 * level + 50 * (level - 1) * level; // crescente: 100, 250, 450, 700...
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level)) level += 1;
  return level;
}

export function xpProgress(xp: number): { level: number; current: number; needed: number; pct: number } {
  const level = levelFromXp(xp);
  const prev = level === 1 ? 0 : xpForLevel(level - 1);
  const next = xpForLevel(level);
  const current = xp - prev;
  const needed = next - prev;
  return { level, current, needed, pct: Math.min(100, (current / needed) * 100) };
}

const today = () => new Date().toISOString().slice(0, 10);

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streakDays: 0,
      lastLoginDate: null,
      achievements: baseAchievements,
      dailyMissions: buildDailyMissions(),
      missionsDate: null,

      addXp: (amount) => {
        const newXp = get().xp + amount;
        const newLevel = levelFromXp(newXp);
        const leveledUp = newLevel > get().level;
        set({ xp: newXp, level: newLevel });
        return { leveledUp, newLevel };
      },

      registerLogin: () => {
        const t = today();
        const last = get().lastLoginDate;
        if (last === t) return { newStreak: false, days: get().streakDays };

        let days = get().streakDays;
        if (last) {
          const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
          days = last === yesterday ? days + 1 : 1;
        } else {
          days = 1;
        }
        set({ lastLoginDate: t, streakDays: days });
        return { newStreak: true, days };
      },

      unlock: (id) => {
        const ach = get().achievements.find((a) => a.id === id);
        if (!ach || ach.unlocked) return null;
        const updated: Achievement = { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        set({
          achievements: get().achievements.map((a) => (a.id === id ? updated : a)),
        });
        return updated;
      },

      progressMission: (id, amount) => {
        get().resetDailyIfNeeded();
        const mission = get().dailyMissions.find((m) => m.id === id);
        if (!mission || mission.completed) return null;
        const newProgress = Math.min(mission.goal, mission.progress + amount);
        const completed = newProgress >= mission.goal;
        const updated: DailyMission = { ...mission, progress: newProgress, completed };
        set({
          dailyMissions: get().dailyMissions.map((m) => (m.id === id ? updated : m)),
        });
        return completed && !mission.completed ? updated : null;
      },

      resetDailyIfNeeded: () => {
        const t = today();
        if (get().missionsDate !== t) {
          set({ missionsDate: t, dailyMissions: buildDailyMissions() });
        }
      },
    }),
    { name: "lucky-spin:achievements" }
  )
);
