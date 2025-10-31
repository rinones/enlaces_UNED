import { $, fetchJSON } from './utils.js';

function sha256Hex(message){ try{ const enc=new TextEncoder(); const data=enc.encode(message); return crypto.subtle.digest('SHA-256', data).then(hash=>{ const bytes=Array.from(new Uint8Array(hash)); return bytes.map(b=>b.toString(16).padStart(2,'0')).join(''); }); }catch(_){ return Promise.reject(new Error('crypto.subtle no disponible')); } }
function monthKey(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function dayKey(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function notesForDay(key){ try{ const raw=localStorage.getItem('notes:'+key); return raw?JSON.parse(raw):[]; }catch(_){ return []; } }
function addDefaultEvents(cfg){
  // Use events from cfg if provided; otherwise don't seed any events here.
  // Rationale: avoid duplicating data in JS — the canonical source is data/calendar.json.
  const events = (cfg && Array.isArray(cfg.events)) ? cfg.events : [];
      events.forEach(ev=>{
    const dKey = ev.date;
    const storageKey = 'notes:'+dKey;
    try{
      const existing = localStorage.getItem(storageKey);
      if(existing){
        const arr = JSON.parse(existing);
        // migrate existing entries that match this event to include pages/page/subject metadata
        let migrated = false;
        arr.forEach(item=>{
          try{
                if(item && item.text===String(ev.text||'Aviso') && !item.pages && !item.page && !item.subject){
                  if(ev.pages) item.pages = ev.pages;
                  if(ev.page) item.page = ev.page;
                  if(ev.subject) item.subject = ev.subject;
                  if(typeof ev.important !== 'undefined') item.important = !!ev.important;
                  migrated = true;
                }
          }catch(_){ }
        });
        if(migrated) localStorage.setItem(storageKey, JSON.stringify(arr));
        const found = arr.some(n=>n.text===String(ev.text||'Aviso'));
        if(!found){ arr.unshift({text:String(ev.text||'Aviso'), link:ev.link||'', pages: ev.pages||undefined, page: ev.page||undefined, subject: ev.subject||undefined, created:Date.now()}); localStorage.setItem(storageKey, JSON.stringify(arr)); }
      } else {
        const arr = [{text: String(ev.text||'Aviso'), link: ev.link||'', pages: ev.pages||undefined, page: ev.page||undefined, subject: ev.subject||undefined, important: !!ev.important, created: Date.now()}];
        localStorage.setItem(storageKey, JSON.stringify(arr));
      }
    }catch(_){ }
  });
}

function renderCalendar(root, cfg){ const weekdays=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']; const monthYearEl=$('#monthYear'); const prevBtn=$('#prevMonth'); const nextBtn=$('#nextMonth'); const weekdaysEl=root.querySelector('.weekdays'); const weeksEl=root.querySelector('.weeks'); const date = (cfg && cfg.start && typeof cfg.start.year==='number' && typeof cfg.start.month==='number') ? new Date(cfg.start.year, cfg.start.month, 1) : new Date(); function renderWeekdays(){ weekdaysEl.innerHTML=''; weekdays.forEach(d=>{ const el=document.createElement('div'); el.textContent=d; weekdaysEl.appendChild(el); }); } function changeMonth(delta){ date.setMonth(date.getMonth()+delta); render(); } if(prevBtn) prevBtn.addEventListener('click', ()=>changeMonth(-1)); if(nextBtn) nextBtn.addEventListener('click', ()=>changeMonth(1)); function render(){ const year=date.getFullYear(); const month=date.getMonth(); if(monthYearEl) monthYearEl.textContent = date.toLocaleString('es-ES', {month:'long', year:'numeric'}); weeksEl.innerHTML=''; const first=new Date(year, month, 1); const startDay=(first.getDay()+6)%7; const daysInMonth=new Date(year, month+1, 0).getDate(); const prevMonthDays=startDay; const totalCells=Math.ceil((prevMonthDays+daysInMonth)/7)*7; const firstCellDate=new Date(year, month, 1-prevMonthDays); for(let i=0;i<totalCells;i++){ const cellDate=new Date(firstCellDate.getFullYear(), firstCellDate.getMonth(), firstCellDate.getDate()+i); const cell=document.createElement('div'); cell.className='day'; const dayNumber=document.createElement('div'); dayNumber.className='day-number'; dayNumber.textContent=cellDate.getDate(); cell.appendChild(dayNumber); if(cellDate.getMonth()!==month){ cell.classList.add('muted'); } const dKey=dayKey(cellDate); const notes=notesForDay(dKey)||[]; const notesWrap=document.createElement('div'); notesWrap.className='notes'; notes.slice(0,3).forEach(n=>{ const pill=document.createElement('div'); pill.className='note-pill'; pill.textContent = n.text || (n.link?n.link:'Aviso'); notesWrap.appendChild(pill); }); cell.appendChild(notesWrap); if(notes.length>0){ cell.classList.add('event-highlight'); } weeksEl.appendChild(cell); } }
  renderWeekdays(); render(); }

export function initCalendar(){ const calRoot=$('#calendar'); if(!calRoot) return; const loginOverlay=$('#loginOverlay'); const loginInput=$('#loginInput'); const loginBtn=$('#loginBtn'); const loginError=$('#loginError'); function showError(msg){ if(loginError) loginError.textContent=msg; } function clearError(){ if(loginError) loginError.textContent=''; }
  if(loginBtn) loginBtn.addEventListener('click', ()=>{
    clearError();
    const val=(loginInput&&loginInput.value)||'';
    if(!val){ showError('Introduce la contraseña.'); return; }
    sha256Hex(val).then(hex=>{
      const stored=localStorage.getItem('calendar:pwdHash');
      if(hex===stored){
        if(loginOverlay) loginOverlay.classList.add('hidden');
        // load defaults from data file and initialize
        fetchJSON('data/calendar.json').then(cfg=>{
          addDefaultEvents(cfg);
          renderCalendar(calRoot.parentElement, cfg);
        }).catch(()=>{
          // fallback to defaults built into code
          addDefaultEvents();
          renderCalendar(calRoot.parentElement);
        });
      } else { showError('Contraseña incorrecta.'); }
    }).catch(()=>{ showError('No se pudo verificar.'); });
  });
  if(loginInput) loginInput.addEventListener('keyup', e=>{ if(e.key==='Enter' && loginBtn) loginBtn.click(); });
  (function ensurePwd(){ const existing=localStorage.getItem('calendar:pwdHash'); if(existing) return; sha256Hex('freecalendar').then(hex=>{ localStorage.setItem('calendar:pwdHash', hex); }).catch(()=>{}); })();
}
