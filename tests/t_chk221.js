const src=process.argv[2]||'index.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1200);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
const noSheet=()=>E(()=>!document.querySelector('#dynsheet')&&[...document.querySelectorAll('.sheet')].every(s=>s.hidden||s.id==='rest'));
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); window.decir=()=>{}; });

// 1. nota en la sesión
await E(()=>{ nuevoDraft('Torso A'); go('fuerza'); }); await W8(700);
const n1=await E(()=>draft.plan.ej[cur].n);
await E(n=>{ if(CFG.notasEj) delete CFG.notasEj[n]; openNotaEj(n); },n1); await W8(400);
ok(await E(()=>!!document.querySelector('#ninTxt'))&&await noSheet(),'nota: se escribe en el lugar, sin hoja');
ok(await E(()=>document.activeElement&&document.activeElement.id==='ninTxt'),'nota: foco en el texto');
await p.fill('#ninTxt','Agarre ancho, codos pegados'); await E(()=>document.querySelector('#ninOk').click()); await W8(400);
ok(await E(n=>CFG.notasEj[n]&&CFG.notasEj[n].txt==='Agarre ancho, codos pegados'&&!!document.querySelector('.exnota')&&!document.querySelector('#ninTxt'),n1),'nota: Guardar deja la nota a la vista');
await E(()=>document.querySelector('[data-nota]').click()); await W8(300); await p.fill('#ninTxt',''); await E(()=>document.querySelector('#ninOk').click()); await W8(400);
ok(await E(n=>!CFG.notasEj[n]&&!!document.querySelector('#utoast'),n1),'nota: vaciar borra con deshacer');
await E(()=>document.querySelector('#utoast .utu').click()); await W8(400);
ok(await E(n=>CFG.notasEj[n]&&CFG.notasEj[n].txt==='Agarre ancho, codos pegados',n1),'nota: deshacer la devuelve');
await E(()=>document.querySelector('[data-nota]').click()); await W8(300); await p.fill('#ninTxt','otra'); await E(()=>document.querySelector('#ninNo').click()); await W8(300);
ok(await E(n=>CFG.notasEj[n].txt!=='otra'&&!document.querySelector('#ninTxt'),n1),'nota: Cancelar no guarda');
await E(()=>openNotaEj(draft.plan.ej[cur].n)); await W8(200); await E(()=>go('home')); await W8(400); await E(()=>go('fuerza')); await W8(400);
ok(await E(()=>!document.querySelector('#ninTxt')),'nota: salir de la pantalla cierra la edición');

// 2. nota en la página del ejercicio
await E(n=>{ exSel=n; go('ejercicio'); },n1); await W8(700);
await E(()=>document.querySelector('#exNota').click()); await W8(400);
ok(await E(()=>!!document.querySelector('.nincard #ninTxt'))&&await noSheet(),'ejercicio: nota en el lugar');
await p.fill('#ninTxt','Desde la ficha'); await E(()=>document.querySelector('#ninOk').click()); await W8(400);
ok(await E(n=>CFG.notasEj[n].txt==='Desde la ficha'&&/Desde la ficha/.test(document.querySelector('#exNota').textContent),n1),'ejercicio: guarda y se lee');

// 3. meta y datos
await E(()=>{ delete CFG.metaPeso; go('vos'); }); await W8(500); await E(()=>openMeta()); await W8(600);
ok(await E(()=>view==='meta'&&!!document.querySelector('#fmOk')&&!!document.querySelector('#fmNo'))&&await noSheet(),'meta: pantalla propia');
await p.fill('#mdMeta','72,5'); await p.fill('#mdAlt','178'); await E(()=>document.querySelector('[data-sx]').click()); await E(()=>document.querySelector('#fmOk').click()); await W8(600);
ok(await E(()=>CFG.metaPeso===72.5&&CFG.altura===178&&view==='vos'),'meta: Listo guarda y vuelve');
await E(()=>openMeta()); await W8(500); await p.fill('#mdMeta','60'); await E(()=>document.querySelector('#fmNo').click()); await W8(500);
ok(await E(()=>CFG.metaPeso===72.5&&view==='vos'),'meta: Cancelar no guarda');
await E(()=>openMeta()); await W8(500); await E(()=>document.querySelector('#mdDel').click()); await W8(500);
ok(await E(()=>CFG.metaPeso==null&&view==='vos'&&!!document.querySelector('#utoast')),'meta: Sacar meta sin confirmación');
await E(()=>document.querySelector('#utoast .utu').click()); await W8(400);
ok(await E(()=>CFG.metaPeso===72.5),'meta: deshacer');

