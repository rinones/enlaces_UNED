# enlaces

Sitio estático de enlaces con varias secciones (Home, UNED, Viajes, Contenido). Proyecto organizado con fuentes en `src/` y artefactos generados en `dist/`.

Cambios principales (buenas prácticas)
--------------------------------------
- Código JS fuente en `src/js/` y empaquetado con esbuild a un único bundle:
  - Salida: `dist/js/bundle.min.js` (minificado + sourcemap).
  - Las páginas HTML cargan: `<script src="dist/js/bundle.min.js"></script>`.
- Estilos fuente en `src/scss/` y CSS generado en `dist/css/main.css`.
- `dist/` está ignorado en Git; sólo contiene artefactos generados.
- Config de sección desde HTML vía atributo `data-links-key` (más limpio que `window.LINKS_KEY`).

Estructura relevante
--------------------
- index.html, uned.html, travel.html, contenido.html
- data/: ficheros JSON con enlaces y actividades
- assets/: iconos e imágenes
- src/scss/: estilos fuente (parciales + `main.scss`)
- src/js/: módulos JS fuente (entrypoint `src/js/main.js`)
- dist/css/main.css: CSS compilado
- dist/js/bundle.min.js: JS empaquetado

Uso rápido
----------
1) Instala dependencias y compila todo:

```powershell
npm install
npm run build
```

2) Desarrollo con watch (Sass + JS en paralelo):

```powershell
npm run dev
```

3) Abre cualquier HTML en el navegador (por ejemplo `index.html`).

Páginas y datos
---------------
Por defecto cada página carga su fichero modular (auto-inferido o por `data-links-key`):
- `index.html` → `data/links/home.json` (usa `<body data-links-key="home">`)
- `travel.html` → `data/links/travel.json` (usa `<body data-links-key="travel">`)
- `contenido.html` → `data/links/content.json` (usa `<body data-links-key="content">`)
- `uned.html` → vista UNED (usa `<body data-links-key="uned">`), y vistas de asignatura `uned.html#<slug>` consumen `data/links/uned/subjects/<slug>.json`.

Alternativa: forzar desde JS (compatibilidad):
```html
<script>
  window.LINKS_KEY = 'travel';
</script>
```

Formato de enlaces (modular):
```json
[{ "title":"...", "url":"...", "description":"...", "icon":"<svg ...>" }]
```

UNED
----
- Mega-menú y selector a partir de `data/uned-subjects.json`.
- Ficheros por defecto: `data/links/uned/common.json`, `data/links/uned/subjects/<slug>.json`, `data/activities/{general|subjects/<slug>}.json`.
- Fallbacks de compatibilidad: índice unificado `data/links.json` y ficheros antiguos `data/uned-*-links.json`, `data/*-links.json`, `data/*-activities.json`.

Calendario
----------
La página de calendario fue eliminada; define actividades bajo `data/activities/*` para que aparezcan en "Próximas actividades".

Publicación en GitHub Pages
---------------------------
1) Compila todo a `dist/`:

```powershell
npm install
npm run build
```

2) Sube a GitHub y en Settings → Pages selecciona la rama `main` y la carpeta raíz `/`.

3) `index.html` servirá el sitio; el punto de entrada JS es `dist/js/bundle.min.js` y los estilos en `dist/css/main.css`.

Notas
-----
- Se mantienen compatibilidades con índice unificado y ficheros antiguos.
- `dist/` no se versiona; los artefactos se generan con `npm run build`.

