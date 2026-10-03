const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev216.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const W8=(p,ms)=>p.waitForTimeout(ms);
for(const [w,h,mob] of [[390,844,1],[360,560,1],[844,390,1],[1180,820,0],[820,1180,1]]){ const tag=`${w}×${h}`;
  const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:'dark',hasTouch:!!mob,isMobile:!!mob}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message)); const cdp=await ctx.newCDPSession(p);
  /* la app se publica con meta viewport (la pone el envoltorio); acá se agrega para que la emulación de celular sea fiel */
  await p.route('**/'+src,async rt=>{ const r=await rt.fetch(); const body='<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'+await r.text(); await rt.fulfill({response:r,body,headers:{...r.headers(),'content-type':'text/html; charset=utf-8'}}); });
  await p.goto('http://127.0.0.1:8765/'+src); await W8(p,400); await seed(p); await W8(p,900);
  await p.evaluate(()=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); go('hist'); }); await W8(p,700);
  await p.evaluate(()=>scrollTo(0,500)); await W8(p,200);
  await p.evaluate(()=>{ TFIL='f'; CAM=null; TSEL=null; go('arbol'); }); await W8(p,1600);
  const st=()=>p.evaluate(()=>({sy:scrollY,sh:document.documentElement.scrollHeight,ih:innerHeight,lk:document.documentElement.classList.contains('nosc')}));
  let s=await st(); ok(s.sy===0&&s.lk,`${tag}: al entrar al árbol la pantalla arranca arriba y queda quieta`);
  ok(s.sh<=s.ih+1,`${tag}: no sobra alto para desplazar (${s.sh} de ${s.ih})`);
  const drag=async(x,y0,y1)=>{ if(mob){ await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:y0}]}); for(let i=1;i<=10;i++){ await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y0+(y1-y0)*i/10}]}); await W8(p,16); } await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); } else { await p.mouse.move(x,y0); await p.mouse.wheel(0,y0-y1); } await W8(p,500); };
  // arrastrar/rueda sobre el título
  await drag(w*.4,70,h*.05<30?20:10); await drag(w*.4,80,-200); s=await st(); ok(s.sy===0,`${tag}: arrastrar sobre el título no corre la pantalla (${s.sy})`);
  await p.mouse.move(w*.4,60); await p.mouse.wheel(0,500); await W8(p,400); s=await st(); ok(s.sy===0,`${tag}: la rueda sobre el título no corre la pantalla`);
  // el mapa sí se navega
  { const y0=await p.evaluate(()=>CAM.y); const r=await p.evaluate(()=>document.querySelector('#tsvg').getBoundingClientRect().toJSON());
    await p.mouse.move(r.left+r.width*.45,r.top+r.height*.3); await p.mouse.down(); await p.mouse.move(r.left+r.width*.45,r.top+r.height*.3+160,{steps:10}); await p.mouse.up(); await W8(p,700);
    const y1=await p.evaluate(()=>CAM.y); s=await st(); ok(Math.abs(y1-y0)>40&&s.sy===0,`${tag}: el mapa se mueve por dentro (${Math.round(y1-y0)} px) y la pantalla no`); }
  // la rueda sobre el mapa hace zoom, no corre la pantalla
  { const r=await p.evaluate(()=>document.querySelector('#tsvg').getBoundingClientRect().toJSON()); const s0=await p.evaluate(()=>CAM.s); await p.mouse.move(r.left+r.width*.4,r.top+r.height*.5); await p.mouse.wheel(0,-300); await W8(p,300); const s1=await p.evaluate(()=>CAM.s); s=await st(); ok(s1!==s0&&s.sy===0,`${tag}: la rueda sobre el mapa acerca y la pantalla no se mueve`); }
  // panel de una habilidad: se desplaza por dentro
  await p.evaluate(()=>treeSelect('pull')); await W8(p,900);
  { const r=await p.evaluate(()=>{ const pn=document.querySelector('.tpanel'); return {sh:pn.scrollHeight,ch:pn.clientHeight,b:pn.getBoundingClientRect().bottom}; });
    if(r.sh>r.ch+4){ const pr=await p.evaluate(()=>document.querySelector('.tpanel').getBoundingClientRect().toJSON()); await p.mouse.move(pr.left+pr.width/2,pr.top+pr.height*.6); await p.mouse.wheel(0,300); await W8(p,400); const t=await p.evaluate(()=>document.querySelector('.tpanel').scrollTop); s=await st(); ok(t>0&&s.sy===0,`${tag}: el panel se desplaza por dentro (${t}) y la pantalla no`); }
    else ok(r.b<=await p.evaluate(()=>innerHeight)+1,`${tag}: el panel entra entero`); }
  await p.evaluate(()=>treeSelect(null)); await W8(p,500);
  // vista general: se desplaza por dentro si hace falta
  await p.evaluate(()=>treeFly('t')); await W8(p,900);
  { const r=await p.evaluate(()=>{ const t=document.querySelector('.ttodo'); return {sh:t.scrollHeight,ch:t.clientHeight}; });
    if(r.sh>r.ch+4){ const tr=await p.evaluate(()=>document.querySelector('.ttodo').getBoundingClientRect().toJSON()); await p.mouse.move(tr.left+tr.width/2,tr.top+tr.height*.6); await p.mouse.wheel(0,300); await W8(p,400); const t=await p.evaluate(()=>document.querySelector('.ttodo').scrollTop); s=await st(); ok(t>0&&s.sy===0,`${tag}: Todo se desplaza por dentro (${t}) y la pantalla no`); }
    else console.log(`   ${tag}: Todo entra entero`); }
  await p.evaluate(()=>treeFly('f')); await W8(p,700);
  // menús del árbol: entran en la pantalla o se desplazan por dentro
  for(const id of ['#tNext','#tGoal','#tFilt','#tFind']){ const has=await p.evaluate(id=>!!document.querySelector(id),id); if(!has) continue; await p.evaluate(id=>document.querySelector(id).click(),id); await W8(p,700);
    const r=await p.evaluate(()=>{ const el=document.querySelector('.pop,.lpop,[class*="pop"].on')||POP.el; if(!el) return null; const rr=el.getBoundingClientRect(); let sc=false; el.querySelectorAll('*').forEach(x=>{ const cs=getComputedStyle(x); if(/auto|scroll/.test(cs.overflowY)&&x.scrollHeight>x.clientHeight+2) sc=true; }); if(/auto|scroll/.test(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+2) sc=true; return {top:rr.top,bot:rr.bottom,sc}; });
    const ih=await p.evaluate(()=>innerHeight); ok(!r||(r.bot<=ih+1&&r.top>=-1)||r.sc,`${tag}: el menú ${id} entra o se desplaza por dentro ${JSON.stringify(r)}`); await p.evaluate(()=>{ try{ popClose(true); }catch(e){} }); await p.keyboard.press('Escape'); await W8(p,400); }
  s=await st(); ok(s.sy===0,`${tag}: después de abrir los menús la pantalla sigue arriba`);
  // al salir del árbol, las otras pantallas se desplazan normal
  await p.evaluate(()=>go('hist')); await W8(p,900); if(mob) await drag(w*.5,h*.7,h*.15); else { await p.mouse.move(w*.9,h*.5); await p.mouse.wheel(0,500); await W8(p,500); }
  s=await st(); { const ov=await p.evaluate(()=>getComputedStyle(document.documentElement).overflowY); ok(!s.lk&&ov!=='hidden'&&(s.sh<=s.ih+2||s.sy>0),`${tag}: en Progreso la pantalla se desplaza normal (${s.sy} · ${s.sh}/${s.ih})`); }
  await p.evaluate(()=>go('arbol')); await W8(p,1400); s=await st(); ok(s.sy===0&&s.lk&&s.sh<=s.ih+1,`${tag}: volver al árbol desde abajo: arriba y quieta`);
  await ctx.close(); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
