// v243: marco horizontal, movilidad integrada, reproductor en horizontal, superserie estable, contraste del chip
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const ctx=async(W,H,sch)=>{ const p=await (await b.newContext({viewport:{width:W,height:H},colorScheme:sch||'light'})).newPage(); p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(500); await seed(p); await p.waitForTimeout(600);
  await p.evaluate(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); CELON=true; PERF.modo='max'; perfApply(); ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; CFG.altura=180; CFG.edad=29; CFG.sexo='m'; saveCfg();
    const bs=SESS.find(x=>x.kind==='bici'&&x.int); if(bs&&!SESS.some(x=>x.ref===bs.id)){ SESS.push({id:'mk1',kind:'mov',fecha:bs.fecha,tipo:'Movilidad después de Bici',min:6,items:['Childs_Pose','Kneeling_Hip_Flexor'],zonas:['cad','isq'],ctx:'bici',ref:bs.id}); SESS.sort((a,c)=>c.fecha.localeCompare(a.fecha)); window._bk=bs.id; } }); return p; };
const M=p=>p.evaluate(()=>{ const R=e=>e&&e.getClientRects().length?e.getBoundingClientRect():null; const v=document.querySelector('#app>.view'); const rb=R(document.querySelector('#rback:not([hidden])'));
  const hd=[...v.querySelectorAll(':scope>h1, :scope>.row h1, .splhd>h1, .ajside>h1')].find(e=>e.getClientRects().length); const hb=R(hd); const lh=hd?parseFloat(getComputedStyle(hd).lineHeight)||44:44;
  const wr=document.querySelector('.wrap'), cs=getComputedStyle(wr), W=wr.getBoundingClientRect(); const x0=W.left+parseFloat(cs.paddingLeft);
  const cols=[...v.querySelectorAll('.cols2>.col')].map(c=>{ const f=[...c.children].find(x=>x.getClientRects().length&&!x.matches('.eyebrow,.wkeb,.ajhd')); return f?Math.round(R(f).top):null; }).filter(x=>x!=null);
  const acts=[...v.querySelectorAll(':scope>.topbar>*, .splmain>.view>.topbar>*')].filter(e=>e.getClientRects().length&&!e.matches('.back,.grow,[hidden]')).map(e=>{ const r=R(e); return Math.round(r.top+r.height/2); });
  const inPanel=!!(hd&&hd.closest('.splside,.ajside')); return {inPanel,nonav:document.body.classList.contains('nonav'), rb:rb?Math.round(rb.top+rb.height/2):null, hcy:hb?Math.round(hb.top+Math.min(lh,hb.height)/2):null, hx:hb?(()=>{ const row=hd.closest('#app>.view>.row'); const f=row&&[...row.children].find(x=>x.getClientRects().length); return Math.round(f&&!f.contains(hd)?R(f).left:hb.left+parseFloat(getComputedStyle(hd).paddingLeft)); })():null, x0:Math.round(x0), cols, acts}; });
