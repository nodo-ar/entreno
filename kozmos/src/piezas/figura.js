/* ===== Figura: el maniquí que muestra cada ejercicio. Un cuerpo de perfil, dos poses (inicio y final) y el ritmo entre ellas.
   Ángulos absolutos por segmento: 0 abajo, 90 adelante, 180 arriba, 270 atrás. Lo cercano en tinta (o en el color de la familia
   si es lo que trabaja), lo lejano más suave. ===== */
K.fig = (() => {
  const L = {torso: 56, neck: 9, head: 12, up: 30, fo: 27, th: 43, sh: 41, foot: 14}, PISO = 268;
  const nrm = a => ((a % 360) + 540) % 360 - 180, s01 = a => { const s = ((a % 360) + 360) % 360; return s > 300 ? s - 360 : s; };
  /* relativos: positivo es flexión */
  const REL = {
    cuello: P => nrm(P.head - P.torso),
    hombroN: P => s01(P.armN[0] - P.torso - 180), hombroF: P => s01(P.armF[0] - P.torso - 180),
    codoN: P => nrm(P.armN[1] - P.armN[0]), codoF: P => nrm(P.armF[1] - P.armF[0]),
    caderaN: P => nrm(P.legN[0] - P.torso - 180), caderaF: P => nrm(P.legF[0] - P.torso - 180),
    rodillaN: P => -nrm(P.legN[1] - P.legN[0]), rodillaF: P => -nrm(P.legF[1] - P.legF[0])
  };
  /* lo que un cuerpo puede; «avanzado» abre la cadera para espagats */
  const LIM = {cuello: [-45, 45], hombro: [-60, 185], codo: [-5, 150], cadera: [-30, 130], rodilla: [-4, 150]}, CADERA_AV = [-95, 160];
  const lim = (k, f) => { const b = k.replace(/[NF]$/, ""); return b === "cadera" && f.rango === "avanzado" ? CADERA_AV : LIM[b]; };
  const rels = P => Object.fromEntries(Object.entries(REL).map(([k, f]) => [k, f(P)]));
  const v = (a, l) => [Math.sin(a * Math.PI / 180) * l, Math.cos(a * Math.PI / 180) * l], sum = (p, q) => [p[0] + q[0], p[1] + q[1]];
  function joints(P, raiz){
    const hip = raiz || [0, 0], sh = sum(hip, v(P.torso, L.torso)), nk = sum(sh, v(P.head, L.neck)), hd = sum(nk, v(P.head, L.head * .8));
    const brazo = a => { const e = sum(sh, v(a[0], L.up)); return [e, sum(e, v(a[1], L.fo))]; };
    const pierna = a => { const k = sum(hip, v(a[0], L.th)), f = sum(k, v(a[1], L.sh)); return [k, f, sum(f, v(a[1] + 90, L.foot))]; };
    const [eN, hN] = brazo(P.armN), [eF, hF] = brazo(P.armF), [kN, fN, tN] = pierna(P.legN), [kF, fF, tF] = pierna(P.legF);
    return {hip, sh, nk, hd, eN, hN, eF, hF, kN, fN, tN, kF, fF, tF, P};
  }
  /* el punto que no se mueve (la mano en la barra, el pie en el piso) queda clavado en «en» */
  const ubicar = (f, P) => { const J = joints(P), p = J[f.fijo]; return joints(P, [f.en[0] - p[0], f.en[1] - p[1]]); };
  const lerpA = (a, b, t) => a + nrm(b - a) * t;
  const mezclar = (A, B, t) => Object.fromEntries(Object.keys(A).map(k => [k, Array.isArray(A[k]) ? A[k].map((x, i) => lerpA(x, B[k][i], t)) : lerpA(A[k], B[k], t)]));
  const dentro = (f, P) => Object.entries(rels(P)).every(([k, x]) => { const r = lim(k, f); return x >= r[0] - .5 && x <= r[1] + .5; });

  /* ===== el cuerpo: cada miembro con perfil, para que se lea como cuerpo y no como palitos ===== */
  const n1 = n => n.toFixed(1);
  function suave(p){ let s = `M${n1((p[0][0] + p[p.length - 1][0]) / 2)} ${n1((p[0][1] + p[p.length - 1][1]) / 2)}`;
    for (let i = 0; i < p.length; i++){ const a = p[i], b = p[(i + 1) % p.length]; s += `Q${n1(a[0])} ${n1(a[1])} ${n1((a[0] + b[0]) / 2)} ${n1((a[1] + b[1]) / 2)}`; } return s + "Z"; }
  function miembro(a, b, prof, c){
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ux = dx / d, uy = dy / d, r0 = prof[0], r1 = prof[prof.length - 1];
    const P = [[a[0] - ux * r0[1] * .9, a[1] - uy * r0[1] * .9]];
    prof.forEach(([t, rp]) => P.push([a[0] + dx * t + nx * rp, a[1] + dy * t + ny * rp]));
    P.push([b[0] + ux * r1[1] * .9, b[1] + uy * r1[1] * .9]);
    [...prof].reverse().forEach(([t, , rn]) => P.push([a[0] + dx * t - nx * rn, a[1] + dy * t - ny * rn]));
    return `<path d="${suave(P)}" fill="${c}"/>`;
  }
  const MUSLO = [[0, 11, 10], [.3, 11.5, 10.4], [.7, 8.6, 8.4], [1, 6.8, 6.8]], PIERNA = [[0, 6.6, 6.6], [.24, 8.4, 6.4], [.55, 6.4, 5.2], [.92, 4, 4], [1, 4, 4]];
  const BRAZO = [[0, 7.6, 7.4], [.38, 6.6, 6.9], [.85, 5, 5], [1, 4.8, 4.8]], ANTEBRAZO = [[0, 5, 5], [.28, 5.8, 5.5], [.85, 3.6, 3.6], [1, 3.4, 3.4]];
  function pie(f, sh, c){ const w = v(sh + 90, 1), s = v(sh, 1), pt = (a, b) => [f[0] + w[0] * a + s[0] * b, f[1] + w[1] * a + s[1] * b];
    return `<path d="${suave([pt(-3, -2), pt(-6, 2), pt(-5, 5), pt(4, 5.2), pt(14, 5), pt(15, 3), pt(9, 0), pt(3, -2.5)])}" fill="${c}"/>`; }
  function mano(h, fo, c){ const u = v(fo, 1), cx = h[0] + u[0] * 3.6, cy = h[1] + u[1] * 3.6;
    return `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="3.9" ry="5.6" transform="rotate(${n1(-fo)} ${n1(cx)} ${n1(cy)})" fill="${c}"/>`; }
  function tronco(J, c){
    const H = J.hip, S = J.sh, dx = S[0] - H[0], dy = S[1] - H[1], d = Math.hypot(dx, dy), fx = -dy / d, fy = dx / d, at = (t, w) => [H[0] + dx * t + fx * w, H[1] + dy * t + fy * w];
    return `<path d="${suave([at(-.06, 8), at(.22, 10), at(.48, 9.4), at(.72, 13.2), at(.93, 11.5), at(1.06, 6), at(1.08, -6), at(.9, -10.5), at(.6, -9), at(.36, -9.6), at(.12, -13.4), at(-.08, -10)])}" fill="${c}"/>`;
  }
  function cabeza(J, c){ const a = -J.P.head + 180, f = v(J.P.head - 90, 1), u = v(J.P.head, 1);
    return miembro(J.sh, J.nk, [[0, 4.8, 4.4], [1, 4.4, 4.2]], c) + `<ellipse cx="${n1(J.hd[0])}" cy="${n1(J.hd[1])}" rx="${L.head * .86}" ry="${L.head}" transform="rotate(${n1(a)} ${n1(J.hd[0])} ${n1(J.hd[1])})" fill="${c}"/>`
      + `<circle cx="${n1(J.hd[0] + f[0] * L.head * .82 - u[0] * 1.5)}" cy="${n1(J.hd[1] + f[1] * L.head * .82 - u[1] * 1.5)}" r="2.6" fill="${c}"/>`; }
  function lado(J, s, cA, cL){ const P = J.P;
    return {piernas: miembro(J.hip, J["k" + s], MUSLO, cL) + miembro(J["k" + s], J["f" + s], PIERNA, cL) + pie(J["f" + s], P["leg" + s][1], cL),
      brazos: miembro(J.sh, J["e" + s], BRAZO, cA) + miembro(J["e" + s], J["h" + s], ANTEBRAZO, cA) + mano(J["h" + s], P["arm" + s][1], cA)}; }

  /* lo que se usa: barra, paralelas, banco, pared, pesa */
  function elemento(f){
    const [x, y] = f.en;
    if (f.con === "barra") return `<g class="fig-el"><line x1="${x - 72}" y1="${y}" x2="${x - 72}" y2="${PISO}" class="poste"/><line x1="${x + 72}" y1="${y}" x2="${x + 72}" y2="${PISO}" class="poste"/><line x1="${x - 80}" y1="${y}" x2="${x + 80}" y2="${y}" class="barra"/></g>`;
    if (f.con === "paralelas") return `<path class="fig-el par" d="M${x - 24} ${PISO}V${y}H${x + 24}V${PISO}"/>`;
    if (f.con === "banco") { const [bx, by] = f.banco || f.en; return `<rect class="fig-el banco" x="${bx - 34}" y="${by}" width="68" height="${PISO - by}" rx="4"/>`; }
    return "";
  }
  /* el dibujo de una pose; o.fondo: «disco», «cielo» o nada */
  function pose(f, P, o = {}){
    const J = ubicar(f, P), tr = f.trabaja || [], F = "var(--c)", ink = "var(--ink)", lejos = "var(--fig-lejos)", lejosF = "var(--fig-lejos-c)";
    const brazoC = tr.includes("brazos"), piernaC = tr.includes("piernas");
    let g = "";
    const [x0, y0, w, h] = o.vb || [0, 0, 300, PISO + 8];
    if (o.fondo === "disco") g += `<circle cx="${n1(x0 + w / 2)}" cy="${n1(y0 + h / 2)}" r="${n1(Math.min(w, h) * .47)}" class="fig-disco"/>`;
    if (o.fondo === "cielo") g += cielo(f.id);
    g += elemento(f);
    g += `<line x1="${n1(x0 - 40)}" y1="${PISO + 1}" x2="${n1(x0 + w + 40)}" y2="${PISO + 1}" class="fig-piso"/>`;
    if (f.estela && o.estela !== false) for (let i = 0; i <= 10; i++){ const p = ubicar(f, mezclar(f.k[0], f.k[1], i / 10))[f.estela]; g += `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${i % 5 ? 1.3 : 2.2}" fill="${F}" opacity="${i % 5 ? .45 : .85}"/>`; }
    const bF = lado(J, "F", brazoC ? lejosF : lejos, piernaC ? lejosF : lejos), bN = lado(J, "N", brazoC ? F : ink, piernaC ? F : ink);
    g += bF.piernas + bF.brazos + cabeza(J, ink) + tronco(J, tr.includes("tronco") ? F : ink) + bN.piernas + bN.brazos;
    return g;
  }
  /* cielo: estrellas quietas, siempre las mismas para cada ejercicio */
  function cielo(id){
    let s = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0) >>> 0, 7), g = "";
    const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < 46; i++) g += `<circle cx="${n1(r() * 300)}" cy="${n1(r() * (PISO - 60))}" r="${n1(r() * .9 + .4)}" class="fig-est"/>`;
    return g;
  }

  /* el ritmo: [subir, arriba, bajar, abajo] en segundos; sin ritmo, la pose final se sostiene */
  const fase = (f, t) => {
    const [a, b, c, d] = f.ritmo, T = a + b + c + d; t %= T;
    const e = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
    return t < a ? e(t / a) : t < a + b ? 1 : t < a + b + c ? 1 - e((t - a - b) / c) : 0;
  };
  /* el marco: lo que ocupa el cuerpo en todo el movimiento, más el piso o la barra; así la figura se ve grande y no salta */
  const puntos = J => ["hip", "sh", "hd", "eN", "hN", "eF", "hF", "kN", "fN", "tN", "kF", "fF", "tF"].map(k => J[k]);
  function marco(f, poses, cuadrado){
    const p = poses.flatMap(P => puntos(ubicar(f, P)));
    const m = cuadrado ? 8 : 16;
    let x0 = Math.min(...p.map(q => q[0])) - m, x1 = Math.max(...p.map(q => q[0])) + m, y0 = Math.min(...p.map(q => q[1])) - m, y1 = PISO + 6;
    if (!cuadrado && (f.con === "barra" || f.con === "paralelas")) y0 = Math.min(y0, f.en[1] - 14);
    let w = x1 - x0, h = y1 - y0;
    const ar = cuadrado ? 1 : .86;
    if (w < h * ar){ x0 -= (h * ar - w) / 2; w = h * ar; }
    if (cuadrado){ if (h < w){ y0 -= (w - h) * .6; h = w; } else { const z = h * .92; x0 += (w - z) / 2; y0 += h - z - 4; w = h = z; } }
    return [x0, y0, w, h];
  }
  const caja = (cls, f, vb, cuerpo, attr = "") => `<svg class="fig ${cls}" viewBox="${vb.map(n1).join(" ")}" style="--c:var(--${f.fam});--cs:var(--${f.fam}-soft)" aria-hidden="true"${attr}>${cuerpo}</svg>`;
  /* grande: en la serie, se mueve a su ritmo (o queda quieta si el sistema pide menos movimiento) */
  const grande = (id, fam, o = {}) => { const f = K.POSES[id]; if (!f) return "";
    const x = {id, ...f, fam}, quieta = !f.ritmo || K.reduce(), vb = marco(x, [0, .25, .5, .75, 1].map(t => mezclar(f.k[0], f.k[1], t)));
    return caja("grande", x, vb, `<g>${pose(x, quieta ? f.k[f.muestra ?? 1] : f.k[0], {...o, vb})}</g>`, quieta ? "" : ` data-fig="${id}" data-fam="${fam}" data-fondo="${o.fondo || ""}" data-vb="${vb.map(n1).join(" ")}"`); };
  /* chica: una sola pose, la que más dice, recortada en un círculo */
  const chica = (id, fam) => { const f = K.POSES[id]; if (!f) return ""; const x = {id, ...f, fam}, P = f.k[f.muestra ?? 1], vb = marco(x, [P], true);
    return `<span class="fig-chica" style="--cs:var(--${fam}-soft)">${caja("chica", x, vb, pose(x, P, {estela: false, vb}))}</span>`; };

  /* un solo reloj para todas las figuras que se mueven: dibuja a 30 cuadros y se apaga solo cuando no queda ninguna */
  let corriendo = false, t0 = 0, ult = 0;
  function cuadro(ts){
    const vivas = document.querySelectorAll("svg.fig[data-fig]");
    if (!vivas.length){ corriendo = false; return; }
    if (ts - ult > 32){ ult = ts;
      vivas.forEach(el => { const f = K.POSES[el.dataset.fig];
        el.firstChild.innerHTML = pose({id: el.dataset.fig, ...f, fam: el.dataset.fam}, mezclar(f.k[0], f.k[1], fase(f, (ts - t0) / 1000)), {fondo: el.dataset.fondo, vb: el.dataset.vb.split(" ").map(Number)}); }); }
    requestAnimationFrame(cuadro);
  }
  const animar = () => { if (corriendo || K.reduce() || !document.querySelector("svg.fig[data-fig]")) return; corriendo = true; t0 = performance.now(); requestAnimationFrame(cuadro); };
  return {grande, chica, animar, joints, ubicar, mezclar, rels, dentro, PISO, lim, REL};
})();

