/**
 * Schema and seed data for the multiphonic / extended-technique browser.
 *
 * EDITORIAL POLICY: an entry is only marked `verified: true` once its
 * fingering and pitch content have been checked against the cited printed
 * or performer-maintained source. Unverified entries exist to demonstrate
 * the schema and MUST NOT be copied into scores.
 */

export const SCHEMA_VERSION = "1.0";

export const REQUIRED_FIELDS = [
  "id",
  "instrument",
  "technique",
  "source",
];

/**
 * @typedef {Object} TechniqueEntry
 * @property {string} id
 * @property {string} instrument        e.g. "clarinet-bb"
 * @property {string} technique         e.g. "multiphonic", "air sound"
 * @property {string} [subtype]         e.g. "underblown", "spectral"
 * @property {string[]} [writtenPitches]   written pitches, note names
 * @property {string[]} [soundingPitches]  sounding pitches, note names
 * @property {string} [fingering]       text description of fingering
 * @property {string} [dynamics]        e.g. "pp–mf"
 * @property {1|2|3|4|5} [stability]    5 = rock solid
 * @property {string} [response]        e.g. "speaks slowly, needs air attack"
 * @property {string} [notes]
 * @property {{ citation: string, url?: string }} source
 * @property {boolean} verified
 */

export const INSTRUMENTS = [
  { id: "clarinet-bb", label: "Clarinet in B♭" },
  { id: "bass-clarinet", label: "Bass clarinet" },
  { id: "flute", label: "Flute" },
  { id: "oboe", label: "Oboe" },
  { id: "bassoon", label: "Bassoon" },
  { id: "alto-sax", label: "Alto saxophone" },
];

export const TECHNIQUES = [
  "multiphonic",
  "air sound",
  "key click",
  "flutter tongue",
  "whistle tone",
  "slap tongue",
];

/** @type {TechniqueEntry[]} */
export const ENTRIES = [
  {
    id: "cl-mp-demo-1",
    instrument: "clarinet-bb",
    technique: "multiphonic",
    subtype: "underblown",
    writtenPitches: ["B3", "F#5"],
    soundingPitches: ["A3", "E5"],
    fingering: "Low B fingering, underblown (relaxed embouchure, slower air)",
    dynamics: "pp–mp",
    stability: 4,
    response: "Speaks readily at low dynamics; collapses to fundamental if pushed",
    notes:
      "PLACEHOLDER pitch content. Underblown low-register dyads of this family are catalogued by Roche (2019); verify the exact fingering and sounding pitches there before use.",
    source: {
      citation: "Roche, H. (2019). 'Underblown B♭ Clarinet Multiphonics.' heatherroche.net.",
      url: "https://heatherroche.net/2019/11/05/underblown-bb-clarinet-multiphonics/",
    },
    verified: false,
  },
  {
    id: "cl-mp-demo-2",
    instrument: "clarinet-bb",
    technique: "multiphonic",
    subtype: "spectral",
    writtenPitches: ["E3", "partials above"],
    soundingPitches: ["D3", "overblown spectrum"],
    fingering: "Lowest E, overblown progressively to isolate upper partials",
    dynamics: "mp–f",
    stability: 3,
    response: "Spectral fan-out; component selection depends on voicing/embouchure",
    notes:
      "PLACEHOLDER. Spectral multiphonics on the lowest fingerings are documented for B♭ and bass clarinet by Roche (2016); verify before use.",
    source: {
      citation: "Roche, H. (2016). 'Spectral multiphonics (B♭ and bass).' heatherroche.net.",
      url: "https://heatherroche.net/2016/09/26/spectral-multiphonics-bb-and-bass/",
    },
    verified: false,
  },
  {
    id: "fl-ws-demo",
    instrument: "flute",
    technique: "whistle tone",
    writtenPitches: ["C7 region"],
    soundingPitches: ["whistle partials of low C"],
    fingering: "Low C fingering, minimal air at the edge of tone production",
    dynamics: "ppp–pp",
    stability: 2,
    response: "Fragile; partial selection wanders; inaudible in ensemble tutti",
    notes: "PLACEHOLDER. See Dick, The Other Flute, ch. on whistle tones, for the canonical description.",
    source: {
      citation: "Dick, R. (1989). The Other Flute: A Performance Manual of Contemporary Techniques. 2nd ed.",
    },
    verified: false,
  },
  {
    id: "cl-air-demo",
    instrument: "clarinet-bb",
    technique: "air sound",
    writtenPitches: ["any fingering"],
    soundingPitches: ["pitched air, faint fingered resonance"],
    fingering: "Any; tube length colors the noise band",
    dynamics: "pp–mf",
    stability: 5,
    response: "Immediate; the only variable is the air/tone mix ratio",
    notes:
      "Air sounds are stable and well documented across method literature; notation conventions vary widely (see Lachenmann's Dal niente as locus classicus).",
    source: {
      citation: "Bok, H. (2011). New Techniques for the Bass Clarinet. Shoepair Music.",
    },
    verified: false,
  },
  {
    id: "ob-mp-demo",
    instrument: "oboe",
    technique: "multiphonic",
    writtenPitches: ["C4 + cluster"],
    soundingPitches: ["dense cluster"],
    fingering: "See Veale/Mahnkopf catalogue numbers; reed-dependent",
    dynamics: "mf",
    stability: 3,
    response: "Reed and scrape dependent; always confirm with the performer",
    notes:
      "PLACEHOLDER. Oboe multiphonics are reed-specific to a degree wind players insist on; the Veale/Mahnkopf catalogue with sounding results is the standard reference.",
    source: {
      citation:
        "Veale, P., & Mahnkopf, C.-S. (1994). The Techniques of Oboe Playing. Bärenreiter.",
    },
    verified: false,
  },
];

export const BIBLIOGRAPHY = [
  "Bartolozzi, B. (1967). New Sounds for Woodwind. Oxford University Press.",
  "Bok, H. (2011). New Techniques for the Bass Clarinet. Shoepair Music.",
  "Dick, R. (1989). The Other Flute: A Performance Manual of Contemporary Techniques (2nd ed.). Multiple Breath Music.",
  "Levine, C., & Mitropoulos-Bott, C. (2002). The Techniques of Flute Playing. Bärenreiter.",
  "Oakes, G. Clarinet multiphonics database. gregoryoakes.com/multiphonics.",
  "Roche, H. Clarinet and bass clarinet multiphonics resources. heatherroche.net.",
  "Veale, P., & Mahnkopf, C.-S. (1994). The Techniques of Oboe Playing. Bärenreiter.",
  "Weiss, M., & Netti, G. (2010). The Techniques of Saxophone Playing. Bärenreiter.",
];

export function validateEntry(entry) {
  const missing = REQUIRED_FIELDS.filter((field) => !entry[field]);
  if (missing.length) return { ok: false, missing };
  if (!entry.source.citation) return { ok: false, missing: ["source.citation"] };
  return { ok: true, missing: [] };
}
