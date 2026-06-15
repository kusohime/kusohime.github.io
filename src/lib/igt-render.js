/**
 * Renderers for Interlinear Glossed Text. Each takes the Example model from
 * igt-core.js and produces one output form: plain text, a live HTML preview,
 * LaTeX (expex / gb4e / tabular), or an image (SVG / PNG). They all lean on
 * the shared layout() engine so wrapping and column widths stay consistent.
 */

import {
  layout, tokenizeWords, stringWidth, glossSubParts, isCategoryLabel,
} from "./igt-core.js";

/* Leipzig standard abbreviations (subset) for the legend + tooltips. */
export const ABBREVIATIONS = {
  "1": "first person", "2": "second person", "3": "third person",
  ABL: "ablative", ABS: "absolutive", ACC: "accusative", ADJ: "adjective",
  ADV: "adverb(ial)", AGR: "agreement", ART: "article", AUX: "auxiliary",
  BEN: "benefactive", CAUS: "causative", CLF: "classifier", COM: "comitative",
  COMP: "complementizer", COND: "conditional", COP: "copula", DAT: "dative",
  DECL: "declarative", DEF: "definite", DEM: "demonstrative", DET: "determiner",
  DIST: "distal", DU: "dual", ERG: "ergative", EXCL: "exclusive", F: "feminine",
  FUT: "future", GEN: "genitive", IMP: "imperative", INCL: "inclusive",
  IND: "indicative", INDF: "indefinite", INF: "infinitive", INS: "instrumental",
  INTR: "intransitive", IPFV: "imperfective", LOC: "locative", M: "masculine",
  N: "neuter", NEG: "negation", NMLZ: "nominalizer", NOM: "nominative",
  OBJ: "object", OBL: "oblique", PASS: "passive", PFV: "perfective",
  PL: "plural", POSS: "possessive", PRF: "perfect", PRS: "present",
  PRES: "present", PROG: "progressive", PROH: "prohibitive", PROX: "proximal",
  PST: "past", PTCP: "participle", Q: "question particle", REFL: "reflexive",
  REL: "relative", SBJ: "subject", SBJV: "subjunctive", SG: "singular",
  TOP: "topic", TR: "transitive", VOC: "vocative",
};

