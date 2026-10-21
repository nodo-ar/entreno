/* ===== Hoy, tu rumbo, la sesión en curso y el resumen (etapa 3) ===== */
K.EJ = Object.fromEntries(K.EJERCICIOS.ejercicios.map(e => [e.id, e]));
K.cons = id => K.CATALOGO.constelaciones.find(c => c.id === id);
K.ej = id => K.EJ[id] || {id, nombre: id, indicacion: ""};
K.estrella = id => { for (const c of K.CATALOGO.constelaciones){ const e = c.estrellas.find(x => x.id === id); if (e) return e; } return null; };
/* lo que se mide con reloj: la serie corre sola y se para con un toque */
const CORRE = ["segundos", "minutos", "menos-minutos", "sesiones"];
/* lo que una prueba mide sola, con manos libres */
const MIDE = ["segundos", "minutos"];
/* «Pide soga y bici» */
K.pide = ids => ids.map(K.equipoNombre).join(" y ").toLowerCase();
K.rumbo = () => (K.diario.perfil.rumbo || []).filter(id => K.CATALOGO.constelaciones.some(c => c.id === id));
/* 68 → «1:08»; una hora o más → «1:02:05» */
K.reloj = seg => {
  const t = Math.max(0, Math.floor(seg)), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};
/* lo que toca de un bloque, en corto: «4 × 10 s», «3 intentos», «15 min» */
K.queToca = b => {
  const v = K.cielo.corto(b, b.objetivo);
  if (b.tipo === "logrado") return `${b.series} ${b.series === 1 ? "intento" : "intentos"}`;
  if (b.tipo === "sesiones") return "1 sesión";
  return b.series > 1 ? `${b.series} × ${v}` : v;
};
const PREGUNTA = {segundos: "¿Cuántos segundos?", repeticiones: "¿Cuántas salieron?", minutos: "¿Cuántos minutos?", "menos-minutos": "¿En cuántos minutos?", porcentaje: "¿Cuánto lastre?", logrado: "¿Salió?", sesiones: "¿La hiciste?"};
const UNI = {segundos: "segundos", repeticiones: "repeticiones", minutos: "minutos", "menos-minutos": "minutos"};

K.P.hoy = r => r.sub === "rumbo" ? K.P.rumbo() : r.sub === "rutinas" ? K.P.rutinas(r) : r.sub === "hazanas" ? K.P.hazanas(r) : r.sub === "sesion" ? K.P.sesion() : r.sub === "resumen" ? K.P.resumen(r.sub2) : K.P.hoyInicio();

/* la rutina que seguís, si sigue en el catálogo, y por dónde vas */
K.rutinaDe = id => K.RUTINAS.find(r => r.id === id);
K.rutinaActual = () => {
  const x = K.diario.perfil.rutina, r = x && K.rutinaDe(x.id);
  return r ? {r, cur: K.rutina.enCurso(r, x.desde, K.diario.sesiones)} : null;
};
const ctxRutina = () => ({ej: K.EJ, equipo: K.diario.perfil.equipo || null, sesiones: K.diario.sesiones});
/* lo que toca hoy: la sesión de tu rutina, o lo que arma tu rumbo. La ventana de prueba va primero en los dos casos. */
K.hoyPlan = () => {
  const base = K.plan.armar(K.cieloActual(), K.rumbo(), K.diario.sesiones, K.hoy()), ru = K.rutinaActual();
  if (!ru || ru.cur.terminada) return base;
  const plan = K.rutina.deRutina(ru.r, ru.cur.i, ctxRutina());
  /* con rutina, la ventana abre solo para lo que la rutina entrena, y nunca una prueba larga (minutos) antes de la sesión */
  const lleva = new Set(ru.r.alimenta.map(id => id.split(".")[0]));
  const pruebas = base.bloques.filter(b => b.prueba && lleva.has(b.constelacion) && b.tipo !== "minutos");
  return {...plan, bloques: [...pruebas, ...plan.bloques], ventana: pruebas.map(b => b.constelacion), volviste: false, minutos: plan.minutos + pruebas.length * 5};
};
/* lo que dice una fila de «Hoy toca»: qué y cuánto */
const corto = (tipo, o) => o === "max" ? "máx" : tipo === "segundos" ? `${o} s` : String(o);
K.filaToca = b => {
  if (b.prueba) return [`Prueba · ${K.estrella(b.estrella).nombre}`, K.cielo.corto(b, b.umbral)];
  if (b.constelacion) return [`${K.cons(b.constelacion).nombre} · ${K.ej(b.ejercicio).nombre}`, K.queToca(b)];
  if (b.clase === "tramos") return [b.nombre || "", `${Math.round(b.tramos.reduce((a, x) => a + x.seg, 0) / 60)} min`];
  if (b.clase === "circuito") return [b.nombre, b.formato === "amrap" ? `${b.minutos} min` : `${b.rondas} ${b.rondas === 1 ? "vuelta" : "vueltas"}`];
  const ejs = [...new Set(b.pasos.map(p => p.ejercicio))], os = [...new Set(b.pasos.map(p => p.objetivo))];
  return [ejs.map(e => K.ej(e).nombre).join(" + "), ejs.length > 1 ? `${b.series} series` : os.length === 1 ? `${b.series} × ${corto(b.tipo, os[0])}` : b.pasos.map(p => corto(p.tipo, p.objetivo)).join("·")];
};
const filasToca = bs => bs.map(b => { const [q, n] = K.filaToca(b);
  return `<div class="ln toca${b.prueba ? " es-prueba" : ""}"><span class="tg"><i class="dot" style="--c:var(--${b.familia})"></i>${K.esc(q)}</span><span class="num">${K.esc(n)}</span></div>`; }).join("");
const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
K.DIAS = DIAS;

