const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const mk=async(W,Hh,sch)=>{ const p=await (await b.newContext({viewport:{width:W,height:Hh},colorScheme:sch||'dark'})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(900);
  await p.evaluate(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); CFG.movNo=null; const h=hoyISO(); for(let i=SESS.length-1;i>=0;i--) if(SESS[i].fecha===h) SESS.splice(i,1); }); return p; };
const fin=(p,kind)=>p.evaluate(kind=>{ const h=hoyISO(), id='x'+Date.now(); if(kind==='f'){ SESS.unshift({id,kind:'fuerza',fecha:h,tipo:'Torso A',dur:40,vol:1200,ej:[{n:'Dominadas',series:[{r:8,kg:0}]}]}); finCtx={mov:{key:'Torso',label:'Torso A'}}; } else { SESS.unshift({id,kind:'bici',modo:'bici',fecha:h,tipo:'Bici tranqui',min:40,kcal:360}); finCtx={askEsf:true,sel:'suave',mov:{key:'bici',label:CARDIO.bici.n}}; } histEx=id; go('fin'); return id; },kind);
const ask=p=>p.evaluate(()=>{ const e=document.querySelector('#finAsk'); if(!e) return null; const r=e.getBoundingClientRect(), o=document.querySelector('#finOk').getBoundingClientRect(); return {top:r.top,bot:r.bottom,l:r.left,r:r.right,okTop:o.top,vw:innerWidth,old:!!document.querySelector('#finMovSi,#finMovNo')}; });
const W8=(p,ms)=>p.waitForTimeout(ms);
// 1. cardio: aparece sola, arriba de Listo, sin la tarjeta vieja
let p=await mk(390,844); await fin(p,'b'); await W8(p,300);
ok(!(await ask(p)),'no aparece de golpe: espera a que asiente la pantalla');
await W8(p,1150); let a=await ask(p);
ok(a&&!a.old,'aparece flotando y ya no está la tarjeta del fondo');
ok(a&&a.bot<=a.okTop-6&&a.l>=15&&a.r<=a.vw-15,'arriba de Listo, dentro de la pantalla '+JSON.stringify(a));
// al fondo sigue arriba de Listo
await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight)); await W8(p,400); a=await ask(p);
ok(a&&a.bot<=a.okTop-6,'al fondo acompaña a Listo '+JSON.stringify(a));
ok(await p.evaluate(()=>{ const e=document.querySelector('#finAsk').getBoundingClientRect(); const cs=[...document.querySelectorAll('#app .stag>.card')]; const last=cs[cs.length-1].getBoundingClientRect(); return last.bottom<=e.top-4; }),'al fondo no tapa la última tarjeta');
// re-render (elegir esfuerzo) no la vuelve a animar ni la duplica
const id0=await p.evaluate(()=>{ const e=document.querySelector('#finAsk'); e.dataset.mark='1'; document.querySelector('[data-cfat="2"]').click(); return 1; }); await W8(p,500);
ok(await p.evaluate(()=>document.querySelectorAll('#finAsk').length===1&&document.querySelector('#finAsk').dataset.mark==='1'),'al elegir esfuerzo sigue la misma, sin duplicarse');
// × = hoy no: se va, se recuerda, Semana deja de ofrecerla
await p.evaluate(()=>document.querySelector('#finAsk .fax').click()); await W8(p,400);
ok(await p.evaluate(()=>!document.querySelector('#finAsk')&&CFG.movNo===hoyISO()&&!document.body.classList.contains('fask-on')),'× la saca y queda "hoy no"');
await p.evaluate(()=>render()); await W8(p,900); ok(!(await ask(p)),'dicho que no, no vuelve en la misma pantalla');
await p.evaluate(()=>{ finCtx=null; go('home'); }); await W8(p,900);
ok(await p.evaluate(()=>!document.querySelector('#app .mvfoot[data-mov]')&&![...document.querySelectorAll('#app .mvfoot')].some(x=>/Movilidad después · \d+ min ·/.test(x.textContent))),'en Semana ya no la ofrece hoy');
// otra sesión el mismo día: tampoco pregunta
await fin(p,'f'); await W8(p,1500); ok(!(await ask(p)),'después de fuerza el mismo día tampoco pregunta');
await p.close();
// 2. sin contestar: Listo la saca; no persigue; Semana conserva la línea tranquila
p=await mk(390,844); await fin(p,'b'); await W8(p,1500); ok(!!(await ask(p)),'aparece de nuevo en un día sin respuesta');
await p.evaluate(()=>document.querySelector('#finOk').click()); await W8(p,900);
ok(await p.evaluate(()=>!document.querySelector('#finAsk')&&view==='home'&&!CFG.movNo),'Listo sin contestar: se va con la pantalla y no queda como "no"');
ok(await p.evaluate(()=>[...document.querySelectorAll('#app .mvfoot')].some(x=>/Movilidad después/.test(x.textContent))),'en Semana queda la línea de siempre');
for(const v of ['hist','arbol','vos']){ await p.evaluate(v=>go(v),v); await W8(p,700); ok(!(await ask(p)),`no aparece en ${v}`); }
// Empezar arranca la movilidad del cardio
await p.evaluate(()=>go('home')); await W8(p,500); await fin(p,'b'); await W8(p,1500);
await p.evaluate(()=>document.querySelector('#finAsk .fay').click()); await W8(p,900);
ok(await p.evaluate(()=>view==='mov'&&!!mov&&!!mov.plan.ctx.ref&&!document.querySelector('#finAsk')),'Empezar arranca la movilidad ligada a la sesión');
await p.evaluate(()=>{ mov.done=mov.plan.items.slice(); finishMov(); }); await W8(p,900);
await fin(p,'b'); await W8(p,1500); ok(!(await ask(p)),'con la movilidad hecha no pregunta');
await p.close();
// 3. deslizar hacia abajo = hoy no
p=await mk(390,844,'light'); await fin(p,'b'); await W8(p,1500); a=await ask(p);
await p.mouse.move(a.l+70,(a.top+a.bot)/2); await p.mouse.down(); await p.mouse.move(a.l+70,(a.top+a.bot)/2+20,{steps:4});
ok(await p.evaluate(()=>/translate/.test(document.querySelector('#finAsk').style.transform)&&document.querySelector('#finAsk').getBoundingClientRect().top>0),'sigue al dedo');
await p.mouse.move(a.l+70,(a.top+a.bot)/2+70,{steps:4}); await p.mouse.up(); await W8(p,500);
ok(await p.evaluate(()=>!document.querySelector('#finAsk')&&CFG.movNo===hoyISO()),'deslizada hacia abajo = hoy no');
await p.close();
// 3b. deslizar poquito vuelve a su lugar
p=await mk(390,844); await fin(p,'b'); await W8(p,1500); a=await ask(p);
await p.mouse.move(a.l+70,(a.top+a.bot)/2); await p.mouse.down(); await p.mouse.move(a.l+70,(a.top+a.bot)/2+18,{steps:4}); await p.mouse.up(); await W8(p,500);
ok(await p.evaluate(()=>{ const e=document.querySelector('#finAsk'); return e&&!e.style.transform&&!CFG.movNo; }),'un tirón corto vuelve a su lugar');
await p.close();
// 4. pantalla chica y con movilidad apagada
p=await mk(320,568); await fin(p,'b'); await W8(p,1500); a=await ask(p);
ok(a&&a.bot<=a.okTop-6&&a.l>=15&&a.r<=305,'320×568: entra y queda arriba de Listo');
ok(await p.evaluate(()=>{ const e=document.querySelector('#finAsk'); const r=e.getBoundingClientRect(); const t=e.querySelector('.fat b'); return t.scrollWidth<=t.clientWidth+1&&[...e.querySelectorAll('button')].every(x=>{ const q=x.getBoundingClientRect(); return q.right<=r.right+.5&&q.width>=34; }); }),'320: el título entra entero y los botones tienen tamaño de dedo');
await p.evaluate(()=>{ CFG.mov.post=false; go('home'); }); await W8(p,400); await fin(p,'b'); await W8(p,1500); ok(!(await ask(p)),'con "después de entrenar" apagado no pregunta');
await p.close();
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
