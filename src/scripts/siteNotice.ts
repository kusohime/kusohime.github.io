/**
 * 中文：关闭全站施工提示，并在当前浏览器标签页中记住关闭状态。
 * English: Dismisses the construction notice and remembers it for the current browser tab.
 * Caveat / 注意：关闭状态使用 sessionStorage；新标签页或新会话会再次显示提示。
 * Caveat: Dismissal uses sessionStorage, so the notice returns in a new tab or session.
 */
const NOTICE_SESSION_KEY = "yc-site-notice-dismissed";

export function initializeSiteNotice() {
  const notice = document.querySelector<HTMLElement>(".site-notice");
  const dismissButton =
    notice?.querySelector<HTMLButtonElement>("[data-site-notice-dismiss]");
  if (!notice || !dismissButton) return;

  dismissButton.addEventListener("click", () => {
    document.documentElement.dataset.siteNotice = "dismissed";
    notice.hidden = true;

    try {
      sessionStorage.setItem(NOTICE_SESSION_KEY, "true");
    } catch {}
  });
}
