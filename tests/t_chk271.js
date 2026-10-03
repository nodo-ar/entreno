// v269: huecos del catálogo — cuerpo entero de 2 días (casa y gimnasio), 5 y 6 días en casa
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; decir=()=>{}; NAV.length=0; CFG.prog={}; });
  const W=ms=>p.waitForTimeout(ms);
  // 2 días, sin equipo
  await p.evaluate(()=>{ CFG.diasFS=[1,4]; CFG.lugares[0].equipo={}; SESS=[]; CFG.tests=Object.assign({},CFG.tests,{dom:0,fon:0,flex:3}); prFil='f'; progFrom='home'; go('programas'); }); await W(700);
  let r=await p.evaluate(()=>{ const h=[...document.querySelectorAll('#app .ajhd')].find(x=>/Entran en tus 2 días/.test(x.textContent)); return h?[...h.nextElementSibling.querySelectorAll('[data-prog]')].map(x=>x.dataset.prog):[]; });
  T(r.includes('full2c'),'2 días sin equipo: cuerpo entero en 2 días entra · '+r.join(','));
  r=await p.evaluate(()=>rutRecF({dom:0}).map(o=>o.p.id));
  T(r[0]==='full2c','recomendada con 2 días: cuerpo entero · '+r.join(','));
  await p.evaluate(()=>Promise.all(['full2c','full2g','ulppl5','ppl6c'].map(id=>progLoad(id))));
  r=await p.evaluate(()=>{ CFG.prog={f:{id:'full2c',start:hoyISO()}}; const c=progLive('f'); const d=buildDay(c.label); return {l:c.label,ks:d.ej.map(e=>e.key)}; });
  T(r.ks.length>=5&&r.ks.includes('sentadilla')&&r.ks.includes('f_bodyweight_mid_row')&&!r.ks.some(k=>['goblet','dominadas','rdl'].includes(k)),'sin equipo se arma con el propio peso · '+r.ks.join(','));
  r=await p.evaluate(()=>{ CFG.lugares[0].equipo={barra:1,mancuernas:1}; CFG.tests.dom=6; NIV_C=null; return buildDay(progLive('f').label).ej.map(e=>e.key); });
  T(r.includes('goblet')&&r.includes('dominadas')&&r.includes('rdl'),'con barra y mancuernas sube a goblet, dominadas y rumano · '+r.join(','));
  // gimnasio con 2 días
  r=await p.evaluate(()=>{ CFG.prog={}; CFG.lugares[0].equipo={barra_ol:1,banco:1,polea:1,mancuernas:1}; return PROG_IDX.filter(q=>q.a==='f'&&q.dias<=2&&!prFalta(q).length).map(q=>q.id); });
  T(r.includes('full2g')&&r.includes('full2c'),'gimnasio con 2 días: también la de gimnasio · '+r.join(','));
  // 5 y 6 días en casa con barra y mancuernas
  r=await p.evaluate(()=>{ CFG.lugares[0].equipo={barra:1,mancuernas:1}; CFG.diasFS=[0,1,2,3,4,5]; return PROG_IDX.filter(q=>q.a==='f'&&q.lug==='casa'&&q.dias>=5&&!prFalta(q).length).map(q=>q.id); });
  T(r.includes('ulppl5')&&r.includes('ppl6c'),'casa con 5 o 6 días: hay opciones · '+r.join(','));
  r=await p.evaluate(()=>{ CFG.prog={f:{id:'ppl6c',start:hoyISO()}}; const L=[]; for(let i=0;i<6;i++){ const pk=PRK.ppl6c; L.push(pk.ses[i].n); } return {n:L,ses:PRK.ppl6c.ses.length,b:buildDay(progLive('f').label).ej.map(e=>e.key)}; });
  T(r.ses===48&&r.n.join()==='Empuje A,Tracción A,Piernas A,Empuje B,Tracción B,Piernas B'&&r.b.includes('fondos_banco'),'PPL en casa: 6 sesiones por semana, fondos en banco sin paralelas · '+r.b.join(','));
  // cada una tiene su desafío y su siguiente
  r=await p.evaluate(()=>['full2c','full2g','ulppl5','ppl6c'].map(id=>[id,!!DS_DE[id],!!(RUT_SIG[id]||[]).length]));
  T(r.every(x=>x[1]&&x[2]),'desafío y siguiente para las cuatro '+JSON.stringify(r));
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
