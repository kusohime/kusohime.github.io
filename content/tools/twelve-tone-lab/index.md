---
title: "Twelve-Tone Row Lab"
subtitle: "Matrix, row forms, invariants, combinatoriality"
number: 8
group: "Sets & Series"
summary: "The 12×12 matrix with P/I/R/RI lookup, all-interval detection, hexachordal combinatoriality, and a shelf of historical rows."
status: "stable"
slug: "twelve-tone-lab"
---

## How to use it

Enter twelve distinct pitch classes (integers with `T`/`E`, or note
names), or load one of the historical rows. The lab validates the row
(eleven entries or a duplicated pc is an error, not a warning), prints
the ordered interval string, flags all-interval rows, and builds the
standard matrix: rows are P forms read left-to-right, columns are I forms
read top-down, retrogrades read the other way — the labels on all four
edges follow this convention.

Select any form (P/I/R/RI at any index) to spell it in pcs and note
names, and audition it from middle C. The combinatoriality panel lists
every form whose first hexachord completes the aggregate against P's
first hexachord — Babbitt's criterion for clean aggregate polyphony.

## Conventions

Form labels use the *starting pitch class*: P4 begins on pc 4, I9 begins
on pc 9 (the convention of Straus's textbook; analysts trained on
zero-centered labels should translate accordingly — the matrix itself is
identical). The interval string lists ordered pc intervals 1–11.

## Design notes

I resisted the proposal's "play the matrix" feature: a matrix is a
reference table, not a piece. Audition is per-form against a neutral
pulse, which is how one actually checks a row's melodic profile. The
historical rows are fixtures as much as conveniences — the Berg must
report all-interval, the Webern must show its derived combinatorial
structure, and the test suite holds the lab to both.

## Repertoire

Schoenberg op. 25 (the first fully serial suite), Berg's *Lyric Suite*
(all-interval row, included), Webern's Concerto op. 24 (derived row built
from [014] trichords — look at its interval string and combinatorial
forms), Dallapiccola's *Quaderno musicale di Annalibera* as the lyric
Italian branch, and Babbitt — whose *Three Compositions for Piano* (1947)
made hexachordal combinatoriality a system — with Boulez and Stravinsky's
late works rounding out the lab's natural users.

## References

- Babbitt, M. (1955). "Some Aspects of Twelve-Tone Composition." *The Score* 12, 53–61.
- Babbitt, M. (1960). "Twelve-Tone Invariants as Compositional Determinants." *Musical Quarterly* 46(2), 246–259.
- Straus, J. N. (2016). *Introduction to Post-Tonal Theory* (4th ed.). Norton.
- Morris, R. (1987). *Composition with Pitch-Classes*. Yale University Press.
- Whittall, A. (2008). *The Cambridge Introduction to Serialism*. Cambridge University Press.
