const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1100);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); localStorage.removeItem(LSK+'.treeFq'); TFQ=null; TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(1200);
ok(await E(()=>!document.querySelector('.tvp.filt')&&!document.querySelector('.tfchip')),'sin filtro al empezar');
for(const f of ['ya','prog','avail','done','locked']){
  await E(()=>document.querySelector('#tFilt').click()); await W8(400); await E(f=>document.querySelector(`[data-cm="${f}"]`).click(),f); await W8(900);
  ok(await E(f=>{ const exp=Object.keys(TREE.nodes).filter(k=>tfqOk(k,f)).sort().join(); const got=[...document.querySelectorAll('.tn.fm')].map(e=>e.dataset.sk).sort().join(); const n=Object.keys(TREE.nodes).filter(k=>tfqOk(k,f)&&TREE.nodes[k].r==='f').length; return exp===got&&document.querySelector('.tvp.filt')&&new RegExp('· '+n+' en fuerza').test(document.querySelector('.tfchip').textContent)&&document.querySelector('#tFilt').classList.contains('on'); },f),'filtro '+f+': nodos y contador');
}
await E(()=>treeFilt('ya')); await W8(300);
ok(await E(()=>{ const x=document.querySelector('.tn:not(.fm)'); return x&&getComputedStyle(x).opacity<.2; }),'lo que no entra queda casi apagado');
await E(()=>document.querySelector('[data-tf3="b"]').click()); await W8(900);
ok(await E(()=>/en cardio/.test(document.querySelector('.tfchip').textContent)),'al cambiar de tipo, el contador se ajusta');
await E(()=>{ go('home'); }); await W8(500); await E(()=>go('arbol')); await W8(1100);
ok(await E(()=>TFQ==='ya'&&!!document.querySelector('.tvp.filt')&&!!document.querySelector('.tfchip')),'el filtro se mantiene al volver');
await E(()=>treeSelect('run')); await W8(700); ok(await E(()=>getComputedStyle(document.querySelector('.tfchip')).opacity==='0'),'con panel, el chip se esconde');
await E(()=>treeSelect(null)); await W8(300);
await E(()=>document.querySelector('.tfchip').click()); await W8(400);
ok(await E(()=>TFQ===''&&!document.querySelector('.tvp.filt')&&!document.querySelector('.tfchip')&&!document.querySelector('#tFilt').classList.contains('on')),'la × saca el filtro');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
