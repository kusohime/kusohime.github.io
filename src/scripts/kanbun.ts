/** Shared enhancements for kanbun in works, writings, and the live tool. */
const loanwordSources: Record<string, string> = {
  あすとら: "astra",
  へりおとろぷ: "heliotropism",
  りびど: "libido",
  じゅいさんす: "jouissance",
  だいなみっく: "dynamics",
  ジャスミン: "jasmine",
  フィロソフィー: "philosophy",
};

function enhanceReadings(kanbun: HTMLElement): void {
  kanbun.querySelectorAll<HTMLElement>("rt.furigana, .kb-reading").forEach((reading) => {
    if (reading.dataset.kbReadingReady || reading.classList.contains("kb-reading-lanes")) return;
    const kana = reading.dataset.kbKana ?? reading.textContent ?? "";
    const source = reading.dataset.kbSource ?? loanwordSources[kana];
    if (!source) return;
    reading.dataset.kbReadingReady = "true";
    reading.classList.add("kb-flip");
    reading.setAttribute("role", "button");
    reading.setAttribute("tabindex", "0");
    reading.title = `${kana} ⇄ ${source}`;

    // Both faces keep their intrinsic space, so a flip cannot collide with the
    // next word or move the poem's columns. Only the active face is announced.
    const kanaFace = document.createElement("span");
    kanaFace.className = "kb-reading-face";
    kanaFace.dataset.kbFace = "kana";
    kanaFace.textContent = kana;
    const sourceFace = document.createElement("span");
    sourceFace.className = "kb-reading-face";
    sourceFace.dataset.kbFace = "source";
    sourceFace.textContent = source;
    sourceFace.setAttribute("aria-hidden", "true");
    reading.replaceChildren(kanaFace, sourceFace);

    const setFlipped = (flipped: boolean) => {
      reading.classList.toggle("kb-flipped", flipped);
      reading.setAttribute("aria-pressed", String(flipped));
      reading.setAttribute("aria-label", flipped
        ? `${source} — ${kana} に切り替え / show ${kana}`
        : `${kana} — ${source} に切り替え / show ${source}`);
      kanaFace.setAttribute("aria-hidden", String(flipped));
      sourceFace.setAttribute("aria-hidden", String(!flipped));
    };
    const flip = () => setFlipped(reading.getAttribute("aria-pressed") !== "true");
    reading.addEventListener("click", flip);
    reading.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        flip();
      }
    });
    setFlipped(false);
  });
}

export function setKanbunLayout(kanbun: HTMLElement, dense: boolean): void {
  const embed = kanbun.closest<HTMLElement>(".kanbun-scroll, .kb-preview-wrap")
    ?? kanbun.closest<HTMLElement>("[data-kanbun-embed]");
  const previousRange = embed ? embed.scrollWidth - embed.clientWidth : 0;
  const position = embed && previousRange > 0
    ? Math.min(1, Math.max(0, embed.scrollLeft / previousRange))
    : 1;
  kanbun.classList.toggle("betagumi", dense);
  if (embed) {
    window.requestAnimationFrame(() => {
      embed.scrollLeft = Math.max(0, embed.scrollWidth - embed.clientWidth) * position;
    });
  }
}

export function initializeKanbun(root: ParentNode = document): void {
  const kanbuns = [...root.querySelectorAll<HTMLElement>(".kanbun")];
  if (root instanceof HTMLElement && root.matches(".kanbun")) kanbuns.unshift(root);
  kanbuns.forEach((kanbun) => {
    const figure = kanbun.closest<HTMLElement>("[data-kanbun-embed]");
    // Keep the controls outside the poem's horizontal scroller. Otherwise the
    // browser scrolls an offscreen toggle into view before its click fires.
    if (figure && kanbun.parentElement === figure) {
      const scroller = document.createElement("div");
      scroller.className = "kanbun-scroll";
      kanbun.before(scroller);
      scroller.append(kanbun);
    }
    const embed = kanbun.closest<HTMLElement>(".kanbun-scroll, .kb-preview-wrap") ?? figure;
    // Align after every live tool edit, as well as after initial font loading.
    const alignToReadingStart = () => {
      if (!embed) return;
      window.requestAnimationFrame(() => {
        embed.scrollLeft = embed.scrollWidth;
      });
    };
    alignToReadingStart();
    if (!kanbun.dataset.kbEnhanced) {
      kanbun.dataset.kbEnhanced = "true";
      if (embed) {
        // Vertical-rl text begins at the visual right edge, including once web
        // font metrics settle.
        document.fonts?.ready.then(alignToReadingStart).catch(() => undefined);

        const toggles = (figure ?? embed).querySelectorAll<HTMLButtonElement>("[data-kb-layout]");
        toggles.forEach((button) => {
          button.addEventListener("click", () => {
            setKanbunLayout(kanbun, button.dataset.kbLayout === "dense");
            toggles.forEach((toggle) => toggle.setAttribute("aria-pressed", String(toggle === button)));
          });
        });
      }
    }

    // Quotes may continue across columns. Recompute after a live tool edit.
    kanbun.querySelectorAll(".kb-quote").forEach((element) => element.classList.remove("kb-quote"));
    const walker = document.createTreeWalker(kanbun, NodeFilter.SHOW_TEXT);
    let inQuote = false;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent ?? "";
      if (text.includes("「")) inQuote = true;
      if (inQuote) node.parentElement?.classList.add("kb-quote");
      if (text.includes("」")) inQuote = false;
    }
    enhanceReadings(kanbun);
  });
}