K.P.hoyInicio = () => {
  const f = new Date().toLocaleDateString("es-AR", {weekday: "long", day: "numeric", month: "long"});
  const enc = K.enc({titulo: "Hoy", sub: f, acciones: K.mas("hoy-mas")});
  const rumbo = K.rumbo(), sin = K.diario.guarda ? "" : `<p class="aviso-tenue">Este navegador no deja guardar datos. Lo que entrenes se pierde al cerrar.</p>`;
  const ru = K.rutinaActual();
  /* un día que no es de los tuyos: descansás, salvo que quieras entrenar igual */
  const dias = K.diario.perfil.dias, hoy = K.hoy();
  if (dias && dias.length && !K.rutina.toca(dias, hoy) && K._igual !== hoy && !K.sesion.activa() && (rumbo.length || ru)){
    const k = K.rutina.faltan(dias, hoy), cuando = k === 1 ? "mañana" : `el ${DIAS[(K.rutina.diaSemana(hoy) + k) % 7]}`;
    const que = ru && !ru.cur.terminada ? `${ru.r.sesiones[ru.cur.i].nombre} de ${ru.r.nombre}` : "lo de tu rumbo";
    return enc + `<section class="cd hoy-descanso"><span class="lb">Tus días</span><b class="t1">Hoy descansás.</b><p class="mute">Lo que sigue: ${K.esc(que)}, ${cuando}.</p></section>
      <button type="button" class="btn sec" id="hoy-igual">Entrenar igual</button>`;
  }
  if (ru) return enc + K.hoyRutina(ru, sin);
  if (!rumbo.length) return enc + `<section class="cd rumbo-vacio">${K.dibujo.una(K.cieloActual().constelaciones.find(c => c.id === "front-lever"), [])}
    <span class="lb">Tu rumbo</span><b class="t1">Elegí tu rumbo.</b><p class="mute">De 1 a 3 constelaciones. Kozmos arma cada día lo que toca para llegar.</p></section>${sin}
    <button type="button" class="btn" data-ir="#/hoy/rumbo">Elegir</button>`;
  const cielo = K.cieloActual(), ses = K.diario.sesiones, plan = K.plan.armar(cielo, rumbo, ses, K.hoy());
  const hecho = hechoHoy();
  const prin = plan.bloques.find(b => !b.extra) || plan.bloques[0];
  const delRumbo = cielo.constelaciones.filter(c => rumbo.includes(c.id));
  if (!plan.bloques.some(b => !b.extra) && delRumbo.some(c => c.pide.length)){
    /* lo que sigue de tu rumbo pide equipo que no marcaste */
    const pide = K.pide([...new Set(delRumbo.flatMap(c => c.pide))]);
    return enc + hecho + `<section class="cd"><span class="lb">Tu rumbo</span><b class="t1">Lo que sigue pide ${K.esc(pide)}.</b><p class="mute">Si lo tenés, marcalo en tu equipo. Si no, elegí otro rumbo.</p></section>
      <div class="dos-btn"><button type="button" class="btn sec" data-ir="#/hoy/rumbo">Cambiar el rumbo</button><button type="button" class="btn" data-ir="#/vos/equipo">Tu equipo</button></div>`;
  }
  if (!prin || plan.bloques.every(b => b.extra) && delRumbo.every(c => c.completa)) return enc + hecho + `<section class="cd"><span class="lb">Tu rumbo, completo</span><b class="t1">Llegaste.</b><p class="mute">¿Cuál sigue?</p></section>
    <button type="button" class="btn" data-ir="#/hoy/rumbo">Elegir la que sigue</button>`;
  const c = cielo.constelaciones.find(x => x.id === prin.constelacion), p = c.proxima;
  const proxima = `<section class="cd hoy-prox"><div class="hoy-cielo">${K.dibujo.una(c, [])}</div><div class="hoy-prox-tx">
      <span class="lb">Próxima estrella · ${K.esc(c.nombre)}</span><b class="t1">${K.esc(p.nombre)}</b>
      <div class="bar" style="--c:var(--${c.familia})" role="progressbar" aria-label="Avance hacia ${K.esc(p.nombre)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(c.avance * 100)}"><i style="width:${(c.avance * 100).toFixed(1)}%"></i></div>
      <span class="ln mute"><span>Tu mejor marca</span>${p.mejor === null ? "<span>Todavía ninguna</span>" : `<span class="num">${K.esc(K.cielo.corto(p.prueba, p.mejor))}</span>`}</span></div></section>`;
  const filas = filasToca(plan.bloques);
  /* la ventana abierta se dice con la estrella que toca probar */
  const ventana = plan.ventana.length ? `<p class="hoy-ventana small"><b>Ventana abierta:</b> probá ${plan.ventana.map(id => K.esc(cielo.constelaciones.find(c => c.id === id).proxima.nombre)).join(" y ")}.</p>` : "";
  const toca = `<section class="cd hoy-toca"><div class="ln"><span class="lb">Hoy toca · ${plan.minutos} min</span><span class="num lb">${plan.bloques.length} ${plan.bloques.length === 1 ? "bloque" : "bloques"}</span></div>${ventana}${filas}
    ${plan.volviste ? `<p class="mute small">Tu cielo te esperó. Hoy arrancás más suave.</p>` : ""}</section>`;
  return enc + `<div class="hoy"><div class="hoy-a">${hecho}${proxima}</div><div class="hoy-b">${toca}${sin}${ctaHoy()}</div></div>`;
};
const ctaHoy = () => K.sesion.activa() ? `<button type="button" class="btn" data-ir="#/hoy/sesion">Volver a la sesión</button>`
  : `<button type="button" class="btn" id="s-empezar">${K.ic("play")}Empezar</button>`;
const hechoHoy = () => {
  const hechas = K.diario.sesiones.filter(s => s.fecha === K.hoy());
  return hechas.length ? `<section class="aj"><button type="button" class="ajr" data-ir="#/progreso/${K.esc(hechas[hechas.length - 1].id)}"><span class="tile">${K.ic("check")}</span><span>Hoy ya entrenaste</span>
      <em class="num">${Math.round(hechas.reduce((t, s) => t + s.duracion, 0) / 60)} min</em>${K.ic("chev", "chev")}</button></section>` : "";
};

/* Hoy con una rutina: por dónde vas, hacia qué estrella lleva y la sesión que toca */
K.hoyRutina = ({r, cur}, sin) => {
  const hecho = hechoHoy();
  if (cur.terminada) return hecho + `<section class="cd res-orbita">${K.mov.orbita(150)}</section><section class="cd"><span class="lb">Tu rutina, completa</span><b class="t1">Terminaste ${K.esc(r.nombre)}.</b><p class="mute">${cur.total} sesiones. ¿Seguís con otra?</p></section>
    <button type="button" class="btn" data-ir="#/hoy/rutinas">Elegir otra rutina</button>`;
  const plan = K.hoyPlan(), cielo = K.cieloActual();
  const est = r.alimenta.map(id => cielo.constelaciones.flatMap(c => c.estrellas).find(e => e.id === id)).filter(Boolean), sig = est.find(e => !e.encendida) || est[est.length - 1];
  const s = r.sesiones[cur.i];
  const top = `<section class="cd hoy-rut"><span class="lb">Tu rutina · semana ${cur.semana} de ${r.semanas}</span><b class="t1">${K.esc(r.nombre)}</b>
      <div class="bar" style="--c:var(--${r.familia})" role="progressbar" aria-label="Avance de la rutina" aria-valuemin="0" aria-valuemax="${cur.total}" aria-valuenow="${cur.i}"><i style="width:${(cur.i / cur.total * 100).toFixed(1)}%"></i></div>
      <span class="ln mute"><span>Día ${cur.dia} de ${r.dias}</span><span class="num">${cur.i} de ${cur.total}</span></span>
      ${sig ? `<span class="ln mute small"><span>Entrena para</span><span>${K.esc(sig.nombre)}</span></span>` : ""}</section>`;
  const ventana = plan.ventana.length ? `<p class="hoy-ventana small"><b>Ventana abierta:</b> probá ${plan.ventana.map(id => K.esc(cielo.constelaciones.find(c => c.id === id).proxima.nombre)).join(" y ")}.</p>` : "";
  const toca = `<section class="cd hoy-toca"><div class="ln"><span class="lb">Hoy toca · ${plan.minutos} min</span><span class="num lb">${K.esc(s.nombre)}</span></div>${ventana}${filasToca(plan.bloques)}
    ${s.nota ? `<p class="mute small">${K.esc(s.nota)}</p>` : ""}</section>`;
  return `<div class="hoy"><div class="hoy-a">${hecho}${top}</div><div class="hoy-b">${toca}${sin}${ctaHoy()}</div></div>`;
};

K.hoyMenu = btn => {
  const ru = K.rutinaActual();
  const items = [{id: "rumbo", texto: "Cambiar el rumbo", ic: "cielo"}, {id: "rutinas", texto: ru ? "Cambiar de rutina" : "Seguir una rutina", ic: "ruta"},
    {id: "hazanas", texto: "Hacer una hazaña", ic: "hazana"}, ...(ru ? [{id: "dejar", texto: "Dejar la rutina", ic: "x"}] : []), {id: "anotar", texto: "Anotar algo hecho", ic: "cal"}];
  K.menu.abrir(btn, {titulo: "Hoy", items, elegir: id => id === "dejar" ? K.rutinaDejar() : K.ir({rumbo: "#/hoy/rumbo", rutinas: "#/hoy/rutinas", hazanas: "#/hoy/hazanas", anotar: "#/cielo"}[id])});
};

