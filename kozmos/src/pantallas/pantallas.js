/* ===== Pantallas de la etapa 1: las cuatro pestañas, todavía sin datos ===== */
K.P = {};

/* Hoy */
K.P.hoy = () => {
  const f = new Date().toLocaleDateString("es-AR", {weekday: "long", day: "numeric", month: "long"});
  return K.enc({titulo: "Hoy", sub: f}) +
    `<section class="cd vacio">${K.logo(56)}<b>Tu cielo empieza acá</b><p>Cuando elijas tu rumbo, acá vas a ver la próxima estrella y lo que toca hoy.</p></section>`;
};

/* Cielo: un cielo de muestra, sin constelaciones todavía */
K.cieloMuestra = (semilla, W, H) => {
  let s = semilla; const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  let g = "";
  for (let i = 0; i < W * H / 700; i++) g += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * H).toFixed(1)}" r="${(r() * .9 + .4).toFixed(2)}" fill="var(--ink-3)" opacity="${(r() * .5 + .35).toFixed(2)}"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g}</svg>`;
};
K.P.cielo = () => K.enc({titulo: "Cielo", sub: "14 constelaciones"}) +
  `<section class="cd cielo-vacio"><div class="cielo-fondo">${K.cieloMuestra(9, 320, 440)}</div>
   <div class="vacio"><b>Tus constelaciones van a aparecer acá</b><p>Cada habilidad que perseguís es una constelación, y cada marca que alcanzás enciende una estrella.</p></div></section>`;

/* Progreso */
K.P.progreso = () => K.enc({titulo: "Progreso", sub: "Tus semanas"}) +
  `<section class="cd vacio">${K.ic("progreso")}<b>Todavía no hay semanas</b><p>Después de tu primera sesión vas a ver tus minutos y lo que encendiste.</p></section>`;

/* Vos: lista a la izquierda y lo abierto a la derecha en horizontal; en vertical, lo abierto es otra pantalla */
K.AJUSTES = {
  tema: {titulo: "Tema", ic: "sun", valor: () => K.tema.nombre()},
  acerca: {titulo: "Acerca de Kozmos", ic: "info", valor: () => ""}
};
K.P.vos = (abierto) => {
  const sel = abierto || "tema";
  const filas = Object.entries(K.AJUSTES).map(([k, a]) =>
    `<button type="button" class="ajr" data-ir="#/vos/${k}" data-quieto="1"${sel === k ? " data-sel" : ""}><span class="tile">${K.ic(a.ic)}</span><span>${a.titulo}</span><em>${K.esc(a.valor())}</em>${K.ic("chev", "chev")}</button>`).join("");
  return `<div class="split${abierto ? " en-detalle" : ""}"><div class="lado">${K.enc({titulo: "Vos", sub: "Ajustes", acciones: K.mas("vos-mas")})}
    <div class="aj">${filas}</div></div>
    <div class="abierto">${K.P.ajuste(sel)}</div></div>`;
};
K.P.ajuste = k => {
  const a = K.AJUSTES[k] || K.AJUSTES.tema;
  const enc = K.enc({titulo: a.titulo, volver: "#/vos", det: true});
  if (k === "acerca") return enc + `<section class="cd acerca">${K.logo(64)}<h2>Kozmos</h2>
      <p class="lema"><i>Per aspera ad astra.</i> Por lo difícil, a las estrellas.</p>
      <p class="mute">Funciona sin conexión. Lo que hacés queda en este teléfono: sin cuentas ni servidores.</p>
      <span class="lb">Versión <span class="num">${K.esc(K.VERSION)}</span></span></section>
      <p class="pie small mute">Letra: Mona Sans y Geist Mono, con licencia SIL Open Font License.</p>`;
  const t = K.tema.actual();
  return enc + `<div class="aj" role="radiogroup" aria-label="Tema">${K.TEMAS.map(([v, n, ic]) =>
    `<button type="button" class="op" role="radio" data-tema="${v}" aria-checked="${t === v}"><span class="tile">${K.ic(ic)}</span><span>${n}</span>${K.ic("check", "ck")}</button>`).join("")}</div>
    <p class="small mute ayuda">Automático sigue al tema de tu teléfono.</p>`;
};

/* cambiar el tema siempre se puede deshacer */
K.cambiarTema = t => {
  const antes = K.tema.actual(); if (t === antes) return;
  K.tema.poner(t); K.refrescar();
  K.deshacer(`Tema ${K.tema.nombre(t).toLowerCase()}`, () => { K.tema.poner(antes); K.refrescar(); });
};
