import rawOrnamentVariants from "./ornamentVariants.generated.json";
import {
  essentialOrnamentSources,
  ornamentFamilies,
  type OrnamentFamilyId,
} from "./essentialOrnaments";

export type OrnamentVariantRole = "sign" | "realization" | "context";

export type OrnamentVariantConfidence =
  | "high"
  | "high-medium"
  | "medium-high"
  | "medium"
  | "medium-low"
  | "low-medium"
  | "low"
  | "unspecified";

export interface OrnamentVariant {
  /** Stable, lowercase identifier derived from the audit's diplomatic ID. */
  id: string;
  /** Identifier exactly as printed in the audit; ranges are already expanded. */
  inventoryId: string;
  sourceId: string;
  familyId: OrnamentFamilyId;
  /** Null means the comparison chart does not print a term for this slot. */
  printedTerm: string | null;
  /** Human-readable fallback that is always present, including unnamed slots. */
  name: string;
  role: OrnamentVariantRole;
  signSummary: string | null;
  /** Relative contour or cautious prose; never an inferred absolute-pitch claim. */
  contourSummary: string | null;
  rhythmSummary: string | null;
  confidence: OrnamentVariantConfidence;
  /** Full diplomatic confidence wording from the inventory. */
  confidenceNote: string;
  /** Null means the inventory records no specific unresolved issue. */
  uncertainty: string | null;
  /** Stable `sourceId:familyId` key for joining variants to chart cells. */
  cellKey: string;
  /** Lossless full-cell witness containing this variant. */
  witnessPath: string;
  /** Filename of the permanent Markdown audit from which this record was generated. */
  auditSource: string;
}

const allowedSourceIds = new Set(essentialOrnamentSources.map((source) => source.id));
const allowedFamilyIds = new Set<OrnamentFamilyId>(ornamentFamilies.map((family) => family.id));
const allowedRoles = new Set<OrnamentVariantRole>(["sign", "realization", "context"]);
const allowedConfidence = new Set<OrnamentVariantConfidence>([
  "high",
  "high-medium",
  "medium-high",
  "medium",
  "medium-low",
  "low-medium",
  "low",
  "unspecified",
]);

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function assertVariant(value: unknown, index: number): asserts value is OrnamentVariant {
  if (!value || typeof value !== "object") {
    throw new TypeError(`Ornament variant ${index} is not an object.`);
  }

  const variant = value as Partial<OrnamentVariant>;
  const requiredStrings: (keyof OrnamentVariant)[] = [
    "id",
    "inventoryId",
    "sourceId",
    "familyId",
    "name",
    "confidenceNote",
    "cellKey",
    "witnessPath",
    "auditSource",
  ];

  for (const field of requiredStrings) {
    if (typeof variant[field] !== "string" || variant[field].length === 0) {
      throw new TypeError(`Ornament variant ${index} has an invalid ${field}.`);
    }
  }

  if (typeof variant.sourceId !== "string" || !allowedSourceIds.has(variant.sourceId)) {
    throw new TypeError(`Ornament variant ${variant.id} has an unknown sourceId.`);
  }
  if (!allowedFamilyIds.has(variant.familyId as OrnamentFamilyId)) {
    throw new TypeError(`Ornament variant ${variant.id} has an unknown familyId.`);
  }
  if (!allowedRoles.has(variant.role as OrnamentVariantRole)) {
    throw new TypeError(`Ornament variant ${variant.id} has an unknown role.`);
  }
  if (!allowedConfidence.has(variant.confidence as OrnamentVariantConfidence)) {
    throw new TypeError(`Ornament variant ${variant.id} has an unknown confidence value.`);
  }

  for (const field of [
    "printedTerm",
    "signSummary",
    "contourSummary",
    "rhythmSummary",
    "uncertainty",
  ] as const) {
    if (!isNullableString(variant[field])) {
      throw new TypeError(`Ornament variant ${variant.id} has an invalid ${field}.`);
    }
  }

  const expectedCellKey = `${variant.sourceId}:${variant.familyId}`;
  const expectedWitnessPath = `/images/projects/essential-ornaments/chart-cells/${variant.sourceId}-${variant.familyId}.webp`;
  if (variant.cellKey !== expectedCellKey || variant.witnessPath !== expectedWitnessPath) {
    throw new TypeError(`Ornament variant ${variant.id} is linked to the wrong chart witness.`);
  }
}

function assertCatalog(value: unknown): asserts value is OrnamentVariant[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The ornament variant catalog must be an array.");
  }
  value.forEach(assertVariant);
}

assertCatalog(rawOrnamentVariants);

const variantIds = new Set(rawOrnamentVariants.map((variant) => variant.id));
if (rawOrnamentVariants.length !== 306 || variantIds.size !== 306) {
  throw new Error("The ornament variant catalog must contain exactly 306 unique records.");
}

export const ornamentVariants: readonly OrnamentVariant[] = rawOrnamentVariants;

function groupVariants(
  keyFor: (variant: OrnamentVariant) => string,
): Readonly<Record<string, readonly OrnamentVariant[]>> {
  const groups: Record<string, OrnamentVariant[]> = {};
  for (const variant of ornamentVariants) {
    const key = keyFor(variant);
    (groups[key] ??= []).push(variant);
  }
  return Object.freeze(
    Object.fromEntries(
      Object.entries(groups).map(([key, variants]) => [key, Object.freeze(variants)]),
    ),
  );
}

export const ornamentVariantsByCell = groupVariants((variant) => variant.cellKey);
export const ornamentVariantsBySource = groupVariants((variant) => variant.sourceId);

export const ornamentVariantCountByCell = Object.freeze(
  Object.fromEntries(
    Object.entries(ornamentVariantsByCell).map(([cellKey, variants]) => [cellKey, variants.length]),
  ),
);

export const ornamentVariantCountBySource = Object.freeze(
  Object.fromEntries(
    Object.entries(ornamentVariantsBySource).map(([sourceId, variants]) => [sourceId, variants.length]),
  ),
);

const populatedCellKeys = new Set(
  essentialOrnamentSources.flatMap((source) =>
    (Object.keys(source.terms) as OrnamentFamilyId[]).map(
      (familyId) => `${source.id}:${familyId}`,
    ),
  ),
);
if (
  populatedCellKeys.size !== 106 ||
  Object.keys(ornamentVariantsByCell).length !== populatedCellKeys.size ||
  [...populatedCellKeys].some((cellKey) => !ornamentVariantsByCell[cellKey])
) {
  throw new Error("The ornament variant catalog does not match the 106-cell source manifest.");
}

export const ornamentVariantCoverage = {
  total: ornamentVariants.length,
  populatedCells: Object.keys(ornamentVariantsByCell).length,
  bySource: ornamentVariantCountBySource,
  byCell: ornamentVariantCountByCell,
  byRole: {
    sign: ornamentVariants.filter((variant) => variant.role === "sign").length,
    realization: ornamentVariants.filter((variant) => variant.role === "realization").length,
    context: ornamentVariants.filter((variant) => variant.role === "context").length,
  },
} as const;

export function getOrnamentVariantsByCell(
  sourceId: string,
  familyId: OrnamentFamilyId,
): readonly OrnamentVariant[] {
  const cellKey = `${sourceId}:${familyId}`;
  return ornamentVariantsByCell[cellKey] ?? [];
}

export function ornamentVariantAnchorId(variant: Pick<OrnamentVariant, "id">): string {
  return `ornament-variant-${variant.id}`;
}
