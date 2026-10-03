const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1100);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
const tapSvg=sel=>E(sel=>{ const g=document.querySelector(sel); const r=g.getBoundingClientRect(); const o={bubbles:true,clientX:r.x+r.width/2,clientY:r.y+r.height/2,pointerId:1}; g.dispatchEvent(new PointerEvent('pointerdown',o)); document.querySelector('#tsvg').dispatchEvent(new PointerEvent('pointerup',o)); },sel);
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); const st={}; Object.keys(SKILLS).forEach(k=>st[k]=skState(k)); st.muscleup='locked'; localStorage.setItem(LSK+'.treeSt',JSON.stringify(st)); localStorage.removeItem(LSK+'.treeNew'); NEWS=null; TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(1300);
// nuevo
ok(await E(()=>!!document.querySelector('.tn.isnew[data-sk="muscleup"]')&&document.querySelector('[data-tf3="f"]').classList.contains('hasnew')),'nueva: punto en el nodo y en el tipo');
// tocar un nodo: camino
await tapSvg('.tn[data-sk="oap"]'); await W8(900);
ok(await E(()=>TSEL==='oap'&&TMODE==='camino'&&!!document.querySelector('.torbit .tob[data-m="camino"].on')),'tocar: camino con botones alrededor');
ok(await E(()=>['hub:f>spine','hub:f>sub:pull','sub:pull>pull','pull>oap'].every(id=>document.querySelector(`[data-e="${id}"]`).classList.contains('hl'))),'camino: del tronco al nodo, todo resaltado');
ok(await E(()=>/Para abrirla/i.test(document.querySelector('.tpanel').textContent)&&/Para lograrla/i.test(document.querySelector('.tpanel').textContent)&&!!document.querySelector('.tpanel .frow[data-tgo="pull"]')),'panel: qué falta para abrirla y para lograrla, con cada requisito');
ok(await E(()=>{ const a=document.querySelector('.tpanel .tpa').getBoundingClientRect(), v=document.querySelector('.tvp').getBoundingClientRect(); return a.bottom<=v.bottom&&a.height>30; }),'panel: acciones siempre a la vista');
ok(await E(()=>!document.querySelector('.torbit .tob[data-m="abre"]')),'sin "Abre" si no abre nada');
// paso del camino
await E(()=>document.querySelector('.tpanel [data-tgo="pull"]').click()); await W8(900);
ok(await E(()=>TSEL==='pull'&&!!document.querySelector('.torbit .tob[data-m="abre"]')),'tocar un paso: salta a esa habilidad');
// abre (botón alrededor)
await tapSvg('.torbit .tob[data-m="abre"]'); await W8(900);
ok(await E(()=>TMODE==='abre'&&document.querySelectorAll('.tpanel .tpo').length>=2&&document.querySelector('[data-e="pull>oap"]').classList.contains('hl')),'Abre: lo que viene, resaltado');
await tapSvg('.torbit .tob[data-m="camino"]'); await W8(700); ok(await E(()=>TMODE==='camino'),'Camino otra vez');
await E(()=>treeSelect(null)); await W8(300);
// muscle-up nuevo: al mirarlo deja de ser nuevo
await E(()=>treeSelect('muscleup')); await W8(700);
ok(await E(()=>!document.querySelector('.tn.isnew[data-sk="muscleup"]')&&!JSON.parse(localStorage.getItem(LSK+'.treeNew')).includes('muscleup')),'al mirarla deja de ser nueva');
await E(()=>treeSelect(null)); await W8(300);
// buscar
await E(()=>document.querySelector('#tFind').click()); await W8(500); await p.keyboard.type('espagat lat'); await W8(200);
ok(await E(()=>[...document.querySelectorAll('.tfr')].filter(x=>!x.hidden).map(x=>x.dataset.tfk).join()==='espl'),'buscar filtra');
await E(()=>document.querySelector('.tfr[data-tfk="espl"]').click()); await W8(1200);
ok(await E(()=>TSEL==='espl'&&TFIL==='m'&&document.querySelector('[data-tf3="m"]').classList.contains('on')),'buscar: va a la habilidad y cambia de tipo');
await E(()=>treeSelect(null)); await W8(300);
// lo tuyo
const c0=await E(()=>JSON.stringify(CAM)); await E(()=>document.querySelector('#tMine').click()); await W8(900);
ok(await E(c0=>JSON.stringify(CAM)!==c0,c0),'ir a lo tuyo mueve la cámara');
// ver todo
await E(()=>document.querySelector('#tAll').click()); await W8(900);
ok(await E(()=>{ const vp=document.querySelector('.tvp').getBoundingClientRect(); return Object.values(TREE.nodes).filter(n=>n.r===TFIL).every(n=>{ const e=document.querySelector(`.tn[data-sk="${n.k}"]`).getBoundingClientRect(); return e.top>=vp.top-4&&e.bottom<=vp.bottom+4; }); }),'ver todo: el tipo entero entra');
ok(await E(()=>getComputedStyle(document.querySelector('.tctl')).opacity==='1'),'botones visibles sin panel');
await E(()=>treeSelect('lsit')); await W8(500); ok(await E(()=>getComputedStyle(document.querySelector('.tctl')).opacity==='0'),'con panel abierto se esconden');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
