---
title: "Melody & Chord Transformer"
subtitle: "Transposition, inversion, retrograde, rotation — with receipts"
number: 10
group: "Transformation"
summary: "Apply chained canonical operations to a line or chord and keep the full provenance; original and result stay visible together."
status: "stable"
slug: "melody-transformer"
---

## How to use it

Load a series of notes with octaves (`C4 D4 F4 E4 G4`). Then apply
operations in any order: transposition by semitones, inversion around an
explicit axis note, retrograde, rotation. Every step is appended to the
chain readout (`T+2 → I(C4) → R`), and **Undo** pops one step — the chain
is the document. The graph shows the original contour dashed and the
current result in red; the two play buttons audition either at a neutral
pulse.

## Conventions

Operations act on absolute pitch (MIDI), not pitch classes: inversion
around C4 means registral mirroring through middle C, the strict
dodecaphonic sense. (For pc-space reflection — where register is
preserved and only chroma flips — use Tool No. 12, which exists precisely
because conflating the two domains is the classic error.) Double
inversion around the same axis restores the original; the test suite
holds the operations to their group properties.

## Design notes

The proposal listed grander operations — contour-preserving remaps,
spacing normalization, anchor-note preservation. Each is a composite of
the four primitives plus judgment, and judgment should stay with the
composer; a tool that "normalizes spacing" is making compositional
decisions silently. The provenance chain, by contrast, is pure tooling
value: it is undo, reproducibility, and a sketch diary at once. This is
the module the proposal correctly called the platform's most reusable —
the reflection and serial tools are mathematically its special cases.

## Repertoire

The contrapuntal canon from Bach (*Musical Offering*'s canons are this
panel avant la lettre) through Webern's mirror forms. Hindemith's *Ludus
Tonalis* (the postlude is the prelude inverted and retrograded). Berio
and Dallapiccola's transformational lyricism; Boulez's multiplication
begins where this chain ends. Any composer writing canons by inversion at
the fifth still does exactly this arithmetic, usually with more errors.

## References

- Lewin, D. (1987). *Generalized Musical Intervals and Transformations*. Yale University Press.
- Morris, R. (1987). *Composition with Pitch-Classes*. Yale University Press.
- Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton.
- Mead, A. (1994). *An Introduction to the Music of Milton Babbitt*. Princeton University Press.
- Bach, J. S. (1747). *Musikalisches Opfer*, BWV 1079. (The empirical literature.)
