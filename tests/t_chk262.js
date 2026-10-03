// v259: terminar sin querer → deshacer al terminar, Seguir en el cierre, en ⋯ y al mantener apretada
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html'; let ok=0,bad=0; const T=(c,m)=>{ if(c) ok++; else { bad++; console.log('FAIL',m); } }; const errs=[];
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; });
  await p.evaluate(()=>{ fzSel='Torso A'; nuevoDraft('Torso A',{corta:true}); draft.ej[0].series.push({r:8,kg:20},{r:8,kg:20}); draft.ej[1].series.push({r:6,kg:0}); draft.ej[0].fatiga=2; cur=1; loadStepper(); go('fuerza'); }); await p.waitForTimeout(1200);
  const before=await p.evaluate(()=>({id:draft.id,corta:!!draft.plan.corta,n:draft.ej.map(e=>e.series.length).join(','),cur}));
  await p.click('#finish'); await p.waitForTimeout(1500);
  { const f=await p.evaluate(()=>({view,seg:!!document.getElementById('finSeg'),toast:(document.querySelector('#utoast')||{}).innerText||'', inSess:SESS.some(s=>s.id===histEx)})); T(f.view==='fin'&&f.inSess,'terminar guarda y va al cierre'); T(/Sesión terminada/.test(f.toast)&&/Deshacer/.test(f.toast),'aparece Deshacer: '+f.toast.replace(/\n/g,' ')); T(f.seg,'el cierre ofrece Seguir'); }
  await p.click('#utoast .utu'); await p.waitForTimeout(1200);
  const after=await p.evaluate(()=>({view,id:draft&&draft.id,corta:draft&&!!draft.plan.corta,n:draft&&draft.ej.map(e=>e.series.length).join(','),cur,inSess:SESS.some(s=>s.id===draft.id)}));
  T(after.view==='fuerza'&&after.id===before.id&&after.corta===before.corta&&after.n===before.n&&after.cur===before.cur&&!after.inSess,'Deshacer reabre la sesión tal como estaba: '+JSON.stringify(after));
  await p.click('#finish'); await p.waitForTimeout(1500); await p.evaluate(()=>{ const t=document.querySelector('#utoast'); if(t) t.remove(); });
  await p.click('#finSeg'); await p.waitForTimeout(1200);
  { const g=await p.evaluate(()=>({view,n:draft&&draft.ej.map(e=>e.series.length).join(','),cur,inSess:SESS.some(s=>s.id===draft.id)})); T(g.view==='fuerza'&&g.n===before.n&&!g.inSess,'Seguir del cierre reabre igual: '+JSON.stringify(g)); }
  await p.click('#finish'); await p.waitForTimeout(1500); await p.evaluate(()=>{ localStorage.removeItem(finK()); const t=document.querySelector('#utoast'); if(t) t.remove(); go('home'); }); await p.waitForTimeout(800);
  const sid=await p.evaluate(()=>SESS.find(s=>s.fecha===hoyISO()&&s.kind==='fuerza'&&s.tipo==='Torso A').id);
  await p.evaluate(sid=>{ histEx=sid; go('dia'); },sid); await p.waitForTimeout(900); await p.click('#diaMore'); await p.waitForTimeout(500);
  { const m=await p.evaluate(()=>document.querySelector('.pop').innerText); T(/Seguir con la sesión/.test(m),'⋯ de la sesión de hoy ofrece Seguir con la sesión'); }
  await p.click('.pop [data-mm="seg"]'); await p.waitForTimeout(1200);
  { const r=await p.evaluate(()=>({view,tipo:draft&&draft.tipo,corta:draft&&!!draft.plan.corta,n:draft&&draft.ej.map(e=>e.series.length).join(','),cur,wu:draft&&draft.wu.every(Boolean)})); T(r.view==='fuerza'&&r.tipo==='Torso A'&&r.corta&&r.n===before.n&&r.cur===1&&r.wu,'sin lo guardado del momento, la rearma igual (corta, series, dónde ibas): '+JSON.stringify(r)); }
  // una sesión de otro día no se reabre
  T(await p.evaluate(()=>!puedeSeguir(SESS.find(s=>s.kind==='fuerza'&&s.fecha<hoyISO()))),'una sesión de otro día no ofrece Seguir');
  // con cardio en curso, avisa en vez de pisar
  await p.evaluate(()=>{ draft=null; vivoSave(); go('home'); }); await p.waitForTimeout(600);
  const r2=await p.evaluate(async()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); let x=SESS.find(s=>s.fecha===hoyISO()&&s.kind==='fuerza'); if(!x){ x={id:'s-'+Date.now(),kind:'fuerza',fecha:hoyISO(),tipo:'Torso A',ej:[{n:'Fondos',series:[{r:8}],fatiga:2}]}; SESS.unshift(x); } const id=x.id; /* el seed no siempre deja fuerza hoy (depende del día) */ const r=await seguirFuerza(id,document.querySelector('#app h1')); return {r,draft:!!draft,inSess:SESS.some(s=>s.id===id)}; });
  T(!r2.r&&!r2.draft&&r2.inSess,'con otra sesión en curso no la reabre ni la borra');
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,3))); await b.close(); })();
