const src=process.argv[2]||'prev.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[]; const bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); };
const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1500);
const E=(f,a)=>p.evaluate(f,a); const W8=ms=>p.waitForTimeout(ms);
const back=async()=>{ await E(()=>{ const x=document.querySelector('#app .topbar .back'); if(x) x.click(); else window.__nb=1; }); await W8(700); };
const st=()=>E(()=>({v:view,f:prFil,p:progSel,sk:skSel,n:NAV.length}));
await E(async()=>{ CELON=true; ['lp','swipe','scrub'].forEach(hintDone); for(const id of ['base_cali']) await progLoad(id); CFG.prog={f:{id:'base_cali',start:addDays(hoyISO(),-3)}}; saveCfg(); go('home'); }); await W8(700);
// inicio: la fila de programas siempre está
ok(await E(()=>!!document.querySelector('.mrow.prh')),'fila programas con programa activo');
await E(()=>document.querySelector('.mrow.prh').click()); await W8(800);
let s=await st(); ok(s.v==='programas'&&s.f==='todo','home -> programas '+JSON.stringify(s));
await E(()=>document.querySelector('.prmore[data-prf="f"]').click()); await W8(700);
s=await st(); ok(s.v==='programas'&&s.f==='f'&&s.n===2,'ver los N '+JSON.stringify(s));
await back(); s=await st(); ok(s.v==='programas'&&s.f==='todo','volver a Todo '+JSON.stringify(s));
await back(); s=await st(); ok(s.v==='home','volver al inicio '+JSON.stringify(s));
// programa -> habilidad -> volver al programa
await E(()=>{ prFil='todo'; go('programas'); }); await W8(600); await E(()=>{ document.querySelector('[data-prog="base_cali"]').click(); }); await W8(800);
await E(()=>document.querySelector('[data-psk="pull"]').click()); await W8(900);
s=await st(); ok(s.v==='habilidad'&&s.sk==='pull','programa -> habilidad '+JSON.stringify(s));
await back(); s=await st(); ok(s.v==='programa'&&s.p==='base_cali','habilidad vuelve al programa '+JSON.stringify(s));
await back(); s=await st(); ok(s.v==='programas','programa vuelve a programas '+JSON.stringify(s));
await back(); s=await st(); ok(s.v==='home','y al inicio '+JSON.stringify(s));
// desde fuerza (pantalla previa)
await E(()=>{ draft=null; fzSel=null; go('fuerza'); }); await W8(700);
await E(()=>document.querySelector('[data-goprog="f"]').click()); await W8(800);
s=await st(); ok(s.v==='programas'&&s.f==='f','fuerza -> programas '+JSON.stringify(s));
await E(()=>document.querySelector('[data-prog="cinco"]').click()); await W8(800);
await back(); await back(); s=await st(); ok(s.v==='fuerza','vuelve a fuerza '+JSON.stringify(s));
// progreso -> sesión -> volver; estadística -> volver
await E(()=>{ go('hist'); }); await W8(700); await E(()=>{ histTab='ses'; render(); }); await W8(500);
await E(()=>{ const x=document.querySelector('.swf[data-open]'); x.click(); }); await W8(900);
s=await st(); ok(s.v==='dia','hist -> dia '+JSON.stringify(s)); await back(); s=await st(); ok(s.v==='hist','dia vuelve a hist '+JSON.stringify(s));
// editar una sesión y guardar no deja la edición en la pila
await E(()=>{ const x=document.querySelector('.swf[data-open]'); x.click(); }); await W8(900);
const sid=await E(()=>histEx); await E(()=>{ const s=SESS.find(x=>x.id===histEx); if(s.kind==='fuerza') editSession(s); }); await W8(900);
const ed=await E(()=>view); if(ed==='fuerza'){ await E(()=>document.querySelector('#finish').click()); await W8(1200); const cf=await E(()=>{ const y=document.querySelector('.pop [data-yes],.askpop [data-yes],[data-ok-confirm]'); if(y){ y.click(); return 1; } return 0; }); await W8(900); s=await st(); ok(s.v==='dia','guardar edición vuelve al día '+JSON.stringify(s)); await back(); s=await st(); ok(s.v==='hist','y el día vuelve a hist '+JSON.stringify(s)); }
// vos -> ajustes -> equipo -> catálogo -> ejercicio -> volver en cadena
await E(()=>go('vos')); await W8(700); await E(()=>{ ajFrom='vos'; go('ajustes'); }); await W8(700);
await E(()=>{ go('equipo'); }); await W8(700); await E(()=>{ catFrom='equipo'; go('catalogo'); }); await W8(700); await E(()=>{ exSel='Dominadas pronas'; go('ejercicio'); }); await W8(800);
const ch=[]; for(let i=0;i<4;i++){ await back(); ch.push(await E(()=>view)); }
ok(ch.join()==='catalogo,equipo,ajustes,vos','cadena de ajustes '+ch.join());
// pestañas vacían la pila; navBack en la raíz devuelve false
await E(()=>{ go('programas'); }); await W8(500); await E(()=>document.querySelector('nav.bottom button[data-tab="hist"]').click()); await W8(700);
ok(await E(()=>NAV.length===0&&view==='hist'),'pestaña vacía la pila');
await E(()=>go('home')); await W8(600); ok(await E(()=>window.navBack()===false),'navBack en inicio');
await E(()=>{ progSel='recomp'; go('programa'); }); await W8(600); ok(await E(()=>window.navBack()===true),'navBack con pantalla');
await W8(600); s=await st(); ok(s.v==='home','navBack volvió '+JSON.stringify(s));
console.log('BAD',JSON.stringify(bad,null,1)); console.log('ERRS',JSON.stringify(errs)); await b.close(); })();
