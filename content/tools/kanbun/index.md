---
title: "HTML Kanbun Kundoku"
subtitle: ""
subtitleZH: ""
number: 17
group: "Linguistics"
status: "stable"
slug: "kanbun"
references:
  - "untunt. *kanbunHTML* — a kanbun kundoku (漢文訓読) HTML display solution. [GitHub](https://github.com/untunt/kanbunHTML) · [live demo](https://phesoca.com/kanbun-html/). Licensed AGPL-3.0; the display engine here is a port of that project."
---

*Kanbun kundoku* (漢文訓読) is the Japanese tradition of reading Classical
Chinese as Japanese: the original characters are kept in place but annotated
so they can be read in Japanese word order and with Japanese inflection. This
tool takes text marked up in that convention and sets it the way it appears on
the page — vertically, right-to-left, with each reading mark in its proper
position around the kanji.

**Annotation syntax.** Marks follow the kanji they attach to:

| Bracket | Mark | Term |
|---|---|---|
| `(…)` | furigana (reading) | 振り仮名 |
| `{…}` | okurigana (inflectional kana) | 送り仮名 |
| `[…]` | kaeriten (reading-order marks) | 返り点 |
| `‹…›` / `«…»` | furigana / okurigana of a re-read character | 再読文字 |
| `‘…’` | group several kanji under one ruby base | |

Bare kana need no braces — the engine recognises them and treats them as
okurigana automatically; punctuation needs no annotation. Kaeriten go inside
`[…]`: numerals `一二三`, the heaven–earth–man series `天地人`, the
`甲乙丙` series, the `上中下` series, and the reversing mark `レ` (which may
follow another mark, e.g. `[一レ]`). The toolbar inserts the less obvious
pieces — saidoku brackets, the *tateten* `―`, the *ninojiten* `〻`, and the
multiple-kanji ruby.

**Two settings.** *Akigumi* (アキ組) gives every character a fixed cell, so
columns align regardless of how much kana each character carries; *betagumi*
(ベタ組) sets the characters solid and lets the marks tuck into the gaps. The
refinements — sinking okurigana when a character has no furigana, splitting
touching kana, centring a lone furigana — match the choices a typesetter makes
by hand. **Copy HTML** yields the rendered markup for pasting elsewhere.

The display engine is ported from **untunt's [kanbunHTML](https://github.com/untunt/kanbunHTML)**
(AGPL-3.0); see the reference below. It renders best with a Japanese mincho
font installed (Yu Mincho, Hiragino Mincho, or similar) and falls back to the
system serif otherwise.
