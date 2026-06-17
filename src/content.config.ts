/**
 * 中文：告诉 Astro 从哪里加载作品、文章与章节，并验证 frontmatter。
 * English: Tells Astro where to load works, writings, and chapters and validates frontmatter.
 * Caveat / 注意：内容目录结构与 glob pattern 必须同时保持一致。
 * Caveat: Folder structure and glob patterns must be changed together.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { toolGroups, workCategories, writingTypes } from "./config/contentTaxonomy";

const folderId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\/index\.md$/, "");

const filePathId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\.md$/, "");

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
      details: localizedText,
    }).optional(),
    recordingUrl: z.url().optional(),
    scoreUrl: z.url().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    description: z.string(),
    slug: z.string(),
    order: z.number().int().default(999),
    // 草稿不出现在公开目录页，只在 /drafts/ 与直接网址下可见。
    // Drafts stay off the public index pages; see /drafts/ and direct URLs.
    draft: z.boolean().default(false),
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
    type: z.enum(writingTypes),
    language: z.string(),
    excerpt: z.string(),
    slug: z.string(),
    order: z.number().int().default(999),
    draft: z.boolean().default(false),
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
    summary: z.string(),
    status: z.enum(["stable", "beta", "data-pending"]).default("stable"),
    slug: z.string(),
    // 参考文献列表；正文 Markdown 只放说明文字。
    // Reference list; the Markdown body holds only the notes prose.
    references: z.array(z.string()).default([]),
  }),
});

export const collections = { works, writings, writingChapters, tools };
