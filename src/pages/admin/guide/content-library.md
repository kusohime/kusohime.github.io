---
layout: ../../../layouts/AdminGuideLayout.astro
title: "Content Library / 内容资料库"
description: "How to maintain works, writings, and writing chapters without editing application code. / 如何在不修改程序代码的情况下维护作品、文章与章节。"
slug: "content-library"
---

<!--
  中文：面向非程序员的内容资料库说明，对应根目录 content/README.md。
  English: Non-programmer guide to the content library, corresponding to content/README.md.
  Caveat / 注意：字段名称必须与示例一致，否则 Astro 检查会报错。
  Caveat: Field names must match the examples or Astro validation will report an error.
-->

## The simple rule / 最简单的规则

Ordinary content lives in the top-level `content` folder. You normally do not
need to enter `src` when adding a work or writing.

日常内容都放在项目最外层的 `content` 文件夹。新增作品或文章时，通常不需要进入
`src`。

```text
content/
├─ works/
│  └─ one-work-name/
│     └─ index.md
└─ writings/
   ├─ one-short-writing/
   │  └─ index.md
   └─ one-writing-with-chapters/
      ├─ index.md
      └─ chapters/
         ├─ 01-first-chapter.md
         └─ 02-second-chapter.md
```

- One folder equals one public work or writing.
- 一个文件夹就是一个公开作品或一篇文章。
- `index.md` is always the main file.
- `index.md` 永远是主文件。
- Only create `chapters/` when a writing actually has separate chapters.
- 只有文章确实分章时才建立 `chapters/`。

## Add a work / 新增作品

1. Copy an existing folder inside `content/works/`.
2. Rename the copied folder with short lowercase words and hyphens.
3. Open `index.md` and replace its frontmatter and body.
4. Give it a unique `slug`; this becomes `/works/your-slug/`.

1. 复制 `content/works/` 中现有的作品文件夹。
2. 用简短的小写英文和连字符重命名文件夹。
3. 打开 `index.md`，替换顶部资料和正文。
4. 设置唯一的 `slug`；它会成为 `/works/your-slug/`。

```yaml
---
title: "Work title"
year: 2026
category: "Chamber"
instrumentation: "Violin and piano"
duration: "10 minutes"
description: "Short description used on lists and in page metadata."
slug: "work-title"
---
```

Optional work fields / 作品可选字段:

```yaml
subtitle: "Optional subtitle"
collaborators:
  - "Name and role"
premiere: "Premiere information"
recordingUrl: "https://example.com/recording"
scoreUrl: "https://example.com/score"
image: "/images/example.jpg"
imageAlt: "Description of the image"
order: 1
```

Valid categories / 可用分类:

`Solo`, `Chamber`, `Orchestral`, `Vocal / Choral`, `Music Theatre`, `Other`

## Add a one-page writing / 新增单篇文章

Copy a writing folder that contains only `index.md`, rename the folder, and
edit the file. Do not create a `chapters` folder.

复制一个只有 `index.md` 的文章文件夹，重命名后编辑该文件。不要建立
`chapters` 文件夹。

```yaml
---
title: "Writing title"
date: 2026
type: "Essay"
language: "English"
excerpt: "Short description shown on the writing title page."
slug: "writing-title"
order: 1
---
```

Valid types / 可用类型:

`Translation`, `Essay`, `Fiction`, `Blog`, `Poem`, `Program Note`, `Review`,
`Other`

## Add a chaptered writing / 新增分章文章

Keep the title, metadata, brief, and optional introduction in `index.md`.
Create a `chapters` folder beside it and place one Markdown file inside for
each chapter. The website generates the contents list automatically.

标题、资料、简介和可选导言放在 `index.md`。在旁边建立 `chapters` 文件夹，
每章使用一个 Markdown 文件。网站会自动生成目录。

Use filenames such as `01-introduction.md`, `02-listening.md`, and
`03-conclusion.md`. The number keeps the files easy to browse. The `order`
field controls the final website order.

建议使用 `01-introduction.md`、`02-listening.md`、`03-conclusion.md`
这样的文件名。数字方便浏览；`order` 字段决定网页中的最终顺序。

```yaml
---
title: "Chapter title"
slug: "chapter-title"
excerpt: "Optional chapter description."
order: 1
---
```

The parent writing is inferred from its folder. Do not add `writingSlug`.

父文章由所在文件夹自动判断；不要添加 `writingSlug`。

## Images / 图片

Place website images in `public/images/`. In Markdown, `/images/name.jpg`
refers to `public/images/name.jpg`. Use the Studio's **Images** tab to browse
images, copy a URL, or insert Markdown.

网站图片放在 `public/images/`。Markdown 中的 `/images/name.jpg` 对应
`public/images/name.jpg`。可以在管理器的 **Images** 标签中浏览、复制网址或
插入 Markdown。

Always add meaningful alternative text. A caption and alternative text do
different jobs: the caption is visible context; alternative text describes the
image for people who cannot see it.

一定要写有意义的替代文字。图片说明是可见的语境；替代文字则为无法看到图片的
读者描述图像，两者作用不同。

## Remove or rename content / 删除或重命名内容

Renaming a folder or changing a `slug` changes its address. Existing external
links may stop working. Before deleting a folder, verify that no public page,
image, or internal link still depends on it.

重命名文件夹或修改 `slug` 会改变网址，已有外部链接可能失效。删除文件夹前，
确认没有公开页面、图片或内部链接仍然依赖它。

## Validate changes / 检查修改

Watch the preview after saving. Before publishing, run `npm run check` and
`npm run build`. A frontmatter typo, unsupported category, duplicate slug, or
broken import should appear there.

保存后观察预览。发布前运行 `npm run check` 和 `npm run build`。顶部资料拼写
错误、不支持的分类、重复网址或损坏的引用通常会在这里显示。
