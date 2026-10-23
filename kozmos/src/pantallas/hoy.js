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
K.pide = ids => { const xs = ids.map(K.equipoNombre); return (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}` : xs.join("")).toLowerCase(); };
/* lo que dice una constelación de su avance: «3 de 8», o lo que pide si sin tu equipo no puede seguir (nunca «0 de 0») */
K.cuentaCons = c => !c.proxima && !c.completa && c.pide.length ? `Pide ${K.pide(c.pide)}` : `${c.encendidas} de ${c.total}`;
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
  /* «4 × 5», no «4 × ×5»: con series, las repeticiones van sin su × */
  return b.series > 1 ? `${b.series} × ${b.tipo === "repeticiones" ? b.objetivo : v}` : v;
};
const PREGUNTA = {segundos: "¿Cuántos segundos?", repeticiones: "¿Cuántas salieron?", minutos: "¿Cuántos minutos?", "menos-minutos": "¿En cuántos minutos?", porcentaje: "¿Cuánto lastre?", logrado: "¿Salió?", sesiones: "¿La hiciste?",
  puntos: "¿Cuántos puntos?", cm: "¿Cuántos centímetros?", km: "¿Cuántos km?"};
const UNI = {segundos: "segundos", repeticiones: "repeticiones", minutos: "minutos", "menos-minutos": "minutos", puntos: "puntos, de 0 a 10", cm: "cm más allá de los pies", km: "km en la pantalla"};
/* cuánto suma cada toque de − y +, y hasta dónde baja: los centímetros pueden ser negativos, los puntos van de medio en medio;
   los kilos de las mancuernas, de a uno */
K.pasoDe = (tipo, campo = "valor") => campo === "kg" ? {inc: 1, min: 0, max: 200} : campo !== "valor" ? {inc: .5, min: 0, max: 1e5} : ({puntos: {inc: .5, min: 0, max: 10}, cm: {inc: 1, min: -50, max: 100}, km: {inc: .1, min: 0, max: 1e3}})[tipo] || {inc: 1, min: 0, max: 1e5};

K.P.hoy = r => r.sub === "rumbo" ? K.P.rumbo() : r.sub === "equipo" ? K.P.equipo("hoy") : r.sub === "nivel" ? K.P.nivel("hoy") : r.sub === "sesion" ? K.P.sesion() : r.sub === "resumen" ? K.P.resumen(r.sub2) : K.P.hoyInicio();

/* la rutina que seguís, si sigue en el catálogo, y por dónde vas */
K.rutinaDe = id => K.RUTINAS.find(r => r.id === id);
K.rutinaActual = () => {
  const x = K.diario.perfil.rutina, r = x && K.rutinaDe(x.id);
  return r ? {r, cur: K.rutina.enCurso(r, x.desde, K.diario.sesiones)} : null;
};
const ctxRutina = K.ctxRutina = () => ({ej: K.EJ, equipo: K.diario.perfil.equipo || null, sesiones: K.diario.sesiones, marcas: K.diario.mediciones});
/* ===== Escalones: por dónde vas en cada escalera, igual en Hoy y en Planes ===== */
const MARCA = {sube: "▲ nuevo", baja: "▼ más fácil", carga: "▲ más peso"};
K.marcaPaso = b => b.descarga ? "más liviana" : MARCA[b.nuevo] || "";
/* cada escalera dibujada como una escalerita, lo subido en tinta y el escalón de ahora en su color */
K.escalerasMini = (es, fam) => `<ul class="esc-mini">${es.map(x => `<li style="--c:var(--${x.familia || fam})">
    <span class="esc-sub" role="img" aria-label="${K.esc(`Escalón ${x.i + 1} de ${x.total}: ${K.ej(x.paso.ejercicio).nombre}${x.descarga ? ", más liviana" : ""}`)}">${x.pasos.map((_, k) => `<i class="${k < x.i ? "d" : k === x.i ? "n" : ""}" style="height:${(30 + 70 * (x.total > 1 ? k / (x.total - 1) : 1)).toFixed(0)}%"></i>`).join("")}</span>
    <b class="em-nom">${K.esc(x.nombre)}</b><small class="num em-n">${x.i + 1}/${x.total}</small></li>`).join("")}</ul>`;
/* lo que cambió en cada escalera con una sesión, para el resumen: ▲ subiste, = seguís, ▼ bajás */
const SIGNO = {sube: "▲", carga: "▲", baja: "▼", "menos-peso": "▼"};
const signoDe = y => SIGNO[y.evento] || (y.evento === "prueba" && SIGNO[y.nuevo]) || "=";
/* lo que dice cada fila, en HTML: los kilos de ahora un tono más suave; «La próxima» con sus números en fila (iguales, «3 × 4») */
const cambioHtml = x => {
  const n = id => K.esc(K.ej(id).nombre), kg = v => String(v).replace(".", ",");
  if (x.evento === "sube") return `${n(x.de.ejercicio)} → ${n(x.a.ejercicio)}`;
  if (x.evento === "baja") return `Volvés a ${n(x.a.ejercicio)}`;
  if (x.evento === "carga") return K.jer(`+${kg(x.carga)} kg`, `ahora ${kg(x.kg)} kg`);
  if (x.evento === "menos-peso") return K.jer(`−${kg(x.carga)} kg`, `ahora ${kg(x.kg)} kg`);
  if (x.evento === "trabado") return "La próxima, más liviana";
  if (x.evento === "descarga") return "La próxima, volvés a probar";
  if (x.evento === "cima") return "Arriba de todo";
  if (x.evento === "prueba") return x.nuevo === "sube" ? `Por la prueba, pasás a ${n(x.a.ejercicio)}` : x.nuevo === "baja" ? `Por la prueba, volvés a ${n(x.a.ejercicio)}` : `Seguís en ${n(x.a.ejercicio)}${Number.isFinite(x.proxima?.[0]) ? `, ${x.proxima[0]} por serie` : ""}`;
  return x.proxima?.length ? `La próxima: <span class="num">${K.rutina.serie(x.proxima.map(v => v === "max" ? "máx" : String(v)))}</span>` : "Seguís acá";
};
/* lo que toca hoy: la sesión de tu rutina, o el día que arma el motor con tu rumbo (K.dia, un molde para cada día).
   La ventana de prueba va primero en los dos casos. En la semana de prueba (cada tantas semanas, según el bloque de tu rutina)
   es una descarga, la mitad de las series, con las pruebas adelante (y la entrada en calor antes que todo). */
K.hoyPlan = () => {
  const cielo = K.cieloActual(), ses = K.diario.sesiones, hoy = K.hoy(), ctx = ctxRutina(), ru = K.rutinaActual();
  const sp = K.plan.semanaDePrueba(K.diario.perfil, ses, hoy), pc = {cielo, sesiones: ses, equipo: ctx.equipo, ej: K.EJ, hoy};
  if (!ru || ru.cur.terminada){
    /* tu nivel: el escalón de arranque de cada escalera y lo que da por hecho (el cosmos ya lo trae; K.dia.armar lo vuelve a mirar) */
    const dadas = K.nivel.activas(cielo, K.dadasDeTuNivel(), {fecha: K.diario.perfil.nivel?.fecha});
    const dia = K.dia.armar(cielo, K.rumbo(), ses, hoy, {ej: K.EJ, equipo: ctx.equipo, marcas: ctx.marcas, nivelDesde: K.desdeTuNivel(), dadas, descarga: !!(sp && sp.toca)});
    return sp && sp.toca && dia.bloques.length ? K.dia.deSemanaDePrueba(dia, sp, {...pc, cons: K.rumbo(), ejs: []}) : dia;
  }
  /* boceto: la rutina en el mismo molde que Hoy, con sus escaleras desde tu nivel */
  const rc = {...ctx, nivelDesde: K.desdeTuNivel()};
  if (sp && sp.toca){
    const plan = K.dia.deRutina(ru.r, ru.cur.i, {...rc, descarga: true});
    const cons = [...new Set(ru.r.alimenta.map(id => id.split(".")[0]))], ejs = K.rutina.escalerasDe(ru.r, rc).flatMap(x => x.pasos.map(p => p.ejercicio));
    return K.dia.deSemanaDePrueba(plan, sp, {...pc, cons, ejs});
  }
  const plan = K.dia.deRutina(ru.r, ru.cur.i, rc);
  /* la última semana de una rutina que termina en un desafío es la meta: completa, sin descarga ni pruebas sueltas */
  if (sp && sp.meta) return {...plan, ventana: [], volviste: false, meta: {rutina: ru.r.id, semana: sp.semana}};
  /* con rutina, la ventana abre solo para lo que la rutina entrena, y nunca una prueba larga (minutos) antes de la sesión */
  const lleva = new Set(ru.r.alimenta.map(id => id.split(".")[0]));
  const pruebas = K.dia.ventana(cielo, K.rumbo(), ses, hoy).filter(c => lleva.has(c.id) && c.proxima.prueba.tipo !== "minutos").map(K.plan.prueba);
  /* la prueba va después de la entrada en calor, descansado, como en Hoy */
  const e = plan.bloques.filter(b => b.molde === "entrada");
  return {...plan, bloques: [...e, ...pruebas, ...plan.bloques.filter(b => b.molde !== "entrada")], ventana: pruebas.map(b => b.constelacion), volviste: false, minutos: plan.minutos + pruebas.length * 5};
};
/* lo que dice una fila de «Hoy toca»: qué y cuánto, en HTML. Una prueba o una estrella de una constelación: la categoría suave, el nombre en tinta */
const corto = (tipo, o) => o === "max" ? "máx" : tipo === "segundos" ? `${o} s` : String(o);
K.filaToca = b => {
  if (b.hazana){ const h = K.hzDe(b.hazana); return [K.cat("Prueba", K.esc(h ? h.nombre : b.nombre)), b.formato === "escalera" ? "una más por minuto" : b.formato === "tiempo" ? "por tiempo" : b.reloj ? `${Math.round(b.reloj / 60)} min` : "máx"]; }
  if (b.prueba) return [K.cat("Prueba", K.esc(K.estrella(b.estrella).nombre)), K.esc(K.cielo.corto(b, b.umbral))];
  if (b.constelacion){
    // Si el ejercicio ya lleva el nombre de la constelación, no se repite.
    const c = K.cons(b.constelacion).nombre, e = K.ej(b.ejercicio).nombre;
    return [e.toLowerCase().startsWith(c.toLowerCase()) ? K.esc(e) : K.cat(K.esc(c), K.esc(e)), K.esc(K.queToca(b))];
  }
  if (b.clase === "tramos") return [K.esc(b.nombre || ""), `${Math.round(b.tramos.reduce((a, x) => a + x.seg, 0) / 60)} min`];
  if (b.clase === "circuito") return [K.esc(b.nombre), b.formato === "amrap" ? `${b.minutos} min` : `${b.rondas} ${b.rondas === 1 ? "vuelta" : "vueltas"}`];
  const ejs = [...new Set(b.pasos.map(p => p.ejercicio))], os = [...new Set(b.pasos.map(p => p.objetivo))];
  return [K.esc(ejs.map(e => K.ej(e).nombre).join(" + ")), K.esc(ejs.length > 1 ? `${b.series} series` : os.length === 1 ? `${b.series} × ${corto(b.tipo, os[0])}` : K.rutina.serie(b.pasos.map(p => corto(p.tipo, p.objetivo))))];
};
/* una fila de lo que toca: el punto de su familia, qué y cuánto (en HTML). La misma en Hoy y en los días de una rutina.
   «marcas»: lo que la sesión dice en la serie («más liviana», «Para Planche»), debajo del nombre, cada una en su renglón y en el color de la familia.
   «kg»: los kilos van debajo de lo que toca, en la misma columna, como su propia ficha con la mancuerna */
K.filaLn = (q, n, fam, prueba = false, marcas = [], kg = "") => `<div class="ln toca${prueba ? " es-prueba" : ""}" style="--c:var(--${fam})"><span class="toca-q"><span class="tg"><i class="dot"></i>${q}</span>${marcas.filter(Boolean).map(m => ` <small class="toca-marca">${K.esc(m)}</small>`).join("")}</span><span class="num toca-n"><span>${n}</span>${kg ? " " + K.pesa(K.esc(kg)) : ""}</span></div>`;
/* las filas de una sesión armada (K.rutina.filas): una por ejercicio. Los de una superserie van juntos, con su nota */
const PAR = {2: "en superserie", 3: "en triserie"};
K.filasHtml = (fs, {sinPar = false} = {}) => {
  const marca = (f, liv) => [...(f.marcas || []), liv ? "más liviana" : ""];
  const una = f => f.otro ? K.filaLn(...K.filaToca(f.otro), f.otro.familia, !!(f.otro.prueba || f.otro.hazana), marca(f, f.otro.descarga))
    : K.filaLn(K.esc(f.q), K.jer(K.esc(f.n), K.esc(f.nq || "")), f.familia, false, marca(f, f.descarga), f.kg);
  let h = "";
  for (let k = 0; k < fs.length;){
    const f = fs[k];
    if (f.par === undefined){ h += una(f); k++; continue; }
    let j = k; while (j < fs.length && fs[j].par === f.par) j++;
    h += `<div class="toca-par">${fs.slice(k, j).map(una).join("")}${sinPar ? "" : `<small class="toca-par-tx">${PAR[j - k] || "alternadas"}</small>`}</div>`;
    k = j;
  }
  return h;
};
const filasToca = bs => K.filasHtml(K.rutina.filas(bs, K.EJ));
/* el día del motor por partes, siempre en el mismo orden: cada parte con su título y sus filas.
   Las habilidades dicen para qué meta de tu rumbo son («Para Muscle-up y Un brazo»; «Camino a …» si vas por la escalera) */
const PARTE = {entrada: "Entrada en calor", prueba: K.jer("Pruebas", "descansado"), habilidad: K.jer("Habilidad", "descansado"), fuerza: K.jer("Fuerza", "de a dos"), abdomen: "Abdomen", cierre: "Cierre",
  /* boceto: lo de una rutina de motor o de rango, con el nombre de su familia; la fuerza que no va de a dos, sin «de a dos» */
  motor: "Motor", rango: "Rango"};
/* la fuerza (y el abdomen de una rutina) dicen «de a dos» solo si todo lo de esa parte va de a dos; sin eso, solo su nombre */
const DE_A_DOS = {fuerza: ["Fuerza", K.jer("Fuerza", "de a dos")], abdomen: ["Abdomen", K.jer("Abdomen", "de a dos")]};
const minDe = ts => `${Math.max(1, Math.round(ts.reduce((t, x) => t + x.seg, 0) / 60))} min`;
const secMin = (t, ts) => `<p class="ln toca-sec"><span class="lb">${t}</span><span class="num lb">${K.dur(minDe(ts))}</span></p>`;
const CLASE_V = "Vuelta a la calma";
const nombres = ids => { const xs = ids.map(id => K.cons(id)?.nombre).filter(Boolean); return xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}` : xs.join(""); };
/* para qué meta es una habilidad: un renglón por cosa («Camino a …» y, debajo, «Para Planche») */
K.paraTx = b => b.constelaciones?.length ? (b.camino ? [b.nombre, `Para ${nombres(b.constelaciones)}`] : [`Para ${nombres(b.constelaciones)}`]) : [];
K.filasMolde = bs => {
  let h = "", antes = null;
  const dos = b => new Set((b.pasos || []).map(p => p.ejercicio)).size > 1;
  for (let k = 0; k < bs.length; k++){
    const b = bs[k], m = b.molde || "prueba";
    /* un bloque de motor de una rutina trae su entrada y su vuelta a la calma: se muestran en sus partes, como en Hoy */
    if (m === "motor" && b.tramos){
      const i0 = b.tramos.findIndex(t => t.clase !== "entrada"), i1 = b.tramos.length - [...b.tramos].reverse().findIndex(t => t.clase !== "vuelta");
      const ent = b.tramos.slice(0, i0), vue = b.tramos.slice(i1);
      if (ent.length && antes !== "entrada") h += secMin(PARTE.entrada, ent);
      h += `<p class="toca-sec lb">${PARTE.motor}</p>` + K.filasHtml(K.rutina.filas([b], K.EJ));
      if (vue.length) h += `<p class="toca-sec lb">${PARTE.cierre}</p>` + K.filaLn(K.esc(CLASE_V), K.esc(minDe(vue)), b.familia);
      antes = vue.length ? "cierre" : "motor"; continue;
    }
    if (m !== antes){
      let j = k; while (j < bs.length && (bs[j].molde || "prueba") === m) j++;
      const t = DE_A_DOS[m] ? DE_A_DOS[m][+bs.slice(k, j).every(dos)] : PARTE[m];
      h += m === "entrada" ? secMin(PARTE[m], b.tramos) : `<p class="toca-sec lb">${t || ""}</p>`;
      antes = m;
    }
    if (m === "entrada") continue;
    const para = K.paraTx(b);
    /* una estrella de tu rumbo: el ejercicio y lo que se pide, con la meta debajo (la prueba, como siempre) */
    const fs = b.constelaciones && !b.pasos && !b.prueba ? [{q: K.ej(b.ejercicio).nombre, n: K.queToca(b), familia: b.familia, ...(b.descarga ? {descarga: true} : {})}] : K.rutina.filas([b], K.EJ);
    h += K.filasHtml(para.length ? fs.map(f => ({...f, marcas: para})) : fs, {sinPar: !!DE_A_DOS[m]});
  }
  return h;
};
/* la semana de prueba se dice arriba de lo que toca: cuántas pruebas y cuántas estrellas pueden encender.
   En la última semana de una rutina que termina en un desafío, la meta */
