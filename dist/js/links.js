import { $, fetchJSON, getByKeyPath, inferLinksKeyFromPath } from './utils.js';

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

export function loadLinks(){
  const explicitPath = (window && window.LINKS_PATH) ? String(window.LINKS_PATH) : null; // legacy override
  const key = (window && window.LINKS_KEY) ? String(window.LINKS_KEY) : inferLinksKeyFromPath();
  const modularPath = pathFromKey(key);
  const tryModular = modularPath ? fetchJSON(modularPath) : Promise.resolve(null);
  return tryModular.then(json=>{
    if(Array.isArray(json)) { LINKS=json; return; }
    // fallback to unified links.json as index
    return fetchJSON('data/links.json').then(idx=>{
      if(Array.isArray(idx)) { UNIFIED_LINKS_CACHE=null; LINKS=idx; return; }
      if(idx && typeof idx==='object'){
        UNIFIED_LINKS_CACHE = idx;
        const arr = getByKeyPath(idx, key);
        LINKS = Array.isArray(arr) ? arr : [];
        return;
      }
      // fallback to legacy explicit path or old defaults
      const legacy = explicitPath || 'data/uned-links.json';
      return fetchJSON(legacy).then(arr=>{ LINKS = Array.isArray(arr)?arr:[]; });
    });
  });
}

export function renderLinks(){ const grid=$('#links-grid'); const empty=$('#empty-state'); if(!grid) return; grid.innerHTML=''; const items = LINKS.slice(); if(!items.length){ if(empty) empty.hidden=false; return; } if(empty) empty.hidden=true; items.forEach(item=>{ const a=document.createElement('a'); a.href=item.url; a.className='link-card'; a.setAttribute('aria-label', (item.title||'') + (item.description?('. '+item.description):'')); const content=document.createElement('div'); content.className='link-content'; const icon=document.createElement('div'); icon.className='link-icon'; icon.innerHTML=item.icon||''; const title=document.createElement('div'); title.className='link-title'; title.textContent=item.title||''; const desc=document.createElement('div'); desc.className='link-desc'; desc.textContent=item.description||''; content.appendChild(icon); content.appendChild(title); if(item.description) content.appendChild(desc); if(item.section){ const slug=item.section.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,''); a.classList.add('section-'+slug); const badge=document.createElement('div'); badge.className='section-badge'; badge.textContent=item.section; a.appendChild(badge);} a.appendChild(content); grid.appendChild(a); }); }

function collectAllLinksForSearch(){
  // Prefer modular files if possible. Use fixed sections + UNED subjects discovered from data/uned-subjects.json
  function fetchArr(path){ return fetchJSON(path).then(a=>Array.isArray(a)?a:[]).catch(()=>[]); }
  const basic = [
    fetchArr('data/links/home.json'),
    fetchArr('data/links/travel.json'),
    fetchArr('data/links/content.json'),
    fetchArr('data/links/uned/common.json')
  ];
  const withSubjects = fetchJSON('data/uned-subjects.json').then(list=>{
    const slugs=[]; (Array.isArray(list)?list:[]).forEach(g=>{ (g.asignaturas||[]).forEach(it=>{ const href=String(it.href||''); const m=/#([a-z0-9\-]+)/i.exec(href); const slug=m?m[1].toLowerCase():null; if(slug && slugs.indexOf(slug)===-1) slugs.push(slug); }); });
    return Promise.all(slugs.map(s=>fetchArr(`data/links/uned/subjects/${s}.json`))).then(arrs=>arrs.flat());
  });
  return Promise.all([Promise.all(basic).then(x=>x.flat()), withSubjects]).then(([b, subs])=>b.concat(subs));
}

export function bindSearch(){ const input=$('#search-input'); if(!input) return; input.addEventListener('input', ()=>{ const q=(input.value||'').trim().toLowerCase(); const isHome=(location.pathname||'').split('/').pop()==='index.html' || (location.pathname||'')==='/'; if(!q){ renderLinks(); return; } if(isHome){ collectAllLinksForSearch().then(combined=>{ const filtered=combined.filter(l=> ((l.title||'')+' '+(l.description||'')).toLowerCase().includes(q)); // render temp
  const grid=$('#links-grid'); if(!grid) return; grid.innerHTML=''; filtered.forEach(item=>{ const a=document.createElement('a'); a.href=item.url; a.className='link-card'; const content=document.createElement('div'); content.className='link-content'; const icon=document.createElement('div'); icon.className='link-icon'; icon.innerHTML=item.icon||''; const title=document.createElement('div'); title.className='link-title'; title.textContent=item.title||''; const desc=document.createElement('div'); desc.className='link-desc'; desc.textContent=item.description||''; content.appendChild(icon); content.appendChild(title); if(item.description) content.appendChild(desc); a.appendChild(content); grid.appendChild(a); }); }); } else { const grid=$('#links-grid'); const empty=$('#empty-state'); const filtered = LINKS.filter(l=> ((l.title||'')+' '+(l.description||'')).toLowerCase().includes(q)); grid.innerHTML=''; if(!filtered.length){ if(empty) empty.hidden=false; return; } if(empty) empty.hidden=true; filtered.forEach(item=>{ const a=document.createElement('a'); a.href=item.url; a.className='link-card'; const content=document.createElement('div'); content.className='link-content'; const icon=document.createElement('div'); icon.className='link-icon'; icon.innerHTML=item.icon||''; const title=document.createElement('div'); title.className='link-title'; title.textContent=item.title||''; const desc=document.createElement('div'); desc.className='link-desc'; desc.textContent=item.description||''; content.appendChild(icon); content.appendChild(title); if(item.description) content.appendChild(desc); a.appendChild(content); grid.appendChild(a); }); } }); }

export function renderCommonLinksIfPresent(){ const grid=document.querySelector('#common-links-grid'); if(!grid) return; const cache=getUnifiedLinksCache(); if(cache && cache.uned && Array.isArray(cache.uned.common)){ doRender(cache.uned.common); return; }
  fetchJSON('data/links/uned/common.json').then(items=>{ if(Array.isArray(items) && items.length){ doRender(items); } else { return fetchJSON('data/links.json').then(idx=>{ const arr=idx && idx.uned && Array.isArray(idx.uned.common) ? idx.uned.common : null; if(arr) doRender(arr); else return fetchJSON('data/uned-common-links.json').then(legacy=>doRender(legacy||[])); }); } });
  function doRender(items){ grid.innerHTML=''; (items||[]).forEach(item=>{ const a=document.createElement('a'); a.href=item.url; a.className='link-card'; const content=document.createElement('div'); content.className='link-content'; const icon=document.createElement('div'); icon.className='link-icon'; icon.innerHTML=item.icon||''; const title=document.createElement('div'); title.className='link-title'; title.textContent=item.title||''; const desc=document.createElement('div'); desc.className='link-desc'; desc.textContent=item.description||''; content.appendChild(icon); content.appendChild(title); if(item.description) content.appendChild(desc); a.appendChild(content); grid.appendChild(a); }); }
}
