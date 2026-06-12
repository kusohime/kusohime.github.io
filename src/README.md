# Source map

The public site is organized by responsibility:

- `components/`: reusable visible pieces such as the header and footer.
- `config/`: stable site-wide values, taxonomies, guide order, and motion settings.
- `layouts/`: complete page shells shared by routes.
- `pages/`: URL routes only; each section gets its own folder.
- `scripts/`: browser behavior for the public site and local Studio.
- `styles/`: public and Studio stylesheets.
- `utils/`: small reusable functions without site content.

Editable portfolio material stays outside `src/`:

- `content/works/<slug>/index.md`
- `content/writings/<slug>/index.md`
- `content/writings/<slug>/chapters/*.md`

When adding a new top-level website section, create:

1. `src/pages/<section>/index.astro` for its route.
2. A content collection only when the section needs many editable entries.
3. Shared components only after the same markup or behavior is reused.
