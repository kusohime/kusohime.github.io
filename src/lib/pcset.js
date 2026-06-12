/**
 * Pitch-class set theory core (Rahn conventions).
 * Prime forms, interval vectors, and Z-relations are computed, not looked up;
 * the hand-checked table below only attaches Forte's catalogue numbers
 * (verified against Forte 1973 via the standard published lists).
 * Cardinalities 7–9 take their ordinal from the 5–3 complements
 * (Forte's complement-ordinal convention, e.g. 4-Z15 ↔ 8-Z15).
 */

const MOD = 12;

export const mod12 = (x) => ((x % MOD) + MOD) % MOD;

/** Deduplicated, sorted pc set from any integer array. */
export function toPcSet(pitches) {
  return [...new Set(pitches.map(mod12))].sort((a, b) => a - b);
}

export function transposePcs(pcs, t) {
  return toPcSet(pcs.map((p) => p + t));
}

export function invertPcs(pcs, sum = 0) {
  return toPcSet(pcs.map((p) => sum - p));
}

/** Rahn normal order: smallest outer span, then pack from the right. */
export function normalOrder(pcsIn) {
  const pcs = toPcSet(pcsIn);
  if (pcs.length === 0) return [];
  if (pcs.length === 1) return pcs;
  let best = null;
  for (let i = 0; i < pcs.length; i++) {
    const rot = pcs.slice(i).concat(pcs.slice(0, i));
    if (best === null) best = rot;
    else {
      // compare spans from outermost inward (Rahn)
      let decided = false;
      for (let j = rot.length - 1; j > 0 && !decided; j--) {
        const spanA = mod12(rot[j] - rot[0]);
        const spanB = mod12(best[j] - best[0]);
        if (spanA !== spanB) {
          if (spanA < spanB) best = rot;
          decided = true;
        }
      }
      if (!decided && rot[0] < best[0]) best = rot;
    }
  }
  return best ?? pcs;
}

/** Zero-based normal order. */
function zeroed(order) {
  return order.map((p) => mod12(p - order[0]));
}

/** Rahn prime form: the more packed of set vs. inversion, zeroed. */
export function primeForm(pcsIn) {
  const pcs = toPcSet(pcsIn);
  if (pcs.length === 0) return [];
  const a = zeroed(normalOrder(pcs));
  const b = zeroed(normalOrder(invertPcs(pcs)));
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? a : b;
  }
  return a;
}

export function intervalVector(pcsIn) {
  const pcs = toPcSet(pcsIn);
  const vector = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < pcs.length; i++) {
    for (let j = i + 1; j < pcs.length; j++) {
      const ic = Math.min(mod12(pcs[j] - pcs[i]), mod12(pcs[i] - pcs[j]));
      vector[ic - 1]++;
    }
  }
  return vector;
}

export const pfString = (pf) =>
  `(${pf.map((p) => (p === 10 ? "T" : p === 11 ? "E" : p)).join("")})`;
export const ivString = (iv) => `<${iv.join("")}>`;

export function complementPcs(pcsIn) {
  const pcs = new Set(toPcSet(pcsIn));
  const out = [];
  for (let i = 0; i < 12; i++) if (!pcs.has(i)) out.push(i);
  return out;
}

