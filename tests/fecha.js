// Fecha fija para las pruebas: node -r ./fecha.js t_chkNNN.js (con APP_FECHA=aaaa-mm-ddThh:mm; por defecto, el momento fijo de la suite)
// · corre el reloj de la página a ese momento y desde ahí avanza normal, sin tocar los temporizadores
// · con fast.js (modo rápido) se carga antes y fast.js arranca su reloj falso en esa misma fecha
// La app usa la fecha del teléfono para el plan de la semana, la rotación y el historial: sin esto, la suite da distinto según el día.
const pw=require('playwright');
const DIA=process.env.APP_FECHA||'2026-10-08T10:00';
const ahora=new Date(); const [f,h='10:00']=DIA.split('T'); const [a,m,d]=f.split('-').map(Number), [hh,mm]=h.split(':').map(Number);
const objetivo=new Date(a,m-1,d,hh,mm,0,0);
const DESFASE=objetivo.getTime()-ahora.getTime(); process.env.__APP_DESFASE=String(DESFASE); process.env.__APP_FECHA_DIA=f; /* seed.js comprueba que la página vea este día */
const INIT=`(()=>{ const D=Date, off=${DESFASE}; if(D.__fecha) return;
  function F(...a){ if(!new.target) return new D(D.now()+off).toString(); return a.length?new D(...a):new D(D.now()+off); }
  F.prototype=D.prototype; F.now=()=>D.now()+off; F.parse=D.parse; F.UTC=D.UTC; F.__fecha=true; Object.defineProperty(F.prototype,'constructor',{value:F}); window.Date=F; })();`;
const L=pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch=async(...a)=>{ const b=await L(...a);
  const nc=b.newContext.bind(b); b.newContext=async(o={})=>{ const c=await nc(o); if(!process.env.__APP_RAPIDO) await c.addInitScript(INIT); return c; };
  b.newPage=async(o={})=>{ const c=await b.newContext(o); return c.newPage(); }; return b; };
module.exports={DESFASE,DIA};
