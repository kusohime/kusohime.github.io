/**
 * Canon and phase math for the rhythm lab.
 * A pattern is a cycle of equal steps, each an attack (optionally pitched)
 * or a rest. Voices state the same pattern displaced in time — by a fixed
 * offset anywhere on the continuum (not only on the step grid), or by a
 * tempo ratio so the displacement drifts, as in Reich's phase pieces.
 */
import { nameToMidi } from "./pitch.js";

/**
 * Parse a pattern. Two forms:
 *  - rhythm steps: "x . x x" or compact "x.xx" ("x" attack, "." or "-" rest,
 *    "_" holds the previous note for another step)
 *  - pitched steps: note names with octaves, "." / "-" rests, "_" holds
 *    ("E4 F#4 B4 C#5 …")
 * Returns { ok, pitched, steps: [{ rest, hold, midi }], bad[] }.
 */
export function parsePattern(text) {
  let tokens = String(text).trim().split(/[\s,;|]+/).filter(Boolean);
  // One unbroken run of x/./-/_ characters reads as one step per character.
  if (tokens.length === 1 && /^[xX.\-_]+$/.test(tokens[0])) {
    tokens = tokens[0].split("");
  }
  const steps = [];
  const bad = [];
  let pitched = false;

  for (const token of tokens) {
    if (token === "." || token === "-") {
      steps.push({ rest: true, hold: false, midi: null });
      continue;
    }
    if (token === "_") {
      steps.push({ rest: false, hold: true, midi: null });
      continue;
    }
    if (token === "x" || token === "X") {
      steps.push({ rest: false, hold: false, midi: null });
      continue;
    }
    const midi = nameToMidi(token);
    if (midi === null) {
      bad.push(token);
      continue;
    }
    pitched = true;
    steps.push({ rest: false, hold: false, midi });
  }

  const mixed =
    pitched && steps.some((step) => !step.rest && !step.hold && step.midi === null);
  return {
    ok: bad.length === 0 && steps.length > 0 && !mixed,
    pitched,
    steps,
    bad: mixed ? [...bad, "(mixed x-steps and note names)"] : bad,
  };
}

/**
 * Duration of the attack at cyclic position `index`, in steps:
 * 1 plus following "_" holds (wrapping across the cycle boundary,
 * capped at the pattern length — a tie over the barline is musical,
 * an infinite note is not).
 */
export function attackDurationSteps(steps, index) {
  let duration = 1;
  for (let k = 1; k < steps.length; k++) {
    if (steps[(index + k) % steps.length].hold) duration += 1;
    else break;
  }
  return duration;
}

/**
 * Seconds for the faster voice to gain one full pattern on the slower one:
 * patternSeconds / |rate − 1|. Infinite at rate 1 (no drift).
 */
export function driftPeriodSeconds(patternSeconds, rate) {
  const difference = Math.abs(rate - 1);
  if (difference < 1e-9) return Infinity;
  return patternSeconds / difference;
}

/** A continuous offset (fraction of the cycle) expressed in steps. */
export function offsetInSteps(offsetFraction, stepCount) {
  return offsetFraction * stepCount;
}

export const PRESETS = [
  {
    id: "piano-phase",
    label: "Reich, Piano Phase (1967)",
    pattern: "E4 F#4 B4 C#5 D5 F#4 E4 C#5 B4 F#4 D5 C#5",
  },
  {
    id: "clapping-music",
    label: "Reich, Clapping Music (1972)",
    pattern: "xxx.xx.x.xx.",
  },
  {
    id: "simple-clave",
    label: "Son clave (3–2)",
    pattern: "x..x..x...x.x...",
  },
];
