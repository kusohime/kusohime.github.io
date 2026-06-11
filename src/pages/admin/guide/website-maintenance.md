---
layout: ../../../layouts/AdminGuideLayout.astro
title: "Website Maintenance / 网站维护"
description: "A plain-language map of the project, Studio tools, design system, and publishing checks. / 项目结构、管理工具、设计系统与发布检查的直白说明。"
slug: "website-maintenance"
---

<!--
  中文：从非程序员视角解释网站结构、管理器工具和安全维护流程。
  English: Explains project structure, Studio tools, and safe maintenance from a non-programmer perspective.
  Caveat / 注意：涉及结构性修改前先保存备份，并运行检查与构建。
  Caveat: Back up the project and run checks/builds before structural changes.
-->

## What the website is / 这个网站是什么

This is an Astro static website. Astro reads Markdown and source files, then
builds ordinary HTML, CSS, JavaScript, and images. There is no database or
online CMS. The Website Studio is a local editing surface for the same files.

这是一个 Astro 静态网站。Astro 读取 Markdown 和源文件，再生成普通的 HTML、
CSS、JavaScript 与图片。网站没有数据库或线上 CMS；Website Studio 只是这些
本地文件的编辑界面。

## Project map / 项目地图

| Folder or file / 文件夹或文件 | What it controls / 控制内容 |
| --- | --- |
| `content/works/` | Work information and program notes / 作品资料与说明 |
| `content/writings/` | Writings, title pages, and chapters / 文章、标题页与章节 |
| `public/images/` | Images served directly by the site / 网站直接使用的图片 |
| `src/pages/` | Website addresses and page structures / 网站地址与页面结构 |
| `src/components/` | Reusable header, footer, and interface pieces / 页眉页脚等共用部件 |
| `src/layouts/` | Shared page shells / 共用页面外壳 |
| `src/styles/global.css` | Public typography, colors, spacing, and layout / 公开网站的字体、颜色、间距与布局 |
| `src/styles/admin.css` | Studio appearance only / 仅管理器外观 |
| `src/scripts/admin.ts` | Studio behavior / 管理器功能 |
| `src/data/` | Small shared lists and site settings / 小型共用列表与网站设置 |
| `src/content.config.ts` | Valid content fields and folder rules / 合法内容字段与文件夹规则 |
| `astro.config.mjs` | Astro, Markdown mathematics, and local file API / Astro、数学公式与本地文件接口 |

Files beginning with a dot, `node_modules`, `.astro`, and `dist` are generated
or technical folders. Do not use them for ordinary content work.

以点开头的文件，以及 `node_modules`、`.astro`、`dist`，都是生成文件或技术
文件夹。日常内容维护不要在其中操作。

## Studio panes / 管理器区域

**Files / 文件** displays the project as folders. Select a text file to edit
it. **Wrap lines** changes only the editor display and does not change the
file.

**Files / 文件** 以文件夹形式显示项目。选择文本文件即可编辑。
**Wrap lines** 只改变编辑器中的显示，不修改文件内容。

**Images / 图片** previews image files and can copy a public URL or insert
Markdown. Images normally belong in `public/images/`.

**Images / 图片** 用于预览图片、复制公开网址或插入 Markdown。图片通常放在
`public/images/`。

**Find / 查找** searches the whole project. Use it before renaming a class,
URL, field, or component. The shortcut is <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> +
<kbd>Shift</kbd> + <kbd>F</kbd>.

**Find / 查找** 搜索整个项目。重命名 class、网址、字段或组件前应先查找。
快捷键是 <kbd>Ctrl</kbd> 或 <kbd>Cmd</kbd> + <kbd>Shift</kbd> +
<kbd>F</kbd>。

**Design / 设计** edits documented variables near the top of
`src/styles/global.css`. It is a convenience dashboard, not a separate design
system. Manual CSS changes and dashboard changes edit the same file.

**Design / 设计** 修改 `src/styles/global.css` 顶部已经说明的变量。它只是一个
方便面板，并不是另一套设计系统；手动修改 CSS 与点击面板修改的是同一个文件。

## Design dashboard / 设计面板

- **Theme color / 主题色** controls links, underlines, triangles, and accents.
- **Font / 字体** chooses the global body font.
- **Base text size / 基础字号** controls the medium text setting.
- **Global spacing / 全局间距** changes the shared spacing scale.
- **Line height / 行距** controls prose leading.
- **Paragraph spacing / 段落间距** controls the space after prose paragraphs
  without adding gaps between poetry lines.
- **Reading width / 阅读宽度** changes the page and text-column widths together.
- **Paragraph indentation / 段落首行缩进** turns the prose indent on or off.

