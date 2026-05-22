import { useEffect, useState } from "react";
import { useConnectionStore } from "../../store/connectionStore";

export function OfflineBanner() {
  const status = useConnectionStore((s) => s.status);
  const offlineSince = useConnectionStore((s) => s.offlineSince);
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (status !== "offline" || !offlineSince) { setElapsed(""); return; }
    const tick = () => {
      const ms = Date.now() - offlineSince.getTime();
      const min = Math.floor(ms / 60_000);
      const sec = Math.floor((ms % 60_000) / 1_000);
      setElapsed(min > 0 ? `${min}m ${sec}s` : `${sec}s`);
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [status, offlineSince]);

  if (status === "online") return null;
  const recovering = status === "recovering";

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
        background: recovering
          ? "linear-gradient(90deg,#1a6b2f,#2d8a47)"
          : "linear-gradient(90deg,#7a1c1c,#a83232)",
        color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.4)",
        transition: "background .4s",
      }}
    >
      {recovering ? (
        <span>Reconectando ao servidor...</span>
      ) : (
        <>
          <span>Servidor sem sinal &mdash; jogo roda normalmente</span>
          {elapsed && (
            <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 12 }}>
              ({elapsed})
            </span>
          )}
          <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 11, fontStyle: "italic" }}>
            Jackpot global pausado &bull; Sync retoma ao reconectar
          </span>
        </>
      )}
    </div>
  );
}
