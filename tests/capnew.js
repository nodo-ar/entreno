// perfil nuevo, de cero: node capnew.js src tag scheme  → onboarding paso a paso y cada pantalla vacía
const {chromium}=require('playwright'); const fs=require('fs');
const [src,tag,sch]=process.argv.slice(2); const O=process.env.O||'s308'; if(!fs.existsSync(O)) fs.mkdirSync(O);
const SC=[['home',"go('home')"],['homelist',"go('home')"],['hist',"go('hist')"],['arbol',"go('arbol')"],['vos',"go('vos')"],['cuerpo',"bodyCapa='r'; bodySel=null; go('cuerpo')"],
 ['statf',"histEx='fuerza'; go('stat')"],['statc',"histEx='cardio'; go('stat')"],['stattodo',"histEx='todo'; go('stat')"],['resumen',"resumenWk=null; resMode='sem'; go('resumen')"],
 ['fuerza',"draft=null; fzSel=null; go('fuerza')"],['bici',"go('bici')"],['estirar',"estSel=null; go('estirar')"],['rutinas',"progFrom='home'; prFil='todo'; go('programas')"],
 ['desafios',"dsFrom='hist'; go('desafios')"],['ajustes',"ajSec=null; go('ajustes')"],['equipo',"go('equipo')"],['perfiles',"PID=null; go('home')"]];
(async()=>{ const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:390,height:844},colorScheme:sch,deviceScaleFactor:2})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(500);
  const shot=async(n,full)=>{ await p.waitForTimeout(700); await p.screenshot({path:`${O}/${tag}_${n}_${sch}.png`,fullPage:!!full}); };
  await shot('00perfiles');
  await p.evaluate(()=>document.querySelector('#newP').click()); await p.waitForTimeout(500);
  await p.evaluate(s=>{ CFG.tema=s; applyTema(); },sch);
  await shot('01vos',true);
  await p.evaluate(()=>{ document.querySelector('#obNom').value='Ana'; document.querySelector('#obPeso').value='64'; document.querySelector('#obNext').click(); }); await p.waitForTimeout(300); await shot('01sindias');
  if(!process.env.NOCLICK) for(const i of [0,2,4]){ await p.evaluate(i=>{ const b=document.querySelector(`[data-sd="diasFS:${i}"]`); if(b) b.click(); },i); await p.waitForTimeout(150); }
  if(!process.env.NOCLICK) await p.evaluate(()=>{ const b=document.querySelector('[data-sd="diasBS:5"]'); if(b) b.click(); }); await p.waitForTimeout(150);
  await p.evaluate(()=>{ const n=document.querySelector('#obNom'); if(n&&!n.value) n.value='Ana'; const w=document.querySelector('#obPeso'); if(w&&!w.value) w.value='64'; document.querySelector('#obNext').click(); }); await shot('02equipo',true);
  if(!process.env.NOCLICK) await p.evaluate(()=>{ const b=document.querySelector('[data-eq="barra"],[data-k="barra"]'); if(b) b.click(); }); await p.waitForTimeout(300); await shot('02equipo_barra',true);
  await p.evaluate(()=>document.querySelector('#obNext').click()); await shot('03prueba');
  // pruebas: dejar lo que propone por defecto (0 en dominadas)
  for(let i=0;i<20;i++){ const st=await p.evaluate(()=>ob&&ob.step); if(st!==2) break; if(i===0||i===1) await shot('03prueba'+i); await p.evaluate(()=>document.querySelector('#obNext').click()); await p.waitForTimeout(80); }
  await shot('04plan',true);
  await p.evaluate(()=>document.querySelector('#obNext').click()); await p.waitForTimeout(600);
  await shot('05insignia'); await p.evaluate(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); if(typeof CELQ!=='undefined') CELQ.length=0; CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); });
  for(const [n,js] of SC){ await p.evaluate(js=>{ try{ eval(js); }catch(e){ console.error(e); } },js); await shot(n,n.endsWith('list')); }
  await p.evaluate(()=>{ PID=PERFILES[PERFILES.length-1].id; loadProfile(PID); }); await p.waitForTimeout(500); await p.evaluate(()=>{ ajSec=null; go('ajustes'); setTimeout(()=>scrollTo(0,99999),300); }); await shot('ajbottom');
  await p.evaluate(()=>{ const d=document.querySelector('#delP'); if(d) d.click(); }); await shot('borrada');
    fs.writeFileSync(`${O}/${tag}_${sch}_cfg.json`,JSON.stringify(await p.evaluate(()=>({cfg:CFG,ses:SESS.length,errs:0})),null,1));
  console.log('ERRS',JSON.stringify(errs)); await b.close(); })();
