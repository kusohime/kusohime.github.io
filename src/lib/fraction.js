/**
 * Exact rational arithmetic on bigint fractions.
 * Durations, tempo ratios, JI ratios, and string-node fractions all live here;
 * floating point is only for display and audio scheduling boundaries.
 */

/** @typedef {{ n: bigint, d: bigint }} Frac */

export function bgcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

export function blcm(a, b) {
  if (a === 0n || b === 0n) return 0n;
  return (a / bgcd(a, b)) * b;
}

/** Build a normalized fraction (d > 0, fully reduced). */
export function frac(n, d = 1n) {
  n = BigInt(n);
  d = BigInt(d);
  if (d === 0n) throw new Error("zero denominator");
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = bgcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}

export const fadd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const fsub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const fmul = (a, b) => frac(a.n * b.n, a.d * b.d);
export const fdiv = (a, b) => frac(a.n * b.d, a.d * b.n);
export const fcmp = (a, b) => {
  const left = a.n * b.d;
  const right = b.n * a.d;
  return left < right ? -1 : left > right ? 1 : 0;
};
export const feq = (a, b) => fcmp(a, b) === 0;
export const fnum = (a) => Number(a.n) / Number(a.d);
export const fstr = (a) => (a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`);

/** Least common multiple of fractions: lcm of numerators over gcd of denominators. */
export function flcm(list) {
  if (!list.length) return frac(0n);
  let n = list[0].n < 0n ? -list[0].n : list[0].n;
  let d = list[0].d;
  for (const f of list.slice(1)) {
    n = blcm(n, f.n < 0n ? -f.n : f.n);
    d = bgcd(d, f.d);
  }
  return frac(n, d);
}

/** Parse "3/2", "81/64", "7" into a fraction. Returns null when malformed. */
export function parseFrac(text) {
  const m = String(text).trim().match(/^(-?\d+)\s*(?:[/:]\s*(\d+))?$/);
  if (!m) return null;
  try {
    return frac(BigInt(m[1]), BigInt(m[2] ?? "1"));
  } catch {
    return null;
  }
}
