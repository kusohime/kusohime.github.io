---
title: "Modes Quick Lookup"
subtitle: "Messiaen's seven modes"
subtitleZh: "梅湘的七種有限移位調式"
number: 9
group: "Composition"
summary: "Lists each mode's distinct transpositions and symmetry axes, and checks which of your pitches fall inside a chosen transposition."
summaryZh: "列出每種調式的相異移位與對稱軸，並檢查你的哪些音落在所選移位之內。"
status: "beta"
slug: "messiaen-modes"
references:
  - "Messiaen, O. (1944/1956). *The Technique of My Musical Language*, trans. J. Satterfield. Leduc."
  - "Messiaen, O. (1994–2002). *Traité de rythme, de couleur, et d'ornithologie*. Leduc."
  - "Cheong, W.-L. (2003). \"Messiaen's Chord Tables: Ordering the Disordered.\" *Tempo* 57(226), 2–10."
  - "Pople, A. (1998). *Messiaen: Quatuor pour la fin du temps*. Cambridge University Press."
  - "Forte, A. (1991). \"Debussy and the Octatonic.\" *Music Analysis* 10(1–2), 125–169."
---

Pick a mode and a transposition — the selector only offers the distinct
ones (two for Mode 1, three for Mode 2, four for Mode 3, six for the
rest; the counts are computed from the symmetry, not asserted). The
clockface shows the mode as a polygon with its inversional axes dashed;
the panel lists the notes and symmetry facts. The mode can be played
ascending or as a sustained field.

The overlap checker takes your own pitches and reports what falls inside
and outside the chosen transposition — the practical question ("can this
passage live in Mode 3², and which notes would have to go?") that one
otherwise answers by squinting.

Modes are templates from C using Messiaen's numbering (chapter XVI of the
*Technique*); transposition Tₙ means the template shifted up n semitones.
Mode 1 is the whole-tone scale (6-35), Mode 2 the octatonic (8-28) — the
test suite verifies both identifications and all transposition counts.
In pc space every one of these modes is inversionally symmetric: the
modes are the pitch-side counterpart of nonretrogradable rhythm, which
the axis display makes literal.

What is deliberately absent: the chord tables, added values, and
nonretrogradable rhythm generators from the book. The rhythm tools
(Nos. 01–02) and this one share a workbench, and a generator that stamps
out palindromes adds nothing a pencil doesn't. Software is genuinely
better at the symmetry bookkeeping and the membership query; both are
here.

Relevant repertoire: Messiaen throughout (*Quatuor pour la fin du temps*,
*Vingt regards*, *Turangalîla*); Mode 2 back through Stravinsky to
Rimsky-Korsakov and Scriabin; Takemitsu via Messiaen; Dutilleux at the
edges; early Boulez (*Notations*); Murail and Grisey, who kept the
symmetry thinking and changed the material.
