// v210: conexiones nuevas + etiquetas de volver + vocabulario
const src=process.argv[2]||'prev.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[]; const bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1500);
const E=(f,a)=>p.evaluate(f,a); const W8=ms=>p.waitForTimeout(ms);
const back=async()=>{ await E(()=>document.querySelector('#app .topbar #back').click()); await W8(700); };
const lbl=()=>E(()=>{ const x=document.querySelector('#app .topbar #back'); return x?x.getAttribute('aria-label'):null; });
await E(()=>{ CELON=true; CELQ.length=0; ['lp','swipe','scrub'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); });

// fin fuerza: ejercicio y resumen
await E(()=>{ NAV.length=0; go('home'); }); await W8(500);
await E(()=>{ const s=SESS.find(x=>x.kind==='fuerza'&&(x.ej||[]).length); histEx=s.id; finCtx={mov:null}; go('fin'); }); await W8(800);
const tipo=await E(()=>SESS.find(x=>x.id===histEx).tipo);
await E(()=>document.querySelector('#app .sej[data-ejn]').click()); await W8(800);
ok(await E(()=>view)==='ejercicio','fin → ejercicio');
ok((await lbl())==='Volver a '+tipo,'ejercicio desde fin dice "Volver a '+tipo+'" ('+(await lbl())+')');
await back(); ok(await E(()=>view)==='fin','ejercicio → vuelve a fin');
await E(()=>document.querySelector('#app .card[data-resumen]').click()); await W8(800);
ok(await E(()=>view)==='resumen','fin → resumen');
ok((await lbl())==='Volver a '+tipo,'resumen desde fin: '+(await lbl()));
await back(); ok(await E(()=>view)==='fin','resumen → vuelve a fin');
await E(()=>document.querySelector('#finVer').click()); await W8(800); ok(await E(()=>view)==='dia','fin → detalle');
await back(); ok(await E(()=>view)==='fin','detalle → vuelve a fin');
await E(()=>document.querySelector('#finOk').click()); await W8(800); ok(await E(()=>view==='home'&&NAV.length===0),'Listo → Semana, pila vacía');

// progreso fuerza: récord → ejercicio → volver
await E(()=>{ go('hist'); }); await W8(600); await E(()=>{ histEx='fuerza'; go('stat'); }); await W8(800);
ok((await lbl())==='Volver a Progreso','stat: '+(await lbl()));
const n=await E(()=>{ const r=document.querySelector('#app .row[data-ejn]'); if(!r) return null; const x=r.dataset.ejn; r.click(); return x; }); await W8(800);
ok(n&&await E(()=>view)==='ejercicio','récord → ejercicio ('+n+')');
ok((await lbl())==='Volver a Fuerza','ejercicio desde stat: '+(await lbl()));
await back(); ok(await E(()=>view==='stat'&&statK==='fuerza'),'vuelve a Progreso › Fuerza');

// ejercicio → "Te acerca a" → habilidad
await E(()=>{ NAV.length=0; go('catalogo'); }); await W8(500);
const found=await E(()=>{ const app=document.querySelector('#app'); const L=['Dominadas pronas',...Object.values(CAT).map(c=>c.n)]; for(const n of L){ exSel=n; renderEjercicio(app); if(app.querySelector('[data-psk]')) return n; } return null; });
ok(found,'algún ejercicio con "Te acerca a" ('+found+')');
if(found){ await E(()=>{ NAV.length=0; go('catalogo'); }); await W8(500); await E(n=>{ exSel=n; go('ejercicio'); },found); await W8(700);
  const sk=await E(()=>{ const b=document.querySelector('#app [data-psk]'); const k=b.dataset.psk; b.click(); return k; }); await W8(800);
  ok(await E(()=>view)==='habilidad','Te acerca a → habilidad ('+sk+')');
  ok((await lbl())==='Volver a '+found,'habilidad desde ejercicio: '+(await lbl()));
  await back(); ok(await E(()=>view)==='ejercicio','vuelve al ejercicio'); }

// programa desde semana
await E(()=>{ NAV.length=0; go('home'); }); await W8(500);
await E(async()=>{ await progLoad('base_cali'); progSel='base_cali'; progFrom='home'; go('programa'); }); await W8(800);
ok((await lbl())==='Volver a Semana','programa desde Semana: '+(await lbl()));
ok(await E(()=>document.querySelector('#app').textContent.includes('Semana ')&&!document.querySelector('#app').textContent.includes('Primera semana')),'programa: "Semana N", no "Primera semana"');

// vocabulario: no quedan las formas viejas en pantallas clave
const bads=['Arrancar','Ya lo hice','Registrar otro día','salidas','Otras rutinas','Lo de todos los días','kg movidos','Mejor marca','Primera marca','Plan cumplido','planes ','Héroes','héroes'];
const scr=[['home',()=>{ go('home'); }],['fuerza',()=>{ draft=null; fzSel=null; go('fuerza'); }],['bici',()=>{ bike.sel=null; go('bici'); }],['statc',()=>{ histEx='cardio'; go('stat'); }],['statf',()=>{ histEx='fuerza'; go('stat'); }],['statd',()=>{ histEx='dias'; go('stat'); }],['hist',()=>{ histTab='res'; go('hist'); }],['heroe',()=>{ heroSel='hercules'; heroV=0; go('heroe'); }],['programas',()=>{ prFil='todo'; go('programas'); }]];
for(const [k,f] of scr){ await E(f); await W8(700); const t=await E(()=>document.querySelector('#app').innerText); const hit=bads.filter(w=>t.includes(w)); ok(!hit.length,k+' sin formas viejas '+(hit.length?JSON.stringify(hit):'')); }
// menú "más" de fuerza
await E(()=>{ draft=null; fzSel=null; go('fuerza'); }); await W8(600); await E(()=>document.querySelector('#fzMoreSel').click()); await W8(600);
ok(await E(()=>document.body.innerText.includes('Ya la hice')),'menú fuerza: "Ya la hice"'); await E(()=>popClose(true));
await E(()=>{ bike.sel=null; go('bici'); }); await W8(600); await E(()=>document.querySelector('#bkHecho').click()); await W8(600);
ok(await E(()=>document.querySelector('.lptitle').textContent==='Ya la hice'),'cardio sin plan: "Ya la hice"'); await E(()=>popClose(true));
// migración del nombre
ok(await E(()=>{ const s={tipo:'Movilidad completa'}; renSess(s); return s.tipo==='Movilidad de cuerpo entero'; }),'renombra "Movilidad completa"');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
