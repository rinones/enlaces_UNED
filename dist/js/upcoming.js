import { $, fetchJSON, inferSubjectFromPath } from './utils.js';

function today0(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
function parseYMD(ymd){ const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd||'')); if(!m) return null; return new Date(+m[1], +m[2]-1, +m[3]); }
function formatShort(d){ try{ return d.toLocaleDateString('es-ES', {day:'2-digit', month:'short'}); }catch(_){ const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return dd+'/'+mm; } }

function fromLS(){ const out=[]; for(let i=0;i<localStorage.length;i++){ const key=localStorage.key(i); if(!key||!key.startsWith('notes:')) continue; const ymd=key.slice(6); const date=parseYMD(ymd); if(!date) continue; try{ const arr=JSON.parse(localStorage.getItem(key)||'[]'); if(Array.isArray(arr)){ arr.forEach(n=>{ const title=(n&&(n.text||n.title||n.link))||'Actividad'; const link=(n&&n.link)?String(n.link):''; out.push({date, ymd, title, link}); }); } }catch(_){ } } return out; }

function fromModular(){
  const subj=inferSubjectFromPath();
  if(subj){ return fetchJSON(`data/activities/subjects/${subj}.json`).then(arr=>Array.isArray(arr)?arr:[]); }
  return fetchJSON('data/activities/general.json').then(arr=>Array.isArray(arr)?arr:[]);
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
      '.upcoming-empty{color:#6b7280; font-size:.95rem}';
    const style=document.createElement('style'); style.id='upcoming-styles'; style.textContent=css; document.head.appendChild(style);
  }
  if(!ul) return;
  function render(list){ ul.innerHTML=''; if(!list||!list.length){ if(empty) empty.hidden=false; return; } if(empty) empty.hidden=true; list.forEach(item=>{ const li=document.createElement('li'); li.className='upcoming-item'; const date=document.createElement('span'); date.className='upcoming-date'; date.textContent=formatShort(item.date); li.appendChild(date); if(item.link){ const a=document.createElement('a'); a.className='upcoming-link'; a.href=item.link; a.textContent=item.title; li.appendChild(a); } else { const span=document.createElement('span'); span.textContent=item.title; li.appendChild(span); } ul.appendChild(li); }); }
  function mapItems(arr){ return (arr||[]).map(x=>{ const ymd=x.date||x.ymd; const d=ymd?parseYMD(String(ymd)):null; if(!d) return null; return {date:d, ymd, title:x.title||x.text||'Actividad', link:x.link||''}; }).filter(Boolean); }
  const now0=today0();
  const onlyFile=!!(window&&window.UPCOMING_ONLY_FILE);
  const p1 = onlyFile?Promise.resolve([]):Promise.resolve().then(fromLS);
  const p2 = fromModular().then(mapItems).then(items=>items.length?items:fromUnified().then(mapItems));
  Promise.all([p1,p2]).then(([a,b])=>{ const all=a.concat(b); const upc=all.filter(x=>x.date && x.date>=now0).sort((x,y)=>x.date-y.date || x.title.localeCompare(y.title)).slice(0,10); render(upc); });
}
