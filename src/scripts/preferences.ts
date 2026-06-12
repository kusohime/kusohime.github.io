/**
 * 中文：管理公開網站的語言、明暗主題、字號和可選動畫。
 * English: Manages language, theme, font size, and optional public-site motion.
 */
import motionSettings from "../config/motion.json";
import typographySettings from "../config/typography.json";
import type {
  ToolGroup,
  WorkCategory,
  WritingType,
} from "../config/contentTaxonomy";
import {
  contentLanguageLabel,
  formatDate,
  formatDuration,
  localeCodes,
  localeInfo,
  toolGroupLabel,
  translate,
  workCategoryLabel,
  writingTypeLabel,
  type Locale,
  type TranslationKey,
} from "../config/locales";

type Theme = "light" | "dark";
type FontSize = "s" | "m" | "l";

const flapTimers = new WeakMap<HTMLElement, number>();

function readStored<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  try {
    const value = localStorage.getItem(key) as T | null;
    return value && allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function updatePressedState(selector: string, activeValue: string) {
  document.querySelectorAll<HTMLButtonElement>(selector).forEach((button) => {
    const value =
      button.dataset.languageOption ??
      button.dataset.themeOption ??
      button.dataset.fontSizeOption;
    button.setAttribute("aria-pressed", String(value === activeValue));
  });
}

function applyGuideLanguage(language: Locale) {
  const guideLanguage = language === "zh" ? "zh" : "en";
  document
    .querySelectorAll<HTMLElement>("[data-guide-language]")
    .forEach((element) => {
      element.hidden = element.dataset.guideLanguage !== guideLanguage;
    });
}

function translationFor(element: HTMLElement, language: Locale) {
  if (language === "zh") return element.dataset.i18nZh ?? element.dataset.i18nEn;
  if (language === "de") return element.dataset.i18nDe ?? element.dataset.i18nEn;
  if (language === "fr") return element.dataset.i18nFr ?? element.dataset.i18nEn;
  if (language === "ja") return element.dataset.i18nJa ?? element.dataset.i18nEn;
  return element.dataset.i18nEn;
}

function setFlapText(element: HTMLElement, text: string) {
  const existingTimer = flapTimers.get(element);
  if (existingTimer) window.clearTimeout(existingTimer);

  const glyphs = Array.from(text);
  const fragment = document.createDocumentFragment();
  const accessibleText = document.createElement("span");
  accessibleText.className = "visually-hidden";
  accessibleText.textContent = text;
  fragment.append(accessibleText);

  let longestDelay = 0;
  glyphs.forEach((glyph, index) => {
    const flap = document.createElement("span");
    const patternedDelay = Math.min(index * 4, 110);
    const laneDelay = (index % 6) * 5;
    const jitter = Math.random() * 65;
    const delay = Math.round(patternedDelay + laneDelay + jitter);
    longestDelay = Math.max(longestDelay, delay);

    flap.className = "flap-glyph";
    flap.ariaHidden = "true";
    flap.textContent = glyph === " " ? "\u00a0" : glyph;
    flap.style.setProperty("--flap-delay", `${delay}ms`);
    flap.style.setProperty(
      "--flap-lean",
      `${(Math.random() * 4 - 2).toFixed(2)}deg`,
    );
    fragment.append(flap);
  });

  element.replaceChildren(fragment);
  element.dataset.flapping = "true";
  const timer = window.setTimeout(() => {
    element.textContent = text;
    delete element.dataset.flapping;
    flapTimers.delete(element);
  }, longestDelay + 190);
  flapTimers.set(element, timer);
}

function setLocalizedText(element: HTMLElement, text: string, animate: boolean) {
  if (animate) {
    setFlapText(element, text);
  } else {
    const existingTimer = flapTimers.get(element);
    if (existingTimer) window.clearTimeout(existingTimer);
    flapTimers.delete(element);
    element.textContent = text;
    delete element.dataset.flapping;
  }
}

function applyLanguage(language: Locale, animate = false) {
  const shouldAnimate = animate && motionSettings.languageFlap;
  const root = document.documentElement;
  root.lang = localeInfo[language].htmlLang;
  root.dataset.locale = language;
  root.style.setProperty(
    "--cjk-letter-spacing",
    `${typographySettings.cjkLetterSpacingEm}em`,
  );

  document.querySelectorAll<HTMLElement>("[data-i18n-key]").forEach((element) => {
    const key = element.dataset.i18nKey as TranslationKey;
    setLocalizedText(element, translate(language, key), shouldAnimate);
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-en]").forEach((element) => {
    const translation = translationFor(element, language);
    if (translation !== undefined) {
      setLocalizedText(element, translation, shouldAnimate);
    }
  });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-work-category]")
    .forEach((element) => {
      const category = element.dataset.i18nWorkCategory as WorkCategory;
      setLocalizedText(
        element,
        workCategoryLabel(category, language),
        shouldAnimate,
      );
    });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-writing-type]")
    .forEach((element) => {
      const type = element.dataset.i18nWritingType as WritingType;
      const form =
        element.dataset.writingTypeForm === "plural" ? "plural" : "singular";
      setLocalizedText(
        element,
        writingTypeLabel(type, language, form),
        shouldAnimate,
      );
    });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-tool-group]")
    .forEach((element) => {
      const group = element.dataset.i18nToolGroup as ToolGroup;
      setLocalizedText(element, toolGroupLabel(group, language), shouldAnimate);
    });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-content-language]")
    .forEach((element) => {
      const contentLanguage = element.dataset.i18nContentLanguage ?? "";
      setLocalizedText(
        element,
        contentLanguageLabel(contentLanguage, language),
        shouldAnimate,
      );
    });

  document.querySelectorAll<HTMLElement>("[data-i18n-date]").forEach((element) => {
    const date = element.dataset.i18nDate ?? "";
    setLocalizedText(element, formatDate(date, language), shouldAnimate);
  });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-duration]")
    .forEach((element) => {
      const minutes = element.dataset.durationMinutes
        ? Number(element.dataset.durationMinutes)
        : undefined;
      setLocalizedText(
        element,
        formatDuration(
          {
            minutes,
            continuous: element.dataset.durationContinuous === "true",
            approximate: element.dataset.durationApproximate === "true",
          },
          language,
        ),
        shouldAnimate,
      );
  });

  document.querySelectorAll<HTMLElement>("[data-current-language]").forEach((element) => {
    setLocalizedText(element, localeInfo[language].short, shouldAnimate);
  });

  const currentTheme = (document.documentElement.dataset.theme ?? "light") as Theme;
  updateThemeToggleLabel(currentTheme, language);
  applyGuideLanguage(language);
  updatePressedState("[data-language-option]", language);
  store("yc-language", language);
}

