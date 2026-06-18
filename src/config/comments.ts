// 中文：评论区（回應）配置。部署 Cloudflare Worker 后，把它的网址填到 endpoint。
// English: Comment-zone config. After deploying the Cloudflare Worker, paste its URL into endpoint.
// Caveat / 注意：endpoint 为空时表单显示为「尚未开放」，但已发布的评论仍会照常显示。
// Caveat: When endpoint is empty the form shows as not-yet-open, but published comments still render.
export const commentsConfig = {
  // 例如 / e.g. "https://comments.yixincui.com" or the *.workers.dev URL Cloudflare gives you.
  endpoint: "https://yixincui-comments.chubbymeemaw.workers.dev",
  // 是否允许评论附带一张图片（需作者审核后才会发布）。
  // Whether a comment may attach one image (published only after the author approves it).
  allowImages: true,
  // 客户端图片大小上限（字节）；与 Worker 中的上限保持一致。
  // Client-side image size cap in bytes; keep this in sync with the Worker's cap.
  maxImageBytes: 2 * 1024 * 1024,
};
