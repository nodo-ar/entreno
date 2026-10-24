/* ===== Las piezas de Planes: una prueba (su escala, tus veces, cuándo toca) y una rutina (su vistazo, sus días).
   La pantalla de Planes, con sus estantes, está en planes.js; la biblioteca de ejercicios, en ejercicios.js. ===== */
const pideTx = falta => `Pide ${K.pide(falta)}`;

/* ===== Pruebas: la escala, tus veces y cuándo toca. Lo mismo en Planes, en la sesión y en el resumen. ===== */
K.hzDe = id => K.HAZANAS.hazanas.find(x => x.id === id) || null;
const hzMejor = h => K.cielo.TIPOS[h.mide.tipo].mejor;
/* una marca, entera («×9», «8,5 puntos», «12:40») y corta, para debajo de la escala («9», «8,5», «12:40») */
K.hzMarca = (h, v) => K.cielo.corto(h.mide, v);
const hzCorta = (h, v) => h.mide.tipo === "tiempo" ? K.reloj(v) : h.mide.tipo === "cm" ? `${v > 0 ? "+" : v < 0 ? "−" : ""}${K.cielo.coma(Math.abs(v))}` : K.cielo.coma(v);
K.hzVeces = h => K.rutina.veces(h, K.diario.sesiones);
/* la medalla de una prueba donde sea que aparezca: a color si tu última vez ya tiene magnitud, en gris si no */
K.hzIcono = (h, px, lb) => { const vs = K.hzVeces(h), u = vs[vs.length - 1]; return K.icono.medalla(h, !!u && K.rutina.magnitud(h, u.valor, vs) !== null, px, lb); };
/* una estrella en una fila («Entrena para», «Enciende»): su constelación en su anillo */
const estFila = K.estFila = (c, e, sub, em) => `<button type="button" class="ajr" data-ir="#/cielo/${c.id}"><span class="tile ico-tile">${K.icono.constelacion(c, 40)}</span>
      <span class="ses-fila">${K.esc(e.nombre)}<small class="mute">${sub}</small></span><em>${em}</em>${K.ic("chev", "chev")}</button>`;
