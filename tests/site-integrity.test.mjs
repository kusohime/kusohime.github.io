import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderCommentMarkdown } from "../src/lib/commentMarkdown.js";
import {
  inlineMarkdownToPlainText,
  renderSafeInlineMarkdown,
} from "../src/lib/safeHtml.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content");

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
  } catch (error) {
    console.error(`FAIL  ${name}`);
    console.error(`      ${error.message}`);
    process.exitCode = 1;
  }
}

async function filesUnder(dir, predicate = () => true) {
  const out = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!["node_modules", "dist", ".astro", ".git", "desktop-dist"].includes(entry.name)) {
          await walk(full);
        }
      } else if (predicate(full)) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

function frontmatter(source) {
  const match = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] ?? "";
}

function scalar(frontmatterText, key) {
  const match = frontmatterText.match(new RegExp(`^${key}:\\s*"?([^"\\r\\n]+)"?\\s*$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function list(frontmatterText, key) {
  const match = frontmatterText.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]\\s*$`, "m"));
  return match?.[1]
    ?.split(",")
    .map((value) => value.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean) ?? [];
}

function uint24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(buffer.subarray(8, 12).toString("ascii"), "WEBP");

  for (let offset = 12; offset + 8 <= buffer.length; ) {
    const type = buffer.subarray(offset, offset + 4).toString("ascii");
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    assert.ok(data + size <= buffer.length, `invalid ${type} WebP chunk length`);

    if (type === "VP8X") {
      return {
        width: uint24LE(buffer, data + 4) + 1,
        height: uint24LE(buffer, data + 7) + 1,
      };
    }
    if (type === "VP8L") {
      assert.equal(buffer[data], 0x2f, "invalid VP8L signature");
      const b1 = buffer[data + 1];
      const b2 = buffer[data + 2];
      const b3 = buffer[data + 3];
      const b4 = buffer[data + 4];
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + ((b2 & 0xc0) >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
      };
    }
    if (type === "VP8 ") {
      assert.equal(buffer.subarray(data + 3, data + 6).toString("hex"), "9d012a");
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
      };
    }

    offset = data + size + (size % 2);
  }
  throw new Error("WebP contains no recognized dimensions chunk");
}

await test("comment Markdown rejects raw HTML and unsafe links", async () => {
  const html = renderCommentMarkdown(
    '<img src=x onerror=alert(1)> [bad](javascript:alert(1)) [ok](https://example.com)',
  );
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('href="https://example.com"'));
});

await test("safe inline Markdown escapes HTML before adding links", async () => {
  const html = renderSafeInlineMarkdown(
    '<script>alert(1)</script> [site](/works/) [bad](data:text/html,x) **bold**',
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes('href="/works/"'));
  assert.ok(!html.includes('href="data:text/html'));
  assert.ok(html.includes("<strong>bold</strong>"));
});

await test("inline Markdown has a plain-text form for document and feed titles", async () => {
  assert.equal(
    inlineMarkdownToPlainText("Notes on *Les Rois thaumaturges*"),
    "Notes on Les Rois thaumaturges",
  );
  assert.equal(
    inlineMarkdownToPlainText("Read **closely** at [Writings](/writings/)"),
    "Read closely at Writings",
  );
});

await test("content collection slugs are unique", async () => {
  for (const collection of ["works", "events", "writings", "projects", "tools"]) {
    const files = await filesUnder(path.join(contentRoot, collection), (file) =>
      file.endsWith(`${path.sep}index.md`),
    );
    const seen = new Map();
    for (const file of files) {
      const slug = scalar(frontmatter(await readFile(file, "utf8")), "slug");
      if (!slug) continue;
      assert.ok(!seen.has(slug), `${collection} slug "${slug}" is reused by ${file} and ${seen.get(slug)}`);
      seen.set(slug, file);
    }
  }
});

await test("writing entries carry bilingual listing metadata", async () => {
  const files = await filesUnder(path.join(contentRoot, "writings"), (file) =>
    file.endsWith(`${path.sep}index.md`),
  );

  for (const file of files) {
    const metadata = frontmatter(await readFile(file, "utf8"));
    const relative = path.relative(root, file);
    assert.ok(scalar(metadata, "titleZh"), `${relative} has no Chinese title`);
    assert.ok(scalar(metadata, "excerptZh"), `${relative} has no Chinese excerpt`);

    if (/^tags:\s*\[[^\]]*"Translation"/m.test(metadata)) {
      const subtitle = scalar(metadata, "subtitle");
      const subtitleZh = scalar(metadata, "subtitleZh");
      assert.ok(subtitle, `${relative} has no translation author`);
      assert.ok(subtitleZh, `${relative} has no Chinese translation author`);
      assert.ok(!/[—–]/.test(subtitle), `${relative} repeats a title in its subtitle`);
      assert.ok(!/[—–]/.test(subtitleZh), `${relative} repeats a title in its Chinese subtitle`);
      assert.ok(scalar(metadata, "translationFrom"), `${relative} has no translation source language`);
      assert.ok(list(metadata, "translationTo").length > 0, `${relative} has no translation target language`);
    }
  }
});

