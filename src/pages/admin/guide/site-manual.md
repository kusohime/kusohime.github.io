---
layout: ../../../layouts/AdminGuideLayout.astro
title: "Site Manual / 網站手冊"
description: "A compact bilingual reference for structure, use, and maintenance. / 結構、使用與維護的精簡雙語參考。"
slug: "site-manual"
---

English and 正體中文 are paired. Use the site language menu to show one
language.

英文與正體中文成對書寫。可用網站語言選單只顯示其中一種。

## 0. Object / 對象

This repository is the source of `https://yixincui.com`.

本倉庫是 `https://yixincui.com` 的原始碼。

Astro reads `content/` and `src/`, then writes static HTML, CSS, JavaScript,
images, and feeds to `dist/`.

Astro 讀取 `content/` 與 `src/`，再把靜態 HTML、CSS、JavaScript、圖片與 feed
寫入 `dist/`。

There is no production database. The local Website Studio writes the source
files, and GitHub Pages serves only the built site.

正式網站沒有資料庫。Website Studio 在本地寫入原始檔；GitHub Pages 只提供建置後的網站。

Invariant. When routes, schemas, Studio controls, media, comments, tools,
publishing, or maintenance rules change, update this manual in the same change.

不變式：若網址、資料結構、管理器控制項、媒體、回應、工具、發布或維護規則改變，
同次修改必須更新本手冊。

## 1. Commands / 命令

| Operation / 操作 | Command / 命令 | Result / 結果 |
| --- | --- | --- |
| Install / 安裝 | `npm ci` | Recreate dependencies / 重建依賴 |
| Edit / 編輯 | `npm run dev` | Local site and Studio / 本地網站與管理器 |
| Check / 檢查 | `npm run check` | Astro and TypeScript diagnostics / Astro 與 TypeScript 診斷 |
| Build / 建置 | `npm run build` | Production `dist/` / 正式 `dist/` |
| Preview build / 預覽建置 | `npm run preview` | Serve built output / 預覽建置結果 |
| Test tool logic / 測試工具邏輯 | `node tests/tools-core.test.mjs` | Framework-free library tests / 無框架函式庫測試 |

## 2. Project Map / 專案映射

| Path / 路徑 | Meaning / 意義 |
| --- | --- |
| `content/works/` | Work pages / 作品頁 |
| `content/events/` | Event pages / 活動頁 |
| `content/writings/` | Writing title pages and chapters / 文章標題頁與章節 |
| `content/tools/` | Tool notes and references / 工具說明與參考文獻 |
| `content/comments/` | Approved public responses / 已核准公開回應 |
| `content/_trash/` | Removed local content / 已移除本地內容 |
| `public/images/` | Public images / 公開圖片 |
| `public/icons/` | Decorative sun, moon, arrow glyphs / 太陽、月亮、箭頭裝飾字形 |
| `public/files/` | Downloads, including C.V. PDF / 下載檔，含履歷 PDF |
| `src/pages/` | URL routes / 網址路由 |
| `src/layouts/` | Page shells / 頁面外殼 |
| `src/components/` | Reusable visible parts / 可重用可見部件 |
| `src/components/tools/` | Interactive tools / 互動工具 |
| `src/config/` | Site data, taxonomies, translations, guide order / 網站資料、分類、翻譯、指南順序 |
| `src/styles/global.css` | Public site style / 公開網站樣式 |
| `src/styles/tools.css` | Tools style / 工具樣式 |
| `src/styles/admin.css` | Studio style / 管理器樣式 |
| `src/scripts/` | Browser behavior and Studio behavior / 瀏覽器行為與管理器行為 |
| `src/lib/` | Pure JavaScript music, text, and utility logic / 純 JavaScript 音樂、文字與工具邏輯 |
| `docs/` | Developer references / 開發者參考 |
| `scripts/comment-worker/` | Cloudflare Worker for responses / 回應系統的 Cloudflare Worker |
| `.github/workflows/` | Pages deploy and response publication / Pages 發布與回應發布 |
| `.astro/`, `dist/`, `node_modules/` | Generated; do not edit / 生成內容；不要編輯 |

## 3. Public Surface / 公開表面

