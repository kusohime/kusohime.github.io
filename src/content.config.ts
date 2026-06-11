/**
 * 中文：告诉 Astro 从哪里加载作品、文章与章节，并验证 frontmatter。
 * English: Tells Astro where to load works, writings, and chapters and validates frontmatter.
 * Caveat / 注意：内容目录结构与 glob pattern 必须同时保持一致。
 * Caveat: Folder structure and glob patterns must be changed together.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { workCategories, writingTypes } from "./data/contentTaxonomy";

const folderId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\/index\.md$/, "");

const filePathId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\.md$/, "");

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
    instrumentation: z.string(),
    duration: z.string(),
    collaborators: z.array(z.string()).optional(),
    premiere: z.string().optional(),
    recordingUrl: z.url().optional(),
    scoreUrl: z.url().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    description: z.string(),
    slug: z.string(),
    order: z.number().int().default(999),
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

export const collections = { works, writings, writingChapters };