/* ===== Tu rumbo: de 1 a 3 constelaciones. Cada toque queda guardado; no hay que confirmar. ===== */
K.P.rumbo = () => {
  const r = K.rumbo(), cielo = K.cieloActual();
  const lista = K.CATALOGO.familias.map(f => `<section class="fam"><span class="lb tg"><i class="dot" style="--c:var(--${f.id})"></i>${K.esc(f.nombre)}</span>
    <div class="aj">${cielo.constelaciones.filter(c => c.familia === f.id).map(c => `<button type="button" class="ajr rumbo-fila" data-rumbo="${c.id}" aria-pressed="${r.includes(c.id)}">
      <span class="tile anillo">${K.dibujo.anillo(c)}</span><span>${K.esc(c.nombre)}</span><em class="num">${c.encendidas} de ${c.total}</em>${r.includes(c.id) ? K.ic("check", "ck") : "<span></span>"}</button>`).join("")}</div></section>`).join("");
  return K.enc({titulo: "Tu rumbo", sub: "Hoy", volver: "#/hoy", det: true}) +
    `<p class="ayuda">Elegí de 1 a 3 constelaciones. Lo podés cambiar cuando quieras.</p>${lista}
    <button type="button" class="btn rumbo-listo" data-volver="#/hoy">Listo</button>`;
};
K.rumboTocar = async id => {
  const r = K.rumbo(), antes = [...r];
  const n = r.includes(id) ? r.filter(x => x !== id) : [...r, id];
  if (n.length > 3){ K.aviso("Hasta 3. Sacá una para sumar otra."); return; }
  try { await K.diario.perfilPoner("rumbo", n); } catch (e) { K.diario.perfil = {...K.diario.perfil, rumbo: n}; } /* sin lugar para guardar, vale por esta apertura */
  K.refrescar();
  const c = K.cons(id);
  K.deshacer(`${n.length > antes.length ? "Sumaste" : "Sacaste"} ${c.nombre}`, async () => { try { await K.diario.perfilPoner("rumbo", antes); } catch (e) { K.diario.perfil = {...K.diario.perfil, rumbo: antes}; } K.refrescar(); });
};

/* ===== Sesión en curso: un solo reloj grande; en el descanso anotás lo que salió ===== */
const ANILLO = 2 * Math.PI * 88;
const arco = (q, tot) => `${(Math.max(0, q) / tot * ANILLO).toFixed(1)} ${ANILLO.toFixed(1)}`;
const quedaTx = (q, tot) => !tot ? "Sin descanso" : q <= 0 ? "Ya podés seguir" : `de ${K.reloj(tot)}`;
/* la persona que muestra el ejercicio; «chica» cuando comparte el centro con un anillo */
const figura = (id, fam, chica) => id && K.POSES[id] ? `<div class="ses-fig${chica ? " con-anillo" : ""}">${K.fig.grande(id, fam)}</div>` : "";
/* el número grande de una serie: la cuenta para prepararse, el reloj que corre o lo que toca */
const grandeSerie = b => {
  const pr = K.sesion.prep();
  if (b.tipo === "segundos") return pr > 0 ? [String(Math.ceil(pr)), "Preparate"] : [K.reloj(K.sesion.enFase()), b.objetivo === "max" ? "al máximo" : `de ${b.objetivo} s`];
  return [K.reloj(K.sesion.enFase()), b.tipo === "minutos" ? `de ${b.objetivo} min` : b.tipo === "sesiones" ? "unos 28 min" : "10 km"];
};
K.P.sesion = () => {
  const S = K.sesion.estado(), B = K.sesion.bloque(), nb = S.plan.bloques.length;
  /* los bloques de rutina pueden cambiar de ejercicio en cada serie (superseries): manda la serie que va */
  const b = B.clase ? B : {...B, ...K.sesion.paso()}, e = K.ej(b.ejercicio);
  const c = b.constelacion ? K.cons(b.constelacion) : null;
  const enSerie = S.fase === "serie";
  const nombreB = c ? c.nombre : B.clase ? B.nombre : "";
  const donde = B.hazana ? `Hazaña · ${K.rutina.NIVELES[B.nivel]}` : S.fase === "descanso" ? "Descanso" : S.fase === "cierre" ? (B.clase ? "Fin" : "Última serie") : b.prueba ? "Prueba de estrella" : `Bloque ${S.b + 1} de ${nb}${nombreB ? ` · ${nombreB}` : ""}`;
  const acc = `<div class="enc-acc ses-acc"><button type="button" class="ib" id="s-cortar" aria-label="Terminar la sesión">${K.ic("x")}</button>
    <span class="lb ses-donde">${K.esc(donde)}</span>${K.mas("s-mas", "Opciones de la sesión")}</div>`;
  if (S.fase === "tramo") return acc + K.P.tramo(S, B);
  if (S.fase === "circuito") return acc + K.P.circuito(S, B);
  if (B.clase && S.fase === "cierre") return acc + K.P.cierreBloque(S, B);
  const pasos = `<div class="stp" style="--c:var(--${b.familia})" aria-hidden="true">${Array.from({length: b.series}, (_, i) => `<i class="${i < S.s || (i === S.s && !enSerie) ? "d" : i === S.s ? "n" : ""}"></i>`).join("")}</div>`;
  const nom = `<span class="lb">${b.tipo === "logrado" ? "Intento" : "Serie"} ${S.s + 1} de ${b.series}${b.extra ? " · para sostener" : ""}</span>`;
  const pausa = S.pausa !== null ? `<p class="ses-pausa lb">En pausa</p>` : "";
  if (enSerie && b.prueba) return acc + K.P.prueba(S, b, e, pausa);
  if (enSerie){
    const o = b.objetivo, corre = CORRE.includes(b.tipo);
    const [gn, gl] = corre ? grandeSerie(b) : [];
    const grande = corre ? `<span class="reloj big num" data-r="fase">${gn}</span><span class="lb" data-r="fase-lb">${gl}</span>`
      : b.tipo === "repeticiones" ? (o === "max" ? `<span class="reloj big num">Máx</span><span class="lb">todas las que salgan</span>` : `<span class="reloj big num">${o}</span><span class="lb">repeticiones</span>`)
      : b.tipo === "porcentaje" ? `<span class="reloj big num">+${o} %</span><span class="lb">de tu peso${K.diario.perfil.peso ? ` · ${Math.round(o * K.diario.perfil.peso / 100 * 2) / 2} kg` : ""}</span>`
      : `<span class="lb">De punta a punta, sin ayuda</span>`;
    const sig = K.sesion.ultima() ? "Es la última" : b.series > S.s + 1 ? (b.descanso ? `Después: descanso de ${K.reloj(b.descanso)}` : `Después: ${K.sesion.proxima()}`) : `Después: ${K.sesion.nombreBloque(S.plan.bloques[S.b + 1])}`;
    return acc + `<div class="ses serie"><div class="ses-a">${pasos}<div class="enc-tit ses-tit">${nom}<h1>${K.esc(e.nombre)}</h1></div>
        <p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}${figura(e.id, b.familia)}<div class="ses-reloj">${grande}</div></div>
      <div class="ses-b"><p class="ln ses-sig"><span class="mute">${K.esc(sig)}</span><span class="reloj num" data-r="total">${K.reloj(K.sesion.total())}</span></p>
        <button type="button" class="btn" id="s-listo">${K.ic("check")}Listo</button></div></div>`;
  }
  /* descanso o cierre: lo que salió se anota con − y + mientras recuperás */
  const v = S.borrador, paso = (id, et, val, uni) => `<div class="pmw"><div class="pm"><button type="button" class="pmb" data-spaso="-1" data-campo="${id}" aria-label="Menos">−</button>
      <input class="pmv spv num" id="s-${id}" data-campo="${id}" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="${et}" value="${K.esc(val ?? "")}"><button type="button" class="pmb" data-spaso="1" data-campo="${id}" aria-label="Más">+</button></div><span class="lb">${uni}</span></div>`;
  let campo;
  /* sí o no, de un toque: dos botones grandes, el elegido en tinta */
  if (b.tipo === "logrado" || b.tipo === "sesiones") campo = `<div class="si-no" role="group" aria-label="${PREGUNTA[b.tipo]}"><button type="button" class="btn sec" data-salio="0" aria-pressed="${!(Number(v) > 0)}">Todavía no</button><button type="button" class="btn sec" data-salio="1" aria-pressed="${Number(v) > 0}">${K.ic("check")}Sí, salió</button></div>`;
  else if (b.tipo === "porcentaje") campo = `<div class="dos-pasos">${paso("lastre", "Lastre en kilos", v?.lastre, "kg de lastre")}${K.diario.perfil.peso ? "" : paso("peso", "Tu peso en kilos", v?.peso, "kg tu peso")}</div>`;
  else campo = paso("valor", PREGUNTA[b.tipo], v, UNI[b.tipo]);
  const antes = K.plan.vezPasada(K.diario.sesiones, b.ejercicio, b.tipo);
  const pie = b.tipo === "logrado" || b.tipo === "sesiones" ? "" : antes !== null ? `<span class="ln mute"><span>La vez pasada</span><span class="num">${K.esc(K.cielo.corto(b, antes))}</span></span>`
    : b.umbral ? `<span class="ln mute"><span>Para la próxima estrella</span><span class="num">${K.esc(K.cielo.corto(b, b.umbral))}</span></span>` : "";
  const tarjeta = B.clase ? hechoBloque(S, B) : `<section class="cd ses-anota"><span class="lb">${PREGUNTA[b.tipo]} · ${K.esc(e.nombre)}</span>${campo}${pie}</section>`;
  if (S.fase === "cierre") return acc + `<div class="ses cierre"><div class="ses-a">${pasos}<div class="enc-tit ses-tit">${nom}<h1>${K.esc(e.nombre)}</h1></div>${pausa}
      <div class="ses-reloj"><span class="reloj big num" data-r="total">${K.reloj(K.sesion.total())}</span><span class="lb">toda la sesión</span></div></div>
    <div class="ses-b">${tarjeta}<button type="button" class="btn" id="s-terminar">Terminar</button></div></div>`;
  /* en una superserie no hay descanso entre los dos ejercicios: se anota y se sigue, sin destello */
  const q = K.sesion.queda(), tot = S.total || 1, fin = q <= 0 && S.total > 0;
  return acc + `<div class="ses descanso${fin ? " fin" : ""}" style="--c:var(--${b.familia});--cs:var(--${b.familia}-soft)" data-r="ses"><div class="ses-a"><div class="enc-tit vh"><h1>Descanso</h1></div>${pausa}
      <div class="anillo-desc${q <= 0 ? " listo" : ""}" data-r="anillo">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" class="pista"/><circle cx="100" cy="100" r="88" class="arco" data-r="arco" stroke-dasharray="${arco(q, tot)}" transform="rotate(-90 100 100)"/></svg>
        <div class="anillo-tx"><span class="reloj num" data-r="queda" role="timer" aria-live="off">${K.reloj(Math.max(0, Math.ceil(q)))}</span><span class="lb" data-r="queda-lb">${quedaTx(q, S.total)}</span></div></div>
      ${(() => { const px = K.sesion.proximoEj(); return px && K.POSES[px.id] ? `<p class="ses-luego mute con-fig">${K.fig.chica(px.id, px.fam)}<span>Sigue: ${K.esc(K.sesion.proxima())}</span></p>` : `<p class="ses-luego mute">Sigue: ${K.esc(K.sesion.proxima())}</p>`; })()}</div>
    <div class="ses-b">${tarjeta}<div class="tres-btn"><button type="button" class="btn sec" data-desc="-15" aria-label="15 segundos menos de descanso">−15 s</button><button type="button" class="btn sec" data-desc="15" aria-label="15 segundos más de descanso">+15 s</button><button type="button" class="btn" id="s-seguir">Seguir</button></div></div></div>`;
};