| URL / 網址 | Source / 來源 | Function / 功能 |
| --- | --- | --- |
| `/` | `src/pages/index.astro`, `src/config/homeContent.json` | Home / 首頁 |
| `/works/` | `content/works/*/index.md` | Work catalogue / 作品目錄 |
| `/works/<slug>/` | work frontmatter `slug` | Work detail / 作品詳頁 |
| `/events/` | `content/events/*/index.md` | Event catalogue / 活動目錄 |
| `/events/<slug>/` | event frontmatter `slug` | Event detail / 活動詳頁 |
| `/writings/` | `content/writings/*/index.md` | Writing catalogue / 文章目錄 |
| `/writings/<slug>/` | writing frontmatter `slug` | Writing title page / 文章標題頁 |
| `/writings/<slug>/<chapter>/` | `chapters/*.md` frontmatter `slug` | Writing chapter / 文章章節 |
| `/tools/` | `content/tools/`, `src/config/toolTopics.ts` | Tool catalogue / 工具目錄 |
| `/tools/composition/<topic>/` | topic grouping | Grouped composition tools / 分組作曲工具 |
| `/tools/<slug>/` | individual tool route | Linguistics tools; redirects old composition URLs / 語言學工具；舊作曲工具網址轉向 |
| `/cv/` | `src/pages/cv.astro`, `public/files/yixin-cui-cv.pdf` | Web C.V. and PDF / 網頁履歷與 PDF |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS feed / RSS |
| `/drafts/` | draft content in dev | Local draft shelf / 本地草稿架 |
| `/admin/` | `src/pages/admin/index.astro` | Local Studio / 本地管理器 |
| `/admin/guide/` | `src/pages/admin/guide/` | Local manual / 本地手冊 |

`/admin/` and `/drafts/` are removed from the public Pages artifact.

`/admin/` 與 `/drafts/` 會從公開 Pages 產物中移除。

## 4. Content Model / 內容模型

An entry is a folder, a frontmatter block, and a Markdown body.

條目由資料夾、frontmatter 區塊與 Markdown 正文組成。

Public URL uses `slug`, not the folder name.

公開網址使用 `slug`，不使用資料夾名稱。

`draft: true` means local preview only. `order` sorts catalogues. English `en`
is the fallback for localized text; `zh` is optional.

`draft: true` 表示只在本地預覽。`order` 排序目錄。本地化文字以英文 `en` 為備援；
`zh` 可選。

### Works / 作品

Path: `content/works/<folder>/index.md`.

路徑：`content/works/<folder>/index.md`。

Required: `title`, `year`, `category`, `instrumentation.en`, `duration`, `slug`.

必填：`title`、`year`、`category`、`instrumentation.en`、`duration`、`slug`。

Optional: `subtitle`, `description`, `dedication`, `commission`, `credits`,
`premiere`, `recordingUrl`, `scoreUrl`, `video`, `image`, `imageAlt`, `order`,
`draft`, `comments`.

可選：`subtitle`、`description`、`dedication`、`commission`、`credits`、`premiere`、
`recordingUrl`、`scoreUrl`、`video`、`image`、`imageAlt`、`order`、`draft`、
`comments`。

Categories: `Solo`, `Chamber`, `Large Ensemble`, `Orchestral`,
`Vocal / Choral`, `Other`.

分類：`Solo`、`Chamber`、`Large Ensemble`、`Orchestral`、`Vocal / Choral`、
`Other`。

### Events / 活動

Path: `content/events/<folder>/index.md`.

路徑：`content/events/<folder>/index.md`。

Required: `title`, `date`, `brief`, `slug`.

必填：`title`、`date`、`brief`、`slug`。

Optional: `time`, `venue`, `location`, `role`, `links`, `order`, `draft`.

可選：`time`、`venue`、`location`、`role`、`links`、`order`、`draft`。

### Writings / 文章

Path: `content/writings/<folder>/index.md`.

路徑：`content/writings/<folder>/index.md`。

Required: `title`, `titleZh`, `date`, `excerpt`, `excerptZh`, `slug`.

必填：英文標題 `title`、中文標題 `titleZh`、`date`、英文摘要 `excerpt`、
中文摘要 `excerptZh`、`slug`。

Optional: `subtitle`, `subtitleZh`, `translationFrom`, `translationTo`, `tags`
(choose any number), `order`, `draft`, `comments`.
The old `type` and `language` fields are gone — tags replace them.

可選：`subtitle`、`subtitleZh`、`tags`（可多選）、`order`、`draft`、`comments`。
舊的 `type` 與 `language` 欄位已移除，改用標籤。

For translations, `subtitle` / `subtitleZh` contain only the original author's
name. The translated work title belongs in `title` / `titleZh`.

`translationFrom` is one language code, and `translationTo` is a list of target
language codes. Use `zh-classical` for Classical Chinese and `zh-modern` for
Modern Chinese. The site displays the route after the author name.

