const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await p.goto('http://127.0.0.1:8765/'+src); await W8(400); await seed(p); await W8(900);
await E(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); });
const card=async k=>{ await E(k=>{ TFIL=skRoot(k); CAM=null; TSEL=null; go('arbol'); },k); await W8(1200); await E(k=>treeSelect(k),k); await W8(900);
  return E(()=>{ const pn=document.querySelector('.tpanel'); const secs=[...pn.querySelectorAll('.fsec')].map(s=>({h:(s.querySelector('.fsh span')||{}).textContent||'',em:(s.querySelector('.fsh em')||{}).textContent||'',rows:[...s.querySelectorAll('.frow')].map(r=>({ok:r.classList.contains('ok'),lv:r.classList.contains('flv'),t:r.textContent.replace(/\s+/g,' ').trim()}))})); return {secs,txt:pn.innerText}; }); };
// bloqueada por requisitos y por nivel del árbol
let c=await card('dom_l'); const model=await E(()=>skFalta('dom_l'));
const ab=c.secs.find(s=>s.h==='Para abrirla');
ok(ab&&ab.rows.length===model.reqs.length+(model.lvl?1:0),`Dominada lastrada: "Para abrirla" lista cada requisito y el nivel (${ab&&ab.rows.length})`);
ok(ab&&ab.em===(model.miss===1?'falta 1 cosa':`faltan ${model.miss} cosas`),`cuenta lo que falta: "${ab&&ab.em}"`);
const lvr=ab&&ab.rows.find(r=>r.lv); ok(lvr&&/Árbol en nivel \d · /.test(lvr.t)&&/cualquier habilidad/.test(lvr.t),`el nivel del árbol va aparte y explica que sirven escalones de cualquier habilidad: "${lvr&&lvr.t}"`);
ok(ab&&ab.rows.filter(r=>!r.lv).every(r=>!/nivel/i.test(r.t)),'los requisitos de habilidades hablan de escalones, no de niveles');
ok(ab&&ab.rows.findIndex(r=>r.lv)===ab.rows.length-1,'el nivel del árbol queda al final, separado');
ok(c.secs.some(s=>s.h==='Para lograrla'&&/faltan \d+ escalones|falta 1 escalón/.test(s.em)),'"Para lograrla" dice cuántos escalones faltan');
ok(!/para abrir\b|para terminar|\bnv \d|\bPide\b/i.test(c.txt),'sin los mosaicos ambiguos ni "nv"');
// requisitos: tocar uno lleva a esa habilidad
await E(()=>document.querySelector('.tpanel .frow[data-tgo]').click()); await W8(900); ok(await E(()=>TSEL==='pull'),'tocar un requisito abre esa habilidad');
// equipo
c=await card('dom_l'); await E(()=>document.querySelector('.tpanel .frow[data-goeq]').click()); await W8(900); ok(await E(()=>view==='equipo'),'tocar el equipo que falta lleva a Equipo');
// bloqueada solo por requisitos: el nivel aparece cumplido y no suma
c=await card('planche'); const m2=await E(()=>skFalta('planche')); const ab2=c.secs.find(s=>s.h==='Para abrirla');
ok(m2.lvl&&m2.lvl.ok&&ab2.rows.find(r=>r.lv).ok&&ab2.em===`faltan ${m2.reqs.filter(r=>!r.ok).length} cosas`,`Planche: el nivel ya está y no cuenta como faltante (${ab2.em})`);
ok(ab2.rows.some(r=>/20 flexiones seguidas/.test(r.t)&&/en tus pruebas: \d+/.test(r.t)),'una marca de las pruebas se dice con número y lo que hiciste');
// disponible / en curso / lograda
c=await card('lsit'); ok(!c.secs.some(s=>s.h==='Para abrirla')&&c.secs.some(s=>s.h==='Para lograrla'),'disponible: solo "Para lograrla"');
c=await card('pull'); ok(c.secs.some(s=>s.h==='Para lograrla'&&/faltan/.test(s.em))&&/escalón 2 de 5/.test(c.txt),'en curso: escalón actual y lo que falta');
c=await card('bici_int'); ok(/Lograda/.test(c.txt)&&/los 4 escalones/.test(c.txt)&&/sesiones/.test(c.txt),'lograda: lo dice, con los escalones y su mejor marca con unidad');
c=await card('run'); ok(/Se mide solo con tus sesiones/.test(c.txt)&&/tu mejor \d+ min/.test(c.txt),'las de cardio dicen que se miden solas y muestran tu mejor');
// página de la habilidad
await E(()=>{ skSel='dom_l'; go('habilidad'); }); await W8(1200);
const hp=await E(()=>({t:document.querySelector('#sksheet').innerText,pide:!!document.querySelector('#sksheet .skreq')}));
ok(/Para abrirla/i.test(hp.t)&&!hp.pide&&/Árbol en nivel 4/.test(hp.t),'la página de la habilidad usa el mismo "Para abrirla"');
await E(()=>document.querySelector('#sksheet .skfalta [data-tgo]').click()); await W8(900); ok(await E(()=>skSel==='pull'&&/Tirón/.test(document.querySelector('#app h1').textContent)),'desde la página, tocar un requisito abre esa habilidad');
// vocabulario en toda la app: "nivel" solo para el árbol (y la bici); sin nv / niv. / pts / ≥
const S=[()=>go('home'),()=>go('hist'),()=>go('vos'),()=>{ resMode='mes'; go('resumen'); },()=>{ histEx='carga'; go('stat'); },()=>go('programas'),()=>{ catFrom='home'; go('catalogo'); },()=>{ draft=null; go('fuerza'); },()=>{ TFIL='f'; CAM=null; TSEL=null; go('arbol'); },()=>treeFly('t'),...['planche','lsit','bici_int','pull'].map(k=>`(()=>{ skSel=${JSON.stringify(k)}; go('habilidad'); })()`)];
let bads=[]; for(const f of S){ await E(f); await W8(1000); const t=await E(()=>document.querySelector('#app').innerText); const m=t.match(/\bnv \d|\bniv\.|\bpts\b|≥|\b\d+ ej\b|\bSem \d|en progreso|[A-Za-zÁÉÍÓÚáéíóúñ]+ · nivel \d|\bnivel (\d) de (?!6)/g); if(m) bads.push(...m); }
ok(!bads.length,`vocabulario parejo en toda la app ${JSON.stringify([...new Set(bads)])}`);
// volumen con el mismo formato
await E(()=>go('home')); await W8(900); const vh=await E(()=>document.querySelector('#app').innerText.match(/Fuerza\s+([\d.,]+ (kg|t))/)); ok(!vh||/kg$/.test(vh[0]),`Semana muestra el volumen en kg como Progreso (${vh?vh[0]:'sin fuerza hoy'})`);
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
