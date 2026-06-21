import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderCommentMarkdown } from "../src/lib/commentMarkdown.js";
import { renderSafeInlineMarkdown } from "../src/lib/safeHtml.js";

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
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] ?? "";
}

function scalar(frontmatterText, key) {
  const match = frontmatterText.match(new RegExp(`^${key}:\\s*"?([^"\\r\\n]+)"?\\s*$`, "m"));
  return match?.[1]?.trim() ?? "";
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

await test("content collection slugs are unique", async () => {
  for (const collection of ["works", "events", "writings", "tools"]) {
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

console.log(`${passed} site integrity tests passed${process.exitCode ? " (with failures)" : ""}`);
