const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1})).newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(1100);
const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await E(()=>{ CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(700);
ok(await E(()=>!document.querySelector('.tsel,.tseg')&&!!document.querySelector('.tvp .trail')),'el selector bajó al riel del mapa');
ok(await E(()=>{ const r=document.querySelector('.trail').getBoundingClientRect(); return r.top>innerHeight*.5&&r.right>innerWidth-30&&r.bottom<innerHeight-70; }),'riel abajo a la derecha, arriba de la barra');
ok(await E(()=>document.querySelector('.trlbl').classList.contains('show')&&/Fuerza/.test(document.querySelector('.trlbl').textContent)),'al entrar dice en qué tipo estás');
await W8(1800); ok(await E(()=>!document.querySelector('.trlbl').classList.contains('show')),'el cartel se va solo');
const q=f=>E(f=>{ const r=document.querySelector(`.tri[data-tf3="${f}"]`).getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]; },f);
const F=await q('f'), B=await q('b'), M=await q('m'), T=await q('t');
// deslizar
await p.mouse.move(F[0],F[1]); await p.mouse.down(); await p.mouse.move(B[0],B[1],{steps:5}); await W8(200);
ok(await E(()=>TFIL==='b'&&document.querySelector('.trlbl').classList.contains('show')&&/Cardio/.test(document.querySelector('.trlbl').textContent)),'deslizando: cambia a Cardio en vivo');
await p.mouse.move(M[0],M[1],{steps:5}); await p.mouse.up(); await W8(900);
ok(await E(()=>TFIL==='m'&&document.querySelector('.tri[data-tf3="m"]').classList.contains('on')&&document.querySelector('.tri[data-tf3="m"]').getAttribute('aria-selected')==='true'),'al soltar queda en Movilidad');
// tocar
await p.mouse.click(T[0],T[1]); await W8(900); ok(await E(()=>TFIL==='t'),'tocar Todo');
await p.mouse.click(F[0],F[1]); await W8(900); ok(await E(()=>TFIL==='f'),'tocar Fuerza');
// teclado / lectores
await E(()=>document.querySelector('.tri[data-tf3="b"]').click()); await W8(800); ok(await E(()=>TFIL==='b'),'activar con teclado');
// panel abierto: el riel se esconde
await E(()=>treeSelect('run')); await W8(600); ok(await E(()=>getComputedStyle(document.querySelector('.trail')).opacity==='0'),'con panel, el riel se esconde');
await E(()=>treeSelect(null)); await W8(400);
// navegación guiada: mover el mapa no te cambia de tipo (pasar de tipo es deslizar de costado más allá del borde; eso lo prueba chk237)
const tf0=await E(()=>TFIL); await p.mouse.move(200,400); await p.mouse.down(); await p.mouse.move(150,200,{steps:8}); await p.mouse.move(120,260,{steps:6}); await p.mouse.up(); await W8(700);
ok(await E(tf0=>TFIL===tf0&&document.querySelector(`.tri[data-tf3="${tf0}"]`).classList.contains('on'),tf0),'mover el mapa no te cambia de tipo');
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
