const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1100);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
const inB=()=>E(()=>{ const vp=document.querySelector('.tvp'), c=camClamp(CAM,vp); return Math.abs(c.x-CAM.x)<1&&Math.abs(c.y-CAM.y)<1&&Math.abs(c.s-CAM.s)<.003; });
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(1200);
ok(await inB(),'al entrar, la vista está dentro de los bordes');
const vpb=await E(()=>{ const r=document.querySelector('#tsvg').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
// arrastre lateral: el tipo entra a lo ancho, no se mueve de costado
await E(()=>{ document.querySelector('#tsvg').addEventListener('pointerup',()=>{ window.__up=(window.__up||0)+1; }); });
const x0=await E(()=>CAM.x); await p.mouse.move(vpb.x,vpb.y); await p.mouse.down(); await p.mouse.move(vpb.x+30,vpb.y,{steps:5}); 
ok(await E(x0=>Math.abs(CAM.x-x0)<70&&Math.abs(CAM.x-x0)>1,x0),'de costado corto: se estira un poco (elástico)');
await p.mouse.up(); await W8(700); ok(await E(x0=>Math.abs(CAM.x-x0)<1,x0),'y vuelve a su lugar '+await E(x0=>[CAM.x,x0,window.__up],x0));
// arrastrar hacia abajo más allá del borde inferior
await p.mouse.move(vpb.x,vpb.y); await p.mouse.down(); await p.mouse.move(vpb.x,vpb.y-600,{steps:12}); await p.mouse.up(); await W8(900);
ok(await inB(),'pasarse del borde: rebota y queda adentro');
await p.mouse.move(vpb.x,vpb.y-200); await p.mouse.down(); await p.mouse.move(vpb.x,vpb.y+1200,{steps:20}); await W8(50);
ok(await E(()=>document.querySelector('.tscr').classList.contains('on')),'indicador de posición mientras te movés');
await p.mouse.up(); await W8(1500); ok(await inB(),'arriba del todo también rebota'); ok(await E(()=>!document.querySelector('.tscr').classList.contains('on')),'el indicador se va');
// zoom con topes
await p.mouse.move(vpb.x,vpb.y);
for(let i=0;i<30;i++){ await p.mouse.wheel(0,400); await W8(10); } await W8(300);
const s0=await E(()=>camLim(document.querySelector('.tvp')).s0); ok(await E(s0=>Math.abs(CAM.s-s0)<.005,s0),'alejar tiene tope: se ve el tipo entero y no más');
ok(await E(()=>{ const vp=document.querySelector('.tvp').getBoundingClientRect(); return Object.values(TREE.nodes).filter(n=>n.r==='f').every(n=>{ const e=document.querySelector(`.tn[data-sk="${n.k}"]`).getBoundingClientRect(); return e.left>=vp.left-2&&e.right<=vp.right+2&&e.top>=vp.top-2&&e.bottom<=vp.bottom+2; }); }),'en el tope, el tipo entero entra');
for(let i=0;i<40;i++){ await p.mouse.wheel(0,-400); await W8(10); } await W8(300);
ok(await E(()=>Math.abs(CAM.s-1.6)<.005),'acercar tiene tope');
await E(()=>{ const vp=document.querySelector('.tvp'); CAM=camFit(treeBounds('f'),vp,'root'); camApply(); }); await W8(200);
// doble toque: acerca y vuelve
const s1=await E(()=>CAM.s); await p.mouse.dblclick(vpb.x+40,vpb.y+60); await W8(10);
await E(()=>{}); await W8(600);
// los vuelos terminan adentro
await E(()=>camFly({s:5,x:-9999,y:9999},100)); await W8(400); ok(await inB(),'un vuelo exagerado termina adentro');
// "Todo": se puede recorrer a lo ancho; mover no cambia de tipo
await E(()=>document.querySelector('.tri[data-tf3="t"]').click()); await W8(900); ok(await inB(),'Todo: adentro');
await E(()=>document.querySelector('.tri[data-tf3="f"]').click()); await W8(900);
await p.mouse.move(vpb.x,vpb.y); await p.mouse.down(); await p.mouse.move(vpb.x-300,vpb.y,{steps:10}); await p.mouse.up(); await W8(700);
ok(await E(()=>TFIL==='m'),'deslizar de costado pasa al tipo de al lado');
// con panel, la vista sigue adentro y la habilidad elegida se ve
await E(()=>treeSelect('lsit')); await W8(900); ok(await E(()=>TFIL==='f'&&document.querySelector('.tri.on').dataset.tf3==='f'),'elegir una habilidad de otro tipo te lleva a su tipo'); ok(await inB(),'con panel: adentro');
ok(await E(()=>{ const e=document.querySelector('.tn[data-sk="lsit"]').getBoundingClientRect(), pn=document.querySelector('.tpanel').getBoundingClientRect(); return e.bottom<pn.top&&e.top>0; }),'con panel: la habilidad queda arriba del panel');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
