# Ornament inventory - chart rows 13-18

Visual inventory prepared from `wesentliche-bands/rows-13-18.png`, checked against the full 400 dpi page image. It covers Quantz, C. P. E. Bach, Marpurg, Leopold Mozart, Türk, and Hummel across all seven ornament-family columns.

**Chart context:** *Die "wesentlichen Manieren" (Ornamente in der Musik): ihre Zeichen, Namen und Ausführung*, arranged from original texts by Liselotte Brändle. The page footer identifies Österreichischer Bundesverlag, Vienna, 1974. This chart is the immediate witness for the inventory; the six historical treatises named below remain the authorities for final pitch/rhythm verification.

## Reading conventions

- `0` is the principal note being ornamented.
- `+1` and `-1` are its upper and lower diatonic neighbors; `+2` and `-2` are the next degrees beyond them.
- `(a,b)xN` means rapid alternation for as many repetitions as the written value permits.
- A sequence followed by `?` is a contour reading, not a source-verified exact transcription.
- "Rapid" means the scan clearly shows a beamed diminution but its exact beam count is not secure enough to distinguish 32nds from 64ths.
- The chart omits clefs in the example cells. Relative degrees therefore preserve the contour without pretending to recover absolute pitches.
- Variant IDs count distinct signs, realizations, tempo forms, or contextual placements that need separate digital treatment. Repetitions inside a single continuous passage are identified as occurrences.
- Terms preserve the chart's printed spelling, including historical French/German accents and forms.

## Coverage summary

| Row | Source ID | Nonempty family cells | Variant slots inventoried | Empty cells |
| --- | --- | ---: | ---: | --- |
| 13 | `quantz-1752` | 6 | 16 | F3 |
| 14 | `cpe-bach-1753` | 7 | 26 | none |
| 15 | `marpurg-1750` | 7 | 33 | none |
| 16 | `leopold-mozart-1756` | 7 | 27 | none |
| 17 | `tuerk-1789` | 7 | 32 | none |
| 18 | `hummel-1828` | 5 | 22 | F3, F5 |
| **Total** |  | **39** | **156** | **3** |

The 156 count is deliberately implementation-oriented: it includes alternative glyphs, tempo-specific realizations, and separately printed contextual examples. Some can share one MEI formula with different source-sign metadata, but none should disappear from the interface.

## Row 13 - Johann Joachim Quantz

**Source:** Johann Joachim Quantz (1697-1773), *Versuch einer Anweisung die Flöte traversière zu spielen*, Berlin, 1752. Source ID: `quantz-1752`.

### F1 - Vorschlag / appoggiatura column (2 variants)

| IDs | Printed term | Source sign | Realization / relative pitch | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `Q13-F1-A` | No term printed in this row | Unslashed small note above the main-note head, slurred into it | Upper appoggiatura `+1 -> 0`; four applications appear across the upper excerpt (`A1-A4`) | Value-bearing appoggiatura; duration changes with the surrounding note | High for contour, medium for the exact number/duration of contextual applications |
| `Q13-F1-B` | No term printed in this row | Unslashed small note below the main-note head, slurred into it | Lower appoggiatura `-1 -> 0`; four applications appear across the lower excerpt (`B1-B4`) | Value-bearing appoggiatura; mixed long/short contexts | High for contour, medium for exact durations |

### F2 - Trill column (5 variants)

| ID | Printed term | Source sign / notation | Realization / relative pitch | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `Q13-F2-A` | Triller | Small upper preparation note followed by `tr` over the principal | Preparation into ordinary upper-neighbor alternation: `+1 -> (0,+1)xN -> 0` | Grace/preparation plus rapid even diminution | Medium; the first two pitches are tightly printed |
| `Q13-F2-B` | Triller | `tr` over a short slurred/tied two-note notation, introduced as `oder` | Same ordinary trill family, beginning from the upper neighbor | Short rapid group | Medium |
| `Q13-F2-C` | Triller | Plain `tr`, followed by equals sign | Explicit long realization alternating `+1,0,+1,0...`, ending on the principal | Long chain of very rapid equal notes | High for alternating contour; beam count uncertain |
| `Q13-F2-D` | halber Triller | First lower-line example with a short slurred beamed group | Compact half-trill, visually `0,+1,0` or `+1,0,+1,0`? | Three-note rapid group before resolution | Low-medium; onset notehead is obscured |
| `Q13-F2-E` | halber Triller | Second lower-line example with a longer beamed group | Extended half-trill, upper/principal alternation ending on `0` | About five rapid notes under one slur | Medium |

