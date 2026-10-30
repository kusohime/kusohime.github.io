import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { prunePublicArtifacts } from "../scripts/public-privacy.mjs";
import {
  isPrivatePath,
  privateAreaMessage,
  privatePublicAssets,
  privateSections,
} from "../src/config/privacy.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(filename));
    else files.push(filename);
  }
  return files;
}

test("private sections include direct and nested URLs without blocking public paths", () => {
  for (const section of privateSections) {
    assert.ok(isPrivatePath(`/${section}`));
    assert.ok(isPrivatePath(`/${section}/`));
    assert.ok(isPrivatePath(`/${section}/title/chapter/`));
    assert.ok(!isPrivatePath(`/${section}-public/`));
  }
  for (const url of ["/", "/works/", "/works/bayanbulak/", "/events/"]) {
    assert.ok(!isPrivatePath(url));
  }
});

test("artifact cleanup removes private downloads and bundles while preserving transitive public dependencies", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "website-privacy-"));
  try {
    const files = {
      "index.html": '<script type="module" src="/_astro/public.js"></script><link rel="stylesheet" href="/_astro/site.css">',
      "_astro/public.js": 'import "./shared.js"; import("./lazy.js");',
      "_astro/shared.js": 'export const value = "public";',
      "_astro/lazy.js": 'export const lazy = true;',
      "_astro/site.css": '@font-face{src:url("./font.woff2")}',
      "_astro/font.woff2": "public font",
      "_astro/private-tool.js": 'import "./private-data.js";',
      "_astro/private-data.js": "confidential tool corpus",
      "admin/index.html": '<script src="/_astro/studio.js"></script>',
      "_astro/studio.js": "yixin-cui-studio-passcode",
      "drafts/index.html": "private draft",
      "files/yixin-cui-cv.pdf": "private resume",
      "images/chat-export-2026-06-19/photo.jpg": "private photo",
      "images/writings/cui-xiong-pian/illustration.png": "private writing illustration",
      "images/projects/chart.webp": "private chart",
      "images/murakamiandoe.jpg": "private writing image",
      "images/manuscript-home.webp": "private comment image",
      "files/yixin-cui-senior-recital-program.pdf": "public program",
      "images/works/score.png": "public score",
    };
    for (const [filename, content] of Object.entries(files)) {
      const target = path.join(fixture, filename);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content);
    }

    await prunePublicArtifacts(fixture);

    for (const filename of ["public.js", "shared.js", "lazy.js", "site.css", "font.woff2"]) {
      assert.ok(existsSync(path.join(fixture, "_astro", filename)), filename);
    }
    for (const filename of ["private-tool.js", "private-data.js", "studio.js"]) {
      assert.ok(!existsSync(path.join(fixture, "_astro", filename)), filename);
    }
    for (const filename of [...privatePublicAssets, "admin", "drafts"]) {
      assert.ok(!existsSync(path.join(fixture, filename)), filename);
    }
    assert.ok(existsSync(path.join(fixture, "files/yixin-cui-senior-recital-program.pdf")));
    assert.ok(existsSync(path.join(fixture, "images/works/score.png")));
  } finally {
    assert.equal(path.dirname(fixture), path.resolve(os.tmpdir()));
    assert.ok(path.basename(fixture).startsWith("website-privacy-"));
    await rm(fixture, { recursive: true, force: true });
  }
});

