---
layout: ../../../layouts/AdminGuideLayout.astro
title: "Content Library / 內容資料庫"
description: "How to maintain works, writings, and writing chapters without editing application code. / 如何在不修改程式程式碼的情況下維護作品、文章與章節。"
slug: "content-library"
---

<!--
  中文：面向非程式設計師的內容資料庫說明，對應根目錄 content/README.md。
  English: Non-programmer guide to the content library, corresponding to content/README.md.
  Caveat / 注意：欄位名稱必須與示例一致，否則 Astro 檢查會報錯。
  Caveat: Field names must match the examples or Astro validation will report an error.
-->

## The simple rule / 最簡單的規則

Ordinary content lives in the top-level `content` folder. You normally do not
need to enter `src` when adding a work or writing.

日常內容都放在專案最外層的 `content` 資料夾。新增作品或文章時，通常不需要進入
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
- 一個資料夾就是一個公開作品或一篇文章。
- `index.md` is always the main file.
- `index.md` 永遠是主檔案。
- Only create `chapters/` when a writing actually has separate chapters.
- 只有文章確實分章時才建立 `chapters/`。

## Add a work / 新增作品

1. Copy an existing folder inside `content/works/`.
2. Rename the copied folder with short lowercase words and hyphens.
3. Open `index.md` and replace its frontmatter and body.
4. Give it a unique `slug`; this becomes `/works/your-slug/`.

1. 複製 `content/works/` 中現有的作品資料夾。
2. 用簡短的小寫英文和連字元重新命名資料夾。
3. 開啟 `index.md`，替換頂部資料和正文。
4. 設定唯一的 `slug`；它會成為 `/works/your-slug/`。

```yaml
---
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
---
```

Optional work fields / 作品可選欄位:

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

`Solo`, `Chamber`, `Large Ensemble`, `Orchestral`, `Vocal / Choral`, `Arrangements`, `Other`

Keep those category values in English; their visible names are translated
automatically. Localized fields use `en`, `zh`, `de`, `fr`, and `ja`, with
English as the required fallback. Use `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` for
dates so each language receives its own date format.

分類值請保留上述英文拼法，公開名稱會自動翻譯。本地化欄位使用 `en`、`zh`、
`de`、`fr`、`ja`，其中英文是必填的備援文字。日期請使用 `YYYY`、`YYYY-MM`
或 `YYYY-MM-DD`，網站便會依語言顯示適當格式。

For PeerTube videos, copy the embed URL from PeerTube's **Share / Embed**
panel and paste it into `video.embedUrl`. Add `poster` when you want the page
to show your own still image and load PeerTube only after a visitor presses
play. `watchUrl` is the ordinary PeerTube page link shown below the player.

PeerTube 影片請從 PeerTube 的 **Share / Embed** 面板複製嵌入網址，貼到
`video.embedUrl`。若填寫 `poster`，頁面會先顯示自己的靜態圖片，訪客按下播放
後才載入 PeerTube。`watchUrl` 是播放器下方顯示的 PeerTube 頁面連結。

## Add a one-page writing / 新增單篇文章

Copy a writing folder that contains only `index.md`, rename the folder, and
edit the file. Do not create a `chapters` folder.

複製一個只有 `index.md` 的文章資料夾，重新命名後編輯該檔案。不要建立
`chapters` 資料夾。

```yaml
---
title: "Writing title"
date: 2026
type: "Essay"
tags: ["Essay"]
language: "English"
excerpt: "Short description shown on the writing title page."
slug: "writing-title"
order: 1
---
```

Valid types / 可用型別:

`Translation`, `Essay`, `Drama`, `Fiction`, `Blog`, `Poetry`, `French`,
`Russian`, `Philosophy`, `Moral Philosophy`, `Program Note`, `Review`, `Other`

Shared category names, writing types, language labels, and interface text live
in `src/config/locales.ts`. Edit that one file when adding or changing a
translation.

共用分類名稱、文章類型、語言名稱與介面文字集中在 `src/config/locales.ts`。
新增或修改翻譯時，只需編輯該檔案。

## Add a chaptered writing / 新增分章文章

Keep the title, metadata, brief, and optional introduction in `index.md`.
Create a `chapters` folder beside it and place one Markdown file inside for
each chapter. The website generates the contents list automatically.

標題、資料、簡介和可選導言放在 `index.md`。在旁邊建立 `chapters` 資料夾，
每章使用一個 Markdown 檔案。網站會自動生成目錄。

Use filenames such as `01-introduction.md`, `02-listening.md`, and
`03-conclusion.md`. The number keeps the files easy to browse. The `order`
field controls the final website order.

建議使用 `01-introduction.md`、`02-listening.md`、`03-conclusion.md`
這樣的檔名。數字方便瀏覽；`order` 欄位決定網頁中的最終順序。

```yaml
---
title: "Chapter title"
slug: "chapter-title"
excerpt: "Optional chapter description."
order: 1
---
```

The parent writing is inferred from its folder. Do not add `writingSlug`.

父文章由所在資料夾自動判斷；不要新增 `writingSlug`。

## Images / 圖片

Place website images in `public/images/`. In Markdown, `/images/name.jpg`
refers to `public/images/name.jpg`. Use the Studio's **Images** tab to browse
images, copy a URL, or insert Markdown.

網站圖片放在 `public/images/`。Markdown 中的 `/images/name.jpg` 對應
`public/images/name.jpg`。可以在管理器的 **Images** 標籤中瀏覽、複製網址或
插入 Markdown。

Always add meaningful alternative text. A caption and alternative text do
different jobs: the caption is visible context; alternative text describes the
image for people who cannot see it.

一定要寫有意義的替代文字。圖片說明是可見的語境；替代文字則為無法看到圖片的
讀者描述影象，兩者作用不同。

## Remove or rename content / 刪除或重新命名內容

Renaming a folder or changing a `slug` changes its address. Existing external
links may stop working. Before deleting a folder, verify that no public page,
image, or internal link still depends on it.

重新命名資料夾或修改 `slug` 會改變網址，已有外部連結可能失效。刪除資料夾前，
確認沒有公開頁面、圖片或內部連結仍然依賴它。

## Validate changes / 檢查修改

Watch the preview after saving. Before publishing, run `npm run check` and
`npm run build`. A frontmatter typo, unsupported category, duplicate slug, or
broken import should appear there.

儲存後觀察預覽。釋出前執行 `npm run check` 和 `npm run build`。頂部資料拼寫
錯誤、不支援的分類、重複網址或損壞的引用通常會在這裡顯示。
