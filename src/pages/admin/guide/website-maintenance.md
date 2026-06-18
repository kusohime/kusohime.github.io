---
layout: ../../../layouts/AdminGuideLayout.astro
title: "Website Maintenance / 網站維護"
description: "A plain-language map of the project, Studio tools, design system, and publishing checks. / 專案結構、管理工具、設計系統與釋出檢查的直白說明。"
slug: "website-maintenance"
---

<!--
  中文：從非程式設計師視角解釋網站結構、管理器工具和安全維護流程。
  English: Explains project structure, Studio tools, and safe maintenance from a non-programmer perspective.
  Caveat / 注意：涉及結構性修改前先儲存備份，並執行檢查與構建。
  Caveat: Back up the project and run checks/builds before structural changes.
-->

## What the website is / 這個網站是什麼

This is an Astro static website. Astro reads Markdown and source files, then
builds ordinary HTML, CSS, JavaScript, and images. There is no database or
online CMS. The Website Studio is a local editing surface for the same files.

這是一個 Astro 靜態網站。Astro 讀取 Markdown 和原始檔，再生成普通的 HTML、
CSS、JavaScript 與圖片。網站沒有資料庫或線上 CMS；Website Studio 只是這些
本地檔案的編輯介面。

## Project map / 專案地圖

| Folder or file / 資料夾或檔案 | What it controls / 控制內容 |
| --- | --- |
| `content/works/` | Work information and program notes / 作品資料與說明 |
| `content/writings/` | Writings, title pages, and chapters / 文章、標題頁與章節 |
| `public/images/` | Images served directly by the site / 網站直接使用的圖片 |
| `src/pages/` | Website addresses and page structures / 網站地址與頁面結構 |
| `src/components/` | Reusable header, footer, and interface pieces / 頁首頁尾等共用部件 |
| `src/layouts/` | Shared page shells / 共用頁面外殼 |
| `src/styles/global.css` | Public typography, colors, spacing, and layout / 公開網站的字型、顏色、間距與佈局 |
| `src/styles/admin.css` | Studio appearance only / 僅管理器外觀 |
| `src/scripts/admin.ts` | Studio behavior / 管理器功能 |
| `src/config/locales.ts` | Shared translations, localized category names, and date formats / 共用翻譯、分類名稱與日期格式 |
| `src/config/motion.json` | Optional animation switches / 可選動畫開關 |
| `src/config/typography.json` | East Asian character spacing / 東亞文字字距 |
| `src/config/` | Other site identity, taxonomies, and guide order / 其他網站資料、分類與指南順序 |
| `src/utils/` | Small reusable source helpers / 小型共用原始碼工具 |
| `src/content.config.ts` | Valid content fields and folder rules / 合法內容欄位與資料夾規則 |
| `astro.config.mjs` | Astro, Markdown mathematics, and local file API / Astro、數學公式與本地檔案介面 |

Files beginning with a dot, `node_modules`, `.astro`, and `dist` are generated
or technical folders. Do not use them for ordinary content work.

以點開頭的檔案，以及 `node_modules`、`.astro`、`dist`，都是生成檔案或技術
資料夾。日常內容維護不要在其中操作。

## Studio panes / 管理器區域

**Files / 檔案** displays the project as folders. Select a text file to edit
it. File filtering and project-wide text search now live together in this
pane. The search shortcut is <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> +
<kbd>Shift</kbd> + <kbd>F</kbd>. **Wrap lines** changes only the editor
display and does not change the file.

**Files / 檔案** 以資料夾形式顯示專案。選擇文字檔案即可編輯；檔名篩選與
全專案文字搜尋都位於同一區域。搜尋快捷鍵是 <kbd>Ctrl</kbd> 或 <kbd>Cmd</kbd> +
<kbd>Shift</kbd> + <kbd>F</kbd>。**Wrap lines** 只改變編輯器中的顯示，
不修改檔案內容。

**Images / 圖片** groups image files into folder albums. Albums load their
thumbnails only when opened and can copy a public URL or insert Markdown.
Images normally belong in `public/images/`.

**Images / 圖片** 會依資料夾分成相簿，開啟相簿時才載入縮圖；可複製公開網址
或插入 Markdown。圖片通常放在 `public/images/`。

Use **Find in files / 在檔案中查詢** before renaming a class, URL, field, or
component. Results open the matching file and line.

重新命名 class、網址、欄位或元件前，應先使用 **Find in files /
在檔案中查詢**；結果會直接開啟相符的檔案與行號。

**Design / 設計** provides visual controls for the default visitor language,
body and heading fonts, font sizes, line heights, paragraph indentation,
paragraph spacing, page widths, gutters, and the site's spacing scale. Changes
preview immediately and update the documented variables near the beginning of
`src/styles/global.css`. **Open global.css** remains available for settings not
represented by a control.

**Design / 設計** 提供新訪客預設語言、內文與標題字型、字號、行高、段落縮排、
段落間距、頁面寬度、頁邊距與全站間距尺度等可視控制。變更會立即預覽，並更新
`src/styles/global.css` 開頭附近的變數。未出現在控制項中的設定仍可透過
**Open global.css** 修改。