### F3 - Compound trill-start/end column

Empty ruled staff. No sign, term, or example is printed.

### F4 - Doppelschlag / turn column (1 variant)

| ID | Printed term | Source sign | Realization / relative pitch | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `Q13-F4-A` | Doublé oder Doppelschlag | No abstract glyph; tiny pickup note leading to a slurred four-note group | Standard turn contour `+1,0,-1,0` | Four rapid equal notes, slurred; pickup-like placement | High for formula, medium for the printed anacrusis |

### F5 - Mordent column (2 variants)

| ID | Printed term | Source sign | Realization / relative pitch | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `Q13-F5-A` | Pincé (Mordant) | No separate glyph; first slurred group | Short lower-neighbor mordent `0,-1,0` | Compact three/four-note rapid group | High for ornament family, medium for whether the opening pickup is counted in the group |
| `Q13-F5-B` | Pincé (Mordant) | Same notation, longer lower excerpt | Long mordent `(0,-1)xN -> 0` | Longer chain of rapid equal notes under one slur | High |

### F6 - Battement column (2 variants)

| ID | Printed term | Source sign | Realization / relative pitch | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `Q13-F6-A` | Battement | First passage placement: tiny beamed lower-neighbor figure before/around a principal | Lower-neighbor shake `0,-1,0`? | Very short beamed figure | Medium-low; noteheads overlap |
| `Q13-F6-B` | Battement | Second passage placement: extended beamed figure under a slur | Repeated lower-neighbor alternation `(0,-1)xN -> 0` | Long rapid group | Medium-high for contour |

### F7 - Schleifer column (4 contextual variants)

| ID | Printed term | Source sign | Realization / relative pitch | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `Q13-F7-A` | Schleifer | Two small beamed ascending notes slurred to the principal; upper excerpt, first placement | Rising slide `-2,-1,0` | Two grace-sized notes into the beat | High |
| `Q13-F7-B` | Schleifer | Same sign in a second upper-excerpt context | Rising slide `-2,-1,0`, transposed | Two grace-sized notes; surrounding value differs | High |
| `Q13-F7-C` | Schleifer | First lower-excerpt written-out placement | Rising three-note approach into the principal | Faster beamed realization in running notes | Medium-high |
| `Q13-F7-D` | Schleifer | Second lower-excerpt placement | Rising approach, possibly extended by one contextual note: `-2,-1,0,(ctx)` | Rapid beamed group | Medium; right edge is crowded |

## Row 14 - Carl Philipp Emanuel Bach

**Source:** Carl Philipp Emanuel Bach (1714-1788), *Versuch über die wahre Art das Clavier zu spielen*, Berlin, 1753. Source ID: `cpe-bach-1753`.

### F1 - Vorschläge (5 contextual variants)

| ID | Source sign / context | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `CPE14-F1-A` | Upper staff, first small-note/main pair | Adjacent appoggiatura into `0`; likely lower-to-main | Appoggiatura takes a substantial portion of the long main value | Medium; direction is not fully secure without the omitted clef |
| `CPE14-F1-B` | Upper staff, first equals-sign realization | Same adjacent-note pair written as two full-size notes | Near-equal division of the notated value | High for the notated-versus-realized relationship |
| `CPE14-F1-C` | Upper staff, central small-note example and equality | Adjacent appoggiatura into `0` | Shorter pair, approximately eighth-note division | Medium-high |
| `CPE14-F1-D` | Upper staff, right-hand long-note example and equality | Adjacent appoggiatura into `0`, tied/slurred | Long appoggiatura with sustained resolution | Medium-high |
| `CPE14-F1-E` | Lower staff: two applications, one before a sustained note and one in a shorter cadence | Direction changes with context; both are one-step appoggiaturas into `0` | One long and one short division | Medium; preserve both placements (`E1`, `E2`) in a source-faithful excerpt if possible |

### F2 - Ordinary and half trills (3 variants)

| ID | Printed term | Source sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `CPE14-F2-A` | ordentlicher Triller kurz | Short wavy line over principal, also represented by grace-note plus `tr` | Upper-neighbor trill `(+1,0)xN -> 0` | Short rapid alternation | High |
| `CPE14-F2-B` | ordentlicher Triller lang | Long wavy line over a longer/tied principal | Same formula with more repetitions | Long rapid chain | High |
| `CPE14-F2-C` | halber oder Pralltriller | Short wavy/prall sign over the second of a slurred pair | Main-start shake `0,+1,0,+1,0` | Five rapid equal notes, ending on `0` | Medium-high |

