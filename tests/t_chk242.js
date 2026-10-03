const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await p.goto('http://127.0.0.1:8765/'+src); await W8(500); await seed(p); await W8(600);
await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); });

// ---- fuerza: cada día una función del tronco
const days=await E(()=>[["Torso A","ext"],["Torso B","flex"],["Piernas A","lat"],["Piernas B","rot"]].map(([t,pt])=>{ const d=buildDay(t); const e=d.ej.find(x=>x.tr); return {t,pt,k:e&&e.key,p:e&&e.tr.p,de:e&&trDe(e.key),row:!!(e&&e.tr.n)}; }));
ok(days.every(d=>d.k&&d.p===d.pt&&d.de===d.pt&&d.row),'fuerza: Torso A arco, Torso B piernas, Piernas A inclinación, Piernas B giro · '+days.map(d=>d.t+'='+d.k).join(', '));
ok(await E(()=>!!buildDay('Torso A').ej.find(e=>e.tr&&TRONCO.ext.lv[trNiv('ext')-1].includes(e.key))),'fuerza: el ejercicio sale del tramo que corresponde');
const wu=await E(()=>({t:buildDay('Torso A').wu.map(w=>w.n),l:buildDay('Piernas B').wu.map(w=>w.n)}));
ok(wu.t.includes('Bicho muerto')&&wu.l.includes('Perro de caza'),'calentamiento: bicho muerto en torso y perro de caza en piernas');
// subir de tramo: todas las series en el tope sin llegar al límite
const up=await E(async()=>{ const lv0=trNiv('ext'), L=TRONCO.ext.lv, k=L[lv0-1].find(c=>exOk(CAT[c])), c=CAT[k], [lo,hi]=exRango(k);
  await saveSession({id:'tr1',kind:'fuerza',fecha:hoyISO(),tipo:'Torso A',ej:[{n:c.n,z:c.z,bw:true,t:c.t||undefined,fatiga:1,series:[{r:hi,kg:0},{r:hi,kg:0},{r:hi,kg:0}]}]});
  const lv1=trNiv('ext'), e=buildDay('Torso A').ej.find(x=>x.tr); return {lv0,lv1,prev:e.tr.prev,from:c.n,k:e.key}; });
ok(up.lv1===Math.min(3,up.lv0+1)&&(up.lv0===3||up.prev===up.from),`fuerza: con ${up.from} en el tope pasa al tramo ${up.lv1} (${up.k}) y lo dice: "subiste desde ${up.prev}"`);
const down=await E(async()=>{ const lv0=trNiv('ext'), k=buildDay('Torso A').ej.find(x=>x.tr).key, c=CAT[k], [lo]=exRango(k);
  await saveSession({id:'tr2',kind:'fuerza',fecha:hoyISO(),tipo:'Torso A',ej:[{n:c.n,z:c.z,bw:true,t:c.t||undefined,fatiga:3,series:[{r:Math.max(1,lo-3),kg:0},{r:1,kg:0}]}]});
  return {lv0,lv1:trNiv('ext')}; });