// 4. molestias
await E(()=>{ draft=null; CFG.molestias=[]; go('home'); }); await W8(500); await E(()=>openMol([])); await W8(600);
ok(await E(()=>view==='molestias'&&!!document.querySelector('[data-art]'))&&await noSheet(),'molestias: pantalla propia');
const art=await E(()=>document.querySelector('[data-art]').dataset.art);
await E(()=>document.querySelector('[data-art]').click()); await W8(300);
ok(await E(()=>!!document.querySelector('[data-dur]')),'molestias: aparece por cuánto');
await E(()=>document.querySelector('[data-dur="14"]').click()); await W8(200); await p.fill('#molNota','al empujar');
await E(()=>document.querySelector('#fmOk').click()); await W8(600);
ok(await E(a=>view==='home'&&CFG.molestias.some(m=>m.a===a&&m.nota==='al empujar'&&m.hasta===addDays(hoyISO(),13)),art),'molestias: guarda zona, duración y nota');
await E(()=>openMol()); await W8(500); await E(a=>document.querySelector(`[data-art="${a}"]`).click(),art); await W8(300);
ok(await E(()=>/(Das de alta|Alta: )/.test(document.querySelector('#app').textContent)),'molestias: avisa el alta');
await E(()=>document.querySelector('#fmOk').click()); await W8(500);
ok(await E(a=>!CFG.molestias.some(m=>m.a===a)&&(CFG.molHist||[]).some(m=>m.a===a),art),'molestias: alta al historial');
await E(()=>openMol(['hombro'])); await W8(400); await E(()=>document.querySelector('#fmNo').click()); await W8(400);
ok(await E(()=>!(CFG.molestias||[]).length&&view==='home'),'molestias: Cancelar no guarda');
await E(()=>{ nuevoDraft('Torso A'); go('home'); }); await W8(400); await E(()=>openMol(['hombro'])); await W8(500);
ok(await E(()=>/sesión abierta/.test(document.querySelector('#app').textContent)),'molestias: avisa que ajusta la sesión abierta');
await E(()=>document.querySelector('#fmOk').click()); await W8(600);
await E(()=>{ CFG.molestias=[]; saveCfg(); draft=null; });

// 5. guardar como rutina
const fid=await E(()=>SESS.find(x=>x.kind==='fuerza'&&(x.ej||[]).length).id);
await E(id=>{ go('home'); setTimeout(()=>openGuardarRutina(SESS.find(x=>x.id===id)),150); },fid); await W8(800);
ok(await E(()=>view==='rutina'&&!!document.querySelector('#rtN'))&&await noSheet(),'rutina: pantalla propia');
await p.fill('#rtN','Torso A'); ok(await E(()=>/del plan/.test(document.querySelector('#rtW').textContent)),'rutina: avisa nombre del plan');
await E(()=>document.querySelector('#fmOk').click()); await W8(300); ok(await E(()=>view==='rutina'),'rutina: nombre del plan no guarda');
await p.fill('#rtN','Mi prueba'); const s0=await E(()=>RUT.items[0].s); await E(()=>document.querySelector('[data-rs="0:1"]').click()); await W8(150);
await E(()=>document.querySelector('#fmOk').click()); await W8(600);
ok(await E(s0=>{ const r=(CFG.rutinas||[]).find(x=>x.n==='Mi prueba'); return r&&r.ej[0].s===Math.min(6,s0+1)&&view!=='rutina'; },s0),'rutina: guarda con series');
await E(()=>document.querySelector('#utoast .utu').click()); await W8(400);
ok(await E(()=>!(CFG.rutinas||[]).some(x=>x.n==='Mi prueba')),'rutina: deshacer');

// 6. agregar ejercicio
await E(()=>{ nuevoDraft('Torso A'); go('fuerza'); }); await W8(700); const nEj=await E(()=>draft.ej.length);
await E(()=>document.querySelector('#addEx').click()); await W8(700);
ok(await E(()=>view==='agregar'&&document.querySelectorAll('[data-add]').length>5)&&await noSheet(),'agregar: pantalla con lista');
ok(await E(()=>!document.querySelector('#mini:not([hidden]) .mrow, .minibar:not([hidden])')),'agregar: sin minibar encima');
await p.fill('#adQ','zzzqqq'); await W8(200); ok(await E(()=>!document.querySelector('#adNada').hidden),'agregar: sin resultados avisa');
await p.fill('#adQ',''); await W8(100); const nm=await E(()=>document.querySelector('[data-add]').dataset.nm);
await p.fill('#adQ',nm.split(' ')[0].toLowerCase()); await W8(200);
ok(await E(nm=>[...document.querySelectorAll('[data-add]')].filter(r=>!r.hidden).some(r=>r.dataset.nm===nm),nm),'agregar: buscar filtra');
await E(nm=>[...document.querySelectorAll('[data-add]')].find(r=>r.dataset.nm===nm).click(),nm); await W8(700);
ok(await E(([n,nm])=>view==='fuerza'&&draft.ej.length===n+1&&draft.ej[cur].n===nm,[nEj,nm]),'agregar: suma y vuelve a la sesión en ese ejercicio');
await E(()=>document.querySelector('#utoast .utu').click()); await W8(400);
ok(await E(n=>draft.ej.length===n,nEj),'agregar: deshacer');
await E(()=>document.querySelector('#addEx').click()); await W8(500); await E(()=>document.querySelector('#fmNo').click()); await W8(500);
ok(await E(n=>view==='fuerza'&&draft.ej.length===n,nEj),'agregar: Cancelar vuelve');
await E(()=>{ draft=null; });

