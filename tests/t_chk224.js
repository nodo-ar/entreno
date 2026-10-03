const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1200);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms), act=()=>E(()=>{ const a=document.activeElement; return a&&(a.id||a.dataset.ef||a.tagName); });
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); window.decir=()=>{}; });
// editar sesión: Enter pasa al siguiente, el último cierra
await E(()=>{ const s=SESS.find(x=>x.kind==='bici'); s.km=5.3; histEx=s.id; go('dia'); }); await W8(700); await E(()=>document.querySelector('#diaEd').click()); await W8(500);
await p.focus('[data-ef="min"]'); await W8(100); ok(await E(()=>{ const a=document.activeElement; return a.selectionStart===0&&a.selectionEnd===a.value.length; }),'editar: al entrar se selecciona el número');
await p.keyboard.press('Enter'); await W8(150); ok(await act()==='kcal','editar: Enter pasa a kcal');
await p.keyboard.press('Enter'); await W8(150); ok(await act()==='km','editar: Enter pasa a km');
ok(await E(()=>document.activeElement.getAttribute('enterkeyhint')==='done'),'editar: el último dice Listo');
await p.keyboard.press('Enter'); await W8(150); ok(await act()==='BODY','editar: en el último, Enter cierra el teclado');
await E(()=>document.querySelector('#edCancel').click()); await W8(300);
// meta
await E(()=>{ go('vos'); setTimeout(()=>openMeta(),200); }); await W8(900);
ok(await E(()=>document.querySelector('#mdAlt').placeholder==='—'),'meta: vacío se ve vacío');
await p.focus('#mdAlt'); await p.keyboard.type('178'); await p.keyboard.press('Enter'); await W8(150); ok(await act()==='mdEdad','meta: Enter → Edad');
await p.keyboard.type('40'); await p.keyboard.press('Enter'); await W8(150); ok(await act()==='mdMeta','meta: Enter → Peso meta');
await p.keyboard.type('75,5'); await p.keyboard.press('Enter'); await W8(150); ok(await act()==='BODY','meta: Enter en el último cierra, no guarda solo');
ok(await E(()=>view==='meta'),'meta: sigue en la pantalla');
await E(()=>document.querySelector('#fmOk').click()); await W8(500); ok(await E(()=>CFG.altura===178&&CFG.edad===40&&CFG.metaPeso===75.5),'meta: guarda lo tipeado');
// rutina: nombre sugerido seleccionado
await E(()=>{ go('home'); setTimeout(()=>openGuardarRutina(SESS.find(x=>x.kind==='fuerza'&&(x.ej||[]).length)),200); }); await W8(900);
await p.focus('#rtN'); await W8(100); ok(await E(()=>{ const a=document.activeElement; return a.selectionStart===0&&a.selectionEnd===a.value.length&&a.value.length>0; }),'rutina: nombre sugerido seleccionado');
await E(()=>document.querySelector('#fmNo').click()); await W8(400);
// pasos: acepta 8.000
await E(()=>{ go('home'); }); await W8(600); await p.focus('#pasosHoy'); await p.keyboard.type('8.000'); await p.keyboard.press('Enter'); await W8(500);
ok(await E(()=>DIARIO[hoyISO()].pasos===8000),'pasos: "8.000" son 8000 y Enter guarda');
// espacio: Enter crea
const nL=await E(()=>CFG.lugares.length); await E(()=>document.querySelector('#app [data-esp]').click()); await W8(400); await E(()=>document.querySelector('#espNew').click()); await W8(400);
await p.keyboard.type('Plaza del barrio'); await p.keyboard.press('Enter'); await W8(700);
ok(await E(n=>CFG.lugares.length===n+1&&lugar().n==='Plaza del barrio',nL),'espacio: Enter = Crear');
await E(()=>{ CFG.lugares.pop(); CFG.lugar=CFG.lugares[0].id; saveCfg(); go('home'); }); await W8(500);
// buscador: Enter cierra el teclado y deja el resultado
await E(()=>go('catalogo')); await W8(700); await p.focus('#catQ'); await p.keyboard.type('goblet'); await p.keyboard.press('Enter'); await W8(300);
ok(await act()!=='catQ'&&await E(()=>document.querySelector('#catQ').value==='goblet'),'catálogo: Enter cierra el teclado');
ok(await E(()=>document.querySelector('#catQ').spellcheck===false),'catálogo: sin corrector');
// ya la hice: solo dígitos
await E(()=>{ bike.running=false; go('bici'); }); await W8(700); await E(()=>{ const b=document.querySelector('#bkHecho'); b.scrollIntoView({block:'center'}); b.click(); }); await W8(500);
await p.focus('#lbMin'); await p.keyboard.type('45'); await W8(100); ok(await E(()=>bike.libre.min===45),'ya la hice: 45 reemplaza (no queda 3045)');
await E(()=>popClose(true));
// primer inicio con coma
await E(()=>{ CFG.onboarded=false; ob.step=0; render(); }); await W8(700);
await p.fill('#obPeso','82,5'); await p.fill('#obCint','91,5'); await E(()=>document.querySelector('#obNext').click()); await W8(500);
ok(await E(()=>CFG.peso===82.5&&ob.vals.cint===91.5),'primer inicio: acepta coma');
ok(await E(()=>!document.querySelector('input[type=number]')),'no quedan campos type=number');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
