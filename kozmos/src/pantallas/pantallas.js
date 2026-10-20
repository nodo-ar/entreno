/* ===== Pantallas: Hoy, Progreso y Vos (Cielo vive en cielo.js) ===== */
K.P = {};

/* Vacío: la misma pieza en todas las pantallas sin datos (dibujo chico, título y una frase, alineados a la izquierda) */
K.vacio = (dibujo, titulo, texto, cls = "") => `<section class="cd vacio ${cls}"><div class="ilus" aria-hidden="true">${dibujo}</div><b>${titulo}</b><p>${texto}</p></section>`;
const azar = semilla => { let s = semilla; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

/* Hoy: un pedacito de cielo con la próxima estrella en anillo */
K.P.hoy = () => {
  const f = new Date().toLocaleDateString("es-AR", {weekday: "long", day: "numeric", month: "long"});
  const r = azar(3); let g = "";
  for (let i = 0; i < 16; i++) g += `<circle cx="${(r() * 140).toFixed(1)}" cy="${(r() * 56).toFixed(1)}" r="${(r() * .6 + .7).toFixed(2)}" fill="var(--ink-3)"/>`;
  g += `<path d="M14 42 L46 30 L78 36 L112 16" fill="none" stroke="var(--ink-3)" stroke-width="1"/><circle cx="14" cy="42" r="2.6" fill="var(--ink-3)"/><circle cx="46" cy="30" r="2.6" fill="var(--ink-3)"/><circle cx="78" cy="36" r="2.6" fill="var(--ink-3)"/>
    <circle cx="112" cy="16" r="7" fill="none" stroke="var(--ink)" stroke-width="2"/><circle cx="112" cy="16" r="2.4" fill="var(--ink)"/>`;
  return K.enc({titulo: "Hoy", sub: f}) + K.vacio(`<svg viewBox="0 0 140 56">${g}</svg>`, "Todavía no hay nada para hoy", "Acá vas a ver la próxima estrella y lo que toca entrenar.");
};

/* Progreso: siete semanas en blanco */
K.P.progreso = () => K.enc({titulo: "Progreso", sub: "Tus semanas"}) +
  K.vacio(`<svg viewBox="0 0 140 56">${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${i * 20 + 2}" y="44" width="14" height="8" rx="4" fill="var(--s2)"/>`).join("")}</svg>`,
    "Todavía no hay semanas", "Después de tu primera sesión vas a ver tus minutos y tus marcas.");

/* Vos: el tema se elige con un menú desplegable; Acerca se abre a la derecha en horizontal y como otra pantalla en vertical */
K.P.vos = r => {
  const det = r.sub === "acerca";
  return `<div class="split${det ? " en-detalle" : ""}"><div class="lado">${K.enc({titulo: "Vos", sub: "Ajustes"})}
    <div class="aj">
      <button type="button" class="ajr" id="tema-menu" aria-haspopup="menu" aria-expanded="false"><span class="tile">${K.ic("auto")}</span><span>Tema</span><em>${K.esc(K.tema.nombre())}</em>${K.ic("chevd", "chev")}</button>
      <button type="button" class="ajr" data-ir="#/vos/acerca" data-quieto="1" data-sel><span class="tile">${K.ic("info")}</span><span>Acerca de Kozmos</span><em></em>${K.ic("chev", "chev")}</button>
    </div></div>
    <div class="abierto">${K.P.acerca()}</div></div>`;
};
K.P.acerca = () => K.enc({titulo: "Acerca de Kozmos", sub: "Ajustes", volver: "#/vos", raiz: true, det: true}) +
  `<section class="cd acerca">${K.logo(64)}<h2>Kozmos</h2>
   <p class="lema"><i>Per aspera ad astra.</i> Por lo difícil, a las estrellas.</p>
   <p class="mute">Funciona sin conexión. Lo que hacés queda en este teléfono: sin cuentas ni servidores.</p>
   <span class="lb">Versión <span class="num">${K.esc(K.VERSION)}</span></span></section>
   <p class="pie small mute">Letra: Mona Sans y Geist Mono, con licencia SIL Open Font License.</p>`;
K.menuTema = btn => K.menu.abrir(btn, {titulo: "Tema",
  items: K.TEMAS.map(([v, n, ic]) => ({id: v, texto: n, ic, elegido: K.tema.actual() === v})),
  elegir: id => K.cambiarTema(id)});

/* cambiar el tema siempre se puede deshacer */
K.cambiarTema = t => {
  const antes = K.tema.actual(); if (t === antes) return;
  K.tema.poner(t); K.refrescar();
  K.deshacer(`Tema ${K.tema.nombre(t).toLowerCase()}`, () => { K.tema.poner(antes); K.refrescar(); });
};
