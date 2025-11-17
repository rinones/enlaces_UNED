# Books structure (per subject)

Purpose: organize per-subject "books" (chapters and resources) consistently.

Conventions

- Root folder: `books/`
- One subfolder per subject (slug): `books/<subject>/`
- Entry page: `books/<subject>/index.html` (book index/landing)
- Chapter pages: `books/<subject>/cap<N>.html` (e.g., `cap1.html`, `cap4.html`)
- Optional assets: `books/<subject>/assets/` (images or extras specific to the book)

Guidelines

- Reuse global styles and scripts by linking:
  - CSS: `../../dist/css/main.css`
  - JS (ESM): `../../js/main.js`
- Keep chapter pages light and semantic. Prefer content blocks over inline styles.
- Link back to subject navigation (e.g., `uned.html#<subject>`) when relevant.
- Treat all subjects equally (same structure and naming).

Examples

- PREDA book index: `books/preda/index.html`
- Future chapters: `books/preda/cap4.html` (Divide y Vencerás), etc.
- REDES and IC2 are scaffolded with placeholder index pages.

Migration path

- You can gradually move existing root pages (e.g., `preda-book.html`, `preda-cap4.html`) here.
- While migrating, keep legacy pages working and link to the new book index from them.