const mesDe = f => { const [a, m] = f.split("-").map(Number); return new Date(a, m - 1, 1).toLocaleDateString("es-AR", {month: "long"}); };
/* contra tu vez anterior: «+3 desde agosto», «0:40 menos desde agosto» */
K.hzDesde = (h, vs) => {
  if (!vs || vs.length < 2) return "";
  const a = vs[vs.length - 2], b = vs[vs.length - 1], d = Math.round((b.valor - a.valor) * 10) / 10, mes = mesDe(a.fecha);
  if (!d) return `Igual que en ${mes}`;
  if (h.mide.tipo === "tiempo") return `${K.reloj(Math.abs(d))} ${d < 0 ? "menos" : "más"} desde ${mes}`;
  const u = {cm: " cm", km: " km", segundos: " s"}[h.mide.tipo] || "";
  return `${d > 0 ? "+" : "−"}${K.cielo.coma(Math.abs(d))}${u} desde ${mes}`;
};
/* cuándo toca: «Toca ya», «En 9 días», «En 3 semanas» */
K.hzCuando = h => {
  const c = K.rutina.cuando(h, K.diario.sesiones, K.hoy());
  const ya = c.falta <= 0, tx = ya ? "Toca ya" : c.falta < 14 ? `En ${c.falta} ${c.falta === 1 ? "día" : "días"}` : `En ${Math.round(c.falta / 7)} semanas`;
  const hace = c.dias === null ? "" : c.dias === 0 ? "hoy" : c.dias < 14 ? `hace ${c.dias} ${c.dias === 1 ? "día" : "días"}` : `hace ${Math.round(c.dias / 7)} sem`;
  return {ya, tx, hace, nunca: c.dias === null};
};
/* la escala: cinco umbrales de la magnitud 5 a la 1, lo tuyo lleno hasta tu marca y la vez anterior como un anillo */
K.escala = (h, v, {vs = [], antes = null} = {}) => {
  const u = K.rutina.umbrales(h, vs);
  if (!u) return `<p class="escala-sin mute small">Tu primera vez arma tu escala: cada magnitud es un 5 % más.</p>`;
  const g = x => hzMejor(h) === "menos" ? -x : x, G = u.map(g);
  const t = x => {
    const y = g(x);
    if (y < G[0]) return Math.max(-.45, -(G[0] - y) / Math.abs(G[1] - G[0] || 1) * .5);
    for (let k = 0; k < 4; k++) if (y < G[k + 1]) return k + (y - G[k]) / (G[k + 1] - G[k]);
    return 4 + Math.min(.45, (y - G[4]) / Math.abs(G[4] - G[3] || 1) * .5);
  };
  const pos = x => Math.max(2, Math.min(98, (t(x) + .5) * 20)).toFixed(1);
  const tieneV = Number.isFinite(v), m = tieneV ? K.rutina.magnitud(h, v, vs) : null, hasta = tieneV ? t(v) : -1;
  const aria = tieneV ? `Tu marca: ${K.hzMarca(h, v)}, ${m ? `magnitud ${m}` : "todavía sin magnitud"}` : "Todavía sin marca";
  return `<div class="escala" style="--c:var(--${h.familia})" role="img" aria-label="${K.esc(`Escala de ${h.nombre}. ${aria}`)}">
    <div class="esc-pista">${tieneV ? `<i class="esc-lleno" style="width:${pos(v)}%"></i>` : ""}${u.map((_, k) => `<i class="esc-tick${k <= hasta + 1e-9 ? " si" : ""}" style="left:${(k + .5) * 20}%"></i>`).join("")}
      ${Number.isFinite(antes) ? `<i class="esc-antes" style="left:${pos(antes)}%"></i>` : ""}${tieneV ? `<i class="esc-yo" style="left:${pos(v)}%"></i>` : ""}</div>
    <div class="esc-pie" aria-hidden="true">${u.map((x, k) => `<span style="left:${(k + .5) * 20}%"><b class="num">${K.esc(hzCorta(h, x))}</b><small>m${5 - k}</small></span>`).join("")}</div></div>`;
};
/* tus veces, en una línea: lo mejor arriba */
K.hzLinea = (h, vs) => {
  const xs = (vs || []).slice(-6); if (xs.length < 2) return "";
  const g = x => hzMejor(h) === "menos" ? -x : x, ys = xs.map(x => g(x.valor)), lo = Math.min(...ys), hi = Math.max(...ys), W = 72, H = 22;
  const p = ys.map((y, i) => [3 + i * (W - 6) / (ys.length - 1), hi === lo ? H / 2 : H - 3 - (y - lo) / (hi - lo) * (H - 6)]);
  return `<svg class="hz-linea" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" style="--c:var(--${h.familia})"><polyline points="${p.map(q => q.map(n => n.toFixed(1)).join(",")).join(" ")}"/>
    <circle cx="${p[p.length - 1][0].toFixed(1)}" cy="${p[p.length - 1][1].toFixed(1)}" r="3"/></svg>`;
};
const hzPuede = h => { const q = K.tuEquipo(); if (!q) return []; return [...new Set([h.mide.ejercicio, ...(h.items || []).map(x => x.ejercicio)].flatMap(e => K.ej(e).equipo || []).filter(x => !q.includes(x)))]; };

/* «Prueba en la semana 5», «Esta semana: semana de prueba» */
K.pruebaTx = (sp, r) => !sp ? "" : sp.meta ? "Esta semana es la meta" : sp.toca ? "Esta semana es de prueba" : sp.aplazada ? "La prueba espera: volvé a agarrar ritmo"
  : !sp.proxima || sp.proxima > r.semanas ? (sp.semanaMeta ? `La meta, en la semana ${sp.semanaMeta}` : "La rutina termina antes de la próxima prueba") : `Prueba en la semana ${sp.proxima}`;
