import type { OrnamentFamilyId } from "./essentialOrnaments";

const basePath = "/images/projects/essential-ornaments/chart-cells";

export const ornamentFacsimileDimensions = {
  width: 780,
  height: 240,
} as const;

export const ornamentChartCoverage = {
  sourceRows: 18,
  families: 7,
  gridCells: 126,
  populatedCells: 106,
  auditedVariantSlots: 306,
} as const;

export function ornamentFacsimilePath(
  sourceId: string,
  familyId: OrnamentFamilyId,
): string {
  return `${basePath}/${sourceId}-${familyId}.webp`;
}
