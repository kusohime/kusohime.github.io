/**
 * Pure helpers shared by the playable MIDI keyboard UI.
 *
 * This module intentionally has no browser or Web Audio dependencies so its
 * layout and MIDI-message behavior can be exercised by the Node test suite.
 */

const LOWER_COMPUTER_ROW = Object.freeze([
  "Z", "S", "X", "D", "C", "V", "G", "B", "H", "N", "J", "M",
]);
const UPPER_COMPUTER_ROW = Object.freeze([
  "Q", "2", "W", "3", "E", "R", "5", "T", "6", "Y", "7", "U",
]);

/** Two chromatic octaves, arranged as two familiar computer-key rows. */
export const COMPUTER_KEYBOARD_ROWS = Object.freeze({
  lower: LOWER_COMPUTER_ROW,
  upper: UPPER_COMPUTER_ROW,
});

const COMPUTER_KEYS = Object.freeze([
  ...COMPUTER_KEYBOARD_ROWS.lower,
  ...COMPUTER_KEYBOARD_ROWS.upper,
]);

/** Computer key label -> semitone offset above the keyboard's base note. */
export const COMPUTER_KEYBOARD_MAP = Object.freeze(
  Object.fromEntries(COMPUTER_KEYS.map((key, semitone) => [key, semitone])),
);

const NOTE_NAMES = Object.freeze([
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
]);
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);
// Index of the current white key, or the white key immediately before a black
// key, within an octave. This matches how piano black keys are positioned.
const WHITE_INDEX_IN_OCTAVE = Object.freeze([0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]);

function assertMidiNote(midi, label = "MIDI note") {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    throw new RangeError(`${label} must be an integer from 0 to 127.`);
  }
}

function pitchClass(midi) {
  return midi % 12;
}

function absoluteWhiteIndex(midi) {
  return Math.floor(midi / 12) * 7 + WHITE_INDEX_IN_OCTAVE[pitchClass(midi)];
}

/** Convert a MIDI note number to the keyboard's sharp-spelled display label. */
export function midiToKeyboardLabel(midi) {
  assertMidiNote(midi);
  return `${NOTE_NAMES[pitchClass(midi)]}${Math.floor(midi / 12) - 1}`;
}

/**
 * Build consecutive chromatic keys for the UI.
 *
 * `whiteIndex` is relative to the white key at or immediately before
 * `baseMidi`, allowing both white and black keys to share one positioning
 * coordinate. The 24 computer-key labels cover the first two octaves.
 */
export function buildKeyboardNotes(baseMidi, { semitones = 24 } = {}) {
  assertMidiNote(baseMidi, "Base MIDI note");
  if (!Number.isInteger(semitones) || semitones < 1) {
    throw new RangeError("Semitones must be a positive integer.");
  }
  if (baseMidi + semitones - 1 > 127) {
    throw new RangeError("The requested keyboard range exceeds MIDI note 127.");
  }

  const baseWhiteIndex = absoluteWhiteIndex(baseMidi);
  return Array.from({ length: semitones }, (_, offset) => {
    const midi = baseMidi + offset;
    return {
      midi,
      name: midiToKeyboardLabel(midi),
      isBlack: BLACK_PITCH_CLASSES.has(pitchClass(midi)),
      whiteIndex: absoluteWhiteIndex(midi) - baseWhiteIndex,
      computerKey: COMPUTER_KEYS[offset] ?? null,
    };
  });
}

function isDataByte(value) {
  return Number.isInteger(value) && value >= 0 && value <= 127;
}

/**
 * Decode the channel messages used by the keyboard.
 *
 * Velocity and controller values remain in MIDI's native 0..127 range.
 * Unsupported, malformed, and system messages return null.
 */
export function decodeMidiMessage(data) {
  if (!data || typeof data.length !== "number" || data.length < 3) return null;

  const status = Number(data[0]);
  const first = Number(data[1]);
  const second = Number(data[2]);
  if (!Number.isInteger(status) || status < 0x80 || status > 0xef) return null;
  if (!isDataByte(first) || !isDataByte(second)) return null;

  const command = status & 0xf0;
  const channel = status & 0x0f;

  if (command === 0x90) {
    return second === 0
      ? { type: "note-off", midi: first, velocity: 0, channel }
      : { type: "note-on", midi: first, velocity: second, channel };
  }

  if (command === 0x80) {
    return { type: "note-off", midi: first, velocity: second, channel };
  }

  if (command !== 0xb0) return null;
  if (first === 64) {
    return {
      type: "sustain",
      active: second >= 64,
      value: second,
      channel,
    };
  }
  if (first === 120 || first === 123) {
    return { type: "panic", controller: first, channel };
  }
  return null;
}
