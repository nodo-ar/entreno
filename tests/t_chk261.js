// v258: menús flotantes sobrios y claros
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const open=async(W,H,sch)=>{ const ctx=await b.newContext({viewport:{width:W||390,height:H||844},colorScheme:sch||'dark'}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await W8(p,300); await seed(p); await W8(p,400);
    await p.evaluate(sch=>{ PERF.modo='max'; perfApply(); CFG.tema=sch||'dark'; applyTema(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; },sch); p.ctx=ctx; return p; };
  const tap=async(p,sel,t)=>{ const bb=await p.evaluate(s=>{ const e=[...document.querySelectorAll(s)].find(x=>x.getClientRects().length); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; },sel); if(!bb) return false; await p.mouse.click(bb.x,bb.y); await W8(p,t||800); return true; };
  const menu=p=>p.evaluate(()=>{ const po=document.querySelector('.pop:not(.out)'); if(!po) return null; const bg=getComputedStyle(po).backgroundColor; const a=/rgba?\(([^)]+)\)/.exec(bg); const al=a?(a[1].split(/[ ,\/]+/).filter(Boolean)[3]):1;
    return {cls:po.className, alpha:al==null?1:+al, rows:[...po.querySelectorAll(':scope > *')].map(e=>e.classList.contains('psep')?'—':e.classList.contains('pmi')?(e.querySelector('b')||e).textContent.trim():'').filter(Boolean), smalls:[...po.querySelectorAll('.pmi small')].map(e=>e.textContent.trim()), icbg:[...po.querySelectorAll('.pmi .ic')].map(e=>getComputedStyle(e).backgroundColor), txt:po.innerText}; });
  const transp=c=>/rgba\(0, 0, 0, 0\)|transparent/.test(c);
  for(const sch of ['dark','light']){
    // ⋯ de la sesión
    { const p=await open(390,844,sch); await p.evaluate(()=>{ fzSel=nextTipo(); nuevoDraft(fzSel,{}); go('fuerza'); }); await W8(p,1100);
      await tap(p,'#fzMore'); let m=await menu(p); T(m&&m.alpha>=.97,`${sch} · el menú es casi opaco (${m&&m.alpha})`);
      T(m&&m.rows.join('|')==='Juntar en superseries|Cómo funciona|—|Descartar sesión',`${sch} · ⋯ de la sesión: Descartar aparte (${m&&m.rows.join('|')})`);
      T(m&&m.icbg.every(transp),`${sch} · comandos sin baldosa (${m&&m.icbg[0]})`);
      await p.keyboard.press('Escape'); await p.evaluate(()=>popClose(true)); await W8(p,400);
      await tap(p,'#exMore'); m=await menu(p); T(m&&m.rows.join('|')==='Cambiar ejercicio|Superserie con…|—|Agregar nota|Me molesta algo|—|Cómo se hace',`${sch} · ⋯ del ejercicio en tres grupos (${m&&m.rows.join('|')})`);
      await p.ctx.close(); }
    // reproductor apretado
    { const p=await open(390,844,sch); await p.evaluate(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); MINI.mode='tab'; miniSave(); go('hist'); }); await W8(p,1300);
      await p.evaluate(()=>lpMenu(document.getElementById('minibar'))); await W8(p,700); const m=await menu(p);
      T(m&&m.rows.join('|')==='Abrir sesión|Mostrar el panel|—|Pausa|Saltar fase|—|Terminar y guardar|Descartar sesión',`${sch} · reproductor: ver · manejar · cerrar (${m&&m.rows.join('|')})`);
      T(m&&!/no se guarda nada|Siguiente\b/.test(m.txt),`${sch} · reproductor: sin "Siguiente" ni "no se guarda nada"`);
      await p.evaluate(()=>popClose(true)); await W8(p,300);
      await p.evaluate(()=>{ go('bici'); }); await W8(p,1000); await tap(p,'#bkMore'); const m2=await menu(p);
      T(m2&&m2.rows.join('|').replace('Conectar sensor de cadencia|','')==='Saltar fase|—|Terminar y guardar|Descartar sesión',`${sch} · ⋯ de cardio igual de nombres (${m2&&m2.rows.join('|')})`);
      await p.ctx.close(); }
    // tarjeta del día apretada y elegir rutina
    { const p=await open(390,844,sch); await p.evaluate(()=>{ HOMEP=null; go('home'); }); await W8(p,1100);
      await p.evaluate(()=>{ const e=document.createElement('div'); e.dataset.card='f:'+nextTipo(); e.style.cssText='position:fixed;left:20px;top:200px;width:300px;height:80px'; document.getElementById('app').appendChild(e); lpMenu(e); }); await W8(p,700); let m=await menu(p);
      T(m&&m.rows[0]==='Empezar',`${sch} · tarjeta apretada: "Empezar" sin repetir el nombre (${m&&m.rows[0]})`);
      T(m&&m.smalls.some(t=>/^~\d+ min · en superseries$/.test(t)),`${sch} · versión corta: "~N min · en superseries" (${m&&m.smalls.join(' / ')})`);
      await p.evaluate(()=>popClose(true)); await p.evaluate(()=>{ draft=null; go('fuerza'); }); await W8(p,1000); await tap(p,'#fzMoreSel'); m=await menu(p);
      T(m&&m.smalls.some(t=>/^~\d+ min · en superseries$/.test(t)),`${sch} · elegir rutina: misma forma (${m&&m.smalls.join(' / ')})`);
      await p.evaluate(()=>popClose(true)); await W8(p,300); await p.evaluate(()=>{ HOMEP=null; go('home'); }); await W8(p,900); await tap(p,'#app [data-esp]'); m=await menu(p);
      T(m&&/\d+ elementos? · \d+ ejercicios/.test(m.txt)&&!/cosas/.test(m.txt),`${sch} · espacios: "elementos", no "cosas"`);
      await p.evaluate(()=>popClose(true)); await W8(p,300); await p.evaluate(()=>openFab()); await W8(p,800);
      T(await p.evaluate(()=>{ const f=document.querySelector('.fmi [data-fab="dev"]'); return f&&!/amber/.test(f.closest('.fmi').getAttribute('style')); }),`${sch} · la idea del + no usa el ámbar de los récords`);
      await p.ctx.close(); }
    // elegir zonas
    { const p=await open(390,844,sch); await p.evaluate(()=>{ estSel={m:'full',z:[]}; go('estirar'); }); await W8(p,1100); await tap(p,'#estZ');
      let s=await p.evaluate(()=>({n:document.querySelectorAll('.pop .ezr').length, chips:document.querySelectorAll('.pop .zchip').length, dis:document.getElementById('ezGo').disabled, t:document.getElementById('ezGo').textContent}));
      T(s.n===Object.keys({a:1,b:2,c:3,d:4,e:5,f:6}).length&&!s.chips,`${sch} · zonas: lista para tildar (${s.n} filas, ${s.chips} pastillas)`); T(s.dis&&s.t==='Elegí una o más',`${sch} · sin zonas el botón espera ("${s.t}")`);
      await tap(p,'.pop .ezr',300); await p.evaluate(()=>document.querySelectorAll('.pop .ezr')[3].click()); await W8(p,300);
      s=await p.evaluate(()=>({on:[...document.querySelectorAll('.pop .ezr')].filter(e=>e.getAttribute('aria-pressed')==='true').length, dis:document.getElementById('ezGo').disabled, t:document.getElementById('ezGo').textContent, z:estSel.z.length}));
      T(s.on===2&&s.z===2&&!s.dis&&/^Empezar · ~\d+ min$/.test(s.t),`${sch} · dos tildadas → Empezar · ~N min (${s.t})`);
      await p.click('#ezGo'); await W8(p,900); T(await p.evaluate(()=>!!mov&&!!mov.plan),`${sch} · y arranca la movilidad por zonas`);
      await p.ctx.close(); }
    // cardio · ya la hice
    { const p=await open(390,844,sch); await p.evaluate(()=>{ bike.modo=modoDefault(); bike.sel=null; go('bici'); }); await W8(p,1100); await tap(p,'#bkHecho');
      T(await p.evaluate(()=>document.getElementById('lbFT').textContent==='Hoy'),`${sch} · ya la hice: la fecha dice Hoy`);
      const ay=await p.evaluate(()=>{ const i=document.getElementById('lbFecha'); const y=addDays(hoyISO(),-1); i.value=y; i.dispatchEvent(new Event('change')); return y; }); await W8(p,200);
      T(await p.evaluate(()=>document.getElementById('lbFT').textContent==='Ayer'),`${sch} · cambia a Ayer`);
      T(await p.evaluate(()=>{ const f=document.querySelector('.fdate'); return f.scrollWidth<=f.clientWidth+1; }),`${sch} · la fecha entra entera`);
      const n0=await p.evaluate(y=>SESS.filter(s=>s.kind==='bici'&&s.fecha===y).length,ay); await p.click('#saveLibre'); await W8(p,800);
      T(await p.evaluate(([y,n0])=>SESS.filter(s=>s.kind==='bici'&&s.fecha===y).length===n0+1,[ay,n0]),`${sch} · y se guarda con esa fecha`);
      await p.ctx.close(); }
    // idea para la app
    { const p=await open(390,844,sch); await p.evaluate(()=>{ HOMEP=null; go('home'); }); await W8(p,900); await p.evaluate(()=>openDev()); await W8(p,800);
      const s=await p.evaluate(()=>({seg:document.querySelectorAll('.pop .devseg .effort').length, chips:document.querySelectorAll('.pop .zchip, .pop .ctxbox .pill').length}));
      T(s.seg===3&&!s.chips,`${sch} · idea: selector segmentado y sin pastillas (${s.seg}/${s.chips})`);
      await p.evaluate(()=>document.querySelectorAll('.pop .devseg .effort')[1].click()); await W8(p,200);
      T(await p.evaluate(()=>devD.tipo==='falla'&&document.querySelectorAll('.pop .devseg .effort')[1].getAttribute('aria-pressed')==='true'),`${sch} · idea: elegir "Algo falla"`);
      await p.ctx.close(); }
    // textos: equipo, qué abre, glosario
    { const p=await open(390,844,sch); await p.evaluate(()=>{ eqFrom='ajustes'; go('equipo'); }); await W8(p,1000); await tap(p,'#app [data-eqi]');
      T(await p.evaluate(()=>[...document.querySelectorAll('.pop .eqmas em')].every(e=>!/^\+/.test(e.textContent.trim()))),`${sch} · equipo: lo que falta en palabras`);
      await p.evaluate(()=>popClose(true)); await W8(p,300);
      await p.evaluate(()=>{ exSel=Object.values(CAT).find(c=>exAbre(c)).n; go('ejercicio'); }); await W8(p,1000); await tap(p,'#exAbre');
      T(await p.evaluate(()=>{ const t=document.querySelector('.pop .lptitle'); return t&&/^Qué abre /.test(t.textContent)&&!!document.querySelector('.pop .lpsub'); }),`${sch} · qué abre: título corto y el escalón abajo`);
      await p.evaluate(()=>popClose(true)); await W8(p,300);
      await p.evaluate(()=>{ fzSel=nextTipo(); nuevoDraft(fzSel,{}); go('fuerza'); }); await W8(p,1000); await tap(p,'#app [data-gl], #app .gl');
      T(await p.evaluate(()=>{ const g=document.querySelector('.pop .glmore'); if(!g) return true; const c=getComputedStyle(g).color; const d=document.createElement('i'); d.style.color='var(--lime)'; document.body.appendChild(d); const l=getComputedStyle(d).color; d.remove(); return c!==l; }),`${sch} · el enlace del glosario no es verde`);
      await p.ctx.close(); }
  }
  // horizontal: la idea sale al lado del + sin taparlo
  { const p=await open(844,390,'dark'); await p.evaluate(()=>{ HOMEP=null; go('home'); }); await W8(p,1000); await p.evaluate(()=>openFab()); await W8(p,700); await p.evaluate(()=>document.querySelector('.fmi [data-fab="dev"]').click()); await W8(p,900);
    const r=await p.evaluate(()=>{ const po=document.querySelector('.pop.devpopw').getBoundingClientRect(), f=document.getElementById('fab').getBoundingClientRect(); return {pl:po.left,fr:f.right,pb:po.bottom,ih:innerHeight,pt:po.top}; });
    T(r.pl>=r.fr+4&&r.pt>=0&&r.pb<=r.ih,`horizontal · la idea sale al lado del + (${Math.round(r.pl)} ≥ ${Math.round(r.fr)})`); await p.ctx.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
