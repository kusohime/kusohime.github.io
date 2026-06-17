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
 * Scale every note value by a factor: 2 is augmentation (the statement in
 * doubled note values), 0.5 is diminution (halved). Pitches are untouched.
 */
export const scaleBeats = (events, factor) =>
  events.map((event) => ({ midi: event.midi, beats: event.beats * factor }));

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
 * Each entry may also carry a rhythmic `factor`: 2 states the material in
 * augmentation, 0.5 in diminution (default 1, as written). The factor
 * scales the statement only — the countersubject keeps its written values.
 *
 * @param {{
 *   subjectEvents: { midi: number | null, beats: number }[],
 *   answerEvents?: { midi: number | null, beats: number }[] | null,
 *   csEvents?: { midi: number | null, beats: number }[] | null,
 *   entries: { material: "S" | "A", semitones?: number, octave?: number, factor?: number }[],
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
    const statement = scaleBeats(
      transposeEvents(material, entryShift(entry)),
      entry.factor ?? 1,
    );
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
 * Worked expositions to load into the builder. Each subject/answer/cs is
 * in the same NOTE:duration notation the inputs accept (leading rests are
 * dropped: the builder spaces entries by the subject's length, so a voice
 * still enters where it should). Pitches and rhythms are transcribed from
 * the scores — the C minor fugue keeps Bach's tonal answer (its dominant
 * G is answered by the tonic C, a fourth not a fifth) and its sixteenth-
 * note countersubject, so the answer and CS fields are not left to the
 * default real answer. An empty answer means the real answer up a fifth.
 */
export const PRESETS = [
  {
    id: "art-of-fugue",
    label: "Bach — Art of Fugue, Contrapunctus 1 (BWV 1080)",
    subject: "D4:e A4 F4 D4 C#4 D4:q E4:e D4 E4 F4:q G4:e F4 G4 A4:q",
    answer: "",
    cs: "",
    voices: 3,
    bpm: 72,
  },
  {
    // Tonal answer: subject's G (the dominant) is answered by C, not D;
    // the regular countersubject runs in sixteenths against the answer.
    id: "wtc1-c-minor",
    label: "Bach — WTC I, Fugue 2 in C minor (BWV 847)",
    subject: "C5:s B4 C5:e G4 Ab4 C5:s B4 C5:e D5 G4:e C5:s B4 C5:e D5 F4:s G4 Ab4:q G4:s F4",
    answer: "G5:s F#5 G5:e C5 Eb5 G5:s F#5 G5:e A5 D5:e G5:s F#5 G5:e A5 C5:s D5 Eb5:q D5:s C5",
    cs: "Eb4:s C5 B4 A4 G4 F4 Eb4 D4 C4:e Eb5 D5 C5 Bb4 A4 Bb4 C5 F#4 G4 A4 F#4",
    voices: 3,
    bpm: 76,
  },
  {
    id: "wtc1-d-minor",
    label: "Bach — WTC I, Fugue 6 in D minor (BWV 851)",
    subject: "D4:e E4 F4 G4 E4 F4:s D4 C#4 D4 Bb4:q G4",
    answer: "",
    cs: "",
    voices: 3,
    bpm: 78,
  },
];

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
