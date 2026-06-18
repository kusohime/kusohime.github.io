# Comments / 评论系统 — maintainer guide

How the "responses" (回應) feature works end to end, and how to maintain it.
This is a developer reference; for the one-time deploy/ops steps see
[`scripts/comment-worker/README.md`](../scripts/comment-worker/README.md).

## TL;DR / 一句话

The site is a **static** Astro build on GitHub Pages — there is no application
server. Comments ride the same "Git is the database, approve = commit then
rebuild" rail as the rest of the content. A tiny Cloudflare Worker is the only
always-on piece; it exists solely to receive a submission and file it as a
**pending GitHub Issue** so that no write token ever reaches the browser.

## Data flow / 数据流

```
 Visitor                Cloudflare Worker            GitHub                         Site
 ───────                ─────────────────            ──────                         ────
 1. Fill form  ──POST──▶ 2. validate + store ──API──▶ 3. Issue (comment:pending)
    (Comments.astro)        image to pending branch       │
                                                          │  owner adds
                                                          ▼  comment:approved label
                                              4. comment-approve.yml
                                                 • writes content/comments/<c>/<slug>/<id>.json
                                                 • copies image → public/images/comments/
                                                 • commits to main
                                                 • dispatches deploy-pages.yml ──▶ 5. rebuild
                                                                                      │
 7. Reader sees the thread ◀──────────────────────────── <Comments> renders JSON ◀───┘
```

A separate weekly job, `comment-health.yml`, pings the Worker's `/health` so an
expired token surfaces as a failed-workflow email instead of silent breakage.

## The pieces / 各部分

| File | Role |
|---|---|
| [`src/components/Comments.astro`](../src/components/Comments.astro) | Renders the approved thread + the compose form. Ships the client script: markdown live-preview, submit (POST to the Worker), and the image **thumbnail/lightbox**. |
| [`src/lib/commentMarkdown.js`](../src/lib/commentMarkdown.js) | Safe Markdown-subset renderer (bold/italic/quote/code/list/link only). Shared by build-time render and the client preview; raw HTML and `javascript:` links are stripped. |
| [`src/config/comments.ts`](../src/config/comments.ts) | Front-end config: `endpoint` (the Worker URL — empty disables the form), `allowImages`, `maxImageBytes`. |
| [`src/content.config.ts`](../src/content.config.ts) | Defines the `comments` content collection schema, and the `comments: boolean` frontmatter flag on `works`/`writings`. |
| `content/comments/<collection>/<slug>/<id>.json` | The data. One approved comment per file. Written by the approval workflow, committed to `main`. |
| [`src/pages/works/[slug].astro`](../src/pages/works/[slug].astro), [`src/pages/writings/[slug].astro`](../src/pages/writings/[slug].astro) | Mount `<Comments>` when the entry's `comments` flag is true. |
| [`src/styles/global.css`](../src/styles/global.css) | All `.comment-*` styles, including the thumbnail (`.comment-image-zoom`) and the `.comment-lightbox` overlay. |
| [`src/config/locales.ts`](../src/config/locales.ts) | Bilingual UI chrome (`comments.*` keys). Only the *interface* is localized — comment bodies are never translated. |
| [`scripts/comment-worker/`](../scripts/comment-worker/) | The Cloudflare Worker (`worker.js`), its `wrangler.toml`, and the deploy README. |
| [`.github/workflows/comment-approve.yml`](../.github/workflows/comment-approve.yml) | On the `comment:approved` label: materialize the JSON + image, commit, and trigger the deploy. |
| [`.github/workflows/comment-health.yml`](../.github/workflows/comment-health.yml) | Weekly ping of the Worker `/health`. |
| [`.pages.yml`](../.pages.yml) | Pages CMS toggle exposing the `comments` flag in the Studio UI. |

## Comment JSON shape / 评论文件结构

`content/comments/<collection>/<slug>/<id>.json` (schema in `content.config.ts`):

```json
{
  "collection": "writings",          // "works" | "writings"
  "slug": "a-poem-by-lin-huiyin",    // must match an existing work/writing slug
  "name": "Yixin Cui",
  "date": "2026-06-18",              // YYYY-MM-DD
  "body": "text with **safe** markdown",
  "image": "/images/comments/<id>.png",   // optional
  "imageAlt": "Image attached by …",       // optional
  "replyTo": "<parent comment id>",        // optional; threads a reply
  "author": false                          // true = the site owner's reply (gets a badge)
}
```

Comments render grouped by `slug`, sorted by `date`; entries with `replyTo`
nest under their parent.

## Moderation / 日常审核

- **See pending:** repo → Issues → filter `label:comment:pending`. Each issue
  shows the text and a JSON payload block. Works from the GitHub mobile app.