/* Forte catalogue, cardinalities 1–6 (verified). Keys are prime-form digit strings. */
const FORTE_BASE = {
  "": "0-1",
  "0": "1-1",
  "01": "2-1", "02": "2-2", "03": "2-3", "04": "2-4", "05": "2-5", "06": "2-6",
  "012": "3-1", "013": "3-2", "014": "3-3", "015": "3-4", "016": "3-5",
  "024": "3-6", "025": "3-7", "026": "3-8", "027": "3-9", "036": "3-10",
  "037": "3-11", "048": "3-12",
  "0123": "4-1", "0124": "4-2", "0134": "4-3", "0125": "4-4", "0126": "4-5",
  "0127": "4-6", "0145": "4-7", "0156": "4-8", "0167": "4-9", "0235": "4-10",
  "0135": "4-11", "0236": "4-12", "0136": "4-13", "0237": "4-14",
  "0146": "4-Z15", "0157": "4-16", "0347": "4-17", "0147": "4-18",
  "0148": "4-19", "0158": "4-20", "0246": "4-21", "0247": "4-22",
  "0257": "4-23", "0248": "4-24", "0268": "4-25", "0358": "4-26",
  "0258": "4-27", "0369": "4-28", "0137": "4-Z29",
  "01234": "5-1", "01235": "5-2", "01245": "5-3", "01236": "5-4",
  "01237": "5-5", "01256": "5-6", "01267": "5-7", "02346": "5-8",
  "01246": "5-9", "01346": "5-10", "02347": "5-11", "01356": "5-Z12",
  "01248": "5-13", "01257": "5-14", "01268": "5-15", "01347": "5-16",
  "01348": "5-Z17", "01457": "5-Z18", "01367": "5-19", "01568": "5-20",
  "01458": "5-21", "01478": "5-22", "02357": "5-23", "01357": "5-24",
  "02358": "5-25", "02458": "5-26", "01358": "5-27", "02368": "5-28",
  "01368": "5-29", "01468": "5-30", "01369": "5-31", "01469": "5-32",
  "02468": "5-33", "02469": "5-34", "02479": "5-35", "01247": "5-Z36",
  "03458": "5-Z37", "01258": "5-Z38",
  "012345": "6-1", "012346": "6-2", "012356": "6-Z3", "012456": "6-Z4",
  "012367": "6-5", "012567": "6-Z6", "012678": "6-7", "023457": "6-8",
  "012357": "6-9", "013457": "6-Z10", "012457": "6-Z11", "012467": "6-Z12",
  "013467": "6-Z13", "013458": "6-14", "012458": "6-15", "014568": "6-16",
  "012478": "6-Z17", "012578": "6-18", "013478": "6-Z19", "014589": "6-20",
  "023468": "6-21", "012468": "6-22", "023568": "6-Z23", "013468": "6-Z24",
  "013568": "6-Z25", "013578": "6-Z26", "013469": "6-27", "013569": "6-Z28",
  "023679": "6-Z29", "013679": "6-30", "014579": "6-31", "024579": "6-32",
  "023579": "6-33", "013579": "6-34", "02468T": "6-35",
  "012347": "6-Z36", "012348": "6-Z37", "012378": "6-Z38", "023458": "6-Z39",
  "012358": "6-Z40", "012368": "6-Z41", "012369": "6-Z42", "012568": "6-Z43",
  "012569": "6-Z44", "023469": "6-Z45", "012469": "6-Z46", "012479": "6-Z47",
  "012579": "6-Z48", "013479": "6-Z49", "014679": "6-Z50",
};

const pfKey = (pf) => pf.map((p) => (p === 10 ? "T" : p === 11 ? "E" : p)).join("");

/** Catalogue of all 224 set classes, built once by enumerating all subsets. */
function buildCatalog() {
  const byKey = new Map();
  for (let mask = 0; mask < 4096; mask++) {
    const pcs = [];
    for (let bit = 0; bit < 12; bit++) if (mask & (1 << bit)) pcs.push(bit);
    const pf = primeForm(pcs);
    const key = pfKey(pf);
    if (!byKey.has(key)) {
      byKey.set(key, { pf, key, card: pf.length, iv: intervalVector(pf) });
    }
  }

  // Attach Forte names: 0–6 from table, 7–12 via the complement ordinal.
  for (const entry of byKey.values()) {
    if (entry.card <= 6) {
      entry.forte = FORTE_BASE[entry.key] ?? null;
    } else {
      const comp = primeForm(complementPcs(entry.pf));
      const compName = FORTE_BASE[pfKey(comp)];
      entry.forte = compName
        ? `${entry.card}-${compName.split("-")[1]}`
        : null;
    }
  }

  // Z-relations computed: same interval vector, different class, same cardinality.
  const groups = new Map();
  for (const entry of byKey.values()) {
    const groupKey = `${entry.card}|${entry.iv.join(",")}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(entry);
  }
  for (const group of groups.values()) {
    if (group.length > 1) {
      for (const entry of group) {
        entry.zPartners = group.filter((other) => other !== entry).map((o) => o.key);
      }
    } else {
      group[0].zPartners = [];
    }
  }
  return byKey;
}

let catalogCache = null;
export function catalog() {
  if (!catalogCache) catalogCache = buildCatalog();
  return catalogCache;
}

/** Full analysis of an arbitrary pc collection. */
export function analyzeSet(pitches) {
  const pcs = toPcSet(pitches);
  const order = normalOrder(pcs);
  const pf = primeForm(pcs);
  const entry = catalog().get(pfKey(pf));
  const comp = primeForm(complementPcs(pcs));
  const compEntry = catalog().get(pfKey(comp));
  return {
    pcs,
    normalOrder: order,
    primeForm: pf,
    primeFormString: pfString(pf),
    intervalVector: entry ? entry.iv : intervalVector(pcs),
    intervalVectorString: ivString(entry ? entry.iv : intervalVector(pcs)),
    forte: entry?.forte ?? null,
    zPartners: (entry?.zPartners ?? []).map((key) => {
      const partner = catalog().get(key);
      return { forte: partner?.forte ?? null, primeFormString: pfString(partner.pf) };
    }),
    complement: {
      primeFormString: pfString(comp),
      forte: compEntry?.forte ?? null,
    },
  };
}
