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
const DESIGN_PRESET_STORAGE_KEY = "yixin-cui-studio-design-presets";
const GLOBAL_CSS_PATH = "src/styles/global.css";

const designFonts = {
  "system-sans": "var(--font-system-sans)",
  "humanist-sans": "var(--font-humanist-sans)",
  "system-serif": "var(--font-system-serif)",
  garamond: "var(--font-garamond)",
  typewriter: "var(--font-typewriter)",
  "modern-mono": "var(--font-modern-mono)",
} as const;

const spacingPresets = {
  compact: {
    "--space-xs": "0.35rem",
    "--space-sm": "0.7rem",
    "--space-md": "1.4rem",
    "--space-lg": "2.8rem",
    "--space-xl": "4rem",
  },
  standard: {
    "--space-xs": "0.5rem",
    "--space-sm": "1rem",
    "--space-md": "2rem",
    "--space-lg": "4rem",
    "--space-xl": "6rem",
  },
  open: {
    "--space-xs": "0.65rem",
    "--space-sm": "1.3rem",
    "--space-md": "2.6rem",
    "--space-lg": "5rem",
    "--space-xl": "7.5rem",
  },
  generous: {
    "--space-xs": "0.8rem",
    "--space-sm": "1.6rem",
    "--space-md": "3.2rem",
    "--space-lg": "6.4rem",
    "--space-xl": "9rem",
  },
} as const;

const widthPresets = {
  narrow: {
    "--page-width": "56rem",
    "--content-width": "38rem",
    "--reading-width": "32rem",
  },
  standard: {
    "--page-width": "64rem",
    "--content-width": "44rem",
    "--reading-width": "38rem",
  },
  wide: {
    "--page-width": "76rem",
    "--content-width": "54rem",
    "--reading-width": "46rem",
  },
} as const;

const defaultDesign = {
  "--theme-color": "#c81e1e",
  "--font-body": designFonts.garamond,
  "--base-font-size": "17px",
  "--line-height": "1.3",
  "--paragraph-indent": "1.5em",
  "--paragraph-spacing": "0rem",
  ...spacingPresets.standard,
  ...widthPresets.standard,
} as const;

type DesignValues = Record<string, string>;
type DesignPresetSlots = Record<string, DesignValues>;

const designVariableNames = Object.keys(defaultDesign);

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

function cssVariableValue(text: string, variable: string) {
  const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`${escaped}:\\s*([^;]+);`))?.[1].trim();
}