test("every built private page contains only the notice, including deep links", async () => {
  assert.ok(existsSync(output), "Run npm run build before checking public privacy.");
  const notice = await readFile(path.join(output, "private/index.html"), "utf8");
  assert.ok(notice.includes(privateAreaMessage));
  assert.match(notice, /name="robots" content="noindex, nofollow"/);

  for (const section of privateSections) {
    const pages = (await filesUnder(path.join(output, section)))
      .filter((filename) => filename.endsWith(".html"));
    assert.ok(pages.length > 0, section);
    for (const filename of pages) {
      const html = await readFile(filename, "utf8");
      // Legacy aliases may redirect, but only into protected sections.
      if (html.includes('http-equiv="refresh"')) {
        assert.match(html, /\/writings\//);
      } else {
        assert.equal(html, notice, path.relative(output, filename));
      }
    }
  }
});

test("public output omits private assets, feed entries, and Studio code", async () => {
  for (const filename of [...privatePublicAssets, "admin", "drafts", "local-reader"]) {
    assert.ok(!existsSync(path.join(output, filename)), filename);
  }
  const feed = await readFile(path.join(output, "rss.xml"), "utf8");
  assert.ok(feed.includes(privateAreaMessage));
  assert.doesNotMatch(feed, /<item[\s>]/);

  for (const filename of await filesUnder(path.join(output, "_astro"))) {
    if (!filename.endsWith(".js")) continue;
    const script = await readFile(filename, "utf8");
    assert.doesNotMatch(script, /yixin-cui-studio-passcode|private-reading/);
    assert.doesNotMatch(script, /metric-modulation|polyrhythm-cycles|fugue-exposition|tuning-spectra/);
    assert.ok(!script.includes("Audition harmony, voice leading, and motivic transformation."));
  }

  for (const filename of ["index.html", "works/index.html", "events/index.html"]) {
    const html = await readFile(path.join(output, filename), "utf8");
    assert.ok(!html.includes(privateAreaMessage), filename);
    assert.ok(!html.includes('href="/rss.xml"'), filename);
  }
  assert.ok(existsSync(path.join(output, "files/yixin-cui-senior-recital-program.pdf")));
});

test("the direct-link kanbun draft survives publication without becoming discoverable", async () => {
  const draftPath = "/shelf/sono-1/";
  const filename = path.join(output, draftPath, "index.html");
  assert.ok(existsSync(filename), "The direct-link draft must be included in the public build.");
  const html = await readFile(filename, "utf8");
  assert.match(html, /<title\b[^>]*>罪狀體邪馬臺綺譚 其一\s*\|/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);

  assert.doesNotMatch(html, /data-shelf-copy|shelf-source|仅凭链接|从右向左阅读|<h1\b/);
  assert.doesNotMatch(html, /kb-blank-column/);

  // Check the actual rendered poem.
  const poem = html.match(/<figure\b[^>]*data-kanbun-embed[^>]*>[\s\S]*?<\/figure>/)?.[0];
  assert.ok(poem, "The published draft must contain the rendered kanbun figure.");
  const text = poem.replace(/<[^>]*>/g, "");
  for (const word of ["啻", "今向", "膚留梦", "琴ヶ浜", "秘楼僧碑", "此処", "値"]) {
    assert.ok(text.includes(word), `The rendered poem must preserve ${word}.`);
  }
  const readings = [...poem.matchAll(/data-kb-kana="([^"]+)"\s+data-kb-source="([^"]+)"/g)]
    .map((match) => [match[1], match[2]]);
  assert.deepEqual(readings, [
    ["フィルム", "film"],
    ["フォルム", "forme"],
    ["フィル", "phil"],
    ["フルム", "ḥulm"],
  ]);
  assert.ok(!existsSync(path.join(output, "writings/saijotai-yamatai-khitan-no-1")),
    "The ordinary writing route must remain an unpublished draft.");

  const legacyFilename = path.join(output, "shelf/6246d31c62d09a8954489fec/index.html");
  const legacyHtml = await readFile(legacyFilename, "utf8");
  assert.match(legacyHtml, /http-equiv="refresh"/);
  assert.ok(legacyHtml.includes(draftPath));

  for (const page of await filesUnder(output)) {
    if (page === filename || page === legacyFilename || !page.endsWith(".html")) continue;
    const pageHtml = await readFile(page, "utf8");
    const pageUrl = new URL(path.relative(output, page).split(path.sep).join("/"), "https://yixincui.com/");
    for (const [, href] of pageHtml.matchAll(/\bhref\s*=\s*["']([^"']+)["']/g)) {
      const target = new URL(href, pageUrl);
      assert.ok(target.origin !== pageUrl.origin || target.pathname.replace(/\/+$/, "") !== draftPath.slice(0, -1),
        `${path.relative(output, page)} must not link to the direct-link draft.`);
    }
  }
});
