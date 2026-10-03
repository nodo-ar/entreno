const src=process.argv[2]||'index.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1200);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); window.decir=()=>{}; });
// cardio en el detalle
const bid=await E(()=>SESS.find(x=>x.kind==='bici'&&x.km==null).id);
await E(id=>{ const s=SESS.find(x=>x.id===id); s.km=5.3; histEx=id; go('dia'); },bid); await W8(800);
ok(await E(()=>!!document.querySelector('#diaEd')&&document.querySelector('#diaEd').getAttribute('aria-label')==='Editar'),'"Editar" a la vista en el detalle');
await p.screenshot({path:'mkd/a_dia_b.png'});
await E(()=>document.querySelector('#diaEd').click()); await W8(600);
ok(await E(()=>!!document.querySelector('#edOk')&&!!document.querySelector('#edCancel')&&!document.querySelector('.sheet:not([hidden])')&&!document.querySelector('#editsheet:not([hidden])')),'edición en el lugar, sin hoja');
ok(await E(()=>document.querySelector('[data-ef="km"]').value==='5,30'),'km con coma');
await p.screenshot({path:'mkd/a_ed_b.png'});
await p.fill('[data-ef="min"]','42'); await p.fill('[data-ef="km"]','10,5'); await E(()=>document.querySelector('[data-edfat="3"]').click());
await E(()=>document.querySelector('#edOk').click()); await W8(700);
ok(await E(id=>{ const s=SESS.find(x=>x.id===id); return s.min===42&&s.km===10.5&&s.fatiga===3&&Math.abs(s.ritmo-4)<0.01&&!document.querySelector('#edOk'); },bid),'Listo guarda: minutos, km, ritmo, esfuerzo');
await E(()=>document.querySelector('#utoast .utu').click()); await W8(600);
ok(await E(id=>{ const s=SESS.find(x=>x.id===id); return s.min!==42&&s.km===5.3; },bid),'Deshacer vuelve atrás');
await E(()=>document.querySelector('#diaEd').click()); await W8(400); await p.fill('[data-ef="min"]','99'); await E(()=>document.querySelector('#edCancel').click()); await W8(400);
ok(await E(id=>SESS.find(x=>x.id===id).min!==99,bid),'Cancelar no guarda');
// movilidad
const mid=await E(()=>{ let m=SESS.find(x=>x.kind==='mov'); if(!m){ m={id:'mvz',kind:'mov',fecha:hoyISO(),tipo:'Movilidad de cuerpo entero',min:12,items:Object.keys(MOV).slice(0,8),zonas:['isq']}; SESS.push(m); } return m.id; });
await E(id=>{ histEx=id; go('dia'); },mid); await W8(700); await E(()=>document.querySelector('#diaEd').click()); await W8(500);
await p.screenshot({path:'mkd/a_ed_m.png'});
await p.fill('[data-ef="min"]','15'); await E(()=>document.querySelector('#edOk').click()); await W8(600);
ok(await E(id=>SESS.find(x=>x.id===id).min===15,mid),'movilidad se edita');
await E(()=>document.querySelector('#diaMore').click()); await W8(300); ok(await E(()=>![...document.querySelectorAll('.pop [data-mm]')].some(x=>/Editar/.test(x.textContent))),'⋯ sin Editar repetido'); await E(()=>popClose(true));
// fuerza: abre su editor
const fid=await E(()=>SESS.find(x=>x.kind==='fuerza').id); await E(id=>{ histEx=id; go('dia'); },fid); await W8(700);
await p.screenshot({path:'mkd/a_dia_f.png'});
await E(()=>document.querySelector('#diaEd').click()); await W8(800); ok(await E(()=>view==='fuerza'&&draft&&draft.edit),'fuerza: abre el editor de la sesión');
await E(()=>{ draft=null; }); 
// resumen: Editar en el ⋯
await E(id=>{ histEx=id; finCtx={mov:null}; go('fin'); },bid); await W8(900); await E(()=>document.querySelector('#finMore').click()); await W8(300);
await p.screenshot({path:'mkd/a_fin_menu.png'});
await E(()=>{ const b=[...document.querySelectorAll('.pop [data-mm]')].find(x=>/Editar/.test(x.textContent)); b.click(); }); await W8(800);
ok(await E(()=>view==='dia'&&!!document.querySelector('#edOk')),'resumen → Editar → edición');
await E(()=>{ go('home'); }); await W8(500); ok(await E(()=>diaEd===null),'salir limpia la edición');
// mantener apretado y deslizar
await E(()=>{ const s=SESS.find(x=>x.kind==='mov'); lpMenu&&0; }); 
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
