# Comment intake Worker / 评论接收 Worker

This small Cloudflare Worker is the only piece of the comment zone that cannot
live inside the static site. It receives a comment submission from the website,
files it as a **pending** GitHub issue, and (if there is an image) stores that
image on a non-deploying branch. You approve a comment by adding a label to its
issue; the `comment-approve` GitHub Action then writes the comment into
`content/comments/…` and your normal Pages deploy rebuilds the site.

这个 Cloudflare Worker 是评论区里唯一无法放进静态网站的部分。它接收网站提交的评论，
存成「待审」GitHub issue（图片存到不会触发部署的分支）。你给该 issue 加上标签即可批准，
`comment-approve` 工作流会把评论写入 `content/comments/…`，随后正常的 Pages 部署重建网站。

## What only you can do / 只有你能做的事

1. **Create four issue labels** in the GitHub repo (Issues → Labels):
   `comment:pending`, `comment:approved`, `comment:published`, `comment:spam`.

2. **Create a GitHub token** (Settings → Developer settings →
   Fine-grained tokens), scoped to this repository, with permissions:
   - Contents: **Read and write**
   - Issues: **Read and write**

3. **Deploy the Worker** (from this folder):
   ```bash
   npm install -g wrangler        # if you don't have it
   wrangler login
   wrangler secret put GITHUB_TOKEN   # paste the token from step 2
   wrangler secret put REPO           # type: kusohime/Website
   wrangler deploy
   ```
   Wrangler prints a URL like `https://yixincui-comments.<you>.workers.dev`
   (or your custom route).

4. **Paste that URL** into [`src/config/comments.ts`](../../src/config/comments.ts)
   as `endpoint`, then commit. The compose form goes live on every page that has
   `comments: true`.

That's the whole setup. Everything else (the form, rendering, the approval
Action) is already in the repo.

## Day-to-day moderation / 日常审核

- **See pending comments:** open the repo's Issues, filter by the
  `comment:pending` label. Each issue shows the comment text and a JSON block.
  This works from the GitHub mobile app too.
- **Approve & publish:** add the `comment:approved` label. The Action writes the
  file, commits to `main`, and the site rebuilds in ~1 minute.
- **Reject:** just close the issue. Nothing reaches the public site.
- **Reply as the author:** add an approved comment file yourself (or via the
  Studio) with `"author": true` and `"replyTo"` set to the parent comment's id.

## Optional extras / 可选项

- **Spam captcha:** set `wrangler secret put TURNSTILE_SECRET` and add the
  matching Turnstile widget to the form. Without it, the honeypot + timing check
  still block most bots.
- **Email / reply notifications:** the form collects an optional email, but the
  Worker does **not** put it in a public issue by default (privacy). To use it,
  either make the repo private and set `EMAIL_IN_ISSUE = "true"`, or wire a
  Cloudflare KV namespace to store address→comment mappings.

## Notes / 备注

- The three sample comments under
  `content/comments/writings/listening-at-the-edge-of-the-archive/` are demo
  data — delete them whenever you like.
- Comment bodies accept a safe Markdown subset only (bold, italic, blockquote,
  inline code, links, lists); raw HTML and `javascript:` links are stripped.
  See [`src/lib/commentMarkdown.js`](../../src/lib/commentMarkdown.js).
