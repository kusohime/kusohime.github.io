/**
 * 中文：管理公开网站的语言、明暗主题和字号偏好。
 * English: Manages language, light/dark theme, and font-size preferences.
 * Caveat / 注意：只有带 data-i18n-en 与 data-i18n-zh 的元素会被翻译。
 * Caveat: Only elements with both data-i18n-en and data-i18n-zh are translated.
 */
type Language = "en" | "zh";
type Theme = "light" | "dark";
type FontSize = "s" | "m" | "l";

const controlLabels = {
  en: {
    language: "Language",
    theme: "Theme",
    size: "Size",
    light: "Light",
    dark: "Dark",
  },
  zh: {
    language: "语言",
    theme: "主题",
    size: "字号",
    light: "浅色",
    dark: "深色",
  },
} as const;

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
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

// 管理指南包含整段双语正文；与短标签替换分开处理，代码示例始终保留。
// The Admin Guide has full bilingual passages; switch those separately while keeping shared code examples.
function applyGuideLanguage(language: Language) {
  document
    .querySelectorAll<HTMLElement>("[data-guide-language]")
    .forEach((element) => {
      const elementLanguage = element.dataset.guideLanguage;
      element.hidden = elementLanguage !== language;
    });
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language === "zh" ? "zh-Hans" : "en";

  document
    .querySelectorAll<HTMLElement>("[data-i18n-en][data-i18n-zh]")
    .forEach((element) => {
      const translation =
        language === "zh" ? element.dataset.i18nZh : element.dataset.i18nEn;
      if (translation) element.textContent = translation;
    });

  const labels = controlLabels[language];
  document.querySelectorAll<HTMLElement>("[data-control-label]").forEach((element) => {
    const key = element.dataset.controlLabel as keyof typeof labels;
    if (labels[key]) element.textContent = labels[key];
  });

  document.querySelectorAll<HTMLElement>("[data-current-language]").forEach((element) => {
    element.textContent = language === "zh" ? "中" : "EN";
  });

  const currentTheme = (document.documentElement.dataset.theme ?? "light") as Theme;
  document.querySelectorAll<HTMLElement>("[data-current-theme]").forEach((element) => {
    element.textContent = labels[currentTheme];
  });

  document.querySelectorAll<HTMLButtonElement>("[data-theme-option]").forEach((button) => {
    const theme = button.dataset.themeOption as Theme;
    button.textContent = labels[theme];
  });

  applyGuideLanguage(language);
  updatePressedState("[data-language-option]", language);
  store("yc-language", language);
}

function applyTheme(theme: Theme, language: Language) {
  document.documentElement.dataset.theme = theme;
  const labels = controlLabels[language];

  document.querySelectorAll<HTMLElement>("[data-current-theme]").forEach((element) => {
    element.textContent = labels[theme];
  });

  updatePressedState("[data-theme-option]", theme);
  store("yc-theme", theme);
}

function applyFontSize(fontSize: FontSize) {
  document.documentElement.dataset.fontSize = fontSize;

  document.querySelectorAll<HTMLElement>("[data-current-font-size]").forEach((element) => {
    element.textContent = fontSize.toUpperCase();
  });

  updatePressedState("[data-font-size-option]", fontSize);
  store("yc-font-size", fontSize);
}

export function initializePreferences() {
  const language = readStored<Language>("yc-language", ["en", "zh"], "en");
  const theme = readStored<Theme>("yc-theme", ["light", "dark"], "light");
  const fontSize = readStored<FontSize>("yc-font-size", ["s", "m", "l"], "m");

  applyTheme(theme, language);
  applyFontSize(fontSize);
  applyLanguage(language);

  document.querySelectorAll<HTMLButtonElement>("[data-language-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.languageOption as Language;
      applyLanguage(nextLanguage);
      button.closest("details")?.removeAttribute("open");
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = button.dataset.themeOption as Theme;
      const activeLanguage =
        document.documentElement.lang === "zh-Hans" ? "zh" : "en";
      applyTheme(nextTheme, activeLanguage);
      button.closest("details")?.removeAttribute("open");
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-font-size-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyFontSize(button.dataset.fontSizeOption as FontSize);
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
