const src=process.argv[2]||'index.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[]; const bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); };
for(const W of [390,360]){ const p=await (await b.newContext({viewport:{width:W,height:800}})).newPage(); p.on('pageerror',e=>errs.push(W+' '+e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1800);
const E=(f,a)=>p.evaluate(f,a); const W8=ms=>p.waitForTimeout(ms);
/* espera la condición que se mira, no un tiempo fijo: pregunta cada 50 ms y sigue apenas se cumple; si no se cumple antes del tope, es una falla */
const hasta=async(f,a,tope)=>{ const t0=Date.now(); while(Date.now()-t0<tope){ if(await E(f,a)){ ESPERA.push(Date.now()-t0); return true; } await W8(50); } ESPERA.push(Date.now()-t0); return false; }; const ESPERA=[];
const ovf=async(tag)=>{ const r=await E(()=>{ const vw=innerWidth; const out=[]; document.querySelectorAll('#app *').forEach(e=>{ if(e.closest('.prrec,.prdays,.hrrow,.bdgrail,.swa,.segx,.tvp,.exnav,.swfil')) return; const r=e.getBoundingClientRect(); if(r.width&&(r.right>vw+1||r.left<-1)) out.push((e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className)+'|'+Math.round(r.left)+'-'+Math.round(r.right)); }); return {sw:document.documentElement.scrollWidth,vw,out:out.slice(0,5)}; }); ok(r.sw<=r.vw&&!r.out.length,`ovf ${W} ${tag} ${JSON.stringify(r)}`); };
await E(()=>{ CELON=true; PERF.modo='eq'; perfApply(); CFG.prog={}; ['lp','swipe','scrub'].forEach(hintDone); saveCfg(); });
// ---------- mixto: Recomposición ----------
await E(async()=>{ await progLoad('recomp'); await progLoad('base_cali'); CFG.prog={f:{id:'base_cali',start:hoyISO()}}; saveCfg(); });
await E(()=>{ progSel='recomp'; go('programa'); }); await W8(900);
const r0=await E(()=>({gs:document.querySelector('.prgs').textContent,kv:[...document.querySelectorAll('.prkv dt')].map(x=>x.textContent).join(),dots:document.querySelectorAll('.prday .prdk').length,days:document.querySelectorAll('.prday:not(.sk)').length,sub:[...document.querySelectorAll('.prday small')].map(x=>x.textContent).join('|')}));
ok(/Reemplaza a Base de calistenia/.test(r0.gs)&&r0.kv==='Objetivo,Progresión,Punto de partida,Semana,Equipo,Técnicas,Desafío'&&r0.dots===7&&r0.days===7&&/en 3 grupos/.test(r0.sub),'recomp ficha '+JSON.stringify(r0)); await ovf('recomp ficha');
await E(()=>{ const x=document.querySelector('#prStart'); if(x) x.click(); else window.__miss=(window.__miss||[]).concat('#prStart'); }); await W8(900);
const r1=await E(()=>({prog:JSON.stringify(CFG.prog),f:(progLive('f')||{}).label,b:(progLive('b')||{}).label,fi:(progLive('f')||{}).i,bi:(progLive('b')||{}).i,nt:nextTipo(),go:(document.querySelector('#prGo')||{}).textContent}));
ok(!/base_cali/.test(r1.prog)&&/recomp/.test(r1.prog)&&r1.f==='Recomposición · Torso A'&&r1.b==='Recomposición · Bici suave'&&r1.fi===0&&r1.bi===1&&r1.nt==='Recomposición · Torso A'&&/Torso A/.test(r1.go),'recomp start '+JSON.stringify(r1));
// sesión de fuerza del programa: grupos del paquete
await E(()=>{ fzSel=null; draft=null; go('fuerza'); }); await W8(700);
await E(()=>{ nuevoDraft(nextTipo()); draft.wu=draft.wu.map(()=>true); draft.aprox=null; go('fuerza'); }); await W8(700);
const s0=await E(()=>({ss:draft.plan.ej.map(m=>m.ss+':'+m.rest).join(' '),prog:JSON.stringify(draft.prog),bar:!!document.querySelector('.ssbar'),caps:document.querySelectorAll('.exnav .exg').length,k:(document.querySelector('.ssk')||{}).textContent,flow:(document.querySelector('.ssflow')||{}).textContent}));
ok(s0.ss==='A1:0 A2:120 B1:0 B2:90 C1:0 C2:60'&&/"i":0/.test(s0.prog)&&s0.bar&&s0.caps===3&&/Superserie A/.test(s0.k)&&/Sin pausa/.test(s0.flow)&&/2 min/.test(s0.flow),'grupos del paquete '+JSON.stringify(s0)); await ovf('sesion grupos');
const s1=await E(()=>{ const R=()=>restInt?Math.round((restEnd-Date.now())/1000):0; const o=[]; startRest(60,null); fzLogSet(8,0); o.push(cur+':'+R()+(document.querySelector('#rest').hidden?'':'!')); fzLogSet(10,0); o.push(cur+':'+R()); closeRest(); return o.join(' '); });
ok(s1==='1:0 0:120','avance en superserie '+s1);
// drop set en la última del curl (C2 de Torso B viene con drop): probamos con press
const s2=await E(()=>{ cur=2; loadStepper(); const m=draft.plan.ej[2]; m.st=[null,'d']; fzLogSet(10,10); cur=2; render(); return {pend:fzPend(draft.ej[2]),rest:!!restInt}; }); await W8(300);
await E(()=>{ closeRest(); cur=2; fzLogSet(9,10); }); await W8(300);
const s3=await E(()=>({pend:fzPend(draft.ej[2]),cur,subrow:!!document.querySelector('.sr.sub.nx [data-ok="101"]'),hint:(document.querySelector('.tyhint')||{}).textContent,rest:!!restInt}));
ok(s2.pend===null&&s3.pend===1&&s3.cur===2&&s3.subrow&&/Sin descanso/.test(s3.hint)&&!s3.rest,'drop pendiente '+JSON.stringify([s2,s3])); await ovf('drop pend');
await E(()=>{ const x=document.querySelector('.sr.sub.nx [data-ok="101"]'); if(x) x.click(); }); await W8(300);
const s4=await E(()=>({sub:JSON.stringify(draft.ej[2].series[1].sub),ty:draft.ej[2].series[1].ty,cur,rest:restInt?Math.round((restEnd-Date.now())/1000):0}));
ok(s4.ty==='d'&&/"kg":7.5/.test(s4.sub)&&s4.cur===3&&s4.rest===0,'drop hecho '+JSON.stringify(s4));
await E(()=>{ closeRest(); });
// rest-pause: dos mini-series con pausa de 15 s
const s5=await E(()=>{ cur=4; loadStepper(); draft.plan.ej[4].st=['r']; fzLogSet(8,5); const r1=pausaLeft(), p1=!!restInt; fzSubLog(0,3,5); const r2=pausaLeft(); fzSubLog(0,2,5); return {r1:p1?-1:r1,r2,n:draft.ej[4].series[0].sub.length,pend:fzPend(draft.ej[4]),tm:!!document.querySelector('.tymini')||true}; });
ok(s5.r1===15&&s5.r2===15&&s5.n===2&&s5.pend===null,'rest-pause '+JSON.stringify(s5)); await E(()=>closeRest());
// menú de tipo de serie
await E(()=>{ cur=0; loadStepper(); draft.plan.ej[0].sets=Math.max(3,draft.plan.ej[0].sets); render(); }); await W8(300);
await E(()=>{ const x=document.querySelector('#excard [data-ty="2"]'); if(x) x.click(); else window.__miss=(window.__miss||[]).concat('#excard [data-ty="2"]'); }); await W8(400);
const t1=await E(()=>({n:document.querySelectorAll('.cmpop [data-cm]').length,t:(document.querySelector('.cmpop .lptitle')||{}).textContent}));
await E(()=>{ const x=document.querySelector('.cmpop [data-cm="a"]'); if(x) x.click(); else window.__miss=(window.__miss||[]).concat('.cmpop [data-cm="a"]'); }); await W8(300);
const t2=await E(()=>({st:JSON.stringify(draft.plan.ej[0].st),b:(document.querySelector('#excard [data-ty="2"]')||{}).textContent,meta:document.querySelector('#excard .exmeta b').textContent}));
ok(t1.n===5&&/Serie 3/.test(t1.t)&&/"a"/.test(t2.st)&&t2.b==='3+'&&/\+/.test(t2.meta),'menú tipo '+JSON.stringify([t1,t2]));
// historial muestra tipos y mini-series
const h1=await E(()=>{ fzAntesDeGuardar(); const s=clean(draft); return sesEjList(s); });
ok(/setty ty-d/.test(h1)&&/setc sub/.test(h1)&&/sstag">A1/.test(h1),'historial tipos');
// superserie manual, separar y juntar todo
await E(()=>{ nuevoDraft('Torso A'); draft.wu=draft.wu.map(()=>true); draft.aprox=null; go('fuerza'); }); await W8(500);
const m1=await E(()=>{ const n0=draft.plan.ej.map(m=>m.n); cur=0; ssLink(0,3); const a=draft.plan.ej.map(m=>(m.ss||'-')+':'+m.rest).slice(0,4).join(' '); const moved=draft.plan.ej[1].n===n0[3]&&draft.ej[1].n===n0[3]; cur=1; ssUnlink(1); const b2=draft.plan.ej.map(m=>m.ss||'-').join(' '); return {a,moved,b2}; });
ok(/^A1:0 A2:\d+ -/.test(m1.a)&&m1.moved&&!/A/.test(m1.b2),'link/unlink '+JSON.stringify(m1));
await E(()=>{ cur=0; render(); document.querySelector('#exMore').click(); }); await W8(400);
const m2=await E(()=>[...document.querySelectorAll('.exmore [data-exm]')].map(x=>x.dataset.exm).join());
await E(()=>{ const x=document.querySelector('.exmore [data-exm="ss"]'); if(x) x.click(); else window.__miss=(window.__miss||[]).concat('.exmore [data-exm="ss"]'); }); await W8(400);
const m3=await E(()=>({n:document.querySelectorAll('.sspk [data-ssj]').length,t:(document.querySelector('.sspk .lptitle')||{}).textContent}));
await E(()=>{ const x=document.querySelector('.sspk [data-ssj]'); if(x) x.click(); else window.__miss=(window.__miss||[]).concat('.sspk [data-ssj]'); }); await W8(400);
const m4=await E(()=>({ss:draft.plan.ej[0].ss,ss2:draft.plan.ej[1].ss,bar:!!document.querySelector('.ssbar')}));
ok(m2.startsWith('swap,ss')&&m3.n>=4&&/Superserie con/.test(m3.t)&&m4.ss==='A1'&&m4.ss2==='A2'&&m4.bar,'menú superserie '+JSON.stringify([m2,m3,m4]));
const m5=await E(()=>{ ssAuto(); const P=draft.plan.ej; const L={}; P.forEach((m,i)=>{ if(m.ss) (L[m.ss[0]]=L[m.ss[0]]||[]).push(i); }); return {g:Object.values(L).map(a=>a.length).join(),adj:Object.values(L).every(a=>a.every((x,q)=>!q||x===a[q-1]+1)),rails:document.querySelectorAll('.exnav .exg').length}; });
ok(/^2(,2)+$/.test(m5.g)&&m5.adj&&m5.rails>=2,'juntar todo '+JSON.stringify(m5)); await ovf('sesion auto');
// guardar como rutina conserva los grupos
const g1=await E(async()=>{ draft.ej.forEach((e,i)=>{ e.series=[{r:8,kg:10}]; }); fzAntesDeGuardar(); const s=clean(draft); s.id='s-rt'; s.tipo='Prueba'; s.kind='fuerza'; openGuardarRutina(s); if(!document.querySelector('#dynsheet')) await new Promise(r=>setTimeout(r,800)); const sh=document.querySelector('#dynsheet')||document.querySelector('#app'); sh.querySelector('#rtN').value='Mía ss'; sh.querySelector('#rtN').dispatchEvent(new Event('input')); (sh.querySelector('#rtOk')||sh.querySelector('#fmOk')).click(); const r=rutinas().find(x=>x.n==='Mía ss'); const d=dayDef('Mía ss'); const q=buildDay('Mía ss'); return {rs:r&&r.ej.filter(x=>x.ss).length,g:d.x&&Object.keys(d.x.g).length,b:q.ej.filter(m=>m.ss).length}; });
ok(g1.rs>=4&&g1.g===g1.rs&&g1.b===g1.rs,'rutina con grupos '+JSON.stringify(g1));
await E(()=>{ draft=null; closeRest(); });
// guardar sesión del programa mixto y ver que avance por tipo
await E(()=>{ SESS.unshift({id:'s-rc0',kind:'fuerza',fecha:hoyISO(),tipo:'Recomposición · Torso A',dur:50,ej:[],vol:0,prog:{id:'recomp',i:0}}); });
const x1=await E(()=>({f:(progLive('f')||{}).i,b:(progLive('b')||{}).i,n:progNext(CFG.prog.x),rot:rotAt(addDays(hoyISO(),3))}));
ok(x1.f===2&&x1.b===1&&x1.n===1&&/Recomposición · /.test(x1.rot),'mixto avanza '+JSON.stringify(x1));
await E(()=>{ progSel='recomp'; go('programa'); }); await W8(700);
const x2=await E(()=>({go:document.querySelector('#prGo').textContent,ok:document.querySelectorAll('.prday.ok').length,cur:document.querySelectorAll('.prday.cur').length,ss:document.querySelector('.prss').textContent}));
ok(/Bici suave/.test(x2.go)&&x2.ok===1&&x2.cur===1&&/1\/56/.test(x2.ss),'ficha mixta en curso '+JSON.stringify(x2));
await E(()=>{ go('home'); }); await W8(700); ok(await E(()=>!!document.querySelector('.hwkr[data-proghome="recomp"]')),'inicio muestra el mixto');
// empezar un cardio saca al mixto
await E(async()=>{ await progLoad('c0a5'); progSel='c0a5'; go('programa'); }); await W8(700);
ok(/Reemplaza a Recomposición/.test(await E(()=>document.querySelector('.prgs').textContent)),'cardio reemplaza al mixto');
await E(()=>{ const x=document.querySelector('#prStart'); if(x) x.click(); else window.__miss=(window.__miss||[]).concat('#prStart'); }); await W8(700);
ok(await E(()=>!CFG.prog.x&&CFG.prog.b&&CFG.prog.b.id==='c0a5'),'mixto quitado');
// ---------- 5/3/1: máximo de entrenamiento y % ----------
await E(async()=>{ Object.assign(lugar().equipo,{barra_ol:true,banco:true,polea:true}); await progLoad('w531'); CFG.prog={f:{id:'w531',start:hoyISO()}}; delete CFG.tm; SESS.unshift({id:'s-sq',kind:'fuerza',fecha:addDays(hoyISO(),-3),tipo:'Libre',dur:40,vol:0,ej:[{n:'Sentadilla trasera con barra',series:[{r:5,kg:100}]},{n:'Press de banca con barra',series:[{r:5,kg:70}]}]}); saveCfg(); });
const w1=await E(()=>{ nuevoDraft(nextTipo()); const P=draft.plan.ej; const sq=P.find(m=>m.key==='sent_barra'); cur=P.indexOf(sq); loadStepper(); return {tm:sq&&sq.tm,kg:stepKg,r:stepR,st:JSON.stringify(sq&&sq.st),sets:sq&&sq.sets,nota:!!draft.plan.nota}; });
ok(w1.tm===105&&w1.kg===67.5&&w1.r===5&&w1.sets===8&&/null,null,"a"/.test(w1.st)&&w1.nota,'5/3/1 '+JSON.stringify(w1));
await E(()=>{ go('fuerza'); }); await W8(600);
const w2=await E(()=>({meta:[...document.querySelectorAll('#excard .exmeta')].map(x=>x.textContent).join('|'),rows:[...document.querySelectorAll('#excard .sr [data-kg]')].slice(0,4).map(x=>x.value).join(','),nota:!!document.querySelector('.fznota')}));
ok(/5 · 5 · 5\+ · 5×5/.test(w2.meta)&&/Máx. de entrenamiento 105 kg/.test(w2.meta)&&w2.rows==='67,5,80,90,67,5'&&w2.nota,'5/3/1 pantalla '+JSON.stringify(w2)); await ovf('531');
await E(()=>{ draft=null; });
// ---------- GZCLP: cambio de esquema al fallar ----------
await E(async()=>{ await progLoad('gzclp'); CFG.prog={f:{id:'gzclp',start:hoyISO()}}; SESS.unshift({id:'s-gz',kind:'fuerza',fecha:addDays(hoyISO(),-2),tipo:'GZCLP · A1',dur:50,vol:0,ej:[{n:'Sentadilla trasera con barra',esq:0,series:[{r:3,kg:90},{r:3,kg:90},{r:3,kg:90},{r:2,kg:90},{r:2,kg:90}]},{n:'Press de banca con barra',esq:0,series:[{r:10,kg:50},{r:10,kg:50},{r:10,kg:50}]}]}); saveCfg(); });
const z1=await E(()=>{ const q=buildDay('GZCLP · A1'); const sq=q.ej[0], bp=q.ej[1], t3=q.ej[2]; draft=null; nuevoDraft('GZCLP · A1'); cur=0; loadStepper(); const k0=stepKg; cur=1; loadStepper(); return {sq:sq.sets+'x'+sq.lo+':'+sq.esqK, bp:bp.sets+'x'+bp.lo+':'+bp.esqK, t3:t3.sets+'x'+t3.lo+JSON.stringify(t3.st), k0, k1:stepKg}; });
ok(z1.sq==='6x2:1'&&z1.bp==='3x10:0'&&/3x15.*"a"/.test(z1.t3)&&z1.k0===90&&z1.k1===52.5,'gzclp '+JSON.stringify(z1));
await E(()=>{ draft=null; });
// ---------- 100 flexiones: columna según tu mejor serie ----------
await E(async()=>{ await progLoad('cien'); CFG.prog={f:{id:'cien',start:hoyISO()}}; CFG.tests=Object.assign(CFG.tests||{},{flex:15}); SESS=SESS.filter(x=>!(x.ej||[]).some(e=>e.n==='Flexiones')); saveCfg(); });
const c1=await E(()=>{ const q=buildDay(nextTipo()); const f=q.ej[0]; return {sr:(f.sr||[]).join(','),st:JSON.stringify(f.st),rest:f.rest}; });
ok(c1.sr==='10,12,7,7,9'&&/null,null,null,null,"a"/.test(c1.st)&&c1.rest===60,'100 flexiones '+JSON.stringify(c1));
// ---------- Armstrong: pirámide con descanso por rep ----------
await E(async()=>{ await progLoad('armstrong'); CFG.prog={f:{id:'armstrong',start:addDays(hoyISO(),-2)}}; SESS.unshift({id:'s-ar',kind:'fuerza',fecha:addDays(hoyISO(),-1),tipo:'Armstrong · Máximas',dur:20,vol:0,ej:[],prog:{id:'armstrong',i:0}}); saveCfg(); });
console.log('DBG',W,await E(()=>{ const nt=nextTipo(); const q=buildDay(nt); return nt+' '+q.ej.map(m=>m.key).join(',')+' mol:'+JSON.stringify(molArt())+' '+JSON.stringify(q.mol.fuera); }));
const a1=await E(()=>{ nuevoDraft(nextTipo()); const P=draft.plan.ej; const d=P[1]; cur=1; loadStepper(); const r0=stepR; fzLogSet(1,0); cur=1; fzLogSet(2,0); const rest=restInt?Math.round((restEnd-Date.now())/1000):0; closeRest(); return {t:draft.tipo,sets:d.sets,sr:fmtSR(d.sr,d.st),r0,rest}; });
ok(/Pirámide/.test(a1.t)&&a1.sets===11&&a1.sr==='1–10 · 10+'&&a1.r0===1&&a1.rest===20,'armstrong '+JSON.stringify(a1));
await E(()=>{ draft=null; });
// ---------- 7 minutos: estaciones por tiempo en circuito ----------
await E(async()=>{ await progLoad('siete'); CFG.prog={f:{id:'siete',start:hoyISO()}}; saveCfg(); });
const v1=await E(()=>{ nuevoDraft(nextTipo()); draft.wu=draft.wu.map(()=>true); const P=draft.plan.ej; go('fuerza'); return {n:P.length,g:P.filter(m=>m.ss).length,dur:P.every(m=>m.dur===30&&m.t&&m.auto),rest:P.slice(0,11).every(m=>m.rest===10)&&P[11].rest===60,sets:P[0].sets,k:grpKind(P.length)}; }); await W8(500);
const v2=await E(()=>({kind:(document.querySelector('.ssk')||{}).textContent,val:(document.querySelector('#excard .sr.nx [data-r]')||{}).value,tmr:!!document.querySelector('#excard [data-tmr="0"]')}));
ok(v1.n===12&&v1.g===12&&v1.dur&&v1.rest&&v1.sets===1&&/Circuito A/.test(v2.kind)&&v2.val==='30'&&v2.tmr,'7 minutos '+JSON.stringify([v1,v2])); await ovf('7 min');
const v3=await E(()=>{ fzLogSet(30,0); const c=cur, r=pausaLeft(), pnl=!document.querySelector('#rest').hidden; return c+':'+r+(pnl?':panel':'')+(document.querySelector('#miniT')?':cuenta':''); });
ok(v3==='1:10:cuenta','estación siguiente sin panel '+v3);
await E(()=>{ draft=null; closeRest(); CFG.prog={}; ['barra_ol','banco','polea'].forEach(k=>delete lugar().equipo[k]); saveCfg(); });
// ---------- base_cali v2 reemplaza al v1 guardado ----------
const bc=await E(async()=>{ delete PRK.base_cali; localStorage.setItem(LSK+'.pk.base_cali',JSON.stringify({id:'base_cali',v:1,ses:[{t:'f',n:'Viejo',wu:'torso',ej:[],rep:{}}]})); const a=progPack('base_cali'); const o=await progLoad('base_cali'); return {a:!!a,v:o.v,g:!!o.ses[0].g}; });
ok(!bc.a&&bc.v===3&&bc.g,'paquete con versión '+JSON.stringify(bc));
// ---------- catálogo y fichas de los 30 ----------
for(const f of ['todo','f','o','b','m','x']){ await E(f=>{ prFil=f; progFrom='home'; go('programas'); },f); await W8(500); await ovf('cat '+f); }
await E(()=>{ prFil='todo'; render(); }); await W8(400); await E(()=>{ const b=document.querySelector('#prPickB'); if(b) b.click(); }); await W8(400);
const cc=await E(()=>({chips:document.querySelectorAll('.prfil button').length,menu:[...document.querySelectorAll('.pop [data-cm]')].map(x=>x.dataset.cm).join()})); await E(()=>{ try{ popClose(true); }catch(e){} });
ok(cc.chips===0&&cc.menu==='todo,f,o,b,m,x','filtro de programas: menú, sin chips '+JSON.stringify(cc));
await E(()=>{ prFil='f'; render(); }); await W8(300);
const cf=await E(()=>[...document.querySelectorAll('.ajhd.sgh')].map(x=>x.textContent).join('|'));
/* desde v263 las secciones van por días, con objetivos aparte */
ok(/^Entran en tus 4 días\d+\|Con más días[^|]*\|Objetivos[^|]*\|Te falta equipo[^|]*\|Con cardio\d+$/.test(cf)&&!/Calistenia|En casa|Gimnasio/.test(cf),'secciones fuerza '+cf);
const ids=await E(()=>PROG_IDX.map(p=>p.id));
for(const id of ids){ await E(id=>{ progSel=id; go('programa'); },id); ok(await hasta(id=>{ const v=document.querySelector('#app .view'); /* las animaciones finitas de la vista y de lo de adentro (los latidos infinitos no cuentan) */ return !!progPack(id)&&!!document.querySelector('#app .prday')&&!document.querySelector('#app .prday.sk')&&!!v&&v.getAnimations({subtree:true}).every(x=>x.playState!=='running'||x.effect.getTiming().iterations===Infinity); },id,10000),'ficha '+id+': carga y entra en menos de 10 s'); const d=await E(()=>({days:document.querySelectorAll('.prday:not(.sk)').length,sk:document.querySelectorAll('.prday.sk').length})); ok(d.days>0&&!d.sk,'ficha '+id+' '+JSON.stringify(d)); await ovf('ficha '+id); }
// recomendaciones: con barra, mancuernas y bici aparece el mixto
const rc=await E(()=>progRecs().map(o=>o.p.id).join(','));
ok(/recomp/.test(rc)||!has('bici'),'recs '+rc);
console.log('ESPERA',W,'máx',Math.max(...ESPERA),'ms · media',Math.round(ESPERA.reduce((s,x)=>s+x,0)/ESPERA.length),'ms'); ESPERA.length=0; console.log('MISS',W,await E(()=>window.__miss||[])); await p.close(); }
console.log('BAD',JSON.stringify(bad,null,1)); console.log('ERRS',JSON.stringify(errs)); await b.close(); })();
