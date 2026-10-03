// v245: inicio en horizontal — la semana a la izquierda, el día a la derecha (clics reales)
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; HOMEP=null; go('home'); }); await p.waitForTimeout(700); return p; };
  const st=p=>p.evaluate(()=>({view, h:(document.querySelector('#app .splmain>.view>h1')||{}).textContent||null, on:[...document.querySelectorAll('#app .splside .fzr.on')].map(x=>x.dataset.hday||x.dataset.hp||x.dataset.hpp), back:!!document.querySelector('#app .splmain>.view>.pnback'), doc:document.scrollingElement.scrollTop, docH:document.documentElement.scrollHeight-innerHeight, tb:document.getElementById('tbar').classList.contains('on')}));
  const click=async(p,sel)=>{ await p.click(sel); await p.waitForTimeout(700); };
  for(const [W,H] of [[1280,800],[915,412]]){ const p=await open(W,H); const hoy=await p.evaluate(()=>hoyISO()), wk=await p.evaluate(()=>semanaKey(hoyISO()));
    let s=await st(p); T(s.view==='home'&&s.h==='Hoy'&&s.on.length===1&&s.on[0]===hoy,`${W}: arranca en hoy ${JSON.stringify(s)}`);
    T(await p.evaluate(()=>document.querySelectorAll('#app .splside [data-hday]').length===7),`${W}: siete días`);
    T(await p.evaluate(()=>!document.querySelector('#app .hstack')&&!document.querySelector('#app .cols2')&&!document.querySelector('#app .mstat')),`${W}: sin pila ni columnas`);
    T(await p.evaluate(()=>!!document.querySelector('#app .splmain :is([data-go-f],[data-go-b])')&&!!document.querySelector('#app .splmain .hmeta')),`${W}: lo próximo con Empezar y su duración`);
    T(s.docH<=1,`${W}: la página no se desplaza (${s.docH})`);
    // cambiar de día: la lista queda (mismo nodo), cambia el panel
    const other=addD=>p.evaluate(n=>{ const w=semanaKey(hoyISO()); const L=[...Array(7)].map((_,i)=>addDays(w,i)); return L[n]; },addD);
    await p.evaluate(()=>{ window._side=document.querySelector('#app .splside .hdays'); });
    const d0=await other(0), d6=await other(6);
    const tgt=d0!==hoy?d0:d6; await click(p,`#app [data-hday="${tgt}"]`); s=await st(p);
    T(s.on[0]===tgt&&s.h!=='Hoy',`${W}: otro día en el panel ${JSON.stringify(s)}`);
    T(await p.evaluate(()=>window._side===document.querySelector('#app .splside .hdays')),`${W}: la lista no se redibuja`);
    // pasado: sesión en el panel y vuelta
    const past=await p.evaluate(()=>{ const h=hoyISO(), w=semanaKey(h); for(let i=0;i<7;i++){ const f=addDays(w,i); if(f<h&&SESS.some(x=>x.fecha===f)) return f; } return null; });
    if(past){ await click(p,`#app [data-hday="${past}"]`); const n=await p.evaluate(()=>document.querySelectorAll('#app .splmain .swr').length); T(n>0,`${W}: sesiones del día pasado (${n})`);
      await click(p,'#app .splmain .swf[data-open]'); s=await st(p); T(s.view==='home'&&s.back&&s.on[0]===past,`${W}: sesión en el panel ${JSON.stringify(s)}`);
      await click(p,'#app .splmain .pnback'); s=await st(p); T(!s.back&&s.on[0]===past,`${W}: volver al día ${JSON.stringify(s)}`); }
    // futuro con fuerza: lista de ejercicios
    const futF=await p.evaluate(()=>{ const h=hoyISO(), w=semanaKey(h), T=template(); for(let i=0;i<7;i++){ const f=addDays(w,i); if(f>h&&T[i].f) return f; } return null; });
    if(futF){ await click(p,`#app [data-hday="${futF}"]`); T(await p.evaluate(()=>document.querySelectorAll('#app .splmain .hplan .fzlist>div').length>2),`${W}: día que viene con sus ejercicios`); }
    // resumen
    await click(p,'#app [data-hp="res"]'); s=await st(p); T(s.view==='home'&&s.h==='Resumen'&&s.on[0]==='res',`${W}: resumen en el panel ${JSON.stringify(s)}`);
    T(await p.evaluate(()=>!!document.querySelector('#app .splmain>.view>.topbar>.segx')),`${W}: Semana/Mes en la fila del título`);
    await p.evaluate(()=>{ const b=document.querySelector('#app .splmain #perMenu'); if(b) b.click(); }); await p.waitForTimeout(400); await p.evaluate(()=>{ const o=document.querySelectorAll('.cmpop [data-cm]')[1]; if(o) o.click(); }); await p.waitForTimeout(700); s=await st(p); T(s.view==='home'&&s.h==='Resumen'&&await p.evaluate(()=>resumenWk===addDays(semanaKey(hoyISO()),-7)),`${W}: semana anterior sin salir ${JSON.stringify(s)}`);
    // programas → programa → volver
    await click(p,'#app [data-hp="prog"]'); s=await st(p); T(s.view==='home'&&s.h==='Rutinas'&&s.on[0]==='prog',`${W}: programas en el panel ${JSON.stringify(s)}`);
    await click(p,'#app .splmain [data-prog]'); s=await st(p); T(s.view==='home'&&s.back&&s.h==='Torso y pierna en casa',`${W}: la rutina por defecto en el panel ${JSON.stringify(s)}`);
    const sk=await p.evaluate(()=>new Promise(r=>setTimeout(()=>r(document.querySelectorAll('#app .splmain .prday.sk').length),1600))); T(sk===0,`${W}: semanas del programa cargadas (${sk})`);
    await click(p,'#app .splmain .pnback'); s=await st(p); T(s.h==='Rutinas'&&!s.back,`${W}: volver a rutinas ${JSON.stringify(s)}`);
    await click(p,'#app .splmain [data-prog]:not([data-prog="rot"])'); s=await st(p); T(s.view==='home'&&s.back&&s.h&&s.h!=='Rutinas',`${W}: otra rutina en el panel ${JSON.stringify(s)}`);
    T(await p.evaluate(()=>!document.querySelector('#app .splmain [data-hero]')),`${W}: los desafíos ya no están en Rutinas`);
    // tocar Semana en el riel vuelve a hoy
    await click(p,'nav.bottom [data-tab="home"]'); s=await st(p); T(s.h==='Hoy'&&s.on[0]===hoy,`${W}: Semana vuelve a hoy ${JSON.stringify(s)}`);
    // hoy: fila hecha abre la sesión en el panel
    const hd=await p.evaluate(()=>!!document.querySelector('#app .splmain .swf[data-open]'));
    if(hd){ await click(p,'#app .splmain .swf[data-open]'); s=await st(p); T(s.view==='home'&&s.back,`${W}: lo hecho hoy se abre en el panel`); await click(p,'#app .splmain .pnback'); }
    // Empezar sigue arrancando la sesión
    const gf=await p.evaluate(()=>!!document.querySelector('#app .splmain [data-go-f]'));
    await click(p,'#app .splmain '+(gf?'[data-go-f]':'[data-go-b]')); s=await st(p); T(gf?(s.view==='fuerza'&&await p.evaluate(()=>!!draft)):(s.view==='bici'&&await p.evaluate(()=>bike.running)),`${W}: Empezar arranca la sesión ${JSON.stringify(s)}`);
    await p.evaluate(()=>{ go('home'); }); await p.waitForTimeout(800); s=await st(p);
    T(await p.evaluate(()=>!!document.querySelector('#app .splmain .hero.lv')&&!!document.querySelector('#app .splside .hdots.lv')),`${W}: la sesión en curso arriba y el punto en hoy`);
    await p.evaluate(()=>{ draft=null; closeRest(); if(bike.running){ try{ bikeDiscard(); }catch(e){ bike.running=false; } } try{ liveClear(); }catch(e){} vivoSave(); });
    // desplazar el panel: el título no se mueve, sin barra de vidrio
    await p.evaluate(()=>{ HOMEP={d:hoyISO(),p:'res'}; render(); }); await p.waitForTimeout(700);
    const r=await p.evaluate(()=>{ const M=document.querySelector('#app .splmscr'), h=document.querySelector('#app .splmain>.view>h1'); const t0=h.getBoundingClientRect().top; M.scrollTop=200; return {dt:h.getBoundingClientRect().top-t0,s:M.scrollTop,doc:document.scrollingElement.scrollTop}; });
    await p.waitForTimeout(300); T(r.dt===0&&r.s>0&&r.doc===0,`${W}: panel con desplazamiento propio ${JSON.stringify(r)}`); T(!(await st(p)).tb,`${W}: sin barra de vidrio`);
    await p.close(); }
  // vertical: igual que siempre
  { const p=await open(390,844); T(await p.evaluate(()=>!document.querySelector('#app .spl')&&!!document.querySelector('#app .hwk')&&!!document.querySelector('#app .hstack')),'vertical: la semana de siempre');
    await click(p,'#app .hwk [data-resumen]'); T(await p.evaluate(()=>view==='resumen'),'vertical: Resumen abre su pantalla'); await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
