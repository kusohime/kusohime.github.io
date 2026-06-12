import motionSettings from "../config/motion.json";

type Theme = "light" | "dark";

const glyphUrls = {
  arrows: Array.from(
    { length: 7 },
    (_, index) => `/icons/arrow-${index + 1}.svg`,
  ),
  suns: Array.from(
    { length: 6 },
    (_, index) => `/icons/sun-${index + 1}.svg`,
  ),
  moons: Array.from(
    { length: 6 },
    (_, index) => `/icons/moon-${index + 1}.svg`,
  ),
};

function shuffledGlyphs(urls: string[]) {
  const glyphs = [...urls];

  for (let index = glyphs.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [glyphs[index], glyphs[swapIndex]] = [glyphs[swapIndex], glyphs[index]];
  }

  return glyphs;
}

function randomGlyph(urls: string[]) {
  return urls[Math.floor(Math.random() * urls.length)] ?? urls[0];
}

export function initializeDecorativeGlyphs() {
  const elements = document.querySelectorAll<HTMLElement>("[data-arrow-glyph]");
  let glyphPool = shuffledGlyphs(glyphUrls.arrows);

  elements.forEach((element) => {
    if (glyphPool.length === 0) glyphPool = shuffledGlyphs(glyphUrls.arrows);

    const glyphUrl = glyphPool.pop() ?? glyphUrls.arrows[0];
    const wobble = Math.random() * 8 - 4;

    element.style.setProperty("--arrow-image", `url("${glyphUrl}")`);
    element.style.setProperty("--arrow-wobble", `${wobble.toFixed(2)}deg`);
  });

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
