// v270: la app sin conexión. Arma el sitio en un subdirectorio, como GitHub Pages, y usa el service worker real: guarda letra, íconos y lo usado, y cada versión estrena caché
const {chromium}=require('playwright'); const seed=require('./seed.js'); const {execSync}=require('child_process'); const path=require('path');
/* servidor propio del sitio armado, con una llave para que la página tarde (red lenta) */
const http=require('http'), fs=require('fs'); const RAIZ=path.join(__dirname,'..','_sitio_prueba'); let LENTO=0;
const TIPOS={html:'text/html; charset=utf-8',js:'text/javascript',json:'application/json',woff:'font/woff',png:'image/png',svg:'image/svg+xml',webmanifest:'application/manifest+json'};
const srv=http.createServer((q,res)=>{ let f=decodeURIComponent(q.url.split('?')[0]).replace(/^\/s\//,''); if(f===''||f.endsWith('/')) f+='index.html';
  const ruta=path.join(RAIZ,f); const dar=()=>fs.readFile(ruta,(e,d)=>{ if(e){ res.writeHead(404); res.end(); return; } res.writeHead(200,{'content-type':TIPOS[f.split('.').pop()]||'application/octet-stream','cache-control':'no-cache'}); res.end(d); });
  if(LENTO&&f==='index.html') setTimeout(dar,LENTO); else dar(); }).listen(8767);
const U='http://127.0.0.1:8767/s/'; const arma=v=>execSync('node tools/armar.js _sitio_prueba',{cwd:path.join(__dirname,'..'),env:Object.assign({},process.env,{APP_V:v})}).toString().trim();
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
  /* red lenta: la página tarda 8 s; a los 3 s abre la guardada, y la nueva queda guardada para la próxima */
  await ctx.setOffline(false); LENTO=8000; let t0=Date.now(); await p.reload(); let ms=Date.now()-t0; r=await p.evaluate(()=>({ver:APP_V,view}));
  T(ms>=2500&&ms<6000&&r.ver==='v901'&&r.view==='home','red lenta: abre la guardada a los 3 s · '+ms+' ms '+JSON.stringify(r));
  arma('v902'); t0=Date.now(); await p.reload(); ms=Date.now()-t0; r=await p.evaluate(()=>({ver:APP_V}));
  T(ms<6000&&r.ver==='v901','red lenta con versión nueva publicada: abre la guardada, sin esperar · '+ms+' ms '+JSON.stringify(r));
  await p.waitForTimeout(9000); /* la red termina en segundo plano y guarda la página nueva */
  t0=Date.now(); await p.reload(); ms=Date.now()-t0; await p.waitForTimeout(500); r=await p.evaluate(()=>({ver:APP_V}));
  T(r.ver==='v902','la próxima apertura ya trae la versión nueva · '+ms+' ms '+JSON.stringify(r));
  LENTO=0; srv.close();
  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,3))); await b.close(); })();
