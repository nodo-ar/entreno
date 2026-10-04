/* Nodo Entreno — service worker: la app sin conexión y la notificación en vivo del entrenamiento */

/* La versión la pone tools/armar.js al publicar (una por commit): cada publicación estrena caché y borra la anterior. */
const VERSION="dev";
const CACHE="entreno-"+VERSION;
const ESPERA=3000; /* lo que se espera a la red antes de abrir la página guardada */
/* lo que se guarda al instalar: la letra, los íconos y el manifiesto; la página se guarda al abrirla */
const FIJOS=["./","manifest.webmanifest",
  "assets/fonts/NodoSans-Regular.woff","assets/fonts/NodoSans-Medium.woff","assets/fonts/NodoSans-SemiBold.woff",
  "assets/fonts/NodoSansAncha-Medium.woff","assets/fonts/NodoSansAncha-SemiBold.woff",
  "assets/fonts/NodoMono-Regular.woff","assets/fonts/NodoMono-Medium.woff",
  "iconos/icon-192.png","iconos/icon-512.png","iconos/maskable-512.png","iconos/apple-touch-icon.png","iconos/favicon-32.png","iconos/ic_stat_entreno.png","iconos/entreno.svg"];

self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FIJOS.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("entreno-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url), base=self.registration.scope; if(!u.href.startsWith(base)) return;
  const rel=u.pathname.slice(new URL(base).pathname.length);
  /* la página: primero la red, así cada publicación llega enseguida. Si la red no contesta en 3 s (o no hay conexión),
     la última guardada; la red sigue y, cuando llega, deja la página nueva guardada para la próxima apertura */
  if(rel===""||rel==="index.html"){
    const red=fetch(r);
    e.waitUntil(red.then(res=>{ if(res.ok){ const cp=res.clone(); return caches.open(CACHE).then(c=>c.put("./",cp)); } }).catch(()=>{}));
    const guardada=()=>caches.match("./",{cacheName:CACHE});
    e.respondWith(new Promise(listo=>{ let dado=false; const dar=x=>{ if(!dado&&x){ dado=true; clearTimeout(tope); listo(x); } };
      const tope=setTimeout(()=>guardada().then(dar),ESPERA);
      red.then(dar,()=>guardada().then(g=>{ dar(g); if(!dado) listo(Response.error()); })); }));
    return; }
  /* letra, íconos, manifiesto, animaciones y rutinas: no cambian dentro de una versión; de la caché, y lo que falte se guarda al pedirlo */
  if(FIJOS.includes(rel)||rel.startsWith("ex/")||rel.startsWith("prog/")){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{ if(res.ok) c.put(r,res.clone()); return res; }))));
  }
});

self.addEventListener("notificationclick",e=>{
  const action=e.action||"open";
  if(action==="open") e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{
    const c=cs.find(x=>x.visibilityState==="visible")||cs[0];
    if(c){ c.postMessage({live:action}); return action==="open"?c.focus():null; }
    return self.clients.openWindow("./");
  }));
});
self.addEventListener("notificationclose",e=>{
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>cs.forEach(c=>c.postMessage({live:"closed"}))));
});
