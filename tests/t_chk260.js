// v258: íconos dibujados en vez de caracteres (› ‹ ✓ ✕ × ＋ − + ↑ ↓ → ↳ ⤢ ★ ⚑ ⌃ ⌄ ⋯)
const {chromium}=require('playwright'); const seed=require('./seed.js'); const fs=require('fs');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  // el código: ninguno de estos caracteres queda como ícono
  { const s=fs.readFileSync(require('path').join(__dirname,'..',src),'utf8'); for(const g of ['›','‹','✓','✕','＋','↳','⤢','★','⚑','⌃','⌄']) T(!s.includes(g),`el código no usa ${g}`);
    T(!/>[×✕]<\/(button|i)>/.test(s),'ningún botón cierra con × de texto'); T(!/">[−+]<\/button>/.test(s),'ningún botón − / + de texto'); T(!/content:"[›⤢]"/.test(s),'ningún ::before/::after con caracteres'); }
  const GL=['›','‹','✓','✕','＋','↳','⤢','★','⚑','⌃','⌄','↑','↓','→','⋯','↔'];
  const SC=[
   ['inicio',"HOMEP=null; go('home')"], ['menú +',"HOMEP=null; go('home'); setTimeout(()=>openFab(),500)"],
   ['sesión',"fzSel=nextTipo(); nuevoDraft(fzSel,{}); draft.ej[0].series.push({kg:40,r:8,ty:'d',sub:[{kg:30,r:6}]}); go('fuerza')"],
   ['ayuda sesión',"fzSel=nextTipo(); nuevoDraft(fzSel,{}); go('fuerza'); setTimeout(()=>$('#fHelp').click(),500)"],
   ['prueba',"fzSel=nextTipo(); nuevoDraft(fzSel,{}); if(!draft.skills.length) draft.skills.push({k:Object.keys(SKILLS).find(k=>!SKILLS[k].auto&&SKILLS[k].lv&&SKILLS[k].lv.length>1),val:0}); cur=draft.ej.length; go('fuerza')"],
   ['editar',"draft=null; editSession(SESS.find(x=>x.kind==='fuerza'))"],
   ['agregar',"fzSel=nextTipo(); nuevoDraft(fzSel,{}); go('agregar')"],
   ['cardio',"bike.modo='bici'; bike.sel=protPorTipo('bici','tranqui'); bkStart(); go('bici')"],
   ['progreso',"histTab='res'; go('hist')"], ['sesiones',"histEx='todo'; todoFil='todas'; todoSel=null; go('stat')"], ['cuerpo',"go('cuerpo')"],
   ['árbol ayuda',"go('arbol'); setTimeout(()=>$('#aHelp').click(),800)"], ['árbol panel',"go('arbol'); setTimeout(()=>treeSelect('push'),800)"], ['árbol filtro',"TFQ=Object.keys(TFQ_L).find(k=>k)||''; go('arbol')"],
   ['test',"skSel='push'; go('habilidad'); setTimeout(()=>skTest('push'),600)"],
   ['vos',"go('vos')"], ['ajustes',"ajFrom=null; ajSec=null; go('ajustes')"], ['contadores',"ajFrom=null; ajSec='hoy'; go('ajustes')"], ['equipo',"eqFrom='ajustes'; go('equipo')"],
   ['molestias',"draft=null; CFG.molestias=[{a:'rodilla',desde:hoyISO(),hasta:addDays(hoyISO(),7)}]; molSel=null; go('molestias')"],
   ['buscar',"catFil='todos'; catQ='remo'; go('catalogo')"], ['programas',"prFil='todo'; go('programas')"],
   ['primer inicio',"ob={step:2,i:0,vals:Object.assign({},CFG.tests)}; CFG.onboarded=false; render()"],
   ['ideas',"DEVN=Array.from({length:6},(_,i)=>({id:'d'+i,txt:'Idea '+i,tipo:'idea',ctx:{v:'home'},fecha:hoyISO()})); ajFrom=null; ajSec='datos'; go('ajustes')"],
   ['ocupado',"bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); draft=null; go('fuerza')"],
  ];
  const audit=p=>p.evaluate(GL=>{ const vis=e=>{ const r=e.getBoundingClientRect(); if(!r.width||!r.height) return false; const cs=getComputedStyle(e); return cs.visibility!=='hidden'&&cs.display!=='none'; };
    const left=[]; const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; while(n=tw.nextNode()){ const t=n.textContent; if(GL.some(g=>t.includes(g))&&n.parentElement&&vis(n.parentElement)&&!n.parentElement.closest('script,style')) left.push(t.trim().slice(0,40)); }
    const css=[...document.querySelectorAll('body *')].filter(vis).flatMap(e=>['::before','::after'].map(ps=>getComputedStyle(e,ps).content).filter(c=>GL.some(g=>c.includes(g))));
    const ic=[...document.querySelectorAll('svg.gi')].filter(vis); const sz=ic.filter(s=>{ const r=s.getBoundingClientRect(); return r.width<9||r.width>26||Math.abs(r.width-r.height)>.5; }).map(s=>s.parentElement.className+':'+Math.round(s.getBoundingClientRect().width));
    const col=ic.filter(s=>{ const cs=getComputedStyle(s); return cs.stroke!==cs.color||cs.fill!=='none'; }).map(s=>s.parentElement.className);
    const lab=[...document.querySelectorAll('button')].filter(vis).filter(bt=>!bt.textContent.trim()&&bt.querySelector('svg.gi')&&!bt.getAttribute('aria-label')&&!bt.closest('[aria-hidden="true"]')).map(bt=>bt.className||bt.outerHTML.slice(0,60));
    return {n:ic.length,left,css,sz,col,lab}; },GL);
  let tot=0;
  const COMB=[[390,844,'vertical','dark'],[390,844,'vertical','light'],[844,390,'horizontal','dark'],[844,390,'horizontal','light']];
  await Promise.all(COMB.map(async([W,H,tag,sch])=>{
    for(const [nm,js] of SC){ const ctx=await b.newContext({viewport:{width:W,height:H},colorScheme:sch}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(nm+': '+e.message));
      await p.goto('http://127.0.0.1:8765/'+src); await W8(p,300); await seed(p); await W8(p,400);
      await p.evaluate(sch=>{ PERF.modo='max'; perfApply(); CFG.tema=sch; applyTema(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; },sch);
      await p.evaluate(js=>{ scrollTo(0,0); eval(js); },js); await W8(p,1300);
      const r=await audit(p); tot+=r.n; const k=`${tag} ${sch} · ${nm}`;
      T(!r.left.length,`${k}: sin caracteres a la vista ${JSON.stringify(r.left.slice(0,3))}`); T(!r.css.length,`${k}: sin caracteres en CSS ${r.css}`);
      T(!r.sz.length,`${k}: íconos de 9 a 26 px y cuadrados ${JSON.stringify(r.sz.slice(0,3))}`); T(!r.col.length,`${k}: el trazo hereda el color ${JSON.stringify(r.col.slice(0,3))}`);
      T(!r.lab.length,`${k}: botones solo con ícono tienen nombre ${JSON.stringify(r.lab.slice(0,3))}`);
      await ctx.close(); } }));
  T(tot>800,`se vieron íconos en todas las pantallas (${tot})`);
  // que sigan funcionando
  { const ctx=await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await W8(p,300); await seed(p); await W8(p,400); await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; decir=()=>{}; beep=()=>{}; NAV.length=0; go('vos'); }); await W8(p,900);
    const v0=await p.evaluate(()=>$('#vPeso').value); await p.click('#app .vpb[data-pv="0.1"]'); await W8(p,500);
    const v1=await p.evaluate(()=>$('#vPeso').value); T(v0!==v1,`el + del peso suma (${v0} → ${v1})`);
    const e0=errs.length; await p.click('#app .vpb[data-pv="0.1"]'); await p.evaluate(()=>go('home')); await W8(p,1200); T(errs.length===e0,'tocar + y salir enseguida no tira error'); T(await p.evaluate(v=>Math.abs(MED[hoyISO()].peso-(+String(v).replace(',','.')+0.2))<0.01,v0),'y el peso queda guardado');
    await p.evaluate(()=>{ catFil='todos'; catQ='remo'; go('catalogo'); }); await W8(p,900); await p.click('#catQx'); await W8(p,500); T(await p.evaluate(()=>!catQ&&document.getElementById('catQ').value===''),'la × de buscar borra');
    await p.evaluate(()=>{ go('arbol'); setTimeout(()=>treeSelect('push'),700); }); await W8(p,1700); await p.click('#app .tpanel .tpx'); await W8(p,800); T(await p.evaluate(()=>TSEL===null&&document.querySelector('#app .tpanel').getBoundingClientRect().top>=innerHeight-2),'la × del panel del árbol lo cierra');
    await p.evaluate(()=>{ fzSel=nextTipo(); nuevoDraft(fzSel,{}); go('fuerza'); }); await W8(p,900); await p.click('#app .kpin[data-kg]'); await W8(p,600);
    T(await p.evaluate(()=>{ const g=document.querySelector('#kpad button.go'); return !!g&&/Reps/.test(g.textContent)&&!!g.querySelector('svg.gi'); }),'el teclado dice Reps con la flecha dibujada');
    T(await p.evaluate(()=>{ const s=document.querySelector('#wuDet summary'); if(!s) return false; const c=getComputedStyle(s,'::before'); return c.content==='""'&&parseFloat(c.width)>=14&&((c.maskImage||'')+(c.webkitMaskImage||'')).includes('svg'); }),'la entrada en calor muestra la flecha dibujada');
    await ctx.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
