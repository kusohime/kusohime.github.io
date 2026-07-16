# Ornament inventory: PDF rows 07-12

## Scope and reading conventions

This inventory covers every populated cell and every visible alternative in rows 07-12 of `die wesentlichen manieren (ornamente in der musik).pdf`, using the 400 dpi full-page render and `wesentliche-bands/rows-07-12.png`. The seven families are the table's printed headings:

1. `VORSCHLAG`
2. `TRILLER`
3. `TRILLERVARIANTEN`
4. `DOPPELSCHLAG`
5. `MORDENT`
6. `MORDENT MIT VORHALT / SCHNELLER, BATTEMENT`
7. `SCHLEIFER`

Pitch normalization:

- `M` = principal (main) note.
- `U1` / `L1` = diatonic upper / lower neighbor.
- `U2` / `L2` = two diatonic steps above / below.
- `ctx` = contextual note not confidently part of the ornament.
- Parentheses and `xN` indicate repeated oscillation, for example `(U1,M)x4`.
- A question mark inside a sequence marks a locally uncertain pitch.

Rhythm is described from visible stems, beams, dots, rests, ties, and slurs. The sheet often suppresses clefs and meter, so absolute pitch and exact metrical values should not be inferred from this inventory alone. `H`, `M`, and `L` mean high, medium, and low confidence in the normalized pitch reading; sign descriptions are normally higher-confidence than pitches.

## Coverage count

- 52 printed term labels.
- 7 additional populated Gottlieb Muffat family groups with no term printed in the term column.
- 59 populated term/group records in total.
- 76 distinct written-out realization passages or contextual realization panels when alternatives within a cell are counted separately.
- 10 further graphical sign alternatives share one of those realizations (8 in Bach, 2 in Muffat family 6).
- 1 sign-only record has no realization on the sheet: Hotteterre's `Tremblement`.
- Therefore the website should expose 87 visible variants if every alternate glyph is shown independently: 76 realization-bearing variants + 10 extra sign-only graphical alternatives sharing a realization + 1 sign with no realization.

The count treats a repeated contextual panel separated by a double bar or a visibly distinct `oder` alternative as a variant. It does not split every single occurrence of the same sign inside one continuous demonstration passage.

---

## Row 07 - Henry Purcell

Source printed on the sheet: **Henry Purcell** (1659-1695), *Lessons for the Harpsichord or Spinet (Rules for Graces)*, London 1696.

### Family 1 - Vorschlag

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r07-f01-a` | Fore-fall | Main-note stem with a short diagonal stroke rising to the right above it. | `L1 -> M` | A short lower auxiliary joined to the principal; the principal appears lengthened/dotted. | H contour; M exact duration. |
| `r07-f01-b` | Back-fall | Main-note stem with a short diagonal stroke falling to the right. | `U1 -> M` | A short upper auxiliary joined to the principal; the principal appears lengthened/dotted. | H contour; M exact duration. |

### Family 2 - Triller

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r07-f02-a` | Shake | Two short parallel diagonal strokes above the principal. | `(U1,M)x4`, ending on `M` | One compact, three-beam rapid group (about eight equal notes), then release/sustain. | H alternation; M exact note count (the scan supports about eight). |
| `r07-f02-b` | Plain note and shake | Falling stroke plus the two-stroke shake sign over a stemmed note. | `M` held, then approximately `(U1,M)x2` | Sustained/tied plain principal followed by a four-note rapid shake under a long slur/tie. | H concept; M exact alternation count. |

### Family 3 - Trillervarianten

Blank in this row.

### Family 4 - Doppelschlag

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r07-f04-a` | Turn | Curved cap/arc above a main-note stem. | `U1,M,L1,M` | Four rapid notes under a slur, followed by a sustained/released principal. | H. |
| `r07-f04-b` | Shake turned | Three short slant strokes above a main-note stem. | Approximately `(U1,M)x3,L1,M` | Longer rapid shake group followed by a two-note turn termination, all slurred. | M; the terminal lower-neighbor return is clear, exact number of pre-terminal alternations is less certain. |

### Family 5 - Mordent

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r07-f05-a` | Beat | Short horizontal wavy line over a main-note stem. | `M,L1,M` | Three quick notes under a slur, last note sustained. | H. |

