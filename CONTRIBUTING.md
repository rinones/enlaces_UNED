# Guía de Contribución

¡Gracias por tu interés en contribuir a este proyecto! Esta guía te ayudará a entender cómo puedes participar.

## 🚀 Inicio Rápido

1. **Fork del repositorio**: Haz un fork de este repositorio a tu cuenta de GitHub
2. **Clona tu fork**: `git clone https://github.com/TU_USUARIO/enlaces.git`
3. **Instala dependencias**: `npm install`
4. **Compila estilos**: `npm run build:sass`

## 📝 Estructura del Proyecto

```
enlaces/
├── data/               # Archivos JSON con datos
│   ├── links/         # Enlaces organizados por sección
│   ├── activities/    # Actividades y eventos
│   └── notices.json   # Avisos y notificaciones
├── dist/              # Archivos compilados
│   ├── css/          # CSS compilado desde SCSS
│   └── js/           # Módulos JavaScript (ES6)
├── src/
│   └── scss/         # Archivos fuente SCSS
├── assets/           # Imágenes e iconos
└── *.html           # Páginas HTML
```

## 🎯 Tipos de Contribuciones

### 1. Reportar Bugs
- Usa el sistema de Issues de GitHub
- Incluye pasos para reproducir el problema
- Especifica el navegador y versión

### 2. Sugerir Mejoras
- Abre un Issue con el tag `enhancement`
- Describe claramente la funcionalidad propuesta
- Explica por qué sería útil

### 3. Contribuir Código

#### Estándares de Código
- **JavaScript**: ES6 modules, JSDoc para funciones públicas
- **CSS/SCSS**: Usar variables SCSS, nombres de clases descriptivos
- **HTML**: Semántica correcta, atributos ARIA cuando sea necesario

#### Proceso de Contribución
1. Crea una rama desde `main`: `git checkout -b feature/mi-funcionalidad`
2. Haz tus cambios siguiendo los estándares
3. Compila los estilos: `npm run build:sass`
4. Prueba tus cambios en diferentes navegadores
5. Commit con mensajes descriptivos
6. Push a tu fork
7. Abre un Pull Request

#### Convenciones de Commits
```
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Formato, punto y coma faltantes, etc
refactor: Refactorización de código
test: Añadir tests
chore: Mantenimiento
```

### 4. Agregar Datos

#### Enlaces
Edita los archivos JSON en `data/links/`:
```json
{
  "title": "Título del enlace",
  "url": "https://example.com",
  "description": "Descripción breve",
  "section": "Categoría",
  "icon": "<svg>...</svg>"
}
```

#### Actividades
Edita los archivos JSON en `data/activities/`:
```json
{
  "date": "2025-12-31",
  "title": "Nombre de la actividad",
  "link": "https://example.com"
}
```

## 🔧 Scripts Disponibles

- `npm run build:sass` - Compila SCSS a CSS
- `npm run watch:sass` - Compila SCSS en modo watch

## 🧪 Testing

Antes de enviar un PR:
1. Verifica que no hay errores en la consola del navegador
2. Prueba la funcionalidad en modo claro y oscuro
3. Verifica la responsividad en móvil
4. Asegúrate de que la búsqueda funciona correctamente

## 📚 Recursos

- [Documentación de ES6 Modules](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [Guía de SCSS](https://sass-lang.com/guide)
- [Accesibilidad Web (ARIA)](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA)

## 💬 Comunicación

- **Issues**: Para bugs y sugerencias
- **Pull Requests**: Para contribuciones de código
- **Discussions**: Para preguntas generales

## 📜 Código de Conducta

- Sé respetuoso y constructivo
- Acepta críticas constructivas
- Enfócate en lo mejor para la comunidad
- Muestra empatía hacia otros contribuidores

## ✅ Checklist para Pull Requests

- [ ] El código sigue los estándares del proyecto
- [ ] He añadido JSDoc a funciones públicas nuevas
- [ ] Los estilos SCSS están compilados
- [ ] He probado en Chrome, Firefox y Safari
- [ ] He probado en móvil
- [ ] Los commits tienen mensajes descriptivos
- [ ] He actualizado la documentación si es necesario

¡Gracias por contribuir! 🎉
