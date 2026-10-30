/**
 * Kanbun kundoku (漢文訓読) typesetting engine.
 *
 * Ported from kanbunHTML by untunt — https://github.com/untunt/kanbunHTML
 * Original work © untunt, licensed under the GNU AGPL-3.0. This port keeps
 * that licence; if you redistribute or run it over a network you must offer
 * the corresponding source under the same terms (see the project link above).
 *
 * `toHTML` is pure (string → HTML string): it reads bracket-annotated kanbun
 * and emits the ruby/grid markup that the `.kanbun` styles lay out vertically.
 * Annotation brackets after a kanji:
 *   ( )  furigana 振り仮名      { }  okurigana 送り仮名 (the braces may be omitted)
 *   ‹ ›  furigana of saidoku    « »  okurigana of saidoku 再読文字
 *   [ ]  kaeriten 返り点
 * Special pieces: ‘…’ groups several kanji under one ruby base, “…” is a unit,
 * 〻 ninojiten, ― tateten.
 */

const brackets = {
    '(': ')', // furigana
    '{': '}', // okurigana (these brackets can be omitted)
    '‹': '›', // furigana of saidokumoji
    '«': '»', // okurigana of saidokumoji
    '[': ']', // kaeriten
    //'<': '>', // HTML tag
};
const leftBrackets = Object.keys(brackets);
const rightBrackets = Object.values(brackets);
const leftBracketsStr = '\\' + leftBrackets.join('\\');
const rightBracketsStr = '\\' + rightBrackets.join('\\');
const punctuationStr = '〻―・、，。…「」『』';

