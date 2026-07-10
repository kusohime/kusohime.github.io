/**
 * 中文：定义作品类别、文章标签及其固定显示顺序。
 * English: Defines work categories, writing tags, and their display order.
 * Caveat / 注意：新增值时也要确保 content.config.ts 的 schema 能接受它。
 * Caveat: New values must also remain accepted by the content.config.ts schema.
 */
export const workCategories = [
  "Solo",
  "Chamber",
  "Large Ensemble",
  "Orchestral",
  "Vocal / Choral",
  "Other",
] as const;

export const writingTypes = [
  "Translation",
  "Essay",
  "Drama",
  "Fiction",
  "Blog",
  "Poetry",
  "French",
  "Russian",
  "Philosophy",
  "Moral Philosophy",
  "Affect Theory",
  "Psychoanalysis",
  "Philology",
  "Program Note",
  "Review",
  "Other",
  "Linguistics",
  "Theology",
  "Apologetics",
] as const;

export const toolGroups = [
  "Composition",
  "Linguistics",
] as const;

export type WorkCategory = (typeof workCategories)[number];
export type WritingType = (typeof writingTypes)[number];
export type ToolGroup = (typeof toolGroups)[number];

export function toAnchor(value: string) {
  return value
    .toLowerCase()
    .replace(/\s*\/\s*/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