- **Approve & publish:** add the **`comment:approved`** label. The site
  auto-rebuilds in ~1–2 min — no manual step. The issue then auto-labels
  `comment:published` and closes.
- **Reject:** just **close** the issue. Nothing reaches the public site.
- **Reply as the owner:** add a JSON file yourself with `"author": true` and
  `"replyTo"` set to the parent entry's id (or do it through the Studio).

Labels used: `comment:pending`, `comment:approved`, `comment:published`,
`comment:spam`.

## Config knobs / 配置项

- **Enable on a page:** set `comments: true` in the work/writing's frontmatter
  (or toggle "Open responses" in the Studio). Default is off.
- **Disable the whole form:** clear `endpoint` in `src/config/comments.ts`.
  Already-published comments still render; only new submissions are turned off.
- **Worker env** (set with `wrangler secret put` / `wrangler.toml [vars]`):
  `GITHUB_TOKEN`, `REPO` (= `kusohime/kusohime.github.io`), `ALLOWED_ORIGIN`
  (= `https://yixincui.com`), optional `HEALTH_KEY`, `TURNSTILE_SECRET`,
  `EMAIL_IN_ISSUE`, `MAX_IMAGE_BYTES`, `PENDING_BRANCH`, `DEFAULT_BRANCH`.

## Common tasks / 常见维护

- **Add a UI string:** add a `comments.*` key to `locales.ts` (both `en` + `zh`),
  reference it via `data-i18n-key` (text) or `data-i18n-en`/`data-i18n-zh`
  (attribute-style, swapped by `src/scripts/preferences.ts`).
- **Change allowed markdown:** edit `src/lib/commentMarkdown.js` (it governs both
  the published render and the live preview — keep them in sync, they share it).
- **Adjust thumbnail / lightbox:** `.comment-image-zoom` (thumbnail cap) and
  `.comment-lightbox` in `global.css`; behavior in the `initCommentLightbox`
  function in `Comments.astro`.
- **Delete or edit a published comment:** remove/edit its JSON (and image under
  `public/images/comments/`) and commit. It's just a file.
- **Rotate the GitHub token:** create a new fine-grained PAT (Contents + Issues
  read/write on `kusohime/kusohime.github.io`), then
  `Get-Clipboard | wrangler secret put GITHUB_TOKEN` (see Gotchas).

## Gotchas / 坑（务必注意）

These cost real debugging time — read before touching the pipeline.

1. **Workflow pushes don't trigger other workflows.** `comment-approve.yml`
   commits with the built-in `GITHUB_TOKEN`, and GitHub deliberately does **not**
   fire `push`-triggered workflows from such commits (anti-recursion). That's why
   the approve workflow ends with an explicit `gh workflow run deploy-pages.yml`
   (and needs `actions: write`). `workflow_dispatch` is the one event the
   `GITHUB_TOKEN` *can* trigger. Don't "simplify" this away.
2. **The Contents API empties files >1 MB.** When pulling a pending image, the
   REST Contents API returns empty content (`encoding: "none"`) for files over
   1 MB, which silently writes a 0-byte image. The approve workflow uses the
   **Blobs API** (`git.getBlob`, up to 100 MB) via the file `sha` instead.
3. **`REPO` is `kusohime/kusohime.github.io`.** The local folder is named
   "Website" — that is *not* the repo name.
4. **Secrets get stray whitespace.** Pasting a token into a console or piping a
   value often appends a newline. The Worker `trim()`s `GITHUB_TOKEN`/`REPO`
   defensively; keep that. In the **classic** Windows PowerShell console, pasting
   into wrangler's hidden secret prompt frequently drops to a 1-char value — use
   `Get-Clipboard | wrangler secret put GITHUB_TOKEN` instead.
5. **`ALLOWED_ORIGIN` must equal the live origin** (`https://yixincui.com`, the
   custom domain), or the browser CORS-blocks submissions.
6. **PAT expiry is the main maintenance item.** `comment-health.yml` emails you
   when the token dies; otherwise failures are silent. Consider a GitHub App
   (short-lived tokens, no rotation) if the yearly PAT rotation gets annoying.
7. **Pending images accumulate** under `comment-uploads/` on the
   `comment-pending` branch and are never auto-deleted. Harmless (that branch
   never deploys), but prune occasionally if you like.

## Security model / 安全模型

- The repo-writing token lives **only** as a Worker secret; it never reaches the
  front end.
- Spam defense: honeypot field + submit-timing check, optional Cloudflare
  Turnstile, all enforced server-side in the Worker.
- Commenter email is optional and **never published** (kept out of the public
  issue unless the repo is private and `EMAIL_IN_ISSUE="true"`).
- Bodies allow only a sanitized Markdown subset; raw HTML and `javascript:`
  links are stripped at both approval and render.
