import { getCollection, type CollectionEntry } from "astro:content";
import { contentFolder } from "./contentPaths";
import type { LocalizedText } from "../config/locales";
import { dialogueProfiles } from "../data/dialogueProfiles";

export const blogCategories = [
  {
    id: "essays",
    label: { en: "Writing", zh: "寫作" },
    description: { en: "On language, music, and the things in between.", zh: "關於語言、音樂，以及其間的種種。" },
  },
  {
    id: "translation",
    label: { en: "Translation", zh: "翻譯" },
    description: { en: "Literature, philosophy, and voices across languages.", zh: "文學、哲學，與不同語言之間的聲音。" },
  },
  {
    id: "dialogues",
    label: { en: "Dialogues", zh: "Dialogues" },
    description: { en: "Dialogues with Kuma · an ongoing collection.", zh: "持續寫下的對話與片段。" },
  },
] as const;

export type BlogCategoryId = (typeof blogCategories)[number]["id"];
export interface BlogEntry {
  url: string;
  title: LocalizedText;
  author?: LocalizedText;
  date: string;
  tags: string[];
  category: BlogCategoryId;
  order: number;
  keyword?: { zh: string; en: string };
}

export const blogCategoryHref = (id: BlogCategoryId) => `/writings/${id}/`;

export function dialogueSeriesLabel(series?: string) {
  if (series === "本羣篇" || series === "Trilogue") return "Trilogue";
  if (series === "脆熊篇" || series === "Dialogue") return "Dialogue";
  return undefined;
}

// A translated essay belongs to Translation only; topic tags remain secondary.
export function writingCategory(writing: CollectionEntry<"writings">): BlogCategoryId {
  if (writing.data.slug === "cui-xiong-pian" || writing.data.series === "脆熊篇" || writing.data.series === "本羣篇") return "dialogues";
  return writing.data.tags.includes("Translation") ? "translation" : "essays";
}

export function parseBlogDate(value: string) {
  const match = value.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return { year, month, day, sortTime: Date.UTC(+year, +(month ?? 1) - 1, +(day ?? 1)) };
}

export async function getBlogEntries(): Promise<BlogEntry[]> {
  const [writings, chapters] = await Promise.all([
    getCollection("writings", ({ data }) => !data.draft),
    getCollection("writingChapters"),
  ]);
  const entries = writings.flatMap((writing): BlogEntry[] => {
    const data = writing.data;
    const category = writingCategory(writing);
    if (data.slug === "cui-xiong-pian") {
      const openingDate = data.source?.timestamp?.slice(0, 10) ?? String(data.date);
      return [
        {
          url: `/writings/${data.slug}/`,
          title: { en: "Dialogue · 0", zh: "Dialogue · 0" },
          date: openingDate, tags: data.tags, category, order: data.order,
          keyword: dialogueProfiles["0"]?.keyword,
        },
        ...chapters.filter((chapter) => contentFolder(chapter.id) === contentFolder(writing.id))
          .map((chapter): BlogEntry => ({
            url: `/writings/${data.slug}/${chapter.data.slug}/`,
            title: {
              en: `${dialogueSeriesLabel(chapter.data.series) ?? "Dialogue"} · ${chapter.data.seriesNumber ?? chapter.data.title}`,
              zh: `${dialogueSeriesLabel(chapter.data.series) ?? "Dialogue"} · ${chapter.data.seriesNumber ?? chapter.data.title}`,
            },
            date: String(chapter.data.date ?? "undated"),
            tags: chapter.data.tags, category, order: chapter.data.order,
            keyword: dialogueProfiles[chapter.data.slug]?.keyword,
          })),
      ];
    }
    return [{
      url: `/writings/${data.slug}/`,
      title: { en: data.title, zh: data.titleZh },
      author: data.subtitle ? { en: data.subtitle, zh: data.subtitleZh ?? data.subtitle } : undefined,
      date: String(data.date),
      tags: data.tags, category, order: data.order,
    }];
  });
  return entries.sort((a, b) =>
    (parseBlogDate(b.date)?.sortTime ?? -Infinity) - (parseBlogDate(a.date)?.sortTime ?? -Infinity)
    || (a.category === "dialogues" && b.category === "dialogues" ? b.order - a.order : a.order - b.order)
    || a.url.localeCompare(b.url),
  );
}
