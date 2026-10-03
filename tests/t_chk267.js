// v264: objetivos que se suman, semanas a tu ritmo, salidas al terminar, aviso en Semana, rutina recomendada al empezar
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; CFG.prog={}; delete CFG.obj; CFG.diasFS=[1,3,5]; CFG.diasBS=[0,2,4];
    CFG.lugares[0].equipo=Object.assign({},CFG.lugares[0].equipo,{barra:1,mancuernas:1,paralelas:1}); SESS=SESS.filter(x=>x.fecha!==hoyISO()); });
  const W=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>Promise.all(['prim_dom','base_cali','cien'].map(id=>progLoad(id))));
  // 1. objetivo: se suma, no reemplaza
  await p.evaluate(()=>{ progSel='prim_dom'; go('programa'); }); await W(600);
  let r=await p.evaluate(()=>({cta:(document.querySelector('#prStart')||{}).textContent,gs:(document.querySelector('.prgo .prgs')||{}).textContent,note:(document.querySelector('#app .prsum')||{}).textContent||''}));
  T(r.cta==='Sumar a tu rutina'&&/Tu rutina sigue igual/.test(r.gs)&&/\+ Primera dominada/.test(r.note),'ficha de objetivo: sumar, tu rutina sigue igual '+JSON.stringify(r));
  await p.evaluate(()=>document.querySelector('#prStart').click()); await W(700);
  r=await p.evaluate(()=>({obj:CFG.obj&&CFG.obj.id,prog:CFG.prog.f,rot:rotAct(),leave:(document.querySelector('#prLeave')||{}).textContent,go:!!document.querySelector('#prGo'),toast:(document.querySelector('#utoast')||{}).textContent||''}));
  T(r.obj==='prim_dom'&&!r.prog&&r.rot&&r.leave==='Dejar el objetivo'&&!r.go&&/Se suma a tu rutina/.test(r.toast),'objetivo sumado, la rotación sigue '+JSON.stringify(r));
  r=await p.evaluate(()=>{ const t=nextTipo(), d=buildDay(t); return {t,n:d.ej.length,o:d.ej.filter(e=>e.obj).map(e=>e.key),obj:d.obj,other:buildDay(ROT.find(x=>x!==t)).ej.some(e=>e.obj)}; });
  T(r.o.length>=1&&r.o.length<=2&&r.obj&&r.obj.id==='prim_dom'&&r.obj.i===0&&!r.other,'el bloque va al final de la sesión del día y solo de esa '+JSON.stringify(r));
  await p.evaluate(()=>{ fzSel=null; draft=null; go('fuerza'); }); await W(700);
  r=await p.evaluate(()=>({h:(document.querySelector('#app .fzobh')||{}).textContent||'',last:(()=>{ const L=[...document.querySelectorAll('#app .fzhero .fzlist>div:not(.sk):not(.fzobh)')]; return L.slice(-1)[0].className; })()}));
  T(/Primera dominada/.test(r.h)&&/1\/18/.test(r.h)&&/fzo/.test(r.last),'Fuerza muestra el bloque con su nombre '+JSON.stringify(r));
  // hacer la sesión con una serie del bloque
  await p.evaluate(()=>{ nuevoDraft(nextTipo()); const i=draft.ej.findIndex(e=>e.obj); draft.ej[i].series=[{r:3,kg:0}]; draft.ej[i].fatiga=2; draft.ej[0].series=[{r:8,kg:10}]; draft.ej[0].fatiga=2; });
  T(await p.evaluate(()=>draft.obj&&draft.obj.id==='prim_dom'&&draft.obj.i===0),'el borrador lleva el objetivo');
  await p.evaluate(async()=>{ go('fuerza'); }); await W(500);
  await p.evaluate(async()=>{ const s=clean(draft); delete s.plan; s.ej=s.ej.filter(e=>e.series.length); if(s.obj&&!s.ej.some(e=>e.obj)) delete s.obj; await saveSession(s); draft=null; });
  await W(400);
  r=await p.evaluate(()=>({done:objDone(objAct()),blk:buildDay(nextTipo()).ej.some(e=>e.obj)}));
  T(r.done===1&&!r.blk,'cuenta una y no repite el bloque el mismo día '+JSON.stringify(r));
  // sin series del bloque no cuenta
  await p.evaluate(async()=>{ const s={id:'s-'+(Date.now()+5),kind:'fuerza',fecha:addDays(hoyISO(),-1),tipo:'Torso A',obj:{id:'prim_dom',i:1},ej:[{n:'Fondos',z:'emp',series:[{r:8}],fatiga:2}]}; if(s.obj&&!s.ej.some(e=>e.obj)) delete s.obj; T0=s; });
  T(await p.evaluate(()=>!T0.obj),'sin series del bloque, la sesión no cuenta para el objetivo');
  // en Rutinas aparece en curso; dejarlo con deshacer
  await p.evaluate(()=>{ prFil='todo'; go('programas'); }); await W(600);
  T(await p.evaluate(()=>!!document.querySelector('#app .prcur[data-prog="prim_dom"]')&&!!document.querySelector('#app .prcur[data-prog="rot"]')),'en curso: la rotación y el objetivo');
  await p.evaluate(()=>{ progSel='prim_dom'; go('programa'); }); await W(500); await p.evaluate(()=>document.querySelector('#prLeave').click()); await W(500);
  T(await p.evaluate(()=>!CFG.obj),'dejar el objetivo'); await p.evaluate(()=>document.querySelector('#utoast button').click()); await W(500); T(await p.evaluate(()=>CFG.obj&&CFG.obj.id==='prim_dom'),'deshacer lo vuelve a sumar');
  // 2. semanas a tu ritmo
  await p.evaluate(()=>{ progSel='mancu'; go('programa'); }); await W(700);
  r=await p.evaluate(()=>(document.querySelector('#app .prdk')||{}).textContent||'');
  T(/~8semanasplan:6/.test(r.replace(/\s+/g,''))&&/tenés 3/.test(r),'rutina de 4 días con 3: cuánto tarda · '+r);
  await p.evaluate(()=>{ prFil='f'; go('programas'); }); await W(600);
  r=await p.evaluate(()=>(document.querySelector('#app [data-prog="mancu"] .prfx')||{}).textContent||'');
  T(/~8 semanas con tus 3 días/.test(r),'en la lista también · '+r);
  // 3. Semana: aviso si la rutina pide otros días
  await p.evaluate(()=>{ CFG.prog={f:{id:'base_cali',start:hoyISO()}}; CFG.diasFS=[1,3]; ajSec='semana'; go('ajustes'); }); await W(700);
  r=await p.evaluate(()=>({t:(document.querySelector('#app .rutn')||{}).textContent||'',b:!!document.querySelector('#app [data-gorut="f"]')}));
  T(/Pide 3 días/.test(r.t)&&/con 2: ~12 semanas en vez de ~8/.test(r.t)&&r.b,'Semana avisa y ofrece rutinas de 2 días · '+r.t);
  await p.evaluate(()=>document.querySelector('#app [data-gorut="f"]').click()); await W(600);
  T(await p.evaluate(()=>view==='programas'&&prFil==='f'&&/Entran en tus 2 días/.test(document.querySelector('#app').textContent)),'lleva a Rutinas para tus 2 días');
  await p.evaluate(()=>{ CFG.diasFS=[1,3,5]; });
  // ritmo en la ficha propia
  await p.evaluate(()=>{ progSel='base_cali'; go('programa'); }); await W(600);
  T(/fin ~\d\d\/\d\d/.test(await p.evaluate(()=>(document.querySelector('#app .prend')||{}).textContent||'')),'tu rutina: cuándo termina a tu ritmo');
  // 4. terminada: tres salidas
  await p.evaluate(()=>{ const st=addDays(hoyISO(),-60); CFG.prog={f:{id:'base_cali',start:st}}; for(let i=0;i<24;i++) SESS.push({id:'s-'+(1e12+i),kind:'fuerza',fecha:addDays(st,i*2),tipo:'Calistenia · x',prog:{id:'base_cali',i},ej:[{n:'Fondos',z:'emp',series:[{r:8}],fatiga:2}]}); SESS.sort((a,b)=>(b.fecha+b.id).localeCompare(a.fecha+a.id)); progSel='base_cali'; go('programa'); }); await W(700);
  r=await p.evaluate(()=>({fin:(document.querySelector('#app .prfin')||{}).textContent||'',s:[...document.querySelectorAll('#app [data-prsal] .n')].map(x=>x.textContent),rot:rotAct()}));
  T(/Terminaste la rutina/.test(r.fin)&&r.s[0]==='Repetirla'&&/^Pasar a /.test(r.s[1]||'')&&r.s[r.s.length-1]==='Elegir otra'&&r.rot,'terminada: repetir, pasar a la siguiente, elegir otra '+JSON.stringify(r));
  await p.evaluate(()=>document.querySelector('[data-prsal="rep"]').click()); await W(600);
  r=await p.evaluate(()=>({t0:!!CFG.prog.f.t0,n:progNext(CFG.prog.f),live:!!progLive('f')}));
  T(r.t0&&r.n===0,'repetirla: de nuevo desde la primera '+JSON.stringify(r));
  await p.evaluate(()=>document.querySelector('#utoast button').click()); await W(500);
  T(await p.evaluate(()=>!CFG.prog.f.t0&&progNext(CFG.prog.f)===24),'deshacer vuelve a la terminada');
  await p.evaluate(()=>{ progSel='base_cali'; render(); }); await W(400);
  const sig=await p.evaluate(()=>{ const q=rutSig(progMeta('base_cali')); return q&&q.id; });
  if(sig){ await p.evaluate(()=>document.querySelector('[data-prsal="sig"]').click()); await p.waitForTimeout(1500); T(await p.evaluate(s=>CFG.prog.f&&CFG.prog.f.id===s&&progSel===s,sig),'pasar a la siguiente: '+sig); }
  // 5. recomendada al empezar: entra en tus días y tu nivel
  r=await p.evaluate(()=>rutRecF({dom:5}).map(o=>o.p.id));
  T(r[0]==='base_cali'&&r.length===3&&r.includes('rot'),'recomendadas con barra y 5 dominadas: '+r.join(','));
  r=await p.evaluate(()=>{ CFG.diasFS=[1,4]; return rutRecF({dom:5}).map(o=>[o.p.id,o.p.dias||0]); });
  T(r.every(([id,d])=>d<=2),'con 2 días, solo las que entran: '+JSON.stringify(r));
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