K.metaLn = (r, w) => { const m = K.rutina.metaDe(r); return `<p class="hoy-ventana hoy-sp hoy-meta small">${K.aparte(`<b>Semana ${w}: la meta</b>`, m ? K.esc(m.charAt(0).toUpperCase() + m.slice(1)) : "")}</p>`; };
const pruebaLn = K.pruebaLn = plan => {
  if (plan.meta) return K.metaLn(K.rutinaDe(plan.meta.rutina), plan.meta.semana);
  const sp = plan.semanaPrueba; if (!sp) return "";
  const n = sp.pruebas, e = plan.pruebas ? plan.pruebas.encienden.length : 0;
  return `<p class="hoy-ventana hoy-sp small">${K.aparte("<b>Semana de prueba</b>", n ? `${n} ${n === 1 ? "prueba" : "pruebas"}${e ? ` que ${n === 1 ? "enciende" : "encienden"} hasta ${e} ${e === 1 ? "estrella" : "estrellas"}` : ""}` : "Más liviana, para llegar descansado")}</p>`;
};
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
  if (!rumbo.length && K.primerDia()) return enc + K.hoyComo() + sin;
  if (!rumbo.length) return enc + `<section class="cd rumbo-vacio">${K.cieloTrio(64)}
    <span class="lb">Tu rumbo</span><b class="t1">Elegí tu rumbo.</b><p class="mute">Las constelaciones que quieras. Kozmos rota lo que toca cada día.</p></section>${sin}
    <button type="button" class="btn" data-ir="#/hoy/rumbo">Elegir</button>`;
  const cielo = K.cieloActual(), plan = K.hoyPlan(), hecho = hechoHoy();
  const delRumbo = cielo.constelaciones.filter(c => rumbo.includes(c.id));
  if (delRumbo.length && delRumbo.every(c => c.completa)) return enc + hecho + `<section class="cd"><span class="lb">Tu rumbo, completo</span><b class="t1">Llegaste.</b><p class="mute">¿Cuál sigue?</p></section>
    <button type="button" class="btn" data-ir="#/hoy/rumbo">Elegir la que sigue</button>`;
  /* la próxima estrella de la primera habilidad del día: su constelación en su anillo, como la próxima prueba en Planes.
     Un día solo de fuerza (lo de tu rumbo pide equipo que no marcaste) no la muestra */
  const cid = plan.bloques.filter(b => b.molde === "habilidad" || b.prueba).flatMap(b => b.constelaciones || [b.constelacion])[0];
  const c = cid && cielo.constelaciones.find(x => x.id === cid), p = c && c.proxima;
  const proxima = p ? `<section class="cd hoy-prox" style="--c:var(--${c.familia})"><div class="pl-prox-cab"><span class="pl-prox-fig">${K.icono.constelacion(c, 64)}</span><div class="pl-prox-tx">
      <span class="lb">${K.jer("Próxima estrella", K.esc(c.nombre))}</span><b class="t1">${K.nw(p.nombre)}</b></div></div>
      <div class="bar" style="--c:var(--${c.familia})" role="progressbar" aria-label="Avance hacia ${K.esc(p.nombre)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(c.avance * 100)}"><i style="width:${(c.avance * 100).toFixed(1)}%"></i></div>
      <span class="ln mute"><span>Tu mejor marca</span>${p.mejor === null ? "<span>Todavía ninguna</span>" : `<span class="num">${K.esc(K.cielo.corto(p.prueba, p.mejor))}</span>`}</span></section>` : "";
  const filas = plan.molde ? K.filasMolde(plan.bloques) : filasToca(plan.bloques);
  /* la ventana abierta se dice con la estrella que toca probar */
  const ventana = plan.ventana.length ? `<p class="hoy-ventana small"><b>Ventana abierta:</b> probá ${plan.ventana.map(id => K.esc(cielo.constelaciones.find(c => c.id === id).proxima.nombre)).join(" y ")}.</p>` : "";
  /* lo que viene en la rotación, y lo de tu rumbo que pide equipo que no marcaste (con el atajo a Tu equipo) */
  /* «La próxima»: la etiqueta y, a la derecha, una debajo de la otra, las que siguen con el punto de su familia */
  const prox = (plan.proxima || []).map(K.cons).filter(Boolean);
  const pie = prox.length ? `<div class="ln hoy-pie"><span class="lb">La próxima</span> <span class="hoy-pie-n">${prox.map(c => `<span class="tg small"><i class="dot" style="--c:var(--${c.familia})"></i>${K.esc(c.nombre)}</span>`).join(" ")}</span></div>` : "";
  /* lo que pide equipo: cada una en su renglón */
  const pide = plan.pide && plan.pide.length ? `<button type="button" class="ln hoy-pide small" data-ir="#/vos/equipo"><span class="hoy-pide-tx">${plan.pide.map(x => `<span>${K.esc(x.nombre)} pide ${K.esc(K.pide(x.pide))}</span>`).join(" ")}</span><span class="hoy-pide-ir">Tu equipo${K.ic("chev", "chev")}</span></button>` : "";
  /* arriba, lo que toca y cuánto dura, con su reloj */
  const toca = `<section class="cd hoy-toca"><div class="ln"><span class="lb">Hoy toca</span><span class="num lb">${K.dur(`${plan.minutos} min`)}</span></div>${pruebaLn(plan)}${ventana}${filas}
    ${plan.volviste ? `<p class="mute small">Tu cosmos te esperó. Hoy arrancás más suave.</p>` : ""}${pie}${pide}</section>`;
  return enc + `<div class="hoy"><div class="hoy-a">${hecho}${K.hoyOrigen()}${proxima}</div><div class="hoy-b">${toca}${sin}${ctaHoy()}</div></div>`;
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
    <button type="button" class="btn" data-ir="#/planes">Elegir otra rutina</button>`;
  const plan = K.hoyPlan(), cielo = K.cieloActual();
  /* «Entrena para»: la primera que no encendiste ni te dio tu nivel */
  const est = r.alimenta.map(id => cielo.constelaciones.flatMap(c => c.estrellas).find(e => e.id === id)).filter(Boolean), sig = est.find(e => !e.encendida && !e.dada) || est[est.length - 1];
  const s = r.sesiones[cur.i];
  /* el nombre y la semana van en la fila de origen, arriba; acá, el avance: en una rutina con escaleras, el escalón de cada una */
  const es = K.rutina.escalerasDe(r, {...ctxRutina(), nivelDesde: K.desdeTuNivel()});
  const top = es.length ? `<section class="cd hoy-rut"><span class="lb">Tu avance</span>${K.escalerasMini(es, r.familia)}
      ${sig ? `<span class="ln mute small"><span>Entrena para</span><span>${K.esc(sig.nombre)}</span></span>` : ""}</section>`
    : `<section class="cd hoy-rut"><span class="lb">Tu avance</span>
      <div class="bar" style="--c:var(--${r.familia})" role="progressbar" aria-label="Avance de la rutina" aria-valuemin="0" aria-valuemax="${cur.total}" aria-valuenow="${cur.i}"><i style="width:${(cur.i / cur.total * 100).toFixed(1)}%"></i></div>
      <span class="ln mute"><span>Día ${cur.dia} de ${r.dias}</span><span class="num">${cur.i} de ${cur.total}</span></span>
      ${sig ? `<span class="ln mute small"><span>Entrena para</span><span>${K.esc(sig.nombre)}</span></span>` : ""}</section>`;
  const ventana = plan.ventana.length ? `<p class="hoy-ventana small"><b>Ventana abierta:</b> probá ${plan.ventana.map(id => K.esc(cielo.constelaciones.find(c => c.id === id).proxima.nombre)).join(" y ")}.</p>` : "";
  const toca = `<section class="cd hoy-toca"><div class="ln"><span class="lb">${K.jer("Hoy toca", K.esc(s.nombre))}</span><span class="num lb">${K.dur(`${plan.minutos} min`)}</span></div>${pruebaLn(plan)}${ventana}${plan.molde ? K.filasMolde(plan.bloques) : filasToca(plan.bloques)}
    ${s.nota ? `<p class="mute small">${K.esc(s.nota)}</p>` : ""}</section>`;
  return `<div class="hoy"><div class="hoy-a">${hecho}${K.hoyOrigen()}${top}</div><div class="hoy-b">${toca}${sin}${ctaHoy()}</div></div>`;
};

/* el ⋯ de Hoy: lo de hoy. Rutinas y hazañas tienen su pestaña, Planes. */
K.hoyMenu = btn => {
  const ru = K.rutinaActual();
  const items = [{id: "rumbo", texto: "Cambiar el rumbo", ic: "rumbo"}, ...(ru ? [{id: "dejar", texto: "Dejar la rutina", ic: "x"}] : []), {id: "anotar", texto: "Anotar algo hecho", ic: "cal"}];
  K.menu.abrir(btn, {titulo: "Hoy", items, elegir: id => id === "dejar" ? K.rutinaDejar() : K.ir({rumbo: "#/hoy/rumbo", anotar: "#/cielo"}[id])});
};

/* ===== De dónde sale lo de hoy: tu rutina o tu rumbo, siempre a la vista y a un toque de cambiarlo ===== */
K.hoyOrigen = () => {
  const ru = K.rutinaActual(), fila = (ir, ico, lb, tx, em = "") => `<section class="aj hoy-origen"><button type="button" class="ajr" data-ir="${ir}"><span class="tile ico-tile">${ico}</span>
    <span class="ses-fila"><small class="lb">${lb}</small>${tx}</span><em class="num">${em}</em>${K.ic("chev", "chev")}</button></section>`;
  if (ru && !ru.cur.terminada) return fila(`#/planes/rutinas/${ru.r.id}`, K.icono.rutina(ru.r, 40), "Sale de tu rutina", K.esc(ru.r.nombre), `sem ${ru.cur.semana} de ${ru.r.semanas}`);
  const cs = K.rumbo().map(K.cons).filter(Boolean), cielo = cs.length && K.cieloActual(), c0 = cs.length && cielo.constelaciones.find(c => c.id === cs[0].id);
  /* con muchas metas, las dos primeras y cuántas más: la fila entra en un renglón */
  const tx = K.yLista(cs.length > 3 ? [...cs.slice(0, 2).map(c => K.esc(c.nombre)), `${cs.length - 2} más`] : cs.map(c => K.esc(c.nombre)));
  return cs.length ? fila("#/hoy/rumbo", c0 ? K.icono.constelacion(c0, 40) : K.ic("rumbo"), "Sale de tu rumbo", tx) : "";
};

