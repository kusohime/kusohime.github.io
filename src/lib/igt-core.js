/**
 * Interlinear Glossed Text (IGT) core: the data model, a Leipzig-aware
 * parser, Unicode-correct width measurement, a shared column-layout engine,
 * and validation. Everything here is pure (no DOM, no I/O) so the renderers
 * in igt-render.js can reuse it for plain text, HTML, SVG/PNG, and LaTeX.
 *
 * The alignment unit is the WORD (Leipzig Rule 1): each whitespace-separated
 * word forms one column; a tier's word sits left-aligned in that column and
 * the column is as wide as its widest tier cell.
 */

/* ----------------------------------------------------------------------- *
 * Model
 * ----------------------------------------------------------------------- */

/**
 * @typedef {Object} Tier
 * @property {string} id        stable id ("orth" | "ipa" | "morph" | "gloss" | "pos" | custom)
 * @property {string} label     left-margin label (may be empty)
 * @property {"aligned"|"free"} role
 * @property {boolean} smallcaps treat ALLCAPS sub-glosses as small caps
 * @property {boolean} italic    render italic (object-language convention)
 * @property {string} text       raw line, words separated by whitespace
 *
 * @typedef {Object} Example
 * @property {string} label        display label, e.g. "(1)"
 * @property {string} language     source language / citation
 * @property {string} judgement    "" | "*" | "?" | "#" | "%"
 * @property {Tier[]} tiers        ordered aligned tiers
 * @property {string} translation  free translation (unaligned)
 * @property {string} notes
 */

let tierSeq = 0;
export function makeTier(partial = {}) {
  return {
    id: partial.id || `t${++tierSeq}`,
    label: partial.label ?? "",
    role: partial.role || "aligned",
    smallcaps: partial.smallcaps ?? false,
    italic: partial.italic ?? false,
    text: partial.text ?? "",
  };
}

export function emptyExample() {
  return {
    label: "(1)",
    language: "",
    judgement: "",
    tiers: [
      makeTier({ id: "morph", label: "", role: "aligned", italic: true }),
      makeTier({ id: "gloss", label: "", role: "aligned", smallcaps: true }),
    ],
    translation: "",
    notes: "",
  };
}

/** A small ready-made example so the tool is never blank on first load. */
export function demoExample() {
  return {
    label: "(1)",
    language: "Yidiɲ (Dixon 1977)",
    judgement: "",
    tiers: [
      makeTier({ id: "morph", role: "aligned", italic: true,
        text: "ŋayu buɲa-:n gali-ŋ" }),
      makeTier({ id: "gloss", role: "aligned", smallcaps: true,
        text: "1SG.NOM woman-COM go-PRES" }),
    ],
    translation: "I am going with the woman.",
    notes: "",
  };
}

/* ----------------------------------------------------------------------- *
 * Tokenisation & morpheme parsing
 * ----------------------------------------------------------------------- */

/** Split a tier line into word tokens on runs of whitespace. */
export function tokenizeWords(line) {
  const t = (line ?? "").trim();
  return t.length ? t.split(/\s+/) : [];
}

/**
 * Count Leipzig morpheme boundaries inside a single word.
 * Counts affix "-", clitic "=", reduplication "~", and infix "<...>" pairs.
 * Does NOT count "." or ":" (those mark fusion within one gloss, Rule 4),
 * so they never create a new alignment cell.
 */
export function morphemeBoundaryCount(word) {
  if (!word) return 0;
  let n = 0;
  for (const ch of word) {
    if (ch === "-" || ch === "=" || ch === "~") n++;
  }
  const infixes = word.match(/<[^>]*>/g);
  if (infixes) n += infixes.length;
  return n;
}

/**
 * Split a gloss word into renderable pieces, keeping every delimiter so the
 * pieces can be re-joined. Splits on fusion (".", ":") AND morpheme
 * boundaries ("-", "=", "~") and infix brackets ("<", ">"), so a label that
 * follows a lexical stem — e.g. "woman-COM" — is still detected as a
 * grammatical label by isCategoryLabel().
 */
export function glossSubParts(word) {
  return word.split(/([-=~.:<>])/).filter((s) => s !== "");
}

/** A sub-gloss is a grammatical label (small caps) if it is ALLCAPS-ish. */
export function isCategoryLabel(sub) {
  return /^[0-9]*[A-Z][A-Z0-9]*$/.test(sub) || /^(?:1|2|3)$/.test(sub);
}

/* ----------------------------------------------------------------------- *
 * Unicode-aware display width (for monospace / plain-text alignment)
 * ----------------------------------------------------------------------- */

const COMBINING =
  /[̀-ͯ҃-҉֑-ֽ᪰-᫿᷀-᷿⃐-⃿︠-︯]/;

function isWide(cp) {
  return (
    (cp >= 0x1100 && cp <= 0x115f) || // Hangul Jamo
    (cp >= 0x2e80 && cp <= 0x303e) || // CJK radicals, Kangxi
    (cp >= 0x3041 && cp <= 0x33ff) || // Hiragana..CJK symbols
    (cp >= 0x3400 && cp <= 0x4dbf) || // CJK Ext A
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified
    (cp >= 0xa000 && cp <= 0xa4cf) || // Yi
    (cp >= 0xac00 && cp <= 0xd7a3) || // Hangul syllables
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK compat
    (cp >= 0xfe30 && cp <= 0xfe4f) || // CJK compat forms
    (cp >= 0xff00 && cp <= 0xff60) || // Fullwidth forms
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x20000 && cp <= 0x3fffd) // CJK Ext B+
  );
}

