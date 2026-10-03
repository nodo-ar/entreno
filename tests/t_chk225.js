const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1100);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); TFIL='f'; CAM=null; go('arbol'); }); await W8(1200);
// estructura
const m=await E(()=>{ const T=TREE, ks=Object.keys(SKILLS), w=document.querySelector('#tw');
  const noIn=ks.filter(k=>!w.querySelector(`[data-e$=">${k}"]`));
  const subsNoIn=T.subs.filter(S=>!w.querySelector(`[data-e="hub:${S.r}>sub:${S.b}"]`)).map(S=>S.b);
  const trunc=ks.filter(k=>{ const t=w.querySelector(`.tn[data-sk="${k}"] .nlab`); return [...t.querySelectorAll('tspan')].map(x=>x.textContent).join(' ')!==SKILLS[k].n; });
  // cajas nodo+etiqueta sin superposición
  const box=k=>{ const n=T.nodes[k], L=treeLines(SKILLS[k].n), wd=Math.max(36,...L.map(l=>l.length*6.2)); return {k,x0:n.x-wd/2,x1:n.x+wd/2,y0:n.y-18,y1:n.y+18+(L.length>1?31:19)}; };
  const B=ks.map(box), ov=[]; for(let i=0;i<B.length;i++) for(let j=i+1;j<B.length;j++){ const a=B[i],c=B[j]; if(a.x0<c.x1-1&&c.x0<a.x1-1&&a.y0<c.y1-1&&c.y0<a.y1-1) ov.push(a.k+'/'+c.k); }
  // padre abajo del hijo
  const up=T.edges.filter(([a,c])=>!(T.nodes[c].y<T.nodes[a].y)).map(x=>x.join('>'));
  // subtipos en orden y sin pisarse
  const ord=['b','f','m'].map(r=>T.subs.filter(S=>S.r===r).map(S=>S.b).join(','));
  const sov=[]; T.subs.forEach((S,i)=>T.subs.forEach((U,j)=>{ if(j<=i||S.r!==U.r) return; const a={x0:S.x0,x1:S.x1,y0:S.top,y1:S.y+11}, c={x0:U.x0,x1:U.x1,y0:U.top,y1:U.y+11}; if(a.x0<c.x1&&c.x0<a.x1&&a.y0<c.y1&&c.y0<a.y1) sov.push(S.b+'/'+U.b); }));
  const drawn=[...w.querySelectorAll('.tcx')].filter(x=>getComputedStyle(x).opacity!=='0').length;
  return {noIn,subsNoIn,trunc,ov,up,ord,sov,drawn,leaves:document.querySelectorAll('.nleaf,.nflw,.troot,.ttrunk,.tzn,.tcol').length,photos:w.querySelectorAll('.tn image').length}; });
console.log(JSON.stringify(m));
ok(!m.noIn.length,'cada habilidad tiene una rama que llega a ella '+m.noIn);
ok(!m.subsNoIn.length,'cada subtipo sale del tronco de su tipo');
ok(!m.trunc.length,'ningún nombre queda cortado '+m.trunc);
ok(!m.ov.length,'nodos y nombres no se pisan '+m.ov.slice(0,6));
ok(!m.up.length,'el hijo siempre arriba del padre '+m.up);
ok(!m.sov.length,'los subtipos no se pisan '+m.sov);
ok(m.ord[1]==='push,pull,core,legs,bal','fuerza ordenada por subtipo: '+m.ord[1]);
ok(m.drawn===0,'en reposo no hay líneas cruzadas entre ramas');
ok(m.leaves===0&&m.photos===0,'sin tronco dibujado, raíces, hojas, letras gigantes ni fotos en los nodos');
// tipo con el segmentado
for(const f of ['b','m','t','f']){ await E(f=>document.querySelector(`[data-tf3="${f}"]`).click(),f); await W8(800); ok(await E(f=>TFIL===f&&document.querySelector(`[data-tf3="${f}"]`).classList.contains('on'),f),'segmentado → '+f); }
ok(await E(()=>{ const b=document.querySelector('[data-tf3="m"]'); return b.scrollWidth<=b.clientWidth+1; }),'"Movilidad" entra entero');
// tocar un subtipo acerca la cámara
const s0=await E(()=>CAM.s); await E(()=>{ const g=document.querySelector('.tsub[data-sub="pull"]'); const r=g.getBoundingClientRect(); const o={bubbles:true,clientX:r.x+r.width/2,clientY:r.y+r.height/2,pointerId:1}; g.dispatchEvent(new PointerEvent('pointerdown',o)); document.querySelector('#tsvg').dispatchEvent(new PointerEvent('pointerup',o)); }); await W8(900);
ok(await E(()=>{ const vp=document.querySelector('.tvp').getBoundingClientRect(); return Object.values(TREE.nodes).filter(n=>n.b==='pull').every(n=>{ const e=document.querySelector(`.tn[data-sk="${n.k}"]`).getBoundingClientRect(); return e.left>=vp.left-2&&e.right<=vp.right+2&&e.top>=vp.top-2&&e.bottom<=vp.bottom; }); }),'tocar Tracción: la rama entera a la vista');
// elegir una habilidad
await E(()=>treeSelect('planche')); await W8(900);
ok(await E(()=>document.querySelector('.tpanel.on')&&document.querySelector('.tn.sel[data-sk="planche"]')&&CAM.s>=.7),'elegir: panel y se lee');
await E(()=>treeSelect(null)); await W8(300);
// festejo sin errores
await E(()=>treeCelebrate('bici_int')); await W8(1500);
// abrir desde otro lado
await E(()=>{ go('home'); }); await W8(500); await E(()=>openTreeAt('espl')); await W8(1500);
ok(await E(()=>view==='arbol'&&TFIL==='m'&&!!document.querySelector('.tn.sel[data-sk="espl"]')),'abrir el árbol en una habilidad');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
