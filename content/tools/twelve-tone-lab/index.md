---
title: "Twelve-Tone Table"
subtitle: "Matrix, row forms, invariance checks"
subtitleZh: "矩陣、序列形式、不變性檢查"
number: 8
group: "Composition"
summary: "Builds the 12×12 matrix, looks up P/I/R/RI forms, and tests all-interval and combinatorial properties."
summaryZh: "建立 12×12 矩陣，查找 P/I/R/RI 各形式，並檢驗全音程與組合性等性質。"
status: "stable"
slug: "twelve-tone-lab"
references:
  - "Babbitt, M. (1955). \"Some Aspects of Twelve-Tone Composition.\" *The Score* 12, 53–61."
  - "Babbitt, M. (1960). \"Twelve-Tone Invariants as Compositional Determinants.\" *Musical Quarterly* 46(2), 246–259."
  - "Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton."
  - "Morris, R. (1987). *Composition with Pitch-Classes*. Yale University Press."
  - "Whittall, A. (2008). *The Cambridge Introduction to Serialism*. Cambridge University Press."
---

Enter twelve distinct pitch classes (integers with `T`/`E`, or note
names), or load one of the historical rows. The calculator validates the
row (eleven entries or a duplicated pc is an error, not a warning),
prints the ordered interval string, flags all-interval rows, and builds
the standard matrix: rows are P forms read left to right, columns are I
forms read top down, retrogrades read the other way; the labels on all
four edges follow this convention.

Select any form (P/I/R/RI at any index) to spell it in pcs and note
names, and play it from middle C. The combinatoriality panel lists every
form whose first hexachord completes the aggregate against P's first
hexachord — Babbitt's criterion for clean aggregate polyphony.

Form labels use the starting pitch class: P4 begins on pc 4, I9 begins on
pc 9 (Straus's convention; analysts trained on zero-centered labels
should translate accordingly — the matrix itself is identical). The
interval string lists ordered pc intervals 1–11.

The proposal's "play the matrix" feature was dropped: a matrix is a
reference table, not a piece. Audition is per-form against a neutral
pulse, which is how one actually checks a row's melodic profile. The
historical rows double as test fixtures — the Berg must report
all-interval, the Webern must show its derived combinatorial structure,
and the test suite holds the calculator to both.

Relevant repertoire: Schoenberg op. 25; Berg, *Lyric Suite* (all-interval
row, included); Webern, Concerto op. 24 (derived from [014] trichords —
see its interval string and combinatorial forms); Dallapiccola,
*Quaderno musicale di Annalibera*; Babbitt, *Three Compositions for
Piano* (1947), where hexachordal combinatoriality became a system; late
Stravinsky and Boulez.
