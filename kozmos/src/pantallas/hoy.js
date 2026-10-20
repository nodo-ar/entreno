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

K.P.hoy = r => r.sub === "rumbo" ? K.P.rumbo() : r.sub === "sesion" ? K.P.sesion() : r.sub === "resumen" ? K.P.resumen(r.sub2) : K.P.hoyInicio();

K.P.hoyInicio = () => {
  const f = new Date().toLocaleDateString("es-AR", {weekday: "long", day: "numeric", month: "long"});
  const enc = K.enc({titulo: "Hoy", sub: f, acciones: K.mas("hoy-mas")});
  const rumbo = K.rumbo(), sin = K.diario.guarda ? "" : `<p class="aviso-tenue">Este navegador no deja guardar datos. Lo que entrenes se pierde al cerrar.</p>`;
  if (!rumbo.length) return enc + `<section class="cd rumbo-vacio">${K.dibujo.una(K.cieloActual().constelaciones.find(c => c.id === "front-lever"), [])}
    <span class="lb">Tu rumbo</span><b class="t1">Elegí tu rumbo.</b><p class="mute">De 1 a 3 constelaciones. Kozmos arma cada día lo que toca para llegar.</p></section>${sin}
    <button type="button" class="btn" data-ir="#/hoy/rumbo">Elegir</button>`;
  const cielo = K.cieloActual(), ses = K.diario.sesiones, plan = K.plan.armar(cielo, rumbo, ses, K.hoy());
  const hechas = ses.filter(s => s.fecha === K.hoy());
  const hecho = hechas.length ? `<section class="aj"><button type="button" class="ajr" data-ir="#/progreso/${K.esc(hechas[hechas.length - 1].id)}"><span class="tile">${K.ic("check")}</span><span>Hoy ya entrenaste</span>
      <em class="num">${Math.round(hechas.reduce((t, s) => t + s.duracion, 0) / 60)} min</em>${K.ic("chev", "chev")}</button></section>` : "";
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
  const filas = plan.bloques.map(b => {
    const que = b.prueba ? `Prueba · ${K.esc(K.estrella(b.estrella).nombre)}` : `${K.esc(K.cons(b.constelacion).nombre)} · ${K.esc(K.ej(b.ejercicio).nombre)}`;
    return `<div class="ln toca${b.prueba ? " es-prueba" : ""}"><span class="tg"><i class="dot" style="--c:var(--${b.familia})"></i>${que}</span><span class="num">${K.esc(b.prueba ? K.cielo.corto(b, b.umbral) : K.queToca(b))}</span></div>`;
  }).join("");
  /* la ventana abierta se dice con la estrella que toca probar */
  const ventana = plan.ventana.length ? `<p class="hoy-ventana small"><b>Ventana abierta:</b> probá ${plan.ventana.map(id => K.esc(cielo.constelaciones.find(c => c.id === id).proxima.nombre)).join(" y ")}.</p>` : "";
  const toca = `<section class="cd hoy-toca"><div class="ln"><span class="lb">Hoy toca · ${plan.minutos} min</span><span class="num lb">${plan.bloques.length} ${plan.bloques.length === 1 ? "bloque" : "bloques"}</span></div>${ventana}${filas}
    ${plan.volviste ? `<p class="mute small">Tu cielo te esperó. Hoy arrancás más suave.</p>` : ""}</section>`;
  const cta = K.sesion.activa() ? `<button type="button" class="btn" data-ir="#/hoy/sesion">Volver a la sesión</button>`
    : `<button type="button" class="btn" id="s-empezar">${K.ic("play")}Empezar</button>`;
  return enc + `<div class="hoy">${hecho ? `<div class="hoy-a">${hecho}${proxima}</div>` : `<div class="hoy-a">${proxima}</div>`}<div class="hoy-b">${toca}${sin}${cta}</div></div>`;
};