// 7. nuevo espacio
await E(()=>go('home')); await W8(500); const nL=await E(()=>CFG.lugares.length);
await E(()=>document.querySelector('#app [data-esp]').click()); await W8(400);
await E(()=>document.querySelector('#espNew').click()); await W8(400);
ok(await E(()=>!!document.querySelector('.pop.espnw #espN'))&&await noSheet(),'espacio: el menú cambia a formulario en el lugar');
ok(await E(()=>{ const r=document.querySelector('.pop.espnw').getBoundingClientRect(); return r.left>=0&&r.right<=innerWidth; }),'espacio: el formulario entra en pantalla');
await E(()=>document.querySelector('[data-pre="plaza"]').click()); await W8(100);
ok(await E(()=>document.querySelector('#espN').value==='Plaza'),'espacio: el tipo sugiere el nombre');
await E(()=>document.querySelector('#espOk').click()); await W8(700);
ok(await E(n=>CFG.lugares.length===n+1&&lugar().n==='Plaza'&&lugar().equipo.barra&&view==='equipo'&&!document.querySelector('.pop'),nL),'espacio: crea, lo elige y abre el equipo');
await E(()=>{ const x=CFG.lugares.pop(); CFG.lugar=CFG.lugares[0].id; saveCfg(); render(); }); await W8(300);
await E(()=>document.querySelector('#addLugar')&&document.querySelector('#addLugar').click()); await W8(400);
ok(await E(()=>!!document.querySelector('.pop.espnw')),'espacio: desde Equipo también');
await E(()=>popClose(true));

// 8. idea para la app
await E(()=>{ go('home'); }); await W8(500); const nD=await E(()=>DEVN.length);
await E(()=>{ LASTPD=document.querySelector('#fab')||null; openDev(); }); await W8(500);
ok(await E(()=>!!document.querySelector('.pop.devpopw #dvTxt'))&&await noSheet(),'idea: popover, sin hoja');
ok(await E(()=>{ const r=document.querySelector('.pop.devpopw').getBoundingClientRect(); return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight; }),'idea: entra en pantalla');
await E(()=>document.querySelector('#dvSave').click()); await W8(300); ok(await E(()=>!!document.querySelector('.pop.devpopw')),'idea: vacía no guarda');
await p.fill('#dvTxt','Probar esto'); await E(()=>document.querySelector('[data-dt]:last-child').click());
await E(()=>document.querySelector('#dvSave').click()); await W8(500);
ok(await E(n=>DEVN.length===n+1&&DEVN[0].txt==='Probar esto'&&!document.querySelector('.pop'),nD),'idea: guarda');
await E(()=>openDev()); await W8(400); await p.fill('#dvTxt','Con marca'); await E(()=>document.querySelector('#dvPt').click()); await W8(400);
ok(await E(()=>document.body.classList.contains('pointing')&&!document.querySelector('.pop')),'idea: señalar deja ver la pantalla');
await E(()=>{ const t=document.querySelector('#app h1'); const r=t.getBoundingClientRect(); const ev=new MouseEvent('click',{bubbles:true,cancelable:true,clientX:r.left+10,clientY:r.top+5}); t.dispatchEvent(ev); }); await W8(700);
ok(await E(()=>!!document.querySelector('.pop.devpopw')&&document.querySelector('#dvTxt').value==='Con marca'),'idea: vuelve con el texto después de señalar');
await E(()=>popClose(true));

await E(()=>go('home')); await W8(500); await E(()=>document.querySelector('#fab').click()); await W8(500); await E(()=>document.querySelector('[data-fab="dev"]').click()); await W8(600);
ok(await E(()=>{ const r=document.querySelector('.pop.devpopw').getBoundingClientRect(), f=document.querySelector('#fab').getBoundingClientRect(); return r.bottom<=f.top&&r.bottom>f.top-40&&document.body.classList.contains('nsopen'); }),'idea: desde el + sale del + (y el + es ×)');
await E(()=>document.querySelector('#fab').click()); await W8(400); ok(await E(()=>!document.querySelector('.pop')&&!document.body.classList.contains('nsopen')),'idea: el × la cierra');
await E(()=>{ go('vos'); }); await W8(500); await E(()=>{ document.querySelector('#app [data-esp]')&&0; });
// 9. ayuda sin botón de origen
await E(()=>{ LASTPD=null; help('Probando','<p>Texto</p>'); }); await W8(400);
ok(await E(()=>!!document.querySelector('.pop.helppop')&&document.querySelector('#helpsheet').hidden),'ayuda: popover también sin origen');
await E(()=>popClose(true));

console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
