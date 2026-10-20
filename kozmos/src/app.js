/* ===== App: rutas, transiciones y arranque ===== */
/* Rutas: #/hoy · #/cielo · #/progreso · #/vos · #/vos/tema · #/vos/acerca */
K.ruta = () => {
  const [tab = "hoy", sub = ""] = location.hash.replace(/^#\/?/, "").split("/");
  return K.PESTANAS.some(p => p[0] === tab) ? {tab, sub} : {tab: "hoy", sub: ""};
};
K.ir = h => { if (location.hash !== h) location.hash = h; else K.mostrar(); };
K.horizontal = () => matchMedia("(orientation: landscape) and (max-height: 520px)").matches;

K.mostrar = (anim = "") => {
  const {tab, sub} = K.ruta(), app = K.$("#app");
  K.menu.cerrar(true);
  const v = document.createElement("main");
  v.className = "view" + (anim && !K.reduce() ? " vt-" + anim : "");
  v.dataset.tab = tab;
  v.innerHTML = tab === "vos" ? K.P.vos(sub) : K.P[tab]();
  app.replaceChildren(v);
  K.nav.marcar(tab);
  K.encabezado.observar(v);
  document.title = tab === "hoy" ? "Kozmos" : `${K.$(".enc-tit h1", v)?.textContent || ""} · Kozmos`;
  K._ultima = {tab, sub};
};
/* volver a dibujar sin moverse (por ejemplo, al cambiar el tema) */
K.refrescar = () => { const y = scrollY; K.mostrar(); scrollTo(0, y); };

/* clics: data-ir navega; el ⋯ de Vos abre su menú; las opciones de tema cambian el tema */
document.addEventListener("click", e => {
  const a = e.target.closest("[data-ir]");
  if (a){ K._quieto = !!a.dataset.quieto && K.horizontal(); K.ir(a.dataset.ir); return; }
  const t = e.target.closest("[data-tema]");
  if (t){ K.cambiarTema(t.dataset.tema); return; }
  const m = e.target.closest("#vos-mas");
  if (m) K.menu.abrir(m, {titulo: "Tema", items: [
    ...K.TEMAS.map(([v, n, ic]) => ({id: v, texto: n, ic, elegido: K.tema.actual() === v})),
    "-", {id: "acerca", texto: "Acerca de Kozmos", ic: "info"}],
    elegir: id => id === "acerca" ? K.ir("#/vos/acerca") : K.cambiarTema(id)});
});

addEventListener("hashchange", () => {
  const antes = K._ultima || {}, {tab, sub} = K.ruta();
  let anim = "tab";
  if (tab === antes.tab) anim = K._quieto ? "" : (sub && !antes.sub ? "fwd" : !sub && antes.sub ? "back" : "");
  K._quieto = false;
  K.mostrar(anim);
  if (anim) scrollTo(0, 0);
});
/* al girar el teléfono, lo que no cambia queda quieto: se redibuja la misma pantalla sin animar */
matchMedia("(orientation: landscape) and (max-height: 520px)").addEventListener?.("change", () => K.refrescar());
addEventListener("keydown", e => { if (e.key === "Escape") K.deshacer.cerrar(); });

/* arranque */
K.encabezado.armar();
K.nav.armar();
K.mostrar();

/* sin conexión desde la segunda apertura */
if ("serviceWorker" in navigator && location.protocol !== "file:")
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
