---
type: "query"
date: "2026-07-17T02:19:16.347541+00:00"
question: "论翻译腔's indentations are erratic"
contributor: "graphify"
outcome: "useful"
source_nodes: ["[slug].astro", "../styles/global.css", "content.config.ts"]
---

# Q: 论翻译腔's indentations are erratic

## Answer

Expanded from original query via graph vocab: [writing, writings, paragraphs, prose, styles, global, markdown, content, translation]. The article source had no stray whitespace. Hidden hr elements and blockquotes triggered the global post-block text-indent reset, so paragraphs alternated between 0px and 34px. Added firstParagraphIndent: true to content/writings/lun-fan-yi-qiang/index.md. Browser verification showed source line and marked drop cap remain 0px, all subsequent top-level prose paragraphs are 34px, and blockquotes remain 0px inside their block inset. Build and tests pass.

## Outcome

- Signal: useful

## Source Nodes

- [slug].astro
- ../styles/global.css
- content.config.ts