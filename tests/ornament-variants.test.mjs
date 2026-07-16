import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(path.join(projectRoot, "src/data/ornamentVariants.generated.json"), "utf8"),
);

const expectedCountBySource = {
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

const familyIds = new Set([
  "vorschlag",
  "trill",
  "trillVariants",
  "turn",
  "mordent",
  "compoundMordent",
  "slide",
]);
const roles = new Set(["sign", "realization", "context"]);

test("ornament variant catalog has 306 unique, addressable records", () => {
  assert.equal(catalog.length, 306);
  assert.equal(new Set(catalog.map((variant) => variant.id)).size, 306);

  for (const variant of catalog) {
    assert.match(variant.id, /^[a-z0-9]+(?:-[a-z0-9]+)+$/);
    assert.equal(typeof variant.name, "string");
    assert.ok(variant.name.length > 0);
    assert.ok(familyIds.has(variant.familyId));
    assert.ok(roles.has(variant.role));
    assert.equal(typeof variant.contourSummary, "string");
    assert.equal(typeof variant.rhythmSummary, "string");
    assert.equal(typeof variant.confidence, "string");
    assert.equal(typeof variant.confidenceNote, "string");
    assert.ok(variant.printedTerm === null || typeof variant.printedTerm === "string");
    assert.ok(variant.uncertainty === null || typeof variant.uncertainty === "string");

    const expectedCellKey = `${variant.sourceId}:${variant.familyId}`;
    const expectedWitnessPath = `/images/projects/essential-ornaments/chart-cells/${variant.sourceId}-${variant.familyId}.webp`;
    assert.equal(variant.cellKey, expectedCellKey);
    assert.equal(variant.witnessPath, expectedWitnessPath);
    assert.ok(existsSync(path.join(projectRoot, "public", variant.witnessPath)));
    assert.ok(existsSync(path.join(projectRoot, "docs/research", variant.auditSource)));
  }
});

test("catalog matches the audited source and populated-cell counts", () => {
  const actualCountBySource = Object.fromEntries(
    Object.keys(expectedCountBySource).map((sourceId) => [
      sourceId,
      catalog.filter((variant) => variant.sourceId === sourceId).length,
    ]),
  );

  assert.deepEqual(actualCountBySource, expectedCountBySource);
  assert.equal(new Set(catalog.map((variant) => variant.cellKey)).size, 106);
});
