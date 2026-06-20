// Dev helper (not part of the build): render the bracket-annotated kanbun source
// in scripts/saijotai-kanbun.txt and inject the result into the saijotai work
// page between the kanbun markers. Idempotent — edit the .txt, then re-run:
//   node scripts/embed-kanbun.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { renderKanbun } from "../src/lib/kanbun.js";

const SRC = "scripts/saijotai-kanbun.txt";
const MD = "content/works/saijotai-yamatai-khitan-no-2/index.md";

const source = readFileSync(SRC, "utf8").replace(/\r\n/g, "\n").replace(/\n+$/, "");
const html = renderKanbun(source);

const START = "<!-- kanbun:rendered";
const END = "<!-- /kanbun -->";
const block =
  `${START} — source: ${SRC}; re-render: node scripts/embed-kanbun.mjs -->\n` +
  `<figure class="kanbun-embed">\n` +
  `<div class="kanbun split-touching-kana" lang="ja">${html}</div>\n` +
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
