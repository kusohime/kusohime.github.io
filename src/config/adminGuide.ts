/**
 * 中文：定義私有管理指南的章節順序、網址與雙語簡介。
 * English: Defines the private Admin Guide chapter order, URLs, and bilingual summaries.
 * Caveat / 注意：新增指南章節時，也要在 src/pages/admin/guide/ 中建立同名頁面。
 * Caveat: When adding a chapter, create the matching page in src/pages/admin/guide/.
 */
export const adminGuideChapters = [
  {
    slug: "site-manual",
    title: "Site Manual / 網站手冊",
    description:
      "A compact reference for routes, content, Studio, media, tools, responses, and publishing. / 網址、內容、管理器、媒體、工具、回應與發布的精簡參考。",
  },
  {
    slug: "content-library",
    title: "Content Library / 內容資料庫",
    description:
      "Add, revise, organize, and remove works, writings, and writing chapters. / 新增、修改、整理和刪除作品、文章與章節。",
  },
  {
    slug: "markdown-style-guide",
    title: "Markdown Style Guide / Markdown 樣式指南",
    description:
      "Examples of text, notes, mathematics, images, poetry, tables, and embedded HTML. / 文字、腳註、公式、圖片、詩歌、表格與嵌入 HTML 示例。",
  },
  {
    slug: "website-maintenance",
    title: "Website Maintenance / 網站維護",
    description:
      "A plain-language map of the project, Studio tools, design settings, and safe editing workflow. / 專案結構、管理工具、設計設定和安全編輯流程的直白說明。",
  },
] as const;

export type AdminGuideChapter = (typeof adminGuideChapters)[number];