for(const [W,H] of [[1180,820],[915,412]]){ const p=await ctx(W,H); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
  const V=[['hist',()=>go('hist'),0],['stat_fuerza',()=>{ histEx='fuerza'; go('stat'); },1],['resumen',()=>{ resMode='sem'; resumenWk=null; go('resumen'); },1],['resumen_mes',()=>{ resMode='mes'; mesOff=0; go('resumen'); },1],['dia',()=>{ histEx=window._bk; go('dia'); },1],['cuerpo',()=>go('cuerpo'),1],['ajustes',()=>{ ajSec='semana'; go('ajustes'); },1],['todas',()=>{ todoSel=null; histEx='todo'; go('stat'); },1],['programa',()=>{ progSel='base_cali'; go('programa'); },1],['ejercicio',()=>{ exSel='Dominadas pronas'; go('ejercicio'); },1],['fuerza_pre',()=>{ draft=null; fzSel=null; go('fuerza'); },1],['vos',()=>go('vos'),0]];
  let hx=null;
  for(const [n,f,back] of V){ await E(f); await W8(900); await E(()=>scrollTo(0,0)); await W8(200); const m=await M(p);
    ok(!m.nonav,`${W}: ${n} con el riel`);
    if(back) ok(m.rb!=null&&Math.abs(m.rb-m.hcy)<=1,`${W}: ${n} volver arriba del riel, centrado con el título · ${m.rb}/${m.hcy}`);
    ok(m.hx!=null&&(m.inPanel?Math.abs(m.hx-m.x0-21)<=2:Math.abs(m.hx-m.x0)<=1),`${W}: ${n} el título arranca en la línea del contenido${m.inPanel?' (adentro del panel)':''} · ${m.hx}/${m.x0}`);
    if(hx==null) hx=m.hcy; ok(Math.abs(m.hcy-hx)<=1,`${W}: ${n} título a la misma altura que en las demás · ${m.hcy}/${hx}`);
    ok(m.acts.every(y=>Math.abs(y-m.hcy)<=1),`${W}: ${n} acciones en la fila del título · ${JSON.stringify(m.acts)}/${m.hcy}`);
    if(m.cols.length===2) ok(Math.abs(m.cols[0]-m.cols[1])<=1,`${W}: ${n} las dos columnas arrancan juntas · ${m.cols}`); }
  // Progreso: izquierda la semana, derecha las tendencias; barra de arriba con el título en la línea del contenido
  await E(()=>go('hist')); await W8(900);
  ok(await E(()=>{ const c=[...document.querySelectorAll('#app .cols2>.col')]; return c.length===2&&!!c[0].querySelector(':scope>.wkcard')&&/Tendencias/i.test(c[1].firstElementChild.textContent); }),`${W}: Progreso · la semana a la izquierda, las tendencias a la derecha`);
  await E(()=>scrollTo(0,400)); await W8(600);
  const tb=await E(()=>{ const t=document.querySelector('#tbt').getBoundingClientRect(), wr=document.querySelector('.wrap'), cs=getComputedStyle(wr); return {l:Math.round(t.left),x0:Math.round(wr.getBoundingClientRect().left+parseFloat(cs.paddingLeft)),stuck:document.body.classList.contains('tbstuck')}; });
  ok(tb.stuck&&Math.abs(tb.l-tb.x0)<=2,`${W}: Progreso · título de la barra en la línea del contenido · ${JSON.stringify(tb)}`);
  // Sesiones dividida: la barra va sobre el panel derecho con su título; la movilidad de una sesión se ve adentro
  await E(()=>{ todoSel=window._bk; histEx='todo'; go('stat'); }); await W8(1000);
  ok(await E(()=>!!document.querySelector('#splHost #dmov .wu')&&!document.querySelector('#splHost [data-open="mk1"]')),`${W}: Sesiones · la movilidad después se ve adentro del detalle`);
  await E(()=>{ todoSel=null; render(); }); await W8(700); await E(()=>{ const k=document.querySelector('#app .splside [data-kid="mk1"]'); k.click(); }); await W8(900);
  ok(await E(()=>view==='stat'&&todoSel===window._bk&&!!document.querySelector('#dmov')),`${W}: Sesiones · tocar la movilidad elige su sesión sin salir de la pantalla`);
  await E(()=>scrollTo(0,99999)); await W8(600);
  const st=await E(()=>{ const t=document.querySelector('#tbt'), r=t.getBoundingClientRect(), m=document.querySelector('#app .splmain').getBoundingClientRect(), s=document.querySelector('#app .splside').getBoundingClientRect(); return {l:Math.round(r.left),ml:Math.round(m.left),w:Math.round(r.width),txt:t.textContent,side:Math.round(s.top),sy:scrollY}; });
  ok(st.sy===0||(Math.abs(st.l-st.ml)<=2&&st.txt===await E(()=>document.querySelector('#app .splmain h1').textContent.trim())&&st.side>=-1),`${W}: Sesiones · la barra toma el título del panel derecho y la lista queda quieta · ${JSON.stringify(st)}`);
  // detalle a pantalla completa
  await E(()=>{ histEx=window._bk; go('dia'); }); await W8(900);
  ok(await E(()=>{ const c=document.querySelectorAll('#app .cols2>.col'); return c.length===2&&!!c[1].querySelector('#dmov'); }),`${W}: detalle · la movilidad en la columna derecha`);
  // pantallas sin riel
  await E(()=>{ const s=SESS.find(x=>x.kind==='fuerza'); histEx=s.id; finCtx={}; go('fin'); }); await W8(900); ok(await E(()=>document.body.classList.contains('nonav')&&document.querySelector('#rback').hidden),`${W}: cierre de sesión sin riel`);
  await E(()=>{ finCtx=null; openMeta(); }); await W8(800); ok(await E(()=>document.body.classList.contains('nonav')),`${W}: formulario sin riel`);
  // Resumen con el reproductor anclado arriba: el título sigue a la vista y nada se pisa
  await E(()=>{ localStorage.setItem(LSK+'.miniMode',JSON.stringify({m:'isle',side:'r',ty:.5})); MINI.mode=null; nuevoDraft(nextTipo()); go('fuerza'); }); await W8(700);
  await E(()=>{ resMode='sem'; resumenWk=null; go('resumen'); }); await W8(1100);
  const is=await E(()=>{ const mb=document.querySelector('#minibar').getBoundingClientRect(), sg=document.querySelector('#app>.view>.segx').getBoundingClientRect(), h=document.querySelector('#app>.view>h1'), wr=document.querySelector('.wrap'), cs=getComputedStyle(wr), x1=wr.getBoundingClientRect().right-parseFloat(cs.paddingRight); return {mbR:Math.round(mb.right),x1:Math.round(x1),mbCy:Math.round(mb.top+mb.height/2),hCy:Math.round(h.getBoundingClientRect().top+22),over:sg.right>mb.left-4,hv:h.getClientRects().length>0,cls:document.querySelector('#minibar').className}; });
  ok(/isle/.test(is.cls)&&Math.abs(is.mbR-is.x1)<=2&&Math.abs(is.mbCy-is.hCy)<=1&&!is.over&&is.hv,`${W}: reproductor arriba · a la derecha de la fila del título, sin pisar Semana/Mes · ${JSON.stringify(is)}`);
  await E(()=>scrollTo(0,300)); await W8(600);
  ok(await E(()=>{ const t=document.querySelector('#tbt').getBoundingClientRect(); return !document.body.classList.contains('tbstuck')||t.width>80; }),`${W}: Resumen con reproductor arriba · el título de la barra no desaparece`);
  // borde izquierdo: el módulo ocupa el lugar del +
  await E(()=>{ MINI.side='l'; MINI.ty=.5; miniSetMode('tab'); go('hist'); }); await W8(1200);
  const tl=await E(()=>{ const mb=document.querySelector('#minibar').getBoundingClientRect(), nv=document.querySelector('nav.bottom').getBoundingClientRect(); return {l:Math.round(mb.left),r:Math.round(mb.right),nl:Math.round(nv.left),nr:Math.round(nv.right),fab:getComputedStyle(document.querySelector('#fab')).opacity,t:!!document.querySelector('#minibar #mbTime'),ring:!!document.querySelector('#minibar .ir')}; });
  ok(Math.abs(tl.l-tl.nl)<=2&&Math.abs(tl.r-tl.nr)<=2&&+tl.fab<0.1&&tl.t&&tl.ring,`${W}: reproductor en el borde · módulo en el riel, en lugar del + · ${JSON.stringify(tl)}`);
  // flotante: la tarjeta en vivo en chico
  await E(()=>{ MINI.pos=[1,1]; miniSetMode('card'); }); await W8(900);
  ok(await E(()=>{ const m=document.querySelector('#minibar'); return !!m.querySelector('.mb-now #mbTime')&&!!m.querySelector('.mb-acts .mb-a')&&!!m.querySelector('.mb-seg'); }),`${W}: reproductor flotante · tiempo grande, tramos y acciones`);
  await E(()=>{ draft=null; closeRest(); liveClear(); render(); miniRender(); }); await W8(500);
  await p.close(); }
