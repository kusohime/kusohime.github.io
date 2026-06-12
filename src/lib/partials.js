/**
 * Harmonic series and stiff-string (piano) inharmonicity.
 * Ideal: f_n = n·f0. Stiff string: f_n = n·f0·sqrt(1 + B·n²)
 * (Fletcher & Rossing, The Physics of Musical Instruments, ch. 2 & 12).
 */
import { describeHz, formatCents } from "./pitch.js";

export function partialFreq(f0, n, B = 0) {
  const ideal = n * f0;
  return B > 0 ? ideal * Math.sqrt(1 + B * n * n) : ideal;
}

/** Table of partials with nearest 12-EDO spellings and cents deviations. */
export function partialTable(f0, maxPartial = 16, B = 0) {
  const rows = [];
  for (let n = 1; n <= maxPartial; n++) {
    const hz = partialFreq(f0, n, B);
    const description = describeHz(hz);
    rows.push({
      n,
      hz,
      name: description.nearestName,
      nameFlat: description.nearestNameFlat,
      cents: description.centsFromNearest,
      centsText: formatCents(description.centsFromNearest),
    });
  }
  return rows;
}

/** Reduce a partial number to its octave-equivalent ratio in [1, 2). */
export function reduceToOctave(n) {
  let num = n;
  let den = 1;
  while (num >= 2 * den) den *= 2;
  return { num, den, ratio: num / den };
}

/**
 * String node positions sounding the n-th partial when lightly touched:
 * the fractions k/n in lowest terms (gcd(k, n) = 1), 0 < k < n.
 */
export function harmonicNodes(n) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const nodes = [];
  for (let k = 1; k < n; k++) {
    if (gcd(k, n) === 1) nodes.push({ k, n, position: k / n });
  }
  return nodes;
}
