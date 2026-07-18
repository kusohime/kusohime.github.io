---
title: "Spectral Workbench"
titleZh: "頻譜工作臺"
subtitle: "From recorded sound to inspectable spectral partials and compositional pitch collections"
subtitleZh: "將錄音轉化為可檢視的頻譜分音與可供作曲使用的音高集合"
summary: "A local desktop application that keeps spectral-partial analysis, monophonic pitch tracking, and experimental polyphonic estimation distinct while preserving exact measurements and source evidence."
summaryZh: "一款本機桌面應用程式，分別處理頻譜分音分析、單音音高追蹤與實驗性複音估算，並保留精確測量資料及來源依據。"
status: in-progress
startDate: "2026-07-18"
updated: "2026-07-18"
role:
  en: "Concept, research, DSP, interface design, and software development"
  zh: "概念、研究、數位訊號處理、介面設計與軟體開發"
topics:
  - spectral analysis
  - composition tools
  - audio software
  - Python
links:
  - label: "GitHub repository"
    url: "https://github.com/kusohime/spectral-workbench"
slug: spectral-workbench
order: 2
featured: false
draft: false
---

## Aim

Spectral Workbench is a lightweight desktop application for composers who want to turn recorded or imported sound into inspectable spectral partials and usable pitch collections. It treats measurement as musical material without hiding the distinction between what the software measures, tracks, and infers.

## Analysis model

The application keeps three workflows visibly separate:

1. **Spectral-partial analysis** measures simultaneous peaks and follows them through time.
2. **Monophonic pitch tracking** preserves the continuous contour of a single melodic source before deriving note boundaries.
3. **Experimental polyphonic estimation** proposes conventional notes from a spectrum and labels them as inferred, with confidence and source evidence.

Exact measured frequencies remain available instead of being silently replaced by rounded notation. Imported and recorded audio stays on the local computer.

## Current work

The desktop interface aligns a waveform, spectrogram, spectrum slice, sortable partial table, and pitch stack around a shared selection. The same analysis engine also supports a command-line workflow and exports JSON, CSV, text, and reopenable project files. Current development includes recording, corrective track editing, reduced pitch-collection building, sine resynthesis, deterministic test fixtures, accuracy benchmarks, and distributable desktop builds.
