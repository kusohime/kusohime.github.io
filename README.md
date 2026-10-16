# Yixin Cui Website Manual / 崔浥新網站手冊

English and 正體中文 are paired. In the local Admin Guide, use the language
menu to show one language.

英文與正體中文成對書寫。在本地管理指南中，可用語言選單只顯示其中一種。

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
| Verify privacy / 驗證隱私 | `npm run test:privacy` | Check the built public artifact / 檢查建置後的公開產物 |
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
| `public/images/` | Images; private-section assets are excluded from production / 圖片；私人區域素材不進入正式建置 |
| `public/icons/` | Decorative sun, moon, arrow glyphs / 太陽、月亮、箭頭裝飾字形 |
| `public/files/` | Downloads; C.V. PDF is local only / 下載檔；履歷 PDF 僅供本地使用 |
| `src/pages/` | URL routes / 網址路由 |
| `src/layouts/` | Page shells / 頁面外殼 |
| `src/components/` | Reusable visible parts / 可重用可見部件 |
| `src/components/tools/` | Interactive tools / 互動工具 |
| `src/config/` | Site data, taxonomies, translations, guide order / 網站資料、分類、翻譯、指南順序 |
| `src/config/privacy.mjs` | Private sections and excluded assets / 私人區域與排除素材 |
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
| `/bio/` | `src/pages/bio.astro`, `src/config/bioContent.json` | Public bilingual biography / 公開雙語個人簡介 |
| `/works/` | `content/works/*/index.md` | Work catalogue / 作品目錄 |
| `/works/<slug>/` | work frontmatter `slug` | Work detail / 作品詳頁 |
| `/events/` | `content/events/*/index.md` | Event catalogue / 活動目錄 |
| `/events/<slug>/` | event frontmatter `slug` | Event detail / 活動詳頁 |
| `/writings/` | `content/writings/*/index.md` | Private notice; catalogue in local dev / 私人區域提示；本地開發顯示文章目錄 |
| `/writings/<slug>/` | writing frontmatter `slug` | Private notice; writing in local dev / 私人區域提示；本地開發顯示文章 |
| `/writings/<slug>/<chapter>/` | `chapters/*.md` frontmatter `slug` | Private notice; chapter in local dev / 私人區域提示；本地開發顯示章節 |
| `/projects/`, `/projects/<slug>/` | `content/projects/*/index.md` | Private notice; projects in local dev / 私人區域提示；本地開發顯示項目 |
| `/tools/` | `content/tools/`, `src/config/toolTopics.ts` | Private notice; catalogue in local dev / 私人區域提示；本地開發顯示工具目錄 |
| `/tools/composition/<topic>/` | topic grouping | Private notice; grouped tools in local dev / 私人區域提示；本地開發顯示分組工具 |
| `/tools/<slug>/` | individual tool route | Private notice; tool or redirect in local dev / 私人區域提示；本地開發顯示工具或轉向 |
| `/cv/` | `src/pages/cv.astro` | Private notice; full C.V. in local dev / 私人區域提示；本地開發顯示完整履歷 |
| `/rss.xml` | `src/pages/rss.xml.ts` | Empty public feed; writing entries in local dev / 公開 feed 無條目；本地開發顯示文章條目 |
| `/drafts/` | draft content in dev | Local draft shelf / 本地草稿架 |
| `/admin/` | `src/pages/admin/index.astro` | Local Studio / 本地管理器 |
| `/admin/guide/` | `src/pages/admin/guide/` | Local manual / 本地手冊 |

`/admin/` and `/drafts/` are removed from the public Pages artifact.

`/admin/` 與 `/drafts/` 會從公開 Pages 產物中移除。

The entire **Blog** menu (Writings, Projects, and Tools) and C.V. are currently
private. Production builds show “This area is currently private.” / “此區域目前不對外開放。”
at section indexes and existing detail, chapter, topic, and legacy URLs. Original
content and its metadata are excluded from those public pages; hiding a menu or
adding `noindex` alone does not make content private.

