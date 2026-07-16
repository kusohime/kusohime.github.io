import motionSettings from "../config/motion.json";

type Theme = "light" | "dark";

const glyphUrls = {
  suns: Array.from(
    { length: 6 },
    (_, index) => `/icons/sun-${index + 1}.svg`,
  ),
  moons: Array.from(
    { length: 6 },
    (_, index) => `/icons/moon-${index + 1}.svg`,
  ),
};

function randomGlyph(urls: string[]) {
  return urls[Math.floor(Math.random() * urls.length)] ?? urls[0];
}

// 中文：方向符不再随机手绘——统一为 CSS 里的红色箭头；
// 这里只保留主题日／月图标的随机化。
// English: Directional glyphs are no longer randomized hand-drawn arrows — they
// use uniform red arrows in CSS. Only the sun/moon
// theme glyphs keep their per-visit variety.
export function initializeDecorativeGlyphs() {
  const themeGlyphs = document.querySelectorAll<HTMLElement>("[data-theme-glyph]");
  const themeVariants = {
    light: randomGlyph(glyphUrls.suns),
    dark: randomGlyph(glyphUrls.moons),
  };

  const applyThemeGlyph = (theme: Theme) => {
    themeGlyphs.forEach((element) => {
      element.style.setProperty(
        "--theme-glyph-image",
        `url("${themeVariants[theme]}")`,
      );
    });
  };

  const initialTheme =
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyThemeGlyph(initialTheme);

  document.addEventListener("yc-theme-change", (event) => {
    const detail = (event as CustomEvent<{ theme: Theme; animate?: boolean }>).detail;
    const theme = detail?.theme;
    if (theme !== "light" && theme !== "dark") return;

    if (motionSettings.glyphRotation && detail.animate) {
      document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((button) => {
        button.dataset.turning = "true";
        window.setTimeout(() => {
          delete button.dataset.turning;
        }, 720);
      });
    }
    window.setTimeout(() => applyThemeGlyph(theme), detail.animate ? 320 : 0);
  });
}
