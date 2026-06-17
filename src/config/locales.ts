import type {
  ToolGroup,
  WorkCategory,
  WritingType,
} from "./contentTaxonomy";

// 中文：本站使用两种语言——英文与中文（繁体）。新增语言需在此处与各翻译表同时补齐。
// English: The site uses two languages — English and Traditional Chinese. Adding a
// language means extending this list and every translation table below together.
export const localeCodes = ["en", "zh"] as const;
export type Locale = (typeof localeCodes)[number];

export const localeInfo: Record<
  Locale,
  { htmlLang: string; short: string; name: string; intl: string }
> = {
  en: { htmlLang: "en", short: "EN", name: "English", intl: "en-US" },
  zh: { htmlLang: "zh-Hant-TW", short: "中", name: "中文", intl: "zh-TW" },
};

export const messages = {
  en: {
    "nav.works": "Works",
    "nav.writings": "Writings",
    "nav.tools": "Tools",
    "common.backTools": "Back to Tools",
    "tools.numberPrefix": "Tool No.",
    "tools.notes": "Notes",
    "tools.references": "References",
    "tools.statusBeta": "beta",
    "tools.statusDataPending": "data pending",
    "common.skip": "Skip to content",
    "common.notice":
      "This site is under construction and all contents are placeholders.",
    "common.noWorks": "No works in this category yet.",
    "common.noEntries": "No entries yet.",
    "common.brief": "Brief",
    "common.contents": "Contents",
    "common.backWorks": "Back to Works",
    "common.backWritings": "Back to Writings",
    "common.backContents": "Back to Contents",
    "resource.recording": "Recording",
    "resource.score": "Score",
    "metadata.dedication": "Dedication",
    "metadata.commission": "Commission",
    "metadata.credits": "Credits",
    "metadata.premiere": "Premiere",
    "metadata.labelSeparator": ": ",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
  },
  zh: {
    "nav.works": "作品",
    "nav.writings": "文字",
    "nav.tools": "工具",
    "common.backTools": "返回工具",
    "tools.numberPrefix": "工具編號",
    "tools.notes": "說明",
    "tools.references": "參考文獻",
    "tools.statusBeta": "測試版",
    "tools.statusDataPending": "資料待補",
    "common.skip": "跳至正文",
    "common.notice": "本站正在建置中，所有內容均為暫用文字。",
    "common.noWorks": "此類別目前尚無作品。",
    "common.noEntries": "目前尚無條目。",
    "common.brief": "簡介",
    "common.contents": "目錄",
    "common.backWorks": "返回作品",
    "common.backWritings": "返回文字",
    "common.backContents": "返回目錄",
    "resource.recording": "錄音",
    "resource.score": "樂譜",
    "metadata.dedication": "題獻",
    "metadata.commission": "委約",
    "metadata.credits": "合作人員",
    "metadata.premiere": "首演",
    "metadata.labelSeparator": "：",
    "theme.toLight": "切換至淺色主題",
    "theme.toDark": "切換至深色主題",
  },
} as const;

export type TranslationKey = keyof typeof messages.en;

export function translate(locale: Locale, key: TranslationKey) {
  return messages[locale][key] ?? messages.en[key];
}

const workCategoryTranslations: Record<
  WorkCategory,
  Record<Locale, string>
> = {
  Solo: { en: "Solo", zh: "獨奏" },
  Chamber: { en: "Chamber", zh: "室內樂" },
  Orchestral: { en: "Orchestral", zh: "管弦樂" },
  "Vocal / Choral": { en: "Vocal / Choral", zh: "聲樂／合唱" },
  "Music Theatre": { en: "Music Theatre", zh: "音樂劇場" },
  Other: { en: "Other", zh: "其他" },
};

const writingTypeTranslations: Record<
  WritingType,
  { singular: Record<Locale, string>; plural: Record<Locale, string> }
> = {
  Translation: {
    singular: { en: "Translation", zh: "翻譯" },
    plural: { en: "Translations", zh: "翻譯" },
  },
  Essay: {
    singular: { en: "Essay", zh: "隨筆" },
    plural: { en: "Essays", zh: "隨筆" },
  },
  Fiction: {
    singular: { en: "Fiction", zh: "小說" },
    plural: { en: "Fiction", zh: "小說" },
  },
  Blog: {
    singular: { en: "Blog", zh: "網誌" },
    plural: { en: "Blog", zh: "網誌" },
  },
  Poem: {
    singular: { en: "Poem", zh: "詩" },
    plural: { en: "Poems", zh: "詩" },
  },
  "Program Note": {
    singular: { en: "Program Note", zh: "節目說明" },
    plural: { en: "Program Notes", zh: "節目說明" },
  },
  Review: {
    singular: { en: "Review", zh: "評論" },
    plural: { en: "Reviews", zh: "評論" },
  },
  Other: {
    singular: { en: "Other", zh: "其他" },
    plural: { en: "Other", zh: "其他" },
  },
};

const toolGroupTranslations: Record<ToolGroup, Record<Locale, string>> = {
  Composition: { en: "Composition", zh: "作曲" },
  Linguistics: { en: "Linguistics", zh: "語言學" },
};

export function toolGroupLabel(group: ToolGroup, locale: Locale) {
  return toolGroupTranslations[group][locale];
}

export function workCategoryLabel(category: WorkCategory, locale: Locale) {
  return workCategoryTranslations[category][locale];
}

export function writingTypeLabel(
  type: WritingType,
  locale: Locale,
  form: "singular" | "plural" = "singular",
) {
  return writingTypeTranslations[type][form][locale];
}

const contentLanguageTranslations: Record<string, Record<Locale, string>> = {
  English: { en: "English", zh: "英文" },
  "Chinese / English": { en: "Chinese / English", zh: "中文／英文" },
  Chinese: { en: "Chinese", zh: "中文" },
  Japanese: { en: "Japanese", zh: "日文" },
};

export function contentLanguageLabel(language: string, locale: Locale) {
  return contentLanguageTranslations[language]?.[locale] ?? language;
}

export interface LocalizedText {
  en: string;
  zh?: string;
}

export function localizedText(value: LocalizedText, locale: Locale) {
  return value[locale] ?? value.en;
}

export interface DurationData {
  minutes?: number;
  continuous?: boolean;
  approximate?: boolean;
}

export function formatDuration(duration: DurationData, locale: Locale) {
  const number =
    duration.minutes === undefined
      ? ""
      : new Intl.NumberFormat(localeInfo[locale].intl, {
          maximumFractionDigits: 1,
        }).format(duration.minutes);

  if (duration.continuous) {
    if (!number) {
      return {
        en: "Continuous",
        zh: "持續播放",
      }[locale];
    }
    return {
      en: `Continuous; approximately ${number}-minute cycle`,
      zh: `持續播放；循環約 ${number} 分鐘`,
    }[locale];
  }

  const exact = {
    en: `${number} ${duration.minutes === 1 ? "minute" : "minutes"}`,
    zh: `${number} 分鐘`,
  }[locale];

  if (!duration.approximate) return exact;
  return {
    en: `approximately ${exact}`,
    zh: `約 ${exact}`,
  }[locale];
}

export function formatDate(value: string | number, locale: Locale) {
  const raw = String(value);
  const match = raw.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) return raw;

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month ?? 1) - 1, Number(day ?? 1)),
  );
  const options: Intl.DateTimeFormatOptions = day
    ? { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
    : month
      ? { year: "numeric", month: "long", timeZone: "UTC" }
      : { year: "numeric", timeZone: "UTC" };

  return new Intl.DateTimeFormat(localeInfo[locale].intl, options).format(date);
}