// ---- superserie: al cambiar de ejercicio queda quieto el panel y rueda sólo lo que cambia
{ const p=await ctx(390,844); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
  await E(()=>{ nuevoDraft(nextTipo()); go('fuerza'); }); await W8(800); await E(()=>{ cur=0; ssAuto(); }); await W8(900); await E(()=>{ fzLogSet(stepR,stepKg); }); await W8(900); await E(()=>{ try{ closeRest(); pausaStop(); }catch(e){} render(); }); await W8(700);
  const r=await E(async()=>{ const bar=document.querySelector('#excard .ssbar'), hd=document.querySelector('#excard .exhead'); const L=draft.plan.ej[cur].ss[0]; const o=draft.plan.ej.findIndex((m,i)=>i!==cur&&m.ss&&m.ss[0]===L); cur=o; loadStepper(); render(); await new Promise(r=>setTimeout(r,40));
    const A=document.getAnimations().map(a=>a.effect&&a.effect.target).filter(Boolean); const moved=A.filter(t=>t.closest&&t.closest('#excard')&&!t.hasAttribute('data-mo')&&(t===document.querySelector('#excard .ssbar')||t===document.querySelector('#excard .efrow')||t===document.querySelector('#excard .exfoot')));
    return {same:bar===document.querySelector('#excard .ssbar')&&hd===document.querySelector('#excard .exhead'), ghosts:A.filter(t=>t.hasAttribute&&t.hasAttribute('data-mo')).length, rolled:A.some(t=>t.matches&&t.matches('.sst small')), moved:moved.length}; });
  ok(r.same&&r.ghosts>0&&r.rolled&&r.moved===0,'Superserie: el panel y la tarjeta quedan; rueda el estado de cada ejercicio y lo que cambia · '+JSON.stringify(r));
  for(const sch of ['light','dark']){ await p.emulateMedia({colorScheme:sch}); await E(sch=>{ CFG.tema=sch; applyTema(); render(); },sch); await W8(500);
    const cc=await E(()=>{ const lum=c=>{ const m=c.match(/[\d.]+/g).map(Number); const f=x=>{ x/=255; return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4); }; return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]); }; const ch=document.querySelector('#app .exnav button.cur'); const cs=getComputedStyle(ch); const bg=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(); const d=document.createElement('i'); d.style.color=bg; document.body.appendChild(d); const bgc=getComputedStyle(d).color; d.remove(); const a=lum(cs.color), b2=lum(bgc); return (Math.max(a,b2)+.05)/(Math.min(a,b2)+.05); });
    ok(cc>=4.5,`Chip actual del riel legible en ${sch} · contraste ${cc.toFixed(1)}`); }
  await E(()=>{ const i=draft.ej.findIndex(e=>e.series.length); cur=i; loadStepper(); render(); }); await W8(500);
  ok(await E(()=>{ const ch=document.querySelector('#app .exnav button.cur'); return ch.classList.contains('cur')&&getComputedStyle(ch).color===getComputedStyle(document.querySelector('#app .exnav button.cur')).color; }),'Chip actual hecho: mismo color de texto que el actual');
  // vertical: nada de columnas ni volver en el riel; Progreso en su orden de siempre
  await E(()=>{ draft=null; closeRest(); liveClear(); go('hist'); }); await W8(900);
  ok(await E(()=>!document.querySelector('#app .cols2')&&document.querySelector('#rback').hidden&&document.querySelector('#app .htbody').firstElementChild.classList.contains('wkcard')&&/Tendencias/i.test(document.querySelector('#app .htbody').children[1].textContent)),'Vertical: Progreso sin columnas y en su orden');
  await E(()=>{ histEx=window._bk; go('dia'); }); await W8(900);
  ok(await E(()=>!document.querySelector('#dmov')&&!!document.querySelector('#app [data-open="mk1"]')),'Vertical: la movilidad después sigue como fila que abre su detalle');
  await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
