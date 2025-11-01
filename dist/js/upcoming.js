import { $, fetchJSON, inferSubjectFromPath, inferLinksKeyFromPath } from './utils.js';

function today0(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
function parseYMD(ymd){ const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd||'')); if(!m) return null; return new Date(+m[1], +m[2]-1, +m[3]); }
function formatShort(d){ try{ return d.toLocaleDateString('es-ES', {day:'2-digit', month:'short'}); }catch(_){ const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return dd+'/'+mm; } }

async function fromLS(){
  const out=[];
  const currentPage = inferLinksKeyFromPath();
  const currentSubject = inferSubjectFromPath();
  // load activities data to detect activities that can provide pages/subject metadata
  // for notes stored in localStorage that lack explicit pages/page/subject.
  // We build a small lookup of {ymd, text} from modular and unified activity sources.
  const calEvents = [];
  try{
    // try to collect modular activities (per-subject) and unified/general activities
    const modularPromise = fetchJSON(`data/activities/subjects/${inferSubjectFromPath() || ''}.json`).then(a=>Array.isArray(a)?a:[]).catch(()=>[]);
    const generalPromise = fetchJSON('data/activities/general.json').then(a=>Array.isArray(a)?a:[]).catch(()=>[]);
    const unifiedPromise = fetchJSON('data/activities.json').then(j=>{ if(Array.isArray(j)) return j; if(j && typeof j==='object'){ if(Array.isArray(j.general)) return j.general; return []; } return []; }).catch(()=>[]);
    const [modular, general, unified] = await Promise.all([modularPromise, generalPromise, unifiedPromise]);
    // keep pages and important flag so we can enrich localStorage notes later
    const flatten = (arr)=> (arr||[]).map(x=>({
      ymd: String(x.date||x.ymd||''),
      text: String(x.title||x.text||'').trim(),
      pages: Array.isArray(x.pages)?x.pages:(x.page? [x.page]:[]),
      important: !!x.important
    })).filter(e=>e.ymd);
    calEvents.push(...flatten(modular));
    calEvents.push(...flatten(general));
    calEvents.push(...flatten(unified));
  }catch(_){ }
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key||!key.startsWith('notes:')) continue;
    const ymd=key.slice(6);
    const date=parseYMD(ymd);
    if(!date) continue;
    try{
      const arr=JSON.parse(localStorage.getItem(key)||'[]');
      if(Array.isArray(arr)){
        arr.forEach(n=>{
          if(!n) return;
          // if note has explicit pages/page/subject, use them to filter
          if(n.pages && Array.isArray(n.pages)){
            if(n.pages.indexOf(currentPage)===-1) return;
          } else if(n.page){ if(String(n.page)!==currentPage) return; }
          if(currentSubject && n.subject && String(n.subject).toLowerCase()!==currentSubject) return;

            // If the note lacks pages/page but matches a known activity (from activities files),
            // use the activity's pages/page metadata to decide whether to include it. Match by text and date.
            const hasMeta = !!(n.pages || n.page || n.subject);
            let matchedImportant = false;
            if(!hasMeta){
              const matches = calEvents.filter(ev=>{
                try{ return String(ev.ymd)===ymd && String((ev.text||'')).trim()===String((n.text||'')).trim(); }catch(_){ return false; }
              });
              if(matches.length){
                const anyWithPages = matches.some(m=>Array.isArray(m.pages) && m.pages.indexOf(currentPage)!==-1);
                const anyWithPage = matches.some(m=>m.page && String(m.page)===currentPage);
                if(!anyWithPages && !anyWithPage) return; // skip note because activities data says it's not for this page
                matchedImportant = matches.some(m=>!!m.important);
              }
            }

          const title=(n&&(n.text||n.title||n.link))||'Actividad';
          const link=(n&&n.link)?String(n.link):'';
          const important = !!( (n && n.important) || matchedImportant );
          out.push({date, ymd, title, link, important});
        });
      }
    }catch(_){ }
  }
  return out;
}

function fromModular(){
  const subj=inferSubjectFromPath();
  if(subj){ return fetchJSON(`data/activities/subjects/${subj}.json`).then(arr=>Array.isArray(arr)?arr:[]); }
  // When no subject is selected (home), include general activities and
  // also try to load per-subject files (preda, redes, etc.) so that
  // subject-specific activities that declare pages:['home'] are shown
  // on the home page. We use the `data/uned-subjects.json` manifest to
  // discover available subject slugs.
  return Promise.all([
    fetchJSON('data/activities/general.json').then(a=>Array.isArray(a)?a:[]).catch(()=>[]),
    fetchJSON('data/uned-subjects.json').then(a=>Array.isArray(a)?a:[]).catch(()=>[])
  ]).then(([general, subjectsManifest])=>{
    try{
      const slugs = [];
      (subjectsManifest||[]).forEach(g=>{ (g.asignaturas||[]).forEach(it=>{ const s=String((it.nombre||'')).trim().toLowerCase(); if(s && slugs.indexOf(s)===-1) slugs.push(s); }); });
      if(!slugs.length) return general;
      return Promise.all(slugs.map(s=>fetchJSON(`data/activities/subjects/${s}.json`).then(a=>Array.isArray(a)?a:[]).catch(()=>[]))).then(arrs=>{
        // merge general + all subject arrays
        return (general||[]).concat(...arrs);
      }).catch(()=> general);
    }catch(_){ return general; }
  }).catch(()=> fetchJSON('data/activities/general.json').then(arr=>Array.isArray(arr)?arr:[]));
}