### Family 6 - Mordent mit Vorhalt / Schneller, Battement

Blank in this row.

### Family 7 - Schleifer

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r07-f07-a` | Slur | Tall stem crossed by a small loop/diagonal knot. | Likely `L2,L1,M` | Two short rising notes beamed into a longer arrival, under a slur. | M contour; the scan clearly shows a three-note rising fill, but the exact starting interval is not labeled by a clef. |

Purcell total: **8 realization-bearing variants**.

---

## Row 08 - Jacques Martin Hotteterre "Le Romain"

Source printed on the sheet: **Jacques Martin Hotteterre "Le Romain"** (circa 1680-1761), *Premier livre de pièces pour la flûte traversière et autres instruments avec la basse, oeuvre 2*, Paris 1708.

### Family 1 - Vorschlag

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r08-f01-a` | Port de voix | Small downward-pointing `v` over an open main note. | `L1 -> M` | Lower appoggiatura resolving upward into the principal; shown in context with a following rest. | H. |
| `r08-f01-b` | Coulement | Small upward-pointing caret over a filled main note. | `U1 -> M` | Upper appoggiatura resolving downward into the principal; shown in context with a following rest. | H. |
| `r08-f01-c` | Accent | Diagonal stroke above a dotted/stemmed main note. | Probably `M` held -> `U1` short -> `M` | Delayed after-note gesture at the end of a held/dotted note, under a curved tie/slur. | L-M: the after-note is visible, but its exact return and duration are hard to separate from the staff in this scan. Preserve a crop for editorial checking. |

### Family 2 - Triller

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r08-f02-a` | Tremblement | Plus sign above a main-note stem. | Not supplied on the sheet. | Sign only; the realization staff area is blank. | H sign; realization must not be invented. |
| `r08-f02-b` | Demie Cadence apuiée | Caret stacked above a plus sign over the main note. | Likely `U1 -> M` | Two short, beamed/slurred notes followed by a rest; the first is the supported/appoggiatura note. | M-H. |

### Family 3 - Trillervarianten

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r08-f03-a` | Double cadence | Wavy turn-like stroke stacked above a plus sign. | Probably `U1,M,L1,M` | Compact slurred four-note turn/cadential figure. | M: contour fits the visible note levels and the term; exact first note should be checked against Hotteterre. |
| `r08-f03-b` | Double cadence coupée | Plus sign with a small curled/rightward tail. | Same core contour as the double cadence, probably `U1,M,L1,M`, but cut off | A compact figure bounded by rests / detached termination rather than a continuous release. | M contour; H that the articulation is explicitly "cut" and graphically separated. |
| `r08-f03-c` | Tour de chant | A lower-note `v`/port-de-voix sign combined with a plus over the following note. | Likely `L1,M,U1,M,L1,M` | Lower appoggiatura into a cadential turn/trill, displayed inside a short phrase with rests. | L-M exact sequence; preserve the full contextual panel. |

### Family 4 - Doppelschlag

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r08-f04-a` | Tour de gosier | Small horizontal turn-like `~`. | `U1,M,L1,M` | Four rapid notes under a slur after a contextual lead-in. | H contour; M exact note values. |

### Family 5 - Mordent

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r08-f05-a` | Battement | Roman-capital-like `I` above a main-note stem. | `M,L1,M` | Principal, rapid lower neighbor, return; last principal sustained. | H. |

### Family 6 - Mordent mit Vorhalt / Schneller, Battement

Blank in this row.

### Family 7 - Schleifer

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r08-f07-a` | Port de voix double | Two noteheads joined by a rising diagonal stroke. | Probably `L1,M,L1,M` | A lower appoggiatura followed by a short lower-neighbor beat, ending on the principal. | M; the four-stage reading matches the visible beamed realization and conventional compound form, but verify from the 1708 source. |

Hotteterre total: **11 variants: 10 with realizations and 1 sign-only**.

---

## Row 09 - François Couperin

Source printed on the sheet: **François Couperin** (1668-1733), *Pièces de Clavecin, Livre I*, Paris 1713.

### Family 1 - Vorschlag

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r09-f01-a` | Port de voix coulé | Two opposed grace-like hooked stems joined by an over-bracket/slur. | `L1 -> M`, within a longer stepwise context | The final approach is shown as an evenly beamed/slurred pair; preceding quarter-note context is part of the demonstration. | M-H contour; exact segmentation from the preceding phrase should be retained in a source-faithful view. |

