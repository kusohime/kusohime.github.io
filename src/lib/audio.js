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
    context = new (window.AudioContext || window["webkitAudioContext"])();
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

const freezeOscillators = (oscillators) =>
  Object.freeze(oscillators.map((oscillator) => Object.freeze({ ...oscillator })));
const freezePreset = ({ adsr, filter, oscillators, ...preset }) =>
  Object.freeze({
    ...preset,
    adsr: Object.freeze({ ...adsr }),
    filter: filter ? Object.freeze({ ...filter }) : null,
    oscillators: freezeOscillators(oscillators),
  });

/**
 * Lightweight, indefinitely sustaining instruments for `createPolySynth`.
 * Oscillator `ratio` is relative to the played note, `detune` is in cents,
 * and `gain` is normalized with the other oscillators in the same preset.
 */
export const POLY_SYNTH_PRESETS = Object.freeze({
  pure: freezePreset({
    label: "Pure",
    description: "A clear sine tone for hearing intervals without added colour.",
    adsr: { attack: 0.015, decay: 0.08, sustain: 0.92, release: 0.45 },
    filter: null,
    oscillators: [{ type: "sine", ratio: 1, detune: 0, gain: 1 }],
  }),
  warm: freezePreset({
    label: "Warm",
    description: "A rounded triangle tone with a quiet upper octave.",
    adsr: { attack: 0.035, decay: 0.16, sustain: 0.82, release: 0.75 },
    filter: { type: "lowpass", frequency: 4800, q: 0.45 },
    oscillators: [
      { type: "triangle", ratio: 1, detune: -2, gain: 0.78 },
      { type: "sine", ratio: 2, detune: 2, gain: 0.22 },
    ],
  }),
  organ: freezePreset({
    label: "Organ",
    description: "A steady additive organ that keeps harmonic lines distinct.",
    adsr: { attack: 0.012, decay: 0.06, sustain: 1, release: 0.38 },
    filter: { type: "lowpass", frequency: 7200, q: 0.35 },
    oscillators: [
      { type: "sine", ratio: 1, detune: 0, gain: 0.64 },
      { type: "sine", ratio: 2, detune: 0, gain: 0.24 },
      { type: "sine", ratio: 3, detune: 0, gain: 0.08 },
      { type: "sine", ratio: 4, detune: 0, gain: 0.04 },
    ],
  }),
  pad: freezePreset({
    label: "Pad",
    description: "A softly filtered, slowly blooming pad for blended chords.",
    adsr: { attack: 0.32, decay: 0.42, sustain: 0.78, release: 1.8 },
    filter: { type: "lowpass", frequency: 1850, q: 0.7 },
    oscillators: [
      { type: "triangle", ratio: 1, detune: -7, gain: 0.44 },
      { type: "triangle", ratio: 1, detune: 7, gain: 0.44 },
      { type: "sine", ratio: 0.5, detune: 0, gain: 0.12 },
    ],
  }),
});

const POLY_EPSILON = 0.0001;
const POLY_VOICE_GAIN = 0.14;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function normalizedVelocity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  const normalized = numeric > 1 ? numeric / 127 : numeric;
  return clamp(normalized, 0, 1);
}

function midiFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Create a small polyphonic synthesizer without touching Web Audio until
 * `unlock()` or the first valid `noteOn()`. Voices sustain until explicitly
 * released; the factory owns its compressor, level, voices, and cleanup.
 */