/* «Semana 4: prueba», «Semana 6: la meta» */
K.semanaTx = (r, w) => { const t = K.rutina.tipoSemana(r, w).tipo; return `Semana ${w}${t === "prueba" ? ": prueba" : t === "meta" ? ": la meta" : ""}`; };
/* cómo se arman sus semanas: «Bloques de 4 semanas: 3 de carga y 1 de prueba»; con meta, cuándo son las pruebas y la meta */
K.bloqueTx = r => {
  const bl = r.bloque || {carga: 4, prueba: 1}, xs = K.rutina.semanas(r), meta = xs.find(x => x.tipo === "meta");
  if (!meta) return `Bloques de ${bl.carga + bl.prueba} semanas: ${bl.carga} de carga y ${bl.prueba} de prueba`;
  const ps = xs.filter(x => x.tipo === "prueba").map(x => x.n);
  const pr = !ps.length ? "" : ps.length === 1 ? `Prueba en la semana ${ps[0]}` : `Pruebas en las semanas ${ps.slice(0, -1).join(", ")} y ${ps[ps.length - 1]}`;
  return `${pr ? pr + "; la " : "La "}${meta.n}, la meta`;
};

/* una rutina: qué es, hacia qué estrellas lleva, cómo es una semana y la fuente al pie */
K.P.rutina = id => {
  const r = K.rutinaDe(id), ru = K.rutinaActual(), sigo = ru && ru.r.id === id;
  const cielo = K.cieloActual(), falta = K.rutina.falta(r, K.EJ, K.tuEquipo());
  const enc = K.enc({titulo: r.nombre, sub: "Planes", volver: "#/planes", raiz: true, det: true, acciones: sigo ? K.mas("rut-mas", "Opciones de la rutina") : ""});
  const est = r.alimenta.map(eid => { const c = cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid)); return c && {c, e: c.estrellas.find(y => y.id === eid)}; }).filter(Boolean);
  const lleva = est.length ? `<span class="lb pie">Entrena para</span><section class="aj">${est.map(({c, e}) => estFila(c, e, K.esc(c.nombre), e.encendida ? "Encendida" : e.estado === "proxima" ? "La próxima" : "")).join("")}</section>` : "";
  /* cada día de una semana: lo que harías en cada uno con tus escalones de ahora, cuánto dura y cuál te toca */
  const dias = K.rutinaDias(r, sigo ? ru.cur : null);
  /* sus escaleras: por dónde vas en cada una (sin haberla empezado, por dónde arrancarías), igual que en Hoy */
  const es = K.rutina.escalerasDe(r, {...K.ctxRutina(), nivelDesde: K.desdeTuNivel()});
  const escaleras = es.length ? `<span class="lb pie">${sigo ? "Tus escalones" : "Sus escaleras"}</span><section class="cd rut-esc">${K.escalerasMini(es, r.familia)}</section>` : "";
  /* el bloque: semanas de carga y una de prueba */
  const sp = sigo && !ru.cur.terminada ? K.plan.semanaDePrueba(K.diario.perfil, K.diario.sesiones, K.hoy()) : null;
  const bloque = `<p class="ln small rut-bloque"><span>${K.esc(K.bloqueTx(r))}</span>${sp ? `<span class="num">${K.esc(K.pruebaTx(sp, r))}</span>` : ""}</p>`;
  const estado = sigo ? `<p class="ln small rut-sigo"><span>${ru.cur.terminada ? "La terminaste" : K.jer("La seguís", `semana ${ru.cur.semana} de ${r.semanas}`)}</span><span class="num">${ru.cur.i} de ${ru.cur.total}</span></p>` : "";
  const boton = sigo ? `<button type="button" class="btn" data-ir="#/hoy">${ru.cur.terminada ? "Volver a Hoy" : "Ir a Hoy"}</button>`
    : `<button type="button" class="btn" id="rut-seguir" data-rutina="${r.id}">Seguir esta rutina</button>`;
  /* el escalón es de la persona: cambiar de rutina no la manda al principio */
  const tuyo = !sigo && es.length ? `<p class="small mute rut-escalon">El escalón es tuyo: arrancás donde ya estás o desde tu nivel.</p>` : "";
  return enc + `<div class="rut"><p class="ayuda">${K.esc(r.texto)}</p>
    ${K.rutinaVistazo(r, sigo ? ru.cur : null)}
    ${falta.length ? `<p class="aviso-tenue">${K.esc(pideTx(falta))}. Si lo tenés, marcalo en tu equipo.</p>` : ""}${estado}${bloque}
    ${escaleras}${dias}${lleva}
    ${boton}${tuyo}${r.fuente ? `<p class="pie small mute">Fuente: ${K.esc(r.fuente)}.</p>` : ""}</div>`;
};
/* ===== Los días de una rutina: qué te tocaría cada día =====
   Una tarjeta por día, con las mismas filas que «Hoy toca»: en cada escalera, el ejercicio de tu escalón con series × rango;
   en lo de motor, qué es y cuánto. El día que sigue dice «Te toca» y es igual a Hoy. Las semanas se eligen con un menú. */