/* ===== Tramos: cardio, intervalos, cada minuto y movilidad. Cada tramo corre solo y pasa al siguiente con un pitido. ===== */
const CLASE = {entrada: "Entrada en calor", fuerte: "Fuerte", suave: "Suave", pausa: "Descanso", trabajo: "A trabajar", postura: "Postura", vuelta: "Vuelta a la calma"};
const tramoTx = x => x.ejercicio ? K.ej(x.ejercicio).nombre : CLASE[x.clase] || "";
const tramoLb = x => x.reps ? `×${x.reps}` : x.trabajo ? `${x.trabajo} s y descansás` : `de ${K.reloj(x.seg)}`;
const avanceBloque = (S, b) => { const tot = b.tramos.reduce((a, x) => a + x.seg, 0), antes = b.tramos.slice(0, S.s).reduce((a, x) => a + x.seg, 0); return Math.min(1, (antes + K.sesion.enFase()) / tot); };
K.P.tramo = (S, b) => {
  const x = b.tramos[S.s], sig = b.tramos[S.s + 1], q = K.sesion.queda(), pausa = S.pausa !== null ? `<p class="ses-pausa lb">En pausa</p>` : "";
  const fuerte = x.clase === "fuerte" || x.clase === "trabajo";
  return `<div class="ses tramo${fuerte ? " fuerte" : ""}" style="--c:var(--${b.familia});--cs:var(--${b.familia}-soft)" data-r="ses"><div class="ses-a">
      <div class="bar tramo-bar" style="--c:var(--${b.familia})" aria-hidden="true"><i data-r="tbar" style="width:${(avanceBloque(S, b) * 100).toFixed(1)}%"></i></div>
      <div class="enc-tit ses-tit"><span class="lb">${K.esc(x.ejercicio ? CLASE[x.clase] : b.nombre || "")} · ${S.s + 1} de ${b.tramos.length}</span><h1>${K.esc(tramoTx(x))}</h1></div>
      ${x.nota || (x.ejercicio && K.ej(x.ejercicio).indicacion) ? `<p class="mute ses-ind">${K.esc(x.nota || K.ej(x.ejercicio).indicacion)}</p>` : ""}${pausa}
      ${figura(x.ejercicio, b.familia, true)}<div class="anillo-desc" data-r="anillo">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" class="pista"/><circle cx="100" cy="100" r="88" class="arco" data-r="arco" stroke-dasharray="${arco(q, x.seg)}" transform="rotate(-90 100 100)"/></svg>
        <div class="anillo-tx"><span class="reloj num" data-r="queda" role="timer" aria-live="off">${K.reloj(Math.max(0, Math.ceil(q)))}</span><span class="lb">${K.esc(tramoLb(x))}</span></div></div>
      <p class="ses-luego mute">${sig ? `Sigue: ${K.esc(tramoTx(sig))} · ${K.reloj(sig.seg)}` : S.b < S.plan.bloques.length - 1 ? `Después: ${K.esc(K.sesion.nombreBloque(S.plan.bloques[S.b + 1]))}` : "Es el último"}</p></div>
    <div class="ses-b"><p class="ln ses-sig"><span class="mute">Toda la sesión</span><span class="reloj num" data-r="total">${K.reloj(K.sesion.total())}</span></p>
      <button type="button" class="btn${S.pausa !== null ? "" : " sec"}" id="s-pausa">${K.ic(S.pausa !== null ? "play" : "pause")}${S.pausa !== null ? "Seguir" : "Pausa"}</button></div></div>`;
};

