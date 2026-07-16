---
type: "implementation"
date: "2026-07-16T03:20:31.416746+00:00"
question: "用户选择 D 方案，并要求 Miscellaneous Remarks on Calligraphy 标注为古汉语同时译成英文和现代汉语，且恢复首段缩进。"
contributor: "graphify"
outcome: "useful"
source_nodes: ["src/pages/writings/index.astro,src/pages/writings/[slug].astro,src/content.config.ts,src/config/locales.ts,src/styles/global.css,content/writings/shu-fa-san-lun/index.md,src/scripts/admin.ts,src/pages/admin/index.astro,tests/site-integrity.test.mjs"]
---

# Q: 用户选择 D 方案，并要求 Miscellaneous Remarks on Calligraphy 标注为古汉语同时译成英文和现代汉语，且恢复首段缩进。

## Answer

Implemented translation route metadata and D-style display after author names on the writings index and detail pages; added Classical Chinese to English plus Modern Chinese metadata for shu-fa-san-lun; added a per-entry firstParagraphIndent override; updated all translation entries, admin editing fields, documentation, and integrity tests.

## Outcome

- Signal: useful

## Source Nodes

- src/pages/writings/index.astro,src/pages/writings/[slug].astro,src/content.config.ts,src/config/locales.ts,src/styles/global.css,content/writings/shu-fa-san-lun/index.md,src/scripts/admin.ts,src/pages/admin/index.astro,tests/site-integrity.test.mjs