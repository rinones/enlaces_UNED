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

2. Asegúrate de que `data/links.json` contiene tus enlaces.

3. Sube todo el repositorio a GitHub y en Settings -> Pages selecciona la rama `main` y la carpeta `/` (o `/docs` si prefieres).

4. GitHub Pages servirá `index.html` y los archivos en `dist/` sin necesidad de servidor local.

Nota: para compatibilidad máxima con navegadores y GitHub Pages, `index.html` referencia el JS ya compilado en `dist/js/app.js` y el CSS en `dist/css/main.css`.

