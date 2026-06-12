---
title: "Piano Harmonics Mapper"
subtitle: "Touch points on the string, sounding results on the page"
number: 6
group: "Pitch & Spectrum"
summary: "Where to touch a piano string for a given partial, what actually sounds, and how inharmonicity bends the textbook answer."
status: "stable"
slug: "piano-harmonics"
---

## How to use it

Choose the key, choose the partial. The string diagram marks every valid
touch point as a fraction of speaking length from the agraffe — for the
n-th partial these are the points k/n with k coprime to n (touching at
2/4 gives you the 2nd partial, not the 4th; the tool already excludes
such duplicates). The readout gives the sounding pitch with its deviation
from 12-EDO; **Hear (approx.)** plays a synthetic approximation that
emphasizes the selected partial.

Turn on the inharmonicity coefficient for low strings to see the sounding
pitch pulled sharp of the ideal harmonic — at partial 5 on a real bass
string the stretch is already audible against a tempered reference.

## Conventions

Node positions are exact fractions; notate them as fractions of speaking
length (1/3 from the agraffe), never in centimeters — speaking lengths
differ between a Steinway D and a baby grand, fractions do not.
Practical range on a grand: partials 2–5 on bass and low-tenor
(over-damper) strings. Above the capo d'astro bar, access disappears.
Always tell the pianist which hand silently depresses the key and which
touches the string; give them time to find the node in rehearsal.

## Design notes

The proposal's second mode — silently-depressed sympathetic resonance —
is omitted as a calculator because it does not need one: depress any keys
silently, play anything loud and staccato elsewhere, and the resonance
follows the common partials, which is exactly the table in Tool No. 04.
What pianists *do* need from a tool is the node map and a warning about
inharmonicity, so that is what this page is.

## Repertoire

Cowell, *Aeolian Harp* and *The Banshee* (1920s) — the founding documents
of string-piano writing. Crumb, *Makrokosmos* I–II: harmonics notated by
node fraction, the convention this tool endorses. Lachenmann (*Guero*),
Sciarrino, Rebecca Saunders, and Helmut Oehring all extend inside-piano
technique; Stockhausen's *Klavierstück* tradition and Cage's prepared
piano sit one step away (preparation shifts nodes — which is why the
fractions, not absolute positions, are the durable information).

## References

- Cowell, H. (1930). *New Musical Resources*. Knopf.
- Fletcher, N. H., & Rossing, T. D. (1998). *The Physics of Musical Instruments* (2nd ed.). Springer, ch. 12.
- Vaes, L. (2009). *Extended Piano Techniques in Theory, History and Performance Practice*. PhD diss., Leiden University. (The most thorough scholarly survey.)
- Crumb, G. (1972). *Makrokosmos, Vol. I*. Peters. (Performance notes.)
- Banowetz, J. (1985). *The Pianist's Guide to Pedaling*. Indiana University Press. (Sympathetic resonance in practice.)
