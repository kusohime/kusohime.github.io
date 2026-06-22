---
title: "Pitch-Class Set"
subtitle: "Normal order, prime form, Forte class, interval vector"
subtitleZh: "標準序、原型、Forte 類、音程向量"
number: 7
group: "Composition"
summary: "Identifies the set class of any pitch-class collection, with Z-relation, complement, and clockface display."
summaryZh: "辨識任意音級集合的集合類，附 Z 關係、補集與時鐘面顯示。"
status: "stable"
slug: "pc-set-analysis"
references:
  - "Forte, A. (1973). *The Structure of Atonal Music*. Yale University Press."
  - "Rahn, J. (1980). *Basic Atonal Theory*. Longman."
  - "Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton."
  - "Perle, G. (1991). *Serial Composition and Atonality* (6th ed.). University of California Press."
  - "Carter, E. (2002). *Harmony Book*, ed. N. Hopkins & J. F. Link. Carl Fischer."
---

Enter pitch classes as integers (`0 1 4 6`, with `T`/`E` for 10/11) or as
note names without octaves (`C E G`). The analyzer returns normal order,
prime form, Forte class, interval vector, the Z-partner where one exists,
and the complement's class. The clockface draws the set as a polygon, so
inversional symmetry and interval saturation are visible at a glance. The
set can be played as a chord or as an ascending succession from middle C.

Prime forms follow Rahn's packing-from-the-right algorithm, the one most
software implements (music21 included). For five set classes (5-20 among
them) Forte's own table differs by one rotation; both spellings name the
same class. Forte numbers for cardinalities 7–9 follow the
complement-ordinal convention (the complement of 4-Z15 is 8-Z15).

The catalogue is not typed in from a book: all 4,096 subsets of the
aggregate are enumerated and classified at load time. The hand-entered
table contributes only Forte's labels (verified against the published
lists), and the test suite checks the class counts (12/29/38/50), the
idempotence of every prime form, and the interval-vector identity of
every Z-pair. Microtonal input is rejected rather than silently rounded —
set-class theory is a 12-EDO instrument.

Subset/superset browsing was cut: the complete lattice is large, rarely
consulted in practice, and better served by Straus's tables. What remains
is what gets used at the piano: what is this collection, what is it
related to, does it have a twin.

Relevant repertoire and literature: Forte on Webern and Stravinsky;
Perle on the Second Viennese School; Carter's *Harmony Book* practice;
Babbitt and Wuorinen as a matter of course; and any composer auditing
their own harmonic vocabulary.
