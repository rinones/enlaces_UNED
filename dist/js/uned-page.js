import { $, fetchJSON, inferLinksKeyFromPath } from './utils.js';
import { getUnifiedLinksCache } from './links.js';

function slugify(name){ return String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function parseSel(){ const url=new URL(location.href); let s=url.searchParams.get('asignatura') || url.hash.replace(/^#/,''); s=(s||'').trim().toLowerCase(); return s||null; }
function formatDateShort(d){ try{ return d.toLocaleDateString('es-ES',{day:'2-digit',month:'short'});}catch(_){ const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return dd+'/'+mm; } }
function parseYMD(ymd){ const m=/(\d{4})-(\d{2})-(\d{2})/.exec(String(ymd||'')); if(!m) return null; return new Date(+m[1], +m[2]-1, +m[3]); }
function today0(){ const d=new Date(); d.setHours(0,0,0,0); return d; }

function renderLinksGrid(gridEl, items){ if(!gridEl) return; gridEl.innerHTML=''; (items||[]).forEach(item=>{ const a=document.createElement('a'); a.href=item.url; a.className='link-card'; const content=document.createElement('div'); content.className='link-content'; const icon=document.createElement('div'); icon.className='link-icon'; icon.innerHTML=item.icon||''; const title=document.createElement('div'); title.className='link-title'; title.textContent=item.title||''; const desc=document.createElement('div'); desc.className='link-desc'; desc.textContent=item.description||''; content.appendChild(icon); content.appendChild(title); if(item.description) content.appendChild(desc); a.appendChild(content); gridEl.appendChild(a); }); }

function collectSubjectSlugs(subjects){ const slugs=[]; subjects.forEach(g=>{ (g.asignaturas||[]).forEach(it=>{ const s=slugify(it.nombre); if(s && slugs.indexOf(s)===-1) slugs.push(s); }); }); return slugs; }

export function initUnedPage(){
  const selectorEl=$('#uned-subject-selector'); if(!selectorEl) return; const titleEl=$('#uned-title'); const subtitleEl=$('#uned-subtitle'); const upcomingTitleEl=$('#upcoming-title'); const upcomingEl=$('#uned-upcoming'); const upcomingEmptyEl=$('#uned-upcoming-empty'); const commonGrid=$('#common-links-grid'); const subjGrid=$('#subject-links-grid'); const subjEmpty=$('#subject-empty-state'); const subjLinksTitle=$('#subject-links-title'); const subjExtras=$('#subject-extras');
  let selected=parseSel(); let subjects=[];
  // Toggle LED indicators based on buttons' data-btn-id matching indicator data-led-id
  function updateIndicators(){
    if(!selectorEl) return;
    // find all buttons with a data-btn-id inside the selector
    const allBtns = selectorEl.querySelectorAll('[data-btn-id]');
    allBtns.forEach(b=>{
      const id = b.getAttribute('data-btn-id');
      if(!id) return;
      const led = selectorEl.querySelector('[data-led-id="'+id+'"]');
      if(!led) return;
      const pressed = b.getAttribute('aria-pressed')==='true' || b.classList.contains('active') || b.classList.contains('is-active');
      if(pressed) led.classList.add('led-on'); else led.classList.remove('led-on');
    });
  }
  function updateUrl(sel){ const url=new URL(location.href); if(sel){ url.hash=sel; history.replaceState(null,'',url.toString()); } else { url.hash=''; history.replaceState(null,'',url.pathname + url.search); } }
  function setSelected(slug){ if(selected===slug) slug=null; selected=slug||null; updateUrl(selected); renderAll(); }
  function renderSelector(){
    // If the page already contains a static botonera (pre-rendered markup),
    // preserve it to avoid visual flicker and only attach event handlers.
    if(selectorEl && selectorEl.children && selectorEl.children.length > 0){
      const existingBtns = selectorEl.querySelectorAll('[data-subject]');
      existingBtns.forEach(btn=>{
        // avoid duplicate handlers
        btn.replaceWith(btn.cloneNode(true));
      });
      // re-query after cloning
      const buttons = selectorEl.querySelectorAll('[data-subject]');
      buttons.forEach(btn=>{
        const subj = (btn.getAttribute('data-subject')||'').trim().toLowerCase();
        btn.addEventListener('click', ()=>{ setSelected(subj); });
      });
      // reflect current selection state
      buttons.forEach(btn=>{
        const subj = (btn.getAttribute('data-subject')||'').trim().toLowerCase();
        const isSel = !!selected && subj===selected;
        if(isSel){ btn.classList.add('active'); btn.setAttribute('aria-pressed','true'); }
        else { btn.classList.remove('active'); btn.setAttribute('aria-pressed','false'); }
      });
      // Update LED indicators to match active buttons (data-btn-id -> data-led-id)
      updateIndicators();
      return;
    }

    // Fallback: build dynamic selector when no static markup exists
    selectorEl.innerHTML='';
    const groups=subjects.slice().sort((a,b)=> (a.curso||0)-(b.curso||0) || (a.cuatrimestre||0)-(b.cuatrimestre||0));
    groups.forEach(g=>{
      const sec=document.createElement('div');
      sec.className='mega-section';
      const title=document.createElement('div');
      title.className='mega-title';
      const t=(g.curso?(g.curso+'º'):'') + (g.cuatrimestre?(' · '+(g.cuatrimestre===1?'1er':'2º')+' cuatrimestre'):'');
      title.textContent=t||'Asignaturas';
      sec.appendChild(title);
      const list=document.createElement('div');
      list.className='mega-list';
      const items=(g.asignaturas||[]).slice().sort((a,b)=>(a.nombre||'').localeCompare(b.nombre||'','es',{sensitivity:'base'}));
      items.forEach(it=>{
        const s=slugify(it.nombre);
  const btn=document.createElement('button');
  btn.type='button';
  // keep semantic subject-btn but also apply botonera visual class
  btn.className='subject-btn btn-rect-custom';
        // when generating dynamically we may not have a data-btn-id mapping; keep empty
        // consumers relying on LEDs should provide static markup with data-btn-id attributes.
        btn.textContent=it.nombre;
        const isSel=!!selected && s===selected;
        btn.setAttribute('aria-pressed', isSel? 'true':'false');
        if(isSel) btn.classList.add('is-active');
        btn.addEventListener('click', ()=>{ setSelected(s); });
        list.appendChild(btn);
      });
      sec.appendChild(list);
      selectorEl.appendChild(sec);
    });
  }
  function loadAllUpcoming(){
    // Prefer modular activities
    const slugs=collectSubjectSlugs(subjects);
    const currentPage = inferLinksKeyFromPath();
    return Promise.all(slugs.map(s=>fetchJSON(`data/activities/subjects/${s}.json`).then(a=>[s, Array.isArray(a)?a:[]]))).then(pairs=>{
      const now=today0(); const items=[];
      pairs.forEach(([s,a])=>{ a.forEach(x=>{ const d=parseYMD(x.date||x.ymd); if(!d) return; // page filtering
        if(x.pages && Array.isArray(x.pages) && x.pages.indexOf(currentPage)===-1) return;
        if(x.page && String(x.page)!==currentPage) return;
        // subject: if present, ensure it matches the file slug
        if(x.subject && String(x.subject).toLowerCase()!==s) return;
        items.push({date:d, title:String(x.title||x.text||'Actividad'), link:x.link||'', important: !!x.important}); }); });
      if(items.length) return items.filter(x=>x.date>=now).sort((a,b)=>a.date-b.date || a.title.localeCompare(b.title)).slice(0,10);
      // fallback to unified
        return fetchJSON('data/activities.json').then(json=>{ if(json && json.subjects){ const now=today0(); const items=[]; Object.keys(json.subjects||{}).forEach(k=>{ (json.subjects[k]||[]).forEach(x=>{ const d=parseYMD(x.date||x.ymd); if(!d) return; if(x.pages && Array.isArray(x.pages) && x.pages.indexOf(currentPage)===-1) return; if(x.page && String(x.page)!==currentPage) return; items.push({date:d, title:String(x.title||x.text||'Actividad'), link:x.link||'', important: !!x.important}); }); }); return items.filter(x=>x.date>=now).sort((a,b)=>a.date-b.date || a.title.localeCompare(b.title)).slice(0,10);} return []; });
    });
  }
  function loadUpcomingFor(slug){
    const currentPage = inferLinksKeyFromPath();
    return fetchJSON(`data/activities/subjects/${slug}.json`).then(arr=>Array.isArray(arr)?arr:[]).then(arr=>{ if(arr.length){ const now=today0(); return arr.map(x=>({raw:x, date:parseYMD(x.date||x.ymd), title:String(x.title||x.text||'Actividad'), link:x.link||''})).filter(item=>{ if(!item.date) return false; const x=item.raw; if(x.pages && Array.isArray(x.pages) && x.pages.indexOf(currentPage)===-1) return false; if(x.page && String(x.page)!==currentPage) return false; if(x.subject && String(x.subject).toLowerCase()!==slug) return false; return item.date && item.date>=now; }).sort((a,b)=>a.date-b.date || a.title.localeCompare(b.title)).slice(0,10).map(it=>({date:it.date, title:it.title, link:it.link, important: !!(it.raw && it.raw.important)})); }
      return fetchJSON('data/activities.json').then(json=>{ if(json && json.subjects && Array.isArray(json.subjects[slug])){ const arr=json.subjects[slug]||[]; const now=today0(); return arr.map(x=>({raw:x, date:parseYMD(x.date||x.ymd), title:String(x.title||x.text||'Actividad'), link:x.link||''})).filter(item=>{ if(!item.date) return false; const x=item.raw; if(x.pages && Array.isArray(x.pages) && x.pages.indexOf(currentPage)===-1) return false; if(x.page && String(x.page)!==currentPage) return false; return item.date && item.date>=now; }).sort((a,b)=>a.date-b.date || a.title.localeCompare(b.title)).slice(0,10).map(it=>({date:it.date, title:it.title, link:it.link, important: !!(it.raw && it.raw.important)})); } return []; });
    });
  }
  function clearSubjectLinks(){ if(subjGrid) subjGrid.innerHTML=''; if(subjEmpty) subjEmpty.hidden=true; if(subjLinksTitle) subjLinksTitle.hidden=true; }
  function clearExtras(){ if(subjExtras){ subjExtras.hidden=true; subjExtras.innerHTML=''; } }
  function loadCommonLinks(){
    // Prefer modular
    return fetchJSON('data/links/uned/common.json').then(items=>{ if(Array.isArray(items)) renderLinksGrid(commonGrid, items); else {
      // fallback to unified index then legacy
      const cache=getUnifiedLinksCache(); if(cache && cache.uned && Array.isArray(cache.uned.common)) renderLinksGrid(commonGrid, cache.uned.common);
      else return fetchJSON('data/links.json').then(idx=>{ const arr=idx && idx.uned && Array.isArray(idx.uned.common) ? idx.uned.common : null; if(arr) renderLinksGrid(commonGrid, arr); else return fetchJSON('data/uned-common-links.json').then(legacy=>renderLinksGrid(commonGrid, legacy||[])); });
    }});
  }
  function loadSubjectLinks(slug){
    return fetchJSON(`data/links/uned/subjects/${slug}.json`).then(items=>Array.isArray(items)?items:null).then(items=>{
      if(items){ renderLinksGrid(subjGrid, items); const has=items.length>0; if(subjEmpty) subjEmpty.hidden=has; if(subjLinksTitle){ subjLinksTitle.hidden=!has; subjLinksTitle.textContent='Enlaces de asignatura'; } return; }
      const cache=getUnifiedLinksCache(); if(cache && cache.uned && cache.uned.subjects && Array.isArray(cache.uned.subjects[slug])){ const arr=cache.uned.subjects[slug]; renderLinksGrid(subjGrid, arr); const has=arr.length>0; if(subjEmpty) subjEmpty.hidden=has; if(subjLinksTitle){ subjLinksTitle.hidden=!has; subjLinksTitle.textContent='Enlaces de asignatura'; } return; }
      return fetchJSON('data/links.json').then(idx=>{ const arr=idx && idx.uned && idx.uned.subjects && Array.isArray(idx.uned.subjects[slug]) ? idx.uned.subjects[slug] : null; if(arr){ renderLinksGrid(subjGrid, arr); const has=arr.length>0; if(subjEmpty) subjEmpty.hidden=has; if(subjLinksTitle){ subjLinksTitle.hidden=!has; subjLinksTitle.textContent='Enlaces de asignatura'; } return; }
        // legacy
        return fetchJSON(`data/uned-${slug}-links.json`).then(a=>Array.isArray(a)?a:fetchJSON(`data/${slug}-links.json`)).then(items=>{ const arr=Array.isArray(items)?items:[]; renderLinksGrid(subjGrid, arr); const has=arr.length>0; if(subjEmpty) subjEmpty.hidden=has; if(subjLinksTitle){ subjLinksTitle.hidden=!has; subjLinksTitle.textContent='Enlaces de asignatura'; } });
      });
    });
  }
  function renderAll(){
    if(titleEl) titleEl.textContent = selected ? ('UNED · '+selected.toUpperCase()) : 'UNED';
    if(subtitleEl) subtitleEl.textContent = selected ? 'Vista específica de asignatura' : 'Vista general y selector de asignaturas';
    if(upcomingTitleEl) upcomingTitleEl.textContent = selected ? ('Próximas actividades ('+selected.toUpperCase()+')') : 'Próximas actividades (Todas)';
    renderSelector();
    (selected?loadUpcomingFor(selected):loadAllUpcoming()).then(upc=>{
      if(!upcomingEl) return; upcomingEl.innerHTML='';
      if(!upc||!upc.length){ if(upcomingEmptyEl) upcomingEmptyEl.hidden=false; return; }
      if(upcomingEmptyEl) upcomingEmptyEl.hidden=true;
      upc.forEach(item=>{
        const li=document.createElement('li'); li.className='upcoming-item';
        const date=document.createElement('span'); date.className='upcoming-date'; date.textContent=formatDateShort(item.date); li.appendChild(date);

        const makeTitleNode = (text, href)=>{ const el = href ? document.createElement('a') : document.createElement('span'); if(href) el.className='upcoming-link'; el.textContent = text; return el; };
        const titleNode = makeTitleNode(item.title, item.link);
        if(item.important){ const wrap = document.createElement('span'); wrap.className='important-blink'; wrap.appendChild(titleNode); li.classList.add('upcoming-important'); li.appendChild(wrap); }
        else { li.appendChild(titleNode); }

        upcomingEl.appendChild(li);
      });
    });
    loadCommonLinks(); if(selected){ loadSubjectLinks(selected); } else { clearSubjectLinks(); }
    clearExtras(); if(selected==='redes'){ /* placeholder for subject-specific extras */ }
  }
  fetchJSON('data/uned-subjects.json').then(json=>{ subjects=Array.isArray(json)?json:[]; renderAll(); window.addEventListener('hashchange', ()=>{ selected=parseSel(); renderAll(); }); });
}