/* un día de la rutina en el molde, como lo harías hoy; en la semana de prueba, lo de motor a la mitad */
const diaMolde = (r, i, ctx) => {
  const p = K.dia.deRutina(r, i, ctx), bs = ctx.descarga ? p.bloques.map(b => b.clase === "tramos" && b.molde !== "entrada" && b.molde !== "cierre" ? K.plan.mitadTramos(b) : b) : p.bloques;
  return {minutos: ctx.descarga ? K.dia.minutosDe(bs) : p.minutos, bloques: bs, nota: p.nota || ""};
};
K._semRut = null; /* la semana elegida en el menú, por rutina; sin elegir, la tuya o la primera */
const semanaVista = (r, actual) => { const x = K._semRut; return x && x.id === r.id && x.n >= 1 && x.n <= r.semanas ? x.n : actual || 1; };
K.rutinaDias = (r, cur) => {
  const ctx = K.ctxRutina(), actual = cur && !cur.terminada ? cur.semana : 0, n = semanaVista(r, actual);
  const prueba = K.rutina.esSemanaDePrueba(r, n), meta = K.rutina.esMeta(r, n), conEsc = r.sesiones.some(s => s.bloques.some(b => b.escalera));
  const cards = Array.from({length: r.dias}, (_, k) => {
    const i = (n - 1) * r.dias + k; if (!r.sesiones[i]) return "";
    const toca = actual === n && i === cur.i, hecho = actual === n && i < cur.i, nombre = K.rutina.nombreDia(r, i);
    if (hecho) return `<section class="cd hoy-toca rut-dia hecho"><div class="ln"><span class="lb">${K.jer(K.esc(nombre[0]), K.esc(nombre[1]))}</span><span class="lb tg">${K.ic("check")}Hecho</span></div></section>`;
    /* el día que te toca es el mismo que muestra Hoy, con las pruebas si es semana de prueba */
    /* boceto: cada día en el mismo molde que Hoy (por partes), con tus escalones desde tu nivel */
    const pl = toca ? K.hoyPlan() : null;
    const d = pl ? {minutos: pl.minutos, bloques: pl.bloques, nota: pl.nota || ""} : diaMolde(r, i, {...ctx, nivelDesde: K.desdeTuNivel(), descarga: prueba});
    return `<section class="cd hoy-toca rut-dia${toca ? " te-toca" : ""}"><div class="ln"><span class="lb">${toca ? `<b class="te-toca-tx">Te toca</b> ` : ""}${K.jer(K.esc(nombre[0]), K.esc(nombre[1]))}</span><span class="num lb">${K.dur(`${d.minutos} min`)}</span></div>
      ${pl ? K.pruebaLn(pl) : ""}${K.filasMolde(d.bloques)}${d.nota ? `<p class="mute small">${K.esc(d.nota)}</p>` : ""}</section>`;
  }).join("");
  /* lo que hay que saber de esa semana: si es de prueba, cuándo es la próxima y que los escalones son los tuyos */
  const tuyos = conEsc ? (actual ? "Con tus escalones de hoy." : "Si la empezás hoy, con tus escalones.") : "";
  const tx = prueba && actual !== n ? `<p class="hoy-ventana hoy-sp small">${K.aparte(`<b>Semana ${n}: prueba</b>`, "Más liviana, con las pruebas el primer día")}</p>`
    : meta && actual !== n ? K.metaLn(r, n) : tuyos ? `<p class="small mute rut-dias-tx">${K.esc(tuyos)}</p>` : "";
  const boton = r.semanas > 1 ? `<button type="button" class="pl-fam" id="rut-sem" data-rutina="${r.id}" aria-haspopup="menu" aria-expanded="false" aria-label="${K.esc(`Semana ${n} de ${r.semanas}`)}"><span>${K.jer(K.esc(K.semanaTx(r, n)), !prueba && !meta && actual === n ? "la tuya" : "")}</span>${K.ic("chevd")}</button>` : "";
  return `<div class="pl-fila rut-dias-tit"><span class="lb pie">Cada día</span>${boton}</div>${tx}<div class="rut-dias">${cards}</div>`;
};
/* el menú de semanas: la tuya y las de prueba se dicen; elegir una no guarda nada */
K.rutinaSemana = btn => {
  const r = K.rutinaDe(btn.dataset.rutina); if (!r) return;
  const ru = K.rutinaActual(), actual = ru && ru.r.id === r.id && !ru.cur.terminada ? ru.cur.semana : 0, n = semanaVista(r, actual);
  K.menu.abrir(btn, {titulo: "Semana", items: Array.from({length: r.semanas}, (_, k) => k + 1).map(w => ({id: String(w), elegido: w === n,
      texto: K.semanaTx(r, w), ...(w === actual ? {nota: "la tuya"} : {})})),
    elegir: id => { const ab = K.$(".split>.abierto"), y = ab ? ab.scrollTop : 0; K._semRut = {id: r.id, n: Number(id)}; K.refrescar(); const ab2 = K.$(".split>.abierto"); if (ab2) ab2.scrollTop = y; }});
};

