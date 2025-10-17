// Datos: puedes rellenar `data/links.json` con un array de objetos {title, url, description, icon}
let LINKS = [];

// Intentar cargar data/links.json (si se sirve desde servidor). En archivos locales puede fallar por CORS/file://
async function loadLinks(){
  try{
    const res = await fetch('data/links.json');
    if(res.ok){
      const json = await res.json();
      if(Array.isArray(json)) LINKS = json;
    }
  }catch(e){
    // silencioso: al trabajar localmente fetch puede fallar
    console.warn('No se pudo cargar data/links.json localmente.', e);
  }
}

let filtered = [];

const grid = document.getElementById('links-grid');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');

function renderPage(){
  const pageItems = filtered;
  grid.innerHTML = '';

  if(pageItems.length === 0){
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  pageItems.forEach(item => {
    const a = document.createElement('a');
    a.href = item.url;
    a.className = 'link-card';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', item.title + (item.description ? ('. ' + item.description) : ''));

    const content = document.createElement('div');
    content.className = 'link-content';

    const icon = document.createElement('div');
    icon.className = 'link-icon';
      icon.innerHTML = item.icon || `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#E6EEF9"/><path d="M7 12h10" stroke="#0B5FFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      // Section class will be applied to the anchor (e.g. section-comun) — styling comes from CSS

    const title = document.createElement('div');
    title.className = 'link-title';
    title.textContent = item.title;

    const desc = document.createElement('div');
    desc.className = 'link-desc';
    desc.textContent = item.description || '';

    content.appendChild(icon);
    content.appendChild(title);
    if(item.description) content.appendChild(desc);

    // Section badge and class
    if(item.section){
      const slug = item.section.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
      a.classList.add(`section-${slug}`);
      const badge = document.createElement('div');
      badge.className = 'section-badge';
      badge.textContent = item.section;
      a.appendChild(badge);
    }

    a.appendChild(content);
    grid.appendChild(a);
  });
}

function applySearch(){
  const q = searchInput.value.trim().toLowerCase();
  if(!q) filtered = LINKS.slice();
  else filtered = LINKS.filter(l => (l.title + ' ' + (l.description||'')).toLowerCase().includes(q));
  renderPage();
}

searchInput.addEventListener('input', () => { applySearch(); });

// Theme toggle
function loadTheme(){
  const stored = localStorage.getItem('theme');
  if(stored === 'dark') document.documentElement.classList.add('dark');
}
loadTheme();

themeToggle.addEventListener('click', ()=>{
  const isDark = document.documentElement.classList.toggle('dark');
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Inicialización
function init(){
  loadLinks().then(()=>{
    filtered = LINKS.slice();
    renderPage();
  });
}

init();
