/**
 * 中文：為管理指南的 Markdown 輸出標記英文、中文和共用示例區塊。
 * English: Marks rendered Admin Guide Markdown as English, Chinese, or shared examples.
 * Caveat / 注意：雙語標題使用 “ / ” 分隔；程式碼、公式、圖片和表格預設兩種語言都顯示。
 * Caveat: Bilingual headings use “ / ”; code, mathematics, figures, and tables remain shared.
 */
const HAN_TEXT = /[\u3400-\u9fff]/u;

function splitBilingualLabel(element: HTMLElement) {
  const html = element.innerHTML.trim();
  const separator = html.indexOf(" / ");
  if (separator < 0) return false;

  const english = html.slice(0, separator).trim();
  const chinese = html.slice(separator + 3).trim();
  if (!english || !chinese || !HAN_TEXT.test(chinese)) return false;

  element.replaceChildren();

  const englishSpan = document.createElement("span");
  englishSpan.dataset.guideLanguage = "en";
  englishSpan.innerHTML = english;

  const chineseSpan = document.createElement("span");
  chineseSpan.dataset.guideLanguage = "zh";
  chineseSpan.lang = "zh-Hant-TW";
  chineseSpan.hidden = true;
  chineseSpan.innerHTML = chinese;

  element.append(englishSpan, chineseSpan);
  return true;
}

export function prepareAdminGuideLanguage() {
  const guide = document.querySelector<HTMLElement>(".admin-guide-page");
  const prose = guide?.querySelector<HTMLElement>(".writing-body");
  if (!guide || !prose) return;

  prose
    .querySelectorAll<HTMLElement>(
      "h2, h3, h4, h5, h6, th, td, dt, dd, figcaption, summary, cite",
    )
    .forEach(splitBilingualLabel);

  prose.querySelectorAll<HTMLElement>("p, li").forEach((element) => {
    if (element.closest("pre, figure, table, .poetry")) return;
    if (element.querySelector("[data-guide-language]")) return;
    if (splitBilingualLabel(element)) return;

    const text = element.textContent?.trim() ?? "";
    if (!text) return;
    element.dataset.guideLanguage = HAN_TEXT.test(text) ? "zh" : "en";
    if (element.dataset.guideLanguage === "zh") {
      element.lang = "zh-Hant-TW";
      element.hidden = true;
    }
  });

  // BaseLayout restores the stored language before paint; mirror that value after marking.
  const language = document.documentElement.lang === "zh-Hant-TW" ? "zh" : "en";
  guide.querySelectorAll<HTMLElement>("[data-guide-language]").forEach((element) => {
    element.hidden = element.dataset.guideLanguage !== language;
  });
}
