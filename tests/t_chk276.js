// v269+: respaldo de ida y vuelta: exportar → teléfono limpio → importar → comparar (sesiones, diario, medidas y ajustes),
// importar dos veces no duplica, deshacer vuelve atrás, y un archivo roto o ajeno no toca nada
const {chromium}=require('playwright'); const seed=require('./seed.js'); const fs=require('fs'); const path=require('path'); const os=require('os');
const src=process.argv[2]||'index.html'; let ok=0,bad=0; const T=(c,m)=>{ if(c) ok++; else { bad++; console.log('FAIL',m); } }; const errs=[];
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'chk276-'));
/* lo que tiene que viajar en el respaldo; la configuración sin los campos que dependen del teléfono o del momento */
const foto=()=>{ /* «updated» es la marca de cuándo se guardó en este teléfono: la app la renueva al guardar */ const sinMarca=o=>JSON.stringify(Object.fromEntries(Object.entries(o).sort().map(([k,v])=>[k,Object.fromEntries(Object.entries(v).filter(([x])=>x!=='updated'))]))); const c=Object.assign({},CFG); ['updated','lastExport','nombre'].forEach(k=>delete c[k]);
  return {sess:SESS.map(s=>s.id).sort(), sessJ:JSON.stringify([...SESS].sort((a,b)=>a.id.localeCompare(b.id))), diario:sinMarca(DIARIO), med:sinMarca(MED), cfg:JSON.stringify(c,Object.keys(c).sort())}; };