function replaceCssVariables(
  text: string,
  updates: Record<string, string>,
) {
  return Object.entries(updates).reduce((nextText, [variable, value]) => {
    const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return nextText.replace(
      new RegExp(`(${escaped}:\\s*)[^;]+;`),
      `$1${value};`,
    );
  }, text);
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
  const themeColorInput =
    studio.querySelector<HTMLInputElement>("[data-theme-color]");
  const themeColorOutput =
    studio.querySelector<HTMLOutputElement>("[data-theme-color-output]");
  const openThemeCssButton =
    studio.querySelector<HTMLButtonElement>("[data-open-theme-css]");
  const designFontInput =
    studio.querySelector<HTMLSelectElement>("[data-design-font]");
  const designFontSizeInput =
    studio.querySelector<HTMLInputElement>("[data-design-font-size]");
  const designFontSizeOutput =
    studio.querySelector<HTMLOutputElement>("[data-design-font-size-output]");
  const designSpacingInput =
    studio.querySelector<HTMLSelectElement>("[data-design-spacing]");
  const designLineHeightInput =
    studio.querySelector<HTMLInputElement>("[data-design-line-height]");
  const designLineHeightOutput =
    studio.querySelector<HTMLOutputElement>("[data-design-line-height-output]");
  const designParagraphSpacingInput =
    studio.querySelector<HTMLInputElement>("[data-design-paragraph-spacing]");
  const designParagraphSpacingOutput =
    studio.querySelector<HTMLOutputElement>(
      "[data-design-paragraph-spacing-output]",
    );
  const designWidthInput =
    studio.querySelector<HTMLSelectElement>("[data-design-width]");
  const designIndentInput =
    studio.querySelector<HTMLInputElement>("[data-design-indent]");
  const designResetButton =
    studio.querySelector<HTMLButtonElement>("[data-design-reset]");
  const designPresetSlotInput =
    studio.querySelector<HTMLSelectElement>("[data-design-preset-slot]");
  const designPresetStatus =
    studio.querySelector<HTMLElement>("[data-design-preset-status]");
  const designPresetSaveButton =
    studio.querySelector<HTMLButtonElement>("[data-design-preset-save]");
  const designPresetApplyButton =
    studio.querySelector<HTMLButtonElement>("[data-design-preset-apply]");
  const designPresetClearButton =
    studio.querySelector<HTMLButtonElement>("[data-design-preset-clear]");
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
    !themeColorInput ||
    !themeColorOutput ||
    !openThemeCssButton ||
    !designFontInput ||
    !designFontSizeInput ||
    !designFontSizeOutput ||
    !designSpacingInput ||
    !designLineHeightInput ||
    !designLineHeightOutput ||
    !designParagraphSpacingInput ||
    !designParagraphSpacingOutput ||
    !designWidthInput ||
    !designIndentInput ||
    !designResetButton ||
    !designPresetSlotInput ||
    !designPresetStatus ||
    !designPresetSaveButton ||
    !designPresetApplyButton ||
    !designPresetClearButton ||
    !lockStudioButton ||
    !searchForm ||
    !globalSearchInput ||
    !searchSummary ||
    !searchResults ||
    !previewStage ||
    !lineWrapInput ||
    !previewInspectorInput
  ) {
    return;
  }

  // 后续嵌套函数使用稳定的非空引用，避免 TypeScript 丢失上方的 DOM 检查结果。
  // Stable non-null references preserve the DOM checks inside later nested helpers.
  const fileListElement = fileList;
  const fileFilterInput = fileFilter;

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

  const findPreset = (
    text: string,
    presets: Record<string, Record<string, string>>,
    fallback: string,
  ) =>
    Object.entries(presets).find(([, variables]) =>
      Object.entries(variables).every(
        ([variable, value]) => cssVariableValue(text, variable) === value,
      ),
    )?.[0] ?? fallback;

  const readDesignValues = (text: string): DesignValues =>
    Object.fromEntries(
      designVariableNames.map((variable) => [
        variable,
        cssVariableValue(text, variable) ??
          defaultDesign[variable as keyof typeof defaultDesign],
      ]),
    );

  const readDesignPresetSlots = (): DesignPresetSlots => {
    try {
      const stored = localStorage.getItem(DESIGN_PRESET_STORAGE_KEY);
      return stored ? JSON.parse(stored) as DesignPresetSlots : {};
    } catch {
      return {};
    }
  };

  const writeDesignPresetSlots = (slots: DesignPresetSlots) => {
    localStorage.setItem(DESIGN_PRESET_STORAGE_KEY, JSON.stringify(slots));
  };

  const updateDesignPresetStatus = () => {
    const slot = designPresetSlotInput.value;
    const exists = Boolean(readDesignPresetSlots()[slot]);
    designPresetStatus.textContent = exists
      ? `Preset ${slot} is saved. / 预设 ${slot} 已保存。`
      : `Preset ${slot} is empty. / 预设 ${slot} 为空。`;
    designPresetApplyButton.disabled = !exists;
    designPresetClearButton.disabled = !exists;
  };

  const syncDesignControls = (text: string) => {
    const themeColor = cssVariableValue(text, "--theme-color") ?? "#c81e1e";
    const fontBody =
      cssVariableValue(text, "--font-body") ?? designFonts["system-sans"];
    const baseFontSize =
      cssVariableValue(text, "--base-font-size") ?? "17px";
    const lineHeight = cssVariableValue(text, "--line-height") ?? "1.55";
    const paragraphIndent =
      cssVariableValue(text, "--paragraph-indent") ?? "1.5em";
    const paragraphSpacing =
      cssVariableValue(text, "--paragraph-spacing") ?? "0rem";

    themeColorInput.value = themeColor;
    themeColorOutput.value = themeColor;
    document.documentElement.style.setProperty("--admin-accent", themeColor);
    designFontInput.value =
      Object.entries(designFonts).find(([, value]) => value === fontBody)?.[0] ??
      "system-sans";
    designFontSizeInput.value = baseFontSize.replace("px", "");
    designFontSizeOutput.value = baseFontSize;
    designLineHeightInput.value = lineHeight;
    designLineHeightOutput.value = lineHeight;
    designParagraphSpacingInput.value = paragraphSpacing.replace("rem", "");
    designParagraphSpacingOutput.value = paragraphSpacing;
    designIndentInput.checked = paragraphIndent !== "0" && paragraphIndent !== "0em";
    designSpacingInput.value = findPreset(
      text,
      spacingPresets,
      "standard",
    );
    designWidthInput.value = findPreset(text, widthPresets, "standard");
    updateDesignPresetStatus();
  };

  const applyDesignToPreview = (updates: Record<string, string>) => {
    const root = previewFrame.contentDocument?.documentElement;
    if (!root) return;
    Object.entries(updates).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });
  };

  // Dashboard writes the same documented CSS variables a person would edit manually.
  // 设计面板写入的就是人工编辑时会修改的同一组 CSS 变量。
  const saveDesignVariables = async (
    updates: Record<string, string>,
    message: string,
  ) => {
    const handle = fileHandles.get(GLOBAL_CSS_PATH);
    if (!handle) {
      setStatus("Connect the project before changing design settings.", "error");
      return;
    }

    try {
      const currentText =
        currentPath === GLOBAL_CSS_PATH
          ? editor.state.doc.toString()
          : await (await handle.getFile()).text();
      const nextText = replaceCssVariables(currentText, updates);
      if (nextText === currentText) {
        throw new Error("One or more design variables could not be found.");
      }

      const writable = await handle.createWritable();
      await writable.write(nextText);
      await writable.close();

      if (currentPath === GLOBAL_CSS_PATH) {
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

      applyDesignToPreview(updates);
      syncDesignControls(nextText);
      setStatus(message);
      schedulePreviewRefresh();
    } catch (error) {
      loadingDocument = false;
      setStatus(
        error instanceof Error ? error.message : "Unable to save design settings.",
        "error",
      );
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

      if (targetLine) {
        const line = Math.min(Math.max(targetLine, 1), editor.state.doc.lines);
        const position = editor.state.doc.line(line).from;
        editor.dispatch({
          selection: { anchor: position },
          effects: EditorView.scrollIntoView(position, { y: "center" }),
        });
        editor.focus();
      }

      if (path === GLOBAL_CSS_PATH) {
        syncDesignControls(text);
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

  let removePreviewInspector = () => {};

  // Inspector markup is injected only into the same-origin preview iframe.
  // 检查器只注入同源预览，不会写入或发布到公开页面。
  const installPreviewInspector = () => {
    removePreviewInspector();
    if (!previewInspectorInput.checked) return;

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
      const globalCssHandle = fileHandles.get(GLOBAL_CSS_PATH);
      if (globalCssHandle) {
        syncDesignControls(await (await globalCssHandle.getFile()).text());
      }
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
      const globalCssHandle = fileHandles.get(GLOBAL_CSS_PATH);
      if (globalCssHandle) {
        syncDesignControls(await (await globalCssHandle.getFile()).text());
      }
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
  previewInspectorInput.addEventListener("change", installPreviewInspector);
  previewFrame.addEventListener("load", () => {
    installPreviewInspector();
  });
  previewPath.addEventListener("keydown", (event) => {
    if (event.key === "Enter") refreshPreview();
  });
  previewPath.addEventListener("input", () => {
    openPreviewLink.href = previewPath.value.trim() || "/";
  });
  openThemeCssButton.addEventListener("click", () => {
    void loadFile(GLOBAL_CSS_PATH);
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

  themeColorInput.addEventListener("input", () => {
    themeColorOutput.value = themeColorInput.value;
    document.documentElement.style.setProperty(
      "--admin-accent",
      themeColorInput.value,
    );
    applyDesignToPreview({ "--theme-color": themeColorInput.value });
  });
  themeColorInput.addEventListener("change", () => {
    void saveDesignVariables(
      { "--theme-color": themeColorInput.value },
      `Theme color changed to ${themeColorInput.value}.`,
    );
  });
  designFontInput.addEventListener("change", () => {
    const font =
      designFonts[designFontInput.value as keyof typeof designFonts] ??
      designFonts["system-sans"];
    void saveDesignVariables(
      { "--font-body": font },
      `Font changed to ${designFontInput.selectedOptions[0]?.textContent ?? designFontInput.value}.`,
    );
  });
  designFontSizeInput.addEventListener("input", () => {
    designFontSizeOutput.value = `${designFontSizeInput.value}px`;
    applyDesignToPreview({
      "--base-font-size": `${designFontSizeInput.value}px`,
    });
  });
  designFontSizeInput.addEventListener("change", () => {
    void saveDesignVariables(
      { "--base-font-size": `${designFontSizeInput.value}px` },
      `Base text size changed to ${designFontSizeInput.value}px.`,
    );
  });
  designSpacingInput.addEventListener("change", () => {
    const preset =
      spacingPresets[
        designSpacingInput.value as keyof typeof spacingPresets
      ] ?? spacingPresets.standard;
    void saveDesignVariables(
      { ...preset },
      `Global spacing changed to ${designSpacingInput.value}.`,
    );
  });
  designLineHeightInput.addEventListener("input", () => {
    designLineHeightOutput.value = designLineHeightInput.value;
    applyDesignToPreview({ "--line-height": designLineHeightInput.value });
  });
  designLineHeightInput.addEventListener("change", () => {
    void saveDesignVariables(
      { "--line-height": designLineHeightInput.value },
      `Line height changed to ${designLineHeightInput.value}.`,
    );
  });
  designParagraphSpacingInput.addEventListener("input", () => {
    const value = `${designParagraphSpacingInput.value}rem`;
    designParagraphSpacingOutput.value = value;
    applyDesignToPreview({ "--paragraph-spacing": value });
  });
  designParagraphSpacingInput.addEventListener("change", () => {
    const value = `${designParagraphSpacingInput.value}rem`;
    void saveDesignVariables(
      { "--paragraph-spacing": value },
      `Paragraph spacing changed to ${value}.`,
    );
  });
  designWidthInput.addEventListener("change", () => {
    const preset =
      widthPresets[designWidthInput.value as keyof typeof widthPresets] ??
      widthPresets.standard;
    void saveDesignVariables(
      { ...preset },
      `Reading width changed to ${designWidthInput.value}.`,
    );
  });
  designIndentInput.addEventListener("change", () => {
    void saveDesignVariables(
      {
        "--paragraph-indent": designIndentInput.checked ? "1.5em" : "0em",
      },
      designIndentInput.checked
        ? "Paragraph indentation enabled."
        : "Paragraph indentation disabled.",
    );
  });
  designResetButton.addEventListener("click", () => {
    document.documentElement.style.setProperty(
      "--admin-accent",
      defaultDesign["--theme-color"],
    );
    void saveDesignVariables(
      { ...defaultDesign },
      "Design dashboard reset to defaults.",
    );
  });
  designPresetSlotInput.addEventListener("change", updateDesignPresetStatus);
  designPresetSaveButton.addEventListener("click", async () => {
    const handle = fileHandles.get(GLOBAL_CSS_PATH);
    if (!handle) {
      setStatus("Connect the project before saving a preset.", "error");
      return;
    }

    try {
      const text =
        currentPath === GLOBAL_CSS_PATH
          ? editor.state.doc.toString()
          : await (await handle.getFile()).text();
      const slot = designPresetSlotInput.value;
      const slots = readDesignPresetSlots();
      slots[slot] = readDesignValues(text);
      writeDesignPresetSlots(slots);
      updateDesignPresetStatus();
      setStatus(`Saved the current design to preset ${slot}.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save the preset.",
        "error",
      );
    }
  });
  designPresetApplyButton.addEventListener("click", () => {
    const slot = designPresetSlotInput.value;
    const preset = readDesignPresetSlots()[slot];
    if (!preset) {
      updateDesignPresetStatus();
      return;
    }

    document.documentElement.style.setProperty(
      "--admin-accent",
      preset["--theme-color"] ?? defaultDesign["--theme-color"],
    );
    void saveDesignVariables(
      preset,
      `Applied design preset ${slot}.`,
    );
  });
  designPresetClearButton.addEventListener("click", () => {
    const slot = designPresetSlotInput.value;
    const slots = readDesignPresetSlots();
    delete slots[slot];
    writeDesignPresetSlots(slots);
    updateDesignPresetStatus();
    setStatus(`Cleared design preset ${slot}.`);
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
  if (!connected) {
    setStatus(
      window.showDirectoryPicker
        ? "Local server connection unavailable. Choose the project folder."
        : "Run npm run dev to connect this editor to the project.",
      "error",
    );
  }
}
