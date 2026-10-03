const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await p.goto('http://127.0.0.1:8765/'+src); await W8(500); await seed(p); await W8(600);
await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} });
  const L=lugar(); L.equipo=Object.assign({},L.equipo,{barra:1,paralelas:1,mancuernas:1,bici:1,soga:1}); delete L.equipo.kb; CFG.tests=Object.assign({},CFG.tests,{dom:8,fon:12,rod:10}); CFG.molestias=[]; saveCfg();
  window.__voz=[]; const d0=decir; decir=t=>{ window.__voz.push(t); }; });

// ---- el HIIT es un modo de cardio, siempre disponible
const md=await E(()=>({d:modosDisp(),n:CARDIO.hiit.n,ic:!!MODE_ICON.hiit,ks:Object.keys(CARDIO.hiit.prot)}));
ok(md.d.includes('hiit')&&md.n==='HIIT'&&md.ic&&md.ks.length===4,'modo HIIT: siempre disponible, con ícono y 4 protocolos · '+md.ks.join(', '));
// ---- ejercicios según equipo, pruebas y molestias
const cx=await E(()=>{ const P=CARDIO.hiit.prot["Circuito 40/20"].ph.filter(x=>x[0]==="piso").slice(0,6); return P.map(x=>x[2]+(x[3]&&x[3].q?'×'+x[3].q:'')); });
ok(cx[0]==='dominadas×3'&&cx[2]==='fondos×5'&&cx[4]==='rod_barra×5'&&cx[1]==='salto_sent','circuito: con 8 dominadas y 12 fondos tocan 3 y 5 por estación · '+cx.join(', '));
const cx2=await E(()=>{ CFG.tests.dom=2; const a=CARDIO.hiit.prot["Circuito 40/20"].ph.find(x=>x[0]==="piso"); CFG.tests.dom=8; const L=lugar(), eq=Object.assign({},L.equipo); delete L.equipo.barra; delete L.equipo.paralelas; const P=CARDIO.hiit.prot["Circuito 40/20"].ph.filter(x=>x[0]==="piso").slice(0,6).map(x=>x[2]+(x[3]&&x[3].q?'×'+x[3].q:'')); L.equipo=eq; return {a:a[2],P}; });
ok(cx2.a==='remo_inv'&&cx2.P[0]==='flexiones×8'&&cx2.P[2]==='fondos_banco×10','circuito: con 2 dominadas va remo invertido; sin barra ni paralelas, flexiones y fondos en banco · '+cx2.P.join(', '));
const mo=await E(()=>{ CFG.molestias=[{a:'rodilla',desde:hoyISO(),hasta:addDays(hoyISO(),6)}]; const ks=hxKs(CARDIO.hiit.prot["Tabata en casa"].ph); CFG.molestias=[]; return ks; });
ok(!mo.some(k=>['salto_sent','burpee','jacks'].includes(k))&&mo.includes('sentadilla'),'molestias: cuidando la rodilla, el Tabata no salta · '+mo.join(', '));
// ---- sesión en curso: cada minuto
await E(()=>{ bike.running=false; bike.modo='hiit'; bike.sel='Cada minuto'; bkStart(null); bike.ph=1; startPhase(); go('bici'); }); await W8(1300);
const ui=await E(()=>({ph:document.querySelector('#app .bigtimer .ph').innerText,sub:document.querySelector('#app .bigtimer .sub').innerText,q:(document.querySelector('#app .cdq')||{}).innerText,niv:!!document.querySelector('#app .cdlv'),voz:window.__voz.slice(-1)[0]}));
ok(/Dominadas/.test(ui.ph)&&/1 de 12/.test(ui.sub)&&!/descansá/.test(ui.sub)&&/^3\s*reps$/.test((ui.q||'').trim())&&!ui.niv,'en curso: el ejercicio, las reps a la derecha sin prosa · '+ui.ph+' | '+ui.sub.replace(/\n/g,' '));
ok(/^Dominadas pronas, 3, 1 minuto$/.test(ui.voz),'voz: nombre, reps y duración · '+ui.voz);
const lv=await E(()=>{ const s=liveState(); return s&&s.title+' | '+s.body; });
/* desde v270 la notificación va corta: título con lo de ahora (ejercicio, reps y tiempo), cuerpo con lo que sigue */
ok(/^Dominadas pronas ×3 · \d+:\d\d \| Sigue: /.test(lv),'notificación: el ejercicio con sus reps · '+lv);
await E(()=>{ window.__voz=[]; bike.sel='Tabata en casa'; bike.ph=2; startPhase(); }); await W8(300);
const tv=await E(()=>{ const p=curProt().ph[2]; return {p,voz:window.__voz.slice()}; });
ok(tv.p[0]==='rest'&&tv.voz.length===0,'voz: la pausa de 10 s no habla, solo suena');
await E(()=>{ window.__voz=[]; bike.ph=3; startPhase(); }); await W8(300);
ok(await E(()=>window.__voz[0]==='Escaladores'||window.__voz[0]==='Burpee'),'voz: en los 20 s solo el nombre · '+await E(()=>window.__voz[0]));
// terminar a mitad: guarda ejercicios, tiempo y reps
const sv=await E(async()=>{ bike.sel='Cada minuto'; bike.ph=8; await finishBike(true); const s=SESS[0]; return {m:s.modo,t:s.tipo,d:s.pisoD,i:s.inter}; });
ok(sv.m==='hiit'&&/parcial/.test(sv.t)&&sv.d&&sv.d.find(x=>x[0]==='dominadas')[2]===9&&sv.i,'guardado: tiempo y reps por ejercicio (3 minutos de dominadas = 9) · '+JSON.stringify(sv.d));
await E(()=>{ histEx=SESS[0].id; go('dia'); }); await W8(1200);
const dt=await E(()=>document.querySelector('#app').innerText);
ok(/Ejercicios/.test(dt)&&/9 reps · 3 min/.test(dt),'detalle del día: "Ejercicios" con reps y minutos');
ok(await E(()=>bodyData(7).dorsales.cd>0),'tu cuerpo: los minutos de dominadas cuentan para los dorsales');
// esfuerzo: fácil suma una rep por estación
const aj=await E(()=>{ cardioProg('hiit','Cada minuto',1); const q=adjProt('hiit','Cada minuto').ph.find(x=>x[0]==='piso')[3].q; CFG.cadj.hiit={}; return q; });
ok(aj===4,'esfuerzo: "fácil" suma una rep a cada estación la próxima (3 → '+aj+')');
// ---- habilidades
const sk=await E(async()=>{ await saveSession({id:'hx1',kind:'bici',modo:'hiit',fecha:hoyISO(),tipo:'Tabata en casa',min:15,kcal:150,piso:320}); await saveSession({id:'rh1',kind:'bici',modo:'bici',fecha:hoyISO(),tipo:'REHIT · Día 1',min:10,kcal:80,inter:true}); const r={h:skAuto('hiit_n'),i:skAuto('bici_int'),br:BR.hiit&&BR.hiit.root,ch:(SKILLS.chelsea.req||[]).map(q=>q.s||q.t).join('+'),ord:TR_ORD.b.includes('hiit')}; await delSession('hx1'); await delSession('rh1'); return r; });
ok(sk.h>=1&&sk.br==='b'&&sk.ch==='hiit_n+dom'&&sk.ord,'árbol: rama HIIT con sesiones, burpees y Chelsea · '+JSON.stringify(sk));
ok(sk.i>=1,'árbol: los programas de intervalos en bici cuentan para Intervalos');
// ---- programas
const pr=await E(async()=>{ const ids=['hiit_pc','once','rehit','hiit_barra','emom_barra','kb1515','complejo']; const out={};
  for(const id of ids){ const o=await progLoad(id), m=progMeta(id); const keys=o.ses.flatMap(s=>s.p.ph.filter(x=>x[2]).flatMap(x=>(Array.isArray(x[2])?x[2]:[x[2]]).map(a=>String(a).split('>')[0])));
    out[id]={n:o.ses.length===m.tot,k:keys.every(k=>CAT[k]),r:o.ses.every(s=>hxRes(s.p.ph).every(x=>!x[2]||typeof x[2]==='string'&&CAT[x[2]])),mo:o.ses.every(s=>s.modos&&s.modos[0]===m.modos[0])}; }
  return out; });
