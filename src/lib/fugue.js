/**
 * Fugue exposition scaffolding.
 * A voice line is a list of events { midi, beats } (midi null = rest),
 * parsed from "D4:q E4:e F#4 G4:q. R:e" — durations w h q e s with an
 * optional dot; a missing duration repeats the previous one (LilyPond's
 * convention); R is a rest.
 *
 * The builder lays out entries only — who enters when, stating what,
 * transposed how — plus the countersubject against each following entry.
 * It composes no free counterpoint: that judgment stays with the composer.
 */
import { nameToMidi } from "./pitch.js";

const DURATION_BEATS = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 };

/** Parse one voice line. Returns { ok, events, totalBeats, bad[] }. */
export function parseVoice(text) {
  const tokens = String(text).trim().split(/[\s,;|]+/).filter(Boolean);
  const events = [];
  const bad = [];
  let lastBeats = 1;

  for (const token of tokens) {
    const match = token.match(/^([A-Ga-gRr][#b]?-?\d*)(?::([whqes])(\.)?)?$/);
    if (!match) {
      bad.push(token);
      continue;
    }
    let beats = lastBeats;
    if (match[2]) {
      beats = DURATION_BEATS[match[2]] * (match[3] ? 1.5 : 1);
      lastBeats = beats;
    }
    const name = match[1];
    if (name === "R" || name === "r") {
      events.push({ midi: null, beats });
      continue;
    }
    const midi = nameToMidi(name);
    if (midi === null) {
      bad.push(token);
      continue;
    }
    events.push({ midi, beats });
  }

  return {
    ok: bad.length === 0 && events.length > 0,
    events,
    totalBeats: events.reduce((sum, event) => sum + event.beats, 0),
    bad,
  };
}

export const totalBeats = (events) =>
  events.reduce((sum, event) => sum + event.beats, 0);

export const transposeEvents = (events, semitones) =>
  events.map((event) => ({
    midi: event.midi === null ? null : event.midi + semitones,
    beats: event.beats,
  }));

/**
 * Build the exposition.
 * entries: [{ material: "S" | "A", semitones, octave }] per voice, in
 * entry order. The answer defaults to the subject up a perfect fifth
 * (the real answer); supply answerEvents for a tonal answer.
 * The countersubject is assumed written against entry 2; for later
 * entries it shifts in parallel with the entry it accompanies.
 * Returns voices: [{ entryStart, statement, csStart, cs, freeFrom }],
 * all times in beats from the top.
 *
 * @param {{
 *   subjectEvents: { midi: number | null, beats: number }[],
 *   answerEvents?: { midi: number | null, beats: number }[] | null,
 *   csEvents?: { midi: number | null, beats: number }[] | null,
 *   entries: { material: "S" | "A", semitones?: number, octave?: number }[],
 *   gapBeats?: number | null,
 * }} options
 */
export function buildExposition({
  subjectEvents,
  answerEvents = null,
  csEvents = null,
  entries,
  gapBeats = null,
}) {
  const answer = answerEvents ?? transposeEvents(subjectEvents, 7);
  const gap = gapBeats ?? totalBeats(subjectEvents);
  const entryShift = (entry) => (entry.semitones ?? 0) + 12 * (entry.octave ?? 0);

  const voices = entries.map((entry, index) => {
    const material = entry.material === "A" ? answer : subjectEvents;
    const statement = transposeEvents(material, entryShift(entry));
    const entryStart = index * gap;
    const statementEnd = entryStart + totalBeats(statement);

    let cs = null;
    let csStart = null;
    const next = entries[index + 1];
    if (csEvents && next) {
      // CS as written fits entry 2; shift it with the entry it accompanies.
      const reference = entries[1] ? entryShift(entries[1]) : 0;
      const shift = entryShift(next) - reference + 12 * (entry.octave ?? 0);
      cs = transposeEvents(csEvents, shift);
      csStart = statementEnd;
    }

    return {
      entryStart,
      statement,
      csStart,
      cs,
      freeFrom: cs ? csStart + totalBeats(cs) : statementEnd,
    };
  });

  return {
    voices,
    gap,
    totalBeats: Math.max(
      ...voices.map((voice) =>
        Math.max(voice.freeFrom, voice.entryStart + totalBeats(voice.statement)),
      ),
    ),
  };
}

/** Absolute-timeline notes for one voice: [{ start, beats, midi, label }]. */
export function voiceTimeline(voice) {
  const notes = [];
  let cursor = voice.entryStart;
  for (const event of voice.statement) {
    if (event.midi !== null) notes.push({ start: cursor, beats: event.beats, midi: event.midi, part: "statement" });
    cursor += event.beats;
  }
  if (voice.cs && voice.csStart !== null) {
    cursor = voice.csStart;
    for (const event of voice.cs) {
      if (event.midi !== null) notes.push({ start: cursor, beats: event.beats, midi: event.midi, part: "cs" });
      cursor += event.beats;
    }
  }
  return notes;
}

/**
 * Consecutive perfect fifths/octaves between voice pairs, judged at
 * attack onsets where both voices move. Returns [{ beat, voices, interval }].
 */
export function findParallels(exposition) {
  const lines = exposition.voices.map((voice) => voiceTimeline(voice));
  const onsets = [...new Set(lines.flat().map((note) => note.start))].sort(
    (a, b) => a - b,
  );
  const soundingAt = (line, beat) =>
    line.find((note) => note.start <= beat && beat < note.start + note.beats) ??
    null;

  const warnings = [];
  for (let a = 0; a < lines.length; a++) {
    for (let b = a + 1; b < lines.length; b++) {
      let previous = null;
      for (const beat of onsets) {
        const noteA = soundingAt(lines[a], beat);
        const noteB = soundingAt(lines[b], beat);
        if (!noteA || !noteB) {
          previous = null;
          continue;
        }
        const interval = Math.abs(noteA.midi - noteB.midi) % 12;
        const isPerfect = interval === 7 || interval === 0;
        if (
          previous &&
          isPerfect &&
          previous.interval === interval &&
          previous.midiA !== noteA.midi &&
          previous.midiB !== noteB.midi
        ) {
          warnings.push({
            beat,
            voices: [a + 1, b + 1],
            interval: interval === 7 ? "P5" : "P8/unison",
          });
        }
        previous = { interval: isPerfect ? interval : -1, midiA: noteA.midi, midiB: noteB.midi };
      }
    }
  }
  return warnings;
}
