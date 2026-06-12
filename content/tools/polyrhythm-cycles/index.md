---
title: "Polyrhythm & Coincidence Lab"
subtitle: "Shared cycles, attack grids, and where layers meet"
number: 2
group: "Rhythm & Time"
summary: "Superimpose up to four pulse streams in one cycle, see the exact common grid and coincidence points, and hear the composite."
status: "stable"
slug: "polyrhythm-cycles"
---

## How to use it

Enter the attack counts of up to four layers — `3, 4` is the familiar
hemiola; `5, 7, 11` is already a texture. The linear grid shows each
layer's attacks across one cycle; the circle shows the same cycle bent
round, which is the honest way to see *why* 3-against-4 feels rotationally
symmetric. Red verticals mark coincidence points, where two or more layers
attack together.

Set the cycle length in seconds and press **Play** to hear the composite
(each layer has its own register). **Coincidences only** plays nothing but
the meeting points — listening to the skeleton of the polyrhythm rather
than its surface. That mode is the most compositionally useful thing on
this page: it answers "what is the *form* of this superimposition?"

## Conventions

Attack positions are exact fractions of the cycle (k/n for layer n), so
coincidence is integer arithmetic, never floating-point near-equality. The
summary line reports the smallest common grid — the LCM subdivision a
notator would need to write the composite in one voice. For 5:7 that is
already 35 divisions; seeing that number is usually the moment one decides
to notate in two voices.

## Design notes

The proposal wanted a full multi-layer metronome with accent patterns,
mute/solo, tempo ramps and count-ins. Those are rehearsal features, and
practice apps do them well already; I kept the part that is compositional:
exact cycle structure made visible and audible. One real metronome feature
survives — playback — because the difference between seeing 4:5 and
hearing it is the difference between knowing and believing. Playback
schedules every click sample-accurately on the WebAudio clock before
starting; nothing is timed from the UI thread.

## Repertoire

Nancarrow again, obviously. Ligeti's piano études (Book I, "Désordre";
Book II, "L'escalier du diable") build form from grids drifting against
each other. Steve Reich's phase pieces are the limiting case of this tool
(two identical layers, one slowly rotating). Birtwistle's pulse labyrinths
(*Harrison's Clocks*) and the African ensemble repertoires analyzed by
Simha Arom sit equally well here; the circular view is essentially Arom's
cycle diagram, and Godfried Toussaint used the same representation for
timeline rhythms.

## References

- Arom, S. (1991). *African Polyphony and Polyrhythm*. Cambridge University Press.
- Toussaint, G. (2013). *The Geometry of Musical Rhythm*. CRC Press.
- Gann, K. (1995). *The Music of Conlon Nancarrow*. Cambridge University Press.
- Taylor, S. A. (2012). "Hemiola, Maximal Evenness, and Metric Ambiguity in Late Ligeti." In *György Ligeti: Of Foreign Lands and Strange Sounds*. Boydell.
- Messiaen, O. (1944/1956). *The Technique of My Musical Language*, trans. J. Satterfield. Leduc. (Chs. on polyrhythm and rhythmic pedals.)