/* seguir una rutina o dejarla: se hace y se ofrece deshacer */
K.rutinaPoner = async (v, txt) => {
  const antes = K.diario.perfil.rutina;
  const poner = async x => { try { await K.diario.lote({perfil: {rutina: x}}); return true; } catch (e) { K.aviso("No se pudo guardar en este teléfono."); return false; } finally { K.refrescar(); } };
  if (!await poner(v)) return;
  K.deshacer(txt, () => poner(antes));
};
K.rutinaSeguir = id => { const r = K.rutinaDe(id); if (r) K.rutinaPoner({id, desde: K.hoy()}, `Seguís ${r.nombre}`).then(() => K.ir("#/hoy")); };
K.rutinaDejar = () => { const ru = K.rutinaActual(); K.rutinaPoner(undefined, ru ? `Dejaste ${ru.r.nombre}` : "Dejaste la rutina"); };
K.rutinaMenu = btn => K.menu.abrir(btn, {titulo: "Rutina", items: [{id: "dejar", texto: "Dejar la rutina", ic: "x"}], elegir: () => K.rutinaDejar()});

/* ===== Una prueba (hazaña): qué mide, tu escala, tus veces, qué estrellas enciende y la fuente al pie ===== */
/* lo de antes: las hazañas por niveles guardaban un tiempo, unas vueltas o «hecha» */
K.hazanaValor = (h, v, corto) => { const f = h.antes ? h.antes.formato : h.formato;
  return f === "amrap" ? (corto ? String(v) : `${v} ${v === 1 ? "vuelta" : "vueltas"}`) : f === "tiempo" || f === "chipper" ? K.reloj(v) : "hecha"; };
