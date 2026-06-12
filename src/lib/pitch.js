/**
 * Pitch conversion core: Hz, MIDI (float for microtones), note names,
 * cents, just-intonation ratios, and arbitrary equal divisions of the octave.
 * Structural values stay exact where possible; Hz and cents are float64.
 */

const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const A4_DEFAULT = 440;

export function midiToHz(midi, a4 = A4_DEFAULT) {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function hzToMidi(hz, a4 = A4_DEFAULT) {
  return 69 + 12 * Math.log2(hz / a4);
}

export function ratioToCents(n, d) {
  return 1200 * Math.log2(Number(n) / Number(d));
}

export function centsToRatioApprox(cents) {
  return Math.pow(2, cents / 1200);
}

/** Nearest 12-EDO pitch for a (possibly fractional) MIDI value. */
export function nearest12(midiFloat) {
  const midi = Math.round(midiFloat);
  return { midi, cents: (midiFloat - midi) * 100 };
}

/** "C#4" | "Db4" | "A4" | "Bbb2" | "F##3" -> integer MIDI, or null. */
export function nameToMidi(name) {
  const m = String(name).trim().match(/^([A-Ga-g])(#{1,2}|b{1,2}|x|♯|♭)?(-?\d+)$/);
  if (!m) return null;
  const letter = m[1].toUpperCase();
  let acc = 0;
  const accText = m[2] ?? "";
  if (accText === "x" || accText === "##") acc = 2;
  else if (accText === "#" || accText === "♯") acc = 1;
  else if (accText === "b" || accText === "♭") acc = -1;
  else if (accText === "bb") acc = -2;
  return LETTER_PC[letter] + acc + 12 * (Number(m[3]) + 1);
}

export function midiToName(midi, prefer = "sharp") {
  const names = prefer === "flat" ? FLAT_NAMES : SHARP_NAMES;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${names[pc]}${octave}`;
}

export function formatCents(cents) {
  const rounded = Math.round(cents * 10) / 10;
  if (Math.abs(rounded) < 0.05) return "±0¢";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded)}¢`;
}

/** Full breakdown of one frequency for converter tables. */
export function describeHz(hz, a4 = A4_DEFAULT) {
  const midiFloat = hzToMidi(hz, a4);
  const { midi, cents } = nearest12(midiFloat);
  return {
    hz,
    midiFloat,
    nearestMidi: midi,
    nearestName: midiToName(midi),
    nearestNameFlat: midiToName(midi, "flat"),
    centsFromNearest: cents,
  };
}

/** One step of an arbitrary EDO above a reference frequency. */
export function edoStep(step, divisions, refHz = A4_DEFAULT, periodCents = 1200) {
  const cents = (step * periodCents) / divisions;
  return {
    cents,
    hz: refHz * Math.pow(2, cents / 1200),
  };
}

/**
 * Parse flexible pitch input: "440hz", "A4", "midi 69", "69", "3/2 * A4"
 * is out of scope — the UI feeds typed fields instead. Helper kept for tests.
 */
export function parsePitchToken(text, a4 = A4_DEFAULT) {
  const trimmed = String(text).trim();
  const asName = nameToMidi(trimmed);
  if (asName !== null) return { kind: "name", midi: asName, hz: midiToHz(asName, a4) };
  const asHz = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:hz)?$/i);
  if (asHz) {
    const value = Number(asHz[1]);
    if (value > 0 && value < 130) return { kind: "midi", midi: value, hz: midiToHz(value, a4) };
    return { kind: "hz", midi: hzToMidi(value, a4), hz: value };
  }
  return null;
}

export const PC_NAMES = SHARP_NAMES;
export const PC_NAMES_FLAT = FLAT_NAMES;
