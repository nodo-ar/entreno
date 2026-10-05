// v269+: respaldo de ida y vuelta: exportar → teléfono limpio → importar → comparar (sesiones, diario, medidas y ajustes),
// importar dos veces no duplica, deshacer vuelve atrás, y un archivo roto o ajeno no toca nada
const {chromium}=require('playwright'); const seed=require('./seed.js'); const fs=require('fs'); const path=require('path'); const os=require('os');
const src=process.argv[2]||'index.html'; let ok=0,bad=0; const T=(c,m)=>{ if(c) ok++; else { bad++; console.log('FAIL',m); } }; const errs=[];
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'chk276-'));
/* lo que tiene que viajar en el respaldo; la configuración sin los campos que dependen del teléfono o del momento */
const foto=()=>{ /* «updated» es la marca de cuándo se guardó en este teléfono: la app la renueva al guardar */ const sinMarca=o=>JSON.stringify(Object.fromEntries(Object.entries(o).sort().map(([k,v])=>[k,Object.fromEntries(Object.entries(v).filter(([x])=>x!=='updated'))]))); const c=Object.assign({},CFG); ['updated','lastExport','nombre'].forEach(k=>delete c[k]);
  return {sess:SESS.map(s=>s.id).sort(), sessJ:JSON.stringify([...SESS].sort((a,b)=>a.id.localeCompare(b.id))), diario:sinMarca(DIARIO), med:sinMarca(MED), cfg:JSON.stringify(c,Object.keys(c).sort())}; };
const limpio=async b=>{ const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400);
  /* teléfono limpio: un perfil nuevo con lo mínimo de la bienvenida */
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); document.querySelector('#newP').click(); }); await p.waitForTimeout(300);
  for(let i=0;i<15;i++){ const sigue=await p.evaluate(()=>{ const n=document.querySelector('#obNom'); if(n&&!n.value) n.value='Fer'; const w=document.querySelector('#obPeso'); if(w&&!w.value) w.value='82'; if(!CFG.diasFS||!CFG.diasFS.length) CFG.diasFS=[0,2,4]; if(!CFG.diasBS||!CFG.diasBS.length) CFG.diasBS=[1,3]; const s=document.querySelector('#obNext'); if(!s) return false; s.click(); return true; }); if(!sigue) break; await p.waitForTimeout(350); }
  await p.evaluate(()=>{ CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); }); return p; };
const importa=async(p,file)=>{ await p.evaluate(()=>{ go('ajustes'); }); await p.waitForTimeout(500); await p.evaluate(()=>{ ajSec='datos'; try{ render(); }catch(e){} }); await p.waitForTimeout(300);
  await p.setInputFiles('#bkFile',file); await p.waitForTimeout(900); return p.evaluate(()=>{ const u=document.querySelector('#utoast'), t=document.querySelector('#toast.show'); return ((u?u.innerText:'')+' '+(t?t.textContent:'')).replace(/\n/g,' ').trim(); }); };
