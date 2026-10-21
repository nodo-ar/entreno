/* ===== Movimiento: el logo es el que se mueve. El disco es tu cielo, el hueco sos vos, el punto es la estrella que buscás.
   Cinco momentos: arranque, empezar la sesión, estrella encendida, rutina terminada y guardando. Con movimiento reducido, nada anima. ===== */
K.mov = (() => {
  const E = "cubic-bezier(.2,.7,.2,1)";
  const capa = cls => { const d = document.createElement("div"); d.className = "mov " + cls; d.setAttribute("aria-hidden", "true"); document.body.appendChild(d); return d; };

  /* arranque: el disco aparece, se abre el hueco, se prende la estrella y el logo se va hacia arriba dejando Hoy */
  function arranque(){
    /* sobre una sesión en curso no se tapa nada: el reloj corre y un toque tiene que llegar */
    if (K.reduce() || K.sesion.activa() || K.ruta().sub === "sesion") return;
    try { if (sessionStorage.getItem("kozmos.arranco")) return; sessionStorage.setItem("kozmos.arranco", "1"); } catch (e) { return; }
    const c = capa("mov-arranque");
    c.innerHTML = `<svg viewBox="0 0 84 84" width="112" height="112"><circle cx="42" cy="42" r="34" fill="var(--ink)"/><circle cx="42" cy="42" r="9" fill="var(--bg)"/><circle cx="60" cy="24" r="4" fill="var(--bg)"/></svg>`;
    const [d, h, e] = c.querySelectorAll("circle"), svg = c.firstChild;
    [d, h, e].forEach(x => { x.style.transformBox = "fill-box"; x.style.transformOrigin = "center"; });
    /* pasa cada vez que abrís la app: corto, menos de un segundo */
    d.animate([{transform: "scale(.6)", opacity: 0}, {transform: "scale(1)", opacity: 1}], {duration: 300, easing: E, fill: "both"});
    h.animate([{transform: "scale(0)"}, {transform: "scale(1)"}], {duration: 240, delay: 120, easing: E, fill: "both"});
    e.animate([{transform: "scale(0)"}, {transform: "scale(1)"}], {duration: 260, delay: 300, easing: E, fill: "both"});
    svg.animate([{transform: "none", opacity: 1}, {transform: "translateY(-38vh) scale(.3)", opacity: 0}], {duration: 300, delay: 500, easing: E, fill: "both"});
    c.animate([{opacity: 1}, {opacity: 0}], {duration: 260, delay: 540, easing: E, fill: "both"}).onfinish = () => c.remove();
    setTimeout(() => c.remove(), 1200); /* por si la animación no termina: la app nunca queda tapada */
  }

  /* empezar la sesión: desde el botón crece el disco y su hueco se abre hasta ser la pantalla de la serie */
  function iris(btn){
    if (K.reduce() || !btn) return;
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const c = capa("mov-iris");
    c.innerHTML = `<i class="d"></i><i class="h"></i>`;
    for (const i of c.children){ i.style.left = x - R + "px"; i.style.top = y - R + "px"; i.style.width = i.style.height = 2 * R + "px"; }
    const [d, h] = c.children;
    d.animate([{transform: "scale(0)"}, {transform: "scale(1)"}], {duration: 320, easing: E, fill: "both"});
    h.animate([{transform: "scale(0)"}, {transform: "scale(1)"}], {duration: 360, delay: 180, easing: E, fill: "both"}).onfinish = () => c.remove();
  }

  /* estrella encendida: la estrella sale desde abajo, vuela a su lugar en la constelación y se prende */
  function estrella(v){
    const n = v.querySelector(".res .es.nace"); if (!n || K.reduce()) return;
    const r = n.getBoundingClientRect(), c = capa("mov-estrella"), x0 = innerWidth / 2, y0 = innerHeight - 90;
    c.style.left = x0 - 6 + "px"; c.style.top = y0 - 6 + "px";
    n.style.animationDelay = "620ms";
    c.animate([{transform: "translate(0,0) scale(.6)", background: "var(--ink)"}, {transform: `translate(${(r.left + r.width / 2 - x0) * .5}px,${(r.top - y0) * .35}px) scale(1.2)`, background: "var(--c,var(--fu))", offset: .5},
      {transform: `translate(${r.left + r.width / 2 - x0}px,${r.top + r.height / 2 - y0}px) scale(.8)`, background: "var(--c,var(--fu))"}], {duration: 640, easing: "cubic-bezier(.5,0,.2,1)", fill: "both"}).onfinish = () => c.remove();
  }

  /* guardando: la estrella gira alrededor del disco mientras se espera */
  async function girando(btn, trabajo){
    const tile = btn?.querySelector(".tile"), antes = tile?.innerHTML;
    if (tile) tile.innerHTML = logo(22, true);
    btn?.setAttribute("aria-busy", "true");
    try { return await trabajo(); } finally { if (tile && tile.isConnected) tile.innerHTML = antes; btn?.removeAttribute("aria-busy"); }
  }

  /* el logo dibujado: girando (guardando) u orbitando una vez y quedando lleno (rutina terminada) */
  const logo = (px, gira) => `<svg class="logo-mov${gira ? " gira" : ""}" width="${px}" height="${px}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="26" fill="var(--ink)"/><circle cx="42" cy="42" r="7" fill="var(--bg)"/><g class="orb"><circle cx="42" cy="5" r="5" fill="var(--ink)"/></g></svg>`;
  const orbita = px => `<svg class="logo-mov orbita" width="${px}" height="${px}" viewBox="0 0 160 160" aria-hidden="true">
    <circle cx="80" cy="80" r="62" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
    <circle class="traza" cx="80" cy="80" r="62" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round" pathLength="1" transform="rotate(-45 80 80)"/>
    <circle cx="80" cy="80" r="32" fill="var(--ink)"/><circle cx="80" cy="80" r="9" fill="var(--bg)"/>
    <g class="orb"><circle class="est" cx="123.8" cy="36.2" r="7" fill="var(--bg)" stroke="var(--ink)" stroke-width="2.6"/></g></svg>`;

  /* la estrella de la pestaña elegida llega orbitando y se posa; en Progreso sube por el arco */
  const CENTRO = {hoy: [12, 12.5, -180], cielo: [12, 12, -180], progreso: [20, 20, -90], vos: [12, 12, -180]};
  function llegar(btn, tab){
    const g = !K.reduce() && btn?.querySelector(".orb"), o = CENTRO[tab]; if (!g || !o) return;
    const c = g.firstElementChild, ms = 420;
    Object.assign(g.style, {transformBox: "view-box", transformOrigin: `${o[0]}px ${o[1]}px`});
    Object.assign(c.style, {transformBox: "fill-box", transformOrigin: "center"});
    /* al mismo ritmo que la píldora: llega con ella */
    g.animate([{transform: `rotate(${o[2]}deg)`}, {transform: "rotate(0)"}], {duration: ms, easing: E});
    c.animate(tab === "progreso" ? [{transform: "scale(.6)"}, {transform: "scale(1)"}] : [{transform: "scale(.2)"}, {transform: "scale(1.1)", offset: .8}, {transform: "scale(1)"}], {duration: ms, easing: "ease-out"});
  }

  /* cambiar de pestaña: las pantallas giran sobre un centro lejano, debajo del teléfono, hacia el lado de la pestaña */
  function girar(viejo, r, nuevo, dir){
    /* poco ángulo y el centro lejos: la curva se insinúa sin marear; la que se va se apaga antes, así nunca hay dos enteras */
    const piv = innerHeight * 3, ang = 9 * dir, d = 320;
    viejo.inert = true; viejo.setAttribute("aria-hidden", "true"); /* aria-hidden y pointer-events por si el navegador no conoce inert */
    Object.assign(viejo.style, {position: "fixed", top: r.top + "px", left: r.left + "px", width: r.width + "px", margin: "0", pointerEvents: "none", transformOrigin: `50% ${piv - r.top}px`});
    document.body.appendChild(viejo);
    const fin = () => viejo.remove();
    viejo.animate([{transform: "none", opacity: 1}, {transform: `rotate(${-ang * .6}deg)`, opacity: 0, offset: .62}, {transform: `rotate(${-ang}deg)`, opacity: 0}], {duration: d, easing: E, fill: "forwards"}).onfinish = fin;
    setTimeout(fin, d + 80);
    nuevo.style.transformOrigin = `50% ${piv - (nuevo.getBoundingClientRect().top + scrollY)}px`;
    nuevo.animate([{transform: `rotate(${ang}deg)`, opacity: 0}, {transform: "none", opacity: 1}], {duration: d, easing: E});
  }

  return {arranque, iris, estrella, girando, orbita, llegar, girar};
})();