### Family 2 - Triller

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r09-f02-a` | Tremblement continu | `tr` followed by a long wavy extension. | `(U1,M)` repeated continuously | Two long groups of equal rapid notes across the full written duration; no break between groups. | H. |
| `r09-f02-b` | Tremblement détaché | Two tall opposed hooked stems joined by an arch. | Approximately `(U1,M)x3`, beginning with a separately attacked upper note | Rapid oscillation after a detached/articulated onset; first of the two lower contextual panels. | M contour; H that articulation, not pitch content, is the defining distinction. |
| `r09-f02-c` | Tremblement lié sans être appuyé | Short wavy line over a stemmed note. | Approximately `(U1,M)x3` | Slurred-in, unaccented trill in the second contextual panel; rapid group lies under a long slur. | M contour/count; H slurred/unaccented distinction. |

### Family 3 - Trillervarianten

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r09-f03-a` | Tremblement ouvert | Short wavy line over the ornamented note. | Upper-neighbor trill `(U1,M)xN`, with an open/non-closing release toward the following context | The written panel has a short rapid termination and a rest; it does not close identically to the lower example. | L-M exact terminal pitch; the open-vs-closed distinction is clear, but the scan is not sufficient for a confident terminal degree. |
| `r09-f03-b` | Tremblement fermé | Short wavy line over the ornamented note. | Upper-neighbor trill `(U1,M)xN`, closing on `M` before the following rest/context | Compact rapid termination, visually closed back onto the principal. | M. |

### Family 4 - Doppelschlag

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r09-f04-a` | Doublé | Small horizontal turn sign over a main-note stem. | `U1,M,L1,M` | Four rapid notes under a slur between contextual notes. | H. |

### Family 5 - Mordent

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r09-f05-a` | Pincé simple | Fork/vertical-mordent sign above the main note. | `M,L1,M` | Three rapid notes under a short slur; last principal sustained. | H. |
| `r09-f05-b` | Pincé double | Same fork-like sign. | `M,L1,M,L1,M` | Five equal rapid notes under a longer slur; last principal sustained. | H. |
| `r09-f05-c` | Pincé continu | Fork sign followed by a long wavy extension. | `(M,L1)xN`, ending on `M` | Continuous, evenly repeated lower-neighbor oscillation across two beamed groups. | H. |

### Family 6 - Mordent mit Vorhalt / Schneller, Battement

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r09-f06-a` | Port de voix simple | Lower appoggiatura/hook leading into the fork-like pincé sign. | `L1,M,L1,M` | Lower appoggiatura followed by a single lower-neighbor beat. | M-H. |
| `r09-f06-b` | Port de voix double | Same compound sign. | `L1,M,L1,M,L1,M` | Lower appoggiatura followed by a double/extended pincé, shown as a longer equal rapid group. | M-H. |

### Family 7 - Schleifer

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r09-f07-a` | Tierce coulée en montant | Tall stem crossed by an upward-slanting short stroke. | `L2,L1,M` | The middle degree fills an ascending third; the last two notes appear beamed/slurred into the arrival. | H contour. |
| `r09-f07-b` | Tierce coulée en descendant | Tall stem crossed by a downward-slanting short stroke. | `U2,U1,M` | The middle degree fills a descending third; last two notes beamed/slurred into the arrival. | H contour. |

Couperin total: **14 realization-bearing variants**.

---

## Row 10 - Johann Sebastian Bach

Source printed on the sheet: **Johann Sebastian Bach** (1685-1750), *Clavierbüchlein für Wilhelm Friedemann Bach*, Köthen 1720.

The sheet reproduces multiple graphic spellings of several signs. They must remain separate visual variants even when they share one realization.

