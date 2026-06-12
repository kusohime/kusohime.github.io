/**
 * Sensory roughness after Plomp & Levelt (1965) as parameterized by
 * Sethares (1993; Tuning, Timbre, Spectrum, Scale, 2005, appendix E).
 * d(f1,f2,a1,a2) = a1·a2 · [exp(−b1·s·Δf) − exp(−b2·s·Δf)],
 * s = xstar/(s1·fmin + s2), b1 = 3.5, b2 = 5.75, xstar = 0.24,
 * s1 = 0.0207, s2 = 18.96.
 * Outputs are unitless and comparative — only rankings are meaningful.
 */
import { midiToHz } from "./pitch.js";

const B1 = 3.5;
const B2 = 5.75;
const X_STAR = 0.24;
const S1 = 0.0207;
const S2 = 18.96;

export function pairRoughness(f1, f2, a1 = 1, a2 = 1) {
  const fmin = Math.min(f1, f2);
  const df = Math.abs(f2 - f1);
  const s = X_STAR / (S1 * fmin + S2);
  return a1 * a2 * (Math.exp(-B1 * s * df) - Math.exp(-B2 * s * df));
}

/** Harmonic spectrum: n partials with amplitude rolloff^(k-1). */
export function harmonicSpectrum(f0, partials = 6, rolloff = 0.88) {
  const out = [];
  for (let k = 1; k <= partials; k++) {
    out.push({ hz: k * f0, amp: Math.pow(rolloff, k - 1) });
  }
  return out;
}

/** Total roughness of any set of partials (sum over all pairs). */
export function totalRoughness(partials) {
  let sum = 0;
  for (let i = 0; i < partials.length; i++) {
    for (let j = i + 1; j < partials.length; j++) {
      sum += pairRoughness(partials[i].hz, partials[j].hz, partials[i].amp, partials[j].amp);
    }
  }
  return sum;
}

/** Roughness of a chord of MIDI notes under a shared spectrum model. */
export function chordRoughness(midis, { partials = 6, rolloff = 0.88 } = {}) {
  const spectrum = midis.flatMap((m) => harmonicSpectrum(midiToHz(m), partials, rolloff));
  return totalRoughness(spectrum);
}

/** Pairwise note-against-note contribution matrix (for the inspector). */
export function pairMatrix(midis, { partials = 6, rolloff = 0.88 } = {}) {
  const spectra = midis.map((m) => harmonicSpectrum(midiToHz(m), partials, rolloff));
  const matrix = [];
  for (let i = 0; i < midis.length; i++) {
    matrix.push([]);
    for (let j = 0; j < midis.length; j++) {
      if (j <= i) {
        matrix[i].push(null);
        continue;
      }
      let sum = 0;
      for (const a of spectra[i]) for (const b of spectra[j]) {
        sum += pairRoughness(a.hz, b.hz, a.amp, b.amp);
      }
      matrix[i].push(sum);
    }
  }
  return matrix;
}

/**
 * Dissonance curve: roughness of a fixed lower tone against a second tone
 * swept from unison to one octave above. Returns [{cents, value}].
 */
export function dyadSweep(f0 = 261.63, { partials = 6, rolloff = 0.88, steps = 240 } = {}) {
  const base = harmonicSpectrum(f0, partials, rolloff);
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const cents = (1200 * i) / steps;
    const upper = harmonicSpectrum(f0 * Math.pow(2, cents / 1200), partials, rolloff);
    const combined = base.concat(upper);
    points.push({ cents, value: totalRoughness(combined) });
  }
  return points;
}