ok(down.lv1===Math.max(1,down.lv0-1),`fuerza: al límite y por debajo del rango vuelve un tramo (${down.lv0} → ${down.lv1})`);
await E(async()=>{ await delSession('tr1'); await delSession('tr2'); });
await E(()=>{ draft=null; nuevoDraft('Torso A'); cur=draft.plan.ej.findIndex(e=>e.tr); loadStepper(); go('fuerza'); }); await W8(1200);
const row=await E(()=>{ const r=document.querySelector('#excard .extr'); return r&&(r.innerText+(r.querySelector('svg.gi-a')?' [→]':'')); });
ok(row&&/^Tronco, que no se arquee · /.test(row)&&/(→|subiste desde|más exigente)/.test(row),'fuerza: la tarjeta dice qué función trabaja y a qué pasás · '+row);
// cambiar ejercicio: primero los de la misma función, y conserva si es por tiempo
await E(()=>document.querySelector('#swapEx').click()); await W8(600);
const sw=await E(()=>{ const bs=[...document.querySelectorAll('.swpop [data-swap]')]; return {first:bs[0]&&bs[0].dataset.swap,pts:bs.slice(0,3).map(x=>trDe(x.dataset.swap))}; });
ok(sw.first&&sw.pts[0]==='ext','cambiar ejercicio: arriba los de la misma función · '+sw.first);
const swT=await E(()=>{ const t=[...document.querySelectorAll('.swpop [data-swap]')].find(x=>CAT[x.dataset.swap].t&&trDe(x.dataset.swap)==='ext'); if(!t) return null; t.click(); const m=draft.plan.ej[cur]; return {t:m.t,ej:draft.ej[cur].t,tr:!!m.tr,n:m.n}; }); await W8(500);
ok(!swT||(swT.t&&swT.ej&&swT.tr),'cambiar ejercicio: uno por tiempo se registra en segundos y sigue siendo del tronco'+(swT?' · '+swT.n:''));
await E(()=>{ draft=null; try{ liveClear(); }catch(e){} go('home'); }); await W8(400);

// ---- habilidades
const sk=await E(()=>({n:["hollow","plat","dosap"].map(k=>SKILLS[k]&&skTier(k).t+':'+skState(k)),t:["lsit","dragon","vsit","t2b","ab_pie"].map(k=>skTier(k).t).join(','),dr:SKILLS.dragon.lv.length+':'+SKILLS.dragon.req[0].s,fl:SKILLS.flag.req.map(r=>r.s||r.t).join(','),br:BR.core.n,ex:[EX_SK.plancha,EX_SK.perro_caza,EX_SK.maleta].join(',')}));
ok(sk.n.every(x=>x==='1:avail'||x==='1:prog'),'habilidades: Hollow, Plancha lateral y Plancha a dos apoyos abiertas desde el principio');
ok(sk.t==='1,1,2,2,3','habilidades: las franjas de las que ya estaban no se corren · '+sk.t);
ok(sk.dr==='3:hollow'&&/plat/.test(sk.fl)&&sk.br==='Tronco'&&sk.ex==='hollow,dosap,plat','habilidades: dragon flag parte del hollow, la bandera pide plancha lateral, la rama se llama Tronco');
const mg=await E(()=>{ const c=migrar(Object.assign(defCfg(),{skills:{dragon:2,dragon_best:3},skUp:[["2026-01-01","dragon",1],["2026-02-01","dragon",2]]})); const c2=migrar(JSON.parse(JSON.stringify(c))); const d1=migrar(Object.assign(defCfg(),{skills:{dragon:1,dragon_best:40},skHist:{dragon:[["2026-01-01",40]]}}));
  return {h:c.skills.hollow,d:c.skills.dragon,up:JSON.stringify(c.skUp),again:c2.skills.dragon,d1:[d1.skills.hollow,d1.skills.dragon,d1.skills.hollow_best,!!d1.skHist.hollow]}; });
ok(mg.h===3&&mg.d===1&&mg.up==='[["2026-01-01","hollow",3],["2026-02-01","dragon",1]]'&&mg.again===1&&mg.d1.join()==='3,0,40,true','habilidades: el progreso de dragon flag se pasa bien al hollow, una sola vez');

