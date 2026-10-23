/* ===== Planes en estantes (vuelta 32, opción A del boceto): menos lista, más a la vista =====
   Arriba, para vos: tu rutina y la próxima prueba. Después tres estantes: las rutinas (cada una con el cuerpo, su nivel,
   sus semanas en puntos y sus ejercicios), los ejercicios por lo que trabajan (las puertas de la biblioteca) y las pruebas
   en una vitrina: un tema por fila y un nivel por columna.
   Rutas: #/planes · #/planes/rutinas/<id> · #/planes/hazanas/<id> · #/planes/pruebas[/<id>] (la vitrina entera)
   · #/planes/ejercicios[/<id>] (la biblioteca, en ejercicios.js). Zonas, grupos y niveles salen del catálogo (K.biblio). ===== */

/* ===== El nivel: el disco del logo con uno, dos o tres satélites, como en las medallas ===== */
const NV_ANG = [45, 75, 105];
K.nivelIc = n => `<svg class="nv-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="13" r="5.4" fill="var(--c, var(--ink))"/>${NV_ANG.slice(0, n).map(a => {
  const x = 11 + 9 * Math.sin(a * Math.PI / 180), y = 13 - 9 * Math.cos(a * Math.PI / 180);
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="var(--nv-fondo, var(--s1))"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.1" fill="var(--c, var(--ink))"/>`; }).join("")}</svg>`;
K.nivelTx = n => `<span class="nv" aria-label="Nivel ${K.biblio.NIVELES[n - 1].toLowerCase()}">${K.nivelIc(n)}<span>${K.biblio.NIVELES[n - 1]}</span></span>`;

/* ===== El cuerpo: de frente y de espaldas, con la silueta del maniquí (cabeza, cuello y miembros redondeados) y cada músculo con su forma =====
   zonas: {zona: 2 (de lleno, en el color de la familia) | 1 (apoyo, suave)}; lo demás, neutro. Entre músculo y músculo, una línea fina del color
   de la tarjeta (siempre de 1 px, a cualquier tamaño). El corazón, si trabaja, es el satélite del logo sobre el pecho.
   Zonas → músculos: hombros (deltoides), pecho (pectorales), brazos (bíceps, tríceps y antebrazos), abdomen (recto y oblicuos),
   cadera (flexores de la cadera adelante, glúteo medio atrás), espalda (trapecio, dorsales y lumbares), glúteos, piernas (cuádriceps,
   isquios y gemelos). Cada vista mide 64 × 168; de espaldas, la persona queda con su izquierda a la izquierda. ===== */
K.cuerpo = (zonas = {}, fam = "fu", {alto = 92} = {}) => {
  const col = k => zonas[k] === 2 ? `var(--${fam})` : zonas[k] === 1 ? `color-mix(in oklab,var(--${fam}) 38%,var(--cu-off))` : "var(--cu-off)";
  const L = 'stroke="var(--cu-linea)" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="round"';
  const m = (d, k) => `<path d="${d}" fill="${col(k)}" ${L}/>`;
  const ln = d => `<path d="${d}" fill="none" ${L} stroke-linecap="round"/>`;
  const espejo = g => `${g}<g transform="translate(64 0) scale(-1 1)">${g}</g>`;
  /* la silueta: cabeza, cuello, tronco, brazos y piernas redondeados, como el maniquí */
  const sil = `<g fill="var(--cu-base)" stroke="var(--cu-base)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
    <circle cx="32" cy="9.5" r="7"/><path d="M28.6 15h6.8v8h-6.8z"/>
    <path d="M32 20.5 22.5 22.6 15.6 24.4Q12.4 26 13 30.5L15.8 37 18.2 46.5 20.2 57 19 66.5 18.2 80 24.5 86.5 32 87.5 39.5 86.5 45.8 80 45 66.5 43.8 57 45.8 46.5 48.2 37 51 30.5Q51.6 26 48.4 24.4L41.5 22.6Z"/>
    ${espejo(`<path d="M14.6 28 11.3 54" stroke-width="8.4" fill="none"/><path d="M11.3 54 9.6 78" stroke-width="6.6" fill="none"/><ellipse cx="9.4" cy="82.4" rx="3.1" ry="4.3"/>
      <path d="M18.4 81 17.7 100 19.6 120.5 28.6 121.5 31.6 101 31.8 87Z"/><path d="M19.8 122 19.4 133 22.4 160.5 26.4 160.5 28.6 138 28.6 123Z"/><ellipse cx="24.4" cy="163.4" rx="3.4" ry="2.6"/>`)}</g>`;
  /* de frente */
  const frente = espejo(m("M15.2 23.9Q21 22.4 22.6 26.6 19.4 29.6 17.3 36.6 13.2 35.8 11.3 31.6 11.6 25.6 15.2 23.9Z", "hombros")
    + m("M31.3 26.8V40.3Q26 43.4 21 39.6 19.4 33.2 22.4 28.1 26.4 25.9 31.3 26.8Z", "pecho")
    + m("M12 32.6Q17.6 34.4 16.8 44.2 16 51.4 12.8 53.6 8.6 51.8 8.4 45 8.8 36.8 12 32.6Z", "brazos")
    + m("M9.6 56.4Q13.8 57.6 13.2 66 12.6 74 10 77.6 6.8 74 6.9 66 7.2 58.6 9.6 56.4Z", "brazos")
    + m("M27.4 42.6H31.3V49.6H27.4Z", "abdomen") + m("M27.4 50.6H31.3V57.6H27.4Z", "abdomen") + m("M27.4 58.6H31.3V65.4H27.4Z", "abdomen")
    + m("M27.4 66.4H31.3V76.6Q28.8 74.2 27.4 70.6Z", "abdomen")
    + m("M21.2 43.4Q25 45.6 26.4 49.6V63.6Q23.6 65.6 21.6 63.8 20 55 21.2 43.4Z", "abdomen")
    + m("M21.4 65.8Q24.4 67 26.5 70.4 28.6 75 30.8 80.6 26.4 82.6 22.6 80.4 20.1 74 21.4 65.8Z", "cadera")
    + m("M18.6 84Q24.2 80.6 30.6 84.6 31.6 100 29.6 113.4 27 119.6 24.6 120.4 20.6 118.8 19 112.4 17 98.4 18.6 84Z", "piernas")
    + ln("M24.6 89.6Q24 104 24.8 116.4")
    + m("M20.8 125Q25 123.4 28.2 126.6 28.8 137 26.6 150 24.6 156 22.6 150 20.2 138 20.8 125Z", "piernas"));
  /* de espaldas (la persona mira hacia adentro: su izquierda queda a la izquierda) */
  const espalda = espejo(m("M32 17.4V45.6L28.2 34.4Q24.6 29 17.8 26.2 22.6 23.6 28.8 22.2Z", "espalda")
    + m("M15.2 23.9Q21 22.4 22.6 26.6 19.4 29.6 17.3 36.6 13.2 35.8 11.3 31.6 11.6 25.6 15.2 23.9Z", "hombros")
    + m("M27.4 35.6Q22.6 31.6 18.2 31 17.2 40.4 19.8 50 23.6 57.4 30 60Q30.6 47.8 27.4 35.6Z", "espalda")
    + m("M30.8 48.2H31.6V65.2Q29.2 65.4 28.2 63.6 28.2 55.6 30.8 48.2Z", "espalda")
    + m("M12 32.6Q17.6 34.4 16.8 44.2 16 51.4 12.8 53.6 8.6 51.8 8.4 45 8.8 36.8 12 32.6Z", "brazos")
    + m("M9.6 56.4Q13.8 57.6 13.2 66 12.6 74 10 77.6 6.8 74 6.9 66 7.2 58.6 9.6 56.4Z", "brazos")
    + m("M20.6 61.8Q26 60.8 30 64 26 66.8 21.2 68.6 19.8 65.6 20.6 61.8Z", "cadera")
    + m("M31.6 67.4Q31.8 80 29.2 83.4 23.4 85.6 19.6 80.6 18.4 72.4 21.4 69.2 27 66.4 31.6 67.4Z", "gluteos")
    + m("M18.8 87.4Q24.2 85.2 30.6 88.4 31.4 102 29 114.4 25.8 119 23 118.2 18.6 111 18 100.4 17.8 92 18.8 87.4Z", "piernas")
    + ln("M24.4 92Q24.2 104 25 114")
    + m("M20.6 123.6Q25 121.4 29 124.6 30 134 27.6 143.4 24.6 148 22 143.4 19.2 134 20.6 123.6Z", "piernas"));
  /* el corazón: el satélite del logo, en el pecho */
  const cor = zonas.corazon ? `<circle cx="38.6" cy="31.6" r="5.4" fill="var(--cu-fondo)"/><circle cx="38.6" cy="31.6" r="3.6" fill="${col("corazon")}"/>` : "";
  const de = K.biblio.ZONAS.map(z => z[0]), lleno = de.filter(z => zonas[z] === 2), poco = de.filter(z => zonas[z] === 1);
  const lb = lleno.length ? `Trabaja ${K.yLista(lleno.map(z => K.biblio.zonaTx(z).toLowerCase()))}${poco.length ? `; un poco, ${K.yLista(poco.map(z => K.biblio.zonaTx(z).toLowerCase()))}` : ""}` : "El cuerpo";
  return `<svg class="cuerpo" viewBox="0 0 134 168" style="height:${alto}px" role="img" aria-label="${K.esc(lb)}"><g>${sil}${frente}${cor}</g><g transform="translate(70 0)">${sil}${espalda}</g></svg>`;
};
/* las zonas en palabras, al lado del cuerpo grande: lo de lleno en tinta y, debajo, lo de apoyo, más suave */
K.zonasTx = zonas => { const de = K.biblio.ZONAS.map(z => z[0]), ll = de.filter(z => zonas[z] === 2), po = de.filter(z => zonas[z] === 1);
  const tx = xs => K.yLista(xs.map((z, i) => { const t = K.biblio.zonaTx(z); return i ? t.toLowerCase() : t; }));
  return `<span class="zonas-tx">${ll.length ? `<b>${tx(ll)}</b>` : ""}${po.length ? `<span>${K.esc(`Un poco: ${tx(po).toLowerCase()}`)}</span>` : ""}</span>`; };

/* ===== Las semanas en puntos: una columna por semana, un punto por día; la de prueba en anillos; lo hecho, lleno; el de hoy, rodeado ===== */
K.semanasPuntos = (r, cur = null, {d = 6, g = 4} = {}) => {
  const W = r.semanas * (d + g) - g, H = r.dias * (d + g) - g, hechos = cur ? cur.i : 0, rr = d / 2, pts = [];
  for (let w = 1; w <= r.semanas; w++){ const t = K.rutina.tipoSemana(r, w).tipo;
    for (let k = 0; k < r.dias; k++){ const i = (w - 1) * r.dias + k, x = (w - 1) * (d + g) + rr, y = k * (d + g) + rr, hecho = i < hechos;
      pts.push(t !== "prueba" || hecho ? `<circle cx="${x}" cy="${y}" r="${rr}" fill="${hecho ? "var(--c)" : t === "meta" ? "var(--ink-3)" : "var(--off)"}"/>`
        : `<circle cx="${x}" cy="${y}" r="${rr - .8}" fill="none" stroke="var(--c)" stroke-width="1.6"/>`);
      if (cur && !cur.terminada && i === hechos) pts.push(`<circle cx="${x}" cy="${y}" r="${rr + 1.8}" fill="none" stroke="var(--ink)" stroke-width="1.6"/>`); } }
  return `<svg class="sem-pts" width="${W + 6}" height="${H + 6}" viewBox="-3 -3 ${W + 6} ${H + 6}" role="img" aria-label="${K.esc(`${r.semanas} semanas de ${r.dias} días${cur ? `, ${cur.i} de ${cur.total} hechos` : ""}`)}">${pts.join("")}</svg>`;
};

/* ===== Los ejercicios con su persona: los primeros n y cuántos más; con «ir», cada uno abre su página ===== */
K.ejCaras = (ids, fam, {n = 5, px = 34, ir = false} = {}) => {
  const xs = ids.filter(id => K.POSES[id]).slice(0, n), mas = ids.filter(id => K.POSES[id]).length - xs.length;
  return `<span class="ej-caras">${xs.map(id => ir ? `<button type="button" class="ej-cara" data-ir="#/planes/ejercicios/${id}" aria-label="${K.esc(K.ej(id).nombre)}">${K.icono.ejercicio(id, fam, px)}<small>${K.esc(K.ej(id).nombre)}</small></button>`
    : K.icono.ejercicio(id, fam, px)).join("")}${mas > 0 ? `<span class="ej-mas num">+${mas}</span>` : ""}</span>`;
};

/* ===== Un estante: se desliza de costado y frena en cada tarjeta; la siguiente asoma. Todas las tarjetas, del mismo alto ===== */
K.estante = (cls, items, lb) => `<div class="estante ${cls}" role="list" aria-label="${K.esc(lb)}">${items.map(x => `<div class="est-item" role="listitem">${x}</div>`).join("")}</div>`;

/* ===== Lo que hace una rutina, con tus escalones de ahora (se recalcula si cambia tu diario) ===== */
const _hace = new Map();
K.rutinaHace = r => {
  const ctx = K.ctxRutina(), clave = `${r.id}|${ctx.sesiones.length}|${ctx.marcas.length}|${(ctx.equipo || []).join()}|${JSON.stringify(K.desdeTuNivel() || {})}`;
  if (_hace.get(r.id)?.clave !== clave) _hace.set(r.id, {clave, h: K.biblio.hace(r, {...ctx, nivelDesde: K.desdeTuNivel() || {}})});
  return _hace.get(r.id).h;
};

/* ===== La tarjeta de una rutina: el cuerpo, el nivel, el nombre y los minutos; sus semanas; sus ejercicios ===== */
K.rutCard = (r, {sel = "", cur = null} = {}) => {
  const h = K.rutinaHace(r), falta = K.rutina.falta(r, K.EJ, K.diario.perfil.equipo || null);
  const sem = K.aparte(`${r.semanas} semanas`, `${r.dias} por semana`);
  return `<button type="button" class="ru-card" data-ir="#/planes/rutinas/${r.id}" data-quieto="1" style="--c:var(--${r.familia})"${sel === r.id ? " data-sel" : ""}>
    <span class="ru-top">${K.cuerpo(h.zonas, r.familia, {alto: 92})}<span class="ru-tx">${K.nivelTx(r.nivel)}<b class="ru-nom">${K.esc(r.nombre)}</b><span class="num ru-min">${K.dur(`${r.minutos} min`)}</span></span></span>
    <span class="ru-mid">${K.semanasPuntos(r, cur)}<span class="ru-sem small">${sem}${falta.length ? `<span class="ru-pide">Pide ${K.esc(K.pide(falta))}</span>` : ""}</span></span>
    <span class="ru-pie">${K.ejCaras(h.ejs, r.familia)}</span></button>`;
};

/* ===== La vitrina: un tema por fila, tres niveles por columna. Chica en Planes (la medalla y tu magnitud); grande en Pruebas (con nombre y marca) ===== */
const hzMag = h => { const vs = K.hzVeces(h), u = vs[vs.length - 1]; return u ? K.rutina.magnitud(h, u.valor, vs) : null; };
K.medallaNivel = (h, px, lb = "") => K.icono.medalla(h, hzMag(h) !== null, px, lb, h.nivel);
K.pruebasGanadas = () => K.HAZANAS.hazanas.filter(h => hzMag(h) !== null).length;
K.vitrina = ({grande = false, sel = "", prox = "", ruta = "#/planes/hazanas/"} = {}) => {
  const cab = `<div class="vt-cab" aria-hidden="true">${grande ? "" : "<span></span>"}${K.biblio.NIVELES.map((t, k) => `<span class="vt-nv">${K.nivelIc(k + 1)}<span class="lb">${t}</span></span>`).join("")}</div>`;
  const filas = K.biblio.vitrina(K.HAZANAS.hazanas).map(t => `<div class="vt-fila" role="group" aria-label="${K.esc(t.nombre)}"><span class="lb tg vt-tema"><i class="dot" style="--c:var(--${t.fam})"></i>${K.esc(t.nombre)}</span>
    ${t.pruebas.map((h, k) => { if (!h) return `<span class="vt-m vacia" aria-hidden="true"></span>`;
      const vs = K.hzVeces(h), u = vs[vs.length - 1], m = hzMag(h), nv = K.biblio.NIVELES[k].toLowerCase();
      const pie = grande ? `<b>${K.esc(h.nombre)}</b><small class="num">${u ? K.jer(K.esc(K.hzMarca(h, u.valor)), m ? `m${m}` : "") : h.id === prox ? "Toca ya" : "Sin hacer"}</small>` : `<small class="num">${m ? `m${m}` : h.id === prox ? "toca" : ""}</small>`;
      return `<button type="button" class="vt-m${h.id === prox ? " prox" : ""}" data-ir="${ruta}${h.id}" data-quieto="1"${sel === h.id ? " data-sel" : ""} aria-label="${K.esc(`${h.nombre}, ${nv}${m ? `, magnitud ${m}` : ""}`)}">${K.medallaNivel(h, grande ? 64 : 46)}${pie}</button>`; }).join("")}</div>`).join("");
  return `<div class="vt${grande ? " grande" : ""}">${cab}${filas}</div>`;
};

/* ===== Los ejercicios, por lo que trabajan: una puerta por grupo y una para todos ===== */
const CARA = {tirar: "dominada", empujar: "flexion", piernas: "sentadilla", bisagra: "puente-gluteo", abdomen: "l-sit", movilidad: "cosaca", motor: "burpee"};
K.ejPuertas = () => {
  const xs = K.EJERCICIOS.ejercicios, n = g => xs.filter(x => K.biblio.grupoDe(x.id, K.EJ) === g).length;
  const puerta = (que, cara, fam, t, cuenta) => `<button type="button" class="ej-puerta" data-ir="#/planes/ejercicios" data-ejque="${que}">${cara}<b>${K.esc(t)}</b><small class="num">${cuenta}</small></button>`;
  return K.estante("ej-est", [...K.biblio.GRUPOS.map(([g, t, f]) => puerta(g, K.icono.ejercicio(CARA[g], f, 64), f, t, n(g))),
    puerta("todo", `<span class="ej-todos" aria-hidden="true">${K.ic("dots")}</span>`, "fu", "Todos", xs.length)], "Ejercicios por lo que trabajan");
};

/* ===== Para vos: tu rutina y la próxima prueba, lado a lado (o la prueba sola) ===== */
const paraVos = (selR, selH, ru, sigo, prox) => {
  const rut = sigo ? (() => { const sp = K.plan.semanaDePrueba(K.diario.perfil, K.diario.sesiones, K.hoy());
    return `<button type="button" class="cd pv pl-rut" data-ir="#/planes/rutinas/${ru.r.id}" data-quieto="1" style="--c:var(--${ru.r.familia})"${selR === ru.r.id ? " data-sel" : ""}>
      <span class="lb">Tu rutina</span><b class="pv-nom">${K.esc(ru.r.nombre)}</b>${K.semanasPuntos(ru.r, ru.cur, {d: 5, g: 3})}
      <small class="pv-pie"><span class="num">Semana ${ru.cur.semana} de ${ru.r.semanas}</span>${sp ? `<span>${K.esc(K.pruebaTx(sp, ru.r))}</span>` : ""}</small></button>`; })() : "";
  const vs = K.hzVeces(prox), u = vs[vs.length - 1], m = hzMag(prox), cu = K.hzCuando(prox);
  const pr = `<button type="button" class="cd pv pl-prox" data-ir="#/planes/hazanas/${prox.id}" data-quieto="1" style="--c:var(--${prox.familia})"${selH === prox.id ? " data-sel" : ""}>
      <span class="lb">Próxima prueba</span><span class="pv-med">${K.medallaNivel(prox, 52)}<b class="pv-nom">${K.esc(prox.nombre)}</b></span>
      <small class="pv-pie"><span class="num">${K.esc(cu.tx)}</span><span>${u ? K.jer(`Tu última: ${K.esc(K.hzMarca(prox, u.valor))}`, m ? `m${m}` : "") : "Todavía no la hiciste"}</span></small></button>`;
  return `<div class="pv-fila${sigo ? "" : " sola"}">${rut}${pr}</div>`;
};
const titulo = (t, extra = "", id = "") => `<div class="pl-tit pl-fila"${id ? ` id="${id}"` : ""}><h2>${t}</h2>${extra}</div>`;
const verMas = (ir, tx, q = "", attr = "") => `<button type="button" class="pl-ver" data-ir="${ir}"${attr}>${K.jer(tx, q)}${K.ic("chev")}</button>`;
/* el menú de familia de las rutinas: un botón chico con su flecha, al lado del título (nada de chips) */
const FAM = () => [{id: "todas", nombre: "Todas"}, ...K.CATALOGO.familias];
const famDe = () => { const v = K.prefs.get("planes.rutinas", "todas"); return FAM().some(f => f.id === v) ? v : "todas"; };
K.planesFamilia = btn => { const v = famDe();
  K.menu.abrir(btn, {titulo: "Familia", items: FAM().map(f => ({id: f.id, texto: f.nombre, elegido: f.id === v, ...(f.id !== "todas" ? {color: `var(--${f.id})`} : {})})),
    elegir: id => { K.prefs.set("planes.rutinas", id); K.refrescar(); }}); };
const famBoton = () => { const n = (FAM().find(f => f.id === famDe()) || FAM()[0]).nombre;
  return `<button type="button" class="pl-fam" id="pl-fam-rutinas" aria-haspopup="menu" aria-expanded="false" aria-label="Familia: ${K.esc(n)}"><span>${K.esc(n)}</span>${K.ic("chevd")}</button>`; };
/* de inicial a avanzado; dentro de cada nivel, por nombre */
const ordenRut = (a, b) => a.nivel - b.nivel || a.nombre.localeCompare(b.nombre, "es");
K.proximaPrueba = () => { const hs = K.HAZANAS.hazanas; return K.rutina.proximaPrueba(hs, K.diario.sesiones, K.hoy(), {ej: K.EJ, equipo: K.diario.perfil.equipo || null}) || hs[0]; };

K.P.planes = r => {
  if (r.sub === "ejercicios") return K.P.ejercicios(r);
  if (r.sub === "pruebas") return K.P.pruebas(r);
  const hz = K.horizontal(), ru = K.rutinaActual(), sigo = ru && !ru.cur.terminada, prox = K.proximaPrueba();
  /* en horizontal algo queda abierto: lo elegido o, si no, la rutina que seguís o la próxima prueba */
  const selR = r.sub === "rutinas" ? r.sub2 : "", selH = r.sub === "hazanas" ? r.sub2 : "";
  const abreR = selR || (!selH && hz && sigo ? ru.r.id : ""), abreH = selH || (!abreR && hz ? prox.id : "");
  const abierto = abreR ? K.P.rutina(abreR) : abreH ? K.P.hazana(abreH) : "";
  const fr = famDe(), rs = K.RUTINAS.filter(x => fr === "todas" || x.familia === fr).sort(ordenRut);
  const rutinas = rs.length ? K.estante("ru-est", rs.map(x => K.rutCard(x, {sel: abreR, cur: sigo && ru.r.id === x.id ? ru.cur : null})), "Rutinas") : `<p class="mute small pl-nada">Nada en esta familia.</p>`;
  /* el satélite de las medallas ganadas llega orbitando la primera vez que abrís Planes; después queda quieto */
  const llega = !K.planesVisto; K.planesVisto = true;
  return `<div class="split pl${r.sub2 ? " en-detalle" : ""}${llega ? " ico-llega" : ""}"><div class="lado">${K.enc({titulo: "Planes", sub: "Rutinas, ejercicios y pruebas"})}
    ${paraVos(abreR, abreH, ru, sigo, prox)}
    ${titulo("Rutinas", famBoton(), "pl-rutinas")}${rutinas}
    ${titulo("Ejercicios", verMas("#/planes/ejercicios", "Ver todos", "", ' data-ejque="todo"'), "pl-ejercicios")}${K.ejPuertas()}
    ${titulo("Pruebas", verMas("#/planes/pruebas", "Ver todas", `${K.pruebasGanadas()} de ${K.HAZANAS.hazanas.length}`), "pl-hazanas")}
    <section class="cd vt-cd">${K.vitrina({sel: abreH, prox: prox.id})}</section></div>
    <div class="abierto">${abierto}</div></div>`;
};

/* ===== Pruebas: la vitrina entera, con el nombre y tu marca de cada medalla ===== */
K.P.pruebas = r => {
  const prox = K.proximaPrueba(), sel = r.sub2 && K.hzDe(r.sub2) ? r.sub2 : K.horizontal() ? prox.id : "";
  const lado = K.enc({titulo: "Pruebas", sub: `${K.pruebasGanadas()} de ${K.HAZANAS.hazanas.length} medallas`, volver: "#/planes"})
    + `<p class="ayuda vt-ayuda">Cada medalla tiene cinco magnitudes, de m5 a m1. Los satélites dicen su nivel.</p><section class="cd vt-cd grande">${K.vitrina({grande: true, sel, prox: prox.id, ruta: "#/planes/pruebas/"})}</section>`;
  return `<div class="split pl${r.sub2 ? " en-detalle" : ""}"><div class="lado">${lado}</div><div class="abierto">${sel ? K.P.hazana(sel, "#/planes/pruebas") : ""}</div></div>`;
};

/* ===== La rutina de un vistazo, arriba de su página: el cuerpo grande con lo que trabaja, sus semanas y sus ejercicios ===== */
K.rutinaVistazo = (r, cur) => {
  const h = K.rutinaHace(r);
  return `<section class="cd ru-vista" style="--c:var(--${r.familia})">
    <div class="ru-v-top">${K.cuerpo(h.zonas, r.familia, {alto: 168})}<div class="ru-v-tx">${K.nivelTx(r.nivel)}${K.zonasTx(h.zonas)}</div></div>
    <div class="ru-v-sem"><div class="ln"><span class="lb">${K.jer(`${r.semanas} semanas`, `${r.dias} días por semana`)}</span><span class="num lb">${K.dur(`${r.minutos} min`)}</span></div>${K.semanasPuntos(r, cur, {d: 9, g: 5})}
      <span class="ru-v-ley mute"><i class="l-c"></i>Entrenar<i class="l-p"></i>Prueba${cur ? `<i class="l-h"></i>Hecho` : ""}</span></div>
    <div class="ru-v-ejs"><span class="lb">Sus ejercicios</span>${K.ejCaras(h.ejs, r.familia, {n: 12, px: 48, ir: true})}</div></section>`;
};
