/**
 * Twelve-tone row operations.
 * Rows are arrays of 12 distinct pcs. Transformations follow the
 * original-pitch convention: P_n begins on pc n; I_n is the inversion
 * beginning on pc n; R_n / RI_n are the retrogrades of P_n / I_n
 * (the labeling used in Straus, Introduction to Post-Tonal Theory).
 */
import { mod12 } from "./pcset.js";

export function validateRow(pcs) {
  if (pcs.length !== 12) return { ok: false, error: "A row needs exactly 12 entries." };
  const set = new Set(pcs.map(mod12));
  if (set.size !== 12) return { ok: false, error: "Duplicate pitch classes found." };
  return { ok: true };
}

export const transposeRow = (row, t) => row.map((p) => mod12(p + t));
export const invertRow = (row) => row.map((p) => mod12(-p));
export const retrograde = (row) => [...row].reverse();

/** P_n / I_n / R_n / RI_n with n meaning the starting pc of P_n or I_n. */
export function rowForm(row, kind, n) {
  const p0 = transposeRow(row, mod12(n - row[0]));
  if (kind === "P") return p0;
  if (kind === "R") return retrograde(p0);
  const i0 = transposeRow(invertRow(row), mod12(n + row[0]));
  if (kind === "I") return i0;
  if (kind === "RI") return retrograde(i0);
  throw new Error(`unknown form ${kind}`);
}

/**
 * The standard 12x12 matrix: rows are P forms (top row = P at the row's own
 * first pc), columns read downward are I forms.
 */
export function rowMatrix(row) {
  const first = row[0];
  const inversionColumn = row.map((p) => mod12(first - p + first));
  return inversionColumn.map((start) => transposeRow(row, mod12(start - first)));
}

/** Ordered interval string (11 intervals, mod 12). */
export function intervalString(row) {
  const out = [];
  for (let i = 1; i < row.length; i++) out.push(mod12(row[i] - row[i - 1]));
  return out;
}

/** All-interval row: ordered intervals exhaust 1..11. */
export function isAllInterval(row) {
  const ints = intervalString(row);
  return new Set(ints).size === 11 && !ints.includes(0);
}

/**
 * Hexachordal combinatoriality with P0's first hexachord.
 * Returns the list of forms whose first hexachord completes the aggregate.
 */
export function combinatorialForms(row) {
  const hex1 = new Set(row.slice(0, 6).map(mod12));
  const results = [];
  for (const kind of ["P", "I", "R", "RI"]) {
    for (let n = 0; n < 12; n++) {
      const form = rowForm(row, kind, n);
      const formHex = form.slice(0, 6).map(mod12);
      const union = new Set([...hex1, ...formHex]);
      const isSelf = kind === "P" && n === mod12(row[0]);
      if (union.size === 12 && !isSelf) results.push({ kind, n, label: `${kind}${n}` });
    }
  }
  return results;
}

export const HISTORICAL_ROWS = [
  {
    id: "berg-lyric-suite",
    label: "Berg, Lyric Suite (1926), mvt. I",
    pcs: [5, 4, 0, 9, 7, 2, 8, 1, 3, 6, 10, 11],
  },
  {
    id: "webern-op24",
    label: "Webern, Concerto op. 24 (1934)",
    pcs: [11, 10, 2, 3, 7, 6, 8, 4, 5, 0, 1, 9],
  },
  {
    id: "schoenberg-op25",
    label: "Schoenberg, Suite for Piano op. 25 (1923)",
    pcs: [4, 5, 7, 1, 6, 3, 8, 2, 11, 0, 9, 10],
  },
  {
    id: "dallapiccola-quaderno",
    label: "Dallapiccola, Quaderno musicale di Annalibera (1952)",
    pcs: [10, 11, 3, 6, 8, 2, 7, 9, 1, 4, 0, 5],
  },
];
