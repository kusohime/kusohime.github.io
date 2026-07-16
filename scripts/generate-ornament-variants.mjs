import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const inventoryFiles = [
  "docs/research/essential-ornaments-inventory-rows-01-06.md",
  "docs/research/essential-ornaments-inventory-rows-07-12.md",
  "docs/research/essential-ornaments-inventory-rows-13-18.md",
];
const outputPath = "src/data/ornamentVariants.generated.json";

const sourcesByRow = {
  1: "santa-maria-1565",
  2: "diruta-1593",
  3: "praetorius-1619",
  4: "playford-1654",
  5: "chambonnieres-1670",
  6: "danglebert-1689",
  7: "purcell-1696",
  8: "hotteterre-1708",
  9: "couperin-1713",
  10: "js-bach-1720",
  11: "muffat-1727",
  12: "rameau-1731",
  13: "quantz-1752",
  14: "cpe-bach-1753",
  15: "marpurg-1750",
  16: "leopold-mozart-1756",
  17: "turk-1789",
  18: "hummel-1828",
};

const expectedCounts = {
  "santa-maria-1565": 11,
  "diruta-1593": 7,
  "praetorius-1619": 11,
  "playford-1654": 11,
  "chambonnieres-1670": 5,
  "danglebert-1689": 18,
  "purcell-1696": 8,
  "hotteterre-1708": 11,
  "couperin-1713": 14,
  "js-bach-1720": 22,
  "muffat-1727": 23,
  "rameau-1731": 9,
  "quantz-1752": 16,
  "cpe-bach-1753": 26,
  "marpurg-1750": 33,
  "leopold-mozart-1756": 27,
  "turk-1789": 32,
  "hummel-1828": 22,
};

const familyIds = [
  "vorschlag",
  "trill",
  "trillVariants",
  "turn",
  "mordent",
  "compoundMordent",
  "slide",
];

function normalizeCell(value) {
  return value
    .replaceAll("`", "")
    .replaceAll("**", "")
    .replaceAll("&nbsp;", " ")
    .replace(/\\\|/g, "|")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(normalizeCell);
}

function isDividerRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function familyFromHeading(heading) {
  const numbered = heading.match(/(?:Family\s+|F)([1-7])\b/i);
  if (numbered) return familyIds[Number(numbered[1]) - 1];

  const lower = heading.toLowerCase();
  if (lower.includes("mordent mit") || lower.includes("battement") || lower.includes("batement") || lower.includes("schneller")) {
    return "compoundMordent";
  }
  if (lower.includes("trillervarianten")) return "trillVariants";
  if (lower.includes("doppelschlag")) return "turn";
  if (lower.includes("vorschlag")) return "vorschlag";
  if (lower.includes("triller")) return "trill";
  if (lower.includes("mordent")) return "mordent";
  if (lower.includes("schleifer")) return "slide";
  return null;
}

function expandInventoryIds(rawValue) {
  const value = normalizeCell(rawValue);
  const tokens = value.match(/[A-Z][A-Z0-9]*(?:-[A-Z0-9]+){2}|\b[A-Z]\d+\b/gi) ?? [];
  if (tokens.length === 0) return [];

  const first = tokens[0];
  const fullPrefix = first.match(/^(.+-F\d-)([A-Z])(\d*)$/i);
  if (!fullPrefix) return [first];

  const [, prefix, , firstNumberRaw] = fullPrefix;
  const fullyQualified = tokens.map((token, index) => {
    if (index === 0 || token.includes("-F")) return token;
    return `${prefix}${token}`;
  });

  if (/\bto\b|\s[-–—]\s/.test(value) && fullyQualified.length >= 2) {
    const start = fullyQualified[0].match(/^(.+-F\d-)([A-Z])(\d+)$/i);
    const end = fullyQualified.at(-1).match(/^(.+-F\d-)([A-Z])(\d+)$/i);
    if (start && end && start[1] === end[1] && start[2] === end[2]) {
      const expanded = [];
      for (let number = Number(start[3]); number <= Number(end[3]); number += 1) {
        expanded.push(`${start[1]}${start[2]}${number}`);
      }
      return expanded;
    }
  }

  if (fullyQualified.length > 1) return fullyQualified;
  if (firstNumberRaw) return [first];
  return [first];
}