### Family 1 - Vorschlag

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r10-f01-a1` | Accent fallend | Left-facing `c`/hook attached to the note stem. | `U1 -> M` | Two beamed notes under a slur, descending into the principal. | H. Shares realization with `a2`. |
| `r10-f01-a2` | Accent fallend | Oval/diagonal falling stroke attached to the notehead/stem. | Same `U1 -> M` realization as `a1`. | Same. | H graphical alternative. |
| `r10-f01-b1` | Accent steigend | Left-facing `c`/hook attached to the stem. | `L1 -> M` | Two beamed notes under a slur, ascending into the principal. | H. Shares realization with `b2`. |
| `r10-f01-b2` | Accent steigend | Rising double-stroke/oval mark attached to the notehead/stem. | Same `L1 -> M` realization as `b1`. | Same. | H graphical alternative. |

### Family 2 - Triller

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r10-f02-a1` | Trillo | Short horizontal wavy line. | `(U1,M)x3` | Six equal rapid notes (three-beam group), with final principal lengthened/dotted in the chart transcription. | H sequence; shares realization with `a2/a3`. |
| `r10-f02-a2` | Trillo | Slightly longer/reversed wavy line. | Same as `a1`. | Same. | H graphical alternative. |
| `r10-f02-a3` | Trillo | Wavy line with a pronounced descending initial hook. | Same as `a1`. | Same. | H graphical alternative. |
| `r10-f02-b1` | Accent und Trillo | Composite accent hook plus wavy trill, upper/falling orientation. | `U1` (accented/lengthened) -> `M`, then approximately `(U1,M)x2` | The accent onset is longer than the following rapid trill notes. | M-H; first of two direction/context realizations. |
| `r10-f02-b2` | Accent und Trillo | Composite sign with a pronounced descending-left hook before the wavy trill. | `L1` (accented/lengthened) -> `M`, then approximately `(U1,M)x2` | Lower/rising accent onset followed by a rapid upper-neighbor trill. | M-H; second direction variant. |

### Family 3 - Trillervarianten

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r10-f03-a1` | Doppelt-Cadence | Wavy line with an upper/left opening hook. | Likely `U1,M,L1,M,(U1,M)x2` | One continuous equal rapid group, beginning with a four-note turn and continuing as a trill. | M; upper-start variant. |
| `r10-f03-a2` | Doppelt-Cadence | Wavy line with a lower/left opening hook. | Likely `L1,M,U1,M,(U1,M)x2` | Same rapid grouping, lower-start mirror. | M; lower-start variant. |
| `r10-f03-b1` | Doppelt-Cadence und Mordant | Upper-start double-cadence sign ending with a vertical mordent stroke. | `U1,M,L1,M,(U1,M)x2,L1,M` | Continuous equal rapid group; lower-neighbor mordent appended to the double cadence. | M. |
| `r10-f03-b2` | Doppelt-Cadence und Mordant | Lower-start mirror sign ending with a vertical mordent stroke. | `L1,M,U1,M,(U1,M)x2,L1,M` | Longer equal rapid group; same mordent termination. | M. |

### Family 4 - Doppelschlag

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r10-f04-a1` | Cadence | Vertical turned-S / question-mark-like sign over the principal. | `U1,M,L1,M` | Four equal rapid notes (three-beam group). | H. Shares realization with `a2`. |
| `r10-f04-a2` | Cadence | More horizontal turn-shaped form over the principal. | Same `U1,M,L1,M`. | Same. | H graphical alternative. |

### Family 5 - Mordent

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r10-f05-a1` | Mordant | Vertical/fork-like mordent sign. | `M,L1,M` | Two short notes plus a lengthened/dotted final principal. | H. Shares realization with `a2`. |
| `r10-f05-a2` | Mordant | Horizontal wavy sign crossed by a vertical stroke. | Same `M,L1,M`. | Same. | H graphical alternative. |
| `r10-f05-b1` | Trillo und Mordant | Upper-start wavy trill ending in a vertical mordent stroke. | Approximately `(U1,M)x3,L1,M` | One continuous rapid group with lower-neighbor termination. | H contour; M exact number of pre-terminal alternations. Shares realization with `b2`. |
| `r10-f05-b2` | Trillo und Mordant | Lower/left-hooked wavy form ending in the same vertical stroke. | Same realization as `b1`. | Same. | H graphical alternative. |

### Family 6 - Mordent mit Vorhalt / Schneller, Battement

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r10-f06-a1` | Accent und Mordant | Accent hook combined with a crossed wavy mordent. | Probably `U1,M,L1,M` | Accented/appoggiatura onset followed by a three-note lower mordent; the last principal is sustained. | M. Shares realization with `a2`. |
| `r10-f06-a2` | Accent und Mordant | Alternate orientation of the accent hook attached to the same crossed-wavy mordent. | Same realization as `a1`. | Same. | H graphical alternative; M pitch sequence. |

