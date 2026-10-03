const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await p.goto('http://127.0.0.1:8765/'+src); await W8(500); await seed(p); await W8(600);
await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; });
// ---- músculos por ejercicio (conteo fraccionado)
const mu=await E(()=>{ const f=n=>{ const e=Object.values(CAT).find(x=>x.n===n); return JSON.stringify(musc(e)); }; return {lat:f('Elevaciones laterales'),curl:f('Curl de bíceps'),tri:f('Extensión de tríceps en polea'),dom:f('Dominadas pronas'),fp:f('Floor press alterno'),nord:f('Nordic curl'),adu:f('Aducción con banda'),gran:f('Paseo del granjero')}; });
ok(mu.lat==='{"hombros":1}'&&mu.curl==='{"biceps":1}'&&mu.tri==='{"triceps":1}','músculos: laterales → hombros, curl → bíceps, extensión → tríceps · '+mu.lat+' '+mu.curl);
ok(mu.dom==='{"dorsales":1,"espalda":0.5,"biceps":0.5}'&&JSON.parse(mu.fp).pecho===1&&mu.nord==='{"isquios":1}'&&mu.adu==='{"cadera":1}'&&JSON.parse(mu.gran).antebrazos===1,'músculos: dominadas, floor press, nórdico, aducción, granjero');
ok(await E(()=>Object.values(CAT).every(e=>{ const w=musc(e); return Object.keys(w).length&&Object.keys(w).every(r=>BRN[r]&&(w[r]===1||w[r]===.5)); })),'músculos: todo el catálogo cae en un músculo conocido, con peso 1 o 0,5');
// ---- misma semana que el resto de Progreso
const wk=await E(()=>{ const h=hoyISO(); const R=bodyData(1); const wk0=semanaKey(h); let s=0; SESS.filter(x=>x.kind==='fuerza'&&semanaKey(x.fecha)===wk0).forEach(x=>(x.ej||[]).forEach(e=>{ const w=musc(e); s+=(e.series||[]).length*(w.pecho||0); })); return {a:R.pecho.sets,b:Math.round(s*10)/10}; });
ok(wk.a===wk.b,'semana: el pecho suma lo de esta semana calendario · '+wk.a+' = '+wk.b);
const w4=await E(()=>{ const rg=bodyRange('mes',null,-1), R=bodyData(rg), M=resMesRange(-1), d=(Math.round((new Date(M.b)-new Date(M.a))/864e5)+1)/7; let s=0; SESS.filter(x=>x.kind==='fuerza'&&x.fecha>=M.a&&x.fecha<=M.b).forEach(x=>(x.ej||[]).forEach(e=>{ s+=(e.series||[]).length*((musc(e).dorsales)||0); })); return {a:R.dorsales.sets,b:Math.round(s/d*10)/10}; });
ok(w4.a===w4.b,'mes pasado: promedio por semana del mes entero · '+w4.a+' = '+w4.b);
// ---- Progreso: la miniatura sin contornos y con el mismo dato
await E(()=>{ go('hist'); }); await W8(1300);
const pr=await E(()=>{ const r=document.querySelector('#app .ptr[data-stat="cuerpo"]'); const n=Object.values(recupMap()).filter(o=>o.st==='listo').length; return r&&{n:+r.querySelector('b').firstChild.textContent.trim(),want:n,svgs:r.querySelectorAll('svg.bsvg.mini').length,stroke:[...r.querySelectorAll('svg.bsvg path')].some(x=>x.getAttribute('stroke')),sil:r.querySelectorAll('.bsil').length}; });
ok(pr&&pr.n===pr.want&&pr.svgs===2&&!pr.stroke&&pr.sil===2,'Progreso: "Cuerpo" con los músculos listos y la figura sin contornos · '+JSON.stringify(pr));
ok(await E(()=>!document.querySelector('#app .stat[data-stat="cuerpo"]')),'Progreso: sin la tarjeta vieja oculta');
// ---- Fuerza: la misma fila, sin "Series por grupo"
await E(()=>{ histEx='fuerza'; go('stat'); }); await W8(1300);
ok(await E(()=>!!document.querySelector('#goBody2.ptr')&&!/Series por grupo/.test(document.querySelector('#app').innerText)),'Fuerza: la fila Cuerpo reemplaza "Series por grupo"');
await E(()=>document.querySelector('#goBody2').click()); await W8(1100);
ok(await E(()=>view==='cuerpo'),'Fuerza: la fila abre Cuerpo');
// ---- pantalla Cuerpo
await E(()=>{ bodySel=null; bodyCapa='f'; bodyMode='sem'; bodyWk=null; bodyOff=0; render(); }); await W8(800);
const cu=await E(()=>{ const a=document.querySelector('#app'); return {h1:a.querySelector('h1').innerText,seg:[!!a.querySelector('.topbar .tbgrp #capaBtn')],svg:a.querySelectorAll('.bmap svg.bsvg').length,br:a.querySelectorAll('.bmap [data-br]').length,leg:a.querySelector('.blegend').innerText.replace(/\s+/g,' '),info:!!a.querySelector('[data-info="cuerpo:"]'),toca:/Tocá/.test(a.innerText),rows:a.querySelectorAll('.bmlist .brow').length,wrap:[...a.querySelectorAll('.bmlist .brow span:first-child')].some(x=>x.getBoundingClientRect().height>26)}; });
ok(cu.h1==='Cuerpo'&&cu.seg.join()==='true'&&cu.svg===2&&cu.br>=30&&cu.info&&!cu.toca,'Cuerpo: título, capas, figura tocable, ? y sin "Tocá" · '+cu.leg);
ok(cu.rows===14&&!cu.wrap,'Cuerpo: 14 músculos, cada nombre en una línea');
await E(()=>document.querySelector('#app .bmap [data-br="dorsales"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))); await W8(700);
const se=await E(()=>{ const a=document.querySelector('#app'); return {sel:bodySel,dim:a.querySelectorAll('.bmap .bm.dim').length,on:a.querySelectorAll('.bmap .bm.sel').length,det:(a.querySelector('.bdet h3')||{}).innerText,hist:a.querySelectorAll('.bdet .bhist rect').length,hl:a.querySelectorAll('.bdet .bhist line').length,ex:a.querySelectorAll('.bdet [data-ejn]').length}; });
ok(se.sel==='dorsales'&&se.dim>20&&se.on===2&&se.det==='Dorsales'&&se.hist===8&&se.hl===2&&se.ex>=1,'Cuerpo: tocar un músculo atenúa el resto y abre el detalle con 8 semanas y ejercicios · '+JSON.stringify(se));
await E(()=>document.querySelector('#bdX').click()); await W8(500);
ok(await E(()=>bodySel===null&&!document.querySelector('#app .bdet')),'Cuerpo: la × cierra el detalle');
await E(()=>document.querySelector('#capaBtn').click()); await W8(500); await E(()=>document.querySelector('.pop [data-cm="m"]').click()); await W8(700);
const mv=await E(()=>{ const a=document.querySelector('#app'); return {capa:bodyCapa,range:!!a.querySelector('#app>.view>.pernav,#app>.view>.segx'),rows:a.querySelectorAll('.bmlist .brow').length,leg:a.querySelector('.blegend').innerText.replace(/\s+/g,' '),lime:[...a.querySelectorAll('.bmap .bm')].some(x=>/lime/.test(x.getAttribute('fill')))}; });
ok(mv.capa==='m'&&!mv.range&&mv.rows===10&&/Estirado/.test(mv.leg),'Cuerpo · Movilidad: días desde el último estiramiento, sin período · '+mv.leg);
await E(()=>{ bodyCapa='f'; render(); }); await W8(400);
ok(await E(()=>!document.querySelector('#app [data-bmode],#app #bdRange')&&/^Series · esta semana/.test(document.querySelector('#app>.view>.hsub').textContent)),'Cuerpo: sin período, esta semana');
await E(()=>{ render(); document.querySelector('[data-info="cuerpo:"]').click(); }); await W8(500);
ok(await E(()=>{ const t=(document.querySelector('.infopop')||{}).innerText||''; return /Principal/.test(t)&&/0,5 por serie/.test(t)&&/Pelland/.test(t)&&!!document.querySelector('.infopop .hkv')&&!/(tocá|hacé|mirá)/i.test(t); }),'Cuerpo: el ? muestra el conteo en filas, con su fuente');
await E(()=>{ try{ popClose(); }catch(e){} });
// ---- fin de sesión y ficha
const fid=await E(()=>SESS.filter(x=>x.kind==='fuerza').sort((a,b)=>a.fecha<b.fecha?1:-1)[0].id);
await E(id=>{ histEx=id; finCtx=null; go('fin'); },fid); await W8(1500);
const fm=await E(()=>{ const c=document.querySelector('#finMus'); return c&&{svg:c.querySelectorAll('svg.bsvg').length,rows:c.querySelectorAll('.fmr').length}; });
ok(fm&&fm.svg===2&&fm.rows>=2,'Fin: tarjeta Músculos con la figura y las series de la sesión · '+JSON.stringify(fm));
await E(()=>document.querySelector('#finMus').click()); await W8(1100);
ok(await E(()=>view==='cuerpo'&&bodyCapa==='r'),'Fin: la tarjeta abre Cuerpo en Recuperación');
await E(()=>{ exSel='Elevaciones laterales'; go('ejercicio'); }); await W8(1200);
const fx=await E(()=>{ const c=document.querySelector('#app .exmus'); return c&&c.innerText.replace(/\s+/g,' '); });
ok(fx&&/Principal Hombros/.test(fx)&&!/Secundario/.test(fx),'Ficha: elevaciones laterales → principal hombros · '+fx);
await E(()=>{ exSel='Dominadas pronas'; go('ejercicio'); }); await W8(1200);
const fx2=await E(()=>{ const c=document.querySelector('#app .exmus'); return c&&c.innerText.replace(/\s+/g,' '); });
ok(fx2&&/Principal Dorsales/.test(fx2)&&/Secundarios Espalda alta · Bíceps/.test(fx2),'Ficha: dominadas → dorsales; espalda alta y bíceps secundarios · '+fx2);
// ---- en claro también
await E(()=>{ CFG.tema='light'; applyTema(); bodySel=null; go('cuerpo'); }); await W8(900);
ok(await E(()=>{ const s=getComputedStyle(document.querySelector('#app .bmap .bsil')).fill; return s&&s!=='none'; }),'Cuerpo en claro: la silueta se pinta');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
