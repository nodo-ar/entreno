// v248: contadores de Progreso topeados (+N aparte) y la isla del reproductor en la fila de arriba
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; HOMEP=null; go('home'); }); await p.waitForTimeout(700); return p; };
  const W8=(p,t)=>p.waitForTimeout(t);
  const geo=p=>p.evaluate(()=>{ const mb=document.getElementById('minibar'), R=e=>{ const r=e.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom}; };
    const tb=document.querySelector('#app>.view .topbar'); const kids=tb?[...tb.children].filter(c=>c.getClientRects().length&&!c.matches('.grow')).map(R):[];
    const i=R(mb); const ov=kids.filter(k=>k.l<i.r&&k.r>i.l&&k.t<i.b&&k.b>i.t).length; const h1=document.querySelector('#app>.view h1');
    const t=document.getElementById('tbt'); const rg=document.createRange(); rg.selectNodeContents(t); const tr=R(t);
    return {il:mb.dataset.il, isle:i, ov, gap:kids.length?Math.min(...kids.map(k=>k.r<=i.l?i.l-k.r:k.l>=i.r?k.l-i.r:-1)):99, h1:h1?R(h1).t:null, cx:(i.l+i.r)/2, W:document.documentElement.clientWidth, tbtR:tr.r, stuck:document.body.classList.contains('tbstuck')&&document.body.classList.contains('tbglass')}; });
  // 1. contadores: una semana con fuerza de más
  { const p=await open(390,844);
    await p.evaluate(()=>{ const h=hoyISO(); for(let i=0;i<6;i++) SESS.push({id:'xf'+i,kind:'fuerza',fecha:h,tipo:'Libre',dur:30,ej:[{n:'Sentadilla',series:[{r:8,kg:0}]}],vol:100}); SESS.sort((a,c)=>c.fecha.localeCompare(a.fecha)); histTab='res'; go('hist'); }); await W8(p,1200);
    const r=await p.evaluate(()=>{ const w=document.querySelector('#app .pwk .wkr'); const b=w.querySelector('b'); const n=+b.firstChild.textContent, g=+b.querySelector('i').textContent.slice(1), x=b.querySelector('.hwex'); const e=document.querySelector('.ptr[data-stat="fuerza"] em');
      const wr=w.querySelector('svg').getBoundingClientRect(), br=b.getBoundingClientRect(), xr=x&&x.getBoundingClientRect(); return {n,g,x:x&&x.textContent, em:e.textContent, emH:e.getBoundingClientRect().height, cen:Math.abs((br.left+br.right)/2-(wr.left+wr.right)/2), side:xr?xr.left>=br.right-1:false}; });
    T(r.n<=r.g,'anillo: no pasa de lo planificado ('+r.n+'/'+r.g+')'); T(r.x&&/^\+\d+$/.test(r.x),'anillo: lo que sobra va aparte'); T(r.cen<2,'anillo: el número queda centrado bajo el anillo'); T(r.side,'anillo: el +N va al costado');
    T(/(\d+)\/\1\+\d+/.test(r.em.replace(/\s/g,'')),'Entrenamiento: n/n y +N ('+r.em+')'); T(r.emH<22,'Entrenamiento: entra en una línea');
    await p.close(); }
  // 2. la isla, con una bici en curso
  { const p=await open(390,844);
    await p.evaluate(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); histTab='res'; go('hist'); }); await W8(p,900); await p.evaluate(()=>miniSetMode('isle')); await W8(p,900);
    let g=await geo(p); T(Math.round(g.isle.t)===14&&Math.round(g.isle.b-g.isle.t)===40,'isla a 14 px, 40 de alto ('+g.isle.t+')'); T(g.il==='3','raíz: isla completa'); T(g.h1>=g.isle.b+2,'raíz: el título abajo de la isla'); T(Math.abs(g.cx-g.W/2)<1,'isla centrada');
    const go_=async js=>{ await p.evaluate(js=>{ NAV.length=0; scrollTo(0,0); eval(js); },js); await W8(p,1100); return geo(p); };
    g=await go_("histEx=SESS.find(x=>x.kind==='fuerza').id; go('dia')"); T(g.ov===0&&g.gap>=8,'detalle: no toca los botones (aire '+Math.round(g.gap)+')'); T(g.il==='2','detalle: tiempo y pausa ('+g.il+')');
    T(await p.evaluate(()=>!!document.querySelector('#app .topbar .tbgrp #diaEd')&&!!document.querySelector('#app .topbar .tbgrp #diaMore')),'detalle: editar y más en una cápsula');
    T(Math.abs((g.isle.t+g.isle.b)/2-await p.evaluate(()=>{ const r=document.getElementById('back').getBoundingClientRect(); return (r.top+r.bottom)/2; }))<1,'detalle: isla y volver en la misma línea');
    await p.evaluate(()=>scrollTo(0,500)); await W8(p,900); g=await geo(p); T(g.stuck&&g.ov===0,'detalle con scroll: no toca los botones'); T(g.tbtR<=g.isle.l-6,'detalle con scroll: el título no se mete abajo de la isla'); T(Math.round(g.isle.t)===10,'detalle con scroll: sube con la fila');
    for(const [k,js,lv] of [['programa',"progSel='base_cali'; go('programa')",'3'],['resumen',"resumenWk=semanaKey(hoyISO()); resMode='sem'; go('resumen')",'3'],['cuerpo',"go('cuerpo')",'2']]){ g=await go_(js); T(g.ov===0&&g.gap>=8,k+': no toca los botones'); T(g.il===lv,k+': nivel '+lv+' ('+g.il+')'); }
    await p.evaluate(()=>document.querySelector('#diaEd')); await p.close(); }
  // 3. horizontal: la isla de siempre, sin niveles
  { const p=await open(1180,820); await p.evaluate(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); histTab='res'; go('hist'); }); await W8(p,900); await p.evaluate(()=>miniSetMode('isle')); await W8(p,900);
    T(await p.evaluate(()=>{ const m=document.getElementById('minibar'); return m.dataset.il===undefined&&!document.body.style.getPropertyValue('--ilh'); }),'horizontal: sin niveles'); await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
