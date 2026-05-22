import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STAFF_PASSWORD, useStaffStore } from "../../store/staffStore";

const KEYS: Array<string> = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
const MAX_LEN = 8;

/**
 * Modal de senha com teclado numerico em tela.
 *
 * - Aparece quando o funcionario clica 5 vezes no logo do tigre.
 * - A tela e touch-screen, portanto o teclado e renderizado direto na UI
 *   (sem depender do teclado fisico).
 * - Senha correta (123456) habilita o "modo funcionario" no store global,
 *   liberando os botoes de navegacao do header.
 */
export function StaffPasswordModal() {
  const isOpen = useStaffStore((s) => s.isPasswordModalOpen);
  const closeModal = useStaffStore((s) => s.closePasswordModal);
  const enableStaff = useStaffStore((s) => s.enableStaff);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Limpa estado interno sempre que abre/fecha
  useEffect(() => {
    if (!isOpen) {
      setCode("");
      setError(null);
      setShake(false);
    }
  }, [isOpen]);

  function handleKey(key: string) {
    setError(null);
    if (key === "C") {
      setCode("");
      return;
    }
    if (key === "OK") {
      if (code === STAFF_PASSWORD) {
        enableStaff();
      } else {
        setError("Senha incorreta");
        setShake(true);
        setTimeout(() => setShake(false), 450);
        setCode("");
      }
      return;
    }
    if (code.length >= MAX_LEN) return;
    setCode((c) => c + key);
  }

  // Suporte adicional ao teclado fisico (caso seja util fora do touch)
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        handleKey(e.key);
      } else if (e.key === "Backspace") {
        setCode((c) => c.slice(0, -1));
      } else if (e.key === "Enter") {
        handleKey("OK");
      } else if (e.key === "Escape") {
        closeModal();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, code]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              x: shake ? [0, -10, 10, -8, 8, -4, 4, 0] : 0,
            }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs sm:max-w-sm rounded-2xl border-2 border-fortune-gold/60 bg-fortune-ink/95 shadow-[0_0_40px_rgba(245,197,24,0.35)] p-5"
          >
            <div className="text-center mb-3">
              <div className="text-xs uppercase tracking-widest text-fortune-gold/80">
                Acesso restrito
              </div>
              <div className="text-imperial text-2xl imperial-text mt-1">
                AREA DO FUNCIONARIO
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Digite a senha para liberar a navegacao
              </div>
            </div>

            {/* Display dos digitos (mascarados) */}
            <div className="mx-auto mb-4 flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => {
                const filled = i < code.length;
                return (
                  <div
                    key={i}
                    className={`h-10 w-8 sm:h-12 sm:w-9 rounded-md border-2 flex items-center justify-center text-xl font-bold transition ${
                      filled
                        ? "border-fortune-gold bg-fortune-gold/15 text-fortune-gold"
                        : "border-fortune-gold/30 bg-black/30 text-neutral-600"
                    }`}
                  >
                    {filled ? "*" : ""}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="text-center text-sm text-red-400 mb-2">{error}</div>
            )}

            {/* Teclado numerico */}
            <div className="grid grid-cols-3 gap-2">
              {KEYS.map((key) => {
                const isAction = key === "C" || key === "OK";
                const isOk = key === "OK";
                const isClear = key === "C";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKey(key)}
                    className={`h-14 sm:h-16 rounded-xl text-xl font-bold select-none active:scale-95 transition border ${
                      isOk
                        ? "bg-fortune-gold text-black border-fortune-gold hover:brightness-110"
                        : isClear
                        ? "bg-fortune-red/30 text-white border-fortune-red/60 hover:bg-fortune-red/50"
                        : "bg-fortune-redDeep/60 text-white border-fortune-gold/30 hover:bg-fortune-red/40"
                    } ${isAction ? "text-base" : ""}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="mt-4 w-full text-xs text-neutral-400 hover:text-white py-2"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
