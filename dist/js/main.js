import { loadTheme, bindThemeToggle } from './theme.js';
import { markActiveNav } from './nav.js';
import { loadLinks, renderLinks, bindSearch, renderCommonLinksIfPresent } from './links.js';
import { NOTICES } from './notices.js';
import { initUpcoming } from './upcoming.js';
import { initUnedPage } from './uned-page.js';
import { initCalendar } from './calendar.js';

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
  // Calendar
  initCalendar();
  // After calendar is initialized, decorate any notes marked as important in localStorage
  // This looks for stored notes (localStorage keys starting with 'notes:') and adds the
  // class 'important-blink' to matching .note-pill elements and 'upcoming-important' to
  // matching upcoming list items so the CSS highlight is visible in calendar and panels.
  (function decorateImportantNotes(){
    // delay slightly to allow calendar/upcoming render to finish
    setTimeout(()=>{
      try{
        const pills = Array.from(document.querySelectorAll('.note-pill'));
        const upcomingNodes = Array.from(document.querySelectorAll('.upcoming-list .upcoming-item'));
        Object.keys(localStorage).forEach(k=>{
          if(!k.startsWith('notes:')) return;
          let arr; try{ arr = JSON.parse(localStorage.getItem(k)||'[]'); }catch(_){ arr = []; }
          (arr||[]).forEach(n=>{
            if(n && n.important){
              // match calendar pills by exact trimmed text
              pills.forEach(p=>{ if(p.textContent && p.textContent.trim()===String(n.text||'').trim()){ p.classList.add('important-blink'); } });
              // match upcoming items by title text inside .upcoming-link
              upcomingNodes.forEach(li=>{
                const titleEl = li.querySelector('.upcoming-link');
                if(titleEl && titleEl.textContent && titleEl.textContent.trim()===String(n.text||'').trim()){
                  li.classList.add('upcoming-important');
                  titleEl.classList.add('important-blink');
                }
              });
            }
          });
        });
      }catch(_){ /* no-op */ }
    }, 120);
  })();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