### Family 7 - Schleifer

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r10-f07-a` | Schleifer | Short wavy line with an upward-curving right tail. | `L2,L1,M` | Three rising notes; first two are short/rapid and the arrival is longer. | H contour. |

Bach total: **14 distinct realizations and 22 separately visible sign forms**. The eight excess sign forms are graphical alternatives sharing a realization and should not be discarded.

---

## Row 11 - Gottlieb (Theophil) Muffat

Source printed on the sheet: **Gottlieb (Theophil) Muffat** (1690-1770), *Componimenti Musicali per il Cembalo*, Vienna 1727.

Important: the table's term column is blank in all seven Muffat family cells. The source presents signs and examples without printed names here. Do not invent historical term labels; use neutral website labels such as `Muffat Vorschlag variant A` and preserve the source family assignment.

### Family 1 - Vorschlag

The sign column has two rows of three forms. The realization area gives two long contextual lines with several marked occurrences rather than six clean, isolated `sign = realization` pairs. Every sign should be shown, but exact slicing must be checked against the original Muffat page.

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r11-f01-a` | [none] | Upper-row form 1: small flagged auxiliary attached immediately before/above a main stem. | Stepwise appoggiatura into `M`; direction is probably from `U1`. | Short auxiliary resolving into a longer note inside the upper contextual line. | L-M pitch; H that the sign exists as a distinct form. |
| `r11-f01-b` | [none] | Upper-row form 2: main stem with an oblique rising stroke to the right. | Stepwise approach into or away from `M`; likely `L1 -> M`. | Two-note slurred/appoggiatura gesture in the upper context. | L pitch/direction. |
| `r11-f01-c` | [none] | Upper-row form 3: oblique falling stroke joining a main stem to a lower following note. | Clearly descending stepwise gesture, approximately `U1 -> M` or `M -> L1` depending normalization. | Two-note fall under a slur, embedded in the upper context. | M contour, L principal assignment. |
| `r11-f01-d` | [none] | Lower-row form 1: small flagged note immediately left of a main stem/note. | Stepwise lower approach into `M`, likely `L1 -> M`. | Short pre-note into a longer principal in the lower contextual line. | M. |
| `r11-f01-e` | [none] | Lower-row form 2: main stem with a rising oblique stroke. | Rising stepwise approach or release around `M`. | Two-note slurred gesture in the lower context. | L pitch assignment. |
| `r11-f01-f` | [none] | Lower-row form 3: plain/short main-stem form paired with the preceding oblique form in the printed sign cluster. | Context shows another stepwise appoggiatura/resolution in the lower voice. | Embedded in a polyphonic/chordal example rather than isolated. | L. Keep the complete lower contextual line until source verification allows segmentation. |

### Family 2 - Triller

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r11-f02-a` | [none] | Lowercase `t` above the principal. | `(U1,M)x3`, ending on `M` | Compact rapid group under a long slur after a sustained onset. | M-H. |
| `r11-f02-b` | [none] | Composite: `t` plus small-note/main-note figures in the sign column. | Upper or lower appoggiatura into a trill; approximately `U1` held -> `M,(U1,M)x2` | Long supported onset followed by a rapid alternation. | M contour; exact appoggiatura direction should be source-checked. |
| `r11-f02-c` | [none] | `t` with a curved-underlined form beside a main-note stem. | Repeated neighbor oscillation around `M`, possibly lower-neighbor `(M,L1)x4` | Long, even rapid group under an under-slur/tie after a sustained attack. | L-M; direction of the neighbor is not fully secure in the table scan. |

### Family 3 - Trillervarianten

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r11-f03-a` | [none] | `tw` ligature. | Cadential/trill figure, approximately `U1,M,U1,M,L1,M` | Rapid equal group under a broad slur, closing on a longer principal. | L-M exact order. |
| `r11-f03-b` | [none] | Same `tw` ligature in a second context. | Trill with turned/lower-neighbor termination around `M`. | Longer rapid group, under-slurred, with a clearly different terminal contour from `a`. | L exact order; retain full panel. |
| `r11-f03-c` | [none] | Two wavy strokes, one with an initial/lower hook, paired with a note-stem sign. | Lower-start double-cadence-like figure, likely `L1,M,U1,M,L1,M`. | One dense equal rapid group under a slur. | M contour family, L exact count. |
| `r11-f03-d` | [none] | Wavy sign with upward-curved tail paired with a second note-stem form. | Upper-neighbor trill/cadence with extended alternation and closing return to `M`. | Longest dense equal-note group of this Muffat cell, under a broad slur. | L-M exact sequence/count. |

