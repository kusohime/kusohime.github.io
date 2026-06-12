---
title: "Multiphonics & Extended Techniques"
subtitle: "A schema-first browser, awaiting verified data"
number: 13
group: "Performance Resources"
summary: "A provenance-enforcing browser for woodwind multiphonics and extended techniques. The schema is final; the catalogue is deliberately small until each entry is checked against its source."
status: "data-pending"
slug: "multiphonics-browser"
---

## How to use it

Filter by instrument and technique, or search free text. Each card shows
written and sounding pitches, a fingering description, dynamics, a
stability gauge, response notes, and — non-negotiably — a source
citation. Entries whose pitch content has not yet been checked against
the cited source wear an UNVERIFIED badge and must not be copied into
scores.

## Why the catalogue is small

This is the one tool on this site where the hard problem is not
mathematics but **data integrity**. A wrong prime form embarrasses the
author; a wrong fingering wastes a rehearsal and erodes a performer's
trust in the composer. Both research proposals correctly observed that
the difficulty here is schema and provenance, not interface — and then
scheduled the tool last for exactly that reason. I have gone one step
further: the browser enforces the schema (instrument, technique, source
are required; entries without provenance are rejected by the validator
and the test suite), ships with a handful of clearly-flagged placeholder
entries that point to where the real data lives, and waits.

The reliable public sources to verify against are Heather Roche's
performer-maintained clarinet catalogues (heatherroche.net), Gregory
Oakes's clarinet multiphonics database — note: clarinet, though one of
the source proposals mislabeled it as oboe — and, in print, the
Bärenreiter technique series (Veale/Mahnkopf for oboe, Levine for flute,
Weiss/Netti for saxophone) plus Bok for bass clarinet and Dick for
flute. **If you have library access to these volumes, entries can be
verified and promoted batch by batch** — the schema already has fields
for everything those sources record.

## Conventions

Written vs. sounding pitch are separate fields and stay separate
(transposing instruments make their conflation the classic error).
Stability is a five-point gauge, response is free prose, and the
`verified` flag flips only on a per-entry check against the cited page —
never wholesale.

## Repertoire

Bartolozzi's *New Sounds for Woodwind* (1967) opened the field; Berio's
*Sequenzas* (especially VII for oboe, IXa for clarinet) made multiphonics
canonical; Lachenmann (*Dal niente*), Sciarrino (*Let me die before I
wake*), Globokar, Aperghis, and Rebecca Saunders write the repertoire
this browser serves. Every one of those scores comes with performer
collaboration behind it — which is the browser's real lesson: the
database is a starting point, the player is the authority.

## References

- Bartolozzi, B. (1967). *New Sounds for Woodwind*. Oxford University Press.
- Veale, P., & Mahnkopf, C.-S. (1994). *The Techniques of Oboe Playing*. Bärenreiter.
- Levine, C., & Mitropoulos-Bott, C. (2002). *The Techniques of Flute Playing*. Bärenreiter.
- Weiss, M., & Netti, G. (2010). *The Techniques of Saxophone Playing*. Bärenreiter.
- Bok, H. (2011). *New Techniques for the Bass Clarinet*. Shoepair Music.
- Dick, R. (1989). *The Other Flute* (2nd ed.). Multiple Breath Music.
- Roche, H. heatherroche.net (performer-verified clarinet catalogues).
- Oakes, G. gregoryoakes.com/multiphonics (clarinet).