function findColumn(headers, patterns) {
  return headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
}

function confidenceLevel(note) {
  const lower = note.toLowerCase();
  if (/low[- ]medium/.test(lower)) return "low-medium";
  if (/medium[- ]low/.test(lower)) return "medium-low";
  if (/medium[- ]high/.test(lower)) return "medium-high";
  if (/high[- ]medium/.test(lower)) return "high-medium";
  if (/^m[- ]h\b/i.test(note)) return "medium-high";
  if (/^h[- ]m\b/i.test(note)) return "high-medium";
  if (/^l[- ]m\b/i.test(note)) return "low-medium";
  if (/^m[- ]l\b/i.test(note)) return "medium-low";
  if (/\bhigh\b/.test(lower)) return "high";
  if (/\bmedium\b/.test(lower)) return "medium";
  if (/\blow\b/.test(lower)) return "low";
  if (/^h(?:\b|\.)/i.test(note)) return "high";
  if (/^m(?:\b|\.)/i.test(note)) return "medium";
  if (/^l(?:\b|\.)/i.test(note)) return "low";
  return "unspecified";
}

function uncertaintyFrom(note, contour, rhythm) {
  const joined = [note, contour, rhythm].filter(Boolean).join(" ");
  const uncertain = /\b(?:approx(?:imately)?|uncertain|unclear|obscured|blurred|crowded|overlap|partly|possible|possibly|likely|may|might|less certain|not fully|not reliably|must not be invented|needs? .*check|should be .*check|recheck|verify|depends?|omitted clef|no clef|unspecified)\b|\?/i;
  return uncertain.test(joined) ? note || "See contour and rhythm summaries for unresolved details." : null;
}

function inferRole({ heading, idHeader, signHeader, sign, contour, rhythm, confidence }) {
  const joined = [heading, idHeader, signHeader, sign, contour, rhythm, confidence].filter(Boolean).join(" ").toLowerCase();
  if (/sign[- ]only|not supplied on the sheet|no (?:written |separate )?realization|realization .* blank|must not be invented|sign vocabulary|sign variants?|glyph rows?/.test(joined)) {
    return "sign";
  }
  if (/contextual|\bplacement\b|\boccurrence\b|\bexcerpt\b|\bpassage\b|continuous exercise|continuous pedagogical/.test(joined)) {
    return "context";
  }
  return "realization";
}

