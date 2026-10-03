// v270: las tarjetas de día libre y de movilidad (.hero.rest) quedan en vidrio con los efectos completos: el color lleno de .hero.act no les gana
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const ESTADOS=['dias','libre','hecha','mov'];
  for(const tema of ['dark','light']) for(const est of ESTADOS){
    const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(400);
    const r=await p.evaluate(([tema,est])=>{ PERF.modo='max'; perfApply(); CFG.tema=tema; applyTema(); CELON=false; const h=hoyISO();
      for(let i=SESS.length-1;i>=0;i--) if(SESS[i].fecha===h) SESS.splice(i,1);

      const libre=()=>{ const wd=wdIdx(h); CFG.diasFS=CFG.diasFS.filter(d=>d!==wd); CFG.diasBS=CFG.diasBS.filter(d=>d!==wd); if(!CFG.diasFS.length) CFG.diasFS=[(wd+1)%7]; };
      if(est==='dias'){ CFG.diasFS=[]; CFG.diasBS=[]; }
      else if(est==='libre') libre();
      else if(est==='hecha'){ libre(); SESS.unshift({id:'m-hoy',kind:'mov',fecha:h,tipo:'Movilidad · completa',min:14,items:['Childs_Pose'],zonas:['col'],ctx:'full'}); }
      else { CFG.mov=Object.assign({},CFG.mov||{},{on:1,hora:'noc'}); CFG.hora='man'; CFG.horaB='tar'; } saveCfg(); go('home');
      const col=v=>{ const d=document.createElement('i'); d.style.color=`var(${v})`; document.body.append(d); const c=getComputedStyle(d).color; d.remove(); return c; };
      const llenos=[col('--ember'),col('--aqua')];
      return {nv:document.documentElement.classList.contains('perf-nv'),cards:[...document.querySelectorAll('#app .hero.rest.act')].map(e=>{ const cs=getComputedStyle(e), bf=getComputedStyle(e,'::before'), bt=e.querySelector('.btn.sm:not(.lbgo)');
        return {card:e.dataset.card,done:e.classList.contains('done'),bg:cs.backgroundColor,lleno:llenos.includes(cs.backgroundColor),vela:bf.content!=='none'&&bf.display!=='none'&&bf.backgroundImage!=='none',btn:bt?getComputedStyle(bt).backgroundColor:null}; })}; },
      [tema,est]);
    T(!r.nv,`${tema} ${est}: efectos completos (sin perf-nv)`);
    const want=est==='mov'?'mov':est==='dias'?'libre:dias':'libre';
    const c=r.cards.find(x=>x.card===want); T(!!c,`${tema} ${est}: aparece la tarjeta ${want} · ${JSON.stringify(r.cards.map(x=>x.card))}`);
    if(c){ T(!c.lleno,`${tema} ${est}: el fondo no es ember ni aqua (${c.bg})`); T(!c.vela,`${tema} ${est}: sin la sombra de las tarjetas de color`); if(c.btn) T(c.btn!=='rgb(255, 255, 255)',`${tema} ${est}: el botón no es blanco (${c.btn})`); T(est!=='hecha'||c.done,`${tema} ${est}: la tarjeta está hecha`); }
    await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