ok(Object.values(pr).every(x=>x.n&&x.k&&x.r&&x.mo),'programas: los 7 bajan, tienen todas sus sesiones y todo lo que nombran existe · '+JSON.stringify(pr));
const rh=await E(async()=>{ const o=await progLoad('rehit'); return o.ses.map(s=>s.p.ph.reduce((a,x)=>a+x[1],0)).every(t=>t===600)&&o.ses[0].p.ph[1][1]===10&&o.ses[17].p.ph[1][1]===20; });
ok(rh,'REHIT: 10 minutos justos, sprints de 10 s que llegan a 20 s');
const pc=await E(async()=>{ await progLoad('hiit_barra'); CFG.prog=CFG.prog||{}; CFG.prog.b={id:'hiit_barra',start:hoyISO()}; bike.running=false; const m=modoDefault(); const k=protPorTipo(m,'inter'); const ph=adjProt(m,k).ph.filter(x=>x[0]==='piso'); delete CFG.prog.b; delete CARDIO.hiit.prot[k]; return {m,k,q:ph[0][3]&&ph[0][3].q,e:ph[0][2]}; });
ok(pc.m==='hiit'&&/Circuito de barra · Día 1/.test(pc.k)&&pc.e==='dominadas'&&pc.q===3,'programa en curso: el cardio de hoy es el circuito, con tus reps · '+JSON.stringify(pc));
await E(()=>{ prFil='b'; go('programas'); }); await W8(1300);
const pl=await E(()=>[...document.querySelectorAll('#app .ajhd')].map(x=>x.firstChild&&x.firstChild.textContent||x.textContent));
ok(['Entran en tus','Con fuerza'].every(t=>pl.some(x=>x.startsWith(t))),'rutinas: cardio ordenado por tus días · '+pl.join(' / '));
await E(()=>{ progSel='emom_barra'; go('programa'); }); await W8(1500);
const pe=await E(()=>document.querySelector('#app').innerText);
ok(/Cada minuto en la barra/.test(pe)&&/Barra/.test(pe)&&/Paralelas/.test(pe)&&/12 min/.test(pe),'programa: Cada minuto en la barra pide barra y paralelas y muestra la semana');
// ---- héroe y glosario
const hr=await E(()=>({p:!!heroOf('perseo'),e:!!EMB.perseo,b:BADGES.find(x=>x.id==='panteon').d,n:HEROES.length}));
ok(hr.p&&hr.e&&hr.b==='Los ocho desafíos','héroes: Perseo con barra y paralelas; Panteón dice '+hr.b);
ok(await E(()=>['emom','amrap','rehit','complejo','burpee','p_hiit_barra','p_rehit'].every(k=>GLOS.some(x=>x.k===k))),'glosario: EMOM, AMRAP, REHIT, complejo, burpee y los programas');
// ---- ficha del programa: rótulos claros y el punto de partida contra tus pruebas
const pk=async id=>{ await E(id=>{ progSel=id; go('programa'); },id); await W8(1200); return E(()=>{ const dl=document.querySelector('#app .prkv'); const r={}; dl.querySelectorAll('dt').forEach(dt=>{ const dd=dt.nextElementSibling; r[dt.textContent.trim()]={t:dd.textContent.trim(),ok:!!dd.querySelector('.pill.ok'),no:!!dd.querySelector('.pill.no')}; }); return r; }); };
const k1=await pk('hiit_barra'); ok(!k1.Sube&&!k1.Para&&k1['Punto de partida']&&k1['Punto de partida'].ok&&/3 o más dominadas y fondos/.test(k1['Punto de partida'].t),'ficha: "Punto de partida" en vez de "Para", y con 8 dominadas y 12 fondos ya estás · '+JSON.stringify(k1['Punto de partida']));
const k2=await pk('emom_barra'); ok(k2['Progresión']&&/Cada semana desde la 3.*\+3 min/.test(k2['Progresión'].t)&&k2['Objetivo'].t==='Más volumen en barra','ficha: "Progresión" en vez de "Sube", con un objetivo corto · '+k2['Progresión'].t);
await E(()=>{ CFG.tests.dom=2; saveCfg(); }); const k3=await pk('emom_barra'); ok(k3['Punto de partida'].no,'ficha: con 2 dominadas, el punto de partida queda marcado como pendiente');
await E(()=>{ CFG.tests.dom=8; saveCfg(); }); const k4=await pk('rehit'); ok(!k4['Punto de partida'].ok&&!k4['Punto de partida'].no&&k4['Punto de partida'].t==='Cualquier nivel','ficha: lo que no se mide queda como texto');
const ds=await E(()=>Object.values(CARDIO.hiit.prot).map(p=>p.desc)); ok(ds.every(d=>!/(ás|és|ís)\b/.test(d)&&d.length<170),'protocolos HIIT: descripciones de datos, sin voseo · '+ds.join(' | '));
await E(()=>go('home')); await W8(400);

// ---- horizontal: la tarjeta del ejercicio entra
await p.setViewportSize({width:844,height:390}); await E(()=>{ bike.running=false; bike.modo='hiit'; bike.sel='Circuito 40/20'; bkStart(null); bike.ph=1; startPhase(); go('bici'); }); await W8(1200);
ok(await E(()=>{ const c=document.querySelector('#app .cdpiso'), q=document.querySelector('#app .cdq'); if(!c||!q) return false; const a=c.getBoundingClientRect(), r=q.getBoundingClientRect(); return r.right<=a.right+1&&r.top>=a.top-1&&r.bottom<=a.bottom+1; }),'horizontal: las reps entran en la tarjeta');
await E(()=>{ clearInterval(bike.int); bike.running=false; bike.sel=null; try{ liveClear(); }catch(e){} go('home'); });
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