- **Line height / 行距** 控制正文行距。
- **Paragraph spacing / 段落间距** 控制正文段落后的距离，不会增加诗行之间的距离。
- **Reading width / 阅读宽度** 同时改变页面和正文栏宽度。
- **Paragraph indentation / 段落首行缩进** 开启或关闭正文首行缩进。

The three preset slots are stored in this browser. **Save** captures every
Design dashboard value, **Apply** restores the chosen slot, and **Clear**
empties it. Presets do not travel with the website project to another browser
or computer.

三个预设槽位保存在当前浏览器中。**Save / 保存** 会记录设计面板的全部数值，
**Apply / 应用** 会恢复所选槽位，**Clear / 清除** 会清空它。预设不会随网站
项目自动转移到另一台电脑或另一个浏览器。

Font choices include system sans serif, Source Sans 3, Times/system serif,
EB Garamond, a classic typewriter stack, and IBM Plex Mono. Google-hosted fonts
require an internet connection on first load; system fonts do not.

字体包括系统无衬线、Source Sans 3、Times/系统衬线、EB Garamond、经典打字机
字体组合和 IBM Plex Mono。Google 托管字体首次载入需要网络；系统字体不需要。

Use **Open global CSS** when the dashboard is too general. The documented
variables are near the beginning of the file and are intended for manual fine
adjustment.

当面板的控制过于笼统时，使用 **Open global CSS**。文件开头附近已经记录了这些
变量，适合进一步手动微调。

## Preview inspector / 预览检查器

Turn on **Inspect** above the preview. Moving the pointer over the website draws
a dim frame around a meaningful block.

打开预览上方的 **Inspect**。将鼠标移过网页时，会在有意义的内容区块周围显示
淡色边框。

- **Style** opens `src/styles/global.css` near the first shared selector that
  appears to control the block.
- **Content** opens the unique Markdown, Astro, or component file registered
  for that block and searches for its visible text.

- **Style** 会打开 `src/styles/global.css`，定位到可能控制该区块的第一个共用
  选择器附近。
- **Content** 会打开为该区块登记的唯一 Markdown、Astro 或组件文件，并寻找其
  可见文字。

The inspector is a locator, not a browser developer tool. A block may inherit
styles from several selectors, and generated text may not have an exact
one-line source match. When the first result is not enough, use global Find.

检查器是定位工具，不是完整的浏览器开发工具。一个区块可能从多个选择器继承
样式，生成文字也不一定对应某一行源代码。首次定位不够准确时，请使用全局查找。

## A safe editing routine / 稳妥的编辑流程

1. Open the relevant content or source file.
2. Make one understandable group of changes.
3. Save and inspect both desktop and phone previews.
4. Check nearby pages that share the same component or CSS.
5. Run `npm run check`.
6. Run `npm run build`.

1. 打开相关内容或源文件。
2. 一次完成一组容易理解的修改。
3. 保存后检查桌面和手机预览。
4. 检查使用相同组件或 CSS 的附近页面。
5. 运行 `npm run check`。
6. 运行 `npm run build`。

Auto-save is convenient for prose. For broad CSS or code experiments, manual
save is easier to control. The line-wrap switch affects only how code appears
in the editor.

自动保存适合文字编辑。大范围实验 CSS 或程序代码时，手动保存更容易控制。
自动换行开关只影响代码在编辑器中的显示。

## Common caveats / 常见注意事项

Changing `global.css`, a layout, or a component can affect many pages at once.
Changing Markdown usually affects only that work, writing, or chapter.

修改 `global.css`、布局或组件可能同时影响很多页面；修改 Markdown 通常只影响
对应的作品、文章或章节。

Do not edit `package-lock.json`, generated `.astro` files, `dist`, or
`node_modules` by hand. Do not place private information in the repository:
static website source can be copied when published.

不要手动编辑 `package-lock.json`、生成的 `.astro` 文件、`dist` 或
`node_modules`。不要把私人信息放进项目：静态网站发布后，源内容可能被复制。

The passcode protects the local Studio file API from casual access. It is not
a hosted user account, encrypted vault, or production CMS login. The guide is
hidden from public navigation and requires a local unlocked Studio, but its
source still belongs to the project.

口令用于防止随意访问本地管理器文件接口，并不是托管账户、加密保险库或线上 CMS
登录。本指南不出现在公开导航中，并要求本地管理器已经解锁，但其源文件仍属于
项目的一部分。

## Publishing / 发布

The repository currently provides build commands, not a carrier-specific
publishing button. Run the checks above, then use the deployment method
configured for the hosting service. A successful local build produces `dist/`;
that folder is generated and should not be edited.

项目目前提供构建命令，并没有与特定托管商绑定的发布按钮。运行上述检查后，再
使用托管服务所配置的部署方式。成功的本地构建会生成 `dist/`；该文件夹由程序
生成，不应手动编辑。