function fromUnified(){
  const subj=inferSubjectFromPath();
  return fetchJSON('data/activities.json').then(json=>{
    if(Array.isArray(json)) return json;
    if(json && typeof json==='object'){
      if(subj && json.subjects && Array.isArray(json.subjects[subj])) return json.subjects[subj];
      if(Array.isArray(json.general)) return json.general; 
    }
    return [];
  });
}

export function initUpcoming(){
  const LIST_SEL='#upcoming-activities'; const EMPTY_SEL='#upcoming-empty';
  const ul=document.querySelector(LIST_SEL); const empty=document.querySelector(EMPTY_SEL);
  // Ensure base styles for all upcoming lists (home/section pages and UNED page share class names)
  if(!document.getElementById('upcoming-styles')){
    const css =
      '.upcoming-section{margin:1rem 0 1.25rem; padding:0.75rem; background:var(--upc-bg, #f7f9fc); border:1px solid #e5e7eb; border-radius:8px}'+
      '.upcoming-title{margin:0 0 .5rem; font-size:1.05rem}'+
      '.upcoming-list{list-style:none; padding:0; margin:0; display:grid; gap:.35rem}'+
      '.upcoming-item{display:flex; align-items:center; gap:.5rem}'+
      '.upcoming-date{font-variant-numeric:tabular-nums; font-weight:600; color:#0d6efd; min-width:3.4rem}'+
      '.upcoming-link{color:inherit; text-decoration:none}'+
      '.upcoming-link:hover{text-decoration:underline}'+
      '.upcoming-empty{color:#6b7280; font-size:.95rem}'+
      '@keyframes blink-red{0%,100%{background-color:rgba(255,0,0,0.10)}50%{background-color:rgba(255,0,0,0.35)}}'+
      '.important-blink{animation:blink-red 1s ease-in-out infinite;border-radius:6px;padding:0.15rem 0.4rem;color:var(--text);display:inline-block}'+
      '.upcoming-item.upcoming-important .important-blink, .upcoming-item .important-blink{display:inline-block}';
    const style=document.createElement('style'); style.id='upcoming-styles'; style.textContent=css; document.head.appendChild(style);
  }
  if(!ul) return;
  function render(list){
    ul.innerHTML='';
    if(!list||!list.length){ if(empty) empty.hidden=false; return; }
    if(empty) empty.hidden=true;
    list.forEach(item=>{
      const li=document.createElement('li'); li.className='upcoming-item';
      const date=document.createElement('span'); date.className='upcoming-date'; date.textContent=formatShort(item.date); li.appendChild(date);

      const makeTitleNode = (text, href)=>{
        const el = href? document.createElement('a') : document.createElement('span');
        if(href) el.className='upcoming-link';
        el.textContent = text;
        return el;
      };

      const titleNode = makeTitleNode(item.title, item.link);
      if(item.important){
        const wrap = document.createElement('span'); wrap.className='important-blink';
        wrap.appendChild(titleNode);
        li.classList.add('upcoming-important');
        li.appendChild(wrap);
      } else {
        li.appendChild(titleNode);
      }

      ul.appendChild(li);
    });
  }
  const currentPage = inferLinksKeyFromPath();
  const currentSubject = inferSubjectFromPath();
  function mapItems(arr){ return (arr||[]).map(x=>{ const ymd=x.date||x.ymd; const d=ymd?parseYMD(String(ymd)):null; if(!d) return null;
      // page filtering: accept when no page/pages specified, or when currentPage matches
      if(x.pages && Array.isArray(x.pages)){
        if(!currentPage || x.pages.indexOf(currentPage)===-1) return null;
      } else if(x.page){ if(!currentPage || String(x.page)!==currentPage) return null; }
      // subject filtering: if activity declares a subject, ensure it matches currentSubject when present
      if(currentSubject && x.subject){ if(String(x.subject).toLowerCase()!==currentSubject) return null; }
      return {date:d, ymd, title:x.title||x.text||'Actividad', link:x.link||'', important: !!x.important}; }).filter(Boolean); }
  const now0=today0();
  const onlyFile=!!(window&&window.UPCOMING_ONLY_FILE);
  const p1 = onlyFile?Promise.resolve([]):Promise.resolve().then(fromLS);
  const p2 = fromModular().then(mapItems).then(items=>items.length?items:fromUnified().then(mapItems));
  Promise.all([p1,p2]).then(([a,b])=>{
    // merge notes-from-localStorage (a) and activities-from-files (b)
    // then remove obvious duplicates (same ymd + same title, case-insensitive)
    const merged = (a||[]).concat(b||[]);
    const seen = new Set();
    const dedup = [];
    merged.forEach(item=>{
      try{
        if(!item) return;
        const ymd = item.ymd || (item.date && item.date.toISOString && item.date.toISOString().slice(0,10)) || '';
        const title = String(item.title||item.text||'').trim().toLowerCase();
        if(!ymd) return;
        const key = `${ymd}|${title}`;
        if(!seen.has(key)){
          seen.add(key);
          dedup.push(item);
        }
      }catch(_){ /* ignore malformed items */ }
    });
    const all = dedup;
    const upc = all.filter(x=>x.date && x.date>=now0).sort((x,y)=>x.date-y.date || x.title.localeCompare(y.title)).slice(0,10);
    render(upc);
  });
}