### F3 - Triller von oben / von unten (5 sign variants)

| ID | Printed term | Source sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `CPE14-F3-A` | Triller von oben | Hooked wavy glyph rising into the trill | Approach from above into upper-neighbor alternation: `+1,0,(+1,0)xN` | Rapid even chain | High for direction, medium for exact pickup count |
| `CPE14-F3-B` | Triller von oben | Alternative written preparation notes followed by `tr` (`oder`) | Same as A, preparation written as notes | Short beamed preparation plus rapid trill | High |
| `CPE14-F3-C` | Triller von unten | Hooked wavy glyph rising from below | Lower approach `-1,0,+1,0,(+1,0)xN` | Rapid even chain | High for direction |
| `CPE14-F3-D` | Triller von unten | Lower grace note plus `tr` (`oder`) | Same lower-start formula | Grace pickup plus trill | High |
| `CPE14-F3-E` | Triller von unten | Short beamed lower approach plus plain `tr` (`oder`) | Same formula with the approach rhythm explicitly written | Beamed pickup plus long rapid chain | High |

### F4 - Doppelschlag family (5 variants)

| ID | Printed term | Sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `CPE14-F4-A` | Doppelschlag - adagio | Horizontal turn sign, with a small vertical modifier visible above | `+1,0,-1,0` | Unequal/expressive four-note turn, slower values | High for contour |
| `CPE14-F4-B` | Doppelschlag - moderato | Same sign | `+1,0,-1,0` | Four more even, faster notes | High |
| `CPE14-F4-C` | Doppelschlag - presto | Same sign | `+1,0,-1,0` | Compressed rapid group | High |
| `CPE14-F4-D` | prallender Doppelschlag | Stacked/combined prall plus turn glyph | Main-start turn: `0,+1,0,-1,0` | Rapid five-note group | Medium-high |
| `CPE14-F4-E` | geschnellter Doppelschlag | Combined lower-shake/turn glyph | Lower-start/inverted five-note turn: `0,-1,0,+1,0`? | Rapid five-note group | Medium; source contour should be rechecked at encoding time |

### F5 - Mordent kurz / lang (3 variants)

| ID | Printed term | Source sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `CPE14-F5-A` | Mordent kurz | Short wavy glyph crossed by a vertical stroke | `0,-1,0` | Three rapid notes then sustained `0` | High |
| `CPE14-F5-B` | Mordent lang | Longer crossed wavy glyph | `(0,-1)xN -> 0` | First long realization, compact rapid chain | High |
| `CPE14-F5-C` | Mordent lang | Same sign, alternative introduced by `oder` | Same pitch formula | Longer/more even subdivision | High |

### F6 - Mordent mit Vorhalt / Schneller (2 variants)

| ID | Printed term | Sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `CPE14-F6-A` | Mordent mit Vorhalt | Preparation note plus crossed mordent sign | Held adjacent preparation into `0,-1,0`, then sustained principal | Long preparation followed by a compact three-note mordent | Medium-high; preparation direction depends on local staff reading |
| `CPE14-F6-B` | Schneller | Small two-note grace-like sign | Lower-neighbor snap around the principal, approximately `0,-1,0` | Very short beamed group before sustained `0` | Medium |

### F7 - Schleifer (3 variants)

| ID | Source sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `CPE14-F7-A` | Two small beamed rising notes before main | `-2,-1,0` | Two grace notes into the beat | High |
| `CPE14-F7-B` | S-shaped Schleifer glyph over a principal | Rising slide `-2,-1,0` | Three rapid written notes | High for contour |
| `CPE14-F7-C` | Same S glyph, alternative after `oder` | Same rising contour but spread across a different rhythmic placement | Longer unequal group with tied/sustained main | Medium-high |

## Row 15 - Friedrich Wilhelm Marpurg

**Source:** Friedrich Wilhelm Marpurg (1718-1795), *Die Kunst das Clavier zu spielen*, Berlin, 1750. Source ID: `marpurg-1750`.

### F1 - Vorschlag / Vorhalt (8 contextual variants)

The sign column prints five appoggiatura/retardation notations: a crossed-note form, a plus-marked main-note form, two curved-stroke forms, and a small-note form. The music cell supplies eight separate placements, four per staff.

