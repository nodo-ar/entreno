const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await p.goto('http://127.0.0.1:8765/'+src); await W8(500); await seed(p); await W8(600);
await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; });
const VOS=/(tocá|sumá|te toca|Te toca|ya hiciste|Venís|elegís|Necesitás|Te falta|Con esto ajusto|Cómo te costaron|más oscuro|cuando puedas|las que quieras|lo que trabajaste|la próxima ya tenés)/;
await E(()=>{ window.VOS=/(tocá|sumá|te toca|Te toca|ya hiciste|Venís|elegís|Necesitás|Te falta|Con esto ajusto|Cómo te costaron|más oscuro|cuando puedas|las que quieras|lo que trabajaste|la próxima ya tenés)/; });
// ---- carga: 7 días corridos contra las 4 semanas anteriores
const cg=await E(()=>{ const h=hoyISO(); const a=addDays(h,-6); const v=SESS.filter(x=>x.fecha>=a&&x.fecha<=h).reduce((s,x)=>s+cargaSesion(x),0); const cr=cargaRatio(); const base=[1,2,3,4].map(i=>cargaVentana(addDays(h,-7*i))).filter(Boolean); return {v,cur:cr&&cr.cur,r:cr&&cr.r,want:base.length?v/(base.reduce((x,y)=>x+y,0)/base.length):null,ser:cargaSerie(8).map(x=>x.v)}; });
ok(cg.cur===cg.v&&Math.abs(cg.r-cg.want)<1e-9&&cg.ser[7]===cg.v,'carga: ventana de 7 días y cociente contra las 4 anteriores · ×'+(cg.r||0).toFixed(2));
ok(await E(()=>cargaEst(1.34)[0]==='sana'&&cargaEst(1.36)[0]==='salto grande'&&cargaEst(0.76)[0]==='sana'&&cargaEst(0.74)[0]==='liviana'&&cargaEst(0.75)[0]==='sana'),'carga: el estado sale del número que se muestra (×1,3 es sana)');
// ---- Progreso
await E(()=>{ go('hist'); }); await W8(1300);
const pr=await E(()=>{ const a=document.querySelector('#app'); const row=k=>{ const r=a.querySelector(`.ptr[data-stat="${k}"]`); return r&&{v:r.querySelector('b').textContent.replace(/\s+/g,' ').trim(),em:r.querySelector('em').textContent.trim(),dash:!!r.querySelector('svg.sp path[stroke-dasharray]'),hol:!!r.querySelector('svg.sp circle[stroke]')}; };
  const ks=Object.keys(SKILLS); return {eb:[...a.querySelectorAll('.eyebrow')].map(x=>x.textContent.trim()),cap:[...a.querySelectorAll('.ptgh')].map(x=>x.textContent.replace(/\s+/g,' ').trim()),fz:row('fuerza'),cd:row('cardio'),mv:row('movilidad'),cg:row('carga'),ct:row('constancia'),hb:row('habilidades'),tot:ks.reduce((s,k)=>s+skLevel(k),0),enc:ks.filter(k=>skState(k)==='prog').length,c4:constUlt(4),txt:a.innerText}; });
