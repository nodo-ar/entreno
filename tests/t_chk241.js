const {chromium}=require('playwright');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
for(const [w,h] of [[390,844],[844,390]]){ const tag=`${w}×${h}`; const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
  await p.goto('http://127.0.0.1:8765/'+src); await W8(500); await E(()=>document.querySelector('#newP').click()); await W8(400);
  await E(()=>{ document.querySelector('#obNom').value='Fer'; document.querySelector('#obPeso').value='82'; CFG.diasFS=[0,1,3,5]; CFG.diasBS=[2,4,6]; CFG.lugares[0].equipo={barra:1,paralelas:1,mancuernas:1,tobilleras:1,bici:1,soga:1}; ob.vals=Object.assign(ob.vals||{},{dom:8,fon:8,flex:8,hang:30,rod:8,bulg:8,bici:5}); });
  for(let i=0;i<30;i++){ const st=await E(()=>{ if(ob&&ob.step===3) return 'plan'; const e=document.querySelector('#obNext'); if(e){ e.click(); return 'n'; } return 'd'; }); await W8(200); if(st!=='n') break; }
  await W8(600);
  const pl=await E(()=>{ const c=document.querySelector('.obplan'); return c&&{t:c.innerText,week:!!c.querySelector('.week .c'),rows:c.querySelectorAll('.obr').length,go:!!c.querySelector('#obNext')}; });
  ok(pl&&pl.week&&pl.rows>=3&&pl.go,`${tag}: Tu plan muestra la semana, con qué arrancás y Empezar`);
  ok(pl&&/por serie/.test(pl.t)&&!/\d+[–-]\d+\n|\d+\+\d+|\d+×\d+|a los 45 s/.test(pl.t),`${tag}: todo dicho con palabras, sin "4+3" ni "4×8"`);
  const vis=await E(()=>{ const r=document.querySelector('#obNext').getBoundingClientRect(); return r.bottom<=innerHeight+1&&r.top>=0; });
  ok(vis||w<600,`${tag}: en horizontal Empezar queda a la vista sin desplazar`);
  await E(()=>document.querySelector('#obNext').click()); await W8(1500); await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); try{ ['lp','swipe','scrub','mini2'].forEach(k=>hintDone(k)); }catch(e){} go('hist'); }); await W8(1200);
  const hv=await E(()=>({rings:document.querySelectorAll('#app .hvwk .rring,#app .hvwk svg').length,t:document.querySelector('#app').innerText,btn:!!document.querySelector('#hvGo')}));
  ok(hv.btn&&/Acá vas a ver cómo avanzás/.test(hv.t)&&/Esta semana/.test(hv.t)&&!/Todavía sin sesiones/.test(hv.t),`${tag}: Progreso vacío explica qué va a aparecer y muestra la semana del plan`);
  await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); document.querySelector('#hvGo').click(); }); await W8(700);
  ok(await E(()=>!!document.querySelector('.pop.fabmenu')),`${tag}: "Empezar una sesión" abre el menú del +`);
  await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
