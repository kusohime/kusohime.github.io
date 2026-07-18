---
title: "MIDI Keyboard"
subtitle: "Polyphonic keyboard with sustained browser synthesis"
subtitleZh: "可持續發聲的瀏覽器多聲部鍵盤"
number: 18
group: "Composition"
summary: "Plays and sustains harmony from pointer, QWERTY, or Web MIDI input with a small palette of synthesized timbres."
summaryZh: "可用指標、QWERTY 鍵盤或 Web MIDI 輸入演奏並延續和聲，並提供一組精簡的合成音色。"
status: "stable"
slug: "midi-keyboard"
references:
  - "W3C Audio Working Group. [*Web MIDI API*](https://www.w3.org/TR/webmidi/). Working Draft."
  - "W3C Audio Working Group. [*Web Audio API*](https://www.w3.org/TR/webaudio/). Recommendation."
  - "W3C Pointer Events Working Group. [*Pointer Events*](https://www.w3.org/TR/pointerevents3/). Recommendation."
  - "W3C Web Applications Working Group. [*UI Events KeyboardEvent code Values*](https://www.w3.org/TR/uievents-code/). Recommendation."
---

Play the on-screen keys with a mouse, pen, or touch; independent pointers
can hold several notes at once. The printed QWERTY map turns the computer
keyboard into the same set of notes. It follows physical key positions
(`KeyboardEvent.code`) so that the playing shape stays stable across
keyboard layouts, even when the characters printed on those keys differ.

If the browser offers Web MIDI, grant access to connected inputs to play
the same synthesizer from a hardware controller. MIDI carries note
and controller events, not audio. Note-on and note-off messages therefore
open and release local synth voices; velocity shapes their level, and the
sustain pedal extends released notes. Pointer, QWERTY, and MIDI input can
be combined, and the panic control releases every held voice.

Every sound is synthesized locally with the Web Audio API. The timbres are
deliberately basic and sustain cleanly so that intervals, spacing, and
voice leading remain audible for as long as needed. They are listening
aids rather than sampled imitations of acoustic instruments; changing a
preset changes the spectrum and envelope, not the pitches being held.

No microphone is requested, no MIDI output is sent, and this tool does not
upload or save notes, controller messages, or recordings. MIDI access is
handled by the browser's permission system, and ordinary input access is
requested without System Exclusive (SysEx) messages. Device enumeration
can itself reveal identifying hardware information, so access begins only
after an explicit request.

Web MIDI is optional: it requires browser support, a secure context, user
permission, and a connected device. If any of those is absent, the pointer
and QWERTY keyboard still work. QWERTY input has no independent velocity or
aftertouch, touch behavior and audio latency vary by device, and browsers
may suspend audio until the first user gesture. This is not a sequencer,
recorder, General MIDI sound module, Standard MIDI File player, or MIDI
output utility; it is a compact polyphonic instrument for auditioning
harmony.
