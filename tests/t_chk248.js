// v244: interacción real con los paneles (clics), horizontal y vertical
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; }); return p; };
  const st=p=>p.evaluate(()=>({view, h:(document.querySelector('#app .splmain>.view>h1')||{}).textContent||null, on:[...document.querySelectorAll('#app .splside .fzr.on')].map(x=>x.textContent.trim().slice(0,12)), back:!!document.querySelector('#app .splmain>.view>.pnback'), rows:document.querySelectorAll('#app .splmain [data-prog]').length, heroes:document.querySelectorAll('#app .splmain [data-hero]').length }));
  const click=async(p,sel)=>{ await p.click(sel); await p.waitForTimeout(700); };
  { const p=await open(1280,800);
    for(const [v,a] of [['fuerza','f'],['bici','b'],['estirar','m']]){
      await p.evaluate(v=>{ draft=null; bike.running=false; fzPick=null; bkPick=null; estPick=null; PANE.f=PANE.b=PANE.m=null; go(v); },v); await p.waitForTimeout(900);
      await click(p,'#app .splside [data-goprog]'); let s=await st(p); T(s.view===v,`${v}: Programas no navega (${s.view})`); T(s.h==='Rutinas'&&s.rows>0,`${v}: lista de programas en el panel ${JSON.stringify(s)}`); T(s.on.length===1&&/Rutinas/.test(s.on[0]),`${v}: fila Programas marcada ${s.on}`);
      await click(p,'#app .splmain [data-prog]'); s=await st(p); T(s.view===v&&s.back&&s.h&&s.h!=='Rutinas',`${v}: programa abierto en el panel ${JSON.stringify(s)}`);
      const wk=await p.evaluate(()=>new Promise(r=>setTimeout(()=>r(document.querySelectorAll('#app .splmain .prday.sk').length),1500))); T(wk===0,`${v}: semanas del programa cargadas (${wk} esqueletos)`);
      await click(p,'#app .splmain .pnback'); s=await st(p); T(s.h==='Rutinas'&&!s.back,`${v}: volver del programa a la lista ${JSON.stringify(s)}`);
      await click(p,'#app .splside [data-gohero]'); s=await st(p); T(s.view===v&&s.h==='Desafíos'&&s.heroes>0,`${v}: héroes en el panel ${JSON.stringify(s)}`);
      await click(p,'#app .splmain [data-hero]'); s=await st(p); T(s.back&&s.h&&s.h!=='Desafíos',`${v}: héroe abierto ${JSON.stringify(s)}`);
      await click(p,'#app .splside [data-gohero]'); s=await st(p); T(s.h==='Desafíos',`${v}: tocar Héroes otra vez vuelve a la grilla ${JSON.stringify(s)}`);
      await click(p,'#app .splside .fzr:not([data-goprog]):not([data-gohero])'); s=await st(p); T(s.view===v&&s.h&&s.h!=='Desafíos'&&!s.back,`${v}: volver a una sesión ${JSON.stringify(s)}`);
      const go=await p.evaluate(()=>!!document.querySelector('#app .splmain :is(#goFz,#goBike,#estGo)')); T(go,`${v}: botón empezar presente`);
    }
    // el título del panel no se mueve al desplazar; la barra de vidrio no aparece
    await p.evaluate(()=>{ todoSel=SESS.find(x=>x.kind==='fuerza').id; histEx='todo'; go('stat'); }); await p.waitForTimeout(900);
    const r=await p.evaluate(()=>{ const M=document.querySelector('#app .splmscr'); const h=document.querySelector('#app .splmain>.view>h1'); const t0=h.getBoundingClientRect().top; M.scrollTop=200; const t1=h.getBoundingClientRect().top; return {M:!!M, dt:t1-t0, s:M.scrollTop, doc:document.scrollingElement.scrollTop, tb:document.getElementById('tbar').classList.contains('on')}; });
    await p.waitForTimeout(300); T(r.M&&r.dt===0&&r.s>0&&r.doc===0,`sesiones: panel con desplazamiento propio ${JSON.stringify(r)}`);
    const tb=await p.evaluate(()=>document.getElementById('tbar').classList.contains('on')); T(!tb,'sesiones: sin barra de vidrio al desplazar el panel');
    // otra sesión: el panel vuelve arriba
    await p.evaluate(()=>{ todoSel=SESS.filter(x=>x.kind==='fuerza')[1].id; render(); }); await p.waitForTimeout(500); const s2=await p.evaluate(()=>document.querySelector('#app .splmscr').scrollTop); T(s2===0,`sesiones: otra sesión arranca arriba (${s2})`);
    // Ajustes: bajada fuera del desplazamiento
    await p.evaluate(()=>{ ajSec='equipo'; go('ajustes'); }); await p.waitForTimeout(900); const a=await p.evaluate(()=>{ const s=document.querySelector('#app .ajmain>.ajmsub'); return !!s&&!s.closest('.stag'); }); T(a,'ajustes: la bajada de Equipo queda con el título');
    await p.close(); }
  // vertical: Programas y Héroes siguen abriendo su pantalla
  { const p=await open(390,844);
    await p.evaluate(()=>{ draft=null; go('fuerza'); }); await p.waitForTimeout(900); await click(p,'#app [data-goprog]'); let v=await p.evaluate(()=>view); T(v==='programas',`vertical: Programas abre su pantalla (${v})`);
    await p.evaluate(()=>{ go('fuerza'); }); await p.waitForTimeout(900); await click(p,'#app [data-gohero]'); v=await p.evaluate(()=>view); T(v==='desafios',`vertical: Héroes abre su pantalla (${v})`);
    const sub=await p.evaluate(()=>{ ajSec='equipo'; go('ajustes'); return 1; }); await p.waitForTimeout(700); const q=await p.evaluate(()=>document.querySelectorAll('.ajmsub').length); T(q===0,'vertical: sin mover la bajada');
    await p.close(); }
  console.log(bad===0&&!errs.length?'TODO OK':'FALLAS '+bad,'ok',ok); console.log('ERRS',JSON.stringify(errs.slice(0,4))); await b.close(); })();