/** Abbreviations actually used in a gloss tier, for the legend panel. */
export function collectAbbreviations(ex) {
  const used = new Map();
  ex.tiers
    .filter((t) => t.role === "aligned" && t.smallcaps)
    .forEach((t) => {
      tokenizeWords(t.text).forEach((word) => {
        glossSubParts(word).forEach((sub) => {
          if (sub === "." || sub === ":") return;
          if (isCategoryLabel(sub) && ABBREVIATIONS[sub]) {
            used.set(sub, ABBREVIATIONS[sub]);
          }
        });
      });
    });
  return [...used.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

/* ----------------------------------------------------------------------- *
 * Plain text (monospace alignment)
 * ----------------------------------------------------------------------- */

export function renderText(ex, { maxWidth = 80 } = {}) {
  const lay = layout(ex, {
    measure: (cell) => stringWidth(cell),
    maxWidth,
    colGap: 2,
  });
  const out = [];
  lay.lines.forEach((line, li) => {
    if (li > 0) out.push("");
    line.rows.forEach((row) => {
      let s = "";
      row.cells.forEach((cell, ci) => {
        if (ci > 0) s += "  ";
        const pad = cell.width - stringWidth(cell.text);
        s += cell.text + " ".repeat(Math.max(0, pad));
      });
      out.push(s.replace(/\s+$/, ""));
    });
  });
  const head = [ex.label, ex.language].filter(Boolean).join("  ");
  const lines = [];
  if (head) lines.push(head);
  lines.push(...out);
  if (ex.translation) lines.push(`‘${ex.translation}’`);
  return lines.join("\n");
}

/* ----------------------------------------------------------------------- *
 * Live HTML preview (builds DOM)
 * ----------------------------------------------------------------------- */

function smallcapsHtml(word, doc) {
  const frag = doc.createDocumentFragment();
  glossSubParts(word).forEach((sub) => {
    if (sub === "." || sub === ":") {
      frag.append(doc.createTextNode(sub));
    } else if (isCategoryLabel(sub)) {
      const span = doc.createElement("span");
      span.className = "igt-sc";
      span.textContent = sub;
      frag.append(span);
    } else {
      frag.append(doc.createTextNode(sub));
    }
  });
  return frag;
}

/**
 * Render into a host element. Pure DOM; the page calls this on every edit.
 * @param {HTMLElement} host
 */
export function renderHtml(host, ex, { fontFamily } = {}) {
  const doc = host.ownerDocument;
  host.innerHTML = "";
  const block = doc.createElement("div");
  block.className = "igt-block";
  if (fontFamily) block.style.setProperty("--igt-font", fontFamily);

  if (ex.label) {
    const lab = doc.createElement("span");
    lab.className = "igt-label";
    lab.textContent = (ex.judgement ? ex.judgement + " " : "") + ex.label;
    block.append(lab);
  }

  const body = doc.createElement("div");
  body.className = "igt-body";

  const aligned = ex.tiers.filter((t) => t.role === "aligned");
  const wordsPerTier = aligned.map((t) => tokenizeWords(t.text));
  const colCount = Math.max(0, ...wordsPerTier.map((w) => w.length));

  for (let c = 0; c < colCount; c++) {
    const col = doc.createElement("div");
    col.className = "igt-col";
    aligned.forEach((tier, ti) => {
      const cell = doc.createElement("div");
      cell.className = "igt-cell";
      if (tier.italic) cell.classList.add("igt-italic");
      const word = wordsPerTier[ti][c] ?? "";
      if (tier.smallcaps) cell.append(smallcapsHtml(word, doc));
      else cell.textContent = word;
      col.append(cell);
    });
    body.append(col);
  }
  block.append(body);

  if (ex.translation) {
    const tr = doc.createElement("div");
    tr.className = "igt-translation";
    tr.textContent = `‘${ex.translation}’`;
    block.append(tr);
  }
  host.append(block);
}

/* ----------------------------------------------------------------------- *
 * LaTeX
 * ----------------------------------------------------------------------- */

function escapeLatex(s) {
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

/** Wrap ALLCAPS labels in \textsc{} (lowercased); escape the rest. */
function latexGlossWord(word) {
  return glossSubParts(word)
    .map((sub) => {
      if (sub === "." || sub === ":") return sub;
      if (isCategoryLabel(sub)) return `\\textsc{${escapeLatex(sub.toLowerCase())}}`;
      return escapeLatex(sub);
    })
    .join("");
}

function tierLatex(tier) {
  const words = tokenizeWords(tier.text);
  const body = words
    .map((w) => (tier.smallcaps ? latexGlossWord(w) : escapeLatex(w)))
    .join(" ");
  return tier.italic ? `\\textit{${body}}` : body;
}

const ENGINE_PREAMBLE = {
  expex: "\\usepackage{expex}",
  gb4e: "\\usepackage{gb4e}\n\\let\\eachwordone=\\itshape % optional",
  tabular: "% no package required",
};

export function renderLatex(ex, { engine = "expex" } = {}) {
  const aligned = ex.tiers.filter((t) => t.role === "aligned" && t.text.trim());
  const trans = ex.translation
    ? `‘${escapeLatex(ex.translation)}’`
    : "";

  let body;
  if (engine === "gb4e") {
    const cmd = aligned.length >= 3 ? "\\glll" : "\\gll";
    const rows = aligned.map((t) => tierLatex(t)).join(" \\\\\n     ");
    body =
      `\\begin{exe}\n\\ex\n${cmd} ${rows} \\\\\n` +
      (trans ? `\\glt ${trans}\n` : "") +
      `\\end{exe}`;
  } else if (engine === "tabular") {
    const cols = Math.max(0, ...aligned.map((t) => tokenizeWords(t.text).length));
    const rows = aligned
      .map((t) => {
        const cells = tokenizeWords(t.text).map((w) =>
          t.smallcaps ? latexGlossWord(w) : escapeLatex(w),
        );
        while (cells.length < cols) cells.push("");
        const joined = cells.join(" & ");
        return t.italic ? `\\itshape ${joined}` : joined;
      })
      .join(" \\\\\n  ");
    body =
      `\\begin{tabular}{${"l".repeat(Math.max(1, cols))}}\n  ${rows} \\\\\n` +
      `\\end{tabular}` +
      (trans ? `\n\n${trans}` : "");
  } else {
    // expex (default)
    const letters = ["\\gla", "\\glb", "\\glc", "\\gld", "\\gle"];
    const rows = aligned
      .map((t, i) => `${letters[i] || "\\gla"} ${tierLatex(t)} //`)
      .join("\n");
    body =
      `\\ex\n\\begingl\n${rows}\n` +
      (trans ? `\\glft ${trans} //\n` : "") +
      `\\endgl\n\\xe`;
  }

  return {
    preamble: ENGINE_PREAMBLE[engine] || ENGINE_PREAMBLE.expex,
    body,
  };
}

/* ----------------------------------------------------------------------- *
 * Image: SVG + PNG (canvas measurement)
 * ----------------------------------------------------------------------- */

function measurer(fontFamily, fontSize) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  return (cell, tier) => {
    ctx.font = `${tier && tier.italic ? "italic " : ""}${fontSize}px ${fontFamily}`;
    return ctx.measureText(cell).width;
  };
}

function svgEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svgTspansForGloss(word, fontSize) {
  // Small caps approximated by scaling uppercase to 0.8em.
  return glossSubParts(word)
    .map((sub) => {
      if (sub === "." || sub === ":") return svgEscape(sub);
      if (isCategoryLabel(sub)) {
        return `<tspan font-size="${(fontSize * 0.82).toFixed(1)}">${svgEscape(sub)}</tspan>`;
      }
      return svgEscape(sub);
    })
    .join("");
}

/**
 * Build an SVG string. Layout is computed in pixels via canvas measurement.
 * @returns {{ svg:string, width:number, height:number }}
 */
export function renderSvg(ex, {
  fontFamily = "Gentium Plus, Charis SIL, serif",
  fontSize = 18,
  maxWidth = 680,
  background = "transparent",
  color = "#111111",
} = {}) {
  const pad = 16;
  const colGap = fontSize * 0.9;
  const lineLead = fontSize * 1.45;
  const lay = layout(ex, {
    measure: measurer(fontFamily, fontSize),
    maxWidth: maxWidth - pad * 2,
    colGap,
  });

  const parts = [];
  let y = pad + fontSize;
  let maxX = 0;

  if (ex.label || ex.language) {
    const head = [ex.judgement, ex.label, ex.language].filter(Boolean).join("  ");
    parts.push(
      `<text x="${pad}" y="${y}" font-style="italic">${svgEscape(head)}</text>`,
    );
    y += lineLead;
  }

  lay.lines.forEach((line, li) => {
    if (li > 0) y += lineLead * 0.4;
    line.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        const x = pad + cell.x;
        const style = row.tier.italic ? ' font-style="italic"' : "";
        const content = row.tier.smallcaps
          ? svgTspansForGloss(cell.text, fontSize)
          : svgEscape(cell.text);
        parts.push(`<text x="${x}" y="${y}"${style}>${content}</text>`);
        maxX = Math.max(maxX, x + cell.width);
      });
      y += lineLead;
    });
  });

  if (ex.translation) {
    y += lineLead * 0.1;
    parts.push(
      `<text x="${pad}" y="${y}">‘${svgEscape(ex.translation)}’</text>`,
    );
    maxX = Math.max(maxX, pad + 200);
    y += lineLead;
  }

  const width = Math.ceil(Math.max(maxX + pad, 120));
  const height = Math.ceil(y - fontSize + pad);
  const bg =
    background === "transparent"
      ? ""
      : `<rect width="100%" height="100%" fill="${background}"/>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}" font-family="${svgEscape(fontFamily)}" ` +
    `font-size="${fontSize}" fill="${color}">${bg}${parts.join("")}</svg>`;
  return { svg, width, height };
}

/** Rasterise an SVG string to a PNG Blob via canvas. */
export function svgToPng(svg, width, height, scale = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG load failed"));
    };
    img.src = url;
  });
}
