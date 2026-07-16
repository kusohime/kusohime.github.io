# Essential Ornaments inventory audit

Audit date: 2026-07-15

This audit inventories the complete comparative grid in the supplied scan of
Liselotte Brändle's *Die "Wesentlichen Manieren" (Ornamente in der Musik)*.
It is a completeness record for the website implementation, not a substitute
for checking each historical treatise.

## Coverage

- 18 source rows
- 7 ornament-family columns
- 126 total grid cells
- 106 populated cells displayed as full-cell facsimile witnesses in the online index
- 20 explicitly blank cells
- 306 separately countable signs, realizations, alternative glyphs, or
  contextual placements within the populated cells

The variant count is an audit count. A repeated sign in a distinct context, an
`oder` alternative, a tempo-specific realization, or a different historical
glyph spelling is counted separately even when it may eventually share one
normalized pitch formula. All 306 items now have stable IDs and searchable
diplomatic descriptions grouped under the 106 source-family cells. They are not
all independently engraved or treatise-verified: the facsimile remains the visual
notation witness until a source-verified MEI record is added.

| Source | Populated cells | Audited variant slots |
| --- | ---: | ---: |
| Tomás de Santa María | 3 | 11 |
| Girolamo Diruta | 5 | 7 |
| Michael Praetorius | 3 | 11 |
| John Playford | 6 | 11 |
| Jacques Champion de Chambonnières | 5 | 5 |
| Jean Henry d'Anglebert | 7 | 18 |
| Henry Purcell | 5 | 8 |
| Jacques Martin Hotteterre | 6 | 11 |
| François Couperin | 7 | 14 |
| Johann Sebastian Bach | 7 | 22 |
| Gottlieb Muffat | 7 | 23 |
| Jean-Philippe Rameau | 6 | 9 |
| Johann Joachim Quantz | 6 | 16 |
| Carl Philipp Emanuel Bach | 7 | 26 |
| Friedrich Wilhelm Marpurg | 7 | 33 |
| Leopold Mozart | 7 | 27 |
| Daniel Gottlob Türk | 7 | 32 |
| Johann Nepomuk Hummel | 5 | 22 |
| **Total** | **106** | **306** |

## Implementation rule

Every populated cell receives one lossless, full-cell PDF facsimile witness. This ensures
that dense exercises, multiple alternatives, sign-only examples, and ambiguous
historical glyphs remain visible without inventing pitches. Independently
verified MEI is a second layer and must never replace or silently simplify the
facsimile witness.

All 126 grid positions have generated assets so a source/family ordering error
cannot shift one crop into another cell. The build asserts the expected 106
populated records, and the integrity test asserts all 126 source-family assets.

## Known source-level ambiguities

- Santa María's *Quiebro* and *Reyterado* share one staff line in the chart.
- Several Diruta and Praetorius entries are continuous exercises rather than
  isolated ornament formulas.
- Playford's *Elevation* and *Cadent* share a continuous realization line.
- Hotteterre prints a *Tremblement* sign without a realization.
- Muffat supplies seven fully populated but unnamed family cells, with several
  signs sharing contextual realization panels.
- Bach, d'Anglebert, and Marpurg preserve multiple historical glyph spellings
  for formulas that modern notation often collapses into one sign.
- Leopold Mozart's *Anschlag* includes simultaneous grace notes and cannot be
  represented by a monophonic pitch array.
- Fine beam counts and some terminal pitches require higher-quality copies of
  the original treatises before diplomatic MEI encoding.

These cases remain visible in the PDF-witness layer and must be marked uncertain
in future structured transcriptions rather than normalized by guesswork.
