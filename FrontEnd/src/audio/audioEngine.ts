/**
 * Audio engine sintetizado via Web Audio API (sem assets externos).
 *
 * Responsabilidades:
 *   - Trilha de fundo: loop pentatonico oriental tocado por osciladores.
 *   - SFX de chip: som de moeda ao selecionar valor de aposta, tom varia com o valor.
 *   - Voz em ingles: anuncia o valor da aposta via Web Speech API.
 *   - Master mute sincronizado com o resto do app via localStorage.
 *
 * O AudioContext so e iniciado depois da primeira interacao do usuario
 * (autoplay policy dos navegadores). Antes disso, todas as chamadas sao no-op.
 */

const MASTER_KEY = "fortune-spin:muted";

type EngineState = {
  ctx: AudioContext | null;
  master: GainNode | null;
  musicGain: GainNode | null;
  sfxGain: GainNode | null;
  musicTimer: number | null;
  musicStep: number;
  musicStarted: boolean;
  muted: boolean;
  voicePicked: SpeechSynthesisVoice | null;
};

const state: EngineState = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  musicTimer: null,
  musicStep: 0,
  musicStarted: false,
  muted: typeof localStorage !== "undefined" && localStorage.getItem(MASTER_KEY) === "1",
  voicePicked: null,
};

/** Garante que o AudioContext exista. Idempotente. */
function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (state.ctx) return state.ctx;
  const Ctx =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ||
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = state.muted ? 0 : 1;
  master.connect(ctx.destination);

  const musicGain = ctx.createGain();
  musicGain.gain.value = 0.24; // trilha mais presente (foi 0.12)
  musicGain.connect(master);

  const sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.5;
  sfxGain.connect(master);

  state.ctx = ctx;
  state.master = master;
  state.musicGain = musicGain;
  state.sfxGain = sfxGain;
  return ctx;
}

/** Resume o contexto suspenso (necessario apos interacao do usuario). */
async function resumeIfSuspended() {
  const ctx = ensureContext();
  if (ctx && ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
}

/** Define o estado de mute (afeta master gain). */
export function setMuted(muted: boolean) {
  state.muted = muted;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(MASTER_KEY, muted ? "1" : "0");
  }
  const ctx = state.ctx;
  if (ctx && state.master) {
    const now = ctx.currentTime;
    state.master.gain.cancelScheduledValues(now);
    state.master.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.25);
  }
}

export function isMuted(): boolean {
  return state.muted;
}

/* ============================ TRILHA DE FUNDO =========================== */

// Escala pentatonica chinesa (Hz, oitava 4-5): C4, D4, E4, G4, A4, C5, D5, E5
const PENTATONIC: number[] = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25,
];

// Padrao melodico simples — indices na escala
const MELODY: number[] = [0, 2, 4, 3, 5, 4, 2, 0, 1, 3, 5, 4, 2, 1, 0, 2];

/**
 * Toca uma nota da melodia com envelope ADSR curto.
 * Cada nota usa 2 osciladores (sine + triangle) para soar mais "rico".
 */
function playMelodyNote(freq: number, durationMs: number) {
  const ctx = state.ctx;
  if (!ctx || !state.musicGain) return;
  const now = ctx.currentTime;
  const dur = durationMs / 1000;

  const noteGain = ctx.createGain();
  noteGain.gain.setValueAtTime(0, now);
  noteGain.gain.linearRampToValueAtTime(0.28, now + 0.04);
  noteGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  noteGain.connect(state.musicGain);

  const o1 = ctx.createOscillator();
  o1.type = "sine";
  o1.frequency.value = freq;
  o1.connect(noteGain);
  o1.start(now);
  o1.stop(now + dur);

  const o2 = ctx.createOscillator();
  o2.type = "triangle";
  o2.frequency.value = freq * 2; // oitava acima
  const o2Gain = ctx.createGain();
  o2Gain.gain.value = 0.35;
  o2.connect(o2Gain).connect(noteGain);
  o2.start(now);
  o2.stop(now + dur);
}

