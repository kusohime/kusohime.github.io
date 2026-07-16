/**
 * 中文：管理公開網站的語言、明暗主題、字號、字體和可選動畫。
 * English: Manages language, theme, font size, typeface, and optional public-site motion.
 */
import motionSettings from "../config/motion.json";
import siteDefaults from "../config/siteDefaults.json";
import typographySettings from "../config/typography.json";
import { initializeCjkTypography } from "./cjkTypography";
import { renderSafeInlineMarkdown } from "../lib/safeHtml.js";
import type {
  ToolGroup,
  WorkCategory,
  WritingType,
} from "../config/contentTaxonomy";
import {
  contentLanguageLabel,
  formatCommission,
  formatDate,
  formatDedication,
  formatDuration,
  formatPremiere,
  localeCodes,
  localeInfo,
  toolGroupLabel,
  translate,
  workCategoryLabel,
  writingTypeLabel,
  type Locale,
  type TranslationKey,
} from "../config/locales";
import { toolTopicBlurb, toolTopicLabel } from "../config/toolTopics";

type Theme = "light" | "dark";
// 中文：字号只有两档——S（預設緊湊）與 L（較大閱讀字號）。
// English: Two text sizes only — S (the compact default) and L (larger reading size).
type FontSize = "s" | "l";
type FontFamily = "modern-mono" | "garamond";

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
      button.dataset.fontSizeOption ??
      button.dataset.fontFamilyOption;
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
  if (language === "zh") {
    return (element.dataset.i18nZh ?? element.dataset.i18nEn)?.replaceAll(
      "Yixin Cui",
      "崔浥新",
    );
  }
  return element.dataset.i18nEn;
}

function unavailableLanguageLabel(target: Locale, interfaceLanguage: Locale) {
  if (interfaceLanguage === "zh") {
    return target === "en" ? "英文不可用" : "中文不可用";
  }
  return target === "en" ? "English unavailable" : "Chinese unavailable";
}

function updateLanguageAvailability(language: Locale) {
  const unavailable = new Set(
    (document.documentElement.dataset.unavailableLanguages ?? "")
      .split(/\s+/)
      .filter(Boolean) as Locale[],
  );

  // 中文：切换钮的标题描述动作（切到另一语言），必要时附上「本页无该语言正文」提示。
  // English: The toggle's label names the action (switch to the other language),
  // with a page-availability hint appended when relevant.
  document
    .querySelectorAll<HTMLButtonElement>("[data-language-toggle]")
    .forEach((button) => {
      const target: Locale = language === "en" ? "zh" : "en";
      const action = language === "en" ? "切換至中文" : "Switch to English";
      const hint = unavailable.has(target)
        ? ` — ${unavailableLanguageLabel(target, language)}`
        : "";
      button.dataset.currentLanguageUnavailable = String(unavailable.has(language));
      button.title = `${action}${hint}`;
      button.setAttribute("aria-label", `${action}${hint}`);
    });
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

// 中文：元数据（题献／首演／乐器编制／合作人员）可含行内 Markdown 链接或强调。
// 含标记时渲染为 HTML（放弃逐字翻牌动画）；纯文本仍走 setLocalizedText 以保留动画。
// English: Metadata (dedication / première / instrumentation / credits) may carry
// inline Markdown links or emphasis. When markup is present, render HTML (dropping
// the per-character flap); plain text still flaps via setLocalizedText.
const INLINE_MARKDOWN = /\[[^\]]+\]\([^)\s]+\)|\*\*?[^*]+\*\*?/;