function updateThemeToggleLabel(theme: Theme, language: Locale) {
  const label = translate(
    language,
    theme === "light" ? "theme.toDark" : "theme.toLight",
  );

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", label);
    button.title = label;
  });
}

function activeLanguage(): Locale {
  const language = document.documentElement.lang;
  if (language === "zh-Hant-TW") return "zh";
  if (language === "de") return "de";
  if (language === "fr") return "fr";
  if (language === "ja") return "ja";
  return "en";
}

function applyTheme(theme: Theme, language: Locale, animate = false) {
  const shouldAnimate = animate && motionSettings.themeFade;
  if (shouldAnimate) {
    document.documentElement.dataset.themeTransition = "true";
    window.setTimeout(() => {
      delete document.documentElement.dataset.themeTransition;
    }, 360);
  }

  document.documentElement.dataset.theme = theme;
  document.dispatchEvent(
    new CustomEvent("yc-theme-change", {
      detail: { theme, animate: animate && motionSettings.glyphRotation },
    }),
  );
  updateThemeToggleLabel(theme, language);
  store("yc-theme", theme);
}

function applyFontSize(fontSize: FontSize, animate = false) {
  const currentSize =
    (document.documentElement.dataset.fontSize as FontSize | undefined) ?? "m";
  if (animate && motionSettings.fontSizeScale && currentSize !== fontSize) {
    const sizes: FontSize[] = ["s", "m", "l"];
    document.documentElement.dataset.fontSizeTransition =
      sizes.indexOf(fontSize) > sizes.indexOf(currentSize) ? "grow" : "shrink";
    window.setTimeout(() => {
      delete document.documentElement.dataset.fontSizeTransition;
    }, 280);
  }

  document.documentElement.dataset.fontSize = fontSize;
  document.querySelectorAll<HTMLElement>("[data-current-font-size]").forEach((element) => {
    element.textContent = fontSize.toUpperCase();
  });
  updatePressedState("[data-font-size-option]", fontSize);
  store("yc-font-size", fontSize);
}

export function initializePreferences() {
  const root = document.documentElement;
  root.dataset.motionLanguage = String(motionSettings.languageFlap);
  root.dataset.motionTheme = String(motionSettings.themeFade);
  root.dataset.motionFontSize = String(motionSettings.fontSizeScale);
  root.dataset.motionGlyphs = String(motionSettings.glyphRotation);
  root.dataset.motionInterface = String(motionSettings.interfaceMotion);

  const language = readStored<Locale>("yc-language", localeCodes, "en");
  const theme = readStored<Theme>("yc-theme", ["light", "dark"], "light");
  const fontSize = readStored<FontSize>("yc-font-size", ["s", "m", "l"], "m");

  applyTheme(theme, language);
  applyFontSize(fontSize);
  applyLanguage(language);

  document.querySelectorAll<HTMLButtonElement>("[data-language-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.languageOption as Locale, true);
      button.closest("details")?.removeAttribute("open");
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      applyTheme(
        currentTheme === "light" ? "dark" : "light",
        activeLanguage(),
        true,
      );
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-font-size-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyFontSize(button.dataset.fontSizeOption as FontSize, true);
      button.closest("details")?.removeAttribute("open");
    });
  });

  const menus = document.querySelectorAll<HTMLDetailsElement>("[data-preference-menu]");
  menus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      menus.forEach((otherMenu) => {
        if (otherMenu !== menu) otherMenu.open = false;
      });
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Node && !document.querySelector(".header-tools")?.contains(target)) {
      menus.forEach((menu) => {
        menu.open = false;
      });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menus.forEach((menu) => {
        menu.open = false;
      });
    }
  });
}
