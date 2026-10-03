/* Barra y Bici — service worker: solo para la notificación en vivo del entrenamiento */
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
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
