// v270: el primer inicio pregunta dónde entrenás, en el paso del equipo (Casa, Gimnasio u otro nombre); con equipo de gimnasio propone Gimnasio
const {chromium}=require('playwright');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const paso=async()=>{ const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400);
    await p.evaluate(()=>{ PERF.modo='max'; perfApply(); document.querySelector('#newP').click(); }); await p.waitForTimeout(300);
    await p.evaluate(()=>{ document.querySelector('#obNom').value='Fer'; document.querySelector('#obPeso').value='82'; CFG.diasFS=[0,2,4]; CFG.diasBS=[1,3]; document.querySelector('#obNext').click(); }); await p.waitForTimeout(500); return p; };
  const st=p=>p.evaluate(()=>({paso:ob.step,pick:(document.querySelector('#obLug')||{}).textContent||null,txt:(document.querySelector('#app .card .xs.dim b')||{}).textContent||null,lug:lugar().n}));
  const eq=async(p,k)=>{ await p.evaluate(k=>document.querySelector(`[data-eq="${k}"]`).click(),k); await p.waitForTimeout(500); };
  const menu=async(p,v)=>{ await p.click('#obLug'); await p.waitForTimeout(350); const m=await p.evaluate(()=>[...document.querySelectorAll('.pop [data-cm]')].map(x=>x.dataset.cm+':'+x.textContent)); if(v) { await p.click(`.pop [data-cm="${v}"]`); await p.waitForTimeout(400); } return m; };
  const seguir=async p=>{ await p.click('#obNext'); await p.waitForTimeout(500); };

  // sin equipo de gimnasio: Casa, y al seguir queda Casa
  let p=await paso(); let r=await st(p); T(r.paso===1&&r.pick==='Casa'&&r.txt==='Casa','arranca en Casa · '+JSON.stringify(r));
  let m=await menu(p); T(m.length===3&&/^casa:Casasegún tu equipo/.test(m[0])&&/^gym:Gimnasio$/.test(m[1])&&/^otro:Otro nombre/.test(m[2]),'menú: Casa (propuesta), Gimnasio, otro nombre · '+JSON.stringify(m));
  await p.keyboard.press('Escape'); await p.evaluate(()=>{ try{ popClose(true); }catch(e){} });
  await seguir(p); r=await st(p); T(r.paso===2&&r.lug==='Casa','al seguir queda Casa · '+JSON.stringify(r));
  // con poleas: propone Gimnasio y lo guarda al seguir
  p=await paso(); await eq(p,'polea'); r=await st(p); T(r.pick==='Gimnasio'&&r.txt==='Gimnasio'&&r.lug==='Casa','con poleas propone Gimnasio (todavía sin guardar) · '+JSON.stringify(r));
  m=await menu(p); T(/^gym:Gimnasiosegún tu equipo/.test(m[1])&&/^casa:Casa$/.test(m[0]),'el menú marca Gimnasio como propuesta · '+JSON.stringify(m));
  await p.evaluate(()=>{ try{ popClose(true); }catch(e){} });
  await seguir(p); r=await st(p); T(r.lug==='Gimnasio','al seguir guarda Gimnasio · '+JSON.stringify(r));
  // elegido a mano: no lo pisa la propuesta
  p=await paso(); await eq(p,'polea'); await menu(p,'casa'); await eq(p,'maquinas'); r=await st(p); T(r.pick==='Casa'&&r.lug==='Casa','elegido Casa a mano, sumar máquinas no lo cambia · '+JSON.stringify(r));
  await seguir(p); r=await st(p); T(r.lug==='Casa','al seguir queda Casa · '+JSON.stringify(r));
  // otro nombre, con comillas
  p=await paso(); await menu(p,'otro'); T(await p.evaluate(()=>!!document.querySelector('.pop #obLugIn')),'otro nombre: aparece el campo');
  await p.evaluate(()=>document.querySelector('#obLugOk').click()); await p.waitForTimeout(200); T(await p.evaluate(()=>!!document.querySelector('.pop #obLugIn')&&lugar().n==='Casa'),'vacío no se acepta');
  await p.fill('#obLugIn','Plaza "del barrio"'); await p.click('#obLugOk'); await p.waitForTimeout(400); r=await st(p); T(r.pick==='Plaza "del barrio"'&&r.lug==='Plaza "del barrio"','otro nombre queda elegido · '+JSON.stringify(r));
  m=await menu(p); T(m.some(x=>x==='propio:Plaza "del barrio"'),'el menú muestra el nombre propio · '+JSON.stringify(m)); await p.evaluate(()=>{ try{ popClose(true); }catch(e){} });
  await eq(p,'polea'); await seguir(p); r=await st(p); T(r.lug==='Plaza "del barrio"','con poleas sigue el nombre propio · '+JSON.stringify(r));
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