/* ===== El primer día: Hoy ofrece cómo empezar; «Que Kozmos arme tu día» guía en tres pasos (tu equipo, tu nivel, tu rumbo).
   Una sola guía: se va sola con la primera sesión o la primera marca. ===== */
K.primerDia = () => !K.diario.sesiones.length && !K.diario.mediciones.length;
/* los pasos de una guía: etapas es la lista de nombres y n el paso en el que estás (desde 1) */
K.pasos = (etapas, n) => `<ol class="pasos" style="--n:${etapas.length}" aria-label="Paso ${n} de ${etapas.length}">${etapas.map((t, i) =>
  `<li class="${i + 1 < n ? "hecho" : i + 1 === n ? "ahora" : ""}"${i + 1 === n ? ' aria-current="step"' : ""}><i class="num">${i + 1 < n ? K.ic("check") : i + 1}</i><span>${t}</span></li>`).join("")}</ol>`;
/* «Que Kozmos arme tu día», el primer día: tu equipo, tu nivel y tu rumbo. Cada pantalla pide su paso por id:
   los números, volver y «Seguir» salen de esta lista. */
K.ARMAR = [{id: "equipo", nombre: "Tu equipo", ir: "#/hoy/equipo"}, {id: "nivel", nombre: "Tu nivel", ir: "#/hoy/nivel"}, {id: "rumbo", nombre: "Tu rumbo", ir: "#/hoy/rumbo"}];
K.pasoArmar = id => {
  const i = K.ARMAR.findIndex(x => x.id === id), prev = K.ARMAR[i - 1], P = K._pila || [];
  /* volver va al paso anterior si venías de ahí; si no (por ejemplo, desde el ⋯ de Hoy), a Hoy */
  return {pasos: K.pasos(K.ARMAR.map(x => x.nombre), i + 1), antes: prev && P[P.length - 2] === prev.ir ? prev.ir : "#/hoy", sigue: K.ARMAR[i + 1]?.ir || ""};
};
/* las semanas de una rutina, en puntos: lo hecho lleno */
const dibSemanas = (hechas, col) => `<svg class="dib-sem" viewBox="0 0 86 34" aria-hidden="true">${Array.from({length: 21}, (_, i) =>
  `<circle cx="${5 + i % 7 * 12.6}" cy="${5 + Math.floor(i / 7) * 12}" r="4" fill="${i < hechas ? `var(--${col})` : "var(--s2)"}"/>`).join("")}</svg>`;
