/**
 * Generalized pitch reflection ("negative harmony" is the special case
 * with the axis between scale degrees 2̂ and ♭3̂ of the prevailing key —
 * Levy, A Theory of Harmony, 1985). The engine takes any axis and works
 * either on pitch classes (mod 12) or on absolute pitch (MIDI).
 */
import { mod12 } from "./pcset.js";

/**
 * Reflect a pc around the axis described by `sum` (index number):
 * I_sum: pc -> sum − pc. Even sums fix two pcs; odd sums fix none.
 */
export function reflectPc(pc, sum) {
  return mod12(sum - pc);
}

/** Reflect absolute MIDI around an axis given in (possibly half-) MIDI units. */
export function reflectMidi(midi, axisMidi) {
  return 2 * axisMidi - midi;
}

/** The classic "negative harmony" sum for a given tonic: axis E♭/E in C => sum 7. */
export function negativeHarmonySum(tonicPc) {
  return mod12(2 * tonicPc + 7);
}

/** Mapping table for the whole chromatic, useful for display. */
export function pcMappingTable(sum) {
  const rows = [];
  for (let pc = 0; pc < 12; pc++) {
    rows.push({ from: pc, to: reflectPc(pc, sum), fixed: reflectPc(pc, sum) === pc });
  }
  return rows;
}
