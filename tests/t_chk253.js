// v251: cada sesión arranca con la isla arriba; flotando, se pega a la esquina más cercana
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const ctxOpen=async(W,H)=>{ const ctx=await b.newContext({viewport:{width:W,height:H}}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; }); return {ctx,p}; };
  const start=p=>p.evaluate(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); histTab='res'; go('hist'); });
  const M=p=>p.evaluate(()=>{ const m=document.getElementById('minibar'), r=m.getBoundingClientRect(); return {mode:miniMode(), cls:m.className, l:r.left, t:r.top, r:r.right, b:r.bottom, w:innerWidth, h:innerHeight, pos:MINI.pos}; });
  const drag=async(p,from,path,stepMs=16)=>{ await p.mouse.move(from.x,from.y); await p.mouse.down(); for(const [x,y] of path){ await p.mouse.move(x,y,{steps:6}); await W8(p,stepMs); } await p.mouse.up(); };
  { const {ctx,p}=await ctxOpen(390,844);
    // una preferencia vieja de tarjeta no pisa el arranque arriba
    await p.evaluate(()=>{ localStorage.setItem(LSK+'.miniMode',JSON.stringify({m:'card',side:'r',ty:.5,ses:'b0'})); MINI.mode=null; MINI.ses=null; }); await start(p); await W8(p,1200);
    let m=await M(p); T(m.mode==='isle'&&/isle/.test(m.cls)&&Math.round(m.t)===14,'sesión nueva: arranca con la isla arriba');
    // la saco arrastrando y la suelto a la izquierda, a media altura → esquina más cercana
    const c={x:(m.l+m.r)/2-30,y:(m.t+m.b)/2}; await drag(p,c,[[c.x,c.y+60],[c.x-80,c.y+220],[60,330],[60,340]],60); await W8(p,900);
    m=await M(p); T(m.mode==='card','arrastrada hacia abajo pasa a flotar'); T(m.pos&&m.pos[0]===0&&m.pos[1]===0&&m.l<40&&m.t>=60,`suelta arriba a la izquierda: se pega a esa esquina, debajo de volver (${Math.round(m.l)},${Math.round(m.t)})`);
    // lanzada hacia abajo a la derecha
    const c2={x:(m.l+m.r)/2,y:(m.t+m.b)/2}; await p.mouse.move(c2.x,c2.y); await p.mouse.down(); for(let i=1;i<=6;i++){ await p.mouse.move(c2.x+i*14,c2.y+i*45); await W8(p,10); } await p.mouse.up(); await W8(p,900);
    m=await M(p); T(m.pos[0]===1&&m.pos[1]===1&&m.r>m.w-40,'lanzada hacia abajo a la derecha: esa esquina');
    T(m.b<=m.h-86+2,'abajo respeta la barra');
    // sigue igual en otra pantalla de la misma sesión
    await p.evaluate(()=>go('arbol')); await W8(p,1200); T((await M(p)).mode==='card','otra pantalla, misma sesión: queda flotando');
    // y al recargar a mitad de la sesión
    T(await p.evaluate(()=>{ const o=JSON.parse(localStorage.getItem(LSK+'.miniMode')); return o.m==='card'&&o.ses===miniSesKey(); }),'lo recuerda para esta sesión');
    // sesión nueva: otra vez arriba
    await p.evaluate(()=>{ bike.running=false; miniRender(); bike.t0=0; }); await W8(p,300); await start(p); await W8(p,1200);
    m=await M(p); T(m.mode==='isle'&&Math.round(m.t)===14,'la sesión siguiente vuelve a arrancar arriba');
    // escondido en el costado y vuelto a sacar: cae en una esquina
    await p.evaluate(()=>{ MINI.side='r'; MINI.ty=.7; miniSetMode('tab'); }); await W8(p,900); await p.evaluate(()=>document.getElementById('minibar').click()); await W8(p,900);
    m=await M(p); T(m.mode==='card'&&m.pos[0]===1&&m.pos[1]===1,'del costado sale a la esquina de su lado');
    await ctx.close(); }
  { const {ctx,p}=await ctxOpen(1180,820); await start(p); await W8(p,1200); let m=await M(p); T(m.mode==='isle'&&m.r>m.w-60&&m.t<40,'horizontal: arranca con la isla en la fila del título');
    await p.evaluate(()=>{ MINI.pos=[0,0]; miniSetMode('card'); }); await W8(p,900); m=await M(p); T(m.t>=74,'horizontal: la esquina de arriba queda debajo de la fila del título ('+Math.round(m.t)+')'); await ctx.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
