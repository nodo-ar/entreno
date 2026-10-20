/* ===== App: rutas, transiciones y arranque ===== */
/* Rutas: #/hoy · #/cielo · #/progreso · #/vos · #/vos/acerca */
K.ruta = () => {
  const [tab = "hoy", sub = ""] = location.hash.replace(/^#\/?/, "").split("/");
  if (!K.PESTANAS.some(p => p[0] === tab)) return {tab: "hoy", sub: ""};
  return {tab, sub: tab === "vos" && sub === "acerca" ? sub : ""};
};
K.ir = (h, reemplazar) => { if (location.hash === h) K.mostrar(); else if (reemplazar) location.replace(h); else location.hash = h; };
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
K.refrescar = () => {
  const y = scrollY, f = document.activeElement?.id;
  K.mostrar(); scrollTo(0, y);
  if (f) document.getElementById(f)?.focus({preventScroll: true});
};

/* clics: data-ir navega; la fila Tema abre su menú desplegable */
document.addEventListener("click", e => {
  const a = e.target.closest("[data-ir]");
  /* en horizontal, abrir un ajuste no suma pasos al botón atrás: la lista y lo abierto son una sola pantalla */
  if (a){ K._quieto = !!a.dataset.quieto && K.horizontal(); K.ir(a.dataset.ir, K._quieto); return; }
  const m = e.target.closest("#tema-menu");
  if (m) K.menuTema(m);
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
