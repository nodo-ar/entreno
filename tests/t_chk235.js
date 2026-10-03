const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const mk=async(vp)=>{ const ctx=await b.newContext({viewport:vp}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(900);
  await p.evaluate(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); }); return p; };
const W8=(p,ms)=>p.waitForTimeout(ms);
// ---------- Todo: vista general legible ----------
let p=await mk({width:390,height:844});
await p.evaluate(()=>{ TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(p,1400);
await p.evaluate(()=>document.querySelector('.tri[data-tf3="t"]').click()); await W8(p,900);
const T=await p.evaluate(()=>{ const el=document.querySelector('.ttodo'); if(!el) return null; const nb=el.querySelectorAll('[data-tsb]').length, nt=Object.keys(BR).filter(b=>Object.keys(SKILLS).some(k=>SKILLS[k].br===b)).length; const fs=Math.min(...[...el.querySelectorAll('.ttn')].map(x=>parseFloat(getComputedStyle(x).fontSize))); const r=el.getBoundingClientRect(), rail=document.querySelector('.trail').getBoundingClientRect(); return {nb,nt,fs,over:r.right>rail.left+1,cols:el.querySelectorAll('.ttc').length}; });
ok(T&&T.nb===T.nt&&T.cols===3,'Todo: los tres tipos con todas sus ramas '+JSON.stringify(T));
ok(T&&T.fs>=13,'Todo: los nombres se leen (≥ 13 px)');
ok(T&&!T.over,'Todo: no se mete debajo del riel');
const sb=await p.evaluate(()=>{ const x=[...document.querySelectorAll('[data-tsb]')].find(b=>BR[b.dataset.tsb].root==='m'); x.click(); return x.dataset.tsb; }); await W8(p,1400);
ok(await p.evaluate(sb=>TFIL==='m'&&!document.querySelector('.ttodo')&&!document.querySelector('.tvp').classList.contains('todo'),sb),'tocar una rama: vas a ese tipo y se cierra la vista general');
await p.evaluate(()=>document.querySelector('.tri[data-tf3="t"]').click()); await W8(p,700); await p.evaluate(()=>document.querySelector('.tri[data-tf3="f"]').click()); await W8(p,700);
ok(await p.evaluate(()=>TFIL==='f'&&!document.querySelector('.ttodo')),'volver a un tipo desde el riel cierra la vista general');
await p.close();
// ---------- explicaciones: fuera de la pantalla, a un toque ----------
p=await mk({width:390,height:844});
await p.evaluate(()=>{ progSel='gibala'; go('programa'); }); await W8(p,1300);
ok(await p.evaluate(()=>!/Protocolo de intervalos/.test(document.querySelector('#app').innerText)),'programa: la explicación no queda a la vista');
await p.evaluate(()=>document.querySelector('[data-info="prog:gibala"]').click()); await W8(p,500);
ok(await p.evaluate(()=>{ const x=document.querySelector('.pop.infopop'); return x&&/Protocolo de intervalos de alta intensidad/.test(x.textContent)&&/Little y Gibala/.test(x.textContent); }),'programa: ? abre el panel con la explicación y la fuente');
await p.evaluate(()=>document.querySelector('.infopop [data-glgo]').click()); await W8(p,1600);
ok(await p.evaluate(()=>view==='ajustes'&&!!document.querySelector('#gl-p_gibala.open')),'desde el panel: el glosario abre la entrada del programa');
ok(await p.evaluate(()=>!/(^|\s)(tenés|hacés|bajás|subís|sacás|llevá|dejá)(\s|$)/i.test(GLOS.map(g=>g.d).join(' '))),'glosario en registro formal');
ok(await p.evaluate(()=>PROG_IDX.every(x=>GLOS.some(g=>g.k==='p_'+x.id))),'los 30 programas están en el glosario');
ok(await p.evaluate(()=>{ const t=document.createElement('p'); t.textContent='Hoy hice 10×1 de Gibala y Fuerza 5×5'; return !GL_RE.test(t.textContent)||!/5×5|10×1/.test((t.textContent.match(GL_RE)||[''])[0]); }),'los nombres de programas no se subrayan en el texto');
await p.evaluate(()=>{ skSel='bici_int'; go('habilidad'); }); await W8(p,1200);
ok(await p.evaluate(()=>!document.querySelector('.skcue')&&!!document.querySelector('[data-info="sk:bici_int"]')),'habilidad: la indicación pasa al ?');
await p.evaluate(()=>{ histEx='carga'; go('stat'); }); await W8(p,1200);
ok(await p.evaluate(()=>![...document.querySelectorAll('#app h3')].some(h=>h.textContent==='Cómo se lee')&&!!document.querySelector('[data-info^="carga"]')),'carga: "Cómo se lee" pasa al ?');
await p.close();
// ---------- adaptable: nada se desborda, navegación según el tamaño ----------
const VS=['home','hist','arbol','vos','stat','resumen','dia','programa','programas','habilidad','heroe','ajustes','fuerza','bici','cuerpo','mes','catalogo'];
for(const [w,h,rail] of [[844,390,1],[820,1180,0],[1180,820,1],[390,844,0],[667,375,1]]){ p=await mk({width:w,height:h}); const tag=`${w}×${h}`; const fails=[];
  for(const v of VS){ await p.evaluate(v=>{ if(v==='stat') histEx='fuerza'; if(v==='dia') histEx=(SESS.find(x=>x.kind==='fuerza')||{}).id; if(v==='programa') progSel='gibala'; if(v==='habilidad') skSel='bici_int'; if(v==='heroe'){ heroSel='hercules'; heroV=0; } if(v==='arbol'){ TFIL='f'; CAM=null; TSEL=null; } go(v); },v); await W8(p,v==='arbol'?1200:650);
    const f=await p.evaluate(()=>{ const W=document.documentElement.clientWidth; const o=[...document.querySelectorAll('#app *')].filter(x=>{ const r=x.getBoundingClientRect(); if(!r.width||x.closest('.tvp,.hstack')) return false; for(let a=x.parentElement;a&&a.id!=='app';a=a.parentElement){ const o=getComputedStyle(a).overflowX; if(o==='auto'||o==='scroll'||o==='hidden') return false; } const cs=getComputedStyle(x); if(cs.position==='fixed') return false; return r.right>W+1||r.left<-1; }); return {sx:document.documentElement.scrollWidth>W+1,n:o.length,s:o.slice(0,2).map(x=>x.className||x.tagName).join('|')}; });
    if(f.sx||f.n) fails.push(`${v}:${JSON.stringify(f)}`); }
  ok(!fails.length,`${tag}: ninguna pantalla se sale de costado `+fails.slice(0,4).join(' '));
  const nv=await p.evaluate(()=>{ go('home'); const n=document.querySelector('#nav').getBoundingClientRect(); return {vert:n.height>n.width,left:n.left}; }); await W8(p,900);
  ok(rail?nv.vert&&nv.left<40:!nv.vert,`${tag}: navegación ${rail?'en riel a la izquierda':'abajo'} `+JSON.stringify(nv));
  const fit=await p.evaluate(()=>{ const n=document.querySelector('#nav'), i=n.querySelector('.ind').getBoundingClientRect(), s=n.querySelector('button[aria-selected="true"]').getBoundingClientRect(); return {dx:Math.round(i.left-s.left),dy:Math.round(i.top-s.top),dw:Math.round(i.width-s.width),dh:Math.round(i.height-s.height)}; });
  ok(Object.values(fit).every(x=>Math.abs(x)<=1),`${tag}: la pastilla calza con la pestaña `+JSON.stringify(fit));
  if(rail){ const c=await p.evaluate(()=>{ const n=document.querySelector('#nav').getBoundingClientRect(), a=document.querySelector('#app').getBoundingClientRect(), f=document.querySelector('#fab').getBoundingClientRect(); return {navR:n.right,appL:a.left,fabR:f.right,fabB:f.bottom,H:innerHeight}; });
    ok(c.navR<=c.appL+2&&c.fabR<=c.appL+2&&c.fabB<=c.H,`${tag}: el riel y el + no tapan el contenido `+JSON.stringify(c)); }
  // panel de la habilidad en pantallas anchas: al costado, sin tapar el nodo
  if(w>=600){ await p.evaluate(()=>{ TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(p,1300); await p.evaluate(()=>treeSelect('planche')); await W8(p,1200);
    const q=await p.evaluate(()=>{ const pn=document.querySelector('.tpanel').getBoundingClientRect(), n=document.querySelector('.tn[data-sk="planche"]').getBoundingClientRect(); return {side:pn.left>innerWidth*.4,free:n.right<=pn.left-4}; });
    ok(q.side&&q.free,`${tag}: panel de la habilidad al costado y el nodo a la vista `+JSON.stringify(q)); }
  // sesión: controles a la vista sin desplazar
  await p.evaluate(()=>{ bike.modo='bici'; bike.sel='Bloques 4×4'; bkStart(); go('bici'); }); await W8(p,1100);
  ok(await p.evaluate(()=>{ const r=document.querySelector('#bkPlay').getBoundingClientRect(); return r.bottom<=innerHeight&&r.top>=0; }),`${tag}: en cardio, pausa a la vista sin desplazar`);
  await p.evaluate(()=>{ try{ bikeDiscard(); }catch(e){} }); await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
