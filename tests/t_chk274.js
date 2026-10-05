// v270: notificación en vivo: textos cortos (ahora / sigue), dos botones, badge sin ícono grande, silenciosa salvo en los cambios importantes
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ window.__N=[]; LIVE.reg={showNotification:async(t,o)=>{ __N.push(Object.assign({t},o,{actions:(o.actions||[]).map(a=>a.title)})); },getNotifications:async()=>[]}; CFG.live=true; decir=()=>{}; beep=()=>{}; CELON=false; });
  const N=async(f,ms=300)=>{ await p.evaluate(()=>{ __N.length=0; }); await p.evaluate(f); await p.waitForTimeout(ms); await p.evaluate(()=>livePush(false)); return p.evaluate(()=>__N.slice()); };
  const last=r=>r[r.length-1]||{}; const todas=[];
  const forma=(n,tag)=>{ todas.push(n); T(n.badge==='iconos/ic_stat_entreno.png'&&!n.icon,`${tag}: badge de la barra y sin ícono grande`); T(n.t.length<=32&&(n.body||'').length<=40,`${tag}: textos cortos (${n.t.length}/${(n.body||'').length}) · ${n.t} | ${n.body}`); T(n.actions.length<=2,`${tag}: dos botones como máximo`); };
  let r=await N(()=>{ go('fuerza'); document.querySelector('#goFz').click(); livePush(true); },900); let n=last(r); forma(n,'serie');
  T(/^.+ · (serie 1 de \d+|1\/\d+)$/.test(n.t)&&/^Sigue: /.test(n.body)&&n.actions.join()==='Serie hecha,Siguiente'&&n.silent===true&&!n.renotify,'serie: lo de ahora, lo que sigue, Serie hecha y Siguiente, silenciosa · '+JSON.stringify(n));
  r=await N(()=>{ liveAction('set'); },600); n=last(r); forma(n,'descanso');
  T(/^Descanso · \d+:\d\d$/.test(n.t)&&/^Sigue: serie 2 de \d+$/.test(n.body)&&n.actions.join()==='+30 s,Saltar'&&n.silent===true,'descanso: cuenta, lo que sigue, +30 s y Saltar, silenciosa · '+JSON.stringify(n));
  r=await N(()=>{ restEnd=Date.now()-500; }); n=last(r); T(n.t==='Descanso · listo'&&n.silent===false&&n.renotify===true,'fin del descanso: vuelve a sonar · '+JSON.stringify(n));
  r=await N(()=>{}); T(r.length===0,'sin cambios no vuelve a mostrarse · '+r.length);
  r=await N(()=>{ draft=null; go('home'); }); n=last(r); forma(n,'fin'); T(n.t==='Sesión terminada'&&/^Fuerza · \d+ min$/.test(n.body)&&n.silent===false&&n.renotify===true&&!n.actions.length,'fin de la sesión: suena · '+JSON.stringify(n));
  r=await N(()=>{ go('fuerza'); document.querySelector('#goFz').click(); livePush(true); },900); T(last(r).t&&!/terminada/.test(last(r).t),'otra sesión de fuerza');
  r=await N(()=>{ document.querySelector('#discard').click(); },600); T(!r.some(x=>/terminada/.test(x.t)),'descartar no avisa "terminada" · '+JSON.stringify(r.map(x=>x.t)));
  await p.evaluate(()=>{ try{ document.querySelector('#utoast')&&document.querySelector('#utoast').remove(); }catch(e){} });
  r=await N(()=>{ bike.modo='bici'; bike.sel='Bloques 4×4'; bkStart(); go('bici'); },900); n=last(r); forma(n,'bici');
  T(/^Calentar · \d+:\d\d$/.test(n.t)&&/^Sigue: fuerte · nivel \d+$/.test(n.body)&&n.actions.join()==='Pausa,Saltar fase'&&n.silent===true,'bici: fase y tiempo, lo que sigue, silenciosa al arrancar · '+JSON.stringify(n));
  r=await N(()=>{ liveAction('phase'); },500); T(r.some(x=>x.t.startsWith('Fuerte · ')&&x.silent===false&&x.renotify===true),'bici: el cambio de fase suena · '+JSON.stringify(r.map(x=>[x.t,x.silent])));
  T(r.filter(x=>x.silent===false).length===1,'bici: suena una sola vez por cambio');
  r=await N(()=>{ liveAction('pause'); },400); n=last(r); T(/ · pausa$/.test(n.t)&&n.actions[0]==='Seguir'&&n.silent===true,'bici: pausa, silenciosa · '+JSON.stringify(n));
  r=await N(()=>{ finishBike(); },600); n=last(r); T(n.t==='Sesión terminada'&&/^Cardio · /.test(n.body)&&n.silent===false,'bici: fin de la sesión suena · '+JSON.stringify(n));
  r=await N(()=>{ go('home'); startMov('full'); },1200); n=last(r);
  if(n.t){ forma(n,'movilidad'); T(/^Movilidad · 1 de \d+ · \d+:\d\d$/.test(n.t)&&/^Sigue: /.test(n.body)&&n.actions.join()==='Pausa,Siguiente','movilidad: posición, lo que sigue · '+JSON.stringify(n));
    /* si la primera postura es de dos lados, «siguiente» pasa primero al otro lado (también suena) y recién después a la postura 2 */
    r=await N(()=>{ liveAction('phase'); },500); if(!r.some(x=>/^Movilidad · 2 de /.test(x.t))){ T(r.some(x=>/^Movilidad · 1 de /.test(x.t)&&x.silent===false),'movilidad: el otro lado suena · '+JSON.stringify(r.map(x=>[x.t,x.silent]))); r=await N(()=>{ liveAction('phase'); },500); }
    T(r.some(x=>/^Movilidad · 2 de /.test(x.t)&&x.silent===false),'movilidad: la postura nueva suena · '+JSON.stringify(r.map(x=>[x.t,x.silent]))); }
  else T(false,'movilidad: no arrancó · '+JSON.stringify(r));
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