/* ===== Circuito: una hazaña por tiempo o con tiempo límite. Cada vuelta, un toque. ===== */
const circItem = x => `${x.reps ? `×${x.reps}` : x.seg ? `${x.seg} s` : x.min ? `${x.min} min` : ""}${x.ejercicio && K.ej(x.ejercicio).lado ? " por lado" : ""}`;
const circGrande = (S, b) => {
  const pr = K.sesion.prep();
  if (pr > 0) return [String(Math.ceil(pr)), "Preparate"];
  if (b.formato === "amrap") return [K.reloj(Math.max(0, Math.ceil(K.sesion.queda()))), `${S.vueltas} ${S.vueltas === 1 ? "vuelta" : "vueltas"}`];
  return [K.reloj(K.sesion.enFase()), b.rondas > 1 ? `Vuelta ${Math.min(S.vueltas + 1, b.rondas)} de ${b.rondas}` : "Todo, en orden"];
};
K.P.circuito = (S, b) => {
  const [n, l] = circGrande(S, b), pausa = S.pausa !== null ? `<p class="ses-pausa lb">En pausa</p>` : "", prep = K.sesion.prep() > 0;
  const items = `<section class="cd circ-items">${b.items.map(x => `<div class="ln"><span>${K.esc(x.ejercicio ? K.ej(x.ejercicio).nombre : x.nombre || "")}</span><span class="num">${K.esc(circItem(x))}</span></div>`).join("")}</section>`;
  const listo = b.formato === "amrap" ? `<div class="dos-btn"><button type="button" class="btn sec" id="s-vuelta-menos" aria-label="Una vuelta menos">−1</button><button type="button" class="btn" id="s-vuelta">${K.ic("check")}Vuelta</button></div>`
    : `<button type="button" class="btn" id="s-vuelta">${K.ic("check")}${b.rondas > 1 ? "Terminé la vuelta" : "Terminé"}</button>`;
  return `<div class="ses circuito${prep ? " prep" : ""}" style="--c:var(--${b.familia})" data-r="ses"><div class="ses-a">
      <div class="enc-tit ses-tit"><span class="lb">${K.esc(FORMATO[b.formato])}</span><h1>${K.esc(b.nombre)}</h1></div>${pausa}
      <div class="ses-reloj"><span class="reloj big num" data-r="fase" role="timer" aria-live="off">${n}</span><span class="lb" data-r="fase-lb">${K.esc(l)}</span></div>${items}</div>
    <div class="ses-b"><p class="ln ses-sig"><span class="mute">${b.formato === "amrap" ? `Todas las vueltas que entren en ${b.minutos} min` : "Lo más rápido que puedas, bien hecho"}</span></p>${listo}</div></div>`;
};
const FORMATO = {tiempo: "Por tiempo", amrap: "Todas las vueltas que entren"};

/* el fin de un bloque de tramos o de una hazaña: lo hecho, sin nada que escribir (salvo las vueltas, que se pueden corregir) */
const hechoBloque = (S, b) => {
  if (b.clase === "circuito"){
    if (b.formato === "amrap") return `<section class="cd ses-anota"><span class="lb">¿Cuántas vueltas? · ${K.esc(b.nombre)}</span><div class="pmw"><div class="pm"><button type="button" class="pmb" data-spaso="-1" data-campo="valor" aria-label="Menos">−</button>
      <input class="pmv spv num" id="s-valor" data-campo="valor" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Vueltas" value="${K.esc(S.borrador ?? "")}"><button type="button" class="pmb" data-spaso="1" data-campo="valor" aria-label="Más">+</button></div><span class="lb">vueltas</span></div></section>`;
    return `<section class="cd ses-anota"><span class="lb">Tu tiempo · ${K.esc(b.nombre)}</span><b class="reloj num res-tiempo">${K.reloj(S.borrador || 0)}</b></section>`;
  }
  const h = [...S.hechos].reverse().find(x => x.b === S.b);
  return `<section class="cd ses-anota"><span class="lb">Hecho · ${K.esc(b.nombre || "")}</span><b class="reloj num res-tiempo">${K.reloj(h?.seg ?? 0)}</b></section>`;
};
K.P.cierreBloque = (S, b) => `<div class="ses cierre"><div class="ses-a"><div class="enc-tit ses-tit"><span class="lb">${b.hazana ? "Hazaña" : "Último bloque"}</span><h1>${K.esc(b.nombre || "")}</h1></div>
      <div class="ses-reloj"><span class="reloj big num" data-r="total">${K.reloj(K.sesion.total())}</span><span class="lb">toda la sesión</span></div></div>
    <div class="ses-b">${hechoBloque(S, b)}<button type="button" class="btn" id="s-terminar">Terminar</button></div></div>`;

/* ===== Prueba de estrella: con manos libres. Arranca sola después de «Preparate», avisa al llegar y se para con un
   toque en cualquier lado de la pantalla: lo que corrió el reloj queda anotado sin escribir nada. ===== */
const umbralSeg = b => b.tipo === "segundos" ? b.umbral : b.umbral * 60;
const pruebaGrande = b => {
  const pr = K.sesion.prep(), t = K.sesion.enFase();
  if (pr > 0) return [String(Math.ceil(pr)), "Preparate"];
  return b.tipo === "segundos" ? [String(Math.floor(t)), `de ${b.umbral} s`] : [K.reloj(t), `de ${b.umbral} min`];
};
K.P.prueba = (S, b, e, pausa) => {
  const est = K.estrella(b.estrella) || {nombre: e.nombre, magnitud: 5}, c = K.cons(b.constelacion), mide = MIDE.includes(b.tipo);
  const tit = `<div class="enc-tit ses-tit"><span class="lb">${K.esc(c.nombre)} · m${est.magnitud}</span><h1>${K.esc(est.nombre)}</h1></div>`;
  if (!mide){
    const grande = b.tipo === "repeticiones" ? `<span class="reloj big num">${b.umbral}</span><span class="lb">repeticiones</span>`
      : b.tipo === "porcentaje" ? `<span class="reloj big num">+${b.umbral} %</span><span class="lb">de tu peso</span>` : `<span class="lb">De punta a punta, sin ayuda</span>`;
    return `<div class="ses serie"><div class="ses-a">${tit}<p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}${figura(e.id, b.familia)}<div class="ses-reloj">${grande}</div></div>
      <div class="ses-b"><button type="button" class="btn" id="s-listo">${K.ic("check")}Listo</button></div></div>`;
  }
  const [n, l] = pruebaGrande(b), p = Math.min(1, K.sesion.prep() > 0 ? 0 : K.sesion.enFase() / umbralSeg(b));
  return `<div class="ses serie prueba${K.sesion.prep() > 0 ? " prep" : ""}" style="--c:var(--${b.familia})" data-r="ses"><div class="ses-a">${tit}<p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}
      ${figura(e.id, b.familia, true)}<div class="anillo-desc prueba-anillo${p >= 1 ? " listo" : ""}${p <= 0 ? " vacio" : ""}" data-r="anillo">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" class="pista"/><circle cx="100" cy="100" r="88" class="arco" data-r="arco" stroke-dasharray="${(p * ANILLO).toFixed(1)} ${ANILLO.toFixed(1)}" transform="rotate(-90 100 100)"/></svg>
        <div class="anillo-tx"><span class="reloj num" data-r="fase" role="timer" aria-live="off">${n}</span><span class="lb" data-r="fase-lb">${l}</span></div></div>
      <p class="ses-luego mute">Te aviso con una vibración al llegar. Al soltar, tocá en cualquier lado.</p></div>
    <div class="ses-b"><button type="button" class="btn" id="s-listo">${K.ic("check")}Listo</button></div></div>`;
};