export function createPolySynth({ preset = "organ", maxVoices = 24, volume = 0.7 } = {}) {
  let presetId = Object.hasOwn(POLY_SYNTH_PRESETS, preset) ? preset : "organ";
  const requestedVoices = Number(maxVoices);
  const voiceLimit = clamp(
    Number.isFinite(requestedVoices) ? Math.floor(requestedVoices) : 24,
    1,
    128,
  );
  let currentVolume = clamp(Number.isFinite(Number(volume)) ? Number(volume) : 0.7, 0, 1);
  let ctx = null;
  let levelNode = null;
  let compressor = null;
  let destroyed = false;
  const activeVoices = new Map();
  const allVoices = new Set();

  const ensureGraph = () => {
    if (destroyed) return null;
    if (ctx) return ctx;

    ctx = audioContext();
    levelNode = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();

    levelNode.gain.setValueAtTime(currentVolume, ctx.currentTime);
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(18, ctx.currentTime);
    compressor.ratio.setValueAtTime(5, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.18, ctx.currentTime);

    levelNode.connect(compressor);
    compressor.connect(master);
    return ctx;
  };

  const cleanupVoice = (voice) => {
    if (voice.cleaned) return;
    voice.cleaned = true;
    allVoices.delete(voice);
    if (activeVoices.get(voice.key) === voice) activeVoices.delete(voice.key);
    for (const oscillator of voice.oscillators) {
      oscillator.onended = null;
      try {
        oscillator.stop();
      } catch {}
      try {
        oscillator.disconnect();
      } catch {}
    }
    for (const oscillatorGain of voice.oscillatorGains) {
      try {
        oscillatorGain.disconnect();
      } catch {}
    }
    try {
      voice.filter?.disconnect();
    } catch {}
    try {
      voice.envelope.disconnect();
    } catch {}
  };

  const releaseVoice = (voice, releaseOverride, reschedule = false) => {
    if (!voice || voice.cleaned || (voice.released && !reschedule)) return false;
    const now = ctx.currentTime;
    const requested = Number(releaseOverride);
    const release = Number.isFinite(requested)
      ? clamp(requested, 0, 12)
      : voice.adsr.release;
    // Even a requested zero gets a few milliseconds to avoid a hard click.
    const audibleRelease = Math.max(0.008, release);

    let held = false;
    if (typeof voice.envelope.gain.cancelAndHoldAtTime === "function") {
      try {
        voice.envelope.gain.cancelAndHoldAtTime(now);
        held = true;
      } catch {}
    }
    if (!held) {
      try {
        const current = Math.max(POLY_EPSILON, voice.envelope.gain.value);
        voice.envelope.gain.cancelScheduledValues(now);
        voice.envelope.gain.setValueAtTime(current, now);
        held = true;
      } catch {}
    }
    try {
      voice.envelope.gain.setTargetAtTime(
        POLY_EPSILON,
        now,
        Math.max(0.003, audibleRelease / 5),
      );
    } catch {
      voice.envelope.gain.setValueAtTime(POLY_EPSILON, now);
    }

    const requestedStopAt = now + audibleRelease + 0.025;
    const stopAt = voice.stopAt === null
      ? requestedStopAt
      : Math.min(voice.stopAt, requestedStopAt);
    voice.released = true;
    voice.releaseAt = now;
    voice.stopAt = stopAt;
    if (activeVoices.get(voice.key) === voice) activeVoices.delete(voice.key);
    for (const oscillator of voice.oscillators) {
      try {
        oscillator.stop(stopAt);
      } catch {}
    }
    return true;
  };

  const stealOldestVoice = () => {
    let oldest = null;
    for (const voice of activeVoices.values()) {
      if (!oldest || voice.startedAt < oldest.startedAt) oldest = voice;
    }
    if (oldest) releaseVoice(oldest, 0.025);
  };

  const createVoice = (key, midi, velocity) => {
    const selected = POLY_SYNTH_PRESETS[presetId];
    const now = ctx.currentTime;
    const frequency = midiFrequency(midi);
    const envelope = ctx.createGain();
    const filter = selected.filter ? ctx.createBiquadFilter() : null;
    const oscillatorGains = [];
    const oscillators = [];

    envelope.gain.setValueAtTime(POLY_EPSILON, now);
    envelope.connect(levelNode);

    if (filter) {
      filter.type = selected.filter.type;
      filter.frequency.setValueAtTime(
        clamp(selected.filter.frequency, 20, ctx.sampleRate * 0.45),
        now,
      );
      filter.Q.setValueAtTime(Math.max(0, selected.filter.q ?? 0), now);
      filter.connect(envelope);
    }

    const filteredDefinitions = selected.oscillators.filter(
      ({ ratio }) => frequency * ratio < ctx.sampleRate / 2,
    );
    // A very low sample-rate context may put even MIDI 127 above Nyquist.
    // Keep a source in that edge case so the voice can still end and clean up.
    const audibleDefinitions = filteredDefinitions.length
      ? filteredDefinitions
      : [selected.oscillators[0]];
    const totalOscillatorGain = audibleDefinitions.reduce(
      (total, definition) => total + Math.max(0, definition.gain),
      0,
    ) || 1;

    for (const definition of audibleDefinitions) {
      const oscillator = ctx.createOscillator();
      const oscillatorGain = ctx.createGain();
      oscillator.type = definition.type;
      oscillator.frequency.setValueAtTime(frequency * definition.ratio, now);
      oscillator.detune.setValueAtTime(definition.detune ?? 0, now);
      oscillatorGain.gain.setValueAtTime(
        Math.max(0, definition.gain) / totalOscillatorGain,
        now,
      );
      oscillator.connect(oscillatorGain);
      oscillatorGain.connect(filter ?? envelope);
      oscillatorGains.push(oscillatorGain);
      oscillators.push(oscillator);
    }

    const velocityCurve = Math.pow(velocity, 1.2);
    const peak = Math.min(
      0.32,
      POLY_VOICE_GAIN * loudnessGain(frequency) * velocityCurve,
    );
    const sustain = Math.max(POLY_EPSILON, peak * selected.adsr.sustain);
    const attackEnd = now + Math.max(0, selected.adsr.attack);
    const decayEnd = attackEnd + Math.max(0, selected.adsr.decay);

    if (selected.adsr.attack > 0) {
      envelope.gain.exponentialRampToValueAtTime(Math.max(POLY_EPSILON, peak), attackEnd);
    } else {
      envelope.gain.setValueAtTime(Math.max(POLY_EPSILON, peak), now);
    }
    if (selected.adsr.decay > 0) {
      envelope.gain.exponentialRampToValueAtTime(sustain, decayEnd);
    } else {
      envelope.gain.setValueAtTime(sustain, attackEnd);
    }

    const voice = {
      key,
      midi,
      frequency,
      adsr: selected.adsr,
      presetId,
      envelope,
      filter,
      oscillatorGains,
      oscillators,
      startedAt: now,
      releaseAt: null,
      stopAt: null,
      released: false,
      cleaned: false,
      endedOscillators: 0,
    };
    const onEnded = () => {
      voice.endedOscillators += 1;
      if (voice.endedOscillators >= voice.oscillators.length) cleanupVoice(voice);
    };
    for (const oscillator of oscillators) {
      oscillator.onended = onEnded;
      oscillator.start(now);
    }

    allVoices.add(voice);
    activeVoices.set(key, voice);
    return voice;
  };

  return {
    async unlock() {
      const audio = ensureGraph();
      if (!audio) return false;
      if (audio.state === "suspended") {
        try {
          await audio.resume();
        } catch {
          return false;
        }
      }
      return audio.state === "running";
    },

    noteOn(key, midi, { velocity = 1 } = {}) {
      if (destroyed) return false;
      const midiNumber = clamp(Number(midi), 0, 127);
      const normalized = normalizedVelocity(velocity);
      if (!Number.isFinite(Number(midi)) || normalized <= 0) {
        if (normalized <= 0 && ctx) releaseVoice(activeVoices.get(key));
        return false;
      }
      if (!ensureGraph()) return false;

      const existing = activeVoices.get(key);
      if (existing) releaseVoice(existing, 0.02);
      if (activeVoices.size >= voiceLimit) stealOldestVoice();
      createVoice(key, midiNumber, normalized);
      return true;
    },

    noteOff(key, { release } = {}) {
      if (!ctx || destroyed) return false;
      return releaseVoice(activeVoices.get(key), release);
    },

    setPreset(id) {
      if (!Object.hasOwn(POLY_SYNTH_PRESETS, id)) return false;
      presetId = id;
      return true;
    },

    setVolume(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return currentVolume;
      currentVolume = clamp(numeric, 0, 1);
      if (ctx && levelNode && !destroyed) {
        levelNode.gain.setTargetAtTime(currentVolume, ctx.currentTime, 0.012);
      }
      return currentVolume;
    },

    activeCount() {
      return activeVoices.size;
    },

    panic({ release = 0.04 } = {}) {
      if (!ctx) return 0;
      const voices = [...allVoices];
      for (const voice of voices) releaseVoice(voice, release, true);
      activeVoices.clear();
      return voices.length;
    },

    destroy() {
      if (destroyed) return;
      if (!ctx) {
        destroyed = true;
        return;
      }
      const voices = [...allVoices];
      for (const voice of voices) releaseVoice(voice, 0.025, true);
      activeVoices.clear();
      destroyed = true;
      globalThis.setTimeout(() => {
        for (const voice of [...allVoices]) cleanupVoice(voice);
        try {
          levelNode?.disconnect();
        } catch {}
        try {
          compressor?.disconnect();
        } catch {}
        levelNode = null;
        compressor = null;
      }, 120);
    },
  };
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
