const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const mk=async(o={})=>{ const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:o.rm?'reduce':'no-preference'}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(900);
  await p.evaluate(o=>{ PERF.modo=o.ahorro?'ahorro':'max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); CFG.movNo=null; const h=hoyISO(); for(let i=SESS.length-1;i>=0;i--) if(SESS[i].fecha===h) SESS.splice(i,1); go('home'); },o); await p.waitForTimeout(400); return p; };
const W8=(p,ms)=>p.waitForTimeout(ms), G=p=>p.evaluate(()=>document.querySelectorAll('[data-mo]').length);
// ---------- cardio ----------
let p=await mk();
await p.evaluate(()=>{ bike.modo='bici'; bike.sel='Bloques 4×4'; bkStart(); go('bici'); }); await W8(p,1200);
const k0=await p.evaluate(()=>document.querySelector('#imK').getBoundingClientRect().left);
await p.evaluate(()=>{ bike.ph++; startPhase(); }); await W8(p,90);
const mid=await p.evaluate(()=>({g:document.querySelectorAll('[data-mo]').length,a:document.getAnimations().length,k:document.querySelector('#imK').getBoundingClientRect().left}));
ok(mid.g>=3&&mid.a>=4,'cambio de fase: ruedan nombre, tiempo y zona '+JSON.stringify(mid));
await W8(p,900);
const aft=await p.evaluate(()=>({g:document.querySelectorAll('[data-mo]').length,ph:document.querySelector('#app .bigtimer .ph').textContent,t:document.querySelector('#bkT').textContent,k:document.querySelector('#imK').getBoundingClientRect().left,z:document.querySelector('#imZ').textContent,phs:document.querySelectorAll('#app .bigtimer .ph').length}));
ok(aft.g===0&&aft.phs===1,'al terminar no queda ningún fantasma '+JSON.stringify(aft));
ok(aft.ph==='Fuerte'&&/^[34]:\d\d$/.test(aft.t)&&/Z4/.test(aft.z),'quedan los valores de la fase nueva');
ok(mid.k>k0+2&&mid.k<aft.k-2,'el indicador de intensidad viaja (no salta) '+[k0,mid.k,aft.k].map(Math.round).join('→'));
// nivel con +: rueda y queda bien
await p.evaluate(()=>document.querySelector('[data-niv="1"]').click()); await W8(p,60);
ok(await p.evaluate(()=>document.querySelectorAll('[data-mo]').length>=1&&document.querySelector('#lvNiv').textContent===String(bike.niv)),'nivel: rueda y muestra el nuevo');
// fases seguidas muy rápido: nada se acumula
await p.evaluate(()=>{ for(let i=0;i<3;i++){ bike.ph++; startPhase(); } }); await W8(p,1000);
ok(await p.evaluate(()=>document.querySelectorAll('[data-mo]').length===0&&document.querySelectorAll('#app .bigtimer .ph').length===1&&document.querySelector('#app .bigtimer .ph').textContent===PHN[curProt().ph[bike.ph][0]]),'tres fases seguidas: sin restos y con la fase correcta');
// fin: el anillo se llena y no se repite
await p.evaluate(()=>{ bike.t0=Date.now()-40*60000; bike.ph=curProt().ph.length-1; bike.phEnd=Date.now()+50; }); await W8(p,700);
const r1=await p.evaluate(()=>{ const w=document.querySelectorAll('.card[data-resumen] .wkr')[1]; return {v:w.querySelector('b').textContent,d:w.querySelector('.ar').getAttribute('stroke-dasharray')}; });
await W8(p,1400);
const r2=await p.evaluate(()=>{ const w=document.querySelectorAll('.card[data-resumen] .wkr')[1]; return {v:w.querySelector('b').textContent,d:w.querySelector('.ar').getAttribute('stroke-dasharray'),g:document.querySelectorAll('[data-mo]').length}; });
ok(parseInt(r2.v)===parseInt(r1.v)+1&&parseFloat(r2.d)>parseFloat(r1.d)&&r2.g===0,'fin: el anillo de cardio suma una sesión '+JSON.stringify([r1,r2]));
await p.evaluate(()=>document.querySelector('[data-cfat="2"]').click()); await W8(p,300);
ok(await p.evaluate(v=>{ const w=document.querySelectorAll('.card[data-resumen] .wkr')[1]; return parseInt(w.querySelector('b').textContent)===parseInt(v)&&parseFloat(w.querySelector('.ar').getAttribute('stroke-dasharray'))>0; },r2.v),'al elegir esfuerzo no se vuelve a vaciar');
await p.close();
// ---------- fuerza ----------
p=await mk(); await p.evaluate(()=>go('fuerza')); await W8(p,500); await p.evaluate(()=>document.querySelector('#goFz').click()); await W8(p,900);
const c0=await p.evaluate(()=>document.querySelector('#app .tbtitle small>.num:not(#fzT)').textContent);
await p.evaluate(()=>document.querySelector('#app .sr.nx .ok').click()); await W8(p,60);
ok(await p.evaluate(()=>document.getAnimations().some(a=>a.effect&&a.effect.target&&a.effect.target.classList&&a.effect.target.classList.contains('ok'))),'serie hecha: el ✓ hace un pulso');
await W8(p,700);
const c1=await p.evaluate(()=>({t:document.querySelector('#app .tbtitle small>.num:not(#fzT)').textContent,g:document.querySelectorAll('[data-mo]').length}));
ok(c1.g===0&&c1.t!==c0&&parseInt(c1.t)===parseInt(c0)+1,'el contador de series rueda y queda bien '+c0+'→'+c1.t);
await p.evaluate(()=>{ closeRest(); document.querySelector('#app .fznx').click(); }); await W8(p,80);
ok(await p.evaluate(()=>document.querySelectorAll('#excard [data-mo]').length>0&&!document.querySelectorAll('#excard>[data-mo]').length),'siguiente ejercicio: rueda lo que cambia y la tarjeta queda (v243)');
await W8(p,700);
ok(await p.evaluate(()=>{ const c=document.querySelector('#excard'); return document.querySelectorAll('[data-mo]').length===0&&c.style.overflow===''&&cur===1&&c.querySelector('h2').textContent.length>2; }),'queda el ejercicio nuevo, sin restos ni recortes');
ok(await p.evaluate(()=>{ const ch=document.querySelector('#app .exnav [data-go="1"]'), r=ch.closest('.exnav').getBoundingClientRect(), c=ch.getBoundingClientRect(); return c.left>=r.left-1&&c.right<=r.right+1; }),'el riel deja el actual a la vista');
// ir y volver rápido
await p.evaluate(()=>{ document.querySelector('#app .fznx').click(); }); await W8(p,40); await p.evaluate(()=>{ document.querySelector('#app [data-nav="-1"]').click(); }); await W8(p,900);
ok(await p.evaluate(()=>document.querySelectorAll('[data-mo]').length===0&&cur===1&&document.querySelectorAll('#excard .exhead').length===1),'ida y vuelta rápida: queda uno solo y bien');
await p.close();
// ---------- movilidad ----------
p=await mk(); await p.evaluate(()=>startMov({full:true})); await W8(p,900);
let lap=0; for(let i=0;i<8&&!lap;i++){ const r=await p.evaluate(()=>{ const need=MOV[mov.plan.items[mov.i]].lados&&!mov.lado; movNext(); return need?1:0; }); await W8(p,700); if(r) lap=1; }
ok(lap&&await p.evaluate(()=>mov.lado===1&&/otro lado/.test(document.querySelector('#app .mvcard .exmeta').textContent)&&document.querySelector('#mvPhoto').classList.contains('l2')&&getComputedStyle(document.querySelector('#mvPhoto .photo img')).transform.startsWith('matrix(-1')),'otro lado: la foto queda espejada');
const i0=await p.evaluate(()=>mov.i); await p.evaluate(()=>movNext()); await W8(p,80);
ok(await p.evaluate(()=>document.querySelectorAll('.mvcard>[data-mo]').length>0&&!document.querySelector('.mvcard>[data-mo].xport')),'postura nueva: pasa de página (los controles quietos)');
await W8(p,700);
ok(await p.evaluate(i0=>mov.i===i0+1&&document.querySelectorAll('[data-mo]').length===0&&!document.querySelector('#mvPhoto').classList.contains('l2'),i0),'postura nueva sin restos y sin espejo');
await p.close();
// ---------- sin movimiento: pedido del sistema y modo ahorro ----------
for(const o of [{rm:true},{ahorro:true}]){ p=await mk(o);
  await p.evaluate(()=>{ bike.modo='bici'; bike.sel='Bloques 4×4'; bkStart(); go('bici'); }); await W8(p,900);
  await p.evaluate(()=>{ bike.ph++; startPhase(); }); await W8(p,40);
  ok(await p.evaluate(()=>document.querySelectorAll('[data-mo]').length===0&&document.querySelector('#app .bigtimer .ph').textContent==='Fuerte'),(o.rm?'menos movimiento':'modo ahorro')+': cambia sin animar');
  await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
