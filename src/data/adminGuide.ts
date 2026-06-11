/**
 * 中文：定义私有管理指南的章节顺序、网址与双语简介。
 * English: Defines the private Admin Guide chapter order, URLs, and bilingual summaries.
 * Caveat / 注意：新增指南章节时，也要在 src/pages/admin/guide/ 中建立同名页面。
 * Caveat: When adding a chapter, create the matching page in src/pages/admin/guide/.
 */
export const adminGuideChapters = [
  {
    slug: "content-library",
    title: "Content Library / 内容资料库",
    description:
      "Add, revise, organize, and remove works, writings, and writing chapters. / 新增、修改、整理和删除作品、文章与章节。",
  },
  {
    slug: "markdown-style-guide",
    title: "Markdown Style Guide / Markdown 样式指南",
    description:
      "Examples of text, notes, mathematics, images, poetry, tables, and embedded HTML. / 文本、脚注、公式、图片、诗歌、表格与嵌入 HTML 示例。",
  },
  {
    slug: "website-maintenance",
    title: "Website Maintenance / 网站维护",
    description:
      "A plain-language map of the project, Studio tools, design settings, and safe editing workflow. / 项目结构、管理工具、设计设置和安全编辑流程的直白说明。",
  },
] as const;

export type AdminGuideChapter = (typeof adminGuideChapters)[number];