/* cada cuarto de segundo: los relojes de la pantalla y la isla, sin redibujar */
K.sesion.alLatir = () => {
  const S = K.sesion.estado(), enSes = K.ruta().tab === "hoy" && K.ruta().sub === "sesion";
  if (!S){ K.isla.ocultar(); return; }
  const b = K.sesion.bloque(), v = K.$("main.view");
  if (enSes){
    K.isla.ocultar();
    const pon = (k, t) => { const el = K.$(`[data-r="${k}"]`, v); if (el && el.textContent !== t) el.textContent = t; };
    if (S.fase === "serie" && b.prueba && K.$('[data-r="arco"]', v)){
      const [n, l] = pruebaGrande(b), p = Math.min(1, K.sesion.prep() > 0 ? 0 : K.sesion.enFase() / umbralSeg(b));
      pon("fase", n); pon("fase-lb", l);
      K.$('[data-r="arco"]', v).setAttribute("stroke-dasharray", `${(p * ANILLO).toFixed(1)} ${ANILLO.toFixed(1)}`);
      K.$('[data-r="anillo"]', v)?.classList.toggle("listo", p >= 1);
      K.$('[data-r="anillo"]', v)?.classList.toggle("vacio", p <= 0);
      K.$('[data-r="ses"]', v)?.classList.toggle("prep", K.sesion.prep() > 0);
    }
    else if (S.fase === "serie" && K.$('[data-r="fase"]', v)){ const [n, l] = grandeSerie({...b, ...K.sesion.paso()}); pon("fase", n); pon("fase-lb", l); }
    else if (S.fase === "tramo"){
      const q = K.sesion.queda(), x = b.tramos[S.s];
      pon("queda", K.reloj(Math.max(0, Math.ceil(q))));
      K.$('[data-r="arco"]', v)?.setAttribute("stroke-dasharray", arco(q, x.seg));
      const bar = K.$('[data-r="tbar"]', v); if (bar) bar.style.width = (avanceBloque(S, b) * 100).toFixed(1) + "%";
    }
    else if (S.fase === "circuito"){ const [n, l] = circGrande(S, b); pon("fase", n); pon("fase-lb", l); K.$('[data-r="ses"]', v)?.classList.toggle("prep", K.sesion.prep() > 0); }
    pon("total", K.reloj(K.sesion.total()));
    if (S.fase === "descanso"){
      const q = K.sesion.queda(), tot = S.total || 1;
      pon("queda", K.reloj(Math.max(0, Math.ceil(q))));
      pon("queda-lb", quedaTx(q, S.total));
      K.$('[data-r="arco"]', v)?.setAttribute("stroke-dasharray", arco(q, tot));
      K.$('[data-r="anillo"]', v)?.classList.toggle("listo", q <= 0);
      K.$('[data-r="ses"]', v)?.classList.toggle("fin", q <= 0 && S.total > 0);
    }
    return;
  }
  /* afuera de la sesión, la isla lleva lo que corre */
  let texto, p = 0;
  if (S.pausa !== null) texto = "En pausa";
  else if (S.fase === "descanso"){ const q = K.sesion.queda(); texto = q > 0 ? `Descanso ${K.reloj(Math.ceil(q))}` : "A seguir"; p = Math.max(0, q) / (S.total || 1); }
  else if (S.fase === "cierre") texto = b.clase ? "A terminar" : "Última serie";
  else if (S.fase === "tramo"){ const x = b.tramos[S.s], q = K.sesion.queda(); texto = `${tramoTx(x)} ${K.reloj(Math.max(0, Math.ceil(q)))}`; p = Math.max(0, q) / x.seg; }
  else if (K.sesion.prep() > 0) texto = `Preparate ${Math.ceil(K.sesion.prep())}`;
  else if (S.fase === "circuito"){ const [n] = circGrande(S, b); texto = `${b.nombre} ${n}`; p = b.formato === "amrap" ? Math.max(0, K.sesion.queda()) / (b.minutos * 60) : S.vueltas / b.rondas; }
  else { texto = `${K.ej(K.sesion.paso().ejercicio).nombre} ${K.reloj(K.sesion.enFase())}`; p = (S.s + 1) / b.series; }
  K.isla.mostrar({texto, p, familia: b.familia, ir: "#/hoy/sesion"});
};

/* un tramo que pasa solo cambia la pantalla entera: el nombre, lo que sigue y el anillo */
K.sesion.alTramo = () => { if (K.ruta().tab === "hoy" && K.ruta().sub === "sesion") K.refrescar(); };

