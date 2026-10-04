// v270: la app sin conexión. Arma el sitio en un subdirectorio, como GitHub Pages, y usa el service worker real: guarda letra, íconos y lo usado, y cada versión estrena caché
const {chromium}=require('playwright'); const seed=require('./seed.js'); const {execSync}=require('child_process'); const path=require('path');
const U='http://127.0.0.1:8765/_sitio_prueba/'; const arma=v=>execSync('node tools/armar.js _sitio_prueba',{cwd:path.join(__dirname,'..'),env:Object.assign({},process.env,{APP_V:v})}).toString().trim();
(async()=>{ arma('v900'); const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  let ok=0,bad=0; const T=(c,m)=>{ if(c) ok++; else { bad++; console.log('FAIL',m); } };
  await p.goto(U); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(500);
  await p.evaluate(async()=>{ await navigator.serviceWorker.ready; }); await p.reload(); await p.waitForTimeout(800);
  let r=await p.evaluate(async()=>({ctl:!!navigator.serviceWorker.controller,keys:await caches.keys(),n:(await (await caches.open((await caches.keys())[0])).keys()).length}));
  T(r.ctl&&r.keys.length===1&&r.keys[0]==='entreno-v900'&&r.n>=16,'instalado y con la caché llena · '+JSON.stringify(r));
  /* usar una sesión con conexión: sus animaciones quedan guardadas */
  await p.evaluate(()=>{ go('fuerza'); }); await p.waitForTimeout(400); await p.evaluate(()=>document.querySelector('#goFz').click()); await p.waitForTimeout(1500);
  const ex=await p.evaluate(async()=>{ const c=await caches.open((await caches.keys())[0]); return (await c.keys()).filter(q=>/\/ex\//.test(q.url)).length; }); T(ex>0,'las animaciones usadas quedan guardadas · '+ex);
  await p.evaluate(()=>{ draft=null; go('home'); });
  /* sin conexión */
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1500);
  r=await p.evaluate(async()=>{ await document.fonts.ready; const f=async u=>{ try{ return (await fetch(u)).ok; }catch(e){ return false; } };
    return {view,titulo:document.title,h1:(document.querySelector('#app h1')||{}).textContent,ver:(typeof APP_V!=='undefined'?APP_V:null),
      fuentes:['500 16px "Nodo Sans"','600 16px "Nodo Sans Ancha"'].map(x=>document.fonts.check(x)),
      fam:getComputedStyle(document.querySelector('#app h1')).fontFamily.split(',')[0],
      archivos:{ico:await f('iconos/icon-192.png'),badge:await f('iconos/ic_stat_entreno.png'),man:await f('manifest.webmanifest'),mono:await f('assets/fonts/NodoMono-Medium.woff')}}; });
  T(r.view==='home'&&/Hola/.test(r.h1||'')&&r.titulo==='Nodo Entreno'&&r.ver==='v900','sin conexión abre la app · '+JSON.stringify({v:r.view,h1:r.h1,t:r.titulo,ver:r.ver}));
  T(r.fuentes.every(Boolean)&&r.fam.includes('Nodo Sans Ancha'),'sin conexión, la letra propia · '+JSON.stringify([r.fuentes,r.fam]));
  T(Object.values(r.archivos).every(Boolean),'sin conexión, íconos, manifiesto y fuentes · '+JSON.stringify(r.archivos));
  await p.evaluate(()=>{ go('fuerza'); }); await p.waitForTimeout(400); await p.evaluate(()=>document.querySelector('#goFz').click()); await p.waitForTimeout(1500);
  r=await p.evaluate(()=>({view,img:[...document.querySelectorAll('#app .photo img, #app .photo canvas, #app .photo svg')].length,err:!!document.querySelector('#app .photo.err,#app .photo .err')}));
  T(r.view==='fuerza','sin conexión, se entrena igual · '+JSON.stringify(r));

  await p.evaluate(()=>{ draft=null; go('home'); });
  /* publicación nueva: la app instalada se actualiza y borra la caché vieja */
  await ctx.setOffline(false); arma('v901');
  await p.reload(); await p.waitForTimeout(2500); await p.reload(); await p.waitForTimeout(1500);
  r=await p.evaluate(async()=>({ver:APP_V,keys:await caches.keys()}));
  T(r.ver==='v901'&&r.keys.length===1&&r.keys[0]==='entreno-v901','versión nueva: se actualiza y borra la caché vieja · '+JSON.stringify(r));
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1200); r=await p.evaluate(()=>({ver:APP_V,view}));
  T(r.ver==='v901'&&r.view==='home','sin conexión, abre la versión nueva · '+JSON.stringify(r));
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,3))); await b.close(); })();
