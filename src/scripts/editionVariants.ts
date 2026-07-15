/**
 * 中文：把相邻的 1951／1961 版面板渐进增强为独立的版本切换框。
 * English: Progressively enhance adjacent 1951/1961 panels into local,
 * independently controlled edition switches.
 *
 * The rehype transform has already removed quotation semantics and marked the
 * panels. Without JavaScript both panels remain visible; this module only adds
 * the local control and hides the inactive panel after successful recognition.
 */

type Edition = "1951" | "1961";

const EDITIONS: Edition[] = ["1951", "1961"];

function uniqueId(prefix: string): string {
  let index = 1;
  let candidate = `${prefix}-${index}`;
  while (document.getElementById(candidate)) {
    index += 1;
    candidate = `${prefix}-${index}`;
  }
  return candidate;
}

function setPanelState(group: HTMLElement, edition: Edition, notify = true): void {
  group.dataset.edition = edition;

  group
    .querySelectorAll<HTMLElement>("[data-edition-panel]")
    .forEach((panel) => {
      const active = panel.dataset.editionPanel === edition;
      panel.dataset.editionActive = String(active);
      panel.setAttribute("aria-hidden", String(!active));
    });

  group
    .querySelectorAll<HTMLButtonElement>("[data-edition-choice]")
    .forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.editionChoice === edition),
      );
    });

  if (notify) {
    window.dispatchEvent(new CustomEvent("editionchange", { detail: { edition } }));
  }
}

function createSwitcher(
  groupId: string,
  panelIds: Record<Edition, string>,
): HTMLDivElement {
  const switcher = document.createElement("div");
  switcher.className = "edition-switch";
  switcher.setAttribute("role", "group");
  switcher.setAttribute("aria-label", "此段版本");

  EDITIONS.forEach((edition) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "edition-choice";
    button.dataset.editionChoice = edition;
    button.setAttribute("aria-controls", panelIds[edition]);
    button.setAttribute("aria-pressed", "false");
    button.textContent = edition;
    button.addEventListener("click", () => {
      const group = document.getElementById(groupId);
      if (group) setPanelState(group, edition);
    });
    switcher.append(button);
  });

  return switcher;
}

function enhancePair(first: HTMLElement, second: HTMLElement): void {
  if (first.closest("[data-edition-group]")) return;
  if (
    first.dataset.editionPanel !== "1951" ||
    second.dataset.editionPanel !== "1961"
  ) {
    return;
  }

  const groupId = uniqueId("edition-group");
  const panelIds: Record<Edition, string> = {
    "1951": `${groupId}-1951`,
    "1961": `${groupId}-1961`,
  };

  const group = document.createElement("section");
  group.id = groupId;
  group.className = "edition-group";
  group.dataset.editionGroup = "true";
  group.dataset.editionEnhanced = "true";
  group.setAttribute("aria-label", "版本對照段");

  const panels: Array<[HTMLElement, Edition]> = [
    [first, "1951"],
    [second, "1961"],
  ];
  panels.forEach(([panel, edition]) => {
    panel.id = panelIds[edition];
  });

  const switcher = createSwitcher(groupId, panelIds);
  first.parentNode?.insertBefore(group, first);
  group.append(switcher, first, second);
  setPanelState(group, "1961", false);
}

function enhanceBody(body: HTMLElement): void {
  const panels = Array.from(
    body.querySelectorAll<HTMLElement>("[data-edition-panel]"),
  ).filter((panel) => !panel.closest(".footnotes, [data-edition-group]"));
  if (!panels.length) return;

  const paired = new Set<HTMLElement>();
  panels.forEach((panel, index) => {
    const next = panels[index + 1];
    if (!next || panel.nextElementSibling !== next) return;
    if (panel.dataset.editionPanel !== "1951") return;
    if (next.dataset.editionPanel !== "1961") return;
    paired.add(panel);
    paired.add(next);
    enhancePair(panel, next);
  });

  panels.forEach((panel) => {
    if (!paired.has(panel)) return;
    panel.dataset.editionPaired = "true";
  });

  panels.forEach((panel) => {
    if (paired.has(panel)) return;
    const edition = panel.dataset.editionPanel as Edition | undefined;
    const label = panel.querySelector<HTMLElement>("[data-edition-label]");
    if (edition && label) label.textContent = `${edition} only`;
  });
}

export function initializeEditionVariants(): void {
  document
    .querySelectorAll<HTMLElement>(".writing-body")
    .forEach((body) => enhanceBody(body));
}
