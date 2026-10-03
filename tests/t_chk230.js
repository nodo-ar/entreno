const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
for(const [W,Hh,isle] of [[360,640,0],[360,640,'isle'],[390,844,0],[390,844,'isle'],[412,800,'isle'],[412,915,0],[320,568,0],[390,844,'card'],[390,844,'tab'],[360,640,'card']]){
  const p=await (await b.newContext({viewport:{width:W,height:Hh},deviceScaleFactor:1})).newPage(); p.on('pageerror',e=>{ if(!/reading 'ph'/.test(e.message)) errs.push(e.message); });
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1000);
  const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms), tag=`${W}x${Hh}${isle?' '+isle:''}`;
  await E(isle=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); if(isle) localStorage.setItem(LSK+'.miniMode',JSON.stringify({m:isle,side:'r',ty:.5})); MINI.mode=isle||null; go('bici'); },isle); await W8(700);
  if(isle){ await E(()=>{ const g=document.querySelector('#goBike'); if(g) g.click(); }); await W8(3500); /* cada sesión arranca arriba: se elige el modo a mano */ await E(isle=>{ MINI.pos=[1,1]; MINI.side='r'; MINI.ty=.5; MINI.mode=isle; MINI.ses=miniSesKey(); miniSave(); },isle); }
  await E(()=>{ TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(1600);
  const m=await E(()=>{ const nav=document.querySelector('#nav').getBoundingClientRect(), fab=document.querySelector('#fab').getBoundingClientRect(), rail=document.querySelector('.trail').getBoundingClientRect(), hub=document.querySelector('.thub[data-hub="f"] .hbt').getBoundingClientRect(), vp=document.querySelector('.tvp').getBoundingClientRect();
    return {vpBot:Math.round(vp.bottom),ih:innerHeight,railBot:Math.round(rail.bottom),fabTop:Math.round(fab.top),hubBot:Math.round(hub.bottom),navTop:Math.round(nav.top)}; });
  ok(m.vpBot<=m.ih+1,`${tag}: el mapa no pasa la pantalla ${JSON.stringify(m)}`);
  ok(m.railBot<=m.fabTop-6,`${tag}: el riel queda arriba del +`);
  if(isle==='card') ok(await E(()=>{ const mb=document.querySelector('#minibar').getBoundingClientRect(), r=document.querySelector('.trail').getBoundingClientRect(), h=document.querySelector('.thub[data-hub="f"] .hbt').getBoundingClientRect(); return r.bottom<=mb.top-6&&(h.bottom<=mb.top-2||h.right<=mb.left); }),`${tag}: la tarjeta de sesión no tapa el riel ni la raíz`);
  ok(m.hubBot<=m.navTop-4,`${tag}: el círculo del tipo queda arriba de la barra`);
  for(const k of ['planche','mv_isq','oap']){ await E(k=>{ if(skRoot(k)!==TFIL){ TFIL=skRoot(k); treeSegOn(TFIL); } treeSelect(k); },k); await W8(900);
    const a=await E(()=>{ const r=document.querySelector('.tpanel .tpa').getBoundingClientRect(), t=document.querySelector('.tpanel').getBoundingClientRect(); return {bot:Math.round(r.bottom),top:Math.round(t.top),ih:innerHeight}; });
    ok(a.bot<=a.ih-4&&a.top>60,`${tag}: panel de ${k} entero ${JSON.stringify(a)}`);
    ok(await E(k=>{ const e=document.querySelector(`.tn[data-sk="${k}"]`).getBoundingClientRect(), pn=document.querySelector('.tpanel').getBoundingClientRect(), v=document.querySelector('.tvp').getBoundingClientRect(); return e.bottom<=pn.top-4&&e.top>=v.top+44; },k),`${tag}: ${k} se ve entre los botones de arriba y el panel`);
    ok(await E(()=>{ const pn=document.querySelector('.tpanel').getBoundingClientRect(); return [...document.querySelectorAll('.tpanel *')].every(x=>{ const r=x.getBoundingClientRect(); return !r.width||(r.right<=pn.right+.5&&r.left>=pn.left-.5); }); }),`${tag}: nada del panel de ${k} se sale de costado`); }
  await E(()=>treeSelect(null)); await W8(300);
  await E(()=>document.querySelector('.tri[data-tf3="t"]').click()); await W8(900);
  ok(await E(()=>{ const nav=document.querySelector('#nav').getBoundingClientRect(); return [...document.querySelectorAll('.thub .hbt')].every(h=>h.getBoundingClientRect().bottom<=nav.top-2); }),`${tag}: en Todo las raíces no quedan tapadas`);
  await p.close(); }
// deslizar de costado, burbuja, altura
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1000);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(1400);
ok(await E(()=>[...document.querySelectorAll('.tri')].map(x=>x.dataset.tf3).join()==='b,f,m,t'),'riel en el orden del árbol: cardio, fuerza, movilidad, todo');
const ind=()=>E(()=>{ const i=document.querySelector('.trind').getBoundingClientRect(), a=document.querySelector('.tri.on').getBoundingClientRect(); return Math.abs(i.top-a.top)<2; });
ok(await ind(),'la burbuja está en el activo');
ok(await E(()=>getComputedStyle(document.querySelector('.tri:not(.on)>svg')).opacity==='0'&&getComputedStyle(document.querySelector('.tri.on>svg')).opacity==='1'),'activo con anillo; los otros solo ícono');
// subir hasta arriba de fuerza y deslizar a movilidad
await E(()=>{ const vp=document.querySelector('.tvp'), L=camLim(vp,CAM.s); CAM.y=L.yh; camApply(); }); await W8(200);
await p.mouse.move(300,420); await p.mouse.down(); await p.mouse.move(250,422,{steps:3}); await p.mouse.move(120,424,{steps:8}); await W8(60);
ok(await E(()=>document.querySelector('.tvp').classList.contains('moving')&&document.querySelector('#tsvg').getAttribute('data-peek')==='m'),'deslizando: asoma Movilidad y lo flotante se atenúa');
ok(await E(()=>{ const i=document.querySelector('.trind').getBoundingClientRect(), a=document.querySelector('.tri[data-tf3="f"]').getBoundingClientRect(), c=document.querySelector('.tri[data-tf3="m"]').getBoundingClientRect(); return i.top>a.top+3&&i.top<c.top-3; }),'la burbuja sigue al dedo');
await p.mouse.up(); await W8(1000);
ok(await E(()=>TFIL==='m'),'al soltar: Movilidad');
ok(await E(()=>{ const vp=document.querySelector('.tvp'), L=camLim(vp,CAM.s); return Math.abs(CAM.y-L.yh)<2; }),'mantiene la altura: estabas arriba, quedás arriba');
ok(await ind(),'la burbuja llegó a Movilidad');
await W8(600); ok(await E(()=>!document.querySelector('.tvp').classList.contains('moving')&&!document.body.classList.contains('treemv')),'al quedarse quieto vuelve todo');
// deslizar corto: no cambia
await p.mouse.move(300,420); await p.mouse.down(); await p.mouse.move(270,421,{steps:5}); await p.mouse.up(); await W8(800);
ok(await E(()=>TFIL==='m'),'un deslizamiento corto no cambia de tipo');
// a la derecha desde cardio: no hay nada, rebota
await E(()=>document.querySelector('.tri[data-tf3="b"]').click()); await W8(900);
await p.mouse.move(100,420); await p.mouse.down(); await p.mouse.move(360,421,{steps:8}); await p.mouse.up(); await W8(900);
ok(await E(()=>TFIL==='b'),'en el primer tipo, hacia atrás rebota');
// el riel también mantiene la altura
await E(()=>{ const vp=document.querySelector('.tvp'), L=camLim(vp,CAM.s); CAM.y=L.yh; camApply(); }); await E(()=>document.querySelector('.tri[data-tf3="f"]').click()); await W8(900);
ok(await E(()=>{ const vp=document.querySelector('.tvp'), L=camLim(vp,CAM.s); return TFIL==='f'&&Math.abs(CAM.y-L.yh)<2; }),'con el riel también mantiene la altura');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
