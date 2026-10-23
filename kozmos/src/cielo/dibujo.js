/* ===== Dibujo de una constelación: tiene una forma fija (sale de su id) y cada estrella un punto =====
   Desde la vuelta 22 se ve solo de fondo, tenue, en la constelación abierta: el ícono de cada constelación es su figura en un anillo (iconos.js).
   Encendida: punto lleno en tinta, más grande cuanto menor la magnitud. Próxima: anillo del color de la familia.
   Por delante: anillo gris. Lo que no se practica hace 8 semanas se ve atenuado, nunca apagado. */
K.dibujo = (() => {
  const semilla = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
  const azar = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  /* la forma: una cadena que avanza de izquierda a derecha y sube y baja suave (como en la carta del cielo aprobada) */
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
  const estrellas = (c, pts, esc, recien = [], ocultar = false) => {
    const ve = c.estrellas.map(e => !(ocultar && e.estado === "sin-equipo"));
    let g = `<path d="${pts.filter((q, i) => ve[i]).map((q, i) => (i ? "L" : "M") + f1(q[0]) + " " + f1(q[1])).join("")}" fill="none" stroke="var(--ink)" stroke-opacity=".2" stroke-width="${esc > 1 ? 1.2 : 1}"/>`;
    c.estrellas.forEach((e, i) => {
      if (!ve[i]) return;
      const [x, y] = pts[i], r = radio(e.magnitud, esc) + (e.estado === "encendida" ? .8 * esc : 0);
      if (e.estado === "encendida") g += `<circle class="es on${c.atenuada ? " tenue" : ""}${recien.includes(e.id) ? " nace" : ""}" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="var(--ink)" style="--fam:var(--${c.familia})"/>`;
      else if (e.estado === "proxima") g += `<circle class="es nx" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 3.6 * esc)}" fill="none" stroke="var(--${c.familia})" stroke-width="${f1(1.8 * esc)}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.9 * esc)}" fill="var(--${c.familia})"/>`;
      /* lo que tu nivel da por hecho: punteado en el color de la familia, nunca encendido */
      else if (e.estado === "dada") g += `<circle class="es dada" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="none" stroke="var(--${c.familia})" stroke-width="${f1(1.1 * esc)}" stroke-dasharray="${f1(1.6 * esc)} ${f1(1.8 * esc)}"/>`;
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
  const etiqueta = c => `${c.nombre}, ${c.encendidas} de ${c.total} estrellas`;
  /* una sola constelación, grande */
  const una = (c, recien) => {
    const W = 340, H = 150, pts = caber(forma(c.id, c.estrellas.length), 28, 22, W - 56, H - 44);
    return `<svg class="cons-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${K.esc(etiqueta(c))}">${fondo(semilla(c.id) % 997, W, H, 700)}${estrellas(c, pts, 1.6, recien)}</svg>`;
  };
  return {forma, una};
})();
