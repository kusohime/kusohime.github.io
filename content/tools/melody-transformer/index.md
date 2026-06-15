---
title: "Melody & Chord Transformer"
subtitle: "Transposition, inversion, retrograde, rotation"
number: 10
group: "Composition"
summary: "Applies chained operations to a note list and records the chain; original and result are shown and played side by side."
status: "stable"
slug: "melody-transformer"
references:
  - "Lewin, D. (1987). *Generalized Musical Intervals and Transformations*. Yale University Press."
  - "Morris, R. (1987). *Composition with Pitch-Classes*. Yale University Press."
  - "Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton."
  - "Mead, A. (1994). *An Introduction to the Music of Milton Babbitt*. Princeton University Press."
  - "Bach, J. S. (1747). *Musikalisches Opfer*, BWV 1079."
---

Load a series of notes with octaves (`C4 D4 F4 E4 G4`). Then apply
operations in any order: transposition by semitones, inversion around an
explicit axis note, retrograde, rotation. Every step is appended to the
chain readout (`T+2 → I(C4) → R`), and **Undo** pops one step — the chain
is the document. The graph shows the original contour dashed and the
current result in red; both can be played at a neutral pulse.

Operations act on absolute pitch (MIDI), not pitch classes: inversion
around C4 means registral mirroring through middle C, the strict
dodecaphonic sense. For pc-space reflection — register preserved, only
chroma flipped — use Tool No. 12, which exists precisely because
conflating the two domains is the classic error. Double inversion around
the same axis restores the original; the test suite holds the operations
to their group properties.

Grander operations from the proposal — contour-preserving remaps, spacing
normalization, anchor-note preservation — are each a composite of the
four primitives plus judgment, and judgment should stay with the
composer; a tool that "normalizes spacing" makes compositional decisions
silently. The provenance chain, by contrast, is pure tooling value: undo,
reproducibility, and a sketch diary at once. This is also the module the
other tools build on — the reflection and serial operations are its
special cases.

Relevant repertoire: the contrapuntal canon from Bach (*Musical
Offering*) through Webern's mirror forms; Hindemith, *Ludus Tonalis*
(postlude = prelude inverted and retrograded); Dallapiccola and Berio;
anyone writing canons by inversion at the fifth still does exactly this
arithmetic.