K.P.hazana = (id, volver = "#/planes") => {
  const h = K.hzDe(id), vs = K.hzVeces(h), ult = vs[vs.length - 1], cu = K.hzCuando(h), viejas = K.rutina.anteriores(h, K.diario.sesiones);
  const m = ult ? K.rutina.magnitud(h, ult.valor, vs) : null, falta = hzPuede(h);
  const desde = K.hzDesde(h, vs);
  const tu = `<section class="cd hz-escala"><div class="ln"><span class="lb">${ult ? K.jer("Tu última", K.esc(K.fechaCorta(ult.fecha))) : "Todavía no la hiciste"}</span>${ult ? `<span class="num hz-ult">${K.esc(K.hzMarca(h, ult.valor))}${m ? ` <small class="mute">m${m}</small>` : ""}</span>` : ""}</div>
    ${K.escala(h, ult?.valor, {vs, antes: vs[vs.length - 2]?.valor})}
    <div class="ln small"><span class="${vs.length > 1 && K.rutina.supera(h, ult.valor, vs[vs.length - 2].valor) ? "hz-sube" : "mute"}">${K.esc(desde || (ult ? "Tu primera vez" : h.texto))}</span><span class="num${cu.ya ? " toca" : ""}">${K.esc(cu.tx)}</span></div></section>`;
  /* las estrellas que puede encender, en todo el cielo */
  const cielo = K.cieloActual();
  const est = (h.estrellas || []).map(eid => { const c = cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid)); return c && {c, e: c.estrellas.find(y => y.id === eid)}; }).filter(Boolean);
  const enciende = est.length ? `<span class="lb pie">Enciende</span><section class="aj">${est.map(({c, e}) => estFila(c, e, K.jer(K.esc(c.nombre), `m${e.magnitud}`), e.encendida ? "Encendida" : "")).join("")}</section>` : "";
  /* tus veces, la última arriba; las de la versión anterior (por niveles) quedan al final, con su nivel */
  const filas = [...vs].reverse().map(x => { const g = K.rutina.magnitud(h, x.valor, vs);
    return `<div class="ln"><span>${K.esc(K.fechaCorta(x.fecha))}</span><span class="num">${K.esc(K.hzMarca(h, x.valor))}${g ? ` <small class="mute">m${g}</small>` : ""}</span></div>`; }).join("")
    + [...viejas].reverse().map(x => `<div class="ln mute"><span>${K.jer(K.esc(K.fechaCorta(x.fecha)), `versión anterior, ${K.rutina.NIVELES[x.nivel] || ""}`)}</span><span class="num">${x.completa && x.valor > 0 ? K.esc(K.hazanaValor(h, x.valor)) : "a medias"}</span></div>`).join("");
  const veces = filas ? `<span class="lb pie">Tus veces</span><section class="cd hz-veces">${filas}</section>` : "";
  const boton = falta.length ? `<p class="aviso-tenue">${K.esc(pideTx(falta))}. Si lo tenés, marcalo en tu equipo.</p>`
    : `<button type="button" class="btn" id="hz-empezar" data-hazana="${h.id}">${K.ic("play")}Probar ahora</button>`;
  /* arriba del nombre, su tema y su nivel: «Tirar, inicial»; la medalla lleva los satélites de su nivel */
  const tema = K.biblio.grupo(h.tema), sub = tema && h.nivel ? `${tema[1]}, ${K.biblio.NIVELES[h.nivel - 1].toLowerCase()}` : "Prueba";
  return K.enc({titulo: h.nombre, sub, volver, raiz: true, det: true}) +
    `<div class="hzn"><div class="hz-cab"><span class="hz-fig">${K.icono.medalla(h, m !== null, 88, "", h.nivel)}</span><p class="ayuda">${K.esc(h.texto)}</p></div>${tu}
    <section class="cd hz-como"><span class="lb">Cómo se hace</span><p>${K.esc(h.como)}</p></section>
    ${enciende}${veces}${boton}${h.fuente ? `<p class="pie small mute">Fuente: ${K.esc(h.fuente)}.</p>` : ""}</div>`;
};
