---
title: "Harmonic Partials Calculator"
subtitle: "The overtone series, tempered deviations, and stiff strings"
number: 4
group: "Pitch & Spectrum"
summary: "Tabulate the partials of any fundamental with cents deviations from 12-EDO, optionally with piano-style inharmonicity, and audition selected stacks."
status: "stable"
slug: "harmonic-partials"
---

## How to use it

Give a fundamental (note name or Hz) and a number of partials. The table
lists each partial's frequency, nearest tempered pitch, deviation in
cents, and octave-reduced ratio. Red dots in the ladder mark partials more
than 20¢ from 12-EDO — the 7th, 11th, 13th, and their octaves — the ones
that need microtonal notation or retuned instruments.

Check any subset of partials and **Hear selected** to audition the stack
as an additive chord (amplitudes follow 1/√n). **Hear series** arpeggiates
the whole table. Defaults select partials 4–7: the dominant-seventh-like
chord nature provides for free, the cell from which a great deal of
spectral harmony grows.

The **inharmonicity coefficient B** switches to a stiff-string model:
fₙ = n·f₀·√(1+Bn²). Real piano strings have B roughly between 0.0002
(long bass strings) and 0.001+ (short treble strings); watch the upper
partials stretch sharp. This is why pianos are stretch-tuned and why a
"harmonic" spectrum on paper is not what a piano hands you.

## Conventions

Deviations are measured from the nearest 12-EDO pitch with A4 = 440.
The classic checkpoints: 3rd partial +2¢, 5th −14¢, 7th −31¢, 11th −49¢
(the quarter-tone), 13th +41¢ measured from the octave-reduced sixth.

## Design notes

Composers do not need another picture of the overtone series; they need
the *deviations* and a way to hear a chosen sub-stack in isolation. Both
reports proposed amplitude-decay models; I fixed a perceptually reasonable
default instead of adding controls whose effect on the table is nil — the
spectral envelope matters for the roughness tool (No. 05), where it is a
parameter.

## Repertoire

Grisey, *Partiels* (1975) — the trombone E spectrum orchestrated, the
piece this table writes out. Murail, *Gondwana*. Radulescu's spectral
brass. Saariaho's harmony-timbre continuum. On the other flank, La Monte
Young (*The Well-Tuned Piano*) and Tenney (*Spectral CANON for CONLON
Nancarrow*) build directly on partial numbers as pitch material.

## References

- Fineberg, J. (2000). "Guide to the Basic Concepts and Techniques of Spectral Music." *Contemporary Music Review* 19(2), 81–113.
- Grisey, G. (1987). "Tempus ex machina: A composer's reflections on musical time." *Contemporary Music Review* 2(1), 239–275.
- Fletcher, N. H., & Rossing, T. D. (1998). *The Physics of Musical Instruments* (2nd ed.). Springer. (Ch. 2.18 and 12 for string stiffness and inharmonicity.)
- Murail, T. (2005). "The Revolution of Complex Sounds." *Contemporary Music Review* 24(2–3), 121–135.
- Tenney, J. (1988). *A History of 'Consonance' and 'Dissonance'*. Excelsior.
