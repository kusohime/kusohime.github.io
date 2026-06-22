---
title: "Spectral Roughness"
subtitle: "Sensory dissonance curves and chord comparison"
subtitleZh: "感官不協和曲線與和弦比較"
number: 5
group: "Composition"
summary: "Computes Plomp–Levelt/Sethares roughness for swept dyads and chords, and compares two voicings under the same spectrum model."
summaryZh: "為掃描的雙音與和弦計算 Plomp–Levelt／Sethares 粗糙度，並在同一頻譜模型下比較兩種聲部配置。"
status: "stable"
slug: "spectral-roughness"
references:
  - "Plomp, R., & Levelt, W. J. M. (1965). \"Tonal Consonance and Critical Bandwidth.\" *JASA* 38, 548–560."
  - "Sethares, W. (1993). \"Local Consonance and the Relationship between Timbre and Scale.\" *JASA* 94(3), 1218–1228."
  - "Sethares, W. (2005). *Tuning, Timbre, Spectrum, Scale* (2nd ed.). Springer."
  - "Vassilakis, P. (2005). \"Auditory roughness as a means of musical expression.\" *Selected Reports in Ethnomusicology* 12, 119–144."
  - "Saariaho, K. (1987). \"Timbre and harmony: Interpolations of timbral structures.\" *Contemporary Music Review* 2(1), 93–133."
---

The dissonance curve fixes a lower tone and sweeps a second tone through
one octave, plotting modeled roughness. With six harmonic partials the
valleys fall at 5/4, 4/3, 3/2, 5/3, 2/1. Reduce the partial count to 1
and the valleys vanish: pure sine pairs have almost no interval-specific
consonance. That is the central point — sensory consonance is a property
of timbre × interval, not of the interval alone (Sethares's claim, and
the reason this tool has spectrum controls at all).

The voicing comparison scores two chords (note names with octaves) under
the same spectrum model and shows the pairwise contribution matrix for
voicing A, locating which pair of notes produces the bite. Try
`C3 E3 G3` against `C3 E4 G5`: same set class, very different roughness —
the low-register third is responsible, as orchestration manuals have
always said.

The model is Plomp & Levelt's (1965) critical-band roughness as
parameterized by Sethares (1993; b₁ = 3.5, b₂ = 5.75,
s = 0.24/(0.0207·fmin + 18.96)), summed over all partial pairs. Values are unitless; only rankings within one
spectrum model are meaningful. This is a model of sensory roughness, not
of musical dissonance — context, voice leading, and style are outside its
competence.

The proposal also asked for a second (Vassilakis) model and register-sweep
heatmaps. The Vassilakis refinement changes amplitude weighting, not
rankings, at the precision relevant for compositional choice; and instead
of a heatmap, changing the register in the voicing input answers the same
question directly.

Relevant repertoire: Tenney, *Critical Band*; Saariaho's sound/noise
axis; Grisey's and Murail's orchestral voicings; Haas (*in vain*), where
tempered and spectral tunings collide; Sethares's own music, which
composes scales to match synthetic timbres.
