/* ===== Dibujo del cielo: cada constelación es el asterismo de su habilidad (K.icono) y cada estrella un punto =====
   Las estrellas caen en las articulaciones de la pose final; las líneas son los huesos, en el color de la familia, con la figura tenue detrás.
   Encendida: punto lleno en tinta, más grande cuanto menor la magnitud. Próxima: anillo del color de la familia.
   Por delante: anillo gris. Lo que no se practica hace 8 semanas se ve atenuado, nunca apagado. */
K.dibujo = (() => {
  const semilla = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
  const azar = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  /* si una constelación no tuviera dibujo (un ejercicio nuevo sin pose): una cadena que avanza de izquierda a derecha y sube y baja suave (como en la carta del cielo aprobada) */
  const formas = {};
  const forma = (id, n) => {
    const k = id + ":" + n; if (formas[k]) return formas[k];
    const r = azar(semilla(id)); let y = r(); const p = [];
    for (let i = 0; i < n; i++){
      if (i) y = Math.max(0, Math.min(1, y + (r() - .5) * .95));
      p.push([(n > 1 ? i / (n - 1) : .5) + (i && i < n - 1 ? (r() - .5) * .08 : 0), y]);
    }
    return formas[k] = p;
  };
  /* se estira para llenar la caja: cada estrella queda a una distancia cómoda de la siguiente */
  const caber = (p, bx, by, bw, bh) => {
    const ys = p.map(q => q[1]), y0 = Math.min(...ys), h = Math.max(...ys) - y0;
    return p.map(([x, y]) => [bx + x * bw, by + (h ? (y - y0) / h * bh : bh / 2)]);
  };
  const f1 = n => n.toFixed(1);
  const radio = (m, esc) => (2 + (5 - m) * .6) * esc;
  /* las estrellas de una constelación ya calculada (K.cielo.calcular), en puntos ya ubicados */
  /* lo que pide equipo que no marcaste: en el cielo entero no aparece; en la constelación abierta, punteado */
  const estrellas = (c, pts, esc, recien = [], ocultar = false, lineas = null) => {
    const ve = c.estrellas.map(e => !(ocultar && e.estado === "sin-equipo"));
    let g = lineas ? `<g class="ast-lineas" stroke="var(--${c.familia})" stroke-opacity=".5" stroke-width="${esc > 1 ? 1.4 : 1.1}" stroke-linecap="round">${lineas.filter(([a, b]) => ve[a] && ve[b]).map(([a, b]) => `<line x1="${f1(pts[a][0])}" y1="${f1(pts[a][1])}" x2="${f1(pts[b][0])}" y2="${f1(pts[b][1])}"/>`).join("")}</g>`
      : `<path d="${pts.filter((q, i) => ve[i]).map((q, i) => (i ? "L" : "M") + f1(q[0]) + " " + f1(q[1])).join("")}" fill="none" stroke="var(--ink)" stroke-opacity=".2" stroke-width="${esc > 1 ? 1.2 : 1}"/>`;
    c.estrellas.forEach((e, i) => {
      if (!ve[i]) return;
      const [x, y] = pts[i], r = radio(e.magnitud, esc) + (e.estado === "encendida" ? .8 * esc : 0);
      if (e.estado === "encendida") g += `<circle class="es on${c.atenuada ? " tenue" : ""}${recien.includes(e.id) ? " nace" : ""}" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="var(--ink)" style="--fam:var(--${c.familia})"/>`;
      else if (e.estado === "proxima") g += `<circle class="es nx" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 3.6 * esc)}" fill="none" stroke="var(--${c.familia})" stroke-width="${f1(1.8 * esc)}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.9 * esc)}" fill="var(--${c.familia})"/>`;
      else if (e.estado === "sin-equipo") g += `<circle class="es sin" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="none" stroke="var(--off)" stroke-width="${f1(1.1 * esc)}" stroke-dasharray="${f1(1.6 * esc)} ${f1(1.8 * esc)}"/>`;
      else g += `<circle class="es off" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="none" stroke="var(--off)" stroke-width="${f1(1.3 * esc)}"/>`;
    });
    return g;
  };
  const fondo = (seed, W, H, dens = 900) => {
    const r = azar(seed); let g = "";
    for (let i = 0; i < W * H / dens; i++) g += `<circle cx="${f1(r() * W)}" cy="${f1(r() * H)}" r="${(r() * .7 + .5).toFixed(2)}" fill="var(--ink-3)" opacity="${(r() * .35 + .25).toFixed(2)}"/>`;
    return g;
  };
  /* el asterismo de la constelación en una caja; sin pose, la cadena de siempre */
  const ubicar = (c, x, y, w, h, gw) => { const id = K.icono.poseCons(c), u = id && K.icono.ubicar(id, c.estrellas.length, x, y, w, h, gw);
    return u || {pts: caber(forma(c.id, c.estrellas.length), x + 4, y + 6, w - 8, h - 12), lineas: null, fantasma: ""}; };
  const etiqueta = c => `${c.nombre}, ${c.encendidas} de ${c.total} estrellas`;
  /* el cielo entero: dos columnas en zigzag, cada constelación se toca para abrirla */
  const grande = cielo => {
    const W = 360, CH = 118, cs = cielo.constelaciones.filter(c => c.total > 0), H = Math.ceil(cs.length / 2) * CH + 24;
    let g = fondo(7, W, H);
    cs.forEach((c, i) => {
      const fila = Math.floor(i / 2), col = i % 2, r = azar(semilla(c.id + "#"));
      const x = col * 180 + r() * 6, y = 10 + fila * CH + r() * 6;
      const u = ubicar(c, x + 14, y + 24, 148, 82, 5);
      g += `<g class="cons" data-ir="#/cielo/${c.id}" data-quieto="1" role="link" tabindex="0" aria-label="${K.esc(etiqueta(c))}">
        <rect x="${f1(x + 2)}" y="${f1(y)}" width="172" height="${CH - 8}" rx="14" fill="transparent"/>
        <text x="${f1(x + 14)}" y="${f1(y + 15)}" class="cons-nom">${K.esc(c.nombre.toUpperCase())}</text>${u.fantasma}${estrellas(c, u.pts, 1, [], true, u.lineas)}</g>`;
    });
    return `<svg class="cielo-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Tu cielo">${g}</svg>`;
  };
  /* una sola constelación, grande */
  const una = (c, recien) => {
    /* lo vertical (una vertical, una dominada) pide más alto, si no queda un palito */
    const id = K.icono.poseCons(c), a = id && K.icono.aster(id, c.estrellas.length), ys = a ? a.pts.map(q => q[1]) : [], xs = a ? a.pts.map(q => q[0]) : [];
    const alto = a ? (Math.max(...ys) - Math.min(...ys)) / Math.max(1, Math.max(...xs) - Math.min(...xs)) : 0;
    const W = 340, H = alto > 1.2 ? 210 : 150, u = ubicar(c, 24, 14, W - 48, H - 28, 8);
    return `<svg class="cons-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${K.esc(etiqueta(c))}">${fondo(semilla(c.id) % 997, W, H, 700)}${u.fantasma}${estrellas(c, u.pts, 1.6, recien, false, u.lineas)}</svg>`;
  };
  /* anillo de avance: cuánto de la constelación está encendido, con el pictograma de su habilidad adentro */
  const anillo = (c, px = 40) => K.icono.chico.cons(c, px) || anilloSolo(c, px);
  const anilloSolo = (c, px) => {
    const C = 2 * Math.PI * 13, p = c.total ? c.encendidas / c.total : 0;
    return `<svg width="${px}" height="${px}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="var(--line)" stroke-width="4"/>${p ? `<circle cx="16" cy="16" r="13" fill="none" stroke="var(--${c.familia})" stroke-width="4" stroke-linecap="round" stroke-dasharray="${f1(p * C)} ${f1(C)}" transform="rotate(-90 16 16)"/>` : ""}</svg>`;
  };
  return {forma, grande, una, anillo};
})();
