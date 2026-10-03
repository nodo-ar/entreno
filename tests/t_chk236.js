const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const mk=async(vp,sch)=>{ const ctx=await b.newContext({viewport:vp,colorScheme:sch||'dark'}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(900);
  await p.evaluate(sch=>{ CELON=true; CFG.tema=sch||'dark'; applyTema(); ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); },sch); return p; };
const W8=(p,ms)=>p.waitForTimeout(ms);
const CR=`const P=s=>{ const m=s.match(/rgba?\\(([^)]+)\\)/); const a=m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return a; }; const lum=c=>{ const f=v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }; return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]); }; const cr=(a,b)=>{ const x=lum(P(a)),y=lum(P(b)); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };`;
for(const [w,h] of [[1180,820],[820,1180],[844,390]]){ const tag=`${w}×${h}`; let p=await mk({width:w,height:h});
  // inspector del árbol: abraza el contenido
  await p.evaluate(()=>{ TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(p,1300); await p.evaluate(()=>treeSelect('pull')); await W8(p,1200);
  const t=await p.evaluate(()=>{ const pn=document.querySelector('.tpanel'), vp=document.querySelector('.tvp'); return {h:pn.offsetHeight,sh:pn.scrollHeight,vh:vp.clientHeight,gap:vp.getBoundingClientRect().bottom-pn.getBoundingClientRect().bottom}; });
  ok(t.h<=t.sh+2&&(t.sh<t.vh-120?t.gap>40:true),`${tag}: el panel de la habilidad mide lo que su contenido `+JSON.stringify(t));
  // botones con ancho propio
  await p.evaluate(()=>{ progSel='gibala'; go('programa'); }); await W8(p,1300);
  ok(await p.evaluate(()=>{ const r=document.querySelector('#prStart').getBoundingClientRect(); return r.width<=400&&r.width>=200; }),`${tag}: "Empezar programa" con ancho propio`);
  // sesión de cardio: entra en la pantalla y el reloj es grande
  await p.evaluate(()=>{ bike.modo='bici'; bike.sel='Bloques 4×4'; bkStart(); go('bici'); }); await W8(p,1300);
  const s=await p.evaluate(()=>({sh:document.documentElement.scrollHeight,ih:innerHeight,fs:parseFloat(getComputedStyle(document.querySelector('#bkT')).fontSize),play:document.querySelector('#bkPlay').getBoundingClientRect().bottom}));
  ok(s.sh<=s.ih+2&&s.play<=s.ih,`${tag}: cardio entra entera, sin desplazar `+JSON.stringify(s));
  ok(s.fs>=80,`${tag}: el reloj se lee de lejos (${Math.round(s.fs)} px)`);
  // al terminar: Listo con ancho propio
  await p.evaluate(()=>{ bike.t0=Date.now()-40*60000; bike.ph=curProt().ph.length-1; bike.phEnd=Date.now()+50; }); await W8(p,1600);
  ok(await p.evaluate(()=>{ const r=document.querySelector('#finOk').getBoundingClientRect(); return r.width<=400; }),`${tag}: "Listo" no ocupa todo el ancho`);
  await p.evaluate(()=>{ document.querySelector('#finOk').click(); }); await W8(p,800);
  // movilidad: entra entera, foto grande
  await p.evaluate(()=>startMov({full:true})); await W8(p,1200);
  const m=await p.evaluate(()=>({sh:document.documentElement.scrollHeight,ih:innerHeight,ph:document.querySelector('#mvPhoto').getBoundingClientRect().height,play:document.querySelector('#mvPlay').getBoundingClientRect().bottom}));
  ok(m.play<=m.ih&&m.ph>=180,`${tag}: movilidad con la foto grande y los controles a la vista `+JSON.stringify(m));
  await p.evaluate(()=>{ try{ movDiscard(); }catch(e){} }); await W8(p,500);
  // Vos: meta al lado del peso
  await p.evaluate(()=>{ CFG.altura=178; CFG.edad=34; CFG.sexo='h'; CFG.metaPeso=85; go('vos'); }); await W8(p,1200);
  ok(await p.evaluate(()=>{ const a=document.querySelector('#app .card.vh').getBoundingClientRect(), c=document.querySelector('#app .metac').getBoundingClientRect(); return Math.abs(a.top-c.top)<4&&c.left>a.right; }),`${tag}: en Vos la meta va al lado del peso`);
  await p.close(); }
// celular vertical: nada cambia
{ const p=await mk({width:390,height:844}); await p.evaluate(()=>{ progSel='gibala'; go('programa'); }); await W8(p,1200);
  ok(await p.evaluate(()=>{ const r=document.querySelector('#prStart').getBoundingClientRect(); return r.width>320; }),'celular vertical: el botón sigue a lo ancho'); await p.close(); }
// contraste
for(const sch of ['dark','light']){ const p=await mk({width:390,height:844},sch);
  const t=await p.evaluate('(()=>{'+CR+`const d=document.createElement('div'); document.body.appendChild(d); const g=v=>{ d.style.color='var('+v+')'; return getComputedStyle(d).color; }; const bgc=v=>{ d.style.color=v; return getComputedStyle(d).color; };
    const r={ink3_bg:cr(g('--ink-3'),g('--bg')),ink3_s2:cr(g('--ink-3'),g('--s2'))}; if(document.documentElement.dataset.theme==='light'||'${sch}'==='light'){ ['--ember','--aqua','--lime','--amber'].forEach(k=>r[k]=cr(g(k),g('--bg'))); } d.remove(); return r;})()`);
  ok(Object.values(t).every(v=>v>=4.5),`${sch}: gris terciario y acentos pasan 4,5:1 `+JSON.stringify(Object.fromEntries(Object.entries(t).map(([k,v])=>[k,+v.toFixed(2)]))));
  await p.evaluate(()=>{ go('home'); CELQ.length=0; CELON=false; CELQ.push({k:'mv_hom',lvl:1}); celebMaybe(true); }); await W8(p,1500);
  ok(await p.evaluate('(()=>{'+CR+`const x=document.querySelector('.cela .btn.primary'), cs=getComputedStyle(x); return cr(cs.color,cs.backgroundColor)>=4.5;})()`),`${sch}: el botón del festejo se lee`);
  await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
