---
title: "Metric Modulation Calculator"
subtitle: "Exact tempo equivalences, chained"
number: 1
group: "Rhythm & Time"
summary: "Solve old-value = new-value tempo equations exactly, Carter-style, and chain them into longer modulation plans."
status: "stable"
slug: "metric-modulation"
---

## How to use it

State the modulation the way you would write it over the barline. Set the
old tempo and what it counts (e.g. quarter = 120). Then state the
equivalence: the old value on the left, the new value on the right —
*old dotted eighth = new quarter* is the textbook case. Dots and tuplet
ratios (entered as `n:m`, "n in the time of m") can apply to either side.
Choose what the new tempo should count and press **Solve**.

The result is exact. If the answer is not an integer the display shows the
fraction (e.g. `426⅔` appears as `1280/3`), because writing ♩= 106.7 in a
score is precisely the kind of rounding this tool exists to prevent.
**Use result as next start** feeds the answer back in, so you can chain a
plan of successive modulations and read the whole path in the log table.

## Conventions

The duration of every notated value is held as an exact fraction of a
whole note. A dotted value multiplies by 3/2 (7/4 for double dots); a
tuplet `n:m` multiplies by m/n. The solver computes
*new = old × (old beat / new beat) × (new value / old value)* — note the
direction: when a **shorter** old value takes over the new beat, the music
gets **faster**. Check the canonical case: ♩=120, dotted eighth = new
quarter, answer 160.

## Design notes

The source proposal asked for a full "rhythm workstation" with a
notation-aware score view and MusicXML export. I have deliberately not
built that here: a static portfolio site is the wrong home for an editing
surface, and a modulation plan is a number you copy into your sketch, not
a document you maintain in a browser. What composers actually reach for at
the desk is the arithmetic — done exactly, with the tuplet cases that are
error-prone at 2 a.m. The chain log covers Carter's practice of long
modulation paths where each local equivalence is simple but the cumulative
ratio is not.

## Repertoire

Elliott Carter, *Cello Sonata* (1948) — the locus classicus of the
technique, and *String Quartet No. 1* (1951), whose opening pages chain
modulations much as the log table does. Conlon Nancarrow's player-piano
studies treat tempo ratio as structure (Study No. 36 is a 17:18:19:20
canon). Arthur Kampela's "micro-metric modulation" pushes the same
arithmetic inside the beat. Birtwistle and Adès both use proportional
tempo relations that this solver checks in seconds.

## References

- Bernard, J. W. (1988). "The Evolution of Elliott Carter's Rhythmic Practice." *Perspectives of New Music* 26(2), 164–203.
- Schiff, D. (1998). *The Music of Elliott Carter* (2nd ed.). Cornell University Press.
- Gann, K. (1995). *The Music of Conlon Nancarrow*. Cambridge University Press.
- Kampela, A. (1998). "Micro-Metric Modulation: New Directions in the Theory of Complex Rhythms." DMA dissertation, Columbia University.
- Cowell, H. (1930). *New Musical Resources*. Knopf. (Part II anticipates the whole ratio-tempo apparatus.)
