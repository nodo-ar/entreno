const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:false}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1200);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
const KBON=async()=>{ await p.setViewportSize({width:390,height:544}); await W8(350); }, KBOFF=async()=>{ await p.setViewportSize({width:390,height:844}); await W8(350); };
const hidden=sel=>E(s=>{ const e=document.querySelector(s); return !e||getComputedStyle(e).visibility==='hidden'||getComputedStyle(e).opacity==='0'; },sel);
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); window.decir=()=>{}; go('home'); }); await W8(700);
// idea desde el +
await p.click('#fab'); await W8(500); await p.click('[data-fab="dev"]'); await W8(600);
ok(await E(()=>document.activeElement&&document.activeElement.id==='dvTxt'),'idea: foco en el texto');
ok(await E(()=>document.body.classList.contains('typing'))&&!(await hidden('#fab')),'sin teclado en pantalla (escritorio): no se esconde nada');
await KBON();
ok(await hidden('#fab')&&await hidden('nav.bottom'),'con teclado: se esconden el + y la barra');
ok(await E(()=>document.body.classList.contains('kbopen')&&document.querySelector('.pop').classList.contains('kbdock')),'teclado: el popover se apoya arriba');
ok(await E(()=>{ const r=document.querySelector('.pop').getBoundingClientRect(), s=document.querySelector('#dvSave').getBoundingClientRect(); return r.top>=0&&r.bottom<=innerHeight-6&&s.bottom<=innerHeight-6&&r.width>=innerWidth-26; }),'teclado: entra entero, Guardar a la vista');
await p.keyboard.type('Probando el teclado');
await p.click('[data-dt]:nth-child(2)'); await W8(200);
ok(await E(()=>document.activeElement&&document.activeElement.id==='dvTxt'&&document.querySelector('[data-dt]:nth-child(2)').classList.contains('on')),'elegir tipo no cierra el teclado');
await p.click('#dvSave'); await W8(400);
ok(await E(()=>!document.querySelector('.pop')&&DEVN[0].txt==='Probando el teclado'),'Guardar funciona con el teclado');
await KBOFF(); await W8(200);
ok(await E(()=>!document.body.classList.contains('typing')&&!document.body.classList.contains('kbopen'))&&!(await hidden('#fab')),'sin teclado: vuelve el +');
// abrir, teclado, cerrar teclado sin guardar: vuelve a su lugar
await p.click('#fab'); await W8(500); await p.click('[data-fab="dev"]'); await W8(600); const r0=await E(()=>document.querySelector('.pop').getBoundingClientRect().top);
await KBON(); await E(()=>document.activeElement.blur()); await KBOFF(); await W8(200);
ok(await E(r0=>{ const el=document.querySelector('.pop'); return el&&!el.classList.contains('kbdock')&&Math.abs(el.getBoundingClientRect().top-r0)<2; },r0),'al bajar el teclado vuelve a su lugar');
await E(()=>popClose(true)); await W8(300);
// nuevo espacio: arriba entra, no se mueve
await p.click('#app [data-esp]'); await W8(400); await p.click('#espNew'); await W8(400); const t0=await E(()=>document.querySelector('.pop').getBoundingClientRect().top);
await KBON(); ok(await E(t0=>{ const el=document.querySelector('.pop'); return !el.classList.contains('kbdock')&&Math.abs(el.getBoundingClientRect().top-t0)<2&&el.getBoundingClientRect().bottom<=innerHeight; },t0),'espacio: si entra arriba, no se mueve');
await KBOFF(); await E(()=>popClose(true)); await W8(300);
// nota en la sesión: Listo con el teclado abierto
await E(()=>{ nuevoDraft('Torso A'); go('fuerza'); }); await W8(800); await E(()=>openNotaEj(draft.plan.ej[cur].n)); await W8(400); await KBON();
ok(await E(()=>document.body.classList.contains('kbopen')),'nota: detecta el teclado');
await p.keyboard.type('Nota con teclado'); await p.click('#ninOk'); await W8(400);
ok(await E(()=>CFG.notasEj[draft.plan.ej[cur].n].txt==='Nota con teclado'),'nota: Listo guarda');
await KBOFF();
// el teclado propio de series no cuenta como teclado del sistema
await E(()=>{ const x=document.querySelector('[data-kgb],[data-kgc],.kgcell,[data-kg]'); const t=x&&(x.closest('button')||x.parentElement); t&&t.click(); }); await W8(400);
ok(await E(()=>!document.body.classList.contains('typing')),'teclado de series: no esconde nada');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
