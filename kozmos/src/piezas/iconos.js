/* ===== Íconos de pruebas y rutinas: la persona haciendo lo suyo, como en los íconos de entrenamiento que la gente ya conoce =====
   El pictograma sale del maniquí (K.fig): trazos gruesos y redondos, la cabeza aparte y un hueco fino donde un miembro pasa por
   delante de otro. Lo de Kozmos va en los detalles: el color de la familia y el puntito del logo (el satélite).
   · Prueba: una medalla. En color cuando ya tenés una magnitud, en gris cuando todavía no; la ganada lleva el satélite.
   · Rutina: el pictograma solo, sobre un círculo del color suave de su familia. Las que comparten figura (las de bici, las de
     dominadas) se distinguen por el nombre y el dato de la derecha, no por el ícono.
   Todo se dibuja en una caja de 100 × 100 y se guarda: cada ícono se calcula una vez por sesión de la app. ===== */
K.icono = (() => {
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const cache = new Map(), guardado = (k, fn) => { if (!cache.has(k)) cache.set(k, fn()); return cache.get(k); };
  const hay = id => !!(id && K.POSES[id]);
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k], len = a => Math.hypot(a[0], a[1]);

  /* ===== El encuadre: lo poco que no sale solo de la pose =====
     Algunas poses, de perfil y en 40 px, no se reconocen. Para esas se dice cómo mirarlas, como en un pictograma:
     pose: otra pose que se lee mejor para lo mismo · vista: de frente (90) · abrir: separar brazos que caen uno sobre otro ·
     piso: la línea del piso (lo que se apoya en el piso se entiende por ella) · junta: piernas juntas, sin hueco entre ellas ·
     u: el momento del movimiento (0 el inicio, 1 el final; si no se dice, la pose que más dice) */
  const ENCUADRE = {
    "dominada": {pose: "dominada-ancha", u: .15},
    "dominada-arquera": {pose: "dominada-ancha", u: .15},
    "dominada-lastre": {pose: "dominada-ancha", u: .15},
    "dominada-ancha": {u: .15},
    "arranque-kettlebell": {u: .4},
    "remo-al-menton": {u: .6},
    "fondo": {u: 0},
    "vertical-libre": {vista: 90, abrir: 30, piso: true, junta: true},
    "planche-straddle": {piso: true},
    "front-lever": {},
    "flexion": {piso: true},
    "l-sit": {piso: true},
    "del-piso": {piso: true},
    "pike-alcance": {pose: "isquios-sentado", piso: true}
  };
  const encuadre = id => { const o = ENCUADRE[id] || {}, pose = hay(o.pose) ? o.pose : id; return {...(pose !== id ? ENCUADRE[pose] : {}), ...o, pose}; };

  /* ===== De qué pose sale cada ícono: de los datos ===== */
  /* la prueba: lo que mide (o lo primero que se hace) */
  const poseHazana = h => [h.mide && h.mide.ejercicio, ...(h.items || []).map(x => x.ejercicio)].find(hay) || null;
  const primero = x => [].concat(x || [])[0];
  /* lo que se hace en un tramo sin ejercicio: trote, bici o soga, según lo que mide el bloque o pide la rutina */
  const actividad = (r, b) => { const m = b.mide && b.mide.ejercicio, eq = r.equipo || [];
    return m === "trote" || m === "10km" ? "trote" : eq.includes("bici") || m === "bici" ? "bici" : eq.includes("soga") ? "soga" : hay(m) ? m : null; };
  /* las estrellas hacia las que entrena la rutina: ejercicio y magnitud */
  const metas = r => guardado("me:" + r.id, () => (r.alimenta || []).map(sid => { const c = (K.CATALOGO?.constelaciones || []).find(k => sid.startsWith(k.id + "."));
    const s = c && c.estrellas.find(x => x.id === sid); return s && {e: s.prueba.ejercicio, m: s.magnitud}; }).filter(Boolean));
  /* de una escalera, el escalón hacia el que entrena la rutina (la estrella más difícil que alimenta en esa escalera) o, si no nombra ninguna, el último */
  const escalon = (r, id) => {
    const e = ((K.ESCALERAS && K.ESCALERAS.escaleras) || []).find(x => x.id === id); if (!e) return {e: null};
    const ps = e.pasos.map(p => p.ejercicio), ms = metas(r).filter(x => ps.includes(x.e)).sort((a, b) => a.m - b.m || ps.indexOf(b.e) - ps.indexOf(a.e));
    return ms.length ? {e: ms[0].e, meta: true} : {e: ps[ps.length - 1]};
  };
  const plano = ts => ts.flatMap(t => t.repetir ? Array.from({length: t.repetir}, () => plano(t.tramos)).flat() : [t]);
  /* la rutina: lo que más series lleva (de una escalera, el escalón hacia el que entrena; con empate, el que alimenta una estrella);
     sin series (intervalos, trote, bici), lo que más tiempo se hace fuerte y, si no hay nada fuerte, lo suave */
  const poseRutina = r => guardado("pr:" + r.id, () => {
    const n = new Map(), meta = new Set(), t = new Map(), sumar = (m, k, v) => m.set(k, (m.get(k) || 0) + v);
    for (const s of r.sesiones) for (const b of s.bloques){
      if (b.escalera){ const x = escalon(r, primero(b.escalera)); if (hay(x.e)){ sumar(n, x.e, b.series || 1); if (x.meta) meta.add(x.e); } }
      else if (b.ejercicio && b.series && hay(primero(b.ejercicio))) sumar(n, primero(b.ejercicio), b.series);
    }
    let mejor = null; for (const [e, v] of n) if (!mejor || v > mejor[1] || (v === mejor[1] && meta.has(e) && !meta.has(mejor[0]))) mejor = [e, v];
    if (mejor) return mejor[0];
    for (const clases of [["fuerte", "trabajo", "postura"], ["suave"]]){
      for (const s of r.sesiones) for (const b of s.bloques) if (b.tramos && !b.ejercicio && !b.escalera)
        for (const x of plano(b.tramos)) if (clases.includes(x.clase) && x.seg){ const e = primero(x.ejercicio) || actividad(r, b); if (hay(e)) sumar(t, e, x.seg); }
      if (t.size) break;
    }
    for (const [e, v] of t) if (!mejor || v > mejor[1]) mejor = [e, v];
    return mejor ? mejor[0] : null;
  });

  /* ===== El esqueleto de una pose, en las coordenadas del maniquí ===== */
  function esqueleto(id, vista = 0, u){
    return guardado("e" + id + ":" + vista + ":" + u, () => {
      const f = K.POSES[id]; if (!f) return null;
      const P0 = K.fig.muestra(id, u), J = K.fig.esqueleto(vista ? {...f, vista} : f, P0), p = {};
      for (const k of ["hd", "sh", "hip", "sN", "sF", "eN", "eF", "hN", "hF", "pN", "pF", "kN", "kF", "fN", "fF", "tN", "tF"]) p[k] = J[k] || (k[0] === "s" ? J.sh : J.hip);
      const barra = ["barra", "barra-baja"].includes(f.con), ruedas = f.con === "bici" ? [[f.en[0] - 34, K.fig.PISO - 30], [f.en[0] + 70, K.fig.PISO - 30]] : null;
      return {f, p, barra, ruedas, soga: f.con === "soga", pesa: f.con === "pesa", mancuernas: /^mancuerna/.test(f.con || ""), pared: f.pared, paralelas: f.con === "paralelas"};
    });
  }

  /* ===== El pictograma: la figura llena, encajada en un círculo de diámetro d con centro (cx, cy) =====
     color: la tinta de la figura · fondo: lo que hay detrás (el hueco entre miembros se pinta de ese color) */
  function picto(id0, {d = 74, cx = 50, cy = 50, color = "currentColor", fondo = "var(--s1)"} = {}){
    const o = encuadre(id0), e = esqueleto(o.pose, o.vista || 0, o.u); if (!e) return "";
    const p = {...e.p}, W = 13, TW = W * 1.4, HR = W * .98, GAP = W * .26;
    /* de frente, brazos que caen uno sobre otro se abren un poco */
    if (o.abrir){ const x = p.sh[0]; for (const [a, b, f] of [["eN", "eF", .8], ["hN", "hF", 1]]){ p[a] = [x - o.abrir * f, p[a][1]]; p[b] = [x + o.abrir * f, p[b][1]]; }
      p.sN = [x - o.abrir * .55, p.sh[1]]; p.sF = [x + o.abrir * .55, p.sh[1]]; }
    /* la cabeza, separada del tronco, en la dirección del cuello */
    const dh = sub(p.hd, p.sh), u = mul(dh, 1 / (len(dh) || 1)), cab = add(p.sh, mul(u, TW / 2 + GAP + HR));
    const eq = [], extra = [];
    /* la barra, en las manos; más corta si el cuerpo va acostado debajo (front lever), para que no se confunda con el cuerpo */
    const cuerpoX = Object.values(p).map(q => q[0]), cuerpoY = Object.values(p).map(q => q[1]), acostado = Math.max(...cuerpoX) - Math.min(...cuerpoX) > Math.max(...cuerpoY) - Math.min(...cuerpoY);
    if (e.barra){ const y = (p.hN[1] + p.hF[1]) / 2, xs = [p.hN[0], p.hF[0]], m = acostado ? 26 : 34, a = Math.min(...xs) - m, b = Math.max(...xs) + m;
      eq.push({t: "l", pts: [[a, y], [b, y]], w: 1.4}); extra.push([a, y], [b, y]); }
    /* las paralelas: la barra en las manos y el parante hasta el piso */
    if (e.paralelas){ const y = (p.hN[1] + p.hF[1]) / 2, x = (p.hN[0] + p.hF[0]) / 2, a = x - 30, b = x + 30, y1 = Math.max(...cuerpoY) + 8;
      eq.push({t: "l", pts: [[a, y], [b, y]], w: 1.4}, {t: "l", pts: [[a + 6, y], [a + 6, y1]]}, {t: "l", pts: [[b - 6, y], [b - 6, y1]]}); extra.push([a, y], [b, y], [a, y1]); }
    /* lo que se tiene en la mano: la kettlebell sigue el antebrazo; las mancuernas, cruzadas en cada mano */
    const ante = s => { const d = sub(p["h" + s], p["e" + s]); return mul(d, 1 / (len(d) || 1)); };
    if (e.pesa){ const h = mul(add(p.hN, p.hF), .5), q = add(h, mul(ante("N"), 15)); eq.push({t: "o", c: q, r: 12, delante: true}); extra.push([q[0] - 12, q[1] - 12], [q[0] + 12, q[1] + 12]); }
    if (e.mancuernas) for (const s of ["F", "N"]){ const d = ante(s), n = [-d[1], d[0]], q = add(p["h" + s], mul(d, 3)); eq.push({t: "l", pts: [add(q, mul(n, -14)), add(q, mul(n, 14))], w: 2.6}); }
    /* la pared en la que se apoya */
    if (e.pared !== undefined){ const y0 = Math.min(...cuerpoY) - 14; eq.push({t: "l", pts: [[e.pared, y0], [e.pared, K.fig.PISO]]}); extra.push([e.pared, y0], [e.pared, K.fig.PISO]); }
    if (e.ruedas){ const [R, F] = e.ruedas, r = 27; eq.push({t: "c", c: R, r}, {t: "c", c: F, r});
      const pedal = [(p.fN[0] + p.fF[0]) / 2 + 6, (p.fN[1] + p.fF[1]) / 2 + 2], asiento = [p.hip[0] + 2, p.hip[1] + 12], manubrio = [F[0] - 10, p.hN[1] + 14];
      eq.push({t: "l", pts: [R, pedal, asiento, R]}, {t: "l", pts: [asiento, manubrio, F]}, {t: "l", pts: [pedal, manubrio]}, {t: "l", pts: [manubrio, [p.hN[0] - 2, p.hN[1]]]});
      for (const c of [R, F]) extra.push([c[0] - r, c[1] - r], [c[0] + r, c[1] + r]); }
    if (e.soga){ const y = Math.max(p.tN[1], p.tF[1], p.fN[1]) + 12, A = p.hN, B = p.hF;
      eq.push({t: "s", d: [A, [A[0] + 40, y + 26], [B[0] - 40, y + 26], B]}); extra.push([A[0] + 30, y + 18], [B[0] - 30, y + 18]); }
    if (o.piso){ const vs = Object.values(p), y = Math.max(...vs.map(q => q[1])) + W * .9, a = Math.min(...vs.map(q => q[0])) - 22, b = Math.max(...vs.map(q => q[0])) + 22;
      eq.push({t: "l", pts: [[a, y], [b, y]]}); extra.push([a, y], [b, y]); }
    /* la caja con la proporción de la pose cuya diagonal es el diámetro: así lo largo (un front lever) y lo alto (una dominada) llenan el círculo igual */
    const pts = [...Object.values(p), ...extra, [cab[0] - HR, cab[1] - HR], [cab[0] + HR, cab[1] + HR]], xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const x0 = Math.min(...xs) - W / 2, x1 = Math.max(...xs) + W / 2, y0 = Math.min(...ys) - W / 2, y1 = Math.max(...ys) + W / 2, a = (x1 - x0) / (y1 - y0);
    const w = Math.min(d * a / Math.hypot(1, a), d * .92), h = Math.min(d / Math.hypot(1, a), d * .92), k = Math.min(w / (x1 - x0), h / (y1 - y0));
    const ox = cx - (x1 - x0) * k / 2, oy = cy - (y1 - y0) * k / 2, T = q => [ox + (q[0] - x0) * k, oy + (q[1] - y0) * k];
    const pl = (ks, sw, c = color) => `<polyline points="${ks.map(q => T(typeof q === "string" ? p[q] : q).map(f1).join(",")).join(" ")}" stroke="${c}" stroke-width="${f1(sw * k)}"/>`;
    const ew = W * .42;
    const dibujar = xs => xs.map(x => x.t === "l" ? pl(x.pts, ew * (x.w || 1)) : x.t === "o" ? (() => { const c = T(x.c); return `${x.delante ? `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1((x.r + GAP) * k)}" fill="${fondo}"/>` : ""}<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(x.r * k)}" fill="${color}"/>`; })() : x.t === "c" ? (() => { const c = T(x.c); return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(x.r * k)}" stroke="${color}" stroke-width="${f1(ew * k)}"/>`; })()
      : (() => { const [A, B, C, D] = x.d.map(T); return `<path d="M${A.map(f1)}C${B.map(f1)} ${C.map(f1)} ${D.map(f1)}" stroke="${color}" stroke-width="${f1(ew * .8 * k)}"/>`; })()).join(""), equipo = dibujar(eq.filter(x => !x.delante)), enMano = dibujar(eq.filter(x => x.delante));
    const hueco = (ks, sw) => pl(ks, sw + 2 * GAP, fondo), H = T(cab);
    const brazoL = ["sF", "eF", "hF"], piernaL = ["pF", "kF", "fF", "tF"], brazoC = ["sN", "eN", "hN"], piernaC = ["pN", "kN", "fN", "tN"];
    return `<g class="ico-cuerpo" fill="none" stroke-linecap="round" stroke-linejoin="round">${equipo}${pl(brazoL, W)}${pl(piernaL, W)}${hueco(["sh", "hip"], TW)}${o.junta ? "" : hueco(piernaC, W)}`
      + `${pl(["sh", "hip"], TW)}${pl(piernaC, W)}${hueco(brazoC, W)}${pl(brazoC, W)}<circle cx="${f1(H[0])}" cy="${f1(H[1])}" r="${f1((HR + GAP) * k)}" fill="${fondo}"/>`
      + `<circle cx="${f1(H[0])}" cy="${f1(H[1])}" r="${f1(HR * k)}" fill="${color}"/>${enMano}</g>`;
  }

  /* el satélite del logo: un punto con un aro del color de la tarjeta; llega orbitando alrededor del centro (cx, cy) */
  const satelite = (x, y, fam, cx, cy, r = 6.5) => `<g class="ico-sat" style="transform-origin:${cx}px ${cy}px"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 3)}" fill="var(--s1)"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="var(--${fam})"/></g>`;
  const svg = (px, cls, lb, g) => `<svg class="ico ${cls}"${px ? ` width="${px}" height="${px}"` : ""} viewBox="0 0 100 100"${lb ? ` role="img" aria-label="${K.esc(lb)}"` : ` aria-hidden="true"`}>${g}</svg>`;

  /* ===== Prueba: una medalla. Ganada (ya tenés una magnitud): cinta y disco del color de la familia, la figura calada y el satélite.
     Sin ganar: la misma medalla en gris ===== */
  const MC = {x: 50, y: 59, r: 40};
  const medalla = (h, ganada, px, lb = "") => { const id = poseHazana(h); if (!id) return "";
    const fam = h.familia, cinta = ganada ? `var(--${fam})` : "var(--off)", disco = ganada ? `var(--${fam})` : "var(--s2)", tinta = ganada ? "var(--s1)" : "var(--ink-3)";
    const a = Math.PI / 4, sx = MC.x + MC.r * Math.sin(a), sy = MC.y - MC.r * Math.cos(a);
    return svg(px, `ico-medalla${ganada ? " ganada" : ""}`, lb, `<path d="M30 2h15l9 26H39zM70 2H55l-9 26h15z" fill="${cinta}"${ganada ? ' fill-opacity=".55"' : ""}/>`
      + `<circle cx="${MC.x}" cy="${MC.y}" r="${MC.r}" fill="${disco}"/><circle cx="${MC.x}" cy="${MC.y}" r="${MC.r - 5.5}" fill="none" stroke="${ganada ? "var(--s1)" : "var(--off)"}" stroke-opacity="${ganada ? .35 : 1}" stroke-width="1.6"/>`
      + picto(id, {d: 62, cx: MC.x, cy: MC.y, color: tinta, fondo: disco}) + (ganada ? satelite(sx, sy, fam, MC.x, MC.y) : ""));
  };
  /* ===== Rutina: el pictograma sobre un círculo del color suave de su familia ===== */
  const rutina = (r, px, lb = "") => { const id = poseRutina(r); if (!id) return "";
    return svg(px, "ico-rutina", lb, `<circle cx="50" cy="50" r="50" fill="var(--${r.familia}-soft)"/>` + picto(id, {d: 76, color: `var(--${r.familia})`, fondo: `var(--${r.familia}-soft)`})); };

  return {poseHazana, poseRutina, encuadre, esqueleto, picto, medalla, rutina, ENCUADRE};
})();
