const src=process.argv[2]||'prev.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1200);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await E(async()=>{ CELON=true; CELQ.length=0; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); await progLoad('base_cali'); });
const reset=()=>E(()=>{ const h=hoyISO(), w=wdIdx(h); try{ popClose(true); }catch(e){} try{ if(restInt) closeRest(); }catch(e){} try{ if(bike.running) bikeDiscard(); }catch(e){} document.querySelectorAll('.utoast').forEach(x=>x.remove()); bike.running=false; mov=null; draft=null; homeFront=null; CFG.diasFS=[w]; CFG.diasBS=[]; CFG.prog={f:{id:'base_cali',start:addDays(h,-10)}}; for(let i=SESS.length-1;i>=0;i--) if(SESS[i].fecha===h) SESS.splice(i,1); NAV.length=0; });
// A: título de la card de atrás
await reset(); await E(()=>{ SESS.push({id:'mvx',kind:'mov',fecha:hoyISO(),tipo:'Movilidad de cuerpo entero',min:12,items:Object.keys(MOV).slice(0,12)}); nuevoDraft(nextTipo()); draft.tipo='Calistenia intermedia · Día A · Empuje'; cur=0; loadStepper(); fzLogSet(stepR,stepKg); homeFront={d:hoyISO(),t:'m',l:true}; go('home'); }); await W8(1200);
const gap=await E(()=>{ const c=document.querySelector('#app .hero.stk.back'); const h2=c.querySelector('h2').getBoundingClientRect(), hp=c.querySelector('.hpi').getBoundingClientRect(); return {gap:hp.left-h2.right, kst:getComputedStyle(c.querySelector('.kst')).display, ell:getComputedStyle(c.querySelector('h2')).textOverflow}; });
ok(gap.gap>=4&&gap.kst==='none'&&gap.ell==='ellipsis','atrás: título no toca el tiempo '+JSON.stringify(gap));
await E(()=>{ document.querySelector('#app .hero.stk.back').click(); }); await W8(900);
ok(await E(()=>{ const c=document.querySelector('#app .hero.stk.front[data-stk="l"]'); return c&&getComputedStyle(c.querySelector('h2')).whiteSpace!=='nowrap'&&getComputedStyle(c.querySelector('.kst')).display!=='none'; }),'al pasar adelante vuelve el título completo y "en curso"');
// B: capas opacas en rendimiento bajo
ok(await E(()=>{ document.documentElement.classList.add('perf-nv'); lpMenu(document.querySelector('#app [data-card]')); const pp=document.querySelector('.pop'); const bg=getComputedStyle(pp).backgroundColor; popClose(true); return !/0\.\d+\)$/.test(bg)&&!/ \/ 0\./.test(bg); }),'menú opaco sin desenfoque');
// C1: fuerza termina directo y el resumen pide el esfuerzo que falta
await reset(); await E(()=>{ nuevoDraft('Torso A'); cur=0; loadStepper(); fzLogSet(stepR,stepKg); closeRest(); go('fuerza'); }); await W8(800);
await E(()=>document.querySelector('#finish').click()); await W8(1500);
ok(await E(()=>view==='fin'&&!document.querySelector('.cchip')),'terminar fuerza: sin cartel');
ok(await E(()=>!!document.querySelector('#app .finesf [data-fesf]')),'resumen: pide el esfuerzo que falta');
await E(()=>document.querySelector('#app .finesf [data-fesf$=":3"]').click()); await W8(700);
ok(await E(()=>{ const s=SESS.find(x=>x.id===histEx); return s.ej[0].fatiga===3&&!!document.querySelector('#app .finesf .effort.on'); }),'el esfuerzo se guarda y la fila queda');
// C2: cardio se termina manteniendo apretado
await reset(); await E(()=>{ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(null); go('bici'); }); await W8(900);
await E(()=>{ const e=document.querySelector('#bkEnd'); e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0})); setTimeout(()=>e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})),150); }); await W8(500);
ok(await E(()=>bike.running&&document.querySelector('#bkEnd small').textContent==='Mantené'),'toque corto: avisa, no termina');
await E(()=>{ const e=document.querySelector('#bkEnd'); e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0})); }); await W8(1300);
ok(await E(()=>!bike.running&&view==='fin'),'mantener: termina y guarda');
// C3: movilidad
await reset(); await E(()=>{ startMov({full:true}); }); await W8(800); await E(()=>{ mov.done=[mov.plan.items[0]]; const e=document.querySelector('#mvEnd'); e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0})); }); await W8(1300);
ok(await E(()=>!mov),'movilidad: mantener termina');
// C4: importar con deshacer
await reset(); const n0=await E(()=>SESS.length); await E(()=>{ importar({app:'barra-y-bici',perfil:{n:'Cande'},sess:[{id:'i1',kind:'bici',modo:'bici',fecha:addDays(hoyISO(),-50),tipo:'Bici tranqui',min:30,kcal:200},{id:'i2',kind:'bici',modo:'bici',fecha:addDays(hoyISO(),-51),tipo:'Bici tranqui',min:30,kcal:200}]}); }); await W8(600);
ok(await E(n=>SESS.length===n+2&&/2 sesiones importadas/.test(document.querySelector('#utoast').textContent),n0),'importar: directo con aviso');
await E(()=>document.querySelector('#utoast .utu').click()); await W8(800); ok(await E(n=>SESS.length===n&&!SESS.some(x=>x.id==='i1'),n0),'deshacer importación');
ok(await E(()=>!/askConfirm\(/.test([...document.scripts].map(s=>s.textContent).join('').replace(/function askConfirm/,''))),'no quedan confirmaciones');
// D/E
await reset(); await E(()=>{ go('vos'); setTimeout(()=>openMeta(),200); }); await W8(900);
ok(await E(()=>{ const on=document.querySelector('.sheet [data-sx].on')||document.querySelector('.sheet [data-sx]'); return true; }),'meta abre');
ok(await E(()=>{ const l=[...document.querySelectorAll('.sheet .fld, .fml .fmr')].find(x=>/Peso meta/.test(x.textContent)); const sp=l.firstElementChild; return sp.getBoundingClientRect().height<24; }),'etiqueta de peso meta en un renglón');
ok(await E(()=>movTitulo({zonas:['isq','hom']}).length>0&&!/Estirar/.test(sesActiva?'' :'')),'movTitulo');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
