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
    "nav.events": "Events",
    "nav.writings": "Writings",
    "nav.tools": "Tools",
    "nav.cv": "C.V.",
    "nav.music": "Music",
    "nav.blog": "Blog",
    "common.backTools": "Back to Tools",
    "common.backEvents": "Back to Events",
    "tools.numberPrefix": "Tool No.",
    "tools.notes": "Notes",
    "tools.references": "References",
    "tools.statusBeta": "beta",
    "tools.statusDataPending": "data pending",
    "common.skip": "Skip to content",
    "common.notice": "Site under construction.",
    "common.noWorks": "No works in this category yet.",
    "common.noEntries": "No entries yet.",
    "events.noUpcoming": "No upcoming events.",
    "common.brief": "Brief",
    "common.contents": "Contents",
    "common.backWorks": "Back to Works",
    "common.backWritings": "Back to Writings",
    "common.backContents": "Back to Contents",
    "resource.recording": "Recording",
    "resource.score": "Score",
    "resource.cvPdf": "Download PDF",
    "media.loadVideo": "Load video",
    "media.watchPeerTube": "Watch on PeerTube",
    "metadata.dedication": "Dedication",
    "metadata.commission": "Commission",
    "metadata.credits": "Credits",
    "metadata.premiere": "Premiere",
    "metadata.labelSeparator": ": ",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "comments.heading": "Responses",
    "comments.empty": "No responses yet.",
    "comments.leave": "Leave a response",
    "comments.lead":
      "Moderated — your response appears after the author reviews it. Your email is never shown.",
    "comments.name": "Name",
    "comments.email": "Email — private, optional",
    "comments.body": "Your response",
    "comments.markdown": "Markdown — safe subset",
    "comments.preview": "Preview",
    "comments.attach": "Attach one image (optional)",
    "comments.notify": "Email me when the author replies",
    "comments.submit": "Submit for review",
    "comments.sending": "Sending…",
    "comments.success": "Thank you — your response is awaiting review. ",
    "comments.successDetail": "Nothing is published until the author approves it.",
    "comments.error": "Something went wrong. Please check your entry and try again.",
    "comments.disabled": "Responses aren't open here yet.",
    "comments.author": "Author",
  },
  zh: {
    "nav.works": "作品",
    "nav.events": "活動",
    "nav.writings": "文字",
    "nav.tools": "工具",
    "nav.cv": "履歷",
    "nav.music": "音樂",
    "nav.blog": "網誌",
    "common.backTools": "返回工具",
    "common.backEvents": "返回活動",
    "tools.numberPrefix": "工具編號",
    "tools.notes": "說明",
    "tools.references": "參考文獻",
    "tools.statusBeta": "測試版",
    "tools.statusDataPending": "資料待補",
    "common.skip": "跳至正文",
    "common.notice": "本站建置中。",
    "common.noWorks": "此類別目前尚無作品。",
    "common.noEntries": "目前尚無條目。",
    "events.noUpcoming": "近期暫無活動。",
    "common.brief": "簡介",
    "common.contents": "目錄",
    "common.backWorks": "返回作品",
    "common.backWritings": "返回文字",
    "common.backContents": "返回目錄",
    "resource.recording": "錄音",
    "resource.score": "樂譜",
    "resource.cvPdf": "下載 PDF",
    "media.loadVideo": "載入影片",
    "media.watchPeerTube": "在 PeerTube 觀看",
    "metadata.dedication": "題獻",
    "metadata.commission": "委約",
    "metadata.credits": "合作人員",
    "metadata.premiere": "首演",
    "metadata.labelSeparator": "：",
    "theme.toLight": "切換至淺色主題",
    "theme.toDark": "切換至深色主題",
    "comments.heading": "回應",
    "comments.empty": "目前尚無回應。",
    "comments.leave": "留言",
    "comments.lead": "需審核——你的回應會在作者審核後顯示，電子郵件不會公開。",
    "comments.name": "名稱",
    "comments.email": "電子郵件——保密，可留空",
    "comments.body": "你的回應",
    "comments.markdown": "支援部分 Markdown 語法",
    "comments.preview": "預覽",
    "comments.attach": "附加一張圖片（可選）",
    "comments.notify": "作者回覆時以電子郵件通知我",
    "comments.submit": "送出待審",
    "comments.sending": "傳送中…",
    "comments.success": "謝謝你——你的回應正在等待審核。",
    "comments.successDetail": "在作者核准前不會公開顯示。",
    "comments.error": "發生問題，請檢查內容後再試一次。",
    "comments.disabled": "此頁面尚未開放回應。",
    "comments.author": "作者",
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
  "Large Ensemble": { en: "Large Ensemble", zh: "大型合奏" },
  Orchestral: { en: "Orchestral", zh: "管弦樂" },
  "Vocal / Choral": { en: "Vocal / Choral", zh: "聲樂／合唱" },
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

export function formatDate(
  value: string | number,
  locale: Locale,
  monthStyle: "long" | "short" = "long",
) {
  const raw = String(value);
  const match = raw.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) return raw;

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month ?? 1) - 1, Number(day ?? 1)),
  );
  const options: Intl.DateTimeFormatOptions = day
    ? { year: "numeric", month: monthStyle, day: "numeric", timeZone: "UTC" }
    : month
      ? { year: "numeric", month: monthStyle, timeZone: "UTC" }
      : { year: "numeric", timeZone: "UTC" };

  return new Intl.DateTimeFormat(localeInfo[locale].intl, options).format(date);
}
