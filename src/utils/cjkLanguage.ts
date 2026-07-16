// 注意：判别字符必须是单方独有的字形——清（两体相同）、于／云（文言繁体也用）
// 之类的字不能放进简体组，否则繁体页面会被误判成简体而套用简体字形。
// Caveat: detector chars must be exclusive to one script — 清 (identical in both),
// 于 / 云 (also valid in Classical/Traditional) would misclassify Traditional pages.
const simplifiedVariantPattern =
  /[这为们个汉语体与学习乐话说读书门时会发见过后页点线简声国风东图开关长电艺边选应顶阳钻绸纺华间烛颗烧绽浆滚愿饱荣丝论译历两册绿颜静厕杂爱厨笔来种唤满鲜过陈网斓残顿绝钟觉么懒驳稣弥赛亚吗邮写评动条弃鲁]/u;

const traditionalVariantPattern =
  /[這為們個漢語體與學習樂話說讀書門時會發見過後頁點線簡聲國風東圖開關長電藝邊選應頂陽鑽綢紡華雲間燭顆於燒綻漿滾願飽榮絲論譯歷兩冊綠顏靜廁雜愛廚筆來種喚滿鮮過陳網斕殘頓絕鐘覺麼懶駁穌彌賽亞嗎郵寫評動條棄魯羣]/u;

const kanaPattern = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;

export type CjkLang = "zh" | "zh-Hans-CN" | "zh-Hant-TW" | "ja";

export function inferCjkLang(text: string, fallback: CjkLang = "zh"): CjkLang {
  if (kanaPattern.test(text)) return "ja";
  if (simplifiedVariantPattern.test(text)) return "zh-Hans-CN";
  if (traditionalVariantPattern.test(text)) return "zh-Hant-TW";
  return fallback;
}

const hanPattern = /\p{Script=Han}/u;

export function cjkLangFromText(sampleText: string): CjkLang | undefined {
  if (kanaPattern.test(sampleText)) return "ja";
  if (hanPattern.test(sampleText)) return inferCjkLang(sampleText);
  return undefined;
}

// 中文：数正文里的汉字／假名／拉丁词之前，先剥掉 Markdown 噪音——
// 图片（含替代文字与路径）、链接目标、行内代码、裸网址——它们不是行文语言。
// English: Before counting Han / kana / Latin words, strip Markdown noise —
// images (alt text and path), link targets, inline code, bare URLs — which is
// not the language the body is written in.
const stripMarkdownNoise = (text: string) =>
  text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/`[^`]*`/g, " ")
    .replace(/https?:\/\/\S+/g, " ");

export function proseCounts(text: string) {
  const prose = stripMarkdownNoise(text);
  return {
    han: (prose.match(/\p{Script=Han}/gu) ?? []).length,
    kana: (prose.match(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu) ?? [])
      .length,
    latinWords: (prose.match(/[A-Za-z]{2,}/g) ?? []).length,
  };
}

// 中文：判断一篇「单语」正文主要用哪种语言写成，供语言可用性提示使用。
// 与 cjkLangFromText 不同：英文文章里夹杂的少量汉字引文不应改变判断，
// 所以按汉字数与拉丁词数的多寡取主导语言；几乎没有文字（如纯图片页）
// 时返回 undefined，表示不值得提示。
// English: Decides which language a single-language body is mainly written in,
// for the availability note. Unlike cjkLangFromText, a few Han characters
// quoted inside an English essay must not flip the result, so dominance is
// judged by comparing Han character and Latin word counts. Returns undefined
// when there is almost no prose (e.g. image-only pages) — nothing to note.
export function dominantContentLang(
  text: string,
): "en" | "zh" | "ja" | undefined {
  const { han, kana, latinWords } = proseCounts(text);
  if (kana >= 40 && kana * 2 >= han) return "ja";
  if (han >= 20 && han > latinWords) return "zh";
  if (latinWords >= 10) return "en";
  return undefined;
}
