/**
 * 中文：本文件驱动本地 Website Studio，包括解锁、文件树、编辑器、搜索与预览。
 * English: Drives the local Website Studio: unlocking, files, editing, search, and preview.
 *
 * Caveat / 注意：这里的文件 API 只应连接 astro.config.mjs 中的本地开发中间件；
 * it must never be treated as production authentication or a public CMS backend.
 */
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

interface FileTreeNode {
  folders: Map<string, FileTreeNode>;
  files: string[];
}

const ADMIN_PASSCODE = "0592";
const PASSCODE_SESSION_KEY = "yixin-cui-studio-passcode";
const LINE_WRAP_STORAGE_KEY = "yixin-cui-studio-line-wrap";
const PREVIEW_PATH_SESSION_KEY = "yixin-cui-studio-preview-path";
const PREVIEW_MODE_SESSION_KEY = "yixin-cui-studio-preview-mode";
const PREVIEW_SIZE_SESSION_KEY = "yixin-cui-studio-preview-size";
const PANE_LAYOUT_STORAGE_KEY = "yixin-cui-studio-pane-layout";
const GLOBAL_CSS_PATH = "src/styles/global.css";
const MOTION_SETTINGS_PATH = "src/config/motion.json";
const TYPOGRAPHY_SETTINGS_PATH = "src/config/typography.json";

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
  ".git",
  ".npm-cache",
  "dist",
  "node_modules",
]);

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
  const gate = document.querySelector<HTMLElement>("[data-admin-gate]");
  if (!studio) return;

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const workspace = studio.querySelector<HTMLElement>(".studio-workspace");
  const toolbar = studio.querySelector<HTMLElement>(".studio-toolbar");
  const localOnly = studio.querySelector<HTMLElement>("[data-local-only]");

  if (!isLocal) {
    if (gate) gate.hidden = true;
    studio.hidden = false;
    if (workspace) workspace.hidden = true;
    if (toolbar) toolbar.hidden = true;
    if (localOnly) localOnly.hidden = false;
    return;
  }

  // 口令保存在 sessionStorage：关闭当前标签页后需要重新输入。
  // The passcode lives in sessionStorage, so a new tab or session must unlock again.
  const unlockStudio = async () => {
    const savedPasscode = sessionStorage.getItem(PASSCODE_SESSION_KEY);
    if (savedPasscode === ADMIN_PASSCODE) return savedPasscode;

    const form = gate?.querySelector<HTMLFormElement>("[data-passcode-form]");
    const input = gate?.querySelector<HTMLInputElement>("[data-passcode-input]");
    const message =
      gate?.querySelector<HTMLElement>("[data-passcode-message]");
    if (!gate || !form || !input || !message) return "";

    return new Promise<string>((resolve) => {
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();
          if (input.value !== ADMIN_PASSCODE) {
            message.textContent = "Incorrect passcode.";
            message.dataset.kind = "error";
            input.select();
            return;
          }

          sessionStorage.setItem(PASSCODE_SESSION_KEY, input.value);
          message.textContent = "";
          resolve(input.value);
        },
        { once: false },
      );
    });
  };

  const activePasscode = await unlockStudio();
  if (!activePasscode) return;
  if (gate) gate.hidden = true;
  studio.hidden = false;

  const [
    { basicSetup },
    { defaultKeymap, historyKeymap, indentWithTab },
    { css },
    { html },
    { javascript },
    { json },
    { markdown },
    { HighlightStyle, syntaxHighlighting },
    { tags },
    { Compartment, EditorState, Prec },
    { EditorView, keymap },
  ] = await Promise.all([
    import("codemirror"),
    import("@codemirror/commands"),
    import("@codemirror/lang-css"),
    import("@codemirror/lang-html"),
    import("@codemirror/lang-javascript"),
    import("@codemirror/lang-json"),
    import("@codemirror/lang-markdown"),
    import("@codemirror/language"),
    import("@lezer/highlight"),
    import("@codemirror/state"),
    import("@codemirror/view"),
  ]);

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
  const lockStudioButton =
    studio.querySelector<HTMLButtonElement>("[data-lock-studio]");
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
    !lockStudioButton ||
    !searchForm ||
    !globalSearchInput ||
    !searchSummary ||
    !searchResults ||
    !previewStage ||
    !lineWrapInput ||
    !previewInspectorInput ||
    !previewVisualEditorInput ||
    !studioWorkspace
  ) {
    return;
  }

  // 后续嵌套函数使用稳定的非空引用，避免 TypeScript 丢失上方的 DOM 检查结果。
  // Stable non-null references preserve the DOM checks inside later nested helpers.
  const fileListElement = fileList;
  const fileFilterInput = fileFilter;

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

  const applyPaneLayout = () => {
    studioWorkspace.style.setProperty(
      "--studio-sidebar-width",
      `${paneLayout.sidebarWidth}px`,
    );
    studioWorkspace.style.setProperty(
      "--studio-editor-width",
      `${paneLayout.editorWidth}px`,
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
  let saveTimer: number | undefined;
  let previewTimer: number | undefined;

  const setStatus = (message: string, kind: "normal" | "error" = "normal") => {
    status.textContent = message;
    status.dataset.kind = kind;
  };

  const setDirty = (nextDirty: boolean) => {
    dirty = nextDirty;
    dirtyLabel.textContent = dirty ? "Unsaved changes" : "";
    saveButton.disabled = !currentPath || !dirty;
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

  const refreshPreview = () => {
    const path = previewPath.value.trim() || "/";
    sessionStorage.setItem(PREVIEW_PATH_SESSION_KEY, path);
    const url = new URL(path, window.location.origin);
    url.searchParams.set("_studio", Date.now().toString());
    previewFrame.src = url.toString();
    openPreviewLink.href = path;
  };

  const schedulePreviewRefresh = () => {
    if (!autoRefreshInput.checked) return;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(refreshPreview, 800);
  };

  const saveCurrentFile = async () => {
    if (!currentPath || !dirty) return;
    const handle = fileHandles.get(currentPath);
    if (!handle) return;

    try {
      setStatus(`Saving ${currentPath}…`);
      const writable = await handle.createWritable();
      await writable.write(editor.state.doc.toString());
      await writable.close();
      if (currentPath === MOTION_SETTINGS_PATH) {
        syncMotionControls(parseMotionSettings(editor.state.doc.toString()));
      }
      if (currentPath === TYPOGRAPHY_SETTINGS_PATH) {
        syncTypographyControls(
          parseTypographySettings(editor.state.doc.toString()),
        );
      }
      setDirty(false);
      setStatus(`Saved ${currentPath}.`);
      schedulePreviewRefresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save the file.",
        "error",
      );
    }
  };

  // Compartment 允许在不重建编辑器、不丢失光标的情况下切换自动换行。
  // A Compartment toggles line wrapping without rebuilding the editor or losing its cursor.
  const lineWrapCompartment = new Compartment();
  const storedLineWrap = localStorage.getItem(LINE_WRAP_STORAGE_KEY) === "true";
  lineWrapInput.checked = storedLineWrap;

  const editor = new EditorView({
    parent: editorHost,
    state: EditorState.create({
      doc: "Connect the project, then select a file.",
      extensions: [
        basicSetup,
        languageCompartment.of([]),
        syntaxHighlighting(studioHighlightStyle),
        lineWrapCompartment.of(storedLineWrap ? EditorView.lineWrapping : []),
        Prec.high(
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
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

  const loadFile = async (path: string, targetLine?: number) => {
    if (dirty) {
      const proceed = window.confirm(
        `Discard unsaved changes to ${currentPath}?`,
      );
      if (!proceed) return;
    }

    const handle = fileHandles.get(path);
    if (!handle) return;

    try {
      const file = await handle.getFile();
      const text = await file.text();
      loadingDocument = true;
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: text,
        },
        effects: languageCompartment.reconfigure(languageFor(path)),
      });
      currentPath = path;
      currentFileLabel.textContent = path;
      setDirty(false);
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
    const visibleText = normalizedSourceText(element.textContent ?? "");
    const searchPhrases = [
      visibleText.slice(0, 90),
      visibleText.split(" ").slice(0, 7).join(" "),
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
    const path =
      element.ownerDocument.body.dataset.styleSource ?? GLOBAL_CSS_PATH;
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
    const sourceElement = element.closest<HTMLElement>("[data-source-file]");
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
    const sourceElement = element.closest<HTMLElement>("[data-source-file]");
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

  const applyVisualTextEdit = async (
    element: Element,
    oldText: string,
    newText: string,
  ) => {
    const sourceElement = element.closest<HTMLElement>("[data-source-file]");
    const path = sourceElement?.dataset.sourceFile;
    const handle = path ? fileHandles.get(path) : undefined;
    if (!path || !handle) {
      setStatus("This text block has no registered source file.", "error");
      return false;
    }

    const extension = extensionOf(path);
    if (extension !== ".md" && extension !== ".astro") {
      setStatus("Visual text editing supports Markdown and Astro pages.", "error");
      return false;
    }

    if (extension === ".astro" && /[<>{}]/.test(newText)) {
      setStatus(
        "Astro visual edits cannot contain <, >, {, or }. Use Content for code.",
        "error",
      );
      return false;
    }

    try {
      const source =
        currentPath === path
          ? editor.state.doc.toString()
          : await (await handle.getFile()).text();
      const range = await findVisualTextRange(path, source, oldText, element);
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
        background: rgb(200 30 30 / 7%);
        pointer-events: none;
      }
      [data-studio-inspector-toolbar] {
        position: fixed;
        z-index: 2147483646;
        display: none;
        gap: 0.25rem;
        align-items: center;
        max-width: min(30rem, calc(100vw - 1rem));
        padding: 0.25rem;
        border: 1px solid #c81e1e;
        background: #fff;
        color: #111;
        font: 12px/1.2 Arial, sans-serif;
        box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
      }
      [data-studio-inspector-toolbar] span {
        overflow: hidden;
        max-width: 13rem;
        padding-inline: 0.25rem;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      }
    `;

    const frame = frameDocument.createElement("div");
    frame.dataset.studioInspectorFrame = "true";
    frame.dataset.studioInspectorUi = "true";
    const toolbar = frameDocument.createElement("div");
    toolbar.dataset.studioInspectorToolbar = "true";
    toolbar.dataset.studioInspectorUi = "true";
    const label = frameDocument.createElement("span");
    const styleButton = frameDocument.createElement("button");
    styleButton.type = "button";
    styleButton.textContent = "Style";
    const contentButton = frameDocument.createElement("button");
    contentButton.type = "button";
    contentButton.textContent = "Content";
    toolbar.append(label, styleButton, contentButton);
    frameDocument.head.append(style);
    frameDocument.body.append(frame, toolbar);

    let inspectedElement: Element | null = null;

    const updateFrame = () => {
      if (!inspectedElement || !inspectedElement.isConnected) return;
      const rect = inspectedElement.getBoundingClientRect();
      frame.style.display = "block";
      frame.style.left = `${rect.left}px`;
      frame.style.top = `${rect.top}px`;
      frame.style.width = `${rect.width}px`;
      frame.style.height = `${rect.height}px`;

      const toolbarTop =
        rect.top >= 34 ? Math.max(4, rect.top - 31) : Math.min(rect.bottom + 4, frameWindow.innerHeight - 32);
      toolbar.style.display = "flex";
      toolbar.style.left = `${Math.max(4, Math.min(rect.left, frameWindow.innerWidth - 310))}px`;
      toolbar.style.top = `${toolbarTop}px`;
      label.textContent = [
        inspectedElement.tagName.toLocaleLowerCase(),
        ...inspectedElement.classList,
      ].join(".");
    };

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target;
      if (!target || (target as Node).nodeType !== Node.ELEMENT_NODE) return;
      const targetElement = target as Element;
      if (targetElement.closest("[data-studio-inspector-ui]")) return;

      inspectedElement =
        targetElement.closest(
          "p, h1, h2, h3, h4, blockquote, figure, li, dl, nav, section, article, header, footer, main, div",
        ) ?? targetElement;
      updateFrame();
    };

    const hideFrame = () => {
      frame.style.display = "none";
      toolbar.style.display = "none";
    };

    styleButton.addEventListener("click", () => {
      if (inspectedElement) void openInspectorStyle(inspectedElement);
    });
    contentButton.addEventListener("click", () => {
      if (inspectedElement) void openInspectorContent(inspectedElement);
    });
    frameDocument.addEventListener("pointermove", handlePointerMove, true);
    frameDocument.addEventListener("pointerleave", hideFrame);
    frameWindow.addEventListener("scroll", updateFrame, true);
    frameWindow.addEventListener("resize", updateFrame);

    removePreviewInspector = () => {
      frameDocument.removeEventListener("pointermove", handlePointerMove, true);
      frameDocument.removeEventListener("pointerleave", hideFrame);
      frameWindow.removeEventListener("scroll", updateFrame, true);
      frameWindow.removeEventListener("resize", updateFrame);
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
      canManageBlocks = false;
      editAction = "replace";
      deleteArmed = false;
      deleteBlockButton.textContent = "Delete block";
      panel.removeAttribute("data-open");
    };

    const editableElementFor = (target: Element) => {
      const element = target.closest<HTMLElement>(
        "p, h1, h2, h3, h4, h5, h6, figcaption, blockquote, dt, dd, li",
      );
      if (!element || element.closest("[data-studio-inspector-ui]")) return null;
      return element.closest("[data-source-file]") ? element : null;
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
      editAction = "replace";
      deleteArmed = false;
      deleteBlockButton.textContent = "Delete block";
      heading.textContent = selectedIsMarkdown
        ? "Edit Markdown block"
        : "Edit plain text";
      textarea.value = originalSourceText;
      formatToolbar.hidden = !selectedIsMarkdown || !canManageBlocks;
      blockActions.hidden = !selectedIsMarkdown || !canManageBlocks;
      guidance.textContent =
        selectedIsMarkdown && canManageBlocks
          ? "Markdown is supported. Blank lines create separate blocks."
          : "Plain text only. Structured Astro markup stays protected.";
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
            originalText,
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

  const renderImages = async () => {
    clearImageUrls();
    imageLibrary.replaceChildren();

    for (const [path, handle] of [...imageHandles.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const file = await handle.getFile();
      const objectUrl = URL.createObjectURL(file);
      imageUrls.push(objectUrl);
      const webPath = publicImageUrl(path);

      const card = document.createElement("article");
      card.className = "image-card";
      const image = document.createElement("img");
      image.src = objectUrl;
      image.alt = file.name;
      const code = document.createElement("code");
      code.textContent = webPath;
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
      insertButton.disabled = !currentPath;
      insertButton.addEventListener("click", () => {
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

      actions.append(copyButton, insertButton);
      card.append(image, code, actions);
      imageLibrary.append(card);
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
      project.files.forEach((path) => {
        fileHandles.set(path, createApiFileHandle(path));
      });
      project.images.forEach((path) => {
        imageHandles.set(path, createApiFileHandle(path));
      });

      openFolderButton.textContent = "Reload project";
      renderFileList();
      await renderImages();
      openThemeCssButton.disabled = !fileHandles.has(GLOBAL_CSS_PATH);
      await loadMotionSettings();
      await loadTypographySettings();
      setStatus(
        `Connected: ${fileHandles.size} editable files and ${imageHandles.size} images.`,
      );
      return true;
    } catch {
      return false;
    }
  };

  const scanDirectory = async (
    directory: ProjectDirectoryHandle,
    parentPath = "",
  ) => {
    for await (const [name, handle] of directory.entries()) {
      const path = parentPath ? `${parentPath}/${name}` : name;

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
    if (await connectDevProject()) return;

    if (!window.showDirectoryPicker) {
      setStatus(
        "Start the site with npm run dev. Folder access is also available in Chrome or Edge.",
        "error",
      );
      return;
    }

    try {
      const directory = await window.showDirectoryPicker({ mode: "readwrite" });
      fileHandles.clear();
      imageHandles.clear();
      setStatus("Reading project files…");
      await scanDirectory(directory);
      renderFileList();
      await renderImages();
      openThemeCssButton.disabled = !fileHandles.has(GLOBAL_CSS_PATH);
      await loadMotionSettings();
      await loadTypographySettings();
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
  loadPreviewButton.addEventListener("click", refreshPreview);
  refreshPreviewButton.addEventListener("click", refreshPreview);
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
    applyTypographyPreview(Number(cjkLetterSpacingInput.value));
    installPreviewInspector();
    installPreviewVisualEditor();
  });
  previewPath.addEventListener("keydown", (event) => {
    if (event.key === "Enter") refreshPreview();
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
  lockStudioButton.addEventListener("click", () => {
    if (
      dirty &&
      !window.confirm("Lock the Studio and discard unsaved editor changes?")
    ) {
      return;
    }
    setDirty(false);
    sessionStorage.removeItem(PASSCODE_SESSION_KEY);
    window.location.reload();
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
          paneLayout.sidebarWidth = Math.round(
            Math.min(Math.max(clientX - bounds.left, 150), bounds.width - 520),
          );
        }
        if (pane === "editor") {
          const sidebarWidth = paneLayout.collapsed.includes("sidebar")
            ? 42
            : paneLayout.sidebarWidth;
          paneLayout.editorWidth = Math.round(
            Math.min(
              Math.max(clientX - bounds.left - sidebarWidth - 6, 260),
              bounds.width - sidebarWidth - 270,
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
          paneLayout.sidebarWidth = Math.max(
            150,
            paneLayout.sidebarWidth + direction * 16,
          );
        } else {
          paneLayout.editorWidth = Math.max(
            260,
            paneLayout.editorWidth + direction * 16,
          );
        }
        applyPaneLayout();
        storePaneLayout();
      });
    });

  const selectSidebarTab = (selected: string) => {
    studio
      .querySelectorAll<HTMLButtonElement>("[data-sidebar-tab]")
      .forEach((tabButton) => {
        tabButton.setAttribute(
          "aria-selected",
          String(tabButton.dataset.sidebarTab === selected),
        );
      });
    studio
      .querySelectorAll<HTMLElement>("[data-sidebar-panel]")
      .forEach((panel) => {
        panel.hidden = panel.dataset.sidebarPanel !== selected;
      });
  };

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
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "F") {
      event.preventDefault();
      selectSidebarTab("find");
      globalSearchInput.focus();
      globalSearchInput.select();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
  });

  const connected = await connectDevProject();
  refreshPreview();
  if (!connected) {
    setStatus(
      window.showDirectoryPicker
        ? "Local server connection unavailable. Choose the project folder."
        : "Run npm run dev to connect this editor to the project.",
      "error",
    );
  }
}