**New / 新增** creates a work or writing page. New entries start as drafts by
default, stay out of the public Works and Writings lists, and appear on the
local `/drafts/` shelf. Remove `draft: true` from the new Markdown file when it
is ready to publish.

**New / 新增** 可建立作品或文章頁面。新項目預設為草稿，不會出現在公開的作品
與文章列表中，並可在本地 `/drafts/` 草稿架預覽。完成後，從 Markdown 檔案刪除
`draft: true` 即可公開。

## Video maintenance / 影片維護

Work pages support PeerTube embeds through the `video` frontmatter block.
For routine maintenance, use the Website Studio rather than hand-editing the
YAML: open **New > PeerTube video** when creating a work, or
**Library > Works > PeerTube video** when updating an existing work. Only the
embed URL is required. Leave it blank to remove the video block from a work.

作品頁透過 `video` frontmatter 區塊支援 PeerTube 嵌入。日常維護請優先使用
Website Studio，不要手動編輯 YAML：建立作品時開啟
**New > PeerTube video**；修改既有作品時開啟
**Library > Works > PeerTube video**。只有嵌入網址是必填；清空嵌入網址即可從
作品移除影片區塊。

Use the URL from PeerTube's share or embed panel for `embedUrl`. It normally
contains `/videos/embed/`. Use the ordinary public PeerTube page as `watchUrl`;
that link appears below the player. A poster image is strongly recommended
because the page can show a clean still image first and load PeerTube only
after the visitor presses play.

`embedUrl` 請使用 PeerTube 分享或嵌入面板中的網址，通常包含
`/videos/embed/`。`watchUrl` 請使用普通公開 PeerTube 頁面；這個連結會顯示在
播放器下方。建議填寫封面圖，這樣頁面會先顯示乾淨的靜態圖片，訪客按下播放後
才載入 PeerTube。

The public player is implemented by `src/components/PeerTubeEmbed.astro`,
validated in `src/content.config.ts`, styled in `src/styles/global.css`, and
edited by the Studio fields in `src/pages/admin/index.astro` plus
`src/scripts/admin.ts`. If a maintainer changes the video schema, update all
four places together and then run `npm run check` and `npm run build`.

公開播放器由 `src/components/PeerTubeEmbed.astro` 實作，
`src/content.config.ts` 驗證，`src/styles/global.css` 控制外觀，Studio 欄位則在
`src/pages/admin/index.astro` 與 `src/scripts/admin.ts`。若維護者修改影片資料
結構，請同步更新這幾處，然後執行 `npm run check` 與 `npm run build`。

Do not paste a full iframe tag into Markdown. Store the PeerTube URLs in the
video fields instead. Avoid committing real unpublished videos as public
non-draft pages; use `draft: true` until the work is ready.

不要把完整 iframe 標籤貼進 Markdown；請把 PeerTube 網址放在影片欄位中。未公開
的正式影片不要作為公開頁面提交；準備完成前請保留 `draft: true`。

The five animation switches below **CSS** edit `src/config/motion.json`.
Language flaps, theme fading, font-size scaling, glyph rotation, and interface
motion can be enabled independently. They are all off by default.

**CSS** 下方的五個動畫開關會修改 `src/config/motion.json`。逐字翻頁、主題淡入
淡出、字號縮放、圖形旋轉和介面動畫可以分別開啟；目前預設全部關閉。

The East Asian typography slider edits `src/config/typography.json`. It
controls character spacing when the public site is shown in Traditional
Chinese or Japanese.

東亞排版滑桿會修改 `src/config/typography.json`，用來調整公開網站切換至繁體中文
或日文時的字距。

## Preview inspector / 預覽檢查器

Turn on **Inspect** above the preview. Moving the pointer over the website draws
a dim frame around a meaningful block. Click to pin the selection before using
the toolbar. Press <kbd>Esc</kbd>, click the close button, or choose
**Parent** to move through the hierarchy. Preview links and interactive tool
controls stay inactive while Inspect is on.

開啟預覽上方的 **Inspect**。將滑鼠移過網頁時，會在有意義的內容區塊周圍顯示
淡色邊框。點選後會固定選取範圍，再使用工具列；可按 <kbd>Esc</kbd>、關閉按鈕，
或用 **Parent** 向上選取。Inspect 開啟時，預覽中的連結與互動工具不會被誤觸。

- **Style** opens `src/styles/global.css` near the first shared selector that
  appears to control the block.
- **Content** opens the unique Markdown, Astro, or component file registered
  for that block and searches for its visible text.

- **Style** 會開啟 `src/styles/global.css`，定位到可能控制該區塊的第一個共用
  選擇器附近。
- **Content** 會開啟為該區塊登記的唯一 Markdown、Astro 或元件檔案，並尋找其
  可見文字。

The inspector is a locator, not a browser developer tool. A block may inherit
styles from several selectors, and generated text may not have an exact
one-line source match. When the first result is not enough, use global Find.

