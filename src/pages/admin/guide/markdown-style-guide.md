---
layout: ../../../layouts/AdminGuideLayout.astro
title: "Markdown Style Guide / Markdown 樣式指南"
description: "A bilingual visual test of the writing elements supported by the site. / 網站所支援文章元素的雙語視覺測試。"
slug: "markdown-style-guide"
---

<!--
  中文：集中測試文章可使用的 Markdown、HTML、數學公式和腳註。
  English: Tests Markdown, HTML, mathematics, and footnotes available to writings.
  Caveat / 注意：本頁是渲染參考，不是公開文章；複製示例時應替換佔位內容。
  Caveat: This is a rendering reference, not a public writing; replace placeholders when copying.
-->

## Basic text / 基本文字

Ordinary prose paragraphs receive first-line indentation. This sentence
includes *emphasis*, **strong emphasis**, ***combined emphasis***,
~~strikethrough~~, `inline code`, a [hyperlink](https://example.com),
<mark>highlighted text</mark>, H<sub>2</sub>O, x<sup>2</sup>, an
<abbr title="abbreviation">abbr.</abbr>, and <kbd>Ctrl</kbd> + <kbd>S</kbd>.

普通正文段落預設首行縮排。本句包含 *斜體*、**粗體**、***粗斜體***、
~~刪除線~~、`行內程式碼`、[超連結](https://example.com)、<mark>高亮</mark>、
H<sub>2</sub>O、x<sup>2</sup>、<abbr title="縮寫">縮寫</abbr>和
<kbd>Ctrl</kbd> + <kbd>S</kbd>。

<p class="no-indent">This paragraph uses <code>class="no-indent"</code> and
therefore begins flush left. / 本段使用 <code>class="no-indent"</code>，
因此不縮排。</p>

## Headings / 標題

### Third-level heading / 三級標題

#### Fourth-level heading / 四級標題

##### Fifth-level heading / 五級標題

###### Sixth-level heading / 六級標題

Headings use the body-text size and express hierarchy through weight and
document structure. / 標題與正文同號，透過粗細和文件結構表達層級。

## Lists / 列表

- Unordered item / 無序專案
- Another item / 另一個專案
  - Nested item / 巢狀專案
  - Second nested item / 第二個巢狀專案

1. Ordered item / 有序專案
2. Another ordered item / 另一個有序專案
   1. Nested ordered item / 巢狀有序專案

- [x] Completed task / 已完成
- [ ] Incomplete task / 未完成

## Quotations and poetry / 引文與詩歌

> A normal quotation uses the theme color as its rule.
>
> 普通引文使用主題色作為左側線條。

Poetry should use one paragraph with explicit `<br>` line breaks. That avoids
both paragraph indentation and unwanted vertical gaps between lines.

詩歌應放在同一個段落中，並用 `<br>` 明確換行。這樣既不首行縮排，也不會在詩行
之間產生額外垂直間距。

<blockquote class="no-indent poetry">
  <p>
    The evening enters by the narrow window.<br>
    A branch holds what remains of the rain.<br>
    No one speaks. Across the courtyard,<br>
    one light is answered by another.
  </p>
  <footer><cite>Anonymous test poem / 匿名測試詩</cite></footer>
</blockquote>

## Links and footnotes / 連結與腳註

This sentence contains a Chicago-style note.[^note] A second note contains a
[hyperlinked source](https://www.chicagomanualofstyle.org/home.html).[^link]

本句包含芝加哥格式腳註。[^cn-note] 第二條腳註包含一個
[超連結來源](https://www.chicagomanualofstyle.org/home.html)。[^cn-link]

[^note]: This is a sample note. Footnote paragraphs do not use first-line indentation.
[^link]: This note demonstrates linked source material and a longer explanatory sentence.
[^cn-note]: 這是一條示例腳註。腳註段落不使用首行縮排。
[^cn-link]: 這條腳註用於測試帶有超連結的來源說明。

## Mathematics / 數學公式

Inline mathematics stays within a sentence: $s_{n+1}=s_n+\varepsilon_n$.

行內公式保留在句子之中：$a^2+b^2=c^2$。

Display mathematics receives its own block:

$$
A = \int_{t_0}^{t_1} a(t)\,dt
$$

獨立公式：

$$
\hat{f}(\xi)=\int_{-\infty}^{\infty}f(x)e^{-2\pi i x\xi}\,dx
$$

## Images and captions / 圖片與說明

<figure>
  <img src="/images/work-04.svg" alt="Placeholder angular landscape drawing">
  <figcaption>Figure 1. Placeholder image with a descriptive caption. / 圖 1：帶有說明文字的佔點陣圖片。</figcaption>
</figure>

Markdown's shorter image syntax also works, although it does not create a
caption:

![Placeholder score-like drawing](/images/work-02.svg)

簡短的 Markdown 圖片語法也可以使用，但不會自動生成圖片說明。

## Ruby annotation / Ruby 注音

The term <ruby>留白<rp>(</rp><rt>liú bái</rt><rp>)</rp></ruby> demonstrates
pronunciation above base text. Japanese is also possible:
<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>.

<ruby>留白<rp>(</rp><rt>liú bái</rt><rp>)</rp></ruby> 演示在基礎文字上方標註
讀音；也可以用於日文：
<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>。

## Code / 程式碼

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

| Field / 欄位 | Purpose / 用途 | Optional / 可選 |
| --- | --- | --- |
| `title` | Display title / 顯示標題 | No / 否 |
| `subtitle` | Secondary title / 副標題 | Yes / 是 |
| `slug` | Public URL / 公開網址 | No / 否 |

## Definition list / 定義列表

<dl>
  <dt>Resonance / 共鳴</dt>
  <dd>The continuation or reinforcement of vibration. / 振動的延續或增強。</dd>
  <dt>Silence / 沉默</dt>
  <dd>A condition whose meaning depends on context. / 一種意義取決於語境的狀態。</dd>
</dl>

## Disclosure / 摺疊內容

<details>
  <summary>Open a supplementary note / 展開補充說明</summary>
  <p class="no-indent">This content remains hidden until opened. / 此內容在展開前保持隱藏。</p>
</details>

---

The horizontal rule above also uses the theme color. / 上方水平線也使用主題色。
