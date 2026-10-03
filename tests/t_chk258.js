// v256: el reproductor — acoplar y desacoplar con una sola forma, al costado como en horizontal, en el lugar del +, y pantallas ya desplazadas
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prevR.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const open=async(W,H)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); MINI.mode='isle'; MINI.ses=miniSesKey(); miniSave(); HOMEP=null; NAV.length=0; go('hist');
      window.__V=[]; const o=document.startViewTransition.bind(document); document.startViewTransition=cb=>{ const r={vt:null,named:[]}; const t=o(()=>{ cb(); r.vt=document.documentElement.dataset.vt||''; r.named=[...document.querySelectorAll('*')].filter(e=>e.style.viewTransitionName).map(e=>(e.id||'x')+'='+e.style.viewTransitionName); }); t.finished.then(()=>{ r.done=true; }); window.__V.push(r); return t; }; });
    await W8(p,1200); return p; };
  const M=p=>p.evaluate(()=>{ const m=document.getElementById('minibar'), r=m.getBoundingClientRect(), n=document.getElementById('nav').getBoundingClientRect(), f=document.getElementById('fab'); const fr=f.getBoundingClientRect();
    return {mode:miniMode(),cls:m.className,l:r.left,r:r.right,t:r.top,b:r.bottom,w:r.width,h:r.height,nl:n.left,nr:n.right,nt:n.top,nb:n.bottom,fab:+getComputedStyle(f).opacity,fl:fr.left,frr:fr.right,ring:!!m.querySelector('.ir'),time:!!m.querySelector('#mbTime')&&getComputedStyle(m.querySelector('#mbTime')).display!=='none',pause:!!m.querySelector('.mb-b.pri'),W:innerWidth,H:innerHeight,lbl:[...document.querySelectorAll('nav.bottom .lb')].some(l=>l.getBoundingClientRect().width>2),vt:document.documentElement.dataset.vt||''}; });
  const drag=async(p,x,y)=>{ const c=await p.evaluate(()=>{ const r=document.getElementById('minibar').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+Math.min(r.height/2,24)}; }); await p.mouse.move(c.x,c.y); await p.mouse.down(); for(let i=1;i<=14;i++){ await p.mouse.move(c.x+(x-c.x)*i/14,c.y+(y-c.y)*i/14); await W8(p,16); } await p.mouse.up(); await W8(p,900); };
  const lastVT=p=>p.evaluate(()=>window.__V[window.__V.length-1]||null);
  const setMode=async(p,m,side)=>{ await p.evaluate(([m,side])=>{ MINI.side=side||'r'; MINI.ty=.55; MINI.mode=m; miniSave(); miniRender(); },[m,side]); await W8(p,700); };

  for(const [W,H] of [[390,844],[375,667],[320,568],[412,915]]){ const tag=`${W}×${H}`; const p=await open(W,H);
    const f0=await M(p); const grpL=Math.round(f0.nl), grpR=Math.round(f0.frr), fabL=Math.round(f0.fl), navR=Math.round(f0.nr);
    // al costado: el módulo de horizontal (anillo, tiempo y pausa), flotando a 10 px del borde
    for(const side of ['r','l']){ await setMode(p,'tab',side); const m=await M(p);
      T(m.ring&&m.time&&m.pause,`${tag} costado ${side}: anillo, tiempo y pausa`); T(Math.abs(m.w-58)<1,`${tag} costado ${side}: 58 de ancho (${m.w})`);
      T(side==='r'?Math.abs(m.W-m.r-10)<=1:Math.abs(m.l-10)<=1,`${tag} costado ${side}: a 10 px del borde (${Math.round(m.l)}–${Math.round(m.r)})`); T(m.t>60&&m.b<m.nt-8,`${tag} costado ${side}: entre la barra y la nav`); }
    // tocarlo: se abre con una sola forma (transición de acople)
    await p.evaluate(()=>{ window.__V.length=0; }); await p.evaluate(()=>{ const r=document.getElementById('minibar').getBoundingClientRect(); document.getElementById('minibar').dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+5,clientY:r.top+5})); }); await W8(p,900);
    let v=await lastVT(p); let m=await M(p); T(m.mode==='card'&&v&&v.vt==='dock'&&v.named.includes('minibar=vlive'),`${tag}: desde el costado se abre como una sola forma`);
    // en el lugar del +
    await drag(p,m.W-40,m.H-30); m=await M(p); v=await lastVT(p);
    T(m.mode==='fab'&&/\bfab\b/.test(m.cls),`${tag}: soltarlo abajo a la derecha lo pone en el lugar del + (${m.mode})`); T(v&&v.vt==='dock',`${tag}: el acople es una transición de forma`);
    T(m.fab<.05,`${tag}: el + se va`); T(Math.abs(Math.round(m.l)-fabL)<=1&&Math.abs(Math.round(m.r)-grpR)<=1&&Math.round(m.w)===60&&Math.round(m.h)===60,`${tag}: ocupa justo el lugar del + (${Math.round(m.l)}–${Math.round(m.r)} vs ${fabL}–${grpR})`); T(Math.abs(Math.round(m.nl)-grpL)<=1&&Math.abs(Math.round(m.nr)-navR)<=1,`${tag}: la nav no cambia`);
    T(Math.abs((m.t+m.b)/2-(m.nt+m.nb)/2)<=1&&m.l>=m.nr+6,`${tag}: en la misma línea que la nav, sin tocarla`); T(m.lbl,`${tag}: la nav conserva su rótulo`);
    T(m.ring&&!m.pause&&!m.time&&await p.evaluate(()=>{ const m=document.getElementById('minibar'), ir=m.querySelector('.ir'); return getComputedStyle(m).borderRadius==='50%'&&!!ir.querySelector('.mb-ic svg')&&/conic-gradient/.test(getComputedStyle(ir).backgroundImage)&&/\d/.test(m.getAttribute('aria-label')||''); }),`${tag}: un círculo: el borde es el tiempo y el centro el ícono`);
    T(await p.evaluate(()=>{ const bs=[...document.querySelectorAll('nav.bottom button')]; return bs.every(x=>{ const r=x.getBoundingClientRect(), s=x.querySelector('svg').getBoundingClientRect(); return r.width>=34&&s.width>=20; }); }),`${tag}: los cuatro íconos de la nav entran`);
    await p.evaluate(()=>{ bikePause(); miniUpd(); }); await W8(p,300); T(await p.evaluate(()=>{ const m=document.getElementById('minibar'); return m.classList.contains('mbp')&&getComputedStyle(m.querySelector('.mb-pz')).display!=='none'&&getComputedStyle(m.querySelector('.mb-ic')).display==='none'; }),`${tag}: en pausa, el centro muestra la pausa`);
    await p.evaluate(()=>{ bikePause(); miniUpd(); }); await W8(p,300);
    { const c=await p.evaluate(()=>{ const r=document.getElementById('minibar').getBoundingClientRect(); return {x:r.left+30,y:r.top+30}; }); await p.mouse.move(c.x,c.y); await p.mouse.down(); await W8(p,650); await p.mouse.up(); await W8(p,400);
      T(await p.evaluate(()=>!!POP.el&&!!document.querySelector('.lppop [data-lp="mb:card"]')),`${tag}: mantener apretado abre el menú de la sesión`); await p.evaluate(()=>popClose(true)); await W8(p,300); }
    // bajar: la nav se va, el reproductor se queda
    await p.evaluate(()=>scrollTo(0,0)); await W8(p,300); await p.mouse.move(m.W/2,m.H/2); await p.mouse.wheel(0,500); await W8(p,900); let m2=await M(p);
    T(await p.evaluate(()=>document.body.classList.contains('navdown')),`${tag}: al bajar se esconde la nav`); T(m2.b<=m2.H-8&&m2.t>m2.H-90,`${tag}: el reproductor se queda abajo a la vista (${Math.round(m2.t)})`);
    await p.mouse.wheel(0,-80); await W8(p,800);
    // en una pantalla sin nav: se queda en su lugar
    await p.evaluate(()=>{ histEx='fuerza'; go('stat'); }); await W8(p,1000); m2=await M(p); T(m2.mode==='fab'&&m2.b<=m2.H-8&&m2.t>m2.H-90&&m2.r<=m2.W-8,`${tag}: sin nav, sigue abajo a la derecha`);
    await p.evaluate(()=>{ NAV.length=0; go('hist'); }); await W8(p,1000);
    // tocarlo: se abre en la esquina de abajo
    await p.evaluate(()=>{ window.__V.length=0; const r=document.getElementById('minibar').getBoundingClientRect(); document.getElementById('minibar').dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+5,clientY:r.top+5})); }); await W8(p,900);
    m=await M(p); v=await lastVT(p); T(m.mode==='card'&&v&&v.vt==='dock',`${tag}: desde el + se abre como una sola forma`); T(m.fab>.95,`${tag}: el + vuelve`); T(m.lbl,`${tag}: la nav recupera su rótulo`);
    // arrastrarlo arriba: se ancla en isla con la transición de forma
    await drag(p,m.W/2,24); m=await M(p); v=await lastVT(p); T(m.mode==='isle'&&v&&v.vt==='dock',`${tag}: arriba se ancla como isla, en una sola forma`);
    // al costado arrastrando
    await drag(p,m.W-6,m.H/2); m=await M(p); T(m.mode==='tab',`${tag}: arrastrado al borde queda al costado`);
    await p.close(); }

  // horizontal: a la izquierda va al lugar del + (el mismo modo que abajo en vertical)
  { const p=await open(1180,760); let m=await M(p);
    await setMode(p,'card'); await drag(p,40,560); m=await M(p); T(m.mode==='fab'&&/\btl\b/.test(m.cls)&&m.fab<.05,'horizontal: a la izquierda ocupa el lugar del + en el riel');
    await p.setViewportSize({width:390,height:844}); await W8(p,900); m=await M(p); T(m.mode==='fab'&&/\bfab\b/.test(m.cls)&&m.fab<.05&&m.t>m.H-90,'al girar a vertical sigue en el lugar del +, ahora abajo');
    await p.setViewportSize({width:1180,height:760}); await W8(p,900); m=await M(p); T(/\btl\b/.test(m.cls)&&m.fab<.05,'y al volver a horizontal, en el riel');
    await setMode(p,'card'); await drag(p,1176,380); m=await M(p); T(m.mode==='tab'&&!/\btl\b/.test(m.cls)&&m.fab>.95,'horizontal: a la derecha queda al costado y el + sigue');
    await p.close(); }

  // pantalla ya desplazada: la isla llega directo a su lugar (sin saltar al final)
  { const p=await open(390,844); await p.evaluate(()=>{ go('home'); }); await W8(p,900);
    await p.evaluate(()=>{ window.__G=[]; const o=document.startViewTransition; document.startViewTransition=function(cb){ const R=()=>{ const e=document.getElementById('minibar'); if(!e||e.hidden) return null; const r=e.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.width)]; }; let n=null; const t=o.call(this,()=>{ cb(); n=R(); }); t.finished.then(()=>setTimeout(()=>window.__G.push({n,f:R()}),250)); return t; }; });
    const tab=async t=>{ const c=await p.evaluate(t=>{ const r=document.querySelector(`nav.bottom [data-tab=${t}]`).getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; },t); await p.mouse.click(c.x,c.y); await W8(p,1300); };
    await tab('hist'); await p.mouse.move(195,400); await p.mouse.wheel(0,760); await W8(p,700); await p.mouse.wheel(0,-60); await W8(p,700);
    await tab('arbol'); await tab('hist'); await tab('home'); await tab('hist');
    const G=await p.evaluate(()=>window.__G); const bad1=G.filter(g=>g.n&&g.f&&(Math.abs(g.n[0]-g.f[0])>2||Math.abs(g.n[1]-g.f[1])>2));
    T(G.length>=4&&!bad1.length,'pantalla desplazada: la isla llega a su lugar final sin saltar '+JSON.stringify(G));
    await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
