/**
 * Messiaen's modes of limited transposition (Technique de mon langage
 * musical, 1944, ch. XVI). Templates are pc sets from C; transposition
 * counts are computed, not asserted, so the data stays self-checking.
 */
import { mod12, toPcSet, transposePcs } from "./pcset.js";

export const MESSIAEN_MODES = [
  {
    id: 1,
    name: "Mode 1 (whole-tone)",
    pcs: [0, 2, 4, 6, 8, 10],
    note: "Debussy and Dukas had already exhausted it — Messiaen avoids it unless hidden among other modes.",
  },
  {
    id: 2,
    name: "Mode 2 (octatonic)",
    pcs: [0, 1, 3, 4, 6, 7, 9, 10],
    note: "Alternating semitone–tone; Messiaen's most-used mode, also Rimsky-Korsakov's and Stravinsky's collection.",
  },
  {
    id: 3,
    name: "Mode 3",
    pcs: [0, 2, 3, 4, 6, 7, 8, 10, 11],
    note: "Tone–semitone–semitone cycle; nine notes, four transpositions.",
  },
  {
    id: 4,
    name: "Mode 4",
    pcs: [0, 1, 2, 5, 6, 7, 8, 11],
    note: "Semitone–semitone–minor third–semitone, mirrored at the tritone.",
  },
  {
    id: 5,
    name: "Mode 5",
    pcs: [0, 1, 5, 6, 7, 11],
    note: "A six-note subset of Mode 4: semitone–major third–semitone, mirrored.",
  },
  {
    id: 6,
    name: "Mode 6",
    pcs: [0, 2, 4, 5, 6, 8, 10, 11],
    note: "Tone–tone–semitone–semitone, mirrored at the tritone.",
  },
  {
    id: 7,
    name: "Mode 7",
    pcs: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11],
    note: "The largest mode: ten notes, chromatic except two holes a tritone apart.",
  },
];

/** Number of distinct transpositions (12 / order of the T-symmetry group). */
export function uniqueTranspositions(pcs) {
  const reference = toPcSet(pcs).join(",");
  let count = 0;
  for (let t = 0; t < 12; t++) {
    if (transposePcs(pcs, t).join(",") === reference) count++;
  }
  return 12 / count;
}

/** All distinct transpositions of a template, as pc-set arrays. */
export function allTranspositions(pcs) {
  const seen = new Map();
  for (let t = 0; t < 12; t++) {
    const set = transposePcs(pcs, t);
    const key = set.join(",");
    if (!seen.has(key)) seen.set(key, { t, pcs: set });
  }
  return [...seen.values()];
}

/** Inversional symmetry axes: sums s with I_s(set) = set. */
export function symmetryAxes(pcsIn) {
  const reference = toPcSet(pcsIn).join(",");
  const axes = [];
  for (let sum = 0; sum < 12; sum++) {
    const inverted = toPcSet(pcsIn.map((p) => mod12(sum - p)));
    if (inverted.join(",") === reference) axes.push(sum);
  }
  return axes;
}

/** Overlap report between user material and one mode transposition. */
export function overlap(materialPcs, modePcs) {
  const mode = new Set(modePcs);
  const inMode = [];
  const outside = [];
  for (const pc of toPcSet(materialPcs)) {
    (mode.has(pc) ? inMode : outside).push(pc);
  }
  return { inMode, outside };
}
