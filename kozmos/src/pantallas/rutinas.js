/* ===== Planes: la próxima prueba arriba, las pruebas (hazañas) y tu rutina abajo, y las otras rutinas al final.
   En horizontal, la lista a la izquierda y lo abierto a la derecha; en vertical, uno por pantalla.
   Rutas: #/planes · #/planes/rutinas/<id> · #/planes/hazanas/<id> ===== */
const pideTx = falta => `Pide ${K.pide(falta)}`;

/* ===== Pruebas: la escala, tus veces y cuándo toca. Lo mismo en Planes, en la sesión y en el resumen. ===== */
K.hzDe = id => K.HAZANAS.hazanas.find(x => x.id === id) || null;
const hzMejor = h => K.cielo.TIPOS[h.mide.tipo].mejor;
/* una marca, entera («×9», «8,5 puntos», «12:40») y corta, para debajo de la escala («9», «8,5», «12:40») */
K.hzMarca = (h, v) => K.cielo.corto(h.mide, v);
const hzCorta = (h, v) => h.mide.tipo === "tiempo" ? K.reloj(v) : h.mide.tipo === "cm" ? `${v > 0 ? "+" : v < 0 ? "−" : ""}${K.cielo.coma(Math.abs(v))}` : K.cielo.coma(v);
K.hzVeces = h => K.rutina.veces(h, K.diario.sesiones);
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
  return `<div class="escala" style="--c:var(--${h.familia})" role="img" aria-label="${K.esc(`Escala de ${h.prueba}. ${aria}`)}">
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
const hzPuede = h => { const q = K.diario.perfil.equipo; if (!q) return []; return [...new Set([h.mide.ejercicio, ...(h.items || []).map(x => x.ejercicio)].flatMap(e => K.ej(e).equipo || []).filter(x => !q.includes(x)))]; };

/* ===== Lo que se elige en Planes: la familia de las pruebas y la de las rutinas, con un menú ===== */
const FAM = () => [{id: "todas", nombre: "Todas"}, ...K.CATALOGO.familias];
const famNombre = id => (FAM().find(f => f.id === id) || FAM()[0]).nombre;
const famDe = k => { const v = K.prefs.get(k, "todas"); return FAM().some(f => f.id === v) ? v : "todas"; };
K.planesFamilia = btn => {
  const k = btn.id === "pl-fam-pruebas" ? "planes.pruebas" : "planes.rutinas", v = famDe(k);
  K.menu.abrir(btn, {titulo: "Familia", items: FAM().map(f => ({id: f.id, texto: f.nombre, elegido: f.id === v, ...(f.id !== "todas" ? {color: `var(--${f.id})`} : {})})),
    elegir: id => { K.prefs.set(k, id); K.refrescar(); }});
};
const famBoton = (id, k) => `<button type="button" class="pl-fam" id="${id}" aria-haspopup="menu" aria-expanded="false" aria-label="Familia: ${K.esc(famNombre(famDe(k)))}"><span>${K.esc(famNombre(famDe(k)))}</span>${K.ic("chevd")}</button>`;

K.P.planes = r => {
  const hz = K.horizontal(), ru = K.rutinaActual(), hs = K.HAZANAS.hazanas, equipo = K.diario.perfil.equipo || null;
  const prox = K.rutina.proximaPrueba(hs, K.diario.sesiones, K.hoy(), {ej: K.EJ, equipo}) || hs[0];
  /* en horizontal algo queda abierto: la rutina que seguís o, si no, la próxima prueba */
  const selR = r.sub === "rutinas" ? r.sub2 : "", selH = r.sub === "hazanas" ? r.sub2 : "";
  const sigo = ru && !ru.cur.terminada;
  const abreR = selR || (!selH && hz && sigo ? ru.r.id : ""), abreH = selH || (!abreR && hz ? prox.id : "");
  const abierto = abreR ? K.P.rutina(abreR) : abreH ? K.P.hazana(abreH) : "";
  /* la próxima prueba: la figura, tu última marca en su escala, tus veces y «Probar ahora» a mano */
  const vs = K.hzVeces(prox), ult = vs[vs.length - 1], cu = K.hzCuando(prox), m = ult ? K.rutina.magnitud(prox, ult.valor, vs) : null;
  const tarjeta = `<section class="cd pl-prox" style="--c:var(--${prox.familia})"${abreH === prox.id ? " data-sel" : ""}>
    <button type="button" class="pl-ir" data-ir="#/planes/hazanas/${prox.id}" data-quieto="1" aria-label="${K.esc(`${prox.nombre}, ${prox.prueba}`)}"></button>
    <div class="pl-prox-cab"><span class="pl-prox-fig">${K.dibujo.figura(prox, 64, m !== null)}</span><div class="pl-prox-tx"><span class="lb">Próxima prueba · ${K.esc(cu.tx.toLowerCase())}</span>
      <b class="t1">${K.esc(prox.nombre)}</b><span class="mute small">${K.esc(prox.prueba)}${ult ? ` · tu última ${K.esc(K.hzMarca(prox, ult.valor))}${m ? ` · m${m}` : ""}` : " · todavía no la hiciste"}</span></div>${K.hzLinea(prox, vs)}</div>
    ${K.escala(prox, ult?.valor, {vs, antes: vs[vs.length - 2]?.valor})}
    <button type="button" class="btn" id="pl-probar" data-hazana="${prox.id}">${K.ic("play")}Probar ahora</button></section>`;
  /* las pruebas, por familia: cada una con tu última marca y cuándo toca */
  const fp = famDe("planes.pruebas");
  const pruebas = hs.filter(h => h.id !== prox.id && (fp === "todas" || h.familia === fp)).map(h => {
    const v = K.hzVeces(h), u = v[v.length - 1], c = K.hzCuando(h), mg = u ? K.rutina.magnitud(h, u.valor, v) : null, falta = hzPuede(h);
    return `<button type="button" class="ajr" data-ir="#/planes/hazanas/${h.id}" data-quieto="1"${abreH === h.id ? " data-sel" : ""}><span class="tile fig">${K.dibujo.figura(h, 26, mg !== null)}</span>
      <span class="ses-fila">${K.esc(h.nombre)}<small class="mute">${K.esc(falta.length ? `${h.prueba} · ${pideTx(falta)}` : `${h.prueba}${u ? ` · ${K.hzMarca(h, u.valor)}${mg ? ` · m${mg}` : ""}` : ""}`)}</small></span>
      <em class="num${c.ya && !c.nunca ? " toca" : ""}">${K.esc(c.nunca ? "Sin hacer" : c.ya ? "Toca ya" : c.hace)}</em>${K.ic("chev", "chev")}</button>`;
  }).join("");
  /* tu rutina: el bloque, tus escalones y cuándo es la prueba */
  let tuya = "";
  if (sigo){
    const sp = K.plan.semanaDePrueba(K.diario.perfil, K.diario.sesiones, K.hoy()), es = K.rutina.escalerasDe(ru.r, K.ctxRutina());
    tuya = `<div class="pl-tit"><h2>Tu rutina</h2></div><section class="cd pl-rut"${abreR === ru.r.id ? " data-sel" : ""}>
      <button type="button" class="pl-ir" data-ir="#/planes/rutinas/${ru.r.id}" data-quieto="1" aria-label="${K.esc(ru.r.nombre)}"></button>
      <span class="ln"><b>${K.esc(ru.r.nombre)}</b>${K.ic("chev", "chev")}</span><span class="mute small">Semana ${ru.cur.semana} de ${ru.r.semanas}${sp ? ` · bloque ${sp.bloque}` : ""}</span>
      ${es.length ? K.escalerasMini(es, ru.r.familia) : ""}<span class="small pl-rut-prueba">${K.esc(K.pruebaTx(sp, ru.r))}</span></section>`;
  }
  const fr = famDe("planes.rutinas");
  const fila = x => { const falta = K.rutina.falta(x, K.EJ, equipo);
    return `<button type="button" class="ajr" data-ir="#/planes/rutinas/${x.id}" data-quieto="1"${abreR === x.id ? " data-sel" : ""}><span class="tile"><i class="dot" style="--c:var(--${x.familia})"></i></span>
      <span class="ses-fila">${K.esc(x.nombre)}${falta.length ? `<small class="mute">${K.esc(pideTx(falta))}</small>` : ""}</span><em class="num">${x.semanas} sem · ${x.dias} días</em>${K.ic("chev", "chev")}</button>`; };
  const otras = K.RUTINAS.filter(x => !(sigo && x.id === ru.r.id) && (fr === "todas" || x.familia === fr)).map(fila).join("");
  /* el primer día, Planes es el paso 2 si venís a elegir una rutina */
  const paso = K.primerDia() && !ru && !K.rumbo().length ? K.pasos(2) : "";
  return `<div class="split${r.sub2 ? " en-detalle" : ""}"><div class="lado">${K.enc({titulo: "Planes", sub: "Pruebas y rutinas"})}${paso}${tarjeta}
    <div class="pl-tit pl-fila" id="pl-hazanas"><h2>Pruebas</h2>${famBoton("pl-fam-pruebas", "planes.pruebas")}</div>${pruebas ? `<section class="aj">${pruebas}</section>` : `<p class="mute small pl-nada">Nada más en esta familia.</p>`}
    ${tuya}<div class="pl-tit pl-fila" id="pl-rutinas"><h2>${sigo ? "Otras rutinas" : "Rutinas"}</h2>${famBoton("pl-fam-rutinas", "planes.rutinas")}</div>
    ${otras ? `<section class="aj">${otras}</section>` : `<p class="mute small pl-nada">Nada más en esta familia.</p>`}</div>
    <div class="abierto">${abierto}</div></div>`;
};
/* «Prueba en la semana 5», «Esta semana: semana de prueba» */
K.pruebaTx = (sp, r) => !sp ? "" : sp.toca ? "Esta semana es de prueba" : sp.aplazada ? "La prueba espera: volvé a agarrar ritmo"
  : sp.proxima > r.semanas ? "La rutina termina antes de la próxima prueba" : `Prueba en la semana ${sp.proxima}`;

/* una rutina: qué es, hacia qué estrellas lleva, cómo es una semana y la fuente al pie */
K.P.rutina = id => {
  const r = K.rutinaDe(id), ru = K.rutinaActual(), sigo = ru && ru.r.id === id;
  const cielo = K.cieloActual(), falta = K.rutina.falta(r, K.EJ, K.diario.perfil.equipo || null);
  const enc = K.enc({titulo: r.nombre, sub: "Planes", volver: "#/planes", raiz: true, det: true, acciones: sigo ? K.mas("rut-mas", "Opciones de la rutina") : ""});
  const dato = (n, t) => `<div class="cd res-dato"><span class="num">${K.esc(n)}</span><span class="lb">${t}</span></div>`;
  const est = r.alimenta.map(eid => { const c = cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid)); return c && {c, e: c.estrellas.find(y => y.id === eid)}; }).filter(Boolean);
  const lleva = est.length ? `<span class="lb pie">Entrena para</span><section class="aj">${est.map(({c, e}) => `<button type="button" class="ajr" data-ir="#/cielo/${c.id}">${K.POSES[e.prueba.ejercicio] ? `<span class="tile fig-tile">${K.fig.chica(e.prueba.ejercicio, c.familia)}</span>` : `<span class="tile"><i class="dot" style="--c:var(--${c.familia})"></i></span>`}
      <span class="ses-fila">${K.esc(e.nombre)}<small class="mute">${K.esc(c.nombre)}</small></span><em>${e.encendida ? "Encendida" : e.estado === "proxima" ? "La próxima" : ""}</em>${K.ic("chev", "chev")}</button>`).join("")}</section>` : "";
  /* una semana: la que vas, o la primera */
  const sem = sigo && !ru.cur.terminada ? ru.cur.semana - 1 : 0, desde = sem * r.dias;
  const semana = r.sesiones.slice(desde, desde + r.dias).map((s, k) => {
    const plan = K.rutina.deRutina(r, desde + k, K.ctxRutina());
    const actual = sigo && !ru.cur.terminada && desde + k === ru.cur.i;
    return `<div class="ln rut-dia${actual ? " hoy" : ""}"><span>Día ${k + 1} · ${K.esc(s.nombre)}</span><span class="num mute">${plan.minutos} min</span></div>`;
  }).join("");
  /* sus escaleras: por dónde vas en cada una (sin haberla empezado, por dónde arrancarías), igual que en Hoy */
  const es = K.rutina.escalerasDe(r, K.ctxRutina());
  const escaleras = es.length ? `<span class="lb pie">${sigo ? "Tus escalones" : "Sus escaleras"}</span><section class="cd rut-esc">${K.escalerasMini(es, r.familia)}</section>` : "";
  /* el bloque: semanas de carga y una de prueba */
  const bl = r.bloque || {carga: 4, prueba: 1}, sp = sigo && !ru.cur.terminada ? K.plan.semanaDePrueba(K.diario.perfil, K.diario.sesiones, K.hoy()) : null;
  const bloque = `<p class="ln small rut-bloque"><span>Bloques de ${bl.carga + bl.prueba} semanas: ${bl.carga} de carga y ${bl.prueba} de prueba</span>${sp ? `<span class="num">${K.esc(K.pruebaTx(sp, r))}</span>` : ""}</p>`;
  const estado = sigo ? `<p class="ln small rut-sigo"><span>${ru.cur.terminada ? "La terminaste" : `La seguís · semana ${ru.cur.semana} de ${r.semanas}`}</span><span class="num">${ru.cur.i} de ${ru.cur.total}</span></p>` : "";
  const boton = sigo ? `<button type="button" class="btn" data-ir="#/hoy">${ru.cur.terminada ? "Volver a Hoy" : "Ir a Hoy"}</button>`
    : `<button type="button" class="btn" id="rut-seguir" data-rutina="${r.id}">Seguir esta rutina</button>`;
  /* el escalón es de la persona: cambiar de rutina no la manda al principio */
  const tuyo = !sigo && es.length ? `<p class="small mute rut-escalon">El escalón es tuyo: arrancás donde ya estás en cada escalera.</p>` : "";
  return enc + `<div class="rut"><p class="ayuda">${K.esc(r.texto)}</p>
    <div class="res-datos">${dato(r.semanas, "semanas")}${dato(r.dias, "días por semana")}${dato(r.minutos, "min")}</div>
    ${falta.length ? `<p class="aviso-tenue">${K.esc(pideTx(falta))}. Si lo tenés, marcalo en tu equipo.</p>` : ""}${estado}${bloque}
    ${escaleras}${lleva}<span class="lb pie">${sigo && !ru.cur.terminada ? `Tu semana ${sem + 1}` : "La primera semana"}</span><section class="cd rut-semana">${semana}</section>
    ${boton}${tuyo}${r.fuente ? `<p class="pie small mute">Fuente: ${K.esc(r.fuente)}.</p>` : ""}</div>`;
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
K.P.hazana = id => {
  const h = K.hzDe(id), vs = K.hzVeces(h), ult = vs[vs.length - 1], cu = K.hzCuando(h), viejas = K.rutina.anteriores(h, K.diario.sesiones);
  const m = ult ? K.rutina.magnitud(h, ult.valor, vs) : null, falta = hzPuede(h);
  const desde = K.hzDesde(h, vs);
  const tu = `<section class="cd hz-escala"><div class="ln"><span class="lb">${ult ? `Tu última · ${K.esc(K.fechaCorta(ult.fecha))}` : "Todavía no la hiciste"}</span>${ult ? `<span class="num hz-ult">${K.esc(K.hzMarca(h, ult.valor))}${m ? ` · m${m}` : ""}</span>` : ""}</div>
    ${K.escala(h, ult?.valor, {vs, antes: vs[vs.length - 2]?.valor})}
    <div class="ln small"><span class="${vs.length > 1 && K.rutina.supera(h, ult.valor, vs[vs.length - 2].valor) ? "hz-sube" : "mute"}">${K.esc(desde || (ult ? "Tu primera vez" : h.texto))}</span><span class="num${cu.ya ? " toca" : ""}">${K.esc(cu.tx)}</span></div></section>`;
  /* las estrellas que puede encender, en todo el cielo */
  const cielo = K.cieloActual();
  const est = (h.estrellas || []).map(eid => { const c = cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid)); return c && {c, e: c.estrellas.find(y => y.id === eid)}; }).filter(Boolean);
  const enciende = est.length ? `<span class="lb pie">Enciende</span><section class="aj">${est.map(({c, e}) => `<button type="button" class="ajr" data-ir="#/cielo/${c.id}"><span class="tile"><i class="dot" style="--c:var(--${c.familia})"></i></span>
      <span class="ses-fila">${K.esc(e.nombre)}<small class="mute">${K.esc(c.nombre)} · m${e.magnitud}</small></span><em>${e.encendida ? "Encendida" : ""}</em>${K.ic("chev", "chev")}</button>`).join("")}</section>` : "";
  /* tus veces, la última arriba; las de la versión anterior (por niveles) quedan al final, con su nivel */
  const filas = [...vs].reverse().map(x => { const g = K.rutina.magnitud(h, x.valor, vs);
    return `<div class="ln"><span>${K.esc(K.fechaCorta(x.fecha))}</span><span class="num">${K.esc(K.hzMarca(h, x.valor))}${g ? ` <small class="mute">m${g}</small>` : ""}</span></div>`; }).join("")
    + [...viejas].reverse().map(x => `<div class="ln mute"><span>${K.esc(K.fechaCorta(x.fecha))} · versión anterior, ${K.rutina.NIVELES[x.nivel] || ""}</span><span class="num">${x.completa && x.valor > 0 ? K.esc(K.hazanaValor(h, x.valor)) : "a medias"}</span></div>`).join("");
  const veces = filas ? `<span class="lb pie">Tus veces</span><section class="cd hz-veces">${filas}</section>` : "";
  const boton = falta.length ? `<p class="aviso-tenue">${K.esc(pideTx(falta))}. Si lo tenés, marcalo en tu equipo.</p>`
    : `<button type="button" class="btn" id="hz-empezar" data-hazana="${h.id}">${K.ic("play")}Probar ahora</button>`;
  return K.enc({titulo: h.nombre, sub: `Prueba · ${h.prueba}`, volver: "#/planes", raiz: true, det: true}) +
    `<div class="hzn"><div class="hz-cab"><span class="hz-fig">${K.dibujo.figura(h, 88, m !== null)}</span><p class="ayuda">${K.esc(h.texto)}</p></div>${tu}
    <section class="cd hz-como"><span class="lb">Cómo se hace</span><p>${K.esc(h.como)}</p></section>
    ${enciende}${veces}${boton}${h.fuente ? `<p class="pie small mute">Fuente: ${K.esc(h.fuente)}.</p>` : ""}</div>`;
};
