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
slug: "work-title"
```

Optional fields / 可選欄位:

```yaml
subtitle: "Optional subtitle"
description: "Optional page metadata summary."
# Recipient only — the page renders "Dedicated to …" / "題獻給 …".
dedication:
  en: "Name"
  zh: "某人"
# Commissioner only — the page renders "Commissioned by …" / "受 … 委約".
commission:
  en: "Organization"
  zh: "某機構"
credits:
  - en: "Performer Name, instrument"
    zh: "演出者姓名，樂器"
# Renders "Premièred by {by} on {date} at {venue}" / "{date}由 {by} 於 {venue} 首演".
premiere:
  date: "2026-06-11"
  by:
    en: "Performer Name; Conductor Name, conductor"
    zh: "演出者姓名；指揮姓名 指揮"
  venue:
    en: "Venue, City"
    zh: "某場地，某城市"
recordingUrl: "https://example.com/recording"
scoreUrl: "https://example.com/score"
video:
  provider: "peertube"
  embedUrl: "https://video.example/videos/embed/video-id"
  watchUrl: "https://video.example/w/video-id"
  poster: "/images/example-video-poster.webp"
  posterAlt: "Still from the performance video"
  caption:
    en: "Performance excerpt."
    zh: "演出片段。"
  title:
    en: "Work title, performance video"
    zh: "作品名稱，演出影片"
  aspectRatio: "16 / 9"
image: "/images/example.jpg"
imageAlt: "Description of the image"
order: 1
```

Valid categories / 可用分類:

`Solo`, `Chamber`, `Large Ensemble`, `Orchestral`, `Vocal / Choral`, `Other`

Keep the category values above in English; the website translates their
visible labels automatically. Instrumentation and credit fields use the same
language keys: `en`, `zh`, `de`, `fr`, and `ja`. English is the required
fallback. Dates should use `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`; the site formats
them for each language automatically.

分類值請保留上述英文拼法；網站會自動翻譯公開顯示的名稱。編制與演出資料皆使用
相同的語言代碼：`en`、`zh`、`de`、`fr`、`ja`，其中英文是必填的備援文字。
日期請寫成 `YYYY`、`YYYY-MM` 或 `YYYY-MM-DD`；網站會依語言自動調整格式。

For PeerTube videos, copy the embed URL from PeerTube's **Share / Embed**
panel and paste it into `video.embedUrl`. Add `poster` when you want the page
to show your own still image and load PeerTube only after a visitor presses
play. `watchUrl` is the ordinary PeerTube page link shown below the player.

PeerTube 影片請從 PeerTube 的 **Share / Embed** 面板複製嵌入網址，貼到
`video.embedUrl`。若填寫 `poster`，頁面會先顯示自己的靜態圖片，訪客按下播放
後才載入 PeerTube。`watchUrl` 是播放器下方顯示的 PeerTube 頁面連結。

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

Ruby annotation / Ruby 標註:

```html
<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>
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

Run `npm run dev`, then open `/admin/`. The Studio provides a folder tree with
project-wide Find, folder-based image albums, visual design controls, syntax
highlighting, line wrapping, Inspect and Edit Text modes, draft page creation,
and desktop/phone previews.

執行 `npm run dev` 後開啟 `/admin/`。管理器提供含全域性搜尋的資料夾目錄、
資料夾圖片相簿、可視設計控制、語法高亮、自動換行、Inspect 與 Edit Text 模式、
草稿頁面建立，以及桌面和手機預覽。

The Studio is intentionally local-only. It is not a writable administration
service on the published static website.

管理器僅供本地使用；釋出後的靜態網站不會開放檔案寫入管理功能。
