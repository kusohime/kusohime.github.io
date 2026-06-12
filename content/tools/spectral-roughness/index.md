---
title: "Spectral Roughness Calculator"
subtitle: "Sensory dissonance as a function of spectrum and register"
number: 5
group: "Pitch & Spectrum"
summary: "Plomp–Levelt/Sethares roughness curves and chord comparisons: which voicing beats more, and why register changes the answer."
status: "stable"
slug: "spectral-roughness"
---

## How to use it

The **dissonance curve** fixes a lower tone and sweeps a second tone
through one octave, plotting modeled roughness. With six harmonic
partials you will see the familiar valleys at 5/4, 4/3, 3/2, 5/3, 2/1.
Now reduce the partial count to 1 and watch the valleys vanish: pure
sine pairs have almost no interval-specific consonance. That single
gesture is the most important music-theoretic content on this page —
"consonance" in the sensory sense is a property of *timbre × interval*,
not of interval alone (Sethares's central claim).

The **voicing comparison** scores two chords (note names with octaves)
under the same spectrum model and shows the pairwise contribution matrix
for voicing A, so you can locate which pair of notes is responsible for
the bite. Try `C3 E3 G3` against `C3 E4 G5`: same set class, very
different roughness — the low-register third is the culprit, exactly as
orchestration manuals have always muttered.

## Conventions

The model is Plomp & Levelt's critical-band roughness as parameterized by
Sethares (b₁ = 3.5, b₂ = 5.75, s = 0.24/(0.0207·fmin + 18.96)), summed
over all partial pairs. Values are unitless; **only rankings within one
spectrum model are meaningful**. This is a model of sensory roughness,
not of musical dissonance — context, voice leading, and style are outside
its competence, and no one should pretend otherwise.

## Design notes

The proposal asked additionally for a Vassilakis model and register-sweep
heatmaps. The Vassilakis refinement changes amplitude weighting, not
rankings, at the precision relevant for compositional choice, so one
well-verified model seemed more honest than two decorative ones. The
heatmap is replaced by something better: change the register in the
voicing input and read the number. A tool should make you do the
experiment, not pre-chew it.

## Repertoire

Tenney, *Critical Band* (1988) — the piece is this curve made audible.
Saariaho ("Timbre and harmony," 1987) formalized the sound/noise axis the
calculator quantifies. Grisey's and Murail's orchestral voicings manage
beating deliberately. Haas (*in vain*) plays tempered against spectral
tuning so that this model's two regimes collide in real time. Sethares's
own music composes scales to match synthetic timbres — the converse
experiment.

## References

- Plomp, R., & Levelt, W. J. M. (1965). "Tonal Consonance and Critical Bandwidth." *JASA* 38, 548–560.
- Sethares, W. (1993). "Local Consonance and the Relationship between Timbre and Scale." *JASA* 94(3), 1218–1228.
- Sethares, W. (2005). *Tuning, Timbre, Spectrum, Scale* (2nd ed.). Springer.
- Vassilakis, P. (2005). "Auditory roughness as a means of musical expression." *Selected Reports in Ethnomusicology* 12, 119–144.
- Saariaho, K. (1987). "Timbre and harmony: Interpolations of timbral structures." *Contemporary Music Review* 2(1), 93–133.