const limpio=async (b,nom='Fer')=>{ const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400);
  /* teléfono limpio: un perfil nuevo con lo mínimo de la bienvenida */
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); document.querySelector('#newP').click(); }); await p.waitForTimeout(300);
  for(let i=0;i<15;i++){ const sigue=await p.evaluate(nom=>{ const n=document.querySelector('#obNom'); if(n&&!n.value) n.value=nom; const w=document.querySelector('#obPeso'); if(w&&!w.value) w.value='82'; if(!CFG.diasFS||!CFG.diasFS.length) CFG.diasFS=[0,2,4]; if(!CFG.diasBS||!CFG.diasBS.length) CFG.diasBS=[1,3]; const s=document.querySelector('#obNext'); if(!s) return false; s.click(); return true; },nom); if(!sigue) break; await p.waitForTimeout(350); }
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
  // 5 · otro nombre en el teléfono: el nombre queda el del teléfono
  { const n=await limpio(b,'Ana'); await importa(n,file); T(await n.evaluate(()=>CFG.nombre==='Ana'),'el nombre del perfil del teléfono queda (Ana)'); await n.context().close(); }
  // 6 · un respaldo con datos rotos mezclados: entra lo sano, se descarta y se cuenta lo roto, y la app sigue abriendo todo
  { const malo=JSON.parse(JSON.stringify(o)); const sano=malo.sess.slice(0,5); const base=sano[0];
    const roto=[Object.assign({},base,{id:'x-fecha',fecha:'2026-13-45'}),Object.assign({},base,{id:'x-num',fecha:20260101}),Object.assign({},base,{id:'x-texto',fecha:'el martes'}),
      Object.assign({},sano.find(s=>s.kind==='fuerza'),{id:'x-ej',ej:'nada'}),Object.assign({},sano.find(s=>s.kind==='fuerza'),{id:'x-null',ej:[{n:'Dominadas',series:[null]}]}),
      Object.assign({},sano.find(s=>s.kind==='fuerza'),{id:'x-neg',ej:[{n:'Dominadas',series:[{r:-5,kg:-1e12}]}]}),Object.assign({},base,{id:'x-largo',tipo:'x'.repeat(10000)}),
      Object.assign({},base,{id:'dup'}),Object.assign({},base,{id:'dup'})];
    malo.sess=sano.concat(roto); malo.cfg=Object.assign({},malo.cfg,{diasFS:'lunes',updated:Date.now()+1e9}); malo.med={'2026-02-30':{peso:1},'2026-10-02':null};
    const f2=path.join(TMP,'malo.json'); fs.writeFileSync(f2,JSON.stringify(malo));
    const m=await limpio(b); const m0=await m.evaluate(()=>({cfg:JSON.stringify(CFG.diasFS)})); const t3=await importa(m,f2);
    const r=await m.evaluate(()=>({n:SESS.length,ids:SESS.map(s=>s.id),dias:JSON.stringify(CFG.diasFS),med:Object.keys(MED)}));
    T(/6 sesiones importadas/.test(t3)&&/7 descartadas/.test(t3),'entra lo sano (5 + un «dup»), descarta 7 y lo dice · '+t3);
    T(!r.ids.some(i=>/^x-/.test(i))&&r.ids.filter(i=>i==='dup').length===1,'no entra nada roto ni un id repetido · '+r.ids.filter(i=>/^x-|dup/.test(i)).join(','));
    T(r.dias===m0.cfg,'unos ajustes con días imposibles no entran · '+r.dias);
    T(!r.med.includes('2026-02-30'),'una medida con fecha imposible no entra');
    for(const v of ['home','hist']){ await m.evaluate(v=>{ if(v==='hist') histTab='ses'; go(v); },v); await m.waitForTimeout(600); T(await m.evaluate(()=>!/No pude mostrar/.test(document.querySelector('#app').innerText)),`después de importar, ${v} se ve bien`); }
    await m.evaluate(id=>{ histEx=id; go('dia'); },sano.find(s=>s.kind==='fuerza').id); await m.waitForTimeout(600); T(await m.evaluate(()=>!/No pude mostrar/.test(document.querySelector('#app').innerText)),'el detalle de una sesión importada se ve bien');
    await m.context().close(); }
  // 7 · el teléfono sin lugar: vuelve todo como estaba y avisa
  { const l=await limpio(b); const l0=await l.evaluate(foto);
    await l.evaluate(()=>{ const set=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(String(v).length>50000){ const e=new Error('lleno'); e.name='QuotaExceededError'; throw e; } return set.call(this,k,v); }; });
    const t4=await importa(l,file); const l1=await l.evaluate(foto); const guardado=await l.evaluate(()=>JSON.parse(localStorage.getItem(LSK+'.'+PID)).sess.length);
    T(/No hay lugar/.test(t4)&&l1.sessJ===l0.sessJ&&l1.cfg===l0.cfg&&guardado===0,'sin lugar avisa, no cambia nada y no queda nada a medias · '+t4);
    await l.context().close(); }
  // 8 · un respaldo de una versión más nueva de la app: avisa y no toca nada
  { const nv=Object.assign({},o,{v:99}); const f3=path.join(TMP,'nuevo.json'); fs.writeFileSync(f3,JSON.stringify(nv)); const u=await limpio(b); const u0=await u.evaluate(foto); const t5=await importa(u,f3); const u1=await u.evaluate(foto);
    T(/versión más nueva/.test(t5)&&u1.sessJ===u0.sessJ,'un respaldo de una versión más nueva avisa y no toca nada · '+t5); await u.context().close(); }
  // 9 · el nombre del archivo pierde los acentos (no los vuelve guion)
  { const a=await limpio(b,'José María Ñandú'); await a.evaluate(()=>{ go('ajustes'); }); await a.waitForTimeout(400); await a.evaluate(()=>{ ajSec='datos'; render(); }); await a.waitForTimeout(300);
    const [d2]=await Promise.all([a.waitForEvent('download',{timeout:10000}).catch(()=>null),a.evaluate(()=>document.querySelector('#bkExp').click())]);
    T(d2&&/^nodo-entreno_jose-maria-nandu_\d{4}-\d{2}-\d{2}\.json$/.test(d2.suggestedFilename()),'el nombre del archivo sin acentos · '+(d2&&d2.suggestedFilename())); await a.context().close(); }
  // 10 · archivos que no son un respaldo: no tocan nada
  const s=await limpio(b); const s0=await s.evaluate(foto);
  const roto=path.join(TMP,'roto.json'); fs.writeFileSync(roto,'{"app":"barra-y-bici","sess":[{"id":'); const ajeno=path.join(TMP,'ajeno.json'); fs.writeFileSync(ajeno,JSON.stringify({app:'otra',sess:[]}));
  for(const [f,n] of [[roto,'roto'],[ajeno,'de otra app']]){ await s.evaluate(()=>{ const t=document.querySelector('#utoast'); if(t) t.remove(); }); const t=await importa(s,f); const s1=await s.evaluate(foto);
    T(/no es un respaldo/.test(t)&&s1.sessJ===s0.sessJ&&s1.cfg===s0.cfg,`un archivo ${n} avisa y no toca nada · ${t}`); }
  await s.context().close();
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,3))); fs.rmSync(TMP,{recursive:true,force:true}); await b.close(); process.exit(bad?1:0); })();
