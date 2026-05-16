import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";

/**
 * Sons sintetizados via Data URI (WAV) — não precisamos baixar arquivos.
 * Geramos cada efeito programaticamente para evitar dependências de assets.
 */
function makeBeepWav(opts: {
  freqStart: number;
  freqEnd?: number;
  durationMs: number;
  type?: "sine" | "square" | "saw" | "triangle";
  volume?: number;
}): string {
  const { freqStart, freqEnd = freqStart, durationMs, type = "sine", volume = 0.4 } = opts;
  const sampleRate = 22050;
  const samples = Math.floor((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const progress = i / samples;
    const freq = freqStart + (freqEnd - freqStart) * progress;
    let sample = 0;
    const phase = 2 * Math.PI * freq * t;
    if (type === "sine") sample = Math.sin(phase);
    else if (type === "square") sample = Math.sin(phase) >= 0 ? 1 : -1;
    else if (type === "saw") sample = 2 * (t * freq - Math.floor(t * freq + 0.5));
    else sample = 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1;

    // envelope simples (fade in/out)
    const env =
      progress < 0.1 ? progress / 0.1 : progress > 0.85 ? (1 - progress) / 0.15 : 1;
    sample *= env * volume;

    const value = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, value * 0x7fff, true);
  }

  // base64
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

type SoundName = "spin" | "stop" | "win" | "bigWin" | "jackpot" | "click" | "levelUp";

let cache: Partial<Record<SoundName, Howl>> | null = null;

function getSounds(): Record<SoundName, Howl> {
  if (cache && Object.keys(cache).length === 7) return cache as Record<SoundName, Howl>;
  cache = {
    spin: new Howl({
      src: [makeBeepWav({ freqStart: 380, freqEnd: 220, durationMs: 600, type: "saw", volume: 0.18 })],
    }),
    stop: new Howl({
      src: [makeBeepWav({ freqStart: 220, freqEnd: 110, durationMs: 120, type: "square", volume: 0.22 })],
    }),
    win: new Howl({
      src: [makeBeepWav({ freqStart: 500, freqEnd: 880, durationMs: 380, type: "sine", volume: 0.3 })],
    }),
    bigWin: new Howl({
      src: [makeBeepWav({ freqStart: 440, freqEnd: 1200, durationMs: 900, type: "triangle", volume: 0.35 })],
    }),
    jackpot: new Howl({
      src: [makeBeepWav({ freqStart: 600, freqEnd: 1600, durationMs: 1400, type: "sine", volume: 0.4 })],
    }),
    click: new Howl({
      src: [makeBeepWav({ freqStart: 800, freqEnd: 800, durationMs: 50, type: "square", volume: 0.18 })],
    }),
    levelUp: new Howl({
      src: [makeBeepWav({ freqStart: 660, freqEnd: 990, durationMs: 600, type: "sine", volume: 0.3 })],
    }),
  };
  return cache as Record<SoundName, Howl>;
}

export function useSounds() {
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem("lucky-spin:muted") === "1";
  });
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    localStorage.setItem("lucky-spin:muted", muted ? "1" : "0");
  }, [muted]);

  const play = useCallback((name: SoundName) => {
    if (mutedRef.current) return;
    try {
      getSounds()[name].play();
    } catch {
      /* ignore */
    }
  }, []);

  return { play, muted, toggleMute: () => setMuted((m) => !m) };
}
