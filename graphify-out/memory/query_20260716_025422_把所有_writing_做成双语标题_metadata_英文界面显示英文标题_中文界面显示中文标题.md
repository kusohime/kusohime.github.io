---
type: "implementation"
date: "2026-07-16T02:54:22.444531+00:00"
question: "把所有 writing 做成双语标题 metadata；英文界面显示英文标题，中文界面显示中文标题；同步修改 excerpt 和 subtitle；翻译作品目录页只显示原作者姓名；并把《经验主义的两个教条》日期改为 2021-07-15。"
contributor: "graphify"
outcome: "useful"
source_nodes: ["src/content.config.ts", "src/pages/writings/index.astro", "src/pages/writings/[slug].astro", "src/layouts/BaseLayout.astro", "src/scripts/preferences.ts", "src/scripts/admin.ts", "content/writings/jing-yan-zhu-yi-de-liang-ge-jiao-tiao/index.md", "tests/site-integrity.test.mjs"]
---

# Q: 把所有 writing 做成双语标题 metadata；英文界面显示英文标题，中文界面显示中文标题；同步修改 excerpt 和 subtitle；翻译作品目录页只显示原作者姓名；并把《经验主义的两个教条》日期改为 2021-07-15。

## Answer

Added bilingual title, subtitle, and excerpt metadata across all 24 writing entries; localized writing indexes, article pages, readers, drafts, document title, and meta description; normalized translation bylines to author-only; changed Two Dogmas of Empiricism to 2021-07-15; updated Studio, documentation, and integrity tests. Astro check, tests, clean build, and rendered-output assertions pass.

## Outcome

- Signal: useful

## Source Nodes

- src/content.config.ts
- src/pages/writings/index.astro
- src/pages/writings/[slug].astro
- src/layouts/BaseLayout.astro
- src/scripts/preferences.ts
- src/scripts/admin.ts
- content/writings/jing-yan-zhu-yi-de-liang-ge-jiao-tiao/index.md
- tests/site-integrity.test.mjs