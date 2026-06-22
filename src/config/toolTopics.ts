/**
 * 中文：把作曲工具按主题归并到同一页。每个 topic 是一页，聚合若干相关工具。
 * English: Groups Composition tools onto shared pages. Each topic is one page that
 * gathers several related tools. Linguistics tools are not grouped and keep their
 * own pages.
 * Caveat / 注意：要把工具加进某个主题，只需把它的 slug 加到下面对应的 tools 数组；
 * 顺序即为页面上的排列顺序。无需改动 frontmatter。
 * Caveat: To put a tool in a topic, add its slug to that topic's `tools` array
 * (order = on-page order). No frontmatter change needed.
 */
import type { ToolGroup } from "./contentTaxonomy";
import type { Locale } from "./locales";

export interface ToolTopicDef {
  id: string;
  group: ToolGroup;
  label: Record<Locale, string>;
  blurb?: Record<Locale, string>;
  tools: string[];
}

export const toolTopicList: ToolTopicDef[] = [
  {
    id: "rhythm",
    group: "Composition",
    label: {
      en: "Rhythm",
      zh: "節奏",
    },
    tools: ["metric-modulation", "polyrhythm-cycles", "fugue-exposition"],
  },
  {
    id: "sets-scales",
    group: "Composition",
    label: {
      en: "Pitch",
      zh: "音高",
    },
    tools: ["pc-set-analysis", "twelve-tone-lab", "messiaen-modes"],
  },
  {
    id: "harmony",
    group: "Composition",
    label: {
      en: "Motif",
      zh: "動機",
    },
    tools: ["melody-transformer", "neo-riemannian", "negative-harmony"],
  },
  {
    id: "tuning-spectra",
    group: "Composition",
    label: {
      en: "Acoustics",
      zh: "律制",
    },
    tools: [
      "pitch-tuning-lab",
      "harmonic-partials",
      "spectral-roughness",
      "string-harmonics",
    ],
  },
];

export const toolTopicById = Object.fromEntries(
  toolTopicList.map((topic) => [topic.id, topic]),
) as Record<string, ToolTopicDef>;

// slug → topic id, so a tool's page can redirect to its group page.
const legacyTopicForSlug: Record<string, string> = {
  "piano-harmonics": "tuning-spectra",
};

export const topicForSlug: Record<string, string> = {
  ...Object.fromEntries(
    toolTopicList.flatMap((topic) => topic.tools.map((slug) => [slug, topic.id])),
  ),
  ...legacyTopicForSlug,
};

export const anchorForSlug: Record<string, string> = {
  "piano-harmonics": "string-harmonics",
};

export function topicsForGroup(group: ToolGroup) {
  return toolTopicList.filter((topic) => topic.group === group);
}

export function toolTopicLabel(topicId: string, locale: Locale) {
  return toolTopicById[topicId]?.label[locale] ?? topicId;
}

export function toolTopicBlurb(topicId: string, locale: Locale) {
  return toolTopicById[topicId]?.blurb?.[locale] ?? "";
}
