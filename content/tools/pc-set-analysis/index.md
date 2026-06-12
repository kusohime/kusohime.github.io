---
title: "Pitch-Class Set Analyzer"
subtitle: "Normal order, prime form, Forte class, interval vector"
number: 7
group: "Sets & Series"
summary: "Full set-class identification with Z-relations and complements, on a clockface, with the catalogue computed rather than trusted."
status: "stable"
slug: "pc-set-analysis"
---

## How to use it

Enter pitch classes as integers (`0 1 4 6`, with `T`/`E` for 10/11) or as
note names without octaves (`C E G`). The analyzer returns normal order,
prime form, Forte class, interval vector, the Z-partner where one exists,
and the complement's class. The clockface draws the set as a polygon —
inversional symmetry and interval saturation are visible at a glance in a
way no list of digits provides. Audition the set as a chord or as an
ascending succession from middle C.

## Conventions

Prime forms follow **Rahn's** packing-from-the-right algorithm, the one
implemented by most software (music21 included). For five set classes
(5-20 among them) Forte's own table differs by one rotation; where you
see a discrepancy with the appendix of *The Structure of Atonal Music*,
this is why, and both spellings name the same class. Forte numbers for
cardinalities 7–9 follow the complement-ordinal convention (the
complement of 4-Z15 is 8-Z15).

A technical note worth trusting: the catalogue here is not typed in from
a book. All 4,096 subsets of the aggregate are enumerated and classified
at load time; the hand-entered table contributes only Forte's *labels*
(verified against the published lists), and the test suite checks the
class counts (12/29/38/50), the idempotence of every prime form, and the
interval-vector identity of every Z-pair. Microtonal input is rejected
rather than silently rounded — set-class theory is a 12-EDO instrument.

## Design notes

Subset/superset browsing from the proposal was cut: the complete lattice
is large, rarely consulted in practice, and better served by Straus's
tables when needed. What remained is what gets used at the piano:
"what is this collection, what is it related to, does it have a twin."

## Repertoire

The analytical canon: Forte on Webern and Stravinsky, Perle's
*Serial Composition and Atonality* on the Second Viennese School. As a
compositional instrument: Carter's harmony book practice (his "Link"
chords are all-interval twelve-note chords anchored by the same vectors),
Babbitt and Wuorinen as a matter of course, and any composer auditing
their own harmonic vocabulary — the honest use case this page expects.

## References

- Forte, A. (1973). *The Structure of Atonal Music*. Yale University Press.
- Rahn, J. (1980). *Basic Atonal Theory*. Longman.
- Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton.
- Perle, G. (1991). *Serial Composition and Atonality* (6th ed.). University of California Press.
- Carter, E. (2002). *Harmony Book*, ed. N. Hopkins & J. F. Link. Carl Fischer.
