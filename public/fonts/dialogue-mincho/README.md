# Dialogue Mincho webfont subsets

These local fonts are scoped to the dialogue archive. Latin text continues to use
the site's American Garamond; no transcript text has been converted.

## Sources and licenses

- Shippori Mincho, 400 / 700, by the Shippori Mincho Project Authors:
  https://github.com/fontdasu/ShipporiMincho
  Official distribution: https://github.com/google/fonts/tree/main/ofl/shipporimincho
  License: OFL-ShipporiMincho.txt (SIL Open Font License 1.1).
- Noto Serif SC, static instances at 400 / 700 derived from the official variable font:
  https://github.com/google/fonts/tree/main/ofl/notoserifsc
  License: OFL-NotoSerifSC.txt (SIL Open Font License 1.1).

## Subsetting

The subsets include the Chinese/Japanese characters and fullwidth punctuation in
the dialogue transcripts and editorial profiles, plus displayed speaker labels.
Shippori Mincho covers 1625 required code points; Noto Serif SC supplies
the 196 additional code points missing from the Japanese font.
Required code points without a local glyph: 0.

Regular and bold are real font weights, with no synthetic bolding. OpenType layout
features and the original font notices are retained. The CSS stack retains system
and existing Noto serif fallbacks for characters added in future edits.

The full upstream TTF fonts are not shipped with the site. These WOFF2 derivatives
were produced with FontTools 4.67.0 and Brotli, keeping the upstream licenses.

Chinese punctuation uses a separate Noto Serif SC subset at 400 / 700. This keeps
Chinese punctuation shapes and positioning while retaining Shippori Mincho for
the dialogue text and American Garamond for Latin letters. The punctuation files
share the Noto Serif SC source and OFL license listed above.
