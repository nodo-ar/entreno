/* ===== App: rutas, transiciones y arranque ===== */
/* Rutas: #/hoy · #/cielo · #/cielo/<constelación> · #/cielo/<constelación>/anotar[/<orden>] · #/progreso · #/vos · #/vos/acerca
   Lo que no existe cae en el lugar más cercano que sí. */
K.ruta = () => {
  const [tab = "hoy", a = "", b = "", n = ""] = location.hash.replace(/^#\/?/, "").split("/");
  if (!K.PESTANAS.some(p => p[0] === tab)) return {tab: "hoy", sub: "", hondo: 0};
  if (tab === "vos") return a === "acerca" ? {tab, sub: a, hondo: 1} : {tab, sub: "", hondo: 0};
  if (tab === "cielo"){
    const c = K.CATALOGO.constelaciones.find(x => x.id === a);
    if (!c) return {tab, sub: "", hondo: 0};
    if (b !== "anotar") return {tab, sub: c.id, hondo: 1};
    const o = Number(n);
    return {tab, sub: c.id, sub2: "anotar", sub3: Number.isInteger(o) && o >= 1 && o <= c.estrellas.length ? o : 0, hondo: 2};
  }
  return {tab, sub: "", hondo: 0};
};
K.ir = (h, reemplazar) => { if (location.hash === h) K.mostrar(); else if (reemplazar){ K._reemplazo = true; location.replace(h); } else location.hash = h; };
K.horizontal = () => matchMedia("(orientation: landscape) and (max-height: 520px)").matches;

K.mostrar = (anim = "") => {
  const r = K.ruta(), {tab, sub, hondo} = r, app = K.$("#app");
  K.menu.cerrar(true);
  const v = document.createElement("main");
  v.dataset.tab = tab;
  v.innerHTML = K.P[tab](r);
  /* en horizontal, dentro de la misma pestaña se mueve solo el panel abierto: la lista queda quieta */
  const panel = anim && anim !== "tab" && K.horizontal() && K.$(".split>.abierto", v);
  v.className = "view" + (anim && !K.reduce() && !panel ? " vt-" + anim : "");
  if (panel && !K.reduce()) panel.classList.add("vt-" + anim);
  app.replaceChildren(v);
  K.nav.marcar(tab);
  K.encabezado.observar(v);
  const h1 = K.$$(".enc-tit h1", v).find(x => x.offsetParent !== null);
  document.title = tab === "hoy" || !h1 ? "Kozmos" : `${h1.textContent} · Kozmos`;
  K._ultima = {tab, sub, hondo};
};
/* volver a dibujar sin moverse (por ejemplo, al cambiar el tema) */
K.refrescar = () => {
  const y = scrollY, f = document.activeElement?.id;
  K.mostrar(); scrollTo(0, y);
  if (f) document.getElementById(f)?.focus({preventScroll: true});
};

/* la pila de lo recorrido en esta apertura: volver usa el botón atrás cuando la pantalla anterior es la de destino */
K._pila = [location.hash || "#/hoy"];
K.volver = h => { if (K._pila.length > 1 && K._pila[K._pila.length - 2] === h) history.back(); else K.ir(h, true); };

/* clics: data-ir navega, data-volver vuelve; los menús y el formulario de anotar */
document.addEventListener("click", e => {
  const v = e.target.closest("[data-volver]");
  if (v){ K.volver(v.dataset.volver); return; }
  const a = e.target.closest("[data-ir]");
  /* en horizontal, abrir un ajuste no suma pasos al botón atrás: la lista y lo abierto son una sola pantalla */
  if (a){ K._quieto = !!a.dataset.quieto && K.horizontal(); K.ir(a.dataset.ir, K._quieto); return; }
  const m = e.target.closest("#tema-menu");
  if (m){ K.menuTema(m); return; }
  const t = e.target.closest("#f-estrella, #f-fecha, #f-guardar, [data-paso], [data-borrar]");
  if (!t) return;
  if (t.id === "f-estrella") K.anotar.menuEstrella(t);
  else if (t.id === "f-fecha") K.anotar.menuFecha(t);
  else if (t.id === "f-guardar") K.anotar.guardar();
  else if (t.dataset.paso) K.anotar.paso(t.dataset.campo, Number(t.dataset.paso));
  else K.anotar.borrar(t.dataset.borrar);
});
document.addEventListener("input", e => { const c = e.target.closest?.(".pmv"); if (c) K.anotar.escribir(c.dataset.campo, c.value); });
/* las constelaciones del cielo se abren también con el teclado */
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.('[role="link"][data-ir]')){ e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", {bubbles: true})); }
  if (e.key === "Enter" && e.target.matches?.(".pmv")){ e.preventDefault(); K.anotar.guardar(); }
});

addEventListener("hashchange", () => {
  const antes = K._ultima || {}, {tab, hondo} = K.ruta(), h = location.hash, P = K._pila;
  if (P.length > 1 && P[P.length - 2] === h) P.pop(); else if (K._reemplazo) P[P.length - 1] = h; else P.push(h);
  K._reemplazo = false;
  let anim = "tab";
  if (tab === antes.tab) anim = K._quieto ? "" : hondo > antes.hondo ? "fwd" : hondo < antes.hondo ? "back" : "";
  const quieto = K._quieto; K._quieto = false;
  K.mostrar(anim);
  /* lo abierto arranca arriba; en horizontal la lista es fija, así que no se mueve */
  if (anim || quieto) scrollTo(0, 0);
  /* el foco va al título de lo que se abrió; si la lista quedó quieta, a la fila elegida */
  const v = K.$("main.view"), sel = quieto && K.$(".split>.lado [data-sel]", v);
  const h1 = sel ? null : (K.$$(".split>.abierto .enc-tit h1", v).find(x => x.offsetParent) || K.$$(".enc-tit h1", v).find(x => x.offsetParent));
  if (sel) sel.focus({preventScroll: true});
  else if (h1 && tab === antes.tab){ h1.tabIndex = -1; h1.focus({preventScroll: true}); }
});
/* al girar el teléfono, lo que no cambia queda quieto: se redibuja la misma pantalla sin animar */
matchMedia("(orientation: landscape) and (max-height: 520px)").addEventListener?.("change", () => {
  /* en horizontal abrir una constelación reemplaza; al pasar a vertical, atrás tiene que volver a la lista */
  const {tab, hondo} = K.ruta(), raiz = "#/" + tab, h = location.hash, P = K._pila;
  if (!K.horizontal() && hondo >= 1 && P[P.length - 2] !== raiz){
    history.replaceState(null, "", raiz); history.pushState(null, "", h);
    P.splice(P.length - 1, 1, raiz, h);
  }
  K.refrescar();
});
addEventListener("keydown", e => { if (e.key === "Escape") K.deshacer.cerrar(); });
/* al volver a la pestaña, lo que otra anotó aparece: el diario se relee y, si cambió, se redibuja */
document.addEventListener("visibilitychange", () => { if (!document.hidden) K.diario.releer().then(c => { if (c) K.refrescar(); }).catch(() => {}); });

/* arranque: primero se lee el diario, después se dibuja */
K.encabezado.armar();
K.nav.armar();
K.diario.abrir().then(() => K.mostrar());

/* sin conexión desde la segunda apertura */
if ("serviceWorker" in navigator && location.protocol !== "file:")
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
