/**
 * 中文：本文件驱动本地 Website Studio，包括解锁、文件树、编辑器、搜索与预览。
 * English: Drives the local Website Studio: unlocking, files, editing, search, and preview.
 *
 * Caveat / 注意：这里的文件 API 只应连接 astro.config.mjs 中的本地开发中间件；
 * it must never be treated as production authentication or a public CMS backend.
 */
import { indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";
import { workCategories, writingTypes } from "../config/contentTaxonomy";

interface DirectoryPickerOptions {
  mode?: "read" | "readwrite";
}

interface WritableFileStream {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

interface ProjectFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<WritableFileStream>;
}

interface ProjectDirectoryHandle {
  kind: "directory";
  name: string;
  entries(): AsyncIterableIterator<[string, ProjectFileHandle | ProjectDirectoryHandle]>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (
      options?: DirectoryPickerOptions,
    ) => Promise<ProjectDirectoryHandle>;
  }
}

interface SearchResult {
  path: string;
  line: number;
  column: number;
  excerpt: string;
}

interface GitStatusEntry {
  path: string;
  oldPath?: string;
  status: string;
  staged: boolean;
  unstaged: boolean;
}

interface GitSnapshot {
  branch: string;
  upstream: string;
  ahead: number;
  behind: number;
  clean: boolean;
  entries: GitStatusEntry[];
}

interface FileTreeNode {
  folders: Map<string, FileTreeNode>;
  files: string[];
}

const ADMIN_PASSCODE = "0592";
const LINE_WRAP_STORAGE_KEY = "yixin-cui-studio-line-wrap";
const CURRENT_FILE_SESSION_KEY = "yixin-cui-studio-current-file";
const PREVIEW_PATH_SESSION_KEY = "yixin-cui-studio-preview-path";
const PREVIEW_MODE_SESSION_KEY = "yixin-cui-studio-preview-mode";
const PREVIEW_SIZE_SESSION_KEY = "yixin-cui-studio-preview-size";
const PANE_LAYOUT_STORAGE_KEY = "yixin-cui-studio-pane-layout";
const GLOBAL_CSS_PATH = "src/styles/global.css";
const MOTION_SETTINGS_PATH = "src/config/motion.json";
const TYPOGRAPHY_SETTINGS_PATH = "src/config/typography.json";
const SITE_DEFAULTS_PATH = "src/config/siteDefaults.json";
const CONTENT_TAXONOMY_PATH = "src/config/contentTaxonomy.ts";

type MotionSetting =
  | "languageFlap"
  | "themeFade"
  | "fontSizeScale"
  | "glyphRotation"
  | "interfaceMotion";

type MotionSettings = Record<MotionSetting, boolean>;

interface TypographySettings {
  cjkLetterSpacingEm: number;
}

const defaultMotionSettings: MotionSettings = {
  languageFlap: false,
  themeFade: false,
  fontSizeScale: false,
  glyphRotation: false,
  interfaceMotion: false,
};

const ignoredDirectories = new Set([
  ".astro",
  ".claude",
  ".github",
  ".desktop-build",
  ".git",
  ".npm-cache",
  "desktop-dist",
  "dist",
  "graphify-out",
  "node_modules",
]);

const isIgnoredEntry = (name: string) =>
  name.startsWith(".tmp-") || name.startsWith(".publish-source.");

const editableExtensions = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".txt",
  ".yaml",
  ".yml",
]);

const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

function extensionOf(path: string) {
  const index = path.lastIndexOf(".");
  return index >= 0 ? path.slice(index).toLowerCase() : "";
}

function publicImageUrl(path: string) {
  return path.startsWith("public/") ? `/${path.slice("public/".length)}` : path;
}

async function responseError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? `Studio request failed (${response.status}).`;
  } catch {
    return `Studio request failed (${response.status}).`;
  }
}

