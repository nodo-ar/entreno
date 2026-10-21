/* ===== Figura: la persona que muestra cada ejercicio. Un cuerpo de perfil, sus poses y el ritmo entre ellas.
   Ángulos absolutos por segmento: 0 abajo, 90 adelante, 180 arriba, 270 atrás. Lo cercano adelante; lo lejano, en sombra.
   Las poses viven en src/poses/: K.POSES[id] = {fijo, en, con, k: [inicio, final], ritmo, estela, muestra, ciclo}. ===== */
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

  /* ===== el cuerpo: cada miembro con perfil, para que se lea como cuerpo y no como palitos ===== */
  const n1 = n => n.toFixed(1);
  function suave(p){ let s = `M${n1((p[0][0] + p[p.length - 1][0]) / 2)} ${n1((p[0][1] + p[p.length - 1][1]) / 2)}`;
    for (let i = 0; i < p.length; i++){ const a = p[i], b = p[(i + 1) % p.length]; s += `Q${n1(a[0])} ${n1(a[1])} ${n1((a[0] + b[0]) / 2)} ${n1((a[1] + b[1]) / 2)}`; } return s + "Z"; }
  /* un miembro con perfil: [t, radio del lado +n (atrás), radio del lado −n (adelante)] */
  function miembro(a, b, prof, c, op){
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ux = dx / d, uy = dy / d, r0 = prof[0], r1 = prof[prof.length - 1];
    const e0 = Math.abs(r0[1]) * .9, e1 = Math.abs(r1[1]) * .9, P = [[a[0] - ux * e0, a[1] - uy * e0]];
    prof.forEach(([t, rp]) => P.push([a[0] + dx * t + nx * rp, a[1] + dy * t + ny * rp]));
    P.push([b[0] + ux * e1, b[1] + uy * e1]);
    [...prof].reverse().forEach(([t, , rn]) => P.push([a[0] + dx * t - nx * rn, a[1] + dy * t - ny * rn]));
    return `<path d="${suave(P)}" fill="${c}"${op ? ` opacity="${op}"` : ""}/>`;
  }
  const MUSLO = [[0, 11, 10], [.3, 11.5, 10.4], [.7, 8.6, 8.4], [1, 6.8, 6.8]], PIERNA = [[0, 6.6, 6.6], [.24, 8.4, 6.4], [.55, 6.4, 5.2], [.92, 4, 4], [1, 4, 4]];
  const BRAZO = [[0, 7.6, 7.4], [.38, 6.6, 6.9], [.85, 5, 5], [1, 4.8, 4.8]], ANTEBRAZO = [[0, 5, 5], [.28, 5.8, 5.5], [.85, 3.6, 3.6], [1, 3.4, 3.4]];
  /* la sombra: la mitad de atrás de cada miembro, un tono más oscura */
  const atras = prof => prof.map(([t, rp]) => [t, rp, -rp * .1]);
  /* una línea de músculo: de t0 a t1 sobre el miembro, corrida «off» px hacia atrás (+) o adelante (−), con panza «pz» */
  function linea(a, b, t0, t1, off, pz, c, w = 1.1){
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const pt = (t, o) => [a[0] + dx * t + nx * o, a[1] + dy * t + ny * o], p0 = pt(t0, off), p1 = pt(t1, off), m = pt((t0 + t1) / 2, off + pz);
    return `<path d="M${n1(p0[0])} ${n1(p0[1])}Q${n1(m[0])} ${n1(m[1])} ${n1(p1[0])} ${n1(p1[1])}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity=".45"/>`;
  }
  /* un pedazo del tronco, en coordenadas del tronco (t a lo largo, w de costado: + es el pecho) */
  function trozo(J, pts, c, op){
    const H = J.hip, S = J.sh, dx = S[0] - H[0], dy = S[1] - H[1], d = Math.hypot(dx, dy), fx = -dy / d, fy = dx / d;
    return `<path d="${suave(pts.map(([t, w]) => [H[0] + dx * t + fx * w, H[1] + dy * t + fy * w]))}" fill="${c}"${op ? ` opacity="${op}"` : ""}/>`;
  }
  function trazo(J, pts, c, w, op){
    const H = J.hip, S = J.sh, dx = S[0] - H[0], dy = S[1] - H[1], d = Math.hypot(dx, dy), fx = -dy / d, fy = dx / d;
    const p = pts.map(([t, x]) => [H[0] + dx * t + fx * x, H[1] + dy * t + fy * x]);
    return `<path d="M${p.map(q => n1(q[0]) + " " + n1(q[1])).join("L")}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op ? ` opacity="${op}"` : ""}/>`;
  }
  const TORSO = [[-.06, 8], [.22, 10], [.48, 9.4], [.72, 13.2], [.93, 11.5], [1.06, 6], [1.08, -6], [.9, -10.5], [.6, -9], [.36, -9.6], [.12, -13.4], [-.08, -10]];
  /* la musculosa: deja ver los hombros; ribete claro en el cuello y la sisa */
  const MUSC = [[.06, 9.4], [.22, 10.3], [.48, 9.7], [.7, 13.4], [.86, 11.4], [.97, 7], [1.02, 2.6], [.99, -2.2], [.93, -8.4], [.8, -10.6], [.6, -9.3], [.36, -9.9], [.14, -13.4], [.04, -10.8]];
  /* el short: desde la cintura, con elástico */
  const SHORT = [[-.08, 8.6], [.17, 10.4], [.23, 10.2], [.21, -13.6], [.1, -13.8], [-.1, -10.4]];
  function zapatilla(f, sh, c, s){ const w = v(sh + 90, 1), d = v(sh, 1), pt = (a, b) => [f[0] + w[0] * a + d[0] * b, f[1] + w[1] * a + d[1] * b];
    const ln = (p, q, col, sw, op) => { const a = pt(...p), b = pt(...q); return `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"${op ? ` opacity="${op}"` : ""}/>`; };
    return `<path d="${suave([pt(-3, -2.4), pt(-6, 2), pt(-5, 5), pt(4, 5.2), pt(14, 5), pt(15, 3), pt(9, -.4), pt(3, -3)])}" fill="${c}"/>`
      + ln([-5, 5.2], [14.5, 4.8], "var(--suela)", 2.2, s === "F" ? .55 : 0) + ln([1, 1.4], [8, 2.6], "var(--c)", 1.6, s === "F" ? .55 : 0)
      + ln([-3.6, -2.6], [3, -3.2], "var(--media)", 2.4, s === "F" ? .55 : 0); }
  function mano(h, fo, c){ const u = v(fo, 1), cx = h[0] + u[0] * 3.6, cy = h[1] + u[1] * 3.6;
    return `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="3.9" ry="5.6" transform="rotate(${n1(-fo)} ${n1(cx)} ${n1(cy)})" fill="${c}"/>`; }
  /* la cabeza: cuello, cara, pelo corto que cubre atrás y arriba, oreja */
  function cabeza(J){
    const hd = J.hd, a = -J.P.head + 180, f = v(J.P.head - 90, 1), u = v(J.P.head, 1), R = L.head;
    const el = (dx, dy, rx, ry, c) => { const x = hd[0] + f[0] * dx + u[0] * dy, y = hd[1] + f[1] * dx + u[1] * dy; return `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" transform="rotate(${n1(a)} ${n1(x)} ${n1(y)})" fill="${c}"/>`; };
    return miembro(J.sh, J.nk, [[0, 5, 4.6], [1, 4.6, 4.4]], "var(--piel)") + miembro(J.sh, J.nk, [[0, 5, -1], [1, 4.6, -1]], "var(--piel-s)")
      + el(0, 0, R * .86, R, "var(--piel)") + el(-1.6, 1.8, R * .8, R * .86, "var(--pelo)") + el(1.4, -1.6, R * .7, R * .74, "var(--piel)")
      + el(-1.2, -.6, 2.2, 3.2, "var(--piel-s)")
      + `<circle cx="${n1(hd[0] + f[0] * R * .82 - u[0] * 1.5)}" cy="${n1(hd[1] + f[1] * R * .82 - u[1] * 1.5)}" r="2.4" fill="var(--piel)"/>`;
  }
  function cuerpo(J){
    const P = J.P, g = [];
    const C = {N: {piel: "var(--piel)", sombra: "var(--piel-s)", short: "var(--short)", zapa: "var(--zapa)"},
      F: {piel: "var(--piel-s)", sombra: "var(--piel-ss)", short: "var(--short-f)", zapa: "var(--zapa-f)"}};
    const pierna = s => { const c = C[s], k = J["k" + s], fp = J["f" + s], sh = P["leg" + s][1], borde = lerp(J.hip, k, .5);
      let o = miembro(J.hip, k, MUSLO, c.piel) + miembro(J.hip, k, atras(MUSLO), c.sombra) + miembro(k, fp, PIERNA, c.piel) + miembro(k, fp, atras(PIERNA), c.sombra);
      o += linea(J.hip, k, .62, .96, -4, -2.5, c.sombra) + linea(k, fp, .1, .5, 3, 2.5, c.sombra);
      /* el short tapa la mitad de arriba del muslo, con una franja del color de la familia al costado y el ruedo marcado */
      o += miembro(J.hip, borde, [[0, 11.6, 10.6], [.6, 11.2, 9.8], [1, 10, 9]], c.short);
      o += linea(J.hip, borde, .1, .96, .6, 0, "var(--c)", 1.8).replace('opacity=".45"', `opacity="${s === "F" ? .5 : .9}"`);
      o += zapatilla(fp, sh + (P.pies?.[s === "N" ? 0 : 1] || 0), c.zapa, s);
      return o; };
    const brazo = s => { const c = C[s], e = J["e" + s], h = J["h" + s];
      return miembro(J.sh, e, BRAZO, c.piel) + miembro(J.sh, e, atras(BRAZO), c.sombra) + miembro(e, h, ANTEBRAZO, c.piel) + miembro(e, h, atras(ANTEBRAZO), c.sombra)
        + linea(J.sh, e, .02, .46, -2, 3.2, c.sombra) + linea(J.sh, e, .38, .86, -3.2, -1.8, c.sombra) + linea(J.sh, e, .25, .75, 3, 1.6, c.sombra)
        + mano(h, P["arm" + s][1], c.piel); };
    g.push(pierna("F"), brazo("F"));
    /* el torso: piel de base (se ven los hombros), la musculosa encima con su sombra y su ribete, el short en la cintura */
    g.push(trozo(J, TORSO, "var(--piel)"), trozo(J, [[.7, -9], [.96, -10.6], [1.07, -5], [1.04, 1], [.9, -4]], "var(--piel-s)"));
    g.push(trozo(J, MUSC, "var(--c)"), trozo(J, [[.14, -13.2], [.4, -9.6], [.62, -9.2], [.9, -10.2], [.98, -6], [.6, -5.2], [.3, -8]], "var(--ropa-s)", .55));
    g.push(trazo(J, [[.86, 11.2], [.97, 7], [1.02, 2.6], [.99, -2.2]], "var(--ribete)", 1.3), trazo(J, [[.7, -10.2], [.84, -10.6], [.93, -8.4]], "var(--ribete)", 1.1, .8));
    g.push(trozo(J, SHORT, "var(--short)"), trazo(J, [[.2, 10.2], [.2, -13.6]], "var(--short-l)", 2.2), trazo(J, [[.19, -13.4], [-.06, -10.4]], "var(--c)", 1.8, .9));
    g.push(cabeza(J), pierna("N"), brazo("N"));
    return g.join("");
  }

  /* ===== lo que se usa ===== */
  function elemento(f, J, atrasDe){
    const c = f.con, x = f.en[0], y = f.en[1], o = [];
    const ln = (x1, y1, x2, y2, cls) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" class="${cls}"/>`;
    if (atrasDe){
      if (c === "barra") o.push(ln(x - 72, y, x - 72, PISO, "poste"), ln(x + 72, y, x + 72, PISO, "poste"));
      if (c === "barra-baja") o.push(ln(x - 60, y, x - 60, PISO, "poste"), ln(x + 60, y, x + 60, PISO, "poste"));
      if ((c === "barra" || c === "barra-baja") && f.barraAtras) o.push(ln(x - 80, y, x + 80, y, "barra"));
      if (f.pared !== undefined) o.push(`<rect x="${f.pared}" y="${PISO - 230}" width="40" height="230" class="pared"/>`);
      if (f.poste !== undefined) o.push(ln(f.poste, PISO - 200, f.poste, PISO, "palo"));
      if (f.banco) o.push(`<rect x="${n1(f.banco[0] - 30)}" y="${n1(f.banco[1])}" width="60" height="${n1(PISO - f.banco[1])}" rx="4" class="banco"/>`);
      if (c === "paralelas") o.push(`<path class="par" d="M${x - 26} ${PISO}V${y}H${x + 26}V${PISO}"/>`);
      if (c === "bici") o.push(bici(f));
      return `<g class="fig-el">${o.join("")}</g>`;
    }
    if ((c === "barra" || c === "barra-baja") && !f.barraAtras) o.push(ln(x - 80, y, x + 80, y, "barra"));
    if (c === "pesa"){ const h = f.unaMano ? J.hN : lerp(J.hN, J.hF, .5); o.push(`<circle cx="${n1(h[0])}" cy="${n1(h[1] + 12)}" r="9.5" class="hierro"/><path d="M${n1(h[0] - 6)} ${n1(h[1] + 6)}Q${n1(h[0])} ${n1(h[1] - 6)} ${n1(h[0] + 6)} ${n1(h[1] + 6)}" class="asa"/>`); }
    if (c === "mancuernas" || c === "mancuerna") for (const s of c === "mancuerna" ? ["N"] : ["F", "N"]){ const h = J["h" + s], u = v(J.P["arm" + s][1], 4);
      const p = [h[0] + u[0], h[1] + u[1]], w = v(J.P["arm" + s][1] + 90, 9);
      o.push(`<line x1="${n1(p[0] - w[0])}" y1="${n1(p[1] - w[1])}" x2="${n1(p[0] + w[0])}" y2="${n1(p[1] + w[1])}" class="manc"${s === "F" ? ' opacity=".6"' : ""}/>`); }
    if (c === "soga"){ const a = J.hN, b = J.hF, abajo = f.soga === "arriba" ? Math.min(J.hd[1], a[1]) - 60 : PISO + 2; const m = [(a[0] + b[0]) / 2 + 6, abajo];
      o.push(`<path d="M${n1(a[0])} ${n1(a[1])}Q${n1(m[0])} ${n1(m[1] * 2 - (a[1] + b[1]) / 2)} ${n1(b[0])} ${n1(b[1])}" class="soga"/>`); }
    if (f.lastre) o.push(`<circle cx="${n1(J.hip[0] + 4)}" cy="${n1(J.hip[1] + 22)}" r="10" class="hierro"/><line x1="${n1(J.hip[0])}" y1="${n1(J.hip[1])}" x2="${n1(J.hip[0] + 4)}" y2="${n1(J.hip[1] + 12)}" class="cadena"/>`);
    if (f.toalla) o.push(`<rect x="${n1(J.fN[0] - 9)}" y="${PISO - 3}" width="26" height="4" rx="2" class="toalla"/>`);
    if (f.silla){ const [sx, sy, lado] = f.silla, rx = lado === "der" ? sx + 18 : sx - 18;
      o.push(`<path class="silla" d="M${sx - 22} ${sy}H${sx + 22}M${sx - 18} ${sy}V${PISO}M${sx + 18} ${sy}V${PISO}M${rx} ${sy}V${sy - 48}"/>`); }
    return o.length ? `<g class="fig-el">${o.join("")}</g>` : "";
  }
  /* la bici fija: el asiento en «en», el manubrio adelante, las ruedas en el piso */
  function bici(f){ const [x, y] = f.en, r = 30, w1 = [x - 34, PISO - r], w2 = [x + 70, PISO - r], pd = [x + 14, y + 62], mb = [x + 62, y - 14];
    return `<circle cx="${w1[0]}" cy="${w1[1]}" r="${r}" class="rueda"/><circle cx="${w2[0]}" cy="${w2[1]}" r="${r}" class="rueda"/>`
      + `<path class="cuadro" d="M${w1[0]} ${w1[1]}L${pd[0]} ${pd[1]}L${x + 4} ${y + 6}M${pd[0]} ${pd[1]}L${x + 56} ${y + 10}L${w2[0]} ${w2[1]}M${x + 56} ${y + 10}L${mb[0]} ${mb[1]}h10M${x - 10} ${y + 4}h20M${x + 4} ${y + 6}L${w1[0]} ${w1[1]}"/>`; }

  /* ===== cada persona tiene su tono de piel y su pelo, sorteados por ejercicio: siempre la misma para el mismo ejercicio ===== */
  const TONOS = ["#f1cba8", "#e2b58f", "#d8a47f", "#c48e66", "#a8714c", "#8d5a3b", "#6b4430", "#4f3224"];
  const PELOS = ["#2b211b", "#1c1714", "#3b2a1e", "#5a3d26", "#7a5a3c", "#2b211b"];
  const sorteo = (id, sal) => [...(id + sal)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const persona = id => `--tono:${TONOS[sorteo(id, "piel") % TONOS.length]};--pelo:${PELOS[sorteo(id, "pelo") % PELOS.length]}`;

  /* el dibujo de una pose */
  function pose(f, P, o = {}){
    const J = ubicar(f, P), [x0, y0, w, h] = o.vb;
    let g = o.fondo === false ? "" : `<circle cx="${n1(x0 + w / 2)}" cy="${n1(y0 + h / 2)}" r="${n1(Math.min(w, h) * .47)}" class="fig-disco"/>`;
    g += elemento(f, J, true) + `<line x1="${n1(x0 - 40)}" y1="${PISO + 1}" x2="${n1(x0 + w + 40)}" y2="${PISO + 1}" class="fig-piso"/>`;
    if (f.estela && o.estela !== false) for (let i = 0; i <= 10; i++){ const p = ubicar(f, en(f, i / 10))[f.estela]; g += `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${i % 5 ? 1.3 : 2.2}" fill="var(--c)" opacity="${i % 5 ? .45 : .85}"/>`; }
    return g + cuerpo(J) + elemento(f, J, false);
  }

  /* el marco: lo que ocupa el cuerpo en todo el movimiento, más el piso o la barra; así la figura se ve grande y no salta */
  const puntos = J => ["hip", "sh", "hd", "eN", "hN", "eF", "hF", "kN", "fN", "tN", "kF", "fF", "tF"].map(k => J[k]);
  function marco(f, poses, cuadrado){
    const p = poses.flatMap(P => puntos(ubicar(f, P)));
    const m = cuadrado ? 8 : 16;
    let x0 = Math.min(...p.map(q => q[0])) - m, x1 = Math.max(...p.map(q => q[0])) + m, y0 = Math.min(...p.map(q => q[1])) - m, y1 = PISO + 6;
    if (!cuadrado && (f.con === "barra" || f.con === "paralelas")) y0 = Math.min(y0, f.en[1] - 14);
    if (!cuadrado && f.con === "bici"){ x0 = Math.min(x0, f.en[0] - 70); x1 = Math.max(x1, f.en[0] + 106); }
    /* la silla y el banco entran enteros en el encuadre grande */
    if (!cuadrado && f.silla){ x0 = Math.min(x0, f.silla[0] - 28); x1 = Math.max(x1, f.silla[0] + 28); y0 = Math.min(y0, f.silla[1] - 56); }
    if (!cuadrado && f.banco){ x0 = Math.min(x0, f.banco[0] - 34); x1 = Math.max(x1, f.banco[0] + 34); }
    let w = x1 - x0, h = y1 - y0;
    const ar = cuadrado ? 1 : .86;
    if (w < h * ar){ x0 -= (h * ar - w) / 2; w = h * ar; }
    if (cuadrado){ if (h < w){ y0 -= (w - h) * .6; h = w; } else { const z = h * .92; x0 += (w - z) / 2; y0 += h - z - 4; w = h = z; } }
    return [x0, y0, w, h];
  }
  const caja = (cls, id, fam, vb, cuerpo, attr = "") => `<svg class="fig ${cls}" viewBox="${vb.map(n1).join(" ")}" style="--c:var(--${fam});--cs:var(--${fam}-soft);${persona(id)}" aria-hidden="true"${attr}>${cuerpo}</svg>`;
  const pMuestra = f => f.ciclo ? f.k[f.muestra ?? 0] : f.k[f.muestra ?? f.k.length - 1];
  /* grande: en la serie, se mueve a su ritmo (o queda quieta si el sistema pide menos movimiento) */
  const grande = (id, fam) => { const f = K.POSES[id]; if (!f) return "";
    const quieta = !f.ritmo || K.reduce(), vb = marco(f, muestras(f).map(u => en(f, u)));
    return caja("grande", id, fam, vb, `<g>${pose(f, quieta ? pMuestra(f) : en(f, 0), {vb})}</g>`, quieta ? "" : ` data-fig="${id}" data-vb="${vb.map(n1).join(" ")}"`); };
  /* chica: una sola pose, la que más dice, recortada en un círculo */
  const chica = (id, fam) => { const f = K.POSES[id]; if (!f) return ""; const P = pMuestra(f), vb = marco(f, [P], true);
    return `<span class="fig-chica" style="--cs:var(--${fam}-soft)">${caja("chica", id, fam, vb, pose(f, P, {estela: false, vb, fondo: false}))}</span>`; };

  /* el ritmo: [ida, quieto, vuelta, quieto] en segundos; en un ciclo, [segundos por vuelta] */
  const fase = (f, t) => {
    if (f.ciclo) return t / f.ritmo[0];
    const [a, b, c, d] = f.ritmo, T = a + b + c + d; t %= T;
    const e = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
    return t < a ? e(t / a) : t < a + b ? 1 : t < a + b + c ? 1 - e((t - a - b) / c) : 0;
  };
  /* un solo reloj para todas las figuras que se mueven: dibuja a 30 cuadros y se apaga solo cuando no queda ninguna */
  let corriendo = false, t0 = 0, ult = 0;
  function cuadro(ts){
    const vivas = document.querySelectorAll("svg.fig[data-fig]");
    if (!vivas.length){ corriendo = false; return; }
    if (ts - ult > 32){ ult = ts;
      vivas.forEach(el => { const f = K.POSES[el.dataset.fig];
        el.firstChild.innerHTML = pose(f, en(f, fase(f, (ts - t0) / 1000)), {vb: el.dataset.vb.split(" ").map(Number)}); }); }
    requestAnimationFrame(cuadro);
  }
  const animar = () => { if (corriendo || K.reduce() || !document.querySelector("svg.fig[data-fig]")) return; corriendo = true; t0 = performance.now(); requestAnimationFrame(cuadro); };

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
  return {grande, chica, animar, revisar, ubicar, en, rels, lim, joints, PISO, TOBILLO: PISO - 5, persona};
})();