// ---- movilidad
const mv=await E(()=>{ const f=buildMov({full:true}), pn=buildMov({key:'Piernas'}); return {n:f.items.filter(k=>MOV[k].ctl).length,last:f.items.filter(k=>MOV[k].z==='col').slice(-1)[0],ctl:pn.items.filter(k=>MOV[k].ctl).length,tl:f.items.filter(k=>MOV[k].ctl).every(k=>MOV[k].tl<=trLv())}; });
const mvp=await E(()=>{ const q=buildMov({key:'Piernas'}); return {it:q.items.join(' '),hoy:SESS.filter(x=>x.fecha===hoyISO()).map(x=>x.tipo).join(','),e:q.items.slice(0,-1).every(k=>movT(k)==='e'),last:q.items.at(-1),leg:q.items.filter(k=>movMus(k).some(m=>['cuadriceps','cadera','gluteos','isquios','gemelos'].includes(m))).length>=2}; });
ok(mv.n===1&&MV(mv.last)&&mv.tl&&mvp.e&&mvp.leg&&mvp.last==='ctl_9090','movilidad (v260): cuerpo entero y después de piernas cierran con la respiración 90/90; antes de hacer piernas, la vista previa ya suma estiramientos de piernas a lo del día · '+JSON.stringify(mvp)); function MV(k){ return /^ctl_/.test(k); }

// ---- cardio
const cp=await E(()=>['bici|Bici y piso|12','soga|Soga y piso|10','correr|Trote y piso|8'].map(s=>{ const [m,k,n]=s.split('|'); const P=CARDIO[m].prot[k], ps=P.ph.filter(x=>x[0]==='piso'); return ps.length===+n&&ps.every(x=>CAT[x[2]]&&!CAT[x[2]].req.length)&&/piso/.test(P.desc); }));
ok(cp.every(Boolean),'cardio: bici, soga y trote tienen bloques en el piso, sin equipo, y la descripción los nombra');
await E(()=>{ bike.running=false; bike.modo='bici'; bike.sel='Bici y piso'; bkStart(null); bike.ph=curProt().ph.findIndex(x=>x[0]==='piso'); startPhase(); go('bici'); }); await W8(1200);
const tm=await E(()=>{ const p=curProt().ph[bike.ph]; return {ph:document.querySelector('#app .bigtimer .ph').textContent,n:CAT[p[2]].n,card:!!document.querySelector('#app .cdpiso'),lv:!!document.querySelector('#app .cdlv'),pct:intensidadAhora().pct,sub:document.querySelector('#app .bigtimer .sub').textContent}; });
ok(tm.ph===tm.n&&tm.card&&!tm.lv&&tm.pct===60&&/en el piso · 1 de 12/.test(tm.sub),'cardio: en el piso se ve el ejercicio, la foto y cómo se hace, sin el nivel de la bici · '+tm.ph);
const au0=await E(()=>skAuto('bici_res'));
await E(async()=>{ bike.ph=curProt().ph.length; await finishBike(); }); await W8(1500);
const fin=await E(()=>{ const s=SESS.find(x=>x.tipo==='Bici y piso'); s.min=240; return {piso:s.piso,ej:(s.pisoEj||[]).length,au:skAuto('bici_res')}; });
ok(fin.piso>0&&fin.ej===4&&fin.au===au0,'cardio: la sesión guarda lo que se hizo en el piso y no cuenta como bici seguida');
await E(()=>{ histEx=SESS.find(x=>x.tipo==='Bici y piso').id; go('dia'); }); await W8(1200);
ok(await E(()=>/En el piso/.test(document.querySelector('#app').innerText)),'cardio: el día muestra los ejercicios del piso');
await E(()=>{ bike.running=false; bike.sel=null; bike.modo='bici'; go('bici'); }); await W8(1200);
await E(()=>[...document.querySelectorAll('[data-bsel]')].find(x=>x.dataset.bsel==='Bici y piso').click()); await W8(500);
await E(()=>document.querySelector('.pop [data-bk="hecha"]').click()); await W8(400); await E(()=>document.querySelector('.pop [data-dd]:last-child').click()); await W8(1500);
ok(await E(()=>{ const s=SESS.filter(x=>x.tipo==='Bici y piso').sort((a,b)=>+b.id.slice(2)-+a.id.slice(2))[0]; return s&&s.piso>0; }),'cardio: "Ya la hice" también marca el piso');
await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); go('home'); }); await W8(400);