(async()=>{ const b=await chromium.launch();
  // 1 · el teléfono de siempre, con historia: exportar
  const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(300); await seed(p); await p.waitForTimeout(400);
  await p.evaluate(()=>{ CELON=true; DIARIO['2026-10-01']={peso:81.5,nota:'bien',updated:Date.now()}; MED['2026-10-01']={cintura:88,updated:Date.now()}; CFG.equipo_nota='prueba'; saveCfg(); });
  const antes=await p.evaluate(foto);
  await p.evaluate(()=>{ go('ajustes'); }); await p.waitForTimeout(500); await p.evaluate(()=>{ ajSec='datos'; try{ render(); }catch(e){} }); await p.waitForTimeout(300);
  const [dl]=await Promise.all([p.waitForEvent('download',{timeout:10000}).catch(()=>null),p.evaluate(()=>document.querySelector('#bkExp').click())]);
  T(!!dl,'exportar baja un archivo'); if(!dl){ console.log('ok',ok,'bad',bad); await b.close(); process.exit(1); }
  const file=path.join(TMP,dl.suggestedFilename()); await dl.saveAs(file); const o=JSON.parse(fs.readFileSync(file,'utf8'));
  T(/^nodo-entreno_fer_\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()),'el archivo se llama nodo-entreno_<persona>_<fecha>.json · '+dl.suggestedFilename());
  T(o.app==='barra-y-bici'&&o.v===1&&typeof o.ver==='string'&&o.perfil&&o.perfil.n==='Fer'&&Array.isArray(o.sess)&&o.cfg&&o.diario&&o.med,'formato: app barra-y-bici, v 1, versión, perfil, cfg, sess, diario y med');
  T(o.sess.length===antes.sess.length,`el archivo trae todas las sesiones (${o.sess.length}/${antes.sess.length})`);
  T(await p.evaluate(()=>!!CFG.lastExport),'anota la fecha del último respaldo');
  await ctx.close();
  // 2 · teléfono limpio: importar y comparar
  const q=await limpio(b); const vacio=await q.evaluate(()=>SESS.length);
  const t1=await importa(q,file); const despues=await q.evaluate(foto);
  T(/sesiones importadas/.test(t1)&&/Deshacer/.test(t1),'avisa cuántas sesiones importó y ofrece deshacer · '+t1);
  T(despues.sessJ===antes.sessJ,`las sesiones llegan iguales (${despues.sess.length}/${antes.sess.length}, antes del import ${vacio})`);
  T(despues.diario===antes.diario,'el diario llega igual');
  T(despues.med===antes.med,'las medidas llegan iguales');
  T(despues.cfg===antes.cfg,'los ajustes llegan iguales (días, equipo, lugares, progresiones) · '+(()=>{ const a=JSON.parse(antes.cfg), d=JSON.parse(despues.cfg); return Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(d[k])).join(', '); })());
  T(await q.evaluate(()=>CFG.nombre==='Fer'),'el nombre del perfil queda');
  // 3 · importar otra vez no duplica
  await q.evaluate(()=>{ const t=document.querySelector('#utoast'); if(t) t.remove(); }); const t2=await importa(q,file);
  T(/Ya tenías todo/.test(t2)&&await q.evaluate(n=>SESS.length===n,antes.sess.length),'importar dos veces no duplica · '+t2);
  await q.context().close();
  // 4 · deshacer vuelve al teléfono como estaba
  const r=await limpio(b); const r0=await r.evaluate(foto); await importa(r,file); await r.click('#utoast .utu'); await r.waitForTimeout(900); const r1=await r.evaluate(foto);
  T(r1.sessJ===r0.sessJ&&r1.diario===r0.diario&&r1.med===r0.med&&r1.cfg===r0.cfg,'deshacer deja todo como antes de importar · '+['sessJ','diario','med','cfg'].filter(k=>r1[k]!==r0[k]).join(', ')+' · '+(()=>{ const a=JSON.parse(r0.cfg), d=JSON.parse(r1.cfg); return Object.keys(Object.assign({},a,d)).filter(k=>JSON.stringify(a[k])!==JSON.stringify(d[k])).map(k=>k+': '+JSON.stringify(a[k]).slice(0,60)+' → '+JSON.stringify(d[k]).slice(0,60)).join(' | '); })());
  await r.context().close();
  // 5 · archivos que no son un respaldo: no tocan nada
  const s=await limpio(b); const s0=await s.evaluate(foto);
  const roto=path.join(TMP,'roto.json'); fs.writeFileSync(roto,'{"app":"barra-y-bici","sess":[{"id":'); const ajeno=path.join(TMP,'ajeno.json'); fs.writeFileSync(ajeno,JSON.stringify({app:'otra',sess:[]}));
  for(const [f,n] of [[roto,'roto'],[ajeno,'de otra app']]){ await s.evaluate(()=>{ const t=document.querySelector('#utoast'); if(t) t.remove(); }); const t=await importa(s,f); const s1=await s.evaluate(foto);
    T(/no es un respaldo/.test(t)&&s1.sessJ===s0.sessJ&&s1.cfg===s0.cfg,`un archivo ${n} avisa y no toca nada · ${t}`); }
  await s.context().close();
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,3))); fs.rmSync(TMP,{recursive:true,force:true}); await b.close(); process.exit(bad?1:0); })();
