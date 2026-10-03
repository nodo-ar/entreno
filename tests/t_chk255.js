// v253: fila de arriba — todo de vidrio y de 40; Cuerpo en una cápsula; la isla nunca pisa botones ni el título
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
const SC=[['hist',"histTab='res'; go('hist')"],['vos',"go('vos')"],['equipo',"eqFrom='ajustes'; go('equipo')"],['dia',"histEx=SESS.find(x=>x.kind==='fuerza').id; go('dia')"],['programa',"progSel='base_cali'; go('programa')"],['cuerpo',"go('cuerpo')"],['resumen',"resumenWk=semanaKey(hoyISO()); resMode='sem'; go('resumen')"],['ejercicio',"exSel=Object.values(CAT)[3].n; go('ejercicio')"],['fuerza',"go('fuerza')"],['stat',"statK='carga'; go('stat')"]];
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const open=async(W,H,live)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(live=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; if(live){ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); MINI.mode='isle'; MINI.ses=miniSesKey(); } },live); return p; };
  /* controles de la fila de arriba visibles ahora */
  const ctl=p=>p.evaluate(()=>{ const vw=document.querySelector('#app>.view'), out=[], R=e=>{ const r=e.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom,h:r.height}; };
    const add=(e,k)=>{ if(!e||!e.getClientRects().length) return; const r=R(e); if(r.b<0||r.t>100) return; const cs=getComputedStyle(e); out.push({k,id:(e.id||e.className||'').toString().slice(0,20),...r,glass:cs.backdropFilter!=='none'||!!e.closest('.tbgrp')&&e.parentElement.classList.contains('tbgrp')}); };
    const tb=vw&&[...vw.children].find(k=>k.matches('.topbar:not(.edbar)')); if(tb) [...tb.children].forEach(c=>{ if(!c.matches('.grow,.tbtitle,.tbph,[hidden]')) add(c,'tb'); });
    const row=vw&&[...vw.children].slice(0,5).find(k=>k.matches('.row')&&k.querySelector(':scope>h1, :scope>.grow>h1')); if(row){ let past=false; [...row.children].forEach(c=>{ if(c.matches('h1,.grow')){ past=true; return; } if(past&&c.matches('.espchip,.pickb,.iconbtn')) add(c,'row'); }); }
    const sl=document.getElementById('tbact'); if(sl&&document.body.classList.contains('tbtrail')) [...sl.children].forEach(c=>add(c,'slot'));
    const mb=document.getElementById('minibar'); const isle=mb&&!mb.hidden&&mb.classList.contains('isle')?R(mb):null;
    const t=document.getElementById('tbt'), rg=document.createRange(); rg.selectNodeContents(t); const tr=R(t), trr=rg.getBoundingClientRect();
    return {out,isle,coll:document.body.classList.contains('tbglass')&&document.body.classList.contains('tbstuck'),titleR:Math.min(tr.r,trr.right),titleOn:getComputedStyle(t).opacity==='1'&&!!t.textContent,W:document.documentElement.clientWidth}; });
  // 1. vertical, con la isla: en reposo y colapsado
  { const p=await open(375,560,true);
    for(const [k,js] of SC){ await p.evaluate(js=>{ NAV.length=0; scrollTo(0,0); eval(js); },js); await W8(p,1100);
      for(const sc of [0,1]){ if(sc){ const sh=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight); if(sh<40) continue; await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight)); await W8(p,800); }
        const c=await ctl(p), tag=`${k}${sc?' colapsado':''}`;
        if(c.isle){ const ov=c.out.filter(x=>x.l<c.isle.r+4&&x.r>c.isle.l-4&&x.t<c.isle.b&&x.b>c.isle.t); T(!ov.length,`${tag}: la isla no toca botones ${JSON.stringify(ov.map(x=>x.id))}`);
          if(c.coll&&c.titleOn){ T(c.titleR<=c.isle.l-4,`${tag}: el título no queda debajo de la isla`); const rr=c.out.filter(x=>x.l>=c.isle.r-1).map(x=>x.l); const edge=rr.length?Math.min(...rr):c.W-16; T(Math.abs(edge-c.isle.r)<=12,`${tag}: colapsado, la isla va junto a las acciones (${Math.round(c.isle.r)} vs ${Math.round(edge)})`); } }
        const bad40=c.out.filter(x=>Math.abs(x.h-40)>1.5&&!(x.k==='tb'&&/back/.test(x.id))); T(!bad40.length,`${tag}: todo mide 40 ${JSON.stringify(bad40.map(x=>x.id+':'+Math.round(x.h)))}`);
        const opaque=c.out.filter(x=>!x.glass); T(!opaque.length,`${tag}: todo de vidrio ${JSON.stringify(opaque.map(x=>x.id))}`); } }
    // Cuerpo: las capas en una cápsula de íconos y el ?, en la barra; sin período
    await p.evaluate(()=>{ NAV.length=0; scrollTo(0,0); go('cuerpo'); }); await W8(p,900);
    T(await p.evaluate(()=>!!document.querySelector('#app .topbar>.tbgrp>#capaBtn')&&!!document.querySelector('#app .topbar>.tbgrp>[data-info="cuerpo:"]')&&!document.querySelector('#app>.view>.segx,#app>.view>.pernav')),'Cuerpo: capas e ? en la barra, sin período');
    await p.close(); }
  // 2. horizontal: alturas y vidrio, con y sin la isla
  for(const live of [false,true]){ const p=await open(1180,640,live);
    for(const [k,js] of [...SC,['arbol',"go('arbol')"]]){ await p.evaluate(js=>{ NAV.length=0; scrollTo(0,0); eval(js); },js); await W8(p,1100);
      const c=await ctl(p), extra=await p.evaluate(()=>[...document.querySelectorAll('#app>.view>.segx,#app .ahd>.tseg')].filter(s=>getComputedStyle(s).position==='absolute'||s.classList.contains('tseg')).map(s=>({h:s.getBoundingClientRect().height,g:getComputedStyle(s).backdropFilter!=='none'})));
      const tag=`horizontal ${k}${live?' con isla':''}`; const bad40=c.out.filter(x=>Math.abs(x.h-40)>1.5&&!/back/.test(x.id)); T(!bad40.length,`${tag}: todo mide 40 ${JSON.stringify(bad40.map(x=>x.id+':'+Math.round(x.h)))}`);
      T(extra.every(x=>Math.abs(x.h-40)<1.5&&x.g),`${tag}: el segmentado del encabezado, de vidrio y de 40`);
      if(live){ const mb=await p.evaluate(()=>{ const m=document.getElementById('minibar'); return m.hidden?null:m.getBoundingClientRect().toJSON(); }); if(mb){ T(Math.abs(mb.height-40)<1,`${tag}: la isla mide 40`); const ov=c.out.filter(x=>x.r>mb.left-4&&x.l<mb.right&&x.t<mb.bottom&&x.b>mb.top); T(!ov.length,`${tag}: la isla no toca botones`); } } }
    await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
