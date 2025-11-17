import { loadTheme, bindThemeToggle } from './theme.js';
import { markActiveNav } from './nav.js';
import { loadLinks, renderLinks, bindSearch, renderCommonLinksIfPresent } from './links.js';
import { NOTICES } from './notices.js';
import { initUpcoming } from './upcoming.js';
import { initUnedPage } from './uned-page.js';

function init(){
  loadTheme();
  bindThemeToggle();
  markActiveNav();
  loadLinks().then(()=>{ renderLinks(); bindSearch(); });
  NOTICES.init();
  initUpcoming();
  initUnedPage();
  renderCommonLinksIfPresent();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
