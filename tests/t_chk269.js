// v267: perfil nuevo limpio y borrar a una persona con deshacer
const {chromium}=require('playwright');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400);
  const W=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>document.querySelector('#newP').click()); await W(400);
  let r=await p.evaluate(()=>({fs:CFG.diasFS.length,bs:CFG.diasBS.length,eq:Object.keys(CFG.lugares[0].equipo).length,gtg:CFG.gtg,ph:document.querySelector('#obNom').placeholder,empty:(document.querySelector('.wkempty')||{}).textContent}));
  T(r.fs===0&&r.bs===0&&r.eq===0&&r.gtg===false&&r.ph==='Tu nombre'&&r.empty==='Elegí tus días abajo.','arranca sin días, sin equipo y sin el nombre de otro '+JSON.stringify(r));
  await p.evaluate(()=>{ document.querySelector('#obNom').value='Ana'; document.querySelector('#obPeso').value='64'; document.querySelector('#obNext').click(); }); await W(400);
  T(await p.evaluate(()=>ob.step===0&&!!document.querySelector('.sdays.need')),'sin días no avanza y marca dónde elegirlos');
  for(const i of [0,2,4]){ await p.evaluate(i=>document.querySelector(`[data-sd="diasFS:${i}"]`).click(),i); await W(120); }
  await p.evaluate(()=>{ const n=document.querySelector('#obNom'); if(!n.value) n.value='Ana'; const w=document.querySelector('#obPeso'); if(!w.value) w.value='64'; document.querySelector('#obNext').click(); }); await W(400);
  T(await p.evaluate(()=>ob.step===1&&CFG.nombre==='Ana'&&CFG.diasFS.join()==='0,2,4'),'con días avanza a Equipo');
  // sin equipo: sólo pruebas sin barra ni paralelas
  T(await p.evaluate(()=>!testsDisp().some(t=>['dom','fon','hang','rod','sk_mu','sk_lsit','bulg','bici'].includes(t.k))),'sin equipo no pide dominadas, fondos ni bici');
  await p.evaluate(()=>document.querySelector('[data-eq="barra"]').click()); await W(300);
  T(await p.evaluate(()=>testsDisp().some(t=>t.k==='dom')&&!testsDisp().some(t=>t.k==='fon')),'con barra pide dominadas; sin paralelas, no fondos');
  await p.evaluate(()=>document.querySelector('#obNext').click()); await W(300);
  r=await p.evaluate(()=>{ const t=testsDisp()[ob.i]; return {k:t.k,v:document.querySelector('.stepper .val b').textContent}; });
  T(r.k==='dom'&&r.v==='0','dominadas arranca en 0, no en 8 '+JSON.stringify(r));
  for(let i=0;i<20;i++){ const st=await p.evaluate(()=>ob.step); if(st!==2) break; await p.evaluate(()=>document.querySelector('#obNext').click()); await W(60); }
  r=await p.evaluate(()=>[...document.querySelectorAll('.obarr .obr')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
  T(r.some(t=>/Dominadas.*negativas/.test(t))&&!r.some(t=>/Fondos/.test(t))&&!r.some(t=>/Barra en el día/.test(t)),'tu plan: negativas, sin fondos ni barra en el día · '+r.join(' | '));
  await p.evaluate(()=>document.querySelector('#obNext').click()); await W(900);
  r=await p.evaluate(()=>({v:view,cel:!!document.querySelector('.celov'),b:Object.keys(CFG.badges||{}),brotes:BADGES.find(x=>x.id==='brotes').t(),ds:(dsProp()||{h:{}}).h.id}));
  T(r.v==='home'&&!r.cel,'al terminar, sin festejos de insignias '+JSON.stringify(r));
  T(!r.brotes,'los escalones de las pruebas no cuentan como Mes de brotes');
  T(r.ds==='hercules','sin dominadas, el desafío de entrada es Hércules, no Perseo ('+r.ds+')');
  // borrar a Ana, deshacer, y borrar de verdad
  await p.evaluate(()=>{ SESS.push({id:'s-x1',kind:'fuerza',fecha:hoyISO(),tipo:'Libre',ej:[{n:'Plancha',series:[{t:30}],fatiga:1}]}); lsSave(); ajSec=null; go('ajustes'); }); await W(600);
  T(await p.evaluate(()=>/Borrar a Ana/.test((document.querySelector('#delP')||{}).textContent||'')),'Ajustes: Borrar a Ana');
  const pid=await p.evaluate(()=>PID);
  await p.evaluate(()=>document.querySelector('#delP').click()); await W(600);
  r=await p.evaluate(pid=>({pid:PID,list:PERFILES.map(x=>x.id),ls:localStorage.getItem(LSK+'.'+pid),t:(document.querySelector('#utoast')||{}).textContent||'',scr:!!document.querySelector('#newP')}),pid);
  T(!r.pid&&!r.list.includes(pid)&&!r.ls&&/Borraste a Ana/.test(r.t)&&r.scr,'borrada: fuera de la lista y del teléfono, con deshacer '+r.t);
  await p.evaluate(()=>document.querySelector('#utoast .utu').click()); await W(800);
  r=await p.evaluate(pid=>({pid:PID,list:PERFILES.map(x=>x.id),n:CFG&&CFG.nombre,s:SESS.some(x=>x.id==='s-x1')}),pid);
  T(r.pid===pid&&r.list.includes(pid)&&r.n==='Ana'&&r.s,'deshacer la trae con sus sesiones '+JSON.stringify(r));
  // con la base: al cerrar el aviso se purga
  await p.evaluate(()=>{ window.__del=[]; const mk=path=>({get:async()=>({docs:[{id:'a'}],exists:true}),limit(){return this;},doc:id=>({delete:async()=>{ window.__del.push(path+'/'+id); }})}); DB={collection:path=>mk(path),doc:path=>({delete:async()=>{ window.__del.push(path); }})}; ajSec=null; go('ajustes'); }); await W(500);
  await p.evaluate(()=>document.querySelector('#delP').click()); await W(300);
  T(await p.evaluate(()=>window.__del.length===0),'mientras está el aviso no borra nada de la base');
  await p.evaluate(()=>document.querySelector('#utoast .utc').click()); await W(600);
  r=await p.evaluate(()=>window.__del);
  T(r.some(x=>/sesiones\/a$/.test(x))&&r.some(x=>/medidas\/a$/.test(x))&&r.some(x=>/^perfiles\/p[a-z0-9]+$/.test(x)),'al cerrarlo, borra sesiones, medidas y el perfil · '+r.length);
  await p.evaluate(()=>{ DB=null; });
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
