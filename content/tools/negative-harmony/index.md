---
title: "Axis Reflection Engine"
subtitle: "Negative harmony, properly generalized"
number: 12
group: "Transformation"
summary: "Reflect material around any axis, in pitch-class space or in absolute pitch — the fashionable mapping is one preset among twelve."
status: "stable"
slug: "negative-harmony"
---

## How to use it

Enter material as note names with octaves. Choose the domain:
**pitch classes** reflects chroma and keeps each note near its original
register; **absolute pitch** mirrors the staff upside-down around an
explicit axis note. In pc mode, either pick the "negative harmony in
key of X" preset — for C this is the axis between E♭ and E (sum 7),
sending C→G, D→F, E→E♭, the mapping popularized from Levy's book — or
set any axis sum 0–11 manually. The chromatic mapping table shows the
whole involution at once; fixed points (even sums only) are highlighted.

## Conventions

Reflection in pc space is the standard inversion operator I_s: pc ↦
s − pc (mod 12). Even s fixes two pitch classes (s/2 and s/2+6); odd s
fixes none — the table makes this visible immediately. Double reflection
is always identity; the tests enforce it in both domains.

## Design notes

I share the proposal's skepticism here, stated plainly: "negative
harmony" as internet phenomenon is a single inversion operator wearing a
cape. The serious content is (a) Levy's harmonic dualism, which concerns
functional *meaning* under reflection, not just pitch mapping, and (b)
the general I_s operator, which post-tonal theory has owned for a
century. So the engine is general — twelve axes, two domains — and the
famous mapping is a labeled preset, no more privileged than I₀. Anyone
who wants the dualist *theory* should read Levy and Harrison; this tool
supplies the arithmetic and the audition.

## Repertoire

Levy's own analytical tradition (Riemann's dualism reanimated; Harrison
1994 is the scholarly rehabilitation). Bartók's axis thinking (Lendvai's
account, controversial but related machinery). In strict-inversion
practice: Webern's mirror canons, Bach's *Musical Offering* table canon.
Recently, Jacob Collier and Steve Coleman put the C-axis preset into wide
circulation — students arriving from that direction will find the general
case here, which is the pedagogically responsible order.

## References

- Levy, E. (1985). *A Theory of Harmony*. SUNY Press.
- Harrison, D. (1994). *Harmonic Function in Chromatic Music: A Renewed Dualist Theory and an Account of Its Precedents*. University of Chicago Press.
- Lendvai, E. (1971). *Béla Bartók: An Analysis of His Music*. Kahn & Averill.
- Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton. (Inversion as I_n.)
- Rehding, A. (2003). *Hugo Riemann and the Birth of Modern Musical Thought*. Cambridge University Press.
