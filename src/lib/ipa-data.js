/**
 * IPA inventory for the on-screen keyboard, grouped into palettes. Diacritics
 * are flagged `combining` so the UI can show them attached to a dotted circle.
 * Each entry is [symbol, name]. A compact X-SAMPA map powers ASCII entry.
 */

export const PALETTES = [
  {
    id: "consonants",
    label: "Consonants",
    keys: [
      ["p", "voiceless bilabial plosive"], ["b", "voiced bilabial plosive"],
      ["t", "voiceless alveolar plosive"], ["d", "voiced alveolar plosive"],
      ["ʈ", "voiceless retroflex plosive"], ["ɖ", "voiced retroflex plosive"],
      ["c", "voiceless palatal plosive"], ["ɟ", "voiced palatal plosive"],
      ["k", "voiceless velar plosive"], ["ɡ", "voiced velar plosive"],
      ["q", "voiceless uvular plosive"], ["ɢ", "voiced uvular plosive"],
      ["ʔ", "glottal stop"],
      ["m", "bilabial nasal"], ["ɱ", "labiodental nasal"], ["n", "alveolar nasal"],
      ["ɳ", "retroflex nasal"], ["ɲ", "palatal nasal"], ["ŋ", "velar nasal"],
      ["ɴ", "uvular nasal"],
      ["ʙ", "bilabial trill"], ["r", "alveolar trill"], ["ʀ", "uvular trill"],
      ["ɾ", "alveolar tap"], ["ɽ", "retroflex tap"],
      ["ɸ", "voiceless bilabial fricative"], ["β", "voiced bilabial fricative"],
      ["f", "voiceless labiodental fricative"], ["v", "voiced labiodental fricative"],
      ["θ", "voiceless dental fricative"], ["ð", "voiced dental fricative"],
      ["s", "voiceless alveolar fricative"], ["z", "voiced alveolar fricative"],
      ["ʃ", "voiceless postalveolar fricative"], ["ʒ", "voiced postalveolar fricative"],
      ["ʂ", "voiceless retroflex fricative"], ["ʐ", "voiced retroflex fricative"],
      ["ç", "voiceless palatal fricative"], ["ʝ", "voiced palatal fricative"],
      ["x", "voiceless velar fricative"], ["ɣ", "voiced velar fricative"],
      ["χ", "voiceless uvular fricative"], ["ʁ", "voiced uvular fricative"],
      ["ħ", "voiceless pharyngeal fricative"], ["ʕ", "voiced pharyngeal fricative"],
      ["h", "voiceless glottal fricative"], ["ɦ", "voiced glottal fricative"],
      ["ɬ", "voiceless alveolar lateral fricative"], ["ɮ", "voiced alveolar lateral fricative"],
      ["ʋ", "labiodental approximant"], ["ɹ", "alveolar approximant"],
      ["ɻ", "retroflex approximant"], ["j", "palatal approximant"],
      ["ɰ", "velar approximant"], ["l", "alveolar lateral approximant"],
      ["ɭ", "retroflex lateral approximant"], ["ʎ", "palatal lateral approximant"],
      ["ʟ", "velar lateral approximant"],
      ["ʍ", "voiceless labial-velar fricative"], ["w", "voiced labial-velar approximant"],
      ["ɥ", "labial-palatal approximant"],
      ["ɓ", "bilabial implosive"], ["ɗ", "alveolar implosive"], ["ʄ", "palatal implosive"],
      ["ɠ", "velar implosive"], ["ʛ", "uvular implosive"],
      ["ʘ", "bilabial click"], ["ǀ", "dental click"], ["ǃ", "postalveolar click"],
      ["ǂ", "palatoalveolar click"], ["ǁ", "alveolar lateral click"],
      ["ɕ", "voiceless alveolo-palatal fricative"], ["ʑ", "voiced alveolo-palatal fricative"],
      ["ⱱ", "labiodental flap"],
    ],
  },
  {
    id: "vowels",
    label: "Vowels",
    keys: [
      ["i", "close front unrounded"], ["y", "close front rounded"],
      ["ɨ", "close central unrounded"], ["ʉ", "close central rounded"],
      ["ɯ", "close back unrounded"], ["u", "close back rounded"],
      ["ɪ", "near-close front unrounded"], ["ʏ", "near-close front rounded"],
      ["ʊ", "near-close back rounded"],
      ["e", "close-mid front unrounded"], ["ø", "close-mid front rounded"],
      ["ɘ", "close-mid central unrounded"], ["ɵ", "close-mid central rounded"],
      ["ɤ", "close-mid back unrounded"], ["o", "close-mid back rounded"],
      ["ə", "schwa"],
      ["ɛ", "open-mid front unrounded"], ["œ", "open-mid front rounded"],
      ["ɜ", "open-mid central unrounded"], ["ɞ", "open-mid central rounded"],
      ["ʌ", "open-mid back unrounded"], ["ɔ", "open-mid back rounded"],
      ["æ", "near-open front unrounded"], ["ɐ", "near-open central"],
      ["a", "open front unrounded"], ["ɶ", "open front rounded"],
      ["ɑ", "open back unrounded"], ["ɒ", "open back rounded"],
    ],
  },
  {
    id: "diacritics",
    label: "Diacritics",
    combining: true,
    keys: [
      ["̥", "voiceless (ring below)"], ["̊", "voiceless (ring above)"],
      ["̬", "voiced"], ["ʰ", "aspirated"], ["̹", "more rounded"],
      ["̜", "less rounded"], ["̟", "advanced"], ["̠", "retracted"],
      ["̈", "centralized"], ["̽", "mid-centralized"], ["̩", "syllabic"],
      ["̯", "non-syllabic"], ["˞", "rhoticity"], ["̤", "breathy voiced"],
      ["̰", "creaky voiced"], ["̼", "linguolabial"], ["ʷ", "labialized"],
      ["ʲ", "palatalized"], ["ˠ", "velarized"], ["ˤ", "pharyngealized"],
      ["̴", "velarized/pharyngealized"], ["̝", "raised"], ["̞", "lowered"],
      ["̘", "advanced tongue root"], ["̙", "retracted tongue root"],
      ["̪", "dental"], ["̺", "apical"], ["̻", "laminal"],
      ["̃", "nasalized"], ["ⁿ", "nasal release"], ["ˡ", "lateral release"],
      ["̚", "no audible release"], ["͡", "tie bar (above)"],
      ["͜", "tie bar (below)"], ["̆", "extra-short"], ["́", "high tone"],
      ["̀", "low tone"], ["̄", "mid tone"], ["̌", "rising tone"],
      ["̂", "falling tone"],
    ],
  },
  {
    id: "supra",
    label: "Supra­segmentals",
    keys: [
      ["ˈ", "primary stress"], ["ˌ", "secondary stress"], ["ː", "long"],
      ["ˑ", "half-long"], ["|", "minor (foot) group"], ["‖", "major (intonation) group"],
      [".", "syllable break"], ["‿", "linking"], ["ˤ", "pharyngealized"],
      ["˥", "extra high tone"], ["˦", "high tone"], ["˧", "mid tone"],
      ["˨", "low tone"], ["˩", "extra low tone"], ["↓", "downstep"], ["↑", "upstep"],
      ["↗", "global rise"], ["↘", "global fall"],
      ["∅", "null / zero morpheme"], ["Ø", "null / zero morpheme"],
    ],
  },
  {
    id: "gloss",
    label: "Gloss marks",
    keys: [
      ["-", "affix boundary"], ["=", "clitic boundary"], ["~", "reduplication"],
      ["<", "infix open"], [">", "infix close"], [".", "fusion / portmanteau"],
      [":", "fusion (alt.)"], ["\\", "inherent category"], ["[", "open bracket"],
      ["]", "close bracket"], ["∅", "zero"],
    ],
  },
];

