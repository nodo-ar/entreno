// v252: al colapsar el encabezado, las acciones de la fila del título suben a la barra
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prevR.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const open=async(W,H,live)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(live=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; if(live){ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); MINI.mode='isle'; } },live); return p; };
  const goScr=async(p,js)=>{ await p.evaluate(js=>{ NAV.length=0; scrollTo(0,0); eval(js); },js); await W8(p,1100); const h0=await p.evaluate(()=>document.documentElement.scrollHeight); await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight)); await W8(p,700); return h0; };
  const vis=(p,sel)=>p.evaluate(sel=>{ const e=document.querySelector(sel); if(!e) return null; const r=e.getBoundingClientRect(), bar=document.getElementById('tbar').offsetHeight; const at=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); return {top:r.top,bottom:r.bottom,left:r.left,inBar:r.top>=0&&r.bottom<=bar+2,hit:!!at&&(at===e||e.contains(at)),inSlot:!!e.closest('#tbact'),inTop:!!e.closest('.topbar'),n:document.querySelectorAll(sel).length}; },sel);
  const tbtR=p=>p.evaluate(()=>{ const t=document.getElementById('tbt'), rg=document.createRange(); rg.selectNodeContents(t); return Math.min(t.getBoundingClientRect().right,rg.getBoundingClientRect().right); });
  // vertical
  { const p=await open(375,560,false);
    let h0=await goScr(p,"go('vos')"); let v=await vis(p,'#vCfg'); T(v&&v.inBar&&v.hit&&v.inSlot,'Vos: el engranaje queda en la barra y se puede tocar');
    T(await p.evaluate(h0=>document.documentElement.scrollHeight===h0,h0),'Vos: la página no cambia de alto al subirlo');
    T(await tbtR(p)<=v.left-6,'Vos: el título no se mete debajo');
    await p.evaluate(()=>scrollTo(0,0)); await W8(p,600); v=await vis(p,'#vCfg'); T(v&&!v.inSlot&&await p.evaluate(()=>!!document.querySelector('#app>.view>.row>#vCfg')),'Vos: arriba de todo vuelve a su lugar');
    await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight)); await W8(p,600); await p.mouse.click(v.left+20,30); await W8(p,900); T(await p.evaluate(()=>view==='ajustes'),'Vos: tocarlo en la barra abre Ajustes');
    await goScr(p,"eqFrom='ajustes'; go('equipo')"); v=await vis(p,'#app .espchip'); T(v&&v.inBar&&v.inTop&&v.hit,'Equipo: el lugar sube a la barra, al lado de volver');
    await p.evaluate(()=>{ const e=document.querySelector('#app .espchip'); e.click(); }); await W8(p,500); T(await p.evaluate(()=>!!POP.el),'Equipo: abre su menú desde la barra'); await p.evaluate(()=>popClose(true)); await W8(p,300);
    await goScr(p,"go('cuerpo')"); const q=await vis(p,'#app .topbar [data-info]'); T(q&&q.inBar&&q.hit,'Cuerpo: el ? queda en la barra');
    T(await tbtR(p)<=q.left-6,'Cuerpo: el título no se mete debajo');
    await goScr(p,"HOMEP=null; go('home')"); v=await vis(p,'.espchip'); T(v&&v.inBar&&v.hit,'Inicio: el lugar queda en la barra');
    // volver a dibujar con la barra colapsada no duplica nada
    await goScr(p,"go('vos')"); await p.evaluate(()=>render()); await W8(p,500); v=await vis(p,'#vCfg'); T(v&&v.n===1&&v.inBar,'redibujar colapsado: un solo engranaje, en la barra');
    await p.close(); }
  { const p=await open(375,560,true); await goScr(p,"go('vos')"); await W8(p,400); const v=await vis(p,'#vCfg'), m=await p.evaluate(()=>document.getElementById('minibar').getBoundingClientRect().toJSON());
    T(v&&v.inBar&&m.right<=v.left-6,'con la isla: no se tocan'); await p.close(); }
  // horizontal
  { const p=await open(1024,560,false);
    let h0=await goScr(p,"histEx=SESS.find(x=>x.kind==='fuerza').id; go('dia')"); let v=await vis(p,'#diaEd'); T(v&&v.inBar&&v.hit&&v.inSlot,'horizontal · sesión: editar y ⋯ en la barra');
    T(await p.evaluate(h0=>document.documentElement.scrollHeight===h0,h0),'horizontal: la página no cambia de alto');
    T(await tbtR(p)<=v.left-6,'horizontal: el título no se mete debajo');
    await p.evaluate(()=>scrollTo(0,0)); await W8(p,600); T(await p.evaluate(()=>!!document.querySelector('#app>.view>.topbar #diaEd')),'horizontal: arriba vuelve a su fila');
    await goScr(p,"resumenWk=semanaKey(hoyISO()); resMode='sem'; go('resumen')"); v=await vis(p,'#tbact .segx'); T(v&&v.inBar&&v.hit,'Resumen: Semana / Mes en la barra');
    await goScr(p,"go('cuerpo')"); v=await vis(p,'#tbact .tbgrp'); T(v&&v.inBar&&v.hit,'Cuerpo: la cápsula de capas en la barra'); T(await p.evaluate(()=>{ const k=[...document.getElementById('tbact').children]; return k.length===1&&k[0].classList.contains('tbgrp')&&k[0].children[0].id==='capaBtn'&&!!k[0].children[1].dataset.info; }),'Cuerpo: capas y después ?, en una cápsula, como arriba');
    let L=[]; for(let i=0;i<5;i++){ await W8(p,150); L.push(await p.evaluate(()=>scrollY)); } T(L.every(y=>y===L[0]),'sin vaivén con poco scroll '+JSON.stringify(L));
    await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
