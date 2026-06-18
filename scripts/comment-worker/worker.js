/*
 * 中文：Cloudflare Worker——接收公开评论提交，存为「待审」GitHub issue（图片存到 pending 分支）。
 * English: Cloudflare Worker — receives public comment submissions and files them as a PENDING GitHub issue (images go to a pending branch).
 * Caveat / 注意：写入仓库的 GitHub token 只存在 Worker secret 中，绝不出现在网站前端。
 * Caveat: The repo-writing GitHub token lives only as a Worker secret; it never reaches the website front end.
 *
 * Secrets / 环境变量 (wrangler secret put …):
 *   GITHUB_TOKEN    fine-grained PAT or App token with Contents + Issues read/write on the repo
 *   REPO            "owner/repo", e.g. "kusohime/kusohime.github.io"
 *   ALLOWED_ORIGIN  e.g. "https://yixincui.com" (use "*" only for local testing)
 * Optional:
 *   DEFAULT_BRANCH  default "main"
 *   PENDING_BRANCH  default "comment-pending" (never deployed; only main triggers Pages)
 *   TURNSTILE_SECRET  enable Cloudflare Turnstile verification when set
 *   EMAIL_IN_ISSUE  "true" to store the commenter email in the (private) issue; leave unset for public repos
 *   MAX_IMAGE_BYTES default 2097152 (2 MB)
 *   HEALTH_KEY      if set, GET /health requires ?key=<this>; lets the scheduled
 *                   health workflow ping without exposing the check to everyone
 *
 * Health check / 健康检查:
 *   GET /health makes one authenticated no-op call to GitHub and returns 200 when
 *   the token still works, 500 otherwise. The comment-health workflow pings this
 *   weekly so an expired GITHUB_TOKEN surfaces as an email instead of silent breakage.
 */

const GH = "https://api.github.com";

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

// 注意：密钥经各种 shell 设置时常带尾随换行/空白；统一 trim，避免 token 头或仓库 URL 被污染。
// Note: secrets set via various shells often pick up a trailing newline/whitespace; trim them so
// the Authorization header and repo URL never get corrupted (e.g. GET /repos/owner/repo\r\n → 400).
function token(env) {
  return String(env.GITHUB_TOKEN || "").trim();
}

function repoSlug(env) {
  return String(env.REPO || "").trim();
}

function gh(env, path, init = {}) {
  return fetch(`${GH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token(env)}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "yixincui-comment-worker",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token || "");
  if (ip) form.append("remoteip", ip);
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form },
  );
  const data = await res.json().catch(() => ({}));
  return data.success === true;
}

async function handleHealth(env, url) {
  // 可选的共享密钥：设了 HEALTH_KEY 就要求 ?key= 匹配，避免有人随意触发 GitHub 调用。
  // Optional shared secret: when HEALTH_KEY is set, require a matching ?key= so the
  // endpoint can't be hit (and burn GitHub rate limit) by just anyone.
  if (env.HEALTH_KEY && url.searchParams.get("key") !== env.HEALTH_KEY) {
    return json({ ok: false, error: "unauthorized" }, 401, env);
  }
  if (!token(env) || !repoSlug(env)) {
    return json({ ok: false, error: "worker not configured" }, 500, env);
  }
  // 无副作用的认证调用：能读到仓库 = token 仍然有效且有权限。
  // No-op authenticated call: reading the repo proves the token is still valid and scoped.
  const res = await gh(env, `/repos/${repoSlug(env)}`);
  if (!res.ok) {
    return json(
      { ok: false, status: res.status, error: "github unreachable or token invalid" },
      500,
      env,
    );
  }
  return json({ ok: true }, 200, env);
}

async function ensureBranch(env, branch) {
  const base = env.DEFAULT_BRANCH || "main";
  const repo = repoSlug(env);
  const head = await gh(env, `/repos/${repo}/git/ref/heads/${branch}`);
  if (head.ok) return;
  const baseRef = await gh(env, `/repos/${repo}/git/ref/heads/${base}`);
  if (!baseRef.ok) throw new Error("cannot read default branch");
  const baseData = await baseRef.json();
  await gh(env, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseData.object.sha }),
  });
}

async function storePendingImage(env, image, collection, slug, id) {
  const max = Number(env.MAX_IMAGE_BYTES || 2097152);
  const ext = image.type === "image/png" ? "png" : image.type === "image/jpeg" ? "jpg" : null;
  if (!ext) throw new Error("unsupported image type");
  const data = String(image.data || "");
  if (!data || (data.length * 3) / 4 > max) throw new Error("image too large");
  const branch = env.PENDING_BRANCH || "comment-pending";
  await ensureBranch(env, branch);
  const path = `comment-uploads/${collection}/${slug}/${id}.${ext}`;
  const res = await gh(env, `/repos/${repoSlug(env)}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Pending comment image for ${slug}`,
      content: data,
      branch,
    }),
  });
  if (!res.ok) throw new Error("image upload failed");
  return path;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }
    if (request.method === "GET" && url.pathname === "/health") {
      return handleHealth(env, url);
    }
    if (request.method !== "POST") {
      return json({ error: "method not allowed" }, 405, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400, env);
    }

    // 蜜罐字段被填写 = 机器人；假装成功。
    // Honeypot filled = bot; pretend success so it stops.
    if (body.website) return json({ ok: true }, 200, env);

    // 提交过快通常是脚本。Form fills faster than ~3s are almost always scripts.
    if (!body.loadedAt || Date.now() - Number(body.loadedAt) < 3000) {
      return json({ error: "too fast" }, 400, env);
    }

    const okTurnstile = await verifyTurnstile(
      env,
      body.turnstileToken,
      request.headers.get("CF-Connecting-IP"),
    );
    if (!okTurnstile) return json({ error: "verification failed" }, 400, env);

    const name = String(body.name || "").trim().slice(0, 80);
    const text = String(body.body || "").trim().slice(0, 4000);
    const collection = body.collection === "works" ? "works" : "writings";
    const slug = String(body.slug || "").replace(/[^a-z0-9-]/gi, "").slice(0, 120);
    if (!name || !text || !slug) return json({ error: "missing fields" }, 400, env);

    const id = `${today()}-${Math.random().toString(36).slice(2, 8)}`;

    let imagePath = null;
    if (body.image && body.image.data) {
      try {
        imagePath = await storePendingImage(env, body.image, collection, slug, id);
      } catch (error) {
        return json({ error: String(error.message || error) }, 400, env);
      }
    }

    const payload = {
      collection,
      slug,
      name,
      date: today(),
      body: text,
      notify: Boolean(body.notify),
      replyTo: null,
      imagePath,
    };
    if (env.EMAIL_IN_ISSUE === "true") {
      payload.email = String(body.email || "").slice(0, 160);
    }

    const issueBody = [
      `Pending comment on \`${collection}/${slug}\` from **${name}**.`,
      "",
      "Add the `comment:approved` label to publish, or close this issue to reject.",
      "",
      "```json",
      JSON.stringify(payload, null, 2),
      "```",
    ].join("\n");

    const created = await gh(env, `/repos/${repoSlug(env)}/issues`, {
      method: "POST",
      body: JSON.stringify({
        title: `[comment] ${name} on ${slug}`,
        body: issueBody,
        labels: ["comment:pending"],
      }),
    });
    if (!created.ok) return json({ error: "could not file comment" }, 502, env);

    return json({ ok: true }, 200, env);
  },
};
