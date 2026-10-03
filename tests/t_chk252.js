// v250: tarjeta de Inicio ⇄ reproductor, isla escondida de verdad, deshacer peso/cintura, nombres de Ajustes
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prevR.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H,live,mode)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(([live,mode])=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; if(live){ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); MINI.mode=mode||'isle'; } HOMEP=null; go('home'); },[live,mode]); await p.waitForTimeout(1500); return p; };
  const W8=(p,t)=>p.waitForTimeout(t);
  const clickNav=async(p,lbl)=>{ const r=await p.evaluate(lbl=>{ const e=[...document.querySelectorAll('#nav button')].find(x=>(x.textContent+(x.getAttribute('aria-label')||'')).includes(lbl)); const q=e.getBoundingClientRect(); return {x:q.x+q.width/2,y:q.y+q.height/2}; },lbl); await p.mouse.click(r.x,r.y); };
  const mbShown=p=>p.evaluate(()=>{ const m=document.getElementById('minibar'); return !!m&&!m.hidden&&getComputedStyle(m).display!=='none'; });
  // 1. la sesión entre Inicio y el resto
  { const p=await open(390,844,true,'isle');
    T(!(await mbShown(p)),'Inicio con la tarjeta a la vista: la isla no se ve');
    T(await p.evaluate(()=>{ const P=vtPairsFor('home','hist'); return !!P&&P.length===1&&P[0].n==='vlive'&&P[0].to==='#minibar'&&P[0].el.matches('[data-card^="live"]'); }),'de Inicio sale la tarjeta hacia el reproductor');
    T(await p.evaluate(()=>{ goNow('hist'); const m=document.getElementById('minibar'); return !m.hidden; }),'el reproductor está en el mismo cuadro que la pantalla nueva');
    T(await p.evaluate(()=>{ const P=vtPairsFor('hist','home'); return !!P&&P[0].el.id==='minibar'&&P[0].n==='vlive'; }),'hacia Inicio sale el reproductor hacia la tarjeta');
    await p.evaluate(()=>goNow('home')); await W8(p,600);
    // con clics de verdad (pasa por la transición)
    await clickNav(p,'Progreso'); await W8(p,1300); T(await p.evaluate(()=>view==='hist')&&await mbShown(p),'Progreso: reproductor a la vista');
    T(await p.evaluate(()=>!document.body.classList.contains('vthide')&&!document.body.classList.contains('vtnow')&&!document.getElementById('minibar').style.viewTransitionName),'sin estado colgado de la transición');
    await clickNav(p,'Semana'); await W8(p,1300); T(await p.evaluate(()=>view==='home')&&!(await mbShown(p)),'de vuelta en Inicio: la isla se va');
    T(await p.evaluate(()=>!document.querySelector('#app [data-card^="live"]').style.viewTransitionName),'la tarjeta queda sin nombre de transición');
    await p.close(); }
  { const p=await open(390,844,true,'tab'); T(await p.evaluate(()=>{ const P=vtPairsFor('home','hist'); return !!P&&P.length===1&&P[0].n==='vlive'&&P[0].to==='#minibar'; }),'escondido en el costado: la tarjeta también se guarda en la pestaña'); await p.close(); }
  { const p=await open(390,844,true,'card'); T(!(await mbShown(p)),'tarjeta flotante: tampoco se ve en Inicio'); await clickNav(p,'Progreso'); await W8(p,1300); T(await mbShown(p),'tarjeta flotante: aparece en Progreso'); await p.close(); }
  // 2. peso y cintura
  { const p=await open(390,844,false); await p.evaluate(()=>{ const h=hoyISO(); if(MED[h]){ delete MED[h].peso; delete MED[h].cintura; } go('vos'); }); await W8(p,1000);
    const cfg0=await p.evaluate(()=>CFG.peso);
    const tap=async sel=>{ const r=await p.evaluate(s=>{ const e=document.querySelector(s).getBoundingClientRect(); return {x:e.x+e.width/2,y:e.y+e.height/2}; },sel); await p.mouse.click(r.x,r.y); };
    await tap('[data-pv="0.1"]'); await W8(p,1100); const t1=await p.evaluate(()=>{ const t=document.getElementById('utoast'); return t?t.textContent:''; });
    T(/Peso de hoy/.test(t1)&&/Deshacer/.test(t1),'peso: el toque que crea la pesada de hoy avisa con Deshacer');
    await p.evaluate(()=>document.querySelector('#utoast .utu').click()); await W8(p,500);
    T(await p.evaluate(c=>{ const m=MED[hoyISO()]; return (!m||m.peso==null)&&CFG.peso===c; },cfg0),'peso: Deshacer borra la pesada y vuelve el valor anterior');
    await p.evaluate(()=>{ const h=hoyISO(); MED[h]=MED[h]||{}; MED[h].peso=80; render(); const t=document.getElementById('utoast'); if(t) t.remove(); }); await W8(p,600);
    await tap('[data-pv="0.1"]'); await W8(p,1100); T(await p.evaluate(()=>!document.getElementById('utoast')&&MED[hoyISO()].peso===80.1),'peso: si ya estaba cargado, el toque ajusta sin aviso');
    await p.evaluate(()=>{ const h=hoyISO(); delete MED[h].peso; render(); }); await W8(p,500); await p.evaluate(()=>{ const i=document.getElementById('vPeso'); i.value='81,4'; i.dispatchEvent(new Event('change')); }); await W8(p,500);
    T(await p.evaluate(()=>!document.getElementById('utoast')&&MED[hoyISO()].peso===81.4),'peso escrito a mano: se guarda sin aviso');
    await tap('[data-cv="0.5"]'); await W8(p,1100); T(await p.evaluate(()=>{ const t=document.getElementById('utoast'); return !!t&&/Cintura de hoy/.test(t.textContent); }),'cintura: el primer toque del día avisa con Deshacer');
    await p.evaluate(()=>document.querySelector('#utoast .utu').click()); await W8(p,400); T(await p.evaluate(()=>MED[hoyISO()].cintura==null),'cintura: Deshacer la borra');
    await p.close(); }
  // 3. Ajustes
  { const p=await open(390,844,false); await p.evaluate(()=>{ ajSec=null; go('ajustes'); }); await W8(p,900);
    T(await p.evaluate(()=>document.querySelector('.ajrow[data-sec="equipo"] .n').textContent==='Equipo'),'la fila se llama Equipo, como la pantalla');
    await p.evaluate(()=>{ eqFrom='ajustes'; go('equipo'); }); await W8(p,900); T(await p.evaluate(()=>document.querySelector('#app h1').textContent.trim()==='Equipo'),'la pantalla se llama Equipo');
    T(await p.evaluate(()=>{ const r=document.querySelector('.eqt2 .ckb').getBoundingClientRect(); return r.width>=44&&r.height>=44; }),'el círculo de Equipo: 44 px'); await p.close(); }
  for(const [W,H] of [[844,390],[667,375],[1180,820]]){ const p=await open(W,H,false); await p.evaluate(()=>{ ajSec='semana'; go('ajustes'); }); await W8(p,1200);
    const cut=await p.evaluate(()=>[...document.querySelectorAll('#app .ajside .ajrow .n')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>n.textContent));
    T(!cut.length,`${W}×${H}: ningún nombre cortado ${JSON.stringify(cut)}`);
    if(W===1180) T(await p.evaluate(()=>document.querySelector('#app .ajmh').textContent.trim()==='Semana'&&[...document.querySelectorAll('#app .ajside .ajrow .v')].every(v=>v.scrollWidth<=v.clientWidth+1)),'tablet: los valores entran enteros'); await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