function escapeMarkup(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Explicit source forms stay attached to their own reading. Multiple readings
// occupy parallel ruby lanes rather than one unbroken, column-stretching string.
function renderReading(reading, tag = 'span') {
    const explicit = reading.match(/^([^〔〕]+)〔([^〔〕]+)〕$/u);
    const kana = explicit?.[1] ?? reading;
    const attributes = explicit
        ? ` data-kb-kana="${escapeMarkup(kana)}" data-kb-source="${escapeMarkup(explicit[2])}" title="${escapeMarkup(kana)} ⇄ ${escapeMarkup(explicit[2])}"`
        : '';
    return `<${tag} class="${tag === 'rt' ? 'furigana' : 'kb-reading'}"${attributes}>${escapeMarkup(kana)}</${tag}>`;
}

function renderReadings(reading) {
    const alternatives = reading.split(/[／/]/u).map((part) => part.trim());
    if (alternatives.length > 1 && alternatives.every(Boolean)) {
        return `<rt class="furigana kb-reading-lanes">${alternatives.map((part) => renderReading(part)).join('')}</rt>`;
    }
    return renderReading(reading, 'rt');
}

function isKana(str) {
    let code = str.charCodeAt();
    if (str === '・') return false; // ・ is in the katakana block but treated as punctuation here
    if (parseInt('3040', 16) <= code && code <= parseInt('30FF', 16)) return true; // Hiragana & Katakana
    if (parseInt('31F0', 16) <= code && code <= parseInt('31FF', 16)) return true; // Katakana Phonetic Extensions
    if (parseInt('FF66', 16) <= code && code <= parseInt('FF9F', 16)) return true; // Halfwidth Katakana
    return false;
}

function replaceBetween(str, left, right, from, to, condition = function () { return true; }) {
    return str.split(left).map(function (s) {
        if (!s.includes(right)) return s;
        s = s.split(right);
        s[0] = left + s[0] + right;
        if (condition(s[0])) s[0] = s[0].replace(from, to);
        return s.join('');
    }).join('');
}

export function toHTML(str) {
    // Lead-in dash run (e.g. "――タイトル"): a leading ― has no preceding unit to
    // attach to, so the engine would set the first as a kanji glyph and merge the
    // rest as punctuation into that one cell — they collide side by side. Pull the
    // run out and render it as a single transparent span; .kanbun-dash-lead draws
    // one continuous centred vertical rule over it (length follows the run).
    let lead = '';
    const leadMatch = str.match(/^―+/);
    if (leadMatch) {
        lead = `<span class="kanbun-dash-lead" aria-hidden="true">${'―'.repeat(leadMatch[0].length)}</span>`;
        str = str.slice(leadMatch[0].length);
    }
    // Initial kana have no preceding base to carry them. Keeping them in the
    // normal unit pass would create a closing unit without an opening unit
    // (and eventually malformed <span<span markup). Preserve their small-kana
    // style in a standalone annotation, without an empty kanji grid cell.
    let leadingOkurigana = '';
    let leadingEnd = 0;
    while (leadingEnd < str.length) {
        if (isKana(str[leadingEnd])) {
            leadingOkurigana += str[leadingEnd++];
        } else if (str[leadingEnd] === '{') {
            const closingBrace = str.indexOf('}', leadingEnd + 1);
            if (closingBrace === -1) break;
            leadingOkurigana += str.slice(leadingEnd + 1, closingBrace);
            leadingEnd = closingBrace + 1;
        } else {
            break;
        }
    }
    if (leadingEnd) {
        if (leadingOkurigana) lead += `<span class="kunten okurigana"><sup>${escapeMarkup(leadingOkurigana)}</sup></span>`;
        str = str.slice(leadingEnd);
    }
    let arr = [...str];
    for (let i = 0, lastBracketIndex = -1, inGroup = false; i < arr.length; i++) {
        const character = arr[i];
        if (character === '‘' && lastBracketIndex === -1) inGroup = true;
        if (leftBrackets.includes(arr[i])) lastBracketIndex = i;
        if (lastBracketIndex === -1) {
            if (isKana(arr[i]) && !inGroup) arr[i] = `{${arr[i]}}`;
            else arr[i] = `“⌊${arr[i]}⌋”`;
        }
        if (rightBrackets.includes(arr[i])) lastBracketIndex = -1;
        if (character === '’' && lastBracketIndex === -1) inGroup = false;
    }
    str = arr.join('');
    str = str.replace(/}{/g, '');
    str = str.replace(new RegExp(`”([${leftBracketsStr}])`, 'g'), '$1');
    str = str.replace(new RegExp(`([${rightBracketsStr}])(“)`, 'g'), '$1”$2');
    if (rightBrackets.includes(str.slice(-1))) str += '”';
    str = str.replace(/⌊‘⌋”/g, '‘');
    str = str.replace(/“⌊’⌋/g, '’');
    str = str.replace(new RegExp(`”“⌊([${punctuationStr}])⌋`, 'g'), '⦉$1⦊');
    // now, str has been fully annotated

    // process other brackets
    str = str.replace(/“/g, '<ruby class="unit">');
    str = str.replace(/(unit">‘)/g, 'has-multiple-kanji $1');
    str = str.replace(/(unit">‘([^⌊’]*⌊){2}[^⌊’]*’)/g, 'has-2-kanji $1');
    str = str.replace(/(unit">‘([^⌊’]*⌊){3}[^⌊’]*’)/g, 'has-3-kanji $1');
    str = str.replace(/(unit">(‘[^’]*’)?[^‘”]*\()/g, 'has-furigana $1');
    str = str.replace(/(unit">(‘[^’]*’)?[^‘”]*\([^\)]\))/g, 'has-only-1-furigana $1');
    str = str.replace(/(unit">(‘[^’]*’)?[^‘”]*\([^\)][^\)]?\))/g, 'has-less-than-3-furigana $1');
    str = str.replace(/(unit">(‘[^’]*’)?[^‘”]*”[^‘”]*has-furigana)/g, 'next-unit-has-furigana $1');
    str = str.replace(/(unit">(‘[^’]*’)?[^‘”]*\{)/g, 'has-okurigana $1');
    str = str.replace(/”/g, '</ruby>');
    str = str.replace(/⌊/g, '<rb class="kanji">');
    str = str.replace(/⌋/g, '</rb>');
    // no furigana, use no <ruby>
    while (str !== (str = str.replace(/(‘[^’]*<\/?)(ruby|rb)/g, '$1span'))); // inside kanji must have no ruby
    str = str.replace(/‘/g, '<rb class="kanji">');
    str = str.replace(/’/g, '</rb>');
    str = replaceBetween(str, '<ruby', '</ruby', /ruby|rb/g, 'span', function (s) { return !s.includes('('); });
    str = str.replace(/⦉/g, '<span class="kunten punctuation">');
    str = str.replace(/⦊/g, '</span>');
    str = str.replace(/(punctuation">)(〻)/g, 'ninojiten $1<sup>$2</sup>');
    str = str.replace(/(punctuation">―)/g, 'dash $1');
    str = str.replace(/(punctuation">…)/g, 'ellipsis $1');
    str = str.replace(/(punctuation">[」』])/g, 'right-corner-bracket $1');

    // process basic brackets
    str = str.replace(/\(([^()]*)\)/g, (_match, reading) => renderReadings(reading));
    str = str.replace(/\{/g, '<span class="kunten okurigana"><sup>');
    str = str.replace(/\}/g, '</sup></span>');

    str = str.replace(/‹/g, '<span class="kunten has-furigana saidoku"><sub class="saidoku-furigana">');
    str = str.replace(/(saidoku">[^›]*)›«/g, 'has-okurigana $1</sub><sub class="saidoku-okurigana">');
    str = str.replace(/«/g, '<span class="kunten has-okurigana saidoku"><sub class="saidoku-okurigana">');
    str = str.replace(/[›»]/g, '</sub></span>');

    str = str.replace(/\[(.)\]/g, '<span class="kunten kaeriten"><sub>$1</sub></span>');
    str = str.replace(/\[(.)(レ)\]/g, '<span class="kunten kaeriten"><sub>$1</sub><sub>$2</sub></span>');
    str = str.replace(/(kaeriten"><sub)(>一)/g, '$1 class="ichiten"$2');
    return lead + str;
}

/**
 * Render a whole textarea value: each line becomes a <p>, blank lines kept so
 * the column breaks where the writer intended.
 */
export function renderKanbun(text) {
    return text
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line === '' ? '<p class="kb-blank-column" aria-hidden="true"></p>' : `<p>${toHTML(line)}</p>`)
        .join('');
}