/* ---------- lo que se toca en la sesión ---------- */
K.ses = {
  empezar(btn){
    const plan = K.hoyPlan();
    if (!plan.bloques.length) return;
    K.mov.iris(btn); K.sesion.empezar(plan); K.ir("#/hoy/sesion");
  },
  listo(){
    if (K.sesion.bloque().prueba && K.sesion.prep() > 0) return; /* un toque mientras te preparás no corta la prueba */
    /* una prueba con reloj que es lo último de la sesión termina sola: lo que corrió el reloj es la marca */
    const b = K.sesion.bloque(), sola = b.prueba && MIDE.includes(b.tipo) && K.sesion.ultima() && K.sesion.prep() <= 0;
    K.sesion.listo();
    if (sola) return K.ses.terminar();
    K.refrescar(); K.$("#s-seguir, #s-terminar")?.focus({preventScroll: true});
  },
  /* probar la próxima estrella de una constelación, desde su pantalla */
  probar(cid, btn){
    if (K.sesion.activa()){ K.ir("#/hoy/sesion"); K.aviso("Tenés una sesión abierta. Terminala para probar."); return; }
    const c = K.cieloActual().constelaciones.find(x => x.id === cid);
    if (!c || !K.plan.sePrueba(c)) return;
    K.mov.iris(btn); K.sesion.empezar({bloques: [K.plan.prueba(c)], minutos: 5, volviste: false, ventana: [c.id], desde: `#/cielo/${c.id}`}); K.ir("#/hoy/sesion");
  },
  seguir(){ K.sesion.seguir(); K.refrescar(); },
  ajustar(d){ K.sesion.ajustar(d); K.sesion.alLatir(); },
  paso(campo, s){
    const S = K.sesion.estado(), inc = campo === "valor" ? 1 : .5;
    const v = K.sesion.numero((campo === "valor" ? S.borrador : S.borrador?.[campo]) ?? "");
    const n = Math.max(0, Math.round(((Number.isFinite(v) ? v : 0) + s * inc) * 2) / 2);
    K.sesion.anotar(campo, n); const el = K.$("#s-" + campo); if (el) el.value = n;
  },
  escribir(campo, txt){ K.sesion.anotar(campo, txt); },
  salio(v){ K.sesion.anotar("valor", v); K.refrescar(); },
  menu(btn){
    const S = K.sesion.estado(), b = K.sesion.bloque();
    /* una hazaña no se saltea: se termina o se corta */
    const items = [{id: "pausa", texto: S.pausa !== null ? "Seguir el reloj" : "Pausar", ic: S.pausa !== null ? "play" : "pause"},
      ...(S.fase === "tramo" ? [{id: "tramo", texto: "Saltear este tramo", ic: "skip"}] : []),
      ...(b.clase === "circuito" ? [] : [{id: "saltear", texto: b.clase ? "Saltear este bloque" : "Saltear este ejercicio", ic: "skip"}]),
      {id: "cielo", texto: "Mirar el cielo", ic: "cielo"}];
    K.menu.abrir(btn, {titulo: "Sesión", items,
      elegir: id => {
        if (id === "pausa"){ K.sesion.pausar(); K.refrescar(); }
        else if (id === "tramo"){ K.sesion.saltearTramo(); K.refrescar(); }
        else if (id === "saltear"){ if (K.sesion.saltear()) K.refrescar(); else K.ses.terminar(); }
        else K.ir("#/cielo");
      }});
  },
  pausa(){ K.sesion.pausar(); K.refrescar(); },
  vuelta(d){ K.sesion.vuelta(d); K.refrescar(); },
  /* una hazaña en un nivel, desde su pantalla */
  hazana(id, nivel, btn){
    if (K.sesion.activa()){ K.ir("#/hoy/sesion"); K.aviso("Tenés una sesión abierta. Terminala para empezar otra."); return; }
    const h = K.HAZANAS.hazanas.find(x => x.id === id); if (!h) return;
    const plan = K.rutina.deHazana(h, nivel, ctxRutina());
    K.mov.iris(btn); K.sesion.empezar({...plan, ventana: [], volviste: false, desde: `#/hoy/hazanas/${h.id}`}); K.ir("#/hoy/sesion");
  },
  terminar(){ return K.ses._fin(false); },
  /* la ✕ corta sin preguntar: lo hecho se guarda y se puede deshacer */
  cortar(){ return K.ses._fin(true); },
  async _fin(cortada){
    if (K.ses._ocupado) return; K.ses._ocupado = true;
    try {
      let r;
      try { r = await K.sesion.terminar(cortada); } catch (e) { K.aviso("No se pudo guardar en este teléfono. La sesión sigue abierta."); return; }
      const volver = async () => {
        if (r.registro){ try { await K.diario.borrarSesion(r.registro.id); } catch (e) { K.aviso("No se pudo deshacer."); return; } }
        K.sesion.volver(r.foto); K.ir("#/hoy/sesion", true);
      };
      const desde = r.foto.plan.desde || "#/hoy";
      if (r.registro){ (K._origen = K._origen || {})[r.registro.id] = desde; K._estrella = true; K.ir(`#/hoy/resumen/${r.registro.id}`, true); } else K.volver(desde);
      if (cortada) K.deshacer(r.registro ? "Sesión cortada. Lo hecho cuenta." : "Saliste de la sesión", volver);
    } finally { K.ses._ocupado = false; }
  }
};

/* ===== Resumen: la estrella nueva encendida en su constelación =====
   Lo que encendió sale de lo que quedó escrito al terminar: el resumen dice siempre lo mismo. */
