/**
 * Kinship term realizer. Turns a (relation, language, expansion-variables)
 * triple into a concrete term, either by reading a finished term out of
 * kinship-data.js or by COMPOSING one for the transparent languages
 * (Sinitic prefix + sibling suffix, Arabic ibn/bint al-X, Korean chon).
 * Also builds per-term Wiktionary deep-links.
 */

import { ENTRIES, RELATIONS, LANGUAGES } from "./kinship-data.js";
import { chonLabel } from "./kinship-core.js";

const LANG = Object.fromEntries(LANGUAGES.map((l) => [l.id, l]));

/* Sibling-suffix tables for the Sinitic composer, keyed by elder/younger × sex. */
const SINITIC_SUFFIX = {
  zh: { eM: ["哥", "gē"], yM: ["弟", "dì"], eF: ["姐", "jiě"], yF: ["妹", "mèi"] },
  yue: { eM: ["哥", "go1"], yM: ["弟", "dai6"], eF: ["姐", "ze2"], yF: ["妹", "mui6"] },
};

/** Decide elder/younger × sex key, given the resolved relation. */
function ageSexKey(rel) {
  const sex = rel.relativeSex === "F" ? "F" : "M";
  const elder = rel.egoElder; // true | false | null
  if (elder === null) return { key: null, sex };
  return { key: (elder ? "e" : "y") + sex, sex };
}

/**
 * Realize one entry.
 * @returns {{ term, roman, gloss, note, assumed, etym, usage, nb, kind, wikt }}
 */
export function realize(entry, rel, langId, _opts = {}) {
  const lang = LANG[langId] || {};
  if (!entry) {
    return {
      kind: "missing",
      term: "—",
      roman: "",
      gloss: "no charted term for this relation in " + (lang.name || langId),
      note: "Try a neighbouring relation, or consult a language-specific dictionary.",
    };
  }

  if (entry.k === "class") {
    return {
      kind: "class", term: entry.t, roman: "", gloss: "structural classification",
      note: "This is a classificatory system: the relation is grouped, not given a single fixed word.",
      etym: entry.e, usage: entry.u, nb: entry.nb, wikt: null,
    };
  }

  if (entry.k === "recipe") {
    const built = compose(entry.rec, rel, langId);
    return {
      kind: "recipe", ...built,
      etym: entry.e, usage: entry.u, nb: entry.nb,
      wikt: wiktionaryUrl(built.headword, lang.wikt),
    };
  }

  // plain finished term
  const headword = firstHeadword(entry.t);
  return {
    kind: "term", term: entry.t, roman: entry.r || "", gloss: entry.g || "",
    etym: entry.e, usage: entry.u, nb: entry.nb,
    wikt: wiktionaryUrl(headword, lang.wikt),
  };
}

/** Compose a term from a recipe + resolved variables. */
function compose(rec, rel, langId) {
  if (rec.type === "sinitic") {
    const table = SINITIC_SUFFIX[langId] || SINITIC_SUFFIX.zh;
    const { key, sex } = ageSexKey(rel);
    if (key) {
      const [suf, sufR] = table[key];
      const term = rec.prefix + suf;
      return {
        term, headword: term, roman: `${rec.pr}-${sufR}`,
        gloss: rel.relativeSex === "F"
          ? (rel.egoElder ? "elder female cousin" : "younger female cousin")
          : (rel.egoElder ? "elder male cousin" : "younger male cousin"),
        note: null, assumed: false,
      };
    }
    // age unknown → show the sex-appropriate pair
    const pair = sex === "F" ? [table.eF, table.yF] : [table.eM, table.yM];
    const term = `${rec.prefix}${pair[0][0]} / ${rec.prefix}${pair[1][0]}`;
    return {
      term, headword: rec.prefix + pair[0][0],
      roman: `${rec.pr}-${pair[0][1]} / ${rec.pr}-${pair[1][1]}`,
      gloss: "elder / younger cousin (set 'older than me' to pick one)",
      note: "Relative age not set — both forms shown.", assumed: true,
    };
  }

  if (rec.type === "arabic") {
    const male = rel.relativeSex !== "F";
    const term = (male ? "ابن" : "بنت") + " ال" + rec.core;
    const roman = `${male ? "ibn" : "bint"} al-${rec.cr}`;
    return {
      term, headword: rec.core, roman,
      gloss: `${male ? "son" : "daughter"} of the ${unclePhrase(rec.cr)}`,
      note: null, assumed: false,
    };
  }

  if (rec.type === "korean") {
    const cl = chonLabel(rel.chon);
    const base = cl ? cl.hangul : "사촌";
    return {
      term: base, headword: "사촌", roman: cl ? cl.roman : "sachon",
      gloss: cl ? `${cl.n}-chon kin (computed from the path)` : "cousin",
      note: cl ? `chon counts the parent–child links between you and the relative: ${cl.n}.` : null,
      assumed: false,
    };
  }

  return { term: "—", headword: "", roman: "", gloss: "", note: null, assumed: false };
}

function unclePhrase(cr) {
  return {
    "ʿamm": "paternal uncle", "ʿamma": "paternal aunt",
    "khāl": "maternal uncle", "khāla": "maternal aunt",
  }[cr] || cr;
}

/** First headword from a cell that may list alternatives ("A / B"). */
function firstHeadword(t) {
  if (!t) return "";
  return t.split(/[\/·、]/)[0].trim().split(/\s+/)[0];
}

/**
 * Build a Wiktionary deep-link to the headword, anchored to the language
 * section. Returns null when there is no script headword to link.
 */
export function wiktionaryUrl(headword, wiktLang) {
  if (!headword || !wiktLang) return null;
  if (!/[^\sA-Za-z0-9.…/—-]/.test(headword)) {
    // looks like a romanisation / descriptive phrase, not a script headword
    if (!/[؀-ۿ　-鿿가-힣ऀ-෿]/.test(headword)) return null;
  }
  const page = encodeURIComponent(headword);
  return `https://en.wiktionary.org/wiki/${page}#${wiktLang}`;
}

/** Convenience: realize the active relation for one language. */
export function lookup(relationId, langId, rel) {
  const row = ENTRIES[relationId];
  const entry = row ? row[langId] : null;
  const res = realize(entry, rel, langId);
  if (res.kind === "missing") {
    // Never leave a node blank: fall back to the structural relation label,
    // shown in the muted "classificatory" style. No single charted word, but
    // the relationship is still named.
    const label = (RELATIONS[relationId] && RELATIONS[relationId].label) || relationId;
    const langName = (LANG[langId] || {}).name || langId;
    res.term = "(" + label + ")";
    res.gloss = "no charted single term in " + langName + " — relation: " + label;
  }
  return res;
}

/** Realize the active relation across every language (for the comparison strip). */
export function lookupAll(relationId, rel) {
  return LANGUAGES.map((l) => ({ lang: l, result: lookup(relationId, l.id, rel) }));
}

export function relationLabel(relationId) {
  return (RELATIONS[relationId] && RELATIONS[relationId].label) || relationId;
}
