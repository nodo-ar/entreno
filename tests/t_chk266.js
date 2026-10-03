// v263: Programas → Rutinas, rutina → sesión, la rotación como rutina por defecto, sesión suelta y Desafíos en Progreso
const {chromium}=require('playwright'); const seed=require('./seed.js'); const fs=require('fs');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  { const s=fs.readFileSync(src,'utf8'); T(!/>Programas y héroes</.test(s)&&!/Guardar como rutina/.test(s)&&!/Empezar programa/.test(s),'sin los nombres viejos en la interfaz'); }
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; CFG.prog={}; CFG.diasFS=[1,3,5]; CFG.diasBS=[0,2,4]; });
  const W=ms=>p.waitForTimeout(ms);
  // 1. Rutinas: la rotación en curso, ordenada por tus días, objetivos aparte, sin desafíos
  await p.evaluate(()=>{ progFrom='home'; prFil='todo'; go('programas'); }); await W(700);
  let r=await p.evaluate(()=>({h:document.querySelector('#app h1').textContent,sub:(document.querySelector('#app .prsem')||{getAttribute:()=>''}).getAttribute('aria-label')||'',cur:!!document.querySelector('#app .prcur[data-prog="rot"]'),hd:[...document.querySelectorAll('#app .ajhd')].map(x=>x.textContent),hero:!!document.querySelector('#app [data-hero]')}));
  T(r.h==='Rutinas'&&/3 de fuerza/.test(r.sub)&&/3 de cardio/.test(r.sub),'Rutinas con tu semana '+r.sub);
  T(r.cur,'Torso y pierna en casa en curso sin otra rutina de fuerza');
  T(r.hd.some(t=>/Fuerza · para tus 3 días/.test(t))&&r.hd.some(t=>/^Objetivos/.test(t))&&!r.hero,'secciones por días, objetivos aparte, sin desafíos · '+r.hd.join(' | '));
  await p.evaluate(()=>{ prFil='f'; render(); }); await W(500);
  r=await p.evaluate(()=>{ const sec=t=>{ const h=[...document.querySelectorAll('#app .ajhd')].find(x=>x.textContent.startsWith(t)); return h?[...h.nextElementSibling.querySelectorAll('[data-prog]')].map(x=>x.dataset.prog):[]; }; return {ok:sec('Entran en tus 3 días'),mas:sec('Con más días'),obj:sec('Objetivos')}; });
  const dias=await p.evaluate(ids=>ids.map(id=>id==='rot'?0:progMeta(id).dias),r.ok);
  T(dias.every(d=>d<=3)&&r.obj.length===5&&r.obj.every(id=>['prim_dom','cien','armstrong','siete','gimnasta'].includes(id)),'fuerza: entran ≤3 días · objetivos los 5 '+JSON.stringify(r));
  T(await p.evaluate(ids=>ids.every(id=>progMeta(id).dias>3),r.mas),'con más días: todas piden más de 3');
  // 2. ficha de la rotación; con otra rutina en curso, volver a ella con deshacer
  await p.evaluate(()=>{ progSel='rot'; go('programa'); }); await W(600);
  r=await p.evaluate(()=>({h:document.querySelector('#app h1').textContent,n:document.querySelectorAll('#app .rotr').length,go:(document.querySelector('#rotGo')||{}).textContent}));
  T(r.h==='Torso y pierna en casa'&&r.n===4&&/^Ir a (Torso|Piernas)/.test(r.go||''),'ficha de la rotación: 4 sesiones e ir a la próxima '+JSON.stringify(r));
  await p.evaluate(()=>{ CFG.prog={f:{id:'base_cali',start:hoyISO()}}; }); await p.evaluate(()=>progLoad('base_cali').catch(()=>{})); await p.evaluate(()=>render()); await W(600);
  T(await p.evaluate(()=>!!document.querySelector('#rotPick')&&/Base de calistenia/.test(document.querySelector('#app .prgo').textContent)),'con Base de calistenia: volver a esta rutina, reemplaza a Base de calistenia');
  await p.evaluate(()=>document.querySelector('#rotPick').click()); await W(600);
  T(await p.evaluate(()=>!progAct('f')&&rotAct()&&/Vuelve Torso y pierna en casa/.test(document.querySelector('#utoast').textContent)),'volver a la rotación, con aviso');
  await p.evaluate(()=>document.querySelector('#utoast button').click()); await W(600);
  T(await p.evaluate(()=>progAct('f')&&progAct('f').id==='base_cali'),'deshacer vuelve a Base de calistenia');
  // 3. sesión suelta de otra rutina: no mueve la tuya
  await p.evaluate(()=>{ progSel='stopgap'; PRDAY=null; go('programa'); }); await p.evaluate(()=>progLoad('stopgap')); await p.evaluate(()=>{ PRDAY={p:'stopgap',i:1}; render(); }); await W(700);
  const n0=await p.evaluate(()=>progNext(progAct('f')));
  T(await p.evaluate(()=>!!document.querySelector('#app .prdx [data-prsue]')),'el día abierto de otra rutina ofrece hacerlo hoy');
  await p.evaluate(()=>document.querySelector('#app .prdx [data-prsue]').click()); await W(800);
  r=await p.evaluate(()=>({v:view,t:draft&&draft.tipo,prog:draft&&draft.prog,su:draft&&draft.suelta,n:draft&&draft.ej.length,ses:PRK.stopgap.ses[1].ej.length}));
  T(r.v==='fuerza'&&r.t==='Mancuernas en 3 días · Día B'&&!r.prog&&r.su&&r.su.i===1&&r.n>0,'arranca el día suelto sin marcar la rutina '+JSON.stringify(r));
  T(await p.evaluate(n0=>progNext(progAct('f'))===n0,n0),'tu rutina sigue en la misma sesión');
  await p.evaluate(()=>{ draft=null; lsSave&&lsSave(); }); await p.evaluate(()=>{ progSel='base_cali'; PRDAY={p:'base_cali',i:0}; go('programa'); }); await W(700);
  T(await p.evaluate(()=>!document.querySelector('#app [data-prsue]')),'en tu propia rutina no ofrece sesión suelta');
  // 4. Desafíos en Progreso › Resultados
  await p.evaluate(()=>{ PRDAY=null; go('hist'); }); await W(800);
  r=await p.evaluate(()=>{ const g=[...document.querySelectorAll('#app .ptl')].find(c=>/Resultados/.test(c.textContent)); return {in:!!(g&&g.querySelector('[data-stat="desafios"]')),t:(document.querySelector('[data-stat="desafios"]')||{}).textContent||''}; });
  T(r.in&&/Desafíos/.test(r.t)&&/de 8 hechos/.test(r.t),'fila Desafíos en Resultados '+r.t);
  await p.evaluate(()=>document.querySelector('[data-stat="desafios"]').click()); await W(700);
  r=await p.evaluate(()=>({v:view,h:document.querySelector('#app h1').textContent,n:document.querySelectorAll('#app [data-hero]').length}));
  T(r.v==='desafios'&&r.h==='Desafíos'&&r.n===8,'Desafíos con los 8 '+JSON.stringify(r));
  await p.evaluate(()=>document.querySelector('#app [data-hero]').click()); await W(700);
  r=await p.evaluate(()=>({v:view,k:(document.querySelector('#app .hrdk')||{}).textContent,b:document.querySelector('#back').getAttribute('aria-label')}));
  T(r.v==='heroe'&&/^Desafío · /.test(r.k)&&r.b==='Volver a Desafíos','ficha: Desafío · y volver a Desafíos '+JSON.stringify(r));
  await p.evaluate(()=>document.querySelector('#back').click()); await W(700); T(await p.evaluate(()=>view==='desafios'),'volver lleva a Desafíos');
  await p.evaluate(()=>document.querySelector('#back').click()); await W(700); T(await p.evaluate(()=>view==='hist'),'y de ahí a Progreso');
  // 5. Fuerza: Otras sesiones · Rutinas · Desafíos
  await p.evaluate(()=>{ draft=null; fzSel=null; go('fuerza'); }); await W(800);
  r=await p.evaluate(()=>({eb:[...document.querySelectorAll('#app .eyebrow')].map(x=>x.textContent),pr:(document.querySelector('#app [data-goprog] b')||{}).textContent,ds:(document.querySelector('#app [data-gohero] b')||{}).textContent}));
  T(r.eb.includes('Otras sesiones')&&r.pr==='Rutinas'&&r.ds==='Desafíos','Fuerza: '+JSON.stringify(r));
  await p.evaluate(()=>document.querySelector('#app [data-gohero]').click()); await W(700);
  T(await p.evaluate(()=>view==='desafios'&&dsFil==='f'),'Desafíos desde Fuerza, filtrado');
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