/** Display columns occupied by a string in a monospace grid. */
export function stringWidth(str) {
  let w = 0;
  for (const ch of str) {
    if (COMBINING.test(ch)) continue; // stacks on the previous glyph
    w += isWide(ch.codePointAt(0)) ? 2 : 1;
  }
  return w;
}

/* ----------------------------------------------------------------------- *
 * Layout engine — shared by every renderer
 * ----------------------------------------------------------------------- */

/**
 * Build a positioned, line-wrapped layout.
 *
 * @param {Example} ex
 * @param {Object} opts
 * @param {(text:string, tier:Tier)=>number} opts.measure  width of a cell
 * @param {number} opts.maxWidth   wrap threshold (same unit as measure)
 * @param {number} opts.colGap     gap between word columns
 * @returns {{ lines: Array, alignedTiers: Tier[], translation: string,
 *             label: string }}
 *
 * Each line is { rows: Array<{ tier, cells: Array<{text,x,width}> }> }.
 */
export function layout(ex, { measure, maxWidth, colGap }) {
  const alignedTiers = ex.tiers.filter((t) => t.role === "aligned");
  const wordsPerTier = alignedTiers.map((t) => tokenizeWords(t.text));
  const colCount = Math.max(0, ...wordsPerTier.map((w) => w.length));

  // Per-column width = widest tier cell in that column.
  const colWidth = [];
  for (let c = 0; c < colCount; c++) {
    let w = 0;
    alignedTiers.forEach((tier, ti) => {
      const cell = wordsPerTier[ti][c] ?? "";
      w = Math.max(w, measure(cell, tier));
    });
    colWidth[c] = w;
  }

  // Greedy line breaking: never split a column.
  const lineRanges = [];
  let start = 0;
  let acc = 0;
  for (let c = 0; c < colCount; c++) {
    const add = colWidth[c] + (c > start ? colGap : 0);
    if (c > start && acc + add > maxWidth) {
      lineRanges.push([start, c]);
      start = c;
      acc = colWidth[c];
    } else {
      acc += add;
    }
  }
  if (colCount === 0) lineRanges.push([0, 0]);
  else lineRanges.push([start, colCount]);

  const lines = lineRanges.map(([a, b]) => {
    const rows = alignedTiers.map((tier, ti) => {
      const cells = [];
      let x = 0;
      for (let c = a; c < b; c++) {
        cells.push({ text: wordsPerTier[ti][c] ?? "", x, width: colWidth[c] });
        x += colWidth[c] + colGap;
      }
      return { tier, cells };
    });
    return { rows };
  });

  return { lines, alignedTiers, translation: ex.translation, label: ex.label };
}

/* ----------------------------------------------------------------------- *
 * Validation
 * ----------------------------------------------------------------------- */

/**
 * @returns {{ errors: string[], warnings: string[], counts: number[] }}
 *   errors block image/LaTeX export; warnings are advisory.
 */
export function validate(ex) {
  const errors = [];
  const warnings = [];
  const aligned = ex.tiers.filter((t) => t.role === "aligned");
  const counts = aligned.map((t) => tokenizeWords(t.text).length);

  const nonEmpty = counts.filter((c) => c > 0);
  if (nonEmpty.length > 1) {
    const max = Math.max(...nonEmpty);
    aligned.forEach((t, i) => {
      if (counts[i] > 0 && counts[i] !== max) {
        errors.push(
          `Tier "${tierName(t, i)}" has ${counts[i]} word(s); expected ${max}.`,
        );
      }
    });
  }

  // Morpheme parity between the two ALLCAPS-bearing / object tiers, if 2 tiers.
  if (aligned.length >= 2 && nonEmpty.length >= 2) {
    const a = tokenizeWords(aligned[aligned.length - 2].text);
    const b = tokenizeWords(aligned[aligned.length - 1].text);
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const ca = morphemeBoundaryCount(a[i]);
      const cb = morphemeBoundaryCount(b[i]);
      if (ca !== cb) {
        warnings.push(
          `Word ${i + 1}: ${ca} morpheme break(s) in "${a[i]}" but ${cb} in "${b[i]}".`,
        );
      }
    }
  }

  return { errors, warnings, counts };
}

export function tierName(tier, i) {
  return tier.label || tier.id || `tier ${i + 1}`;
}

/* ----------------------------------------------------------------------- *
 * Serialisation (share links / JSON I/O)
 * ----------------------------------------------------------------------- */

export function serialize(ex) {
  return JSON.stringify({
    label: ex.label,
    language: ex.language,
    judgement: ex.judgement,
    translation: ex.translation,
    notes: ex.notes,
    tiers: ex.tiers.map((t) => ({
      id: t.id, label: t.label, role: t.role,
      smallcaps: t.smallcaps, italic: t.italic, text: t.text,
    })),
  });
}

export function deserialize(json) {
  const o = typeof json === "string" ? JSON.parse(json) : json;
  const ex = emptyExample();
  Object.assign(ex, {
    label: o.label ?? ex.label,
    language: o.language ?? "",
    judgement: o.judgement ?? "",
    translation: o.translation ?? "",
    notes: o.notes ?? "",
  });
  if (Array.isArray(o.tiers) && o.tiers.length) {
    ex.tiers = o.tiers.map((t) => makeTier(t));
  }
  return ex;
}
