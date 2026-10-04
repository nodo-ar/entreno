const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const W8=(p,ms)=>p.waitForTimeout(ms);
/* espera la condición que se mira, no un tiempo fijo: pregunta cada 50 ms y sigue apenas se cumple (el tope es solo para no colgarse) */
const hasta=async(p,f,a)=>{ const t0=Date.now(); while(Date.now()-t0<20000){ if(await p.evaluate(f,a)) return true; await W8(p,50); } return false; };
for(const [w,h] of [[390,844],[844,390]]){ const tag=`${w}×${h}`;
  const p=await (await b.newContext({viewport:{width:w,height:h},colorScheme:'dark'})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a);
  await p.goto('http://127.0.0.1:8765/'+src); await W8(p,400); await seed(p); await W8(p,900);
  await E(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); });
  const ayer=await E(()=>addDays(hoyISO(),-1)), hace3=await E(()=>addDays(hoyISO(),-3)), hace20=await E(()=>addDays(hoyISO(),-20));
  // ---- fuerza
  await E(()=>{ draft=null; fzSel=null; go('fuerza'); }); await W8(p,1000);
  await E(()=>document.querySelector('#fzMoreSel').click()); await W8(p,500);
  ok(await E(()=>!!document.querySelector('.pop [data-fz="hecha"]')&&!document.querySelector('.pop input[type=date]')),`${tag}: fuerza · "Ya la hice" es un botón, sin campo escondido`);
  await E(()=>document.querySelector('.pop [data-fz="hecha"]').click()); await W8(p,400);
  let d=await E(()=>({n:document.querySelectorAll('.pop .dpd').length,last:document.querySelector('.pop .dpd:last-child').dataset.dd,hoy:hoyISO(),lastTxt:document.querySelector('.pop .dpd:last-child small').textContent,fits:(()=>{ const r=document.querySelector('.pop').getBoundingClientRect(); return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight; })()}));
  ok(d.n===7&&d.last===d.hoy&&d.lastTxt==='Hoy'&&d.fits,`${tag}: fuerza · aparece la semana, hoy a la derecha, y entra en la pantalla ${JSON.stringify(d)}`);
  ok(await E(()=>[...document.querySelectorAll('.pop .dpd')].every(x=>{ const r=x.getBoundingClientRect(); return r.width>=34&&r.height>=56; })),`${tag}: los días se tocan cómodo`);
  // volver
  await E(()=>document.querySelector('.pop .dpback').click()); await W8(p,300);
  ok(await E(()=>!!document.querySelector('.pop [data-fz="hecha"]')&&!document.querySelector('.pop.dpop')),`${tag}: la flecha vuelve al menú`);
  await E(()=>document.querySelector('.pop [data-fz="hecha"]').click()); await W8(p,300);
  await E(f=>document.querySelector(`.pop .dpd[data-dd="${f}"]`).click(),ayer); await W8(p,900);
  d=await E(()=>({pop:!!document.querySelector('.pop:not(.out)'),v:view,fecha:draft&&draft.fecha}));
  ok(!d.pop&&d.v==='fuerza'&&d.fecha===ayer,`${tag}: fuerza · tocar ayer abre la sesión de ayer para cargarla ${JSON.stringify(d)}`);
  // otra fecha
  await E(()=>{ draft=null; fzSel=null; go('fuerza'); }); await W8(p,900); await E(()=>document.querySelector('#fzMoreSel').click()); await W8(p,400); await E(()=>document.querySelector('.pop [data-fz="hecha"]').click()); await W8(p,300);
  ok(await E(()=>document.querySelector('.pop .dpother .btn').disabled),`${tag}: "Listo" arranca apagado`);
  await p.fill('.pop .dpother input',hace20); await W8(p,150);
  ok(await E(()=>!document.querySelector('.pop .dpother .btn').disabled),`${tag}: con una fecha, "Listo" se prende`);
  await E(()=>document.querySelector('.pop .dpother .btn').click()); await W8(p,900);
  ok(await E(f=>view==='fuerza'&&draft&&draft.fecha===f,hace20),`${tag}: fuerza · otra fecha con Listo`);
  await E(()=>{ draft=null; }); 
  // ---- cardio
  await E(()=>{ bike.running=false; bike.sel=null; go('bici'); }); await W8(p,1000);
  const n0=await E(()=>SESS.filter(s=>s.kind==='bici').length);
  await E(()=>document.querySelector('#bkMoreSel').click()); await W8(p,400);
  ok(await E(()=>!!document.querySelector('.pop [data-bk="hecha"]')&&!document.querySelector('.pop input[type=date]')),`${tag}: cardio · "Ya la hice" es un botón`);
  await E(()=>document.querySelector('.pop [data-bk="hecha"]').click()); await W8(p,300);
  const dots=await E(()=>[...document.querySelectorAll('.pop .dpd')].map(x=>[x.dataset.dd,x.querySelector('i').classList.contains('on')]));
  const real=await E(()=>{ const s=new Set(SESS.filter(x=>x.kind==='bici').map(x=>x.fecha)); return [...document.querySelectorAll('.pop .dpd')].map(x=>s.has(x.dataset.dd)); });
  ok(dots.every((x,i)=>x[1]===real[i]),`${tag}: el punto marca los días que ya tienen cardio`);
  await E(f=>document.querySelector(`.pop .dpd[data-dd="${f}"]`).click(),hace3); await W8(p,1200);
  d=await E(f=>({v:view,n:SESS.filter(s=>s.kind==='bici').length,has:SESS.some(s=>s.kind==='bici'&&s.fecha===f)}),hace3);
  ok(d.v==='fin'&&d.n===n0+1&&d.has,`${tag}: cardio · tocar un día guarda la sesión de ese día ${JSON.stringify(d)}`);
  await E(()=>{ try{ finAskClose(true); }catch(e){} go('home'); }); await W8(p,700);
  // ---- fondo quieto con un menú abierto
  await E(()=>go('hist')); await W8(p,900); await E(()=>scrollTo(0,120)); await W8(p,200);
  const sy0=await E(()=>scrollY);
  const anyBtn=await E(()=>{ const b=[...document.querySelectorAll('#app .gl,#app [data-info]')].find(x=>{ const r=x.getBoundingClientRect(); return r.top>60&&r.bottom<innerHeight-80; }); if(b){ b.click(); return 'real:'+(b.className||b.id); } const a=[...document.querySelectorAll('#app .card')].find(x=>{ const r=x.getBoundingClientRect(); return r.top>60&&r.top<innerHeight-200; }); popOpen(a,'<div class="lptitle">Prueba</div><div style="height:90px"></div>',{place:'below',align:'left'}); return 'generico'; }); await W8(p,500);
  const lk=await E(()=>({pop:!!(POP.el&&POP.el.isConnected),lk:document.documentElement.classList.contains('plock')}));
  await p.mouse.move(w*.5,h*.8); await p.mouse.wheel(0,400); await W8(p,400); const sy1=await E(()=>scrollY);
  ok((lk.pop&&lk.lk&&sy1===sy0),`${tag}: con un menú abierto (${anyBtn}) la pantalla de atrás no se mueve (${sy0}→${sy1})`);
  await E(()=>popClose(true)); await W8(p,300); ok(await E(()=>!document.documentElement.classList.contains('plock')),`${tag}: al cerrar se libera`);
  await p.mouse.wheel(0,300); ok(await hasta(p,y=>scrollY>y,sy0),`${tag}: después se desplaza normal`);
  // festejo
  await E(()=>{ scrollTo(0,0); CELQ.length=0; CELON=false; CELQ.push({k:'mv_hom',lvl:1}); celebMaybe(true); }); await W8(p,1400);
  ok(await E(()=>!!document.querySelector('.celov')&&document.documentElement.classList.contains('plock')),`${tag}: con un festejo, el fondo queda quieto`);
  await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); CELON=true; }); await W8(p,300);
  ok(await E(()=>!document.documentElement.classList.contains('plock')),`${tag}: sin festejo se libera`);
  // menú alto en pantalla chica: se desplaza por dentro
  await E(()=>{ TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(p,1400); await E(()=>document.querySelector('#tLvl').click()); await W8(p,600);
  d=await E(()=>{ const el=POP.el, r=el.getBoundingClientRect(); return {t:r.top,b:r.bottom,ih:innerHeight,sc:el.scrollHeight>el.clientHeight+2,ov:getComputedStyle(el).overflowY}; });
  ok(d.b<=d.ih+1&&d.t>=0&&(!d.sc||/auto|scroll/.test(d.ov)),`${tag}: el panel de nivel entra o se desplaza por dentro ${JSON.stringify(d)}`);
  await E(()=>popClose(true)); await W8(p,300);
  // teclado de la fuerza: no traba (hay que poder ver las otras series)
  await E(()=>{ draft=null; go('fuerza'); }); await W8(p,900); await E(()=>{ const g=document.querySelector('#goFz'); if(g) g.click(); }); await W8(p,1200);
  const kp=await E(()=>{ const i=document.querySelector('#app input[inputmode],#app .rin,#app input[type=number]'); if(!i) return 'sin campo'; i.focus(); i.click(); return 'ok'; }); await W8(p,600);
  ok(await E(()=>!document.documentElement.classList.contains('plock')),`${tag}: con el teclado de series la pantalla se sigue moviendo (${kp})`);
  await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
