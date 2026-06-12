---
title: "Neo-Riemannian Transform Lab"
subtitle: "L, P, R, S, N chains and hexatonic cycles on triads"
number: 11
group: "Transformation"
summary: "Apply parsimonious triadic transformations in chains, track common tones at every step, and traverse hexatonic cycles with voice-led playback."
status: "stable"
slug: "neo-riemannian"
---

## How to use it

Choose a starting triad and type a chain — letters P, L, R, S, N in any
order (`PLR`, `LPLPLP`…). The table shows every intermediate triad, its
pitch classes, and the common tones retained from the previous step,
which is the entire point of the theory: these operations are the ones
that move triads while holding the maximum in place. **Hexatonic cycle**
runs the alternating P–L cycle from your triad (six chords, back to the
start). Playback uses nearest-voice-leading realization — common tones
literally stay put in the audio, semitone moves sound as semitones.

## Conventions

P exchanges C↔c (parallel); R sends C→a, c→E♭ (relative); L sends C→e,
c→A♭ (leittonwechsel); S is the slide C→c♯ (shared third); N the
nebenverwandt C→f. The domain is exactly the 24 consonant triads. The
tool rejects anything else, and that is doctrine, not laziness: the
parsimonious behavior of L, P and R is a special algebraic fact about
how the major/minor triad sits inside the chromatic 12 (a "group-
theoretic accident," as Cohn nearly puts it), and extending the buttons
to seventh chords would require a different theory (and a different
tool).

## Design notes

Each of P, L, R, S is an involution — apply it twice and you are home —
and the tests enforce this. The proposal's graph/Tonnetz visualization
was considered and set aside: a step table with common-tone accounting
contains strictly more analytic information than a pretty lattice
rendering of the same six chords, and this site's aesthetic prefers the
ledger to the poster.

## Repertoire

Analytically, the literature lives in late Romantic chromaticism: Cohn on
Schubert, Wagner (the *Tarnhelm* progression is L then P territory),
Franck, Rimsky. Compositionally the cycles are everywhere in pan-triadic
contemporary writing — Adès (*Asyla*'s slow movement walks parsimonious
cycles), John Adams's harmonic drift, a great deal of post-tonal film
scoring, and any composer who wants triads without functional syntax:
the hexatonic cycle is the standard map of that terrain.

## References

- Cohn, R. (1996). "Maximally Smooth Cycles, Hexatonic Systems, and the Analysis of Late-Romantic Triadic Progressions." *Music Analysis* 15(1), 9–40.
- Cohn, R. (1997). "Neo-Riemannian Operations, Parsimonious Trichords, and Their Tonnetz Representations." *Journal of Music Theory* 41(1), 1–66.
- Cohn, R. (2012). *Audacious Euphony: Chromaticism and the Triad's Second Nature*. Oxford University Press.
- Lewin, D. (1987). *Generalized Musical Intervals and Transformations*. Yale University Press.
- Gollin, E., & Rehding, A., eds. (2011). *The Oxford Handbook of Neo-Riemannian Music Theories*. Oxford University Press.
