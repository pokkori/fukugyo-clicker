"use client";
import { useRef, useCallback, useEffect } from "react";

// BPM 128 アップビート チップチューン BGM
// ベース + メロディ + コード 3声部

const BPM = 128;
const BEAT = 60 / BPM; // 0.46875s

// コード進行: C - Am - F - G (各1小節 = 4ビート)
const CHORD_ROOT_FREQS = [
  261.63, // C4
  220.00, // A3
  174.61, // F3
  196.00, // G3
];

// メロディノート（16分音符パターン）
const MELODY_PATTERN: (number | null)[] = [
  523.25, null, 587.33, 523.25,
  659.25, null, 587.33, null,
  493.88, null, 523.25, 587.33,
  659.25, null, 783.99, null,
];

function createOscillator(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  gainVal: number,
  startTime: number,
  duration: number,
  masterGain: GainNode
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gainVal, startTime + 0.01);
  g.gain.setValueAtTime(gainVal, startTime + duration - 0.02);
  g.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function useClickerBGM() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentBeatRef = useRef(0);
  const isPlayingRef = useRef(false);
  const mutedRef = useRef(false);
  const lookaheadSec = 0.1;
  const scheduleAheadSec = 0.3;

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const master = ctxRef.current.createGain();
      master.gain.value = 0.25;
      master.connect(ctxRef.current.destination);
      masterGainRef.current = master;
    }
    return ctxRef.current;
  }, []);

  const scheduleBeat = useCallback((ctx: AudioContext, beatIndex: number, beatTime: number) => {
    const masterGain = masterGainRef.current;
    if (!masterGain) return;
    const chordIdx = Math.floor(beatIndex / 4) % CHORD_ROOT_FREQS.length;
    const beatInMeasure = beatIndex % 4;
    const chordRoot = CHORD_ROOT_FREQS[chordIdx];

    // ベース (矩形波・低音)
    if (beatInMeasure === 0 || beatInMeasure === 2) {
      createOscillator(ctx, chordRoot * 0.5, "square", 0.08, beatTime, BEAT * 0.9, masterGain);
    }

    // コード (サイン波・3和音)
    if (beatInMeasure === 0) {
      const third = chordRoot * 1.26;
      const fifth = chordRoot * 1.5;
      createOscillator(ctx, chordRoot, "sine", 0.06, beatTime, BEAT * 3.8, masterGain);
      createOscillator(ctx, third, "sine", 0.05, beatTime, BEAT * 3.8, masterGain);
      createOscillator(ctx, fifth, "sine", 0.05, beatTime, BEAT * 3.8, masterGain);
    }

    // メロディ (16分音符ごと)
    for (let n = 0; n < 4; n++) {
      const noteIdx = (beatIndex * 4 + n) % MELODY_PATTERN.length;
      const freq = MELODY_PATTERN[noteIdx];
      if (freq !== null) {
        const noteTime = beatTime + n * BEAT * 0.25;
        createOscillator(ctx, freq, "triangle", 0.07, noteTime, BEAT * 0.2, masterGain);
      }
    }

    // ハイハット的パルス（偶数16分）
    for (let n = 0; n < 4; n += 2) {
      const hiTime = beatTime + n * BEAT * 0.25;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.15;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hiG = ctx.createGain();
      hiG.gain.value = 0.03;
      src.connect(hiG);
      hiG.connect(masterGain);
      src.start(hiTime);
    }
  }, []);

  const scheduler = useCallback(() => {
    if (!isPlayingRef.current) return;
    const ctx = getCtx();
    const beatDuration = BEAT;
    let nextBeatTime = ctx.currentTime;

    while (nextBeatTime < ctx.currentTime + scheduleAheadSec) {
      scheduleBeat(ctx, currentBeatRef.current, nextBeatTime);
      currentBeatRef.current += 1;
      nextBeatTime += beatDuration;
    }

    schedulerTimerRef.current = setTimeout(scheduler, lookaheadSec * 1000);
  }, [getCtx, scheduleBeat]);

  const start = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    currentBeatRef.current = 0;
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = mutedRef.current ? 0 : 0.25;
    }
    scheduler();
  }, [getCtx, scheduler]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(muted ? 0 : 0.25, ctxRef.current?.currentTime ?? 0, 0.05);
    }
  }, []);

  // コイン獲得SE: 高音短いビープ
  const playCoin = useCallback(() => {
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();
      const masterGain = masterGainRef.current;
      if (!masterGain || mutedRef.current) return;
      const t = ctx.currentTime;
      createOscillator(ctx, 1046.5, "sine", 0.18, t, 0.08, masterGain);
      createOscillator(ctx, 1318.5, "sine", 0.14, t + 0.06, 0.1, masterGain);
    } catch { /* noop */ }
  }, [getCtx]);

  // アップグレード購入SE: 上昇音階3音
  const playUpgrade = useCallback(() => {
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();
      const masterGain = masterGainRef.current;
      if (!masterGain || mutedRef.current) return;
      const t = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        createOscillator(ctx, freq, "triangle", 0.2, t + i * 0.1, 0.12, masterGain);
      });
    } catch { /* noop */ }
  }, [getCtx]);

  // マイルストーンSE: ジングル5音
  const playMilestone = useCallback(() => {
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();
      const masterGain = masterGainRef.current;
      if (!masterGain || mutedRef.current) return;
      const t = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, i) => {
        createOscillator(ctx, freq, "sine", 0.22, t + i * 0.09, 0.13, masterGain);
      });
    } catch { /* noop */ }
  }, [getCtx]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stop();
      ctxRef.current?.close();
    };
  }, [stop]);

  return { start, stop, setMuted, playCoin, playUpgrade, playMilestone };
}