export async function initializeAdminStudio() {
  const studio = document.querySelector<HTMLElement>("[data-admin-studio]");
  if (!studio) return;

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const workspace = studio.querySelector<HTMLElement>(".studio-workspace");
  const toolbar = studio.querySelector<HTMLElement>(".studio-toolbar");
  const localOnly = studio.querySelector<HTMLElement>("[data-local-only]");

  if (!isLocal) {
    studio.hidden = false;
    if (workspace) workspace.hidden = true;
    if (toolbar) toolbar.hidden = true;
    if (localOnly) localOnly.hidden = false;
    return;
  }

  const activePasscode = ADMIN_PASSCODE;
  studio.hidden = false;

  // 低饱和度但有明显区分的语法色；JSON 与 Astro 标记会比默认主题更易读。
  // Restrained but distinct syntax colors make JSON and Astro markup easier to scan.
  const studioHighlightStyle = HighlightStyle.define([
    {
      tag: tags.comment,
      color: "#727272",
      fontStyle: "italic",
    },
    {
      tag: [
        tags.keyword,
        tags.controlKeyword,
        tags.definitionKeyword,
        tags.modifier,
      ],
      color: "#a01832",
      fontWeight: "600",
    },
    {
      tag: [tags.tagName, tags.typeName, tags.className],
      color: "#16558a",
      fontWeight: "600",
    },
    {
      tag: [tags.attributeName, tags.propertyName],
      color: "#74429a",
    },
    {
      tag: [tags.string, tags.url],
      color: "#18703d",
    },
    {
      tag: [tags.number, tags.bool, tags.null, tags.atom],
      color: "#9a4d00",
    },
    {
      tag: [tags.variableName, tags.definition(tags.variableName)],
      color: "#285f7a",
    },
    {
      tag: [
        tags.function(tags.variableName),
        tags.function(tags.propertyName),
      ],
      color: "#7b560d",
    },
    {
      tag: [tags.operator, tags.punctuation, tags.bracket],
      color: "#55515d",
    },
    {
      tag: tags.meta,
      color: "#8a5a14",
    },
  ]);

  const languageCompartment = new Compartment();
  const languageFor = (path: string) => {
    const extension = extensionOf(path);

    if (extension === ".md" || extension === ".yaml" || extension === ".yml") {
      return markdown();
    }
    if (extension === ".css") return css();
    if (extension === ".json") return json();
    if (
      extension === ".html" ||
      extension === ".svg" ||
      extension === ".astro"
    ) {
      return html();
    }
    if (extension === ".ts") return javascript({ typescript: true });
    if (extension === ".js" || extension === ".mjs") return javascript();
    return [];
  };

  const openFolderButton =
    studio.querySelector<HTMLButtonElement>("[data-open-folder]");
  const saveButton =
    studio.querySelector<HTMLButtonElement>("[data-save-file]");
  const autoSaveInput =
    studio.querySelector<HTMLInputElement>("[data-auto-save]");
  const autoRefreshInput =
    studio.querySelector<HTMLInputElement>("[data-auto-refresh]");
  const status =
    studio.querySelector<HTMLElement>("[data-status]");
  const currentFileLabel =
    studio.querySelector<HTMLElement>("[data-current-file]");
  const dirtyLabel =
    studio.querySelector<HTMLElement>("[data-dirty-state]");
  const editorHost =
    studio.querySelector<HTMLElement>("[data-code-editor]");
  const fileList =
    studio.querySelector<HTMLUListElement>("[data-file-list]");
  const fileFilter =
    studio.querySelector<HTMLInputElement>("[data-file-filter]");
  const imageLibrary =
    studio.querySelector<HTMLElement>("[data-image-library]");
  const imageAddButton =
    studio.querySelector<HTMLButtonElement>("[data-image-add]");
  const imageInput = studio.querySelector<HTMLInputElement>("[data-image-input]");
  const imageFolderInput = studio.querySelector<HTMLInputElement>(
    "[data-image-upload-folder]",
  );
  const imageUploadMessage = studio.querySelector<HTMLElement>(
    "[data-image-message]",
  );
  const previewFrame =
    studio.querySelector<HTMLIFrameElement>("[data-preview-frame]");
  const previewPath =
    studio.querySelector<HTMLInputElement>("[data-preview-path]");
  const loadPreviewButton =
    studio.querySelector<HTMLButtonElement>("[data-load-preview]");
  const refreshPreviewButton =
    studio.querySelector<HTMLButtonElement>("[data-refresh-preview]");
  const openPreviewLink =
    studio.querySelector<HTMLAnchorElement>("[data-open-preview]");
  const openThemeCssButton =
    studio.querySelector<HTMLButtonElement>("[data-open-theme-css]");
  const motionSettingsFieldset =
    studio.querySelector<HTMLFieldSetElement>("[data-motion-settings]");
  const motionSettingsStatus =
    studio.querySelector<HTMLElement>("[data-motion-settings-status]");
  const motionSettingInputs =
    studio.querySelectorAll<HTMLInputElement>("[data-motion-setting]");
  const typographySettingsFieldset =
    studio.querySelector<HTMLFieldSetElement>("[data-typography-settings]");
  const cjkLetterSpacingInput =
    studio.querySelector<HTMLInputElement>("[data-cjk-letter-spacing]");
  const cjkLetterSpacingOutput =
    studio.querySelector<HTMLOutputElement>("[data-cjk-letter-spacing-output]");
  const searchForm =
    studio.querySelector<HTMLFormElement>("[data-search-form]");
  const globalSearchInput =
    studio.querySelector<HTMLInputElement>("[data-global-search]");
  const searchSummary =
    studio.querySelector<HTMLElement>("[data-search-summary]");
  const searchResults =
    studio.querySelector<HTMLOListElement>("[data-search-results]");
  const previewStage =
    studio.querySelector<HTMLElement>("[data-preview-stage]");
  const lineWrapInput =
    studio.querySelector<HTMLInputElement>("[data-line-wrap]");
  const previewInspectorInput =
    studio.querySelector<HTMLInputElement>("[data-preview-inspector]");
  const previewVisualEditorInput =
    studio.querySelector<HTMLInputElement>("[data-preview-visual-editor]");
  const studioWorkspace =
    studio.querySelector<HTMLElement>("[data-studio-workspace]");
  const searchBlock =
    studio.querySelector<HTMLElement>("[data-search-block]");
  const searchClearButton =
    studio.querySelector<HTMLButtonElement>("[data-search-clear]");
  const defaultLanguageSelect =
    studio.querySelector<HTMLSelectElement>("[data-default-language]");
  const defaultFontFamilySelect =
    studio.querySelector<HTMLSelectElement>("[data-default-font-family]");
  const defaultFontSizeSelect =
    studio.querySelector<HTMLSelectElement>("[data-default-font-size]");
  const defaultThemeSelect =
    studio.querySelector<HTMLSelectElement>("[data-default-theme]");
  const siteDefaultsFieldset =
    studio.querySelector<HTMLFieldSetElement>("[data-site-defaults]");
  const indentToggle =
    studio.querySelector<HTMLInputElement>("[data-indent-toggle]");
  const newPageForm =
    studio.querySelector<HTMLFormElement>("[data-new-page-form]");
  const newKindSelect =
    studio.querySelector<HTMLSelectElement>("[data-new-kind]");
  const newTitleInput =
    studio.querySelector<HTMLInputElement>("[data-new-title]");
  const newSlugInput =
    studio.querySelector<HTMLInputElement>("[data-new-slug]");
  const newSubmitButton =
    studio.querySelector<HTMLButtonElement>("[data-new-submit]");
  const newMessage =
    studio.querySelector<HTMLElement>("[data-new-message]");
  const draftShelfButton =
    studio.querySelector<HTMLButtonElement>("[data-draft-shelf]");
  const libraryKindSelect =
    studio.querySelector<HTMLSelectElement>("[data-library-kind]");
  const libraryFilterInput =
    studio.querySelector<HTMLInputElement>("[data-library-filter]");
  const libraryList =
    studio.querySelector<HTMLOListElement>("[data-library-list]");
  const libraryForm =
    studio.querySelector<HTMLFormElement>("[data-library-form]");
  const libraryPathLabel =
    studio.querySelector<HTMLElement>("[data-library-path]");
  const libraryMessage =
    studio.querySelector<HTMLElement>("[data-library-message]");
  const libraryOpenButton =
    studio.querySelector<HTMLButtonElement>("[data-library-open]");
  const libraryPreviewButton =
    studio.querySelector<HTMLButtonElement>("[data-library-preview]");
  const libraryTrashButton =
    studio.querySelector<HTMLButtonElement>("[data-library-trash]");
  const libraryCategorySelect =
    studio.querySelector<HTMLSelectElement>("[data-library-category]");
  const libraryTagsContainer =
    studio.querySelector<HTMLElement>("[data-library-tags]");
  const markdownToolbar =
    studio.querySelector<HTMLElement>("[data-md-toolbar]");
  const taxonomyKindSelect =
    studio.querySelector<HTMLSelectElement>("[data-taxonomy-kind]");
  const taxonomyListSelect =
    studio.querySelector<HTMLSelectElement>("[data-taxonomy-list]");
  const taxonomyValueInput =
    studio.querySelector<HTMLInputElement>("[data-taxonomy-value]");
  const taxonomyAddButton =
    studio.querySelector<HTMLButtonElement>("[data-taxonomy-add]");
  const taxonomyRenameButton =
    studio.querySelector<HTMLButtonElement>("[data-taxonomy-rename]");
  const taxonomyDeleteButton =
    studio.querySelector<HTMLButtonElement>("[data-taxonomy-delete]");
  const taxonomyMessage =
    studio.querySelector<HTMLElement>("[data-taxonomy-message]");
  const publishForm =
    studio.querySelector<HTMLFormElement>("[data-publish-form]");
  const publishRefreshButton =
    studio.querySelector<HTMLButtonElement>("[data-publish-refresh]");
  const publishSelectAllButton =
    studio.querySelector<HTMLButtonElement>("[data-publish-select-all]");
  const publishFileList =
    studio.querySelector<HTMLOListElement>("[data-publish-file-list]");
  const publishSummary =
    studio.querySelector<HTMLElement>("[data-publish-summary]");
  const publishCommitMessage =
    studio.querySelector<HTMLInputElement>("[data-publish-commit-message]");
  const publishSubmitButton =
    studio.querySelector<HTMLButtonElement>("[data-publish-submit]");
  const publishMessage =
    studio.querySelector<HTMLElement>("[data-publish-message]");

  if (
    !openFolderButton ||
    !saveButton ||
    !autoSaveInput ||
    !autoRefreshInput ||
    !status ||
    !currentFileLabel ||
    !dirtyLabel ||
    !editorHost ||
    !fileList ||
    !fileFilter ||
    !imageLibrary ||
    !previewFrame ||
    !previewPath ||
    !loadPreviewButton ||
    !refreshPreviewButton ||
    !openPreviewLink ||
    !openThemeCssButton ||
    !motionSettingsFieldset ||
    !motionSettingsStatus ||
    !typographySettingsFieldset ||
    !cjkLetterSpacingInput ||
    !cjkLetterSpacingOutput ||
    !searchForm ||
    !globalSearchInput ||
    !searchSummary ||
    !searchResults ||
    !previewStage ||
    !lineWrapInput ||
    !previewInspectorInput ||
    !previewVisualEditorInput ||
    !studioWorkspace ||
    !searchBlock ||
    !searchClearButton ||
    !defaultLanguageSelect ||
    !defaultFontFamilySelect ||
    !defaultFontSizeSelect ||
    !defaultThemeSelect ||
    !siteDefaultsFieldset ||
    !indentToggle ||
    !newPageForm ||
    !newKindSelect ||
    !newTitleInput ||
    !newSlugInput ||
    !newSubmitButton ||
    !newMessage ||
    !draftShelfButton ||
    !libraryKindSelect ||
    !libraryFilterInput ||
    !libraryList ||
    !libraryForm ||
    !libraryPathLabel ||
    !libraryMessage ||
    !libraryOpenButton ||
    !libraryPreviewButton ||
    !libraryTrashButton ||
    !libraryCategorySelect ||
    !libraryTagsContainer ||
    !markdownToolbar ||
    !taxonomyKindSelect ||
    !taxonomyListSelect ||
    !taxonomyValueInput ||
    !taxonomyAddButton ||
    !taxonomyRenameButton ||
    !taxonomyDeleteButton ||
    !taxonomyMessage ||
    !publishForm ||
    !publishRefreshButton ||
    !publishSelectAllButton ||
    !publishFileList ||
    !publishSummary ||
    !publishCommitMessage ||
    !publishSubmitButton ||
    !publishMessage
  ) {
    return;
  }

  // 后续嵌套函数使用稳定的非空引用，避免 TypeScript 丢失上方的 DOM 检查结果。
  // Stable non-null references preserve the DOM checks inside later nested helpers.
  const fileListElement = fileList;
  const fileFilterInput = fileFilter;
  const isImeKeyEvent = (event: KeyboardEvent) => {
    const legacyKeyCode = Number(
      (event as unknown as { keyCode?: number }).keyCode ?? 0,
    );
    return event.isComposing || event.key === "Process" || legacyKeyCode === 229;
  };

  type PaneName = "sidebar" | "editor" | "preview";
  interface PaneLayout {
    sidebarWidth: number;
    editorWidth: number;
    collapsed: PaneName[];
  }

  const readPaneLayout = (): PaneLayout => {
    try {
      const stored = localStorage.getItem(PANE_LAYOUT_STORAGE_KEY);
      if (!stored) {
        return { sidebarWidth: 272, editorWidth: 560, collapsed: [] };
      }
      const parsed = JSON.parse(stored) as Partial<PaneLayout>;
      return {
        sidebarWidth: Number(parsed.sidebarWidth) || 272,
        editorWidth: Number(parsed.editorWidth) || 560,
        collapsed: Array.isArray(parsed.collapsed)
          ? parsed.collapsed.filter(
              (pane): pane is PaneName =>
                pane === "sidebar" || pane === "editor" || pane === "preview",
            )
          : [],
      };
    } catch {
      return { sidebarWidth: 272, editorWidth: 560, collapsed: [] };
    }
  };

  let paneLayout = readPaneLayout();

  const clampPaneLayout = () => {
    const availableWidth = studioWorkspace.getBoundingClientRect().width;
    if (!availableWidth) return;
    const sidebarMax = Math.max(150, availableWidth - 520);
    paneLayout.sidebarWidth = Math.min(
      Math.max(paneLayout.sidebarWidth, 150),
      sidebarMax,
    );
    const editorMax = Math.max(
      260,
      availableWidth - paneLayout.sidebarWidth - 270,
    );
    paneLayout.editorWidth = Math.min(
      Math.max(paneLayout.editorWidth, 260),
      editorMax,
    );
  };

  const applyPaneLayout = () => {
    clampPaneLayout();
    // 行内变量会覆盖样式表里的折叠宽度，所以折叠状态必须在这里直接落实。
    // Inline variables override the stylesheet's collapsed widths, so the
    // collapsed size must be written here, not only in CSS.
    studioWorkspace.style.setProperty(
      "--studio-sidebar-width",
      paneLayout.collapsed.includes("sidebar")
        ? "2.65rem"
        : `${paneLayout.sidebarWidth}px`,
    );
    studioWorkspace.style.setProperty(
      "--studio-editor-width",
      paneLayout.collapsed.includes("editor")
        ? "2.65rem"
        : `${paneLayout.editorWidth}px`,
    );

    (["sidebar", "editor", "preview"] as PaneName[]).forEach((pane) => {
      const collapsed = paneLayout.collapsed.includes(pane);
      studioWorkspace.dataset[
        `paneCollapsed${pane[0].toUpperCase()}${pane.slice(1)}` as
          | "paneCollapsedSidebar"
          | "paneCollapsedEditor"
          | "paneCollapsedPreview"
      ] = String(collapsed);
      const button = studio.querySelector<HTMLButtonElement>(
        `[data-pane-toggle="${pane}"]`,
      );
      if (button) {
        const label = `${collapsed ? "Expand" : "Collapse"} ${
          pane === "sidebar" ? "project" : pane === "editor" ? "code" : "preview"
        } pane`;
        button.textContent = collapsed ? "+" : "-";
        button.setAttribute("aria-label", label);
        button.title = label;
        button.setAttribute("aria-expanded", String(!collapsed));
      }
    });
    studioWorkspace.scrollLeft = 0;
  };

  const storePaneLayout = () => {
    localStorage.setItem(PANE_LAYOUT_STORAGE_KEY, JSON.stringify(paneLayout));
  };

  applyPaneLayout();

  const storedPreviewPath =
    sessionStorage.getItem(PREVIEW_PATH_SESSION_KEY) ?? "/";
  const storedPreviewMode =
    sessionStorage.getItem(PREVIEW_MODE_SESSION_KEY) ?? "";
  const storedPreviewSize =
    sessionStorage.getItem(PREVIEW_SIZE_SESSION_KEY) === "phone"
      ? "phone"
      : "desktop";
  previewPath.value = storedPreviewPath;
  openPreviewLink.href = storedPreviewPath;
  previewInspectorInput.checked = storedPreviewMode === "inspect";
  previewVisualEditorInput.checked = storedPreviewMode === "visual";
  previewStage.dataset.previewStage = storedPreviewSize;
  studio
    .querySelectorAll<HTMLButtonElement>("[data-preview-size]")
    .forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.previewSize === storedPreviewSize),
      );
    });

  const fileHandles = new Map<string, ProjectFileHandle>();
  const imageHandles = new Map<string, ProjectFileHandle>();
  const imageUrls: string[] = [];
  let currentPath = "";
  let dirty = false;
  let loadingDocument = false;
  let documentRevision = 0;
  let loadGeneration = 0;
  let saveQueue: Promise<void> = Promise.resolve();
  let saveTimer: number | undefined;
  let previewTimer: number | undefined;
  let activePreviewPath = storedPreviewPath;
  let apiConnected = false;
  let latestGitSnapshot: GitSnapshot | null = null;
  let publishing = false;
  let refreshPublishState: (() => void) | undefined;

  const setStatus = (message: string, kind: "normal" | "error" = "normal") => {
    status.textContent = message;
    status.dataset.kind = kind;
  };

  const setDirty = (nextDirty: boolean) => {
    dirty = Boolean(currentPath && nextDirty);
    dirtyLabel.textContent = dirty ? "Unsaved changes" : "";
    saveButton.disabled = !currentPath || !dirty;
    refreshPublishState?.();
  };

  const rememberCurrentFile = (path: string) => {
    sessionStorage.setItem(CURRENT_FILE_SESSION_KEY, path);
  };

  const forgetCurrentFile = () => {
    sessionStorage.removeItem(CURRENT_FILE_SESSION_KEY);
  };

  const authenticatedHeaders = (
    headers: Record<string, string> = {},
  ): Record<string, string> => ({
    "X-Studio-Passcode": activePasscode,
    ...headers,
  });

  // API 文件句柄让 CodeMirror 与本地文件夹回退方案共用同一套读写逻辑。
  // API-backed handles let CodeMirror share one read/write path with folder-picker fallback.
  const createApiFileHandle = (path: string): ProjectFileHandle => ({
    kind: "file",
    name: path.split("/").at(-1) ?? path,
    async getFile() {
      const response = await fetch(
        `/__admin/api/${imageExtensions.has(extensionOf(path)) ? "image" : "file"}?path=${encodeURIComponent(path)}`,
        { headers: authenticatedHeaders() },
      );
      if (!response.ok) throw new Error(await responseError(response));
      const blob = await response.blob();
      return new File([blob], this.name, { type: blob.type });
    },
    async createWritable() {
      let contents = "";
      return {
        async write(data: string) {
          contents = data;
        },
        async close() {
          const response = await fetch(
            `/__admin/api/file?path=${encodeURIComponent(path)}`,
            {
              method: "PUT",
              headers: authenticatedHeaders({
                "Content-Type": "text/plain; charset=utf-8",
              }),
              body: contents,
            },
          );
          if (!response.ok) throw new Error(await responseError(response));
        },
      };
    },
  });

  const normalizePreviewPath = (value: string) => {
    const url = new URL(value || "/", window.location.origin);
    url.searchParams.delete("_studio");
    return `${url.pathname}${url.search}${url.hash}` || "/";
  };

  const previewFramePath = () => {
    try {
      const href =
        previewFrame.contentWindow?.location.href || previewFrame.src || "/";
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return activePreviewPath;
      return normalizePreviewPath(url.toString());
    } catch {
      return activePreviewPath;
    }
  };

  const syncPreviewPath = (path: string) => {
    activePreviewPath = normalizePreviewPath(path);
    previewPath.value = activePreviewPath;
    openPreviewLink.href = activePreviewPath;
    sessionStorage.setItem(PREVIEW_PATH_SESSION_KEY, activePreviewPath);
  };

  const refreshPreview = (requestedPath = activePreviewPath) => {
    const path = normalizePreviewPath(requestedPath);
    syncPreviewPath(path);
    sessionStorage.setItem(PREVIEW_PATH_SESSION_KEY, path);
    const url = new URL(path, window.location.origin);
    url.searchParams.set("_studio", Date.now().toString());
    previewFrame.src = url.toString();
  };

  const schedulePreviewRefresh = () => {
    if (!autoRefreshInput.checked) return;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      refreshPreview(previewFramePath());
    }, 800);
  };

  const saveCurrentFileNow = async () => {
    if (!currentPath || !dirty) return;
    const path = currentPath;
    const revision = documentRevision;
    const source = editor.state.doc.toString();
    const handle = fileHandles.get(path);
    if (!handle) return;

    try {
      setStatus(`Saving ${path}…`);
      const writable = await handle.createWritable();
      await writable.write(source);
      await writable.close();
      if (path === MOTION_SETTINGS_PATH) {
        syncMotionControls(parseMotionSettings(source));
      }
      if (path === TYPOGRAPHY_SETTINGS_PATH) {
        syncTypographyControls(parseTypographySettings(source));
      }
      if (currentPath === path && documentRevision === revision) {
        setDirty(false);
        rememberCurrentFile(path);
        setStatus(`Saved ${path}.`);
        schedulePreviewRefresh();
      } else {
        setStatus(`Saved ${path}; newer edits remain unsaved.`);
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save the file.",
        "error",
      );
    }
  };

  const saveCurrentFile = () => {
    const task = saveQueue.then(saveCurrentFileNow);
    saveQueue = task.catch(() => undefined);
    return task;
  };

  // Compartment 允许在不重建编辑器、不丢失光标的情况下切换自动换行。
  // A Compartment toggles line wrapping without rebuilding the editor or losing its cursor.
  const lineWrapCompartment = new Compartment();
  const editorEditableCompartment = new Compartment();
  const storedLineWrap = localStorage.getItem(LINE_WRAP_STORAGE_KEY) === "true";
  lineWrapInput.checked = storedLineWrap;

  // CodeMirror's bracket closer is convenient for code, but it can fight CJK
  // IME punctuation because some fullwidth marks are treated as brackets.
  // The Studio is primarily a content editor, so typed punctuation should pass
  // through exactly as the input method commits it.
  const imeFriendlyPunctuation = EditorState.languageData.of(() => [
    { closeBrackets: { brackets: [] } },
  ]);

  const editor = new EditorView({
    parent: editorHost,
    state: EditorState.create({
      doc: "Connect the project, then select a file.",
      extensions: [
        basicSetup,
        languageCompartment.of([]),
        editorEditableCompartment.of(EditorView.editable.of(false)),
        syntaxHighlighting(studioHighlightStyle),
        lineWrapCompartment.of(storedLineWrap ? EditorView.lineWrapping : []),
        imeFriendlyPunctuation,
        Prec.high(
          keymap.of([
            indentWithTab,
            {
              key: "Mod-s",
              run: () => {
                void saveCurrentFile();
                return true;
              },
            },
          ]),
        ),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged || loadingDocument) return;
          documentRevision += 1;
          setDirty(true);
          if (autoSaveInput.checked) {
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(() => {
              void saveCurrentFile();
            }, 900);
          }
        }),
        EditorView.theme({
          "&": {
            backgroundColor: "#fff",
            color: "#171717",
          },
          ".cm-content": {
            caretColor: "#cc0000",
          },
          ".cm-cursor, .cm-dropCursor": {
            borderLeftColor: "#cc0000",
          },
          ".cm-selectionBackground, ::selection": {
            backgroundColor: "#f3cccc",
          },
          ".cm-gutters": {
            backgroundColor: "#f3f2ef",
            color: "#777",
            border: "none",
          },
        }),
      ],
    }),
  });

  const syncMarkdownToolbar = () => {
    markdownToolbar.hidden = extensionOf(currentPath) !== ".md";
  };

  const clearCurrentDocument = (message = "No file selected.") => {
    window.clearTimeout(saveTimer);
    loadGeneration += 1;
    documentRevision += 1;
    currentPath = "";
    forgetCurrentFile();
    currentFileLabel.textContent = "No file selected";
    loadingDocument = true;
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: message,
      },
      effects: editorEditableCompartment.reconfigure(EditorView.editable.of(false)),
    });
    loadingDocument = false;
    setDirty(false);
    syncMarkdownToolbar();
  };

  const selectedEditorText = (fallback = "text") => {
    const selection = editor.state.selection.main;
    return selection.empty
      ? fallback
      : editor.state.doc.sliceString(selection.from, selection.to);
  };

  const insertEditorText = (text: string, selectStart?: number, selectEnd?: number) => {
    if (!currentPath) return;
    const selection = editor.state.selection.main;
    const from = selection.from;
    editor.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection:
        selectStart !== undefined && selectEnd !== undefined
          ? { anchor: from + selectStart, head: from + selectEnd }
          : { anchor: from + text.length },
      effects: EditorView.scrollIntoView(from, { y: "center" }),
    });
    editor.focus();
  };

  const wrapEditorSelection = (
    before: string,
    after: string,
    fallback = "text",
  ) => {
    const text = selectedEditorText(fallback);
    insertEditorText(
      `${before}${text}${after}`,
      before.length,
      before.length + text.length,
    );
  };

  const insertMarkdownStyle = (kind: string) => {
    switch (kind) {
      case "h2":
        insertEditorText(`\n\n## ${selectedEditorText("Heading")}\n\n`);
        break;
      case "h3":
        insertEditorText(`\n\n### ${selectedEditorText("Heading")}\n\n`);
        break;
      case "bold":
        wrapEditorSelection("**", "**", "bold text");
        break;
      case "italic":
        wrapEditorSelection("*", "*", "italic text");
        break;
      case "link":
        wrapEditorSelection("[", "](https://example.com)", "link text");
        break;
      case "quote":
        insertEditorText(
          selectedEditorText("quoted text")
            .split(/\r?\n/)
            .map((line) => `> ${line}`)
            .join("\n"),
        );
        break;
      case "list":
        insertEditorText(
          selectedEditorText("list item")
            .split(/\r?\n/)
            .map((line) => `- ${line || "list item"}`)
            .join("\n"),
        );
        break;
      case "footnote":
        insertEditorText("[^note]\n\n[^note]: Footnote text.");
        break;
      case "no-indent":
        wrapEditorSelection('<p class="no-indent">', "</p>", "Paragraph text");
        break;
      case "lang":
        wrapEditorSelection('<span lang="zh-Hant">', "</span>", "文字");
        break;
      case "zh-em":
        // 中文着重号：用字符下方的点强调，而非斜体。
        // Chinese emphasis dots (.zh-em), not italics.
        wrapEditorSelection('<em class="zh-em">', "</em>", "文字");
        break;
      case "ruby": {
        // Wrap the selection as the ruby base. When text is selected, drop the
        // cursor on the reading placeholder so it can be typed straight away;
        // otherwise select the placeholder base character.
        const selection = editor.state.selection.main;
        const base = selection.empty ? "字" : selectedEditorText();
        const before = `<ruby>${base}<rt>`;
        const reading = "zi";
        insertEditorText(
          `${before}${reading}</rt></ruby>`,
          selection.empty ? "<ruby>".length : before.length,
          selection.empty
            ? "<ruby>".length + base.length
            : before.length + reading.length,
        );
        break;
      }
      default:
        break;
    }
  };

  markdownToolbar
    .querySelectorAll<HTMLButtonElement>("[data-md-insert]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        insertMarkdownStyle(button.dataset.mdInsert ?? "");
      });
    });

  const parseMotionSettings = (text: string): MotionSettings => {
    const parsed = JSON.parse(text) as Partial<MotionSettings>;
    return {
      languageFlap: parsed.languageFlap === true,
      themeFade: parsed.themeFade === true,
      fontSizeScale: parsed.fontSizeScale === true,
      glyphRotation: parsed.glyphRotation === true,
      interfaceMotion: parsed.interfaceMotion === true,
    };
  };

  const syncMotionControls = (settings: MotionSettings) => {
    let enabledCount = 0;
    motionSettingInputs.forEach((input) => {
      const key = input.dataset.motionSetting as MotionSetting;
      input.checked = settings[key] ?? defaultMotionSettings[key];
      if (input.checked) enabledCount += 1;
    });
    motionSettingsStatus.textContent =
      enabledCount === 0
        ? "All animations are off."
        : `${enabledCount} of ${motionSettingInputs.length} animation groups enabled.`;
  };

  const loadMotionSettings = async () => {
    const handle = fileHandles.get(MOTION_SETTINGS_PATH);
    motionSettingsFieldset.disabled = !handle;
    if (!handle) return;

    try {
      const text = await (await handle.getFile()).text();
      syncMotionControls(parseMotionSettings(text));
    } catch {
      motionSettingsFieldset.disabled = true;
      motionSettingsStatus.textContent = "Motion settings could not be read.";
    }
  };

  const saveMotionSetting = async (
    key: MotionSetting,
    enabled: boolean,
  ) => {
    const handle = fileHandles.get(MOTION_SETTINGS_PATH);
    if (!handle) return;

    try {
      const currentText =
        currentPath === MOTION_SETTINGS_PATH
          ? editor.state.doc.toString()
          : await (await handle.getFile()).text();
      const settings = parseMotionSettings(currentText);
      settings[key] = enabled;
      const nextText = `${JSON.stringify(settings, null, 2)}\n`;
      const writable = await handle.createWritable();
      await writable.write(nextText);
      await writable.close();

      if (currentPath === MOTION_SETTINGS_PATH) {
        loadingDocument = true;
        editor.dispatch({
          changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: nextText,
          },
        });
        loadingDocument = false;
        setDirty(false);
      }

      syncMotionControls(settings);
      setStatus(`${enabled ? "Enabled" : "Disabled"} ${key}.`);
      schedulePreviewRefresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save motion settings.",
        "error",
      );
      await loadMotionSettings();
    }
  };

  const parseTypographySettings = (text: string): TypographySettings => {
    const parsed = JSON.parse(text) as Partial<TypographySettings>;
    const value = Number(parsed.cjkLetterSpacingEm);
    return {
      cjkLetterSpacingEm: Number.isFinite(value)
        ? Math.min(Math.max(value, -0.08), 0.08)
        : -0.03,
    };
  };

  const applyTypographyPreview = (value: number) => {
    previewFrame.contentDocument?.documentElement.style.setProperty(
      "--cjk-letter-spacing",
      `${value}em`,
    );
  };

  const syncTypographyControls = (settings: TypographySettings) => {
    const value = settings.cjkLetterSpacingEm;
    cjkLetterSpacingInput.value = String(value);
    cjkLetterSpacingOutput.value = `${value.toFixed(3)}em`;
    applyTypographyPreview(value);
  };

  const loadTypographySettings = async () => {
    const handle = fileHandles.get(TYPOGRAPHY_SETTINGS_PATH);
    typographySettingsFieldset.disabled = !handle;
    if (!handle) return;

    try {
      const text = await (await handle.getFile()).text();
      syncTypographyControls(parseTypographySettings(text));
    } catch {
      typographySettingsFieldset.disabled = true;
      cjkLetterSpacingOutput.value = "unavailable";
    }
  };

  const saveTypographySettings = async (value: number) => {
    const handle = fileHandles.get(TYPOGRAPHY_SETTINGS_PATH);
    if (!handle) return;

    const settings: TypographySettings = {
      cjkLetterSpacingEm: Math.min(Math.max(value, -0.08), 0.08),
    };

    try {
      const nextText = `${JSON.stringify(settings, null, 2)}\n`;
      const writable = await handle.createWritable();
      await writable.write(nextText);
      await writable.close();

      if (currentPath === TYPOGRAPHY_SETTINGS_PATH) {
        loadingDocument = true;
        editor.dispatch({
          changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: nextText,
          },
        });
        loadingDocument = false;
        setDirty(false);
      }

      syncTypographyControls(settings);
      setStatus(`East Asian character spacing set to ${settings.cjkLetterSpacingEm.toFixed(3)}em.`);
      schedulePreviewRefresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to save typography settings.",
        "error",
      );
      await loadTypographySettings();
    }
  };

  /* ----- Design panel: live CSS-variable editing ----- */

  const designInputs = [
    ...studio.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "[data-design-var]",
    ),
  ];
  const designFieldsets = [
    ...studio.querySelectorAll<HTMLFieldSetElement>(
      "[data-design-settings], [data-design-settings-2], [data-design-settings-3], [data-design-settings-4]",
    ),
  ];
  const designOutputFor = (name: string) =>
    studio.querySelector<HTMLOutputElement>(
      `[data-design-output="${name}"]`,
    );

  const escapeForRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 只匹配真正的声明行（行首的 --name:），不会碰到 var(--name) 引用。
  // Match only real declaration lines (--name: at line start), never
  // var(--name) references.
  const cssVariablePattern = (name: string) =>
    new RegExp(`(^|\\n)(\\s*)(${escapeForRegExp(name)}\\s*:\\s*)([^;]+);`);

  const readCssVariable = (cssText: string, name: string) => {
    const match = cssText.match(cssVariablePattern(name));
    return match ? match[4].trim() : null;
  };

  const designDisplayValue = (input: HTMLInputElement | HTMLSelectElement) => {
    const unit = input.dataset.designUnit ?? "";
    return input.dataset.designKind === "raw"
      ? input.value
      : `${input.value}${unit}`;
  };

  const applyDesignPreview = (name: string, value: string) => {
    previewFrame.contentDocument?.documentElement.style.setProperty(name, value);
  };

  const syncDesignOutput = (input: HTMLInputElement | HTMLSelectElement) => {
    const name = input.dataset.designVar ?? "";
    const output = designOutputFor(name);
    if (output) output.value = designDisplayValue(input);
  };

  const syncDesignControls = (cssText: string) => {
    for (const input of designInputs) {
      const name = input.dataset.designVar ?? "";
      const current = readCssVariable(cssText, name);
      if (current === null) continue;
      if (input.dataset.designKind === "raw") {
        input.value = current;
      } else {
        const numeric = Number.parseFloat(current);
        if (Number.isFinite(numeric)) input.value = String(numeric);
      }
      syncDesignOutput(input);
    }
    const indentValue = Number.parseFloat(
      readCssVariable(cssText, "--paragraph-indent") ?? "0",
    );
    indentToggle.checked = indentValue > 0;
    const indentWidth = studio.querySelector<HTMLInputElement>(
      "[data-indent-width]",
    );
    if (indentWidth) {
      indentWidth.disabled = !indentToggle.checked;
      if (indentValue > 0) indentWidth.value = String(indentValue);
    }
  };

  const globalCssText = async () => {
    const handle = fileHandles.get(GLOBAL_CSS_PATH);
    if (!handle) return null;
    return currentPath === GLOBAL_CSS_PATH
      ? editor.state.doc.toString()
      : await (await handle.getFile()).text();
  };

  const saveCssVariable = async (name: string, value: string) => {
    try {
      const source = await globalCssText();
      if (source === null) throw new Error("global.css is unavailable.");
      const pattern = cssVariablePattern(name);
      if (!pattern.test(source)) {
        throw new Error(`${name} was not found in global.css.`);
      }
      const updated = source.replace(pattern, `$1$2$3${value};`);
      await writeVisualSource(GLOBAL_CSS_PATH, updated, `Set ${name}: ${value}.`);
      applyDesignPreview(name, value);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to update global.css.",
        "error",
      );
    }
  };

  const loadDesignSettings = async () => {
    const available = fileHandles.has(GLOBAL_CSS_PATH);
    designFieldsets.forEach((fieldset) => {
      fieldset.disabled = !available;
    });
    if (!available) return;
    const source = await globalCssText();
    if (source) syncDesignControls(source);
  };

  designInputs.forEach((input) => {
    input.addEventListener("input", () => {
      syncDesignOutput(input);
      const name = input.dataset.designVar ?? "";
      applyDesignPreview(name, designDisplayValue(input));
    });
    input.addEventListener("change", () => {
      const name = input.dataset.designVar ?? "";
      void saveCssVariable(name, designDisplayValue(input));
    });
  });

  indentToggle.addEventListener("change", () => {
    const indentWidth = studio.querySelector<HTMLInputElement>(
      "[data-indent-width]",
    );
    if (indentWidth) indentWidth.disabled = !indentToggle.checked;
    const value = indentToggle.checked
      ? `${indentWidth?.value ?? "2"}em`
      : "0em";
    void saveCssVariable("--paragraph-indent", value);
  });

  /* ----- Site defaults for new visitors ----- */

  interface SiteDefaults {
    defaultLanguage: string;
    defaultTheme: string;
    defaultFontSize: string;
    defaultFontFamily: string;
  }

  const currentSiteDefaults = (): SiteDefaults => ({
    defaultLanguage: defaultLanguageSelect.value,
    defaultTheme: defaultThemeSelect.value,
    defaultFontSize: defaultFontSizeSelect.value,
    defaultFontFamily: defaultFontFamilySelect.value,
  });

  const loadSiteDefaults = async () => {
    const handle = fileHandles.get(SITE_DEFAULTS_PATH);
    siteDefaultsFieldset.disabled = !handle;
    if (!handle) return;
    try {
      const parsed = JSON.parse(await (await handle.getFile()).text()) as Partial<SiteDefaults>;
      if (parsed.defaultLanguage) {
        defaultLanguageSelect.value = parsed.defaultLanguage;
      }
      defaultThemeSelect.value = parsed.defaultTheme === "dark" ? "dark" : "light";
      defaultFontSizeSelect.value = parsed.defaultFontSize === "l" ? "l" : "s";
      defaultFontFamilySelect.value =
        parsed.defaultFontFamily === "garamond" ? "garamond" : "modern-mono";
    } catch {
      siteDefaultsFieldset.disabled = true;
    }
  };

  const saveSiteDefaults = () => {
    void (async () => {
      const handle = fileHandles.get(SITE_DEFAULTS_PATH);
      if (!handle) return;
      const nextText = `${JSON.stringify(
        currentSiteDefaults(),
        null,
        2,
      )}\n`;
      try {
        const writable = await handle.createWritable();
        await writable.write(nextText);
        await writable.close();
        setStatus(
          "Site defaults updated. They apply to first-time visitors; returning visitors keep their own choices.",
        );
        schedulePreviewRefresh();
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Unable to save site defaults.",
          "error",
        );
      }
    })();
  };

  [
    defaultLanguageSelect,
    defaultFontFamilySelect,
    defaultFontSizeSelect,
    defaultThemeSelect,
  ].forEach((select) => select.addEventListener("change", saveSiteDefaults));

  /* ----- Add page (works, events, and writings; drafts by default) ----- */

  const slugify = (text: string) =>
    text
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const yamlQuote = (text: string) =>
    `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

  interface PeerTubeFormValues {
    embedUrl: string;
    watchUrl: string;
    poster: string;
    posterAlt: string;
    caption: string;
    captionZh: string;
    title: string;
    titleZh: string;
    aspectRatio: string;
  }

  const peerTubeBlockLines = (values: PeerTubeFormValues) => {
    const embedUrl = values.embedUrl.trim();
    if (!embedUrl) return [];

    const watchUrl = values.watchUrl.trim();
    const poster = values.poster.trim();
    const posterAlt = values.posterAlt.trim();
    const caption = values.caption.trim();
    const captionZh = values.captionZh.trim();
    const title = values.title.trim();
    const titleZh = values.titleZh.trim();
    const rawAspectRatio = values.aspectRatio.trim();
    const aspectRatio = /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(
      rawAspectRatio,
    )
      ? rawAspectRatio
      : "16 / 9";
    const captionEn = caption || captionZh;
    const titleEn = title || titleZh;
    const lines = [
      "video:",
      '  provider: "peertube"',
      `  embedUrl: ${yamlQuote(embedUrl)}`,
    ];

    if (watchUrl) lines.push(`  watchUrl: ${yamlQuote(watchUrl)}`);
    if (poster) lines.push(`  poster: ${yamlQuote(poster)}`);
    if (posterAlt) lines.push(`  posterAlt: ${yamlQuote(posterAlt)}`);
    if (caption || captionZh) {
      lines.push("  caption:");
      lines.push(`    en: ${yamlQuote(captionEn)}`);
      if (captionZh) lines.push(`    zh: ${yamlQuote(captionZh)}`);
    }
    if (title || titleZh) {
      lines.push("  title:");
      lines.push(`    en: ${yamlQuote(titleEn)}`);
      if (titleZh) lines.push(`    zh: ${yamlQuote(titleZh)}`);
    }
    lines.push(`  aspectRatio: ${yamlQuote(aspectRatio)}`);
    return lines;
  };

  const peerTubeBlockText = (values: PeerTubeFormValues) => {
    const lines = peerTubeBlockLines(values);
    return lines.length > 0 ? `\n${lines.join("\n")}` : "";
  };

  const newField = <T extends HTMLElement>(selector: string) =>
    studio.querySelector<T>(selector);

  const newCategorySelect = newField<HTMLSelectElement>("[data-new-category]");
  const newTagsContainer = newField<HTMLElement>("[data-new-tags]");
  let editableWorkCategories: string[] = [...workCategories];
  let editableWritingTypes: string[] = [...writingTypes];

  // 中文：文章标签用多选框；重画选项时保留已勾选的值。
  // English: Writing tags use checkboxes; re-rendering keeps checked values.
  const selectedTags = (container: HTMLElement | null) =>
    container
      ? [...container.querySelectorAll<HTMLInputElement>("input:checked")].map(
          (input) => input.value,
        )
      : [];

  const setSelectedTags = (container: HTMLElement | null, tags: string[]) => {
    container
      ?.querySelectorAll<HTMLInputElement>("input")
      .forEach((input) => {
        input.checked = tags.includes(input.value);
      });
  };

  const renderTagOptions = (
    container: HTMLElement | null,
    values: readonly string[],
  ) => {
    if (!container) return;
    const previous = new Set(selectedTags(container));
    container.replaceChildren();
    for (const value of values) {
      const label = document.createElement("label");
      label.className = "tag-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = value;
      input.checked = previous.has(value);
      label.append(input, value);
      container.append(label);
    }
  };

  const setOptions = (
    select: HTMLSelectElement | null,
    values: readonly string[],
  ) => {
    if (!select) return;
    const previous = select.value;
    select.replaceChildren();
    for (const value of values) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    }
    select.value = values.includes(previous) ? previous : values[0] ?? "";
  };

  const activeTaxonomyValues = () =>
    taxonomyKindSelect.value === "workCategories"
      ? editableWorkCategories
      : editableWritingTypes;

  const renderTaxonomyList = () => {
    const values = activeTaxonomyValues();
    const previous = taxonomyListSelect.value;
    taxonomyListSelect.replaceChildren();
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      taxonomyListSelect.append(option);
    });
    taxonomyListSelect.value = values.includes(previous)
      ? previous
      : values[0] ?? "";
    taxonomyValueInput.value = taxonomyListSelect.value;
  };

  const syncTaxonomyControls = () => {
    setOptions(newCategorySelect, editableWorkCategories);
    setOptions(libraryCategorySelect, editableWorkCategories);
    renderTagOptions(newTagsContainer, editableWritingTypes);
    renderTagOptions(libraryTagsContainer, editableWritingTypes);
    renderTaxonomyList();
  };

  syncTaxonomyControls();

  const taxonomyArrayPattern = (name: string) =>
    new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const;`);

  const parseTaxonomyValues = (source: string, name: string) => {
    const match = source.match(taxonomyArrayPattern(name));
    if (!match) return [];
    return [...match[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map(
      ([, value]) => JSON.parse(`"${value}"`) as string,
    );
  };

  const setTaxonomyValuesInSource = (
    source: string,
    name: string,
    values: readonly string[],
  ) => {
    const next = `export const ${name} = [\n${values
      .map((value) => `  ${JSON.stringify(value)},`)
      .join("\n")}\n] as const;`;
    const pattern = taxonomyArrayPattern(name);
    if (!pattern.test(source)) {
      throw new Error(`${name} was not found in contentTaxonomy.ts.`);
    }
    return source.replace(pattern, next);
  };

  const writeSourceWithoutPreview = async (
    path: string,
    updated: string,
    message: string,
  ) => {
    const handle = fileHandles.get(path);
    if (!handle) throw new Error("The source file is unavailable.");
    const writable = await handle.createWritable();
    await writable.write(updated);
    await writable.close();

    if (currentPath === path) {
      loadingDocument = true;
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: updated,
        },
      });
      loadingDocument = false;
      setDirty(false);
    }

    setStatus(message);
  };

  const taxonomySourceText = async () => {
    const handle = fileHandles.get(CONTENT_TAXONOMY_PATH);
    if (!handle) throw new Error("contentTaxonomy.ts is unavailable.");
    return currentPath === CONTENT_TAXONOMY_PATH
      ? editor.state.doc.toString()
      : await (await handle.getFile()).text();
  };

  const loadTaxonomySettings = async () => {
    try {
      const source = await taxonomySourceText();
      const nextWorkCategories = parseTaxonomyValues(source, "workCategories");
      const nextWritingTypes = parseTaxonomyValues(source, "writingTypes");
      if (nextWorkCategories.length > 0) {
        editableWorkCategories = nextWorkCategories;
      }
      if (nextWritingTypes.length > 0) {
        editableWritingTypes = nextWritingTypes;
      }
      syncTaxonomyControls();
    } catch {
      taxonomyMessage.textContent = "Could not read category settings.";
    }
  };

  const saveTaxonomySettings = async () => {
    let source = await taxonomySourceText();
    source = setTaxonomyValuesInSource(
      source,
      "workCategories",
      editableWorkCategories,
    );
    source = setTaxonomyValuesInSource(
      source,
      "writingTypes",
      editableWritingTypes,
    );
    await writeSourceWithoutPreview(
      CONTENT_TAXONOMY_PATH,
      source,
      "Saved category settings.",
    );
  };

  const replaceLibraryTaxonomyValue = async (
    taxonomyName: "workCategories" | "writingTypes",
    oldValue: string,
    nextValue: string,
  ) => {
    const targetKind: LibraryKind =
      taxonomyName === "workCategories" ? "works" : "writings";
    const paths = [...fileHandles.keys()].filter((path) =>
      path.match(new RegExp(`^content/${targetKind}/[^/]+/index\\.md$`)),
    );

    for (const path of paths) {
      const handle = fileHandles.get(path);
      if (!handle) continue;
      const source = currentPath === path
        ? editor.state.doc.toString()
        : await (await handle.getFile()).text();
      const parts = frontmatterParts(source);
      if (!parts) continue;
      const lines = parts.frontmatter.split(/\r?\n/);
      if (taxonomyName === "workCategories") {
        if (readTopScalar(lines, "category") !== oldValue) continue;
        setTopScalar(lines, "category", nextValue);
      } else {
        const tags = readWritingTags(lines);
        if (!tags.includes(oldValue)) continue;
        const nextTags = [
          ...new Set(tags.map((tag) => (tag === oldValue ? nextValue : tag))),
        ];
        setWritingTags(lines, nextTags);
      }
      const updated = `---${parts.lineBreak}${lines.join(parts.lineBreak)}${parts.lineBreak}---${parts.lineBreak}${parts.body}`;
      await writeSourceWithoutPreview(path, updated, `Updated ${path}.`);
    }
  };

  const currentTaxonomyName = () =>
    taxonomyKindSelect.value as "workCategories" | "writingTypes";

  const setActiveTaxonomyValues = (values: string[]) => {
    if (currentTaxonomyName() === "workCategories") {
      editableWorkCategories = values;
    } else {
      editableWritingTypes = values;
    }
    syncTaxonomyControls();
  };

  taxonomyListSelect.addEventListener("change", () => {
    taxonomyValueInput.value = taxonomyListSelect.value;
  });

  taxonomyKindSelect.addEventListener("change", () => {
    taxonomyMessage.textContent = "";
    renderTaxonomyList();
  });

  const runTaxonomyAction = (action: () => Promise<void>) => {
    void (async () => {
      try {
        taxonomyMessage.textContent = "";
        await action();
      } catch (error) {
        taxonomyMessage.textContent =
          error instanceof Error ? error.message : "Unable to update categories.";
        await loadTaxonomySettings();
      }
    })();
  };

  taxonomyAddButton.addEventListener("click", () => {
    runTaxonomyAction(async () => {
      const value = taxonomyValueInput.value.trim();
      const values = activeTaxonomyValues();
      if (!value) {
        taxonomyMessage.textContent = "Enter a value first.";
        return;
      }
      if (values.includes(value)) {
        taxonomyMessage.textContent = "That value already exists.";
        return;
      }
      setActiveTaxonomyValues([...values, value]);
      await saveTaxonomySettings();
      taxonomyListSelect.value = value;
      taxonomyMessage.textContent = "Added.";
    });
  });

  taxonomyRenameButton.addEventListener("click", () => {
    runTaxonomyAction(async () => {
      const oldValue = taxonomyListSelect.value;
      const nextValue = taxonomyValueInput.value.trim();
      const values = activeTaxonomyValues();
      if (!oldValue || !nextValue) {
        taxonomyMessage.textContent = "Choose a value and enter a new name.";
        return;
      }
      if (oldValue !== nextValue && values.includes(nextValue)) {
        taxonomyMessage.textContent = "That value already exists.";
        return;
      }
      const nextValues = values.map((value) =>
        value === oldValue ? nextValue : value,
      );
      setActiveTaxonomyValues(nextValues);
      await saveTaxonomySettings();
      await replaceLibraryTaxonomyValue(currentTaxonomyName(), oldValue, nextValue);
      await refreshLibrary();
      taxonomyListSelect.value = nextValue;
      taxonomyMessage.textContent = "Renamed and updated matching pages.";
    });
  });

  taxonomyDeleteButton.addEventListener("click", () => {
    runTaxonomyAction(async () => {
      const oldValue = taxonomyListSelect.value;
      const values = activeTaxonomyValues();
      if (!oldValue) {
        taxonomyMessage.textContent = "Choose a value to delete.";
        return;
      }
      const nextValues = values.filter((value) => value !== oldValue);
      if (nextValues.length === 0) {
        taxonomyMessage.textContent = "At least one value must remain.";
        return;
      }
      const fallback = nextValues.includes("Other")
        ? "Other"
        : nextValues[0];
      const ok = window.confirm(
        `Delete “${oldValue}”? Existing pages using it will change to “${fallback}”.`,
      );
      if (!ok) return;
      setActiveTaxonomyValues(nextValues);
      await saveTaxonomySettings();
      await replaceLibraryTaxonomyValue(currentTaxonomyName(), oldValue, fallback);
      await refreshLibrary();
      taxonomyMessage.textContent = `Deleted. Matching pages now use “${fallback}”.`;
    });
  });

  let slugEditedManually = false;
  newSlugInput.addEventListener("input", () => {
    slugEditedManually = newSlugInput.value.trim().length > 0;
  });
  newTitleInput.addEventListener("input", () => {
    if (!slugEditedManually) newSlugInput.value = slugify(newTitleInput.value);
  });
  newKindSelect.addEventListener("change", () => {
    const isWork = newKindSelect.value === "work";
    const isWriting = newKindSelect.value === "writing";
    const isEvent = newKindSelect.value === "event";
    const workFields = newField<HTMLElement>("[data-new-work-fields]");
    const writingFields = newField<HTMLElement>("[data-new-writing-fields]");
    const eventFields = newField<HTMLElement>("[data-new-event-fields]");
    if (workFields) workFields.hidden = !isWork;
    if (writingFields) writingFields.hidden = !isWriting;
    if (eventFields) eventFields.hidden = !isEvent;
  });

  const buildNewPageSource = () => {
    const kind = newKindSelect.value;
    const title = newTitleInput.value.trim();
    const slug = slugify(newSlugInput.value.trim());
    const summary =
      newField<HTMLInputElement>("[data-new-summary]")?.value.trim() ?? "";
    const draft = newField<HTMLInputElement>("[data-new-draft]")?.checked ?? true;
    if (!title || !slug) return { error: "A title and slug are required." };

    if (kind === "work") {
      const year =
        Number(newField<HTMLInputElement>("[data-new-year]")?.value) ||
        new Date().getFullYear();
      const category = newCategorySelect?.value ?? "Other";
      const instrumentation =
        newField<HTMLInputElement>("[data-new-instrumentation]")?.value.trim() ||
        "To be decided";
      const minutes = Number(
        newField<HTMLInputElement>("[data-new-duration]")?.value,
      );
      const durationBlock = minutes > 0 ? `\n  minutes: ${minutes}` : " {}";
      const descriptionLine = summary
        ? `description: ${yamlQuote(summary)}\n`
        : "";
      const videoBlock = peerTubeBlockText({
        embedUrl:
          newField<HTMLInputElement>("[data-new-video-embed-url]")?.value ?? "",
        watchUrl:
          newField<HTMLInputElement>("[data-new-video-watch-url]")?.value ?? "",
        poster: newField<HTMLInputElement>("[data-new-video-poster]")?.value ?? "",
        posterAlt:
          newField<HTMLInputElement>("[data-new-video-poster-alt]")?.value ?? "",
        caption:
          newField<HTMLTextAreaElement>("[data-new-video-caption]")?.value ?? "",
        captionZh:
          newField<HTMLTextAreaElement>("[data-new-video-caption-zh]")?.value ?? "",
        title: newField<HTMLInputElement>("[data-new-video-title]")?.value ?? "",
        titleZh:
          newField<HTMLInputElement>("[data-new-video-title-zh]")?.value ?? "",
        aspectRatio:
          newField<HTMLInputElement>("[data-new-video-aspect-ratio]")?.value ?? "",
      });
      return {
        path: `content/works/${slug}/index.md`,
        previewPath: `/works/${slug}/`,
        source: `---
title: ${yamlQuote(title)}
year: ${year}
category: ${yamlQuote(category)}
instrumentation:
  en: ${yamlQuote(instrumentation)}
duration:${durationBlock}
${descriptionLine}slug: ${yamlQuote(slug)}
order: 999${draft ? "\ndraft: true" : ""}${videoBlock}
---

## Program Notes

Write about this piece here.
`,
      };
    }

    if (kind === "event") {
      const date =
        newField<HTMLInputElement>("[data-new-event-date]")?.value.trim() ||
        new Date().toISOString().slice(0, 10);
      const time =
        newField<HTMLInputElement>("[data-new-event-time]")?.value.trim() ?? "";
      const venue =
        newField<HTMLInputElement>("[data-new-event-venue]")?.value.trim() ?? "";
      const location =
        newField<HTMLInputElement>("[data-new-event-location]")?.value.trim() ?? "";
      const role =
        newField<HTMLInputElement>("[data-new-event-role]")?.value.trim() ?? "";
      const optionalFields = [
        time ? `time: ${yamlQuote(time)}` : "",
        venue ? `venue: ${yamlQuote(venue)}` : "",
        location ? `location: ${yamlQuote(location)}` : "",
        role ? `role: ${yamlQuote(role)}` : "",
      ].filter(Boolean).join("\n");
      return {
        path: `content/events/${slug}/index.md`,
        previewPath: `/events/${slug}/`,
        source: `---
title: ${yamlQuote(title)}
date: ${yamlQuote(date)}
${optionalFields ? `${optionalFields}\n` : ""}brief: ${yamlQuote(summary || title)}
slug: ${yamlQuote(slug)}
order: 999${draft ? "\ndraft: true" : ""}
links: []
---

More information will be posted when details are confirmed.
`,
      };
    }

    const date =
      newField<HTMLInputElement>("[data-new-date]")?.value.trim() ||
      new Date().toISOString().slice(0, 10);
    const titleZh =
      newField<HTMLInputElement>("[data-new-title-zh]")?.value.trim() ?? "";
    const subtitle =
      newField<HTMLInputElement>("[data-new-subtitle]")?.value.trim() ?? "";
    const subtitleZh =
      newField<HTMLInputElement>("[data-new-subtitle-zh]")?.value.trim() ?? "";
    const translationFrom =
      newField<HTMLInputElement>("[data-new-translation-from]")?.value.trim() ?? "";
    const translationTo = (newField<HTMLInputElement>("[data-new-translation-to]")?.value ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const summaryZh =
      newField<HTMLInputElement>("[data-new-summary-zh]")?.value.trim() ?? "";
    if (!titleZh || !summaryZh) {
      return { error: "A Chinese title and Chinese summary are required for a writing." };
    }
    // 标签可多选；未勾选时省略 frontmatter 行。Tags allow several picks — omit the line when none.
    const tags = selectedTags(newTagsContainer);
    const tagsLine =
      tags.length > 0
        ? `tags: [${tags.map((tag) => yamlQuote(tag)).join(", ")}]\n`
        : "";
    return {
      path: `content/writings/${slug}/index.md`,
      previewPath: `/writings/${slug}/`,
      source: `---
title: ${yamlQuote(title)}
titleZh: ${yamlQuote(titleZh)}
${subtitle ? `subtitle: ${yamlQuote(subtitle)}\n` : ""}${subtitleZh ? `subtitleZh: ${yamlQuote(subtitleZh)}\n` : ""}${translationFrom ? `translationFrom: ${yamlQuote(translationFrom)}\n` : ""}${translationTo.length ? `translationTo: [${translationTo.map((value) => yamlQuote(value)).join(", ")}]\n` : ""}date: ${yamlQuote(date)}
${tagsLine}excerpt: ${yamlQuote(summary || title)}
excerptZh: ${yamlQuote(summaryZh)}
slug: ${yamlQuote(slug)}
order: 999${draft ? "\ndraft: true" : ""}
---

Write the text here.
`,
    };
  };

  newPageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      const built = buildNewPageSource();
      if ("error" in built) {
        newMessage.textContent = built.error ?? "";
        return;
      }
      if (fileHandles.has(built.path)) {
        newMessage.textContent = `${built.path} already exists — pick another slug.`;
        return;
      }
      try {
        newSubmitButton.disabled = true;
        newMessage.textContent = `Creating ${built.path}…`;
        const handle = createApiFileHandle(built.path);
        const writable = await handle.createWritable();
        await writable.write(built.source);
        await writable.close();
        await connectDevProject();
        await loadFile(built.path);
        selectSidebarTab("files");
        previewPath.value = built.previewPath;
        newMessage.textContent = `Created ${built.path}. Draft pages are listed at /drafts/.`;
        setStatus(`Created ${built.path}. Continue writing in the editor.`);
        // Astro 需要片刻同步新内容文件，稍后再刷新预览。
        // Astro needs a moment to sync the new content file before preview.
        window.setTimeout(() => refreshPreview(built.previewPath), 1500);
        newTitleInput.value = "";
        newSlugInput.value = "";
        const newTitleZh = newField<HTMLInputElement>("[data-new-title-zh]");
        const newSubtitle = newField<HTMLInputElement>("[data-new-subtitle]");
        const newSubtitleZh = newField<HTMLInputElement>("[data-new-subtitle-zh]");
        const newTranslationFrom = newField<HTMLInputElement>("[data-new-translation-from]");
        const newTranslationTo = newField<HTMLInputElement>("[data-new-translation-to]");
        const newSummaryZh = newField<HTMLInputElement>("[data-new-summary-zh]");
        if (newTitleZh) newTitleZh.value = "";
        if (newSubtitle) newSubtitle.value = "";
        if (newSubtitleZh) newSubtitleZh.value = "";
        if (newTranslationFrom) newTranslationFrom.value = "";
        if (newTranslationTo) newTranslationTo.value = "";
        if (newSummaryZh) newSummaryZh.value = "";
        slugEditedManually = false;
      } catch (error) {
        newMessage.textContent =
          error instanceof Error ? error.message : "Unable to create the page.";
      } finally {
        newSubmitButton.disabled = !apiConnected;
      }
    })();
  });

  draftShelfButton.addEventListener("click", () => {
    previewPath.value = "/drafts/";
    openPreviewLink.href = "/drafts/";
    sessionStorage.setItem(PREVIEW_PATH_SESSION_KEY, "/drafts/");
    refreshPreview("/drafts/");
  });

  const loadFile = async (path: string, targetLine?: number) => {
    if (currentPath === path) {
      if (targetLine) {
        const line = Math.min(Math.max(targetLine, 1), editor.state.doc.lines);
        const position = editor.state.doc.line(line).from;
        editor.dispatch({
          selection: { anchor: position },
          effects: EditorView.scrollIntoView(position, { y: "center" }),
        });
        editor.focus();
      }
      setStatus(`Editing ${path}.`);
      rememberCurrentFile(path);
      revealFileInTree(path);
      syncMarkdownToolbar();
      return;
    }

    if (dirty) {
      const proceed = window.confirm(
        `Discard unsaved changes to ${currentPath}?`,
      );
      if (!proceed) return;
    }

    const handle = fileHandles.get(path);
    if (!handle) return;

    const generation = ++loadGeneration;
    documentRevision += 1;
    try {
      const file = await handle.getFile();
      const text = await file.text();
      if (generation !== loadGeneration) return;
      loadingDocument = true;
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: text,
        },
        effects: [
          languageCompartment.reconfigure(languageFor(path)),
          editorEditableCompartment.reconfigure(EditorView.editable.of(true)),
        ],
      });
      currentPath = path;
      rememberCurrentFile(path);
      currentFileLabel.textContent = path;
      setDirty(false);
      syncMarkdownToolbar();
      setStatus(`Editing ${path}.`);
      revealFileInTree(path);
      if (path === MOTION_SETTINGS_PATH) {
        syncMotionControls(parseMotionSettings(text));
      }
      if (path === TYPOGRAPHY_SETTINGS_PATH) {
        syncTypographyControls(parseTypographySettings(text));
      }

      if (targetLine) {
        const line = Math.min(Math.max(targetLine, 1), editor.state.doc.lines);
        const position = editor.state.doc.line(line).from;
        editor.dispatch({
          selection: { anchor: position },
          effects: EditorView.scrollIntoView(position, { y: "center" }),
        });
        editor.focus();
      }
    } finally {
      loadingDocument = false;
    }
  };

  const restoreCurrentFile = async () => {
    if (currentPath || dirty) return;

    const storedPath = sessionStorage.getItem(CURRENT_FILE_SESSION_KEY);
    if (!storedPath) return;

    if (!fileHandles.has(storedPath)) {
      forgetCurrentFile();
      return;
    }

    await loadFile(storedPath);
  };

  type LibraryKind = "works" | "events" | "writings";

  interface FrontmatterParts {
    frontmatter: string;
    body: string;
    lineBreak: string;
  }

  interface LibraryEntry {
    kind: LibraryKind;
    path: string;
    folder: string;
    folderSlug: string;
    title: string;
    titleZh: string;
    slug: string;
    subtitle: string;
    subtitleZh: string;
    translationFrom: string;
    translationTo: string[];
    year: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    role: string;
    category: string;
    tags: string[];
    instrumentation: string;
    duration: string;
    videoEmbedUrl: string;
    videoWatchUrl: string;
    videoPoster: string;
    videoPosterAlt: string;
    videoCaption: string;
    videoCaptionZh: string;
    videoTitle: string;
    videoTitleZh: string;
    videoAspectRatio: string;
    summary: string;
    summaryZh: string;
    links: string;
    order: string;
    draft: boolean;
    comments: boolean;
    source: string;
  }

  const frontmatterParts = (source: string): FrontmatterParts | null => {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) return null;
    const lineBreak = match[0].includes("\r\n") ? "\r\n" : "\n";
    return {
      frontmatter: match[1],
      body: source.slice(match[0].length),
      lineBreak,
    };
  };

  const unquoteYaml = (value: string) => {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return trimmed;
  };

  const readTopScalar = (lines: string[], key: string) => {
    const line = lines.find((item) => item.match(new RegExp(`^${key}:\\s*`)));
    if (!line) return "";
    return unquoteYaml(line.replace(new RegExp(`^${key}:\\s*`), ""));
  };

  const topKeyIndex = (lines: string[], key: string) =>
    lines.findIndex((line) => line.match(new RegExp(`^${key}:\\s*`)));

  const topBlockEnd = (lines: string[], start: number) => {
    let end = start + 1;
    while (end < lines.length && /^\s+/.test(lines[end])) end += 1;
    return end;
  };

  const removeTopKey = (lines: string[], key: string) => {
    const index = topKeyIndex(lines, key);
    if (index < 0) return;
    lines.splice(index, topBlockEnd(lines, index) - index);
  };

  const setTopScalar = (
    lines: string[],
    key: string,
    value: string | number | boolean,
    options: { quote?: boolean; omitFalse?: boolean; omitEmpty?: boolean } = {},
  ) => {
    if (options.omitFalse && value === false) {
      removeTopKey(lines, key);
      return;
    }
    if (options.omitEmpty && String(value).trim() === "") {
      removeTopKey(lines, key);
      return;
    }
    const next =
      typeof value === "boolean"
        ? String(value)
        : typeof value === "number" || options.quote === false
          ? String(value)
          : yamlQuote(String(value));
    const line = `${key}: ${next}`;
    const index = topKeyIndex(lines, key);
    if (index >= 0) {
      lines.splice(index, topBlockEnd(lines, index) - index, line);
    } else {
      lines.push(line);
    }
  };

  // 中文：读取／写入顶层字符串数组（行内 [a, b] 或缩进 "- 项" 两种写法都认）。
  // English: Read/write a top-level string list (inline [a, b] or indented "- item").
  const readTopList = (lines: string[], key: string) => {
    const index = topKeyIndex(lines, key);
    if (index < 0) return [];
    const inline = lines[index].replace(new RegExp(`^${key}:\\s*`), "").trim();
    if (inline.startsWith("[")) {
      const inner = inline.replace(/^\[/, "").replace(/\]$/, "").trim();
      if (!inner) return [];
      return inner
        .split(",")
        .map((item) => unquoteYaml(item))
        .filter(Boolean);
    }
    const values: string[] = [];
    for (let line = index + 1; line < topBlockEnd(lines, index); line += 1) {
      const match = lines[line].match(/^\s*-\s*(.*)$/);
      if (match) values.push(unquoteYaml(match[1]));
    }
    return values;
  };

  const setTopList = (lines: string[], key: string, values: string[]) => {
    if (values.length === 0) {
      removeTopKey(lines, key);
      return;
    }
    const line = `${key}: [${values.map((value) => yamlQuote(value)).join(", ")}]`;
    const index = topKeyIndex(lines, key);
    if (index >= 0) {
      lines.splice(index, topBlockEnd(lines, index) - index, line);
    } else {
      lines.push(line);
    }
  };

  // 中文：旧文件可能仍写单一 type；读取时并入标签，保存时移除旧字段。
  // English: Legacy files may still carry a single type; reads fold it into
  // the tags, and saves drop the old fields.
  const readWritingTags = (lines: string[]) => {
    const tags = readTopList(lines, "tags");
    if (tags.length > 0) return tags;
    const legacyType = readTopScalar(lines, "type");
    return legacyType ? [legacyType] : [];
  };

  const setWritingTags = (lines: string[], tags: string[]) => {
    setTopList(lines, "tags", [...new Set(tags)]);
    removeTopKey(lines, "type");
    removeTopKey(lines, "language");
  };

  const readNestedScalar = (lines: string[], parent: string, child: string) => {
    const parentIndex = topKeyIndex(lines, parent);
    if (parentIndex < 0) return "";
    for (
      let index = parentIndex + 1;
      index < topBlockEnd(lines, parentIndex);
      index += 1
    ) {
      const match = lines[index].match(new RegExp(`^\\s+${child}:\\s*(.*)$`));
      if (match) return unquoteYaml(match[1]);
    }
    return "";
  };

  const readDoubleNestedScalar = (
    lines: string[],
    parent: string,
    child: string,
    grandchild: string,
  ) => {
    const parentIndex = topKeyIndex(lines, parent);
    if (parentIndex < 0) return "";
    const parentEnd = topBlockEnd(lines, parentIndex);
    for (let index = parentIndex + 1; index < parentEnd; index += 1) {
      const childMatch = lines[index].match(new RegExp(`^(\\s+)${child}:\\s*$`));
      if (!childMatch) continue;
      const childIndent = childMatch[1].length;
      for (let nestedIndex = index + 1; nestedIndex < parentEnd; nestedIndex += 1) {
        const nestedIndent = lines[nestedIndex].match(/^(\s*)/)?.[1].length ?? 0;
        if (nestedIndent <= childIndent) break;
        const match = lines[nestedIndex].match(
          new RegExp(`^\\s+${grandchild}:\\s*(.*)$`),
        );
        if (match) return unquoteYaml(match[1]);
      }
    }
    return "";
  };

  const setVideoBlock = (lines: string[], values: PeerTubeFormValues) => {
    removeTopKey(lines, "video");
    const videoLines = peerTubeBlockLines(values);
    if (videoLines.length > 0) lines.push(...videoLines);
  };

  const setNestedScalar = (
    lines: string[],
    parent: string,
    child: string,
    value: string | number,
    options: { quote?: boolean } = {},
  ) => {
    const parentIndex = topKeyIndex(lines, parent);
    const next =
      typeof value === "number" || options.quote === false
        ? String(value)
        : yamlQuote(String(value));
    const childLine = `  ${child}: ${next}`;

    if (parentIndex < 0) {
      lines.push(`${parent}:`, childLine);
      return;
    }

    if (lines[parentIndex].trim() !== `${parent}:`) {
      lines.splice(parentIndex, 1, `${parent}:`, childLine);
      return;
    }

    const end = topBlockEnd(lines, parentIndex);
    for (let index = parentIndex + 1; index < end; index += 1) {
      if (lines[index].match(new RegExp(`^\\s+${child}:\\s*`))) {
        lines[index] = childLine;
        return;
      }
    }
    lines.splice(parentIndex + 1, 0, childLine);
  };

  const setDurationMinutes = (lines: string[], value: string) => {
    const minutes = Number(value);
    if (!(minutes > 0)) {
      const index = topKeyIndex(lines, "duration");
      if (index >= 0) {
        lines.splice(index, topBlockEnd(lines, index) - index, "duration: {}");
      } else {
        lines.push("duration: {}");
      }
      return;
    }
    setNestedScalar(lines, "duration", "minutes", minutes, { quote: false });
  };

  const readLinksText = (lines: string[]) => {
    const index = topKeyIndex(lines, "links");
    if (index < 0) return "";
    const line = lines[index].trim();
    if (line === "links: []") return "";

    const links: { label: string; url: string }[] = [];
    let current: { label: string; url: string } | null = null;
    const end = topBlockEnd(lines, index);
    for (let lineIndex = index + 1; lineIndex < end; lineIndex += 1) {
      const itemLine = lines[lineIndex];
      const labelMatch = itemLine.match(/^\s*-\s+label:\s*(.*)$/);
      if (labelMatch) {
        if (current) links.push(current);
        current = { label: unquoteYaml(labelMatch[1]), url: "" };
        continue;
      }
      const urlMatch = itemLine.match(/^\s+url:\s*(.*)$/);
      if (urlMatch && current) {
        current.url = unquoteYaml(urlMatch[1]);
      }
    }
    if (current) links.push(current);
    return links
      .filter((link) => link.label || link.url)
      .map((link) => `${link.label} | ${link.url}`)
      .join("\n");
  };

  const parseLinksText = (value: string) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("|");
        if (separator < 0) {
          throw new Error("Write event links as: Label | https://example.com");
        }
        const label = line.slice(0, separator).trim();
        const url = line.slice(separator + 1).trim();
        if (!label || !url) {
          throw new Error("Each event link needs both a label and a URL.");
        }
        return { label, url };
      });

  const setLinksBlock = (lines: string[], value: string) => {
    removeTopKey(lines, "links");
    const links = parseLinksText(value);
    if (links.length === 0) {
      lines.push("links: []");
      return;
    }
    lines.push(
      "links:",
      ...links.flatMap((link) => [
        `  - label: ${yamlQuote(link.label)}`,
        `    url: ${yamlQuote(link.url)}`,
      ]),
    );
  };

  const updateLibraryFrontmatter = (
    source: string,
    entry: LibraryEntry,
    form: FormData,
  ) => {
    const parts = frontmatterParts(source);
    if (!parts) throw new Error("This page has no frontmatter block.");
    const lines = parts.frontmatter.split(/\r?\n/);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const checked = (key: string) => form.get(key) === "on";
    const nextSlug = slugify(text("slug") || entry.folderSlug);

    setTopScalar(lines, "title", text("title") || "Untitled");
    setTopScalar(lines, "slug", nextSlug);
    setTopScalar(lines, "order", Number(text("order")) || 999, { quote: false });
    setTopScalar(lines, "draft", checked("draft"), { omitFalse: true });

    if (entry.kind === "works") {
      setTopScalar(lines, "subtitle", text("subtitle"), { omitEmpty: true });
      setTopScalar(lines, "comments", checked("comments"), { omitFalse: true });
      setTopScalar(
        lines,
        "year",
        Number(text("year")) || new Date().getFullYear(),
        { quote: false },
      );
      setTopScalar(lines, "category", text("category") || "Other");
      setNestedScalar(
        lines,
        "instrumentation",
        "en",
        text("instrumentation") || "To be decided",
      );
      setDurationMinutes(lines, text("duration"));
      setTopScalar(lines, "description", text("summary"), { omitEmpty: true });
      setVideoBlock(lines, {
        embedUrl: text("videoEmbedUrl"),
        watchUrl: text("videoWatchUrl"),
        poster: text("videoPoster"),
        posterAlt: text("videoPosterAlt"),
        caption: text("videoCaption"),
        captionZh: text("videoCaptionZh"),
        title: text("videoTitle"),
        titleZh: text("videoTitleZh"),
        aspectRatio: text("videoAspectRatio"),
      });
    } else if (entry.kind === "writings") {
      const titleZh = text("titleZh");
      const excerptZh = text("summaryZh");
      if (!titleZh) {
        throw new Error("Writings need a Chinese title.");
      }
      setTopScalar(lines, "titleZh", titleZh);
      setTopScalar(lines, "subtitle", text("subtitle"), { omitEmpty: true });
      setTopScalar(lines, "subtitleZh", text("subtitleZh"), { omitEmpty: true });
      setTopScalar(lines, "translationFrom", text("translationFrom"), { omitEmpty: true });
      setTopList(
        lines,
        "translationTo",
        text("translationTo").split(",").map((value) => value.trim()).filter(Boolean),
      );
      setTopScalar(lines, "comments", checked("comments"), { omitFalse: true });
      setTopScalar(
        lines,
        "date",
        text("date") || new Date().toISOString().slice(0, 10),
      );
      setWritingTags(
        lines,
        text("tags").split(",").map((tag) => tag.trim()).filter(Boolean),
      );
      setTopScalar(lines, "excerpt", text("summary"), { omitEmpty: true });
      setTopScalar(lines, "excerptZh", excerptZh, { omitEmpty: true });
    } else {
      removeTopKey(lines, "subtitle");
      removeTopKey(lines, "comments");
      setTopScalar(
        lines,
        "date",
        text("date") || new Date().toISOString().slice(0, 10),
      );
      setTopScalar(lines, "time", text("time"), { omitEmpty: true });
      setTopScalar(lines, "venue", text("venue"), { omitEmpty: true });
      setTopScalar(lines, "location", text("location"), { omitEmpty: true });
      setTopScalar(lines, "role", text("role"), { omitEmpty: true });
      setTopScalar(lines, "brief", text("summary") || text("title"));
      setLinksBlock(lines, text("links"));
    }

    return {
      slug: nextSlug,
      source: `---${parts.lineBreak}${lines.join(parts.lineBreak)}${parts.lineBreak}---${parts.lineBreak}${parts.body}`,
    };
  };

  const pathKind = (path: string): LibraryKind | null => {
    if (path.startsWith("content/works/")) return "works";
    if (path.startsWith("content/events/")) return "events";
    if (path.startsWith("content/writings/")) return "writings";
    return null;
  };

  const libraryPathFor = (kind: LibraryKind, slug: string) =>
    `content/${kind}/${slug}/index.md`;

  const libraryFolderFor = (kind: LibraryKind, slug: string) =>
    `content/${kind}/${slug}`;

  const readLibraryEntry = async (path: string): Promise<LibraryEntry | null> => {
    const kind = pathKind(path);
    if (!kind || !path.match(/^content\/(works|events|writings)\/[^/]+\/index\.md$/)) {
      return null;
    }
    const handle = fileHandles.get(path);
    if (!handle) return null;
    const source = currentPath === path
      ? editor.state.doc.toString()
      : await (await handle.getFile()).text();
    const parts = frontmatterParts(source);
    if (!parts) return null;
    const lines = parts.frontmatter.split(/\r?\n/);
    const folderSlug = path.split("/").at(-2) ?? "";
    return {
      kind,
      path,
      folder: path.replace(/\/index\.md$/, ""),
      folderSlug,
      title: readTopScalar(lines, "title") || folderSlug,
      titleZh: readTopScalar(lines, "titleZh"),
      slug: readTopScalar(lines, "slug") || folderSlug,
      subtitle: readTopScalar(lines, "subtitle"),
      subtitleZh: readTopScalar(lines, "subtitleZh"),
      translationFrom: readTopScalar(lines, "translationFrom"),
      translationTo: readTopList(lines, "translationTo"),
      year: readTopScalar(lines, "year"),
      date: readTopScalar(lines, "date"),
      time: readTopScalar(lines, "time"),
      venue: readTopScalar(lines, "venue"),
      location: readTopScalar(lines, "location"),
      role: readTopScalar(lines, "role"),
      category: readTopScalar(lines, "category") || "Other",
      tags: readWritingTags(lines),
      instrumentation: readNestedScalar(lines, "instrumentation", "en"),
      duration: readNestedScalar(lines, "duration", "minutes"),
      videoEmbedUrl: readNestedScalar(lines, "video", "embedUrl"),
      videoWatchUrl: readNestedScalar(lines, "video", "watchUrl"),
      videoPoster: readNestedScalar(lines, "video", "poster"),
      videoPosterAlt: readNestedScalar(lines, "video", "posterAlt"),
      videoCaption: readDoubleNestedScalar(lines, "video", "caption", "en"),
      videoCaptionZh: readDoubleNestedScalar(lines, "video", "caption", "zh"),
      videoTitle: readDoubleNestedScalar(lines, "video", "title", "en"),
      videoTitleZh: readDoubleNestedScalar(lines, "video", "title", "zh"),
      videoAspectRatio: readNestedScalar(lines, "video", "aspectRatio"),
      summary:
        kind === "works"
          ? readTopScalar(lines, "description")
          : kind === "writings"
            ? readTopScalar(lines, "excerpt")
            : readTopScalar(lines, "brief"),
      summaryZh: kind === "writings" ? readTopScalar(lines, "excerptZh") : "",
      links: readLinksText(lines),
      order: readTopScalar(lines, "order") || "999",
      draft: readTopScalar(lines, "draft") === "true",
      comments: kind !== "events" && readTopScalar(lines, "comments") === "true",
      source,
    };
  };

  let libraryEntries: LibraryEntry[] = [];
  let selectedLibraryPath = "";

  const setLibraryMode = () => {
    const kind = libraryKindSelect.value as LibraryKind;
    const isWorks = kind === "works";
    const isEvents = kind === "events";
    const isWritings = kind === "writings";
    libraryForm
      .querySelectorAll<HTMLElement>("[data-library-work-only]")
      .forEach((element) => {
        element.hidden = !isWorks;
      });
    libraryForm
      .querySelectorAll<HTMLElement>("[data-library-writing-only]")
      .forEach((element) => {
        element.hidden = !isWritings;
      });
    libraryForm
      .querySelectorAll<HTMLElement>("[data-library-event-only]")
      .forEach((element) => {
        element.hidden = !isEvents;
      });
    libraryForm
      .querySelectorAll<HTMLElement>("[data-library-writing-or-event]")
      .forEach((element) => {
        element.hidden = !(isWritings || isEvents);
      });
    libraryForm
      .querySelectorAll<HTMLElement>("[data-library-non-event]")
      .forEach((element) => {
        element.hidden = isEvents;
      });
    libraryForm
      .querySelectorAll<HTMLElement>("[data-library-comments-control]")
      .forEach((element) => {
        element.hidden = isEvents;
      });
  };

  const libraryField = <T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    name: string,
  ) => libraryForm.querySelector<T>(`[data-library-field="${name}"]`);

  const setLibraryField = (name: string, value: string | boolean) => {
    const field = libraryField(name);
    if (!field) return;
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      field.checked = value === true;
    } else {
      field.value = String(value ?? "");
    }
  };

  const libraryFormData = () => {
    const data = new FormData();
    libraryForm
      .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "[data-library-field]",
      )
      .forEach((field) => {
        const name = field.dataset.libraryField;
        if (!name) return;
        if (field instanceof HTMLInputElement && field.type === "checkbox") {
          if (field.checked) data.set(name, "on");
        } else {
          data.set(name, field.value);
        }
      });
    // 标签多选框没有 data-library-field，另行汇总。
    // The tag checkboxes carry no data-library-field; gather them separately.
    data.set("tags", selectedTags(libraryTagsContainer).join(", "));
    return data;
  };

  let libraryFormSnapshot = "";
  const libraryFormState = () =>
    JSON.stringify(Array.from(libraryFormData().entries()));
  const libraryHasUnsavedChanges = () =>
    !libraryForm.hidden && libraryFormSnapshot !== libraryFormState();
  const confirmLibraryDiscard = () =>
    !libraryHasUnsavedChanges() ||
    window.confirm("Discard unsaved Library fields?");

  const activeLibraryEntry = () =>
    libraryEntries.find((entry) => entry.path === selectedLibraryPath);

  const previewPathForEntry = (entry: LibraryEntry) =>
    `/${entry.kind}/${entry.slug || entry.folderSlug}/`;

  const showLibraryEntry = (entry: LibraryEntry) => {
    selectedLibraryPath = entry.path;
    libraryForm.hidden = false;
    libraryPathLabel.textContent = entry.path;
    setLibraryMode();
    setLibraryField("title", entry.title);
    setLibraryField("titleZh", entry.titleZh);
    setLibraryField("slug", entry.slug);
    setLibraryField("subtitle", entry.subtitle);
    setLibraryField("subtitleZh", entry.subtitleZh);
    setLibraryField("translationFrom", entry.translationFrom);
    setLibraryField("translationTo", entry.translationTo.join(", "));
    setLibraryField("year", entry.year);
    setLibraryField("category", entry.category);
    setLibraryField("instrumentation", entry.instrumentation);
    setLibraryField("duration", entry.duration);
    setLibraryField("videoEmbedUrl", entry.videoEmbedUrl);
    setLibraryField("videoWatchUrl", entry.videoWatchUrl);
    setLibraryField("videoPoster", entry.videoPoster);
    setLibraryField("videoPosterAlt", entry.videoPosterAlt);
    setLibraryField("videoCaption", entry.videoCaption);
    setLibraryField("videoCaptionZh", entry.videoCaptionZh);
    setLibraryField("videoTitle", entry.videoTitle);
    setLibraryField("videoTitleZh", entry.videoTitleZh);
    setLibraryField("videoAspectRatio", entry.videoAspectRatio);
    setLibraryField("date", entry.date);
    setLibraryField("time", entry.time);
    setLibraryField("venue", entry.venue);
    setLibraryField("location", entry.location);
    setLibraryField("role", entry.role);
    setSelectedTags(libraryTagsContainer, entry.tags);
    setLibraryField("summary", entry.summary);
    setLibraryField("summaryZh", entry.summaryZh);
    setLibraryField("links", entry.links);
    setLibraryField("order", entry.order);
    setLibraryField("draft", entry.draft);
    setLibraryField("comments", entry.comments);
    libraryMessage.textContent = "";
    libraryFormSnapshot = libraryFormState();
    renderLibraryList();
  };

  const renderLibraryList = () => {
    const kind = libraryKindSelect.value as LibraryKind;
    const query = libraryFilterInput.value.trim().toLowerCase();
    const items = libraryEntries
      .filter((entry) => entry.kind === kind)
      .filter((entry) =>
        [
          entry.title,
          entry.titleZh,
          entry.slug,
          entry.folderSlug,
          entry.category,
          entry.tags.join(" "),
          entry.date,
          entry.time,
          entry.venue,
          entry.location,
          entry.role,
          entry.draft ? "draft" : "public",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) => {
        if (kind === "events") {
          const dateOrder = Date.parse(a.date) - Date.parse(b.date);
          if (Number.isFinite(dateOrder) && dateOrder !== 0) return dateOrder;
        }
        const order = Number(a.order) - Number(b.order);
        if (Number.isFinite(order) && order !== 0) return order;
        return a.title.localeCompare(b.title);
      });

    libraryList.replaceChildren();
    for (const entry of items) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-current", String(entry.path === selectedLibraryPath));
      const title = document.createElement("span");
      title.className = "library-title";
      title.textContent = entry.title;
      const meta = document.createElement("span");
      meta.className = "library-meta";
      const metaParts =
        entry.kind === "works"
          ? [entry.year, entry.category]
          : entry.kind === "writings"
            ? [entry.date, entry.tags.join(", ")]
            : [entry.date, entry.time, entry.venue || entry.location, entry.role];
      meta.textContent = [...metaParts, entry.draft ? "draft" : "public"]
        .filter(Boolean)
        .join(" | ");
      button.append(title, meta);
      button.addEventListener("click", () => {
        if (confirmLibraryDiscard()) showLibraryEntry(entry);
      });
      item.append(button);
      libraryList.append(item);
    }
  };

  const refreshLibrary = async () => {
    const paths = [...fileHandles.keys()].filter((path) =>
      path.match(/^content\/(works|events|writings)\/[^/]+\/index\.md$/),
    );
    const entries = await Promise.all(paths.map((path) => readLibraryEntry(path)));
    libraryEntries = entries.filter((entry): entry is LibraryEntry => Boolean(entry));
    if (selectedLibraryPath && !libraryEntries.some((entry) => entry.path === selectedLibraryPath)) {
      selectedLibraryPath = "";
      libraryForm.hidden = true;
    }
    renderLibraryList();
  };

  const moveProjectPath = async (from: string, to: string) => {
    if (!apiConnected) {
      throw new Error("Start the local development server before moving folders.");
    }
    const response = await fetch("/__admin/api/move", {
      method: "POST",
      headers: authenticatedHeaders({
        "Content-Type": "application/json; charset=utf-8",
      }),
      body: JSON.stringify({ from, to }),
    });
    if (!response.ok) throw new Error(await responseError(response));
  };

  libraryKindSelect.addEventListener("change", () => {
    if (!confirmLibraryDiscard()) return;
    selectedLibraryPath = "";
    libraryForm.hidden = true;
    libraryFormSnapshot = "";
    setLibraryMode();
    renderLibraryList();
  });

  libraryFilterInput.addEventListener("input", renderLibraryList);

  studio
    .querySelectorAll<HTMLButtonElement>("[data-library-create]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        newKindSelect.value = button.dataset.libraryCreate ?? "work";
        newKindSelect.dispatchEvent(new Event("change"));
        selectSidebarTab("new");
        newTitleInput.focus();
      });
    });

  libraryOpenButton.addEventListener("click", () => {
    const entry = activeLibraryEntry();
    if (entry) void loadFile(entry.path);
  });

  libraryPreviewButton.addEventListener("click", () => {
    const entry = activeLibraryEntry();
    if (!entry) return;
    refreshPreview(previewPathForEntry(entry));
  });

  libraryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      const entry = activeLibraryEntry();
      if (!entry) return;
      try {
        const form = libraryFormData();
        const handle = fileHandles.get(entry.path);
        if (!handle) throw new Error("The page file is unavailable.");
        const source =
          currentPath === entry.path
            ? editor.state.doc.toString()
            : await (await handle.getFile()).text();
        const updated = updateLibraryFrontmatter(source, entry, form);
        const newPath = libraryPathFor(entry.kind, updated.slug);
        const oldFolder = entry.folder;
        const newFolder = libraryFolderFor(entry.kind, updated.slug);
        if (newPath !== entry.path && fileHandles.has(newPath)) {
          throw new Error("A page with that slug already exists.");
        }
        if (newPath !== entry.path && !apiConnected) {
          throw new Error("Slug changes need the local development server connection.");
        }

        const writable = await handle.createWritable();
        await writable.write(updated.source);
        await writable.close();

        if (newPath !== entry.path) {
          await moveProjectPath(oldFolder, newFolder);
        }

        if (currentPath === entry.path) {
          currentPath = newPath;
          rememberCurrentFile(newPath);
          currentFileLabel.textContent = newPath;
          loadingDocument = true;
          editor.dispatch({
            changes: {
              from: 0,
              to: editor.state.doc.length,
              insert: updated.source,
            },
          });
          loadingDocument = false;
          setDirty(false);
          syncMarkdownToolbar();
        }

        await connectDevProject();
        selectedLibraryPath = newPath;
        const nextEntry = libraryEntries.find((item) => item.path === newPath);
        if (nextEntry) showLibraryEntry(nextEntry);
        libraryFormSnapshot = libraryFormState();
        setStatus(`Saved catalog fields for ${newPath}.`);
        libraryMessage.textContent = "Saved.";
      } catch (error) {
        libraryMessage.textContent =
          error instanceof Error ? error.message : "Unable to save catalog fields.";
      }
    })();
  });

  libraryTrashButton.addEventListener("click", () => {
    void (async () => {
      const entry = activeLibraryEntry();
      if (!entry) return;
      if (!confirmLibraryDiscard()) return;
      if (
        dirty &&
        currentPath.startsWith(`${entry.folder}/`) &&
        !window.confirm(
          `The open file ${currentPath} has unsaved changes. Move this page to trash anyway?`,
        )
      ) {
        return;
      }
      const ok = window.confirm(
        `Move “${entry.title}” to content/_trash? The public page will disappear after rebuild.`,
      );
      if (!ok) return;
      try {
        const stamp = new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\..+$/, "");
        const destination = `content/_trash/${entry.kind}/${entry.folderSlug}-${stamp}`;
        await moveProjectPath(entry.folder, destination);
        if (currentPath.startsWith(`${entry.folder}/`)) {
          clearCurrentDocument("Moved to trash. Select another file.");
        }
        selectedLibraryPath = "";
        libraryForm.hidden = true;
        libraryFormSnapshot = "";
        await connectDevProject();
        setStatus(`Moved ${entry.folder} to ${destination}.`);
        libraryMessage.textContent = "Moved to trash.";
      } catch (error) {
        libraryMessage.textContent =
          error instanceof Error ? error.message : "Unable to move this page.";
      }
    })();
  });

  const normalizedSourceText = (value: string) =>
    value
      .toLocaleLowerCase()
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\s+/g, " ")
      .trim();

  const findContentLine = async (path: string, element: Element) => {
    const handle = fileHandles.get(path);
    if (!handle) return 1;
    const text = await (await handle.getFile()).text();
    const lines = text.split(/\r?\n/);
    const jsonPath = element.closest<HTMLElement>("[data-json-path]")?.dataset
      .jsonPath;
    if (jsonPath && extensionOf(path) === ".json") {
      const keys = jsonPath.split(".");
      if (keys.length >= 2) {
        const parentIndex = lines.findIndex((line) =>
          line.includes(`"${keys[0]}"`),
        );
        if (parentIndex >= 0) {
          const childKey = keys.at(-1);
          for (let index = parentIndex + 1; index < lines.length; index += 1) {
            if (/^\s*}\s*,?\s*$/.test(lines[index])) break;
            if (childKey && lines[index].includes(`"${childKey}"`)) {
              return index + 1;
            }
          }
        }
      }
      const fieldName = keys.at(-1);
      if (fieldName) {
        const index = lines.findIndex((line) => line.includes(`"${fieldName}"`));
        if (index >= 0) return index + 1;
      }
    }
    const associatedLabel =
      (element as HTMLInputElement).labels?.[0]?.textContent ?? "";
    const visibleText = normalizedSourceText(
      element.textContent ||
        associatedLabel ||
        element.getAttribute("aria-label") ||
        element.getAttribute("placeholder") ||
        "",
    );
    const searchPhrases = [
      visibleText.slice(0, 90),
      visibleText.split(" ").slice(0, 7).join(" "),
      normalizedSourceText(element.getAttribute("id") ?? ""),
      normalizedSourceText(element.getAttribute("name") ?? ""),
    ].filter((phrase) => phrase.length >= 4);

    for (const phrase of searchPhrases) {
      const index = lines.findIndex((line) =>
        normalizedSourceText(line).includes(phrase),
      );
      if (index >= 0) return index + 1;
    }

    return 1;
  };

  const findStyleLine = async (element: Element) => {
    // 元素可声明自己的样式文件（如工具页的 tools.css）；body 是兜底。
    // Elements may declare their stylesheet (e.g. tools.css on tool panels);
    // the body attribute is the fallback.
    const path =
      element.closest<HTMLElement>("[data-style-source]")?.dataset
        .styleSource ??
      element.ownerDocument.body.dataset.styleSource ??
      GLOBAL_CSS_PATH;
    const handle = fileHandles.get(path);
    if (!handle) return { path, line: 1 };

    const lines = (await (await handle.getFile()).text()).split(/\r?\n/);
    const candidates: string[] = [];
    let current: Element | null = element;

    while (current && current !== current.ownerDocument.body) {
      current.classList.forEach((className) => {
        if (!candidates.includes(className)) candidates.push(className);
      });
      current = current.parentElement;
    }

    for (const className of candidates) {
      const index = lines.findIndex((line) =>
        line.includes(`.${className}`),
      );
      if (index >= 0) return { path, line: index + 1 };
    }

    const tagName = element.tagName.toLocaleLowerCase();
    const tagIndex = lines.findIndex((line) => {
      const trimmed = line.trim();
      return (
        trimmed === tagName ||
        trimmed.startsWith(`${tagName},`) ||
        trimmed.startsWith(`${tagName} {`)
      );
    });
    return { path, line: tagIndex >= 0 ? tagIndex + 1 : 1 };
  };

  const openInspectorContent = async (element: Element) => {
    const sourceElement =
      element.closest<HTMLElement>("[data-editable-text][data-source-file]") ??
      element.querySelector<HTMLElement>("[data-editable-text][data-source-file]") ??
      element.closest<HTMLElement>("[data-source-file]");
    const path = sourceElement?.dataset.sourceFile;
    if (!path || !fileHandles.has(path)) {
      setStatus("No unique content source is registered for this block.", "error");
      return;
    }
    const line = await findContentLine(path, element);
    selectSidebarTab("files");
    await loadFile(path, line);
  };

  const openInspectorStyle = async (element: Element) => {
    const { path, line } = await findStyleLine(element);
    if (!fileHandles.has(path)) {
      setStatus("The shared style file is not available.", "error");
      return;
    }
    selectSidebarTab("files");
    await loadFile(path, line);
  };

  const projectEditableText = (value: string, ignoreMarkdown: boolean) => {
    const text: string[] = [];
    const starts: number[] = [];
    const ends: number[] = [];
    let index = 0;

    while (index < value.length) {
      const character = value[index];

      if (
        ignoreMarkdown &&
        character === "]" &&
        value[index + 1] === "("
      ) {
        const destinationEnd = value.indexOf(")", index + 2);
        if (destinationEnd >= 0) {
          index = destinationEnd + 1;
          continue;
        }
      }

      if (ignoreMarkdown && /[*_`~#[\]>]/.test(character)) {
        index += 1;
        continue;
      }

      if (/\s/.test(character)) {
        const whitespaceStart = index;
        while (index < value.length && /\s/.test(value[index])) index += 1;
        if (text.length > 0 && text.at(-1) !== " ") {
          text.push(" ");
          starts.push(whitespaceStart);
          ends.push(index);
        }
        continue;
      }

      const normalizedCharacter = character
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .toLocaleLowerCase();
      text.push(normalizedCharacter);
      starts.push(index);
      ends.push(index + 1);
      index += 1;
    }

    if (text.at(-1) === " ") {
      text.pop();
      starts.pop();
      ends.pop();
    }

    return { text: text.join(""), starts, ends };
  };

  const findVisualTextRange = async (
    path: string,
    source: string,
    oldText: string,
    element: Element,
  ) => {
    const needle = normalizedSourceText(oldText);
    if (!needle) return null;

    const extension = extensionOf(path);
    const projections = [
      projectEditableText(source, false),
      ...(extension === ".md" ? [projectEditableText(source, true)] : []),
    ];
    const ranges = new Map<string, { start: number; end: number }>();

    projections.forEach((projection) => {
      let matchIndex = projection.text.indexOf(needle);
      while (matchIndex >= 0) {
        const lastIndex = matchIndex + needle.length - 1;
        const start = projection.starts[matchIndex];
        const end = projection.ends[lastIndex];
        if (start !== undefined && end !== undefined) {
          ranges.set(`${start}:${end}`, { start, end });
        }
        matchIndex = projection.text.indexOf(needle, matchIndex + 1);
      }
    });

    const astroBodyStart =
      extension === ".astro"
        ? source.indexOf("---", source.indexOf("---") + 3) + 3
        : 0;
    const candidates = [...ranges.values()].filter(({ start, end }) => {
      if (extension === ".astro") {
        if (astroBodyStart > 2 && start < astroBodyStart) return false;
        const lastOpen = source.lastIndexOf("<", start);
        const lastClose = source.lastIndexOf(">", start);
        if (lastOpen > lastClose) return false;
        if (/[<>{}]/.test(source.slice(start, end))) return false;
      }
      return true;
    });

    if (candidates.length === 0) return null;

    const targetLine = await findContentLine(path, element);
    let targetOffset = 0;
    for (let line = 1; line < targetLine; line += 1) {
      const nextBreak = source.indexOf("\n", targetOffset);
      if (nextBreak < 0) break;
      targetOffset = nextBreak + 1;
    }

    candidates.sort(
      (a, b) =>
        Math.abs(a.start - targetOffset) - Math.abs(b.start - targetOffset),
    );
    return candidates[0];
  };

  interface VisualMarkdownContext {
    path: string;
    source: string;
    blockStart: number;
    blockEnd: number;
    sourceText: string;
    canManageBlocks: boolean;
  }

  const visualMarkdownContext = async (
    element: Element,
    renderedText: string,
  ): Promise<VisualMarkdownContext | null> => {
    const sourceElement =
      element.closest<HTMLElement>("[data-editable-text][data-source-file]") ??
      element.closest<HTMLElement>("[data-source-file]");
    const path = sourceElement?.dataset.sourceFile;
    const handle = path ? fileHandles.get(path) : undefined;
    if (!path || !handle || extensionOf(path) !== ".md") return null;

    const source =
      currentPath === path
        ? editor.state.doc.toString()
        : await (await handle.getFile()).text();
    let range = await findVisualTextRange(path, source, renderedText, element);
    if (!range) {
      const target = normalizedSourceText(renderedText);
      let lineStart = 0;
      for (const line of source.split(/\r?\n/)) {
        const simplified = normalizedSourceText(
          line
            .replace(/^#{1,6}\s+/, "")
            .replace(/^[-*>]\s+/, "")
            .replace(/[*_`~]/g, ""),
        );
        if (simplified === target) {
          const visibleStart = line
            .toLocaleLowerCase()
            .indexOf(renderedText.slice(0, 12).toLocaleLowerCase());
          range = {
            start: lineStart + Math.max(visibleStart, 0),
            end: lineStart + line.length,
          };
          break;
        }
        lineStart += line.length + (source.includes("\r\n") ? 2 : 1);
      }
    }
    if (!range) return null;

    const closingFrontmatter = source.startsWith("---")
      ? source.indexOf("\n---", 3)
      : -1;
    const bodyStart =
      closingFrontmatter >= 0
        ? source.indexOf("\n", closingFrontmatter + 1) + 1
        : 0;
    const canManageBlocks = range.start >= bodyStart;
    if (!canManageBlocks) {
      return {
        path,
        source,
        blockStart: range.start,
        blockEnd: range.end,
        sourceText: renderedText,
        canManageBlocks: false,
      };
    }

    const blankLinePattern = /\r?\n\r?\n/g;
    let previousGapEnd = bodyStart;
    let nextGapStart = source.length;
    let gapMatch = blankLinePattern.exec(source);
    while (gapMatch) {
      if (gapMatch.index < range.start && gapMatch.index >= bodyStart) {
        previousGapEnd = gapMatch.index + gapMatch[0].length;
      }
      if (gapMatch.index >= range.end) {
        nextGapStart = gapMatch.index;
        break;
      }
      gapMatch = blankLinePattern.exec(source);
    }
    let blockStart = previousGapEnd;
    let blockEnd = nextGapStart;
    while (source[blockStart] === "\n" || source[blockStart] === "\r") {
      blockStart += 1;
    }
    while (
      blockEnd > blockStart &&
      (source[blockEnd - 1] === "\n" || source[blockEnd - 1] === "\r")
    ) {
      blockEnd -= 1;
    }

    return {
      path,
      source,
      blockStart,
      blockEnd,
      sourceText: source.slice(blockStart, blockEnd),
      canManageBlocks: true,
    };
  };

  const writeVisualSource = async (
    path: string,
    updated: string,
    message: string,
  ) => {
    const handle = fileHandles.get(path);
    if (!handle) throw new Error("The source file is unavailable.");
    const writable = await handle.createWritable();
    await writable.write(updated);
    await writable.close();

    if (currentPath === path) {
      loadingDocument = true;
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: updated,
        },
      });
      loadingDocument = false;
      setDirty(false);
    }

    setStatus(message);
    schedulePreviewRefresh();
  };

  const applyVisualMarkdownBlock = async (
    element: Element,
    renderedText: string,
    markdown: string,
    action: "replace" | "before" | "after" | "delete",
  ) => {
    try {
      const context = await visualMarkdownContext(element, renderedText);
      if (!context) {
        setStatus("This block could not be matched to Markdown source.", "error");
        return false;
      }
      if (!context.canManageBlocks) {
        if (action !== "replace") {
          setStatus("Front-matter fields cannot add or delete blocks.", "error");
          return false;
        }
        return applyVisualTextEdit(element, renderedText, markdown);
      }

      const lineBreak = context.source.includes("\r\n") ? "\r\n" : "\n";
      const nextBlock = markdown.trim().replace(/\r?\n/g, lineBreak);
      if (action !== "delete" && !nextBlock) {
        setStatus("Enter some Markdown before applying this change.", "error");
        return false;
      }

      const currentBlock = context.source.slice(
        context.blockStart,
        context.blockEnd,
      );
      const blockGap = `${lineBreak}${lineBreak}`;
      let replacement = nextBlock;
      if (action === "before") {
        replacement = `${nextBlock}${blockGap}${currentBlock}`;
      }
      if (action === "after") {
        replacement = `${currentBlock}${blockGap}${nextBlock}`;
      }

      let start = context.blockStart;
      let end = context.blockEnd;
      if (action === "delete") {
        replacement = "";
        const followingGap = context.source.slice(end).match(/^\r?\n\r?\n/);
        const precedingGap = context.source.slice(0, start).match(/\r?\n\r?\n$/);
        if (followingGap) {
          end += followingGap[0].length;
        } else if (precedingGap) {
          start -= precedingGap[0].length;
        }
      }

      const updated =
        context.source.slice(0, start) +
        replacement +
        context.source.slice(end);
      await writeVisualSource(
        context.path,
        updated,
        action === "delete"
          ? `Deleted a block from ${context.path}.`
          : `Updated Markdown in ${context.path}.`,
      );
      return true;
    } catch (error) {
      loadingDocument = false;
      setStatus(
        error instanceof Error ? error.message : "Unable to update this block.",
        "error",
      );
      return false;
    }
  };

  // Astro 文本允许一小组安全的行内标签（样式、注音、语言标记）；
  // 其余 < > 与所有 { } 仍被拒绝，保护组件与表达式不被改坏。
  // Astro text accepts a small whitelist of inline tags (styling, ruby,
  // language marks); any other < > and all { } are still rejected so
  // components and expressions stay safe.
  const ALLOWED_INLINE_TAGS = new Set([
    "em", "strong", "span", "ruby", "rt", "rb", "br",
    "small", "sub", "sup", "code", "mark", "abbr",
  ]);
  const ALLOWED_INLINE_ATTRIBUTES = new Set(["style", "lang", "class", "title"]);
  const ALLOWED_STYLE_PROPERTIES = new Set([
    "letter-spacing", "word-spacing", "font-variant", "font-variant-caps",
    "font-style", "font-weight", "font-size", "font-family",
    "text-transform", "white-space", "color",
  ]);

  const validateInlineHtml = (text: string): string | null => {
    if (/[{}]/.test(text)) {
      return "Astro expressions { } are not allowed in visual edits.";
    }
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z-]+(?:="[^"<>]*")?)*)\s*\/?>/g;
    let match = tagPattern.exec(text);
    while (match) {
      const tag = match[1].toLocaleLowerCase();
      if (!ALLOWED_INLINE_TAGS.has(tag)) {
        return `<${tag}> is not an allowed inline tag.`;
      }
      const attributePattern = /([a-zA-Z-]+)(?:="([^"]*)")?/g;
      let attribute = attributePattern.exec(match[2] ?? "");
      while (attribute) {
        const name = attribute[1].toLocaleLowerCase();
        if (!ALLOWED_INLINE_ATTRIBUTES.has(name)) {
          return `Attribute "${name}" is not allowed.`;
        }
        if (name === "style") {
          for (const declaration of (attribute[2] ?? "").split(";")) {
            const property = declaration.split(":")[0]?.trim().toLocaleLowerCase();
            if (property && !ALLOWED_STYLE_PROPERTIES.has(property)) {
              return `Style property "${property}" is not allowed.`;
            }
          }
        }
        attribute = attributePattern.exec(match[2] ?? "");
      }
      match = tagPattern.exec(text);
    }
    if (/[<>]/.test(text.replace(tagPattern, ""))) {
      return "Unbalanced or unsupported < > markup.";
    }
    return null;
  };

  const applyVisualTextEdit = async (
    element: Element,
    oldText: string,
    newText: string,
  ) => {
    const sourceElement =
      element.closest<HTMLElement>("[data-editable-text][data-source-file]") ??
      element.closest<HTMLElement>("[data-source-file]");
    const path = sourceElement?.dataset.sourceFile;
    const handle = path ? fileHandles.get(path) : undefined;
    if (!path || !handle) {
      setStatus("This text block has no registered source file.", "error");
      return false;
    }

    const extension = extensionOf(path);
    if (extension !== ".md" && extension !== ".astro" && extension !== ".json") {
      setStatus("Visual text editing supports Markdown, Astro, and registered JSON text.", "error");
      return false;
    }

    if (extension === ".json") {
      const jsonPath = sourceElement.dataset.jsonPath;
      if (!jsonPath) {
        setStatus("This JSON-backed text has no registered field.", "error");
        return false;
      }

      try {
        const source =
          currentPath === path
            ? editor.state.doc.toString()
            : await (await handle.getFile()).text();
        const data = JSON.parse(source) as Record<string, unknown>;
        const keys = jsonPath.split(".");
        let target: Record<string, unknown> = data;
        for (const key of keys.slice(0, -1)) {
          const next = target[key];
          if (!next || typeof next !== "object" || Array.isArray(next)) {
            setStatus("That JSON field could not be found.", "error");
            return false;
          }
          target = next as Record<string, unknown>;
        }
        target[keys.at(-1) ?? ""] = newText.trim();
        await writeVisualSource(
          path,
          `${JSON.stringify(data, null, 2)}\n`,
          `Updated text in ${path}.`,
        );
        return true;
      } catch (error) {
        loadingDocument = false;
        setStatus(
          error instanceof Error ? error.message : "Unable to update this text.",
          "error",
        );
        return false;
      }
    }

    if (extension === ".astro") {
      const problem = validateInlineHtml(newText);
      if (problem) {
        setStatus(problem, "error");
        return false;
      }
    }

    try {
      const source =
        currentPath === path
          ? editor.state.doc.toString()
          : await (await handle.getFile()).text();
      let range: { start: number; end: number } | null = null;
      if (extension === ".astro" && /<[^>]+>/.test(oldText)) {
        const directStart = source.indexOf(oldText);
        const directEnd = directStart + oldText.length;
        const unique =
          directStart >= 0 && source.indexOf(oldText, directStart + 1) < 0;
        const astroBodyStart =
          source.indexOf("---", source.indexOf("---") + 3) + 3;
        if (unique && (astroBodyStart <= 2 || directStart >= astroBodyStart)) {
          range = { start: directStart, end: directEnd };
        }
      }
      range ??= await findVisualTextRange(path, source, oldText, element);
      if (!range) {
        setStatus(
          "This block contains generated or structured markup. Use Content instead.",
          "error",
        );
        return false;
      }

      let replacement = newText.trim();
      const quote = source[range.start - 1];
      if (
        extension === ".md" &&
        (quote === '"' || quote === "'") &&
        source[range.end] === quote
      ) {
        if (replacement.includes("\n")) {
          setStatus("Front-matter fields must remain on one line.", "error");
          return false;
        }
        replacement =
          quote === '"'
            ? replacement.replaceAll("\\", "\\\\").replaceAll('"', '\\"')
            : replacement.replaceAll("'", "''");
      }

      const updated =
        source.slice(0, range.start) + replacement + source.slice(range.end);
      await writeVisualSource(path, updated, `Updated text in ${path}.`);
      return true;
    } catch (error) {
      loadingDocument = false;
      setStatus(
        error instanceof Error ? error.message : "Unable to update this text.",
        "error",
      );
      return false;
    }
  };

  let removePreviewInspector = () => {};
  let removePreviewVisualEditor = () => {};

  // Inspector markup is injected only into the same-origin preview iframe.
  // 检查器只注入同源预览，不会写入或发布到公开页面。
  //
  // 交互模型：移动 = 高亮候选块；点击 = 钉选（工具条停住，链接不再跳转）；
  // Parent 沿层级上移；Esc 或 ✕ 取消钉选。这样按钮永远可以到达。
  // Interaction model: hover highlights a candidate block; CLICK PINS it
  // (the toolbar stays put and links stop navigating); Parent walks up the
  // tree; Esc or ✕ unpins. The toolbar is therefore always reachable.
  const installPreviewInspector = () => {
    removePreviewInspector();
    if (!previewInspectorInput.checked || previewVisualEditorInput.checked) return;

    const frameDocument = previewFrame.contentDocument;
    const frameWindow = previewFrame.contentWindow;
    if (!frameDocument || !frameWindow) return;

    const style = frameDocument.createElement("style");
    style.dataset.studioInspectorUi = "true";
    style.textContent = `
      [data-studio-inspector-frame] {
        position: fixed;
        z-index: 2147483645;
        display: none;
        border: 1px dashed #c81e1e;
        background: rgb(200 30 30 / 6%);
        pointer-events: none;
      }
      [data-studio-inspector-frame][data-pinned="true"] {
        border-style: solid;
        background: rgb(200 30 30 / 4%);
      }
      [data-studio-inspector-toolbar] {
        position: fixed;
        z-index: 2147483646;
        display: none;
        gap: 0.25rem;
        align-items: center;
        max-width: min(34rem, calc(100vw - 1rem));
        padding: 0.25rem;
        border: 1px solid #c81e1e;
        background: #fff;
        color: #111;
        font: 12px/1.2 Consolas, monospace;
        box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
        pointer-events: none;
      }
      [data-studio-inspector-toolbar][data-pinned="true"] {
        pointer-events: auto;
      }
      [data-studio-inspector-toolbar] span {
        overflow: hidden;
        max-width: 13rem;
        padding-inline: 0.25rem;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      [data-studio-inspector-toolbar] em {
        color: #888;
        font-style: normal;
        padding-inline: 0.25rem;
      }
      [data-studio-inspector-toolbar] button {
        border: 1px solid #aaa;
        padding: 0.2rem 0.4rem;
        background: #fff;
        color: #111;
        font: inherit;
        cursor: pointer;
      }
      [data-studio-inspector-toolbar] button:hover {
        border-color: #c81e1e;
        color: #c81e1e;
      }
      [data-studio-inspector-toolbar][data-pinned="false"] button {
        display: none;
      }
      html,
      body,
      body * {
        cursor: crosshair !important;
      }
      [data-studio-inspector-ui],
      [data-studio-inspector-ui] * {
        cursor: auto !important;
      }
      [data-studio-inspector-toolbar] button {
        cursor: pointer !important;
      }
    `;

    const frame = frameDocument.createElement("div");
    frame.dataset.studioInspectorFrame = "true";
    frame.dataset.studioInspectorUi = "true";
    const toolbar = frameDocument.createElement("div");
    toolbar.dataset.studioInspectorToolbar = "true";
    toolbar.dataset.studioInspectorUi = "true";
    const label = frameDocument.createElement("span");
    const hint = frameDocument.createElement("em");
    hint.textContent = "click to pin";
    const styleButton = frameDocument.createElement("button");
    styleButton.type = "button";
    styleButton.textContent = "Style";
    styleButton.title = "Open the stylesheet rule for this block";
    const contentButton = frameDocument.createElement("button");
    contentButton.type = "button";
    contentButton.textContent = "Content";
    contentButton.title = "Open the source file for this block";
    const parentButton = frameDocument.createElement("button");
    parentButton.type = "button";
    parentButton.textContent = "Parent";
    parentButton.title = "Select the enclosing block";
    const closeButton = frameDocument.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "✕";
    closeButton.title = "Unpin (Esc)";
    toolbar.append(label, hint, styleButton, contentButton, parentButton, closeButton);
    frameDocument.head.append(style);
    frameDocument.body.append(frame, toolbar);

    const BLOCK_SELECTOR =
      "button, input, select, textarea, label, output, summary, details, canvas, svg, p, h1, h2, h3, h4, blockquote, figure, li, dl, table, nav, section, article, aside, header, footer, main, form, fieldset, div";

    let hoveredElement: Element | null = null;
    let pinnedElement: Element | null = null;
    let frameRequest = 0;

    const activeElement = () => pinnedElement ?? hoveredElement;

    const updateFrame = () => {
      frameRequest = 0;
      const element = activeElement();
      const pinned = pinnedElement !== null;
      if (!element || !element.isConnected) {
        frame.style.display = "none";
        toolbar.style.display = "none";
        return;
      }
      const rect = element.getBoundingClientRect();
      frame.dataset.pinned = String(pinned);
      frame.style.display = "block";
      frame.style.left = `${rect.left}px`;
      frame.style.top = `${rect.top}px`;
      frame.style.width = `${rect.width}px`;
      frame.style.height = `${rect.height}px`;

      toolbar.dataset.pinned = String(pinned);
      hint.hidden = pinned;
      label.textContent = [
        element.tagName.toLocaleLowerCase(),
        ...element.classList,
      ].join(".");
      toolbar.style.display = "flex";
      // 工具条优先出现在块的上方；空间不足时移到下方，且不遮住块本身。
      // The toolbar prefers the space above the block, dropping below only
      // when the top is off-screen, and never covering the block itself.
      const toolbarHeight = 30;
      const top =
        rect.top >= toolbarHeight + 8
          ? rect.top - toolbarHeight - 4
          : Math.min(rect.bottom + 4, frameWindow.innerHeight - toolbarHeight - 4);
      toolbar.style.left = `${Math.max(4, Math.min(rect.left, frameWindow.innerWidth - 340))}px`;
      toolbar.style.top = `${Math.max(4, top)}px`;
    };

    const scheduleFrameUpdate = () => {
      if (frameRequest) return;
      frameRequest = frameWindow.requestAnimationFrame(updateFrame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (pinnedElement) return; // pinned: ignore hover entirely
      const target = event.target;
      if (!target || (target as Node).nodeType !== Node.ELEMENT_NODE) return;
      const targetElement = target as Element;
      if (targetElement.closest("[data-studio-inspector-ui]")) return;
      const candidate =
        targetElement.closest(BLOCK_SELECTOR) ?? targetElement;
      if (candidate === hoveredElement) return;
      hoveredElement = candidate;
      scheduleFrameUpdate();
    };

    // Pointer-down pins before native controls can open or change value.
    // 指针按下时先钉选，避免工具按钮、下拉框或滑杆在检查模式中被触发。
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!target || (target as Node).nodeType !== Node.ELEMENT_NODE) return;
      const targetElement = target as Element;
      if (targetElement.closest("[data-studio-inspector-ui]")) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const candidate =
        targetElement.closest(BLOCK_SELECTOR) ?? targetElement;
      pinnedElement = candidate;
      hoveredElement = null;
      scheduleFrameUpdate();
    };

    // Capture-phase click interception keeps links and tool controls inert.
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!target || (target as Node).nodeType !== Node.ELEMENT_NODE) return;
      if ((target as Element).closest("[data-studio-inspector-ui]")) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const unpin = () => {
      pinnedElement = null;
      scheduleFrameUpdate();
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (isImeKeyEvent(event)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        unpin();
      }
    };

    const hideFrame = () => {
      if (pinnedElement) return;
      hoveredElement = null;
      scheduleFrameUpdate();
    };

    styleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const element = activeElement();
      if (element) void openInspectorStyle(element);
    });
    contentButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const element = activeElement();
      if (element) void openInspectorContent(element);
    });
    parentButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const element = activeElement();
      const parent = element?.parentElement?.closest(BLOCK_SELECTOR);
      if (parent && parent !== frameDocument.body.parentElement) {
        pinnedElement = parent;
        scheduleFrameUpdate();
      }
    });
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unpin();
    });

    frameDocument.addEventListener("pointermove", handlePointerMove, true);
    frameDocument.addEventListener("pointerdown", handlePointerDown, true);
    frameDocument.addEventListener("click", handleClick, true);
    frameDocument.addEventListener("keydown", handleKeydown, true);
    frameDocument.addEventListener("pointerleave", hideFrame);
    frameWindow.addEventListener("scroll", scheduleFrameUpdate, true);
    frameWindow.addEventListener("resize", scheduleFrameUpdate);

    removePreviewInspector = () => {
      frameDocument.removeEventListener("pointermove", handlePointerMove, true);
      frameDocument.removeEventListener("pointerdown", handlePointerDown, true);
      frameDocument.removeEventListener("click", handleClick, true);
      frameDocument.removeEventListener("keydown", handleKeydown, true);
      frameDocument.removeEventListener("pointerleave", hideFrame);
      frameWindow.removeEventListener("scroll", scheduleFrameUpdate, true);
      frameWindow.removeEventListener("resize", scheduleFrameUpdate);
      if (frameRequest) frameWindow.cancelAnimationFrame(frameRequest);
      style.remove();
      frame.remove();
      toolbar.remove();
      removePreviewInspector = () => {};
    };
  };

  const installPreviewVisualEditor = () => {
    removePreviewVisualEditor();
    if (!previewVisualEditorInput.checked) return;

    const frameDocument = previewFrame.contentDocument;
    if (!frameDocument) return;

    const style = frameDocument.createElement("style");
    style.dataset.studioVisualEditorUi = "true";
    style.textContent = `
      [data-studio-visual-hover] {
        outline: 1px dashed #c81e1e !important;
        outline-offset: 3px;
        cursor: text !important;
      }
      [data-studio-visual-selected] {
        outline: 2px solid #c81e1e !important;
        outline-offset: 3px;
      }
      [data-studio-visual-panel] {
        position: fixed;
        z-index: 2147483647;
        right: 0.75rem;
        bottom: 0.75rem;
        left: 0.75rem;
        display: none;
        width: min(38rem, calc(100vw - 1.5rem));
        max-height: min(30rem, calc(100vh - 1.5rem));
        margin-inline: auto;
        gap: 0.4rem;
        overflow: auto;
        border: 1px solid #c81e1e;
        padding: 0.6rem;
        background: #fff;
        color: #111;
        font: 12px/1.35 Arial, sans-serif;
        box-shadow: 0 3px 16px rgb(0 0 0 / 22%);
      }
      [data-studio-visual-panel][data-open="true"] {
        display: grid;
      }
      [data-studio-visual-panel] strong,
      [data-studio-visual-panel] small {
        display: block;
      }
      [data-studio-visual-panel] small {
        color: #666;
      }
      [data-studio-visual-panel] textarea {
        width: 100%;
        min-height: 7rem;
        resize: vertical;
        border: 1px solid #aaa;
        padding: 0.5rem;
        color: #111;
        background: #fff;
        font: 14px/1.4 Georgia, serif;
      }
      [data-studio-visual-toolbar],
      [data-studio-visual-block-actions] {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      [data-studio-visual-toolbar] button,
      [data-studio-visual-block-actions] button {
        min-width: 2rem;
        border: 1px solid #bbb;
        padding: 0.25rem 0.4rem;
        background: #f8f8f8;
        color: #111;
        font: 12px/1.2 Arial, sans-serif;
        cursor: pointer;
      }
      [data-studio-visual-toolbar][hidden],
      [data-studio-visual-block-actions][hidden] {
        display: none !important;
      }
      [data-studio-visual-block-actions] button[data-danger] {
        margin-left: auto;
        color: #a00000;
      }
      [data-studio-visual-actions] {
        display: flex;
        gap: 0.4rem;
        justify-content: flex-end;
      }
      [data-studio-visual-actions] button {
        border: 1px solid #aaa;
        padding: 0.3rem 0.55rem;
        background: #fff;
        color: #111;
        font: inherit;
        cursor: pointer;
      }
      [data-studio-visual-actions] button[data-primary] {
        border-color: #c81e1e;
        color: #c81e1e;
      }
    `;

    const panel = frameDocument.createElement("div");
    panel.dataset.studioVisualPanel = "true";
    panel.dataset.studioInspectorUi = "true";
    const heading = frameDocument.createElement("strong");
    heading.textContent = "Edit text";
    const sourceLabel = frameDocument.createElement("small");
    const formatToolbar = frameDocument.createElement("div");
    formatToolbar.dataset.studioVisualToolbar = "true";
    // 行内排版工具条：对 Markdown 与 Astro 都可用（输出受白名单校验）。
    // Inline typography toolbar: available for Markdown AND Astro
    // (the output passes the inline-HTML whitelist).
    const inlineToolbar = frameDocument.createElement("div");
    inlineToolbar.dataset.studioVisualToolbar = "true";
    const textarea = frameDocument.createElement("textarea");
    textarea.setAttribute("aria-label", "Selected website text");
    const guidance = frameDocument.createElement("small");
    const blockActions = frameDocument.createElement("div");
    blockActions.dataset.studioVisualBlockActions = "true";
    const editBlockButton = frameDocument.createElement("button");
    editBlockButton.type = "button";
    editBlockButton.textContent = "Edit block";
    const addAboveButton = frameDocument.createElement("button");
    addAboveButton.type = "button";
    addAboveButton.textContent = "Add above";
    const addBelowButton = frameDocument.createElement("button");
    addBelowButton.type = "button";
    addBelowButton.textContent = "Add below";
    const deleteBlockButton = frameDocument.createElement("button");
    deleteBlockButton.type = "button";
    deleteBlockButton.dataset.danger = "true";
    deleteBlockButton.textContent = "Delete block";
    blockActions.append(
      editBlockButton,
      addAboveButton,
      addBelowButton,
      deleteBlockButton,
    );
    const actions = frameDocument.createElement("div");
    actions.dataset.studioVisualActions = "true";
    const cancelButton = frameDocument.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    const applyButton = frameDocument.createElement("button");
    applyButton.type = "button";
    applyButton.dataset.primary = "true";
    applyButton.textContent = "Apply";
    actions.append(cancelButton, applyButton);
    panel.append(
      heading,
      sourceLabel,
      formatToolbar,
      inlineToolbar,
      textarea,
      guidance,
      blockActions,
      actions,
    );
    frameDocument.head.append(style);
    frameDocument.body.append(panel);

    let hoveredElement: HTMLElement | null = null;
    let selectedElement: HTMLElement | null = null;
    let originalText = "";
    let originalSourceText = "";
    let selectedIsMarkdown = false;
    let selectedIsAstro = false;
    let canManageBlocks = false;
    let editAction: "replace" | "before" | "after" = "replace";
    let deleteArmed = false;

    const insertAroundSelection = (
      before: string,
      after: string,
      placeholder: string,
    ) => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.slice(start, end) || placeholder;
      textarea.setRangeText(`${before}${selected}${after}`, start, end, "end");
      textarea.focus();
    };

    const setHeadingLevel = (level: number) => {
      const lines = textarea.value.split("\n");
      const first = (lines[0] ?? "").replace(/^#{1,6}\s+/, "");
      lines[0] = level > 0 ? `${"#".repeat(level)} ${first}` : first;
      textarea.value = lines.join("\n");
      textarea.focus();
    };

    const formatCommands = [
      { label: "P", title: "Paragraph", run: () => setHeadingLevel(0) },
      { label: "H1", title: "Heading 1", run: () => setHeadingLevel(1) },
      { label: "H2", title: "Heading 2", run: () => setHeadingLevel(2) },
      { label: "H3", title: "Heading 3", run: () => setHeadingLevel(3) },
      { label: "H4", title: "Heading 4", run: () => setHeadingLevel(4) },
      {
        label: "B",
        title: "Bold",
        run: () => insertAroundSelection("**", "**", "bold text"),
      },
      {
        label: "I",
        title: "Italic",
        run: () => insertAroundSelection("*", "*", "italic text"),
      },
      {
        label: "Code",
        title: "Inline code",
        run: () => insertAroundSelection("`", "`", "code"),
      },
      {
        label: "Ruby",
        title: "Ruby annotation",
        run: () =>
          insertAroundSelection(
            "<ruby>",
            "<rt>reading</rt></ruby>",
            "text",
          ),
      },
      {
        label: "Math",
        title: "Inline LaTeX",
        run: () => insertAroundSelection("$", "$", "formula"),
      },
      {
        label: "Quote",
        title: "Block quote",
        run: () => {
          textarea.value = textarea.value
            .split("\n")
            .map((line) => (line ? `> ${line.replace(/^>\s?/, "")}` : line))
            .join("\n");
          textarea.focus();
        },
      },
      {
        label: "List",
        title: "Bulleted list",
        run: () => {
          textarea.value = textarea.value
            .split("\n")
            .map((line) => (line ? `- ${line.replace(/^[-*]\s+/, "")}` : line))
            .join("\n");
          textarea.focus();
        },
      },
    ];

    formatCommands.forEach((command) => {
      const button = frameDocument.createElement("button");
      button.type = "button";
      button.textContent = command.label;
      button.title = command.title;
      button.setAttribute("aria-label", command.title);
      button.addEventListener("click", command.run);
      formatToolbar.append(button);
    });

    // 行内排版命令：包裹所选文字。Astro 文本用 <em>/<strong>/<span style> 而非 Markdown 星号。
    // Inline typography commands wrap the selection. Astro text uses
    // <em>/<strong>/<span style> rather than Markdown asterisks.
    const inlineCommands = [
      { label: "⟨em⟩", title: "Italic (HTML)", run: () => insertAroundSelection("<em>", "</em>", "text") },
      { label: "⟨strong⟩", title: "Bold (HTML)", run: () => insertAroundSelection("<strong>", "</strong>", "text") },
      {
        label: "Sᴄ",
        title: "Small caps",
        run: () =>
          insertAroundSelection(
            '<span style="font-variant-caps: small-caps">',
            "</span>",
            "text",
          ),
      },
      {
        label: "A…A",
        title: "Letterspaced",
        run: () =>
          insertAroundSelection(
            '<span style="letter-spacing: 0.08em">',
            "</span>",
            "text",
          ),
      },
      {
        label: "中",
        title: "Mark as Chinese (lang attribute, picks CJK fonts)",
        run: () =>
          insertAroundSelection('<span lang="zh-Hant">', "</span>", "文字"),
      },
      {
        label: "x²",
        title: "Superscript",
        run: () => insertAroundSelection("<sup>", "</sup>", "2"),
      },
    ];
    inlineCommands.forEach((command) => {
      const button = frameDocument.createElement("button");
      button.type = "button";
      button.textContent = command.label;
      button.title = command.title;
      button.setAttribute("aria-label", command.title);
      button.addEventListener("click", command.run);
      inlineToolbar.append(button);
    });

    // 进阶排版：自定字距与字号，包裹所选文字。
    // Advanced typography: custom letter-spacing and font-size wraps.
    const spacingInput = frameDocument.createElement("input");
    spacingInput.type = "number";
    spacingInput.step = "0.01";
    spacingInput.value = "0.05";
    spacingInput.title = "Letter-spacing in em";
    spacingInput.style.width = "3.6rem";
    const spacingButton = frameDocument.createElement("button");
    spacingButton.type = "button";
    spacingButton.textContent = "spacing em";
    spacingButton.title = "Wrap selection with this letter-spacing";
    spacingButton.addEventListener("click", () => {
      const value = Number(spacingInput.value);
      if (!Number.isFinite(value)) return;
      insertAroundSelection(
        `<span style="letter-spacing: ${value}em">`,
        "</span>",
        "text",
      );
    });
    const sizeInput = frameDocument.createElement("input");
    sizeInput.type = "number";
    sizeInput.step = "5";
    sizeInput.value = "85";
    sizeInput.title = "Font size as % of surrounding text";
    sizeInput.style.width = "3.6rem";
    const sizeButton = frameDocument.createElement("button");
    sizeButton.type = "button";
    sizeButton.textContent = "size %";
    sizeButton.title = "Wrap selection with this font size";
    sizeButton.addEventListener("click", () => {
      const value = Number(sizeInput.value);
      if (!(value > 0)) return;
      insertAroundSelection(
        `<span style="font-size: ${value}%">`,
        "</span>",
        "text",
      );
    });
    inlineToolbar.append(spacingInput, spacingButton, sizeInput, sizeButton);

    const clearHover = () => {
      hoveredElement?.removeAttribute("data-studio-visual-hover");
      hoveredElement = null;
    };

    const closePanel = () => {
      selectedElement?.removeAttribute("data-studio-visual-selected");
      selectedElement = null;
      originalText = "";
      originalSourceText = "";
      selectedIsMarkdown = false;
      selectedIsAstro = false;
      canManageBlocks = false;
      editAction = "replace";
      deleteArmed = false;
      deleteBlockButton.textContent = "Delete block";
      panel.removeAttribute("data-open");
    };

    const editableElementFor = (target: Element) => {
      const element = target.closest<HTMLElement>(
        "[data-editable-text], p, h1, h2, h3, h4, h5, h6, figcaption, blockquote, dt, dd, li",
      );
      if (!element || element.closest("[data-studio-inspector-ui]")) return null;
      const editable = element.matches("[data-editable-text]")
        ? element
        : element.querySelector<HTMLElement>("[data-editable-text]");
      const targetElement = editable ?? element;
      return targetElement.closest("[data-source-file]") ? targetElement : null;
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!target || (target as Node).nodeType !== Node.ELEMENT_NODE) return;
      const element = editableElementFor(target as Element);
      if (element === hoveredElement) return;
      clearHover();
      if (!element || element === selectedElement) return;
      hoveredElement = element;
      hoveredElement.dataset.studioVisualHover = "true";
    };

    const handleClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!target || (target as Node).nodeType !== Node.ELEMENT_NODE) return;
      const targetElement = target as Element;
      if (targetElement.closest("[data-studio-inspector-ui]")) return;

      const element = editableElementFor(targetElement);
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      clearHover();
      selectedElement?.removeAttribute("data-studio-visual-selected");
      selectedElement = element;
      selectedElement.dataset.studioVisualSelected = "true";
      originalText = (selectedElement.innerText || selectedElement.textContent || "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      const sourcePath =
        selectedElement.closest<HTMLElement>("[data-source-file]")?.dataset
          .sourceFile ?? "Unknown source";
      sourceLabel.textContent = sourcePath;
      selectedIsMarkdown = extensionOf(sourcePath) === ".md";
      selectedIsAstro = extensionOf(sourcePath) === ".astro";
      const selectedIsJson = extensionOf(sourcePath) === ".json";
      canManageBlocks = false;
      originalSourceText = originalText;
      if (selectedIsMarkdown) {
        const context = await visualMarkdownContext(
          selectedElement,
          originalText,
        );
        if (context) {
          originalSourceText = context.sourceText;
          canManageBlocks = context.canManageBlocks;
        }
      }
      if (selectedIsAstro) {
        const path = sourcePath;
        const handle = fileHandles.get(path);
        if (handle) {
          const source =
            currentPath === path
              ? editor.state.doc.toString()
              : await (await handle.getFile()).text();
          const inlineSource = selectedElement.innerHTML.trim();
          const start = inlineSource ? source.indexOf(inlineSource) : -1;
          if (
            start >= 0 &&
            source.indexOf(inlineSource, start + 1) < 0
          ) {
            originalSourceText = inlineSource;
          }
        }
      }
      if (selectedIsJson) {
        const jsonPath = selectedElement.closest<HTMLElement>("[data-json-path]")
          ?.dataset.jsonPath;
        const handle = fileHandles.get(sourcePath);
        if (jsonPath && handle) {
          const source =
            currentPath === sourcePath
              ? editor.state.doc.toString()
              : await (await handle.getFile()).text();
          const data = JSON.parse(source) as Record<string, unknown>;
          let value: unknown = data;
          for (const key of jsonPath.split(".")) {
            if (!value || typeof value !== "object" || Array.isArray(value)) {
              value = undefined;
              break;
            }
            value = (value as Record<string, unknown>)[key];
          }
          if (typeof value === "string") originalSourceText = value;
        }
      }
      editAction = "replace";
      deleteArmed = false;
      deleteBlockButton.textContent = "Delete block";
      heading.textContent = selectedIsMarkdown
        ? "Edit Markdown block"
        : selectedIsAstro
          ? "Edit Astro text"
          : selectedIsJson
            ? "Edit JSON text"
            : "Edit plain text";
      textarea.value = originalSourceText;
      formatToolbar.hidden = !selectedIsMarkdown || !canManageBlocks;
      inlineToolbar.hidden = !selectedIsMarkdown && !selectedIsAstro;
      blockActions.hidden = !selectedIsMarkdown || !canManageBlocks;
      guidance.textContent =
        selectedIsMarkdown && canManageBlocks
          ? "Markdown is supported. Blank lines create separate blocks. Inline HTML styling is allowed."
          : selectedIsAstro
            ? "Inline styling allowed: <em>, <strong>, <span style=…>, ruby, lang marks. Components and { } stay protected."
            : selectedIsJson
              ? "Markdown-style links, emphasis, and paragraph breaks are allowed for registered homepage fields."
            : "Plain text only. Structured markup stays protected.";
      applyButton.textContent = "Apply";
      panel.dataset.open = "true";
      textarea.focus();
      textarea.select();
    };
    const handleDocumentClick = (event: MouseEvent) => {
      void handleClick(event);
    };

    const applyEdit = async () => {
      if (!selectedElement) return;
      applyButton.disabled = true;
      const applied = selectedIsMarkdown
        ? await applyVisualMarkdownBlock(
            selectedElement,
            originalText,
            textarea.value,
            editAction,
          )
        : await applyVisualTextEdit(
            selectedElement,
            selectedIsAstro ? originalSourceText : originalText,
            textarea.value,
          );
      applyButton.disabled = false;
      if (applied) closePanel();
    };

    editBlockButton.addEventListener("click", () => {
      editAction = "replace";
      deleteArmed = false;
      deleteBlockButton.textContent = "Delete block";
      heading.textContent = "Edit Markdown block";
      textarea.value = originalSourceText;
      applyButton.textContent = "Apply";
      textarea.focus();
    });
    addAboveButton.addEventListener("click", () => {
      editAction = "before";
      deleteArmed = false;
      deleteBlockButton.textContent = "Delete block";
      heading.textContent = "Add Markdown block above";
      textarea.value = "";
      applyButton.textContent = "Add";
      textarea.focus();
    });
    addBelowButton.addEventListener("click", () => {
      editAction = "after";
      deleteArmed = false;
      deleteBlockButton.textContent = "Delete block";
      heading.textContent = "Add Markdown block below";
      textarea.value = "";
      applyButton.textContent = "Add";
      textarea.focus();
    });
    deleteBlockButton.addEventListener("click", () => {
      if (!selectedElement) return;
      if (!deleteArmed) {
        deleteArmed = true;
        deleteBlockButton.textContent = "Confirm delete";
        return;
      }
      void (async () => {
        deleteBlockButton.disabled = true;
        const deleted = await applyVisualMarkdownBlock(
          selectedElement,
          originalText,
          "",
          "delete",
        );
        deleteBlockButton.disabled = false;
        if (deleted) closePanel();
      })();
    });
    cancelButton.addEventListener("click", closePanel);
    applyButton.addEventListener("click", () => {
      void applyEdit();
    });
    textarea.addEventListener("keydown", (event) => {
      if (isImeKeyEvent(event)) return;
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void applyEdit();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    });
    frameDocument.addEventListener("pointerover", handlePointerOver, true);
    frameDocument.addEventListener("click", handleDocumentClick, true);
    frameDocument.addEventListener("pointerleave", clearHover);

    removePreviewVisualEditor = () => {
      clearHover();
      closePanel();
      frameDocument.removeEventListener("pointerover", handlePointerOver, true);
      frameDocument.removeEventListener("click", handleDocumentClick, true);
      frameDocument.removeEventListener("pointerleave", clearHover);
      style.remove();
      panel.remove();
      removePreviewVisualEditor = () => {};
    };
  };

  const createTreeNode = (): FileTreeNode => ({
    folders: new Map<string, FileTreeNode>(),
    files: [],
  });

  const buildFileTree = (paths: string[]) => {
    const root = createTreeNode();

    paths.forEach((path) => {
      const parts = path.split("/");
      const fileName = parts.pop();
      if (!fileName) return;

      let node = root;
      parts.forEach((folder) => {
        if (!node.folders.has(folder)) {
          node.folders.set(folder, createTreeNode());
        }
        node = node.folders.get(folder) as FileTreeNode;
      });
      node.files.push(path);
    });

    return root;
  };

  // 目录永远排在文件前面；每一级都按名称排序，便于长期维护。
  // Folders always precede files, and every level is sorted by name.
  const appendTreeNode = (
    parent: HTMLUListElement,
    node: FileTreeNode,
    depth: number,
    expandAll: boolean,
  ) => {
    [...node.folders.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([folderName, folderNode]) => {
        const item = document.createElement("li");
        const details = document.createElement("details");
        details.open = expandAll || depth === 0;
        const summary = document.createElement("summary");
        summary.textContent = folderName;
        const children = document.createElement("ul");
        appendTreeNode(children, folderNode, depth + 1, expandAll);
        details.append(summary, children);
        item.append(details);
        parent.append(item);
      });

    [...node.files]
      .sort((a, b) => {
        const aName = a.split("/").at(-1) ?? a;
        const bName = b.split("/").at(-1) ?? b;
        return aName.localeCompare(bName);
      })
      .forEach((path) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.filePath = path;
        button.title = path;
        button.textContent = path.split("/").at(-1) ?? path;
        button.addEventListener("click", () => {
          void loadFile(path);
        });
        item.append(button);
        parent.append(item);
      });
  };

  const renderFileList = () => {
    const query = fileFilter.value.trim().toLowerCase();
    fileList.replaceChildren();

    const paths = [...fileHandles.keys()].filter((path) =>
      path.toLowerCase().includes(query),
    );
    appendTreeNode(fileList, buildFileTree(paths), 0, Boolean(query));

    if (currentPath) {
      fileList
        .querySelector<HTMLButtonElement>(
          `button[data-file-path="${CSS.escape(currentPath)}"]`,
        )
        ?.setAttribute("aria-current", "true");
    }
  };

  // 打开文件时展开完整目录路径，并把对应文件滚动到文件栏中央。
  // When a file opens, unfold its complete directory path and center it in the Files pane.
  function revealFileInTree(path: string) {
    let button = fileListElement.querySelector<HTMLButtonElement>(
      `button[data-file-path="${CSS.escape(path)}"]`,
    );

    // 筛选可能隐藏检查器定位的文件；清空筛选后重新建立完整目录树。
    // A filter may hide the Inspector target; clear it and rebuild the complete tree.
    if (!button && fileFilterInput.value) {
      fileFilterInput.value = "";
      renderFileList();
      button = fileListElement.querySelector<HTMLButtonElement>(
        `button[data-file-path="${CSS.escape(path)}"]`,
      );
    }

    fileListElement
      .querySelectorAll<HTMLButtonElement>("button[data-file-path]")
      .forEach((fileButton) => {
        fileButton.setAttribute(
          "aria-current",
          String(fileButton === button),
        );
        fileButton.removeAttribute("data-inspector-reveal");
      });

    if (!button) return;

    let parent = button.parentElement;
    while (parent && parent !== fileListElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
      parent = parent.parentElement;
    }

    button.dataset.inspectorReveal = "true";
    button.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(() => {
      button?.removeAttribute("data-inspector-reveal");
    }, 1200);
  }

  const renderSearchResults = (results: SearchResult[]) => {
    searchResults.replaceChildren();

    results.forEach((result) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.title = `${result.path}:${result.line}:${result.column}`;

      const path = document.createElement("span");
      path.className = "search-result-path";
      path.textContent = `${result.path}:${result.line}`;
      const excerpt = document.createElement("span");
      excerpt.className = "search-result-excerpt";
      excerpt.textContent = result.excerpt || "(blank line)";

      button.append(path, excerpt);
      button.addEventListener("click", () => {
        void loadFile(result.path, result.line);
      });
      item.append(button);
      searchResults.append(item);
    });
  };

  const searchOpenFileHandles = async (query: string) => {
    const normalizedQuery = query.toLocaleLowerCase();
    const results: SearchResult[] = [];

    for (const [path, handle] of [...fileHandles.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const lines = (await (await handle.getFile()).text()).split(/\r?\n/);
      for (let index = 0; index < lines.length; index += 1) {
        const column = lines[index].toLocaleLowerCase().indexOf(normalizedQuery);
        if (column < 0) continue;
        results.push({
          path,
          line: index + 1,
          column: column + 1,
          excerpt: lines[index].trim().slice(0, 180),
        });
        if (results.length >= 250) return results;
      }
    }

    return results;
  };

  const runGlobalSearch = async () => {
    const query = globalSearchInput.value.trim();
    searchBlock.hidden = false;
    if (query.length < 2) {
      searchSummary.textContent = "Enter at least two characters.";
      searchResults.replaceChildren();
      return;
    }

    searchSummary.textContent = `Searching for “${query}”…`;
    searchResults.replaceChildren();

    try {
      const response = await fetch(
        `/__admin/api/search?q=${encodeURIComponent(query)}`,
        { headers: authenticatedHeaders() },
      );
      if (!response.ok) throw new Error(await responseError(response));

      const payload = (await response.json()) as {
        results?: SearchResult[];
      };
      const results = Array.isArray(payload.results) ? payload.results : [];
      renderSearchResults(results);
      searchSummary.textContent =
        results.length === 1
          ? "1 result."
          : `${results.length} results${results.length >= 250 ? " (limit reached)" : ""}.`;
    } catch (error) {
      if (fileHandles.size > 0) {
        const results = await searchOpenFileHandles(query);
        renderSearchResults(results);
        searchSummary.textContent =
          results.length === 1
            ? "1 result."
            : `${results.length} results${results.length >= 250 ? " (limit reached)" : ""}.`;
        return;
      }

      searchSummary.textContent =
        error instanceof Error ? error.message : "Search failed.";
    }
  };

  const clearImageUrls = () => {
    // 重新扫描图片前释放旧的临时 URL，避免编辑器长时间开启时占用内存。
    // Revoke old object URLs before rescanning images to prevent memory buildup.
    imageUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  };

  // 软删除：把图片移到 content/_trash/images（不再部署，可恢复）。需要本地开发服务器。
  // Soft delete: move the image to content/_trash/images (no longer deployed, recoverable).
  // Requires the local dev server.
  const trashImage = async (path: string, card: HTMLElement) => {
    if (!apiConnected) {
      setStatus(
        "Deleting images needs the local dev server (npm run dev).",
        "error",
      );
      return;
    }
    const name = path.split("/").at(-1) ?? path;
    if (
      !window.confirm(
        `Move ${name} to content/_trash? Any page that references it will show a broken image until you update it.`,
      )
    ) {
      return;
    }
    const ext = extensionOf(name);
    const base = ext ? name.slice(0, name.length - ext.length) : name;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const to = `content/_trash/images/${base}-${stamp}${ext}`;
    try {
      const response = await fetch("/__admin/api/move", {
        method: "POST",
        headers: authenticatedHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ from: path, to }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      imageHandles.delete(path);
      card.remove();
      setStatus(`Moved ${name} to content/_trash.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not delete the image.",
        "error",
      );
    }
  };

  const createImageCard = async (path: string) => {
    const handle = imageHandles.get(path);
    if (!handle) return null;
    const file = await handle.getFile();
    const objectUrl = URL.createObjectURL(file);
    imageUrls.push(objectUrl);
    const webPath = publicImageUrl(path);

    const card = document.createElement("article");
    card.className = "image-card";
    const image = document.createElement("img");
    image.src = objectUrl;
    image.alt = file.name;
    image.loading = "lazy";
    const code = document.createElement("code");
    code.textContent = webPath;
    code.title = webPath;
    const actions = document.createElement("div");
    actions.className = "image-actions";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy URL";
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(webPath);
      setStatus(`Copied ${webPath}.`);
    });

    const insertButton = document.createElement("button");
    insertButton.type = "button";
    insertButton.textContent = "Insert Markdown";
    insertButton.addEventListener("click", () => {
      if (!currentPath) {
        setStatus("Open a file first, then insert the image.", "error");
        return;
      }
      const selection = editor.state.selection.main;
      const markdownImage = `![Image description](${webPath})`;
      editor.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: markdownImage,
        },
        selection: {
          anchor: selection.from + markdownImage.length,
        },
      });
      editor.focus();
    });

    const trashButton = document.createElement("button");
    trashButton.type = "button";
    trashButton.className = "image-trash";
    trashButton.textContent = "Delete";
    trashButton.addEventListener("click", () => {
      void trashImage(path, card);
    });

    actions.append(copyButton, insertButton, trashButton);
    card.append(image, code, actions);
    return card;
  };

  // 相簿 = 资料夹。打开相簿时才读取该夹的图片，连接项目时不再全量加载。
  // Albums are folders. An album's images load when it is first opened,
  // so connecting the project no longer downloads every image at once.
  const renderImages = () => {
    clearImageUrls();
    imageLibrary.replaceChildren();

    const albums = new Map<string, string[]>();
    for (const path of [...imageHandles.keys()].sort((a, b) =>
      a.localeCompare(b),
    )) {
      const folder = path.split("/").slice(0, -1).join("/") || "(project root)";
      if (!albums.has(folder)) albums.set(folder, []);
      albums.get(folder)?.push(path);
    }

    for (const [folder, paths] of albums) {
      const album = document.createElement("details");
      album.className = "image-album";
      const summary = document.createElement("summary");
      summary.textContent = `${folder} (${paths.length})`;
      const grid = document.createElement("div");
      grid.className = "image-album-grid";
      album.append(summary, grid);
      album.dataset.loaded = "false";
      album.addEventListener("toggle", () => {
        if (!album.open || album.dataset.loaded !== "false") return;
        album.dataset.loaded = "loading";
        void (async () => {
          for (const path of paths) {
            try {
              const card = await createImageCard(path);
              if (card) grid.append(card);
            } catch {
              const error = document.createElement("p");
              error.className = "image-load-error";
              error.textContent = `Could not load ${path}.`;
              grid.append(error);
            }
          }
          album.dataset.loaded = "true";
        })();
      });
      imageLibrary.append(album);
    }

    // 网站正式图片夹默认展开。 The site's main image folder opens by default.
    const mainAlbum = [...imageLibrary.querySelectorAll<HTMLDetailsElement>(".image-album")]
      .find((album) => album.querySelector("summary")?.textContent?.startsWith("public/images"));
    if (mainAlbum) mainAlbum.open = true;
  };

  const publishCheckboxes = () =>
    [...publishFileList.querySelectorAll<HTMLInputElement>("[data-publish-path]")];

  const selectedPublishFiles = () =>
    publishCheckboxes()
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

  const publishStateLabel = (entry: GitStatusEntry) => {
    if (entry.status.includes("R")) return "renamed";
    if (entry.status.includes("D")) return "deleted";
    if (entry.status.includes("A") || entry.status === "??") return "new";
    if (entry.status.includes("M")) return "modified";
    return entry.status.trim() || "changed";
  };

  const updatePublishSubmitState = () => {
    const checkboxes = publishCheckboxes();
    const selectedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
    const allSelected = selectedCount > 0 && selectedCount === checkboxes.length;

    checkboxes.forEach((checkbox) => {
      checkbox.disabled = publishing;
    });
    publishSelectAllButton.textContent = allSelected ? "Clear all" : "Select all";
    publishSelectAllButton.disabled = publishing || checkboxes.length === 0;
    publishRefreshButton.disabled = publishing || !apiConnected;
    publishSubmitButton.disabled =
      publishing ||
      !apiConnected ||
      dirty ||
      selectedCount === 0 ||
      !publishCommitMessage.value.trim();
  };
  refreshPublishState = updatePublishSubmitState;

  const setPublishUnavailable = (message: string) => {
    latestGitSnapshot = null;
    publishFileList.replaceChildren();
    publishSummary.textContent = message;
    publishMessage.textContent = "";
    updatePublishSubmitState();
  };

  const renderGitStatus = (snapshot: GitSnapshot) => {
    latestGitSnapshot = snapshot;
    publishFileList.replaceChildren();

    const branch = snapshot.branch || "detached HEAD";
    const changedCount = snapshot.entries.length;
    const changedText =
      changedCount === 1 ? "1 changed file" : `${changedCount} changed files`;
    const upstreamText = snapshot.upstream
      ? `${snapshot.ahead} ahead, ${snapshot.behind} behind`
      : "no upstream";

    publishSummary.textContent = snapshot.clean
      ? `${branch}: clean (${upstreamText}).`
      : `${branch}: ${changedText} (${upstreamText}).`;

    snapshot.entries
      .slice()
      .sort((a, b) => a.path.localeCompare(b.path))
      .forEach((entry) => {
        const item = document.createElement("li");
        item.className = "publish-file-item";

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = entry.path;
        checkbox.dataset.publishPath = entry.path;
        checkbox.disabled = publishing;

        const path = document.createElement("span");
        path.className = "publish-file-path";
        const displayPath = entry.oldPath
          ? `${entry.oldPath} -> ${entry.path}`
          : entry.path;
        path.textContent = displayPath;
        path.title = displayPath;

        const state = document.createElement("span");
        state.className = "publish-file-state";
        state.textContent = publishStateLabel(entry);

        label.append(checkbox, path, state);
        item.append(label);
        publishFileList.append(item);
      });

    updatePublishSubmitState();
  };

  const refreshGitStatus = async () => {
    if (!apiConnected) {
      setPublishUnavailable("Connect the local project before publishing.");
      return;
    }

    publishMessage.textContent = "";
    publishSummary.textContent = "Reading Git status...";
    updatePublishSubmitState();

    try {
      const response = await fetch("/__admin/api/git/status", {
        headers: authenticatedHeaders({ Accept: "application/json" }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      renderGitStatus((await response.json()) as GitSnapshot);
    } catch (error) {
      setPublishUnavailable("Git status is unavailable.");
      publishMessage.textContent =
        error instanceof Error ? error.message : "Could not read Git status.";
    }
  };

  const publishSelectedChanges = async () => {
    const message = publishCommitMessage.value.trim();
    const files = selectedPublishFiles();

    if (dirty) {
      publishMessage.textContent = "Save the open file before publishing.";
      setStatus("Save the open file before publishing.", "error");
      updatePublishSubmitState();
      return;
    }

    if (!message) {
      publishMessage.textContent = "Write a commit message.";
      publishCommitMessage.focus();
      updatePublishSubmitState();
      return;
    }

    if (files.length === 0) {
      publishMessage.textContent = "Choose at least one changed file.";
      updatePublishSubmitState();
      return;
    }

    const branch = latestGitSnapshot?.branch || "the current branch";
    const fileText = files.length === 1 ? "1 file" : `${files.length} files`;
    const confirmed = window.confirm(`Commit and push ${fileText} to ${branch}?`);
    if (!confirmed) return;

    publishing = true;
    publishMessage.textContent = "Publishing...";
    setStatus("Publishing selected files...");
    updatePublishSubmitState();

    try {
      const response = await fetch("/__admin/api/git/publish", {
        method: "POST",
        headers: authenticatedHeaders({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ message, files }),
      });
      if (!response.ok) throw new Error(await responseError(response));

      const payload = (await response.json()) as {
        branch: string;
        commit: string;
        status?: GitSnapshot;
      };
      publishCommitMessage.value = "";
      publishMessage.textContent = `Pushed ${payload.commit} to ${payload.branch}.`;
      setStatus(`Published ${payload.commit} to ${payload.branch}.`);
      if (payload.status) {
        renderGitStatus(payload.status);
      } else {
        await refreshGitStatus();
      }
    } catch (error) {
      publishMessage.textContent =
        error instanceof Error ? error.message : "Publish failed.";
      setStatus("Publish failed.", "error");
    } finally {
      publishing = false;
      updatePublishSubmitState();
    }
  };

  const connectDevProject = async () => {
    try {
      const response = await fetch("/__admin/api/files", {
        headers: authenticatedHeaders({ Accept: "application/json" }),
      });
      if (!response.ok) return false;

      const project = (await response.json()) as {
        files?: string[];
        images?: string[];
      };
      if (!Array.isArray(project.files) || !Array.isArray(project.images)) {
        return false;
      }

      fileHandles.clear();
      imageHandles.clear();
      apiConnected = true;
      project.files.forEach((path) => {
        fileHandles.set(path, createApiFileHandle(path));
      });
      project.images.forEach((path) => {
        imageHandles.set(path, createApiFileHandle(path));
      });

      openFolderButton.textContent = "Reload project";
      renderFileList();
      await loadTaxonomySettings();
      await refreshLibrary();
      renderImages();
      openThemeCssButton.disabled = !fileHandles.has(GLOBAL_CSS_PATH);
      await loadMotionSettings();
      await loadTypographySettings();
      await loadDesignSettings();
      await loadSiteDefaults();
      newSubmitButton.disabled = false;
      newMessage.textContent = "";
      setStatus(
        `Connected: ${fileHandles.size} editable files and ${imageHandles.size} images.`,
      );
      void refreshGitStatus();
      return true;
    } catch {
      apiConnected = false;
      newSubmitButton.disabled = true;
      setPublishUnavailable("Local Git publishing requires the development server.");
      return false;
    }
  };

  const scanDirectory = async (
    directory: ProjectDirectoryHandle,
    parentPath = "",
  ) => {
    for await (const [name, handle] of directory.entries()) {
      const path = parentPath ? `${parentPath}/${name}` : name;

      if (isIgnoredEntry(name)) continue;

      if (handle.kind === "directory") {
        if (!ignoredDirectories.has(name)) {
          await scanDirectory(handle, path);
        }
        continue;
      }

      const extension = extensionOf(path);
      if (editableExtensions.has(extension)) fileHandles.set(path, handle);
      if (imageExtensions.has(extension)) imageHandles.set(path, handle);
    }
  };

  const openProjectFolder = async () => {
    if (dirty) {
      const proceed = window.confirm(
        `Discard unsaved changes to ${currentPath || "the open document"}?`,
      );
      if (!proceed) return;
      clearCurrentDocument("Project reloaded. Select a file.");
    }
    if (libraryHasUnsavedChanges()) {
      if (!confirmLibraryDiscard()) return;
      selectedLibraryPath = "";
      libraryForm.hidden = true;
      libraryFormSnapshot = "";
    }

    if (await connectDevProject()) {
      await restoreCurrentFile();
      return;
    }

    if (!window.showDirectoryPicker) {
      setStatus(
        "Start the site with npm run dev. Folder access is also available in Chrome or Edge.",
        "error",
      );
      return;
    }

    try {
      const directory = await window.showDirectoryPicker({ mode: "readwrite" });
      clearCurrentDocument(`Opened ${directory.name}. Select a file.`);
      selectedLibraryPath = "";
      libraryForm.hidden = true;
      libraryFormSnapshot = "";
      fileHandles.clear();
      imageHandles.clear();
      apiConnected = false;
      setStatus("Reading project files…");
      await scanDirectory(directory);
      renderFileList();
      await loadTaxonomySettings();
      await refreshLibrary();
      renderImages();
      openThemeCssButton.disabled = !fileHandles.has(GLOBAL_CSS_PATH);
      await loadMotionSettings();
      await loadTypographySettings();
      await loadDesignSettings();
      await loadSiteDefaults();
      await restoreCurrentFile();
      newSubmitButton.disabled = true;
      newMessage.textContent =
        "Add Page requires the local development server connection.";
      setPublishUnavailable("Local Git publishing requires the development server.");
      setStatus(
        `Opened ${directory.name}: ${fileHandles.size} editable files and ${imageHandles.size} images.`,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Folder selection cancelled.");
        return;
      }
      setStatus(
        error instanceof Error ? error.message : "Unable to open the folder.",
        "error",
      );
    }
  };

  const setUploadMessage = (
    text: string,
    kind: "normal" | "error" = "normal",
  ) => {
    if (imageUploadMessage) {
      imageUploadMessage.textContent = text;
      imageUploadMessage.dataset.kind = kind;
    }
    setStatus(text, kind);
  };

  // 上传图片：逐个二进制 PUT 到 /__admin/api/image，重名自动加序号，仅限 public/images。
  // Upload images: binary PUT each to /__admin/api/image, auto-suffix on name clash, public/images only.
  const uploadImages = async (files: FileList) => {
    if (!apiConnected) {
      setUploadMessage(
        "Adding images needs the local dev server (npm run dev).",
        "error",
      );
      return;
    }
    const folder = (imageFolderInput?.value ?? "public/images")
      .trim()
      .replaceAll("\\", "/")
      .replace(/^\/+|\/+$/g, "");
    if (folder !== "public/images" && !folder.startsWith("public/images/")) {
      setUploadMessage(
        "Folder must be public/images or a subfolder of it.",
        "error",
      );
      return;
    }
    let added = 0;
    for (const file of Array.from(files)) {
      const ext = extensionOf(file.name);
      if (!imageExtensions.has(ext)) {
        setUploadMessage(`Skipped ${file.name}: not a supported image.`, "error");
        continue;
      }
      let target = `${folder}/${file.name}`;
      if (imageHandles.has(target)) {
        const base = file.name.slice(0, file.name.length - ext.length);
        let n = 1;
        while (imageHandles.has(`${folder}/${base}-${n}${ext}`)) n += 1;
        target = `${folder}/${base}-${n}${ext}`;
      }
      try {
        const response = await fetch(
          `/__admin/api/image?path=${encodeURIComponent(target)}`,
          {
            method: "PUT",
            headers: authenticatedHeaders({
              "Content-Type": file.type || "application/octet-stream",
            }),
            body: file,
          },
        );
        if (!response.ok) throw new Error(await responseError(response));
        imageHandles.set(target, createApiFileHandle(target));
        added += 1;
      } catch (error) {
        setUploadMessage(
          error instanceof Error ? error.message : `Could not add ${file.name}.`,
          "error",
        );
      }
    }
    if (added > 0) {
      renderImages();
      setUploadMessage(
        `Added ${added} image${added === 1 ? "" : "s"} to ${folder}.`,
      );
    }
  };

  imageAddButton?.addEventListener("click", () => {
    if (!apiConnected) {
      setUploadMessage(
        "Adding images needs the local dev server (npm run dev).",
        "error",
      );
      return;
    }
    imageInput?.click();
  });
  imageInput?.addEventListener("change", () => {
    if (imageInput.files && imageInput.files.length > 0) {
      void uploadImages(imageInput.files);
    }
    imageInput.value = "";
  });

  openFolderButton.addEventListener("click", () => {
    void openProjectFolder();
  });
  saveButton.addEventListener("click", () => {
    void saveCurrentFile();
  });
  fileFilter.addEventListener("input", renderFileList);
  lineWrapInput.addEventListener("change", () => {
    localStorage.setItem(
      LINE_WRAP_STORAGE_KEY,
      String(lineWrapInput.checked),
    );
    editor.dispatch({
      effects: lineWrapCompartment.reconfigure(
        lineWrapInput.checked ? EditorView.lineWrapping : [],
      ),
    });
  });
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void runGlobalSearch();
  });
  searchClearButton.addEventListener("click", () => {
    globalSearchInput.value = "";
    searchSummary.textContent = "";
    searchResults.replaceChildren();
    searchBlock.hidden = true;
    globalSearchInput.focus();
  });
  publishRefreshButton.addEventListener("click", () => {
    void refreshGitStatus();
  });
  publishSelectAllButton.addEventListener("click", () => {
    const checkboxes = publishCheckboxes();
    const allSelected =
      checkboxes.length > 0 && checkboxes.every((checkbox) => checkbox.checked);
    checkboxes.forEach((checkbox) => {
      checkbox.checked = !allSelected;
    });
    updatePublishSubmitState();
  });
  publishFileList.addEventListener("change", () => {
    updatePublishSubmitState();
  });
  publishCommitMessage.addEventListener("input", () => {
    updatePublishSubmitState();
  });
  publishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void publishSelectedChanges();
  });
  loadPreviewButton.addEventListener("click", () => {
    refreshPreview(previewPath.value);
  });
  refreshPreviewButton.addEventListener("click", () => {
    refreshPreview(previewFramePath());
  });
  previewInspectorInput.addEventListener("change", () => {
    if (previewInspectorInput.checked) {
      previewVisualEditorInput.checked = false;
      removePreviewVisualEditor();
    }
    sessionStorage.setItem(
      PREVIEW_MODE_SESSION_KEY,
      previewInspectorInput.checked ? "inspect" : "",
    );
    installPreviewInspector();
  });
  previewVisualEditorInput.addEventListener("change", () => {
    if (previewVisualEditorInput.checked) {
      previewInspectorInput.checked = false;
      removePreviewInspector();
      setStatus("Visual text mode: click a text block in the preview.");
    }
    sessionStorage.setItem(
      PREVIEW_MODE_SESSION_KEY,
      previewVisualEditorInput.checked ? "visual" : "",
    );
    installPreviewVisualEditor();
  });
  previewFrame.addEventListener("load", () => {
    syncPreviewPath(previewFramePath());
    applyTypographyPreview(Number(cjkLetterSpacingInput.value));
    installPreviewInspector();
    installPreviewVisualEditor();
  });
  previewPath.addEventListener("keydown", (event) => {
    if (isImeKeyEvent(event)) return;
    if (event.key === "Enter") refreshPreview(previewPath.value);
  });
  previewPath.addEventListener("input", () => {
    const path = previewPath.value.trim() || "/";
    openPreviewLink.href = path;
    sessionStorage.setItem(PREVIEW_PATH_SESSION_KEY, path);
  });
  openThemeCssButton.addEventListener("click", () => {
    void loadFile(GLOBAL_CSS_PATH);
  });
  motionSettingInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.motionSetting as MotionSetting;
      void saveMotionSetting(key, input.checked);
    });
  });
  cjkLetterSpacingInput.addEventListener("input", () => {
    const value = Number(cjkLetterSpacingInput.value);
    cjkLetterSpacingOutput.value = `${value.toFixed(3)}em`;
    applyTypographyPreview(value);
  });
  cjkLetterSpacingInput.addEventListener("change", () => {
    void saveTypographySettings(Number(cjkLetterSpacingInput.value));
  });
  studio
    .querySelectorAll<HTMLButtonElement>("[data-preview-size]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const size = button.dataset.previewSize ?? "desktop";
        previewStage.dataset.previewStage = size;
        sessionStorage.setItem(PREVIEW_SIZE_SESSION_KEY, size);
        studio
          .querySelectorAll<HTMLButtonElement>("[data-preview-size]")
          .forEach((sizeButton) => {
            sizeButton.setAttribute(
              "aria-pressed",
              String(sizeButton === button),
            );
          });
      });
    });

  studio
    .querySelectorAll<HTMLButtonElement>("[data-pane-toggle]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const pane = button.dataset.paneToggle as PaneName;
        const collapsed = paneLayout.collapsed.includes(pane);
        paneLayout.collapsed = collapsed
          ? paneLayout.collapsed.filter((item) => item !== pane)
          : [...paneLayout.collapsed, pane];
        applyPaneLayout();
        storePaneLayout();
      });
    });

  studio
    .querySelectorAll<HTMLElement>("[data-pane-resizer]")
    .forEach((resizer) => {
      const resize = (clientX: number) => {
        const bounds = studioWorkspace.getBoundingClientRect();
        const pane = resizer.dataset.paneResizer;
        if (pane === "sidebar") {
          const maxSidebar = Math.max(150, bounds.width - 520);
          paneLayout.sidebarWidth = Math.round(
            Math.min(Math.max(clientX - bounds.left, 150), maxSidebar),
          );
        }
        if (pane === "editor") {
          const sidebarWidth = paneLayout.collapsed.includes("sidebar")
            ? 42
            : paneLayout.sidebarWidth;
          const maxEditor = Math.max(
            260,
            bounds.width - sidebarWidth - 270,
          );
          paneLayout.editorWidth = Math.round(
            Math.min(
              Math.max(clientX - bounds.left - sidebarWidth - 6, 260),
              maxEditor,
            ),
          );
        }
        applyPaneLayout();
      };

      resizer.addEventListener("pointerdown", (event) => {
        const pane = resizer.dataset.paneResizer as PaneName;
        paneLayout.collapsed = paneLayout.collapsed.filter(
          (item) => item !== pane,
        );
        resizer.dataset.dragging = "true";
        resizer.setPointerCapture(event.pointerId);
        resize(event.clientX);
      });
      resizer.addEventListener("pointermove", (event) => {
        if (resizer.dataset.dragging !== "true") return;
        resize(event.clientX);
      });
      resizer.addEventListener("pointerup", (event) => {
        if (resizer.dataset.dragging !== "true") return;
        delete resizer.dataset.dragging;
        resizer.releasePointerCapture(event.pointerId);
        storePaneLayout();
      });
      resizer.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        if (resizer.dataset.paneResizer === "sidebar") {
          const maxSidebar = Math.max(
            150,
            studioWorkspace.getBoundingClientRect().width - 520,
          );
          paneLayout.sidebarWidth = Math.max(
            150,
            Math.min(maxSidebar, paneLayout.sidebarWidth + direction * 16),
          );
        } else {
          const sidebarWidth = paneLayout.collapsed.includes("sidebar")
            ? 42
            : paneLayout.sidebarWidth;
          const maxEditor = Math.max(
            260,
            studioWorkspace.getBoundingClientRect().width - sidebarWidth - 270,
          );
          paneLayout.editorWidth = Math.max(
            260,
            Math.min(maxEditor, paneLayout.editorWidth + direction * 16),
          );
        }
        applyPaneLayout();
        storePaneLayout();
      });
    });

  window.addEventListener("resize", () => {
    applyPaneLayout();
    storePaneLayout();
  });

  const selectSidebarTab = (selected: string) => {
    studio
      .querySelectorAll<HTMLButtonElement>("[data-sidebar-tab]")
      .forEach((tabButton) => {
        const isSelected = tabButton.dataset.sidebarTab === selected;
        tabButton.setAttribute(
          "aria-selected",
          String(isSelected),
        );
        tabButton.tabIndex = isSelected ? 0 : -1;
      });
    studio
      .querySelectorAll<HTMLElement>("[data-sidebar-panel]")
      .forEach((panel) => {
        panel.hidden = panel.dataset.sidebarPanel !== selected;
      });
    if (selected === "publish") {
      void refreshGitStatus();
    }
  };

  const sidebarTabs = [
    ...studio.querySelectorAll<HTMLButtonElement>("[data-sidebar-tab]"),
  ];
  sidebarTabs.forEach((tabButton, index) => {
    const name = tabButton.dataset.sidebarTab ?? `tab-${index}`;
    const panel = studio.querySelector<HTMLElement>(
      `[data-sidebar-panel="${CSS.escape(name)}"]`,
    );
    tabButton.id = `studio-tab-${name}`;
    tabButton.setAttribute("aria-controls", `studio-panel-${name}`);
    tabButton.tabIndex = tabButton.getAttribute("aria-selected") === "true" ? 0 : -1;
    if (panel) {
      panel.id = `studio-panel-${name}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabButton.id);
    }
    tabButton.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? sidebarTabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + sidebarTabs.length) %
              sidebarTabs.length;
      const nextTab = sidebarTabs[nextIndex];
      nextTab.focus();
      selectSidebarTab(nextTab.dataset.sidebarTab ?? "files");
    });
  });
  selectSidebarTab(
    sidebarTabs.find((tab) => tab.getAttribute("aria-selected") === "true")
      ?.dataset.sidebarTab ?? "files",
  );

  studio
    .querySelectorAll<HTMLButtonElement>("[data-sidebar-tab]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectSidebarTab(button.dataset.sidebarTab ?? "files");
      });
    });

  // 与常见代码编辑器一致：Ctrl/Cmd + Shift + F 打开全局查找。
  // Match common editors: Ctrl/Cmd + Shift + F opens project-wide Find.
  window.addEventListener("keydown", (event) => {
    if (isImeKeyEvent(event)) return;
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "F") {
      event.preventDefault();
      selectSidebarTab("files");
      globalSearchInput.focus();
      globalSearchInput.select();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
  });

  const connected = await connectDevProject();
  if (connected) await restoreCurrentFile();
  refreshPreview(storedPreviewPath);
  if (!connected) {
    setStatus(
      window.showDirectoryPicker
        ? "Local server connection unavailable. Choose the project folder."
        : "Run npm run dev to connect this editor to the project.",
      "error",
    );
  }
}