/** Drone grave continuo — da peso ambiente. */
function startDrone() {
  const ctx = state.ctx;
  if (!ctx || !state.musicGain) return null;
  const drone = ctx.createOscillator();
  drone.type = "sine";
  drone.frequency.value = 130.81; // C3
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.16;
  drone.connect(droneGain).connect(state.musicGain);
  drone.start();
  return { drone, droneGain };
}

let droneRef: { drone: OscillatorNode; droneGain: GainNode } | null = null;

export async function startMusic() {
  await resumeIfSuspended();
  if (!state.ctx || state.musicStarted) return;
  state.musicStarted = true;
  droneRef = startDrone();
  // Fade-in do music gain
  if (state.musicGain) {
    const now = state.ctx.currentTime;
    state.musicGain.gain.cancelScheduledValues(now);
    state.musicGain.gain.setValueAtTime(0, now);
    state.musicGain.gain.linearRampToValueAtTime(0.24, now + 1.5);
  }

  const STEP_MS = 360;
  const tick = () => {
    const idx = MELODY[state.musicStep % MELODY.length];
    const freq = PENTATONIC[idx % PENTATONIC.length];
    playMelodyNote(freq, STEP_MS * 1.1);
    state.musicStep += 1;
    state.musicTimer = window.setTimeout(tick, STEP_MS);
  };
  tick();
}

export function stopMusic() {
  if (state.musicTimer !== null) {
    window.clearTimeout(state.musicTimer);
    state.musicTimer = null;
  }
  state.musicStarted = false;
  state.musicStep = 0;
  if (droneRef) {
    try {
      droneRef.drone.stop();
    } catch {
      /* ignore */
    }
    droneRef = null;
  }
}

/* =============================== SFX CHIP =============================== */

/**
 * "Ka-ching" sintetizado por valor da aposta.
 * Frequencia base varia com o valor (mais alto = aposta maior).
 */
export async function playChipSound(value: number) {
  await resumeIfSuspended();
  const ctx = state.ctx;
  if (!ctx || !state.sfxGain) return;

  const now = ctx.currentTime;
  // Mapeia valor [0.5, 30] para frequencia base [520, 1050] Hz
  const norm = Math.min(1, Math.max(0, (value - 0.5) / (30 - 0.5)));
  const base = 520 + norm * 530;

  // Som de "tilintar" — duas notas rapidas (octava + quinta)
  const ringFreqs = [base, base * 1.5];
  ringFreqs.forEach((f, i) => {
    const g = ctx.createGain();
    const startAt = now + i * 0.06;
    g.gain.setValueAtTime(0, startAt);
    g.gain.linearRampToValueAtTime(0.4, startAt + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, startAt + 0.35);
    g.connect(state.sfxGain!);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, startAt);
    osc.frequency.exponentialRampToValueAtTime(f * 0.9, startAt + 0.35);
    osc.connect(g);
    osc.start(startAt);
    osc.stop(startAt + 0.4);
  });

  // Click curto inicial (atack mais "metalico")
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = "square";
  click.frequency.value = base * 2;
  clickGain.gain.setValueAtTime(0.25, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  click.connect(clickGain).connect(state.sfxGain);
  click.start(now);
  click.stop(now + 0.06);
}

/* ============================ VOZ EM INGLES ============================ */

const BET_LABELS_EN: Record<string, string> = {
  "0.5": "fifty cents",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "10": "ten",
  "15": "fifteen",
  "20": "twenty",
  "25": "twenty five",
  "30": "thirty",
};

/** Resolve a label em ingles para um valor. */
export function betLabelEn(value: number): string {
  const key = String(value);
  if (BET_LABELS_EN[key]) return BET_LABELS_EN[key];
  // fallback: lê o numero direto
  return value.toString();
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  // Prefere en-US feminina/neural se disponivel
  const preferred =
    voices.find((v) => /en[-_]US/i.test(v.lang) && /female|samantha|jenny|aria|google.*us english/i.test(v.name)) ||
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0];
  return preferred ?? null;
}

