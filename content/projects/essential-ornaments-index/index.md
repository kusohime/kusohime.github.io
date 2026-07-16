---
title: "Essential Ornaments: a historical concordance"
titleZh: "本質裝飾音：歷史演奏法可查索引"
subtitle: "Signs, names, and realizations across European performance treatises, 1565–1828"
subtitleZh: "1565 至 1828 年歐洲演奏法文獻中的符號、名稱與奏法"
summary: "An open, source-linked index of historical ornament vocabulary and notation, beginning with Liselotte Brändle’s comparative chart Die „Wesentlichen Manieren“."
summaryZh: "以 Liselotte Brändle 的比較圖表《Die „Wesentlichen Manieren“》為起點，建立可搜尋、可追溯原始文獻的歷史裝飾音詞彙與記譜索引。"
status: in-progress
startDate: "2026-07-15"
updated: "2026-07-15"
role:
  en: "Research, source verification, data modeling, transcription, and web development"
  zh: "研究、原典核對、資料建模、轉錄與網站開發"
topics:
  - historical performance practice
  - music notation
  - digital humanities
  - open scholarly data
links:
  - label: "1974 chart catalogue record"
    url: "https://www.finna.fi/Record/vaari.2363623"
  - label: "MEI Guidelines"
    url: "https://music-encoding.org/guidelines/"
slug: essential-ornaments-index
order: 1
featured: true
draft: false
---

## Aim

This project turns a large comparative ornament chart into a research tool. Instead of reproducing a static sheet, the online edition separates its evidence into searchable records: historical source, ornament family, period name, written sign, notated realization, language, and verification history.

The starting artifact is Liselotte Brändle’s *Die „Wesentlichen Manieren“ (Ornamente in der Musik): ihre Zeichen, Namen und Ausführung*, first published in Vienna in 1974 and reprinted in 1985. It compares eighteen sources from Tomás de Santa María to Johann Nepomuk Hummel across seven broad ornament families.

## Editorial method

The supplied scan is used as a finding aid, not as the final authority. Every chart cell will be checked against a digitized copy of the original treatise. Historical spelling is preserved in the diplomatic field; normalized names and modern cross-references live in separate fields. Unclear readings remain visibly provisional rather than being silently regularized.

The local working edition includes a lossless crop of every populated chart cell from the supplied scan, providing complete facsimile coverage so that omissions can be audited and no printed alternative silently disappears. Each crop is an untranscribed visual witness, not machine-readable notation or an accessible text substitute. Every audited item also has a stable identifier and a searchable diplomatic text description of its sign, relative contour, rhythm, confidence, and unresolved readings. These chart witnesses and descriptions remain visually and editorially distinct from the independent edition. Before the chart images are deployed publicly, reproduction permission should be confirmed. Independently transcribed notation is encoded in MEI and rendered as SVG; modern staff placement and standardized glyphs are identified as editorial normalizations.

## Current release

The current implementation establishes the complete eighteen-source register, seven normalized ornament families, and all 106 populated source-family cells. A cell-by-cell audit accounts for 306 visible signs, realizations, alternative glyphs, and contextual placements. Every populated cell has a full-cell facsimile preserving all material printed in that area of the supplied PDF, and all 306 audited items are individually addressable and searchable through diplomatic descriptions. A separately labeled source-verified MEI layer currently includes Bach's 1720 *Trillo*, *Mordant*, and *Cadence*. The facsimiles and descriptive records make the complete chart inspectable now; they are not a claim that all 306 items have already been independently engraved or checked against their original treatises.

## Roadmap

1. Verify the bibliography and locate the exact edition used for every row.
2. Add page or folio citations for every ornament example.
3. Add independently verified MEI to each variant record while retaining the complete-cell audit trail.
4. Add faceted comparison by source, date, language, instrument, family, and starting-note convention.
5. Publish the dataset with a version number, change log, and downloadable scholarly format.