檢查器是定位工具，不是完整的瀏覽器開發工具。一個區塊可能從多個選擇器繼承
樣式，生成文字也不一定對應某一行原始碼。首次定位不夠準確時，請使用全域性查詢。

## Visual text editing / 可視文字編輯

Turn on **Edit text** above the preview, then click a paragraph, heading,
caption, or list item. Markdown blocks can change heading level, add bold,
italic, inline code, ruby, LaTeX, quotes, and lists. **Add above** and
**Add below** create blocks; **Delete block** requires a second confirming
click. Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Enter</kbd> to apply, or
<kbd>Esc</kbd> to cancel. A blank line creates a separate Markdown block.

開啟預覽上方的 **Edit text**，再點選段落、標題、圖注或列表專案。Markdown
區塊可以調整標題層級，並加入粗體、斜體、行內程式碼、ruby、LaTeX、引用和列表。
**Add above** 與 **Add below** 新建區塊；**Delete block** 需要再次點選確認。按
<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Enter</kbd> 應用，按
<kbd>Esc</kbd> 取消；空行會分隔 Markdown 區塊。

Literal text in Astro files supports a protected set of inline typography:
italic, bold, small caps, letter spacing, language marks, superscript, custom
letter spacing, and relative font size. Components and Astro expressions remain
protected. For links, code, and component changes, use **Inspect**,
**Content**, **Design**, or the code editor. The preview path, desktop/phone
size, and active preview mode are remembered while the Studio refreshes after
a save.

Astro 檔案中的字面文字可使用受保護的行內排版功能，包括斜體、粗體、小型大寫、
字距、語言標記、上標、自訂字距與相對字號；元件與 Astro 表達式仍受保護。連結、
程式碼與元件修改請使用 **Inspect**、**Content**、**Design** 或程式碼編輯器。
儲存後管理器重新整理時，預覽路徑、桌面/手機尺寸和當前預覽模式會被保留。

Drag the narrow separators between **Project**, **Code**, and **Preview** to
resize the panes. The minus button folds a pane horizontally; the plus button
opens it again. Widths and folded states are remembered in this browser.

拖動 **Project**、**Code** 與 **Preview** 之間的窄分隔條即可調整寬度。減號會將
區域橫向摺疊，加號會重新展開；寬度與摺疊狀態會儲存在當前瀏覽器中。

Heading size, header height, and footer height remain available as
`--heading-size`, `--header-padding`, and `--footer-min-height` in
`src/styles/global.css`.

標題字號、頁首高度和頁尾高度仍可透過 `src/styles/global.css` 中的
`--heading-size`、`--header-padding` 與 `--footer-min-height` 修改。

## A safe editing routine / 穩妥的編輯流程

1. Open the relevant content or source file.
2. Make one understandable group of changes.
3. Save and inspect both desktop and phone previews.
4. Check nearby pages that share the same component or CSS.
5. Run `npm run check`.
6. Run `npm run build`.

1. 開啟相關內容或原始檔。
2. 一次完成一組容易理解的修改。
3. 儲存後檢查桌面和手機預覽。
4. 檢查使用相同元件或 CSS 的附近頁面。
5. 執行 `npm run check`。
6. 執行 `npm run build`。

Auto-save is convenient for prose. For broad CSS or code experiments, manual
save is easier to control. The line-wrap switch affects only how code appears
in the editor.

自動儲存適合文字編輯。大範圍實驗 CSS 或程式程式碼時，手動儲存更容易控制。
自動換行開關隻影響程式碼在編輯器中的顯示。

## Common caveats / 常見注意事項

Changing `global.css`, a layout, or a component can affect many pages at once.
Changing Markdown usually affects only that work, writing, or chapter.

修改 `global.css`、佈局或元件可能同時影響很多頁面；修改 Markdown 通常隻影響
對應的作品、文章或章節。

Do not edit `package-lock.json`, generated `.astro` files, `dist`, or
`node_modules` by hand. Do not place private information in the repository:
static website source can be copied when published.

不要手動編輯 `package-lock.json`、生成的 `.astro` 檔案、`dist` 或
`node_modules`。不要把私人資訊放進專案：靜態網站釋出後，源內容可能被複制。

The Studio is local-only. It is not a hosted user account, encrypted vault, or
production CMS login. The guide is hidden from public navigation, but its source
still belongs to the project.

本地管理器僅供本地使用，並不是託管賬戶、加密保險庫或線上 CMS 登入。本指南不出
現在公開導航中，但其原始檔仍屬於專案的一部分。

## Publishing / 釋出

The repository currently provides build commands, not a carrier-specific
publishing button. Run the checks above, then use the deployment method
configured for the hosting service. A successful local build produces `dist/`;
that folder is generated and should not be edited.

專案目前提供構建命令，並沒有與特定託管商繫結的釋出按鈕。執行上述檢查後，再
使用託管服務所配置的部署方式。成功的本地構建會生成 `dist/`；該資料夾由程式
生成，不應手動編輯。
