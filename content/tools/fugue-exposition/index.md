---
title: "Fugue Exposition Builder"
subtitle: "Subject, answer, entries, stretto"
number: 14
group: "Composition"
summary: "Lays out a fugue exposition for up to four voices from your subject — answer at the fifth by default, tonal answer and countersubject optional, entry distance adjustable down to stretto."
status: "stable"
slug: "fugue-exposition"
references:
  - "Mann, A. (1958/1987). *The Study of Fugue*. Dover. (Incl. translations of Fux and Marpurg.)"
  - "Gédalge, A. (1901/1965). *Traité de la fugue*, trans. F. Davis as *Treatise on the Fugue*. University of Oklahoma Press."
  - "Prout, E. (1891). *Fugue*. Augener."
  - "Renwick, W. (1995). *Analyzing Fugue: A Schenkerian Approach*. Pendragon."
  - "Walker, P. (2000). *Theories of Fugue from the Age of Josquin to the Age of Bach*. University of Rochester Press."
  - "Bach, J. S. *Das Wohltemperierte Klavier* and *Die Kunst der Fuge*. (The empirical literature.)"
---

Enter a **subject with its rhythm**: `NOTE:duration` tokens, where the
durations are `w h q e s` (whole to sixteenth) with an optional dot, `R`
is a rest, and a token without a duration repeats the previous one — so
`D4:e A4 F4 D4` is four eighths. The builder then lays out an exposition
for two to four voices: each entry states the subject or the answer,
transposed per the entry table, at the chosen octave. The **preset** menu
loads a few worked expositions — the *Art of Fugue* principal subject and
two from the *Wohltemperiertes Klavier* — including the C minor fugue's
tonal answer and regular countersubject, so the answer and countersubject
fields fill in alongside the subject.

The **answer** defaults to the subject up a perfect fifth — the *real*
answer, which is why "by fifths" is the default behavior. If your subject
needs a *tonal* answer (most subjects that open on or leap to the
dominant do), write the answer yourself in the same notation and the
builder uses it verbatim; deciding where the adjustment falls is the
composer's first real decision in a fugue, and no tool should make it
silently. A **countersubject** (entered as it should sound against entry
2) follows each voice's own statement, shifted in parallel with the
entry it accompanies.

Each entry also carries a **rhythm** transformation: state the material in
*augmentation* (note values doubled, ×2 or ×4) or *diminution* (halved, ×½
or ×¼), the devices that stack a subject against itself at different
speeds — the augmented entry runs underneath while quicker entries come and
go above it (as in *Art of Fugue* Contrapunctus VII). Pitches are
untouched; only the note values stretch or compress, so the statement
lengthens or shortens while still entering on the grid.

The **entry distance** defaults to the subject's full length — each voice
waits its turn, the textbook exposition. Shorten it and the entries
overlap: stretto, on a continuum down to half a beat. The piano roll
shows each voice as a horizontal line of pitches (red = voice 1, then
fading grays; dashed = countersubject; sparse dashes = free counterpoint
not yet written), so overlap, register spacing, and the answer's
tessitura are visible before a note is engraved. Playback states the
scaffold in sustained tones at the chosen tempo.

Below the roll, the builder reports **parallel perfect fifths and
octaves at attack onsets** between the stated materials — the first
mechanical check any counterpoint teacher applies, and deliberately the
only one: voice-leading judgment between the onsets, dissonance
treatment, and everything in the dashed regions remain yours. What the
tool guarantees is the bookkeeping: where each voice is, in what
transposition, against what.

Relevant repertoire: Bach's *Wohltemperiertes Klavier* for every
exposition layout this tool can produce, and *Die Kunst der Fuge* for
strettos at shrinking distances (Contrapunctus V–VII); Beethoven's
*Große Fuge*; Hindemith's *Ludus Tonalis* and Shostakovich's 24 Preludes
and Fugues as the modern systematic cycles; Bartók's *Music for Strings,
Percussion and Celesta*, whose first movement enters by fifths around
the entire circle — the default transposition scheme of this builder
taken to its limit.