K.hoyMenu = btn => K.menu.abrir(btn, {titulo: "Hoy", items: [{id: "rumbo", texto: "Cambiar el rumbo", ic: "cielo"}, {id: "anotar", texto: "Anotar algo hecho", ic: "cal"}],
  elegir: id => K.ir(id === "rumbo" ? "#/hoy/rumbo" : "#/cielo")});

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
const quedaTx = (q, tot) => q <= 0 ? "Ya podés seguir" : `de ${K.reloj(tot)}`;
/* el número grande de una serie: la cuenta para prepararse, el reloj que corre o lo que toca */
const grandeSerie = b => {
  const pr = K.sesion.prep();
  if (b.tipo === "segundos") return pr > 0 ? [String(Math.ceil(pr)), "Preparate"] : [K.reloj(K.sesion.enFase()), `de ${b.objetivo} s`];
  return [K.reloj(K.sesion.enFase()), b.tipo === "minutos" ? `de ${b.objetivo} min` : b.tipo === "sesiones" ? "unos 28 min" : "10 km"];
};
K.P.sesion = () => {
  const S = K.sesion.estado(), b = K.sesion.bloque(), nb = S.plan.bloques.length, e = K.ej(b.ejercicio);
  const c = K.cons(b.constelacion);
  const enSerie = S.fase === "serie";
  const donde = S.fase === "descanso" ? "Descanso" : S.fase === "cierre" ? "Última serie" : b.prueba ? "Prueba de estrella" : `Bloque ${S.b + 1} de ${nb} · ${c.nombre}`;
  const acc = `<div class="enc-acc ses-acc"><button type="button" class="ib" id="s-cortar" aria-label="Terminar la sesión">${K.ic("x")}</button>
    <span class="lb ses-donde">${K.esc(donde)}</span>${K.mas("s-mas", "Opciones de la sesión")}</div>`;
  const pasos = `<div class="stp" style="--c:var(--${b.familia})" aria-hidden="true">${Array.from({length: b.series}, (_, i) => `<i class="${i < S.s || (i === S.s && !enSerie) ? "d" : i === S.s ? "n" : ""}"></i>`).join("")}</div>`;
  const nom = `<span class="lb">${b.tipo === "logrado" ? "Intento" : "Serie"} ${S.s + 1} de ${b.series}${b.extra ? " · para sostener" : ""}</span>`;
  const pausa = S.pausa !== null ? `<p class="ses-pausa lb">En pausa</p>` : "";
  if (enSerie && b.prueba) return acc + K.P.prueba(S, b, e, pausa);
  if (enSerie){
    const o = b.objetivo, corre = CORRE.includes(b.tipo);
    const [gn, gl] = corre ? grandeSerie(b) : [];
    const grande = corre ? `<span class="reloj big num" data-r="fase">${gn}</span><span class="lb" data-r="fase-lb">${gl}</span>`
      : b.tipo === "repeticiones" ? `<span class="reloj big num">${o}</span><span class="lb">repeticiones</span>`
      : b.tipo === "porcentaje" ? `<span class="reloj big num">+${o} %</span><span class="lb">de tu peso${K.diario.perfil.peso ? ` · ${Math.round(o * K.diario.perfil.peso / 100 * 2) / 2} kg` : ""}</span>`
      : `<span class="lb">De punta a punta, sin ayuda</span>`;
    const sig = K.sesion.ultima() ? "Es la última" : b.series > S.s + 1 ? `Después: descanso de ${K.reloj(b.descanso)}` : `Después: ${K.ej(S.plan.bloques[S.b + 1].ejercicio).nombre}`;
    return acc + `<div class="ses serie"><div class="ses-a">${pasos}<div class="enc-tit ses-tit">${nom}<h1>${K.esc(e.nombre)}</h1></div>
        <p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}<div class="ses-reloj">${grande}</div></div>
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
    : `<span class="ln mute"><span>Para la próxima estrella</span><span class="num">${K.esc(K.cielo.corto(b, b.umbral))}</span></span>`;
  const tarjeta = `<section class="cd ses-anota"><span class="lb">${PREGUNTA[b.tipo]} · ${K.esc(e.nombre)}</span>${campo}${pie}</section>`;
  if (S.fase === "cierre") return acc + `<div class="ses cierre"><div class="ses-a">${pasos}<div class="enc-tit ses-tit">${nom}<h1>${K.esc(e.nombre)}</h1></div>${pausa}
      <div class="ses-reloj"><span class="reloj big num" data-r="total">${K.reloj(K.sesion.total())}</span><span class="lb">toda la sesión</span></div></div>
    <div class="ses-b">${tarjeta}<button type="button" class="btn" id="s-terminar">Terminar</button></div></div>`;
  const q = K.sesion.queda(), tot = S.total || 1;
  return acc + `<div class="ses descanso${q <= 0 ? " fin" : ""}" style="--c:var(--${b.familia});--cs:var(--${b.familia}-soft)" data-r="ses"><div class="ses-a"><div class="enc-tit vh"><h1>Descanso</h1></div>${pausa}
      <div class="anillo-desc${q <= 0 ? " listo" : ""}" data-r="anillo">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" class="pista"/><circle cx="100" cy="100" r="88" class="arco" data-r="arco" stroke-dasharray="${arco(q, tot)}" transform="rotate(-90 100 100)"/></svg>
        <div class="anillo-tx"><span class="reloj num" data-r="queda" role="timer" aria-live="off">${K.reloj(Math.max(0, Math.ceil(q)))}</span><span class="lb" data-r="queda-lb">${quedaTx(q, tot)}</span></div></div>
      <p class="ses-luego mute">Sigue: ${K.esc(K.sesion.proxima())}</p></div>
    <div class="ses-b">${tarjeta}<div class="tres-btn"><button type="button" class="btn sec" data-desc="-15" aria-label="15 segundos menos de descanso">−15 s</button><button type="button" class="btn sec" data-desc="15" aria-label="15 segundos más de descanso">+15 s</button><button type="button" class="btn" id="s-seguir">Seguir</button></div></div></div>`;
};

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
    return `<div class="ses serie"><div class="ses-a">${tit}<p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}<div class="ses-reloj">${grande}</div></div>
      <div class="ses-b"><button type="button" class="btn" id="s-listo">${K.ic("check")}Listo</button></div></div>`;
  }
  const [n, l] = pruebaGrande(b), p = Math.min(1, K.sesion.prep() > 0 ? 0 : K.sesion.enFase() / umbralSeg(b));
  return `<div class="ses serie prueba${K.sesion.prep() > 0 ? " prep" : ""}" style="--c:var(--${b.familia})" data-r="ses"><div class="ses-a">${tit}<p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}
      <div class="anillo-desc prueba-anillo${p >= 1 ? " listo" : ""}${p <= 0 ? " vacio" : ""}" data-r="anillo">
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
    else if (S.fase === "serie" && K.$('[data-r="fase"]', v)){ const [n, l] = grandeSerie(b); pon("fase", n); pon("fase-lb", l); }
    pon("total", K.reloj(K.sesion.total()));
    if (S.fase === "descanso"){
      const q = K.sesion.queda(), tot = S.total || 1;
      pon("queda", K.reloj(Math.max(0, Math.ceil(q))));
      pon("queda-lb", quedaTx(q, tot));
      K.$('[data-r="arco"]', v)?.setAttribute("stroke-dasharray", arco(q, tot));
      K.$('[data-r="anillo"]', v)?.classList.toggle("listo", q <= 0);
      K.$('[data-r="ses"]', v)?.classList.toggle("fin", q <= 0);
    }
    return;
  }
  /* afuera de la sesión, la isla lleva lo que corre */
  let texto, p = 0;
  if (S.pausa !== null) texto = "En pausa";
  else if (S.fase === "descanso"){ const q = K.sesion.queda(); texto = q > 0 ? `Descanso ${K.reloj(Math.ceil(q))}` : "A seguir"; p = Math.max(0, q) / (S.total || 1); }
  else if (S.fase === "cierre") texto = "Última serie";
  else if (K.sesion.prep() > 0) texto = `Preparate ${Math.ceil(K.sesion.prep())}`;
  else { texto = `${K.ej(b.ejercicio).nombre} ${K.reloj(K.sesion.enFase())}`; p = (S.s + 1) / b.series; }
  K.isla.mostrar({texto, p, familia: b.familia, ir: "#/hoy/sesion"});
};

