/**
 * Metric-modulation solver and polyrhythm cycle math.
 * All durations are exact fractions of a whole note (Carter-style equivalences
 * therefore come out exact, never rounded).
 */
import { frac, fmul, fdiv, fnum, fstr, flcm, feq } from "./fraction.js";

export const BASE_UNITS = [
  { id: "double-whole", label: "double whole", value: frac(2n) },
  { id: "whole", label: "whole", value: frac(1n) },
  { id: "half", label: "half", value: frac(1n, 2n) },
  { id: "quarter", label: "quarter", value: frac(1n, 4n) },
  { id: "eighth", label: "eighth", value: frac(1n, 8n) },
  { id: "sixteenth", label: "16th", value: frac(1n, 16n) },
  { id: "thirty-second", label: "32nd", value: frac(1n, 32n) },
];

/**
 * Duration of a notated unit in whole notes.
 * @param {string} baseId
 * @param {number} [dots] 0..2
 * @param {{ actual: number, normal: number } | null} [tuplet]
 *   "actual in the time of normal"
 */
export function unitValue(baseId, dots = 0, tuplet = null) {
  const base = BASE_UNITS.find((u) => u.id === baseId);
  if (!base) throw new Error(`unknown unit ${baseId}`);
  let v = base.value;
  if (dots === 1) v = fmul(v, frac(3n, 2n));
  else if (dots === 2) v = fmul(v, frac(7n, 4n));
  if (tuplet && tuplet.actual > 0 && tuplet.normal > 0) {
    v = fmul(v, frac(BigInt(tuplet.normal), BigInt(tuplet.actual)));
  }
  return v;
}

/**
 * Solve old-value = new-value modulation.
 * oldBpm counts oldBeat; the equivalence says oldVal (at old tempo) lasts as
 * long as newVal (at new tempo); the answer is given for newBeat.
 * Returns exact ratio plus decimal BPM.
 */
export function solveModulation({ oldBpm, oldBeat, oldVal, newVal, newBeat }) {
  // Seconds per whole note at the old tempo: spwOld = 60 / (oldBpm · oldBeat).
  // The equivalence oldVal·spwOld = newVal·spwNew gives
  // newBpm = oldBpm · (oldBeat/newBeat) · (newVal/oldVal):
  // a *shorter* old value taking over the new beat means a *faster* tempo.
  const bpm = frac(BigInt(Math.round(oldBpm * 1000)), 1000n);
  const ratio = fdiv(newVal, oldVal);
  const newBpmExact = fmul(fmul(bpm, fdiv(oldBeat, newBeat)), ratio);
  return {
    ratio,
    ratioText: fstr(ratio),
    bpm: fnum(newBpmExact),
    bpmExact: newBpmExact,
    bpmText: fstr(newBpmExact),
  };
}

/**
 * Polyrhythm layers sharing one cycle span.
 * Each layer has `count` equal attacks across the span.
 * Returns attack positions as fractions of the span plus coincidence map.
 */
export function cycleAttacks(counts) {
  const layers = counts.map((count) => {
    const attacks = [];
    for (let k = 0; k < count; k++) attacks.push(frac(BigInt(k), BigInt(count)));
    return attacks;
  });

  const positionKey = (f) => `${f.n}/${f.d}`;
  const seen = new Map();
  layers.forEach((attacks, layerIndex) => {
    for (const at of attacks) {
      const key = positionKey(at);
      if (!seen.has(key)) seen.set(key, { at, layers: [] });
      seen.get(key).layers.push(layerIndex);
    }
  });

  const positions = [...seen.values()].sort((a, b) => fnum(a.at) - fnum(b.at));
  return {
    layers,
    positions,
    coincidences: positions.filter((p) => p.layers.length > 1),
  };
}

/** Smallest grid (as subdivision count of the span) holding every attack. */
export function commonGrid(counts) {
  const period = flcm(counts.map((c) => frac(1n, BigInt(c))));
  // period is 1/lcm(counts); grid size is its reciprocal
  return Number(frac(1n).d === 1n ? fdiv(frac(1n), period).n : 0n);
}

export { frac, fnum, fstr, feq };
