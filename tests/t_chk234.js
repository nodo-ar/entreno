const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html', THR=+(process.argv[3]||6);
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const mk=async(o={})=>{ const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},deviceScaleFactor:1}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(900);
  await p.evaluate(o=>{ if(o.max){ PERF.modo='max'; perfApply(); } CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); go('home'); },o); await p.waitForTimeout(700);
  if(o.thr){ const c=await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate',{rate:o.thr}); } return p; };
const fit=p=>p.evaluate(()=>{ const n=document.querySelector('#nav'), i=n.querySelector('.ind').getBoundingClientRect(), s=n.querySelector('button[aria-selected="true"]').getBoundingClientRect(); return {dx:Math.round(i.left-s.left),dw:Math.round(i.width-s.width),tab:view}; });
const tabs=['home','hist','arbol','vos'], W8=(p,ms)=>p.waitForTimeout(ms);
for(const o of [{thr:1},{thr:THR},{thr:THR,max:true},{thr:1,vp:{width:320,height:568}},{thr:THR,vp:{width:412,height:915},max:true}]){ const p=await mk(o); const tag=`${o.vp?o.vp.width:390}px cpu×${o.thr}${o.max?' efectos':''}`;
  let worst={dx:0,dw:0}, fails=[];
  for(const a of tabs) for(const t of tabs){ if(a===t) continue; await p.evaluate(a=>{ if(view!==a) go(a); },a); await W8(p,900);
    await p.evaluate(t=>document.querySelector(`nav.bottom button[data-tab="${t}"]`).click(),t); await W8(p,1600);
    const f=await fit(p); if(Math.abs(f.dx)>1||Math.abs(f.dw)>1) fails.push(`${a}→${t} ${JSON.stringify(f)}`); if(Math.abs(f.dx)>Math.abs(worst.dx)) worst=f; }
  ok(!fails.length,`${tag}: la pastilla calza en los 12 cambios de pestaña `+fails.slice(0,4).join(' | '));
  // tocando rápido
  await p.evaluate(()=>{ ['hist','arbol','vos','home','arbol'].forEach((t,i)=>setTimeout(()=>document.querySelector(`nav.bottom button[data-tab="${t}"]`).click(),i*90)); }); await W8(p,2600);
  const f=await fit(p); ok(Math.abs(f.dx)<=1&&Math.abs(f.dw)<=1,`${tag}: tocando rápido termina calzada `+JSON.stringify(f));
  // desde una sesión y de vuelta
  await p.evaluate(()=>{ go('arbol'); }); await W8(p,900); await p.evaluate(()=>{ bike.modo='bici'; bike.sel='Bloques 4×4'; bkStart(); go('bici'); }); await W8(p,900); await p.evaluate(()=>go('home')); await W8(p,1600);
  const g=await fit(p); ok(Math.abs(g.dx)<=1&&Math.abs(g.dw)<=1,`${tag}: al volver de una sesión `+JSON.stringify(g));
  await p.evaluate(()=>{ try{ bikeDiscard&&bikeDiscard(); }catch(e){} }); await p.close(); }
// segundo plano en medio del cambio y fuentes/tamaño
{ const p=await mk({thr:1}); await p.evaluate(()=>{ document.querySelector('nav.bottom button[data-tab="arbol"]').click(); }); await p.evaluate(()=>new Promise(r=>setTimeout(r,60)));
  await p.setViewportSize({width:360,height:740}); await W8(p,1400); const f=await fit(p); ok(Math.abs(f.dx)<=1&&Math.abs(f.dw)<=1,'cambio de tamaño a mitad del cambio '+JSON.stringify(f));
  await p.evaluate(()=>{ document.documentElement.style.fontSize='18px'; }); await W8(p,1200); const g=await fit(p); ok(Math.abs(g.dx)<=1&&Math.abs(g.dw)<=1,'texto más grande '+JSON.stringify(g)); await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
