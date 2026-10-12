// These sections remain available in local development. Production builds
// publish only a private-area notice at their existing URLs.
export const privateSections = ["writings", "projects", "tools", "cv"];

export const privateAreaMessage = "This area is currently private.";
export const privateAreaMessageZh = "此區域目前不對外開放。";

export function isPrivatePath(pathname) {
  return privateSections.includes(pathname.split("/").filter(Boolean)[0]);
}

// Public-directory files bypass Astro middleware, so exclude these from the
// production artifact as well. The originals stay available to the local site.
export const privatePublicAssets = [
  "files/yixin-cui-cv.pdf",
  "images/chat-export-2026-06-19",
  "images/projects",
  "images/murakamiandoe.jpg",
  "images/manuscript-home.webp",
];
