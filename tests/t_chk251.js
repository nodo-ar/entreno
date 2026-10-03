// v249: árbol en horizontal — encabezado con el tipo y las herramientas, mapa y panel fijo a la derecha
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prevR.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H)=>{ const ctx=await b.newContext({viewport:{width:W,height:H}}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree','tfly'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; TFIL='f'; TSEL=null; CAM=null; go('arbol'); }); await p.waitForTimeout(1800); return p; };
  const W8=(p,t)=>p.waitForTimeout(t);
  const click=async(p,sel)=>{ const r=await p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const q=e.getBoundingClientRect(); return {x:q.x+q.width/2,y:q.y+q.height/2}; },sel); if(!r) return false; await p.mouse.click(r.x,r.y); return true; };
  const G=p=>p.evaluate(()=>{ const R=e=>{ if(!e) return null; const r=e.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}; }; const vp=document.querySelector('.tvp'), pn=vp&&vp.querySelector('.tpanel');
    return {vp:R(vp), pn:R(pn), pnOn:!!pn&&pn.classList.contains('on'), rest:!!pn&&pn.classList.contains('rest'), op:pn?+getComputedStyle(pn).opacity:0, tw:R(document.getElementById('tw')), seg:R(document.querySelector('.tseg')), tools:R(document.querySelector('.ttools')), h1:R(document.querySelector('#app h1')),
      rail:!!document.querySelector('.tvp .trail'), tctl:!!document.querySelector('.tvp .tctl'), chips:!!document.querySelector('.tvp .tgoal,.tvp .tnext'), TFIL, TSEL, pnTxt:pn?pn.textContent:''}; });
  // 1. tablet horizontal
  { const p=await open(1180,820); let g=await G(p);
    T(!g.rail&&!g.tctl&&!g.chips,'horizontal: sin riel, sin botones ni chips flotando en el mapa');
    T(g.seg&&g.tools&&await p.evaluate(()=>document.querySelectorAll('.tseg [data-tf3]').length===4&&['tFind','tFilt','tMine','aMore'].every(i=>document.querySelector('.ttools #'+i))),'encabezado: tipo (4) y herramientas en una cápsula');
    T(Math.abs((g.seg.t+g.seg.b)/2-(g.h1.t+22))<3&&Math.abs((g.tools.t+g.tools.b)/2-(g.h1.t+22))<3,'encabezado: todo en la línea del título');
    T(g.pnOn&&g.rest&&g.op>.99,'panel a la vista sin nada elegido');
    T(Math.abs(g.pn.r-(g.vp.r-12))<2&&Math.abs(g.pn.t-(g.vp.t+12))<2&&g.pn.b>g.vp.b-40,'panel: a la derecha, alto completo');
    T(/Lo próximo/.test(g.pnTxt)&&/Tu norte/.test(g.pnTxt)&&/Ramas/.test(g.pnTxt),'panel en reposo: lo próximo, tu norte y ramas');
    const fc=(g.vp.l+g.pn.l)/2, tc=await p.evaluate(()=>{ const B=treeBounds(TFIL), v=document.querySelector('.tvp').getBoundingClientRect(); return v.left+CAM.x+(B.x0+B.x1)/2*CAM.s; }); T(Math.abs(tc-fc)<40,`el árbol se centra en lo que queda libre (${Math.round(tc)} vs ${Math.round(fc)})`);
    // tipo desde el encabezado
    await click(p,'.tseg [data-tf3="m"]'); await W8(p,1100); g=await G(p); T(g.TFIL==='m'&&await p.evaluate(()=>document.querySelector('.tseg [data-tf3="m"]').classList.contains('on')),'segmentado: pasa a Movilidad');
    T(/Movilidad/.test(g.pnTxt),'el panel sigue al tipo');
    await click(p,'.tseg [data-tf3="m"]'); await W8(p,700); T((await G(p)).TFIL==='m','tocar el tipo activo no lo cambia');
    // elegir desde el panel y volver
    await click(p,'.tpanel [data-nx]'); await W8(p,1100); g=await G(p); T(!!g.TSEL&&!g.rest&&g.pnOn&&await p.evaluate(()=>!!document.querySelector('.tpanel .tpx')),'lo próximo abre la habilidad en el mismo panel');
    T(Math.abs(g.pn.t-(g.vp.t+12))<2&&g.pn.b>g.vp.b-40,'la habilidad ocupa el mismo lugar');
    await click(p,'.tpanel .tpx'); await W8(p,800); g=await G(p); T(!g.TSEL&&g.rest&&g.pnOn&&g.op>.99,'× vuelve a lo de siempre (el panel no se va)');
    // ramas
    await click(p,'.tseg [data-tf3="f"]'); await W8(p,1000); const c0=await p.evaluate(()=>({...CAM})); await click(p,'.tpanel [data-tsb]'); await W8(p,1000); const c1=await p.evaluate(()=>({...CAM}));
    T(Math.abs(c1.x-c0.x)+Math.abs(c1.y-c0.y)+Math.abs(c1.s-c0.s)*100>2,'una rama del panel acerca el mapa');
    // Todo
    await click(p,'.tseg [data-tf3="t"]'); await W8(p,1100); g=await G(p); const td=await p.evaluate(()=>{ const t=document.querySelector('.ttodo'); return t&&t.getBoundingClientRect().toJSON(); });
    T(td&&td.right<=g.pn.l+1&&g.op>.99,'Todo: las columnas en lo libre, el panel sigue');
    T(/Todo el árbol/.test(g.pnTxt)&&!/Ramas/.test(g.pnTxt),'Todo: lo próximo de todo el árbol');
    // herramientas
    await click(p,'#tFilt'); await W8(p,500); T(await p.evaluate(()=>!!POP.el),'filtrar abre su menú desde el encabezado'); await p.keyboard.press('Escape'); await p.evaluate(()=>popClose(true)); await W8(p,300);
    await click(p,'#tFind'); await W8(p,500); T(await p.evaluate(()=>!!POP.el),'buscar abre desde el encabezado'); await p.evaluate(()=>popClose(true)); await W8(p,300);
    await click(p,'#aMore'); await W8(p,500); T(await p.evaluate(()=>!!POP.el&&/Ver el tipo entero/.test(POP.el.textContent)),'⋯ incluye ver el tipo entero'); await p.evaluate(()=>popClose(true));
    await p.close(); }
  // 2. con el reproductor arriba: el encabezado no se corre y el tipo pasa a íconos
  { const p=await open(1180,820); await p.evaluate(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); go('arbol'); }); await W8(p,900); await p.evaluate(()=>miniSetMode('isle')); await W8(p,1300);
    const g=await G(p), mb=await p.evaluate(()=>document.getElementById('minibar').getBoundingClientRect().toJSON()), lab=await p.evaluate(()=>getComputedStyle(document.querySelector('.tseg .tsgl')).display);
    T(Math.abs((g.h1.t+22)-(mb.top+mb.height/2))<2,'con la isla: el título sigue arriba ('+Math.round(g.h1.t)+')'); T(lab==='none','con la isla: el tipo en íconos'); T(g.tools.r<=mb.left-8,'con la isla: las herramientas no la tocan'); await p.close(); }
  // 3. celular acostado
  { const p=await open(844,390); const g=await G(p); T(g.pn.w>=286,'celular acostado: panel de al menos 288'); T(g.seg.l>=g.h1.l+120&&g.tools.r<=844-12,'celular acostado: el encabezado entra'); await p.close(); }
  // 4. vertical igual que antes, y al girar se rearma
  { const p=await open(390,844); let g=await G(p); T(g.rail&&g.tctl&&g.chips&&!g.seg,'vertical: riel, botones y chips como siempre'); T(!g.pnOn,'vertical: sin panel en reposo');
    await p.setViewportSize({width:1180,height:820}); await W8(p,1500); g=await G(p); T(!g.rail&&!!g.seg&&g.pnOn,'al acostar: se arma el encabezado y el panel');
    await p.setViewportSize({width:390,height:844}); await W8(p,1500); g=await G(p); T(g.rail&&!g.seg&&!g.pnOn,'al volver a vertical: todo como antes');
    const tw=await p.evaluate(()=>{ const B=treeBounds(TFIL), v=document.querySelector('.tvp').getBoundingClientRect(); return v.left+CAM.x+(B.x0+B.x1)/2*CAM.s; }); T(Math.abs(tw-195)<60,'vertical: el árbol centrado en todo el ancho ('+Math.round(tw)+')'); await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
