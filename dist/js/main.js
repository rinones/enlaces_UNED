import { loadTheme, bindThemeToggle } from './theme.js';
import { markActiveNav } from './nav.js';
import { loadLinks, renderLinks, bindSearch, renderCommonLinksIfPresent } from './links.js';
import { NOTICES } from './notices.js';
import { initUpcoming } from './upcoming.js';
import { initUnedPage } from './uned-page.js';
// calendar page and its password logic removed — initCalendar import removed

function init(){
  loadTheme();
  bindThemeToggle();
  markActiveNav();
  // Dropdown UNED eliminado de la barra de navegación
  // Links + search
  loadLinks().then(()=>{ renderLinks(); bindSearch(); });
  // Notices
  NOTICES.init();
  // Upcoming
  initUpcoming();
  // UNED page
  initUnedPage();
  // Common links (for subject pages)
  renderCommonLinksIfPresent();
  // calendar removed: no-op
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