await test("calligraphy translation metadata preserves both targets and first-paragraph setting", async () => {
  const file = path.join(contentRoot, "writings", "shu-fa-san-lun", "index.md");
  const metadata = frontmatter(await readFile(file, "utf8"));
  assert.equal(scalar(metadata, "translationFrom"), "zh-classical");
  assert.deepEqual(list(metadata, "translationTo"), ["en", "zh-modern"]);
  assert.equal(scalar(metadata, "firstParagraphIndent"), "true");
});

await test("Markdown image URLs point to existing public files", async () => {
  const markdownFiles = await filesUnder(contentRoot, (file) => file.endsWith(".md"));
  for (const file of markdownFiles) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/!\[[^\]]*\]\((\/[^)#?]+)(?:[)#?][^)]*)?\)/g)) {
      const publicFile = path.join(root, "public", match[1].replace(/^\//, ""));
      assert.ok(existsSync(publicFile), `${path.relative(root, file)} references missing ${match[1]}`);
    }
  }
});

await test("ornament facsimile manifest and assets are complete and reproducible", async () => {
  const dataSource = await readFile(
    path.join(root, "src", "data", "essentialOrnaments.ts"),
    "utf8",
  );
  const familySection = dataSource.match(
    /export const ornamentFamilies = \[([\s\S]*?)\] as const;/,
  )?.[1];
  const sourceSection = dataSource.match(
    /export const essentialOrnamentSources:[\s\S]*?= \[([\s\S]*?)\n\];/,
  )?.[1];
  assert.ok(familySection, "could not read ornament family IDs");
  assert.ok(sourceSection, "could not read ornament source IDs");

  const families = [...familySection.matchAll(/^    id: "([^"]+)",$/gm)].map(
    (match) => match[1],
  );
  const sources = [...sourceSection.matchAll(
    /^    id: "([^"]+)",\r?\n    chartOrder: (\d+),$/gm,
  )].map((match) => ({ id: match[1], order: Number(match[2]) }));
  assert.equal(families.length, 7);
  assert.equal(sources.length, 18);
  assert.deepEqual(
    sources.map((source) => source.order),
    Array.from({ length: 18 }, (_, index) => index + 1),
  );

  const imageRoot = path.join(
    root,
    "public",
    "images",
    "projects",
    "essential-ornaments",
    "chart-cells",
  );
  const manifest = JSON.parse(
    await readFile(
      path.join(
        root,
        "public",
        "images",
        "projects",
        "essential-ornaments",
        "chart-cells.manifest.json",
      ),
      "utf8",
    ),
  );
  assert.equal(manifest.schemaVersion, 1);
  assert.deepEqual(manifest.sourceRaster, {
    sha256: "97a77f06f4d12bca221e393a5334db0429fed863f89a83f4f886ed9c18941ff8",
    width: 6614,
    height: 4676,
    page: 1,
    dpi: 400,
    colorMode: "grayscale",
  });
  assert.deepEqual(manifest.output, {
    format: "webp",
    lossless: true,
    width: 780,
    height: 240,
  });
  assert.deepEqual(manifest.summary, {
    sourceRows: 18,
    families: 7,
    gridCells: 126,
    populatedCells: 106,
    auditedVariantSlots: 306,
  });
  assert.equal(manifest.cells.length, sources.length * families.length);

  const images = (await readdir(imageRoot)).filter((file) => file.endsWith(".webp"));
  const manifestFilenames = manifest.cells.map((cell) => cell.filename);
  assert.deepEqual([...images].sort(), [...manifestFilenames].sort());

  const horizontalBounds = [
    [1553, 2297],
    [2311, 3055],
    [3069, 3808],
    [3822, 4470],
    [4484, 5111],
    [5125, 5757],
    [5771, 6418],
  ];
  const verticalBounds = [
    [499, 711],
    [721, 932],
    [942, 1156],
    [1166, 1379],
    [1389, 1600],
    [1610, 1827],
    [1837, 2051],
    [2061, 2273],
    [2283, 2495],
    [2505, 2717],
    [2727, 2939],
    [2949, 3160],
    [3170, 3384],
    [3394, 3606],
    [3616, 3832],
    [3842, 4054],
    [4064, 4276],
    [4286, 4498],
  ];
  const auditedVariantCounts = [
    [0, 6, 0, 3, 2, 0, 0],
    [1, 3, 1, 1, 0, 0, 1],
    [5, 3, 3, 0, 0, 0, 0],
    [2, 1, 3, 2, 0, 1, 2],
    [1, 1, 0, 1, 1, 0, 1],
    [2, 3, 4, 1, 2, 1, 5],
    [2, 2, 0, 2, 1, 0, 1],
    [3, 2, 3, 1, 1, 0, 1],
    [1, 3, 2, 1, 3, 2, 2],
    [4, 5, 4, 2, 4, 2, 1],
    [6, 3, 4, 2, 2, 4, 2],
    [3, 2, 1, 1, 1, 1, 0],
    [2, 5, 0, 1, 2, 2, 4],
    [5, 3, 5, 5, 3, 2, 3],
    [8, 3, 7, 4, 4, 1, 6],
    [3, 3, 2, 5, 5, 3, 6],
    [8, 4, 5, 5, 2, 4, 4],
    [8, 3, 0, 5, 0, 3, 3],
  ];
  const cellsByKey = new Map();

  for (const cell of manifest.cells) {
    assert.equal(path.basename(cell.filename), cell.filename);
    assert.match(cell.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isInteger(cell.byteSize) && cell.byteSize > 0);
    assert.ok(Number.isInteger(cell.auditedVariantCount));
    assert.ok(cell.auditedVariantCount >= 0);
    assert.equal(cell.populated, cell.auditedVariantCount > 0);
    assert.deepEqual(cell.outputDimensions, { width: 780, height: 240 });

    const source = sources[cell.sourceOrder - 1];
    const family = families[cell.familyOrder - 1];
    assert.equal(cell.sourceId, source?.id);
    assert.equal(cell.familyId, family);
    assert.equal(cell.filename, `${cell.sourceId}-${cell.familyId}.webp`);
    assert.equal(
      cell.auditedVariantCount,
      auditedVariantCounts[cell.sourceOrder - 1]?.[cell.familyOrder - 1],
    );

    const [left, right] = horizontalBounds[cell.familyOrder - 1] ?? [];
    const [top, bottom] = verticalBounds[cell.sourceOrder - 1] ?? [];
    assert.deepEqual(cell.cropBounds, {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    });

    const key = `${cell.sourceId}:${cell.familyId}`;
    assert.ok(!cellsByKey.has(key), `duplicate ornament manifest cell ${key}`);
    cellsByKey.set(key, cell);

    const bytes = await readFile(path.join(imageRoot, cell.filename));
    assert.equal(bytes.length, cell.byteSize, `${cell.filename} byte size drifted`);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      cell.sha256,
      `${cell.filename} checksum drifted`,
    );
    assert.deepEqual(
      webpDimensions(bytes),
      cell.outputDimensions,
      `${cell.filename} dimensions drifted`,
    );
  }

  assert.equal(
    manifest.cells.filter((cell) => cell.populated).length,
    manifest.summary.populatedCells,
  );
  assert.equal(
    manifest.cells.reduce((sum, cell) => sum + cell.auditedVariantCount, 0),
    manifest.summary.auditedVariantSlots,
  );

  for (const source of sources) {
    for (const family of families) {
      const key = `${source.id}:${family}`;
      assert.ok(cellsByKey.has(key), `missing ornament manifest cell ${key}`);
    }
  }
});