/**
 * Pre-carrega vozes (algumas plataformas demoram a popular getVoices()).
 * Chame uma vez no boot do app.
 */
export function primeVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const trySet = () => {
    state.voicePicked = pickEnglishVoice();
  };
  trySet();
  window.speechSynthesis.onvoiceschanged = trySet;
}

/** Fala o valor em ingles. No-op se mutado ou sem suporte. */
export function speakBet(value: number) {
  if (state.muted) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    // Cancela qualquer fala anterior pra evitar fila
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(betLabelEn(value));
    u.lang = "en-US";
    u.rate = 1.05;
    u.pitch = 1.05;
    u.volume = 0.9;
    if (state.voicePicked) u.voice = state.voicePicked;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/** Dispara um "boot" do contexto na primeira interacao do usuario. */
export async function unlockOnUserGesture() {
  await resumeIfSuspended();
}

/* ============================ MEGA WIN FANFARE =========================== */

/**
 * Fanfarra sintetizada: arpeggio ascendente em modo maior + camada de oitavas.
 * Tocada quando o jogador vence 3+ linhas no mesmo giro.
 */
export async function playMegaFanfare(intensity: "mega" | "ultra" = "mega") {
  await resumeIfSuspended();
  const ctx = state.ctx;
  if (!ctx || !state.sfxGain) return;

  // C major arpeggio + escala ascendente
  const notes =
    intensity === "ultra"
      ? [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.5]
      : [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];

  const stepDur = 0.12;
  const start = ctx.currentTime;
  notes.forEach((freq, i) => {
    const at = start + i * stepDur;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.5, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, at + stepDur * 1.6);
    g.connect(state.sfxGain!);

    // Onda principal
    const o1 = ctx.createOscillator();
    o1.type = "triangle";
    o1.frequency.value = freq;
    o1.connect(g);
    o1.start(at);
    o1.stop(at + stepDur * 1.7);

    // Oitava acima — brilho
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = freq * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    o2.connect(g2).connect(g);
    o2.start(at);
    o2.stop(at + stepDur * 1.7);
  });

  // Sustained "gong" no final
  const gongAt = start + notes.length * stepDur;
  const gongGain = ctx.createGain();
  gongGain.gain.setValueAtTime(0, gongAt);
  gongGain.gain.linearRampToValueAtTime(0.5, gongAt + 0.04);
  gongGain.gain.exponentialRampToValueAtTime(0.001, gongAt + 1.2);
  gongGain.connect(state.sfxGain!);

  [523.25, 659.25, 783.99].forEach((f) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(gongGain);
    osc.start(gongAt);
    osc.stop(gongAt + 1.3);
  });
}

/**
 * Anuncia o numero de linhas vencedoras em ingles via speech synthesis.
 * Usado quando 3+ linhas vencem no mesmo giro.
 */
