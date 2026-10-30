// Dev helper (not part of the build): render bracket-annotated kanbun source
// and inject it into a content page between the kanbun markers.
// Idempotent — edit the .txt, then re-run the default or pass source and page:
//   node scripts/embed-kanbun.mjs
//   node scripts/embed-kanbun.mjs scripts/poem.txt content/writings/poem/index.md
import { readFileSync, writeFileSync } from "node:fs";
import { renderKanbun } from "../src/lib/kanbun.js";

const args = process.argv.slice(2);
if (args.length !== 0 && args.length !== 2) {
  throw new Error("Usage: node scripts/embed-kanbun.mjs [source.txt content/page/index.md]");
}
const [SRC = "scripts/saijotai-kanbun.txt", MD = "content/works/saijotai-yamatai-khitan-no-2/index.md"] = args;
const command = ["node scripts/embed-kanbun.mjs", ...args].join(" ");

const source = readFileSync(SRC, "utf8").replace(/\r\n/g, "\n").replace(/\n+$/, "");
const html = renderKanbun(source);

const START = "<!-- kanbun:rendered";
const END = "<!-- /kanbun -->";
const block =
  `${START} — source: ${SRC}; re-render: ${command} -->\n` +
  `<figure class="kanbun-embed" data-kanbun-embed>\n` +
  `<div class="kanbun-controls" role="group" aria-label="排版 / layout">\n` +
  `<button type="button" class="kanbun-toggle" data-kb-layout="sparse" aria-pressed="false">疏排</button>\n` +
  `<button type="button" class="kanbun-toggle" data-kb-layout="dense" aria-pressed="true">密排</button>\n` +
  `</div>\n` +
  `<div class="kanbun split-touching-kana betagumi" lang="ja">${html}</div>\n` +
  `<figcaption class="kanbun-ref"><a href="/tools/kanbun">via Kanbun tool</a></figcaption>\n` +
  `</figure>\n` +
  `${END}`;

let md = readFileSync(MD, "utf8").replace(/\r\n/g, "\n");

if (md.includes(START)) {
  const start = md.indexOf(START);
  const end = md.indexOf(END) + END.length;
  md = md.slice(0, start) + block + md.slice(end);
} else {
  md = md.replace(/\n+$/, "\n") + "\n## Text\n\n" + block + "\n";
}

writeFileSync(MD, md, "utf8");
console.log("Embedded kanbun into", MD);
