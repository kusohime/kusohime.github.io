---
title: "Metric Modulation Calculator"
subtitle: "Tempo equivalence solver with chaining"
subtitleZh: "速度等價求解，可串接"
number: 1
group: "Composition"
summary: "Computes the new tempo from an old-value = new-value equivalence, with dots, tuplets, and chained steps. Results are exact."
summaryZh: "由「舊值 = 新值」的等價關係算出新速度，支援附點、連音與串接步驟；結果為精確值。"
status: "stable"
slug: "metric-modulation"
references:
  - "Bernard, J. W. (1988). \"The Evolution of Elliott Carter's Rhythmic Practice.\" *Perspectives of New Music* 26(2), 164–203."
  - "Schiff, D. (1998). *The Music of Elliott Carter* (2nd ed.). Cornell University Press."
  - "Gann, K. (1995). *The Music of Conlon Nancarrow*. Cambridge University Press."
  - "Kampela, A. (1998). \"Micro-Metric Modulation: New Directions in the Theory of Complex Rhythms.\" DMA dissertation, Columbia University."
  - "Cowell, H. (1930). *New Musical Resources*. Knopf."
---

State the modulation the way you would write it over the barline. Set the
old tempo and what it counts (e.g. quarter = 120). Then state the
equivalence: the old value on the left, the new value on the right —
*old dotted eighth = new quarter* is the textbook case. Dots and tuplet
ratios (entered as `n:m`, "n in the time of m") can apply to either side.
Choose what the new tempo should count and press **Solve**.

The result is exact. If the answer is not an integer the display shows the
fraction (e.g. `1280/3`), because writing ♩= 106.7 in a score is precisely
the kind of rounding this tool exists to prevent. **Use result as next
start** feeds the answer back in, so you can chain successive modulations
and read the whole path in the log table.

The duration of every notated value is held as an exact fraction of a
whole note. A dotted value multiplies by 3/2 (7/4 for double dots); a
tuplet `n:m` multiplies by m/n. The solver computes
*new = old × (old beat / new beat) × (new value / old value)* — note the
direction: when a shorter old value takes over the new beat, the music
gets faster. Check the canonical case: ♩=120, dotted eighth = new
quarter, answer 160.

A full "rhythm workstation" with a notation view and MusicXML export was
considered and rejected: a static site is the wrong home for an editing
surface, and a modulation plan is a number you copy into your sketch. What
gets used at the desk is the arithmetic — done exactly, including the
tuplet cases that are error-prone late at night. The chain log covers the
practice of long modulation paths where each local equivalence is simple
but the cumulative ratio is not.

Cowell's *New Musical Resources* (1930) had already proposed deriving
tempo relationships from whole-number ratios; Carter turned the idea into
a notational practice. Relevant repertoire: Elliott Carter, *Cello
Sonata* (1948) and *String
Quartet No. 1* (1951), whose openings chain modulations much as the log
table does; Nancarrow's player-piano studies (Study No. 36 is a
17:18:19:20 canon); Kampela's "micro-metric modulation" inside the beat;
proportional tempo relations in Birtwistle and Adès.
