/**
 * Neo-Riemannian operations on consonant triads (Cohn 1996, 1997;
 * Lewin, GMIT 1987). Domain is strictly major/minor triads, as in the
 * theory; anything else is rejected.
 */
import { mod12 } from "./pcset.js";
import { PC_NAMES } from "./pitch.js";

/** @typedef {{ root: number, quality: "M" | "m" }} Triad */

export function triadPcs({ root, quality }) {
  return quality === "M"
    ? [root, mod12(root + 4), mod12(root + 7)]
    : [root, mod12(root + 3), mod12(root + 7)];
}

export function triadLabel({ root, quality }) {
  return quality === "M" ? PC_NAMES[root] : `${PC_NAMES[root].toLowerCase()}`;
}

const OPS = {
  P: (t) => ({ root: t.root, quality: t.quality === "M" ? "m" : "M" }),
  R: (t) =>
    t.quality === "M"
      ? { root: mod12(t.root + 9), quality: "m" }
      : { root: mod12(t.root + 3), quality: "M" },
  L: (t) =>
    t.quality === "M"
      ? { root: mod12(t.root + 4), quality: "m" }
      : { root: mod12(t.root + 8), quality: "M" },
  S: (t) =>
    t.quality === "M"
      ? { root: mod12(t.root + 1), quality: "m" }
      : { root: mod12(t.root - 1), quality: "M" },
  N: (t) =>
    t.quality === "M"
      ? { root: mod12(t.root + 5), quality: "m" }
      : { root: mod12(t.root + 7), quality: "M" },
};

export const OP_NAMES = Object.keys(OPS);

export function applyOp(op, triad) {
  const fn = OPS[op];
  if (!fn) throw new Error(`unknown operation ${op}`);
  return fn(triad);
}

/** Apply a chain like "PLR" left to right; returns every intermediate triad. */
export function applyChain(chainText, start) {
  const ops = chainText.toUpperCase().replace(/[^PLRSN]/g, "").split("");
  const steps = [{ op: null, triad: start }];
  let current = start;
  for (const op of ops) {
    current = applyOp(op, current);
    steps.push({ op, triad: current });
  }
  return steps;
}

export function commonTones(a, b) {
  const setB = new Set(triadPcs(b));
  return triadPcs(a).filter((pc) => setB.has(pc));
}

/** Hexatonic cycle from a starting triad: alternating P and L (Cohn 1996). */
export function hexatonicCycle(start) {
  const cycle = [start];
  let current = start;
  for (let i = 0; i < 5; i++) {
    current = applyOp(i % 2 === 0 ? "P" : "L", current);
    cycle.push(current);
  }
  return cycle;
}

/**
 * Closest-voice-leading realization for audio: keep common tones,
 * move the rest by the smallest interval. Voices are MIDI notes.
 */
export function nearestVoicing(previousVoices, triad) {
  const targets = triadPcs(triad);
  if (!previousVoices) {
    return targets.map((pc) => 60 + mod12(pc - 0)).sort((x, y) => x - y);
  }
  const used = new Set();
  return previousVoices.map((voice) => {
    let best = null;
    for (const pc of targets) {
      if (used.has(pc)) continue;
      const base = voice + (((pc - voice) % 12) + 18) % 12 - 6; // nearest pc instance
      if (best === null || Math.abs(base - voice) < Math.abs(best.note - voice)) {
        best = { note: base, pc };
      }
    }
    used.add(best.pc);
    return best.note;
  });
}
