---
title: "Tuning Convert"
subtitle: "Note name, Hz, MIDI, cents, JI ratio, EDO"
subtitleZh: "音名、赫茲、MIDI、音分、純律比率、等分八度"
number: 3
group: "Composition"
summary: "Converts between pitch representations, measures just-intonation ratios in cents, and tabulates equal divisions of the octave."
summaryZh: "在各種音高表示法之間換算，以音分度量純律比率，並列表呈現各種等分八度。"
status: "stable"
slug: "pitch-tuning-lab"
references:
  - "Partch, H. (1974). *Genesis of a Music* (2nd ed.). Da Capo."
  - "Johnston, B. (2006). *\"Maximum Clarity\" and Other Writings on Music*, ed. B. Gilmore. University of Illinois Press."
  - "Helmholtz, H. (1877/1954). *On the Sensations of Tone*, trans. A. Ellis. Dover."
  - "Sabat, M., & von Schweinitz, W. (2005). *The Extended Helmholtz-Ellis JI Pitch Notation*. [plainsound.org](https://www.plainsound.org/)."
  - "Sethares, W. (2005). *Tuning, Timbre, Spectrum, Scale* (2nd ed.). Springer."
---

The converter takes whatever you have — a note name (`F#3`, `Bb5`), a
frequency (`440` or `440Hz`), or a MIDI number — and returns the rest:
frequency, fractional MIDI, the nearest 12-EDO pitch with its deviation
in cents. The A4 reference is adjustable for period pitch (415, 430,
442…) and everything downstream respects it.

The just-intonation panel takes a ratio (`3/2`, `81/64`, `7/4`) above a
reference note and reports its size in cents and its nearest tempered
spelling; the dyad can be played. The EDO panel tabulates any equal
division of the octave (2–96) against 12-EDO and plays the scale.

Ratios are kept as exact integer fractions; cents and Hz are floats —
displayed rounded, computed at full precision. A numeric input under 130
without `Hz` is read as MIDI; anything else as frequency. Deviations use
the convention that +14¢ means sharp of the named pitch.

Microtonal accidental suggestions (Johnston, Helmholtz–Ellis, Sagittal)
from the original proposal were left out deliberately: accidental systems
are notational policies, not facts about the pitch, and suggesting them
without correct glyph rendering would produce confident-looking nonsense.
The cents readout is system-neutral; any standard microtonal notation can
be derived from it, and that choice should stay with the composer. What
the tool does guarantee is the arithmetic: `3/2 = 701.955¢`, every time.

Relevant repertoire and practice: Ben Johnston's string quartets (JI
ratios as primary material), Partch, Wyschnegradsky's quarter-tone works,
Haas (*limited approximations*, sixth-tone pianos), and the
Helmholtz–Ellis school around Marc Sabat and Wolfgang von Schweinitz.
