---
title: "Harmonic Partials Calculator"
subtitle: "Partial frequencies with 12-EDO deviations"
number: 4
group: "Composition"
summary: "Lists the partials of a fundamental with cents deviations, optional string inharmonicity, and additive playback of selected partials."
status: "stable"
slug: "harmonic-partials"
references:
  - "Fineberg, J. (2000). \"Guide to the Basic Concepts and Techniques of Spectral Music.\" *Contemporary Music Review* 19(2), 81–113."
  - "Grisey, G. (1987). \"Tempus ex machina: A composer's reflections on musical time.\" *Contemporary Music Review* 2(1), 239–275."
  - "Fletcher, N. H., & Rossing, T. D. (1998). *The Physics of Musical Instruments* (2nd ed.). Springer."
  - "Murail, T. (2005). \"The Revolution of Complex Sounds.\" *Contemporary Music Review* 24(2–3), 121–135."
  - "Tenney, J. (1988). *A History of 'Consonance' and 'Dissonance'*. Excelsior."
---

Give a fundamental (note name or Hz) and a number of partials. The table
lists each partial's frequency, nearest tempered pitch, deviation in
cents, and octave-reduced ratio. An inline meter on each row plots that
deviation against the tempered pitch (centre line, ±20¢ ticks); bars turn
red past 20¢ from 12-EDO — the 7th, 11th, 13th and their octaves — the
ones that need microtonal notation or retuned instruments.

Check any subset of partials and **Sustain selected** to hold the stack
as an additive drone: while it sounds, checking and unchecking partials
adds and removes them live, and changing the fundamental or B retunes
the sounding stack — it plays until you stop it. **Hear series**
arpeggiates the whole table.
Defaults select partials 4–7, the dominant-seventh-like cell from which
much spectral harmony grows.

The inharmonicity coefficient B switches to a stiff-string model:
fₙ = n·f₀·√(1+Bn²). Real piano strings have B roughly between 0.0002
(long bass strings) and 0.001+ (short treble strings); upper partials
stretch sharp. This is why pianos are stretch-tuned and why a "harmonic"
spectrum on paper is not what a piano hands you.

Deviations are measured from the nearest 12-EDO pitch with A4 = 440. The
standard checkpoints: 3rd partial +2¢, 5th −14¢, 7th −31¢, 11th −49¢.
The proposal's adjustable amplitude-decay model was fixed to a reasonable
default instead, since it does not affect the table; spectral envelope
matters for the roughness calculator (No. 05), where it is a parameter.

Relevant repertoire: Grisey, *Partiels* (1975) — the trombone E spectrum
orchestrated; Murail, *Gondwana*; Radulescu; Saariaho's harmony-timbre
continuum; on the just-intonation side, La Monte Young's *The Well-Tuned
Piano* and Tenney's *Spectral CANON for CONLON Nancarrow*.
