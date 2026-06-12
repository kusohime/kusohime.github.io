---
title: "Pitch & Tuning Lab"
subtitle: "Hz, MIDI, names, cents, ratios, and EDOs in one place"
number: 3
group: "Pitch & Spectrum"
summary: "Convert between every representation of pitch, measure just-intonation ratios in cents, and explore arbitrary equal divisions of the octave."
status: "stable"
slug: "pitch-tuning-lab"
---

## How to use it

The **converter** takes whatever you have — a note name (`F#3`, `Bb5`), a
frequency (`440` or `440Hz`), or a MIDI number — and returns everything
else: frequency, fractional MIDI, the nearest 12-EDO pitch with its
deviation in cents. The A4 reference is adjustable for period pitch
(415, 430, 442…) and everything downstream respects it.

The **just-intonation panel** takes a ratio (`3/2`, `81/64`, `7/4`) above a
reference note and reports its size in cents and its nearest tempered
spelling. Hear the dyad: with `7/4` you will hear why no tempered spelling
is the "right" one. The **EDO explorer** tabulates any equal division of
the octave (2–96) against 12-EDO and plays the scale.

## Conventions

Ratios are kept as exact integer fractions; cents and Hz are floats —
displayed rounded, computed full-precision. A numeric input under 130
without `Hz` is read as MIDI; anything else as frequency. Deviations use
the convention that +14¢ means *sharp of* the named pitch.

## Design notes

The proposal wanted microtonal accidental suggestions (Johnston,
Helmholtz–Ellis, Sagittal glyphs). I left those out on purpose: accidental
systems are notational *policies*, not facts about the pitch, and
suggesting HE accidentals without rendering SMuFL glyphs correctly would
produce confident-looking nonsense. The cents-deviation readout is
system-neutral: any of the standard microtonal notations can be derived
from it, and the composer — not the tool — should own that choice. What
the tool does guarantee is the arithmetic: `3/2 = 701.955¢` to a
millicent, every time.

## Repertoire

Ben Johnston (String Quartets — JI ratios as the primary material), Harry
Partch (*Genesis of a Music* is half treatise, half tuning table), Georg
Friedrich Haas (*limited approximations* — sixth-tone pianos, i.e. 72-EDO
thinking), Wyschnegradsky's quarter-tone works (24-EDO), and the
Helmholtz–Ellis school around Marc Sabat and Wolfgang von Schweinitz, for
whom this converter is the daily bread it pretends to be.

## References

- Partch, H. (1974). *Genesis of a Music* (2nd ed.). Da Capo.
- Johnston, B. (2006). *"Maximum Clarity" and Other Writings on Music*, ed. B. Gilmore. University of Illinois Press.
- Helmholtz, H. (1877/1954). *On the Sensations of Tone*, trans. A. Ellis. Dover. (Ellis's appendices invented the cent.)
- Sabat, M., & von Schweinitz, W. (2005). *The Extended Helmholtz-Ellis JI Pitch Notation*. plainsound.org.
- Sethares, W. (2005). *Tuning, Timbre, Spectrum, Scale* (2nd ed.). Springer.
