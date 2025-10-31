// Shared DOM + data helpers
export function $(sel){ return document.querySelector(sel); }
export function $all(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
export function fetchJSON(path){ return fetch(path, {cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null); }
export function getByKeyPath(obj, keyPath){ try{ if(!obj||!keyPath) return null; return keyPath.split('.').reduce((acc,k)=>acc&&acc[k], obj);}catch(_){return null;} }
export function inferLinksKeyFromPath(){ const page=(location.pathname||'').split('/').pop()||'index.html'; if(page==='index.html'||page==='') return 'home'; if(page==='travel.html') return 'travel'; if(page==='contenido.html') return 'content'; return 'home'; }
export function inferSubjectFromPath(){ return null; }
