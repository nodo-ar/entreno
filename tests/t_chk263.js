// v260: carga por músculo + Estirar después según lo entrenado hoy
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H)=>{ const p=await (await b.newContext({viewport:{width:W||390,height:H||844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; CFG.molestias=[]; });
    return p; };
  const dia=`(()=>{ const hoy=hoyISO(); SESS=SESS.filter(x=>x.fecha!==hoy); const t=Date.now();
    SESS.unshift({id:'b-'+(t-7200e3),kind:'bici',fecha:hoy,tipo:'Bici tranqui',modo:'bici',min:42,kcal:380});
    SESS.unshift({id:'s-'+(t-3600e3),kind:'fuerza',fecha:hoy,tipo:'Torso A',dur:22,ej:[{n:'Fondos',z:'emp',bw:true,fatiga:2,series:[{r:6,kg:0},{r:6,kg:0},{r:6,kg:0}]},{n:'Dominadas pronas',z:'esp',bw:true,fatiga:1,series:[{r:6,kg:0},{r:6,kg:0},{r:6,kg:0}]},{n:'Press de hombros',z:'emp',fatiga:1,series:[{r:12,kg:10},{r:12,kg:10},{r:12,kg:10}],ss:'A1'},{n:'Remo con dos mancuernas',z:'esp',fatiga:1,series:[{r:12,kg:10},{r:12,kg:10},{r:12,kg:10}],ss:'A2'}],skills:[]}); REC_C=null; })()`;
  { const p=await open();
    // motor: carga por sesión
    const c=await p.evaluate(()=>{ const f=cargaSes({kind:'fuerza',ej:[{n:'Fondos',z:'emp',fatiga:2,series:[{r:6},{r:6},{r:6}]}]}); const l=cargaSes({kind:'fuerza',ej:[{n:'Fondos',z:'emp',fatiga:3,series:[{r:6},{r:6},{r:6}]}]}); const e=cargaSes({kind:'fuerza',ej:[{n:'Fondos',z:'emp',fatiga:1,series:[{r:6},{r:6},{r:6}]}]});
      const bt=cargaSes({kind:'bici',modo:'bici',tipo:'Bici tranqui',min:30}), bi=cargaSes({kind:'bici',modo:'bici',tipo:'Bloques 4×4',min:30}), co=cargaSes({kind:'bici',modo:'correr',tipo:'Rodar',min:30});
      return {pecho:f.pecho.v,tri:f.triceps.v,lim:l.pecho.v,fac:e.pecho.v,bt:bt.cuadriceps.v,bi:bi.cuadriceps.v,co:co.cuadriceps&&co.cuadriceps.v,mov:Object.keys(cargaSes({kind:'mov',items:['Childs_Pose']})).length}; });
    T(Math.abs(c.pecho-3)<.01&&Math.abs(c.tri-1.5)<.01,`3 series de fondos justas: pecho 3, tríceps 1,5 (${c.pecho}, ${c.tri})`);
    T(c.lim>c.pecho&&c.fac<c.pecho,`al límite carga más y fácil menos (${c.fac} < ${c.pecho} < ${c.lim})`);
    T(c.bt<c.bi,`bici tranqui carga menos que intervalos (${c.bt} < ${c.bi})`);
    T(c.mov===0,'movilidad no suma carga');
    // motor: decae con el tiempo, más rápido en músculos chicos
    const d=await p.evaluate(()=>{ const hoy=hoyISO(); SESS=SESS.filter(x=>x.fecha<addDays(hoy,-8)); const t=Date.now(); SESS.unshift({id:'s-'+(t-1000),kind:'fuerza',fecha:hoy,tipo:'X',ej:[{n:'Sentadilla búlgara',z:'pd',fatiga:2,series:Array.from({length:8},()=>({r:8,kg:10}))},{n:'Curl de bíceps',z:'bra',fatiga:2,series:Array.from({length:8},()=>({r:10,kg:8}))}]}); REC_C=null;
      const a=recupMap(t), b2=recupMap(t+36*36e5), c2=recupMap(t+60*36e5); return {q0:a.cuadriceps.pct,b0:a.biceps.pct,q36:b2.cuadriceps.pct,b36:b2.biceps.pct,q60:c2.cuadriceps.st,b60:c2.biceps.st,st0:a.cuadriceps.st,h:a.cuadriceps.h,src:a.cuadriceps.src.length}; });
    T(d.st0==='cargado'&&d.h>24&&d.src===1,`recién entrenado: cargado, listo en más de 24 h, con su origen (${d.st0}, ${d.h} h)`);
    T(d.q36<d.q0&&d.b36<d.b0&&d.b36/d.b0<d.q36/d.q0,`baja con el tiempo y más rápido en músculos chicos (cuád ${d.q0}→${d.q36}, bíceps ${d.b0}→${d.b36})`);
    T(d.b60==='listo',`a las 60 h el bíceps está listo (${d.b60}, cuádriceps ${d.q60})`);
    await p.context().close(); }
  // Estirar después: el día de bici + torso corto
  for(const [W,H] of [[390,844],[844,390]]){ const p=await open(W,H); await p.evaluate(dia);
    const E=await p.evaluate(()=>{ const E=estPlan(Object.assign({},estHoy())); return {items:E.items,act:E.items.filter(k=>movT(k)==='a'||movT(k)==='r').length,pos:E.items.filter(k=>movT(k)==='e').map(k=>POS_ORD[movPos(k)]),hold:E.items.map(k=>[movT(k),!!MOV[k].lados,movHold(E,k)]),mus:[...new Set(E.items.flatMap(movMus))],last:E.items.at(-1),min:E.min,label:E.ctx.label,lbl:movLabel(Object.assign({},estHoy()))}; });
    T(E.act===0,`${W}: sin activación ni rodillo (${E.items.join(', ')})`);
    T(E.items.length>=5&&E.items.length<=8,`${W}: entre 4 y 7 posturas + cierre (${E.items.length})`);
    T(E.pos.every((v,i,a)=>!i||v>=a[i-1]),`${W}: de parado al piso sin volver (${E.pos.join(',')})`);
    T(E.hold.every(([t,l,h])=>t!=='e'||(l?h===45:h===60)),`${W}: 60 s o 45 s por lado`);
    T(E.last==='ctl_9090'&&E.hold.at(-1)[2]===90,`${W}: cierra con 90 s de respiración`);
    T(['pecho','dorsales','cuadriceps','cadera'].every(m=>E.mus.includes(m))||['pecho','hombros'].some(m=>E.mus.includes(m))&&['cuadriceps','cadera'].some(m=>E.mus.includes(m)),`${W}: estira lo de las dos sesiones (${E.mus.join(', ')})`);
    T(/Bici tranqui y Torso A/.test(E.label)&&!/zonas/.test(E.lbl),`${W}: nombra las dos sesiones y los músculos (${E.label} · ${E.lbl})`);
    T(E.min>=6&&E.min<=13,`${W}: unos 10 minutos (${E.min})`);
    // reproductor
    await p.evaluate(()=>startMov(Object.assign({},estHoy()))); await p.waitForTimeout(1200);
    const R=await p.evaluate(()=>({meta:(document.querySelector('#app .mvcard .exmeta span')||{}).textContent||'',br:(document.getElementById('mvBr')||{}).textContent||'',hold:mov.left}));
    T(/Pecho|Espalda|Dorsales|Cuádriceps|Cadera|Glúteos|Tríceps|Hombros/.test(R.meta),`${W}: el reproductor dice qué músculo estira (${R.meta})`);
    T(/^(Inhalá|Exhalá)$/.test(R.br),`${W}: guía la respiración (${R.br})`);
    await p.waitForTimeout(4600); const br2=await p.evaluate(()=>(document.getElementById('mvBr')||{}).textContent);
    T(br2!==R.br,`${W}: la guía cambia con el ritmo (${R.br} → ${br2})`);
    await p.evaluate(()=>{ mov.done.push(mov.plan.items[0],mov.plan.items[1]); finishMov(); }); await p.waitForTimeout(800);
    T(await p.evaluate(()=>{ const m=SESS.find(x=>x.kind==='mov'&&x.fecha===hoyISO()); return !!m&&/Bici tranqui y Torso A/.test(m.tipo)&&m.zonas.length>0; }),`${W}: guarda la sesión con nombre y zonas (para la capa de movilidad)`);
    await p.context().close(); }
  // cuerpo entero: secuencia fija; elegir zonas: solo estiramientos; molestias
  { const p=await open(); await p.evaluate(dia);
    const F=await p.evaluate(()=>{ const a=estPlan({full:true}), b2=estPlan({full:true}); return {same:a.items.join()===b2.items.join(),n:a.items.length,act:a.items.filter(k=>movT(k)!=='e'&&k!=='ctl_9090').length,pos:a.items.filter(k=>movT(k)==='e').map(k=>POS_ORD[movPos(k)])}; });
    T(F.same&&F.n===8&&F.act===0&&F.pos.every((v,i,a)=>!i||v>=a[i-1]),`cuerpo entero: 7 posturas fijas + respiración, de parado al piso (${F.n})`);
    const Z=await p.evaluate(()=>{ const q=buildMov({zonas:['isq','hom','mun']}); return {act:q.items.filter(k=>movT(k)!=='e').length,n:q.items.length}; });
    T(Z.act===0&&Z.n>=3,`elegir zonas: solo estiramientos (${Z.n})`);
    const M=await p.evaluate(()=>{ CFG.molestias=[{a:'rodilla',desde:hoyISO(),hasta:addDays(hoyISO(),7)}]; const E=estPlan(Object.assign({},estHoy())), F=estPlan({full:true}); return [...E.items,...F.items].filter(k=>movPos(k)==='r').length; });
    T(M===0,'con molestia de rodilla no aparecen posturas de rodillas');
    await p.evaluate(()=>{ CFG.molestias=[]; });
    // día de piernas: solo piernas y espalda baja, sin pecho de relleno; etiqueta humana
    const P=await p.evaluate(()=>{ const hoy=hoyISO(); SESS=SESS.filter(x=>x.fecha!==hoy); SESS.unshift({id:'s-'+(Date.now()-3600e3),kind:'fuerza',fecha:hoy,tipo:'Piernas A',dur:30,ej:[{n:'Sentadilla búlgara',z:'pd',fatiga:2,series:[{r:8},{r:8},{r:8}]}]}); REC_C=null; const h=estHoy(), E=estPlan(Object.assign({},h)); return {mus:[...new Set(E.items.flatMap(movMus))],n:E.items.length,lbl:movLabel(Object.assign({},h))}; });
    T(P.n>=5&&P.mus.every(m=>['cuadriceps','cadera','gluteos','isquios','gemelos','lumbar'].includes(m)),`piernas: completa con vecinos, no con pecho (${P.mus.join(', ')})`);
    T(!/\d más/.test(P.lbl)&&/piernas|cuádriceps/.test(P.lbl),`piernas: etiqueta clara (${P.lbl})`);
    const L=await p.evaluate(()=>estResumen(['Chest_And_Front_Of_Shoulder_Stretch','Middle_Back_Stretch','Childs_Pose','Intermediate_Hip_Flexor_and_Quad_Stretch','IT_Band_and_Glute_Stretch','ctl_9090']));
    T(L==='pecho, hombros, espalda y piernas',`resumen agrupa espalda y piernas (${L})`);
    await p.context().close(); }
  // horizontal: la respiración va debajo de la indicación
  { const p=await open(844,390); await p.evaluate(dia); await p.evaluate(()=>startMov(Object.assign({},estHoy()))); await p.waitForTimeout(1200);
    const G=await p.evaluate(()=>{ const c=document.querySelector('#app .mvcue').getBoundingClientRect(), b=document.querySelector('#app .mvbr').getBoundingClientRect(), x=document.querySelector('#app .xport').getBoundingClientRect(), k=document.querySelector('#app .mvcard').getBoundingClientRect(); return {cb:c.bottom,bt:b.top,bb:b.bottom,xt:x.top,kb:k.bottom,h:innerHeight}; });
    T(G.bt>=G.cb-1&&G.bb<=G.xt+1,`horizontal: respiración entre la indicación y los controles (${JSON.stringify(G)})`);
    T(G.kb<=G.h+1,`horizontal: la tarjeta entra en la pantalla (${G.kb} ≤ ${G.h})`);
    await p.context().close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