function setLocalizedRich(element: HTMLElement, text: string, animate: boolean) {
  if (element.hasAttribute("data-i18n-rich") || INLINE_MARKDOWN.test(text)) {
    const existingTimer = flapTimers.get(element);
    if (existingTimer) window.clearTimeout(existingTimer);
    flapTimers.delete(element);
    element.innerHTML = renderSafeInlineMarkdown(text);
    delete element.dataset.flapping;
  } else {
    setLocalizedText(element, text, animate);
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
      setLocalizedRich(element, translation, shouldAnimate);
    }
  });

  document
    .querySelectorAll<HTMLMetaElement>("[data-i18n-content-en]")
    .forEach((element) => {
      const text = language === "zh"
        ? element.dataset.i18nContentZh ?? element.dataset.i18nContentEn
        : element.dataset.i18nContentEn;
      if (text !== undefined) {
        element.content = language === "zh"
          ? text.replaceAll("Yixin Cui", "崔浥新")
          : text;
      }
    });

  document
    .querySelectorAll<HTMLTitleElement>("[data-i18n-title-en]")
    .forEach((element) => {
      const text = language === "zh"
        ? element.dataset.i18nTitleZh ?? element.dataset.i18nTitleEn
        : element.dataset.i18nTitleEn;
      if (text !== undefined) {
        element.textContent = language === "zh"
          ? text.replaceAll("Yixin Cui", "崔浥新")
          : text;
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
    .querySelectorAll<HTMLElement>("[data-i18n-tool-topic]")
    .forEach((element) => {
      const topic = element.dataset.i18nToolTopic ?? "";
      setLocalizedText(element, toolTopicLabel(topic, language), shouldAnimate);
    });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-tool-topic-blurb]")
    .forEach((element) => {
      const topic = element.dataset.i18nToolTopicBlurb ?? "";
      setLocalizedText(element, toolTopicBlurb(topic, language), shouldAnimate);
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
    const monthStyle =
      element.dataset.i18nDateFormat === "short"
        ? "short"
        : element.dataset.i18nDateFormat === "month"
          ? "month"
          : "long";
    setLocalizedText(element, formatDate(date, language, monthStyle), shouldAnimate);
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

  document
    .querySelectorAll<HTMLElement>("[data-i18n-dedication]")
    .forEach((element) => {
      setLocalizedRich(
        element,
        formatDedication(
          {
            en: element.dataset.dedicationEn ?? "",
            zh: element.dataset.dedicationZh,
          },
          language,
        ),
        shouldAnimate,
      );
    });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-commission]")
    .forEach((element) => {
      setLocalizedRich(
        element,
        formatCommission(
          {
            en: element.dataset.commissionEn ?? "",
            zh: element.dataset.commissionZh,
          },
          language,
        ),
        shouldAnimate,
      );
    });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-premiere]")
    .forEach((element) => {
      setLocalizedRich(
        element,
        formatPremiere(
          {
            date: element.dataset.premiereDate,
            by: {
              en: element.dataset.premiereByEn ?? "",
              zh: element.dataset.premiereByZh,
            },
            venue: element.dataset.premiereVenueEn
              ? {
                  en: element.dataset.premiereVenueEn,
                  zh: element.dataset.premiereVenueZh,
                }
              : undefined,
          },
          language,
        ),
        shouldAnimate,
      );
    });

  document.querySelectorAll<HTMLElement>("[data-current-language]").forEach((element) => {
    setLocalizedText(element, localeInfo[language].short, shouldAnimate);
  });

  updateLanguageAvailability(language);

  const currentTheme = (document.documentElement.dataset.theme ?? "light") as Theme;
  const currentFontFamily =
    (document.documentElement.dataset.fontFamily as FontFamily | undefined) ??
    "modern-mono";
  updateThemeToggleLabel(currentTheme, language);
  updateFontFamilyToggleLabel(currentFontFamily, language);
  applyGuideLanguage(language);
  updatePressedState("[data-language-option]", language);
  store("yc-language", language);
  document.dispatchEvent(
    new CustomEvent("yc-language-applied", { detail: { language, animate } }),
  );
  (window as Window & { ycRefreshCjkTypography?: () => void })
    .ycRefreshCjkTypography?.();
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

function updateFontFamilyToggleLabel(fontFamily: FontFamily, language: Locale) {
  const nextFontFamily: FontFamily =
    fontFamily === "modern-mono" ? "garamond" : "modern-mono";
  const label = translate(
    language,
    nextFontFamily === "garamond" ? "font.toGaramond" : "font.toModernMono",
  );

  document
    .querySelectorAll<HTMLButtonElement>("[data-font-family-toggle]")
    .forEach((button) => {
      button.dataset.nextFontFamily = nextFontFamily;
      button.setAttribute("aria-label", label);
      button.title = label;
    });
}

function activeLanguage(): Locale {
  const language = document.documentElement.lang;
  if (language === "zh-Hant-TW") return "zh";
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
    (document.documentElement.dataset.fontSize as FontSize | undefined) ?? "s";
  if (animate && motionSettings.fontSizeScale && currentSize !== fontSize) {
    const sizes: FontSize[] = ["s", "l"];
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

function applyFontFamily(fontFamily: FontFamily, language: Locale) {
  document.documentElement.dataset.fontFamily = fontFamily;
  updateFontFamilyToggleLabel(fontFamily, language);
  updatePressedState("[data-font-family-option]", fontFamily);
  store("yc-font-family", fontFamily);
  document.dispatchEvent(
    new CustomEvent("yc-font-family-change", { detail: { fontFamily } }),
  );
}

export function initializePreferences() {
  initializeCjkTypography();

  const root = document.documentElement;
  const windowWithFlapText = window as Window & {
    ycSetFlapText?: (element: HTMLElement, text: string, animate?: boolean) => void;
  };
  windowWithFlapText.ycSetFlapText = (element, text, animate = true) => {
    if (!(element instanceof HTMLElement)) return;
    setLocalizedText(element, text, animate && motionSettings.languageFlap);
  };

  root.dataset.motionLanguage = String(motionSettings.languageFlap);
  root.dataset.motionTheme = String(motionSettings.themeFade);
  root.dataset.motionFontSize = String(motionSettings.fontSizeScale);
  root.dataset.motionGlyphs = String(motionSettings.glyphRotation);
  root.dataset.motionInterface = String(motionSettings.interfaceMotion);

  // 新访客的默认语言来自 src/config/siteDefaults.json（可在 Studio 中修改）。
  // New visitors start in the language set in src/config/siteDefaults.json.
  const fallbackLanguage = (localeCodes as readonly string[]).includes(
    siteDefaults.defaultLanguage,
  )
    ? (siteDefaults.defaultLanguage as Locale)
    : "en";
  const language = readStored<Locale>("yc-language", localeCodes, fallbackLanguage);
  const fallbackTheme: Theme = siteDefaults.defaultTheme === "dark" ? "dark" : "light";
  const fallbackFontSize: FontSize = siteDefaults.defaultFontSize === "l" ? "l" : "s";
  const fallbackFontFamily: FontFamily =
    siteDefaults.defaultFontFamily === "garamond" ? "garamond" : "modern-mono";
  const theme = readStored<Theme>("yc-theme", ["light", "dark"], fallbackTheme);
  const fontSize = readStored<FontSize>("yc-font-size", ["s", "l"], fallbackFontSize);
  const fontFamily = readStored<FontFamily>(
    "yc-font-family",
    ["modern-mono", "garamond"],
    fallbackFontFamily,
  );

  applyTheme(theme, language);
  applyFontSize(fontSize);
  applyFontFamily(fontFamily, language);
  applyLanguage(language);

  document.querySelectorAll<HTMLButtonElement>("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(activeLanguage() === "en" ? "zh" : "en", true);
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

  document.querySelectorAll<HTMLButtonElement>("[data-font-size-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const current =
        (document.documentElement.dataset.fontSize as FontSize | undefined) ?? "s";
      applyFontSize(current === "s" ? "l" : "s", true);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-font-family-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const current =
        (document.documentElement.dataset.fontFamily as FontFamily | undefined) ??
        "modern-mono";
      applyFontFamily(
        current === "modern-mono" ? "garamond" : "modern-mono",
        activeLanguage(),
      );
    });
  });

  // 中文：合上 <details> 前先播放收拢动画（[data-closing] 触发 CSS keyframes），
  // 动画结束再移除 open；关闭动作被禁用或用户偏好减少动效时立即合上。
  // English: Play the fold-up animation before removing [open] ([data-closing]
  // drives the CSS keyframes); close instantly when interface motion is off or
  // the user prefers reduced motion.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const closeAnimated = (menu: HTMLDetailsElement) => {
    if (!menu.open || menu.dataset.closing) return;
    if (!motionSettings.interfaceMotion || reducedMotion.matches) {
      menu.open = false;
      return;
    }
    menu.dataset.closing = "true";
    window.setTimeout(() => {
      delete menu.dataset.closing;
      menu.open = false;
    }, 150);
  };

  const menus = document.querySelectorAll<HTMLDetailsElement>("[data-nav-menu]");
  menus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      menus.forEach((otherMenu) => {
        if (otherMenu !== menu) closeAnimated(otherMenu);
      });
    });
  });

  // 点开着的 summary 再点一次 → 播放收拢动画后再合上（导航菜单与侧栏折叠共用）。
  // Clicking an open summary folds it up before closing (nav menus and rail
  // disclosures alike).
  document
    .querySelectorAll<HTMLDetailsElement>("[data-nav-menu], details[data-unfold]")
    .forEach((menu) => {
      menu.querySelector<HTMLElement>(":scope > summary")?.addEventListener(
        "click",
        (event) => {
          if (!menu.open) return;
          event.preventDefault();
          closeAnimated(menu);
        },
      );
    });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Node && !document.querySelector(".site-header")?.contains(target)) {
      menus.forEach((menu) => {
        closeAnimated(menu);
      });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const focusedMenu =
        document.activeElement instanceof HTMLElement
          ? document.activeElement.closest<HTMLDetailsElement>("details[open]")
          : null;
      menus.forEach((menu) => {
        closeAnimated(menu);
      });
      focusedMenu?.querySelector<HTMLElement>("summary")?.focus();
    }
  });
}
