/**
 * 中文：告诉 Astro 从哪里加载作品、活动、文章与章节，并验证 frontmatter。
 * English: Tells Astro where to load works, events, writings, and chapters and validates frontmatter.
 * Caveat / 注意：内容目录结构与 glob pattern 必须同时保持一致。
 * Caveat: Folder structure and glob patterns must be changed together.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { toolGroups, workCategories, writingTypes } from "./config/contentTaxonomy";

const folderId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\/index\.md$/, "");

// 中文：中文正文存为同目录的 index.zh.md，按文件夹名归到对应作品/活动/工具。
// English: A Chinese body lives beside its entry as index.zh.md, keyed by folder name.
const folderIdZh = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\/index\.zh\.md$/, "");

const filePathId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\.md$/, "");

const jsonId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\.json$/, "");

const localizedText = z.object({
  en: z.string(),
  zh: z.string().optional(),
});

// 中文：定义内容文件的位置与 frontmatter 结构。
// English: Defines content locations and validates their frontmatter.
// Caveat / 注意：index.md 是主文件；chapters/*.md 才会被当作章节。
// Caveat: index.md is the main file; only chapters/*.md files become chapters.
// 这里统一检查 Markdown 顶部的 frontmatter；字段写错时 Astro 会直接提示。
// These schemas validate Markdown frontmatter so Astro reports incorrect fields early.
const works = defineCollection({
  loader: glob({
    base: "./content/works",
    pattern: "*/index.md",
    generateId: folderId,
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    // 中文：标题保持原文；副标题等描述性文字可加中文。
    // English: Titles stay in the original; descriptive fields may carry Chinese.
    subtitleZh: z.string().optional(),
    year: z.number().int(),
    category: z.enum(workCategories),
    instrumentation: localizedText,
    duration: z.object({
      minutes: z.number().positive().optional(),
      continuous: z.boolean().default(false),
      approximate: z.boolean().default(false),
    }),
    dedication: localizedText.optional(),
    commission: localizedText.optional(),
    credits: z.array(localizedText).optional(),
    premiere: z.object({
      date: z.union([z.string(), z.number()]).optional(),
      // 中文：by 是演出者／指揮，venue 是場地；頁面組成「Premièred by … on … at …」。
      // English: `by` is the performers/conductor, `venue` the place; the page
      // composes them into "Premièred by … on … at …".
      by: localizedText,
      venue: localizedText.optional(),
    }).optional(),
    recordingUrl: z.url().optional(),
    scoreUrl: z.url().optional(),
    video: z.object({
      provider: z.literal("peertube").default("peertube"),
      embedUrl: z.url(),
      watchUrl: z.url().optional(),
      poster: z.string().optional(),
      posterAlt: z.string().optional(),
      caption: localizedText.optional(),
      title: localizedText.optional(),
      aspectRatio: z
        .string()
        .regex(/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/)
        .default("16 / 9"),
    }).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    description: z.string().optional(),
    slug: z.string(),
    order: z.number().int().default(999),
    // 草稿不出现在公开目录页，只在 /drafts/ 与直接网址下可见。
    // Drafts stay off the public index pages; see /drafts/ and direct URLs.
    draft: z.boolean().default(false),
    // 是否在此页面开放「回應」评论区。
    // Whether the responses (comment) zone is open on this page.
    comments: z.boolean().default(false),
  }),
});

const writings = defineCollection({
  loader: glob({
    base: "./content/writings",
    pattern: "*/index.md",
    generateId: folderId,
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.union([z.string(), z.number()]),
    displayDate: z.string().optional(),
    // 中文：标签取代旧的 type / language 字段，可多选；正文语言改由文字自动判断。
    // English: Tags replace the old type/language fields and allow several values;
    // the body language is now inferred from the text itself.
    tags: z.array(z.enum(writingTypes)).default([]),
    excerpt: z.string(),
    slug: z.string(),
    order: z.number().int().default(999),
    draft: z.boolean().default(false),
    comments: z.boolean().default(false),
    // 中文：开篇首字下沉（drop cap）。仅对以完整段落起首的连续散文有意义；
    // 诗歌、以引文／题记／译者说明开头的文章请勿开启（首字会落在错误的块上）。
    // English: Sink the opening character into a drop cap. Only meaningful for
    // continuous prose that begins with a full paragraph; leave off for poetry
    // or texts opening with an epigraph / source line (the cap would land wrong).
    dropcap: z.boolean().default(false),
    // Optional archival metadata for writings recovered from a numbered series
    // or an external source such as a chat export.
    series: z.string().optional(),
    seriesNumber: z.union([z.string(), z.number()]).optional(),
    source: z.object({
      platform: z.string(),
      chat: z.string().optional(),
      exportFile: z.string().optional(),
      messageIds: z.array(z.string()).default([]),
      timestamp: z.string().optional(),
    }).optional(),
    // 目录是否自动编号；章节标题本身就是序号时设为 false，避免重复。
    // Whether the contents list auto-numbers; set false when chapter titles are
    // themselves numbers, so the list does not repeat them.
    numberedContents: z.boolean().default(true),
  }),
});

