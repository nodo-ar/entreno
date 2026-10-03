const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:false}); await ctx.addInitScript(()=>{ window.__V=[]; Object.defineProperty(navigator,'vibrate',{value:(p)=>{ window.__V.push(JSON.stringify(p)); return true; },configurable:true}); });
const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/prev216.html'); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1200);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
const V=async()=>{ const v=await E(()=>__V.slice()); await E(()=>{ __V.length=0; }); return v; };
await E(()=>{ CELON=true; window.decir=()=>{}; window.beep=()=>{}; const w=wdIdx(hoyISO()); CFG.diasFS=[w]; CFG.diasBS=[]; CFG.prog={}; });
// serie hecha
await E(()=>{ nuevoDraft('Torso A'); cur=0; loadStepper(); go('fuerza'); }); await W8(800); await V(); await W8(100);
await E(()=>{ const bt=document.querySelector('#app .sr:not(.done) [data-ok]'); bt.click(); }); await W8(300); let v=await V();
ok(v.includes('14'),'serie hecha: confirmar '+JSON.stringify(v));
// últimos 10 s
await E(()=>{ restWarn=false; restEnd=Date.now()+8000; }); await W8(700); v=await V(); ok(v.includes('[12,60,12]'),'10 s: aviso '+JSON.stringify(v));
await E(()=>{ restEnd=Date.now()+100; }); await W8(700); v=await V(); ok(v.includes('[180,90,180]'),'fin de descanso '+JSON.stringify(v));
// esfuerzo (sin duplicar)
await W8(2000); await E(()=>{ const f=document.querySelector('#app [data-fat="2"]'); f.click(); }); await W8(200); v=await V(); ok(v.length===1&&v[0]==='14','esfuerzo: un solo toque '+JSON.stringify(v));
// abrir popover: nada; mantener apretado: umbral
await E(()=>{ closeRest(); draft=null; go('home'); }); await W8(800); await V();
await E(()=>{ popOpen(document.querySelector('#app .hwk'),'<div>x</div>',{}); }); await W8(200); v=await V(); ok(v.length===0,'abrir popover: sin vibración '+JSON.stringify(v)); await E(()=>popClose(true));
await E(()=>{ const el=document.querySelector('#app [data-card]'); const r=el.getBoundingClientRect(); el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+20,clientY:r.top+20})); }); await W8(700); v=await V(); ok(v.includes('10'),'mantener apretado: umbral '+JSON.stringify(v));
await E(()=>{ document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); popClose(true); });
// chips: tic
await E(()=>{ go('vos'); setTimeout(()=>openMeta(),200); }); await W8(800); await V(); await E(()=>document.querySelector('.sheet [data-sx], #app [data-sx]').click()); await W8(200); v=await V(); ok(v.includes('8'),'chip: tic '+JSON.stringify(v)); await E(()=>{ sheetClose(); if(view==='meta') goBack('vos'); });
// cardio: cambio de fase
await W8(300); await V(); await E(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'inter'); bkStart(null); }); await W8(300); await V(); await E(()=>{ bike.ph++; startPhase(); }); await W8(200); v=await V(); ok(v.includes('[180,90,180]'),'cambio de fase '+JSON.stringify(v)); await E(()=>{ bikeDiscard(); });
// movilidad: cambio de postura
await W8(300); await E(()=>startMov({full:true})); await W8(500); await V(); await E(()=>movNext()); await W8(200); v=await V(); ok(v.includes('14'),'cambio de postura '+JSON.stringify(v)); await E(()=>{ movDiscard(); });
// se apaga
await W8(300); await E(()=>{ ajSec='sesion'; go('ajustes'); }); await W8(900);
ok(await E(()=>!!document.querySelector('#app [data-tg="vibra"]')),'interruptor de Vibración en Ajustes › Sesión');
await E(()=>document.querySelector('#app [data-tg="vibra"]').click()); await W8(200); await V();
await E(()=>{ hap('ok'); hap('fin'); vib(10); }); await W8(200); v=await V(); const off=await E(()=>CFG.vibra===false); ok(v.length===0&&off,'apagada: no vibra nada '+JSON.stringify(v));
await E(()=>document.querySelector('#app [data-tg="vibra"]').click()); await W8(200); v=await V(); const on=await E(()=>CFG.vibra!==false); ok(v.length===1&&on,'al prenderla confirma con un toque '+JSON.stringify(v));
// APK: usa el motor nativo
await E(()=>{ window.__N=[]; window.Capacitor={Plugins:{Haptics:{selectionChanged:()=>__N.push('sel'),impact:o=>__N.push('imp:'+o.style),notification:o=>__N.push('not:'+o.type)}}}; }); await W8(100);
await E(()=>{ hap('tic'); }); await W8(90); await E(()=>{ hap('ok'); }); await W8(90); await E(()=>{ hap('fin'); }); const n=await E(()=>__N.slice()); ok(JSON.stringify(n)==='["sel","imp:LIGHT","not:SUCCESS"]','APK: háptica nativa '+JSON.stringify(n));
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
