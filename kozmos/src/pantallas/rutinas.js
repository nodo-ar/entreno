/* ===== Rutinas y hazañas: la lista a la izquierda y la abierta a la derecha en horizontal; en vertical, una por pantalla. =====
   Rutas: #/hoy/rutinas · #/hoy/rutinas/<id> · #/hoy/hazanas · #/hoy/hazanas/<id> */
const FAM = id => K.CATALOGO.familias.find(f => f.id === id);
const pideTx = falta => `Pide ${K.pide(falta)}`;

K.P.rutinas = r => {
  const sel = K.RUTINAS.some(x => x.id === r.sub2) ? r.sub2 : "", hz = K.horizontal(), ru = K.diario.perfil.rutina;
  const abre = sel || (hz ? (ru && K.rutinaDe(ru.id) ? ru.id : K.RUTINAS[0]?.id) : "");
  const equipo = K.diario.perfil.equipo || null;
  const lista = K.CATALOGO.familias.map(f => {
    const rs = K.RUTINAS.filter(x => x.familia === f.id); if (!rs.length) return "";
    return `<section class="fam"><span class="lb tg"><i class="dot" style="--c:var(--${f.id})"></i>${K.esc(f.nombre)}</span><div class="aj">${rs.map(x => {
      const falta = K.rutina.falta(x, K.EJ, equipo), sigo = ru && ru.id === x.id;
      return `<button type="button" class="ajr" data-ir="#/hoy/rutinas/${x.id}" data-quieto="1"${abre === x.id ? " data-sel" : ""}><span class="tile">${K.ic("ruta")}</span>
        <span class="ses-fila">${K.esc(x.nombre)}${falta.length ? `<small class="mute">${K.esc(pideTx(falta))}</small>` : ""}</span><em class="num">${sigo ? "La seguís" : `${x.semanas} sem · ${x.dias} días`}</em>${K.ic("chev", "chev")}</button>`;
    }).join("")}</div></section>`;
  }).join("");
  return `<div class="split${sel ? " en-detalle" : ""}"><div class="lado">${K.enc({titulo: "Rutinas", sub: "Hoy", volver: "#/hoy", raiz: true})}
    <p class="ayuda">Caminos fijos de semanas. Si seguís una, Hoy te da su sesión y sigue donde quedaste.</p>${lista}</div>
    <div class="abierto">${abre ? K.P.rutina(abre) : ""}</div></div>`;
};

/* una rutina: qué es, hacia qué estrellas lleva, cómo es una semana y la fuente al pie */
K.P.rutina = id => {
  const r = K.rutinaDe(id), ru = K.rutinaActual(), sigo = ru && ru.r.id === id;
  const cielo = K.cieloActual(), falta = K.rutina.falta(r, K.EJ, K.diario.perfil.equipo || null);
  const enc = K.enc({titulo: r.nombre, sub: "Rutinas", volver: "#/hoy/rutinas", raiz: true, det: true, acciones: sigo ? K.mas("rut-mas", "Opciones de la rutina") : ""});
  const dato = (n, t) => `<div class="cd res-dato"><span class="num">${K.esc(n)}</span><span class="lb">${t}</span></div>`;
  const est = r.alimenta.map(eid => { const c = cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid)); return c && {c, e: c.estrellas.find(y => y.id === eid)}; }).filter(Boolean);
  const lleva = `<span class="lb pie">Lleva a</span><section class="aj">${est.map(({c, e}) => `<button type="button" class="ajr" data-ir="#/cielo/${c.id}"><span class="tile"><i class="dot" style="--c:var(--${c.familia})"></i></span>
      <span class="ses-fila">${K.esc(e.nombre)}<small class="mute">${K.esc(c.nombre)}</small></span><em>${e.encendida ? "Encendida" : e.estado === "proxima" ? "La próxima" : ""}</em>${K.ic("chev", "chev")}</button>`).join("")}</section>`;
  /* una semana: la que vas, o la primera */
  const sem = sigo && !ru.cur.terminada ? ru.cur.semana - 1 : 0, desde = sem * r.dias;
  const semana = r.sesiones.slice(desde, desde + r.dias).map((s, k) => {
    const plan = K.rutina.deRutina(r, desde + k, {ej: K.EJ, equipo: K.diario.perfil.equipo || null, sesiones: K.diario.sesiones});
    const actual = sigo && !ru.cur.terminada && desde + k === ru.cur.i;
    return `<div class="ln rut-dia${actual ? " hoy" : ""}"><span>Día ${k + 1} · ${K.esc(s.nombre)}</span><span class="num mute">${plan.minutos} min</span></div>`;
  }).join("");
  const estado = sigo ? `<p class="ln small rut-sigo"><span>${ru.cur.terminada ? "La terminaste" : `La seguís · semana ${ru.cur.semana} de ${r.semanas}`}</span><span class="num">${ru.cur.i} de ${ru.cur.total}</span></p>` : "";
  const boton = sigo ? `<button type="button" class="btn" data-ir="#/hoy">${ru.cur.terminada ? "Volver a Hoy" : "Ir a Hoy"}</button>`
    : `<button type="button" class="btn" id="rut-seguir" data-rutina="${r.id}">Seguir esta rutina</button>`;
  return enc + `<div class="rut"><p class="ayuda">${K.esc(r.texto)}</p>
    <div class="res-datos">${dato(r.semanas, "semanas")}${dato(r.dias, "días por semana")}${dato(r.minutos, "min")}</div>
    ${falta.length ? `<p class="aviso-tenue">${K.esc(pideTx(falta))}. Si lo tenés, marcalo en tu equipo.</p>` : ""}${estado}
    ${lleva}<span class="lb pie">${sigo && !ru.cur.terminada ? `Tu semana ${sem + 1}` : "La primera semana"}</span><section class="cd rut-semana">${semana}</section>
    ${boton}${r.fuente ? `<p class="pie small mute">Fuente: ${K.esc(r.fuente)}.</p>` : ""}</div>`;
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

