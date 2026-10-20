/* Kozmos — service worker: la app abre sin conexión desde la segunda vez (la misma estrategia de Entreno) */

/* La versión la pone tools/armar.mjs: cada publicación estrena caché y borra la anterior. */
const VERSION = "dev";
const CACHE = "kozmos-" + VERSION;
const ESPERA = 3000; /* lo que se espera a la red antes de abrir la página guardada */
const FIJOS = ["./", "manifest.webmanifest", "fuentes/MonaSans.woff2", "fuentes/GeistMono.woff2",
  "iconos/icon-192.png", "iconos/icon-512.png", "iconos/maskable-512.png", "iconos/apple-touch-icon.png", "iconos/favicon-32.png"];

self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FIJOS.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("kozmos-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url), base = self.registration.scope; if (!u.href.startsWith(base)) return;
  const rel = u.pathname.slice(new URL(base).pathname.length);
  /* la página: primero la red, así cada publicación llega enseguida; si no contesta en 3 s, la guardada */
  if (rel === "" || rel === "index.html"){
    const red = fetch(r);
    e.waitUntil(red.then(res => { if (res.ok){ const cp = res.clone(); return caches.open(CACHE).then(c => c.put("./", cp)); } }).catch(() => {}));
    const guardada = () => caches.match("./", {cacheName: CACHE});
    e.respondWith(new Promise(listo => {
      let dado = false; const dar = x => { if (!dado && x){ dado = true; clearTimeout(tope); listo(x); } };
      const tope = setTimeout(() => guardada().then(dar), ESPERA);
      red.then(dar, () => guardada().then(g => { dar(g); if (!dado) listo(Response.error()); }));
    }));
    return;
  }
  /* letra, íconos y manifiesto: no cambian dentro de una versión */
  if (FIJOS.includes(rel))
    e.respondWith(caches.open(CACHE).then(c => c.match(r, {ignoreSearch: true}).then(hit => hit || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))));
});
