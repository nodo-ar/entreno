// Modo rápido para las pruebas: node -r ./fast.js t_chkNNN.js
// · reloj falso: cada espera fija avanza el reloj de la página al instante (timers, Date, rAF)
// · sin animaciones de CSS ni transiciones de vista: la pantalla queda quieta enseguida
// No toca la app ni las pruebas.
const pw=require('playwright');
const CSS='*,*::before,*::after{transition-duration:1ms!important;transition-delay:0s!important;animation-duration:1ms!important;animation-delay:0s!important}';
const INIT=`(()=>{ try{ delete Document.prototype.startViewTransition; }catch(e){} window.__inflight=0; const of=window.fetch; window.fetch=function(...a){ window.__inflight++; return of.apply(this,a).finally(()=>{ setTimeout(()=>{ window.__inflight--; },0); }); }; const st=document.createElement('style'); st.id='__fast'; st.textContent=${JSON.stringify(CSS)}; const add=()=>{ if(!document.getElementById('__fast')) (document.head||document.documentElement).appendChild(st); }; if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add(); })();`;
const real=ms=>new Promise(r=>setTimeout(r,ms));
const wrapPage=async p=>{ await p.clock.install(); await p.addInitScript(INIT);
  /* cada espera: el reloj avanza al instante; si hay pedidos de red en vuelo (fotos, programas), se espera de verdad a que lleguen */
  p.waitForTimeout=async ms=>{ try{ await p.clock.runFor(Math.max(1,Math.round(ms)));
      const t0=Date.now(); while(Date.now()-t0<Math.max(ms,300)){ const n=await p.evaluate(()=>window.__inflight||0); if(!n) break; await real(15); await p.clock.runFor(16); }
    }catch(e){ if(!/closed|Target|destroyed|navigation/.test(e.message)) throw e; } await real(Math.min(25,ms)); };
  return p; };
const L=pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch=async(...a)=>{ const b=await L(...a);
  const nc=b.newContext.bind(b); b.newContext=async(o={})=>{ const c=await nc(Object.assign({reducedMotion:'reduce'},o)); const np=c.newPage.bind(c); c.newPage=async()=>wrapPage(await np()); return c; };
  b.newPage=async(o={})=>{ const c=await b.newContext(o); return c.newPage(); }; return b; };
