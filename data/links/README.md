# Links data schema

This folder contains modular JSON files with link cards for the site.

Each item in a list follows this schema:

- title (string, required): Card title.
- url (string, required): Absolute or relative URL to open.
- description (string, optional): Short description shown under the title.
- icon (string, optional): Small inline SVG or text to display as an icon. Keep it short.
- section (string, optional): Logical group name. If present, a badge is shown and CSS section-* styles may apply.

Examples

Home / common list (`data/links/home.json`):

[
  {
    "title": "GitHub",
    "url": "https://github.com/",
    "description": "Código y proyectos",
    "icon": "<svg ...></svg>",
    "section": "comun"
  },
  {
    "title": "Calculadora",
    "url": "/tools/calc.html"
  }
]

UNED subject list (`data/links/uned/subjects/preda.json`):

[
  {
    "title": "Capítulo 4 · Quicksort",
    "url": "/quick-sort.html",
    "description": "Divide y vencerás — caso promedio O(n log n)",
    "icon": "<span>QS</span>"
  }
]

Notes

- Prefer modular files by page/section over a single monolithic `links.json`.
- If both modular and unified indices exist, modular files take precedence.
- Use simple inline SVG in `icon` when helpful; keep it small for performance.
