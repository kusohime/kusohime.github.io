/**
 * Core-library tests. Run: node tests/tools-core.test.mjs
 * Golden values come from Forte (1973), Rahn (1980), Straus (2016),
 * Sethares (2005), Messiaen (1944), and standard acoustics texts.
 */
import assert from "node:assert/strict";
import { frac, fadd, fmul, fdiv, fstr, flcm, parseFrac } from "../src/lib/fraction.js";
import { unitValue, solveModulation, cycleAttacks } from "../src/lib/tempo.js";
import {
  midiToHz, hzToMidi, ratioToCents, nameToMidi, midiToName, edoStep,
} from "../src/lib/pitch.js";
import {
  analyzeSet, primeForm, normalOrder, intervalVector, catalog, pfString,
} from "../src/lib/pcset.js";
import {
  validateRow, rowForm, rowMatrix, isAllInterval, combinatorialForms, HISTORICAL_ROWS,
} from "../src/lib/rows.js";
import { MESSIAEN_MODES, uniqueTranspositions, symmetryAxes } from "../src/lib/modes.js";
import { partialFreq, partialTable, harmonicNodes, reduceToOctave } from "../src/lib/partials.js";
import { chordRoughness, dyadSweep, pairRoughness } from "../src/lib/roughness.js";
import { applyOp, applyChain, hexatonicCycle, commonTones } from "../src/lib/triads.js";
import { reflectPc, reflectMidi, negativeHarmonySum, pcMappingTable } from "../src/lib/reflect.js";
import { validateEntry, ENTRIES } from "../src/lib/multiphonics-data.js";
import {
  COMPUTER_KEYBOARD_MAP,
  COMPUTER_KEYBOARD_ROWS,
  buildKeyboardNotes,
  decodeMidiMessage,
  midiToKeyboardLabel,
} from "../src/lib/midi-keyboard.js";

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (error) {
    console.error(`FAIL  ${name}`);
    console.error(`      ${error.message}`);
    process.exitCode = 1;
  }
}
const approx = (a, b, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b} (eps ${eps})`);

/* ---------- fractions ---------- */
test("fraction arithmetic and reduction", () => {
  assert.equal(fstr(fadd(frac(1n, 4n), frac(1n, 6n))), "5/12");
  assert.equal(fstr(fmul(frac(3n, 2n), frac(4n, 9n))), "2/3");
  assert.equal(fstr(fdiv(frac(1n, 4n), frac(3n, 16n))), "4/3");
  assert.equal(fstr(parseFrac("81/64")), "81/64");
});
test("fraction lcm gives polyrhythm cycle", () => {
  // periods 1/3 and 1/4 -> attacks align every 1 whole cycle
  assert.equal(fstr(flcm([frac(1n, 3n), frac(1n, 4n)])), "1");
});

/* ---------- tempo / metric modulation ---------- */
test("Carter equivalence: quarter=120, old dotted eighth = new quarter -> 160", () => {
  // Old dotted eighth lasts 0.375 s at q=120; the new quarter inherits it: 60/0.375 = 160.
  const result = solveModulation({
    oldBpm: 120,
    oldBeat: unitValue("quarter"),
    oldVal: unitValue("eighth", 1),
    newVal: unitValue("quarter"),
    newBeat: unitValue("quarter"),
  });
  assert.equal(result.bpmText, "160");
  assert.equal(result.ratioText, "4/3");
});
test("modulation: old triplet quarter = new quarter (q=90 -> 135)", () => {
  // Triplet quarter = 1/6 whole = 4/9 s at q=90; new quarter inherits it: 60/(4/9) = 135.
  const result = solveModulation({
    oldBpm: 90,
    oldBeat: unitValue("quarter"),
    oldVal: unitValue("quarter", 0, { actual: 3, normal: 2 }),
    newVal: unitValue("quarter"),
    newBeat: unitValue("quarter"),
  });
  approx(result.bpm, 135, 1e-9);
});
test("identity modulation leaves tempo unchanged", () => {
  const result = solveModulation({
    oldBpm: 72,
    oldBeat: unitValue("quarter"),
    oldVal: unitValue("half"),
    newVal: unitValue("half"),
    newBeat: unitValue("quarter"),
  });
  approx(result.bpm, 72, 1e-9);
});
test("polyrhythm 3:4 coincides only at zero", () => {
  const { coincidences, positions } = cycleAttacks([3, 4]);
  assert.equal(positions.length, 6); // 0, 1/4, 1/3, 1/2, 2/3, 3/4
  assert.equal(coincidences.length, 1);
  assert.equal(fstr(coincidences[0].at), "0");
});

/* ---------- pitch ---------- */
test("440 Hz <-> MIDI 69 <-> A4", () => {
  approx(hzToMidi(440), 69);
  approx(midiToHz(69), 440);
  assert.equal(nameToMidi("A4"), 69);
  assert.equal(midiToName(69), "A4");
  assert.equal(nameToMidi("Bb3"), 58);
  assert.equal(nameToMidi("C#4"), 61);
});
test("ratio 3/2 = 701.955 cents; 81/64 = 407.82 cents", () => {
  approx(ratioToCents(3, 2), 701.955, 1e-3);
  approx(ratioToCents(81, 64), 407.82, 1e-2);
});
test("31-EDO step 18 above A4", () => {
  const { cents, hz } = edoStep(18, 31, 440);
  approx(cents, 696.7741935, 1e-6);
  approx(hz, 440 * Math.pow(2, 18 / 31), 1e-9);
});

/* ---------- playable MIDI keyboard ---------- */
test("computer keyboard mapping spans two chromatic octaves", () => {
  assert.deepEqual(COMPUTER_KEYBOARD_ROWS.lower, [
    "Z", "S", "X", "D", "C", "V", "G", "B", "H", "N", "J", "M",
  ]);
  assert.deepEqual(COMPUTER_KEYBOARD_ROWS.upper, [
    "Q", "2", "W", "3", "E", "R", "5", "T", "6", "Y", "7", "U",
  ]);
  assert.equal(COMPUTER_KEYBOARD_MAP.Z, 0);
  assert.equal(COMPUTER_KEYBOARD_MAP.M, 11);
  assert.equal(COMPUTER_KEYBOARD_MAP.Q, 12);
  assert.equal(COMPUTER_KEYBOARD_MAP.U, 23);
});

test("MIDI keyboard labels and geometry align black keys with preceding whites", () => {
  assert.equal(midiToKeyboardLabel(0), "C-1");
  assert.equal(midiToKeyboardLabel(60), "C4");
  assert.equal(midiToKeyboardLabel(61), "C#4");
  assert.equal(midiToKeyboardLabel(127), "G9");

  const notes = buildKeyboardNotes(60);
  assert.equal(notes.length, 24);
  assert.deepEqual(notes[0], {
    midi: 60, name: "C4", isBlack: false, whiteIndex: 0, computerKey: "Z",
  });
  assert.deepEqual(notes[1], {
    midi: 61, name: "C#4", isBlack: true, whiteIndex: 0, computerKey: "S",
  });
  assert.deepEqual(notes[11], {
    midi: 71, name: "B4", isBlack: false, whiteIndex: 6, computerKey: "M",
  });
  assert.deepEqual(notes[12], {
    midi: 72, name: "C5", isBlack: false, whiteIndex: 7, computerKey: "Q",
  });
  assert.deepEqual(notes[23], {
    midi: 83, name: "B5", isBlack: false, whiteIndex: 13, computerKey: "U",
  });
});

test("MIDI message decoder covers notes, sustain, panic, and ignores other data", () => {
  assert.deepEqual(decodeMidiMessage([0x92, 60, 96]), {
    type: "note-on", midi: 60, velocity: 96, channel: 2,
  });
  assert.deepEqual(decodeMidiMessage(new Uint8Array([0x9f, 61, 0])), {
    type: "note-off", midi: 61, velocity: 0, channel: 15,
  });
  assert.deepEqual(decodeMidiMessage([0x81, 62, 45]), {
    type: "note-off", midi: 62, velocity: 45, channel: 1,
  });
  assert.deepEqual(decodeMidiMessage([0xb3, 64, 127]), {
    type: "sustain", active: true, value: 127, channel: 3,
  });
  assert.deepEqual(decodeMidiMessage([0xb3, 64, 63]), {
    type: "sustain", active: false, value: 63, channel: 3,
  });
  assert.deepEqual(decodeMidiMessage([0xb0, 120, 0]), {
    type: "panic", controller: 120, channel: 0,
  });
  assert.deepEqual(decodeMidiMessage([0xb7, 123, 0]), {
    type: "panic", controller: 123, channel: 7,
  });
  assert.equal(decodeMidiMessage([0xb0, 1, 64]), null);
  assert.equal(decodeMidiMessage([0xe0, 0, 64]), null);
  assert.equal(decodeMidiMessage([0x90, 60]), null);
  assert.equal(decodeMidiMessage([0xf8, 0, 0]), null);
});

/* ---------- pc sets ---------- */
test("[0,3,7]: prime (037), iv <001110>, Forte 3-11", () => {
  const a = analyzeSet([0, 3, 7]);
  assert.equal(a.primeFormString, "(037)");
  assert.equal(a.intervalVectorString, "<001110>");
  assert.equal(a.forte, "3-11");
});
test("all-interval tetrachord [0,1,4,6]: iv <111111>, Z-partner 4-Z29", () => {
  const a = analyzeSet([0, 1, 4, 6]);
  assert.equal(a.intervalVectorString, "<111111>");
  assert.equal(a.forte, "4-Z15");
  assert.equal(a.zPartners.length, 1);
  assert.equal(a.zPartners[0].forte, "4-Z29");
});
test("set-class counts match Forte's catalogue", () => {
  const counts = {};
  for (const entry of catalog().values()) counts[entry.card] = (counts[entry.card] ?? 0) + 1;
  assert.equal(counts[3], 12);
  assert.equal(counts[4], 29);
  assert.equal(counts[5], 38);
  assert.equal(counts[6], 50);
});
test("every catalogue class has a Forte name; prime forms idempotent", () => {
  for (const entry of catalog().values()) {
    assert.ok(entry.forte, `missing name for ${entry.key}`);
    assert.equal(pfString(primeForm(entry.pf)), pfString(entry.pf));
  }
});
test("complement convention: 4-Z15 complement is 8-Z15", () => {
  const a = analyzeSet([0, 1, 4, 6]);
  assert.equal(a.complement.forte, "8-Z15");
});
test("normal order packs from the right (Rahn)", () => {
  assert.deepEqual(normalOrder([0, 4, 8, 9]), [8, 9, 0, 4]);
  assert.deepEqual(intervalVector([0, 1, 2]), [2, 1, 0, 0, 0, 0]);
});

/* ---------- rows ---------- */
test("Berg Lyric Suite row is all-interval", () => {
  const berg = HISTORICAL_ROWS.find((r) => r.id === "berg-lyric-suite");
  assert.ok(isAllInterval(berg.pcs));
});
test("row validation rejects bad rows", () => {
  assert.equal(validateRow([0, 1, 2]).ok, false);
  assert.equal(validateRow([0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).ok, false);
});
test("matrix rows are P forms; P/R/I/RI consistency", () => {
  const row = HISTORICAL_ROWS[2].pcs; // Schoenberg op.25
  const matrix = rowMatrix(row);
  assert.deepEqual(matrix[0], row);
  const p4 = rowForm(row, "P", 4);
  assert.equal(p4[0], 4);
  const r4 = rowForm(row, "R", 4);
  assert.deepEqual([...r4].reverse(), p4);
  const i4 = rowForm(row, "I", 4);
  assert.equal(i4[0], 4);
});
test("Webern op.24 hexachords are combinatorial with some form", () => {
  const webern = HISTORICAL_ROWS.find((r) => r.id === "webern-op24");
  assert.ok(combinatorialForms(webern.pcs).length > 0);
});

/* ---------- Messiaen modes ---------- */
test("mode transposition counts: 2, 3, 4, 6, 6, 6, 6", () => {
  const expected = [2, 3, 4, 6, 6, 6, 6];
  MESSIAEN_MODES.forEach((mode, index) => {
    assert.equal(uniqueTranspositions(mode.pcs), expected[index], mode.name);
  });
});
test("mode 1 is whole-tone, mode 2 is octatonic", () => {
  assert.equal(analyzeSet(MESSIAEN_MODES[0].pcs).forte, "6-35");
  assert.equal(analyzeSet(MESSIAEN_MODES[1].pcs).forte, "8-28");
});
test("modes are inversionally symmetric (nonretrogradable in pc space)", () => {
  for (const mode of MESSIAEN_MODES) {
    assert.ok(symmetryAxes(mode.pcs).length > 0, mode.name);
  }
});

/* ---------- partials ---------- */
test("f0=110: 7th partial 770 Hz; A4 3rd harmonic ~ E6+2c", () => {
  approx(partialFreq(110, 7), 770);
  const table = partialTable(440, 8);
  const third = table.find((p) => p.n === 3);
  assert.equal(third.name, "E6");
  approx(third.cents, 1.955, 0.01);
  const fifth = table.find((p) => p.n === 5);
  assert.equal(fifth.name, "C#7");
  approx(fifth.cents, -13.686, 0.01);
  const seventh = table.find((p) => p.n === 7);
  assert.equal(seventh.name, "G7");
  approx(seventh.cents, -31.174, 0.01);
});
test("inharmonicity raises partials monotonically", () => {
  for (let n = 2; n <= 10; n++) {
    assert.ok(partialFreq(100, n, 0.0004) > partialFreq(100, n, 0));
  }
});
test("harmonic nodes: partial 3 has nodes 1/3, 2/3; reduce 7 -> 7/4", () => {
  assert.deepEqual(harmonicNodes(3).map((node) => node.position), [1 / 3, 2 / 3]);
  const r = reduceToOctave(7);
  assert.equal(r.num, 7);
  assert.equal(r.den, 4);
});

/* ---------- roughness ---------- */
test("fifth is smoother than tritone; unison smoothest (C4 register)", () => {
  const fifth = chordRoughness([60, 67]);
  const tritone = chordRoughness([60, 66]);
  const unison = chordRoughness([60, 60]);
  assert.ok(fifth < tritone, `fifth ${fifth} !< tritone ${tritone}`);
  assert.ok(unison < fifth);
});
test("dissonance curve has local minimum near the fifth (700c)", () => {
  const curve = dyadSweep(261.63, { steps: 1200 });
  const at = (cents) => curve.reduce((best, p) =>
    Math.abs(p.cents - cents) < Math.abs(best.cents - cents) ? p : best);
  const v650 = at(650).value;
  const v700 = at(702).value;
  const v750 = at(750).value;
  assert.ok(v700 < v650 && v700 < v750, `no minimum near fifth: ${v650} ${v700} ${v750}`);
});
test("pair roughness vanishes at unison and at large distance", () => {
  approx(pairRoughness(440, 440), 0);
  assert.ok(pairRoughness(440, 440 * 4) < 0.02);
});

/* ---------- neo-Riemannian ---------- */
test("P(C)=c, R(C)=a, L(C)=e; P is an involution", () => {
  const C = { root: 0, quality: "M" };
  assert.deepEqual(applyOp("P", C), { root: 0, quality: "m" });
  assert.deepEqual(applyOp("R", C), { root: 9, quality: "m" });
  assert.deepEqual(applyOp("L", C), { root: 4, quality: "m" });
  assert.deepEqual(applyOp("P", applyOp("P", C)), C);
  assert.deepEqual(applyOp("L", applyOp("L", C)), C);
  assert.deepEqual(applyOp("R", applyOp("R", C)), C);
});
test("hexatonic cycle from C contains Ab and E major", () => {
  const cycle = hexatonicCycle({ root: 0, quality: "M" });
  const labels = cycle.map((t) => `${t.root}${t.quality}`);
  assert.ok(labels.includes("8M"));
  assert.ok(labels.includes("4M"));
  assert.equal(commonTones({ root: 0, quality: "M" }, { root: 0, quality: "m" }).length, 2);
});
test("chain parsing applies left to right", () => {
  const steps = applyChain("PLR", { root: 0, quality: "M" });
  assert.equal(steps.length, 4);
  assert.deepEqual(steps[1].triad, { root: 0, quality: "m" });
});

/* ---------- reflection ---------- */
test("double reflection is identity; axis pcs are fixed", () => {
  for (let pc = 0; pc < 12; pc++) {
    assert.equal(reflectPc(reflectPc(pc, 5), 5), pc);
  }
  assert.equal(reflectPc(2, 4), 2); // axis on pc 2 when sum=4
  assert.equal(reflectMidi(reflectMidi(64, 60), 60), 64);
});
test("classic negative harmony in C: C->G, E->Eb (sum 7)", () => {
  const sum = negativeHarmonySum(0);
  assert.equal(sum, 7);
  assert.equal(reflectPc(0, sum), 7);
  assert.equal(reflectPc(4, sum), 3);
  assert.equal(pcMappingTable(sum).filter((r) => r.fixed).length, 0); // odd sum: no fixed pcs
});

/* ---------- canon & phase ---------- */
test("pattern parsing: Piano Phase pitched, Clapping Music compact", async () => {
  const { parsePattern, PRESETS } = await import("../src/lib/canon.js");
  const pianoPhase = parsePattern("E4 F#4 B4 C#5 D5 F#4 E4 C#5 B4 F#4 D5 C#5");
  assert.ok(pianoPhase.ok && pianoPhase.pitched);
  assert.equal(pianoPhase.steps.length, 12);
  assert.equal(pianoPhase.steps.filter((s) => s.rest).length, 0);
  const clapping = parsePattern("xxx.xx.x.xx.");
  assert.ok(clapping.ok && !clapping.pitched);
  assert.equal(clapping.steps.length, 12);
  assert.equal(clapping.steps.filter((s) => !s.rest).length, 8);
  assert.equal(parsePattern("E4 x . C5").ok, false); // mixed forms rejected
  assert.equal(parsePattern("").ok, false);
  for (const preset of PRESETS) assert.ok(parsePattern(preset.pattern).ok, preset.id);
});
test("drift period: pattern/|rate-1|; infinite when locked", async () => {
  const { driftPeriodSeconds } = await import("../src/lib/canon.js");
  approx(driftPeriodSeconds(10, 1.01), 1000, 1e-6);
  approx(driftPeriodSeconds(10, 0.99), 1000, 1e-6);
  assert.equal(driftPeriodSeconds(10, 1), Infinity);
});
test("stepped phasing advances by whole pattern steps", async () => {
  const { steppedShiftSteps, steppedOffsetFraction } = await import("../src/lib/canon.js");
  assert.equal(steppedShiftSteps(0, 12, 0), 0);
  assert.equal(steppedShiftSteps(0, 12, 1), 1);
  assert.equal(steppedShiftSteps(0, 12, 12), 0);
  assert.equal(steppedShiftSteps(0.25, 12, 2), 5);
  approx(steppedOffsetFraction(0.25, 12, 2), 5 / 12, 1e-9);
});
test("hold steps extend attacks; wrap across the cycle", async () => {
  const { parsePattern, attackDurationSteps } = await import("../src/lib/canon.js");
  const held = parsePattern("E4 _ _ F4");
  assert.ok(held.ok);
  assert.equal(attackDurationSteps(held.steps, 0), 3);
  assert.equal(attackDurationSteps(held.steps, 3), 1);
  const wrap = parsePattern("_ x C4"); // leading hold belongs to the final attack
  assert.equal(attackDurationSteps(parsePattern("x . _ x").steps, 0), 1); // rest stops nothing—holds only
  assert.equal(attackDurationSteps(wrap.steps, 2), 2);
});

/* ---------- fugue ---------- */
test("voice parsing: durations persist, dots, rests", async () => {
  const { parseVoice } = await import("../src/lib/fugue.js");
  const line = parseVoice("D4:e A4 F4:q. R:e C#4");
  assert.ok(line.ok);
  assert.deepEqual(line.events.map((e) => e.beats), [0.5, 0.5, 1.5, 0.5, 0.5]);
  assert.equal(line.events[3].midi, null);
  assert.equal(line.events[0].midi, 62);
  assert.equal(parseVoice("D4:z").ok, false);
  assert.equal(parseVoice("").ok, false);
});
test("exposition: real answer +7 by default, entries at subject length", async () => {
  const { parseVoice, buildExposition } = await import("../src/lib/fugue.js");
  const subject = parseVoice("C4:q D4 E4 F4");
  const exposition = buildExposition({
    subjectEvents: subject.events,
    entries: [
      { material: "S", semitones: 0, octave: 0 },
      { material: "A", semitones: 0, octave: 0 },
      { material: "S", semitones: 0, octave: -1 },
    ],
  });
  assert.equal(exposition.gap, 4);
  assert.equal(exposition.voices.length, 3);
  assert.equal(exposition.voices[1].entryStart, 4);
  assert.equal(exposition.voices[1].statement[0].midi, 60 + 7); // answer at the fifth
  assert.equal(exposition.voices[2].statement[0].midi, 60 - 12); // subject an octave down
  assert.equal(exposition.totalBeats, 12);
});
test("stretto gap and tonal answer override", async () => {
  const { parseVoice, buildExposition } = await import("../src/lib/fugue.js");
  const subject = parseVoice("C4:q D4 E4 F4");
  const tonal = parseVoice("G4:q A4 B4 C5");
  const exposition = buildExposition({
    subjectEvents: subject.events,
    answerEvents: tonal.events,
    entries: [
      { material: "S", semitones: 0, octave: 0 },
      { material: "A", semitones: 0, octave: 0 },
    ],
    gapBeats: 2,
  });
  assert.equal(exposition.voices[1].entryStart, 2); // stretto
  assert.equal(exposition.voices[1].statement[0].midi, 67); // supplied answer used verbatim
});
test("parallel fifths between subject and real answer at gap 0 are flagged", async () => {
  const { parseVoice, buildExposition, findParallels } = await import("../src/lib/fugue.js");
  const subject = parseVoice("C4:q D4 E4");
  const exposition = buildExposition({
    subjectEvents: subject.events,
    entries: [
      { material: "S", semitones: 0, octave: 0 },
      { material: "A", semitones: 0, octave: 0 },
    ],
    gapBeats: 0, // simultaneous entries: parallel fifths throughout
  });
  const parallels = findParallels(exposition);
  assert.ok(parallels.length >= 1, "expected parallel fifths to be flagged");
  assert.ok(parallels.every((p) => p.interval === "P5"));
});
test("augmentation doubles a statement's length, diminution halves it", async () => {
  const { parseVoice, buildExposition, scaleBeats, totalBeats } = await import("../src/lib/fugue.js");
  const subject = parseVoice("C4:q D4 E4 F4"); // 4 beats as written
  assert.deepEqual(scaleBeats(subject.events, 2).map((e) => e.beats), [2, 2, 2, 2]);
  assert.deepEqual(scaleBeats(subject.events, 0.5).map((e) => e.beats), [0.5, 0.5, 0.5, 0.5]);
  // Pitches survive the scaling untouched.
  assert.deepEqual(scaleBeats(subject.events, 2).map((e) => e.midi), subject.events.map((e) => e.midi));
  const exposition = buildExposition({
    subjectEvents: subject.events,
    entries: [
      { material: "S", semitones: 0, octave: 0, factor: 1 },
      { material: "S", semitones: 0, octave: 0, factor: 2 }, // augmented
      { material: "S", semitones: 0, octave: 0, factor: 0.5 }, // diminished
    ],
    gapBeats: 4,
  });
  assert.equal(totalBeats(exposition.voices[0].statement), 4);
  assert.equal(totalBeats(exposition.voices[1].statement), 8); // augmentation
  assert.equal(totalBeats(exposition.voices[2].statement), 2); // diminution
  // Entries still begin on the grid; only the statement's length changes.
  assert.deepEqual(exposition.voices.map((v) => v.entryStart), [0, 4, 8]);
});
test("fugue presets parse; supplied answers match subject length", async () => {
  const { parseVoice, PRESETS } = await import("../src/lib/fugue.js");
  assert.ok(PRESETS.length >= 2);
  for (const preset of PRESETS) {
    const subject = parseVoice(preset.subject);
    assert.ok(subject.ok, `${preset.id} subject`);
    if (preset.answer) {
      const answer = parseVoice(preset.answer);
      assert.ok(answer.ok, `${preset.id} answer`);
      // The answer is the subject transposed, so it has the same note count.
      assert.equal(answer.events.length, subject.events.length, `${preset.id} answer length`);
    }
    if (preset.cs) assert.ok(parseVoice(preset.cs).ok, `${preset.id} countersubject`);
  }
});

/* ---------- input parsing ---------- */
test("pc parsing disambiguates T/E numerals from note names", async () => {
  const { parsePcList, parseNoteList } = await import("../src/lib/parse.js");
  assert.deepEqual(parsePcList("C E G B").pcs, [0, 4, 7, 11]); // note context
  assert.deepEqual(parsePcList("5 4 0 9 7 2 8 1 3 6 T E").pcs, [5, 4, 0, 9, 7, 2, 8, 1, 3, 6, 10, 11]);
  assert.deepEqual(parsePcList("T E").pcs, [10, 11]); // numeral mode
  assert.deepEqual(parsePcList("A C E").pcs, [9, 0, 4]); // C forces note context
  assert.equal(parsePcList("0 1 banana").ok, false);
  assert.deepEqual(parseNoteList("C4 Bb3").midis, [60, 58]);
});

/* ---------- multiphonics schema ---------- */
test("all seed entries validate; missing provenance rejected", () => {
  for (const entry of ENTRIES) assert.ok(validateEntry(entry).ok, entry.id);
  assert.equal(validateEntry({ id: "x", instrument: "y", technique: "z" }).ok, false);
});

/* ---------- audio: equal-loudness compensation ---------- */
test("loudness compensation: flat above middle C, rising and capped in the bass", async () => {
  const { loudnessGain } = await import("../src/lib/audio.js");
  const cap = Math.pow(10, 10 / 20); // LOUDNESS_MAX_DB = 10
  assert.equal(loudnessGain(261.63), 1); // middle C: untouched
  assert.equal(loudnessGain(440), 1); // above the corner: untouched
  assert.ok(loudnessGain(130.81) > 1); // an octave below: boosted
  assert.ok(loudnessGain(65.41) > loudnessGain(130.81)); // lower note, louder boost
  assert.ok(loudnessGain(32.7) <= cap + 1e-9); // never exceeds the ceiling
  assert.ok(loudnessGain(20) <= cap + 1e-9);
  assert.equal(loudnessGain(0), 1); // guards against non-positive input
  // ~4.5 dB/octave: one octave down should be close to 10^(4.5/20).
  assert.ok(Math.abs(loudnessGain(130.81) - Math.pow(10, 4.5 / 20)) < 0.02);
});

test("poly synth offers four frozen, sustaining timbres and stays lazy", async () => {
  const { POLY_SYNTH_PRESETS, createPolySynth } = await import("../src/lib/audio.js");
  assert.deepEqual(Object.keys(POLY_SYNTH_PRESETS), ["pure", "warm", "organ", "pad"]);
  assert.equal(new Set(Object.values(POLY_SYNTH_PRESETS).map((preset) => preset.label)).size, 4);
  for (const preset of Object.values(POLY_SYNTH_PRESETS)) {
    assert.ok(Object.isFrozen(preset));
    assert.ok(Object.isFrozen(preset.oscillators));
    assert.ok(preset.adsr.sustain > 0);
    assert.ok(preset.adsr.release > 0);
    assert.ok(preset.oscillators.length > 0);
  }

  // Construction and non-audio controls must not touch browser-only globals.
  const synth = createPolySynth({ preset: "organ", volume: 0.6 });
  assert.equal(synth.activeCount(), 0);
  assert.equal(synth.setPreset("pad"), true);
  assert.equal(synth.setPreset("not-a-preset"), false);
  assert.equal(synth.setVolume(2), 1);
  assert.equal(synth.panic(), 0);
  synth.destroy();
  assert.equal(synth.noteOn("after-destroy", 60), false);
});

test("poly synth holds notes until release and enforces its voice cap", async () => {
  const previousWindow = globalThis.window;
  const createdOscillators = [];

  class MockParam {
    constructor(value = 0) { this.value = value; }
    setValueAtTime(value) { this.value = value; }
    setTargetAtTime(value) { this.value = value; }
    exponentialRampToValueAtTime(value) { this.value = value; }
    cancelScheduledValues() {}
    cancelAndHoldAtTime() {}
  }
  class MockNode {
    connect(target) { this.target = target; return target; }
    disconnect() { this.disconnected = true; }
  }
  class MockOscillator extends MockNode {
    constructor() {
      super();
      this.frequency = new MockParam();
      this.detune = new MockParam();
      this.onended = null;
      this.started = false;
      this.stopped = false;
      createdOscillators.push(this);
    }
    start() { this.started = true; }
    stop() { this.stopped = true; }
  }
  class MockAudioContext {
    constructor() {
      this.currentTime = 0;
      this.sampleRate = 48000;
      this.state = "running";
      this.destination = new MockNode();
    }
    createGain() {
      const node = new MockNode();
      node.gain = new MockParam(1);
      return node;
    }
    createDynamicsCompressor() {
      const node = new MockNode();
      node.threshold = new MockParam();
      node.knee = new MockParam();
      node.ratio = new MockParam();
      node.attack = new MockParam();
      node.release = new MockParam();
      return node;
    }
    createBiquadFilter() {
      const node = new MockNode();
      node.frequency = new MockParam();
      node.Q = new MockParam();
      return node;
    }
    createOscillator() { return new MockOscillator(); }
    async resume() { this.state = "running"; }
  }

  try {
    globalThis.window = { AudioContext: MockAudioContext };
    const { createPolySynth } = await import("../src/lib/audio.js");
    const synth = createPolySynth({ preset: "organ", maxVoices: 2 });

    assert.equal(synth.noteOn("one", 48, { velocity: 96 }), true);
    assert.equal(synth.activeCount(), 1);
    assert.ok(createdOscillators.length >= 4);
    assert.ok(createdOscillators.every((oscillator) => oscillator.started && !oscillator.stopped));

    // With no note-off, every source remains alive: sustain is indefinite.
    assert.equal(synth.activeCount(), 1);
    assert.equal(synth.noteOn("two", 55), true);
    assert.equal(synth.activeCount(), 2);
    assert.equal(synth.noteOn("three", 60), true);
    assert.equal(synth.activeCount(), 2);
    assert.equal(synth.noteOff("one"), false); // oldest voice was stolen
    assert.equal(synth.noteOff("two"), true);
    assert.equal(synth.activeCount(), 1);
    assert.ok(synth.panic() >= 1);
    assert.equal(synth.activeCount(), 0);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

console.log(`${passed} tests passed${process.exitCode ? " (with failures)" : ""}`);
