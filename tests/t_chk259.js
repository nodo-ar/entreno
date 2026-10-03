// v257: girar el teléfono te deja en la misma pantalla; descartar desde el reproductor no te mueve ni lo rompe
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prevR.html';
const PH=[[390,844],[844,390]], TB=[[820,1180],[1180,820]];
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const open=async(S,opt)=>{ const ctx=await b.newContext(Object.assign({viewport:{width:S[0],height:S[1]}},opt||{})); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(500);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; HOMEP=null; go('home'); }); await W8(p,900); p.ctx=ctx; return p; };
  const tap=async(p,sel,t)=>{ const bb=await p.evaluate(s=>{ const e=[...document.querySelectorAll(s)].find(x=>x.getClientRects().length); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; },sel); if(!bb) return false; await p.mouse.click(bb.x,bb.y); await W8(p,t||1000); return true; };
  const rot=async(p,S)=>{ await p.setViewportSize({width:S[0],height:S[1]}); await W8(p,1300); };
  const st=p=>p.evaluate(()=>({view,h1:((document.querySelector('#app .splmain h1, #app #splHost h1')||document.querySelector('#app h1'))||{}).textContent||'',hp:HOMEP?JSON.stringify(HOMEP):'',nav:NAV.map(e=>e.v).join('>'),histEx,todoSel,prPick:prPick?prPick.id:null,exSel,blank:(()=>{ const t=[...document.querySelectorAll('#app *')].filter(e=>e.children.length===0&&(e.textContent||'').trim()&&e.getClientRects().length&&e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0).length; return t<8; })(),sw:document.documentElement.scrollWidth>innerWidth+1}));
  const back=async p=>{ await p.evaluate(()=>{ const b=document.querySelector('#rback:not([hidden])')||document.getElementById('back'); b.click(); }); await W8(p,1100); };

  for(const [P,L,tag] of [[PH[0],PH[1],'celular'],[TB[0],TB[1],'tablet']]){
    // —— horizontal → vertical ——
    { const p=await open(L);
      // Inicio · Resumen a la derecha
      await tap(p,'#app [data-hp="res"]'); await rot(p,P); let s=await st(p); T(s.view==='resumen'&&!s.blank,`${tag} H→V: Inicio·Resumen → Resumen (${s.view})`);
      await back(p); s=await st(p); T(s.view==='home',`${tag}: volver de Resumen lleva a Inicio (${s.view})`);
      await rot(p,L); s=await st(p); T(s.view==='home'&&!/res/.test(s.hp),`${tag}: y al girar otra vez, Inicio con Hoy (${s.hp})`);
      // Inicio · Programas · un programa
      await tap(p,'#app [data-hp="prog"]'); await tap(p,'#app .splmain [data-prog]'); s=await st(p); const pn=s.h1;
      await rot(p,P); s=await st(p); T(s.view==='programa'&&s.h1===pn,`${tag} H→V: Inicio·Programas·${pn} → el programa (${s.view} ${s.h1})`);
      await back(p); s=await st(p); T(s.view==='programas',`${tag}: volver lleva a Programas (${s.view})`); await back(p); s=await st(p); T(s.view==='home',`${tag}: y otra vez, a Inicio (${s.view})`);
      // Inicio · una sesión del día
      await rot(p,L); await tap(p,'#app [data-hday]'); const okS=await tap(p,'#app .splmain .swf[data-open]'); if(okS){ s=await st(p); const h=s.h1; await rot(p,P); s=await st(p); T(s.view==='dia'&&s.h1===h,`${tag} H→V: Inicio·sesión → la sesión (${s.view} ${s.h1})`); await back(p); s=await st(p); T(s.view==='home',`${tag}: volver a Inicio`); await rot(p,L); }
      // Inicio · otro día → en vertical, Inicio con la hoja de ese día
      await tap(p,'#app [data-hday]:not([aria-current])'); s=await st(p); const d=JSON.parse(s.hp).d; await rot(p,P); s=await st(p);
      T(s.view==='home'&&await p.evaluate(d=>!!POP.el&&CDS===d,d),`${tag} H→V: Inicio·${d} → Inicio con ese día abierto`);
      await rot(p,L); s=await st(p); T(s.view==='home'&&JSON.parse(s.hp||'{}').d===d&&await p.evaluate(()=>!POP.el),`${tag} V→H: el día abierto vuelve a ser el día elegido (${s.hp})`);
      await p.ctx.close(); }
    { const p=await open(L);
      // Sesiones: elegida a mano → la sesión; sin elegir → la lista
      await p.evaluate(()=>{ NAV.length=0; histEx='todo'; todoFil='todas'; todoSel=null; go('stat'); }); await W8(p,1100);
      await rot(p,P); let s=await st(p); T(s.view==='stat'&&/Todas las sesiones/.test(s.h1),`${tag} H→V: Sesiones sin elegir → la lista (${s.h1})`);
      await rot(p,L); await tap(p,'#app .splside .swr[data-sid]:nth-of-type(3) .swf'); s=await st(p); const sid=s.todoSel; await rot(p,P); s=await st(p);
      T(s.view==='dia'&&s.histEx===sid,`${tag} H→V: Sesiones con una elegida → esa sesión (${s.view} ${s.histEx}/${sid})`);
      await rot(p,L); s=await st(p); T(s.view==='stat'&&s.todoSel===sid&&!s.blank,`${tag} V→H: la sesión vuelve a abrirse a la derecha de la lista`);
      await rot(p,P); await back(p); s=await st(p); T(s.view==='stat'&&/Todas/.test(s.h1),`${tag}: volver de la sesión lleva a la lista`);
      // Programas con uno elegido
      await rot(p,L); await p.evaluate(()=>{ NAV.length=0; dsFil='todo'; prPick=null; dsFrom='hist'; go('desafios'); }); await W8(p,1100); await tap(p,'#app .splside [data-hero]:nth-of-type(2)'); s=await st(p); const hid=s.prPick;
      await rot(p,P); s=await st(p); T(s.view==='heroe'&&await p.evaluate(h=>heroSel===h,hid),`${tag} H→V: Desafíos·uno → ese desafío (${s.view})`); await back(p); s=await st(p); T(s.view==='desafios',`${tag}: volver a Desafíos (${s.view})`);
      await rot(p,L); s=await st(p); T(s.view==='desafios'&&await p.evaluate(h=>prPick&&prPick.t==='h'&&prPick.id===h,hid),`${tag} V→H: Desafíos con el mismo elegido`);
      // Catálogo con un ejercicio elegido
      await rot(p,L); await p.evaluate(()=>{ NAV.length=0; catFil='todos'; exSel=null; go('catalogo'); }); await W8(p,1100); await tap(p,'#app .splside [data-ex]:nth-of-type(4)'); s=await st(p); const ex=s.exSel;
      await rot(p,P); s=await st(p); T(s.view==='ejercicio'&&s.exSel===ex,`${tag} H→V: Catálogo·ejercicio → el ejercicio (${s.view})`); await rot(p,L); s=await st(p); T(s.view==='catalogo'&&s.exSel===ex,`${tag} V→H: vuelve a Catálogo con ese ejercicio`);
      await p.ctx.close(); }
    // —— vertical → horizontal ——
    { const p=await open(P);
      await tap(p,'#app [data-resumen]'); let s=await st(p); T(s.view==='resumen',`${tag}: Resumen en vertical`); await rot(p,L); s=await st(p); T(s.view==='home'&&/res/.test(s.hp)&&!s.blank,`${tag} V→H: Resumen → Inicio con Resumen a la derecha (${s.view} ${s.hp})`);
      await rot(p,P); s=await st(p); T(s.view==='resumen',`${tag}: y de vuelta, Resumen`); await back(p);
      await p.evaluate(()=>{ NAV.length=0; go('hist'); }); await W8(p,900); await p.evaluate(()=>{ histEx='todo'; go('stat'); }); await W8(p,900); await tap(p,'#app .swf[data-open]'); s=await st(p); const sid=s.histEx;
      await rot(p,L); s=await st(p); T(s.view==='stat'&&s.todoSel===sid&&await p.evaluate(()=>!!document.querySelector('#app .splside .swr.on')),`${tag} V→H: la sesión → Sesiones con esa sesión elegida (${s.view})`);
      await rot(p,P); s=await st(p); T(s.view==='dia'&&s.histEx===sid,`${tag}: y de vuelta, la sesión`);
      await p.evaluate(()=>{ NAV.length=0; catFil='todos'; go('catalogo'); }); await W8(p,900); await tap(p,'#app [data-ex]'); s=await st(p); const ex=s.exSel; T(s.view==='ejercicio',`${tag}: un ejercicio en vertical`);
      await rot(p,L); s=await st(p); T(s.view==='catalogo'&&s.exSel===ex,`${tag} V→H: el ejercicio → Catálogo con ese ejercicio`);
      await p.ctx.close(); }
    // —— altura: quedás donde estabas ——
    { const p=await open(P); await p.evaluate(()=>{ NAV.length=0; histEx='fuerza'; go('stat'); }); await W8(p,900);
      const h=await p.evaluate(()=>{ const e=[...document.querySelectorAll('#app h3')].find(x=>/Volumen por semana/.test(x.textContent)); e.scrollIntoView({block:'start'}); scrollBy(0,-90); return e.textContent; }); await W8(p,500);
      await rot(p,L); let v=await p.evaluate(h=>{ const e=[...document.querySelectorAll('#app h3')].find(x=>x.textContent===h); const r=e.getBoundingClientRect(); return r.top>0&&r.top<innerHeight*.6; },h); T(v,`${tag}: al girar, "${h}" sigue a la vista`);
      await rot(p,P); v=await p.evaluate(h=>{ const e=[...document.querySelectorAll('#app h3')].find(x=>x.textContent===h); const r=e.getBoundingClientRect(); return r.top>0&&r.top<innerHeight*.6; },h); T(v,`${tag}: y al volver, también`);
      await p.ctx.close(); }
  }

  // —— descartar desde el reproductor ——
  for(const mode of ['fab','isle','card','tab']){ const p=await open([390,844],{hasTouch:true}); await p.evaluate(m=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); MINI.ses=miniSesKey(); MINI.mode=m; MINI.pos=[1,1]; MINI.side='r'; miniSave(); NAV.length=0; go('hist'); },mode); await W8(p,1300);
    const cdp=await p.ctx.newCDPSession(p); const c=await p.evaluate(()=>{ const r=document.getElementById('minibar').getBoundingClientRect(); return {x:r.left+Math.min(28,r.width/2),y:r.top+Math.min(28,r.height/2)}; });
    if(mode!=='tab'){ await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y}]}); await W8(p,1300); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await W8(p,700);
      T(await p.evaluate(m=>miniMode()===m&&!!POP.el&&!document.documentElement.dataset.vt,mode),`${mode}: mantener apretado abre el menú y el reproductor no cambia de forma`); }
    else await p.evaluate(()=>lpMenu(document.getElementById('minibar')));
    await W8(p,300); const d=await p.evaluate(()=>{ const e=document.querySelector('.lppop [data-lp="l:discard"]'); const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; });
    await p.touchscreen.tap(d.x,d.y); await W8(p,1200);
    const r=await p.evaluate(()=>{ const f=document.getElementById('fab'), m=document.getElementById('minibar'); const ex=[...document.querySelectorAll('.vtph,.poplift,.mbslot,.mbedge')].length; return {view,running:bike.running,mb:!m||m.hidden,fab:getComputedStyle(f).opacity,fs:getComputedStyle(f).scale,cls:document.body.className,vt:document.documentElement.dataset.vt||'',vars:['--vla','--vlb'].map(k=>document.documentElement.style.getPropertyValue(k)).join(''),ex}; });
    T(r.view==='hist',`${mode}: descartar te deja en Progreso (${r.view})`); T(!r.running&&r.mb,`${mode}: la sesión se descarta y el reproductor se va`); T(+r.fab===1&&(r.fs==='none'||r.fs==='1')&&!/mbfab/.test(r.cls),`${mode}: el + vuelve entero (${r.fab} ${r.fs})`);
    T(!r.vt&&!r.vars&&!r.ex,`${mode}: sin restos de la transición ni capas sueltas`);
    await p.evaluate(()=>document.querySelector('#utoast .utu').click()); await W8(p,900);
    T(await p.evaluate(()=>bike.running&&view==='hist'),`${mode}: deshacer la devuelve, sin moverte`);
    await p.ctx.close(); }
  // en la pantalla de la sesión, descartar sí vuelve atrás
  { const p=await open([390,844]); await p.evaluate(()=>{ NAV.length=0; go('hist'); }); await W8(p,700); await p.evaluate(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); go('bici'); }); await W8(p,900);
    await p.evaluate(()=>bikeDiscard()); await W8(p,1000); T(await p.evaluate(()=>view!=='bici'&&!bike.running),'en la pantalla de cardio, descartar sale de ella'); await p.ctx.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
