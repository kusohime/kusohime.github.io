/**
 * Styles names and letter case while retaining original spelling, localized
 * content, links, and accessible labels.
 */
const skippedContent = [
  "script",
  "style",
  "noscript",
  "template",
  "code",
  "pre",
  "kbd",
  "samp",
  "textarea",
  "input",
  "select",
  "option",
  "svg",
  "canvas",
  "math",
  "mjx-container",
  ".katex",
  ".visually-hidden",
  ".flap-glyph",
  "[data-flapping='true']",
  "[contenteditable]:not([contenteditable='false'])",
];

const nameSkipSelector = [
  ...skippedContent,
  ".personal-name",
  ".name-pronunciation",
].join(",");

const caseSkipSelector = [
  ...skippedContent,
  "ruby",
  "rt",
  "rp",
  ".kanbun",
  ".igt-block",
  ".small-caps-lowercase",
  ".all-caps-run",
].join(",");

const smallCapsSelector = [
  ".header-row",
  ".personal-name",
  ".name-pronunciation",
  ".category-navigation",
  ".catalog-rail",
  ".works-index .category-group > h2",
  ".writing-contents-rail",
  ".tool-rail",
  ".blog-small-caps",
].join(",");

const namePattern = /\bYixin\s+Cui\b/g;
let initialized = false;
let refreshTimer = 0;

function refreshNameSmallCaps(): void {
  if (!document.body) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      return parent &&
        !parent.closest(nameSkipSelector) &&
        /\bYixin\s+Cui\b/.test(node.textContent ?? "")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  // Collect first so replacing a text node never changes the walker's position.
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const text = node.textContent ?? "";
    const fragment = document.createDocumentFragment();
    let offset = 0;

    for (const match of text.matchAll(namePattern)) {
      const index = match.index ?? 0;
      fragment.append(document.createTextNode(text.slice(offset, index)));
      const name = document.createElement("span");
      name.className = "personal-name";
      name.textContent = match[0];
      fragment.append(name);
      offset = index + match[0].length;
    }

    fragment.append(document.createTextNode(text.slice(offset)));
    node.replaceWith(fragment);
  });
}

function refreshLetterCase(): void {
  if (!document.body) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      return parent &&
        !parent.closest(caseSkipSelector) &&
        /\p{Script=Latin}/u.test(node.textContent ?? "")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const text = node.textContent ?? "";
    const usesSmallCaps = Boolean(node.parentElement?.closest(smallCapsSelector));
    const fragment = document.createDocumentFragment();
    let offset = 0;
    let changed = false;

    for (const match of text.matchAll(/\p{Script=Latin}[\p{Script=Latin}\p{M}]*/gu)) {
      const index = match.index ?? 0;
      const word = match[0];
      fragment.append(document.createTextNode(text.slice(offset, index)));
      const isAllCaps = [...word.replace(/\p{M}/gu, "")].length > 1 &&
        word === word.toUpperCase() && word !== word.toLowerCase();

      if (isAllCaps) {
        const capitals = document.createElement("span");
        capitals.className = "all-caps-run";
        capitals.textContent = word;
        fragment.append(capitals);
        changed = true;
      } else if (usesSmallCaps) {
        let wordOffset = 0;
        for (const lowercase of word.matchAll(/\p{Ll}[\p{Ll}\p{M}]*/gu)) {
          const lowerIndex = lowercase.index ?? 0;
          fragment.append(document.createTextNode(word.slice(wordOffset, lowerIndex)));
          const smallCapitals = document.createElement("span");
          smallCapitals.className = "small-caps-lowercase";
          smallCapitals.textContent = lowercase[0];
          fragment.append(smallCapitals);
          wordOffset = lowerIndex + lowercase[0].length;
          changed = true;
        }
        fragment.append(document.createTextNode(word.slice(wordOffset)));
      } else {
        fragment.append(document.createTextNode(word));
      }
      offset = index + word.length;
    }

    if (!changed) return;
    fragment.append(document.createTextNode(text.slice(offset)));
    node.replaceWith(fragment);
  });
}

function refreshTypography(): void {
  refreshNameSmallCaps();
  refreshLetterCase();
}

export function initializeNameSmallCaps(): void {
  if (initialized) return;
  initialized = true;

  const start = () => {
    refreshTypography();
    document.addEventListener("yc-language-applied", () => {
      refreshTypography();
      if (refreshTimer) window.clearTimeout(refreshTimer);
      // Language flap animations restore their final text after the event.
      refreshTimer = window.setTimeout(refreshTypography, 520);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
