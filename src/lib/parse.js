/**
 * Input parsing shared by the tool UIs: note-name lists and pc lists.
 * Forgiving about separators, strict about tokens — a wrong token is
 * reported, never silently dropped.
 */
import { nameToMidi } from "./pitch.js";

const PC_TOKEN = { t: 10, T: 10, e: 11, E: 11 };

/** "C4 D#4, Bb3" -> { ok, midis, bad[] } */
export function parseNoteList(text) {
  const tokens = String(text).trim().split(/[\s,;]+/).filter(Boolean);
  const midis = [];
  const bad = [];
  for (const token of tokens) {
    const midi = nameToMidi(token);
    if (midi === null) bad.push(token);
    else midis.push(midi);
  }
  return { ok: bad.length === 0 && midis.length > 0, midis, bad };
}

/**
 * "0 1 4 6", "0,1,4,6", "5 4 0 T E", or note names without octave ("C E G B").
 * Returns { ok, pcs, bad[] } with pcs in input order (duplicates kept).
 *
 * Disambiguation: bare "T"/"E" are the pc numerals 10/11 (Straus's
 * convention) *unless* the input also contains an unambiguous note name
 * (C, D, F, G, or anything with an accidental) — then every letter is a
 * note name, so "C E G B" reads as 0 4 7 11. A lone "E" with no other
 * context reads as eleven, as the input label states.
 */
export function parsePcList(text) {
  const tokens = String(text).trim().split(/[\s,;]+/).filter(Boolean);
  const isNumeral = (token) => /^(10|11|[0-9])$/.test(token);
  const isAmbiguous = (token) => token in PC_TOKEN;
  const noteContext = tokens.some(
    (token) => !isNumeral(token) && !isAmbiguous(token),
  );
  const pcs = [];
  const bad = [];
  for (const token of tokens) {
    if (isNumeral(token)) {
      pcs.push(Number(token));
      continue;
    }
    if (!noteContext && isAmbiguous(token)) {
      pcs.push(PC_TOKEN[token]);
      continue;
    }
    const asNote = nameToMidi(`${token}4`);
    if (asNote !== null) {
      pcs.push(((asNote % 12) + 12) % 12);
      continue;
    }
    bad.push(token);
  }
  return { ok: bad.length === 0 && pcs.length > 0, pcs, bad };
}

/** Positive integer list like "3, 4, 5" -> { ok, values, bad[] } */
export function parseCountList(text, { min = 1, max = 64 } = {}) {
  const tokens = String(text).trim().split(/[\s,:;]+/).filter(Boolean);
  const values = [];
  const bad = [];
  for (const token of tokens) {
    const value = Number(token);
    if (Number.isInteger(value) && value >= min && value <= max) values.push(value);
    else bad.push(token);
  }
  return { ok: bad.length === 0 && values.length > 0, values, bad };
}