### Family 4 - Doppelschlag

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r11-f04-a` | [none] | Small horizontal `~` turn sign. | `U1,M,L1,M` | Compact four-note rapid turn under a slur. | H contour. |
| `r11-f04-b` | [none] | Same sign in a prepared melodic context. | Contextual approach -> `U1,M,L1,M` -> following `M/ctx` | Turn is embedded after two preparatory notes; four rapid notes under a long slur. | M-H. |

### Family 5 - Mordent

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r11-f05-a` | [none] | Fork/vertical-mordent sign. | `M,L1,M` | Short three-note lower mordent under a slur. | H. |
| `r11-f05-b` | [none] | Same sign in a longer form. | `M,L1,M,L1,M` | Five-note/double lower mordent under a longer slur. | H contour; M exact note count. |

### Family 6 - Mordent mit Vorhalt / Schneller, Battement

This cell prints two compound source configurations. Each is shown twice on the source side with `oder` ("or") - the ornament sign may be attached to the small appoggiatura or to the principal - but the two placements share one realization.

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r11-f06-a1` | [none] | Upper compound: small upper appoggiatura with mordent sign placed on the small note. | Probably `U1,M,L1,M` | Appoggiatura followed immediately by a short lower mordent, under a slur. | M. Shares realization with `a2`. |
| `r11-f06-a2` | [none] | Upper compound `oder`: same melodic source, mordent sign moved to the principal note. | Same as `a1`. | Same. | H as a distinct sign-placement alternative; M pitches. |
| `r11-f06-b1` | [none] | Lower compound: oblique rising approach into a principal, mordent sign on the approach/small note. | Probably `L1,M,L1,M,L1,M` | Rising appoggiatura/slide followed by a longer or double mordent. | L-M exact count. Shares realization with `b2`. |
| `r11-f06-b2` | [none] | Lower compound `oder`: same source contour, sign moved to the principal. | Same as `b1`. | Same. | H sign-placement alternative; L-M exact count. |

### Family 7 - Schleifer

| ID | Printed term | Sign variant | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r11-f07-a` | [none] | Tall stem crossed by a short oblique/looped stroke. | `L2,L1,M` | Two short rising notes into a longer arrival, under a slur. | M-H. |
| `r11-f07-b` | [none] | Oblique beam-like stroke with two small dots above a stemmed note. | Rising three-step fill into `M`, likely `L2,L1,M`; one auxiliary may be chromatically altered. | Longer beamed rising figure under a slur, in a second register/context. | M contour; L accidental and exact number of preparatory notes. |

Muffat total: **23 separately visible variants**, corresponding to **21 distinct realization/context panels** because the four `oder` placements in family 6 share two realizations.

---

## Row 12 - Jean Philippe Rameau

Source printed on the sheet: **Jean Philippe Rameau** (1683-1764), *Pièces de Clavecin, 2e livre*, Paris 1731.

### Family 1 - Vorschlag

| ID | Printed term | Sign / context | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r12-f01-a` | Port de voix | Small lower-hook/appoggiatura form attached before a main stem. | `L1 -> M` | Lower appoggiatura in context; the realization is a short beamed/slurred approach into the principal. | H contour; M exact duration. |
| `r12-f01-b1` | Coulez | Oblique rising line joining two contextual noteheads, first placement. | Ascending filled third, likely `L2,L1,M` | Passing middle degree is inserted as a short beamed note into the arrival. | M-H. |
| `r12-f01-b2` | Coulez | Same oblique joined-note sign repeated after the internal double bar in a second context/register. | Same ascending stepwise fill, transposed/contextualized. | Same passing-note realization in a second placement. | M-H. This second panel is visibly separate and should not be dropped. |

### Family 2 - Triller

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r12-f02-a` | Cadence | Short horizontal wavy line. | `(U1,M)x4`, ending on `M` | Even rapid group of about eight notes after the principal/source sign. | H alternation; M exact count. |
| `r12-f02-b` | Cadence appuyée | Wavy line with a pronounced descending initial hook. | `U1` held/supported, then approximately `(M,U1)x3`, ending on `M` | Long appoggiatura/support note followed by rapid equal trill notes. | M-H. |

