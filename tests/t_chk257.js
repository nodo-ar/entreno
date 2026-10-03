// v255: el reproductor entre pantallas — la tarjeta de Inicio se transforma en la isla (y vuelve) en su tamaño real,
// la isla no desaparece al cambiar de pestaña, y se abre/cierra en la tarjeta de la sesión
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const open=async(W,H,ses,mode)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(([ses,mode])=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{};
      if(ses==='b'){ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); } else if(ses==='f'){ fzSel=nextTipo(); nuevoDraft(fzSel,{}); } else startMov({full:true,key:'full',label:'Cuerpo entero'});
      MINI.mode=mode; MINI.ses=miniSesKey(); miniSave(); HOMEP=null; NAV.length=0; go('home');
      const R=e=>{ const r=e.getBoundingClientRect(); return {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}; };
      const named=()=>[...document.querySelectorAll('*')].filter(e=>e.style.viewTransitionName).map(e=>({n:e.style.viewTransitionName,id:e.id||(e.dataset.card?'card':e.className.toString().split(' ')[0]),r:R(e)}));
      window.__L=[]; const o=document.startViewTransition.bind(document);
      document.startViewTransition=cb=>{ const rec={old:named()}; const t=o(()=>{ cb(); rec.nw=named(); rec.vla=getComputedStyle(document.documentElement).getPropertyValue('--vla').trim(); rec.vlb=getComputedStyle(document.documentElement).getPropertyValue('--vlb').trim(); });
        t.ready.then(()=>{ rec.pseudo=[...new Set(document.getAnimations().filter(a=>a.effect&&a.effect.pseudoElement).map(a=>a.effect.pseudoElement))]; }).catch(()=>{});
        t.finished.then(()=>{ setTimeout(()=>{ const mb=document.getElementById('minibar'), c=document.querySelector('#app [data-card^="live"]'); rec.fin={mb:mb&&!mb.hidden&&mb.getClientRects().length?R(mb):null,card:c?R(c):null}; rec.done=true; },350); });
        window.__L.push(rec); return t; }; },[ses,mode]);
    await W8(p,1100); return p; };
  const tap=async(p,sel)=>{ const bb=await p.evaluate(s=>{ const e=document.querySelector(s); if(!e||!e.getClientRects().length) return null; const q=e.getBoundingClientRect(); return {x:q.left+q.width/2,y:q.top+q.height/2}; },sel); if(!bb) return false; await p.mouse.click(bb.x,bb.y); await p.waitForFunction(()=>window.__L.length&&window.__L[window.__L.length-1].done,null,{timeout:5000}).catch(()=>{}); await W8(p,250); return true; };
  const last=p=>p.evaluate(()=>window.__L[window.__L.length-1]);
  const same=(a,b,tol=2)=>a&&b&&Math.abs(a.l-b.l)<=tol&&Math.abs(a.t-b.t)<=tol&&Math.abs(a.w-b.w)<=tol&&Math.abs(a.h-b.h)<=tol;
  const tabSel=t=>`nav.bottom [data-tab=${t}], #nav [data-tab=${t}]`;

  for(const [W,H] of (process.env.ONLYMODES?[]:[[390,844],[375,667],[820,1180],[1180,760],[844,390],[1366,1024]])){
    for(const ses of (W===390?['b','f','m']:['b'])){ const tag=`${W}×${H}${ses!=='b'?' '+ses:''}`; const p=await open(W,H,ses,'isle');
      // Inicio → Progreso: la tarjeta se transforma en la isla
      let ok1=await tap(p,tabSel('hist')); let r=await last(p);
      const o=(r.old||[]).find(x=>x.n==='vlive'), n=(r.nw||[]).find(x=>x.n==='vlive');
      T(ok1&&o&&o.id==='card'&&n&&n.id==='minibar',`${tag}: Inicio→Progreso, la tarjeta pasa a ser la isla`);
      T(n&&r.fin&&same(n.r,r.fin.mb),`${tag}: la isla llega a su tamaño final ${JSON.stringify(n&&n.r)} = ${JSON.stringify(r.fin&&r.fin.mb)}`);
      T(r.pseudo&&r.pseudo.includes('::view-transition-image-pair(vlive)')&&!!r.vla&&!!r.vlb,`${tag}: la caja tiene color mientras cambia de forma`);
      // Progreso → Árbol → Vos: la isla se queda
      for(const t of ['arbol','vos']){ await tap(p,tabSel(t)); r=await last(p); const a=(r.old||[]).find(x=>x.id==='minibar'), z=(r.nw||[]).find(x=>x.id==='minibar');
        T(a&&z&&a.n==='vmini'&&z.n==='vmini'&&!(r.old||[]).some(x=>x.n==='vlive'),`${tag}: →${t}, la isla sigue a la vista durante el cambio`); T(r.fin&&!!r.fin.mb,`${tag}: →${t}, la isla queda`); }
      // Vos → Inicio: la isla vuelve a ser la tarjeta, en su lugar de reposo
      await tap(p,tabSel('home')); r=await last(p); const o2=(r.old||[]).find(x=>x.n==='vlive'), n2=(r.nw||[]).find(x=>x.n==='vlive');
      T(o2&&o2.id==='minibar'&&n2&&n2.id==='card',`${tag}: →Inicio, la isla vuelve a ser la tarjeta`);
      T(n2&&r.fin&&same(n2.r,r.fin.card),`${tag}: la tarjeta llega a su lugar ${JSON.stringify(n2&&n2.r)} = ${JSON.stringify(r.fin&&r.fin.card)}`);
      T(r.fin&&!r.fin.mb,`${tag}: en Inicio, sin isla (está la tarjeta)`);
      if(ses==='b'){ // la isla se abre en la sesión y se cierra al volver
        await tap(p,tabSel('hist')); await tap(p,'#minibar'); r=await last(p); const a=(r.old||[]).find(x=>x.n==='vlive'), z=(r.nw||[]).find(x=>x.n==='vlive');
        T(a&&a.id==='minibar'&&z&&z.id!=='minibar'&&await p.evaluate(()=>view==='bici'),`${tag}: tocar la isla la abre en la sesión`);
        await tap(p,'#bkBack'); r=await last(p); const a2=(r.old||[]).find(x=>x.n==='vlive'), z2=(r.nw||[]).find(x=>x.n==='vlive');
        T(a2&&z2&&z2.id==='minibar'&&r.fin&&same(z2.r,r.fin.mb),`${tag}: al salir de la sesión se cierra en la isla`); }
      await p.close(); } }
  // las otras formas del reproductor
  for(const mode of ['card','tab']){ const p=await open(390,844,'b',mode); const tag=`390 ${mode}`;
    await tap(p,tabSel('hist')); let r=await last(p); const n=(r.nw||[]).find(x=>x.n==='vlive'); T(n&&n.id==='minibar'&&r.fin&&same(n.r,r.fin.mb),`${tag}: Inicio→Progreso llega a su tamaño ${JSON.stringify(n&&n.r)} ${JSON.stringify(r.fin)}`);
    await tap(p,tabSel('arbol')); r=await last(p); T((r.nw||[]).some(x=>x.id==='minibar'&&x.n==='vmini')&&r.fin&&!!r.fin.mb,`${tag}: →Árbol, sigue a la vista`);
    await tap(p,tabSel('home')); r=await last(p); const n2=(r.nw||[]).find(x=>x.n==='vlive'); T(n2&&n2.id==='card'&&r.fin&&same(n2.r,r.fin.card),`${tag}: →Inicio, vuelve a la tarjeta en su lugar`);
    await p.close(); }
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
