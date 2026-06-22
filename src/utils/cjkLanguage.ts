const simplifiedVariantPattern =
  /[这为们个汉语体与学习乐话说读书门时会发见过后页点线简声国风东图开关长电艺边选应顶阳钻绸纺华云间烛颗于烧绽浆滚愿饱荣丝论译历两册绿颜静厕杂爱厨笔来清种唤满鲜过陈]/u;

const traditionalVariantPattern =
  /[這為們個漢語體與學習樂話說讀書門時會發見過後頁點線簡聲國風東圖開關長電藝邊選應頂陽鑽綢紡華雲間燭顆於燒綻漿滾願飽榮絲論譯歷兩冊綠顏靜廁雜愛廚筆來清種喚滿鮮過陳]/u;

const kanaPattern = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;

export type CjkLang = "zh" | "zh-Hans-CN" | "zh-Hant-TW" | "ja";

export function inferCjkLang(text: string, fallback: CjkLang = "zh"): CjkLang {
  if (kanaPattern.test(text)) return "ja";
  if (simplifiedVariantPattern.test(text)) return "zh-Hans-CN";
  if (traditionalVariantPattern.test(text)) return "zh-Hant-TW";
  return fallback;
}

export function cjkLangFromContentLanguage(
  language: string | undefined,
  sampleText = "",
): CjkLang | undefined {
  const normalized = (language ?? "").toLowerCase();
  if (normalized.includes("japanese")) return "ja";
  if (normalized.includes("traditional")) return "zh-Hant-TW";
  if (normalized.includes("simplified")) return "zh-Hans-CN";
  if (normalized.includes("chinese")) return inferCjkLang(sampleText, "zh");
  return undefined;
}
