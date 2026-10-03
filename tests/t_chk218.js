const src=process.argv[2]||'prev.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1200);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await E(()=>{ CELON=true; window.__snd=[]; const cb=window.campana; window.decir=t=>__snd.push('voz:'+t); window.campana=()=>{ __snd.push('campana'); cb(); }; const w=wdIdx(hoyISO()); CFG.diasFS=[w]; CFG.prog={}; nuevoDraft('Torso A'); cur=0; loadStepper(); go('fuerza'); }); await W8(700);
await p.mouse.click(200,300); // un toque destraba el audio
ok(await E(()=>AC&&AC.state!=='closed'),'audio listo tras un toque: '+await E(()=>AC&&AC.state));
await E(()=>fzLogSet(stepR,stepKg)); await W8(400); await E(()=>{ restEnd=Date.now()+300; }); await W8(700);
ok(await E(()=>{ const r=document.querySelector('#rest'); return !r.hidden&&r.classList.contains('fin')&&document.querySelector('#restt').textContent==='0:00'&&__snd.includes('campana'); }),'al terminar: campana y "Descanso listo"');
await W8(1800); ok(await E(()=>document.querySelector('#rest').hidden),'el panel se va solo');
ok(await E(()=>__snd.some(x=>x.startsWith('voz:'))),'la voz dice qué sigue (si está activa)');
await E(()=>fzLogSet(stepR,stepKg)); await W8(400); await E(()=>{ restEnd=Date.now()+300; }); await W8(800); await E(()=>document.querySelector('#rest [data-restadd="30"]').click()); await W8(2200);
ok(await E(()=>{ const r=document.querySelector('#rest'); return !r.hidden&&!r.classList.contains('fin')&&!!restInt; }),'+30 en ese instante: sigue descansando');
await E(()=>closeRest()); ok(await E(()=>document.querySelector('#rest').hidden),'saltar cierra');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
