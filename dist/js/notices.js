import { $ } from './utils.js';

export const NOTICES = (function(){
  const NOTICES_PATH='data/notices.json';
  const STORAGE_KEY='site:notices:v1';
  const REAPPEAR_MS = 30*60*1000;
  let notices=[], state={}, showing=null, timers={};
  function getToday(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function loadState(){ try{ const raw=localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):{}; }catch(_){ return {}; } }
  function saveState(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); localStorage.setItem(STORAGE_KEY+':updatedAt', String(Date.now())); }catch(_){} }
  function shouldShow(n){ const s=state[n.id]||{}; const now=Date.now(); if(s.seen) return false; if(s.lastClosedAt && (now-s.lastClosedAt)<REAPPEAR_MS) return false; if(s.lastShownDate===getToday()){ if(s.lastClosedAt && (now-s.lastClosedAt)>=REAPPEAR_MS) return true; return false; } return true; }
  function createModal(n){ const overlay=document.createElement('div'); overlay.className='site-modal-overlay'; overlay.tabIndex=-1; const modal=document.createElement('div'); modal.className='retro-notice-popup'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-label', n.title||'Aviso'); const bodyWrap=document.createElement('div'); bodyWrap.className='notice-body'; if(n.title){ const h=document.createElement('h2'); h.textContent=n.title; bodyWrap.appendChild(h); } const content=document.createElement('div'); content.className='notice-content'; content.innerHTML=n.html||''; bodyWrap.appendChild(content); const actions=document.createElement('div'); actions.className='retro-notice-actions'; const markBtn=document.createElement('button'); markBtn.className='notice-action'; markBtn.textContent='Marcar como visto'; const closeBtn=document.createElement('button'); closeBtn.className='notice-close'; closeBtn.textContent='Cerrar'; actions.appendChild(markBtn); actions.appendChild(closeBtn); bodyWrap.appendChild(actions); modal.appendChild(bodyWrap); document.body.appendChild(overlay); document.body.appendChild(modal); markBtn.focus(); function cleanup(){ try{ modal.remove(); overlay.remove(); }catch(_){} showing=null; }
    markBtn.addEventListener('click', ()=>{ state[n.id]=state[n.id]||{}; state[n.id].seen=true; if(timers[n.id]){ clearTimeout(timers[n.id]); delete timers[n.id]; } saveState(); cleanup(); });
    closeBtn.addEventListener('click', ()=>{ state[n.id]=state[n.id]||{}; state[n.id].lastClosedAt=Date.now(); state[n.id].lastShownDate=getToday(); saveState(); if(timers[n.id]) clearTimeout(timers[n.id]); timers[n.id]=setTimeout(()=>{ if(shouldShow(n)) showOne(n.id); }, REAPPEAR_MS+1000); cleanup(); });
    function onKey(e){ if(e.key==='Escape') closeBtn.click(); }
    document.addEventListener('keydown', onKey, {once:true});
  }
  function showOne(id){ if(showing) return; const n=notices.find(x=>x.id===id); if(!n) return; state=loadState(); if(state[n.id] && state[n.id].seen) return; if(state[n.id] && state[n.id].lastClosedAt && (Date.now()-state[n.id].lastClosedAt)<REAPPEAR_MS) return; showing=n.id; state[n.id]=state[n.id]||{}; state[n.id].lastShownDate=getToday(); saveState(); createModal(n); }
  function scanAndShow(){ state=loadState(); const c=notices.filter(shouldShow); if(!c.length) return; c.sort((a,b)=>(a.priority||0)-(b.priority||0) || String(a.id).localeCompare(String(b.id))); showOne(c[0].id); }
  function init(){ fetch(NOTICES_PATH).then(r=>r.ok?r.json():null).then(json=>{ if(Array.isArray(json)) notices=json; setTimeout(scanAndShow, 300); }).catch(()=>{}); window.addEventListener('storage', e=>{ if(!e.key) return; if(e.key===STORAGE_KEY || e.key===STORAGE_KEY+':updatedAt'){ state=loadState(); if(showing){ const s=state[showing]; if(s && s.seen){ const el=document.querySelector('.retro-notice-popup'); if(el) el.remove(); const ov=document.querySelector('.site-modal-overlay'); if(ov) ov.remove(); showing=null; } } } }); }
  return { init };
})();
