---
title: "Interlinear Gloss"
subtitle: "Leipzig-style gloss builder with multi-format export"
subtitleZh: "萊比錫式逐詞對照標註器，附國際音標鍵盤與多格式匯出"
number: 15
group: "Linguistics"
summary: "Leipzig-style gloss builder with multi-format export"
summaryZh: "萊比錫式逐詞對照標註器，附國際音標鍵盤與多格式匯出"
status: "stable"
slug: "interlinear-glosser"
references:
  - "Comrie, B., Haspelmath, M., & Bickel, B. (2008). [*The Leipzig Glossing Rules: Conventions for Interlinear Morpheme-by-Morpheme Glosses*](https://www.eva.mpg.de/lingua/resources/glossing-rules.php). Max Planck Institute for Evolutionary Anthropology."
  - "International Phonetic Association. (1999). *Handbook of the International Phonetic Association*. Cambridge University Press."
  - "*expex* package documentation (J. Frampton). [CTAN](https://ctan.org/pkg/expex)."
  - "*gb4e* package documentation (A. Dimitriadis, H.-P. Kolb, & C. Thiersch). [CTAN](https://ctan.org/pkg/gb4e)."
---

Enter the object language on the first aligned tier and its
morpheme-by-morpheme gloss on the second; the columns line up by word, the
way the **Leipzig Glossing Rules** prescribe. Grammatical labels written in
ALLCAPS (`NOM`, `3SG`, `PFV`) are rendered in small caps automatically, and
the abbreviations you use are collected into the legend below.

Alignment is at the *word*: each whitespace-separated word is one column,
and the column is as wide as its widest tier. Morpheme breaks (`-`
affix, `=` clitic, `~` reduplication, `<…>` infix) are checked for parity
between the object and gloss lines — a mismatch is flagged as a warning, not
an error, because real data bends the rule. A difference in the *number of
words* across aligned tiers is a hard error and blocks image and LaTeX
export, since those formats require a matching column count.

The **IPA keyboard** inserts at the cursor of whichever tier you last
touched, keeps combining diacritics attached to the preceding glyph, and
accepts X-SAMPA for quick ASCII entry. Add an `IPA` tier when you want a
phonetic line above the morphemes.

Three export targets share one layout engine, so wrapping and spacing match
across them: monospace **plain text** (Unicode-width aware, so diacritics
and CJK stay aligned), **image** as vector SVG or rasterised PNG, and
**LaTeX** for `expex` (recommended; any number of aligned lines) or `gb4e`
(`\gll` / `\glll`), with a `tabular` fallback that needs no package. The
LaTeX exporter escapes special characters and wraps category labels in
`\textsc{}`. The whole example is encoded into the page URL, so a gloss is a
shareable link.
