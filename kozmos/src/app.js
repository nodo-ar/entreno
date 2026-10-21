/* ===== App: rutas, transiciones y arranque ===== */
/* Rutas: #/hoy · #/hoy/rumbo · #/hoy/sesion · #/hoy/resumen/<sesión> · #/hoy/rutinas[/<rutina>] · #/hoy/hazanas[/<hazaña>] · #/cielo · #/cielo/<constelación> · #/cielo/<constelación>/anotar[/<orden>]
   · #/progreso · #/progreso/<sesión> · #/vos · #/vos/equipo · #/vos/dias · #/vos/peso · #/vos/respaldo · #/vos/acerca
   Lo que no existe cae en el lugar más cercano que sí. */
K.ruta = () => {
  const [tab = "hoy", a = "", b = "", n = ""] = location.hash.replace(/^#\/?/, "").split("/");
  if (!K.PESTANAS.some(p => p[0] === tab)) return {tab: "hoy", sub: "", hondo: 0};
  if (tab === "hoy"){
    if (a === "rumbo") return {tab, sub: a, hondo: 1};
    /* rutinas y hazañas: la lista, y la abierta un paso más adentro */
    if (a === "rutinas") return K.RUTINAS.some(x => x.id === b) ? {tab, sub: a, sub2: b, hondo: 2} : {tab, sub: a, hondo: 1};
    if (a === "hazanas") return K.HAZANAS.hazanas.some(x => x.id === b) ? {tab, sub: a, sub2: b, hondo: 2} : {tab, sub: a, hondo: 1};
    /* la sesión existe solo mientras corre; el resumen, si la sesión está guardada */
    if (a === "sesion" && K.sesion.activa()) return {tab, sub: a, hondo: 1};
    if (a === "resumen" && K.diario.sesiones.some(s => s.id === b)) return {tab, sub: a, sub2: b, hondo: 1};
    return {tab, sub: "", hondo: 0};
  }
  if (tab === "vos") return ["acerca", "equipo", "dias", "peso", "respaldo"].includes(a) ? {tab, sub: a, hondo: 1} : {tab, sub: "", hondo: 0};
  if (tab === "progreso") return K.diario.sesiones.some(s => s.id === a) ? {tab, sub: a, hondo: 1} : {tab, sub: "", hondo: 0};
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
  /* al salir de la sesión con el descanso corriendo, la isla nace de su anillo */
  const an = !(tab === "hoy" && sub === "sesion") && K.$('[data-r="anillo"]', app);
  if (an){ const r = an.getBoundingClientRect(); if (r.width) K._anillo = {r, t: Date.now()}; }
  /* al cambiar de pestaña, la pantalla que se va gira hacia afuera (a la sesión se entra con el disco del logo, no girando) */
  const viejo = anim === "tab" && sub !== "sesion" && sub !== "resumen" && !K.reduce() && K._ultima && app.firstElementChild, rv = viejo && viejo.getBoundingClientRect();
  const v = document.createElement("main");
  v.dataset.tab = tab;
  v.innerHTML = K.P[tab](r);
  /* en horizontal, dentro de la misma pestaña se mueve solo el panel abierto: la lista queda quieta */
  const panel = anim && anim !== "tab" && K.horizontal() && K.$(".split>.abierto", v);
  v.className = "view" + (anim && anim !== "tab" && !K.reduce() && !panel ? " vt-" + anim : "");
  if (panel && !K.reduce()) panel.classList.add("vt-" + anim);
  app.replaceChildren(v);
  if (viejo){ const i = t => K.PESTANAS.findIndex(x => x[0] === t); K.mov.girar(viejo, rv, v, i(tab) >= i(K._ultima.tab) ? 1 : -1); }
  /* en la sesión y su resumen no hay barra: la pantalla es toda tuya */
  document.body.classList.toggle("en-sesion", tab === "hoy" && (sub === "sesion" || sub === "resumen"));
  K.sesion.alLatir();
  K.fig.animar();
  K.nav.marcar(tab);
  K.encabezado.observar(v);
  /* recién terminada la sesión, la estrella nueva vuela a su lugar */
  if (K._estrella && sub === "resumen"){ K._estrella = false; K.mov.estrella(v); }
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
  /* en una prueba de estrella, un toque en cualquier lado de la pantalla es «Listo»: las manos vienen de la barra */
  if (e.target.closest(".ses.prueba.serie") && !e.target.closest("button, a, input")){ K.ses.listo(); return; }
  const m = e.target.closest("#tema-menu, #avisos-menu, #res-mas, #rs-guardar, #rs-traer, #v-peso-listo, #hoy-igual, #rut-seguir, #rut-mas, #hz-nivel, #hz-empezar, [data-probar], [data-equipo], [data-ppaso], [data-dia]");
  if (m){
    if (m.dataset.probar) K.ses.probar(m.dataset.probar, m);
    else if (m.dataset.equipo) K.equipoTocar(m.dataset.equipo);
    else if (m.dataset.ppaso) K.pesoPaso(Number(m.dataset.ppaso));
    else if (m.dataset.dia) K.diaTocar(Number(m.dataset.dia));
    else ({"tema-menu": () => K.menuTema(m), "avisos-menu": () => K.menuAvisos(m), "res-mas": () => K.resumenMenu(m),
      "rs-guardar": () => K.mov.girando(m, K.resp.guardar), "rs-traer": () => K.$("#rs-archivo").click(), "v-peso-listo": () => K.pesoListo(),
      "hoy-igual": () => { K._igual = K.hoy(); K.refrescar(); }, "rut-seguir": () => K.rutinaSeguir(m.dataset.rutina), "rut-mas": () => K.rutinaMenu(m),
      "hz-nivel": () => K.hazanaNivelMenu(m), "hz-empezar": () => K.ses.hazana(m.dataset.hazana, K._nivel[m.dataset.hazana] ?? 0, m)})[m.id]();
    return;
  }
  const s = e.target.closest("#s-empezar, #s-listo, #s-seguir, #s-terminar, #s-cortar, #s-mas, #s-pausa, #s-vuelta, #s-vuelta-menos, #hoy-mas, [data-spaso], [data-rumbo], [data-desc], [data-salio]");
  if (s){
    if (s.dataset.spaso) K.ses.paso(s.dataset.campo, Number(s.dataset.spaso));
    else if (s.dataset.rumbo) K.rumboTocar(s.dataset.rumbo);
    else if (s.dataset.desc) K.ses.ajustar(Number(s.dataset.desc));
    else if (s.dataset.salio) K.ses.salio(Number(s.dataset.salio));
    else ({"s-empezar": () => K.ses.empezar(s), "s-listo": () => K.ses.listo(), "s-seguir": () => K.ses.seguir(),
      "s-terminar": () => K.ses.terminar(), "s-cortar": () => K.ses.cortar(), "s-mas": () => K.ses.menu(s),
      "s-pausa": () => K.ses.pausa(), "s-vuelta": () => K.ses.vuelta(1), "s-vuelta-menos": () => K.ses.vuelta(-1), "hoy-mas": () => K.hoyMenu(s)})[s.id]();
    return;
  }
  const t = e.target.closest("#f-estrella, #f-fecha, #f-guardar, [data-paso], [data-borrar]");
  if (!t) return;
  if (t.id === "f-estrella") K.anotar.menuEstrella(t);
  else if (t.id === "f-fecha") K.anotar.menuFecha(t);
  else if (t.id === "f-guardar") K.anotar.guardar();
  else if (t.dataset.paso) K.anotar.paso(t.dataset.campo, Number(t.dataset.paso));
  else K.anotar.borrar(t.dataset.borrar);
});
document.addEventListener("change", e => { if (e.target.id === "rs-archivo"){ const f = e.target.files[0]; e.target.value = ""; K.mov.girando(K.$("#rs-traer"), () => K.resp.traer(f)); } });
document.addEventListener("input", e => {
  if (e.target.id === "v-peso"){ K._peso = e.target.value; return; }
  const c = e.target.closest?.(".pmv"); if (!c) return;
  if (c.classList.contains("spv")) K.ses.escribir(c.dataset.campo, c.value); else K.anotar.escribir(c.dataset.campo, c.value);
});
/* las constelaciones del cielo se abren también con el teclado */
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.('[role="link"][data-ir]')){ e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", {bubbles: true})); }
  if (e.key === "Enter" && e.target.matches?.(".pmv.spv")){ e.preventDefault(); e.target.blur(); return; }
  if (e.key === "Enter" && e.target.id === "v-peso"){ e.preventDefault(); K.pesoListo(); return; }
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
/* una sesión que quedó en curso (la app se cerró o el teléfono la mató) sigue donde estaba */
K.sesion.alCambiar = () => K.refrescar(); /* otra pestaña tocó la sesión */
K.diario.abrir().then(async () => {
  const r = await K.sesion.restaurar();
  K.mostrar(); K.mov.arranque();
  if (r === "guardada") K.aviso("La sesión que quedó abierta se guardó como cortada.");
});

/* sin conexión desde la segunda apertura */
if ("serviceWorker" in navigator && location.protocol !== "file:")
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
