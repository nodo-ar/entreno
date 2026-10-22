/* ===== Íconos de constelaciones, pruebas y rutinas: todos salen del maniquí (K.fig) y de los datos del catálogo =====
   En grande, el asterismo de la habilidad: las estrellas caen en las articulaciones de la pose final y las líneas son los huesos,
   como en una carta del cielo, con la figura tenue detrás. En chico, el pictograma: la misma figura en una línea, dentro de su marco.
   · Constelación: la pose de su estrella final. El marco de la fila es el anillo de avance.
   · Prueba: la pose de lo que mide. El marco dice cómo se mide: círculo (el máximo), hexágono (cada minuto), cuadrado (contra el reloj).
   · Rutina: la pose de lo que más trabaja (de una escalera, el escalón hacia el que entrena) y, alrededor, la vuelta de un día:
     lo fuerte en el color de la familia, lo suave más fino y las pausas vacías. Así dos rutinas de bici no se ven iguales.
   Todo se dibuja en una caja de 100 × 100 y se guarda: cada ícono se calcula una vez por sesión de la app. ===== */
K.icono = (() => {
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const HUESOS = [["hd", "sh"], ["sh", "sN"], ["sh", "sF"], ["sN", "eN"], ["eN", "hN"], ["sF", "eF"], ["eF", "hF"], ["sh", "hip"], ["hip", "pN"], ["hip", "pF"],
    ["pN", "kN"], ["kN", "fN"], ["fN", "tN"], ["pF", "kF"], ["kF", "fF"], ["fF", "tF"]];
  /* qué se elige primero cuando hay pocas estrellas: las puntas (manos, pies, cabeza) y después el tronco */
  const PRIO = ["hN", "fN", "hd", "hip", "hF", "fF", "sh", "kN", "kF", "eN", "eF", "tN", "tF", "sN", "sF", "pN", "pF"];
  const cache = new Map(), guardado = (k, fn) => { if (!cache.has(k)) cache.set(k, fn()); return cache.get(k); };
  const hay = id => !!(id && K.POSES[id]);

  /* ===== De qué pose sale cada ícono: de los datos, nunca a mano ===== */
  /* la constelación: su estrella final (si no tiene dibujo, la anterior que tenga) */
  const poseCons = c => { for (let i = c.estrellas.length - 1; i >= 0; i--){ const id = c.estrellas[i].prueba.ejercicio; if (hay(id)) return id; } return null; };
  /* la prueba: lo que mide (o lo primero que se hace) */
  const poseHazana = h => [h.mide && h.mide.ejercicio, ...(h.items || []).map(x => x.ejercicio)].find(hay) || null;
  /* lo que se hace en un tramo sin ejercicio: trote, bici o soga, según lo que mide el bloque o pide la rutina */
  const actividad = (r, b) => { const m = b.mide && b.mide.ejercicio, eq = r.equipo || [];
    return m === "trote" || m === "10km" ? "trote" : eq.includes("bici") || m === "bici" ? "bici" : eq.includes("soga") ? "soga" : hay(m) ? m : "intervalos"; };
  const primero = x => [].concat(x || [])[0];
  /* las estrellas hacia las que entrena la rutina («Entrena para»): ejercicio y magnitud */
  const metas = r => guardado("me:" + r.id, () => (r.alimenta || []).map(sid => { const c = (K.CATALOGO?.constelaciones || []).find(k => sid.startsWith(k.id + "."));
    const s = c && c.estrellas.find(x => x.id === sid); return s && {e: s.prueba.ejercicio, m: s.magnitud}; }).filter(Boolean));
  /* de una escalera, el escalón hacia el que entrena la rutina (la estrella más difícil que alimenta en esa escalera) o, si no nombra ninguna, el último */
  const escalon = (r, id) => {
    const e = ((K.ESCALERAS && K.ESCALERAS.escaleras) || []).find(x => x.id === id); if (!e) return {e: null};
    const ps = e.pasos.map(p => p.ejercicio), ms = metas(r).filter(x => ps.includes(x.e)).sort((a, b) => a.m - b.m || ps.indexOf(b.e) - ps.indexOf(a.e));
    return ms.length ? {e: ms[0].e, meta: true} : {e: ps[ps.length - 1]};
  };
  /* los tramos, desplegados («repetir») */
  const plano = ts => ts.flatMap(t => t.repetir ? Array.from({length: t.repetir}, () => plano(t.tramos)).flat() : [t]);
  const TRABAJO = {fuerte: 1, trabajo: 1, postura: 1};
  const SERIE = 30; /* lo que dura una serie, más o menos, cuando no se sabe */
  const entrada = b => b.nombre === "Entrada en calor" || (b.tramos && plano(b.tramos).every(t => t.clase === "entrada"));
  /* lo que se hace en un día, en orden: [{e: ejercicio, t: segundos, k: "f" (fuerte) | "s" (suave) | "p" (pausa)}].
     Sin la entrada en calor ni la vuelta a la calma; las superseries alternan serie a serie, como en la sesión */
  function tiempos(r, s){
    const out = [], bs = s.bloques.filter(b => !entrada(b));
    for (let i = 0; i < bs.length; i++){
      const b = bs[i];
      if (b.tramos && !b.ejercicio && !b.escalera){
        for (const t of plano(b.tramos)){ if (t.clase === "entrada" || t.clase === "vuelta" || !t.seg) continue;
          const k = TRABAJO[t.clase] ? "f" : t.clase === "suave" ? "s" : "p";
          out.push({e: k === "p" ? null : primero(t.ejercicio) || actividad(r, b), t: t.seg, k}); }
        continue;
      }
      /* un bloque de series (y los de su superserie, que van juntos) */
      const g = [b]; while (b.grupo && bs[i + 1] && bs[i + 1].grupo === b.grupo) g.push(bs[++i]);
      const n = Math.max(...g.map(x => x.series || 1));
      for (let k = 0; k < n; k++) g.forEach((x, j) => { if (k >= (x.series || 1)) return;
        const e = x.escalera ? escalon(r, primero(x.escalera)).e : primero(x.ejercicio);
        const t = x.dura || (x.tipo === "segundos" && Number.isFinite(x.objetivo) ? x.objetivo : SERIE);
        out.push({e, t, k: "f"}); if (j === g.length - 1 && x.descanso) out.push({e: null, t: x.descanso, k: "p"}); });
    }
    while (out.length && out[out.length - 1].k === "p") out.pop();
    return out;
  }
  /* la semana que cuenta cómo es la rutina: la de carga del medio (ni el arranque, ni la prueba, ni la meta) */
  const semanaTipica = r => { const xs = K.rutina.semanas(r).filter(x => x.tipo === "carga"), c = xs[Math.floor((xs.length - 1) / 2)] || {n: 1};
    return Array.from({length: r.dias}, (_, k) => r.sesiones[(c.n - 1) * r.dias + k]).filter(Boolean); };
  /* la rutina: lo que más series lleva (de una escalera, el escalón hacia el que entrena; con empate, la que alimenta una estrella y después la primera);
     sin series (motor), lo que más tiempo se hace */
  const poseRutina = r => guardado("pr:" + r.id, () => {
    const n = new Map(), meta = new Set(), t = new Map(), sumar = (m, k, v) => m.set(k, (m.get(k) || 0) + v);
    for (const s of r.sesiones) for (const b of s.bloques){
      if (b.escalera){ const x = escalon(r, primero(b.escalera)); if (hay(x.e)){ sumar(n, x.e, b.series || 1); if (x.meta) meta.add(x.e); } }
      else if (b.ejercicio && b.series && hay(primero(b.ejercicio))) sumar(n, primero(b.ejercicio), b.series);
    }
    let mejor = null; for (const [e, v] of n) if (!mejor || v > mejor[1] || (v === mejor[1] && meta.has(e) && !meta.has(mejor[0]))) mejor = [e, v];
    if (mejor) return mejor[0];
    /* lo fuerte manda; si no hay nada fuerte (una salida suave), lo suave */
    for (const k of ["f", "s"]){ for (const s of r.sesiones) for (const x of tiempos(r, s)) if (x.k === k && hay(x.e)) sumar(t, x.e, x.t); if (t.size) break; }
    for (const [e, v] of t) if (!mejor || v > mejor[1]) mejor = [e, v];
    return mejor ? mejor[0] : null;
  });
  /* la vuelta de una semana, de 0 a 1: un tramo igual por día (separados por un hueco) y, adentro, lo que se hace: [{a, b, k}] */
  const HUECO = .09;
  const ritmo = r => guardado("ri:" + r.id, () => {
    const dias = semanaTipica(r), D = dias.length || 1;
    return dias.flatMap((s, d) => { const xs = tiempos(r, s), T = xs.reduce((u, x) => u + x.t, 0) || 1, a0 = d / D + HUECO / 2, w = 1 / D - HUECO; let a = 0;
      return xs.map(x => { const o = {a: a0 + a / T * w, b: a0 + (a + x.t) / T * w, k: x.k}; a += x.t; return o; }).filter(x => x.k !== "p"); });
  });
  /* ===== El esqueleto de una pose, en coordenadas del dibujo ===== */
  /* la cámara: la vista del ejercicio; si de perfil lo cercano tapa lo lejano, se gira un poco (lo decide la pose, no una lista) */
  function esqueleto(id, vista = 0){
    return guardado("e" + id + ":" + vista, () => {
      const f = K.POSES[id]; if (!f) return null;
      const P0 = K.fig.muestra(id), J = K.fig.esqueleto(vista ? {...f, vista: (f.vista || 0) + vista} : f, P0), p = {};
      for (const k of new Set(HUESOS.flat())) p[k] = J[k] || (k[0] === "s" ? J.sh : J.hip);
      const barra = ["barra", "barra-baja"].includes(f.con), ruedas = f.con === "bici" ? [[f.en[0] - 34, K.fig.PISO - 30], [f.en[0] + 70, K.fig.PISO - 30]] : null;
      return {f, p, barra, ruedas};
    });
  }
  const caja = pts => { const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  /* encaja puntos en un cuadro sin deformar: la función que lleva del dibujo a la caja */
  const encajar = (pts, x, y, w, h) => { const [x0, y0, x1, y1] = caja(pts), s = Math.min(w / Math.max(1, x1 - x0), h / Math.max(1, y1 - y0));
    const ox = x + (w - (x1 - x0) * s) / 2 - x0 * s, oy = y + (h - (y1 - y0) * s) / 2 - y0 * s; return q => [q[0] * s + ox, q[1] * s + oy]; };

  /* ===== El asterismo: n estrellas sobre el cuerpo =====
     Se juntan las articulaciones que caen casi en el mismo lugar, se eligen por prioridad y, si faltan, se parten los huesos más largos.
     Las estrellas van en orden desde el apoyo (la mano en la barra, el pie o la cadera en el piso) hasta la punta. */
  function armar(id, n, vista){
    const e = esqueleto(id, vista); if (!e) return null;
    const [x0, y0, x1, y1] = caja(Object.values(e.p)), S = Math.max(x1 - x0, y1 - y0), dmin = S * .11;
    const nodos = [], de = {};
    const orden = vista >= 60 || (e.f.vista || 0) >= 60 ? ["hN", "hF", "fN", "fF", "hd", "hip", "sh", "kN", "kF", "eN", "eF", "sN", "sF", "pN", "pF", "tN", "tF"] : PRIO;
    for (const k of orden){ const q = e.p[k], j = nodos.findIndex(m => Math.hypot(m.x - q[0], m.y - q[1]) < dmin);
      if (j >= 0){ de[k] = j; continue; } de[k] = nodos.length; nodos.push({x: q[0], y: q[1], k}); }
    const ady = nodos.map(() => new Set());
    for (const [a, b] of HUESOS){ const i = de[a], j = de[b]; if (i !== j){ ady[i].add(j); ady[j].add(i); } }
    const distintos = nodos.length, sel = nodos.map((_, i) => i).slice(0, n);
    /* dos elegidos se unen si el camino entre ellos no pasa por otro elegido */
    const unir = sel => { const es = new Set(sel), ar = [];
      for (const a of sel){ const visto = new Set([a]), cola = [a];
        while (cola.length){ const u = cola.shift(); for (const v of ady[u]){ if (visto.has(v)) continue; visto.add(v); if (es.has(v)){ if (a < v) ar.push([a, v]); } else cola.push(v); } } }
      return ar; };
    const largo = ([a, b]) => Math.hypot(nodos[a].x - nodos[b].x, nodos[a].y - nodos[b].y);
    let aristas = unir(sel);
    while (sel.length < n && aristas.length){
      const [a, b] = aristas.reduce((m, x) => largo(x) > largo(m) ? x : m), i = nodos.length;
      nodos.push({x: (nodos[a].x + nodos[b].x) / 2, y: (nodos[a].y + nodos[b].y) / 2, k: "m"}); ady.push(new Set([a, b]));
      ady[a].delete(b); ady[b].delete(a); ady[a].add(i); ady[b].add(i); sel.push(i); aristas = unir(sel);
    }
    const apoyo = de[e.f.fijo] ?? de.hip, dist = nodos.map(() => Infinity); dist[apoyo] = 0;
    for (let cambio = true; cambio;){ cambio = false; for (let u = 0; u < nodos.length; u++) for (const v of ady[u]){ const d = dist[u] + Math.hypot(nodos[u].x - nodos[v].x, nodos[u].y - nodos[v].y); if (d < dist[v] - 1e-6){ dist[v] = d; cambio = true; } } }
    const ord = [...sel].sort((a, b) => dist[a] - dist[b]), idx = Object.fromEntries(ord.map((i, k) => [i, k]));
    return {pts: ord.map(i => [nodos[i].x, nodos[i].y]), lineas: aristas.map(([a, b]) => [idx[a], idx[b]]), pose: id, vista, distintos};
  }
  /* con la vista del ejercicio, salvo que se junten tantas articulaciones (brazos y piernas uno sobre otro) que no alcancen para las estrellas:
     ahí la cámara gira un poco, a tres cuartos y si no de frente (lo decide la pose, no una lista) */
  const aster = (id, n) => guardado("a" + id + ":" + n, () => {
    if (!hay(id)) return null;
    let mejor = null;
    for (const v of [0, 25, 90]){ const a = armar(id, n, v); if (!a) continue; if (!mejor || a.distintos > mejor.distintos) mejor = a; if (a.distintos >= n) break; }
    return mejor;
  });

  /* ===== Dibujar ===== */
  /* el cuerpo en trazos: lo lejano primero y más tenue; el tronco más grueso; la cabeza, un círculo lleno */
  function cuerpo(id, T, w, {tenue = .42, vista = 0} = {}){
    const e = esqueleto(id, vista), p = k => T(e.p[k]), ln = (a, b, sw, o = 1) => { const A = p(a), B = p(b); return `<line x1="${f1(A[0])}" y1="${f1(A[1])}" x2="${f1(B[0])}" y2="${f1(B[1])}" stroke-width="${f1(sw)}"${o < 1 ? ` stroke-opacity="${o}"` : ""}/>`; };
    const lejos = [["sF", "eF"], ["eF", "hF"], ["pF", "kF"], ["kF", "fF"]].map(([a, b]) => ln(a, b, w, tenue)).join("");
    const cerca = [["sN", "eN"], ["eN", "hN"], ["pN", "kN"], ["kN", "fN"]].map(([a, b]) => ln(a, b, w)).join("");
    const H = p("hd"), barra = e.barra ? (() => { const hs = [p("hN"), p("hF")], y = (hs[0][1] + hs[1][1]) / 2, xs = hs.map(q => q[0]);
      return `<line x1="${f1(Math.min(...xs) - w * 2.6)}" y1="${f1(y)}" x2="${f1(Math.max(...xs) + w * 2.6)}" y2="${f1(y)}" stroke-width="${f1(w * .7)}" stroke-opacity=".5"/>`; })() : "";
    const ruedas = e.ruedas ? e.ruedas.map(q => { const A = T(q), B = T([q[0] + 26, q[1]]); return `<circle cx="${f1(A[0])}" cy="${f1(A[1])}" r="${f1(B[0] - A[0])}" stroke-width="${f1(w * .6)}" stroke-opacity=".5"/>`; }).join("") : "";
    return `${barra}${ruedas}${lejos}${ln("sh", "hip", w * 1.3)}${cerca}<circle cx="${f1(H[0])}" cy="${f1(H[1])}" r="${f1(w * 1.25)}" fill="currentColor" stroke="none"/>`;
  }
  /* la transformación que encaja un cuerpo en un cuadro, con lugar para el grosor y la cabeza */
  const marcoCuerpo = (id, x, y, s, w, vista = 0) => { const e = esqueleto(id, vista), pts = [...Object.values(e.p), ...(e.ruedas || []).flatMap(q => [[q[0] - 26, q[1] - 26], [q[0] + 26, q[1] + 26]])];
    const m = w * 1.4; return encajar(pts, x + m, y + m, s - 2 * m, s - 2 * m); };
  const svg = (px, cls, lb, g) => `<svg class="ico ${cls}"${px ? ` width="${px}" height="${px}"` : ""} viewBox="0 0 100 100"${lb ? ` role="img" aria-label="${K.esc(lb)}"` : ` aria-hidden="true"`}>${g}</svg>`;
  /* el pictograma, en tinta, adentro de un círculo de radio r */
  const picto = (id, r, w) => { const s = r * 1.72, o = 50 - s / 2, T = marcoCuerpo(id, o, o, s, w);
    return `<g class="ico-cuerpo" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${cuerpo(id, T, w)}</g>`; };

  /* los marcos de una prueba, según cómo se mide */
  const FORMA = {maximo: "maximo", escalera: "minuto", reloj: "tiempo", tiempo: "tiempo"};
  const MARCO = {
    maximo: sw => `<circle cx="50" cy="50" r="${f1(46 - sw / 2)}"/>`,
    minuto: sw => { const r = 48 - sw / 2; return `<polygon points="${[0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 3 * i - Math.PI / 2; return `${f1(50 + r * Math.cos(a))},${f1(50 + r * Math.sin(a))}`; }).join(" ")}" stroke-linejoin="round"/>`; },
    tiempo: sw => `<rect x="${f1(5 + sw / 2)}" y="${f1(5 + sw / 2)}" width="${f1(90 - sw)}" height="${f1(90 - sw)}" rx="20"/>`
  };
  const formaDe = h => FORMA[h.formato] || "maximo";
  /* un arco de la vuelta, de a a b (0 a 1, desde arriba y en el sentido del reloj) */
  const arco = (a, b, r) => { const pt = t => [50 + r * Math.sin(t * 2 * Math.PI), 50 - r * Math.cos(t * 2 * Math.PI)], A = pt(a), B = pt(b);
    return `M${f1(A[0])} ${f1(A[1])}A${r} ${r} 0 ${b - a > .5 ? 1 : 0} 1 ${f1(B[0])} ${f1(B[1])}`; };

  /* ===== Chico: el pictograma en su marco (filas de 26 a 44 px) ===== */
  const chico = {
    /* constelación: el anillo de avance (tus estrellas) alrededor de la figura */
    cons: (c, px) => { const id = poseCons(c); if (!id) return null; const C = 2 * Math.PI * 43, pr = c.total ? c.encendidas / c.total : 0;
      return svg(px, "ico-chico ico-cons", "", `<circle cx="50" cy="50" r="43" fill="none" stroke="var(--line)" stroke-width="9"/>${pr ? `<circle cx="50" cy="50" r="43" fill="none" stroke="var(--${c.familia})" stroke-width="9" stroke-linecap="round" stroke-dasharray="${f1(pr * C)} ${f1(C)}" transform="rotate(-90 50 50)"/>` : ""}${picto(id, 33, 5.6)}`); },
    /* prueba: el marco de su forma de medir, en el color de la familia */
    hazana: (h, px) => { const id = poseHazana(h); if (!id) return null;
      return svg(px, "ico-chico ico-hz", "", `<g fill="none" stroke="var(--${h.familia})" stroke-width="7">${MARCO[formaDe(h)](7)}</g>${picto(id, 34, 5.6)}`); },
    /* rutina: la vuelta de un día alrededor de la figura */
    rutina: (r, px) => { const id = poseRutina(r); if (!id) return null;
      const vs = ritmo(r).map(x => `<path d="${arco(x.a, x.b, 43)}" stroke-width="${x.k === "f" ? 9 : 4}"${x.k === "f" ? "" : ' stroke-opacity=".6"'}/>`).join("");
      return svg(px, "ico-chico ico-rut", "", `<circle cx="50" cy="50" r="43" fill="none" stroke="var(--line)" stroke-width="3"/><g fill="none" stroke="var(--${r.familia})" stroke-linecap="round">${vs}</g>${picto(id, 33, 5.6)}`); }
  };

  /* ===== Grande: el asterismo con la figura tenue detrás ===== */
  /* estrellas sobre puntos ya ubicados: encendida en tinta, la próxima con anillo de la familia, lo que falta en gris;
     sin estados (una prueba o una rutina vista de afuera), todas en el color de la familia */
  function estrellas(pts, estados, fam, R, sw){
    return pts.map(([x, y], i) => { const s = estados ? estados[i] || {} : {estado: "familia"}, r = R * (s.mag ? .72 + (5 - s.mag) * .1 : 1);
      return s.estado === "encendida" ? `<circle class="es on" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.15)}" fill="var(--ink)"/>`
        : s.estado === "familia" ? `<circle class="es fam" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.05)}" fill="var(--${fam})"/>`
        : s.estado === "proxima" ? `<circle class="es nx" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.3)}" fill="var(--bg)" stroke="var(--${fam})" stroke-width="${f1(sw * 1.3)}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .45)}" fill="var(--${fam})"/>`
        : `<circle class="es off" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="var(--bg)" stroke="var(--off)" stroke-width="${f1(sw)}"/>`; }).join("");
  }
  const lineas = (pts, ls, fam, sw) => `<g class="ast-lineas" stroke="var(--${fam})" stroke-opacity=".55" stroke-width="${f1(sw)}" stroke-linecap="round">${ls.map(([a, b]) => `<line x1="${f1(pts[a][0])}" y1="${f1(pts[a][1])}" x2="${f1(pts[b][0])}" y2="${f1(pts[b][1])}"/>`).join("")}</g>`;
  /* el asterismo en una caja (x, y, w, h) de cualquier dibujo: los puntos, sus líneas y la figura detrás */
  function ubicar(id, n, x, y, w, h, gw){
    const a = aster(id, n); if (!a) return null;
    const T = encajar(a.pts, x, y, w, h), pts = a.pts.map(T);
    const fantasma = `<g class="ast-fantasma" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" color="var(--ink)" opacity=".08">${cuerpo(id, T, gw, {tenue: 1, vista: a.vista})}</g>`;
    return {pts, lineas: a.lineas, fantasma};
  }
  /* el ícono grande, como una medalla: el disco, la figura tenue, los huesos y las estrellas. estados = [{estado, mag}] o nada.
     Chico (una cabecera, 64 a 96 px) las estrellas y las líneas engordan para que se lean */
  function asterismo(id, n, fam, {estados = null, px = 0, lb = "", cls = ""} = {}){
    const u = ubicar(id, n, 16, 14, 68, 72, 8); if (!u) return "";
    const ch = px && px <= 100, R = ch ? 6.4 : 4.8, sw = ch ? 2.6 : 1.8;
    return svg(px, "ico-ast " + cls, lb, `<circle class="ast-disco" cx="50" cy="50" r="49" fill="var(--s2)"/>` + u.fantasma + lineas(u.pts, u.lineas, fam, sw) + estrellas(u.pts, estados, fam, R, sw));
  }
  const grande = {
    /* una prueba: cinco estrellas, una por magnitud; encendidas hasta la tuya */
    hazana: (h, mag, px) => { const id = poseHazana(h); if (!id) return "";
      const lit = mag ? 6 - mag : 0, es = mag === undefined ? null : Array.from({length: 5}, (_, i) => ({estado: i < lit ? "encendida" : i === lit ? "proxima" : "", mag: 5 - i}));
      return asterismo(id, 5, h.familia, {estados: es, px, cls: "ico-hz-g"}); },
    /* una rutina: una estrella por semana; si la seguís, encendidas las que hiciste */
    rutina: (r, hechas, px) => { const id = poseRutina(r); if (!id) return "";
      const es = hechas === undefined ? null : Array.from({length: r.semanas}, (_, i) => ({estado: i < hechas ? "encendida" : i === hechas ? "proxima" : ""}));
      return asterismo(id, r.semanas, r.familia, {estados: es, px, cls: "ico-rut-g"}); }
  };
  /* la firma de un ícono: lo que lo hace distinto (para las pruebas) */
  const firma = {
    cons: c => ({pose: poseCons(c), n: c.estrellas.length}),
    hazana: h => ({pose: poseHazana(h), marco: formaDe(h)}),
    rutina: r => ({pose: poseRutina(r), ritmo: ritmo(r).map(x => x.k + x.a.toFixed(3) + "-" + x.b.toFixed(3)).join(" ")})
  };
  return {poseCons, poseHazana, poseRutina, ritmo, semanaTipica, tiempos, aster, ubicar, esqueleto, chico, grande, firma, estrellas, lineas, FORMA};
})();
