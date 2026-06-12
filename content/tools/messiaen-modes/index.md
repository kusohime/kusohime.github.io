---
title: "Modes of Limited Transposition"
subtitle: "Messiaen's seven modes, their symmetries, and your material"
number: 9
group: "Sets & Series"
summary: "All seven modes with every distinct transposition, symmetry axes on the clockface, and an overlap checker against your own pitches."
status: "stable"
slug: "messiaen-modes"
---

## How to use it

Pick a mode and a transposition — the selector only offers the
*distinct* ones (two for Mode 1, three for Mode 2, four for Mode 3, six
for the rest; the counts are computed from the symmetry, not asserted).
The clockface shows the mode as a polygon with its inversional axes
dashed; the panel lists the notes and symmetry facts. Audition ascending
or as a sustained field.

The **overlap checker** takes your own pitches and reports what falls
inside and outside the chosen transposition — the practical question
("can this passage live in Mode 3², and which notes would have to go?")
that one otherwise answers by squinting.

## Conventions

Modes are templates from C using Messiaen's numbering (chapter XVI of the
*Technique*); transposition Tₙ means the template shifted up n semitones.
Mode 1 is the whole-tone scale (6-35), Mode 2 the octatonic (8-28) —
the tool's test suite verifies both identifications and all the
transposition counts.

## Design notes

Messiaen scholars will note what is *not* here: the chord tables, the
added values, the nonretrogradable rhythms. The book treats modes and
rhythms as one braid, and the proposal wanted them coupled in software
too. I kept the coupling conceptual rather than mechanical — the rhythm
tools (Nos. 01–02) and this one share a workbench, and a "nonretrogradable
rhythm generator" that stamps out palindromes adds nothing a composer's
pencil doesn't do better. What software is genuinely better at is the
symmetry bookkeeping and the membership query; both are here. Note also
that in pc space every one of these modes is inversionally symmetric —
the modes are the *pitch* face of nonretrogradability, which the axis
display makes literal.

## Repertoire

Messiaen everywhere (*Quatuor pour la fin du temps*, *Vingt regards*,
*Turangalîla*). Mode 2 reaches back through Stravinsky (*Symphony of
Psalms*) to Rimsky-Korsakov and Scriabin. Takemitsu absorbed the modes
through Messiaen; Dutilleux's harmony often hovers at their edge; early
Boulez (*Notations*) learned them in Messiaen's class while preparing to
reject them. Murail and Grisey — Messiaen's students — kept the symmetry
thinking and changed the material.

## References

- Messiaen, O. (1944/1956). *The Technique of My Musical Language*, trans. J. Satterfield. Leduc.
- Messiaen, O. (1994–2002). *Traité de rythme, de couleur, et d'ornithologie*. Leduc.
- Cheong, W.-L. (2003). "Messiaen's Chord Tables: Ordering the Disordered." *Tempo* 57(226), 2–10.
- Pople, A. (1998). *Messiaen: Quatuor pour la fin du temps*. Cambridge University Press.
- Forte, A. (1991). "Debussy and the Octatonic." *Music Analysis* 10(1–2), 125–169.
