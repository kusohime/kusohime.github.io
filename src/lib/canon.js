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
 *  - rhythm steps: "x . x x" or compact "x.xx" ("x" attack, "." or "-" rest)
 *  - pitched steps: note names with octaves, "." or "-" for rests
 *    ("E4 F#4 B4 C#5 …")
 * Returns { ok, pitched, steps: [{ rest, midi }], bad[] }.
 */
export function parsePattern(text) {
  let tokens = String(text).trim().split(/[\s,;|]+/).filter(Boolean);
  // One unbroken run of x/./- characters reads as one step per character.
  if (tokens.length === 1 && /^[xX.\-]+$/.test(tokens[0])) {
    tokens = tokens[0].split("");
  }
  const steps = [];
  const bad = [];
  let pitched = false;

  for (const token of tokens) {
    if (token === "." || token === "-") {
      steps.push({ rest: true, midi: null });
      continue;
    }
    if (token === "x" || token === "X") {
      steps.push({ rest: false, midi: null });
      continue;
    }
    const midi = nameToMidi(token);
    if (midi === null) {
      bad.push(token);
      continue;
    }
    pitched = true;
    steps.push({ rest: false, midi });
  }

  const mixed = pitched && steps.some((step) => !step.rest && step.midi === null);
  return {
    ok: bad.length === 0 && steps.length > 0 && !mixed,
    pitched,
    steps,
    bad: mixed ? [...bad, "(mixed x-steps and note names)"] : bad,
  };
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