整個 **Blog／網誌** 選單（文章、項目、工具）與履歷目前不公開。正式建置在各區域目錄
及現有詳頁、章節、主題與舊網址顯示「This area is currently private.」／「此區域目前不對外開放。」。
原始內容與其中繼資料不會進入這些公開頁面；只隱藏選單或加上 `noindex` 並不能保護內容。

`npm run dev` retains the full local content, tools, and C.V. PDF. `npm run build`
and `npm run preview` use the public private-notice behavior. The policy in
`src/config/privacy.mjs` also excludes the C.V. PDF and writing/project-specific
images from production output. The public RSS feed contains no writing entries.

`npm run dev` 保留完整本地內容、工具與履歷 PDF。`npm run build` 與 `npm run preview`
採用公開網站的私人區域提示。`src/config/privacy.mjs` 的規則亦將履歷 PDF 及文章／項目專用
圖片排除於正式產物之外。公開 RSS feed 不包含文章條目。

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

Optional: `titleRuby`, `subtitle`, `description`, `dedication`, `commission`, `credits`,
`premiere`, `recordingUrl`, `scoreUrl`, `video`, `image`, `imageAlt`, `order`,
`draft`, `comments`.

`titleRuby` pairs `base` text with an `annotation` above it in work headings and
catalogues. Keep `title` plain for browser titles and other metadata.

`titleRuby` 以 `base` 與 `annotation` 配對，在作品標題和目錄中將注字放在基字上方；
`title` 保持純文字，供瀏覽器標題及其他中介資料使用。

可選：`subtitle`、`description`、`dedication`、`commission`、`credits`、`premiere`、
`recordingUrl`、`scoreUrl`、`video`、`image`、`imageAlt`、`order`、`draft`、
`comments`。

Use optional `duration.display.en` / `duration.display.zh` for a duration range
(e.g. `approx. 13–14′` / `約 13–14 分鐘`); this overrides the numeric label and
allows `duration.minutes` to be omitted.

時長範圍可使用 `duration.display.en`／`duration.display.zh`（如 `approx. 13–14′`／
`約 13–14 分鐘`）；此文字取代數值時長標籤，並可省略 `duration.minutes`。

Studio Library saves preserve `duration.display` when the minutes field is
empty. / Studio 資料庫保存時，分鐘欄為空也會保留 `duration.display`。

Categories: `Solo`, `Chamber`, `Large Ensemble`, `Orchestral`,
`Vocal / Choral`, `Arrangements`, `Other`.

Within each work category, entries are sorted by year from newest to oldest;
`order` breaks ties within the same year.

分類：`Solo`、`Chamber`、`Large Ensemble`、`Orchestral`、`Vocal / Choral`、
`Arrangements`、`Other`。

各作品分類內按年份由新到舊排列；同年作品才依 `order` 排序。

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

Required: `title`, `date`, `type`, `language`, `excerpt`, `slug`.

必填：`title`、`date`、`type`、`language`、`excerpt`、`slug`。

Optional: `subtitle`, `order`, `draft`, `comments`.

可選：`subtitle`、`order`、`draft`、`comments`。

Types: `Translation`, `Essay`, `Fiction`, `Blog`, `Poem`, `Program Note`,
`Review`, `Other`.

類型：`Translation`、`Essay`、`Fiction`、`Blog`、`Poem`、`Program Note`、
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
<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>.