/* ---------- lo que se toca en la sesión ---------- */
K.ses = {
  empezar(){
    const plan = K.plan.armar(K.cieloActual(), K.rumbo(), K.diario.sesiones, K.hoy());
    if (!plan.bloques.length) return;
    K.sesion.empezar(plan); K.ir("#/hoy/sesion");
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
  probar(cid){
    if (K.sesion.activa()){ K.ir("#/hoy/sesion"); K.aviso("Tenés una sesión abierta. Terminala para probar."); return; }
    const c = K.cieloActual().constelaciones.find(x => x.id === cid);
    if (!c || !K.plan.sePrueba(c)) return;
    K.sesion.empezar({bloques: [K.plan.prueba(c)], minutos: 5, volviste: false, ventana: [c.id], desde: `#/cielo/${c.id}`}); K.ir("#/hoy/sesion");
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
    const S = K.sesion.estado();
    K.menu.abrir(btn, {titulo: "Sesión", items: [
      {id: "pausa", texto: S.pausa !== null ? "Seguir el reloj" : "Pausar", ic: S.pausa !== null ? "play" : "pause"},
      {id: "saltear", texto: "Saltear este ejercicio", ic: "skip"},
      {id: "cielo", texto: "Mirar el cielo", ic: "cielo"}],
      elegir: id => {
        if (id === "pausa"){ K.sesion.pausar(); K.refrescar(); }
        else if (id === "saltear"){ if (K.sesion.saltear()) K.refrescar(); else K.ses.terminar(); }
        else K.ir("#/cielo");
      }});
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
      if (r.registro){ (K._origen = K._origen || {})[r.registro.id] = desde; K.ir(`#/hoy/resumen/${r.registro.id}`, true); } else K.volver(desde);
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
  let nuevas = x.encendio;
  if (!Array.isArray(nuevas)){ const ms = K.diario.mediciones; nuevas = K.cielo.nuevas(K.CATALOGO, ms, ms, x.fecha, ses.filter(s => s.id !== id), ses).map(n => n.estrella.id); } /* sesiones viejas, sin lo encendido escrito */
  const enc = nuevas.map(estrella).filter(Boolean), prim = enc[0];
  /* la constelación a mostrar: la de la estrella nueva o la del primer bloque que el catálogo todavía tiene */
  const c = prim ? prim.c : cielo.constelaciones.find(k => x.bloques.some(b => b.constelacion === k.id));
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
  } else {
    const p = c && c.proxima;
    tx = `<span class="lb">${x.cortada ? "Sesión cortada" : "Sesión hecha"}</span><h1 class="t1 res-tit">${x.cortada ? "Lo hecho cuenta." : "Hecho."}</h1>
      ${p ? `<p class="mute">Un paso más hacia ${K.esc(p.nombre)}.</p>` : ""}`;
  }
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
    <div class="res" data-sesion="${K.esc(x.id)}"><div class="res-a">${c ? `<section class="cd cons-cielo">${K.dibujo.una(c, recien)}</section>` : ""}</div>
    <div class="res-b"><div class="enc-tit res-txt">${tx}</div>
      <div class="res-datos">${sp && sp.tipo !== "logrado" ? dato(K.cielo.corto(sp, sp.valor), "esta vez") + (marcaAntes !== null ? dato(K.cielo.corto(sp, marcaAntes), "tu marca") : "")
        : dato(Math.max(1, Math.round(x.duracion / 60)), "min") + dato(nSeries, nSeries === 1 ? "serie" : "series") + tercero}</div>
      ${kcal ? `<p class="ln mute small res-kcal"><span>Calorías, aproximadas</span><span class="num">${kcal} kcal</span></p>` : ""}
      ${c ? `<button type="button" class="btn" data-ir="#/cielo/${c.id}">Ver en el cielo</button>` : ""}</div></div>`;
};

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
