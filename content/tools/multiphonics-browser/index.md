---
title: "Multiphonics & Extended Techniques"
subtitle: "Woodwind technique browser"
number: 13
group: "Composition"
summary: "Filters technique entries by instrument and type. Every entry carries a source citation; unverified entries are flagged. The data set stays small until each entry is checked."
status: "data-pending"
slug: "multiphonics-browser"
hidden: true
references:
  - "Bartolozzi, B. (1967). *New Sounds for Woodwind*. Oxford University Press."
  - "Veale, P., & Mahnkopf, C.-S. (1994). *The Techniques of Oboe Playing*. Bärenreiter."
  - "Levine, C., & Mitropoulos-Bott, C. (2002). *The Techniques of Flute Playing*. Bärenreiter."
  - "Weiss, M., & Netti, G. (2010). *The Techniques of Saxophone Playing*. Bärenreiter."
  - "Bok, H. (2011). *New Techniques for the Bass Clarinet*. Shoepair Music."
  - "Dick, R. (1989). *The Other Flute* (2nd ed.). Multiple Breath Music."
  - "Roche, H. heatherroche.net (performer-verified clarinet catalogues)."
  - "Oakes, G. gregoryoakes.com/multiphonics (clarinet)."
---

Filter by instrument and technique, or search free text. Each card shows
written and sounding pitches, a fingering description, dynamics, a
stability gauge, response notes, and a source citation. Entries whose
pitch content has not yet been checked against the cited source carry an
UNVERIFIED badge and must not be copied into scores.

The catalogue is deliberately small. This is the one tool here where the
hard problem is not mathematics but data integrity: a wrong prime form
embarrasses the author, a wrong fingering wastes a rehearsal and erodes a
performer's trust in the composer. The browser therefore enforces the
schema (instrument, technique, and source are required; entries without
provenance are rejected by the validator and the test suite), ships with
a handful of clearly flagged placeholder entries pointing to where the
real data lives, and waits for verification.

The reliable public sources to verify against are Heather Roche's
performer-maintained clarinet catalogues (heatherroche.net), Gregory
Oakes's clarinet multiphonics database — clarinet, although one source
proposal mislabeled it as oboe — and in print the Bärenreiter technique
series (Veale/Mahnkopf for oboe, Levine for flute, Weiss/Netti for
saxophone), plus Bok for bass clarinet and Dick for flute. With library
access to these volumes, entries can be verified and promoted batch by
batch; the schema already has fields for everything those sources record.

Conventions: written and sounding pitch are separate fields and stay
separate (transposing instruments make their conflation the classic
error). Stability is a five-point gauge; the verified flag flips only on
a per-entry check against the cited page, never wholesale.

Relevant repertoire: Bartolozzi opened the field; Berio's *Sequenzas*
(VII for oboe, IXa for clarinet) made multiphonics canonical; Lachenmann
(*Dal niente*), Sciarrino, Globokar, Aperghis, and Rebecca Saunders write
the repertoire this browser serves. All of those scores had performer
collaboration behind them — the database is a starting point, the player
is the authority.