K.P.resumen = (id, desde = "hoy") => {
  const ses = K.diario.sesiones, x = ses.find(s => s.id === id);
  if (!x) return desde === "hoy" ? K.P.hoyInicio() : K.P.progreso({});
  const cielo = K.cieloActual(), estrella = eid => { const e0 = K.estrella(eid), c = e0 && cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid)); return c ? {c, e: c.estrellas.find(y => y.id === eid)} : null; };
  /* una hazaña: lo de hoy contra tu mejor en ese nivel */
  const hzH = x.hazana && K.HAZANAS.hazanas.find(h => h.id === x.hazana.id);
  const hz = hzH ? (() => { const mejor = K.rutina.mejorHazana(hzH, x.hazana.nivel, ses.filter(s => s.id !== id)), v = x.hazana.valor, m = K.rutina.mejorEs(hzH);
    return {h: hzH, mejor, record: v > 0 && (mejor === null || (m === "menos" ? v < mejor : m === "mas" ? v > mejor : false))}; })() : null;
  let nuevas = x.encendio;
  if (!Array.isArray(nuevas)){ const ms = K.diario.mediciones; nuevas = K.cielo.nuevas(K.CATALOGO, ms, ms, x.fecha, ses.filter(s => s.id !== id), ses).map(n => n.estrella.id); } /* sesiones viejas, sin lo encendido escrito */
  const enc = nuevas.map(estrella).filter(Boolean), prim = enc[0];
  /* la constelación a mostrar: la de la estrella nueva o la del primer bloque que el catálogo todavía tiene */
  const ruR = x.rutina && K.rutinaDe(x.rutina.id), haciaRut = ruR && ruR.alimenta.map(eid => cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid))).filter(Boolean);
  const c = prim ? prim.c : cielo.constelaciones.find(k => x.bloques.some(b => b.constelacion === k.id)) || (haciaRut && (haciaRut.find(k => !k.completa) || haciaRut[0]));
  const recien = c ? enc.filter(n => n.c.id === c.id).map(n => n.e.id) : [];
  const nSeries = x.bloques.reduce((t, b) => t + b.series.length, 0);
  /* la mejor serie de la sesión en lo que perseguís, y si es tu mejor marca de siempre */
  const b0 = c && x.bloques.find(b => b.constelacion === c.id), s0 = b0 && b0.series[0];
  const mejorHoy = s0 ? b0.series.reduce((m, y) => K.cielo.TIPOS[y.tipo].mejor === "menos" ? Math.min(m, y.valor) : Math.max(m, y.valor), s0.valor) : null;
  const antes = s0 ? K.cielo.calcular(K.CATALOGO, K.diario.mediciones, x.fecha, ses.filter(s => s.id !== id)).constelaciones.find(k => k.id === c.id).estrellas.find(e => e.prueba.ejercicio === s0.ejercicio && e.prueba.tipo === s0.tipo)?.mejor ?? null : null;
  const record = s0 && s0.tipo !== "logrado" && (antes === null || (K.cielo.TIPOS[s0.tipo].mejor === "menos" ? mejorHoy < antes : mejorHoy > antes));
  let tx;
  if (prim){
    tx = `<span class="lb" style="color:var(--${c.familia})">${enc.length > 1 ? `${enc.length} estrellas nuevas` : `Estrella nueva · m${prim.e.magnitud}`}</span>
      <h1 class="t1 res-tit">${K.esc(prim.e.nombre)}, encendida.</h1>
      <p class="mute">${c.completa ? `${K.esc(c.nombre)}, completa. Ya es parte de tu cielo.` : `${K.esc(c.nombre)}: ${c.encendidas} de ${c.total}.${c.proxima ? ` La que sigue es ${K.esc(c.proxima.nombre)}.` : c.pide.length ? ` Lo que sigue pide ${K.esc(K.pide(c.pide))}.` : ""}`}</p>`;
  } else if (x.bloques.length === 1 && x.bloques[0].prueba){
    /* una prueba que no llegó: cuánto faltó, sin drama */
    const bp = x.bloques.find(b => b.prueba), e = K.estrella(bp.estrella), sp = bp.series[0];
    tx = `<span class="lb">Prueba de estrella</span><h1 class="t1 res-tit">Todavía no.</h1>
      <p class="mute">${e && sp && sp.tipo !== "logrado" ? `${K.esc(K.cielo.corto(sp, sp.valor))} de ${K.esc(K.cielo.corto(e.prueba, e.prueba.umbral))} en ${K.esc(e.nombre)}. La próxima.` : "La próxima."}</p>`;
  } else if (hz){
    const ok = x.hazana.completa !== false && !x.cortada && x.hazana.valor > 0;
    tx = `<span class="lb" style="color:var(--${hz.h.familia})">Hazaña · ${K.rutina.NIVELES[x.hazana.nivel]}</span><h1 class="t1 res-tit">${ok ? `${K.esc(hz.h.nombre)}, ${K.esc(K.hazanaValor(hz.h, x.hazana.valor))}.` : "Lo hecho cuenta."}</h1>
      <p class="mute">${!ok ? `${K.esc(hz.h.nombre)} quedó a medias. La próxima.` : hz.record ? "Tu mejor marca en este nivel." : hz.mejor !== null ? `Tu mejor: ${K.esc(K.hazanaValor(hz.h, hz.mejor))}.` : ""}</p>`;
  } else {
    const p = c && c.proxima, ru = x.rutina && K.rutinaDe(x.rutina.id);
    const sig = ru && (ru.sesiones[x.rutina.sesion + 1] ? `Lo que sigue: ${ru.sesiones[x.rutina.sesion + 1].nombre}.` : `Terminaste ${ru.nombre}.`);
    tx = `<span class="lb">${ru ? `${K.esc(ru.nombre)} · semana ${Math.floor(x.rutina.sesion / ru.dias) + 1}, día ${x.rutina.sesion % ru.dias + 1}` : x.cortada ? "Sesión cortada" : "Sesión hecha"}</span><h1 class="t1 res-tit">${x.cortada ? "Lo hecho cuenta." : "Hecho."}</h1>
      ${sig ? `<p class="mute">${K.esc(sig)}</p>` : p ? `<p class="mute">Un paso más hacia ${K.esc(p.nombre)}.</p>` : ""}`;
  }
  /* arriba va lo que la sesión dibujó: la figura de la hazaña, la vuelta entera de una rutina terminada o la constelación */
  const hzOk = hz && x.hazana.completa !== false && !x.cortada && x.hazana.valor > 0, rutFin = ruR && !x.cortada && !ruR.sesiones[x.rutina.sesion + 1];
  const arte = hz ? `<section class="cd res-fig${hzOk ? " logro" : ""}">${K.dibujo.figura(hz.h, 190, hzOk)}</section>`
    : rutFin && !prim ? `<section class="cd res-orbita">${K.mov.orbita(170)}<p class="lb">Rutina completa</p></section>`
    : c ? `<section class="cd cons-cielo">${K.dibujo.una(c, recien)}</section>` : "";
  const kcal = K.calorias.deSesion(x, K.diario.perfil.peso);
  const dato = (n, t) => `<div class="cd res-dato"><span class="num">${K.esc(n)}</span><span class="lb">${t}</span></div>`;
  /* un día sin estrella no muestra un cero: muestra tu mejor serie */
  /* una prueba que no llegó: lo de esta vez al lado de tu marca, sin minutos ni series que confundan */
  const bp = !prim && x.bloques.length === 1 && x.bloques[0].prueba ? x.bloques[0] : null, sp = bp && bp.series[0];
  const marcaAntes = sp ? K.cielo.calcular(K.CATALOGO, K.diario.mediciones, x.fecha, ses.filter(s => s.id !== id)).constelaciones.flatMap(k => k.estrellas).find(e => e.id === bp.estrella)?.mejor ?? null : null;
  const tercero = enc.length ? dato(enc.length, enc.length === 1 ? "estrella" : "estrellas") : s0 && s0.tipo !== "logrado" ? dato(K.cielo.corto(s0, mejorHoy), record ? "mejor marca" : "tu mejor serie") : "";
  /* desde Hoy es el cierre de la sesión (con ✕); desde Progreso, una sesión de tu historia (con volver) */
  const arriba = desde === "hoy" ? `<div class="enc-acc ses-acc"><button type="button" class="ib" data-volver="${K.esc(K._origen?.[id] || "#/hoy")}" aria-label="Cerrar">${K.ic("x")}</button><span class="lb ses-donde">Resumen</span>${K.mas("res-mas", "Opciones de la sesión")}</div>`
    : K.enc({titulo: K.fechaCorta(x.fecha), sub: "Progreso", volver: "#/progreso", raiz: true, det: true, acciones: K.mas("res-mas", "Opciones de la sesión")});
  return arriba + `
    <div class="res" data-sesion="${K.esc(x.id)}"><div class="res-a">${arte}</div>
    <div class="res-b"><div class="enc-tit res-txt">${tx}</div>
      <div class="res-datos">${hz ? (K.rutina.mejorEs(hz.h) === "hecha" ? dato(K.reloj(x.duracion), "tiempo") : dato(K.hazanaValor(hz.h, x.hazana.valor, true), hz.h.formato === "amrap" ? "vueltas" : "tiempo")) + dato(K.rutina.NIVELES[x.hazana.nivel], "nivel") + dato(Math.max(1, Math.round(x.duracion / 60)), "min")
        : sp && sp.tipo !== "logrado" ? dato(K.cielo.corto(sp, sp.valor), "esta vez") + (marcaAntes !== null ? dato(K.cielo.corto(sp, marcaAntes), "tu marca") : "")
        : dato(Math.max(1, Math.round(x.duracion / 60)), "min") + dato(nSeries, nSeries === 1 ? "serie" : "series") + tercero}</div>
      ${kcal ? `<p class="ln mute small res-kcal"><span>Calorías, aproximadas</span><span class="num">${kcal} kcal</span></p>` : ""}
      ${c ? `<button type="button" class="btn" data-ir="#/cielo/${c.id}">Ver en el cielo</button>` : ""}</div></div>`;
};

/* 754 s → «12:34»; 7 vueltas → «7 vueltas»; corto, para un dato: «7» */
K.hazanaValor = (h, v, corto) => h.formato === "amrap" ? (corto ? String(v) : `${v} ${v === 1 ? "vuelta" : "vueltas"}`) : h.formato === "tiempo" || h.formato === "chipper" ? K.reloj(v) : "hecha";

/* el ⋯ del resumen: borrar esta sesión, con deshacer */
K.resumenMenu = btn => {
  const id = K.$(".res")?.dataset.sesion, x = K.diario.sesiones.find(s => s.id === id); if (!x) return;
  K.menu.abrir(btn, {titulo: "Sesión", items: [{id: "borrar", texto: "Borrar esta sesión", ic: "x"}],
    elegir: async () => {
      try { await K.diario.borrarSesion(id); } catch (e) { K.aviso("No se pudo borrar."); return; }
      const volver = K.ruta().tab === "progreso" ? "#/progreso" : "#/hoy";
      K.volver(volver);
      const t = K.fechaCorta(x.fecha).replace(",", ""), de = ["Hoy", "Ayer", "Anteayer"].includes(t) ? "de " : "del ";
      K.deshacer(`Borraste la sesión ${de}${t.toLowerCase()}`, async () => {
        try { await K.diario.guardarSesion(x); } catch (e) { K.aviso("No se pudo deshacer."); return; } K.refrescar(); });
    }});
};