譯作的 `subtitle`／`subtitleZh` 只填原作者姓名；英、中文譯題分別填在
`title`／`titleZh`。

`translationFrom` 填一個來源語言代碼，`translationTo` 填目標語言代碼清單。
古漢語使用 `zh-classical`，現代漢語使用 `zh-modern`；網站會把翻譯路線顯示在作者姓名之後。

Tags: `Translation`, `Essay`, `Drama`, `Fiction`, `Blog`, `Poetry`,
`French`, `Russian`, `Philosophy`, `Moral Philosophy`, `Program Note`, `Review`,
`Other`.

標籤：`Translation`、`Essay`、`Drama`、`Fiction`、`Blog`、`Poetry`、
`French`、`Russian`、`Philosophy`、`Moral Philosophy`、`Program Note`、
`Review`、`Other`。

Chapters live in `content/writings/<folder>/chapters/*.md`; each chapter needs
`title`, `slug`, and `order`.

章節位於 `content/writings/<folder>/chapters/*.md`；每章需要 `title`、`slug`、
`order`。

### Tools / 工具

Path: `content/tools/<folder>/index.md`.

路徑：`content/tools/<folder>/index.md`。

Required: `title`, `number`, `group`, `summary`, `slug`.

必填：`title`、`number`、`group`、`summary`、`slug`。

Optional: `subtitle`, `status`, `references`.

可選：`subtitle`、`status`、`references`。

Interactive UI lives in `src/components/tools/`; grouping lives in
`src/config/toolTopics.ts`.

互動介面位於 `src/components/tools/`；分組位於 `src/config/toolTopics.ts`。

### Responses / 回應

Path: `content/comments/<collection>/<slug>/<id>.json`.

路徑：`content/comments/<collection>/<slug>/<id>.json`。

Required: `collection`, `slug`, `name`, `date`, `body`.

必填：`collection`、`slug`、`name`、`date`、`body`。

Optional: `image`, `imageAlt`, `replyTo`, `author`.

可選：`image`、`imageAlt`、`replyTo`、`author`。

## 5. Studio / 管理器

Run `npm run dev`; open `/admin/`.

執行 `npm run dev`；開啟 `/admin/`。

The Studio is a local file editor, not production authentication.

管理器是本地檔案編輯介面，不是正式網站登入系統。

| Pane / 區域 | Use / 用途 |
| --- | --- |
| Files / 檔案 | Edit files; filter names; search text / 編輯檔案；篩選檔名；搜尋文字 |
| Images / 圖片 | Browse albums; add and delete images; copy URLs; insert Markdown / 瀏覽相簿；新增與刪除圖片；複製網址；插入 Markdown |
| Design / 設計 | Edit language default, type, spacing, motion / 編輯預設語言、字體、間距、動畫 |
| Library / 資料庫 | Edit catalog fields; drafts; comments; trash / 編輯目錄欄位、草稿、回應、回收 |
| New / 新增 | Create work, event, writing drafts / 建立作品、活動、文章草稿 |
| Publish / 發布 | Commit selected files; push to GitHub / 提交選取檔案；推送至 GitHub |
| Preview / 預覽 | Desktop and phone preview / 桌面與手機預覽 |
| Inspect / 檢查 | Locate source and style for visible blocks / 定位可見區塊的來源與樣式 |
| Edit text / 編輯文字 | Edit safe Markdown and literal text in preview / 在預覽中編輯安全 Markdown 與字面文字 |

Use Library for metadata. Use Files for prose and code.

資料欄位用 Library；正文與程式碼用 Files。

## 6. Markdown / Markdown

