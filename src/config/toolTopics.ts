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
  blurb: Record<Locale, string>;
  tools: string[];
}

export const toolTopicList: ToolTopicDef[] = [
  {
    id: "rhythm",
    group: "Composition",
    label: {
      en: "Rhythm, Canon & Counterpoint",
      zh: "節奏、卡農與對位",
    },
    blurb: {
      en: "Tempo relationships, coincidence cycles, imitative entries.",
      zh: "速度關係、重合循環、模仿式進入。",
    },
    tools: ["metric-modulation", "polyrhythm-cycles", "fugue-exposition"],
  },
  {
    id: "sets-scales",
    group: "Composition",
    label: {
      en: "Sets, Scales & Rows",
      zh: "音級集合、音階與序列",
    },
    blurb: {
      en: "Pitch-class set theory, serial rows, symmetric modes.",
      zh: "音級集合理論、十二音序列、對稱調式。",
    },
    tools: ["pc-set-analysis", "twelve-tone-lab", "messiaen-modes"],
  },
  {
    id: "harmony",
    group: "Composition",
    label: {
      en: "Harmony & Transformation",
      zh: "和聲與變換",
    },
    blurb: {
      en: "Operations on lines and chords, triadic and axial transforms.",
      zh: "對旋律與和弦的操作、三和弦與軸對稱變換。",
    },
    tools: ["melody-transformer", "neo-riemannian", "negative-harmony"],
  },
  {
    id: "tuning-spectra",
    group: "Composition",
    label: {
      en: "Tuning, Spectra & Acoustics",
      zh: "調律、頻譜與聲學",
    },
    blurb: {
      en: "Pitch conversion, the harmonic series, roughness, instrument acoustics.",
      zh: "音高換算、泛音列、粗糙度、樂器聲學。",
    },
    tools: [
      "pitch-tuning-lab",
      "harmonic-partials",
      "spectral-roughness",
      "piano-harmonics",
    ],
  },
];

export const toolTopicById = Object.fromEntries(
  toolTopicList.map((topic) => [topic.id, topic]),
) as Record<string, ToolTopicDef>;

// slug → topic id, so a tool's page can redirect to its group page.
export const topicForSlug: Record<string, string> = Object.fromEntries(
  toolTopicList.flatMap((topic) => topic.tools.map((slug) => [slug, topic.id])),
);

export function topicsForGroup(group: ToolGroup) {
  return toolTopicList.filter((topic) => topic.group === group);
}

export function toolTopicLabel(topicId: string, locale: Locale) {
  return toolTopicById[topicId]?.label[locale] ?? topicId;
}

export function toolTopicBlurb(topicId: string, locale: Locale) {
  return toolTopicById[topicId]?.blurb[locale] ?? "";
}
