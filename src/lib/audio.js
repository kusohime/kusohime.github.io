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

/** A short sine/triangle blip with exponential decay. */
export function blip(freq, when, { dur = 0.25, gain = 0.5, type = "sine" } = {}) {
  const ctx = audioContext();
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(gain, when);
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
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(amp * 0.25, now + 0.04);
    env.gain.setValueAtTime(amp * 0.25, now + dur - 0.3);
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

export function stopAll() {
  for (const node of liveNodes) {
    try {
      node.stop();
    } catch {}
  }
  liveNodes = [];
}