Markdown renders **strong**, *emphasis*, ***strong emphasis***,
~~deletion~~, `code`, [links](https://example.com), H<sub>2</sub>O,
x<sup>2</sup>, <mark>mark</mark>, and Japanese furigana:
<ruby><span class="ruby-base">音楽</span><rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>.

Markdown 可呈現 **粗體**、*斜體*、***粗斜體***、~~刪除線~~、`程式碼`、
[連結](https://example.com)、H<sub>2</sub>O、x<sup>2</sup>、<mark>標記</mark> 與
日文振假名：<ruby><span class="ruby-base">音楽</span><rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>。

Footnotes, mathematics, figures, tables, block quotes, poetry blocks,
definition lists, and `<details>` are supported.

支援腳註、數學公式、圖片、表格、引文、詩歌區塊、定義列表與 `<details>`。

Rendered reference: Admin Guide -> Markdown Style Guide.

渲染參考：管理指南 -> Markdown 樣式指南。

## 7. Media / 媒體

Images belong in `public/images/`; Markdown uses `/images/name.ext`.

圖片放在 `public/images/`；Markdown 使用 `/images/name.ext`。

The Studio's Images pane adds and deletes images (local dev server only).
"Add images…" writes the chosen files into a folder under `public/images`;
"Delete" on a card moves the image to `content/_trash/images/` (recoverable,
no longer deployed). Deleting an image does not rewrite pages that reference it,
so update those references too.

管理器的「圖片」面板可新增與刪除圖片（僅限本地開發伺服器）。「Add images…」會把
選取的檔案寫入 `public/images` 下的資料夾；卡片上的「Delete」會把圖片移到
`content/_trash/images/`（可復原，且不再發布）。刪除圖片不會自動修改引用它的頁面，
請一併更新那些引用。

A caption gives visible context. `alt` text gives a non-visual description.
Write both when the image carries meaning.

圖片說明是可見語境。`alt` 文字是非視覺描述。重要圖片兩者都寫。

PeerTube video belongs to a work's `video` field. `embedUrl` is required.

PeerTube 影片屬於作品的 `video` 欄位。`embedUrl` 必填。

```yaml
video:
  provider: "peertube"
  embedUrl: "https://example.org/videos/embed/id"
  watchUrl: "https://example.org/w/id"
  poster: "/images/poster.webp"
  posterAlt: "Still from the video."
  caption:
    en: "Performance video."
    zh: "演出影片。"
  title:
    en: "Work title, video"
    zh: "作品名稱，影片"
  aspectRatio: "16 / 9"
```

The player is `src/components/PeerTubeEmbed.astro`; schema is
`src/content.config.ts`; style is `src/styles/global.css`; Studio fields are
`src/pages/admin/index.astro` and `src/scripts/admin.ts`.

播放器在 `src/components/PeerTubeEmbed.astro`；結構檢查在
`src/content.config.ts`；樣式在 `src/styles/global.css`；管理器欄位在
`src/pages/admin/index.astro` 與 `src/scripts/admin.ts`。

The C.V. PDF is `public/files/yixin-cui-cv.pdf`; generation helper:
`scripts/generate-cv-pdf.py`.

履歷 PDF 是 `public/files/yixin-cui-cv.pdf`；生成輔助程式為
`scripts/generate-cv-pdf.py`。

## 8. Language, Theme, Type / 語言、主題、字體

Public languages are `en` and `zh` (`zh-Hant-TW`).

公開語言為 `en` 與 `zh`（`zh-Hant-TW`）。

Shared strings, category labels, dates, durations, and content-language labels
live in `src/config/locales.ts`.

共用文字、分類名稱、日期、時長與內容語言名稱位於 `src/config/locales.ts`。

User choices live in browser storage: `yc-language`, `yc-theme`,
`yc-font-size`, and `yc-font-family`.

使用者選擇存於瀏覽器：`yc-language`、`yc-theme`、`yc-font-size`、
`yc-font-family`。

First-visit language, theme, text size, and typeface defaults live in
`src/config/siteDefaults.json`. The public typeface toggle switches between
`modern-mono` and `garamond`; its `Aa` sample previews the typeface a click will
switch to.

首次訪問的語言、主題、字號與字體預設值位於 `src/config/siteDefaults.json`。
公開網站的字體按鈕在 `modern-mono` 與 `garamond` 之間切換；按鈕上的 `Aa`
會預覽下一次點擊所切換到的字體。

East Asian spacing lives in `src/config/typography.json`.

東亞文字字距位於 `src/config/typography.json`。

Optional motion lives in `src/config/motion.json`.

可選動畫位於 `src/config/motion.json`。

## 9. Design / 設計

`BaseLayout.astro` wraps public pages. `Header.astro` gives navigation and
preferences. `Footer.astro` ends the shell.

`BaseLayout.astro` 包住公開頁。`Header.astro` 提供導覽與偏好設定。
`Footer.astro` 結束頁面外殼。

`global.css` controls public typography, color, spacing, layout, comments,
media, works, writings, events, C.V., and guide pages.

`global.css` 控制公開字體、顏色、間距、佈局、回應、媒體、作品、文章、活動、履歷
與指南頁。

`tools.css` controls tools. `admin.css` controls Studio only.

`tools.css` 控制工具。`admin.css` 只控制管理器。

Prefer Markdown or live guide pages over screenshots; screenshots decay.

優先使用 Markdown 或可渲染指南頁；截圖會過期。

## 10. Tools / 工具

Tool metadata is content. Tool instruments are components. Tool mathematics
belongs in library code.

工具資料是內容。工具介面是元件。工具中的數學屬於函式庫程式碼。

Add a composition tool by creating `content/tools/<slug>/index.md`, creating a
component in `src/components/tools/`, registering it in
`src/pages/tools/composition/[topic].astro`, and placing its slug in
`src/config/toolTopics.ts`.

新增作曲工具：建立 `content/tools/<slug>/index.md`，在 `src/components/tools/`
建立元件，在 `src/pages/tools/composition/[topic].astro` 註冊，並把 slug 放入
`src/config/toolTopics.ts`。

Add a linguistics tool by creating content, a component, and a registry entry
in `src/pages/tools/[slug].astro`.

新增語言學工具：建立內容、元件，並在 `src/pages/tools/[slug].astro` 註冊。

Pure logic belongs in `src/lib/`; test it in `tests/tools-core.test.mjs`.

純邏輯屬於 `src/lib/`；在 `tests/tools-core.test.mjs` 測試。

## 11. Responses / 回應

Enable per work or writing with `comments: true`.

在作品或文章加入 `comments: true` 以開啟回應。

The browser posts to `src/config/comments.ts` -> `endpoint`.

瀏覽器提交至 `src/config/comments.ts` -> `endpoint`。

The Cloudflare Worker creates a pending GitHub Issue. The owner approves by
adding `comment:approved`. The workflow writes JSON to `content/comments/` and
triggers Pages.

Cloudflare Worker 建立待審 GitHub Issue。作者加入 `comment:approved` 即核准。
工作流程把 JSON 寫入 `content/comments/` 並觸發 Pages。

Safe comment Markdown: **bold**, *italic*, quote, `code`, list, link.

安全回應 Markdown：**粗體**、*斜體*、引文、`程式碼`、列表、連結。

Full reference: `docs/comments.md`; Worker setup:
`scripts/comment-worker/README.md`.

完整參考：`docs/comments.md`；Worker 設定：
`scripts/comment-worker/README.md`。

## 12. Publishing / 發布

Push to `main`.

推送至 `main`。

Studio: **Publish** > refresh > check files > write message > commit and push.
Unchecked files stay local.

管理器：**Publish** > 重新整理 > 勾選檔案 > 寫訊息 > 提交並推送。未勾選檔案留在本地。

`.github/workflows/deploy-pages.yml` runs `npm ci`, `npm run check`,
`npm run build`, removes local-only `dist/admin` and `dist/drafts`, then
deploys to GitHub Pages.

`.github/workflows/deploy-pages.yml` 執行 `npm ci`、`npm run check`、
`npm run build`，移除只供本地使用的 `dist/admin` 與 `dist/drafts`，再發布至
GitHub Pages。

Custom domain: `yixincui.com`. DNS lives outside this repository. `CNAME` and
`public/CNAME` record the domain.

自訂網域：`yixincui.com`。DNS 不在本倉庫中。`CNAME` 與 `public/CNAME` 記錄網域。

Comment approval commits may need explicit deployment dispatch; do not remove
the deploy trigger in `comment-approve.yml`.

回應核准提交可能需要明確觸發部署；不要移除 `comment-approve.yml` 中的部署觸發。

## 13. Maintenance Rules / 維護規則

Do not edit generated folders: `.astro/`, `dist/`, `node_modules/`.

不要編輯生成資料夾：`.astro/`、`dist/`、`node_modules/`。

Change schema, Studio fields, content examples, and this manual together.

資料結構、管理器欄位、內容示例與本手冊必須同步修改。

Visible shared UI text belongs in `src/config/locales.ts`.

可見共用介面文字屬於 `src/config/locales.ts`。

A new route belongs in `src/pages/`; a repeated visual unit belongs in
`src/components/`; shared browser behavior belongs in `src/scripts/`; pure
logic belongs in `src/lib/`.

新網址屬於 `src/pages/`；重複視覺單元屬於 `src/components/`；共用瀏覽器行為屬於
`src/scripts/`；純邏輯屬於 `src/lib/`。

Before publishing: check, build, preview changed routes, then commit one
coherent change.

發布前：檢查、建置、預覽變更的路由，然後提交一個完整修改。

End condition: the source and this manual agree; `npm run check` and
`npm run build` pass.

終止條件：原始碼與本手冊一致，`npm run check` 與 `npm run build` 通過。
