/* ===== Figura: la persona que muestra cada ejercicio. Un cuerpo (de perfil, salvo los que se entienden mejor de frente o desde arriba), sus poses y el ritmo entre ellas.
   Ángulos absolutos por segmento: 0 abajo, 90 adelante, 180 arriba, 270 atrás. Lo cercano adelante; lo lejano, en sombra.
   Las poses viven en src/poses/: K.POSES[id] = {fijo, en, con, k: [inicio, final], ritmo, muestra, ciclo}; las que cambian de vista las arma tools/vistas.mjs.
   «en» es siempre la altura real (el piso está en PISO), también cuando la cámara mira desde arriba. ===== */
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
  /* ===== el esqueleto en 3D. x adelante, y abajo, z hacia el lado cercano (N). Los ángulos de siempre viven en el plano del perfil;
     lo nuevo (opcional) los saca de ese plano:
     abd: {armN, armF, legN, legF}  abducción en el plano frontal (0 = pegado al cuerpo, 90 = en cruz); número o [segmento de arriba, de abajo]
     gira: {...}                    giro hacia afuera alrededor del eje del tronco (rodillas afuera, codos abiertos); número o par
     inclina                        el tronco se inclina de costado (positivo hacia el lado cercano); brazos y cabeza lo acompañan
     rueda                          todo el cuerpo rueda alrededor del eje x (positivo: lo de abajo va hacia el lado cercano)
     vista (en la pose o el ejercicio) giro de la cámara: 0 perfil, ~35 tres cuartos, 90 frente; alzada: la cámara mira desde arriba (90 cenital) ===== */
  const RD = Math.PI / 180;
  const V3 = (a, l = 1) => [Math.sin(a * RD) * l, Math.cos(a * RD) * l, 0];
  const add3 = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]], mul3 = (p, k) => [p[0] * k, p[1] * k, p[2] * k], dot3 = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const rot = (p, k, ang) => { if (!ang) return p; const c = Math.cos(ang * RD), s = Math.sin(ang * RD), kv = cross(k, p), kd = dot3(k, p) * (1 - c);
    return [p[0] * c + kv[0] * s + k[0] * kd, p[1] * c + kv[1] * s + k[1] * kd, p[2] * c + kv[2] * s + k[2] * kd]; };
  /* medio ancho de hombros y de caderas (de articulación a articulación) */
  const ANCHO = {hombre: {hom: 17.5, cad: 8.6}, mujer: {hom: 15, cad: 9.4}, medio: {hom: 16.2, cad: 9}};
  const seg = (x, i) => Array.isArray(x) ? x[i] : (x || 0);
  /* de perfil y sin nada nuevo: el camino de siempre, en 2D (es el más usado y el más barato) */
  function joints2(P, raiz, W){
    const hip = raiz ? [raiz[0], raiz[1]] : [0, 0], sh = sum(hip, v(P.torso, L.torso)), nk = sum(sh, v(P.head, L.neck)), hd = sum(nk, v(P.head, L.head * .8));
    const brazo = a => { const e = sum(sh, v(a[0], L.up)); return [e, sum(e, v(a[1], L.fo))]; };
    const pierna = (a, p) => { const k = sum(hip, v(a[0], L.th)), f = sum(k, v(a[1], L.sh)); return [k, f, sum(f, v(a[1] + 90 + p, L.foot))]; };
    const [eN, hN] = brazo(P.armN), [eF, hF] = brazo(P.armF), [kN, fN, tN] = pierna(P.legN, P.pies?.[0] || 0), [kF, fF, tF] = pierna(P.legF, P.pies?.[1] || 0);
    const h = W.hom, c = W.cad;
    return {hip, sh, nk, hd, eN, hN, eF, hF, kN, fN, tN, kF, fF, tF, sN: sh, sF: sh, pN: hip, pF: hip, P, vis: 0, alz: 0, plano: true,
      z: {hip: 0, sh: 0, nk: 0, hd: 0, sN: h, eN: h, hN: h, sF: -h, eF: -h, hF: -h, pN: c, kN: c, fN: c, tN: c, pF: -c, kF: -c, fF: -c, tF: -c}};
  }
  function joints(P, raiz, f, pe){
    const vis = P.vista ?? f?.vista ?? 0, alz = P.alzada ?? f?.alzada ?? 0, W = ANCHO[pe?.sexo] || ANCHO.medio;
    const plano = !vis && !alz && !P.abd && !P.gira && !P.inclina && !P.rueda;
    if (plano) return joints2(P, raiz, W);
    const t0 = V3(P.torso), c0 = V3(P.torso - 90), l0 = [0, 0, 1], inc = P.inclina || 0, U = p => inc ? rot(p, c0, -inc) : p;
    /* un miembro: el ángulo de perfil, girado hacia afuera y abierto hacia su lado */
    const lim = (vec, s, g, a) => { let d = vec; if (g) d = rot(d, t0, s * g); if (a) d = rot(d, c0, s * a); return d; };
    const hip = raiz || [0, 0, 0], sh = add3(hip, U(V3(P.torso, L.torso))), nk = add3(sh, U(V3(P.head, L.neck))), hd = add3(nk, U(V3(P.head, L.head * .8)));
    const lat = U(l0), J3 = {hip, sh, nk, hd}, D = {};
    const brazo = (k, s) => { const a = P[k], g = P.gira?.[k], b = P.abd?.[k], g0 = seg(g, 0), g1 = seg(g, 1), b0 = seg(b, 0), b1 = seg(b, 1), x = k.slice(-1);
      const sj = add3(sh, mul3(lat, s * W.hom)), d0 = U(lim(V3(a[0]), s, g0, b0)), d1 = U(lim(V3(a[1]), s, g1, b1)), e = add3(sj, mul3(d0, L.up));
      J3["s" + x] = sj; J3["e" + x] = e; J3["h" + x] = add3(e, mul3(d1, L.fo));
      D["bu" + x] = U(lim(V3(a[0] - 90), s, g0, b0)); D["bf" + x] = U(lim(V3(a[1] - 90), s, g1, b1)); D["fo" + x] = d1; };
    const pierna = (k, s, p) => { const a = P[k], g = P.gira?.[k], b = P.abd?.[k], g0 = seg(g, 0), g1 = seg(g, 1), b0 = seg(b, 0), b1 = seg(b, 1), x = k.slice(-1);
      const hj = add3(hip, mul3(l0, s * W.cad)), kn = add3(hj, plano ? V3(a[0], L.th) : mul3(lim(V3(a[0]), s, g0, b0), L.th)), fo = add3(kn, plano ? V3(a[1], L.sh) : mul3(lim(V3(a[1]), s, g1, b1), L.sh));
      J3["p" + x] = hj; J3["k" + x] = kn; J3["f" + x] = fo; J3["t" + x] = add3(fo, plano ? V3(a[1] + 90 + p, L.foot) : mul3(lim(V3(a[1] + 90 + p), s, g1, b1), L.foot));
      D["bt" + x] = lim(V3(a[0] - 90), s, g0, b0); D["bs" + x] = lim(V3(a[1] - 90), s, g1, b1);
      D["zw" + x] = lim(V3(a[1] + 90 + p), s, g1, b1); D["zd" + x] = lim(V3(a[1] + p), s, g1, b1); D["zl" + x] = lim(l0, s, g1, b1); };
    brazo("armN", 1); brazo("armF", -1); pierna("legN", 1, P.pies?.[0] || 0); pierna("legF", -1, P.pies?.[1] || 0);
    Object.assign(D, {tt: U(t0), tc: U(c0), tl: lat, hu: U(V3(P.head)), hf: U(V3(P.head - 90)), hl: lat, pt: t0, pc: c0, pl: l0});
    /* todo el cuerpo rueda alrededor del eje x, sobre la cadera */
    if (P.rueda){ const X = [1, 0, 0]; for (const k in J3) J3[k] = add3(hip, rot(add3(J3[k], mul3(hip, -1)), X, P.rueda)); for (const k in D) D[k] = rot(D[k], X, P.rueda); }
    /* la cámara: ortográfica, gira alrededor del eje vertical y después se alza */
    const cv = Math.cos(vis * RD), sv = Math.sin(vis * RD), ca = Math.cos(alz * RD), sa = Math.sin(alz * RD);
    const pr = p => { const x = p[0] * cv - p[2] * sv; if (!alz) return [x, p[1]]; const d = p[2] * cv + p[0] * sv; return [x, p[1] * ca + d * sa]; };
    const dp = p => { const d = p[2] * cv + p[0] * sv; return alz ? d * ca - p[1] * sa : d; };
    const J = {P, vis, alz, plano, z: {}, d: {}, d3: D, w: J3, pr, dp};
    for (const k in J3){ J[k] = pr(J3[k]); J.z[k] = dp(J3[k]); }
    for (const k in D) J.d[k] = pr(D[k]);
    return J;
  }
  /* el punto que no se mueve (la mano en la barra, el pie en el piso) queda clavado en «en» */
  /* «alto» levanta todo el cuerpo (un salto): el punto fijo deja de tocar mientras está en el aire */
  /* «pisa» (en el ejercicio): el tobillo más bajo queda en el piso; sirve cuando los pies se abren de costado (saltos de tijera) */
  /* la altura real de una articulación (lo que mira el piso), aunque la cámara mire desde arriba */
  const alto = (J, k) => J.plano ? J[k][1] : J.w[k][1] + (J.oy || 0);
  const ubicar = (f, P, pe) => { const J = joints(P, null, f, pe), al = P.alto || 0;
    const oy = f.pisa ? PISO - 5 - Math.max(alto(J, "fN"), alto(J, "fF")) - al : f.en[1] - alto(J, f.fijo) - al, dx = f.en[0] - J[f.fijo][0];
    if (!J.vis && !J.alz) return joints(P, [dx, oy, 0], f, pe);
    /* con la cámara girada, se corre lo proyectado: el punto fijo cae en «en» (desde arriba, la altura pasa a ser profundidad) */
    const dy = J.alz ? (f.pisa ? 0 : f.en[1] - J[f.fijo][1]) - al * Math.cos(J.alz * RD) : oy;
    for (const k of Object.keys(J)) if (Array.isArray(J[k]) && J[k].length === 2 && typeof J[k][0] === "number") J[k] = [J[k][0] + dx, J[k][1] + dy];
    J.oy = oy; J.dx = dx; J.dy = dy; J.fijo = f.fijo; J.en0 = f.en[0];
    return J; };
  const lerpA = (a, b, t) => a + nrm(b - a) * t;
  /* lo opcional de una pose: el giro de los pies, la altura del salto y lo que la saca del perfil */
  const NADA = {pies: [0, 0], alto: 0, rueda: 0, inclina: 0};
  const mObj = (a = {}, b = {}, t) => Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map(k => { const x = a[k] ?? 0, y = b[k] ?? 0;
    return [k, Array.isArray(x) || Array.isArray(y) ? [0, 1].map(i => lerpA(seg(x, i), seg(y, i), t)) : lerpA(x, y, t)]; }));
  const mezclar = (A, B, t) => Object.fromEntries([...new Set([...Object.keys(A), ...Object.keys(B)])].map(k => {
    if (k === "abd" || k === "gira") return [k, mObj(A[k], B[k], t)];
    const a = A[k] ?? NADA[k] ?? B[k], b = B[k] ?? NADA[k] ?? a;
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
  function miembro(a, b, prof, c, t0 = 0, t1 = 1, cap = .9){
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ux = dx / d, uy = dy / d;
    const r = t => { for (let i = 1; i < prof.length; i++) if (t <= prof[i][0]){ const [ta, pa, qa] = prof[i - 1], [tb, pb, qb] = prof[i], k = (t - ta) / (tb - ta || 1); return [pa + (pb - pa) * k, qa + (qb - qa) * k]; } return prof[prof.length - 1].slice(1); };
    const ts = [t0, ...prof.map(q => q[0]).filter(t => t > t0 && t < t1), t1], P = [];
    if (t0 === 0){ const e = r(0)[0] * cap; P.push([a[0] - ux * e, a[1] - uy * e]); }
    ts.forEach(t => { const [rp] = r(t); P.push([a[0] + dx * t + nx * rp, a[1] + dy * t + ny * rp]); });
    if (t1 === 1){ const e = r(1)[0] * .9; P.push([b[0] + ux * e, b[1] + uy * e]); }
    [...ts].reverse().forEach(t => { const [, rn] = r(t); P.push([a[0] + dx * t - nx * rn, a[1] + dy * t - ny * rn]); });
    return path(suave(P), c);
  }
  /* un mechón que cuelga: sale de la raíz hacia atrás y la gravedad lo baja; «sw» lo hamaca */
  function cuelga(raiz, atras, largo, w0, w1, c, sw, alz){
    /* si el piso no lo deja caer, el pelo se acuesta sobre el piso hacia atrás */
    const m = [raiz[0] + atras[0] * largo * .35, raiz[1] + atras[1] * largo * .35], cae = m[1] + largo * .75, sobra = Math.max(cae - (PISO - 3), 0);
    /* con la cámara alzada la caída se ve más corta; visto desde arriba no cae: queda acostado hacia atrás */
    const ca = alz ? Math.cos(alz * RD) : 1;
    const g = alz ? [m[0] + atras[0] * largo * .6 * (1 - ca) + sw * largo * .5 * ca, m[1] + atras[1] * largo * .6 * (1 - ca) + largo * .75 * ca] : [m[0] + sw * largo * .5 + (atras[0] < 0 ? -1 : 1) * sobra * .9, Math.min(cae, PISO - 3)];
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
  /* de frente: medio ancho del tronco a cada altura (cadera, cintura, pecho, hombros, la bajada al cuello) */
  const ANCHOT = {
    hombre: [[-.08, 16.6], [.05, 16.4], [.2, 14.8], [.42, 13.4], [.62, 14.2], [.8, 16.4], [.93, 18.8], [1, 19.4], [1.04, 17.2], [1.07, 9.4]],
    mujer: [[-.08, 17.8], [.05, 17.8], [.2, 15.8], [.42, 11.8], [.6, 12.4], [.78, 13.8], [.93, 15.8], [1, 16.6], [1.04, 14.6], [1.07, 8]]
  };
  const dot2 = (p, q) => p[0] * q[0] + p[1] * q[1];
  /* un tramo del tronco, de t0 a t1 */
  function tronco(J, T, t0, t1, c, sexo){
    const H = J.hip, S = J.sh, dx = S[0] - H[0], dy = S[1] - H[1], d = Math.hypot(dx, dy) || 1, fx = -dy / d, fy = dx / d;
    const w = (t, x) => [H[0] + dx * t + fx * x, H[1] + dy * t + fy * x];
    const A = ANCHOT[sexo], n = [fx, fy], cn = J.plano ? 1 : dot2(J.d.tc, n), ln = J.plano ? 0 : dot2(J.d.tl, n);
    if (Math.abs(ln) < 1e-9 && Math.abs(cn - 1) < 1e-9){
      const cl = t => Math.min(Math.max(t, T.ad[0][0]), T.ad[T.ad.length - 1][0]);
      const a0 = cl(t0), a1 = Math.min(t1, T.ad[T.ad.length - 1][0]), b1 = Math.min(t1, T.at[T.at.length - 1][0]);
      const ad = [a0, ...T.ad.map(q => q[0]).filter(t => t > a0 && t < a1), a1].map(t => w(t, interp(T.ad, t)));
      const at = [a0, ...T.at.map(q => q[0]).filter(t => t > a0 && t < b1), b1].map(t => w(t, -interp(T.at, t))).reverse();
      const top = t1 >= 1.04 ? [w(1.1, 0)] : [], bot = t0 <= -.08 ? [w(-.12, 0)] : [];
      return path(suave([...bot, ...ad, ...top, ...at]), c);
    }
    /* con la cámara girada: cada altura es un corte (pecho adelante, espalda atrás, ancho al costado); se ve lo que sobresale a cada lado */
    const lado = (t, sg) => { const k = cn * sg, ad = interp(T.ad, t), at = interp(T.at, t), wd = interp(A, t); return Math.hypot((k >= 0 ? ad : at) * cn, wd * ln); };
    const a0 = Math.max(t0, -.08), a1 = Math.min(t1, 1.06);
    const ts = [...new Set([a0, ...[...T.ad, ...T.at, ...A].map(q => q[0]).filter(t => t > a0 && t < a1), a1])].sort((p, q) => p - q);
    const top = t1 >= 1.04 ? [w(1.1, 0)] : [], bot = t0 <= -.08 ? [w(-.12, 0)] : [];
    return path(suave([...bot, ...ts.map(t => w(t, lado(t, 1))), ...top, ...[...ts].reverse().map(t => w(t, -lado(t, -1)))]), c);
  }
  /* un miembro visto desde cualquier lado: «atras» es el lado de atrás del miembro, proyectado; si mira de costado, los dos radios se parecen */
  /* «cap»: cuánto asoma el redondeo del arranque; de frente, el hombro y la cadera no deben abultar */
  function miembro3(a, b, atras, prof, c, t0, t1, latF = .9, cap = .9){
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = (-dy / d) * atras[0] + (dx / d) * atras[1];
    if (Math.abs(w - 1) < 1e-9) return miembro(a, b, prof, c, t0, t1, cap);
    const pr = prof.map(([t, rb, rf]) => { const lat = (rb + rf) / 2 * latF;
      return [t, w >= 0 ? lat + (rb - lat) * w : lat + (rf - lat) * -w, w >= 0 ? lat + (rf - lat) * w : lat + (rb - lat) * -w]; });
    return miembro(a, b, pr, c, t0, t1, cap);
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
  /* de frente, punto por punto con el perfil (lo de adelante del perfil pasa al costado derecho; la nuca, al izquierdo): así el giro es parejo.
     Donde el frente necesita más puntos, el perfil suma un punto en el medio de un tramo (no cambia su forma) */
  const medio = (p, i) => [...p.slice(0, i + 1), [(p[i][0] + p[(i + 1) % p.length][0]) / 2, (p[i][1] + p[(i + 1) % p.length][1]) / 2], ...p.slice(i + 1)];
  const FRENTE = {
    cabeza: [CABEZA, [[8.6, 2.2], [8.5, -1.6], [8.1, -4.4], [7.1, -7], [5, -9.8], [2.2, -11.6], [-2.2, -11.6], [-5, -9.8], [-8.1, -4.4], [-8.6, 2.2], [-7.8, 8], [-3.6, 11.2], [3.6, 11.2], [7.8, 8], [8.7, 5]]],
    corto: [PELO.corto, [[9.6, -.8], [10.4, 5.8], [8.6, 10.8], [4, 13.6], [-1.8, 14.2], [-7, 12.4], [-10.2, 8], [-10.6, 3], [-9.6, -.8], [-8.6, -1], [-8.2, 2.4], [-6.8, 6.2], [-1, 7.4], [5, 7], [8.2, 3.4]]],
    rapado: [PELO.rapado, [[9.2, 1.4], [9.6, 6.4], [7.4, 10.6], [2, 12.4], [-4, 12], [-8.4, 9], [-9.6, 3.6], [-9.2, 1.2], [-8.4, 1.6], [-7, 5.6], [-1.6, 7.6], [6.4, 6.6]]],
    recogido: [PELO.recogido, [[9.4, 2.4], [10, 7], [6.8, 11.8], [0, 13.4], [-6.4, 12.2], [-9.6, 8], [-10, 3], [-9.4, 1.2], [-8.6, 2.4], [-6.4, 6.6], [-.4, 7.8], [6.4, 6.8]]],
    melena: [medio(medio(PELO.melena, 12), 13), [[10.8, -7.4], [11.6, 2], [8.8, 10.6], [1, 14], [-7, 12.4], [-11, 6], [-11.8, -1.6], [-10.8, -7.4], [-8, -6.8], [-8.8, -.6], [-7.4, 5.4], [-1, 7.2], [5, 6.8], [8.2, 3.8], [8.4, -6]]],
    barba: [medio(PELO.barba, 9), [[-9, 1], [-8.4, -4.6], [-5.6, -9.8], [0, -12.6], [5.6, -9.8], [8.4, -4.6], [9, 1], [7.4, .8], [6.2, -5.4], [0, -8.6], [-6.2, -5.4], [-7.4, .8]]]
  };
  const AFRO = [[[7, 11], [9.6, 10]], [[2.6, 15], [4, 14.6]], [[-3.4, 16], [-2, 15.8]], [[-9, 13.6], [-8, 13]], [[-12.6, 8.6], [-11.6, 7.6]], [[-14, 2.6], [-12.6, 1.6]], [[-13, -3], [-11.8, -3]], [null, [12.2, 5]], [null, [12.6, 0]], [null, [11.8, -3.4]]];
  const RULOS = [[[8, 9], [9, 8.6]], [[4, 12.2], [5, 12]], [[-1, 13.4], [0, 13.4]], [[-6, 12.4], [-5, 12.4]], [[-10, 9], [-9, 9]], [[-12, 4], [-10.6, 4]], [[-12, -1.4], [-10.6, -.4]], [[-10.4, -4.4], [-9.6, -2.4]], [null, [10.6, 4]], [null, [10.6, -.4]]];
  const mezcla = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
  const mixHex = (a, b, t) => "#" + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, "0")).join("");
  function cabeza(J, pe, sw){
    if (J.plano) return cabezaPerfil(J, pe, sw);
    /* la cabeza mira hacia «hf»: s es cuánto de frente se ve (0 perfil, 1 frente) */
    const hd = J.hd, ul = Math.hypot(...J.d.hu) || 1, u = [J.d.hu[0] / ul, J.d.hu[1] / ul], pp = [-u[1], u[0]], ref = [J.d.hf[0] - J.d.hl[0], J.d.hf[1] - J.d.hl[1]];
    const r = dot2(pp, ref) >= 0 ? pp : [-pp[0], -pp[1]], s = Math.min(Math.max(J.dp(J.d3.hf), 0), 1);
    const loc = ([x, y]) => [hd[0] + (r[0] * x + u[0] * y) * HS, hd[1] + (r[1] * x + u[1] * y) * HS];
    /* de espaldas: sin cara; se ve la nuca con el pelo */
    if (-J.dp(J.d3.hf) > .35) return nuca(J, pe, sw, loc, r, u);
    const forma = k => s < .001 ? (k === "cabeza" ? CABEZA : PELO[k]) : FRENTE[k][0].map((p, i) => mezcla(p, FRENTE[k][1][i], s));
    const poli = (p, c) => path(suave(p.map(loc)), c), circ = (x, y, rr, c) => { const p = loc([x, y]); return `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${n1(rr * HS)}" fill="${c}"/>`; };
    const rulos = (L, rr, c) => L.map(([p, q]) => p ? circ(...mezcla(p, q, s), rr, c) : s > .05 ? circ(...q, rr * s, c) : "").join("");
    const P = PERF[pe.sexo], h = pe.pelo, hc = pe.colorPelo;
    /* lo que cuelga atrás: hacia la nuca; de frente cae detrás, apenas corrido a un costado */
    const atras = [-J.d.hf[0] * 1 - r[0] * .55 * s, -J.d.hf[1] - r[1] * .55 * s];
    let detras = "", o = "";
    if (h === "colita") detras = cuelga(loc(mezcla([-10.4, 6.4], [-5, 9.4], s)), atras, 21, 3.4, 1.6, hc, sw, J.alz);
    if (h === "largo"){ detras = cuelga(loc(mezcla([-8, 2], [-8.4, 2.6], s)), atras, 30, 7.4, 3.4, hc, sw * .6, J.alz);
      if (s > .05) detras += cuelga(loc([8.4 * s, 2.6]), [-J.d.hf[0] + r[0] * .55 * s, -J.d.hf[1] + r[1] * .55 * s], 30, 7.4 * Math.min(s * 1.5, 1), 3.4, hc, sw * .6, J.alz); }
    o += miembro3(J.sh, J.nk, J.d.hf, [[0, P.cuello, P.cuello], [1, P.cuello * .9, P.cuello * .9]], pe.piel, 0, 1, 1.25);
    /* la oreja lejana asoma por detrás de la cara cuando se gira */
    if (s > .05 && !["largo", "melena", "afro"].includes(h)) o += circ(9.2, -1.4, 2.1 * Math.min(s * 2, 1), pe.pielS);
    o += poli(forma("cabeza"), pe.piel);
    if (h === "afro") o += poli(forma("corto"), hc) + rulos(AFRO, 5.4, hc);
    else if (h === "rulos") o += poli(forma("corto"), hc) + rulos(RULOS, 3.8, hc);
    else if (h === "pelado") o += poli(forma("rapado"), hc).replace("/>", ' opacity=".18"/>');
    else if (h === "colita" || h === "rodete" || h === "largo") o += poli(forma("recogido"), hc) + (h === "rodete" ? circ(...mezcla([-8.4, 10.6], [0, 15.2], s), 5.4 - .6 * s, hc) : "");
    else if (h === "melena") o += poli(forma("melena"), hc);
    else o += poli(forma(PELO[h] ? h : "corto"), hc);
    if (pe.barba) o += poli(forma("barba"), hc);
    if (!["largo", "melena", "afro"].includes(h)) o += circ(...mezcla([-1.6, -.4], [-9.2, -1.4], s), 2.1, s > .001 ? mixHex(pe.pielS, pe.piel, s * .5) : pe.pielS);
    return {detras, o};
  }
  /* la cabeza de espaldas: el contorno de frente, el pelo tapa casi todo (la nuca queda abajo) y asoman las dos orejas */
  const NUCA = {
    corto: [[9.6, -1.6], [10.4, 4], [8.6, 9.8], [4, 13.4], [-4, 13.4], [-8.6, 9.8], [-10.4, 4], [-9.6, -1.6], [-6.4, -6], [0, -7.4], [6.4, -6]],
    rapado: [[8.8, -.6], [9.4, 4.4], [7.6, 9.6], [3, 12.2], [-3, 12.2], [-7.6, 9.6], [-9.4, 4.4], [-8.8, -.6], [-6, -4.6], [0, -5.8], [6, -4.6]],
    melena: [[11.6, -8], [11.8, 2.6], [8.8, 10.8], [3, 14], [-3, 14], [-8.8, 10.8], [-11.8, 2.6], [-11.6, -8], [-6, -9.6], [0, -10], [6, -9.6]]
  };
  function nuca(J, pe, sw, loc, r, u){
    const P = PERF[pe.sexo], h = pe.pelo, hc = pe.colorPelo, poli = (p, c) => path(suave(p.map(loc)), c);
    const circ = (x, y, rr, c) => { const p = loc([x, y]); return `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${n1(rr * HS)}" fill="${c}"/>`; };
    /* lo que cuelga cae por la espalda, del lado de la cámara: va adelante */
    const abajo = [-u[0], -u[1]];
    let o = miembro(J.sh, J.nk, [[0, P.cuello * 1.25, P.cuello * 1.25], [1, P.cuello * 1.1, P.cuello * 1.1]], pe.piel);
    if (!["largo", "melena", "afro"].includes(h)) o += circ(9.2, -1.4, 2.1, pe.pielS) + circ(-9.2, -1.4, 2.1, pe.pielS);
    o += poli(FRENTE.cabeza[1], pe.piel);
    if (h === "afro") o += poli(NUCA.corto, hc) + AFRO.map(([, q]) => circ(...q, 5.4, hc)).join("") + AFRO.map(([, q]) => circ(-q[0], q[1], 5.4, hc)).join("");
    else if (h === "rulos") o += poli(NUCA.corto, hc) + RULOS.map(([, q]) => circ(...q, 3.8, hc)).join("") + RULOS.map(([, q]) => circ(-q[0], q[1], 3.8, hc)).join("");
    else if (h === "pelado") o += poli(NUCA.rapado, hc).replace("/>", ' opacity=".18"/>');
    else if (h === "rapado") o += poli(NUCA.rapado, hc);
    else if (h === "melena") o += poli(NUCA.melena, hc);
    else o += poli(NUCA.corto, hc);
    if (h === "rodete") o += circ(0, 10.4, 5.4, hc);
    if (h === "colita") o += cuelga(loc([0, 7]), abajo, 21, 3.4, 1.6, hc, sw, J.alz);
    if (h === "largo") o += cuelga(loc([0, 4]), abajo, 26, 9, 5.4, hc, sw * .6, J.alz);
    return {detras: "", o};
  }
  function cabezaPerfil(J, pe, sw){
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
  /* la zapatilla: de perfil, su silueta; girada, la misma silueta con ancho (se ve la puntera y la suela de frente) */
  const ZAPA = [[-3.4, -4], [-6.4, 1], [-5.6, 5.2], [5, 5.6], [15.4, 5.2], [16.6, 2.6], [12, .4], [5, -2], [2.4, -4.6]];
  function casco(p){ const q = [...p].sort((a, b) => a[0] - b[0] || a[1] - b[1]), x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = []; for (const r of q){ while (lo.length > 1 && x(lo[lo.length - 2], lo[lo.length - 1], r) <= 0) lo.pop(); lo.push(r); }
    for (const r of q.reverse()){ while (hi.length > 1 && x(hi[hi.length - 2], hi[hi.length - 1], r) <= 0) hi.pop(); hi.push(r); } return [...lo.slice(0, -1), ...hi.slice(0, -1)]; }
  function zapatilla(J, s, pe, lejos){ const f = J["f" + s], w = J.d["zw" + s], d = J.d["zd" + s], l = J.d["zl" + s], pt = (a, b, c = 0) => [f[0] + w[0] * a + d[0] * b + l[0] * c, f[1] + w[1] * a + d[1] * b + l[1] * c];
    const ln = (p, q, col, sw, c = 0) => { const a = pt(...p, c), b = pt(...q, c); return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`; };
    const zc = lejos ? pe.zapaF : pe.zapa, su = lejos ? pe.suelaF : pe.suela;
    if (Math.hypot(...l) < 1e-6) return path(suave(ZAPA.map(p => pt(...p))), zc) + ln([-5, 5.2], [14.5, 4.8], su, 2.2) + ln([1.5, 1.6], [7.5, 2.6], "var(--c)", 1.5);
    /* el ancho: angosta en el cuello (abraza el tobillo) y ancha y baja en la puntera; de frente se lee como zapatilla y no como un bloque */
    const an = (a, b) => b < -1 ? 2.9 : a < 0 ? 3.3 : a < 8 ? 4.3 : a < 13 ? 4.8 : a < 16 ? 4.1 : 2.8, todo = ZAPA.flatMap(p => [pt(...p, an(...p)), pt(...p, -an(...p))]);
    const suela = casco([pt(-5, 6.4, 3.3), pt(-5, 6.4, -3.3), pt(14.5, 6, 4.6), pt(14.5, 6, -4.6), pt(-4, 3.4, 3.3), pt(-4, 3.4, -3.3), pt(15, 3.4, 4.6), pt(15, 3.4, -4.6)]);
    /* la marca va del lado que mira a la cámara, y se apaga cuando ese lado se pone de canto */
    const ld = J.dp(J.d3["zl" + s]), sg = ld >= 0 ? 1 : -1, vis = J.dp(J.d3["zd" + s]) > .35 ? 0 : Math.abs(ld);
    /* la suela va primero: de costado o de frente asoma abajo; desde arriba la tapa la capellada */
    return `<path d="M${suela.map(p => n1(p[0]) + " " + n1(p[1])).join("L")}Z" fill="${su}" stroke="${su}" stroke-width="1.6" stroke-linejoin="round"/>` + path(suave(casco(todo)), zc)
      + (vis > .3 ? ln([1.5, 1.6], [7.5, 2.6], "var(--c)", 1.5, sg * 4.4).replace("/>", vis < .6 ? ` opacity="${n1((vis - .3) / .3)}"/>` : "/>") : ""); }
  function zapatilla1(f, sh, pe, lejos){ const w = v(sh + 90, 1), d = v(sh, 1), pt = (a, b) => [f[0] + w[0] * a + d[0] * b, f[1] + w[1] * a + d[1] * b];
    const ln = (p, q, col, sw) => { const a = pt(...p), b = pt(...q); return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`; };
    return path(suave(ZAPA.map(p => pt(...p))), lejos ? pe.zapaF : pe.zapa) + ln([-5, 5.2], [14.5, 4.8], lejos ? pe.suelaF : pe.suela, 2.2) + ln([1.5, 1.6], [7.5, 2.6], "var(--c)", 1.5); }
  function mano(h, fo, c, enPiso = h[1] > PISO - 8){ if (enPiso) fo = 90; const u = v(fo, 1), cx = h[0] + u[0] * 3.4, cy = enPiso ? PISO - 3 : h[1] + u[1] * 3.4;
    return `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${enPiso ? 2.6 : 3.4}" ry="5.2" transform="rotate(${n1(-fo)} ${n1(cx)} ${n1(cy)})" fill="${c}"/>`; }
  /* la colchoneta abarca todo lo que apoya en todo el movimiento (también la cola, la espalda, la cabeza): no cambia de ancho entre cuadros */
  const TRAMOS = [["hip", "sh"], ["sh", "hd"], ["pN", "kN"], ["kN", "fN"], ["fN", "tN"], ["pF", "kF"], ["kF", "fF"], ["fF", "tF"], ["sN", "eN"], ["eN", "hN"], ["sF", "eF"], ["eF", "hF"]];
  function colchoneta(Js, c){
    /* con la cámara alzada: un rectángulo en el piso, proyectado. Acostado, a lo largo del cuerpo y del ancho de una colchoneta de yoga;
       sentado, lo que apoya y un margen */
    if (Js[0]?.alz){ const J0 = Js[0], W = [], o = J0.w[J0.fijo];
      for (const J of Js){ const f0 = J.w[J.fijo];
        for (const [a, b] of TRAMOS) for (const t of [0, .5, 1]){ if (alto(J, a) + (alto(J, b) - alto(J, a)) * t < PISO - 20) continue;
          W.push([0, 2].map(i => J.w[a][i] + (J.w[b][i] - J.w[a][i]) * t - f0[i])); } }
      if (!W.length) return "";
      /* a lo largo: el cuerpo si está acostado; sentado, hacia adelante */
      const ax = [J0.w.sh[0] - J0.w.hip[0], J0.w.sh[2] - J0.w.hip[2]], largo = Math.hypot(...ax) > 30 && Math.abs(ax[1]) > Math.abs(ax[0]) ? 1 : 0;
      const r = i => { const v = W.map(p => p[i]); return [Math.min(...v) - 18, Math.max(...v) + 18]; }, R = [r(0), r(1)], cc = J0.w.hip[largo ? 0 : 2] - o[largo ? 0 : 2];
      R[1 - largo] = [cc - 34, cc + 34];
      if (Math.hypot(...ax) <= 30){ const v = W.map(p => p[0]), h = J0.w.hip[0] - o[0]; R[0] = [Math.min(...v, h - 20) - 10, Math.max(...v.filter(x => x < h + 70), h + 40) + 12]; }
      const y = PISO - J0.oy + 2, q = [[R[0][0], R[1][0]], [R[0][1], R[1][0]], [R[0][1], R[1][1]], [R[0][0], R[1][1]]].map(([x, z]) => { const p = J0.pr([o[0] + x, y, o[2] + z]); return [p[0] + J0.dx, p[1] + J0.dy]; });
      return path(suave(q.flatMap((p, i) => { const n = q[(i + 1) % 4]; return [p, lerp(p, n, .06), lerp(p, n, .94)]; })), c); }
    const xs = Js.flatMap(J => TRAMOS.flatMap(([a, b]) => [0, .25, .5, .75, 1].map(t => lerp(J[a], J[b], t)))).filter(p => p[1] > PISO - 20).map(p => p[0]);
    if (!xs.length) return ""; const x0 = Math.min(...xs) - 24, x1 = Math.max(...xs) + 24;
    /* con la cámara girada (de frente o tres cuartos) se ve apenas desde arriba: un trapecio, el borde de atrás un poco más corto */
    if (Js[0].vis){ const m = (x1 - x0) * .05, q = [[x0 + m, PISO - 5], [x1 - m, PISO - 5], [x1, PISO + 4.5], [x0, PISO + 4.5]];
      return path(suave(q.flatMap((p, i) => { const n = q[(i + 1) % 4]; return [lerp(p, n, .06), lerp(p, n, .94)]; })), c); }
    return `<rect x="${n1(x0)}" y="${PISO - 1}" width="${n1(x1 - x0)}" height="7" rx="3.5" fill="${c}"/>`; }
  function cuerpo(J, pe, sw = 0){
    const P = J.P, F = PERF[pe.sexo], T = TRONCO[pe.sexo], partes = [];
    /* cuánto de perfil se ve el cuerpo (1 perfil, 0 frente): decide qué tapa a qué cuando las profundidades empatan */
    const perfil = J.plano ? 1 : Math.abs(J.dp(J.d3.tl)), z = k => J.z[k] ?? 0;
    /* lo lejano va un tono más oscuro; de frente los dos lados se ven casi igual, así que la sombra se aclara a la mitad */
    if (perfil < .999){ const t = .45 + .55 * perfil, m = (a, b) => mixHex(a, b, t); pe = {...pe, pielS: m(pe.piel, pe.pielS), abajoF: m(pe.abajo, pe.abajoF), arribaF: m(pe.arriba, pe.arribaF), zapaF: m(pe.zapa, pe.zapaF)}; }
    const pierna = s => { const lejos = s === "F", hp = J["p" + s], k = J["k" + s], fp = J["f" + s], piel = lejos ? pe.pielS : pe.piel, ropa = lejos ? pe.abajoF : pe.abajo;
      const bt = J.plano ? 0 : J.d["bt" + s], bs = J.plano ? 0 : J.d["bs" + s];
      /* de frente el muslo y la pierna son más finos que de perfil */
      /* el arranque del muslo, girado, apenas redondeado: así la cadera no abulta por fuera del short */
      const m = (a, b, at, pr, c, t0 = 0, t1 = 1) => J.plano ? miembro(a, b, pr, c, t0, t1) : miembro3(a, b, at, pr, c, t0, t1, at === bt ? .78 : .88, at === bt ? .9 - .65 * (1 - perfil) : .9);
      const mas = J.plano ? .8 : .8 - .5 * (1 - perfil);
      let o = m(hp, k, bt, F.th, piel) + m(k, fp, bs, F.sh, piel);
      if (pe.abajoTipo === "short") o += m(hp, k, bt, F.th.map(([t, a, b]) => [t, a + mas, b + mas]), ropa, 0, .55);
      else { o += m(hp, k, bt, F.th.map(([t, a, b]) => [t, a + .5, b + .5]), ropa) + m(k, fp, bs, F.sh.map(([t, a, b]) => [t, a + .5, b + .5]), ropa, 0, pe.abajoTipo === "corta" ? .62 : .9); }
      o += J.plano ? zapatilla1(fp, P["leg" + s][1] + (P.pies?.[lejos ? 1 : 0] || 0), pe, lejos) : zapatilla(J, s, pe, lejos);
      return [(z("p" + s) + z("k" + s) + z("f" + s)) / 3 + .5 * (1 - perfil), o]; };
    const brazo = s => { const lejos = s === "F", sj = J["s" + s], e = J["e" + s], h = J["h" + s], piel = lejos ? pe.pielS : pe.piel, ropa = lejos ? pe.arribaF : pe.arriba;
      /* girado, el hombro no se redondea hacia arriba (si no, la manga parece una hombrera) */
      const bu = J.plano ? 0 : J.d["bu" + s], bf = J.plano ? 0 : J.d["bf" + s], m = (a, b, at, pr, c, t0 = 0, t1 = 1) => J.plano ? miembro(a, b, pr, c, t0, t1) : miembro3(a, b, at, pr, c, t0, t1, .9, at === bu ? .9 - .45 * (1 - perfil) : .9);
      let o = m(sj, e, bu, F.up, piel) + m(e, h, bf, F.fo, piel);
      if (pe.arribaTipo === "remera") o += m(sj, e, bu, F.up.map(([t, a, b]) => [t, a + (J.plano ? 1 : .6), b + (J.plano ? 1 : .6)]), ropa, 0, .44);
      if (pe.arribaTipo === "larga") o += m(sj, e, bu, F.up.map(([t, a, b]) => [t, a + .6, b + .6]), ropa) + m(e, h, bf, F.fo.map(([t, a, b]) => [t, a + .5, b + .5]), ropa, 0, .88);
      const fo = J.plano ? P["arm" + s][1] : Math.atan2(J.d["fo" + s][0], J.d["fo" + s][1]) / RD;
      return [(z("s" + s) + z("e" + s) + z("h" + s)) / 3 + .5 * (1 - perfil), o + mano(h, fo, piel, !J.alz && alto(J, "h" + s) > PISO - 8)]; };
    const cab = cabeza(J, pe, sw);
    partes.push([-1e9, cab.detras], brazo("F"), pierna("F"));
    /* el tronco: piel, la ropa de arriba (el top deja la panza), la cintura del pantalón */
    const zt = (z("hip") + z("sh")) / 2, cintura = tronco(J, T, -.08, .2, pe.abajo, pe.sexo);
    partes.push([zt, tronco(J, T, -.08, 1.1, pe.piel, pe.sexo)
      + (pe.arribaTipo === "top" ? tronco(J, T, .6, .96, pe.arriba, pe.sexo) : tronco(J, T, .16, pe.arribaTipo === "musculosa" ? .97 : 1.04, pe.arriba, pe.sexo))
      + cintura]);
    /* el brazo cercano que pasa por delante de la cabeza lleva un borde un tono más oscuro, para que la cara no se pierda */
    const tapa = perfil > .7 && REL.hombroN(P) > 125, bN = brazo("N");
    /* el halo: la misma silueta del brazo, un poco más gruesa y oscura, por detrás; contorno solo por fuera, sin costuras */
    const halo = !tapa ? "" : (bN[1].match(/<(path|ellipse)[^>]*\/>/g) || []).filter(x => x.includes(`fill="${pe.piel}"`)).map(x => x.replace(/fill="[^"]*"/, `fill="${pe.pielS}" stroke="${pe.pielS}" stroke-width="2.6" stroke-linejoin="round"`)).join("");
    partes.push(pierna("N"), [z("hd") + .3 + 11.7 * perfil, cab.o], [bN[0], halo + bN[1]]);
    /* girado, la cintura del pantalón (una franja de borde recto) va por encima del arranque de los muslos: así no asoma la pierna de atrás */
    if (perfil <= .9) partes.push([Math.max(zt, partes[2][0], partes[4][0]) + .01, tronco(J, T, -.05, .2, pe.abajo, pe.sexo)]);
    /* lo de más atrás se dibuja primero */
    return partes.map((p, i) => [p[0], i, p[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p[2]).join("");
  }
  /* ===== lo que se usa ===== */
  const ln = (x1, y1, x2, y2, cls) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" class="${cls}"/>`;
  /* lo que está detrás del cuerpo y no se mueve; en la miniatura, sin los postes */
  function elemento(f, chica, d){
    const c = f.con, [x, y] = f.en, o = [];
    /* los postes llegan al piso, o hasta el borde del disco si el piso queda fuera del cuadro */
    const pie = px => !d ? PISO : Math.min(PISO, d[1] + Math.sqrt(Math.max(d[2] ** 2 - (px - d[0]) ** 2, 0)));
    /* de frente, la barra se centra entre las dos manos («barraX») */
    const bx = f.barraX ?? x;
    if (!chica && c === "barra") o.push(ln(bx - 72, y, bx - 72, pie(bx - 72), "poste"), ln(bx + 72, y, bx + 72, pie(bx + 72), "poste"));
    if (!chica && c === "barra-baja") o.push(ln(bx - 60, y, bx - 60, pie(bx - 60), "poste"), ln(bx + 60, y, bx + 60, pie(bx + 60), "poste"));
    if ((c === "barra" || c === "barra-baja") && f.barraAtras) o.push(ln(bx - 80, y, bx + 80, y, "barra"));
    /* la pared y el palo no pasan del borde de arriba del disco */
    const tope = (px, y) => !d ? y : Math.max(y, d[1] - Math.sqrt(Math.max(d[2] ** 2 - (px - d[0]) ** 2, 0)) + 6);
    if (f.pared !== undefined){ const y0 = tope(f.pared + 20, PISO - 230); o.push(`<rect x="${f.pared}" y="${n1(y0)}" width="40" height="${n1(PISO - y0)}" class="pared"/>`); }
    if (f.poste !== undefined) o.push(ln(f.poste, tope(f.poste, PISO - 200), f.poste, PISO, "palo"));
    /* la puerta de canto, con su picaporte: «puerta» es [x de la hoja, alto del picaporte] */
    if (f.puerta){ const [px, py] = f.puerta, y0 = tope(px + 4, PISO - 205);
      o.push(`<rect x="${n1(px)}" y="${n1(y0)}" width="8" height="${n1(PISO - y0)}" rx="1.5" class="puerta"/>`, ln(px, py, px - 7, py, "pica")); }
    /* la mesa: la tapa a la altura del borde que se agarra y sus dos patas; «mesa» es [x del borde, x del otro lado, alto] */
    if (f.mesa){ const [x0, x1, my] = f.mesa; o.push(ln(x0 - 3, my + 4, x0 - 3, PISO, "pata"), ln(x1 + 3, my + 4, x1 + 3, PISO, "pata"), `<rect x="${n1(Math.min(x0, x1) - 3)}" y="${n1(my - 4)}" width="${n1(Math.abs(x1 - x0) + 6)}" height="8" rx="2" class="mesa"/>`); }
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
    if ((c === "barra" || c === "barra-baja") && !f.barraAtras){ const bx = f.barraX ?? x; o.push(ln(bx - 80, y, bx + 80, y, "barra")); }
    /* la kettlebell sigue la línea del antebrazo: cuelga abajo, y arriba descansa sobre el dorso del brazo */
    if (c === "pesa"){ const h = f.unaMano ? J.hN : lerp(J.hN, J.hF, .5), fo = J.P.armN[1], arriba = Math.max(0, -Math.cos(fo * Math.PI / 180)), d = v(fo, 12 - 16 * arriba), b = v(270, 11 * arriba), q = [h[0] + d[0] + b[0], h[1] + d[1] + b[1]], w = v(fo + 90, 6), a = v(fo, 6);
      o.push(`<circle cx="${n1(q[0])}" cy="${n1(q[1])}" r="9.5" class="hierro"/><path d="M${n1(h[0] - w[0] + a[0])} ${n1(h[1] - w[1] + a[1])}Q${n1(h[0] - a[0])} ${n1(h[1] - a[1])} ${n1(h[0] + w[0] + a[0])} ${n1(h[1] + w[1] + a[1])}" class="asa"/>`); }
    if (c === "mancuernas" || c === "mancuerna") for (const s of c === "mancuerna" ? ["N"] : ["F", "N"]){ const h = J["h" + s], u = v(J.P["arm" + s][1], 4);
      const p = [h[0] + u[0], h[1] + u[1]], w = v(J.P["arm" + s][1] + 90, 9);
      o.push(`<line x1="${n1(p[0] - w[0])}" y1="${n1(p[1] - w[1])}" x2="${n1(p[0] + w[0])}" y2="${n1(p[1] + w[1])}" class="manc"${s === "F" ? ' opacity=".6"' : ""}/>`); }
    /* la soga gira: pasa bajo los pies en el vuelo («sogaPie», por defecto en la mitad del ciclo), sube por atrás y baja por adelante;
       en la doble da dos vueltas por salto. Sin «u» (la miniatura) queda abajo */
    if (c === "soga" && J.plano){ const [s] = soga(f, J, u); o.push(s); }
    if (c === "soga" && !J.plano){ const [s, atras] = soga(f, J, u); if (!atras) o.push(s); }
    /* la toalla del picaporte a las manos: tensa, sigue a las manos */
    if (f.puerta){ const [px, py] = f.puerta, a = [px - 7, py]; for (const s of ["F", "N"]) o.push(`<path d="M${n1(a[0])} ${n1(a[1])}L${n1(J["h" + s][0])} ${n1(J["h" + s][1])}" class="tela"${s === "F" ? ' opacity=".6"' : ""}/>`); }
    if (f.toalla) o.push(`<rect x="${n1(J.fN[0] - 9)}" y="${PISO - 3}" width="26" height="4" rx="2" class="toalla"/>`);
    return o.length ? `<g class="fig-el">${o.join("")}</g>` : "";
  }
  /* la soga gira alrededor de la línea de las manos, en el plano del perfil: con la cámara girada se proyecta, y cuando pasa por detrás va detrás del cuerpo */
  function soga(f, J, u){ const a = J.hN, b = J.hF, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], R = PISO + 2 - (J.plano ? m[1] : (alto(J, "hN") + alto(J, "hF")) / 2);
    const vueltas = f.vueltas || (f.soga === "doble" ? 2 : 1), th = u === undefined ? 0 : -360 * vueltas * (u - (f.sogaPie ?? .5)), d = v(th, R);
    let ap, atras = false;
    if (J.plano) ap = [m[0] + d[0] * .8, Math.min(m[1] + d[1], PISO + 2)];
    else { const q = J.pr([d[0] * .8, d[1], 0]); ap = [m[0] + q[0], Math.min(m[1] + q[1], PISO + 2)]; atras = J.dp([d[0], 0, 0]) < -.01; }
    return [`<path d="M${n1(a[0])} ${n1(a[1])}Q${n1(ap[0] * 2 - m[0])} ${n1(ap[1] * 2 - m[1])} ${n1(b[0])} ${n1(b[1])}" class="soga"/>`, atras]; }
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
    const disco = !e.disco ? "" : cy + r <= PISO + 3 || e.arriba ? `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" class="fig-disco"/>`
      : `<path d="M${n1(cx - Math.sqrt(r * r - (PISO + 3 - cy) ** 2))} ${PISO + 3}A${n1(r)} ${n1(r)} 0 ${cy < PISO + 3 ? 1 : 0} 1 ${n1(cx + Math.sqrt(r * r - (PISO + 3 - cy) ** 2))} ${PISO + 3}Z" class="fig-disco"/>`;
    /* lo que está atrás (pared, barra, banco) queda adentro del disco, como en un afiche */
    if (!e.disco) return disco + banda + mat + elemento(f, chica, e.disco);
    const id = "fd" + (++nClip);
    return disco + `<clipPath id="${id}">${disco.replace(' class="fig-disco"', "")}</clipPath>${e.arriba ? "" : mat}<g clip-path="url(#${id})">${e.arriba ? mat : ""}${elemento(f, chica, e.disco)}</g>`;
  }
  /* lo que se mueve: el cuerpo y lo que tiene en las manos */
  /* colgado de la barra no hay colchoneta, aunque los pies queden cerca del piso; tampoco en la bandera (el poste con la cámara girada).
     De perfil el poste también sirve de apoyo parado (remo, marco de la puerta) y ahí la colchoneta sigue */
  const frente = (f, P, pe, sw = 0, u) => { const J = ubicar(f, P, pe), sa = f.con === "soga" && !J.plano ? soga(f, J, u) : null;
    return lastre(f, J) + (sa && sa[1] ? `<g class="fig-el">${sa[0]}</g>` : "") + cuerpo(J, pe, sw) + enMano(f, J, u); };
  const piso = (f, poses, pe) => f.con === "barra" || f.poste !== undefined && (f.vista || f.alzada) ? "" : colchoneta(poses.map(P => ubicar(f, P, pe)), pe.mat);
  /* el lastre cuelga del cinturón por detrás de las piernas, siempre hacia abajo */
  const lastre = (f, J) => !f.lastre ? "" : `<g class="fig-el"><line x1="${n1(J.hip[0] - 3)}" y1="${n1(J.hip[1] + 2)}" x2="${n1(J.hip[0] - 3)}" y2="${n1(J.hip[1] + 20)}" class="cadena"/><circle cx="${n1(J.hip[0] - 3)}" cy="${n1(J.hip[1] + 29)}" r="10" class="hierro"/></g>`;
  const apoya = (f, P) => { const J = ubicar(f, P); return f.con !== "barra" && !J.alz && ["fN", "fF", "tN", "tF", "hN", "hF", "kN", "kF", "hip", "sh", "hd"].some(k => alto(J, k) > PISO - 14); };

  /* el encuadre: lo que ocupa el cuerpo en todo el movimiento, más el disco y el aparato; así la figura se ve grande y no salta */
  const puntos = J => ["hip", "sh", "hd", "eN", "hN", "eF", "hF", "kN", "fN", "tN", "kF", "fF", "tF"].map(k => J[k]);
  function encuadre(f, poses, chica){
    const Js = poses.map(P => ubicar(f, P)), p = Js.flatMap(puntos), xs = p.map(q => q[0]), ys = p.map(q => q[1]), arriba = !!Js[0]?.alz;
    /* con la cámara girada el poste entra en el cuadro (de perfil queda como hoy) */
    if (f.poste !== undefined && (f.vista || f.alzada)) xs.push(f.poste - 30, f.poste + 30);
    /* la mesa entra entera: el cuerpo queda debajo de la tapa */
    if (f.mesa && !chica){ xs.push(Math.min(f.mesa[0], f.mesa[1]) - 4); ys.push(f.mesa[2] - 6); }
    const bx0 = Math.min(...xs) - 10, bx1 = Math.max(...xs) + 10, by0 = Math.min(...ys) - 12, by1 = Math.max(...ys) + 8;
    const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2;
    /* la miniatura: el cuerpo llena el círculo, sin el resto de la escena */
    if (chica){ const bw = bx1 - bx0, bh = by1 - by0, z = Math.max(bw, bh) * 1.22, y1 = Math.min(by1, PISO + 6); return {vb: [cx - z / 2, by1 > PISO - 20 && !arriba ? Math.min(by0 - z * .04, y1 + z * .3 - z) : cy - z / 2, z, z]}; }
    /* acostado, el disco no crece con todo el largo del cuerpo: los pies y la cabeza pueden asomar, y la figura se ve más grande */
    const r = Math.max((bx1 - bx0) * .4, (by1 - by0) / 2) + 12;
    /* si el cuerpo no llega al piso (colgado de la barra) el piso queda fuera del cuadro y la figura se ve más grande */
    const suelo = !arriba && by1 > PISO - 40 || f.con === "bici" || f.banco || f.silla || f.pared !== undefined || f.poste !== undefined || !!f.puerta || !!f.mesa;
    let x0 = Math.min(bx0, cx - r) - 6, x1 = Math.max(bx1, cx + r) + 6, y0 = Math.min(by0, cy - r) - 6, y1 = suelo ? PISO + 6 : arriba ? Math.max(by1, cy + r) + 6 : Math.min(PISO + 6, Math.max(by1, cy + r) + 6);
    if (f.con === "barra" || f.con === "paralelas") y0 = Math.min(y0, f.en[1] - 14);
    if (f.con === "bici"){ x0 = Math.min(x0, f.en[0] - 70); x1 = Math.max(x1, f.en[0] + 106); }
    /* la silla y el banco entran enteros */
    if (f.silla){ x0 = Math.min(x0, f.silla[0] - 28); x1 = Math.max(x1, f.silla[0] + 28); y0 = Math.min(y0, f.silla[1] - 56); }
    if (f.banco){ x0 = Math.min(x0, f.banco[0] - 34); x1 = Math.max(x1, f.banco[0] + 34); }
    /* la puerta entra entera de ancho */
    if (f.puerta){ x1 = Math.max(x1, f.puerta[0] + 14); y0 = Math.min(y0, PISO - 212); }

    let w = x1 - x0; const h = y1 - y0;
    if (w < h * .86){ x0 -= (h * .86 - w) / 2; w = h * .86; }
    return {vb: [x0, y0, w, h], disco: [cx, cy, r], arriba};
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
  /* fuera del perfil, el hombro y la cadera se miden en 3D: θ es cuánto se separa el segmento de «abajo» (el tronco hacia los pies),
     φ hacia dónde (0 adelante, 90 hacia su lado, −90 cruzando por delante, ±180 atrás). Cada dirección tiene su tope; con el brazo arriba vale todo */
  const TOPE = {
    hombro: [[-180, 60], [-150, 60], [-120, 70], [-90, 150], [-60, 180], [120, 180], [140, 120], [155, 60], [180, 60]],
    hombroAv: [[-180, 75], [-150, 75], [-120, 80], [-90, 160], [-60, 180], [120, 180], [140, 135], [155, 75], [180, 75]],
    cadera: [[-180, 30], [-120, 30], [-90, 35], [-45, 122], [0, 132], [45, 122], [70, 108], [90, 60], [120, 45], [150, 30], [180, 30]],
    caderaAv: [[-180, 95], [-120, 40], [-90, 45], [-45, 128], [0, 165], [45, 150], [70, 140], [90, 105], [120, 98], [180, 95]]
  };
  const tope = (T, phi) => interp(T, phi);
  function rangos3(J, f){
    const W = J.w, D = J.d3, av = f.rango === "avanzado", mal = [], un = p => { const l = Math.hypot(...p) || 1; return p.map(x => x / l); };
    const ang = (a, b, c) => { const p = [0, 1, 2].map(i => W[b][i] - W[a][i]), q = [0, 1, 2].map(i => W[c][i] - W[b][i]);
      return Math.acos(Math.max(-1, Math.min(1, dot3(p, q) / Math.hypot(...p) / Math.hypot(...q)))) / RD; };
    for (const [k, a, b, c, mx] of [["codoN", "sN", "eN", "hN", 155], ["codoF", "sF", "eF", "hF", 155], ["rodillaN", "pN", "kN", "fN", 160], ["rodillaF", "pF", "kF", "fF", 160]]){
      const x = ang(a, b, c); if (x > mx) mal.push([k, x]); }
    for (const [k, a, b, s, arr] of [["hombroN", "sN", "eN", 1, 1], ["hombroF", "sF", "eF", -1, 1], ["caderaN", "pN", "kN", 1, 0], ["caderaF", "pF", "kF", -1, 0]]){
      const d = un([0, 1, 2].map(i => W[b][i] - W[a][i])), up = arr ? D.tt : D.pt, fw = arr ? D.tc : D.pc, lt = (arr ? D.tl : D.pl).map(x => x * s);
      const th = Math.acos(Math.max(-1, Math.min(1, -dot3(d, up)))) / RD, phi = Math.atan2(dot3(d, lt), dot3(d, fw)) / RD;
      const T = TOPE[(arr ? "hombro" : "cadera") + (av ? "Av" : "")], libre = arr && th >= (av ? 155 : 170);
      if (!libre && th > tope(T, phi) + .5) mal.push([k, th, phi]); }
    return mal;
  }
  /* los apoyos no se deslizan: lo que toca el piso (o la barra) en todo un tramo queda quieto mientras toca */
  const TOCA = {fN: 8, fF: 8, tN: 8, tF: 8, hN: 8, hF: 8, eN: 9, eF: 9, kN: 9, kF: 9};
  const donde = (J, f, k) => J.plano ? [J[k][0], alto(J, k), 0] : [J.w[k][0] - J.w[f.fijo][0] + f.en[0], alto(J, k), J.w[k][2] - J.w[f.fijo][2]];
  const es3D = f => !!(f.vista || f.alzada || f.k.some(p => p.abd || p.gira || p.rueda || p.inclina || p.vista || p.alzada));
  /* por ahora mira las poses en 3D (las de vista nueva); en las de perfil quedan deslices viejos anotados en el backlog */
  function apoyos(f){
    if (f.ciclo || f.pisa || !es3D(f)) return [];
    const barra = ["barra", "barra-baja", "paralelas"].includes(f.con), N = 48, mal = [], tramo = {};
    for (let i = 0; i <= N; i++){ const u = i / N, J = ubicar(f, en(f, u));
      for (const k of Object.keys(TOCA)){ const p = donde(J, f, k), toca = p[1] >= PISO - TOCA[k] || (barra && k[0] === "h" && Math.abs(p[1] - f.en[1]) < 3);
        if (!toca){ delete tramo[k]; continue; }
        if (!tramo[k]) tramo[k] = p; else if (Math.hypot(p[0] - tramo[k][0], p[2] - tramo[k][2]) > 3) { mal.push(`${k} se desliza en ${+u.toFixed(2)}`); tramo[k] = p; } } }
    return mal;
  }
  function revisar(id){
    const f = K.POSES[id], mal = [];
    if (!f.k || f.k.length < 2) return ["le faltan poses"];
    for (const u of muestras(f).concat(f.ciclo ? [] : [.1, .9])){
      const P = en(f, u), J = ubicar(f, P);
      if (!J.plano){ for (const [k, x] of rangos3(J, f)) mal.push(`${k} ${Math.round(x)}° en ${u}`);
        const c = rels(P).cuello, r = lim("cuello", f); if (c < r[0] - .5 || c > r[1] + .5) mal.push(`cuello ${Math.round(c)}° en ${u}`); }
      else for (const [k, x] of Object.entries(rels(P))){ const r = lim(k, f); if (x < r[0] - .5 || x > r[1] + .5) mal.push(`${k} ${Math.round(x)}° en ${u}`); }
      /* nada atraviesa el piso: cada articulación con el volumen que la rodea (el tobillo va 5 px arriba, la cadera 8) */
      for (const [k, m] of Object.entries(VOL)) if (alto(J, k) > PISO - m) mal.push(`${k} bajo el piso en ${u}`);
    }
    if (f.ritmo && !(f.ciclo ? f.ritmo.length === 1 : f.ritmo.length === 4)) mal.push("ritmo mal armado");
    return [...new Set([...mal, ...apoyos(f)])];
  }
  /* lo que comparten los archivos de poses: el sostenido, el parado y el cuatro patas */
  const quieto = p => [p, p];
  const PARADO = {torso: 180, head: 180, armN: [4, 6], armF: [358, 2], legN: [0, 0], legF: [2, 2]};
  const CUATRO = {torso: 102, head: 100, armN: [0, 0], armF: [2, 2], legN: [0, 270], legF: [2, 270], pies: [-90, -90]};
  return {grande, chica, animar, revisar, rangos3, apoyos, persona, esqueleto: ubicar, muestra: (id, u) => K.POSES[id] && (u === undefined ? pMuestra(K.POSES[id]) : en(K.POSES[id], u)), cuadro: (id, fam, u, pe) => { const f = K.POSES[id]; return frente(f, en(f, u), pe || persona(id, fam), 0, u); }, fijar: x => { fijo = x || {}; }, quieto, PARADO, CUATRO, PISO, TOBILLO: PISO - 5, ESTILOS, TONOS, PELOS};
})();
