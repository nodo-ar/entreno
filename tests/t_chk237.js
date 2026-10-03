const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'index.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const mk=async(vp)=>{ const ctx=await b.newContext({viewport:vp,colorScheme:'dark'}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(900);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); }); return p; };
const W8=(p,ms)=>p.waitForTimeout(ms);
const home=async(p,f)=>{ await p.evaluate(f=>{ TFIL=f; CAM=null; TSEL=null; go('arbol'); },f); await W8(p,1500); };
const zoomTo=async(p,s,edge)=>{ await p.evaluate(([s,edge])=>{ const vp=document.querySelector('.tvp'); const L=camLim(vp,s); CAM={s,x:edge==='r'?L.xl:edge==='l'?L.xh:(L.xl+L.xh)/2,y:(L.yl+L.yh)/2}; camApply(); },[s,edge]); await W8(p,250); };
/* desliza en horizontal: dx total, pasos, pausa antes de soltar; devuelve el estado justo antes de soltar y los primeros cuadros después */
const swipe=async(p,dx,{steps=20,hold=120,back=0,y=.45,x=null}={})=>{ const r=await p.evaluate(()=>document.querySelector('#tsvg').getBoundingClientRect().toJSON()); const fw=r.width-await p.evaluate(()=>typeof tpW==='function'?tpW():0);
  const Y=r.top+r.height*y, X0=x!=null?r.left+fw*x:(dx<0?r.left+fw*.82:r.left+fw*.18); await p.mouse.move(X0,Y); await p.mouse.down();
  for(let i=1;i<=steps;i++){ await p.mouse.move(X0+dx*i/steps,Y); if(hold!==0) await W8(p,16); }
  for(let i=1;i<=(back?8:0);i++){ await p.mouse.move(X0+dx+back*i/8,Y); await W8(p,16); }
  if(hold) await W8(p,hold);
  const pre=hold===0?{cam:{x:NaN,y:NaN},rind:[NaN,NaN]}:await p.evaluate(()=>({cam:{...CAM},rind:[RIND.t,RIND.b],tfil:TFIL,peek:document.querySelector('#tsvg').getAttribute('data-peek'),pk:document.querySelector('#tsvg').style.getPropertyValue('--pk'),paging:!!document.querySelector('.tvp.pgdrag')}));
  await p.evaluate(()=>{ window.__log=[]; const f=()=>{ __log.push({x:CAM.x,y:CAM.y,s:CAM.s,t:RIND.t,b:RIND.b}); if(__log.length<50) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await p.mouse.up(); await W8(p,950);
  const post=await p.evaluate(()=>({log:__log,tfil:TFIL,cam:{...CAM},rind:[RIND.t,RIND.b],hold:TVPHOLD,cls:document.querySelector('.tvp').className,peek:document.querySelector('#tsvg').getAttribute('data-peek')}));
  const f0=post.log[0], jump=hold===0?0:Math.max(Math.abs(f0.x-pre.cam.x),Math.abs(f0.y-pre.cam.y)), rj=Math.max(Math.abs(f0.t-pre.rind[0]),Math.abs(f0.b-pre.rind[1]));
  /* monotonía: después de soltar la cámara no retrocede */
  const xs=post.log.map(l=>l.x), mono=xs.every((v,i)=>!i||Math.sign(v-xs[i-1])!==-Math.sign(xs[xs.length-1]-xs[0])||Math.abs(v-xs[i-1])<.6);
  return {pre,post,jump,rj,mono}; };
/* en horizontal no hay riel: el tipo va en el segmentado del encabezado */
const segOn=async(p,f)=>p.evaluate(f=>{ const b=document.querySelector(`.tseg [data-tf3="${f}"]`); return !!b&&b.classList.contains('on'); },f);
const railTop=async(p,f)=>p.evaluate(f=>document.querySelector(`.tvp .trail .tri[data-tf3="${f}"]`).offsetTop,f);
for(const [w,h] of [[390,844],[1180,820],[820,1180],[844,390]]){ const tag=`${w}×${h}`; const p=await mk({width:w,height:h});
  await home(p,'f'); const RAIL=await p.evaluate(()=>!!document.querySelector('.tvp .trail')); const W=Math.min(w,await p.evaluate(()=>document.querySelector('.tvp').clientWidth));
  // 1. sin zoom: deslizar hasta el otro tipo sigue desde donde lo soltaste
 let r=await swipe(p,-W*.62);
  ok(r.pre.paging&&r.pre.peek==='m'&&+r.pre.pk>.3,`${tag}: mientras deslizás aparece Movilidad al ritmo del dedo (avance ${r.pre.pk})`);
  ok(r.post.tfil==='m',`${tag}: al soltar pasa a Movilidad`);
  ok(r.jump<2&&(!RAIL||r.rj<2),`${tag}: el mapa y la burbuja siguen desde donde los dejaste (salto ${r.jump.toFixed(1)} / ${r.rj.toFixed(1)} px)`);
  ok(r.mono,`${tag}: el mapa no vuelve atrás en ningún cuadro`);
  if(RAIL){ const tm=await railTop(p,'m'); ok(Math.abs(r.post.rind[0]-tm)<1&&Math.abs(r.post.rind[1]-tm-44)<1,`${tag}: la burbuja termina en Movilidad`); } else ok(await segOn(p,'m'),`${tag}: el segmentado marca Movilidad`);
  ok(!r.post.hold&&!/pgdrag/.test(r.post.cls)&&!r.post.peek,`${tag}: no queda estado colgado del gesto`);
  // la burbuja refleja el avance real del mapa
  if(RAIL){ const k=+r.pre.pk, tf=await railTop(p,'f'); ok(r.pre.rind[1]>tf+44+2,`${tag}: la burbuja ya se estiró hacia Movilidad (k ${k})`); }
  // 2. al revés, hacia Cardio
  r=await swipe(p,W*.62); ok(r.post.tfil==='f'&&r.jump<2&&r.mono,`${tag}: volver deslizando a Fuerza, sin salto (${r.jump.toFixed(1)})`);
  // 3. un tramo corto y lento vuelve a su lugar suave
  await home(p,'f'); const c0=await p.evaluate(()=>({...CAM})); const Dm=await p.evaluate(()=>Math.abs(treeKeepCam('m',document.querySelector('.tvp')).x-CAM.x)); r=await swipe(p,-Dm*.2,{steps:12,hold:200});
  ok(r.post.tfil==='f'&&Math.abs(r.post.cam.x-c0.x)<1&&r.jump<2,`${tag}: un tramo corto no cambia de tipo y vuelve suave`);
  if(RAIL){ const tf=await railTop(p,'f'); ok(Math.abs(r.post.rind[0]-tf)<1,`${tag}: la burbuja vuelve a Fuerza`); } else ok(await segOn(p,'f'),`${tag}: el segmentado vuelve a Fuerza`);
  // 4. un gesto rápido y corto sí cambia
  await home(p,'f'); r=await swipe(p,-Math.min(W*.25,100),{steps:2,hold:0}); ok(r.post.tfil==='m',`${tag}: un toque rápido de costado cambia de tipo`);
  // 5. en Cardio (el primero) hacia la derecha: no hay nada, rebota
  await home(p,'b'); r=await swipe(p,W*.5); ok(r.post.tfil==='b',`${tag}: en Cardio hacia la derecha no pasa nada`);
  // 6. con mucho zoom, parado en el borde: deja cambiar
  await home(p,'f'); await zoomTo(p,1.6,'r'); r=await swipe(p,-W*.6);
  ok(r.post.tfil==='m'&&r.jump<2&&r.mono,`${tag}: con zoom al máximo, desde el borde, pasa a Movilidad sin salto`);
  ok(Math.abs(r.post.cam.s-1.6)<.01,`${tag}: mantiene el zoom (${r.post.cam.s.toFixed(2)})`);
  const lm=await p.evaluate(()=>camLim(document.querySelector('.tvp'),CAM.s)); ok(lm.xl===lm.xh||Math.abs(r.post.cam.x-lm.xh)<1,`${tag}: entra a Movilidad por el borde más cercano`);
  // 7. con zoom, en el medio: primero recorre y al llegar al borde sigue al tipo de al lado, en el mismo gesto
  await home(p,'f'); await zoomTo(p,1.6,'c'); const lf=await p.evaluate(()=>camLim(document.querySelector('.tvp'),CAM.s)); const room=(lf.xh-lf.xl)/2;
  if(room>4){ r=await swipe(p,-(room+W*.55),{steps:30,x:.72}); ok(r.post.tfil==='m',`${tag}: con zoom, recorrés y seguís de largo a Movilidad (recorrido ${Math.round(room)} px)`); }
  // 8. con zoom en el borde, empezás a pasar y te arrepentís: vuelve a mover el mapa normal
  await home(p,'f'); await zoomTo(p,1.6,'r'); const x0=await p.evaluate(()=>CAM.x), rg=await p.evaluate(()=>{ const L=camLim(document.querySelector('.tvp'),CAM.s); return L.xh-L.xl; }); r=await swipe(p,-W*.25,{back:W*.25+Math.min(W*.2,rg*.6),hold:150});
  if(rg>40){ ok(r.post.tfil==='f'&&!r.pre.paging,`${tag}: con zoom, si volvés para atrás sale del paso de tipo y mueve el mapa`);
  ok(r.pre.cam.x>x0+Math.min(W*.2,rg*.6)*.8,`${tag}: el mapa se movió hacia adentro (${Math.round(r.pre.cam.x-x0)} px)`); } else console.log('   (sin recorrido horizontal con zoom en esta pantalla: el árbol entra entero)');
  // 9. con el panel de una habilidad abierto también
  await home(p,'f'); await p.evaluate(()=>treeSelect('pull')); await W8(p,900); r=await swipe(p,-W*.5,{y:.3,x:.4});
  ok(r.post.tfil==='m'&&r.jump<2,`${tag}: con el panel abierto también cambia sin salto`);
  // 10. el riel sigue andando igual
  await home(p,'f');
  const SEL=RAIL?'.tvp .trail .tri':'.tseg [data-tf3]';
  { const cov=await p.evaluate(SEL=>[...document.querySelectorAll(SEL)].filter(b=>{ const r=b.getBoundingClientRect(), e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); return !(e&&e.closest('[data-tf3]')===b); }).map(b=>b.dataset.tf3),SEL);
    ok(!cov.length,`${tag}: ningún botón del riel queda tapado ${JSON.stringify(cov)}`); }
  const rb=await p.evaluate(SEL=>document.querySelector(SEL+'[data-tf3="b"]').getBoundingClientRect().toJSON(),SEL.replace(' [data-tf3]',' ')); await p.mouse.click(rb.x+rb.width/2,rb.y+rb.height/2); await W8(p,900);
  ok(await p.evaluate(()=>TFIL)==='b',`${tag}: tocar Cardio en el riel`);
  await p.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
