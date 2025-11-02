import { $ } from './utils.js';

export function loadTheme(){ const t=localStorage.getItem('theme'); if(t==='dark') document.documentElement.classList.add('dark'); }
export function bindThemeToggle(){ const btn=$('#theme-toggle'); if(!btn) return; btn.addEventListener('click', ()=>{ const isDark=document.documentElement.classList.toggle('dark'); btn.setAttribute('aria-pressed', isDark?'true':'false'); localStorage.setItem('theme', isDark?'dark':'light'); }); }
