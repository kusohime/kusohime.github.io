---
type: "implementation"
date: "2026-07-16T03:57:17.190357+00:00"
question: "Add a persisted Modern Mono/Garamond typeface toggle with script-aware typography and mobile support"
contributor: "graphify"
outcome: "useful"
source_nodes: ["src/components/Preferences.astro,src/scripts/preferences.ts,src/layouts/BaseLayout.astro,src/styles/global.css,src/styles/igt.css,src/config/siteDefaults.json,src/config/locales.ts,src/pages/admin/index.astro,src/scripts/admin.ts"]
---

# Q: Add a persisted Modern Mono/Garamond typeface toggle with script-aware typography and mobile support

## Answer

Implemented the Aa toggle, first-visit defaults, no-flash persistence, true EB Garamond italic, Traditional Chinese Noto Serif TC selection, Gentium Greek, Noto Serif Hebrew RTL isolation, Garamond date numerals, drop-cap tuning, Studio controls, documentation, tests, and desktop/mobile visual QA.

## Outcome

- Signal: useful

## Source Nodes

- src/components/Preferences.astro,src/scripts/preferences.ts,src/layouts/BaseLayout.astro,src/styles/global.css,src/styles/igt.css,src/config/siteDefaults.json,src/config/locales.ts,src/pages/admin/index.astro,src/scripts/admin.ts