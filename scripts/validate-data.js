#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJSON(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){ return null; } }
function checkDate(d){ return /^\d{4}-\d{2}-\d{2}$/.test(String(d||'')); }
function walkDir(dir){ const out=[]; fs.readdirSync(dir,{withFileTypes:true}).forEach(ent=>{ const fp=path.join(dir, ent.name); if(ent.isDirectory()) out.push(...walkDir(fp)); else out.push(fp); }); return out; }

const repoRoot = path.join(__dirname, '..');
const dataDir = path.join(repoRoot, 'data');
let ok=true;

console.log('Validating data files under', dataDir);

// Validate calendar-defaults.json
const calFile = path.join(dataDir, 'calendar-defaults.json');
if(fs.existsSync(calFile)){
  const cal = readJSON(calFile);
  if(!cal || typeof cal !== 'object') { console.error(' - calendar-defaults.json: invalid json'); ok=false; }
  else{
    (cal.events||[]).forEach((ev,i)=>{
      if(!checkDate(ev.date)) { console.error(` - calendar-defaults.json.events[${i}].date invalid: ${ev.date}`); ok=false; }
      if(!ev.text) { console.error(` - calendar-defaults.json.events[${i}].text missing`); ok=false; }
    });
    if(cal.start){ if(typeof cal.start.year!=='number' || typeof cal.start.month!=='number'){ console.error(' - calendar-defaults.json.start invalid (expect year:number, month:number)'); ok=false; } }
  }
} else { console.warn(' - calendar-defaults.json not found (skipping)'); }

// Validate activities
const actsDir = path.join(dataDir, 'activities');
if(fs.existsSync(actsDir)){
  const files = walkDir(actsDir).filter(f=>f.endsWith('.json'));
  files.forEach(f=>{
    const rel = path.relative(repoRoot, f);
    const j = readJSON(f);
    if(!Array.isArray(j) && !(j && typeof j==='object')){ console.error(` - ${rel}: expected array or object`); ok=false; return; }
    const arr = Array.isArray(j) ? j : (j.general||[]); // unified may be object
    const isSubjectFile = f.includes(path.join('activities','subjects'));
    arr.forEach((it,i)=>{
      const ctx = `${rel}[${i}]`;
      const date = it.date || it.ymd;
      if(!checkDate(date)){ console.error(` - ${ctx}: invalid date '${date}'`); ok=false; }
      if(!(it.title||it.text)) { console.error(` - ${ctx}: missing title/text`); ok=false; }
      if(it.pages && !Array.isArray(it.pages)) { console.error(` - ${ctx}: pages must be an array`); ok=false; }
      if(isSubjectFile && it.subject && String(it.subject).toLowerCase() !== path.basename(f, '.json')){ console.error(` - ${ctx}: subject field '${it.subject}' does not match filename slug`); ok=false; }
    });
  });
} else { console.warn(' - data/activities not found (skipping)'); }

if(!ok){ console.error('\nValidation FAILED'); process.exit(2); }
console.log('All data checks passed.');
process.exit(0);
