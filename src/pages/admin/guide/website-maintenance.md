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
it. **Wrap lines** changes only the editor display and does not change the
file.

**Files / 檔案** 以資料夾形式顯示專案。選擇文字檔案即可編輯。
**Wrap lines** 只改變編輯器中的顯示，不修改檔案內容。

**Images / 圖片** previews image files and can copy a public URL or insert
Markdown. Images normally belong in `public/images/`.

**Images / 圖片** 用於預覽圖片、複製公開網址或插入 Markdown。圖片通常放在
`public/images/`。

**Find / 查詢** searches the whole project. Use it before renaming a class,
URL, field, or component. The shortcut is <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> +
<kbd>Shift</kbd> + <kbd>F</kbd>.

**Find / 查詢** 搜尋整個專案。重新命名 class、網址、欄位或元件前應先查詢。
快捷鍵是 <kbd>Ctrl</kbd> 或 <kbd>Cmd</kbd> + <kbd>Shift</kbd> +
<kbd>F</kbd>。

**Design / 設計** contains one **CSS** button. It opens
`src/styles/global.css`, where the documented variables near the beginning of
the file control color, typography, spacing, widths, header height, and footer
height.

**Design / 設計** 中只保留一個 **CSS** 按鈕。它會開啟
`src/styles/global.css`；檔案開頭附近已經說明的變數用於控制顏色、字型、間距、
寬度、頁首高度和頁尾高度。

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
a dim frame around a meaningful block.

開啟預覽上方的 **Inspect**。將滑鼠移過網頁時，會在有意義的內容區塊周圍顯示
淡色邊框。

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

Simple Astro text remains plain-text-only so component structure cannot be
damaged from the preview. For styles, links, code, and component changes, use
**Inspect**, **Content**, **Design**, or the code editor. The preview path,
desktop/phone size, and active preview mode are remembered while the Studio
refreshes after a save.

此模式有意不修改樣式、連結、程式程式碼或元件結構。此類修改請使用
**Inspect**、**Content**、**Design** 或程式碼編輯器。儲存後管理器重新整理時，預覽
路徑、桌面/手機尺寸和當前預覽模式會被保留。

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

The passcode protects the local Studio file API from casual access. It is not
a hosted user account, encrypted vault, or production CMS login. The guide is
hidden from public navigation and requires a local unlocked Studio, but its
source still belongs to the project.

口令用於防止隨意訪問本地管理器檔案介面，並不是託管賬戶、加密保險庫或線上 CMS
登入。本指南不出現在公開導航中，並要求本地管理器已經解鎖，但其原始檔仍屬於
專案的一部分。

## Publishing / 釋出

The repository currently provides build commands, not a carrier-specific
publishing button. Run the checks above, then use the deployment method
configured for the hosting service. A successful local build produces `dist/`;
that folder is generated and should not be edited.

專案目前提供構建命令，並沒有與特定託管商繫結的釋出按鈕。執行上述檢查後，再
使用託管服務所配置的部署方式。成功的本地構建會生成 `dist/`；該資料夾由程式
生成，不應手動編輯。