K.hoyComo = () => {
  const hz = K.HAZANAS.hazanas[0];
  const op = (ir, dib, t, tx) => `<button type="button" class="cd como-op" data-ir="${ir}"><span class="como-dib">${dib}</span><b class="t1">${t}</b><small>${tx}</small>${K.ic("chev", "como-ir")}</button>`;
  return `<div class="como">${op(K.ARMAR[0].ir, K.cieloTrio(64), "Que Kozmos arme tu día", "Tu equipo, tu nivel y tus constelaciones. Cada día te da lo que toca.")}
    ${op("#/planes", dibSemanas(5, "fu"), "Seguí una rutina", "Un plan fijo de semanas. Hoy te da cada sesión.")}</div>
    ${hz ? `<section class="aj"><button type="button" class="ajr" data-ir="#/planes/hazanas/${hz.id}"><span class="tile ico-tile">${K.hzIcono(hz, 40)}</span><span class="ses-fila">¿Solo por hoy?<small class="mute">Probá una hazaña: un desafío, un día</small></span><em></em>${K.ic("chev", "chev")}</button></section>` : ""}
    <p class="como-cielo small mute">${K.ic("cielo")}<span>Lo que hagas enciende estrellas en tu cosmos.</span></p>`;
};

/* ===== Tu rumbo: las constelaciones que quieras (motor B, sin tope). Cada toque queda guardado; no hay que confirmar.
   Debajo, cuántas elegiste y cada cuánto toca cada una: dos habilidades por día, repartidas entre tus días. ===== */
K.P.rumbo = () => {
  const r = K.rumbo(), cielo = K.cieloActual();
  /* dónde arranca cada una que elegiste y todavía no empezaste: con tu nivel, más arriba */
  const escalones = K.rutina.escalonesTodos({...ctxRutina(), desde: K.desdeTuNivel()});
  const arranca = c => { const a = r.includes(c.id) && !c.marcas.length && K.nivel.arrancasEn(c, {escalones, ej: K.EJ}); return a ? `<small class="mute rumbo-arranca">${K.esc(a.texto)}</small>` : ""; };
  const lista = K.CATALOGO.familias.map(f => `<section class="fam"><span class="lb tg"><i class="dot" style="--c:var(--${f.id})"></i>${K.esc(f.nombre)}</span>
    <div class="aj">${cielo.constelaciones.filter(c => c.familia === f.id).map(c => `<button type="button" class="ajr rumbo-fila" data-rumbo="${c.id}" aria-pressed="${r.includes(c.id)}">
      <span class="tile ico-tile">${K.icono.constelacion(c, 40)}</span><span class="ses-fila">${K.esc(c.nombre)}${arranca(c)}</span><em class="num${!c.proxima && !c.completa && c.pide.length ? " pide" : ""}">${K.esc(K.cuentaCons(c))}</em>${r.includes(c.id) ? K.ic("check", "ck") : "<span></span>"}</button>`).join("")}</div></section>`).join("");
  /* el primer día es el último paso de «Que Kozmos arme tu día»; «Listo» vuelve a Hoy, salteando los pasos */
  const paso = K.primerDia() && K.pasoArmar("rumbo");
  return K.enc({titulo: "Tu rumbo", sub: paso ? "Para empezar" : "Hoy", volver: paso ? paso.antes : "#/hoy", det: true, sinNav: true}) +
    (paso ? paso.pasos : "") + `<p class="ayuda">Elegí las que quieras. Kozmos rota lo que toca cada día.</p>${lista}` +
    K.pie(`${K.rumboCuanto(r, cielo)}<button type="button" class="btn rumbo-listo" data-volver="#/hoy">Listo</button>`);
};
/* «5 elegidas» a la izquierda y, a la derecha, cada cuánto toca cada una («1–2× por semana», con el calendario):
   las de fuerza se reparten las dos habilidades de cada día; rango y motor, el cierre */
K.rumboCuanto = (r, cielo) => {
  if (!r.length) return "";
  const todas = r.map(id => cielo.constelaciones.find(c => c.id === id)).filter(Boolean), cs = todas.filter(c => c.proxima), fu = cs.filter(c => c.familia === "fu");
  const D = K.dia.diasSemana(K.diario.perfil, K.diario.sesiones, K.hoy()), f = fu.length ? K.dia.frecuencia(fu.length, D) : cs.length ? Math.min(D, D / cs.length) : 0;
  const lo = Math.floor(f), hi = Math.ceil(f), vez = n => `${n} ${n === 1 ? "vez" : "veces"}`;
  /* si todas se pueden, el número alcanza; si alguna pide equipo, se dice de cuáles se habla */
  const quien = cs.length === todas.length ? "" : cs.length === 1 ? K.esc(cs[0].nombre) : "las que podés";
  const veces = f < 1 ? "<1" : lo === hi ? String(lo) : `${lo}–${hi}`;
  const dicho = f < 1 ? "menos de una vez por semana" : lo === hi ? `${vez(lo)} por semana` : `${lo} o ${vez(hi)} por semana`;
  const frec = !f ? "" : `<span class="rumbo-frec">${quien ? `<span>${quien}</span> ` : ""}<span class="num frec" role="img" aria-label="${quien ? "cada una" : "Cada una"}, ${dicho}">${K.ic("cal")}${K.esc(veces)}× por semana</span></span>`;
  return `<p class="rumbo-cuanto small mute"><b class="num">${r.length} ${r.length === 1 ? "elegida" : "elegidas"}</b>${frec ? " " + frec : ""}</p>`;
};
K.rumboTocar = async id => {
  /* elegir no ofrece deshacer: queda marcado en la fila y otro toque lo saca */
  const r = K.rumbo();
  const n = r.includes(id) ? r.filter(x => x !== id) : [...r, id];
  try { await K.diario.perfilPoner("rumbo", n); } catch (e) { K.diario.perfil = {...K.diario.perfil, rumbo: n}; } /* sin lugar para guardar, vale por esta apertura */
  K.refrescar();
};

/* ===== Sesión en curso: un solo reloj grande; en el descanso anotás lo que salió ===== */
const ANILLO = 2 * Math.PI * 88;
const arco = (q, tot) => `${(Math.max(0, q) / tot * ANILLO).toFixed(1)} ${ANILLO.toFixed(1)}`;
const quedaTx = (q, tot) => !tot ? "Sin descanso" : q <= 0 ? "Ya podés seguir" : `de ${K.reloj(tot)}`;
/* la persona que muestra el ejercicio; «chica» cuando comparte el centro con un anillo */
const figura = (id, fam, chica) => id && K.POSES[id] ? `<div class="ses-fig${chica ? " con-anillo" : ""}">${K.fig.grande(id, fam)}</div>` : "";
/* la figura con su número o su anillo al lado: en horizontal van juntos y la figura usa el alto que queda (un nombre largo ya no la empuja afuera) */
const conFig = (id, fam, chica, resto) => { const f = figura(id, fam, chica); return f ? `<div class="ses-cuerpo">${f}${resto}</div>` : resto; };
/* el número grande de una serie: la cuenta para prepararse, el reloj que corre o lo que toca */
const grandeSerie = b => {
  const pr = K.sesion.prep();
  /* una prueba con reloj fijo (Motor 12): lo que queda; al llegar, a anotar */
  if (b.reloj){ const q = b.reloj - K.sesion.enFase(); return q > 0 ? [K.reloj(Math.ceil(q)), "lo más fuerte que sostengas"] : ["0:00", "Listo: anotá lo que hiciste"]; }
  if (b.tipo === "segundos") return pr > 0 ? [String(Math.ceil(pr)), "Preparate"] : [K.reloj(K.sesion.enFase()), b.objetivo === "max" ? "al máximo" : `de ${b.objetivo} s`];
  return [K.reloj(K.sesion.enFase()), b.tipo === "minutos" ? `de ${b.objetivo} min` : b.tipo === "sesiones" ? "unos 28 min" : "10 km"];
};
/* cómo te quedó la serie, de un toque y sin obligación: si no tocás nada, valen las repeticiones (y se ve cuál dirían) */
const SENS_TX = {sobro: "Sobró", justo: "Justo", "no-llego": "No llegué"};
const sensBotones = S => { const inf = K.sesion.sensInferida();
  return `<div class="sens" role="group" aria-label="¿Cómo te quedó?">${K.rutina.SENS.map(k => `<button type="button" class="btn sec${!S.sens && inf === k ? " inf" : ""}" data-sens="${k}" aria-pressed="${S.sens === k}">${SENS_TX[k]}</button>`).join("")}</div>`; };