| IDs | Position | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `M15-F1-A1` to `A4` | Upper excerpt, left to right | Each is an adjacent appoggiatura into `0`; the excerpt alternates upper and lower approaches as the melody descends | Mix of long split values and short beamed resolutions | Medium. Preserve the source contour graphically; exact degree labels should be checked against the treatise plate |
| `M15-F1-B1` to `B4` | Lower excerpt, left to right | Adjacent appoggiaturas into successive principals, including a clearly rising lower approach at B1/B2 and descending approaches later | One short pickup, two sustained/tied resolutions, one beamed cadence | Medium |

### F2 - Tremblement types (3 variants)

| ID | Printed term | Source sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `M15-F2-A` | Tremblement détaché | Plus sign over principal | Detached/main-start trill `0,(+1,0)xN` | Short compact rapid chain | Medium-high |
| `M15-F2-B` | Tremblement appuyé ou préparé | Wavy sign preceded by a held preparation | Upper auxiliary is held, then `(+1,0)xN -> 0` | Long preparation plus rapid alternation and a short ending | High |
| `M15-F2-C` | Tremblement lié | Wavy sign spanning a slurred/tied arrival | Legato prepared trill, held approach into `(+1,0)xN -> 0` | Slurred preparation, compact six-note-looking chain | Medium-high |

### F3 - Triller sign vocabulary (7 variants)

All seven glyph rows in the source-sign column must be retained even where several share one pitch formula.

| ID | Glyph description | Associated realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `M15-F3-A` | Wavy line bracketed by an upward hook at both ends | Top realization: ordinary upper-neighbor trill `(+1,0)xN -> 0` | Long rapid even chain | High |
| `M15-F3-B` | Wavy line with a left descending stroke and terminal loop | Same ordinary trill, alternate source spelling | Same | High for glyph distinction |
| `M15-F3-C` | C-shaped left hook, wavy middle, upturned right hook | Compound/prepared trill in lower-left example | Short entrance plus long rapid alternation | Medium-high |
| `M15-F3-D` | C-shaped left hook and wavy continuation without right hook | Compound/prepared trill, alternate termination | Same core alternation | Medium-high |
| `M15-F3-E` | Small plain turn-like wave | Short turn/prall component within the combined trill signs | Compact local turn | Medium |
| `M15-F3-F` | C-shaped left hook, wavy line, strong upward terminal hook | Lower-right compound trill | Written pickup, then `(+1,0)xN`, with ending figure | Rapid chain plus cadential notes | Medium-high |
| `M15-F3-G` | C-shaped left hook, wavy line, terminal loop | Alternative lower-right combined sign introduced by `oder` | Same family with a different end/continuation | Rapid chain | Medium-high |

### F4 - Doublé / Doppelschlag / Groppo (4 variants)

| ID | Printed term | Sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `M15-F4-A` | Doublé / Doppelschlag | First horizontal turn glyph | `+1,0,-1,0` | First four-note rapid group | High |
| `M15-F4-B` | Doublé / Doppelschlag | Second glyph with a dot/short mark | Same turn formula in a second context | Four rapid notes | High |
| `M15-F4-C` | Groppo | Turn glyph attached to a note stem on the left | Main-start turn, approximately `0,+1,0,-1,0` | Five rapid notes | Medium-high |
| `M15-F4-D` | Groppo | Turn glyph over a later held/slurred note | Same groppo family, delayed/after-note placement | Sustained approach then rapid group | Medium |

### F5 - Mordant / Pincé (4 sign variants)

| ID | Printed term | Sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `M15-F5-A` | Mordant | Short crossed wavy sign | `0,-1,0` | Short rapid group | High |
| `M15-F5-B` | Mordant | Longer crossed wavy sign | `(0,-1)xN -> 0` | Longer rapid group | High |
| `M15-F5-C` | Pincé | First curved-stroke sign beside a main note | Lower-neighbor pincé, expected `0,-1,0`; no separate equality is printed | Unspecified | Medium-low; sign-only variant |
| `M15-F5-D` | Pincé | Mirrored/alternate curved-stroke sign | Same pincé family | Unspecified | Medium-low; sign-only variant |

### F6 - Mordant / Pincé compound (1 variant)

| ID | Printed term | Sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `M15-F6-A` | Mordant / Pincé | Crossed mordent over the first note of a short suspension-like phrase | Principal-lower-principal figure `0,-1,0`, followed by contextual resolution | Compact three-note mordent after a held/slurred onset | Medium-high |

### F7 - Schleifer / Flatté (6 contextual variants)

