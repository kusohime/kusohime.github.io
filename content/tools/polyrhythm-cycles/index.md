---
title: "Polyrhythm & Canon Lab"
subtitle: "Coincidence cycles, phase canon, multi-track metronome"
number: 2
group: "Composition"
summary: "Plots pulse streams in one cycle with their coincidence points, states a pattern in canon with a continuously adjustable entry (Reich-style phasing), and runs a metronome of independent tracks."
status: "stable"
slug: "polyrhythm-cycles"
references:
  - "Arom, S. (1991). *African Polyphony and Polyrhythm*. Cambridge University Press."
  - "Toussaint, G. (2013). *The Geometry of Musical Rhythm*. CRC Press."
  - "Gann, K. (1995). *The Music of Conlon Nancarrow*. Cambridge University Press."
  - "Reich, S. (2002). *Writings on Music 1965–2000*, ed. P. Hillier. Oxford University Press. (Incl. \"Music as a Gradual Process,\" 1968.)"
  - "Cohn, R. (1992). \"Transpositional Combination of Beat-Class Sets in Steve Reich's Phase-Shifting Music.\" *Perspectives of New Music* 30(2), 102–132."
  - "Epstein, P. (1986). \"Pattern Structure and Process in Steve Reich's Piano Phase.\" *The Musical Quarterly* 72(4), 494–502."
  - "Potter, K. (2000). *Four Musical Minimalists*. Cambridge University Press."
  - "Messiaen, O. (1944/1956). *The Technique of My Musical Language*, trans. J. Satterfield. Leduc."
---

The lab has three connected instruments: a coincidence calculator, a phase
canon, and a multi-track metronome. All three share one premise — several
strata of pulse heard against each other — at three levels of freedom:
fixed integer ratios, a displacement free to sit anywhere on the
continuum, and fully independent tempo streams.

**Layers & coincidences.** Enter the attack counts of up to four layers —
`3, 4` is the familiar hemiola; `5, 7, 11` is already a texture. The
linear grid shows each layer's attacks across one cycle; the circle shows
the same cycle bent round. Attacks that coincide turn red, with a red
diamond on the time axis — lines are reserved for the playhead. Playback
loops until Stop, with a playhead sweeping the grid and a radius turning
on the circle; **drag the linear grid while playing** to move the
playhead and the loop continues from there. **Coincidences only** plays
nothing but the meeting points — the skeleton of the polyrhythm rather
than its surface. Attack positions are exact fractions, so coincidence is
integer arithmetic, never floating-point near-equality; the summary
reports the smallest common grid a notator would need (for 5:7 already
35 divisions — usually the moment one decides to notate in two voices).

**Canon & phase.** State a pattern — note names for a pitch canon
(`E4 F#4 B4 C#5 …`; the Piano Phase pattern is the default and a preset),
or `x`/`.` steps for pure rhythm (Clapping Music is a preset) — and a
second voice states it displaced. The displacement is the point: in
**locked offset** mode it is a slider over the whole continuum from 0 to
1 cycle, not just the step grid, and it moves *while the canon plays*.
At exact step multiples you hear Clapping Music's rotations or a strict
canon at the distance of n steps; between them, the in-between worlds
that notation does not reach. In **gradual phasing** mode voice 2 instead
runs at a slightly different tempo (ratio slider, also live), and the
readout reports the lap time — how long until the voices realign, which
is the formal span of a Reich phase section: with a 12-step pattern at
♩=72 and ratio 1.01, one lap of the pattern takes about a minute and a
half, which is why those pieces breathe at the pace they do. A
transposition control turns the pitch canon into a canon at the interval.
Pitched patterns play as sustained notes (`_` extends a note across
steps), and the displacement can be viewed two ways: as two **rows**,
voice 2 sliding against voice 1 — the layout familiar from the Clapping
Music videos — or as two **rings**, the cycle bent round; a red playhead
sweeps either view during playback.

**Multi-track metronome.** Up to four click tracks. Each has its own
quarter-note tempo, clicks on its own note value, and accents its own
bar length — so it covers both independent tempi (Nancarrow, Carter's
simultaneous speeds) and one tempo articulated in conflicting values
(a dotted-eighth track against a quarter track sounds the 3:4 of a
metric modulation before you commit it to paper, in tandem with Tool
No. 01). Changes apply live on the next scheduled click. All scheduling
in this lab runs on the WebAudio clock with a look-ahead scheduler;
nothing is timed from the UI thread, so the clicks stay sample-accurate
while you drag the sliders.

Relevant repertoire: Reich, *Piano Phase* (1967), *Clapping Music*
(1972), *Drumming* (1971); Nancarrow's tempo canons (Studies 24, 36, 37 —
canon by ratio rather than displacement, i.e. this lab's phasing mode
held permanently); the mensuration canons of Ockeghem's *Missa
prolationum*, the historical ancestor of the metronome panel's
one-tempo-many-values case; Ligeti's études and Birtwistle's pulse
labyrinths for the coincidence panel; and the ensemble repertoires
analyzed by Arom, whose cycle diagrams the circular view reproduces.
