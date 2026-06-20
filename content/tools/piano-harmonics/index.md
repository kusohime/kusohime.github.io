---
title: "Piano Harmonics Mapper"
subtitle: "Reverse lookup for source strings and touch points"
subtitleZh: "源弦與觸弦點的反查"
number: 6
group: "Composition"
summary: "Finds source strings and touch points that approach a target sounding pitch, with a secondary string-and-partial mapper for checking exact nodes."
summaryZh: "找出能逼近目標發聲音高的源弦與觸弦點，並附一個輔助的弦—分音對應器以核對精確節點。"
status: "stable"
slug: "piano-harmonics"
references:
  - "Olsson, J., Svensson, J., & Bauck, M. [*pianoharmonics.com*](https://www.pianoharmonics.com/). Practical node map, recordings, measured harmonic deviations, and notation guidance."
  - "Cowell, H. (1930). *New Musical Resources*. Knopf."
  - "Fletcher, N. H., & Rossing, T. D. (1998). *The Physics of Musical Instruments* (2nd ed.). Springer."
  - "Vaes, L. (2009). *Extended Piano Techniques in Theory, History and Performance Practice*. PhD diss., Leiden University."
  - "Crumb, G. (1972). *Makrokosmos, Vol. I*. Peters."
  - "Banowetz, J. (1985). *The Pianist's Guide to Pedaling*. Indiana University Press."
---

Start with the pitch you want to hear. The reverse lookup searches source
strings and partials through the 22nd harmonic, then ranks the closest
touch points by cents distance from the target. By default it uses a
practical bass-string node set and average measured pitch offsets drawn
from [pianoharmonics.com](https://www.pianoharmonics.com/), which is based on a Steinway D. Switch to
**All mathematical nodes** or **Ideal integer partials** when you want a
theoretical table rather than a performer-first one.

The manual mapper below still lets you choose one string and one partial
directly. Its string diagram marks touch points as fractions of speaking
length from the agraffe. For the n-th partial, the complete mathematical
set is the points k/n with k coprime to n; the practical set removes
nodes that are usually inaccessible or not part of the bass-string map.
**Hear (approx.)** plays a synthetic approximation emphasizing the
selected partial.

The table gives both the physical position and the more compact score
mark. A physical position such as 2/9 means “touch at two ninths of the
speaking length from the agraffe.” A score mark such as 9/2 means “second
node of the ninth harmonic,” following the notation proposed on
pianoharmonics.com. Use one convention clearly and explain it in the
score.

Notate touch points as fractions, never in centimeters: speaking lengths
differ between a Steinway D and a baby grand, fractions do not. The
damper and stress-bar layout is model-dependent, so very high harmonics
and higher-register strings should be treated cautiously unless the
performer has time to test the instrument. Specify which hand silently
depresses the key and which touches the string, and give the pianist time
to find the node in rehearsal.

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
