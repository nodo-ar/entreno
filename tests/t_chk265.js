// v262: Inicio sugiere otra rutina (o un cardio tranqui) según la recuperación — semanas de ejemplo
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const open=async(W,H)=>{ const p=await (await b.newContext({viewport:{width:W||390,height:H||844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; NAV.length=0; CFG.molestias=[]; CFG.prog={}; });
    return p; };
  /* escenarios: d = días atrás */
  const ESC=`window.__esc=(k)=>{ const hoy=hoyISO(), t=Date.now(), wd=wdIdx(hoy);
    const ses=(d,h,tipo,ej)=>({id:'s-'+(t-d*864e5-h*36e5),kind:'fuerza',fecha:addDays(hoy,-d),tipo,ej});
    const E=(n,z,sets,f)=>({n,z,fatiga:f||2,series:Array.from({length:sets},()=>({r:10,kg:20}))});
    const piernasAyer=f=>ses(1,0,'Libre',[E('Sentadilla búlgara','pd',4,f),E('Sentadilla','pd',4,f),E('Puente de glúteo unilateral','pd',3,f)]);
    delete CFG.sugHoy; delete CFG.sugNo; CFG.prog={}; draft=null; if(!window.__H) window.__H=SESS.filter(x=>x.fecha<addDays(hoy,-8)); const H=window.__H;
    if(k==='f'){ SESS=[piernasAyer(3),ses(3,0,'Torso A',[E('Fondos','emp',3),E('Dominadas pronas','esp',3)]),...H]; CFG.diasFS=[wd]; CFG.diasBS=[]; }
    if(k==='f2'){ SESS=[ses(1,2,'Torso B',[E('Fondos','emp',4,3),E('Dominadas pronas','esp',4,3),E('Press de hombros','emp',4,3),E('Remo con dos mancuernas','esp',4,3)]),piernasAyer(3),ses(3,0,'Torso A',[E('Fondos','emp',3)]),...H]; CFG.diasFS=[wd]; CFG.diasBS=[]; }
    if(k==='b'){ SESS=[ses(1,0,'Piernas A',[E('Sentadilla búlgara','pd',5,3),E('Sentadilla','pd',5,3),E('Zancada inversa','pd',4,3),E('Puente de glúteo unilateral','pd',4,3)]),ses(6,0,'Piernas B',[E('Sentadilla','pd',3,1)]),...H]; CFG.diasFS=[]; CFG.diasBS=[wd,(wd+3)%7];
      if(!window.__T0) window.__T0=template; template=()=>{ const T=window.__T0(); const H=CFG.sugHoy; T[wd].b=H&&H.k==='b'&&H.f===hoyISO()?H.a:'inter'; return T; }; }
    if(k==='fresco'){ SESS=[ses(3,0,'Torso A',[E('Fondos','emp',3)]),...H]; CFG.diasFS=[wd]; CFG.diasBS=[]; }
    REC_C=null; TRN={}; homeFront=null; go('home'); };`;
  { const p=await open(); await p.evaluate(ESC);
    // 1. fuerza: toca Piernas A con las piernas recuperándose y el torso listo
    await p.evaluate(()=>__esc('f')); await p.waitForTimeout(900);
    const A=await p.evaluate(()=>{ const r=document.querySelector('#app .sugrow:not(.dsrow)'); return {due:nextTipo(),txt:r?r.textContent.replace(/\s+/g,' ').trim():'',card:(document.querySelector('#app .hero[data-card^="f:"] h2')||{}).textContent,below:(()=>{ const s=document.querySelector('#app .hstack,#app .hero'), r2=document.querySelector('#app .sugrow:not(.dsrow)'); return !!(s&&r2)&&r2.getBoundingClientRect().top>=s.getBoundingClientRect().bottom-2; })()}; });
    T(A.due==='Piernas A'&&/^Piernas (recuperándose|cargadas) de ayer\s*¿Hoy Torso B\?$/.test(A.txt),`fuerza: sugiere Torso B (${A.txt})`);
    T(A.below,'la línea va debajo de la tarjeta del día');
    await p.evaluate(()=>document.querySelector('#sugGo').click()); await p.waitForTimeout(800);
    const B=await p.evaluate(()=>({due:nextTipo(),card:(document.querySelector('#app .hero[data-card^="f:"] h2')||{}).textContent,k:(document.querySelector('#app .hero[data-card^="f:"] .k')||{}).textContent,row:!!document.querySelector('#app .sugrow:not(.dsrow)'),toast:(document.querySelector('#utoast')||{}).textContent||'',rot:rotAt(addDays(hoyISO(),1))}));
    T(B.due==='Torso B'&&B.card==='Torso B'&&/por recuperación/.test(B.k)&&!B.row,`al tocarla, hoy toca Torso B (${B.card} · ${B.k})`);
    T(/Hoy: Torso B/.test(B.toast)&&/Deshacer/.test(B.toast),`con deshacer (${B.toast.replace(/\s+/g,' ')})`);
    await p.evaluate(()=>document.querySelector('#utoast button').click()); await p.waitForTimeout(700);
    T(await p.evaluate(()=>nextTipo()==='Piernas A'&&!!document.querySelector('#app .sugrow:not(.dsrow)')),'deshacer vuelve a Piernas A y a la sugerencia');
    // la empezás desde la tarjeta: arranca la rutina sugerida
    await p.evaluate(()=>document.querySelector('#sugGo').click()); await p.waitForTimeout(600);
    await p.evaluate(()=>{ fzSel=nextTipo(); nuevoDraft(fzSel); go('fuerza'); }); await p.waitForTimeout(800);
    T(await p.evaluate(()=>draft&&draft.tipo==='Torso B'),'empezar fuerza arranca Torso B');
    await p.evaluate(()=>{ draft=null; lsSave(); go('home'); }); await p.waitForTimeout(500);
    // 2. descartar: no vuelve en el día
    await p.evaluate(()=>__esc('f')); await p.waitForTimeout(800);
    await p.evaluate(()=>document.querySelector('#sugNo').click()); await p.waitForTimeout(700);
    T(await p.evaluate(()=>!document.querySelector('#app .sugrow:not(.dsrow)')&&CFG.sugNo===hoyISO()&&nextTipo()==='Piernas A'),'descartar: se va y sigue Piernas A');
    await p.evaluate(()=>{ go('hist'); }); await p.waitForTimeout(400); await p.evaluate(()=>go('home')); await p.waitForTimeout(600);
    T(await p.evaluate(()=>!document.querySelector('#app .sugrow:not(.dsrow)')),'descartada no vuelve ese día');
    // 3. sin alternativa lista: no sugiere
    await p.evaluate(()=>__esc('f2')); await p.waitForTimeout(800);
    T(await p.evaluate(()=>!document.querySelector('#app .sugrow:not(.dsrow)')&&sugHoy()===null),'si el torso también está cargado, no sugiere nada');
    // 4. todo listo: no sugiere
    await p.evaluate(()=>__esc('fresco')); await p.waitForTimeout(800);
    T(await p.evaluate(()=>sugHoy()===null&&!document.querySelector('#app .sugrow:not(.dsrow)')),'con todo listo, no dice nada');
    // 5. programa en curso: manda el orden del programa
    await p.evaluate(()=>{ __esc('f'); CFG.prog={f:{id:'base_cali',start:addDays(hoyISO(),-7)}}; }); await p.waitForTimeout(400);
    await p.evaluate(async()=>{ try{ await progLoad('base_cali'); }catch(e){} render(); }); await p.waitForTimeout(800);
    T(await p.evaluate(()=>!!progLive('f')&&sugHoy()===null),'con un programa en curso no cambia la rutina');
    await p.evaluate(()=>{ CFG.prog={}; });
    // 6. cardio: piernas cargadas y tocaban intervalos → tranqui
    await p.evaluate(()=>__esc('b')); await p.waitForTimeout(900);
    const C=await p.evaluate(()=>({S:sugHoy(),txt:(document.querySelector('#app .sugrow:not(.dsrow)')||{}).textContent||''}));
    T(C.S&&C.S.k==='b'&&/^Piernas cargadas de ayer\s*¿Hoy Bici tranqui\?/.test(C.txt.replace(/\s+/g,' ').trim()),`cardio: sugiere el tranqui (${C.txt.replace(/\s+/g,' ').trim()})`);
    await p.evaluate(()=>document.querySelector('#sugGo').click()); await p.waitForTimeout(800);
    const D=await p.evaluate(()=>({tb:planDia(hoyISO()).tpl.b,card:(document.querySelector('#app .hero[data-card^="b:"] h2')||{}).textContent,k:(document.querySelector('#app .hero[data-card^="b:"] .k')||{}).textContent}));
    T(D.tb==='tranqui'&&D.card==='Bici tranqui'&&/por recuperación/.test(D.k),`cardio: la tarjeta pasa a Bici tranqui (${D.card})`);
    await p.evaluate(()=>{ template=window.__T0; }); await p.context().close(); }
  // 7. con una sesión andando no molesta · horizontal: la línea en el panel del día
  { const p=await open(); await p.evaluate(ESC); await p.evaluate(()=>{ __esc('f'); bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); go('home'); }); await p.waitForTimeout(900);
    const LV=await p.evaluate(()=>({run:bike.running,lk:liveKind(),s:sugHoy(),row:!!document.querySelector('#app .sugrow:not(.dsrow)')}));
    T(LV.lk&&LV.s===null&&!LV.row,'con una sesión andando no sugiere '+JSON.stringify(LV));
    await p.context().close(); }
  { const p=await open(844,390); await p.evaluate(ESC); await p.evaluate(()=>__esc('f')); await p.waitForTimeout(1100);
    const H=await p.evaluate(()=>{ const r=document.querySelector('#app .sugrow:not(.dsrow)'); if(!r) return null; const a=r.getBoundingClientRect(); return {w:a.width,in:a.right<=innerWidth&&a.left>=0,txt:r.textContent.replace(/\s+/g,' ').trim()}; });
    T(H&&H.in&&/¿Hoy Torso B\?/.test(H.txt),`horizontal: la línea está en el día de hoy (${H&&H.txt})`);
    await p.context().close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
