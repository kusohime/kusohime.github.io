/**
 * Renderers for the kinship family tree. Three interchangeable views over the
 * same node set — a pedigree CHART, an indented OUTLINE, and an ancestor FAN —
 * plus a printable result card and a PNG rasteriser. All pure string-builders
 * (DOM-free) so they serve both the live page and image export.
 *
 * Each `node` passed in is a display descriptor:
 *   { sig, path, gen, isEgo, relLabel, term, roman, missing }
 * computed by the component from resolve() + lookup(). The renderers only lay
 * out and draw; they never touch the term engine.
 *
 * Visual language matches the site: IBM Plex Mono, hairline rules, square
 * corners, one restrained red accent (ego / selected / N.B.). No gradients,
 * shadows, or animation.
 */

import { sigOf, decompose, parentPaths } from "./kinship-core.js";

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function trim(s, n) {
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// Approximate glyph advance. IBM Plex Mono is monospace for Latin (~0.6em);
// CJK fall-through glyphs are full-width (~1em). Used to truncate by pixel
// width so wide composite terms (哥哥 / 弟弟 …) never overrun their box.
function charW(ch, size) {
  return (/[㐀-鿿豈-﫿＀-￯　-〿]/.test(ch) ? 1.0 : 0.6) * size;
}
function strW(s, size) {
  let w = 0;
  for (const ch of String(s ?? "")) w += charW(ch, size);
  return w;
}
/** Truncate `s` with an ellipsis so it fits within `maxW` px at `size`. */
function fitText(s, size, maxW) {
  s = String(s ?? "");
  if (strW(s, size) <= maxW) return s;
  let out = "";
  for (const ch of s) {
    if (strW(out, size) + charW(ch, size) + charW("…", size) > maxW) break;
    out += ch;
  }
  return (out || s.slice(0, 1)) + "…";
}

const FONT = 'font-family="IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"';
const LINK_ORDER = { F: 0, M: 1, B: 2, Z: 3, S: 4, D: 5 };

function defaultColors(colors) {
  return {
    ink: "#000", muted: "#555", rule: "#aaa", paper: "transparent",
    accent: "#c81e1e", ego: "#c81e1e", ...(colors || {}),
  };
}

/** Last-step kind of a node path (for child ordering). */
function lastKind(node) {
  return node.path.length ? node.path[node.path.length - 1].kind : "";
}

/** Construction children: nodes whose path is this node's path + one step. */
function childMap(nodes) {
  const kids = new Map(nodes.map((n) => [n.sig, []]));
  nodes.forEach((n) => {
    if (!n.path.length) return;
    const ps = sigOf(n.path.slice(0, -1));
    if (kids.has(ps)) kids.get(ps).push(n);
  });
  kids.forEach((arr) =>
    arr.sort((a, b) => (LINK_ORDER[lastKind(a)] - LINK_ORDER[lastKind(b)]) || a.sig.localeCompare(b.sig)));
  return kids;
}

/* ===================================================================== *
 * Pedigree chart
 * ===================================================================== */

/** Assign each node a horizontal slot (tidy DFS) and read off generations. */
export function layoutChart(nodes) {
  const kids = childMap(nodes);
  const xs = {};
  let counter = 0;
  const ego = nodes.find((n) => n.path.length === 0) || nodes[0];
  (function dfs(n) {
    const cs = kids.get(n.sig) || [];
    if (!cs.length) { xs[n.sig] = counter++; return; }
    cs.forEach(dfs);
    xs[n.sig] = (xs[cs[0].sig] + xs[cs[cs.length - 1].sig]) / 2;
  })(ego);
  nodes.forEach((n) => { if (xs[n.sig] == null) xs[n.sig] = counter++; });
  const gens = nodes.map((n) => n.gen);
  return { xs, leaves: counter, minG: Math.min(...gens), maxG: Math.max(...gens) };
}

export function renderChartSvg(nodes, opts = {}) {
  const c = defaultColors(opts.colors);
  const sel = opts.selectedSig;
  const { xs, leaves, minG, maxG } = layoutChart(nodes);
  const showRoman = opts.roman !== false;
  const boxW = 156, gapX = 18, pad = 16;
  const boxH = showRoman ? 54 : 40;
  const rowH = boxH + 42;
  const X = (sig) => pad + xs[sig] * (boxW + gapX);
  const Y = (gen) => pad + (maxG - gen) * rowH;
  const cxOf = (sig) => X(sig) + boxW / 2;
  const width = pad * 2 + Math.max(0, leaves - 1) * (boxW + gapX) + boxW;
  const height = pad * 2 + (maxG - minG) * rowH + boxH;
  const present = new Set(nodes.map((n) => n.sig));
  const bySig = new Map(nodes.map((n) => [n.sig, n]));

  const lines = [];
  const stroke = (d) => lines.push(`<path d="${d}" fill="none" stroke="${c.rule}" stroke-width="1"/>`);
  nodes.forEach((n) => {
    const pres = parentPaths(n.path).map(sigOf).filter((s) => present.has(s));
    if (!pres.length) return;
    const childTop = Y(n.gen);
    const childCx = cxOf(n.sig);
    if (pres.length >= 2) {
      const p1 = bySig.get(pres[0]), p2 = bySig.get(pres[1]);
      const pBottom = Y(p1.gen) + boxH;
      const x1 = cxOf(p1.sig), x2 = cxOf(p2.sig), midX = (x1 + x2) / 2;
      const barY = (pBottom + childTop) / 2;
      stroke(`M${x1} ${pBottom} V${barY} H${x2} V${pBottom}`); // couple bar with stubs
      const dropMid = (barY + childTop) / 2;
      stroke(`M${midX} ${barY} V${dropMid} H${childCx} V${childTop}`);
    } else {
      const p = bySig.get(pres[0]);
      const pBottom = Y(p.gen) + boxH, pcx = cxOf(p.sig), midY = (pBottom + childTop) / 2;
      stroke(`M${pcx} ${pBottom} V${midY} H${childCx} V${childTop}`);
    }
  });

  const fill = c.paper === "transparent" ? "#fff" : c.paper;
  const tx0 = 9, maxW = boxW - 18;
  const boxes = nodes.map((n, i) => {
    const x = X(n.sig), y = Y(n.gen);
    const isSel = n.sig === sel;
    const bStroke = isSel ? c.accent : n.isEgo ? c.ego : c.rule;
    const sw = isSel ? 1.8 : n.isEgo ? 1.4 : 1;
    const relColor = n.isEgo ? c.ego : c.muted;
    const termColor = n.isEgo ? c.ego : n.missing ? c.muted : c.ink;
    const cid = `kc${i}`;
    const tx = x + tx0;
    // romanization on its own line so the term keeps the full box width
    const roman = showRoman && n.roman
      ? `<text x="${tx}" y="${y + 47}" font-size="9.5" fill="${c.muted}">${esc(fitText(n.roman, 9.5, maxW))}</text>`
      : "";
    return (
      `<g class="kin-cnode" data-sig="${esc(n.sig)}" tabindex="0" role="button" ` +
      `aria-label="${esc(n.relLabel)}: ${esc(n.term)}${n.roman ? " (" + esc(n.roman) + ")" : ""}" style="cursor:pointer">` +
      `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${boxW}" height="${boxH}"/></clipPath>` +
      `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" fill="${fill}" stroke="${bStroke}" stroke-width="${sw}"/>` +
      `<g clip-path="url(#${cid})">` +
      `<text x="${tx}" y="${y + 16}" font-size="10.5" fill="${relColor}">${esc(fitText(n.relLabel, 10.5, maxW))}</text>` +
      `<text x="${tx}" y="${showRoman ? y + 33 : y + 32}" font-size="13" fill="${termColor}">${esc(fitText(n.term, 13, maxW))}</text>` +
      roman +
      `</g>` +
      `</g>`
    );
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ` +
    `${FONT} role="group" aria-label="family tree — pedigree chart">` +
    lines.join("") + boxes.join("") + `</svg>`;
  return { svg, width, height };
}

/* ===================================================================== *
 * Indented outline (default for deep trees / accessibility)
 * ===================================================================== */

export function renderOutlineHtml(nodes, opts = {}) {
  const sel = opts.selectedSig;
  const kids = childMap(nodes);
  const ego = nodes.find((n) => n.path.length === 0) || nodes[0];
  const rows = [];
  (function rec(n, depth) {
    const cls =
      "kin-ol-row" + (n.sig === sel ? " kin-ol-row--sel" : "") + (n.isEgo ? " kin-ol-row--ego" : "");
    const tip = depth ? `<span class="kin-ol-tip">${depth ? "└ " : ""}</span>` : "";
    const roman = n.roman ? ` <span class="kin-ol-roman">${esc(n.roman)}</span>` : "";
    rows.push(
      `<div class="${cls}" data-sig="${esc(n.sig)}" tabindex="0" role="button" ` +
      `style="padding-left:${0.4 + depth * 1.3}rem">` +
      tip +
      `<span class="kin-ol-rel">${esc(n.relLabel)}</span>` +
      `<span class="kin-ol-term${n.missing ? " kin-ol-term--m" : ""}">${esc(n.term)}${roman}</span>` +
      `</div>`,
    );
    (kids.get(n.sig) || []).forEach((k) => rec(k, depth + 1));
  })(ego, 0);
  return `<div class="kin-ol">${rows.join("")}</div>`;
}

/* ===================================================================== *
 * Ancestor fan
 * ===================================================================== */

/** Angle (deg, 0 = right .. 180 = left) of a pure-ascending path. */
function fanAngle(path) {
  let lo = 0, hi = 180;
  for (const s of path) {
    const mid = (lo + hi) / 2;
    if (s.kind === "F") hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

export function renderFanSvg(nodes, opts = {}) {
  const c = defaultColors(opts.colors);
  const sel = opts.selectedSig;
  const anc = nodes.filter((n) => {
    const d = decompose(n.path);
    return !d.sib && d.downs.length === 0; // ego + pure ascending line only
  });
  const maxUp = Math.max(0, ...anc.map((n) => n.gen));
  const ringW = 78, pad = 16, boxW = 108, boxH = 32;
  const R = maxUp * ringW;
  const cx = pad + R;
  const cy = pad + R;
  const width = (pad + R) * 2;
  const height = pad + R + boxH;
  const pt = (r, ang) => {
    const a = (ang * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  };

  const parts = [];
  // generation rings
  for (let g = 1; g <= maxUp; g++) {
    const pts = [];
    for (let t = 0; t <= 180.001; t += 4) { const p = pt(g * ringW, t); pts.push(p[0].toFixed(1) + "," + p[1].toFixed(1)); }
    parts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${c.rule}" stroke-width="1"/>`);
  }
  parts.push(`<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="${c.rule}" stroke-width="1"/>`);

  const fill = c.paper === "transparent" ? "#fff" : c.paper;
  anc.forEach((n, fi) => {
    const g = n.gen;
    const ang = fanAngle(n.path);
    const r = g === 0 ? 0 : (g - 0.5) * ringW;
    const [px, py] = pt(r, ang);
    const isSel = n.sig === sel;
    const bStroke = isSel ? c.accent : n.isEgo ? c.ego : c.rule;
    const sw = isSel ? 1.8 : n.isEgo ? 1.4 : 1;
    const relColor = n.isEgo ? c.ego : c.muted;
    const termColor = n.isEgo ? c.ego : n.missing ? c.muted : c.ink;
    const x = px - boxW / 2, y = py - boxH / 2;
    const cid = `kf${fi}`, maxW = boxW - 10;
    parts.push(
      `<g class="kin-cnode" data-sig="${esc(n.sig)}" tabindex="0" role="button" ` +
      `aria-label="${esc(n.relLabel)}: ${esc(n.term)}" style="cursor:pointer">` +
      `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${boxW}" height="${boxH}"/></clipPath>` +
      `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" fill="${fill}" stroke="${bStroke}" stroke-width="${sw}"/>` +
      `<g clip-path="url(#${cid})">` +
      `<text x="${px}" y="${y + 13}" text-anchor="middle" font-size="9.5" fill="${relColor}">${esc(fitText(n.relLabel, 9.5, maxW))}</text>` +
      `<text x="${px}" y="${y + 25}" text-anchor="middle" font-size="11.5" fill="${termColor}">${esc(fitText(n.term, 11.5, maxW))}</text>` +
      `</g>` +
      `</g>`,
    );
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ` +
    `${FONT} role="group" aria-label="family tree — ancestor fan chart">` +
    parts.join("") + `</svg>`;
  return { svg, width, height };
}

/* ===================================================================== *
 * Result card (printable / export) — unchanged shape
 * ===================================================================== */

export function renderCardSvg(args, colors = {}) {
  const c = { ink: "#000", muted: "#555", rule: "#aaa", accent: "#c81e1e", paper: "#ffffff", ...colors };
  const W = 640, pad = 24;
  const lines = [];
  let y = pad + 10;
  lines.push(`<text x="${pad}" y="${y}" font-size="12" letter-spacing="1.5" fill="${c.muted}">${esc((args.chips || []).join("  ·  ").toUpperCase())}</text>`);
  y += 16;
  lines.push(`<text x="${pad}" y="${y}" font-size="14" fill="${c.muted}">${esc(args.relationLabel)}</text>`);
  y += 38;
  lines.push(`<text x="${pad}" y="${y}" font-size="30" fill="${c.ink}">${esc(args.primary.term)}</text>`);
  if (args.primary.roman) {
    lines.push(`<text x="${pad}" y="${y + 22}" font-size="15" fill="${c.muted}">${esc(args.primary.roman)} — ${esc(args.primary.gloss || "")}</text>`);
    y += 22;
  }
  y += 30;
  lines.push(`<line x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" stroke="${c.rule}"/>`);
  y += 24;
  (args.others || []).forEach((o) => {
    lines.push(`<text x="${pad}" y="${y}" font-size="12" fill="${c.muted}">${esc(o.lang)}</text>`);
    lines.push(`<text x="${pad + 150}" y="${y}" font-size="16" fill="${c.ink}">${esc(trim(o.term, 26))}</text>`);
    if (o.roman) lines.push(`<text x="${pad + 410}" y="${y}" font-size="13" fill="${c.muted}">${esc(trim(o.roman, 24))}</text>`);
    y += 26;
  });
  const H = y + pad;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ` +
    `${FONT} role="img" aria-label="kinship term result card">` +
    `<rect width="100%" height="100%" fill="${c.paper}"/>` +
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="${c.rule}"/>` +
    lines.join("") + `</svg>`;
  return { svg, width: W, height: H };
}

/** Rasterise an SVG string to a PNG Blob. */
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
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("SVG load failed")); };
    img.src = url;
  });
}
