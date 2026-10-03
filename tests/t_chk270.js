// v268: la variante de cada ejercicio según tu nivel (pruebas y series reales), sin cambiar a quien ya puede
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; NAV.length=0; CFG.prog={}; });
  const keys=t=>p.evaluate(t=>buildDay(t).ej.map(e=>e.key),t);
  // quien ya puede (8 dominadas, 8 fondos): igual que antes
  let A=await keys('Torso A'), B=await keys('Torso B');
  T(A.includes('dominadas')&&A.includes('fondos')&&B.includes('chin'),'con 8 dominadas y 8 fondos, Torso A y B como siempre '+A.join(','));
  // principiante: 0 dominadas, 0 fondos, 0 flexiones, sin historial
  await p.evaluate(()=>{ SESS=[]; CFG.tests=Object.assign({},CFG.tests,{dom:0,fon:0,flex:0}); });
  A=await keys('Torso A'); B=await keys('Torso B');
  T(!A.includes('dominadas')&&(A.includes('dom_neg')||A.includes('dom_asist'))&&!A.includes('fondos'),'con 0: negativas o asistidas en vez de dominadas, sin fondos · '+A.join(','));
  T(!B.includes('chin')&&B.includes('fondos_banco')&&!B.includes('fondos_anillas'),'Torso B: sin supinas, fondos en banco · '+B.join(','));
  T(A.includes('f_incline_push_up_wide')&&!A.includes('flex_pies'),'sin flexiones: inclinadas, no declinadas · '+A.join(','));
  // la etiqueta: hacia qué vas y cuánto falta
  const tag=await p.evaluate(()=>{ const d=buildDay('Torso A'); const e=d.ej.find(x=>x.key==='dom_neg'||x.key==='dom_asist'); return e&&e.niv&&{k:e.niv.k,v:e.niv.v,m:e.niv.m}; });
  T(tag&&tag.k==='dominadas'&&tag.v===0&&tag.m===3,'la negativa dice hacia Dominadas, 0 de 3 '+JSON.stringify(tag));
  await p.evaluate(()=>{ SESS=[{id:'s-0',kind:'fuerza',fecha:addDays(hoyISO(),-3),tipo:'Piernas B',ej:[{n:'Sentadilla',series:[{r:10}],fatiga:2}]}]; draft=null; fzSel=null; go('fuerza'); }); await p.waitForTimeout(800);
  const txt=await p.evaluate(()=>[...document.querySelectorAll('#app .fzniv')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
  T(txt.some(t=>/Dominadas 0\/3/.test(t)),'en la lista se ve "Dominadas pronas 0/3" · '+txt.join(' | '));
  // con series reales llega: 3 dominadas registradas → vuelven las dominadas
  await p.evaluate(()=>{ SESS=[{id:'s-1',kind:'fuerza',fecha:addDays(hoyISO(),-2),tipo:'Libre',ej:[{n:CAT.dominadas.n,series:[{r:3},{r:2}],fatiga:3}]}]; });
  A=await keys('Torso A');
  T(A.includes('dominadas'),'con 3 dominadas reales hace 2 días, vuelven las dominadas '+A.join(','));
  // nunca se cae un ejercicio: una sesión de rutina con sólo dominadas y sin alternativas
  await p.evaluate(()=>{ SESS=[]; });
  const r=await p.evaluate(()=>resolveEx(['dominadas',3],new Set()));
  T(r&&r.key==='dominadas','si no hay alternativa, queda la que el equipo permite');
  // desafíos: Perseo con 0 dominadas usa negativas
  T(await p.evaluate(()=>heroEx(HEROES.find(h=>h.id==='perseo').it[0]).k==='dom_neg'),'Perseo con 0 dominadas: negativas');
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
