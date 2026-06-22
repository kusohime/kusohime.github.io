---
title: "String & Piano Harmonics"
subtitle: "Natural, artificial, acoustic, and interior-piano harmonic finder"
subtitleZh: "自然、人工、聲學弦與鋼琴內部弦泛音查找"
number: 6
group: "Composition"
summary: "Maps natural and artificial harmonics for bowed strings, lute-family and guqin tunings, piano interior strings, and arbitrary acoustic strings derived from length, tension, and linear density."
summaryZh: "映射弓弦樂器、魯特琴族與古琴調弦、鋼琴內部弦，以及由長度、張力和線密度推導的任意聲學弦之泛音。"
status: "stable"
slug: "string-harmonics"
references:
  - "Fletcher, N. H., & Rossing, T. D. (1998). *The Physics of Musical Instruments* (2nd ed.). Springer."
  - "Rossing, T. D., ed. (2010). *The Science of String Instruments*. Springer."
  - "Gould, E. (2011). *Behind Bars: The Definitive Guide to Music Notation*. Faber."
  - "Adler, S. (2016). *The Study of Orchestration* (4th ed.). W. W. Norton."
  - "[Silkqin: Qin tunings](https://www.silkqin.com/08anal/tunings.htm). Guqin tuning relationships and historical pitch caveats."
  - "[Peiyouqin: Basic tuning](https://www.peiyouqin.com/tunning.html). Modern zheng diao open-string note representation."
  - "Olsson, J., Svensson, J., & Bauck, M. [*pianoharmonics.com*](https://www.pianoharmonics.com/). Practical piano node map, recordings, measured harmonic deviations, and notation guidance."
  - "Cowell, H. (1930). *New Musical Resources*. Knopf."
  - "Vaes, L. (2009). *Extended Piano Techniques in Theory, History and Performance Practice*. PhD diss., Leiden University."
---

Use the target lookup when you know the pitch you want and need possible
open-string natural harmonics. The bowed presets cover the ordinary
concert string family: E, A, D, G, and C strings. The plucked presets give
practical starting tunings for guitar, lute, oud, pipa, and guqin. Guqin
entries are transpositions or variants of the common zheng diao
relationship, 5 6 1 2 3 5 6, also represented as 1 2 4 5 6 1 2. Treat
their absolute octave placement as editable, since traditional qin pitch
is flexible and performance context decides the real height.

The natural-harmonic map treats the open string as the fundamental. For
partial *n*, the sounding pitch is *n* times the open-string frequency.
The touch nodes are the fractions *k/n* of string length from the nut,
where *k* and *n* are coprime. A touch at 1/4 of the string, for example,
is the fourth partial: it sounds two octaves above the open string, while
the diamond touch point lies a fourth above the open string.

The artificial-harmonic panel starts from any stopped pitch. It shows the
touch point as a fraction of the active string length from the stopped
finger toward the bridge: 1/4 gives the familiar two-octave artificial
harmonic, 1/3 gives an octave plus a fifth, and 1/5 gives two octaves plus
a major third. Switch to acoustic mode for a primitive or experimental
string: the tool derives the fundamental from
*f = (1 / 2L) sqrt(T / mu)*, then applies the same harmonic-series map.

The piano interior-string panels use the same harmonic logic but with a
different performer-facing map. The reverse lookup searches source strings
and partials through the 22nd harmonic, then ranks touch points by cents
distance from the target. By default it uses practical bass-string nodes
and average measured offsets from pianoharmonics.com; switch to all
mathematical nodes or ideal integer partials when you want a theoretical
table rather than a rehearsal-first one.

For piano, physical fractions are measured from the agraffe toward the
bridge. Score marks use harmonic/node order: 9/2 means the second node of
the ninth harmonic, while the physical point is 2/9 of the speaking length.
Specify the convention clearly in the score, and give the pianist time to
test the instrument. Speaking lengths, dampers, stress bars, and
inharmonicity vary from one piano to the next.

Use the numbers as rehearsal-facing approximations, not as proof of
playability. Real string length, string gauge, action height, bridge
curvature, bow position, and the player's hand shape decide which nodes
speak cleanly.
