# Graph Report - .  (2026-07-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 905 nodes · 1833 edges · 39 communities (36 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3224c435`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tools-core.test.mjs
- KinshipCalculator.astro
- ../../lib/audio.js
- MessiaenModes.astro
- renderer.js
- PolyrhythmCycles.astro
- kinship-core.js
- worker.js
- dependencies
- package.json
- igt-render.js
- StringHarmonics.astro
- ./BaseLayout.astro
- ../../scripts/admin
- preferences.ts
- locales.ts
- InterlinearGlosser.astro
- rehypeCitationLinks.mjs
- [slug].astro
- [topic].astro
- cjkTypography.ts
- content.config.ts
- AdminGuideLayout.astro
- kanbun.js
- site-integrity.test.mjs
- generate-cv-pdf.py
- toolTopics.ts
- MultiphonicsBrowser.astro
- ipa-keyboard.js
- Comments.astro
- Kanbun.astro
- rss.xml.ts
- decorativeGlyphs.ts
- footnoteSidenotes.ts
- RunWebsite.csproj
- adminGuideLanguage.ts
- PC_NAMES_FLAT

## God Nodes (most connected - your core abstractions)
1. `./BaseLayout.astro` - 34 edges
2. `../../scripts/admin` - 24 edges
3. `mod12()` - 21 edges
4. `applyLanguage()` - 21 edges
5. `translate()` - 20 edges
6. `frac()` - 14 edges
7. `../../lib/pitch.js` - 13 edges
8. `../../lib/audio.js` - 13 edges
9. `formatDate()` - 13 edges
10. `toPcSet()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `mountKeyboard()` --indirect_call--> `token()`  [INFERRED]
  src/lib/keyboard.js → scripts/comment-worker/worker.js
- `parseCountList()` --indirect_call--> `token()`  [INFERRED]
  src/lib/parse.js → scripts/comment-worker/worker.js
- `parsePattern()` --indirect_call--> `token()`  [INFERRED]
  src/lib/canon.js → scripts/comment-worker/worker.js
- `parseVoice()` --indirect_call--> `token()`  [INFERRED]
  src/lib/fugue.js → scripts/comment-worker/worker.js
- `parseNoteList()` --indirect_call--> `token()`  [INFERRED]
  src/lib/parse.js → scripts/comment-worker/worker.js

## Import Cycles
- None detected.

## Communities (39 total, 3 thin omitted)

### Community 0 - "tools-core.test.mjs"
Cohesion: 0.05
Nodes (86): bgcd(), blcm(), fadd(), fcmp(), fdiv(), feq(), flcm(), fmul() (+78 more)

### Community 1 - "KinshipCalculator.astro"
Cohesion: 0.07
Nodes (56): ../../lib/kinship-compose.js, ../../lib/kinship-core.js, ../../lib/kinship-data.js, ../../lib/kinship-render.js, ADD_SPECS, addBranch(), AGE_WORD, applyTransform() (+48 more)

### Community 2 - "../../lib/audio.js"
Cohesion: 0.05
Nodes (46): ../../lib/audio.js, ../../lib/fugue.js, ../../lib/keyboard.js, ../../lib/parse.js, ../../lib/partials.js, ../../lib/pcset.js, ../../lib/pitch.js, ../../lib/reflect.js (+38 more)

### Community 3 - "MessiaenModes.astro"
Cohesion: 0.09
Nodes (39): ../../lib/fraction.js, ../../lib/modes.js, byId(), current(), load(), play(), push(), render() (+31 more)

### Community 4 - "renderer.js"
Cohesion: 0.05
Nodes (42): appendLog(), basename(), buildButton, changedFiles, checkButton, commitMessage, currentState, entryStatusLabel() (+34 more)

### Community 5 - "PolyrhythmCycles.astro"
Cohesion: 0.09
Nodes (40): ../../lib/canon.js, ../../lib/tempo.js, describeUnit(), parseTuplet(), solve(), unitSelects, analyze(), canonClock (+32 more)

### Community 6 - "kinship-core.js"
Cohesion: 0.10
Nodes (35): AGE, allowedAdds(), appendStep(), decompose(), deserialize(), deserializeTree(), DOWN, emptyQuery() (+27 more)

### Community 7 - "worker.js"
Cohesion: 0.11
Nodes (29): corsHeaders(), ensureBranch(), fetch(), gh(), handleHealth(), json(), repoSlug(), storePendingImage() (+21 more)

### Community 8 - "dependencies"
Cohesion: 0.06
Nodes (34): astro, codemirror, @codemirror/autocomplete, @codemirror/commands, @codemirror/lang-css, @codemirror/lang-html, @codemirror/lang-javascript, @codemirror/lang-markdown (+26 more)

### Community 9 - "package.json"
Cohesion: 0.06
Nodes (30): @astrojs/check, electron, @electron/packager, esbuild-wasm, description, devDependencies, @astrojs/check, electron (+22 more)

### Community 10 - "igt-render.js"
Cohesion: 0.15
Nodes (27): demoExample(), deserialize(), emptyExample(), glossSubParts(), isCategoryLabel(), isWide(), layout(), makeTier() (+19 more)

### Community 11 - "StringHarmonics.astro"
Cohesion: 0.16
Nodes (28): acousticFundamental(), applyPreset(), centsBetween(), clampInt(), clampPartial(), describePitch(), drawString(), escapeHtml() (+20 more)

### Community 12 - "./BaseLayout.astro"
Cohesion: 0.11
Nodes (18): ../config/locales, ../config/site, ../scripts/cjkTypography, ../scripts/decorativeGlyphs, ../scripts/footnoteSidenotes, ../scripts/preferences, ../styles/global.css, katex/dist/katex.min.css (+10 more)

### Community 13 - "../../scripts/admin"
Cohesion: 0.09
Nodes (22): ../styles/admin.css, ../../scripts/admin, defaultMotionSettings, DirectoryPickerOptions, editableExtensions, extensionOf(), FileTreeNode, GitSnapshot (+14 more)

### Community 14 - "preferences.ts"
Cohesion: 0.15
Nodes (28): contentLanguageLabel(), formatCommission(), formatDedication(), formatDuration(), formatPremiere(), toolGroupLabel(), workCategoryLabel(), writingTypeLabel() (+20 more)

### Community 15 - "locales.ts"
Cohesion: 0.14
Nodes (17): ../../config/contentTaxonomy, toAnchor(), workCategories, WorkCategory, WritingType, writingTypes, contentLanguageTranslations, DurationData (+9 more)

### Community 16 - "InterlinearGlosser.astro"
Cohesion: 0.13
Nodes (20): [], ../../lib/igt-core.js, ../../lib/igt-render.js, ../../lib/ipa-keyboard.js, bind(), buildTierEditors(), copy(), decodeSharePayload() (+12 more)

### Community 17 - "rehypeCitationLinks.mjs"
Cohesion: 0.16
Nodes (19): editableExtensions, execFileAsync, ignoredDirectories, imageContentTypes, imageExtensions, localStudioPlugin(), ALIASES, applyAliases() (+11 more)

### Community 18 - "[slug].astro"
Cohesion: 0.16
Nodes (13): ../../styles/igt.css, ../../utils/cjkLanguage, ../../utils/contentPaths, bodyLang, chapters, contentLang, currentIndex, getStaticPaths() (+5 more)

### Community 19 - "[topic].astro"
Cohesion: 0.19
Nodes (10): ../../config/toolTopics, ../lib/safeHtml.js, ../../styles/kanbun.css, ../../styles/tools.css, ../config/homeContent.json, escapeHtml(), renderParagraphs(), renderSafeInlineMarkdown() (+2 more)

### Community 20 - "cjkTypography.ts"
Cohesion: 0.20
Nodes (18): appendSpacer(), appendTextSpan(), cjkLangFor(), hasNativeAutospace(), initializeCjkTypography(), isCjk(), isCjkPunctuation(), isWestern() (+10 more)

### Community 21 - "content.config.ts"
Cohesion: 0.12
Nodes (12): toolGroups, collections, comments, events, eventsZh, localizedText, tools, toolsZh (+4 more)

### Community 22 - "AdminGuideLayout.astro"
Cohesion: 0.23
Nodes (7): ../config/adminGuide, ../scripts/adminGuideLanguage, AdminGuideChapter, adminGuideChapters, currentIndex, description, title

### Community 23 - "kanbun.js"
Cohesion: 0.23
Nodes (10): html, md, source, brackets, isKana(), leftBrackets, renderKanbun(), replaceBetween() (+2 more)

### Community 24 - "site-integrity.test.mjs"
Cohesion: 0.23
Nodes (6): escapeHtml(), renderCommentMarkdown(), renderInline(), safeUrl(), contentRoot, root

### Community 25 - "generate-cv-pdf.py"
Cohesion: 0.47
Nodes (8): build(), bullets(), entry(), line_item(), p(), section(), subheading(), two_col()

### Community 26 - "toolTopics.ts"
Cohesion: 0.24
Nodes (9): ToolGroup, Locale, anchorForSlug, legacyTopicForSlug, toolTopicById, ToolTopicDef, toolTopicList, topicForSlug (+1 more)

### Community 27 - "MultiphonicsBrowser.astro"
Cohesion: 0.32
Nodes (7): ../../lib/multiphonics-data.js, byId(), instrumentLabel(), instrumentSelect, render(), techniqueSelect, INSTRUMENTS

### Community 28 - "ipa-keyboard.js"
Cohesion: 0.46
Nodes (6): PALETTES, XSAMPA, xsampaToIpa(), loadRecent(), mountIpaKeyboard(), saveRecent()

### Community 29 - "Comments.astro"
Cohesion: 0.33
Nodes (3): ../config/comments, ../lib/commentMarkdown.js, commentsConfig

### Community 30 - "Kanbun.astro"
Cohesion: 0.33
Nodes (6): ../../lib/kanbun.js, demo, insertPair(), render(), sample, string

### Community 31 - "rss.xml.ts"
Cohesion: 0.53
Nodes (4): site, escapeXml(), GET(), normalizedDate()

### Community 32 - "decorativeGlyphs.ts"
Cohesion: 0.47
Nodes (5): glyphUrls, initializeDecorativeGlyphs(), randomGlyph(), shuffledGlyphs(), Theme

### Community 33 - "footnoteSidenotes.ts"
Cohesion: 0.70
Nodes (4): enhanceProse(), enhanceScope(), initializeFootnoteSidenotes(), inlineNoteContent()

## Knowledge Gaps
- **229 isolated node(s):** `frame`, `loading`, `loadingDetail`, `loadingRepo`, `loadingServer` (+224 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `./BaseLayout.astro` connect `./BaseLayout.astro` to `locales.ts`, `[slug].astro`, `[topic].astro`, `AdminGuideLayout.astro`, `rss.xml.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `../../scripts/admin` connect `../../scripts/admin` to `locales.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `initializeAdminStudio()` connect `../../scripts/admin` to `MessiaenModes.astro`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mod12()` (e.g. with `toPcSet()` and `combinatorialForms()`) actually correct?**
  _`mod12()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `frame`, `loading`, `loadingDetail` to the rest of the system?**
  _229 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tools-core.test.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.051058046981168705 - nodes in this community are weakly interconnected._
- **Should `KinshipCalculator.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.06980433632998413 - nodes in this community are weakly interconnected._