function nameFor({ printedTerm, sign, heading, inventoryId, groupSize }) {
  const base = printedTerm && !/^same$/i.test(printedTerm)
    ? printedTerm
    : sign || heading.replace(/^#+\s*/, "") || "Unnamed ornament variant";
  return groupSize > 1 ? `${base} (${inventoryId})` : base;
}

function rowNumberFromHeading(line) {
  const match = line.match(/^##\s+(?:Row\s+)?(\d{1,2})(?:\.|\s+-)/i);
  return match ? Number(match[1]) : null;
}

function normalizePrintedTerm(value) {
  if (!value || /^(?:\[none\]|none|no term printed(?: in this row)?|\[term not printed\])$/i.test(value)) {
    return null;
  }
  return value;
}

function parseInventory(markdown, auditSource) {
  const lines = markdown.split(/\r?\n/);
  const records = [];
  let sourceId = null;
  let familyId = null;
  let familyHeading = "";
  let headers = null;
  let lastPrintedTerm = null;

  for (const line of lines) {
    const rowNumber = rowNumberFromHeading(line);
    if (rowNumber) {
      sourceId = sourcesByRow[rowNumber] ?? null;
      familyId = null;
      headers = null;
      lastPrintedTerm = null;
      continue;
    }

    if (line.startsWith("### ")) {
      familyHeading = normalizeCell(line.slice(4));
      familyId = familyFromHeading(familyHeading);
      headers = null;
      lastPrintedTerm = null;
      continue;
    }

    if (!line.trim().startsWith("|")) {
      headers = null;
      continue;
    }

    const cells = splitTableRow(line);
    if (isDividerRow(cells)) continue;

    const first = cells[0]?.toLowerCase();
    if (first === "id" || first === "ids") {
      headers = cells.map((cell) => cell.toLowerCase());
      lastPrintedTerm = null;
      continue;
    }

    if (!headers || !sourceId || !familyId) continue;

    if (cells.length === headers.length + 1) {
      const contourColumn = findColumn(headers, [/realization/, /pitch contour/, /associated realization/]);
      if (contourColumn >= 0) {
        cells.splice(contourColumn, 2, `${cells[contourColumn]}. ${cells[contourColumn + 1]}`);
      }
    }
    if (cells.length !== headers.length) {
      throw new Error(
        `${auditSource}: table row has ${cells.length} cells but its header has ${headers.length}: ${cells[0]}`,
      );
    }

    const ids = expandInventoryIds(cells[0]);
    if (ids.length === 0) continue;

    const printedTermIndex = findColumn(headers, [/printed term/]);
    const contourIndex = findColumn(headers, [/realization/, /pitch contour/, /associated realization/]);
    const rhythmIndex = findColumn(headers, [/^rhythm/]);
    const confidenceIndex = findColumn(headers, [/confidence/]);
    const signIndex = findColumn(headers, [/\bsign\b/, /glyph/, /source notation/, /^position$/, /context/, /sign \/ notation/]);

    const rawPrintedTerm = printedTermIndex >= 0 ? cells[printedTermIndex] || null : null;
    const printedTerm = /^same$/i.test(rawPrintedTerm ?? "")
      ? lastPrintedTerm
      : normalizePrintedTerm(rawPrintedTerm);
    if (printedTerm) lastPrintedTerm = printedTerm;
    const contourSummary = contourIndex >= 0 ? cells[contourIndex] || null : null;
    const rhythmSummary = rhythmIndex >= 0 ? cells[rhythmIndex] || null : null;
    const confidenceNote = confidenceIndex >= 0 ? cells[confidenceIndex] || "Unspecified" : "Unspecified";
    const signSummary = signIndex >= 0 ? cells[signIndex] || null : null;
    const role = inferRole({
      heading: familyHeading,
      idHeader: headers[0],
      signHeader: signIndex >= 0 ? headers[signIndex] : "",
      sign: signSummary,
      contour: contourSummary,
      rhythm: rhythmSummary,
      confidence: confidenceNote,
    });

    for (const inventoryId of ids) {
      records.push({
        id: inventoryId.toLowerCase(),
        inventoryId,
        sourceId,
        familyId,
        printedTerm,
        name: nameFor({ printedTerm, sign: signSummary, heading: familyHeading, inventoryId, groupSize: ids.length }),
        role,
        signSummary,
        contourSummary,
        rhythmSummary,
        confidence: confidenceLevel(confidenceNote),
        confidenceNote,
        uncertainty: uncertaintyFrom(confidenceNote, contourSummary, rhythmSummary),
        cellKey: `${sourceId}:${familyId}`,
        witnessPath: `/images/projects/essential-ornaments/chart-cells/${sourceId}-${familyId}.webp`,
        auditSource,
      });
    }
  }

  return records;
}

const records = [];
for (const inventoryFile of inventoryFiles) {
  const markdown = await readFile(path.join(ROOT, inventoryFile), "utf8");
  records.push(...parseInventory(markdown, path.basename(inventoryFile)));
}

const ids = new Set(records.map((record) => record.id));
if (ids.size !== records.length) {
  throw new Error(`Duplicate variant IDs detected: ${records.length - ids.size}`);
}

const counts = Object.fromEntries(Object.keys(expectedCounts).map((sourceId) => [sourceId, 0]));
for (const record of records) counts[record.sourceId] += 1;

for (const [sourceId, expected] of Object.entries(expectedCounts)) {
  if (counts[sourceId] !== expected) {
    throw new Error(`${sourceId}: expected ${expected} variants, parsed ${counts[sourceId]}`);
  }
}

if (records.length !== 306) {
  throw new Error(`Expected 306 variants, parsed ${records.length}`);
}

await mkdir(path.dirname(path.join(ROOT, outputPath)), { recursive: true });
await writeFile(path.join(ROOT, outputPath), `${JSON.stringify(records, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ outputPath, total: records.length, counts }, null, 2));