/** Minimal X-SAMPA → IPA map for ASCII entry. */
export const XSAMPA = {
  "S": "ʃ", "Z": "ʒ", "T": "θ", "D": "ð", "N": "ŋ", "@": "ə", "3": "ɜ",
  "I": "ɪ", "U": "ʊ", "E": "ɛ", "O": "ɔ", "V": "ʌ", "Q": "ɒ", "{": "æ",
  "2": "ø", "9": "œ", "&": "ɶ", "6": "ɐ", "7": "ɤ", "1": "ɨ", "}": "ʉ",
  "M": "ɯ", "A": "ɑ", "y": "y", "J": "ɲ", "g": "ɡ", "G": "ɣ", "R": "ʁ",
  "X": "χ", "x": "x", "B": "β", "F": "ɱ", "H": "ɥ", "L": "ʎ", "P": "ʋ",
  "?": "ʔ", "4": "ɾ", "r\\": "ɹ", "j\\": "ʝ", "p\\": "ɸ", "t`": "ʈ",
  "d`": "ɖ", "n`": "ɳ", "s`": "ʂ", "z`": "ʐ", "l`": "ɭ", "r`": "ɽ",
  ":": "ː", '"': "ˈ", "%": "ˌ",
};

/** Convert a run of X-SAMPA to IPA (greedy, longest token first). */
export function xsampaToIpa(input) {
  const keys = Object.keys(XSAMPA).sort((a, b) => b.length - a.length);
  let out = "";
  let i = 0;
  while (i < input.length) {
    let matched = false;
    for (const k of keys) {
      if (input.startsWith(k, i)) {
        out += XSAMPA[k];
        i += k.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += input[i];
      i++;
    }
  }
  return out;
}
