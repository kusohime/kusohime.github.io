---
layout: ../../../layouts/AdminGuideLayout.astro
title: "Markdown Style Guide / Markdown 样式指南"
description: "A bilingual visual test of the writing elements supported by the site. / 网站所支持文章元素的双语视觉测试。"
slug: "markdown-style-guide"
---

<!--
  中文：集中测试文章可使用的 Markdown、HTML、数学公式和脚注。
  English: Tests Markdown, HTML, mathematics, and footnotes available to writings.
  Caveat / 注意：本页是渲染参考，不是公开文章；复制示例时应替换占位内容。
  Caveat: This is a rendering reference, not a public writing; replace placeholders when copying.
-->

## Basic text / 基本文字

Ordinary prose paragraphs receive first-line indentation. This sentence
includes *emphasis*, **strong emphasis**, ***combined emphasis***,
~~strikethrough~~, `inline code`, a [hyperlink](https://example.com),
<mark>highlighted text</mark>, H<sub>2</sub>O, x<sup>2</sup>, an
<abbr title="abbreviation">abbr.</abbr>, and <kbd>Ctrl</kbd> + <kbd>S</kbd>.

普通正文段落默认首行缩进。本句包含 *斜体*、**粗体**、***粗斜体***、
~~删除线~~、`行内代码`、[超链接](https://example.com)、<mark>高亮</mark>、
H<sub>2</sub>O、x<sup>2</sup>、<abbr title="缩写">缩写</abbr>和
<kbd>Ctrl</kbd> + <kbd>S</kbd>。

<p class="no-indent">This paragraph uses <code>class="no-indent"</code> and
therefore begins flush left. / 本段使用 <code>class="no-indent"</code>，
因此不缩进。</p>

## Headings / 标题

### Third-level heading / 三级标题

#### Fourth-level heading / 四级标题

##### Fifth-level heading / 五级标题

###### Sixth-level heading / 六级标题

Headings use the body-text size and express hierarchy through weight and
document structure. / 标题与正文同号，通过粗细和文档结构表达层级。

## Lists / 列表

- Unordered item / 无序项目
- Another item / 另一个项目
  - Nested item / 嵌套项目
  - Second nested item / 第二个嵌套项目

1. Ordered item / 有序项目
2. Another ordered item / 另一个有序项目
   1. Nested ordered item / 嵌套有序项目

- [x] Completed task / 已完成
- [ ] Incomplete task / 未完成

## Quotations and poetry / 引文与诗歌

> A normal quotation uses the theme color as its rule.
>
> 普通引文使用主题色作为左侧线条。

Poetry should use one paragraph with explicit `<br>` line breaks. That avoids
both paragraph indentation and unwanted vertical gaps between lines.

诗歌应放在同一个段落中，并用 `<br>` 明确换行。这样既不首行缩进，也不会在诗行
之间产生额外垂直间距。

<blockquote class="no-indent poetry">
  <p>
    The evening enters by the narrow window.<br>
    A branch holds what remains of the rain.<br>
    No one speaks. Across the courtyard,<br>
    one light is answered by another.
  </p>
  <footer><cite>Anonymous test poem / 匿名测试诗</cite></footer>
</blockquote>

## Links and footnotes / 链接与脚注

This sentence contains a Chicago-style note.[^note] A second note contains a
[hyperlinked source](https://www.chicagomanualofstyle.org/home.html).[^link]

本句包含芝加哥格式脚注。[^cn-note] 第二条脚注包含一个
[超链接来源](https://www.chicagomanualofstyle.org/home.html)。[^cn-link]

[^note]: This is a sample note. Footnote paragraphs do not use first-line indentation.
[^link]: This note demonstrates linked source material and a longer explanatory sentence.
[^cn-note]: 这是一条示例脚注。脚注段落不使用首行缩进。
[^cn-link]: 这条脚注用于测试带有超链接的来源说明。

## Mathematics / 数学公式

Inline mathematics stays within a sentence: $s_{n+1}=s_n+\varepsilon_n$.

行内公式保留在句子之中：$a^2+b^2=c^2$。

Display mathematics receives its own block:

$$
A = \int_{t_0}^{t_1} a(t)\,dt
$$

独立公式：

$$
\hat{f}(\xi)=\int_{-\infty}^{\infty}f(x)e^{-2\pi i x\xi}\,dx
$$

## Images and captions / 图片与说明

<figure>
  <img src="/images/work-04.svg" alt="Placeholder angular landscape drawing">
  <figcaption>Figure 1. Placeholder image with a descriptive caption. / 图 1：带有说明文字的占位图片。</figcaption>
</figure>

Markdown's shorter image syntax also works, although it does not create a
caption:

![Placeholder score-like drawing](/images/work-02.svg)

简短的 Markdown 图片语法也可以使用，但不会自动生成图片说明。

## Ruby annotation / Ruby 注音

The term <ruby>留白<rp>(</rp><rt>liú bái</rt><rp>)</rp></ruby> demonstrates
pronunciation above base text. Japanese is also possible:
<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>.

<ruby>留白<rp>(</rp><rt>liú bái</rt><rp>)</rp></ruby> 演示在基础文字上方标注
读音；也可以用于日文：
<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>。

## Code / 代码

```css
:root {
  --theme-color: #c81e1e;
}
```

```ts
const greeting: string = "Hello";
console.log(greeting);
```

## Table / 表格

| Field / 字段 | Purpose / 用途 | Optional / 可选 |
| --- | --- | --- |
| `title` | Display title / 显示标题 | No / 否 |
| `subtitle` | Secondary title / 副标题 | Yes / 是 |
| `slug` | Public URL / 公开网址 | No / 否 |

## Definition list / 定义列表

<dl>
  <dt>Resonance / 共鸣</dt>
  <dd>The continuation or reinforcement of vibration. / 振动的延续或增强。</dd>
  <dt>Silence / 沉默</dt>
  <dd>A condition whose meaning depends on context. / 一种意义取决于语境的状态。</dd>
</dl>

## Disclosure / 折叠内容

<details>
  <summary>Open a supplementary note / 展开补充说明</summary>
  <p class="no-indent">This content remains hidden until opened. / 此内容在展开前保持隐藏。</p>
</details>

---

The horizontal rule above also uses the theme color. / 上方水平线也使用主题色。
