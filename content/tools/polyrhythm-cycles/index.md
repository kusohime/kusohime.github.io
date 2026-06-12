---
title: "Polyrhythm Calculator"
subtitle: "Attack grids and coincidence points"
number: 2
group: "Rhythm & Time"
summary: "Plots up to four pulse streams in one cycle, reports the common grid and coincidence points, and plays the composite."
status: "stable"
slug: "polyrhythm-cycles"
references:
  - "Arom, S. (1991). *African Polyphony and Polyrhythm*. Cambridge University Press."
  - "Toussaint, G. (2013). *The Geometry of Musical Rhythm*. CRC Press."
  - "Gann, K. (1995). *The Music of Conlon Nancarrow*. Cambridge University Press."
  - "Taylor, S. A. (2012). \"Hemiola, Maximal Evenness, and Metric Ambiguity in Late Ligeti.\" In *György Ligeti: Of Foreign Lands and Strange Sounds*. Boydell."
  - "Messiaen, O. (1944/1956). *The Technique of My Musical Language*, trans. J. Satterfield. Leduc."
---

Enter the attack counts of up to four layers — `3, 4` is the familiar
hemiola; `5, 7, 11` is already a texture. The linear grid shows each
layer's attacks across one cycle; the circle shows the same cycle bent
round, which makes the rotational structure of 3-against-4 directly
visible. Red verticals mark coincidence points, where two or more layers
attack together.

Set the cycle length in seconds and press **Play** to hear the composite
(each layer has its own register). **Coincidences only** plays nothing but
the meeting points — the skeleton of the polyrhythm rather than its
surface, which answers the question "what is the form of this
superimposition?"

Attack positions are exact fractions of the cycle (k/n for layer n), so
coincidence is integer arithmetic, never floating-point near-equality. The
summary line reports the smallest common grid — the LCM subdivision a
notator would need to write the composite in one voice. For 5:7 that is
already 35 divisions; seeing that number is usually the moment one decides
to notate in two voices.

The original proposal described a full multi-layer metronome with accent
patterns, mute/solo, tempo ramps and count-ins. Those are rehearsal
features that practice apps already do well; what is kept here is the
compositional part — exact cycle structure made visible and audible.
Playback schedules every click sample-accurately on the WebAudio clock
before starting; nothing is timed from the UI thread.

Relevant repertoire: Nancarrow throughout; Ligeti's piano études
("Désordre," "L'escalier du diable") built from grids drifting against
each other; Reich's phase pieces as the limiting case (two identical
layers, one slowly rotating); Birtwistle's *Harrison's Clocks*; the
ensemble repertoires analyzed by Simha Arom — the circular view is
essentially Arom's cycle diagram, also used by Toussaint for timeline
rhythms.
