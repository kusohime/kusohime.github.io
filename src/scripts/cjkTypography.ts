import { inferCjkLang, type CjkLang } from "../utils/cjkLanguage";

/**
 * Marks CJK runs and punctuation for correct font shaping, and adds a measured
 * fallback gap between CJK and Latin/number runs when the browser does not
 * support CSS text-autospace yet.
 */
const skipSelector = [
  "code",
  "pre",
  "kbd",
  "samp",
  "textarea",
  "input",
  "select",
  "option",
  "script",
  "style",
  "svg",
  "canvas",
  "math",
  "mjx-container",
  "ruby",
  "rt",
  "rp",
  ".katex",
  ".katex-display",
  ".kanbun",
  ".flap-glyph",
  ".visually-hidden",
  "[data-flapping='true']",
  "[data-cjk-autospace='off']",
].join(",");

const cjkPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const westernPattern = /[\p{Script=Latin}\p{Nd}]/u;
const cjkPunctuationPattern = /[、。，．！？；：：「」『』（）《》〈〉【】〔〕［］｛｝—…]/u;

let initialized = false;
let refreshTimer = 0;

function hasNativeAutospace() {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return false;
  }

  return (
    CSS.supports("text-autospace", "ideograph-alpha") ||
    CSS.supports("text-autospace", "ideograph-alpha ideograph-numeric") ||
    CSS.supports("text-autospace: ideograph-alpha")
  );
}

function isCjk(char: string) {
  return cjkPattern.test(char);
}

function isWestern(char: string) {
  return westernPattern.test(char);
}

function isCjkPunctuation(char: string) {
  return cjkPunctuationPattern.test(char);
}

function needsAutospace(left: string, right: string) {
  return (isCjk(left) && isWestern(right)) || (isWestern(left) && isCjk(right));
}

function parentShouldBeSkipped(parent: ParentNode | null) {
  return parent instanceof Element && Boolean(parent.closest(skipSelector));
}

function appendSpacer(fragment: DocumentFragment) {
  const spacer = document.createElement("span");
  spacer.className = "cjk-autospace";
  spacer.setAttribute("aria-hidden", "true");
  fragment.append(spacer);
}

function nearestLang(parent: ParentNode | null) {
  if (parent instanceof Element) {
    return parent.closest("[lang]")?.getAttribute("lang") ?? document.documentElement.lang;
  }
  return document.documentElement.lang;
}

function cjkLangFor(text: string, parent: ParentNode | null) {
  const inherited = nearestLang(parent);
  let fallback: CjkLang = "zh";
  if (inherited?.startsWith("zh-Hans")) fallback = "zh-Hans-CN";
  if (inherited?.startsWith("zh-Hant")) fallback = "zh-Hant-TW";
  if (inherited?.startsWith("ja")) fallback = "ja";
  return inferCjkLang(text, fallback);
}

function appendTextSpan(
  fragment: DocumentFragment,
  className: "cjk-run" | "cjk-punctuation",
  text: string,
  parent: ParentNode | null,
) {
  const span = document.createElement("span");
  span.className = className;
  span.lang = cjkLangFor(text, parent);
  span.textContent = text;
  fragment.append(span);
}

function unwrapGeneratedSpans(root: HTMLElement) {
  root.querySelectorAll(".cjk-run, .cjk-punctuation").forEach((span) => {
    span.replaceWith(...Array.from(span.childNodes));
  });
}

function typesetTextNode(node: Text, useAutospaceFallback: boolean) {
  const text = node.nodeValue ?? "";
  if (!text || parentShouldBeSkipped(node.parentNode)) return;

  const chars = Array.from(text);
  let plainBuffer = "";
  let cjkBuffer = "";
  let changed = false;
  const fragment = document.createDocumentFragment();

  const flushPlain = () => {
    if (!plainBuffer) return;
    fragment.append(document.createTextNode(plainBuffer));
    plainBuffer = "";
  };

  const flushCjk = () => {
    if (!cjkBuffer) return;
    appendTextSpan(fragment, "cjk-run", cjkBuffer, node.parentNode);
    cjkBuffer = "";
  };

  chars.forEach((char, index) => {
    const previous = chars[index - 1];
    if (useAutospaceFallback && previous && needsAutospace(previous, char)) {
      flushPlain();
      flushCjk();
      appendSpacer(fragment);
      changed = true;
    }

    if (isCjkPunctuation(char)) {
      flushPlain();
      flushCjk();
      appendTextSpan(fragment, "cjk-punctuation", char, node.parentNode);
      changed = true;
      return;
    }

    if (isCjk(char)) {
      flushPlain();
      cjkBuffer += char;
      changed = true;
      return;
    }

    flushCjk();
    plainBuffer += char;
  });

  if (!changed) return;
  flushPlain();
  flushCjk();
  node.parentNode?.replaceChild(fragment, node);
}

export function refreshCjkTypography() {
  const root = document.body;
  if (!root) return;

  root.querySelectorAll(".cjk-autospace").forEach((spacer) => spacer.remove());
  unwrapGeneratedSpans(root);
  root.normalize();
  const useAutospaceFallback = !hasNativeAutospace();

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }
  textNodes.forEach((node) => typesetTextNode(node, useAutospaceFallback));
}

function scheduleRefresh(delay = 0) {
  if (refreshTimer) window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(refreshCjkTypography, delay);
}

export function initializeCjkTypography() {
  if (initialized) return;
  initialized = true;

  const windowWithCjk = window as Window & {
    ycRefreshCjkTypography?: () => void;
  };
  windowWithCjk.ycRefreshCjkTypography = () => scheduleRefresh();

  const start = () => {
    scheduleRefresh();
    document.addEventListener("yc-language-applied", () => {
      scheduleRefresh();
      window.setTimeout(refreshCjkTypography, 520);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