| IDs | Printed term | Position / sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `M15-F7-A1` to `A4` | Schleifer | Four placements across the upper excerpt: beamed double-grace sign and wavy Schleifer sign both occur | Predominantly rising `-2,-1,0`; at least one placement appears descending and should preserve the source contour rather than be normalized blindly | Short beamed approaches in varied note values | Medium; four placements are visually distinct |
| `M15-F7-B1`, `B2` | Flatté | Diagonal/curved stroke between two notes, twice in the lower excerpt | Neighbor inflection into `0`; exact direction follows each written interval | Appoggiatura-like two-note gesture | Medium-low; no clef and the stroke partly hides the first pitch |

## Row 16 - Leopold Mozart

**Source:** Leopold Mozart (1719-1787), *Versuch einer gründlichen Violinschule*, Augsburg, 1755/56. Source ID: `leopold-mozart-1756`.

### F1 - Vorschläge (3 named variants)

| ID | Printed term | Source notation | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `LM16-F1-A` | lange Vorschläge | Unslashed small note slurred to a long principal; two placements at the left of the upper excerpt | Adjacent appoggiatura into `0` | Takes half or more of the written principal value | High for category, medium for exact divisions |
| `LM16-F1-B` | durchgehende Vorschläge | Chain of appoggiaturas through the right half of the upper excerpt | Repeated adjacent suspensions, each resolving by step to its local `0` | Continuous sequence of short/medium appoggiaturas | Medium-high |
| `LM16-F1-C` | anschlagende kurze Vorschläge | Lower excerpt, two explicitly short attacked examples | Adjacent grace note into `0` | Very short pre-beat/on-beat grace followed by sustained principal | High |

### F2 - Triller / Trilletti / vorbereiteter Triller (3 variants)

| ID | Printed term | Source sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `LM16-F2-A` | Triller | `tr` over long note; first upper example | Upper-neighbor alternation `(+1,0)xN`, with written termination | Very long rapid chain | High |
| `LM16-F2-B` | Trilletti (Pralltriller) | `tr` over short note; second upper example | Short main/upper shake ending on `0` | Four-to-six rapid notes | High |
| `LM16-F2-C` | vorbereiteter Triller | Small preparation note joined to `tr` over the following principal | Held/prepared upper note into trill, then resolution | Written preparation before the trill; no full alternation is expanded in this cell | Medium-high |

### F3 - Triller mit Nachschlag und mit Ausziehung (2 variants)

| ID | Printed term | Source sign / context | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `LM16-F3-A` | Triller mit Nachschlag und mit Ausziehung | Upper example, one long slur covering trill plus termination | `(+1,0)xN`, then lower-neighbor turn ending `-1,0` | Long rapid chain plus short terminal group | High |
| `LM16-F3-B` | Same | Lower example, trill chain followed by a separately grouped extension and another marked `tr` | `(+1,0)xN`, extended ending/aftershake, then resolution | Long chain plus grouped cadential suffix | Medium-high; exact suffix has overlapping beams |

### F4 - Zirkel / Halbzirkel / Doppelschlag / Halbtriller (5 variants)

| ID | Printed term | Source sign / notation | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `LM16-F4-A` | Zirkel (8 Noten) | Large arched sign over an eight-note beamed figure | Eight-note scalar/circular approach ending on local `0`; approximate contour `-3,-2,-1,0,+1,+2,+1,0`? | Eight even rapid notes | Low for exact degrees; high for eight-note count |
| `LM16-F4-B` | Halbzirkel (4 Noten) | Same family with four-note beamed figure | Four-note half-circle, likely `+1,0,-1,0` | Four rapid notes | Medium |
| `LM16-F4-C` | Doppelschlag | First lower-excerpt slurred turn group | `+1,0,-1,0` | Rapid four-note group | High |
| `LM16-F4-D` | Doppelschlag | Second lower-excerpt turn, with approach note | Same turn after a written approach | Approach plus rapid four-note group | Medium-high |
| `LM16-F4-E` | Halbtriller | Rightmost lower-excerpt compact group explicitly labelled *Halbtriller* | Short upper/principal shake ending on `0` | Compact rapid group | High for family, medium for onset pitch |

### F5 - Mordent (Beisser) / Anschlag (5 variants)

| ID | Printed term | Source notation | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `LM16-F5-A1` | Mordent (Beisser), example 1a | First upper-line mordent group | `0,-1,0` | Rapid group before sustained context note | High |
| `LM16-F5-A2` | Mordent (Beisser), example 1b | Second upper-line mordent group | Longer `(0,-1)xN -> 0` | Longer rapid beamed group | High |
| `LM16-F5-B1` | Anschlag, example 2a | First double-note/grace chord before principal | Two-note appoggiatura/chordal strike into `0`; interval contents uncertain | Short chordal grace | Medium-low |
| `LM16-F5-B2` | Anschlag, example 2b | Second chordal strike in the same numbered example | Same family, transposed or revoiced | Short chordal grace | Medium-low |
| `LM16-F5-C` | Anschlag, example 3 | Single lower approach followed by a beamed upper figure and principal | Compound strike/approach into `0`; exact relative chord tones uncertain | Short beamed attack | Low-medium |

