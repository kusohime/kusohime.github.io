---
title: "Advanced Reflection"
subtitle: "Negative harmony and registral inversion"
subtitleZh: "負和聲與音區倒影"
number: 12
group: "Composition"
summary: "Reflects material around any axis, in pitch-class space or absolute pitch; the common negative-harmony mapping is one preset among twelve."
summaryZh: "繞任意軸反射素材，於音級空間或絕對音高皆可；常見的負和聲映射只是十二個預設之一。"
status: "stable"
slug: "negative-harmony"
references:
  - "Levy, E. (1985). *A Theory of Harmony*. SUNY Press."
  - "Harrison, D. (1994). *Harmonic Function in Chromatic Music: A Renewed Dualist Theory and an Account of Its Precedents*. University of Chicago Press."
  - "Lendvai, E. (1971). *Béla Bartók: An Analysis of His Music*. Kahn & Averill."
  - "Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton."
  - "Rehding, A. (2003). *Hugo Riemann and the Birth of Modern Musical Thought*. Cambridge University Press."
---

Enter material as note names with octaves. Choose the domain: pitch
classes reflects chroma and keeps each note near its original register;
absolute pitch mirrors the staff upside-down around an explicit axis
note. In pc mode, either pick the "negative harmony in key of X" preset —
for C this is the axis between E♭ and E (sum 7), sending C→G, D→F, E→E♭,
the mapping popularized from Levy's book — or set any axis sum 0–11
manually. The chromatic mapping table shows the whole involution at once;
fixed points (even sums only) are highlighted.

Reflection in pc space is the standard inversion operator I_s: pc ↦
s − pc (mod 12). Even s fixes two pitch classes (s/2 and s/2+6); odd s
fixes none — the table makes this visible. Double reflection is always
identity; the tests enforce it in both domains.

On the skepticism the source proposal already voiced: "negative harmony"
as an internet phenomenon is a single inversion operator under a new
name. The substantive content is Levy's harmonic dualism — which concerns
functional meaning under reflection, not just pitch mapping — and the
general I_s operator, which post-tonal theory has owned for a century. So
the engine is general (twelve axes, two domains) and the famous mapping
is a labeled preset, no more privileged than I₀. For the dualist theory
itself, read Levy and Harrison; this tool supplies the arithmetic and the
audition.

Relevant repertoire and literature: Riemann's dualism and its
rehabilitation in Harrison (1994); Bartók's axis thinking in Lendvai's
account; strict-inversion practice from Bach's *Musical Offering* table
canon to Webern's mirror canons; recently, Steve Coleman and Jacob
Collier put the C-axis preset into wide circulation.
