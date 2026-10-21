/* ===== Figura: la persona que muestra cada ejercicio. Un cuerpo de perfil, sus poses y el ritmo entre ellas.
   Ángulos absolutos por segmento: 0 abajo, 90 adelante, 180 arriba, 270 atrás. Lo cercano adelante; lo lejano, en sombra.
   Las poses viven en src/poses/: K.POSES[id] = {fijo, en, con, k: [inicio, final], ritmo, muestra, ciclo}. ===== */
K.POSES = {};
K.fig = (() => {
  const L = {torso: 56, neck: 9, head: 12, up: 30, fo: 27, th: 43, sh: 41, foot: 14}, PISO = 268;
  const nrm = a => ((a % 360) + 540) % 360 - 180, s01 = a => { const s = ((a % 360) + 360) % 360; return s > 270 ? s - 360 : s; };
  /* relativos: positivo es flexión */
  const REL = {
    cuello: P => nrm(P.head - P.torso),
    hombroN: P => s01(P.armN[0] - P.torso - 180), hombroF: P => s01(P.armF[0] - P.torso - 180),
    codoN: P => nrm(P.armN[1] - P.armN[0]), codoF: P => nrm(P.armF[1] - P.armF[0]),
    caderaN: P => nrm(P.legN[0] - P.torso - 180), caderaF: P => nrm(P.legF[0] - P.torso - 180),
    rodillaN: P => -nrm(P.legN[1] - P.legN[0]), rodillaF: P => -nrm(P.legF[1] - P.legF[0])
  };
  /* lo que un cuerpo puede; «avanzado» abre la cadera y el hombro para espagats y puentes */
  const LIM = {cuello: [-45, 45], hombro: [-60, 185], codo: [-5, 150], cadera: [-30, 130], rodilla: [-4, 155]}, AV = {cadera: [-95, 165], hombro: [-75, 200]};
  const lim = (k, f) => { const b = k.replace(/[NF]$/, ""); return f.rango === "avanzado" && AV[b] ? AV[b] : LIM[b]; };
  const rels = P => Object.fromEntries(Object.entries(REL).map(([k, f]) => [k, f(P)]));
  const v = (a, l) => [Math.sin(a * Math.PI / 180) * l, Math.cos(a * Math.PI / 180) * l], sum = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function joints(P, raiz){
    const hip = raiz || [0, 0], sh = sum(hip, v(P.torso, L.torso)), nk = sum(sh, v(P.head, L.neck)), hd = sum(nk, v(P.head, L.head * .8));
    const brazo = a => { const e = sum(sh, v(a[0], L.up)); return [e, sum(e, v(a[1], L.fo))]; };
    const pierna = (a, p) => { const k = sum(hip, v(a[0], L.th)), f = sum(k, v(a[1], L.sh)); return [k, f, sum(f, v(a[1] + 90 + p, L.foot))]; };
    const [eN, hN] = brazo(P.armN), [eF, hF] = brazo(P.armF), [kN, fN, tN] = pierna(P.legN, P.pies?.[0] || 0), [kF, fF, tF] = pierna(P.legF, P.pies?.[1] || 0);
    return {hip, sh, nk, hd, eN, hN, eF, hF, kN, fN, tN, kF, fF, tF, P};
  }
  /* el punto que no se mueve (la mano en la barra, el pie en el piso) queda clavado en «en» */
  /* «alto» levanta todo el cuerpo (un salto): el punto fijo deja de tocar mientras está en el aire */
  const ubicar = (f, P) => { const J = joints(P), p = J[f.fijo]; return joints(P, [f.en[0] - p[0], f.en[1] - p[1] - (P.alto || 0)]); };
  const lerpA = (a, b, t) => a + nrm(b - a) * t;
  /* lo opcional de una pose: el giro de los pies y la altura del salto */
  const NADA = {pies: [0, 0], alto: 0};
  const mezclar = (A, B, t) => Object.fromEntries([...new Set([...Object.keys(A), ...Object.keys(B)])].map(k => { const a = A[k] ?? NADA[k] ?? B[k], b = B[k] ?? NADA[k] ?? a;
    return [k, Array.isArray(a) ? a.map((x, i) => lerpA(x, b[i], t)) : lerpA(a, b, t)]; }));
  /* la pose en u ∈ [0,1]: de inicio a final pasando por las del medio (el muscle-up tiene tres), o dando la vuelta por todas si es un ciclo */
  const en = (f, u) => { if (!f.ciclo){ const n = f.k.length - 1, x = Math.min(Math.max(u, 0), 1) * n, i = Math.min(Math.floor(x), n - 1); return mezclar(f.k[i], f.k[i + 1], x - i); }
    const n = f.k.length, x = ((u % 1) + 1) % 1 * n, i = Math.floor(x); return mezclar(f.k[i % n], f.k[(i + 1) % n], x - i); };
  const muestras = f => f.ciclo ? f.k.flatMap((_, i) => [i / f.k.length, (i + .5) / f.k.length]) : [...new Set([0, .25, .5, .75, 1, ...f.k.map((_, i) => i / (f.k.length - 1))])];
  const dentro = (f, P) => Object.entries(rels(P)).every(([k, x]) => { const r = lim(k, f); return x >= r[0] - .5 && x <= r[1] + .5; });

  /* ===== el cuerpo: siluetas lisas, sin costuras ni líneas de músculo; lo lejano, un tono más oscuro ===== */
  const n1 = n => n.toFixed(1);
  function suave(p){ let s = `M${n1((p[0][0] + p[p.length - 1][0]) / 2)} ${n1((p[0][1] + p[p.length - 1][1]) / 2)}`;
    for (let i = 0; i < p.length; i++){ const a = p[i], b = p[(i + 1) % p.length]; s += `Q${n1(a[0])} ${n1(a[1])} ${n1((a[0] + b[0]) / 2)} ${n1((a[1] + b[1]) / 2)}`; } return s + "Z"; }
  const path = (d, c, op) => `<path d="${d}" fill="${c}"${op ? ` opacity="${op}"` : ""}/>`;
  /* un miembro con perfil: [t, radio atrás (+n), radio adelante (−n)]; «t0..t1» recorta un tramo (la manga, el short) */
  function miembro(a, b, prof, c, t0 = 0, t1 = 1){
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ux = dx / d, uy = dy / d;
    const r = t => { for (let i = 1; i < prof.length; i++) if (t <= prof[i][0]){ const [ta, pa, qa] = prof[i - 1], [tb, pb, qb] = prof[i], k = (t - ta) / (tb - ta || 1); return [pa + (pb - pa) * k, qa + (qb - qa) * k]; } return prof[prof.length - 1].slice(1); };
    const ts = [t0, ...prof.map(q => q[0]).filter(t => t > t0 && t < t1), t1], P = [];
    if (t0 === 0){ const e = r(0)[0] * .9; P.push([a[0] - ux * e, a[1] - uy * e]); }
    ts.forEach(t => { const [rp] = r(t); P.push([a[0] + dx * t + nx * rp, a[1] + dy * t + ny * rp]); });
    if (t1 === 1){ const e = r(1)[0] * .9; P.push([b[0] + ux * e, b[1] + uy * e]); }
    [...ts].reverse().forEach(t => { const [, rn] = r(t); P.push([a[0] + dx * t - nx * rn, a[1] + dy * t - ny * rn]); });
    return path(suave(P), c);
  }
  /* un mechón que cuelga: sale de la raíz hacia atrás y la gravedad lo baja; «sw» lo hamaca */
  function cuelga(raiz, atras, largo, w0, w1, c, sw){
    /* si el piso no lo deja caer, el pelo se acuesta sobre el piso hacia atrás */
    const m = [raiz[0] + atras[0] * largo * .35, raiz[1] + atras[1] * largo * .35], cae = m[1] + largo * .75, sobra = Math.max(cae - (PISO - 3), 0);
    const g = [m[0] + sw * largo * .5 + (atras[0] < 0 ? -1 : 1) * sobra * .9, Math.min(cae, PISO - 3)];
    const q = t => [(1 - t) ** 2 * raiz[0] + 2 * (1 - t) * t * m[0] + t * t * g[0], (1 - t) ** 2 * raiz[1] + 2 * (1 - t) * t * m[1] + t * t * g[1]];
    const pts = [0, .2, .4, .6, .8, 1].map(q), L = [], R = [];
    pts.forEach((p, i) => { const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, w = w0 + (w1 - w0) * i / (pts.length - 1);
      L.push([p[0] + nx * w, p[1] + ny * w]); R.unshift([p[0] - nx * w, p[1] - ny * w]); });
    return path(suave([...L, [g[0] + (g[0] - pts[4][0]) * .3, g[1] + (g[1] - pts[4][1]) * .3], ...R]), c);
  }
  /* perfiles: muslo, pierna (gemelo atrás), brazo, antebrazo; la mujer, un poco más finos de brazos y más anchos de cadera */
  const PERF = {
    hombre: {th: [[0, 11.4, 10.6], [.25, 11, 11.2], [.6, 8.6, 9], [.9, 6.8, 7], [1, 6.6, 6.6]], sh: [[0, 6.4, 6.2], [.14, 7.8, 6], [.32, 8.2, 5.6], [.62, 5.8, 4.6], [.9, 4, 3.8], [1, 3.8, 3.8]],
      up: [[0, 7.6, 7.8], [.3, 6.6, 7.4], [.62, 5.4, 6], [1, 4.6, 4.6]], fo: [[0, 4.8, 4.8], [.22, 5.6, 5.4], [.6, 4.2, 4], [1, 3.1, 3.1]], cuello: 4.6},
    mujer: {th: [[0, 12.4, 10.4], [.25, 11.4, 10.8], [.6, 8.4, 8.6], [.9, 6.4, 6.4], [1, 6.2, 6.2]], sh: [[0, 6, 5.8], [.14, 7.4, 5.6], [.32, 7.6, 5.2], [.62, 5.4, 4.2], [.9, 3.7, 3.5], [1, 3.5, 3.5]],
      up: [[0, 6.6, 6.8], [.3, 5.8, 6.2], [.62, 4.8, 5.2], [1, 4.1, 4.1]], fo: [[0, 4.2, 4.2], [.22, 4.8, 4.6], [.6, 3.7, 3.5], [1, 2.8, 2.8]], cuello: 3.9}
  };
  /* el tronco en coordenadas propias (t de la cadera al hombro; w: adelante el pecho, atrás la espalda) */
  const TRONCO = {
    hombre: {ad: [[-.08, 9], [.05, 10.2], [.2, 10.4], [.45, 9.8], [.62, 11.6], [.78, 13.4], [.92, 11.4], [1.04, 7]], at: [[-.08, 10.5], [.08, 13.2], [.2, 12.4], [.42, 9.6], [.65, 10], [.85, 11.2], [.98, 9], [1.06, 6]]},
    mujer: {ad: [[-.08, 9.6], [.05, 10.6], [.2, 10.4], [.42, 8.4], [.56, 9.2], [.68, 13.8], [.76, 14.6], [.84, 12.4], [.93, 9.4], [1.04, 6.2]], at: [[-.08, 11.4], [.08, 14.4], [.2, 12.8], [.42, 8.4], [.65, 9], [.85, 10], [.98, 8], [1.05, 5.6]]}
  };
  const interp = (arr, t) => { for (let i = 1; i < arr.length; i++) if (t <= arr[i][0]){ const [ta, a] = arr[i - 1], [tb, b] = arr[i]; return a + (b - a) * (t - ta) / (tb - ta || 1); } return arr[arr.length - 1][1]; };
  /* un tramo del tronco, de t0 a t1 */
  function tronco(J, T, t0, t1, c){
    const H = J.hip, S = J.sh, dx = S[0] - H[0], dy = S[1] - H[1], d = Math.hypot(dx, dy), fx = -dy / d, fy = dx / d;
    const w = (t, x) => [H[0] + dx * t + fx * x, H[1] + dy * t + fy * x];
    const cl = t => Math.min(Math.max(t, T.ad[0][0]), T.ad[T.ad.length - 1][0]);
    const a0 = cl(t0), a1 = Math.min(t1, T.ad[T.ad.length - 1][0]), b1 = Math.min(t1, T.at[T.at.length - 1][0]);
    const ad = [a0, ...T.ad.map(q => q[0]).filter(t => t > a0 && t < a1), a1].map(t => w(t, interp(T.ad, t)));
    const at = [a0, ...T.at.map(q => q[0]).filter(t => t > a0 && t < b1), b1].map(t => w(t, -interp(T.at, t))).reverse();
    const top = t1 >= 1.04 ? [w(1.1, 0)] : [], bot = t0 <= -.08 ? [w(-.12, 0)] : [];
    return path(suave([...bot, ...ad, ...top, ...at]), c);
  }
  /* la cabeza de perfil, sin cara: cráneo, mandíbula, nariz apenas. x adelante, y arriba, radio ~11 */
  const HS = 1.16;
  const CABEZA = [[10.2, 2], [10.9, -1.4], [9.7, -3.2], [10, -5.4], [8.4, -8.6], [4.6, -11], [-1, -10.4], [-4.6, -8.2], [-9.6, -3], [-11, 2.5], [-9, 8], [-4, 11.4], [2.5, 11.8], [7.6, 9], [10, 5]];
  const PELO = {
    corto: [[9.4, 5.2], [10.8, 8.2], [8.8, 11.6], [4, 13.8], [-2, 14], [-7.6, 12], [-11.2, 7.6], [-12.2, 2], [-11.4, -2.8], [-9.6, -5], [-7.8, -3.2], [-7.4, .4], [-5, 3.6], [-1.4, 5], [3.8, 5.2]],
    rapado: [[8.6, 5.2], [8.9, 8.4], [5.4, 11.5], [0, 12.2], [-5.6, 11.2], [-9.8, 7], [-11.2, 1.6], [-10, -3], [-7.6, -2], [-6.8, 2], [-2, 5], [3, 5.6]],
    recogido: [[9.4, 4.6], [9.9, 8.4], [5.8, 12.4], [-1, 13.2], [-7.2, 11.2], [-11, 6], [-11.6, 0], [-9.8, -3.8], [-7.4, -1], [-6.2, 4], [-1, 6.2], [4, 6.6]],
    melena: [[9.4, 4.6], [9.9, 8.4], [5.8, 12.6], [-1.4, 13.4], [-8.2, 11.4], [-12.2, 5], [-12.6, -3], [-11, -8], [-7.2, -7.4], [-7.4, -1.4], [-5.6, 4.4], [-1, 6.2], [4, 6.6]],
    /* la barba cubre la mejilla y la mandíbula, de la oreja al mentón, sin tapar la boca */
    barba: [[-.2, .8], [-3, -4.2], [-1.6, -9.2], [3.6, -11.8], [8.4, -10.4], [10.4, -7.6], [10.1, -6.2], [7.6, -6.8], [4.8, -5.8], [2.2, -3.4], [1.4, .8]]
  };
  function cabeza(J, pe, sw){
    const hd = J.hd, f = v(J.P.head - 90, 1), u = v(J.P.head, 1), loc = ([x, y]) => [hd[0] + (f[0] * x + u[0] * y) * HS, hd[1] + (f[1] * x + u[1] * y) * HS];
    const poli = (p, c) => path(suave(p.map(loc)), c), circ = (x, y, r, c) => { const p = loc([x, y]); return `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${n1(r * HS)}" fill="${c}"/>`; };
    const P = PERF[pe.sexo], h = pe.pelo, hc = pe.colorPelo, atras = [-f[0], -f[1]];
    let detras = "", o = "";
    if (h === "colita") detras = cuelga(loc([-10.4, 6.4]), atras, 21, 3.4, 1.6, hc, sw);
    if (h === "largo") detras = cuelga(loc([-8, 2]), atras, 30, 7.4, 3.4, hc, sw * .6);
    o += miembro(J.sh, J.nk, [[0, P.cuello, P.cuello], [1, P.cuello * .9, P.cuello * .9]], pe.piel);
    o += poli(CABEZA, pe.piel);
    if (h === "afro") o += poli(PELO.corto, hc) + [[7, 11], [2.6, 15], [-3.4, 16], [-9, 13.6], [-12.6, 8.6], [-14, 2.6], [-13, -3]].map(([x, y]) => circ(x, y, 5.4, hc)).join("");
    else if (h === "rulos") o += poli(PELO.corto, hc) + [[8, 9], [4, 12.2], [-1, 13.4], [-6, 12.4], [-10, 9], [-12, 4], [-12, -1.4], [-10.4, -4.4]].map(([x, y]) => circ(x, y, 3.8, hc)).join("");
    else if (h === "pelado") o += poli(PELO.rapado, hc).replace("/>", ' opacity=".18"/>');
    else if (h === "colita" || h === "rodete" || h === "largo") o += poli(PELO.recogido, hc) + (h === "rodete" ? circ(-8.4, 10.6, 5.4, hc) : "");
    else if (h === "melena") o += poli(PELO.melena, hc);
    else o += poli(PELO[h] || PELO.corto, hc);
    if (pe.barba) o += poli(PELO.barba, hc);
    if (!["largo", "melena", "afro"].includes(h)) o += circ(-1.6, -.4, 2.1, pe.pielS);
    return {detras, o};
  }
  function zapatilla(f, sh, pe, lejos){ const w = v(sh + 90, 1), d = v(sh, 1), pt = (a, b) => [f[0] + w[0] * a + d[0] * b, f[1] + w[1] * a + d[1] * b];
    const ln = (p, q, col, sw) => { const a = pt(...p), b = pt(...q); return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`; };
    return path(suave([pt(-3.4, -4), pt(-6.4, 1), pt(-5.6, 5.2), pt(5, 5.6), pt(15.4, 5.2), pt(16.6, 2.6), pt(12, .4), pt(5, -2), pt(2.4, -4.6)]), lejos ? pe.zapaF : pe.zapa)
      + ln([-5, 5.2], [14.5, 4.8], lejos ? pe.suelaF : pe.suela, 2.2) + ln([1.5, 1.6], [7.5, 2.6], "var(--c)", 1.5); }
  function mano(h, fo, c){ if (h[1] > PISO - 8) fo = 90; const u = v(fo, 1), cx = h[0] + u[0] * 3.4, cy = h[1] > PISO - 8 ? PISO - 3 : h[1] + u[1] * 3.4;
    return `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${h[1] > PISO - 8 ? 2.6 : 3.4}" ry="5.2" transform="rotate(${n1(-fo)} ${n1(cx)} ${n1(cy)})" fill="${c}"/>`; }
  /* la colchoneta abarca todo lo que apoya en todo el movimiento (también la cola, la espalda, la cabeza): no cambia de ancho entre cuadros */
  const TRAMOS = [["hip", "sh"], ["sh", "hd"], ["hip", "kN"], ["kN", "fN"], ["fN", "tN"], ["hip", "kF"], ["kF", "fF"], ["fF", "tF"], ["sh", "eN"], ["eN", "hN"], ["sh", "eF"], ["eF", "hF"]];
  function colchoneta(Js, c){ const xs = Js.flatMap(J => TRAMOS.flatMap(([a, b]) => [0, .25, .5, .75, 1].map(t => lerp(J[a], J[b], t)))).filter(p => p[1] > PISO - 20).map(p => p[0]);
    if (!xs.length) return ""; const x0 = Math.min(...xs) - 24, x1 = Math.max(...xs) + 24;
    return `<rect x="${n1(x0)}" y="${PISO - 1}" width="${n1(x1 - x0)}" height="7" rx="3.5" fill="${c}"/>`; }
  function cuerpo(J, pe, sw = 0){
    const P = J.P, F = PERF[pe.sexo], T = TRONCO[pe.sexo], g = [];
    const pierna = s => { const lejos = s === "F", k = J["k" + s], fp = J["f" + s], piel = lejos ? pe.pielS : pe.piel, ropa = lejos ? pe.abajoF : pe.abajo;
      let o = miembro(J.hip, k, F.th, piel) + miembro(k, fp, F.sh, piel);
      if (pe.abajoTipo === "short") o += miembro(J.hip, k, F.th.map(([t, a, b]) => [t, a + .8, b + .8]), ropa, 0, .55);
      else { o += miembro(J.hip, k, F.th.map(([t, a, b]) => [t, a + .5, b + .5]), ropa) + miembro(k, fp, F.sh.map(([t, a, b]) => [t, a + .5, b + .5]), ropa, 0, pe.abajoTipo === "corta" ? .62 : .9); }
      return o + zapatilla(fp, P["leg" + s][1] + (P.pies?.[lejos ? 1 : 0] || 0), pe, lejos); };
    const brazo = s => { const lejos = s === "F", e = J["e" + s], h = J["h" + s], piel = lejos ? pe.pielS : pe.piel, ropa = lejos ? pe.arribaF : pe.arriba;
      let o = miembro(J.sh, e, F.up, piel) + miembro(e, h, F.fo, piel);
      if (pe.arribaTipo === "remera") o += miembro(J.sh, e, F.up.map(([t, a, b]) => [t, a + 1, b + 1]), ropa, 0, .44);
      if (pe.arribaTipo === "larga") o += miembro(J.sh, e, F.up.map(([t, a, b]) => [t, a + .6, b + .6]), ropa) + miembro(e, h, F.fo.map(([t, a, b]) => [t, a + .5, b + .5]), ropa, 0, .88);
      return o + mano(h, P["arm" + s][1], piel); };
    const cab = cabeza(J, pe, sw);
    g.push(cab.detras, brazo("F"), pierna("F"));
    /* el tronco: piel, la ropa de arriba (el top deja la panza), la cintura del pantalón */
    g.push(tronco(J, T, -.08, 1.1, pe.piel));
    g.push(pe.arribaTipo === "top" ? tronco(J, T, .6, .96, pe.arriba) : tronco(J, T, .16, pe.arribaTipo === "musculosa" ? .97 : 1.04, pe.arriba));
    g.push(tronco(J, T, -.08, .2, pe.abajo));
    /* el brazo cercano que pasa por delante de la cabeza lleva un borde un tono más oscuro, para que la cara no se pierda */
    const tapa = REL.hombroN(P) > 125, bN = brazo("N");
    /* el halo: la misma silueta del brazo, un poco más gruesa y oscura, por detrás; contorno solo por fuera, sin costuras */
    const halo = !tapa ? "" : (bN.match(/<(path|ellipse)[^>]*\/>/g) || []).filter(x => x.includes(`fill="${pe.piel}"`)).map(x => x.replace(/fill="[^"]*"/, `fill="${pe.pielS}" stroke="${pe.pielS}" stroke-width="2.6" stroke-linejoin="round"`)).join("");
    g.push(pierna("N"), cab.o, halo, bN);
    return g.join("");
  }

  /* ===== lo que se usa ===== */
  const ln = (x1, y1, x2, y2, cls) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" class="${cls}"/>`;
  /* lo que está detrás del cuerpo y no se mueve; en la miniatura, sin los postes */
  function elemento(f, chica, d){
    const c = f.con, [x, y] = f.en, o = [];
    /* los postes llegan al piso, o hasta el borde del disco si el piso queda fuera del cuadro */
    const pie = px => !d ? PISO : Math.min(PISO, d[1] + Math.sqrt(Math.max(d[2] ** 2 - (px - d[0]) ** 2, 0)));
    if (!chica && c === "barra") o.push(ln(x - 72, y, x - 72, pie(x - 72), "poste"), ln(x + 72, y, x + 72, pie(x + 72), "poste"));
    if (!chica && c === "barra-baja") o.push(ln(x - 60, y, x - 60, pie(x - 60), "poste"), ln(x + 60, y, x + 60, pie(x + 60), "poste"));
    if ((c === "barra" || c === "barra-baja") && f.barraAtras) o.push(ln(x - 80, y, x + 80, y, "barra"));
    /* la pared y el palo no pasan del borde de arriba del disco */
    const tope = (px, y) => !d ? y : Math.max(y, d[1] - Math.sqrt(Math.max(d[2] ** 2 - (px - d[0]) ** 2, 0)) + 6);
    if (f.pared !== undefined){ const y0 = tope(f.pared + 20, PISO - 230); o.push(`<rect x="${f.pared}" y="${n1(y0)}" width="40" height="${n1(PISO - y0)}" class="pared"/>`); }
    if (f.poste !== undefined) o.push(ln(f.poste, tope(f.poste, PISO - 200), f.poste, PISO, "palo"));
    if (f.banco) o.push(`<rect x="${n1(f.banco[0] - 30)}" y="${n1(f.banco[1])}" width="60" height="${n1(PISO - f.banco[1])}" rx="4" class="banco"/>`);
    /* las paralelas de perfil: una barra larga a la altura de las manos, con sus dos patas */
    if (c === "paralelas") o.push(`<path class="par" d="M${x - 70} ${y}H${x + 70}M${x - 54} ${y}V${PISO}M${x + 54} ${y}V${PISO}"/>`);
    if (c === "bici") o.push(bici(f));
    /* la silla va detrás del cuerpo: se sienta, apoya la mano o el pie */
    if (f.silla){ const [sx, sy, lado] = f.silla, rx = lado === "der" ? sx + 18 : sx - 18;
      o.push(`<path class="silla" d="M${sx - 22} ${sy}H${sx + 22}M${sx - 18} ${sy}V${PISO}M${sx + 18} ${sy}V${PISO}M${rx} ${sy}V${sy - 48}"/>`); }
    return o.length ? `<g class="fig-el">${o.join("")}</g>` : "";
  }
  /* lo que va delante del cuerpo: la barra que se agarra y lo que se tiene en las manos */
  function enMano(f, J, u){
    const c = f.con, [x, y] = f.en, o = [];
    if ((c === "barra" || c === "barra-baja") && !f.barraAtras) o.push(ln(x - 80, y, x + 80, y, "barra"));
    /* la kettlebell sigue la línea del antebrazo: cuelga abajo, y arriba descansa sobre el dorso del brazo */
    if (c === "pesa"){ const h = f.unaMano ? J.hN : lerp(J.hN, J.hF, .5), fo = J.P.armN[1], arriba = Math.max(0, -Math.cos(fo * Math.PI / 180)), d = v(fo, 12 - 16 * arriba), b = v(270, 11 * arriba), q = [h[0] + d[0] + b[0], h[1] + d[1] + b[1]], w = v(fo + 90, 6), a = v(fo, 6);
      o.push(`<circle cx="${n1(q[0])}" cy="${n1(q[1])}" r="9.5" class="hierro"/><path d="M${n1(h[0] - w[0] + a[0])} ${n1(h[1] - w[1] + a[1])}Q${n1(h[0] - a[0])} ${n1(h[1] - a[1])} ${n1(h[0] + w[0] + a[0])} ${n1(h[1] + w[1] + a[1])}" class="asa"/>`); }
    if (c === "mancuernas" || c === "mancuerna") for (const s of c === "mancuerna" ? ["N"] : ["F", "N"]){ const h = J["h" + s], u = v(J.P["arm" + s][1], 4);
      const p = [h[0] + u[0], h[1] + u[1]], w = v(J.P["arm" + s][1] + 90, 9);
      o.push(`<line x1="${n1(p[0] - w[0])}" y1="${n1(p[1] - w[1])}" x2="${n1(p[0] + w[0])}" y2="${n1(p[1] + w[1])}" class="manc"${s === "F" ? ' opacity=".6"' : ""}/>`); }
    /* la soga gira: pasa bajo los pies en el vuelo («sogaPie», por defecto en la mitad del ciclo), sube por atrás y baja por adelante;
       en la doble da dos vueltas por salto. Sin «u» (la miniatura) queda abajo */
    if (c === "soga"){ const a = J.hN, b = J.hF, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], R = PISO + 2 - m[1];
      const vueltas = f.vueltas || (f.soga === "doble" ? 2 : 1), th = u === undefined ? 0 : -360 * vueltas * (u - (f.sogaPie ?? .5)), d = v(th, R), ap = [m[0] + d[0] * .8, Math.min(m[1] + d[1], PISO + 2)];
      o.push(`<path d="M${n1(a[0])} ${n1(a[1])}Q${n1(ap[0] * 2 - m[0])} ${n1(ap[1] * 2 - m[1])} ${n1(b[0])} ${n1(b[1])}" class="soga"/>`); }
    if (f.toalla) o.push(`<rect x="${n1(J.fN[0] - 9)}" y="${PISO - 3}" width="26" height="4" rx="2" class="toalla"/>`);
    return o.length ? `<g class="fig-el">${o.join("")}</g>` : "";
  }
  /* la bici fija: el asiento en «en», el manubrio adelante, las ruedas en el piso */
  function bici(f){ const [x, y] = f.en, r = 30, w1 = [x - 34, PISO - r], w2 = [x + 70, PISO - r], pd = [x + 14, y + 62], mb = [x + 62, y - 14];
    return `<circle cx="${w1[0]}" cy="${w1[1]}" r="${r}" class="rueda"/><circle cx="${w2[0]}" cy="${w2[1]}" r="${r}" class="rueda"/>`
      + `<path class="cuadro" d="M${w1[0]} ${w1[1]}L${pd[0]} ${pd[1]}L${x + 4} ${y + 6}M${pd[0]} ${pd[1]}L${x + 56} ${y + 10}L${w2[0]} ${w2[1]}M${x + 56} ${y + 10}L${mb[0]} ${mb[1]}h10M${x - 10} ${y + 4}h20M${x + 4} ${y + 6}L${w1[0]} ${w1[1]}"/>`; }

  /* ===== cada persona sale sorteada por ejercicio (siempre la misma para el mismo ejercicio); Vos puede fijar cualquier rasgo ===== */
  const TONOS = ["#f3d0b0", "#e8bc96", "#d9a57f", "#c68e66", "#a9714c", "#8b5a3b", "#6c4430", "#4d3124"];
  const PELOS = ["#1f1915", "#2e221b", "#4a3324", "#6e4c31", "#9a7650", "#c9a46b", "#a3502f", "#8f8a85"];
  const ESTILOS = {mujer: ["colita", "rodete", "largo", "melena", "colita", "afro"], hombre: ["corto", "rapado", "rulos", "pelado", "corto", "corto"]};
  const ARRIBA = {mujer: ["top", "musculosa", "remera", "larga"], hombre: ["musculosa", "remera", "remera", "larga"]};
  const ABAJO = {mujer: ["calza", "calza", "corta", "short"], hombre: ["short", "short", "calza", "jogger"]};
  /* la ropa de arriba, clara y en un color que no se pierda contra el disco de la familia; la de abajo, honda */
  const TOPS = ["#f2c14e", "#e9806b", "#7cc3b5", "#f3efe4", "#b9a6e0", "#ef9f3f", "#9cc5e6", "#e7d36a"];
  const CHOCA = {fu: ["#e9806b", "#ef9f3f"], mo: ["#7cc3b5", "#9cc5e6"], ra: ["#e7d36a"]};
  const BOTS = ["#1f5f5b", "#26355d", "#5b3758", "#2c2f35", "#4b5d3a", "#7a3a2e", "#3b3f6b"];
  const MATS = ["#2a2c33", "#5f3b52", "#2f4f6b", "#7a4a3a", "#3d5a40"];
  const ZAPAS = [["#f4f3ef", "#d9d6cf"], ["#2b2d33", "#1d1f23"], ["#9aa0a8", "#7c828a"]];
  const oscuro = (h, t = .8) => "#" + [1, 3, 5].map(i => Math.round(parseInt(h.substr(i, 2), 16) * t).toString(16).padStart(2, "0")).join("");
  const sorteo = (id, sal) => [...(id + sal)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  /* «fijo» es lo que la persona eligió en Vos: {sexo, piel, pelo, colorPelo}; lo que no eligió sale al azar */
  let fijo = {};
  function persona(id, fam = "fu", f = fijo){
    const r = (sal, n) => sorteo(id, sal) % n, sexo = f.sexo || (r("sexo", 2) ? "mujer" : "hombre");
    const piel = f.piel || TONOS[r("piel", TONOS.length)], pelo = f.pelo && ESTILOS[sexo].includes(f.pelo) ? f.pelo : ESTILOS[sexo][r("pelo", ESTILOS[sexo].length)];
    const tops = TOPS.filter(c => !(CHOCA[fam] || []).includes(c)), arriba = tops[r("top", tops.length)], abajo = BOTS[r("bot", BOTS.length)], z = ZAPAS[r("zapa", ZAPAS.length)];
    return {sexo, piel, pielS: oscuro(piel, .84), pelo, colorPelo: f.colorPelo || PELOS[r("color", PELOS.length)], barba: sexo === "hombre" && r("barba", 3) === 0,
      arribaTipo: ARRIBA[sexo][r("arriba", 4)], arriba, arribaF: oscuro(arriba, .8), abajoTipo: ABAJO[sexo][r("abajo", 4)], abajo, abajoF: oscuro(abajo, .75),
      zapa: z[0], zapaF: z[1], suela: "#ffffff", suelaF: "#e4e2dc", mat: MATS[r("mat", MATS.length)]};
  }

  /* el fondo no cambia en todo el movimiento: el disco del color de la familia detrás del cuerpo y lo que está atrás.
     En la miniatura, la colchoneta cruza el círculo como una franja más honda */
  let nClip = 0;
  function fondo(f, e, chica, apoya, mat = ""){
    const [x0, , w] = e.vb, [cx, cy, r] = e.disco || [];
    const banda = chica && apoya ? `<rect x="${n1(x0 - 10)}" y="${PISO - 1}" width="${n1(w + 20)}" height="${n1(w)}" class="fig-banda"/>` : "";
    /* si el disco cruza el piso, el piso lo corta: la colchoneta apoya sobre ese borde */
    const disco = !e.disco ? "" : cy + r <= PISO + 3 ? `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" class="fig-disco"/>`
      : `<path d="M${n1(cx - Math.sqrt(r * r - (PISO + 3 - cy) ** 2))} ${PISO + 3}A${n1(r)} ${n1(r)} 0 ${cy < PISO + 3 ? 1 : 0} 1 ${n1(cx + Math.sqrt(r * r - (PISO + 3 - cy) ** 2))} ${PISO + 3}Z" class="fig-disco"/>`;
    /* lo que está atrás (pared, barra, banco) queda adentro del disco, como en un afiche */
    if (!e.disco) return disco + banda + mat + elemento(f, chica, e.disco);
    const id = "fd" + (++nClip);
    return disco + `<clipPath id="${id}">${disco.replace(' class="fig-disco"', "")}</clipPath>${mat}<g clip-path="url(#${id})">${elemento(f, chica, e.disco)}</g>`;
  }
  /* lo que se mueve: el cuerpo y lo que tiene en las manos */
  /* colgado de la barra no hay colchoneta, aunque los pies queden cerca del piso */
  const frente = (f, P, pe, sw = 0, u) => { const J = ubicar(f, P); return lastre(f, J) + cuerpo(J, pe, sw) + enMano(f, J, u); };
  const piso = (f, poses, pe) => f.con === "barra" ? "" : colchoneta(poses.map(P => ubicar(f, P)), pe.mat);
  /* el lastre cuelga del cinturón por detrás de las piernas, siempre hacia abajo */
  const lastre = (f, J) => !f.lastre ? "" : `<g class="fig-el"><line x1="${n1(J.hip[0] - 3)}" y1="${n1(J.hip[1] + 2)}" x2="${n1(J.hip[0] - 3)}" y2="${n1(J.hip[1] + 20)}" class="cadena"/><circle cx="${n1(J.hip[0] - 3)}" cy="${n1(J.hip[1] + 29)}" r="10" class="hierro"/></g>`;
  const apoya = (f, P) => { const J = ubicar(f, P); return f.con !== "barra" && ["fN", "fF", "tN", "tF", "hN", "hF", "kN", "kF", "hip", "sh", "hd"].some(k => J[k][1] > PISO - 14); };

  /* el encuadre: lo que ocupa el cuerpo en todo el movimiento, más el disco y el aparato; así la figura se ve grande y no salta */
  const puntos = J => ["hip", "sh", "hd", "eN", "hN", "eF", "hF", "kN", "fN", "tN", "kF", "fF", "tF"].map(k => J[k]);
  function encuadre(f, poses, chica){
    const p = poses.flatMap(P => puntos(ubicar(f, P))), xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    const bx0 = Math.min(...xs) - 10, bx1 = Math.max(...xs) + 10, by0 = Math.min(...ys) - 12, by1 = Math.max(...ys) + 8;
    const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2;
    /* la miniatura: el cuerpo llena el círculo, sin el resto de la escena */
    if (chica){ const bw = bx1 - bx0, bh = by1 - by0, z = Math.max(bw, bh) * 1.22, y1 = Math.min(by1, PISO + 6); return {vb: [cx - z / 2, by1 > PISO - 20 ? Math.min(by0 - z * .04, y1 + z * .3 - z) : cy - z / 2, z, z]}; }
    /* acostado, el disco no crece con todo el largo del cuerpo: los pies y la cabeza pueden asomar, y la figura se ve más grande */
    const r = Math.max((bx1 - bx0) * .4, (by1 - by0) / 2) + 12;
    /* si el cuerpo no llega al piso (colgado de la barra) el piso queda fuera del cuadro y la figura se ve más grande */
    const suelo = by1 > PISO - 40 || f.con === "bici" || f.banco || f.silla || f.pared !== undefined || f.poste !== undefined;
    let x0 = Math.min(bx0, cx - r) - 6, x1 = Math.max(bx1, cx + r) + 6, y0 = Math.min(by0, cy - r) - 6, y1 = suelo ? PISO + 6 : Math.min(PISO + 6, Math.max(by1, cy + r) + 6);
    if (f.con === "barra" || f.con === "paralelas") y0 = Math.min(y0, f.en[1] - 14);
    if (f.con === "bici"){ x0 = Math.min(x0, f.en[0] - 70); x1 = Math.max(x1, f.en[0] + 106); }
    /* la silla y el banco entran enteros */
    if (f.silla){ x0 = Math.min(x0, f.silla[0] - 28); x1 = Math.max(x1, f.silla[0] + 28); y0 = Math.min(y0, f.silla[1] - 56); }
    if (f.banco){ x0 = Math.min(x0, f.banco[0] - 34); x1 = Math.max(x1, f.banco[0] + 34); }
    let w = x1 - x0; const h = y1 - y0;
    if (w < h * .86){ x0 -= (h * .86 - w) / 2; w = h * .86; }
    return {vb: [x0, y0, w, h], disco: [cx, cy, r]};
  }
  const caja = (cls, fam, vb, cuerpo, attr = "") => `<svg class="fig ${cls}" viewBox="${vb.map(n1).join(" ")}" style="--c:var(--${fam});--cd:var(--${fam}-disco)" aria-hidden="true"${attr}>${cuerpo}</svg>`;
  /* la pose que más dice: «muestra» es una de las poses, o un momento del movimiento si no es entero */
  const pMuestra = f => Number.isInteger(f.muestra ?? 0) ? (f.ciclo ? f.k[f.muestra ?? 0] : f.k[f.muestra ?? f.k.length - 1]) : en(f, f.muestra);
  /* grande: en la serie se mueve a su ritmo (o queda quieta si el sistema pide menos movimiento); con «u», un momento quieto del movimiento */
  const grande = (id, fam, u, pe) => { const f = K.POSES[id]; if (!f) return "";
    const vive = !!f.ritmo && u === undefined && !K.reduce(), todas = muestras(f).map(x => en(f, x)), e = encuadre(f, todas);
    const P = u !== undefined ? en(f, u) : vive ? en(f, fase(f, t)) : pMuestra(f), q = pe || persona(id, fam);
    return caja("grande", fam, e.vb, `<g>${fondo(f, e, false, true, piso(f, todas, q))}</g><g>${frente(f, P, q, 0, u ?? (vive ? fase(f, t) : undefined))}</g>`, vive ? ` data-fig="${id}" data-fam="${fam}"` : ""); };
  /* chica: una sola pose, la que más dice, recortada al cuerpo en un círculo */
  const chica = (id, fam, pe) => { const f = K.POSES[id]; if (!f) return ""; const P = pMuestra(f), e = encuadre(f, [P], true);
    const q = pe || persona(id, fam);
    return `<span class="fig-chica" style="--cd:var(--${fam}-disco)">${caja("chica", fam, e.vb, fondo(f, e, true, apoya(f, P), piso(f, [P], q)) + frente(f, P, q))}</span>`; };

  /* el ritmo: [ida, quieto, vuelta, quieto] en segundos; en un ciclo, [segundos por vuelta] */
  const fase = (f, t) => {
    if (f.ciclo) return t / f.ritmo[0];
    const [a, b, c, d] = f.ritmo, T = a + b + c + d; t %= T;
    const e = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
    return t < a ? e(t / a) : t < a + b ? 1 : t < a + b + c ? 1 - e((t - a - b) / c) : 0;
  };
  /* un solo reloj para todas las figuras que se mueven, a 30 cuadros: se despierta solo cuando dibuja.
     Corre solo mientras la sesión corre: en pausa (o si el sistema pasa a pedir menos movimiento) la figura queda donde está.
     Se apaga cuando no queda ninguna */
  /* el pelo que cuelga se hamaca con lo que se mueve la cabeza */
  let corriendo = false, t = 0, antes = 0;
  const frena = () => K.reduce() || !!K.sesion?.enPausa?.() || document.hidden;
  function cuadro(){
    const vivas = document.querySelectorAll("svg.fig[data-fig]"), ahora = performance.now();
    if (!vivas.length){ corriendo = false; return; }
    if (!frena()){ t += Math.min(ahora - antes, 100) / 1000;
      vivas.forEach(el => { const id = el.dataset.fig, f = K.POSES[id], P = en(f, fase(f, t)), hx = ubicar(f, P).hd[0];
        const pe = el._pe || (el._pe = persona(id, el.dataset.fam)), dv = el._hx === undefined ? 0 : hx - el._hx; el._hx = hx;
        el._sw = (el._sw || 0) * .8 + Math.max(-1, Math.min(1, -dv * .2)) * .2;
        el.lastChild.innerHTML = frente(f, P, pe, el._sw, fase(f, t)); }); }
    antes = ahora;
    setTimeout(cuadro, 33);
  }
  const animar = () => { if (corriendo || K.reduce() || !document.querySelector("svg.fig[data-fig]")) return; corriendo = true; antes = performance.now(); setTimeout(cuadro, 33); };

  /* ===== la revisión de cada pose: lo que la prueba mira antes de dejarla entrar ===== */
  const VOL = {hip: 8, sh: 7, hd: 10, eN: 4, eF: 4, hN: 3, hF: 3, kN: 5, kF: 5, fN: 3, fF: 3};
  function revisar(id){
    const f = K.POSES[id], mal = [];
    if (!f.k || f.k.length < 2) return ["le faltan poses"];
    for (const u of muestras(f).concat(f.ciclo ? [] : [.1, .9])){
      const P = en(f, u), J = ubicar(f, P);
      for (const [k, x] of Object.entries(rels(P))){ const r = lim(k, f); if (x < r[0] - .5 || x > r[1] + .5) mal.push(`${k} ${Math.round(x)}° en ${u}`); }
      /* nada atraviesa el piso: cada articulación con el volumen que la rodea (el tobillo va 5 px arriba, la cadera 8) */
      for (const [k, m] of Object.entries(VOL)) if (J[k][1] > PISO - m) mal.push(`${k} bajo el piso en ${u}`);
    }
    if (f.ritmo && !(f.ciclo ? f.ritmo.length === 1 : f.ritmo.length === 4)) mal.push("ritmo mal armado");
    return [...new Set(mal)];
  }
  /* lo que comparten los archivos de poses: el sostenido, el parado y el cuatro patas */
  const quieto = p => [p, p];
  const PARADO = {torso: 180, head: 180, armN: [4, 6], armF: [358, 2], legN: [0, 0], legF: [2, 2]};
  const CUATRO = {torso: 102, head: 100, armN: [0, 0], armF: [2, 2], legN: [0, 270], legF: [2, 270], pies: [-90, -90]};
  return {grande, chica, animar, revisar, persona, fijar: x => { fijo = x || {}; }, quieto, PARADO, CUATRO, PISO, TOBILLO: PISO - 5, ESTILOS, TONOS, PELOS};
})();
