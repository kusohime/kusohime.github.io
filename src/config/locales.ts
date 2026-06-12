import type {
  ToolGroup,
  WorkCategory,
  WritingType,
} from "./contentTaxonomy";

export const localeCodes = ["en", "zh", "de", "fr", "ja"] as const;
export type Locale = (typeof localeCodes)[number];

export const localeInfo: Record<
  Locale,
  { htmlLang: string; short: string; name: string; intl: string }
> = {
  en: { htmlLang: "en", short: "EN", name: "English", intl: "en-US" },
  zh: { htmlLang: "zh-Hant-TW", short: "中", name: "中文", intl: "zh-TW" },
  de: { htmlLang: "de", short: "DE", name: "Deutsch", intl: "de-DE" },
  fr: { htmlLang: "fr", short: "FR", name: "Français", intl: "fr-FR" },
  ja: { htmlLang: "ja", short: "日", name: "日本語", intl: "ja-JP" },
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
    "home.role":
      " is a composer, tenor, collaborative keyboardist, conductor, designer, and apprentice piano technician.",
    "home.bio":
      "They received professional training in bullshitting at Swarthmore College in Pennsylvania. They now live in Rochester, New York, and study composition at the Eastman School of Music. This website is under construction and contains plenty of AI slop.",
    "home.manuscript": "manuscript, ",
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
    "home.role": "是作曲家、男高音、合作鍵盤樂手、指揮、設計師與鋼琴技術學徒。",
    "home.bio":
      "祂曾在賓夕法尼亞州的斯沃斯莫爾學院接受專業胡說八道訓練。現居紐約州羅徹斯特，並於伊士曼音樂學院研習作曲。本站仍在建置中，且含有大量 AI 廢料。",
    "home.manuscript": "手稿、",
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
  de: {
    "nav.works": "Werke",
    "nav.writings": "Texte",
    "nav.tools": "Werkzeuge",
    "common.backTools": "Zurück zu den Werkzeugen",
    "tools.numberPrefix": "Werkzeug Nr.",
    "tools.notes": "Anmerkungen",
    "tools.references": "Literatur",
    "tools.statusBeta": "Beta",
    "tools.statusDataPending": "Daten ausstehend",
    "common.skip": "Zum Inhalt springen",
    "common.notice":
      "Diese Website befindet sich im Aufbau; alle Inhalte sind Platzhalter.",
    "common.noWorks": "In dieser Kategorie gibt es noch keine Werke.",
    "common.noEntries": "Noch keine Einträge.",
    "common.brief": "Kurzbeschreibung",
    "common.contents": "Inhalt",
    "common.backWorks": "Zurück zu den Werken",
    "common.backWritings": "Zurück zu den Texten",
    "common.backContents": "Zurück zum Inhalt",
    "home.role":
      " arbeitet als Komponist, Tenor, Korrepetitor, Dirigent, Designer und angehender Klaviertechniker.",
    "home.bio":
      "Die professionelle Ausbildung im Bullshitting fand am Swarthmore College in Pennsylvania statt. Heute lebt Yixin in Rochester, New York, und studiert Komposition an der Eastman School of Music. Diese Website befindet sich im Aufbau und enthält reichlich KI-Schrott.",
    "home.manuscript": "Manuskript, ",
    "resource.recording": "Aufnahme",
    "resource.score": "Partitur",
    "metadata.dedication": "Widmung",
    "metadata.commission": "Auftrag",
    "metadata.credits": "Mitwirkende",
    "metadata.premiere": "Uraufführung",
    "metadata.labelSeparator": ": ",
    "theme.toLight": "Zur hellen Darstellung wechseln",
    "theme.toDark": "Zur dunklen Darstellung wechseln",
  },
  fr: {
    "nav.works": "Œuvres",
    "nav.writings": "Écrits",
    "nav.tools": "Outils",
    "common.backTools": "Retour aux outils",
    "tools.numberPrefix": "Outil nº",
    "tools.notes": "Notes",
    "tools.references": "Références",
    "tools.statusBeta": "bêta",
    "tools.statusDataPending": "données en attente",
    "common.skip": "Aller au contenu",
    "common.notice":
      "Ce site est en construction ; tous les contenus sont provisoires.",
    "common.noWorks": "Aucune œuvre dans cette catégorie pour le moment.",
    "common.noEntries": "Aucune entrée pour le moment.",
    "common.brief": "Présentation",
    "common.contents": "Sommaire",
    "common.backWorks": "Retour aux œuvres",
    "common.backWritings": "Retour aux écrits",
    "common.backContents": "Retour au sommaire",
    "home.role":
      " est compositeur·rice, ténor, pianiste collaboratif·ve, chef·fe d’orchestre, designer et apprenti·e technicien·ne de piano.",
    "home.bio":
      "Sa formation professionnelle en baratin a eu lieu au Swarthmore College, en Pennsylvanie. Yixin vit maintenant à Rochester, dans l’État de New York, et étudie la composition à l’Eastman School of Music. Ce site est en construction et contient beaucoup de déchets d’IA.",
    "home.manuscript": "manuscrit, ",
    "resource.recording": "Enregistrement",
    "resource.score": "Partition",
    "metadata.dedication": "Dédicace",
    "metadata.commission": "Commande",
    "metadata.credits": "Collaborations",
    "metadata.premiere": "Création",
    "metadata.labelSeparator": " : ",
    "theme.toLight": "Passer au thème clair",
    "theme.toDark": "Passer au thème sombre",
  },
  ja: {
    "nav.works": "作品",
    "nav.writings": "文章",
    "nav.tools": "ツール",
    "common.backTools": "ツール一覧へ戻る",
    "tools.numberPrefix": "ツール No.",
    "tools.notes": "解説",
    "tools.references": "参考文献",
    "tools.statusBeta": "ベータ",
    "tools.statusDataPending": "データ整備中",
    "common.skip": "本文へ移動",
    "common.notice": "このサイトは制作中です。掲載内容はすべて仮のものです。",
    "common.noWorks": "このカテゴリーには、まだ作品がありません。",
    "common.noEntries": "まだ記事がありません。",
    "common.brief": "概要",
    "common.contents": "目次",
    "common.backWorks": "作品一覧へ戻る",
    "common.backWritings": "文章一覧へ戻る",
    "common.backContents": "目次へ戻る",
    "home.role":
      "は、作曲家、テノール、コラボレーティブ・キーボード奏者、指揮者、デザイナー、そしてピアノ技術の見習いです。",
    "home.bio":
      "ペンシルベニア州のスワースモア大学で、もっともらしい戯言を語る専門訓練を受けました。現在はニューヨーク州ロチェスターに住み、イーストマン音楽学校で作曲を学んでいます。このサイトは制作中で、AIの残骸も多く含まれています。",
    "home.manuscript": "手稿、",
    "resource.recording": "録音",
    "resource.score": "楽譜",
    "metadata.dedication": "献呈",
    "metadata.commission": "委嘱",
    "metadata.credits": "共同制作",
    "metadata.premiere": "初演",
    "metadata.labelSeparator": "：",
    "theme.toLight": "ライトテーマに切り替える",
    "theme.toDark": "ダークテーマに切り替える",
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
  Solo: {
    en: "Solo",
    zh: "獨奏",
    de: "Solo",
    fr: "Solo",
    ja: "独奏",
  },
  Chamber: {
    en: "Chamber",
    zh: "室內樂",
    de: "Kammermusik",
    fr: "Musique de chambre",
    ja: "室内楽",
  },
  Orchestral: {
    en: "Orchestral",
    zh: "管弦樂",
    de: "Orchestermusik",
    fr: "Musique orchestrale",
    ja: "管弦楽",
  },
  "Vocal / Choral": {
    en: "Vocal / Choral",
    zh: "聲樂／合唱",
    de: "Vokal / Chor",
    fr: "Musique vocale / chorale",
    ja: "声楽・合唱",
  },
  "Music Theatre": {
    en: "Music Theatre",
    zh: "音樂劇場",
    de: "Musiktheater",
    fr: "Théâtre musical",
    ja: "音楽劇",
  },
  Other: {
    en: "Other",
    zh: "其他",
    de: "Sonstiges",
    fr: "Autres",
    ja: "その他",
  },
};

const writingTypeTranslations: Record<
  WritingType,
  { singular: Record<Locale, string>; plural: Record<Locale, string> }
> = {
  Translation: {
    singular: {
      en: "Translation",
      zh: "翻譯",
      de: "Übersetzung",
      fr: "Traduction",
      ja: "翻訳",
    },
    plural: {
      en: "Translations",
      zh: "翻譯",
      de: "Übersetzungen",
      fr: "Traductions",
      ja: "翻訳",
    },
  },
  Essay: {
    singular: {
      en: "Essay",
      zh: "隨筆",
      de: "Essay",
      fr: "Essai",
      ja: "エッセイ",
    },
    plural: {
      en: "Essays",
      zh: "隨筆",
      de: "Essays",
      fr: "Essais",
      ja: "エッセイ",
    },
  },
  Fiction: {
    singular: {
      en: "Fiction",
      zh: "小說",
      de: "Prosa",
      fr: "Fiction",
      ja: "小説",
    },
    plural: {
      en: "Fiction",
      zh: "小說",
      de: "Prosa",
      fr: "Fictions",
      ja: "小説",
    },
  },
  Blog: {
    singular: {
      en: "Blog",
      zh: "網誌",
      de: "Blog",
      fr: "Blog",
      ja: "ブログ",
    },
    plural: {
      en: "Blog",
      zh: "網誌",
      de: "Blog",
      fr: "Blog",
      ja: "ブログ",
    },
  },
  Poem: {
    singular: {
      en: "Poem",
      zh: "詩",
      de: "Gedicht",
      fr: "Poème",
      ja: "詩",
    },
    plural: {
      en: "Poems",
      zh: "詩",
      de: "Gedichte",
      fr: "Poèmes",
      ja: "詩",
    },
  },
  "Program Note": {
    singular: {
      en: "Program Note",
      zh: "節目說明",
      de: "Programmtext",
      fr: "Note de programme",
      ja: "プログラムノート",
    },
    plural: {
      en: "Program Notes",
      zh: "節目說明",
      de: "Programmtexte",
      fr: "Notes de programme",
      ja: "プログラムノート",
    },
  },
  Review: {
    singular: {
      en: "Review",
      zh: "評論",
      de: "Rezension",
      fr: "Critique",
      ja: "批評",
    },
    plural: {
      en: "Reviews",
      zh: "評論",
      de: "Rezensionen",
      fr: "Critiques",
      ja: "批評",
    },
  },
  Other: {
    singular: {
      en: "Other",
      zh: "其他",
      de: "Sonstiges",
      fr: "Autre",
      ja: "その他",
    },
    plural: {
      en: "Other",
      zh: "其他",
      de: "Sonstiges",
      fr: "Autres",
      ja: "その他",
    },
  },
};

const toolGroupTranslations: Record<ToolGroup, Record<Locale, string>> = {
  "Rhythm & Time": {
    en: "Rhythm & Time",
    zh: "節奏與時間",
    de: "Rhythmus & Zeit",
    fr: "Rythme et temps",
    ja: "リズムと時間",
  },
  "Pitch & Spectrum": {
    en: "Pitch & Spectrum",
    zh: "音高與頻譜",
    de: "Tonhöhe & Spektrum",
    fr: "Hauteur et spectre",
    ja: "音高とスペクトル",
  },
  "Sets & Series": {
    en: "Sets & Series",
    zh: "集合與序列",
    de: "Mengen & Reihen",
    fr: "Ensembles et séries",
    ja: "集合とセリー",
  },
  Transformation: {
    en: "Transformation",
    zh: "變換",
    de: "Transformation",
    fr: "Transformation",
    ja: "変換",
  },
  "Performance Resources": {
    en: "Performance Resources",
    zh: "演奏資源",
    de: "Aufführungsressourcen",
    fr: "Ressources d’interprétation",
    ja: "演奏リソース",
  },
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
  English: {
    en: "English",
    zh: "英文",
    de: "Englisch",
    fr: "anglais",
    ja: "英語",
  },
  "Chinese / English": {
    en: "Chinese / English",
    zh: "中文／英文",
    de: "Chinesisch / Englisch",
    fr: "chinois / anglais",
    ja: "中国語・英語",
  },
  Chinese: {
    en: "Chinese",
    zh: "中文",
    de: "Chinesisch",
    fr: "chinois",
    ja: "中国語",
  },
  Japanese: {
    en: "Japanese",
    zh: "日文",
    de: "Japanisch",
    fr: "japonais",
    ja: "日本語",
  },
};

export function contentLanguageLabel(language: string, locale: Locale) {
  return contentLanguageTranslations[language]?.[locale] ?? language;
}

export interface LocalizedText {
  en: string;
  zh?: string;
  de?: string;
  fr?: string;
  ja?: string;
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
        de: "Fortlaufend",
        fr: "Continu",
        ja: "連続再生",
      }[locale];
    }
    return {
      en: `Continuous; approximately ${number}-minute cycle`,
      zh: `持續播放；循環約 ${number} 分鐘`,
      de: `Fortlaufend; Zyklus von ca. ${number} Minuten`,
      fr: `Continu ; cycle d’environ ${number} minutes`,
      ja: `連続再生・約${number}分のサイクル`,
    }[locale];
  }

  const exact = {
    en: `${number} ${duration.minutes === 1 ? "minute" : "minutes"}`,
    zh: `${number} 分鐘`,
    de: `${number} ${duration.minutes === 1 ? "Minute" : "Minuten"}`,
    fr: `${number} ${duration.minutes === 1 ? "minute" : "minutes"}`,
    ja: `${number}分`,
  }[locale];

  if (!duration.approximate) return exact;
  return {
    en: `approximately ${exact}`,
    zh: `約 ${exact}`,
    de: `ca. ${exact}`,
    fr: `environ ${exact}`,
    ja: `約${exact}`,
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