K.P.sesion = () => {
  const S = K.sesion.estado(), B = K.sesion.bloque(), nb = S.plan.bloques.length;
  /* los bloques de rutina pueden cambiar de ejercicio en cada serie (superseries): manda la serie que va */
  const b = B.clase ? B : {...B, ...K.sesion.paso()}, e = K.ej(b.ejercicio);
  const c = b.constelacion ? K.cons(b.constelacion) : null;
  const enSerie = S.fase === "serie";
  /* el bloque se nombra por su meta (una habilidad del día dice la constelación), su escalera o lo que se hace */
  const nombreB = c ? c.nombre : B.clase ? B.nombre : B.constelaciones?.length ? K.cons(B.constelaciones[0])?.nombre || "" : b.escalera ? K.rutina.escalera(b.escalera)?.nombre || "" : "";
  const hzB = B.hazana && K.hzDe(B.hazana);
  /* dónde estás: el nombre del bloque y, debajo, un punto por bloque (el de ahora, estirado) */
  const enBloque = S.fase !== "descanso" && S.fase !== "cierre" && !b.prueba && nb > 1;
  const donde = S.fase === "descanso" ? "Descanso" : B.hazana ? "Prueba" : S.fase === "cierre" ? (B.clase ? "Fin" : "Última serie") : b.prueba ? "Prueba de estrella" : nombreB || `Bloque ${S.b + 1}`;
  const puntos = enBloque ? `<span class="pdots" role="img" aria-label="Bloque ${S.b + 1} de ${nb}">${Array.from({length: nb}, (_, i) => `<i class="${i < S.b ? "d" : i === S.b ? "n" : ""}"></i>`).join("")}</span>` : "";
  const acc = `<div class="enc-acc ses-acc"><button type="button" class="ib" id="s-cortar" aria-label="Terminar la sesión">${K.ic("x")}</button>
    <span class="lb ses-donde"><span class="ses-donde-tx">${K.esc(donde)}</span>${puntos}</span>${K.mas("s-mas", "Opciones de la sesión")}</div>`;
  if (S.fase === "tramo") return acc + K.P.tramo(S, B);
  if (S.fase === "circuito") return acc + K.P.circuito(S, B);
  if (B.clase && S.fase === "cierre") return acc + K.P.cierreBloque(S, B);
  const pasos = `<div class="stp" style="--c:var(--${b.familia})" aria-hidden="true">${Array.from({length: b.series}, (_, i) => `<i class="${i < S.s || (i === S.s && !enSerie) ? "d" : i === S.s ? "n" : ""}"></i>`).join("")}</div>`;
  const mp = K.marcaPaso(b);
  /* la serie a la izquierda; lo nuevo («▲ nuevo»), a la derecha y en el color de la familia */
  const nom = hzB ? `<span class="lb">${K.cat("Prueba", K.esc(hzB.nombre))}</span>` : `<span class="lb ses-eti"><span>${K.jer(`${b.tipo === "logrado" ? "Intento" : "Serie"} ${S.s + 1} de ${b.series}`, b.extra ? "para sostener" : "")}</span>${mp ? " " :  ""}${mp ? `<b class="ses-marca" style="--c:var(--${b.familia})">${mp}</b>` : ""}</span>`;
  /* en una prueba, la escala con tu vez anterior marcada: sabés a qué apuntás */
  const hzVs = hzB ? K.hzVeces(hzB) : null, hzAntes = hzVs && hzVs[hzVs.length - 1];
  const escalaSes = hzB ? `<div class="ses-escala">${K.escala(hzB, null, {vs: hzVs, antes: hzAntes?.valor})}<span class="ln mute small"><span>${hzAntes ? `Tu última: ${K.esc(K.hzMarca(hzB, hzAntes.valor))}` : "Tu primera vez"}</span><span>${hzAntes ? K.esc(K.fechaCorta(hzAntes.fecha)) : ""}</span></span></div>` : "";
  const pausa = S.pausa !== null ? `<p class="ses-pausa lb">En pausa</p>` : "";
  if (enSerie && b.prueba) return acc + K.P.prueba(S, b, e, pausa);
  if (enSerie){
    const o = b.objetivo, corre = CORRE.includes(b.tipo) || !!b.reloj;
    const [gn, gl] = corre ? grandeSerie(b) : [];
    const grande = corre ? `<span class="reloj big num" data-r="fase">${gn}</span><span class="lb" data-r="fase-lb">${gl}</span>`
      : b.tipo === "repeticiones" ? (o === "max" ? `<span class="reloj big num">Máx</span><span class="lb">todas las que salgan</span>` : `<span class="reloj big num">${o}</span><span class="lb">${b.carga && b.kg ? `repeticiones ${K.pesa(`${String(b.kg).replace(".", ",")} kg${b.mano ? " por mano" : ""}`, b.mano ? "mancuernas" : "peso")}` : K.jer("repeticiones", b.antes !== undefined ? `la vez pasada ${b.antes}` : "")}</span>`)
      : b.tipo === "porcentaje" ? `<span class="reloj big num">+${o} %</span><span class="lb">de tu peso${K.diario.perfil.peso ? ` ${K.pesa(`${String(Math.round(o * K.diario.perfil.peso / 100 * 2) / 2).replace(".", ",")} kg`, "peso")}` : ""}</span>`
      : b.tipo === "puntos" ? `<span class="reloj big num">10</span><span class="lb">arrancás con 10 puntos</span>`
      : b.tipo === "cm" ? `<span class="reloj big num">cm</span><span class="lb">más allá de la punta de los pies</span>`
      : `<span class="lb">De punta a punta, sin ayuda</span>`;
    const sig = K.sesion.ultima() ? "Es la última" : b.series > S.s + 1 ? (b.descanso ? `Después: descanso de ${K.reloj(b.descanso)}` : `Después: ${K.sesion.proxima()}`) : `Después: ${K.sesion.nombreBloque(S.plan.bloques[S.b + 1])}`;
    return acc + `<div class="ses serie"><div class="ses-a">${pasos}<div class="enc-tit ses-tit">${nom}<h1>${K.esc(e.nombre)}</h1></div>
        <p class="mute ses-ind">${K.esc(hzB ? hzB.como : e.indicacion)}</p>${pausa}${conFig(e.id, b.familia, false, `<div class="ses-reloj">${grande}</div>`)}${escalaSes}</div>
      <div class="ses-b"><p class="ln ses-sig"><span class="mute">${K.esc(sig)}</span><span class="reloj num" data-r="total">${K.reloj(K.sesion.total())}</span></p>
        <button type="button" class="btn" id="s-listo">${K.ic("check")}Listo</button></div></div>`;
  }
  /* descanso o cierre: lo que salió se anota con − y + mientras recuperás */
  const v = S.borrador, paso = (id, et, val, uni) => `<div class="pmw"><div class="pm"><button type="button" class="pmb" data-spaso="-1" data-campo="${id}" aria-label="Menos">−</button>
      <input class="pmv spv num" id="s-${id}" data-campo="${id}" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="${et}" value="${K.esc(val ?? "")}"><button type="button" class="pmb" data-spaso="1" data-campo="${id}" aria-label="Más">+</button></div><span class="lb">${uni}</span></div>`;
  let campo;
  /* sí o no, de un toque: dos botones grandes, el elegido en tinta */
  if (b.tipo === "logrado" || b.tipo === "sesiones") campo = `<div class="si-no" role="group" aria-label="${PREGUNTA[b.tipo]}"><button type="button" class="btn sec" data-salio="0" aria-pressed="${!(Number(v) > 0)}">Todavía no</button><button type="button" class="btn sec" data-salio="1" aria-pressed="${Number(v) > 0}">${K.ic("check")}Sí, salió</button></div>`;
  /* con mancuernas: las repeticiones y los kilos de cada mancuerna; con lastre, los kilos colgados (y tu peso, para el %) */
  else if (b.carga && b.mano) campo = `<div class="dos-pasos">${paso("valor", PREGUNTA.repeticiones, v?.valor, "repeticiones")}${paso("kg", "Kilos por mano", v?.kg, "kg por mano")}</div>`;
  else if (b.carga) campo = `<div class="dos-pasos">${paso("valor", PREGUNTA.repeticiones, v?.valor, "repeticiones")}${paso("lastre", "Lastre en kilos", v?.lastre, "kg de lastre")}</div>${K.diario.perfil.peso ? "" : paso("peso", "Tu peso en kilos", v?.peso, "kg tu peso")}`;
  else if (b.tipo === "porcentaje") campo = `<div class="dos-pasos">${paso("lastre", "Lastre en kilos", v?.lastre, "kg de lastre")}${K.diario.perfil.peso ? "" : paso("peso", "Tu peso en kilos", v?.peso, "kg tu peso")}</div>`;
  else campo = paso("valor", PREGUNTA[b.tipo], v, UNI[b.tipo]);
  const antes = b.antes !== undefined ? b.antes : K.plan.vezPasada(K.diario.sesiones, b.ejercicio, b.tipo);
  /* en una prueba, contra tu prueba anterior (no contra las series de todos los días) */
  const hzP = hzB && !B.clase ? K.hzVeces(hzB) : null, hzU = hzP && hzP[hzP.length - 1];
  const pie = hzP ? `<span class="ln mute"><span>${hzU ? "Tu prueba anterior" : "Tu primera vez arma tu escala"}</span>${hzU ? `<span class="num">${K.esc(K.hzMarca(hzB, hzU.valor))}</span>` : ""}</span>`
    : (b.rango && !b.descarga ? sensBotones(S) : "") + (b.tipo === "logrado" || b.tipo === "sesiones" ? "" : antes !== null ? `<span class="ln mute"><span>La vez pasada</span><span class="num">${K.esc(K.cielo.corto(b, antes))}</span></span>`
    : b.umbral ? `<span class="ln mute"><span>Para la próxima estrella</span><span class="num">${K.esc(K.cielo.corto(b, b.umbral))}</span></span>` : "");
  const tarjeta = B.clase ? hechoBloque(S, B) : `<section class="cd ses-anota"><span class="lb">${K.jer(PREGUNTA[b.tipo], K.esc(e.nombre))}</span>${campo}${pie}</section>`;
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
/* en la entrada en calor, el título es la pieza («Bici suave»); «Entrada en calor» queda de etiqueta */
const tramoTx = x => x.clase === "entrada" && x.nota ? x.nota : x.ejercicio ? K.ej(x.ejercicio).nombre : CLASE[x.clase] || "";
const tramoLb = x => x.reps ? `×${x.reps}` : x.trabajo ? `${x.trabajo} s y descansás` : `de ${K.reloj(x.seg)}`;
const avanceBloque = (S, b) => { const tot = b.tramos.reduce((a, x) => a + x.seg, 0), antes = b.tramos.slice(0, S.s).reduce((a, x) => a + x.seg, 0); return Math.min(1, (antes + K.sesion.enFase()) / tot); };
K.P.tramo = (S, b) => {
  const x = b.tramos[S.s], sig = b.tramos[S.s + 1], q = K.sesion.queda(), pausa = S.pausa !== null ? `<p class="ses-pausa lb">En pausa</p>` : "";
  const fuerte = x.clase === "fuerte" || x.clase === "trabajo";
  return `<div class="ses tramo${fuerte ? " fuerte" : ""}" style="--c:var(--${b.familia});--cs:var(--${b.familia}-soft)" data-r="ses"><div class="ses-a">
      <div class="bar tramo-bar" style="--c:var(--${b.familia})" aria-hidden="true"><i data-r="tbar" style="width:${(avanceBloque(S, b) * 100).toFixed(1)}%"></i></div>
      <div class="enc-tit ses-tit"><span class="lb ses-eti"><span>${K.esc(x.ejercicio ? CLASE[x.clase] : b.nombre || "")}</span> <span class="num ses-paso" aria-label="${S.s + 1} de ${b.tramos.length}">${S.s + 1}/${b.tramos.length}</span></span><h1>${K.esc(tramoTx(x))}</h1></div>
      ${x.nota || (x.ejercicio && K.ej(x.ejercicio).indicacion) ? `<p class="mute ses-ind">${x.nota ? (x.clase === "entrada" ? K.esc(x.dosis || "") : K.aparte(K.esc(x.nota), K.esc(x.dosis || ""))) : K.esc(K.ej(x.ejercicio).indicacion)}</p>` : ""}${pausa}
      ${conFig(x.ejercicio, b.familia, true, `<div class="anillo-desc" data-r="anillo">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" class="pista"/><circle cx="100" cy="100" r="88" class="arco" data-r="arco" stroke-dasharray="${arco(q, x.seg)}" transform="rotate(-90 100 100)"/></svg>
        <div class="anillo-tx"><span class="reloj num" data-r="queda" role="timer" aria-live="off">${K.reloj(Math.max(0, Math.ceil(q)))}</span><span class="lb">${K.esc(tramoLb(x))}</span></div></div>`)}
      <p class="ses-luego mute">${sig ? `Sigue: ${K.esc(tramoTx(sig))} <span class="num">${K.dur(K.reloj(sig.seg))}</span>` : S.b < S.plan.bloques.length - 1 ? `Después: ${K.esc(K.sesion.nombreBloque(S.plan.bloques[S.b + 1]))}` : "Es el último"}</p></div>
    <div class="ses-b"><p class="ln ses-sig"><span class="mute">Toda la sesión</span><span class="reloj num" data-r="total">${K.reloj(K.sesion.total())}</span></p>
      <button type="button" class="btn${S.pausa !== null ? "" : " sec"}" id="s-pausa">${K.ic(S.pausa !== null ? "play" : "pause")}${S.pausa !== null ? "Seguir" : "Pausa"}</button></div></div>`;
};

/* ===== Circuito: una hazaña por tiempo o con tiempo límite. Cada vuelta, un toque. ===== */
const circItem = x => `${x.reps ? `×${x.reps}` : x.seg ? `${x.seg} s` : x.min ? `${x.min} min` : ""}${x.ejercicio && K.ej(x.ejercicio).lado ? " por lado" : ""}`;
const circGrande = (S, b) => {
  const pr = K.sesion.prep();
  if (pr > 0) return [String(Math.ceil(pr)), "Preparate"];
  if (b.formato === "amrap") return [K.reloj(Math.max(0, Math.ceil(K.sesion.queda()))), `${S.vueltas} ${S.vueltas === 1 ? "vuelta" : "vueltas"}`];
  /* la escalera de minutos: el número grande es lo que toca este minuto */
  if (b.formato === "escalera"){ const t = K.sesion.enFase(), m = Math.floor(t / 60); return [`×${m + 1}`, `quedan ${K.reloj(Math.ceil(60 - t % 60))} del minuto ${m + 1}`]; }
  return [K.reloj(K.sesion.enFase()), b.rondas > 1 ? `Vuelta ${Math.min(S.vueltas + 1, b.rondas)} de ${b.rondas}` : "Todo, en orden"];
};
K.P.circuito = (S, b) => {
  const [n, l] = circGrande(S, b), pausa = S.pausa !== null ? `<p class="ses-pausa lb">En pausa</p>` : "", prep = K.sesion.prep() > 0;
  const items = `<section class="cd circ-items">${b.items.map(x => `<div class="ln">${x.ejercicio && K.POSES[x.ejercicio] ? K.fig.chica(x.ejercicio, b.familia) : ""}<span>${K.esc(x.ejercicio ? K.ej(x.ejercicio).nombre : x.nombre || "")}</span><span class="num">${K.esc(b.formato === "escalera" ? "una más por minuto" : circItem(x))}</span></div>`).join("")}</section>`;
  const listo = b.formato === "escalera" ? `<button type="button" class="btn" id="s-vuelta">No llegué</button>` : b.formato === "amrap" ? `<div class="dos-btn"><button type="button" class="btn sec" id="s-vuelta-menos" aria-label="Una vuelta menos">−1</button><button type="button" class="btn" id="s-vuelta">${K.ic("check")}Vuelta</button></div>`
    : `<button type="button" class="btn" id="s-vuelta">${K.ic("check")}${b.rondas > 1 ? "Terminé la vuelta" : "Terminé"}</button>`;
  return `<div class="ses circuito${prep ? " prep" : ""}" style="--c:var(--${b.familia})" data-r="ses"><div class="ses-a">
      <div class="enc-tit ses-tit"><span class="lb">${K.esc(FORMATO[b.formato])}</span><h1>${K.esc(b.nombre)}</h1></div>${pausa}
      <div class="ses-reloj"><span class="reloj big num" data-r="fase" role="timer" aria-live="off">${n}</span><span class="lb" data-r="fase-lb">${K.esc(l)}</span></div>${items}</div>
    <div class="ses-b"><p class="ln ses-sig"><span class="mute">${b.formato === "amrap" ? `Todas las vueltas que entren en ${b.minutos} min` : b.formato === "escalera" ? "Lo que sobra del minuto, descansás" : "Lo más rápido que puedas, bien hecho"}</span></p>${listo}</div></div>`;
};
const FORMATO = {tiempo: "Por tiempo", amrap: "Todas las vueltas que entren", escalera: "Cada minuto, una más"};

/* el fin de un bloque de tramos o de una hazaña: lo hecho, sin nada que escribir (salvo las vueltas, que se pueden corregir) */
const hechoBloque = (S, b) => {
  if (b.clase === "circuito"){
    if (b.formato === "escalera") return `<section class="cd ses-anota"><span class="lb">${K.jer("El último minuto completo", K.esc(K.ej(b.mide.ejercicio).nombre))}</span><div class="pmw"><div class="pm"><button type="button" class="pmb" data-spaso="-1" data-campo="valor" aria-label="Menos">−</button>
      <input class="pmv spv num" id="s-valor" data-campo="valor" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Repeticiones del último minuto completo" value="${K.esc(S.borrador ?? "")}"><button type="button" class="pmb" data-spaso="1" data-campo="valor" aria-label="Más">+</button></div><span class="lb">repeticiones</span></div></section>`;
    if (b.formato === "amrap") return `<section class="cd ses-anota"><span class="lb">${K.jer("¿Cuántas vueltas?", K.esc(b.nombre))}</span><div class="pmw"><div class="pm"><button type="button" class="pmb" data-spaso="-1" data-campo="valor" aria-label="Menos">−</button>
      <input class="pmv spv num" id="s-valor" data-campo="valor" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Vueltas" value="${K.esc(S.borrador ?? "")}"><button type="button" class="pmb" data-spaso="1" data-campo="valor" aria-label="Más">+</button></div><span class="lb">vueltas</span></div></section>`;
    return `<section class="cd ses-anota"><span class="lb">${K.jer("Tu tiempo", K.esc(b.nombre))}</span><b class="reloj num res-tiempo">${K.reloj(S.borrador || 0)}</b></section>`;
  }
  const h = [...S.hechos].reverse().find(x => x.b === S.b);
  return `<section class="cd ses-anota"><span class="lb">${K.jer("Hecho", K.esc(b.nombre || ""))}</span><b class="reloj num res-tiempo">${K.reloj(h?.seg ?? 0)}</b></section>`;
};
K.P.cierreBloque = (S, b) => `<div class="ses cierre"><div class="ses-a"><div class="enc-tit ses-tit"><span class="lb">${b.hazana ? "Prueba" : "Último bloque"}</span><h1>${K.esc(b.nombre || "")}</h1></div>
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
  const tit = `<div class="enc-tit ses-tit"><span class="lb">${K.jer(K.esc(c.nombre), `m${est.magnitud}`)}</span><h1>${K.nw(est.nombre)}</h1></div>`;
  if (!mide){
    const grande = b.tipo === "repeticiones" ? `<span class="reloj big num">${b.umbral}</span><span class="lb">repeticiones</span>`
      : b.tipo === "porcentaje" ? `<span class="reloj big num">+${b.umbral} %</span><span class="lb">de tu peso</span>` : `<span class="lb">De punta a punta, sin ayuda</span>`;
    return `<div class="ses serie"><div class="ses-a">${tit}<p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}${conFig(e.id, b.familia, false, `<div class="ses-reloj">${grande}</div>`)}</div>
      <div class="ses-b"><button type="button" class="btn" id="s-listo">${K.ic("check")}Listo</button></div></div>`;
  }
  const [n, l] = pruebaGrande(b), p = Math.min(1, K.sesion.prep() > 0 ? 0 : K.sesion.enFase() / umbralSeg(b));
  return `<div class="ses serie prueba${K.sesion.prep() > 0 ? " prep" : ""}" style="--c:var(--${b.familia})" data-r="ses"><div class="ses-a">${tit}<p class="mute ses-ind">${K.esc(e.indicacion)}</p>${pausa}
      ${conFig(e.id, b.familia, true, `<div class="anillo-desc prueba-anillo${p >= 1 ? " listo" : ""}${p <= 0 ? " vacio" : ""}" data-r="anillo">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" class="pista"/><circle cx="100" cy="100" r="88" class="arco" data-r="arco" stroke-dasharray="${(p * ANILLO).toFixed(1)} ${ANILLO.toFixed(1)}" transform="rotate(-90 100 100)"/></svg>
        <div class="anillo-tx"><span class="reloj num" data-r="fase" role="timer" aria-live="off">${n}</span><span class="lb" data-r="fase-lb">${l}</span></div></div>`)}
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
  else if (S.fase === "circuito"){ const [n] = circGrande(S, b); texto = `${b.nombre} ${n}`; p = b.formato === "amrap" ? Math.max(0, K.sesion.queda()) / (b.minutos * 60) : b.formato === "escalera" ? K.sesion.enFase() % 60 / 60 : S.vueltas / b.rondas; }
  /* en una serie, lo nuevo va como su signo («▲»), en el color de la familia, entre el nombre y el reloj */
  let marca = "";
  if (texto === undefined){ const pa = K.sesion.paso(); marca = K.marcaPaso(pa); texto = `${K.ej(pa.ejercicio).nombre} ${K.reloj(K.sesion.enFase())}`; p = (S.s + 1) / b.series; }
  K.isla.mostrar({texto, p, familia: b.familia, ir: "#/hoy/sesion", marca});
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
    const S = K.sesion.estado(), B = K.sesion.bloque(), {inc, min, max} = K.pasoDe(B.clase ? "repeticiones" : K.sesion.paso().tipo, campo), obj = S.borrador !== null && typeof S.borrador === "object";
    const v = K.sesion.numero((obj ? S.borrador[campo] : campo === "valor" ? S.borrador : undefined) ?? "");
    const n = Math.max(min, Math.min(max, Math.round(((Number.isFinite(v) ? v : 0) + s * inc) * 10) / 10));
    K.sesion.anotar(campo, n); const el = K.$("#s-" + campo); if (el) el.value = n;
    K.ses.pintarSens();
  },
  escribir(campo, txt){ K.sesion.anotar(campo, txt); K.ses.pintarSens(); },
  salio(v){ K.sesion.anotar("valor", v); K.refrescar(); },
  sentir(v){ K.sesion.sentir(v); K.ses.pintarSens(); },
  /* sin volver a dibujar la pantalla (no se pierde lo que estás escribiendo): el elegido en tinta, el que dirían las repeticiones marcado suave */
  pintarSens(){
    const S = K.sesion.estado(); if (!S) return; const inf = K.sesion.sensInferida();
    for (const el of K.$$("[data-sens]")){ el.setAttribute("aria-pressed", String(S.sens === el.dataset.sens)); el.classList.toggle("inf", !S.sens && inf === el.dataset.sens); }
  },
  menu(btn){
    const S = K.sesion.estado(), b = K.sesion.bloque();
    /* una hazaña no se saltea: se termina o se corta */
    const items = [{id: "pausa", texto: S.pausa !== null ? "Seguir el reloj" : "Pausar", ic: S.pausa !== null ? "play" : "pause"},
      ...(S.fase === "tramo" ? [{id: "tramo", texto: "Saltear este tramo", ic: "skip"}] : []),
      ...(b.clase === "circuito" ? [] : [{id: "saltear", texto: b.clase ? "Saltear este bloque" : "Saltear este ejercicio", ic: "skip"}]),
      {id: "cielo", texto: "Mirar tu cosmos", ic: "cielo"}];
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
  /* una prueba (hazaña), desde su pantalla o desde Planes */
  hazana(id, btn){
    if (K.sesion.activa()){ K.ir("#/hoy/sesion"); K.aviso("Tenés una sesión abierta. Terminala para empezar otra."); return; }
    const h = K.hzDe(id); if (!h) return;
    const plan = K.rutina.deHazana(h, ctxRutina());
    K.mov.iris(btn); K.sesion.empezar({...plan, ventana: [], volviste: false, desde: `#/planes/hazanas/${h.id}`}); K.ir("#/hoy/sesion");
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
  /* una hazaña de antes (por niveles): lo de ese día contra tu mejor en ese nivel */
  const hzH = x.hazana && x.hazana.v !== 2 && Number.isInteger(x.hazana.nivel) && K.hzDe(x.hazana.id);
  const hz = hzH ? (() => { const m = K.rutina.mejorEs(hzH), v = x.hazana.valor, otras = K.rutina.anteriores(hzH, ses.filter(s => s.id !== id)).filter(y => y.nivel === x.hazana.nivel && y.completa && y.valor > 0 && y.fecha <= x.fecha);
    const mejor = !otras.length || m === "hecha" ? (otras.length ? otras[0].valor : null) : otras.reduce((a, y) => (m === "menos" ? y.valor < a : y.valor > a) ? y.valor : a, otras[0].valor);
    return {h: hzH, mejor, record: v > 0 && (mejor === null || (m === "menos" ? v < mejor : m === "mas" ? v > mejor : false))}; })() : null;
  /* las pruebas de esta sesión (Modelo B): cada una con su marca, la vez anterior y su escala */
  const hasta = ses.slice(0, ses.indexOf(x) + 1);
  const prs = [...new Set(x.bloques.flatMap(b => b.series.filter(y => y.hazana && y.completa !== false).map(y => y.hazana)))].map(K.hzDe).filter(Boolean).map(h => {
    const vs = K.rutina.veces(h, hasta), yo = vs.find(v => v.sesion === x.id); if (!yo) return null;
    const k = vs.indexOf(yo), antes = k > 0 ? vs[k - 1] : null, hastaYo = vs.slice(0, k + 1);
    return {h, v: yo.valor, vs: hastaYo, antes, m: K.rutina.magnitud(h, yo.valor, hastaYo), desde: K.hzDesde(h, hastaYo)};
  }).filter(Boolean);
  let nuevas = x.encendio;
  if (!Array.isArray(nuevas)){ const ms = K.diario.mediciones; nuevas = K.cielo.nuevas(K.CATALOGO, ms, ms, x.fecha, ses.filter(s => s.id !== id), ses).map(n => n.estrella.id); } /* sesiones viejas, sin lo encendido escrito */
  const enc = nuevas.map(estrella).filter(Boolean), prim = enc[0];
  /* la constelación a mostrar: la de la estrella nueva o la del primer bloque que el catálogo todavía tiene */
  const ruR = x.rutina && K.rutinaDe(x.rutina.id), haciaRut = ruR && ruR.alimenta.map(eid => cielo.constelaciones.find(k => k.estrellas.some(y => y.id === eid))).filter(Boolean);
  const c = prim ? prim.c : cielo.constelaciones.find(k => x.bloques.some(b => b.constelacion === k.id || (b.constelaciones || []).includes(k.id))) || (haciaRut && (haciaRut.find(k => !k.completa) || haciaRut[0]));
  const recien = c ? enc.filter(n => n.c.id === c.id).map(n => n.e.id) : [];
  const nSeries = x.bloques.reduce((t, b) => t + b.series.length, 0);
  /* la mejor serie de la sesión en lo que perseguís, y si es tu mejor marca de siempre */
  const b0 = c && x.bloques.find(b => b.constelacion === c.id), s0 = b0 && b0.series[0];
  const mejorHoy = s0 ? b0.series.reduce((m, y) => K.cielo.TIPOS[y.tipo].mejor === "menos" ? Math.min(m, y.valor) : Math.max(m, y.valor), s0.valor) : null;
  const antes = s0 ? K.cielo.calcular(K.CATALOGO, K.diario.mediciones, x.fecha, ses.filter(s => s.id !== id)).constelaciones.find(k => k.id === c.id).estrellas.find(e => e.prueba.ejercicio === s0.ejercicio && e.prueba.tipo === s0.tipo)?.mejor ?? null : null;
  const record = s0 && s0.tipo !== "logrado" && (antes === null || (K.cielo.TIPOS[s0.tipo].mejor === "menos" ? mejorHoy < antes : mejorHoy > antes));
  let tx;
  /* las estrellas nuevas, por constelación: una prueba puede encender en varias a la vez */
  const porCons = [...new Map(enc.map(n => [n.c.id, n.c])).values()].map(k => ({c: k, es: enc.filter(n => n.c.id === k.id).map(n => n.e)}));
  if (prs.length){
    const p0 = prs[0], n = enc.length;
    tx = `<span class="lb" style="color:var(--${p0.h.familia})">${x.semanaPrueba ? "Semana de prueba" : "Prueba"}</span>
      <h1 class="t1 res-tit">${prs.length > 1 ? `${prs.length} pruebas hechas.` : `${K.esc(p0.h.nombre)}: ${K.esc(K.hzMarca(p0.h, p0.v))}${p0.m ? `, m${p0.m}` : ""}.`}</h1>
      <p class="mute">${n ? `${n === 1 ? "Encendiste una estrella" : `Encendiste ${n} estrellas`}${porCons.length > 1 ? ` en ${porCons.length} constelaciones` : ` en ${K.esc(porCons[0].c.nombre)}`}.` : prs.length === 1 && p0.desde ? `${K.esc(p0.desde)}.` : prs.length === 1 && !p0.antes ? "Tu primera vez: ya tenés tu escala." : "Lo que sacaste fija dónde arranca lo que sigue."}</p>`;
  } else if (prim){
    tx = `<span class="lb" style="color:var(--${c.familia})">${enc.length > 1 ? `${enc.length} estrellas nuevas` : K.jer("Estrella nueva", `m${prim.e.magnitud}`)}</span>
      <h1 class="t1 res-tit">${K.nw(prim.e.nombre)}, encendida.</h1>
      <p class="mute">${c.completa ? `${K.esc(c.nombre)}, completa. Ya es parte de tu cosmos.` : `${K.esc(c.nombre)}: ${c.encendidas} de ${c.total}.${c.proxima ? ` La que sigue es ${K.nw(c.proxima.nombre)}.` : c.pide.length ? ` Lo que sigue pide ${K.esc(K.pide(c.pide))}.` : ""}`}</p>`;
  } else if (x.bloques.length === 1 && x.bloques[0].prueba){
    /* una prueba que no llegó: cuánto faltó, sin drama */
    const bp = x.bloques.find(b => b.prueba), e = K.estrella(bp.estrella), sp = bp.series[0];
    tx = `<span class="lb">Prueba de estrella</span><h1 class="t1 res-tit">Todavía no.</h1>
      <p class="mute">${e && sp && sp.tipo !== "logrado" ? `${K.esc(K.cielo.corto(sp, sp.valor))} de ${K.esc(K.cielo.corto(e.prueba, e.prueba.umbral))} en ${K.esc(e.nombre)}. La próxima.` : "La próxima."}</p>`;
  } else if (hz){
    const ok = x.hazana.completa !== false && !x.cortada && x.hazana.valor > 0;
    tx = `<span class="lb" style="color:var(--${hz.h.familia})">${K.jer("Hazaña", `versión anterior, ${K.rutina.NIVELES[x.hazana.nivel]}`)}</span><h1 class="t1 res-tit">${ok ? `${K.esc(hz.h.nombre)}, ${K.esc(K.hazanaValor(hz.h, x.hazana.valor))}.` : "Lo hecho cuenta."}</h1>
      <p class="mute">${!ok ? `${K.esc(hz.h.nombre)} quedó a medias. La próxima.` : hz.record ? "Tu mejor marca en este nivel." : hz.mejor !== null ? `Tu mejor: ${K.esc(K.hazanaValor(hz.h, hz.mejor))}.` : ""}</p>`;
  } else {
    const p = c && c.proxima, ru = x.rutina && K.rutinaDe(x.rutina.id);
    const sig = ru && (ru.sesiones[x.rutina.sesion + 1] ? `Lo que sigue: ${ru.sesiones[x.rutina.sesion + 1].nombre}.` : `Terminaste ${ru.nombre}.`);
    tx = `<span class="lb">${ru ? K.jer(K.esc(ru.nombre), `semana ${Math.floor(x.rutina.sesion / ru.dias) + 1}, día ${x.rutina.sesion % ru.dias + 1}`) : x.cortada ? "Sesión cortada" : "Sesión hecha"}</span><h1 class="t1 res-tit">${x.cortada ? "Lo hecho cuenta." : "Hecho."}</h1>
      ${sig ? `<p class="mute">${K.esc(sig)}</p>` : p ? `<p class="mute">Un paso más hacia ${K.esc(p.nombre)}.</p>` : ""}`;
  }
  /* arriba va lo que la sesión dibujó: la figura de la hazaña, la vuelta entera de una rutina terminada o la constelación */
  const hzOk = hz && x.hazana.completa !== false && !x.cortada && x.hazana.valor > 0, rutFin = ruR && !x.cortada && !ruR.sesiones[x.rutina.sesion + 1];
  /* la constelación en su anillo; con estrellas nuevas, el arco crece desde lo que tenía antes de esta sesión */
  const anillo = (k, n, px) => K.icono.constelacion(k, px, `${k.nombre}, ${k.encendidas} de ${k.total} estrellas`, n ? {desde: k.encendidas - n} : {});
  const arte = prs.length ? `<section class="cd res-fig${prs[0].m !== null ? " logro" : ""}">${K.icono.medalla(prs[0].h, prs[0].m !== null, 150, prs[0].h.nombre)}</section>`
      + (porCons.length ? `<section class="cd res-varias">${porCons.slice(0, 4).map(k => `<div class="res-una">${anillo(k.c, k.es.length, 64)}<span class="lb" style="color:var(--${k.c.familia})">${K.esc(k.c.nombre)}</span></div>`).join("")}</section>` : "")
    : hz ? `<section class="cd res-fig${hzOk ? " logro" : ""}">${K.icono.medalla(hz.h, hzOk, 150, hz.h.nombre)}</section>`
    : rutFin && !prim ? `<section class="cd res-orbita">${K.mov.orbita(170)}<p class="lb">Rutina completa</p></section>`
    : c ? `<section class="cd res-fig res-cons">${anillo(c, recien.length, 150)}</section>` : "";
  const kcal = K.calorias.deSesion(x, K.diario.perfil.peso);
  /* lo que pasó en cada escalera: ▲ subiste, = seguís (y lo que toca la próxima), ▼ bajás */
  const cs = x.rutina || prs.length || x.bloques.some(b => b.molde) ? K.rutina.cambios(x, ses, {...ctxRutina(), rutina: ruR}) : [];
  const escalones = cs.length ? `<section class="cd res-esc"><span class="lb">Tus escalones</span><ul>${cs.map(y => { const g = signoDe(y);
    return `<li class="${g === "▲" ? "sube" : g === "▼" ? "baja" : "igual"}"><b class="res-signo" role="img" aria-label="${g === "▲" ? "Subiste" : g === "▼" ? "Bajás" : "Seguís"}">${g}</b><span class="ses-fila">${K.esc(y.nombre || K.ej(y.a.ejercicio).nombre)}<small class="mute">${cambioHtml(y)}</small></span>${y.total > 1 ? `<em class="num mute">${y.i + 1}/${y.total}</em>` : "<em></em>"}</li>`; }).join("")}</ul></section>` : "";
  const pruebas = prs.length ? `<section class="cd res-pruebas"><span class="lb">${prs.length > 1 ? "Tus pruebas" : "Tu escala"}</span>${prs.map(p => `<div class="res-prueba">
      <span class="ln"><b>${K.esc(p.h.nombre)}</b><span class="num">${K.esc(K.hzMarca(p.h, p.v))}${p.m ? ` <small class="mute">m${p.m}</small>` : ""}</span></span>
      ${K.escala(p.h, p.v, {vs: p.vs, antes: p.antes?.valor})}
      <span class="ln mute small"><span>${p.antes ? `La vez anterior: ${K.esc(K.hzMarca(p.h, p.antes.valor))}` : "Tu primera vez"}</span><span>${K.esc(p.desde || `Otra en ${Math.round((p.h.cada || K.rutina.CADA) / 7)} semanas`)}</span></span></div>`).join("")}</section>` : "";
  const nuevasCons = prs.length && enc.length ? `<section class="cd res-nuevas"><span class="lb">${enc.length === 1 ? "Estrella nueva" : "Estrellas nuevas"}</span>${porCons.map(k => `<div class="ln"><span class="tg"><i class="dot" style="--c:var(--${k.c.familia})"></i>${K.yLista(k.es.map(e => K.esc(e.nombre)))}</span><button type="button" class="ib chico" data-ir="#/cielo/${k.c.id}" aria-label="Ver ${K.esc(k.c.nombre)} en tu cosmos">${K.ic("chev")}</button></div>`).join("")}</section>` : "";
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
      <div class="res-datos">${prs.length ? dato(prs.length === 1 ? K.hzMarca(prs[0].h, prs[0].v) : prs.length, prs.length === 1 ? "esta vez" : "pruebas") + dato(enc.length, enc.length === 1 ? "estrella" : "estrellas") + dato(Math.max(1, Math.round(x.duracion / 60)), "min")
        : hz ? (K.rutina.mejorEs(hz.h) === "hecha" ? dato(K.reloj(x.duracion), "tiempo") : dato(K.hazanaValor(hz.h, x.hazana.valor, true), (hz.h.antes ? hz.h.antes.formato : hz.h.formato) === "amrap" ? "vueltas" : "tiempo")) + dato(K.rutina.NIVELES[x.hazana.nivel], "nivel") + dato(Math.max(1, Math.round(x.duracion / 60)), "min")
        : sp && sp.tipo !== "logrado" ? dato(K.cielo.corto(sp, sp.valor), "esta vez") + (marcaAntes !== null ? dato(K.cielo.corto(sp, marcaAntes), "tu marca") : "")
        : dato(Math.max(1, Math.round(x.duracion / 60)), "min") + dato(nSeries, nSeries === 1 ? "serie" : "series") + tercero}</div>
      ${pruebas}${nuevasCons}${escalones}
      ${kcal ? `<p class="ln mute small res-kcal"><span>Calorías, aproximadas</span><span class="num">${kcal} kcal</span></p>` : ""}
      ${c ? `<button type="button" class="btn" data-ir="#/cielo/${c.id}">Ver en tu cosmos</button>` : ""}</div></div>`;
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