const events = defineCollection({
  loader: glob({
    base: "./content/events",
    pattern: "*/index.md",
    generateId: folderId,
  }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    time: z.string().optional(),
    venue: z.string().optional(),
    location: z.string().optional(),
    role: z.string().optional(),
    brief: z.string(),
    // 中文：活动标题保持原文；以下为可选中文描述字段（正文另存 index.zh.md）。
    // English: Event titles stay original; these optional Chinese fields cover the
    // descriptive metadata. The Chinese body, if any, lives in index.zh.md.
    venueZh: z.string().optional(),
    locationZh: z.string().optional(),
    roleZh: z.string().optional(),
    briefZh: z.string().optional(),
    slug: z.string(),
    order: z.number().int().default(999),
    draft: z.boolean().default(false),
    links: z.array(z.object({
      label: z.string(),
      url: z.url(),
    })).default([]),
  }),
});

const writingChapters = defineCollection({
  // 章节通过所在文件夹自动归属于文章，不需要重复填写 writingSlug。
  // A chapter belongs to its writing by folder; no repeated writingSlug is needed.
  loader: glob({
    base: "./content/writings",
    pattern: "**/chapters/*.md",
    generateId: filePathId,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    excerpt: z.string().optional(),
    order: z.number().int().default(999),
  }),
});

const tools = defineCollection({
  // 中文：每个工具一个文件夹；互动界面在 src/components/tools/ 中按 slug 对应。
  // English: One folder per tool; the interactive UI lives in
  // src/components/tools/ and is matched by slug in src/pages/tools/[slug].astro.
  loader: glob({
    base: "./content/tools",
    pattern: "*/index.md",
    generateId: folderId,
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    number: z.number().int(),
    group: z.enum(toolGroups),
    // 中文：摘要可选；缺省时列表页回退到副标题。
    // English: Summary is optional; the index falls back to the subtitle when absent.
    summary: z.string().optional(),
    // 中文：工具名保持原文；副标题与摘要可加中文（说明正文另存 index.zh.md）。
    // English: Tool names stay original; subtitle and summary may carry Chinese.
    // The Chinese Notes body lives in index.zh.md.
    subtitleZh: z.string().optional(),
    summaryZh: z.string().optional(),
    status: z.enum(["stable", "beta", "data-pending"]).default("stable"),
    slug: z.string(),
    hidden: z.boolean().default(false),
    // 参考文献列表；正文 Markdown 只放说明文字。
    // Reference list; the Markdown body holds only the notes prose.
    references: z.array(z.string()).default([]),
  }),
});

// 中文：已审核的评论，每条一个 JSON 文件，由审批工作流写入 content/comments。
// English: Approved comments — one JSON file each, written into content/comments by the approval workflow.
// Caveat / 注意：collection 与 slug 必须对应某个作品或文章；replyTo 指向父评论的条目 id。
// Caveat: collection + slug must match a work or writing; replyTo points at the parent entry's id.
const comments = defineCollection({
  loader: glob({
    base: "./content/comments",
    pattern: "**/*.json",
    generateId: jsonId,
  }),
  schema: z.object({
    collection: z.enum(["works", "writings"]),
    slug: z.string(),
    name: z.string(),
    date: z.string(),
    body: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    replyTo: z.string().optional(),
    author: z.boolean().default(false),
  }),
});

// 中文：中文正文集合——只取 index.zh.md，正文以外不需 frontmatter；按文件夹名与主条目对应。
// English: Chinese-body collections — only index.zh.md, body-only (frontmatter optional);
// matched to the main entry by folder id.
const toolsZh = defineCollection({
  loader: glob({
    base: "./content/tools",
    pattern: "*/index.zh.md",
    generateId: folderIdZh,
  }),
  schema: z.object({ title: z.string().optional() }),
});

const eventsZh = defineCollection({
  loader: glob({
    base: "./content/events",
    pattern: "*/index.zh.md",
    generateId: folderIdZh,
  }),
  schema: z.object({ title: z.string().optional() }),
});

// 中文：文章的中文正文——同目录 index.zh.md（仅正文，frontmatter 可省）；
// 存在时文章页按站点语言在英文主文与中文正文之间切换。
// English: Chinese bodies for writings — the sibling index.zh.md (body only,
// frontmatter optional); when present, the writing page swaps the English main
// body and the Chinese body by site locale.
const writingsZh = defineCollection({
  loader: glob({
    base: "./content/writings",
    pattern: "*/index.zh.md",
    generateId: folderIdZh,
  }),
  schema: z.object({ title: z.string().optional() }),
});

export const collections = {
  works,
  events,
  writings,
  writingChapters,
  writingsZh,
  tools,
  comments,
  toolsZh,
  eventsZh,
};

// 中文：toolsZh / eventsZh 取同目录下的 index.zh.md（仅正文，无需 frontmatter）。
// English: toolsZh / eventsZh load the sibling index.zh.md (body only, frontmatter optional).

