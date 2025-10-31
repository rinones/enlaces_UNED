# enlaces

 Sitio estático de enlaces con varias secciones (Home, UNED, Viajes, Calendario, Contenido). Ahora optimizado y organizado en módulos JS (ES modules) y datos JSON modulares.

Qué cambió (optimización de estructura):
 - Código JS en módulos (ESM) bajo `dist/js/` y un punto de entrada único `dist/js/main.js`:
   - `utils.js` (DOM + helpers), `theme.js`, `nav.js`, `links.js`, `notices.js`, `upcoming.js`, `uned-page.js`, `calendar.js`.
   - Las páginas HTML cargan: `<script type="module" src="dist/js/main.js"></script>`.
 - Datos JSON modulares organizados por dominio:
   - `data/links/{home,travel,content}.json`
   - `data/links/uned/common.json` y `data/links/uned/subjects/{redes,preda,ic2}.json`
   - `data/activities/general.json` y `data/activities/subjects/{redes,preda}.json`
 - Compatibilidad: se soportan también `data/links.json` (índice unificado) y los ficheros antiguos `data/*-links.json` | `data/*-activities.json` como fallback.

Estructura relevante:
- index.html, uned.html, travel.html, calendar.html, contenido.html
- data/: ficheros JSON con enlaces y actividades
- assets/: iconos e imágenes
- src/scss/: estilos fuente (parciales + `main.scss`)
- dist/css/main.css: CSS compilado
- dist/js/: módulos JS (entrypoint `main.js`)

Uso rápido
---------
1) Instala dependencias y compila estilos:

```powershell
npm install
npm run build:sass
```

2) Abre cualquier HTML en el navegador (por ejemplo `index.html`). Todo funciona solo con archivos estáticos.

 Páginas de enlaces por sección
 ------------------------------
 Por defecto, cada página carga su fichero modular correspondiente (auto-inferido):
 - `index.html` → `data/links/home.json`
 - `travel.html` → `data/links/travel.json`
 - `contenido.html` → `data/links/content.json`
  - Vistas de asignatura UNED: `uned.html#<slug>` (p.ej. `uned.html#redes`, `uned.html#preda`, `uned.html#ic2`) consumen `data/links/uned/subjects/<slug>.json`

 Si quieres forzar una clave concreta (para usar el índice unificado o mapear rutas), establece `window.LINKS_KEY` antes del script:

```html
<script>
	window.LINKS_KEY = 'travel';
</script>
```

 Datos esperados (enlaces) en ficheros modulares (arrays de objetos):
 ```json
[{ "title":"...","url":"...","description":"...","icon":"<svg ...>" }]
```

 UNED
 ----
 - El mega-menú UNED se genera a partir de `data/uned-subjects.json`.
 - La página `uned.html` consume por defecto los ficheros modulares: `data/links/uned/common.json`, `data/links/uned/subjects/<slug>.json`, `data/activities/{general|subjects/<slug>}.json`.
 - Fallbacks compatibilidad: índice unificado `data/links.json` y ficheros antiguos `data/uned-*-links.json`, `data/*-links.json`, `data/*-activities.json`.

Calendario
----------
- `calendar.html` muestra un calendario mensual con “notas” almacenadas en `localStorage` (`notes:YYYY-MM-DD`).
- Acceso simple: se guarda un hash SHA-256 en `localStorage` (`calendar:pwdHash`). Por defecto se inicializa con la contraseña `freecalendar` (puedes cambiarla borrando el hash y volviendo a entrar).
- Las actividades guardadas aquí se tienen en cuenta por el panel de “Próximas actividades” de otras páginas (salvo que `UPCOMING_ONLY_FILE` sea `true`).

Publicación en GitHub Pages
---------------------------
1) Compila SCSS a `dist/css/main.css`:

```powershell
npm install
npm run build:sass
```

2) Sube a GitHub y en Settings → Pages selecciona la rama `main` y la carpeta raíz `/`.

3) `index.html` servirá el sitio; el punto de entrada JS es `dist/js/main.js` y los estilos en `dist/css/main.css`.

 Notas
 -----
 - Compatibilidad: se soportan tanto estructura modular como índice unificado `data/links.json` y ficheros antiguos (si los mantienes en el repositorio).
 - No es necesario un “build” de JS; basta con servir los estáticos. Para estilos, usa los scripts de `sass` del `package.json`.
 - Si más adelante quieres empaquetar, `main.js` puede ser el entrypoint del bundler sin cambiar la estructura de datos.

