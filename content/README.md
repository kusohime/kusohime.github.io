# Content Library / 內容資料庫

**中文：** 這個資料夾只放作品與文章內容。平時新增、修改或刪除內容時，
從這裡開始；通常不需要進入 `src/`。

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
- 一個資料夾就是一個公開作品或一篇文章。
- `index.md` is always the main file.
- `index.md` 永遠是主檔案。
- A writing without chapters needs only `index.md`.
- 沒有章節的文章只需要 `index.md`。
- Add a `chapters/` folder only when a writing has separate chapters.
- 只有需要分章時才新增 `chapters/` 資料夾。
- The website automatically builds the contents list from chapter files.
- 網站會根據章節檔案自動生成目錄。

## Add A Work / 新增作品

1. Copy an existing folder inside `content/works/`.
2. Rename the copied folder.
3. Open its `index.md` and replace the information and program notes.
4. Give it a unique `slug`; this becomes `/works/your-slug/`.

1. 複製 `content/works/` 中已有的作品資料夾。
2. 重新命名複製出的資料夾。
3. 開啟裡面的 `index.md`，替換資料與作品說明。
4. 設定唯一的 `slug`；它會成為 `/works/your-slug/`。

Required fields / 必填欄位:

```yaml
title: "Work title"
year: 2026
category: "Chamber"
instrumentation:
  en: "Violin and piano"
  zh: "小提琴與鋼琴"
  de: "Violine und Klavier"
  fr: "Violon et piano"
  ja: "ヴァイオリンとピアノ"
duration:
  minutes: 10
  continuous: false
  approximate: false
description: "Short description used on lists and in page metadata."
slug: "work-title"
```

Optional fields / 可選欄位:

```yaml
subtitle: "Optional subtitle"
dedication:
  en: "For Name"
  zh: "獻給某人"
  ja: "某氏に捧ぐ"
commission:
  en: "Commissioned by Organization"
credits:
  - en: "Performer Name, instrument"
    zh: "演出者姓名，樂器"
    ja: "演奏者名、楽器"
premiere:
  date: "2026-06-11"
  details:
    en: "First performed by Name at Venue, City"
    zh: "由某人於某地首演"
    ja: "某氏により会場名で初演"
recordingUrl: "https://example.com/recording"
scoreUrl: "https://example.com/score"
image: "/images/example.jpg"
imageAlt: "Description of the image"
order: 1
```

Valid categories / 可用分類:

`Solo`, `Chamber`, `Orchestral`, `Vocal / Choral`, `Music Theatre`, `Other`

Keep the category values above in English; the website translates their
visible labels automatically. Instrumentation and credit fields use the same
language keys: `en`, `zh`, `de`, `fr`, and `ja`. English is the required
fallback. Dates should use `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`; the site formats
them for each language automatically.

分類值請保留上述英文拼法；網站會自動翻譯公開顯示的名稱。編制與演出資料皆使用
相同的語言代碼：`en`、`zh`、`de`、`fr`、`ja`，其中英文是必填的備援文字。
日期請寫成 `YYYY`、`YYYY-MM` 或 `YYYY-MM-DD`；網站會依語言自動調整格式。

## Add A Short Writing / 新增單篇文章

1. Copy an existing one-file folder inside `content/writings/`.
2. Rename the folder.
3. Edit `index.md`.
4. Do not create a `chapters/` folder.

1. 複製 `content/writings/` 中只有一個檔案的文章資料夾。
2. 重新命名資料夾。
3. 編輯 `index.md`。
4. 不要建立 `chapters/` 資料夾。

Required fields / 必填欄位:

```yaml
title: "Writing title"
date: 2026
type: "Essay"
language: "English"
excerpt: "Short description shown on the writing title page."
slug: "writing-title"
```

Optional fields / 可選欄位:

```yaml
subtitle: "Optional subtitle"
order: 1
```

Valid types / 可用型別:

`Translation`, `Essay`, `Fiction`, `Blog`, `Poem`, `Program Note`, `Review`,
`Other`

Writing types, content-language labels, and dates are translated centrally in
`src/config/locales.ts`. Add or revise shared translations there instead of
copying them into individual pages.

文章類型、內容語言名稱與日期格式集中在 `src/config/locales.ts`。新增或修改共用
翻譯時，請在該檔案處理，不要把同一翻譯複製到各個頁面。

## Add A Writing With Chapters / 新增分章文章

1. Create or copy a writing folder.
2. Keep the title, metadata, brief, and optional introduction in `index.md`.
3. Create a `chapters/` folder beside `index.md`.
4. Put one Markdown file per chapter in `chapters/`.
5. Use numbered filenames such as `01-introduction.md`; filenames determine
   the human-visible order in the Studio, while the `order` field determines
   the website order.

1. 建立或複製一個文章資料夾。
2. 在 `index.md` 中保留標題、資料、簡介和可選引言。
3. 在 `index.md` 旁邊建立 `chapters/` 資料夾。
4. 每個章節單獨使用一個 Markdown 檔案。
5. 建議檔名使用 `01-introduction.md`；檔名方便在管理器中排序，
   `order` 欄位決定網站中的順序。

Chapter frontmatter / 章節開頭資料:

```yaml
---
title: "Chapter title"
slug: "chapter-title"
excerpt: "Optional chapter description."
order: 1
---
```

The parent writing is inferred from the folder. Do not add `writingSlug`.

父文章會根據資料夾自動判斷；章節中不再需要填寫 `writingSlug`。

## Markdown Features / Markdown 功能

Footnotes / 腳註:

```markdown
Text with a note.[^1]

[^1]: The note may contain a [link](https://example.com).
```

Inline and display mathematics / 行內與獨立數學公式:

```markdown
Inline: $a^2 + b^2 = c^2$

$$
E = mc^2
$$
```

Figure with caption / 帶說明的圖片:

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

Poetry without paragraph indentation / 無首行縮排的詩歌:

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

執行 `npm run dev` 後開啟 `/admin/`。管理器提供資料夾目錄、全域性搜尋、
語法高亮、自動換行、圖片瀏覽，以及桌面和手機預覽。目前本地口令是 `0592`。

The Studio is intentionally local-only. It is not a writable administration
service on the published static website.

管理器僅供本地使用；釋出後的靜態網站不會開放檔案寫入管理功能。