Markdown 可呈現 **粗體**、*斜體*、***粗斜體***、~~刪除線~~、`程式碼`、
[連結](https://example.com)、H<sub>2</sub>O、x<sup>2</sup>、<mark>標記</mark> 與
日文振假名：<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>。

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
`scripts/generate-cv-pdf.py`. It remains available in local development at
`/files/yixin-cui-cv.pdf`, but the privacy build policy removes it from production
output while the C.V. is private. Removing the download link alone is insufficient.

履歷 PDF 是 `public/files/yixin-cui-cv.pdf`；生成輔助程式為
`scripts/generate-cv-pdf.py`。本地開發仍可透過 `/files/yixin-cui-cv.pdf` 開啟；
履歷不公開期間，隱私建置規則會將 PDF 從正式產物移除。只移除下載連結並不足夠。

## 8. Language, Theme, Type / 語言、主題、字體

Public languages are `en` and `zh` (`zh-Hant-TW`).

公開語言為 `en` 與 `zh`（`zh-Hant-TW`）。

Shared strings, category labels, dates, durations, and content-language labels
live in `src/config/locales.ts`.

共用文字、分類名稱、日期、時長與內容語言名稱位於 `src/config/locales.ts`。

Public pages have a fixed 16px base size and compact letter spacing. Body text
uses American Garamond (`AmeriGarmnd BT`); navigation and names use Adobe
Garamond Small Caps & Old at regular weight (400). The original Adobe Small Caps
OTF and four American Garamond TTF styles are bundled in `public/fonts/garamond/`
and loaded through CSS URLs on every platform, including macOS. The regular body
and Small Caps faces are preloaded; installed copies and EB Garamond remain
fallbacks, with serif fallbacks for other scripts. The S/L
and Aa controls are removed, and saved size or typeface choices are ignored.

The Small Caps face uses its original glyphs with cap conversion and font
synthesis disabled. Only its lowercase glyphs are enlarged by 15% through
`--small-caps-lowercase-scale`; original capitals keep their size. All-uppercase
words use slightly wider tracking while body text stays small and compact.

公開頁面固定使用 16px 基準字號與緊湊字距。正文使用 American Garamond
（`AmeriGarmnd BT`），導覽與姓名使用 Adobe Garamond Small Caps & Old
的標準字重（400）。原始 Adobe Small Caps OTF 與 American Garamond 四種樣式的
TTF 已存於 `public/fonts/garamond/`，經 CSS 網址載入，macOS 也使用同一套字型。
正文標準體與 Small Caps 預先載入；本機版本、EB Garamond 及各文種襯線字型仍作後備。S/L 與 Aa
切換鈕已移除，舊有字號與字體選擇不再套用。

Small Caps 直接使用原字形，關閉額外的大寫轉換與字型合成。
僅以 `--small-caps-lowercase-scale` 將小寫字形放大 15%，原有大寫字形維持原尺寸。
全大寫單詞稍微加寬字距，正文仍維持小字號與緊湊字距。

User choices live in browser storage: `yc-language`, `yc-theme`.

使用者選擇存於瀏覽器：`yc-language`、`yc-theme`。

First-visit defaults live in `src/config/siteDefaults.json`.

首次訪問預設值位於 `src/config/siteDefaults.json`。

East Asian spacing lives in `src/config/typography.json`.

東亞文字字距位於 `src/config/typography.json`。

Optional motion lives in `src/config/motion.json`.

可選動畫位於 `src/config/motion.json`。

## 9. Design / 設計

`BaseLayout.astro` wraps public pages. `Header.astro` gives navigation and
preferences. `Footer.astro` ends the shell.

`BaseLayout.astro` 包住公開頁。`Header.astro` 提供導覽與偏好設定。
`Footer.astro` 結束頁面外殼。

The homepage's “Read full bio” link opens `/bio/`. Edit its English and Chinese
introduction and body in `src/config/bioContent.json`, or select the biography
text in the local Studio. Blank lines separate paragraphs; inline Markdown
supports links and emphasis. Biography copy uses public facts and does not
import the private C.V.

While `underConstruction` is `true`, the biography page shows a bilingual
construction notice. Set it to `false` when the biography is ready; the saved
introduction and body remain in `bioContent.json`.

首頁的「Read full bio／閱讀完整簡介」連結開啟 `/bio/`。雙語首段與正文位於
`src/config/bioContent.json`，也可在本地 Studio 點選簡介文字編輯。空行分段，
行內 Markdown 可加入連結與強調。簡介只使用公開資料，不匯入私人履歷。

`underConstruction` 為 `true` 時只顯示雙語施工提示；簡介完成後改為 `false`。
原有首段與正文仍保留於 `bioContent.json`。

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

Privacy applies during `npm run build`, before deployment: private-section pages
contain only notices, the RSS feed has no entries, and private assets are omitted.
Check both local development and the built preview when changing this policy.

隱私規則在部署前的 `npm run build` 即生效：私人區域頁面只包含提示、RSS feed 無條目，
私人素材不會輸出。修改規則時，須同時檢查本地開發與建置後的預覽。

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
