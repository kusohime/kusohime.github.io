---
title: "Piano Harmonics Mapper"
subtitle: "String touch points and sounding pitches"
number: 6
group: "Pitch & Spectrum"
summary: "Computes the touch points on a piano string for a chosen partial, the sounding pitch with cents deviation, and optional inharmonicity correction."
status: "stable"
slug: "piano-harmonics"
references:
  - "Cowell, H. (1930). *New Musical Resources*. Knopf."
  - "Fletcher, N. H., & Rossing, T. D. (1998). *The Physics of Musical Instruments* (2nd ed.). Springer."
  - "Vaes, L. (2009). *Extended Piano Techniques in Theory, History and Performance Practice*. PhD diss., Leiden University."
  - "Crumb, G. (1972). *Makrokosmos, Vol. I*. Peters."
  - "Banowetz, J. (1985). *The Pianist's Guide to Pedaling*. Indiana University Press."
---

Choose the key, choose the partial. The string diagram marks every valid
touch point as a fraction of speaking length from the agraffe — for the
n-th partial these are the points k/n with k coprime to n (touching at
2/4 gives the 2nd partial, not the 4th; such duplicates are excluded).
The readout gives the sounding pitch with its deviation from 12-EDO;
**Hear (approx.)** plays a synthetic approximation emphasizing the
selected partial.

Enable the inharmonicity coefficient for low strings to see the sounding
pitch pulled sharp of the ideal harmonic — at partial 5 on a real bass
string the stretch is already audible against a tempered reference.

Notate touch points as fractions of speaking length (1/3 from the
agraffe), never in centimeters: speaking lengths differ between a
Steinway D and a baby grand, fractions do not. Practical range on a
grand: partials 2–5 on bass and low-tenor (over-damper) strings; above
the capo d'astro bar access disappears. Specify which hand silently
depresses the key and which touches the string, and give the pianist
time to find the node in rehearsal.

The proposal's second mode — silently-depressed sympathetic resonance —
needs no calculator: depress keys silently, play loud staccato elsewhere,
and the resonance follows the common partials, which is the table in
Tool No. 04. What pianists need from a tool is the node map and a warning
about inharmonicity.

Relevant repertoire: Cowell, *Aeolian Harp* and *The Banshee*; Crumb,
*Makrokosmos* I–II (harmonics notated by node fraction, the convention
recommended here); Lachenmann (*Guero*), Sciarrino, Rebecca Saunders,
Helmut Oehring; Cage's prepared piano sits one step away — preparation
shifts nodes, which is why fractions rather than absolute positions are
the durable information.