ok(pr.eb.includes('Tendencias')&&!pr.eb.some(x=>/8 semanas/.test(x))&&pr.cap.some(x=>/^Entrenamiento\s*esta semana/.test(x)),'Progreso: "Tendencias" y "Entrenamiento · esta semana"');
ok(pr.fz.dash&&pr.fz.hol&&pr.cd.dash&&pr.mv.dash&&!pr.cg.dash,'Progreso: la semana en curso va punteada y hueca; la carga (7 días) no · '+JSON.stringify([pr.fz.dash,pr.cd.dash,pr.mv.dash,pr.cg.dash]));
ok(/^volumen · \d+\/\d+( sesi|\+)/.test(pr.fz.em)&&/^7 días · ×/.test(pr.cg.em)&&new RegExp('^'+pr.c4+' %').test(pr.ct.v)&&/^4 semanas/.test(pr.ct.em),'Progreso: cada fila dice su período · '+[pr.fz.em,pr.cg.em,pr.ct.v+' '+pr.ct.em].join(' | '));
ok(new RegExp('^'+pr.tot+' escalones').test(pr.hb.v)&&pr.hb.em===pr.enc+' en curso','Progreso: escalones y en curso con la misma cuenta que el árbol · '+pr.hb.v+' · '+pr.hb.em);
ok(/menos/.test(pr.txt)&&/más carga/.test(pr.txt)&&/varias/.test(pr.txt)&&!VOS.test(pr.txt),'Progreso: leyenda del calendario sin "más oscuro"; sin prosa');
// ---- árbol y Resumen dicen lo mismo
await E(()=>{ resumenWk=semanaKey(hoyISO()); resMode='sem'; go('resumen'); }); await W8(1300);
const rs=await E(()=>{ const a=document.querySelector('#app'); const t=a.innerText; const m=t.match(/y (\d+) más en curso/); const ks=Object.keys(SKILLS); return {m:m?+m[1]+1:null,enc:ks.filter(k=>skState(k)==='prog').length,cap:(a.querySelector('.wkcap')||{}).textContent||'',cst:/Constancia/.test(a.querySelector('.wkc').innerText),tiles:a.querySelectorAll('.stiles.rs4>div').length,vos:VOS.test(t),dow:wdIdx(hoyISO())}; });
ok((rs.m==null||rs.m===rs.enc)&&rs.tiles===4&&!rs.vos,'Resumen semana: en curso coincide, cifras en 2×2, sin prosa · '+JSON.stringify(rs));
ok(!rs.cst&&(rs.dow===6?rs.cap==='':/^· lun/.test(rs.cap)),'Resumen semana: compara los mismos días y la constancia de la semana en curso no aparece · '+rs.cap);
await E(()=>{ resumenWk=addDays(semanaKey(hoyISO()),-7); render(); }); await W8(900);
ok(await E(()=>/Constancia/.test(document.querySelector('#app .wkc').innerText)&&!document.querySelector('#app .wkcap')),'Resumen semana pasada: constancia contra el plan completo');
await E(()=>{ resMode='mes'; mesOff=0; resumenWk=null; render(); }); await W8(1000);
const rm=await E(()=>{ const T=template(), h=hoyISO(), R=resMesRange(0); let pf=0; for(let f=R.a>inicioUso()?R.a:inicioUso();f<=R.b;f=addDays(f,1)) if(T[wdIdx(f)].f) pf++; const g=document.querySelector('#app .wkr b i').textContent.replace('/',''); return {pf,g:+g,cap:(document.querySelector('#app .wkcap')||{}).textContent}; });
ok(rm.pf===rm.g&&/1 al \d+/.test(rm.cap),'Resumen mes: anillos contra el plan del mes entero y carga contra los mismos días · '+JSON.stringify(rm));
// ---- páginas
await E(()=>{ histEx='carga'; go('stat'); }); await W8(1100);
ok(await E(()=>{ const t=document.querySelector('#app').innerText; return /últimos 7 días/.test(t)&&/vs\. las 4 semanas anteriores/.test(t)&&/7 días corridos/.test(t)&&!!document.querySelector('#app .czw'); }),'Carga: 7 días, contra las 4 anteriores, con la franja');
await E(()=>{ histEx='constancia'; go('stat'); }); await W8(1100);
const ct=await E(()=>{ const a=document.querySelector('#app'); return {t:a.innerText,ch:a.querySelectorAll('.wkb .wkbc').length,cur:!!a.querySelector('.wkbc.cur'),rows:a.querySelectorAll('.bars .barrow').length}; });
ok(/del plan · 4 semanas/.test(ct.t)&&/al 80 %/.test(ct.t)&&!/hasta hoy/.test(ct.t)&&ct.ch===8&&ct.cur&&/en curso/.test(ct.t)&&ct.rows>=2,'Constancia: 4 semanas, racha, esta semana completa y la en curso marcada');
await E(()=>{ histEx='cardio'; go('stat'); }); await W8(1100);
ok(await E(()=>{ const t=document.querySelector('#app').innerText; return /4 semanas/.test(t)&&/meta 80\/20/.test(t)&&!VOS.test(t)&&!/sumá/.test(t); }),'Cardio: 80/20 sobre 4 semanas, sin prosa');
await E(()=>{ histEx='fuerza'; go('stat'); }); await W8(1100);
ok(await E(()=>{ const a=document.querySelector('#app'); return !VOS.test(a.innerText)&&/en curso/.test(a.innerText); }),'Fuerza: sin "tocá", volumen con la semana en curso');
// ---- fin, +, programa, ficha
const fid=await E(()=>SESS.filter(x=>x.kind==='fuerza').sort((a,b)=>a.fecha<b.fecha?1:-1)[0].id);
await E(id=>{ histEx=id; finCtx=null; const s=SESS.find(x=>x.id===id); FIN_ESF={id:null}; (s.ej||[]).forEach(e=>delete e.fatiga); go('fin'); },fid); await W8(1400);
ok(await E(()=>{ const t=document.querySelector('#app').innerText; return /Esfuerzo/.test(t)&&!VOS.test(t)&&(!cargaRatio()||/Carga 7 días/.test(t)); }),'Fin: "Esfuerzo" y carga de 7 días, sin prosa');
await E(()=>{ go('home'); }); await W8(900); await E(()=>openFab()); await W8(800);
ok(await E(()=>{ const t=document.body.innerText; return /Movilidad/.test(t)&&/sigue /.test(t)&&!VOS.test(t)&&!/\bEstirar\b/.test([...document.querySelectorAll('.fabmenu, .fab-it, [class*=fab]')].map(x=>x.innerText).join(' ')); }),'Menú +: Fuerza, Cardio y Movilidad; "sigue …"');
await E(()=>{ document.querySelectorAll('.fabov,.fabmenu,.fabbg').forEach(x=>x.remove()); progSel='base_cali'; go('programa'); }); await W8(1200);
ok(await E(()=>{ const t=document.querySelector('#app').innerText; return /Equipo/.test(t)&&/Variantes duras y prueba/.test(t)&&!VOS.test(t); }),'Programa: "Equipo" y fases sin voseo');
ok(await E(()=>{ const bad=/^(Consolidás|Encontrás|Sumás|Subís|Empujás|Te quedás|Si te trabás)|medís$/; return PROG_IDX.every(p=>!(progMeta(p.id)||{}).fases||progMeta(p.id).fases.every(f=>!bad.test(f[2]))); }),'Programas: ninguna fase en segunda persona');
await E(()=>{ exSel='Dominadas pronas'; go('ejercicio'); }); await W8(1100);
ok(await E(()=>/reps|kg|s/.test((document.querySelector('#app .mstats>div:nth-child(2) b')||{}).innerText||'')),'Ficha: el récord con unidad');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
