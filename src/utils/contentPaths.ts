/**
 * 中文：从 Astro collection 的条目 ID 取得最外层内容文件夹。
 * English: Extract the top-level content folder from an Astro collection ID.
 *
 * Caveat / 注意：内容加载器必须继续以 content/works 或 content/writings
 * 为 base；如果改变 loader base，请同时检查这里的文件夹推断逻辑。
 * Caveat: If a loader base changes, re-check this folder inference.
 */
export function contentFolder(entryId: string) {
  return entryId.replaceAll("\\", "/").split("/")[0];
}