/* ===== Hazañas: pruebas de cierre con tres niveles ===== */
const formatoTx = (h, n) => ({
  tiempo: `${n.rondas} ${n.rondas === 1 ? "vuelta" : "vueltas"}, lo más rápido que puedas.`,
  chipper: "Todo en orden, una sola vez, lo más rápido que puedas.",
  amrap: `Todas las vueltas que entren en ${n.minutos} min.`,
  emom: `Al empezar cada minuto, lo que toca. ${n.minutos} min.`,
  intervalos: `${(n.tramos || []).filter(x => x.clase === "fuerte").length} pasadas fuertes, con pausa entre medio.`,
  flujo: `${(n.tramos || []).filter(x => x.clase === "postura").length} posturas, una detrás de otra.`
})[h.formato] || "";
K._nivel = {};
const nivelDe = h => K._nivel[h.id] ?? 0;
/* lo mejor que hiciste en una hazaña: el nivel más alto con su marca */
const mejorTx = h => {
  for (let n = 2; n >= 0; n--){ const m = K.rutina.mejorHazana(h, n, K.diario.sesiones); if (m !== null) return `${K.rutina.NIVELES[n]} · ${K.hazanaValor(h, m)}`; }
  return "";
};
K.P.hazanas = r => {
  const hs = K.HAZANAS.hazanas, sel = hs.some(x => x.id === r.sub2) ? r.sub2 : "", hz = K.horizontal(), abre = sel || (hz ? hs[0]?.id : "");
  const filas = hs.map(h => { const m = mejorTx(h);
    return `<button type="button" class="ajr" data-ir="#/hoy/hazanas/${h.id}" data-quieto="1"${abre === h.id ? " data-sel" : ""}><span class="tile" style="color:var(--${h.familia})">${K.ic("hazana")}</span>
      <span class="ses-fila">${K.esc(h.nombre)}<small class="mute">${K.esc(h.texto)}</small></span><em class="num">${K.esc(m || "")}</em>${K.ic("chev", "chev")}</button>`; }).join("");
  return `<div class="split${sel ? " en-detalle" : ""}"><div class="lado">${K.enc({titulo: "Hazañas", sub: "Hoy", volver: "#/hoy", raiz: true})}
    <p class="ayuda">Pruebas de cierre con tres niveles. Volvé cada tanto y medí cuánto avanzaste.</p><section class="aj">${filas}</section></div>
    <div class="abierto">${abre ? K.P.hazana(abre) : ""}</div></div>`;
};
const itemTx = x => `${x.reps ? `×${x.reps}` : x.seg ? `${x.seg} s` : x.min ? `${x.min} min` : ""}${x.ejercicio && K.ej(x.ejercicio).lado ? " por lado" : ""}`;
K.P.hazana = id => {
  const h = K.HAZANAS.hazanas.find(x => x.id === id), nv = nivelDe(h), n = h.niveles[nv];
  const plan = K.rutina.deHazana(h, nv, {ej: K.EJ, equipo: K.diario.perfil.equipo || null}), b = plan.bloques[0];
  /* lo que se hace: los ejercicios con su cantidad; en tramos, cada ejercicio una vez */
  const items = b.clase === "circuito" ? b.items : [...new Map(b.tramos.filter(x => x.ejercicio).map(x => [x.ejercicio, x])).values()];
  const filas = items.map(x => `<div class="ln"><span>${K.esc(x.ejercicio ? K.ej(x.ejercicio).nombre : x.nombre || "")}</span><span class="num">${K.esc(itemTx(x))}</span></div>`).join("")
    || b.tramos.filter(x => x.clase === "fuerte").slice(0, 1).map(x => `<div class="ln"><span>Fuerte</span><span class="num">${x.seg} s</span></div>`).join("");
  const mejor = K.rutina.mejorHazana(h, nv, K.diario.sesiones);
  return K.enc({titulo: h.nombre, sub: "Hazañas", volver: "#/hoy/hazanas", raiz: true, det: true}) +
    `<div class="hzn"><p class="ayuda">${K.esc(h.texto)}</p>
    <section class="aj"><button type="button" class="ajr" id="hz-nivel" data-hazana="${h.id}" aria-haspopup="menu" aria-expanded="false"><span class="tile">${K.ic("hazana")}</span><span>Nivel</span><em>${K.rutina.NIVELES[nv]}</em>${K.ic("chevd", "chev")}</button></section>
    <section class="cd hz-items"><span class="lb">${K.esc(formatoTx(h, n))}</span>${filas}
      <span class="ln mute small"><span>Tu mejor en este nivel</span><span class="num">${mejor === null ? "Todavía nada" : K.esc(K.hazanaValor(h, mejor))}</span></span></section>
    <button type="button" class="btn" id="hz-empezar" data-hazana="${h.id}">${K.ic("play")}Empezar</button></div>`;
};
K.hazanaNivelMenu = btn => {
  const h = K.HAZANAS.hazanas.find(x => x.id === btn.dataset.hazana); if (!h) return;
  K.menu.abrir(btn, {titulo: "Nivel", items: K.rutina.NIVELES.map((t, i) => ({id: String(i), texto: t, elegido: nivelDe(h) === i})),
    elegir: id => { K._nivel[h.id] = Number(id); K.refrescar(); }});
};