/* ===== Las poses. fijo: lo que no se mueve (hand, fN, kN, sh, hip); en: dónde está; con: el elemento; trabaja: lo que se pinta del color de la familia.
   k: [inicio, final]; ritmo: [subir, arriba, bajar, abajo] en segundos; estela: la articulación que deja rastro. ===== */
(() => {
  const P = 268, colgado = {torso: 180, head: 180, armN: [180, 180], armF: [176, 178], legN: [4, 352], legF: [8, 356]};
  const arriba = {torso: 176, head: 178, armN: [62, 172], armF: [58, 170], legN: [14, 348], legF: [18, 352]};
  const pecho = {torso: 168, head: 172, armN: [28, 176], armF: [26, 174], legN: [18, 346], legF: [22, 350]};
  const parado = {torso: 180, head: 180, armN: [6, 6], armF: [2, 2], legN: [0, 0], legF: [2, 2]};
  K.POSES = {
    "dominada-negativa": {con: "barra", fijo: "hN", en: [150, 50], trabaja: ["brazos"], estela: "hd", k: [arriba, colgado], ritmo: [.5, .4, 4.5, .8], muestra: 0},
    "dominada": {con: "barra", fijo: "hN", en: [150, 50], trabaja: ["brazos"], estela: "hd", k: [colgado, arriba], ritmo: [1, .4, 1.4, .5]},
    "dominada-explosiva": {con: "barra", fijo: "hN", en: [150, 50], trabaja: ["brazos"], estela: "hd", k: [colgado, pecho], ritmo: [.5, .3, 1.4, .6]},
    "dominada-arquera": {con: "barra", fijo: "hN", en: [150, 50], trabaja: ["brazos"], estela: "hd", k: [colgado, {...arriba, armF: [118, 118]}], ritmo: [1.2, .4, 1.6, .5]},
    "sentadilla": {fijo: "fN", en: [150, P], trabaja: ["piernas"], estela: "hip", k: [{...parado, armN: [92, 92], armF: [88, 88]},
      {torso: 148, head: 156, armN: [96, 92], armF: [92, 88], legN: [84, 334], legF: [82, 332]}], ritmo: [1, .3, 1.4, .3]},
    "shrimp": {fijo: "fN", en: [160, P], trabaja: ["piernas"], estela: "hip", k: [{torso: 176, head: 178, armN: [96, 96], armF: [337, 337], legN: [0, 0], legF: [348, 205]},
      {torso: 155, head: 160, armN: [100, 96], armF: [318, 318], legN: [86, 330], legF: [338, 188]}], ritmo: [1.2, .3, 1.6, .3]},
    "nordico-negativa": {fijo: "kN", en: [120, P - 7], trabaja: ["piernas"], estela: "sh", k: [{torso: 180, head: 180, armN: [20, 120], armF: [16, 116], legN: [0, 270], legF: [2, 270]},
      {torso: 122, head: 124, armN: [70, 80], armF: [66, 76], legN: [302, 270], legF: [304, 270]}], ritmo: [.8, .2, 4.5, .8]}
  };
})();
