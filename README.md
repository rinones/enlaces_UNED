# enlaces_UNED

Proyecto: Página simple con una cuadrícula de botones hacia enlaces.

Estructura inicial:

- index.html: página principal
- src/scss/: archivos SCSS parciales y main.scss
- dist/css/: CSS compilado (vacío por ahora)
- assets/: recursos (icons, images)

Cómo compilar SCSS (sugerencia):


Usa dart-sass o node-sass. Ejemplo con dart-sass:

sass src/scss/main.scss dist/css/main.css --style=expanded

Nota: la versión inicial mostrará todos los enlaces en una sola página (sin paginación).

Publicación en GitHub Pages
---------------------------------
Este proyecto está preparado para publicarse como página estática en GitHub Pages. Pasos rápidos:

1. Compila SCSS a `dist/css/main.css`:

```powershell
npm install
npm run build:sass
```

2. Asegúrate de que `data/uned-links.json` contiene tus enlaces (archivo específico para la página UNED).

3. Sube todo el repositorio a GitHub y en Settings -> Pages selecciona la rama `main` y la carpeta `/` (o `/docs` si prefieres).

4. GitHub Pages servirá `index.html` y los archivos en `dist/` sin necesidad de servidor local.

Nota: para compatibilidad máxima con navegadores y GitHub Pages, `index.html` referencia el JS ya compilado en `dist/js/app.js` y el CSS en `dist/css/main.css`.

Agregar nuevas páginas de enlaces
---------------------------------

Si quieres crear páginas separadas (por ejemplo `travel.html`) con su propio conjunto de enlaces, crea un nuevo HTML basado en `index.html` y antes de cargar `dist/js/app.js` añade:

```html
<script>
	// apuntar al JSON que contiene los enlaces para esta página
	window.LINKS_PATH = 'data/travel-links.json';
</script>
```

Luego añade el fichero JSON (`data/travel-links.json`) con la misma estructura que `data/uned-links.json`.

Esto permite tener varias páginas estáticas en el mismo repositorio, cada una cargando su propio listado de enlaces.