// ---- héroe
const hr=await E(()=>{ const h=heroOf('atlas'); const e=heroEx(h.it[1]); return {ok:!!h&&h.fmt==='emom',q:heroQ(h.it[1],0,e),b:BADGES.find(x=>x.id==='panteon').d,nh:HEROES.length}; });
ok(hr.ok&&hr.q==='15 s por lado'&&hr.b===`Los ${['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez'][hr.nh]} desafíos`,'héroe: Atlas, uno por minuto, con la plancha lateral por lado');
await E(()=>{ heroSel='atlas'; heroV=0; go('heroe'); }); await W8(1000);
ok(await E(()=>/Atlas/.test(document.querySelector('#app h1').textContent)&&/15 s por lado/.test(document.querySelector('#app').innerText)),'héroe: la página de Atlas lista los cuatro ejercicios');

// ---- programas
const pr=await E(async()=>{ const a=await progLoad('tronco'), g=await progLoad('gimnasta');
  const aOk=a.ses.length===20&&a.ses.every(s=>s.items.every(k=>MOV[k])&&s.hk), gOk=g.ses.length===24&&g.ses.every(s=>s.ej.every(e=>[e[0],...e.slice(2)].every(k=>CAT[k])));
  return {aOk,gOk}; });
ok(pr.aOk&&pr.gOk,'programas: Tronco estable y Tronco de gimnasta se descargan y todo lo que nombran existe');
await E(()=>{ progSel='tronco'; go('programa'); }); await W8(1500);
const pt=await E(()=>document.querySelector('#app').innerText);
ok(/posturas · ~\d+ min/.test(pt)&&!/11 × 10 s/.test(pt),'programas: los días de Tronco estable dicen posturas y minutos');
await E(()=>{ progSel='gimnasta'; go('programa'); }); await W8(1500);
const gt=await E(()=>document.querySelector('#app').innerText);
ok(/en 2 grupos/.test(gt)&&!/estaciones/.test(gt),'programas: los días de Tronco de gimnasta dicen sus grupos, no "estaciones"');
const pm=await E(async()=>{ CFG.prog=CFG.prog||{}; CFG.prog.m={id:'tronco',start:hoyISO()}; const P=buildMov({prog:true}); CFG.prog.m=null; delete CFG.prog.m; return {n:P.items.length,g:movHold(P,'ctl_gato'),c:movHold(P,'ctl_curl'),r:movHold(P,'ctl_9090')}; });
ok(pm.n===11&&pm.g===40&&pm.c===10&&pm.r===60,'programas: cada postura del programa sostiene lo suyo (10 s, gato 40 s, respiración 60 s)');

// ---- glosario y fotos
const gl=await E(()=>({g:['tronco','antiext','antilat','antirot','flexcad','pallof','dragonflag'].every(k=>GLOS.some(x=>x.k===k)),c:GL_CAT.tecnica.includes('tronco')}));
ok(gl.g&&gl.c,'glosario: tronco, sus funciones, Pallof y dragon flag');
ok(await E(()=>{ const h=photo(CAT.maleta.img,null,'sq'); return /data-exi="Dumbbell_Side_Bend"/.test(h)&&/data-fr="1"/.test(h)&&!/flipper/.test(h); }),'fotos: un ejercicio puede usar un cuadro fijo');

// ---- horizontal: la fila del tronco entra en la tarjeta
await p.setViewportSize({width:844,height:390}); await E(()=>{ draft=null; nuevoDraft('Piernas A'); cur=draft.plan.ej.findIndex(e=>e.tr); loadStepper(); go('fuerza'); }); await W8(1200);
ok(await E(()=>{ const r=document.querySelector('#excard .extr'), c=document.querySelector('#excard'); if(!r) return false; const a=r.getBoundingClientRect(), k=c.getBoundingClientRect(); return a.left>=k.left&&a.right<=k.right+1&&a.height<60; }),'horizontal: la fila del tronco entra en la tarjeta');
await E(()=>{ draft=null; try{ liveClear(); }catch(e){} go('home'); });
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