### F6 - Batement (3 occurrences in one passage)

| ID | Position | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `LM16-F6-A` | First, high-register group | Lower-neighbor alternation `(0,-1)xN -> 0` | Rapid six-ish-note group | Medium-high |
| `LM16-F6-B` | Second, middle-register group | Same pattern, transposed | Rapid group | Medium-high |
| `LM16-F6-C` | Third, lower-register group | Same pattern, transposed, followed by a written contextual leap/rest | Rapid group | Medium-high |

### F7 - Schleifer (6 contextual variants)

| IDs | Position | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `LM16-F7-A1`, `A2` | Upper excerpt, two placements | Rising slide `-2,-1,0`, second instance more compressed | First as small-note sign, second as rapid written notes | High |
| `LM16-F7-B1` to `B4` | Lower excerpt, four placements | Four rising double-grace approaches into successive principals; one begins below by a wider interval | Two rapid grace notes into each main note | Medium-high; preserve each local transposition |

## Row 17 - Daniel Gottlob Türk

**Source:** Daniel Gottlob Türk (1750-1813), *Klavierschule oder Anweisung zum Klavierspielen für Lehrer und Lernende mit kritischen Anmerkungen*, Leipzig and Halle, 1789. Source ID: `tuerk-1789`.

### F1 - lange / kurze Vorschläge (8 contextual variants)

| IDs | Printed term | Position | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `T17-F1-A1` to `A4` | lange Vorschläge | Four paired examples across the upper staff | Each is an adjacent appoggiatura into local `0`; directions alternate with the melody | Long values divided between appoggiatura and resolution; includes tied/syncopated contexts | Medium-high |
| `T17-F1-B1` to `B4` | kurze Vorschläge | Four written small-note placements across the lower staff, with three explicit realized pairs at right | Adjacent grace into local `0` | Very short grace followed by nearly full-value principal; right side shows compact beamed realizations | High for category; medium for exact onset placement |

### F2 - Triller (4 variants)

| ID | Sign / label | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `T17-F2-A` | `tr`, *allegro assai* | `(+1,0)xN -> 0` | Fast, relatively few broad rapid notes | High |
| `T17-F2-B` | `tr`, *andante* | Same alternation | More closely spaced/more numerous notes over the same value | High; tempo-specific realization must remain separate |
| `T17-F2-C` | Grace/preparation note plus `tr` | Prepared trill: adjacent preparation into `(+1,0)xN -> 0` | Held/slurred preparation then rapid chain | High |
| `T17-F2-D` | Long wavy trill sign | Trill beginning after a tied/held onset, then alternation | Sustained onset followed by rapid chain | Medium-high |

### F3 - Triller mit Zusatz von unten / oben (5 variants)

| ID | Printed term | Source sign / alternative | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `T17-F3-A` | Triller mit Zusatz von unten | Hooked compound glyph | Lower approach `-1,0`, then `(+1,0)xN`, with turn-like ending | Rapid chain with short prefix/suffix | High for direction |
| `T17-F3-B` | Same | Written lower grace-note approach plus `tr` | Same formula, onset explicitly notated | Beamed lower pickup plus rapid chain | High |
| `T17-F3-C` | Same | Alternative after `oder`, with a different terminal hook | Same lower-added trill with alternate ending | Rapid chain plus suffix | Medium-high |
| `T17-F3-D` | Triller mit Zusatz von oben | Hooked-above compound glyph | Upper approach, then `(+1,0)xN`, with upper/turn suffix | Rapid chain | High for direction |
| `T17-F3-E` | Same | Written upper beamed approach plus wavy continuation | Same formula, notes explicit | Beamed approach plus long rapid alternation | High |

### F4 - Doppelschlag family (5 variants)

