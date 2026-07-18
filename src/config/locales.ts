import type {
  ToolGroup,
  WorkCategory,
  WritingType,
} from "./contentTaxonomy";

// 中文：本站使用英文與繁體中文兩種介面語言；原文引文仍可依內容標記為
// 繁體或簡體，以取得正確字形。
// English: The interface uses English and Traditional Chinese. Source quotations
// may still be marked as Traditional or Simplified Chinese for correct shaping.
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
    "nav.press": "Press",
    "nav.writings": "Writings",
    "nav.projects": "Projects",
    "nav.tools": "Tools",
    "nav.cv": "C.V.",
    "nav.music": "Music",
    "nav.blog": "Blog",
    "preferences.group": "Site preferences",
    "preferences.language": "Language",
    "preferences.textSize": "Text size",
    "preferences.typeface": "Typeface",
    "preferences.small": "Small text",
    "preferences.medium": "Medium text",
    "preferences.large": "Large text",
    "common.backHome": "Home",
    "common.backGuide": "Guide",
    "common.backStudio": "Studio",
    "common.backTools": "Tools",
    "common.backProjects": "Projects",
    "common.backEvents": "Events",
    "tools.numberPrefix": "Tool No.",
    "tools.onThisPage": "On this page",
    "tools.notes": "Notes",
    "tools.references": "References",
    "tools.statusBeta": "beta",
    "tools.statusDataPending": "data pending",
    "common.skip": "Skip to content",
    "common.noWorks": "No works in this category yet.",
    "common.noEntries": "No entries yet.",
    "common.date": "Date",
    "common.tags": "Tags",
    "common.undated": "Undated",
    "events.noUpcoming": "No upcoming events.",
    "common.brief": "Brief",
    "common.contents": "Contents",
    "common.backWorks": "Works",
    "common.backWritings": "Writings",
    "common.backContents": "Contents",
    "resource.recording": "Recording",
    "resource.score": "Score",
    "resource.cvPdf": "Download PDF",
    "media.loadVideo": "Load video",
    "media.watchPeerTube": "Watch on PeerTube",
    "metadata.credits": "Credits",
    "metadata.labelSeparator": ": ",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "font.toGaramond": "Switch to Garamond",
    "font.toModernMono": "Switch to Modern Mono",
    "comments.heading": "Responses",
    "comments.empty": "No responses yet.",
    "comments.leave": "Leave a response",
    "comments.lead":
      "Your response appears after the author reviews it.",
    "comments.name": "Name",
    "comments.email": "Optional Email (Hidden)",
    "comments.body": "Response",
    "comments.markdown": "Markdown",
    "comments.formatting": "Formatting tools",
    "comments.bold": "Bold",
    "comments.italic": "Italic",
    "comments.quote": "Quote",
    "comments.code": "Code",
    "comments.list": "List",
    "comments.link": "Link",
    "comments.preview": "Preview",
    "comments.attach": "Attach one image (optional)",
    "comments.notify": "Email me when the author replies",
    "comments.submit": "Submit",
    "comments.sending": "Sending…",
    "comments.success": "Thank you — your response is under review. ",
    "comments.successDetail": "Nothing is published until the author approves it.",
    "comments.error": "Something went wrong. Please check your entry and try again.",
    "comments.disabled": "Responses aren't open here yet.",
    "comments.author": "Author",
  },
  zh: {
    "nav.works": "作品",
    "nav.events": "活動",
    "nav.press": "媒體",
    "nav.writings": "文字",
    "nav.projects": "項目",
    "nav.tools": "工具",
    "nav.cv": "履歷",
    "nav.music": "音樂",
    "nav.blog": "網誌",
    "preferences.group": "網站偏好設定",
    "preferences.language": "語言",
    "preferences.textSize": "字號",
    "preferences.typeface": "字體",
    "preferences.small": "小字",
    "preferences.medium": "中字",
    "preferences.large": "大字",
    "common.backHome": "首頁",
    "common.backGuide": "指南",
    "common.backStudio": "管理器",
    "common.backTools": "工具",
    "common.backProjects": "項目",
    "common.backEvents": "活動",
    "tools.numberPrefix": "工具編號",
    "tools.onThisPage": "本頁目錄",
    "tools.notes": "說明",
    "tools.references": "參考文獻",
    "tools.statusBeta": "測試版",
    "tools.statusDataPending": "資料待補",
    "common.skip": "跳至正文",
    "common.noWorks": "此類別目前尚無作品。",
    "common.noEntries": "目前尚無條目。",
    "common.date": "日期",
    "common.tags": "標籤",
    "common.undated": "未標日期",
    "events.noUpcoming": "近期暫無活動。",
    "common.brief": "簡介",
    "common.contents": "目錄",
    "common.backWorks": "作品",
    "common.backWritings": "文字",
    "common.backContents": "目錄",
    "resource.recording": "錄音",
    "resource.score": "樂譜",
    "resource.cvPdf": "下載 PDF",
    "media.loadVideo": "載入影片",
    "media.watchPeerTube": "在 PeerTube 觀看",
    "metadata.credits": "合作人員",
    "metadata.labelSeparator": "：",
    "theme.toLight": "切換至淺色主題",
    "theme.toDark": "切換至深色主題",
    "font.toGaramond": "切換至 Garamond",
    "font.toModernMono": "切換至 Modern Mono",
    "comments.heading": "回應",
    "comments.empty": "目前尚無回應。",
    "comments.leave": "留言",
    "comments.lead": "你的回應會在作者審核後顯示，電子郵件不會公開。",
    "comments.name": "名稱",
    "comments.email": "電子郵件（可留空）",
    "comments.body": "回應",
    "comments.markdown": "支援部分 Markdown 語法",
    "comments.formatting": "格式工具",
    "comments.bold": "粗體",
    "comments.italic": "斜體",
    "comments.quote": "引用",
    "comments.code": "程式碼",
    "comments.list": "清單",
    "comments.link": "連結",
    "comments.preview": "預覽",
    "comments.attach": "附加一張圖片（可選）",
    "comments.notify": "作者回覆時以電子郵件通知我",
    "comments.submit": "提交",
    "comments.sending": "傳送中…",
    "comments.success": "感謝——您的回應正在等待審核。",
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
  Arrangements: { en: "Arrangements", zh: "編曲" },
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
  Drama: {
    singular: { en: "Drama", zh: "戲劇" },
    plural: { en: "Drama", zh: "戲劇" },
  },
  Fiction: {
    singular: { en: "Fiction", zh: "小說" },
    plural: { en: "Fiction", zh: "小說" },
  },
  Blog: {
    singular: { en: "Blog", zh: "網誌" },
    plural: { en: "Blog", zh: "網誌" },
  },
  Journal: {
    singular: { en: "Journal", zh: "日記" },
    plural: { en: "Journal", zh: "日記" },
  },
  Dialogue: {
    singular: { en: "Dialogue", zh: "對話" },
    plural: { en: "Dialogues", zh: "對話" },
  },
  Poetry: {
    singular: { en: "Poetry", zh: "詩" },
    plural: { en: "Poetry", zh: "詩" },
  },
  French: {
    singular: { en: "French", zh: "法文" },
    plural: { en: "French", zh: "法文" },
  },
  Russian: {
    singular: { en: "Russian", zh: "俄文" },
    plural: { en: "Russian", zh: "俄文" },
  },
  Japanese: {
    singular: { en: "Japanese", zh: "日文" },
    plural: { en: "Japanese", zh: "日文" },
  },
  Philosophy: {
    singular: { en: "Philosophy", zh: "哲學" },
    plural: { en: "Philosophy", zh: "哲學" },
  },
  "Philosophy of Science": {
    singular: { en: "Philosophy of Science", zh: "科學哲學" },
    plural: { en: "Philosophy of Science", zh: "科學哲學" },
  },
  "Moral Philosophy": {
    singular: { en: "Moral Philosophy", zh: "道德哲學" },
    plural: { en: "Moral Philosophy", zh: "道德哲學" },
  },
  "Affect Theory": {
    singular: { en: "Affect Theory", zh: "情動理論" },
    plural: { en: "Affect Theory", zh: "情動理論" },
  },
  Psychoanalysis: {
    singular: { en: "Psychoanalysis", zh: "精神分析" },
    plural: { en: "Psychoanalysis", zh: "精神分析" },
  },
  Philology: {
    singular: { en: "Philology", zh: "語文學" },
    plural: { en: "Philology", zh: "語文學" },
  },
  Aesthetics: {
    singular: { en: "Aesthetics", zh: "美學" },
    plural: { en: "Aesthetics", zh: "美學" },
  },
  Calligraphy: {
    singular: { en: "Calligraphy", zh: "書法" },
    plural: { en: "Calligraphy", zh: "書法" },
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
  Linguistics: {
    singular: { en: "Linguistics", zh: "語言學" },
    plural: { en: "Linguistics", zh: "語言學" },
  },
  Theology: {
    singular: { en: "Theology", zh: "神學" },
    plural: { en: "Theology", zh: "神學" },
  },
  Apologetics: {
    singular: { en: "Apologetics", zh: "護教學" },
    plural: { en: "Apologetics", zh: "護教學" },
  },
  Musicology: {
    singular: { en: "Musicology", zh: "音樂學" },
    plural: { en: "Musicology", zh: "音樂學" },
  },
  Ethnomusicology: {
    singular: { en: "Ethnomusicology", zh: "民族音樂學" },
    plural: { en: "Ethnomusicology", zh: "民族音樂學" },
  },
  Anthropology: {
    singular: { en: "Anthropology", zh: "人類學" },
    plural: { en: "Anthropology", zh: "人類學" },
  },
  Disability: {
    singular: { en: "Disability", zh: "身心障礙" },
    plural: { en: "Disability", zh: "身心障礙" },
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

const translationLanguageLabels: Record<string, Record<Locale, string>> = {
  en: { en: "English", zh: "英文" },
  fr: { en: "French", zh: "法文" },
  ja: { en: "Japanese", zh: "日文" },
  ru: { en: "Russian", zh: "俄文" },
  "zh-classical": { en: "Classical Chinese", zh: "古漢語" },
  "zh-modern": { en: "Modern Chinese", zh: "現代漢語" },
};

export function formatTranslationRoute(
  from: string | undefined,
  to: string[],
  locale: Locale,
) {
  if (!from || to.length === 0) return "";
  const label = (code: string) =>
    translationLanguageLabels[code]?.[locale] ?? code.toUpperCase();
  return `${label(from)} → ${to.map(label).join(locale === "zh" ? "＋" : " + ")}`;
}

export interface LocalizedText {
  en: string;
  zh?: string;
}

export function localizedText(value: LocalizedText, locale: Locale) {
  const text = value[locale] ?? value.en;
  return locale === "zh" ? text.replaceAll("Yixin Cui", "崔浥新") : text;
}

// 中文：把「題獻／委約／首演」資料組成自然語句，而非「標籤：值」。
// English: Compose dedication / commission / premiere data into a natural
// sentence rather than a "Label: value" pair. Word order differs per language,
// so each locale gets its own phrasing (cf. formatDate / formatDuration).
export function formatDedication(value: LocalizedText, locale: Locale) {
  const who = localizedText(value, locale);
  return {
    en: `Dedicated to ${who}`,
    zh: `題獻給 ${who}`,
  }[locale];
}

export function formatCommission(value: LocalizedText, locale: Locale) {
  const who = localizedText(value, locale);
  return {
    en: `Commissioned by ${who}`,
    zh: `受 ${who} 委約`,
  }[locale];
}

export interface PremiereData {
  date?: string | number;
  by: LocalizedText;
  venue?: LocalizedText;
}

export function formatPremiere(premiere: PremiereData, locale: Locale) {
  const by = localizedText(premiere.by, locale);
  const venue = premiere.venue ? localizedText(premiere.venue, locale) : undefined;
  const date =
    premiere.date === undefined || premiere.date === ""
      ? undefined
      : formatDate(premiere.date, locale);

  if (locale === "zh") {
    // 首演：[日期]由 演出者[於 場地]首演
    let text = date ?? "";
    text += `由 ${by}`;
    if (venue) text += ` 於 ${venue}`;
    return `${text} 首演`;
  }

  // Premièred by [performers][ on date][ at venue]
  let text = `Premièred by ${by}`;
  if (date) text += ` on ${date}`;
  if (venue) text += ` at ${venue}`;
  return text;
}

export interface DurationData {
  minutes?: number;
  continuous?: boolean;
  approximate?: boolean;
}

export function formatDuration(duration: DurationData, locale: Locale) {
  const totalSeconds =
    duration.minutes === undefined ? undefined : Math.round(duration.minutes * 60);
  const minuteCount = totalSeconds === undefined ? undefined : Math.floor(totalSeconds / 60);
  const secondCount = totalSeconds === undefined ? undefined : totalSeconds % 60;
  // 中文：時長使用 prime／double-prime 字符（′ ″），而非直引號 ' "。
  // English: Durations use prime / double-prime glyphs (′ ″), not straight quotes.
  const primeTime =
    minuteCount === undefined
      ? ""
      : secondCount
        ? `${minuteCount}′${String(secondCount).padStart(2, "0")}″`
        : `${minuteCount}′`;
  const minuteText =
    minuteCount === undefined
      ? ""
      : new Intl.NumberFormat(localeInfo[locale].intl, {
          maximumFractionDigits: 1,
        }).format(duration.minutes ?? minuteCount);

  if (duration.continuous) {
    if (!minuteText) {
      return {
        en: "Continuous",
        zh: "持續播放",
      }[locale];
    }
    return {
      en: `Continuous; approx. ${primeTime} cycle`,
      zh: `持續播放；循環約 ${minuteText} 分鐘`,
    }[locale];
  }

  const exact = {
    en: primeTime,
    zh: `${minuteText} 分鐘`,
  }[locale];

  if (!duration.approximate) return exact;
  return {
    en: `approx. ${exact}`,
    zh: `約 ${exact}`,
  }[locale];
}

export function formatDate(
  value: string | number,
  locale: Locale,
  monthStyle: "long" | "short" | "month" = "long",
) {
  const raw = String(value);
  const customDateTranslations: Record<string, Record<Locale, string>> = {
    Ongoing: { en: "Ongoing", zh: "進行中" },
    "Draft review": { en: "Draft review", zh: "草稿整理" },
    "Recovered from chat export": {
      en: "Recovered from chat export",
      zh: "聊天記錄整理",
    },
  };
  if (customDateTranslations[raw]) {
    return customDateTranslations[raw][locale];
  }

  const match = raw.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) return raw;

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month ?? 1) - 1, Number(day ?? 1)),
  );
  const dateMonthStyle = monthStyle === "month" ? "long" : monthStyle;
  const options: Intl.DateTimeFormatOptions = monthStyle === "month" && month
    ? { month: "long", timeZone: "UTC" }
    : day
    ? { year: "numeric", month: dateMonthStyle, day: "numeric", timeZone: "UTC" }
    : month
      ? { year: "numeric", month: dateMonthStyle, timeZone: "UTC" }
      : { year: "numeric", timeZone: "UTC" };

  return new Intl.DateTimeFormat(localeInfo[locale].intl, options).format(date);
}
