import createVerovioModule from "verovio/wasm";
import { VerovioToolkit } from "verovio/esm";

let modulePromise: Promise<unknown> | undefined;

const getVerovioModule = () => {
  modulePromise ??= createVerovioModule();
  return modulePromise;
};

export async function renderMeiSnippet(
  mei: string,
  variant: "sign" | "realization",
): Promise<string> {
  const module = await getVerovioModule();
  const toolkit = new VerovioToolkit(module);

  try {
    return toolkit.renderData(mei, {
      adjustPageHeight: true,
      adjustPageWidth: true,
      breaks: "none",
      footer: "none",
      header: "none",
      minLastJustification: 0,
      mmOutput: false,
      pageHeight: 260,
      pageWidth: variant === "sign" ? 520 : 900,
      scale: 42,
      svgViewBox: true,
    });
  } finally {
    toolkit.destroy();
  }
}
