import { $, fetchJSON, getByKeyPath, inferLinksKeyFromPath, debounce } from './utils.js';
import { trackLinkClick } from './stats.js';
import { validateLinks } from './validation.js';

let LINKS = [];
let UNIFIED_LINKS_CACHE = null; // from data/links.json when used as index

export function getUnifiedLinksCache(){ return UNIFIED_LINKS_CACHE; }

function pathFromKey(key){
  // Prefer modular layout
  if(key==='home') return 'data/links/home.json';
  if(key==='travel') return 'data/links/travel.json';
  if(key==='content') return 'data/links/content.json';
  if(key.startsWith('uned.common')) return 'data/links/uned/common.json';
  if(key.startsWith('uned.subjects.')){
    const slug=key.split('.').pop();
    return `data/links/uned/subjects/${slug}.json`;
  }
  return null;
}

/**
 * Loads links data from modular or unified sources
 * @returns {Promise<void>}
 */
export function loadLinks() {
  const explicitPath = (window && window.LINKS_PATH) ? String(window.LINKS_PATH) : null;
  const key = (window && window.LINKS_KEY) ? String(window.LINKS_KEY) : inferLinksKeyFromPath();
  const modularPath = pathFromKey(key);
  const tryModular = modularPath ? fetchJSON(modularPath) : Promise.resolve(null);
  
  // Show loading state
  showLoadingState();
  
  return tryModular.then(json => {
    if (Array.isArray(json)) {
      LINKS = validateLinks(json);
      hideLoadingState();
      return;
    }
    // fallback to unified links.json as index
    return fetchJSON('data/links.json').then(idx => {
      if (Array.isArray(idx)) {
        UNIFIED_LINKS_CACHE = null;
        LINKS = validateLinks(idx);
        hideLoadingState();
        return;
      }
      if (idx && typeof idx === 'object') {
        UNIFIED_LINKS_CACHE = idx;
        const arr = getByKeyPath(idx, key);
        LINKS = validateLinks(Array.isArray(arr) ? arr : []);
        hideLoadingState();
        return;
      }
      // fallback to legacy explicit path or old defaults
      const legacy = explicitPath || 'data/uned-links.json';
      return fetchJSON(legacy).then(arr => {
        LINKS = validateLinks(Array.isArray(arr) ? arr : []);
        hideLoadingState();
      });
    });
  }).catch(error => {
    console.error('Error loading links:', error);
    showErrorState('No se pudieron cargar los enlaces. Por favor, intenta recargar la página.');
    hideLoadingState();
  });
}

/**
 * Shows loading state in the grid
 */
function showLoadingState() {
  const grid = $('#links-grid');
  if (!grid) return;
  
  grid.innerHTML = '<div class="loading-state" aria-live="polite">Cargando enlaces...</div>';
}

/**
 * Hides loading state
 */
function hideLoadingState() {
  const loading = document.querySelector('.loading-state');
  if (loading) loading.remove();
}

/**
 * Shows error state with message
 * @param {string} message - Error message to display
 */
function showErrorState(message) {
  const grid = $('#links-grid');
  if (!grid) return;
  
  grid.innerHTML = `<div class="error-state" role="alert">${message}</div>`;
}

/**
 * Renders link cards to the grid
 */
export function renderLinks() {
  const grid = $('#links-grid');
  const empty = $('#empty-state');
  
  if (!grid) return;
  
  grid.innerHTML = '';
  const items = LINKS.slice();
  
  if (!items.length) {
    if (empty) empty.hidden = false;
    return;
  }
  
  if (empty) empty.hidden = true;
  
  items.forEach(item => {
    const card = createLinkCard(item);
    grid.appendChild(card);
  });
}

/**
 * Creates a link card element from link data
 * @param {Object} item - Link item data
 * @returns {HTMLElement} Link card element
 */
function createLinkCard(item) {
  const a = document.createElement('a');
  a.href = item.url;
  a.className = 'link-card';
  a.setAttribute('aria-label', (item.title || '') + (item.description ? ('. ' + item.description) : ''));
  
  // Track clicks
  a.addEventListener('click', () => {
    trackLinkClick(item.url, item.title);
  });
  
  const content = document.createElement('div');
  content.className = 'link-content';
  
  const icon = document.createElement('div');
  icon.className = 'link-icon';
  icon.innerHTML = item.icon || '';
  
  const title = document.createElement('div');
  title.className = 'link-title';
  title.textContent = item.title || '';
  
  const desc = document.createElement('div');
  desc.className = 'link-desc';
  desc.textContent = item.description || '';
  
  content.appendChild(icon);
  content.appendChild(title);
  if (item.description) content.appendChild(desc);
  
  if (item.section) {
    const slug = item.section.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    a.classList.add('section-' + slug);
    const badge = document.createElement('div');
    badge.className = 'section-badge';
    badge.textContent = item.section;
    a.appendChild(badge);
  }
  
  a.appendChild(content);
  return a;
}

