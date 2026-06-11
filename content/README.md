# Content Library / 内容资料库

**中文：** 这个文件夹只放作品与文章内容。平时新增、修改或删除内容时，
从这里开始；通常不需要进入 `src/`。

**English:** This folder contains the works and writings. Start here when
adding, editing, or removing content; ordinary content maintenance should not
require changes inside `src/`.

## At A Glance / 一眼看懂

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
- A writing without chapters needs only `index.md`.
- 没有章节的文章只需要 `index.md`。
- Add a `chapters/` folder only when a writing has separate chapters.
- 只有需要分章时才添加 `chapters/` 文件夹。
- The website automatically builds the contents list from chapter files.
- 网站会根据章节文件自动生成目录。

## Add A Work / 新增作品

1. Copy an existing folder inside `content/works/`.
2. Rename the copied folder.
3. Open its `index.md` and replace the information and program notes.
4. Give it a unique `slug`; this becomes `/works/your-slug/`.

1. 复制 `content/works/` 中已有的作品文件夹。
2. 重命名复制出的文件夹。
3. 打开里面的 `index.md`，替换资料与作品说明。
4. 设置唯一的 `slug`；它会成为 `/works/your-slug/`。

Required fields / 必填字段:

```yaml
title: "Work title"
year: 2026
category: "Chamber"
instrumentation: "Violin and piano"
duration: "10 minutes"
description: "Short description used on lists and in page metadata."
slug: "work-title"
```

Optional fields / 可选字段:

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

## Add A Short Writing / 新增单篇文章

1. Copy an existing one-file folder inside `content/writings/`.
2. Rename the folder.
3. Edit `index.md`.
4. Do not create a `chapters/` folder.

1. 复制 `content/writings/` 中只有一个文件的文章文件夹。
2. 重命名文件夹。
3. 编辑 `index.md`。
4. 不要创建 `chapters/` 文件夹。

Required fields / 必填字段:

```yaml
title: "Writing title"
date: 2026
type: "Essay"
language: "English"
excerpt: "Short description shown on the writing title page."
slug: "writing-title"
```

Optional fields / 可选字段:

```yaml
subtitle: "Optional subtitle"
order: 1
```

Valid types / 可用类型:

`Translation`, `Essay`, `Fiction`, `Blog`, `Poem`, `Program Note`, `Review`,
`Other`

## Add A Writing With Chapters / 新增分章文章

1. Create or copy a writing folder.
2. Keep the title, metadata, brief, and optional introduction in `index.md`.
3. Create a `chapters/` folder beside `index.md`.
4. Put one Markdown file per chapter in `chapters/`.
5. Use numbered filenames such as `01-introduction.md`; filenames determine
   the human-visible order in the Studio, while the `order` field determines
   the website order.

1. 创建或复制一个文章文件夹。
2. 在 `index.md` 中保留标题、资料、简介和可选引言。
3. 在 `index.md` 旁边创建 `chapters/` 文件夹。
4. 每个章节单独使用一个 Markdown 文件。
5. 建议文件名使用 `01-introduction.md`；文件名方便在管理器中排序，
   `order` 字段决定网站中的顺序。

Chapter frontmatter / 章节开头资料:

```yaml
---
title: "Chapter title"
slug: "chapter-title"
excerpt: "Optional chapter description."
order: 1
---
```

The parent writing is inferred from the folder. Do not add `writingSlug`.

父文章会根据文件夹自动判断；章节中不再需要填写 `writingSlug`。

## Markdown Features / Markdown 功能

Footnotes / 脚注:

```markdown
Text with a note.[^1]

[^1]: The note may contain a [link](https://example.com).
```

Inline and display mathematics / 行内与独立数学公式:

```markdown
Inline: $a^2 + b^2 = c^2$

$$
E = mc^2
$$
```

Figure with caption / 带说明的图片:

```html
<figure>
  <img src="/images/example.jpg" alt="Description of the image">
  <figcaption>Figure 1. Caption and source information.</figcaption>
</figure>
```

Ruby annotation / Ruby 注音:

```html
<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>
```

Poetry without paragraph indentation / 无首行缩进的诗歌:

```html
<blockquote class="no-indent poetry">
  <p>
    First line of the poem.<br>
    Second line of the poem.<br>
    Third line of the poem.
  </p>
  <footer><cite>Optional citation</cite></footer>
</blockquote>
```

## Local Studio / 本地管理器

Run `npm run dev`, then open `/admin/`. The Studio provides a folder tree,
project-wide Find, syntax highlighting, line wrapping, image browsing, and
desktop/phone previews. The current local passcode is `0592`.

运行 `npm run dev` 后打开 `/admin/`。管理器提供文件夹目录、全局搜索、
语法高亮、自动换行、图片浏览，以及桌面和手机预览。目前本地口令是 `0592`。

The Studio is intentionally local-only. It is not a writable administration
service on the published static website.

管理器仅供本地使用；发布后的静态网站不会开放文件写入管理功能。