| ID | Printed term | Sign / label | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `T17-F4-A` | Doppelschlag - moderato | Standard horizontal turn sign | `+1,0,-1,0` | Even four-note turn | High |
| `T17-F4-B` | Doppelschlag - adagio | Same sign | `+1,0,-1,0` | Unequal/slower turn | High |
| `T17-F4-C` | umgekehrter Doppelschlag | Reversed S-like turn glyph | `-1,0,+1,0` | Rapid four-note inverted turn | High |
| `T17-F4-D` | prallender Doppelschlag | Combined prall/turn glyph | `0,+1,0,-1,0` | Rapid five-note group after/within a slur | Medium-high |
| `T17-F4-E` | geschnellter Doppelschlag | Small grace-note plus turn glyph | `0,-1,0,+1,0`? | Rapid five-note group | Medium; verify exact direction against Türk before publication |

### F5 - Mordent (2 variants)

| ID | Sign | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `T17-F5-A` | Short crossed mordent | `0,-1,0` | Three rapid notes then sustained principal | High |
| `T17-F5-B` | Long crossed mordent | `(0,-1)xN -> 0` | Longer rapid group | High |

### F6 - Battement / Schneller (4 variants)

| ID | Printed term | Position | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `T17-F6-A` | Battement | First upper-line occurrence | Lower-neighbor alternation around local `0` | Rapid repeated group | Medium-high |
| `T17-F6-B` | Battement | Second upper-line occurrence, rising into a final note | Same pattern transposed, then contextual ascent | Rapid group plus final longer note | Medium-high |
| `T17-F6-C` | Schneller | First lower-line sign/equality | Short lower-neighbor snap `0,-1,0` | Compact beamed group | Medium-high |
| `T17-F6-D` | Schneller | Second lower-line placement | Same snap in a later context | Compact beamed group | Medium-high |

### F7 - Schleifer (4 contextual variants)

| ID | Source sign / context | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `T17-F7-A` | Two small rising notes before a main, followed by equality | `-2,-1,0` | Two grace notes become a rapid written triplet-like group | High |
| `T17-F7-B` | Wavy Schleifer sign before a main, followed by equality | Rising slide into `0` | Compact rapid group | High for contour |
| `T17-F7-C` | Lower excerpt, slur/line-shaped sign between lower notes | Rising two-step approach to `0` | Grace-like lead-in then sustained main | Medium |
| `T17-F7-D` | Lower excerpt, second line-shaped placement | Same, transposed and rhythmically compressed | Two fast notes into main | Medium-high |

## Row 18 - Johann Nepomuk Hummel

**Source:** Johann Nepomuk Hummel (1778-1837), *Ausführliche theoretisch-practische Anweisung zum Piano-Forte-Spiel*, Vienna, 1828. Source ID: `hummel-1828`.

### F1 - lange / kurze accentuirte Vorschläge (8 contextual variants)

| IDs | Printed term | Position | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `H18-F1-A1` to `A4` | lange oder accentuirte Vorschläge | Four upper-line placements | Adjacent appoggiaturas into local `0`; accent marks are integral to the examples | Long appoggiaturas, generally taking a substantial share of the principal; includes tied and dotted contexts | Medium-high |
| `H18-F1-B1` to `B4` | kurze oder accentuirende Vorschläge | Four lower-line placements | Adjacent short attacks into local `0`; includes an octave-displaced bass/grace context at the right | Short accented grace groups, some explicitly beamed | Medium; the final low note is contextual rather than part of a simple neighbor formula |

### F2 - Triller / uneigentliche oder getrillte Noten (3 variants)

| ID | Printed term | Sign / notation | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- | --- |
| `H18-F2-A` | Triller | `tr` plus long extension line over an open principal | Long upper-neighbor trill `(+1,0)xN`, ending with written two-note termination and principal | Very long even rapid chain | High |
| `H18-F2-B` | uneigentliche oder getrillte Noten | First pair of wavy-marked descending notes | Rearticulated/tremulated principal and neighbor within each notated value; contour follows the descending line | Each long note subdivided into a short repeated-note/neighbor group | Medium |
| `H18-F2-C` | Same | Second descending pair after equality | Same effect, explicitly written as two local rapid groups | Beamed repeated-note/neighbor figures | Medium-high |

### F3 - Compound trill-start/end column

Empty ruled staff. No sign, term, or example is printed.

### F4 - Doppelschlag (5 contextual variants)

| ID | Sign / context | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `H18-F4-A` | Standard S-like turn sign over first upper-line placement | `+1,0,-1,0` | Very compact group before the resolution | High |
| `H18-F4-B` | Same sign over second upper-line placement | Standard turn, transposed and after an approach | Rapid group | High |
| `H18-F4-C` | Reversed turn sign over third upper-line placement | Inverted turn `-1,0,+1,0` | Compact group | High |
| `H18-F4-D` | Lower-line first placement, longer beamed approach plus turn | Turn embedded in a longer approach; core `+1,0,-1,0` | Extended rapid group | Medium |
| `H18-F4-E` | Lower-line second placement with equality | Standard turn expanded after a held/approach note | Four rapid notes ending on `0` | Medium-high |