### Family 3 - Trillervarianten

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r12-f03-a` | Double Cadence | Wavy line with an upward-curved terminal hook. | Likely `U1,M,L1,M,(U1,M)x2` | Continuous rapid equal-note group combining turn and trill. | M exact order/count. |

### Family 4 - Doppelschlag

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r12-f04-a` | Double | Small horizontal `~` turn sign. | `U1,M,L1,M` | Compact four-note rapid turn between contextual notes. | H. |

### Family 5 - Mordent

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r12-f05-a` | Pincé | Main-note stem with a small right-facing curled mark (`p`-like). | `(M,L1)x4`, ending on `M` | Extended rapid lower-neighbor pincé, about eight notes in one dense beamed group. | M-H; exact count from scan is about eight. |

### Family 6 - Mordent mit Vorhalt / Schneller, Battement

| ID | Printed term | Sign | Written-out pitch contour | Rhythm / articulation | Confidence and cautions |
|---|---|---|---|---|---|
| `r12-f06-a` | Pincé et port de voix | Pincé stem/sign enclosed by small parentheses/hooks. | Likely `L1,M,(L1,M)x3` | Lower appoggiatura followed by an extended rapid lower-neighbor pincé. | M; preserve the contextual lead-in and full rapid group. |

### Family 7 - Schleifer

Blank in this row.

Rameau total: **9 realization-bearing variants** (the `Coulez` is shown in two separate contexts).

---

## Ambiguities that need source-level verification before diplomatic MEI encoding

1. **Muffat family 1 (`r11-f01-a` through `f`)**: the sign column clearly has six forms, but the two long realization lines do not permit a safe one-to-one crop assignment from this comparative sheet alone. Show the whole line or consult Muffat's 1727 table before encoding isolated pitches.
2. **Muffat families 2 and 3**: the trill direction and exact rapid-note counts are partially obscured by dense beams. Their contours are categorized, but a diplomatic sequence needs the original source page.
3. **Muffat family 6**: four source-side `oder` placements share two realizations. The website data model must allow multiple signs to reference one realization rather than duplicating or silently merging them.
4. **Hotteterre `Tremblement` (`r08-f02-a`)**: the sheet supplies no realization. Render the sign and mark the realization as unavailable; do not synthesize a generic trill.
5. **Hotteterre `Accent` and `Tour de chant`**: the source-context contours are readable only at medium/low confidence in this scan; verify against the 1708 edition.
6. **Couperin `Tremblement ouvert` / `fermé`**: their difference is visible as release/closure and articulation, but the exact terminal pitch needs the original 1713 ornament table.
7. **Bach compound cadences**: the table supports the upper-start/lower-start distinction and appended mordent, but exact alternation counts should be verified against the autograph/typeset witness already being used by the main implementation.
8. **Rameau `Coulez`**: the comparative sheet displays the same named sign in two separate contexts. Keep both panels; verify whether both are ascending or whether the second is a register/transposition alternative.
9. **No clefs/meters in most isolated examples**: relative-degree encodings are appropriate for the first-pass index. Absolute pitches should only be assigned from each original source, not from staff position in this comparative sheet.

## Implementation implications

- The data model needs `termGroup`, `variantId`, `signVariant`, `sharesRealizationWith`, `realizationContext`, `pitchConfidence`, and `rhythmConfidence`; a single `{term, sign, realization}` record is insufficient.
- Preserve blank-vs-unknown: a blank source cell is not an unprocessed cell, and Hotteterre's sign-only Tremblement is not a missing transcription.
- Keep diplomatic source graphics/facsimile crops available alongside normalized MEI. Several Muffat signs do not have a safe one-glyph SMuFL mapping.
- For compound signs, encode semantic components (appoggiatura/accent + trill/mordent) as well as the source glyph description.
- Search should index printed spelling and normalized family but should never replace the printed label. Muffat must remain `[no printed term]` unless an independently cited source supplies one.
