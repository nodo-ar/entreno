const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const mk=async(o={})=>{ const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:o.rm?'reduce':'no-preference'}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(900);
  await p.evaluate(o=>{ if(!o.ahorro){ PERF.modo='max'; perfApply(); } CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); const h=hoyISO(); for(let i=SESS.length-1;i>=0;i--) if(SESS[i].fecha===h) SESS.splice(i,1); go('home'); },o); await p.waitForTimeout(400); return p; };
const W8=(p,ms)=>p.waitForTimeout(ms), act=p=>p.evaluate(()=>document.querySelector('#hrAct').click()), clean=p=>p.evaluate(()=>document.querySelectorAll('[data-mo]').length===0);
// por tiempo
let p=await mk(); await p.evaluate(()=>heroStart('hercules',1)); await W8(p,900);
await act(p); await W8(p,60);
ok(await p.evaluate(()=>document.querySelectorAll('[data-mo]').length>=1&&document.getAnimations().some(a=>a.effect.target.closest&&a.effect.target.closest('.hrbar'))),'por tiempo: la etiqueta rueda y el tramo se llena');
await W8(p,800); ok(await clean(p)&&await p.evaluate(()=>document.querySelector('#app .hrrun .ph').textContent==='Ronda 2 de '+draft.hero.rondas&&document.querySelectorAll('#app .hrbar i.on').length===1),'por tiempo: queda "Ronda 2" y un tramo lleno, sin restos');
await p.close();
// en orden
p=await mk(); await p.evaluate(()=>heroStart('odiseo',1)); await W8(p,900);
await act(p); await W8(p,60);
ok(await p.evaluate(()=>{ const l=[...document.querySelectorAll('.ajlist>[data-mo]')]; const c=document.querySelector('#app .hri.cur'); return l.length===1&&c.style.backgroundColor==='transparent'; }),'en orden: el resaltado viaja a la fila siguiente');
await W8(p,900); ok(await p.evaluate(()=>{ const c=document.querySelector('#app .hri.cur'); return document.querySelectorAll('[data-mo]').length===0&&c.style.backgroundColor===''&&[...document.querySelectorAll('#app .hri')].indexOf(c)===1&&getComputedStyle(c).backgroundColor!=='rgba(0, 0, 0, 0)'; }),'en orden: queda resaltada la segunda, con su fondo');
// dos toques seguidos
await act(p); await W8(p,80); await act(p); await W8(p,1000);
ok(await p.evaluate(()=>document.querySelectorAll('[data-mo]').length===0&&document.querySelectorAll('#app .hri.cur').length===1&&[...document.querySelectorAll('#app .hri')].indexOf(document.querySelector('#app .hri.cur'))===3&&document.querySelector('#app .hri.cur').style.backgroundColor===''),'dos toques rápidos: sin restos, resaltada la cuarta');
await p.close();
// amrap
p=await mk(); await p.evaluate(()=>heroStart('hipolita',1)); await W8(p,900);
await act(p); await W8(p,900); ok(await clean(p)&&await p.evaluate(()=>document.querySelector('#app .hrrun .ph').textContent==='1 ronda'),'amrap: el contador rueda y queda "1 ronda"');
await p.close();
// emom: el minuto nuevo
p=await mk(); await p.evaluate(()=>heroStart('aquiles',1)); await W8(p,900);
await p.evaluate(()=>{ draft.t0=Date.now()-59700; }); await W8(p,700);
ok(await p.evaluate(()=>document.querySelector('#app .hrrun .ph').textContent==='Minuto 2'),'emom: pasa al minuto 2');
await W8(p,700); ok(await clean(p)&&await p.evaluate(()=>[...document.querySelectorAll('#app .hri')].indexOf(document.querySelector('#app .hri.cur'))===1&&document.querySelector('#app .hri.cur').style.backgroundColor===''),'emom: resalta el segundo movimiento, sin restos');
await p.close();
// fin: el resultado cuenta hasta su valor y no se repite
p=await mk(); await p.evaluate(()=>{ heroStart('hercules',0); draft.hero.r=draft.hero.rondas-1; draft.t0=Date.now()-(9*60+42)*1000; render(); }); await W8(p,600);
await act(p); await W8(p,700);
const f1=await p.evaluate(()=>document.querySelector('.hrfb').textContent); await W8(p,1300);
const f2=await p.evaluate(()=>({t:document.querySelector('.hrfb').textContent,v:document.querySelector('.hrfb').dataset.v,m:mmss(+document.querySelector('.hrfb').dataset.v)}));
ok(f1!==f2.t&&f2.t===f2.m,'fin de héroe: el tiempo cuenta hasta '+f2.t+' (pasó por '+f1+')');
await p.evaluate(()=>render()); await W8(p,200); ok(await p.evaluate(v=>document.querySelector('.hrfb').textContent===v,f2.t),'al redibujar no vuelve a contar');
await p.close();
// sin movimiento
for(const o of [{rm:true},{ahorro:true}]){ p=await mk(o); await p.evaluate(()=>heroStart('odiseo',1)); await W8(p,700); await act(p); await W8(p,40);
  ok(await p.evaluate(()=>document.querySelectorAll('[data-mo]').length===0&&document.querySelector('#app .hrrun .ph').textContent.startsWith('2 de')),(o.rm?'menos movimiento':'modo ahorro')+': cambia sin animar');
  await p.evaluate(()=>{ draft.hero.it=draft.hero.its.length-1; render(); }); await W8(p,200); await act(p); await W8(p,500);
  ok(await p.evaluate(()=>{ const b=document.querySelector('.hrfb'); return b&&b.textContent===mmss(+b.dataset.v); }),(o.rm?'menos movimiento':'modo ahorro')+': el resultado aparece directo');
  await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
