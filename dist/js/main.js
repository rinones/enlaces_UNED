import { loadTheme, bindThemeToggle } from './theme.js';
import { markActiveNav, enhanceNavDropdowns, buildUnedDropdown } from './nav.js';
import { loadLinks, renderLinks, bindSearch, renderCommonLinksIfPresent } from './links.js';
import { NOTICES } from './notices.js';
import { initUpcoming } from './upcoming.js';
import { initUnedPage } from './uned-page.js';
import { initCalendar } from './calendar.js';
import { initKeyboardShortcuts } from './keyboard.js';

/**
 * Register service worker for offline support
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }
}

function init(){
  loadTheme();
  bindThemeToggle();
  markActiveNav();
  enhanceNavDropdowns();
  buildUnedDropdown();
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
  // Calendar
  initCalendar();
  // Service Worker
  registerServiceWorker();
  // Keyboard shortcuts
  initKeyboardShortcuts();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
