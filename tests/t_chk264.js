// v261: capa Recuperación, botón de capas, Cuerpo en Balance, enlaces por capa, Mejor esfuerzo en menú, Fuentes, borrados que no vuelven
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H,sch)=>{ const p=await (await b.newContext({viewport:{width:W||390,height:H||844},colorScheme:sch||'dark'})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; });
    return p; };
  const hoyTorso=`(()=>{ const hoy=hoyISO(); SESS=SESS.filter(x=>x.fecha!==hoy); SESS.unshift({id:'s-'+(Date.now()-3600e3),kind:'fuerza',fecha:hoy,tipo:'Torso A',dur:22,ej:[{n:'Fondos',z:'emp',bw:true,fatiga:3,series:[{r:6},{r:6},{r:6},{r:6}]},{n:'Dominadas pronas',z:'esp',bw:true,fatiga:3,series:[{r:6},{r:6},{r:6},{r:6}]}]}); REC_C=null; })()`;
  { const p=await open(); await p.evaluate(hoyTorso);
    // Progreso: Cuerpo en Balance, con la recuperación
    await p.evaluate(()=>go('hist')); await p.waitForTimeout(900);
    const G=await p.evaluate(()=>{ const cards=[...document.querySelectorAll('#app .card.ptl')]; const g=t=>cards.find(c=>(c.querySelector('h3')||{}).textContent===t); const en=g('Entrenamiento'), ba=g('Balance');
      return {enC:!!(en&&en.querySelector('[data-stat="cuerpo"]')), baFirst:ba?(ba.querySelector('.ptr')||{}).dataset.stat:'', txt:ba?(ba.querySelector('[data-stat="cuerpo"]')||{}).textContent:''}; });
    T(!G.enC&&G.baFirst==='cuerpo',`Progreso: Cuerpo sale de Fuerza y abre Balance (${G.baFirst})`);
    T(/listos/.test(G.txt)&&/cargad/i.test(G.txt),`Progreso: la fila dice cuántos están listos y qué está cargado (${G.txt.replace(/\s+/g,' ').trim()})`);
    await p.evaluate(()=>{ bodyCapa='f'; document.querySelector('#app [data-stat="cuerpo"]').click(); }); await p.waitForTimeout(900);
    const C=await p.evaluate(()=>({v:view,capa:bodyCapa,sub:(document.querySelector('#app .hsub')||{}).textContent,grp:!!document.querySelector('#app .topbar .tbgrp #capaBtn')&&!!document.querySelector('#app .topbar .tbgrp [data-info^="cuerpo"]'),seg:!!document.querySelector('#app .segx,#app .tbseg'),
      fill:(document.querySelector('#app .bmap [data-br="dorsales"]')||{getAttribute:()=>''}).getAttribute('fill')}));
    T(C.v==='cuerpo'&&C.capa==='r'&&/^Recuperación · ahora/.test(C.sub),`Cuerpo abre en Recuperación desde Progreso (${C.capa} · ${C.sub})`);
    T(C.grp&&!C.seg,'capas y (?) en una sola cápsula, sin segmentado');
    T(/--ink/.test(C.fill)&&!/--ember/.test(C.fill),`recuperación en tinta, no en naranja (${C.fill})`);
    // menú de capas
    await p.click('#capaBtn'); await p.waitForTimeout(500);
    const M=await p.evaluate(()=>[...document.querySelectorAll('.pop [data-cm]')].map(b=>b.textContent.replace(/\s+/g,' ').trim()));
    T(M.length===3&&/Recuperación/.test(M[0])&&/Series/.test(M[1])&&/Movilidad/.test(M[2])&&/listo para entrenar/.test(M[0]),`menú de capas con lo que responde cada una (${M.join(' | ')})`);
    await p.evaluate(()=>document.querySelector('.pop [data-cm="f"]').click()); await p.waitForTimeout(700);
    T(await p.evaluate(()=>bodyCapa==='f'&&/^Series · esta semana/.test(document.querySelector('#app .hsub').textContent)&&/--ember/.test(document.querySelector('#app .bmap [data-br="pecho"]').getAttribute('fill')+' '+[...document.querySelectorAll('#app .bmap [data-br]')].map(x=>x.getAttribute('fill')).join(' '))),'elegir Series cambia el mapa y el subtítulo');
    await p.evaluate(()=>{ bodyCapa='r'; render(); }); await p.waitForTimeout(500);
    // lista: ordenada por lo que falta, sin desbordes
    const L=await p.evaluate(()=>{ const rows=[...document.querySelectorAll('#app .bmlist .brow')]; const card=document.querySelector('#app .bmlist').closest('.card').getBoundingClientRect(); return {n:rows.map(r=>r.querySelector('.n').textContent),over:rows.filter(r=>r.querySelector('.n').getBoundingClientRect().right>card.right-8).length,hs:rows.map(r=>RC_H(r.dataset.br))}; function RC_H(m){ return recupMap()[m].h; } });
    T(L.hs.every((v,i,a)=>!i||v<=a[i-1]),`lista ordenada por lo que falta (${L.n.slice(0,5).join(', ')})`);
    T(L.over===0,`ningún "cuándo" se sale de la tarjeta (${L.over})`);
    // detalle de un músculo
    await p.evaluate(()=>{ bodySel='dorsales'; render(); }); await p.waitForTimeout(600);
    const D=await p.evaluate(()=>({st:(document.querySelector('#app .rcst b')||{}).textContent,cu:(document.querySelector('#app .rcst small')||{}).textContent,curve:!!document.querySelector('#app .rcurve path.rcl'),src:[...document.querySelectorAll('#app [data-rcses]')].map(b=>b.textContent.replace(/\s+/g,' ').trim())}));
    T(D.st==='Cargado'&&/^Listo (hoy|mañana|el [a-záéíóú]+) a las? \d+$/.test(D.cu),`detalle: estado y cuándo queda listo (${D.st} · ${D.cu})`);
    T(D.curve&&D.src.length>=1&&/Torso A · (hoy|ayer)/.test(D.src[0]),`detalle: curva y de qué sesiones viene (${D.src[0]})`);
    await p.evaluate(()=>document.querySelector('#app [data-rcses]').click()); await p.waitForTimeout(800);
    const d1=await p.evaluate(()=>view); await p.evaluate(()=>document.querySelector('#back').click()); await p.waitForTimeout(800);
    T(d1==='dia'&&await p.evaluate(()=>view==='cuerpo'),'tocar una sesión la abre y Volver regresa a Cuerpo');
    // el (?) : fuentes al pie, sin autores en el texto
    await p.evaluate(()=>{ bodySel=null; render(); }); await p.waitForTimeout(400);
    await p.evaluate(()=>document.querySelector('#app [data-info^="cuerpo"]').click()); await p.waitForTimeout(500);
    const I=await p.evaluate(()=>{ const po=document.querySelector('.pop'); return {txt:[...po.querySelectorAll('.gld')].map(x=>x.textContent).join(' '),sup:po.querySelectorAll('.fsup').length,fu:[...po.querySelectorAll('[data-fuente]')].map(b=>b.dataset.fuente),first:(po.querySelector('.glt')||{}).textContent}; });
    T(!/y col\.|, 20\d\d\)/.test(I.txt)&&I.sup>=4,`(?) sin autores en el texto, con números (${I.sup})`);
    T(I.first==='Recuperación'&&I.fu[0]==='moran2017'&&I.fu.length===4,`(?) empieza por la capa que ves y numera las fuentes en orden (${I.fu.join(', ')})`);
    await p.evaluate(()=>document.querySelector('.pop [data-fuente="pelland2026"]').click()); await p.waitForTimeout(900);
    const F=await p.evaluate(()=>({v:view,sec:ajSec,open:!!document.querySelector('#fu-pelland2026.open'),doi:(document.querySelector('#fu-pelland2026 a.fulink')||{}).href||'',n:document.querySelectorAll('#app .fur').length,prog:document.querySelectorAll('#app [data-fuprog]').length,cred:/Tabler/.test(document.querySelector('#app').textContent)}));
    T(F.v==='ajustes'&&F.sec==='fuentes'&&F.open,'tocar una fuente abre Ajustes › Fuentes con esa abierta');
    T(F.doi==='https://doi.org/10.1007/s40279-025-02344-w'&&F.n===6,`fuentes con enlace al estudio (${F.n} · ${F.doi})`);
    T(F.prog>=20&&F.cred,`fuentes también acredita programas y créditos (${F.prog})`);
    await p.context().close(); }
  // Fuerza, Movilidad, cierre: cada uno abre su capa · Cardio: menú en Mejor esfuerzo
  { const p=await open(); await p.evaluate(hoyTorso);
    await p.evaluate(()=>{ histEx='fuerza'; go('stat'); }); await p.waitForTimeout(800);
    const fr=await p.evaluate(()=>{ const b=document.querySelector('#goBody2'); return b?b.textContent.replace(/\s+/g,' ').trim():''; });
    await p.evaluate(()=>{ bodyCapa='r'; document.querySelector('#goBody2').click(); }); await p.waitForTimeout(700);
    T(/^Series por músculo/.test(fr)&&await p.evaluate(()=>view==='cuerpo'&&bodyCapa==='f'),`Fuerza: "Series por músculo" abre la capa Series (${fr.slice(0,30)})`);
    await p.evaluate(()=>{ histEx='movilidad'; go('stat'); }); await p.waitForTimeout(800);
    await p.evaluate(()=>{ bodyCapa='r'; const b=document.querySelector('#goBodyM'); if(b) b.click(); }); await p.waitForTimeout(700);
    T(await p.evaluate(()=>view==='cuerpo'&&bodyCapa==='m'),'Movilidad: "En el cuerpo" abre la capa Movilidad');
    await p.evaluate(()=>{ const x=SESS.find(s=>s.kind==='bici'&&s.int); SESS.push(Object.assign({},x,{id:'b-h1',modo:'hiit',tipo:'Tabata',fecha:addDays(hoyISO(),-2)})); TRN={}; histEx='cardio'; go('stat'); }); await p.waitForTimeout(800);
    const be=await p.evaluate(()=>({pick:!!document.querySelector('#beSel'),pills:document.querySelectorAll('[data-bem]').length}));
    if(be.pick){ await p.click('#beSel'); await p.waitForTimeout(500); }
    const bm=await p.evaluate(()=>document.querySelectorAll('.pop [data-cm]').length);
    T(be.pick&&be.pills===0&&bm>=1,`Cardio: Mejor esfuerzo con menú, sin pastillas (${bm} opciones)`);
    await p.evaluate(()=>{ popClose(true); const s=SESS.find(x=>x.kind==='fuerza'&&x.fecha===hoyISO()); histEx=s.id; finCtx=null; CFG.movNo=hoyISO(); bodyCapa='f'; go('fin'); }); await p.waitForTimeout(1600);
    const hasFm=await p.evaluate(()=>!!document.querySelector('#finMus'));
    if(hasFm){ await p.evaluate(()=>document.querySelector('#finMus').click()); await p.waitForTimeout(700); }
    T(hasFm&&await p.evaluate(()=>view==='cuerpo'&&bodyCapa==='r'),'al terminar, Músculos abre Recuperación');
    // horizontal: la cápsula queda arriba y la lista entra
    await p.setViewportSize({width:844,height:390}); await p.evaluate(()=>{ bodySel=null; render(); }); await p.waitForTimeout(700);
    const Hz=await p.evaluate(()=>{ const g=document.querySelector('#app .topbar .tbgrp').getBoundingClientRect(); const rows=[...document.querySelectorAll('#app .bmlist .brow .n')]; const card=document.querySelector('#app .bmlist').closest('.card').getBoundingClientRect(); return {top:g.top,over:rows.filter(n=>n.getBoundingClientRect().right>card.right-8).length}; });
    T(Hz.top<60&&Hz.over===0,`horizontal: cápsula arriba y nada se sale (${JSON.stringify(Hz)})`);
    await p.context().close(); }
  // borrados que no vuelven: con una base de prueba
  { const p=await open();
    const R=await p.evaluate(async()=>{ const store={}; const path=(c,id)=>c+'/'+id;
      const mkCol=c=>({ doc:id=>({ get:async()=>({exists:!!store[path(c,id)],data:()=>store[path(c,id)]}), set:async d=>{ store[path(c,id)]=JSON.parse(JSON.stringify(d)); }, delete:async()=>{ delete store[path(c,id)]; } }),
        orderBy:()=>mkCol(c), limit:()=>mkCol(c), get:async()=>({docs:Object.keys(store).filter(k=>k.startsWith(c+'/')&&k.split('/').length===c.split('/').length+1).map(k=>({id:k.split('/').pop(),data:()=>store[k]}))}) });
      DB={ collection:mkCol, doc:pth=>({ get:async()=>({exists:!!store[pth],data:()=>store[pth]}), set:async d=>{ store[pth]=d; } }) };
      const base='perfiles/'+PID; const hoy=hoyISO();
      const A={id:'s-1',kind:'fuerza',fecha:hoy,tipo:'Prueba',ej:[]}, B={id:'s-2',kind:'fuerza',fecha:hoy,tipo:'Real',ej:[]};
      SESS=[A,B,...SESS]; lsSave();
      store[base+'/sesiones/s-1']=A; store[base+'/borradas/s-1']={ts:1};   /* borrada en otro dispositivo, pero este la tenía y el servidor también */
      await loadProfile(PID); await new Promise(r=>setTimeout(r,200));
      const r1={local1:SESS.some(x=>x.id==='s-1'),srv1:!!store[base+'/sesiones/s-1'],up2:!!store[base+'/sesiones/s-2']};
      await delSession('s-2'); await new Promise(r=>setTimeout(r,100)); const r2={tomb:!!store[base+'/borradas/s-2'],srv:!!store[base+'/sesiones/s-2']};
      await saveSession(B); await new Promise(r=>setTimeout(r,100)); const r3={tomb:!!store[base+'/borradas/s-2'],srv:!!store[base+'/sesiones/s-2']};
      DB=null; return {r1,r2,r3}; });
    T(!R.r1.local1&&!R.r1.srv1&&R.r1.up2,`una sesión borrada en otro lado no vuelve (${JSON.stringify(R.r1)})`);
    T(R.r2.tomb&&!R.r2.srv,`borrar deja constancia (${JSON.stringify(R.r2)})`);
    T(!R.r3.tomb&&R.r3.srv,`deshacer la recupera (${JSON.stringify(R.r3)})`);
    await p.context().close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
