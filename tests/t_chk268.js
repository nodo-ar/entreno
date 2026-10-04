// v266: desafíos propuestos — entrada, cierre, cada 6 semanas con la rutina sin fin, nivel y la línea en Inicio
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; delete CFG.sugHoy; sugHoy=()=>null; delete CFG.dsNo; delete CFG.obj;
    CFG.tests=Object.assign({},CFG.tests,{dom:6,flex:15}); CFG.diasFS=[...new Set([...(CFG.diasFS||[]),wdIdx(hoyISO())])]; CFG.diasBS=(CFG.diasBS||[]).filter(i=>i!==wdIdx(hoyISO())); SESS=SESS.filter(x=>x.fecha<hoyISO()&&!x.hero); });
  const W=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>progLoad('base_cali'));
  // 1. entrada: rutina recién empezada
  await p.evaluate(()=>{ CFG.prog={f:{id:'base_cali',start:hoyISO()}}; go('home'); }); await W(800);
  let r=await p.evaluate(()=>({S:dsProp(),row:(document.querySelector('#app .dsrow')||{}).textContent||''}));
  T(r.S&&r.S.k==='e'&&r.S.h.id==='perseo'&&r.S.v===1,'entrada: Perseo, nivel intermedio por 6 dominadas '+JSON.stringify(r.S&&{k:r.S.k,h:r.S.h.id,v:r.S.v}));
  T(/Desafío de entrada/.test(r.row)&&/Perseo · nivel intermedio/.test(r.row)&&!/¿/.test(r.row),'la línea en Inicio · '+r.row.replace(/\s+/g,' '));
  await p.evaluate(()=>document.querySelector('#dsGo').click()); await W(700);
  r=await p.evaluate(()=>({v:view,h:heroSel,hv:heroV,prop:(document.querySelector('#app .hrprop')||{}).textContent||''}));
  T(r.v==='heroe'&&r.h==='perseo'&&r.hv===1&&/Entrada · Base de calistenia/.test(r.prop),'abre Perseo en Intermedio, con para qué '+JSON.stringify(r));
  // la ficha de la rutina: entrada esta semana → cierre al final
  await p.evaluate(()=>{ progSel='base_cali'; go('programa'); }); await W(700);
  r=await p.evaluate(()=>(document.querySelector('#app .prds')||{}).textContent||'');
  T(/Perseo · Intermedio/.test(r)&&/entrada\s*pendiente/.test(r)&&/cierre\s*al final/.test(r),'ficha: entrada y cierre · '+r.replace(/\s+/g,' '));
  // descartar con deshacer
  await p.evaluate(()=>go('home')); await W(600); await p.evaluate(()=>document.querySelector('#dsNo').click()); await W(600);
  T(await p.evaluate(()=>!document.querySelector('#app .dsrow')&&dsProp()===null),'descartado: no vuelve para esta rutina');
  await p.evaluate(()=>document.querySelector('#utoast button').click()); await W(600);
  T(await p.evaluate(()=>!!document.querySelector('#app .dsrow')),'deshacer lo vuelve a mostrar');
  // hecho el de entrada: ya no propone y la ficha muestra la marca
  await p.evaluate(()=>{ SESS.unshift({id:'s-'+Date.now(),kind:'fuerza',fecha:hoyISO(),tipo:'Perseo · Intermedio',hero:{id:'perseo',v:1,r:7,full:true},ej:[]}); go('home'); }); await W(600);
  T(await p.evaluate(()=>dsProp()===null&&!document.querySelector('#app .dsrow')),'con la entrada hecha, no propone');
  await p.evaluate(()=>{ progSel='base_cali'; go('programa'); }); await W(600);
  T(/entrada\s*7 r/.test(await p.evaluate(()=>(document.querySelector('#app .prds')||{}).textContent||'')),'la ficha muestra la marca de entrada');
  // 2. cierre: terminada, con la entrada de antes
  await p.evaluate(()=>{ const st=addDays(hoyISO(),-60); CFG.prog={f:{id:'base_cali',start:st}}; SESS=SESS.filter(x=>!x.hero); SESS.push({id:'s-'+(1e12-1),kind:'fuerza',fecha:addDays(st,1),tipo:'Perseo',hero:{id:'perseo',v:1,r:6,full:true},ej:[]});
    for(let i=0;i<24;i++) SESS.push({id:'s-'+(1e12+i),kind:'fuerza',fecha:addDays(st,2+i*2),tipo:'Calistenia · x',prog:{id:'base_cali',i},ej:[{n:'Fondos',z:'emp',series:[{r:8}],fatiga:2}]}); SESS.sort((a,b)=>(b.fecha+b.id).localeCompare(a.fecha+a.id)); go('home'); }); await W(700);
  r=await p.evaluate(()=>({S:dsProp(),row:(document.querySelector('#app .dsrow')||{}).textContent||''}));
  T(r.S&&r.S.k==='c'&&r.S.v===1&&/Desafío de cierre/.test(r.row),'cierre: la misma prueba en el mismo nivel · '+r.row.replace(/\s+/g,' '));
  await p.evaluate(()=>{ progSel='base_cali'; go('programa'); }); await W(600);
  r=await p.evaluate(()=>(document.querySelector('#app .prds')||{}).textContent||'');
  T(/entrada\s*6 r/.test(r)&&/cierre\s*ahora/.test(r),'ficha terminada: entrada 6 r → cierre ahora · '+r.replace(/\s+/g,' '));
  // 3. la rutina sin fin: cada 6 semanas
  await p.evaluate(()=>{ CFG.prog={}; SESS=SESS.filter(x=>!x.hero); const h=hoyISO(); for(let i=0;i<8;i++) SESS.push({id:'s-'+(2e12+i),kind:'fuerza',fecha:addDays(h,-3-i*4),tipo:'Torso A',ej:[{n:'Fondos',z:'emp',series:[{r:8}],fatiga:2}]}); SESS.sort((a,b)=>(b.fecha+b.id).localeCompare(a.fecha+a.id)); go('home'); }); await W(700);
  r=await p.evaluate(()=>({S:dsProp(),row:(document.querySelector('#app .dsrow')||{}).textContent||''}));
  T(r.S&&r.S.k==='r'&&r.S.h.id==='hercules'&&r.S.v===1&&/cada 6 semanas/.test(r.row),'sin fin: Hércules cada 6 semanas · '+r.row.replace(/\s+/g,' '));
  await p.evaluate(()=>{ SESS.unshift({id:'s-'+(3e12),kind:'fuerza',fecha:addDays(hoyISO(),-20),tipo:'Hércules',hero:{id:'hercules',v:1,seg:900,full:true},ej:[]}); go('home'); }); await W(500);
  T(await p.evaluate(()=>dsProp()===null),'hecho hace 20 días: todavía no');
  // nivel: dos completas seguidas en Intermedio → Completo
  await p.evaluate(()=>{ SESS.unshift({id:'s-'+(3e12+1),kind:'fuerza',fecha:addDays(hoyISO(),-50),tipo:'Hércules',hero:{id:'hercules',v:1,seg:950,full:true},ej:[]}); SESS.sort((a,b)=>(b.fecha+b.id).localeCompare(a.fecha+a.id)); });
  T(await p.evaluate(()=>dsNivel(heroOf('hercules'))===2),'dos completas en Intermedio: propone Completo');
  // 4. con una sesión andando, no molesta
  await p.evaluate(()=>{ SESS=SESS.filter(x=>!x.hero); bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); go('home'); }); await W(700);
  T(await p.evaluate(()=>!!dsProp()&&!document.querySelector('#app .dsrow')),'con cardio andando no muestra la línea');
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