### F5 - Mordent column

Empty ruled staff. The crossed mordent visible immediately to the right belongs to Hummel's F6 sign column, not F5.

### F6 - Schneller (3 occurrences)

| ID | Source sign / position | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `H18-F6-A` | Crossed/wavy Schneller over first descending principal | Lower-neighbor snap `0,-1,0` | Short beamed realization | Medium-high |
| `H18-F6-B` | Same sign over second descending principal | Same, transposed | Short beamed realization | Medium-high |
| `H18-F6-C` | Same sign over third descending principal | Same, transposed | Short beamed realization | Medium-high |

### F7 - Schleifer (3 contextual variants)

| ID | Source sign / context | Relative realization | Rhythm | Confidence and notes |
| --- | --- | --- | --- | --- |
| `H18-F7-A` | Upper excerpt, first two-small-note sign plus equality | Rising slide `-2,-1,0` | Two grace notes realized as a rapid beamed approach | High |
| `H18-F7-B` | Upper excerpt, second placement | Same family in a descending/local transposition; preserve source direction | Rapid beamed approach into tied principal | Medium-high |
| `H18-F7-C` | Lower excerpt, wider/longer rising sign plus equality | Extended rising slide, approximately `-3,-2,-1,0` | Three rapid notes into a sustained principal | Medium; exact starting degree uncertain |

## Ambiguities requiring treatise-level checking

1. **Appoggiatura pitch direction in clefless excerpts.** Marpurg F1 and several C. P. E. Bach/Hummel contextual placements are visually clear as adjacent appoggiaturas, but the cropped chart suppresses the clef. Encode the actual staff positions from the image first; attach `+1/-1` only after checking the original treatise example.
2. **Quantz half-trill onsets.** `Q13-F2-D/E` clearly differ in length, but the first notehead is partially hidden by the grace stem/slur. The main-start versus upper-start choice remains open.
3. **Combined turn formulas.** The prallender and geschnellter Doppelschlag contours in C. P. E. Bach and Türk are classified confidently, but the exact first auxiliary of `CPE14-F4-E` and `T17-F4-E` needs source verification.
4. **Marpurg's seven trill glyphs.** All seven shapes are visually distinct and inventoried. Their exact semantic decomposition into start sign, continuation, and termination should be derived from Marpurg's explanation rather than guessed from modern SMuFL names.
5. **Leopold Mozart's Zirkel.** The eight-note count is explicit, but the exact relative-degree sequence in the compressed scan is not secure. This is the most important pitch-level ambiguity in rows 13-18.
6. **Leopold Mozart's Anschlag.** Examples 2 and 3 include chordal/double-note attacks. A monophonic relative-degree formula would erase information; the digital model must allow simultaneous grace notes.
7. **Flatté.** Marpurg's two Flatté examples are clearly separate but the diagonal stroke covers the starting notehead. Preserve a facsimile crop or treatise citation until the pitches are checked.
8. **Battement versus Schneller.** Historical terminology and onset conventions vary by source. The inventory records what is visibly printed; do not normalize all of these to one modern mordent glyph without retaining the source term/sign.
9. **Beam counts.** The scan often distinguishes short versus long diminution but not 32nd versus 64th beams reliably. MEI should encode the visible count only after inspecting a higher-quality source reproduction.
10. **Variant count semantics.** The 156 slots include contextual placements and alternate glyph spellings. They may map to fewer reusable pitch formulas, but every slot should remain addressable by its source ID and variant ID.

## Suggested data-model implications

- Separate `sourceSign` from `normalizedFormula`; one formula can have several historical glyphs.
- Allow `occurrences` inside a variant so a continuous source excerpt can preserve several placements without pretending they are independent treatise entries.
- Support `simultaneousGraceNotes` for Leopold Mozart's Anschlag.
- Store `pitchConfidence`, `rhythmConfidence`, and a free-text `uncertainty` independently.
- Preserve `tempoQualifier` for the C. P. E. Bach and Türk turn/trill variants.
- Allow `formula: null` for sign-only or unreadable variants; a facsimile/source crop is preferable to an invented transcription.
- Keep the empty cells explicit. Empty means the comparison chart supplies no example for that source/family, not that the author never discussed the ornament.