await test("typeface preference has stable defaults and real script-aware fonts", async () => {
  const defaults = JSON.parse(
    await readFile(path.join(root, "src/config/siteDefaults.json"), "utf8"),
  );
  assert.deepEqual(defaults, {
    defaultLanguage: "en",
    defaultTheme: "light",
    defaultFontSize: "s",
    defaultFontFamily: "modern-mono",
  });

  const [preferences, preferenceScript, styles] = await Promise.all([
    readFile(path.join(root, "src/components/Preferences.astro"), "utf8"),
    readFile(path.join(root, "src/scripts/preferences.ts"), "utf8"),
    readFile(path.join(root, "src/styles/global.css"), "utf8"),
  ]);

  assert.match(preferences, /data-font-family-toggle/);
  assert.match(preferenceScript, /yc-font-family/);
  assert.match(preferenceScript, /"modern-mono"\s*\|\s*"garamond"/);
  assert.match(styles, /EB\+Garamond:ital,wght@0,/);
  assert.match(styles, /\[data-font-family="garamond"\]/);
  assert.match(styles, /--font-cjk-body:\s*var\(--font-cjk-serif\)/);
  assert.match(styles, /--font-hebrew-body:\s*var\(--font-hebrew\)/);
  assert.match(styles, /--font-greek-body:\s*var\(--font-greek\)/);
});

console.log(`${passed} site integrity tests passed${process.exitCode ? " (with failures)" : ""}`);
