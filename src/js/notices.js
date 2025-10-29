// Módulo de avisos retro (persistencia local en localStorage)
(function(){
  const NOTICES_PATH = 'data/notices.json';
  const STORAGE_KEY = 'site:notices:v1'; // versión incluida para migraciones
  const REAPPEAR_MS = 30 * 60 * 1000; // 30 minutos

  let notices = [];
  let state = {};
  let showing = null; // id mostrado actualmente
  let pendingTimers = {};

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return {};
      return JSON.parse(raw) || {};
    }catch(e){ console.warn('[notices] no se pudo parsear state', e); return {}; }
  }

  function saveState(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // también escribimos un timestamp auxiliar para forzar evento storage en algunas pruebas
      localStorage.setItem(STORAGE_KEY+':updatedAt', String(Date.now()));
    }catch(e){ console.warn('[notices] no se pudo guardar state', e); }
  }

  function getTodayString(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function shouldShow(n){
    const s = state[n.id] || {};
    if(s.seen) return false;
    const now = Date.now();
    // if closed recently
    if(s.lastClosedAt && (now - s.lastClosedAt) < REAPPEAR_MS) return false;
    // if already shown today, don't show again unless lastClosedAt older than REAPPEAR_MS
    if(s.lastShownDate === getTodayString()){
      // if it was shown today but closed and more than REAPPEAR_MS passed, allow
      if(s.lastClosedAt && (now - s.lastClosedAt) >= REAPPEAR_MS) return true;
      return false;
    }
    return true;
  }

  function createModal(notice){
    // overlay
    const overlay = document.createElement('div'); overlay.className = 'site-modal-overlay';
    overlay.tabIndex = -1;

    const modal = document.createElement('div'); modal.className = 'retro-notice-popup';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-label', notice.title || 'Aviso');

    // content
    const mediaWrap = document.createElement('div'); mediaWrap.className = 'notice-media';
    const bodyWrap = document.createElement('div'); bodyWrap.className = 'notice-body';

    // title (solo crear si existe para permitir avisos que solo contienen media)
    if(notice.title){
      const h = document.createElement('h2');
      h.textContent = notice.title;
      bodyWrap.appendChild(h);
    }

    // insert HTML content (controlled by site editor)
    const contentHolder = document.createElement('div');
    contentHolder.className = 'notice-content';
    contentHolder.innerHTML = notice.html || '';
    bodyWrap.appendChild(contentHolder);

    // actions
    const actions = document.createElement('div'); actions.className = 'retro-notice-actions';
    const markBtn = document.createElement('button'); markBtn.className = 'notice-action'; markBtn.textContent = 'Marcar como visto';
    const closeBtn = document.createElement('button'); closeBtn.className = 'notice-close'; closeBtn.textContent = 'Cerrar';
    actions.appendChild(markBtn); actions.appendChild(closeBtn);
    bodyWrap.appendChild(actions);

    modal.appendChild(mediaWrap);
    modal.appendChild(bodyWrap);

    // attach
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // focus management: focus first button
    markBtn.focus();

    function cleanup(){
      try{ if(modal.parentNode) modal.parentNode.removeChild(modal); }catch(e){}
      try{ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); }catch(e){}
      showing = null;
    }

    // handlers
    markBtn.addEventListener('click', ()=>{
      state[notice.id] = state[notice.id] || {};
      state[notice.id].seen = true;
      // clear timers
      if(pendingTimers[notice.id]){ clearTimeout(pendingTimers[notice.id]); delete pendingTimers[notice.id]; }
      saveState();
      cleanup();
    });

    closeBtn.addEventListener('click', ()=>{
      state[notice.id] = state[notice.id] || {};
      state[notice.id].lastClosedAt = Date.now();
      state[notice.id].lastShownDate = getTodayString();
      saveState();
      // schedule re-show in REAPPEAR_MS while still on page
      if(pendingTimers[notice.id]) clearTimeout(pendingTimers[notice.id]);
      pendingTimers[notice.id] = setTimeout(()=>{
        // re-evaluate and show if still applicable
        if(shouldShow(notice)) showOne(notice.id);
      }, REAPPEAR_MS + 1000);
      cleanup();
    });

    // keyboard: ESC closes
    function onKey(e){ if(e.key === 'Escape'){ closeBtn.click(); } }
    document.addEventListener('keydown', onKey);

    // when removed, cleanup listener
    const observer = new MutationObserver(()=>{
      if(!document.body.contains(modal)){
        document.removeEventListener('keydown', onKey);
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList:true});
  }

  function showOne(id){
    if(showing) return; // only one at a time
    const n = notices.find(x => x.id === id);
    if(!n) return;
    // double-check state
    state = loadState();
    if(state[n.id] && state[n.id].seen) return;
    if(state[n.id] && state[n.id].lastClosedAt && (Date.now() - state[n.id].lastClosedAt) < REAPPEAR_MS) return;
    showing = n.id;
    // mark lastShownDate
    state[n.id] = state[n.id] || {};
    state[n.id].lastShownDate = getTodayString();
    saveState();
    createModal(n);
  }

  function scanAndShow(){
    state = loadState();
    const candidates = notices.filter(n => shouldShow(n));
    if(candidates.length === 0) return;
    // sort by optional priority (not present in examples) then by id
    candidates.sort((a,b)=> (a.priority||0) - (b.priority||0) || a.id.localeCompare(b.id));
    showOne(candidates[0].id);
  }

  // listen storage changes from other tabs
  window.addEventListener('storage', (e)=>{
    if(!e.key) return;
    if(e.key === STORAGE_KEY || e.key === STORAGE_KEY+':updatedAt'){
      // reload local state
      state = loadState();
      // if the currently showing notice was marked seen elsewhere, close it by removing DOM
      if(showing){ const s = state[showing]; if(s && s.seen){ // remove modal if present
          const el = document.querySelector('.retro-notice-popup'); if(el) el.remove();
          const ov = document.querySelector('.site-modal-overlay'); if(ov) ov.remove();
          showing = null;
        }
      }
    }
  });

  // init
  async function init(){
    try{
      const res = await fetch(NOTICES_PATH);
      if(!res.ok) return;
      const json = await res.json();
      if(!Array.isArray(json)) return;
      notices = json;
      // schedule scan after small delay to avoid race with other inits
      setTimeout(scanAndShow, 300);
    }catch(e){ console.warn('[notices] no se pudieron cargar avisos', e); }
  }

  // expose for debugging
  window.SITE_NOTICES = { init };

  // auto init when DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
