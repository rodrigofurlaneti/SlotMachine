import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { HomePage } from "./pages/HomePage";
import { GamePage } from "./pages/GamePage";
import { HistoryPage } from "./pages/HistoryPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { OfflineBanner } from "./components/Offline/OfflineBanner";
import { useConnectionStore } from "./store/connectionStore";

export default function App() {
  const startMonitor = useConnectionStore((s) => s.startMonitor);

  useEffect(() => {
    const cleanup = startMonitor();
    return cleanup;
  }, [startMonitor]);

  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