/**
 * Collects all links from various sources for global search
 * @returns {Promise<Array>} Promise resolving to array of all links
 */
function collectAllLinksForSearch() {
  // Prefer modular files if possible. Use fixed sections + UNED subjects discovered from data/uned-subjects.json
  function fetchArr(path) {
    return fetchJSON(path)
      .then(a => Array.isArray(a) ? a : [])
      .catch(() => []);
  }
  
  const basic = [
    fetchArr('data/links/home.json'),
    fetchArr('data/links/travel.json'),
    fetchArr('data/links/content.json'),
    fetchArr('data/links/uned/common.json')
  ];
  
  const withSubjects = fetchJSON('data/uned-subjects.json').then(list => {
    const slugs = [];
    (Array.isArray(list) ? list : []).forEach(g => {
      (g.asignaturas || []).forEach(it => {
        const href = String(it.href || '');
        const m = /#([a-z0-9\-]+)/i.exec(href);
        const slug = m ? m[1].toLowerCase() : null;
        if (slug && slugs.indexOf(slug) === -1) slugs.push(slug);
      });
    });
    return Promise.all(slugs.map(s => fetchArr(`data/links/uned/subjects/${s}.json`)))
      .then(arrs => arrs.flat());
  });
  
  return Promise.all([Promise.all(basic).then(x => x.flat()), withSubjects])
    .then(([b, subs]) => b.concat(subs));
}

/**
 * Binds search functionality to the search input
 * Supports both local filtering and global search on home page
 */
export function bindSearch() {
  const input = $('#search-input');
  if (!input) return;
  
  const performSearch = debounce(() => {
    const q = (input.value || '').trim().toLowerCase();
    const isHome = (location.pathname || '').split('/').pop() === 'index.html' || 
                   (location.pathname || '') === '/';
    
    if (!q) {
      renderLinks();
      return;
    }
    
    if (isHome) {
      // Global search across all sections
      collectAllLinksForSearch().then(combined => {
        const filtered = combined.filter(l =>
          ((l.title || '') + ' ' + (l.description || '')).toLowerCase().includes(q)
        );
        renderFilteredLinks(filtered);
      });
    } else {
      // Local search in current section
      const filtered = LINKS.filter(l =>
        ((l.title || '') + ' ' + (l.description || '')).toLowerCase().includes(q)
      );
      renderFilteredLinks(filtered);
    }
  }, 300);
  
  input.addEventListener('input', performSearch);
}

/**
 * Renders filtered links to the grid
 * @param {Array} items - Filtered link items
 */
function renderFilteredLinks(items) {
  const grid = $('#links-grid');
  const empty = $('#empty-state');
  
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (!items.length) {
    if (empty) empty.hidden = false;
    return;
  }
  
  if (empty) empty.hidden = true;
  
  items.forEach(item => {
    const card = createLinkCard(item);
    grid.appendChild(card);
  });
}

/**
 * Renders common UNED links if the container is present
 */
export function renderCommonLinksIfPresent() {
  const grid = document.querySelector('#common-links-grid');
  if (!grid) return;
  
  const cache = getUnifiedLinksCache();
  if (cache && cache.uned && Array.isArray(cache.uned.common)) {
    doRender(cache.uned.common);
    return;
  }
  
  fetchJSON('data/links/uned/common.json').then(items => {
    if (Array.isArray(items) && items.length) {
      doRender(items);
    } else {
      return fetchJSON('data/links.json').then(idx => {
        const arr = idx && idx.uned && Array.isArray(idx.uned.common) ? idx.uned.common : null;
        if (arr) {
          doRender(arr);
        } else {
          return fetchJSON('data/uned-common-links.json').then(legacy => doRender(legacy || []));
        }
      });
    }
  });
  
  function doRender(items) {
    grid.innerHTML = '';
    (items || []).forEach(item => {
      const card = createLinkCard(item);
      grid.appendChild(card);
    });
  }
}
