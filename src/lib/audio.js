/**
 * Minimal shared WebAudio layer. One lazily created context, one master
 * gain, sample-accurate scheduling against AudioContext.currentTime.
 * Every tool routes preview audio through here; nothing else owns audio.
 */

let context = null;
let master = null;
let liveNodes = [];

export function audioContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
    master = context.createGain();
    master.gain.value = 0.5;
    master.connect(context.destination);
  }
  if (context.state === "suspended") context.resume();
  return context;
}

/**
 * Equal-loudness compensation for the bass. The ear is far less sensitive
 * to low frequencies (the equal-loudness contours), so a low tone at a
 * given amplitude reads as much quieter than a mid one at the same
 * amplitude — which is why every voice here sounded fine up top but thin
 * in the bass. We raise the gain of low tones to even this out.
 *
 * Crucially this changes loudness, not timbre: it is a pure amplitude
 * scale on a single oscillator, so a boosted sine is the same sine — the
 * waveform, and thus the quality, is untouched. No boost at or above
 * middle C; below it the gain rises on a gentle per-octave tilt, capped
 * so stacked bass tones still cannot clip the master.
 */
const LOUDNESS_CORNER_HZ = 261.63; // middle C (C4): leave the upper register as tuned
const LOUDNESS_SLOPE_DB = 4.5; // extra dB per octave below the corner
const LOUDNESS_MAX_DB = 10; // ceiling on the boost, for headroom

export function loudnessGain(freq) {
  if (!(freq > 0) || freq >= LOUDNESS_CORNER_HZ) return 1;
  const octavesBelow = Math.log2(LOUDNESS_CORNER_HZ / freq);
  const db = Math.min(octavesBelow * LOUDNESS_SLOPE_DB, LOUDNESS_MAX_DB);
  return Math.pow(10, db / 20);
}

/** A short sine/triangle blip with exponential decay. */
export function blip(freq, when, { dur = 0.25, gain = 0.5, type = "sine" } = {}) {
  const ctx = audioContext();
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(gain * loudnessGain(freq), when);
  env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(env).connect(master);
  osc.start(when);
  osc.stop(when + dur + 0.02);
  liveNodes.push(osc);
  osc.onended = () => {
    liveNodes = liveNodes.filter((node) => node !== osc);
  };
  return osc;
}

/** Sustained additive cluster (for partials/voicing previews). */
export function sustain(freqsAndGains, { dur = 2.2, type = "sine" } = {}) {
  const ctx = audioContext();
  const now = ctx.currentTime + 0.03;
  for (const { hz, amp } of freqsAndGains) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = hz;
    const peak = amp * 0.25 * loudnessGain(hz);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.04);
    env.gain.setValueAtTime(peak, now + dur - 0.3);
    env.gain.linearRampToValueAtTime(0.0001, now + dur);
    osc.connect(env).connect(master);
    osc.start(now);
    osc.stop(now + dur + 0.05);
    liveNodes.push(osc);
    osc.onended = () => {
      liveNodes = liveNodes.filter((node) => node !== osc);
    };
  }
}

/**
 * Schedule a finite list of events: [{ time, freq, gain, dur, type }].
 * Times are seconds from "now". Returns the context start offset.
 */
export function playEvents(events, { onStep = null } = {}) {
  const ctx = audioContext();
  const t0 = ctx.currentTime + 0.08;
  for (const event of events) {
    blip(event.freq, t0 + event.time, {
      dur: event.dur ?? 0.18,
      gain: event.gain ?? 0.5,
      type: event.type ?? "sine",
    });
    if (onStep) {
      const delay = (t0 + event.time - ctx.currentTime) * 1000;
      window.setTimeout(() => onStep(event), Math.max(0, delay));
    }
  }
  return t0;
}

/**
 * A sustained tone scheduled at an absolute context time: quick attack,
 * held body, short release. For canon voices and fugue playback, where
 * notes must last their notated value rather than decay like clicks.
 */
export function tone(freq, when, { dur = 0.5, gain = 0.35, type = "sine" } = {}) {
  const ctx = audioContext();
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const attack = Math.min(0.015, dur / 4);
  const release = Math.min(0.07, dur / 3);
  const level = gain * loudnessGain(freq);
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(level, when + attack);
  env.gain.setValueAtTime(level, Math.max(when + attack, when + dur - release));
  env.gain.linearRampToValueAtTime(0.0001, when + dur);
  osc.connect(env).connect(master);
  osc.start(when);
  osc.stop(when + dur + 0.03);
  liveNodes.push(osc);
  osc.onended = () => {
    liveNodes = liveNodes.filter((node) => node !== osc);
  };
  return osc;
}

/**
 * Look-ahead clock for open-ended playback (metronomes, phase canons).
 * `tick(from, to)` must schedule every event whose time falls in [from, to),
 * against the AudioContext clock. Scheduling stays sample-accurate while
 * UI parameters (tempo, phase offset) may change between ticks.
 */
export function createClock({ lookAhead = 0.2, interval = 60 } = {}) {
  let timer = null;
  let horizon = 0;

  return {
    running: () => timer !== null,
    start(tick) {
      const ctx = audioContext();
      this.stop();
      horizon = ctx.currentTime + 0.08;
      const pump = () => {
        const until = ctx.currentTime + lookAhead;
        if (until > horizon) {
          tick(horizon, until);
          horizon = until;
        }
      };
      pump();
      timer = window.setInterval(pump, interval);
    },
    stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    },
  };
}

/**
 * A keyed set of sustained oscillators that play until removed.
 * `set(key, …)` starts or retunes a voice; `remove(key)` fades it out;
 * `stop()` clears everything. For drones whose membership the user
 * toggles live (partial stacks, held chords, dyads).
 */
export function createDrone() {
  const voices = new Map();
  return {
    size: () => voices.size,
    has: (key) => voices.has(key),
    set(key, { hz, amp = 0.2, type = "sine" }) {
      const ctx = audioContext();
      const level = amp * loudnessGain(hz);
      const existing = voices.get(key);
      if (existing) {
        existing.osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.02);
        existing.env.gain.setTargetAtTime(level, ctx.currentTime, 0.05);
        return;
      }
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = type;
      osc.frequency.value = hz;
      env.gain.setValueAtTime(0.0001, ctx.currentTime);
      env.gain.setTargetAtTime(level, ctx.currentTime, 0.06);
      osc.connect(env).connect(master);
      osc.start();
      voices.set(key, { osc, env });
    },
    remove(key) {
      const voice = voices.get(key);
      if (!voice) return;
      voices.delete(key);
      const ctx = audioContext();
      voice.env.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
      voice.osc.stop(ctx.currentTime + 0.5);
    },
    stop() {
      for (const key of [...voices.keys()]) this.remove(key);
    },
  };
}

export function stopAll() {
  for (const node of liveNodes) {
    try {
      node.stop();
    } catch {}
  }
  liveNodes = [];
}