export function speakMegaWin(lines: number, jackpot = false) {
  if (state.muted) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const text = jackpot
      ? "Jackpot! All lines!"
      : lines >= 6
      ? "Ultra win! " + lines + " lines!"
      : "Mega win! " + lines + " lines!";
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1.0;
    u.pitch = 1.1;
    u.volume = 0.95;
    if (state.voicePicked) u.voice = state.voicePicked;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/* ======================== SOM POR SIMBOLO VENCEDOR ======================== */

const TIGER  = "\u{1F42F}";
const COIN   = "\u{1FA99}";
const LANT   = "\u{1F3EE}";
const DRAGON = "\u{1F409}";

/**
 * Cada simbolo tem um "tema" sonoro distinto:
 *  - Tigre    -> rugido grave + sino agudo (potencia bruta)
 *  - Moeda    -> cha-ching, varias moedinhas caindo (alegre)
 *  - Lanterna -> sino oriental + ressonancia metalica
 *  - Dragao   -> gongo grandioso + zumbido ressonante (epico)
 */
export async function playSymbolWinSound(symbol: string) {
  await resumeIfSuspended();
  const ctx = state.ctx;
  if (!ctx || !state.sfxGain) return;
  const now = ctx.currentTime;

  switch (symbol) {
    case TIGER: {
      // Rugido grave (sawtooth descendente) + ataque metalico agudo
      const roar = ctx.createOscillator();
      const roarGain = ctx.createGain();
      roar.type = "sawtooth";
      roar.frequency.setValueAtTime(160, now);
      roar.frequency.exponentialRampToValueAtTime(70, now + 0.6);
      roarGain.gain.setValueAtTime(0, now);
      roarGain.gain.linearRampToValueAtTime(0.55, now + 0.05);
      roarGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      roar.connect(roarGain).connect(state.sfxGain);
      roar.start(now);
      roar.stop(now + 0.75);

      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = "triangle";
      bell.frequency.value = 1320;
      bellGain.gain.setValueAtTime(0, now + 0.1);
      bellGain.gain.linearRampToValueAtTime(0.4, now + 0.12);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      bell.connect(bellGain).connect(state.sfxGain);
      bell.start(now + 0.1);
      bell.stop(now + 0.65);
      break;
    }

    case COIN: {
      // Sequencia rapida de "tilins" (cha-ching) com altura crescente
      const seq = [880, 1100, 1320, 1560, 1760];
      seq.forEach((f, i) => {
        const at = now + i * 0.07;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(0.45, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, at + 0.22);
        g.connect(state.sfxGain!);
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, at);
        osc.frequency.exponentialRampToValueAtTime(f * 0.92, at + 0.22);
        osc.connect(g);
        osc.start(at);
        osc.stop(at + 0.25);
      });
      break;
    }

    case LANT: {
      // Sino oriental — frequencias multiplas em harmonia, com decaimento longo
      const fundamentals = [523.25, 659.25, 783.99, 1046.5];
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.55, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      g.connect(state.sfxGain);
      fundamentals.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.value = f;
        const og = ctx.createGain();
        og.gain.value = i === 0 ? 0.6 : 0.3;
        osc.connect(og).connect(g);
        osc.start(now);
        osc.stop(now + 1.5);
      });
      break;
    }

    case DRAGON: {
      // Gongo epico: cluster de baixas + agudas, mais "boom" inicial
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = "sine";
      boom.frequency.setValueAtTime(80, now);
      boom.frequency.exponentialRampToValueAtTime(45, now + 1.0);
      boomGain.gain.setValueAtTime(0, now);
      boomGain.gain.linearRampToValueAtTime(0.6, now + 0.02);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      boom.connect(boomGain).connect(state.sfxGain);
      boom.start(now);
      boom.stop(now + 1.3);

      // Cluster de notas que ressoa
      const gongFreqs = [196.0, 261.63, 392.0, 523.25, 783.99];
      const gongGain = ctx.createGain();
      gongGain.gain.setValueAtTime(0, now + 0.05);
      gongGain.gain.linearRampToValueAtTime(0.5, now + 0.1);
      gongGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      gongGain.connect(state.sfxGain);
      gongFreqs.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = f;
        const og = ctx.createGain();
        og.gain.value = 0.25;
        osc.connect(og).connect(gongGain);
        osc.start(now + 0.05);
        osc.stop(now + 2.0);
      });
      break;
    }

    default: {
      // Fallback generico — som curto para qualquer simbolo desconhecido
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.4, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      g.connect(state.sfxGain);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 660;
      osc.connect(g);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }
}

/* ============================ JACKPOT VOICE ============================ */

export function speakJackpotWin(amount: number) {
  if (state.muted) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const text = `Jackpot! You won ${amount.toFixed(0)} reais!`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    u.pitch = 1.15;
    u.volume = 1.0;
    if (state.voicePicked) u.voice = state.voicePicked;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
