# Yixin Cui Website / 崔逸新个人网站

**中文：** 这是 Astro 静态网站与本地 Website Studio 的项目根目录。
日常作品和文章维护请直接进入 `content/`；网站结构、组件与样式位于 `src/`。

**English:** This is the project root for the Astro static site and local
Website Studio. For ordinary works and writings, begin in `content/`; site
structure, components, and styles live in `src/`.

## Main Folders / 主要文件夹

- `content/`: editable works and writings; see `content/README.md`.
- `content/`: 可编辑的作品与文章；详见 `content/README.md`。
- `src/`: website routes, components, scripts, schemas, and CSS.
- `src/`: 网站路由、组件、脚本、数据检查与 CSS。
- `public/`: files served directly, including images and the favicon.
- `public/`: 直接公开的图片与 favicon 等静态文件。

## Video Support / 影片支援

Work pages can show PeerTube videos without using YouTube or other ad-based
platforms. Add videos through the local Website Studio: run `npm run dev`,
open `/admin/`, then use **New > PeerTube video** for a new work or
**Library > Works > PeerTube video** for an existing work. The embed URL is the
only required video field; poster image, captions, title, and the public
PeerTube page link are optional.

作品頁可以顯示 PeerTube 影片，不需要使用 YouTube 或其他廣告平台。請透過本地
Website Studio 新增影片：執行 `npm run dev`、開啟 `/admin/`，新增作品時使用
**New > PeerTube video**，修改既有作品時使用
**Library > Works > PeerTube video**。影片只必須填寫嵌入網址；封面圖、說明文字、
標題與公開 PeerTube 頁面連結都可選。

For maintainer details, see `content/README.md` and
`src/pages/admin/guide/website-maintenance.md`.

維護細節請見 `content/README.md` 與
`src/pages/admin/guide/website-maintenance.md`。

## Comments / 评论系统

Moderated "responses" can be enabled per page (`comments: true` frontmatter).
Submissions are filed as pending GitHub Issues by a small Cloudflare Worker and
published by adding the `comment:approved` label. For the full architecture,
data flow, moderation, config, and gotchas, see
[`docs/comments.md`](docs/comments.md); for one-time deploy/ops see
[`scripts/comment-worker/README.md`](scripts/comment-worker/README.md).

可按页面开启「回應」（在 frontmatter 设 `comments: true`）。访客提交由一个小型
Cloudflare Worker 存为待审 GitHub Issue，加上 `comment:approved` 标签即发布。
完整架构、数据流、审核、配置与注意事项见
[`docs/comments.md`](docs/comments.md)；一次性部署步骤见
[`scripts/comment-worker/README.md`](scripts/comment-worker/README.md)。

## Commands / 命令

```text
npm run dev      Local editing and preview / 本地编辑与预览
npm run check    Astro and TypeScript checks / 类型与结构检查
npm run build    Production static build / 生成静态网站
```

## Generated Files / 自动生成文件

`package-lock.json`, `.astro/`, and `dist/` are generated. Do not add
maintenance comments or hand-edit their internal content; update source files
or `package.json` and let the tools regenerate them.

`package-lock.json`、`.astro/` 与 `dist/` 都是自动生成内容。不要手动加入注释或
修改内部结构；应修改源文件或 `package.json`，再由工具重新生成。

## Publishing / 发布

The workflow at `.github/workflows/deploy-pages.yml` checks and builds the site,
removes the local-only Admin Studio from the public artifact, and deploys the
remaining files to GitHub Pages whenever `main` is updated.

`.github/workflows/deploy-pages.yml` 会在 `main` 更新时检查并构建网站，从公开
产物中移除仅限本地使用的管理器，再将其余文件发布到 GitHub Pages。

The production address is `https://yixincui.com`. In the GitHub repository,
select **Settings > Pages > GitHub Actions**, set the custom domain to
`yixincui.com`, and enable HTTPS after the certificate becomes available.

正式网址为 `https://yixincui.com`。在 GitHub 仓库中选择
**Settings > Pages > GitHub Actions**，将自定义域名设置为 `yixincui.com`，
并在证书可用后开启 HTTPS。

Current required DNS / 当前所需 DNS:

```text
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
CNAME  www    kusohime.github.io
```

GitHub domain verification also requires a TXT record whose host and value are
generated under personal **Settings > Pages > Add a domain**. Keep that TXT
record after verification.

GitHub 域名验证还需要一条 TXT 记录，其主机名和值会在个人
**Settings > Pages > Add a domain** 中生成。验证完成后应保留该 TXT 记录。
