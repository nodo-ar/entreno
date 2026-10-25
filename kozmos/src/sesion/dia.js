/* ===== El día del motor B: un molde para cada día (funciones puras) =====
   Entra tu cosmos, tu rumbo, tus sesiones, tu equipo y lo que elegiste entrenar; sale el día, siempre con la misma forma:
   entrada en calor y una parte por cosa que entrenás, en el orden en que la elegiste (fuerza: habilidad, fuerza de a dos y
   abdomen; resistencia: su meta y el motor) y al final la flexibilidad o el cierre. Sin tope de metas: con más metas, cada una
   toca menos veces por semana.
   Nada se guarda: todo sale del catálogo y del diario. Detalle en docs/kozmos-rutinas.md («El día del motor»). */
K.dia = (() => {
  const HABILIDADES = 2, SERIES = 3, RANGO = [5, 8], ENTRE = 120, TOPE = 60;
  /* las escaleras de fuerza para cada patrón, en orden: la primera que tu equipo permite y que el día no usó */
  const ESCALERAS = {tirar: ["remo", "tirar"], empujar: ["empujar", "arriba", "fondos"], piernas: ["piernas"], bisagra: ["isquios"]};
  const ABDOMEN = ["lsit", "dragon"];

  /* ===== Tu semana: el tipo de cada día de fuerza (docs/kozmos-motor.md) =====
     Cada movimiento: sus escaleras en orden (la primera que tu equipo permite), su escalón en el orden del día (1 principales,
     de varias articulaciones; 2 secundarios; 3 accesorios, de una articulación; 4 abdomen, al final) y de qué lado trabaja,
     para armar los pares. Bíceps y tríceps entran cuando existan sus escaleras */
  const MOV = {
    tirar: {esc: ["tirar", "remo"], t: 1, patron: "tirar"}, empujar: {esc: ["empujar", "fondos"], t: 1, patron: "empujar"},
    piernas: {esc: ["piernas"], t: 1, patron: "piernas"}, bisagra: {esc: ["isquios"], t: 1, patron: "bisagra"},
    remo: {esc: ["remo", "tirar"], t: 2, patron: "tirar"}, hombros: {esc: ["arriba", "empujar"], t: 2, patron: "empujar"}, fondos: {esc: ["fondos", "empujar"], t: 2, patron: "empujar"},
    biceps: {esc: ["biceps"], t: 3, patron: "tirar"}, triceps: {esc: ["triceps", "fondos"], t: 3, patron: "empujar"},
    abdomen: {t: 4, patron: "abdomen"}, abdomen2: {t: 4, patron: "abdomen"}};
  const LADO = {tirar: "tira", remo: "tira", biceps: "tira", empujar: "empuja", fondos: "empuja", hombros: "empuja", triceps: "empuja", piernas: "piernas", bisagra: "piernas", abdomen: "abdomen", abdomen2: "abdomen"};
  /* los tipos de día: sus movimientos (en el orden en que se turnan dentro de cada escalón) y qué habilidades van ese día (en cuerpo entero, todas) */
  const TIPOS = Object.fromEntries(Object.entries({
    entero: {nombre: "Cuerpo entero", mov: ["tirar", "piernas", "empujar", "bisagra", "abdomen", "remo", "hombros"], hab: null},
    arriba: {nombre: "Arriba", mov: ["tirar", "empujar", "remo", "hombros", "biceps", "triceps"], hab: ["tirar", "empujar"]},
    abajo: {nombre: "Abajo", mov: ["piernas", "bisagra", "abdomen", "abdomen2"], hab: ["piernas", "bisagra", "abdomen"]},
    empujar: {nombre: "Empujar", mov: ["empujar", "hombros", "fondos", "triceps"], hab: ["empujar"]},
    tirar: {nombre: "Tirar", mov: ["tirar", "remo", "biceps", "abdomen"], hab: ["tirar"]},
    piernas: {nombre: "Piernas", mov: ["piernas", "bisagra", "abdomen", "abdomen2"], hab: ["piernas", "bisagra", "abdomen"]},
    pb: {nombre: "Pecho y bíceps", mov: ["empujar", "fondos", "hombros", "biceps"], hab: ["empujar"]},
    et: {nombre: "Espalda y tríceps", mov: ["tirar", "remo", "triceps"], hab: ["tirar"]},
    pa: {nombre: "Piernas y abdomen", mov: ["piernas", "bisagra", "abdomen", "abdomen2"], hab: ["piernas", "bisagra", "abdomen"]}}).map(([id, t]) => [id, {id, ...t}]));
  /* lo que entrena cada meta cuando su bloque de hoy no lo dice (un camino de movilidad, por ejemplo): para elegir su día */
  const MOV_PATRONES = new Set(["tirar", "empujar", "piernas", "bisagra", "abdomen"]);
  const META_PATRON = {planche: "empujar", "un-brazo": "empujar", "parada-de-manos": "empujar", draco: "abdomen", "una-pierna": "piernas", "front-lever": "tirar", "muscle-up": "tirar", bandera: "abdomen", lastre: "tirar"};
  const CICLO = {entero: ["entero"], aa: ["arriba", "abajo"], etp: ["empujar", "tirar", "piernas"], mus: ["pb", "et", "pa"]};
  const SEMANAS = ["auto", "entero", "aa", "etp", "mus"];
  /* «Que Kozmos elija»: con tres días o menos, cuerpo entero; con cuatro, arriba y abajo; con cinco o seis, empujar, tirar y piernas */
  const semanaDe = (semana, n) => CICLO[semana] ? semana : n <= 3 ? "entero" : n === 4 ? "aa" : "etp";
  /* el tipo de hoy: el que sigue a los días con fuerza que ya hiciste (una sesión cuenta si tuvo fuerza o habilidad) */
  const conFuerza = s => (s.bloques || []).some(b => b.familia === "fu" && b.molde !== "entrada" && b.molde !== "cierre");
  function tipoDelDia(semana, n, sesiones = []){
    const c = CICLO[semanaDe(semana, n)];
    return c[sesiones.filter(conFuerza).length % c.length];
  }
  /* el cierre sin rango ni motor en tu rumbo: tres posturas de 40 s, según lo que entrenó el día */
  const POSTURA = {tirar: "postura-nino", empujar: "codos-atras", piernas: "sentadilla-profunda", bisagra: "isquios-sentado", abdomen: "respiracion-90-90"};
  const POSTURAS = ["mariposa-acostado", "tocar-los-pies", "postura-nino", "isquios-sentado"];
  const d = f => K.cielo.dia(f);

  /* las constelaciones que tocó una sesión: las de sus bloques (las viejas, una por bloque; las del molde, varias) */
  const tocadas = s => new Set((s.bloques || []).flatMap(b => [b.constelacion, ...(b.constelaciones || [])]).filter(Boolean));
  const ultimaVez = (id, sesiones) => { let f = null; for (const s of sesiones) if (tocadas(s).has(id) && (!f || s.fecha > f)) f = s.fecha; return f; };
  const veces = (id, sesiones, hoy, dias) => sesiones.filter(s => d(hoy) - d(s.fecha) < dias && d(hoy) >= d(s.fecha) && tocadas(s).has(id)).length;
  const volvisteDe = (sesiones, hoy) => { const u = sesiones.length ? sesiones[sesiones.length - 1] : null; return !!u && d(hoy) - d(u.fecha) >= 21; };

  /* ventana de prueba: tu mejor marca al 80 % de la próxima estrella. Al volver de 3 semanas o más no se abre */
  const abre = c => K.plan.sePrueba(c) && c.proxima.mejor !== null && c.avance >= .8;
  function ventana(cielo, rumbo = [], sesiones = [], hoy){
    if (volvisteDe(sesiones, hoy)) return [];
    return rumbo.map(id => cielo.constelaciones.find(c => c.id === id)).filter(c => c && c.proxima && abre(c));
  }

  /* rotar(metas, sesiones, hoy) → las metas en el orden en que tocan: la ventana abierta primero; después la que hace más
     que no tocás (la que nunca tocaste, antes que todas); empate: la que menos tocaste en 14 días, y el orden de tu rumbo.
     Lo de ayer no se repite, salvo que no haya otra. */
  function rotar(cs, sesiones = [], hoy, {ventana: vs = []} = {}){
    const abierta = new Set(vs), pos = new Map(cs.map((c, i) => [c.id, i]));
    const info = new Map(cs.map(c => [c.id, {u: ultimaVez(c.id, sesiones), n: veces(c.id, sesiones, hoy, 14)}]));
    const orden = [...cs].sort((a, b) => {
      const A = info.get(a.id), B = info.get(b.id);
      return (abierta.has(b.id) - abierta.has(a.id)) || ((A.u ? d(A.u) : -Infinity) - (B.u ? d(B.u) : -Infinity)) || (A.n - B.n) || (pos.get(a.id) - pos.get(b.id));
    });
    const ayer = orden.filter(c => { const u = info.get(c.id).u; return u && d(hoy) - d(u) === 1; });
    const resto = orden.filter(c => !ayer.includes(c));
    return resto.length ? resto : orden;
  }

  /* cuántas veces por semana toca cada meta: dos habilidades por día, repartidas entre las que elegiste */
  const frecuencia = (n, D) => n > 0 ? Math.min(D, 2 * D / n) : 0;
  /* tus días por semana: los que elegiste; si no, lo que entrenaste en las últimas 4 semanas; si no, 3 */
  function diasSemana(perfil = {}, sesiones = [], hoy){
    if (perfil.dias && perfil.dias.length) return perfil.dias.length;
    const ds = new Set(sesiones.filter(s => hoy && d(hoy) - d(s.fecha) < 28 && d(hoy) >= d(s.fecha)).map(s => s.fecha)).size;
    return ds ? Math.max(1, Math.round(ds / 4)) : 3;
  }

  /* la próxima estrella contando las que tu nivel da por hechas: la regla vive en K.nivel.efectiva (una sola para Hoy y tu cosmos) */
  const conDadas = (c, dadas) => K.nivel.efectiva(c, dadas);

  const puede = (id, ej, equipo) => !equipo || (ej[id]?.equipo || []).every(e => equipo.includes(e));
  const sePuedeEscalera = (id, ej, equipo) => { const esc = K.rutina.escalera(id); return !!esc && esc.pasos.some(p => K.rutina.idsPaso(p).some(e => puede(e, ej, equipo))); };
  /* los ejercicios de un bloque (de series, de tramos o suelto) */
  const ejerciciosDe = b => b.pasos ? [...new Set(b.pasos.map(p => p.ejercicio))] : b.tramos ? [...new Set(b.tramos.map(t => t.ejercicio).filter(Boolean))] : [b.ejercicio].filter(Boolean);
  const escaleraDe = b => b.pasos ? [...new Set(b.pasos.map(p => p.escalera).filter(Boolean))] : [];
  /* lo que entrena un bloque: el patrón de su escalera o el de su ejercicio */
  const patronesDe = (b, ej) => [...new Set([...escaleraDe(b).map(id => K.rutina.escalera(id)?.patron).filter(Boolean), ...(escaleraDe(b).length ? [] : ejerciciosDe(b).flatMap(e => K.caminos.patronDe(e, ej)))])];

  /* un bloque de una escalera, en su escalón, con lo que guarda cada serie (escalera, rango, n) */
  const deEscalera = (familia, id, {series = SERIES, rango = RANGO, grupo, descanso, ctx}) => {
    const st = ctx.escalones[id], tipo = st?.paso.tipo || "repeticiones";
    return K.rutina.armarBloques(familia, [{escalera: id, series, rango, desde: ctx.desde?.[id], ...(grupo ? {grupo} : {}), descanso: descanso ?? (tipo === "segundos" ? 90 : 120)}],
      {ej: ctx.ej, equipo: ctx.equipo, sesiones: ctx.sesiones, marcas: ctx.marcas, descarga: ctx.descarga, sinPeso: ctx.sinPeso})[0];
  };

  /* la habilidad de una meta: la prueba si la ventana está abierta; el camino si estás abajo en la escalera que lleva a la
     estrella; si no, la estrella misma (los sostenes, del 50 al 80 % de tu mejor marca, hasta sumar unos 60 s) */
  function habilidad(c, ctx){
    /* el camino a una estrella va con tu cuerpo aunque tengas kilos: sus escalones, sin la versión con peso */
    ctx = {...ctx, escalones: ctx.escalonesSinPeso || ctx.escalones, sinPeso: true};
    if (ctx.abiertas.has(c.id)) return {...K.plan.prueba(c), molde: "habilidad", constelaciones: [c.id]};
    const cam = K.caminos.caminoDe(c.proxima, {escalones: ctx.escalones});
    if (cam.camino) return {...deEscalera(c.familia, cam.escalera, {ctx: {...ctx, descarga: ctx.descarga || ctx.volviste}}), molde: "habilidad", nombre: cam.nombre,
      camino: {escalera: cam.escalera, hasta: cam.hasta, estrella: cam.estrella}, constelaciones: [c.id]};
    const b = K.plan.bloque(c, false, ctx.volviste); if (!b) return null;
    if (b.tipo === "segundos" && b.estrella){
      const U = b.umbral, m = c.proxima.mejor;
      let h = m ? Math.max(5, Math.min(U, Math.round(m * .7))) : Math.max(5, Math.round(U / 2));
      if (ctx.volviste) h = Math.max(5, Math.round(h * .7));
      /* un sostén corto pide menos descanso: de 45 s (5 s) a 90 s (15 s o más) */
      b.objetivo = h; b.series = Math.max(2, Math.min(8, Math.ceil(60 / h))); b.descanso = Math.max(45, Math.min(90, h * 6));
    }
    return {...b, molde: "habilidad", constelaciones: [c.id]};
  }

  /* el cierre sin rango ni motor: 5 min de bici suave si tenés bici; si no, tres posturas de 40 s según lo que entrenó el día */
  function suave(bs, {ej = {}, equipo = null, usados = new Set()} = {}){
    if (equipo && equipo.includes("bici") && !usados.has("bici"))
      return {clase: "tramos", familia: "mo", nombre: ej.bici?.nombre || "Bici", molde: "cierre", tramos: [{clase: "suave", seg: 300, ejercicio: "bici", nota: "Suave, que puedas hablar"}], series: 1};
    const pats = bs.flatMap(b => patronesDe(b, ej)), xs = [];
    for (const e of [...pats.map(p => POSTURA[p]), ...POSTURAS]) if (e && !xs.includes(e) && !usados.has(e) && xs.length < 3) xs.push(e);
    return {clase: "tramos", familia: "ra", nombre: "Posturas", molde: "cierre", tramos: xs.map(e => ({clase: "postura", seg: 40, ejercicio: e})), series: xs.length};
  }

  const dur = b => b.pasos || b.clase ? K.rutina.duracion(b) : K.plan.duracion(b);

  /* ===== Tus minutos y tu reparto =====
     Lo que elegiste entrenar (perfil.enfoque, en el orden en que lo elegiste) se reparte el tiempo del día: lo primero pesa
     más. Una cosa, todo el día; dos, 60 y 40; tres, 50, 30 y 20. Cada parte tiene lo suyo: la fuerza, sus habilidades, sus
     escaleras de a dos y su abdomen; la resistencia, la meta de tu rumbo y el motor a intervalos; la flexibilidad, la meta de
     tu rumbo y las posturas. La flexibilidad va siempre al final, con el cuerpo caliente; sin ella, el cierre de siempre.
     El día dura lo que elegiste (perfil.minutos), cinco minutos menos como mucho. Sin elegir, hasta la hora (TOPE).
     Con poco tiempo, menos cosas por día: cada parte necesita unos 10 minutos; las que no entran hoy tocan otro día. */
  const MINUTOS = [20, 30, 40, 45, 50, 60, 75, 90];
  const REPARTO = {1: [1], 2: [.6, .4], 3: [.5, .3, .2]}, PARTE_MIN = 10, FAMILIAS = ["fu", "mo", "ra"];
  /* el orden de lo que entrenás: lo que elegiste primero; después lo que tu rumbo tenga de otra cosa; sin nada, fuerza */
  function enfoqueDe(enfoque, rumbo = [], cielo){
    const delRumbo = (rumbo || []).map(id => cielo?.constelaciones.find(c => c.id === id)?.familia).filter(f => FAMILIAS.includes(f));
    const xs = [...(enfoque || []).filter(f => FAMILIAS.includes(f)), ...delRumbo];
    const r = [...new Set(xs)];
    return r.length ? r : ["fu"];
  }
  /* qué partes van hoy: todas si entran; si no, las que más atrasadas vienen contra su parte del tiempo (las últimas dos semanas) */
  const parteDeSesion = (s, f) => (s.bloques || []).some(b => b.familia === f && b.molde && b.molde !== "entrada" && b.molde !== "cierre");
  function hoyVan(F, minutos, sesiones = [], hoy){
    const M = Number.isFinite(minutos) && minutos > 0 ? minutos : TOPE, rec = sesiones.filter(s => hoy && d(hoy) - d(s.fecha) < 14 && d(hoy) >= d(s.fecha));
    const elegir = k => {
      if (k >= F.length) return F;
      const n = rec.length + 1, parte = REPARTO[F.length];
      const atraso = F.map((f, i) => ({f, i, a: parte[i] * n - rec.filter(s => parteDeSesion(s, f)).length}));
      const van = new Set(atraso.sort((a, b) => b.a - a.a || a.i - b.i).slice(0, k).map(x => x.f));
      return F.filter(f => van.has(f));
    };
    /* sin flexibilidad hoy, el cierre ocupa unos 4 minutos más */
    const k = n => Math.max(1, Math.min(F.length, Math.floor(n / PARTE_MIN))), k1 = k(M - 5), van = elegir(k1);
    return van.includes("ra") || k(M - 9) >= van.length ? van : elegir(k(M - 9));
  }
  /* reparto(enfoque, minutos) → lo que muestra la bienvenida: los minutos de la entrada en calor y los de cada parte
     (el primer día; si no entran todas, «alterna» dice cuáles van hoy y que las otras tocan otro día) */
  function reparto(enfoque, minutos){
    const F = enfoqueDe(enfoque), M = Number.isFinite(minutos) && minutos > 0 ? minutos : TOPE, van = hoyVan(F, M), ent = M <= 15 ? 3 : 5;
    const cuerpo = M - ent, p = REPARTO[van.length];
    let resta = cuerpo;
    const partes = van.map((f, i) => { const m = i === van.length - 1 ? resta : Math.round(cuerpo * p[i]); resta -= m; return {f, minutos: m}; });
    return {entrada: ent, partes, alterna: van.length < F.length ? F.filter(f => !van.includes(f)) : []};
  }

  /* motor a intervalos: con lo que tengas (kettlebell, bici, máquina de remo, mancuernas, soga o nada) o lo que dijiste que te gusta (correr, bici, soga,
     pesas rusas); el que menos hiciste. Cada uno tiene sus escalones: cada tres veces, el que sigue (más trabajo, menos pausa) */
  const MOTORES = [
    {con: "kettlebell", nombre: "Kettlebell a intervalos", pasos: [
      {ej: "swing-kettlebell", t: 20, p: 40, n: 10}, {ej: "swing-kettlebell", t: 30, p: 30, n: 10},
      {ej: "arranque-kettlebell", t: 15, p: 15, n: 16, nota: "Brazo alterno"}, {ej: "arranque-kettlebell", t: 20, p: 10, n: 20, nota: "Brazo alterno"}]},
    {con: "bici", nombre: "Bici a intervalos", fuerte: true, pasos: [
      {ej: "bici", t: 30, p: 90, n: 6}, {ej: "bici", t: 30, p: 60, n: 8}, {ej: "bici", t: 40, p: 40, n: 8}, {ej: "bici", t: 20, p: 10, n: 8}]},
    {con: "remadora", nombre: "Remo a intervalos", fuerte: true, pasos: [
      {ej: "remo-maquina", t: 30, p: 90, n: 6}, {ej: "remo-maquina", t: 40, p: 80, n: 6}, {ej: "remo-maquina", t: 60, p: 60, n: 8}, {ej: "remo-maquina", t: 90, p: 60, n: 6}]},
    {con: "mancuernas", nombre: "Mancuerna a intervalos", pasos: [
      {ej: "swing-mancuerna", t: 20, p: 40, n: 10}, {ej: "swing-mancuerna", t: 30, p: 30, n: 10}, {ej: "swing-mancuerna", t: 40, p: 20, n: 10}]},
    {con: "cajon", nombre: "Cajón a intervalos", pasos: [
      {ej: "salto-cajon", t: 20, p: 40, n: 8}, {ej: "salto-cajon", t: 20, p: 30, n: 10}, {ej: "salto-cajon", t: 30, p: 30, n: 10}]},
    {con: "soga", nombre: "Soga a intervalos", pasos: [{ej: "soga", t: 30, p: 30, n: 8}, {ej: "soga", t: 40, p: 20, n: 10}, {ej: "soga", t: 60, p: 30, n: 10}]},
    /* trotar y caminar: no pide equipo, va si correr es lo tuyo */
    {con: "trote", gusto: true, nombre: "Trote y caminata", fuerte: true, nota: ["Trotá", "Caminá"], pasos: [
      {ej: "trote", t: 60, p: 90, n: 8}, {ej: "trote", t: 90, p: 90, n: 8}, {ej: "trote", t: 120, p: 60, n: 8}, {ej: "trote", t: 180, p: 60, n: 6}, {ej: "trote", t: 300, p: 60, n: 5}]},
    {con: null, nombre: "Intervalos sin equipo", pasos: [
      {ej: "saltos-tijera", t: 20, p: 40, n: 10}, {ej: "escaladores", t: 30, p: 30, n: 10}, {ej: "burpee", t: 20, p: 20, n: 12}, {ej: "burpee", t: 20, p: 10, n: 16}]}
  ];
  /* lo que cada forma de entrenar pide del motor, en orden de gusto */
  const META_CON = {"diez-km": "trote", motor: "bici", soga: "soga"};
  const GUSTO = {correr: ["trote"], bici: ["bici"], remo: ["remadora"], soga: ["soga"], rusas: ["kettlebell"], funcional: ["soga", "kettlebell", null], sinnada: [null], calistenia: [null]};
  const vecesMotor = (nombre, sesiones) => sesiones.filter(s => (s.bloques || []).some(b => (b.molde === "motor" || b.molde === "resistencia") && b.nombre === nombre)).length;
  /* motor(equipo, sesiones, volviste, extra, {formas, seg}): con seg, las vueltas que entran en esos segundos (de 3 al doble) */
  function motor(equipo, sesiones = [], volviste = false, extra = 0, {formas = [], seg = null} = {}){
    const gusto = [...new Set((formas || []).flatMap(f => GUSTO[f] || []))];
    const hay = m => m.con === null || (m.gusto ? gusto.includes(m.con) : !!(equipo && equipo.includes(m.con)));
    const veces = m => vecesMotor(m.nombre, sesiones), rank = m => { const i = gusto.indexOf(m.con); return i < 0 ? 99 : i; };
    /* lo que te gusta primero; si no dijiste, con equipo antes que sin nada; empate: el que menos hiciste */
    const xs = MOTORES.filter(hay).sort((a, b) => rank(a) - rank(b) || (gusto.length ? 0 : (a.con === null) - (b.con === null)) || veces(a) - veces(b));
    const kDe = m => Math.min(m.pasos.length - 1, Math.max(0, Math.floor(veces(m) / 3) - (volviste ? 1 : 0)));
    /* con tiempo dicho, el primero que lo llena (los saltos al cajón no dan para una hora); si ninguno, el que más llena */
    const tope = m => { const x = m.pasos[kDe(m)]; return x.n * 3 * (x.t + x.p) - x.p; };
    const m = seg === null || !xs.length ? xs[0] : xs.find(m => tope(m) >= seg) || xs.reduce((a, b) => tope(b) > tope(a) ? b : a); if (!m) return null;
    const k = kDe(m);
    let n = m.pasos[k].n + extra;
    if (seg !== null){ const x = m.pasos[k]; n = Math.min(x.n * 3, Math.floor((seg + x.p) / (x.t + x.p))); if (n < 3) return null; }
    const x = {...m.pasos[k], n};
    const [tr, pa] = m.fuerte ? ["fuerte", "suave"] : ["trabajo", "pausa"], tramos = [], [nt, np] = m.nota || [];
    for (let i = 0; i < x.n; i++){
      tramos.push({clase: tr, seg: x.t, ejercicio: x.ej, ...(x.nota || nt ? {nota: x.nota || nt} : {})});
      if (i < x.n - 1) tramos.push({clase: pa, seg: x.p, ...(m.fuerte ? {ejercicio: x.ej} : {}), ...(np ? {nota: np} : {})});
    }
    return {clase: "tramos", familia: "mo", nombre: m.nombre, molde: "motor", escalon: k, tramos, series: x.n};
  }
  /* el cierre de bici suave que arma suave() */
  const esBici = b => b.familia === "mo" && b.tramos?.length === 1 && b.tramos[0].ejercicio === "bici" && b.tramos[0].clase === "suave";
  const minutosDe = bs => Math.max(5, Math.round((bs.reduce((t, b) => t + dur(b), 0) + Math.max(0, bs.length - 1) * ENTRE) / 300) * 5);
  /* lo que ocupa una parte en el día: cada bloque con el cambio que lo precede */
  const segDe = bs => bs.reduce((t, b) => t + dur(b) + ENTRE, 0);

  /* las posturas de la flexibilidad: de a una (o sus dos lados), en el orden de las rutinas de rango; cada día arranca donde
     dejó el anterior. Con yoga, un minuto cada una y empieza moviendo la espalda */
  const MOVILIDAD = ["mariposa-acostado", "gluteo-tobillo-rodilla", "aductores-acostado", "estiramiento-corredor", "pecho-pared", "dorsal-arriba", "hombros-silla",
    "triceps-sobre-cabeza", "manos-atras-sentado", "isquios-pierna-arriba", "piernas-abiertas", "flexor-cuadriceps-estocada", "postura-nino", "tocar-los-pies",
    "flexor-cadera-arrodillado", "rodilla-cruzada", "codos-atras", "isquios-sentado"];
  function posturas(seg, {sesiones = [], usados = new Set(), yoga = false, ej = {}} = {}){
    /* las que se hacen de un lado y del otro (lado en el catálogo) van de a dos */
    const lados = e => !!ej[e]?.lado;
    /* con más tiempo que posturas, cada una dura más (de 45 s a un minuto y medio) */
    const cuantas = MOVILIDAD.filter(e => !usados.has(e)).reduce((n, e) => n + (lados(e) ? 2 : 1), 0);
    const t = Math.max(yoga ? 60 : 45, Math.min(90, Math.floor((seg - ENTRE) / Math.max(1, cuantas) / 15) * 15)), hechas = sesiones.filter(s => (s.bloques || []).some(b => b.molde === "flexibilidad" && b.clase === "tramos")).length;
    const pool = MOVILIDAD.filter(e => !usados.has(e)), ini = pool.length ? (hechas * 6) % pool.length : 0;
    const orden = [...(yoga ? ["gato-camello"] : []), ...pool.slice(ini), ...pool.slice(0, ini)], tramos = [];
    let resta = seg - ENTRE;
    for (const e of orden){
      const ls = lados(e) ? [{nota: "Un lado"}, {nota: "El otro lado"}] : [{}];
      if (ls.length * t > resta) { if (tramos.length >= 3) break; else continue; }
      for (const l of ls) tramos.push({clase: "postura", seg: t, ejercicio: e, ...l});
      resta -= ls.length * t;
    }
    if (tramos.length < 3) return null;
    return {clase: "tramos", familia: "ra", nombre: yoga ? "Secuencia de posturas" : "Posturas", molde: "flexibilidad", tramos, series: tramos.length};
  }

  /* armar(cielo, rumbo, sesiones, hoy, ctx) → {bloques, minutos, volviste, ventana, rotacion, pide, proxima, partes, molde: true}
     ctx: {ej, equipo, marcas, nivelDesde (el escalón de arranque de cada escalera), dadas (estrellas que tu nivel da por hechas),
     descarga (la semana de prueba: las escaleras a la mitad), minutos, enfoque (lo que entrenás, en orden), formas (cómo te gusta)} */
  function armar(cielo, rumbo = [], sesiones = [], hoy, {ej = {}, equipo = null, marcas = [], nivelDesde, dadas, descarga = false, minutos = null, enfoque = null, formas = [], semana = "auto", dias = null, tipo: tipoPedido = null} = {}){
    const por = id => cielo.constelaciones.find(c => c.id === id);
    const delRumbo = (rumbo || []).map(por).filter(Boolean).map(c => conDadas(c, dadas));
    /* lo que pide equipo que no marcaste queda afuera, y se dice */
    const pide = delRumbo.filter(c => !c.proxima && !c.completa && c.pide.length).map(c => ({id: c.id, nombre: c.nombre, pide: c.pide}));
    const vivas = delRumbo.filter(c => c.proxima);
    const de = f => vivas.filter(c => c.familia === f);
    const volviste = volvisteDe(sesiones, hoy);
    const abiertas = new Set(volviste ? [] : vivas.filter(abre).map(c => c.id));
    const escalones = K.rutina.escalonesTodos({ej, equipo, sesiones, marcas, desde: nivelDesde});
    const escalonesSinPeso = K.rutina.escalonesTodos({ej, equipo, sesiones, marcas, desde: nivelDesde, sinPeso: true});
    const ctx = {ej, equipo, sesiones, marcas, escalones, escalonesSinPeso, desde: nivelDesde, descarga, volviste, abiertas};
    const usadosEj = new Set(), usadasEsc = new Set(), usar = b => { ejerciciosDe(b).forEach(e => usadosEj.add(e)); escaleraDe(b).forEach(e => usadasEsc.add(e)); };
    const choca = b => ejerciciosDe(b).some(e => usadosEj.has(e)) || escaleraDe(b).some(e => usadasEsc.has(e));
    const M = Number.isFinite(minutos) && minutos > 0 ? minutos : TOPE, corta = M <= 15;
    const F = enfoqueDe(enfoque, rumbo, cielo), van = hoyVan(F, M, sesiones, hoy);
    const yoga = (formas || []).includes("yoga");

    /* ===== la fuerza: habilidad (dos metas de tu rumbo, rotando), fuerza de a dos y abdomen ===== */
    const orden = rotar(de("fu"), sesiones, hoy, {ventana: [...abiertas]});
    const hab = [], fuerza = [];
    let conSeries = b => b;
    /* el tipo de día: el que sigue en el ciclo de tu semana (los días con fuerza que ya hiciste lo hacen avanzar) */
    const T = TIPOS[tipoPedido] || TIPOS[tipoDelDia(semana, diasSemana({dias: dias || []}, sesiones, hoy), sesiones)], tipo = T.id;
    if (van.includes("fu")){
      /* 1 · habilidad: dos metas distintas en el orden de la rotación. Dos metas con el mismo ejercicio (o la misma escalera)
         van en un solo bloque «para» las dos. Si la segunda entrena lo mismo que la primera y la que sigue no, va la que sigue. */
      /* solo las metas que entrenan lo de este tipo de día (en cuerpo entero, todas) */
      const principal = b => patronesDe(b, ej)[0];
      const patHab = x => { const p = principal(x.b); return MOV_PATRONES.has(p) ? p : META_PATRON[x.c.id]; };
      const cand = orden.map(c => ({c, b: habilidad(c, ctx)})).filter(x => x.b && (!T.hab || !patHab(x) || T.hab.includes(patHab(x))));
      /* el bloque de hoy que ya hace lo mismo (mismo ejercicio o misma escalera); una prueba no se junta */
      const destino = b => hab.find(h => !h.prueba && !b.prueba && (ejerciciosDe(h).some(e => ejerciciosDe(b).includes(e)) || escaleraDe(h).some(e => escaleraDe(b).includes(e))));
      const libre = x => !x.usada && !destino(x.b) && !choca(x.b);
      for (let k = 0; k < cand.length; k++){
        const x = cand[k]; if (x.usada) continue;
        const h = destino(x.b);
        if (h){ if (!h.constelaciones.includes(x.c.id)) h.constelaciones.push(x.c.id); x.usada = true; continue; }
        if (hab.length >= HABILIDADES || choca(x.b)) continue;
        let elegido = x;
        if (hab.length === 1 && principal(x.b) && principal(x.b) === principal(hab[0])){
          const sig = cand.slice(k + 1).find(libre);
          if (sig && principal(sig.b) !== principal(hab[0])) elegido = sig;
        }
        hab.push(elegido.b); usar(elegido.b); elegido.usada = true;
        if (elegido !== x) k--; /* la salteada se vuelve a mirar: si hace lo mismo que la elegida, va «para» las dos */
      }

      /* 2 · los movimientos del día, por orden: principales, secundarios, accesorios y abdomen (NIVEL_MOV). Dentro de cada escalón
         del orden se turnan (va primero el que hace más que no tocás) y lo que ya entrena una habilidad va al final de su escalón.
         Si la habilidad ya entrena el abdomen, no se suma otro. Cada movimiento, la primera escalera de MOV que tu equipo permite */
      const cubre = new Set(hab.flatMap(b => patronesDe(b, ej)));
      const ultima = id => { let f = ""; for (const s of sesiones) if (s.fecha > f && (s.bloques || []).some(b => (b.series || []).some(x => x.escalera === id))) f = s.fecha; return f; };
      const libreEsc = id => !usadasEsc.has(id) && sePuedeEscalera(id, ej, equipo) && escalones[id] && !usadosEj.has(escalones[id].paso.ejercicio);
      /* abdomen y abdomen2: las dos escaleras de abdomen, primero la que hace más que no tocás */
      const escDe = mv => mv.startsWith("abdomen") ? [...ABDOMEN].sort((a, b) => ultima(a).localeCompare(ultima(b))).slice(mv === "abdomen2" ? 1 : 0) : MOV[mv].esc;
      const elegirEsc = mv => escDe(mv).find(libreEsc) || null;
      const lista = [];
      for (const t of [1, 2, 3, 4]){
        const xs = T.mov.filter(mv => MOV[mv].t === t && !(t === 4 && cubre.has("abdomen"))).map((mv, i) => ({mv, i, esc: elegirEsc(mv)})).filter(x => x.esc);
        xs.sort((a, b) => cubre.has(MOV[a.mv].patron) - cubre.has(MOV[b.mv].patron) || ultima(a.esc).localeCompare(ultima(b.esc)) || a.i - b.i);
        for (const x of xs){ const id = elegirEsc(x.mv); if (!id) continue; usadasEsc.add(id); usadosEj.add(escalones[id].paso.ejercicio); lista.push({mv: x.mv, t, esc: id}); }
      }
      /* de a dos, solo los que no se pisan: lados distintos y del mismo escalón del orden o del siguiente. El abdomen va solo */
      const grupos = [];
      for (let k = 0, usado = new Set(); k < lista.length; k++){
        if (usado.has(k)) continue; usado.add(k);
        const a = lista[k], j = a.t < 4 ? lista.findIndex((b, j) => j > k && !usado.has(j) && b.t < 4 && LADO[b.mv] !== LADO[a.mv] && Math.abs(b.t - a.t) <= 1) : -1;
        if (j >= 0){ usado.add(j); grupos.push([a, lista[j]]); } else grupos.push([a]);
      }
      const armarG = (g, k, n) => {
        if (g[0].t === 4){ const id = g[0].esc; return {...deEscalera("fu", id, {series: escalones[id].paso.tipo === "segundos" ? 2 : n, descanso: 60, ctx: {...ctx, descarga: descarga || volviste}}), molde: "abdomen"}; }
        const grupo = g.length > 1 ? "ABCDEF"[k] : null;
        const cbs = g.map((x, i) => ({escalera: x.esc, series: n, rango: RANGO, desde: nivelDesde?.[x.esc], ...(grupo ? {grupo} : {}), descanso: grupo && i === 0 ? 0 : ENTRE}));
        return {...K.rutina.armarBloques("fu", cbs, {ej, equipo, sesiones, marcas, descarga: descarga || volviste})[0], molde: "fuerza"};
      };
      grupos.forEach((g, k) => fuerza.push(armarG(g, k, SERIES)));
      conSeries = (b, n) => { const k = fuerza.indexOf(b); return k < 0 || b.molde === "abdomen" ? b : armarG(grupos[k], k, n); };
    }
    /* la fuerza a su tiempo: de todas las formas de armarla (una o dos habilidades; los movimientos en orden, así lo primero
       que se cae es el abdomen y después los accesorios; 3, 2 o 4 series), la que entra. Primero, que haya
       habilidad; después, al menos un movimiento; después, tres series o más; después, más movimientos; y lo más largo.
       Si nada entra, la habilidad sola con menos series */
    function parteFu(seg){
      const H = hab.length > 1 ? [hab, hab.slice(0, 1)] : [hab];
      /* en orden: entra cada uno que quepa en lo que queda; lo que no entra se saltea (nunca va algo de más abajo en su lugar
         si cabía lo de más arriba) */
      const enOrden = (h, n) => { const p = []; for (const b of fuerza){ const x = n === 3 ? b : conSeries(b, n); if (segDe([...h, ...p, x]) <= seg) p.push(x); } return p; };
      let mejor = null;
      for (const h of H) for (const {p, n} of [3, 2, ...(minutos ? [4] : [])].map(n => ({p: enOrden(h, n), n})).concat([{p: [], n: 3}])){
        const bs = [...h, ...p], t = segDe(bs);
        if (t > seg) continue;
        const pref = (h.length > 0) * 1e8 + (p.length > 0) * 1e7 + (n >= 3) * 1e6 + h.length * 1e5 + p.length * 1e4 + t;
        if (!mejor || pref > mejor.pref) mejor = {bs, t, pref};
      }
      if (mejor && (mejor.bs.length || !hab.length)) return mejor.bs;
      /* nada entra: la primera habilidad con las series que entren (dos como mínimo) */
      const h = hab[0]; if (!h) return [];
      for (let n = h.series - 1; n >= 2; n--){ const b = h.pasos ? {...h, pasos: h.pasos.slice(0, n), series: n} : {...h, series: n}; if (segDe([b]) <= seg || n === 2) return h.prueba ? [h] : [b]; }
      return [h];
    }

    /* ===== la resistencia: la meta de tu rumbo que toca (a tu tiempo) y el motor a intervalos con lo que quede ===== */
    /* las metas de resistencia, primero las de lo que te gusta (correr, bici, soga) */
    const gusto = [...new Set((formas || []).flatMap(f => GUSTO[f] || []))], rangoG = c => { const i = gusto.indexOf(META_CON[c.id]); return i < 0 ? 99 : i; };
    const ordenMo = rotar([...de("mo")].sort((a, b) => rangoG(a) - rangoG(b)), sesiones, hoy, {ventana: [...abiertas]});
    function meta(c, seg, molde){
      let b = abiertas.has(c.id) ? K.plan.prueba(c) : K.plan.bloque(c, false, volviste);
      if (b && segDe([b]) > seg && !b.prueba) b = K.plan.bloque(c, true, volviste);
      /* lo que se mide en minutos se acorta a lo que haya (de 5 en adelante) */
      if (b && segDe([b]) > seg && !b.prueba && (b.tipo === "minutos")) b = {...b, objetivo: Math.max(5, Math.floor((seg - ENTRE) / 60 / 5) * 5)};
      return b && segDe([b]) <= seg && !choca(b) ? {...b, molde, constelaciones: [c.id]} : null;
    }
    function parteMo(seg){
      const bs = [];
      /* la meta que toca; si sobra mucho, también la que sigue */
      for (const c of ordenMo.slice(0, 2)){
        if (bs.length && seg - segDe(bs) < 15 * 60) break;
        const b = meta(c, bs.length ? (seg - segDe(bs)) * .5 : seg, "resistencia"); if (!b || ejerciciosDe(b).some(e => bs.some(x => ejerciciosDe(x).includes(e)))) continue;
        bs.push(b);
        /* un día de prueba, la prueba sola: se hace descansado y no se suma otra salida */
        if (b.prueba) return bs;
      }
      const resto = seg - segDe(bs);
      if (resto >= 5 * 60){ const m = motor(equipo, sesiones, volviste, 0, {formas, seg: resto - ENTRE}); if (m) bs.push({...m, molde: "resistencia"}); }
      if (!bs.length){ const m = motor(equipo, sesiones, volviste, 0, {formas, seg: Math.max(4 * 60, seg - ENTRE)}); if (m) bs.push({...m, molde: "resistencia"}); }
      return bs;
    }

    /* ===== la flexibilidad: la meta de tu rumbo que toca y las posturas hasta llenar su tiempo ===== */
    const ordenRa = rotar(de("ra"), sesiones, hoy, {ventana: [...abiertas]});
    function parteRa(seg){
      const bs = [];
      for (const c of ordenRa.slice(0, seg >= 20 * 60 ? 2 : 1)){ const b = meta(c, seg * (seg >= 20 * 60 ? .3 : .5), "flexibilidad"); if (b && !ejerciciosDe(b).some(e => bs.some(x => ejerciciosDe(x).includes(e)))) bs.push(b); }
      const usados = new Set([...usadosEj, ...bs.flatMap(ejerciciosDe)]);
      const p = posturas(seg - segDe(bs), {sesiones, usados, yoga, ej});
      if (p) bs.push(p);
      return bs;
    }

    /* ===== el día: entrada, las partes en el orden en que las elegiste (la flexibilidad al final) y el cierre ===== */
    const ARMA = {fu: parteFu, mo: parteMo, ra: parteRa};
    const enOrden = [...van.filter(f => f !== "ra"), ...van.filter(f => f === "ra")], parte = REPARTO[van.length];
    const entradaSeg = corta ? 150 : 315, conCierre = !van.includes("ra") && !corta;
    const usados0 = [new Set(usadosEj), new Set(usadasEsc)];
    function construir(disponible){
      usadosEj.clear(); usados0[0].forEach(e => usadosEj.add(e)); usadasEsc.clear(); usados0[1].forEach(e => usadasEsc.add(e));
      let partes = Object.fromEntries(enOrden.map(f => [f, ARMA[f](disponible * parte[van.indexOf(f)])]));
      /* lo que una parte no usa lo aprovecha la primera que elegiste (y la siguiente, si sobra) */
      const sobra = () => disponible - enOrden.reduce((t, f) => t + segDe(partes[f]), 0);
      for (const f of minutos ? van : []){ const s = sobra(); if (s < 120) break; const mas = ARMA[f](segDe(partes[f]) + s); if (segDe(mas) > segDe(partes[f])) partes = {...partes, [f]: mas}; }
      let cuerpo = enOrden.flatMap(f => partes[f]);
      cuerpo.forEach(usar);
      let cierre = null;
      if (conCierre){
        /* sin flexibilidad, el cierre de siempre: la bici suave si tenés bici y no pedaleaste; si no, tres posturas */
        cierre = suave(cuerpo, {ej, equipo: van.includes("mo") ? null : equipo, usados: usadosEj});
        usar(cierre); cuerpo = [...cuerpo, cierre];
      }
      const entrada = {...K.caminos.entrada(cuerpo, {equipo, ej, familia: van[0], corta}), molde: "entrada"};
      let bs = [entrada, ...cuerpo];
      /* la bici del cierre que no entra pasa a posturas */
      if (cierre && esBici(cierre) && minutosDe(bs) > M){ const p = suave(cuerpo.filter(b => b !== cierre), {ej, equipo: null, usados: usadosEj}); bs = bs.map(b => b === cierre ? p : b); cierre = p; }
      /* con tiempo de sobra en un día de pura fuerza: el motor a intervalos antes del cierre, y la bici del cierre se estira */
      if (minutos && van.length === 1 && van[0] === "fu" && M - minutosDe(bs) >= 10){
        const i = bs.indexOf(cierre), con = m => [...bs.slice(0, i < 0 ? bs.length : i), m, ...(i < 0 ? [] : bs.slice(i))];
        const m = motor(equipo, sesiones, volviste, 0, {formas, seg: (M - minutosDe(bs)) * 60 - ENTRE});
        if (m && minutosDe(con(m)) <= M){
          bs = con(m);
          /* si el motor es en bici, el cierre no vuelve a pedalear */
          if (cierre && esBici(cierre) && ejerciciosDe(m).includes("bici")){ const p = suave(cuerpo.filter(b => b !== cierre), {ej, equipo: null, usados: usadosEj}); bs = bs.map(b => b === cierre ? p : b); cierre = p; }
        }
      }
      if (cierre && esBici(cierre) && minutos){
        const libre = (M - minutosDe(bs)) * 60, seg = Math.min(1200, cierre.tramos[0].seg + Math.floor(libre / 300) * 300);
        if (seg > cierre.tramos[0].seg) bs = bs.map(b => b === cierre ? {...b, tramos: [{...b.tramos[0], seg}]} : b);
      }
      return bs;
    }
    /* si el día se pasa de tus minutos, se arma de nuevo con menos; nunca pasa de lo que elegiste */
    let disponible = M * 60 - entradaSeg - (conCierre ? 120 + ENTRE : 0), bloques = construir(disponible);
    for (let i = 0; i < 4 && minutosDe(bloques) > M; i++){ disponible -= (minutosDe(bloques) - M) * 60 + 60; bloques = construir(disponible); }

    const rotacion = orden.map(c => c.id), hoyVanC = new Set(bloques.flatMap(b => b.constelaciones || []));
    const despues = [...orden, ...ordenMo, ...ordenRa].filter(c => !hoyVanC.has(c.id)).slice(0, 2);
    /* «La próxima»: las dos que siguen en la rotación (sus ids; la pantalla las dibuja con el punto de su familia) */
    const proxima = despues.map(c => c.id);
    const ventanaHoy = bloques.filter(b => b.prueba).flatMap(b => b.constelaciones || [b.constelacion]);
    return {bloques, minutos: minutosDe(bloques), volviste, ventana: ventanaHoy, rotacion, pide, proxima, enfoque: F, partes: van, dia: van.includes("fu") ? tipo : null, molde: true};
  }

  /* la semana de prueba sobre el día (K.plan.deSemanaDePrueba, igual que con rutina) con la entrada en calor siempre adelante */
  function deSemanaDePrueba(plan, sp, o){
    const r = K.plan.deSemanaDePrueba(plan, sp, o), e = r.bloques.filter(b => b.molde === "entrada");
    return {...r, bloques: [...e, ...r.bloques.filter(b => b.molde !== "entrada")]};
  }

  /* ===== Un día de rutina en el mismo molde (boceto) =====
     La rutina pone lo que se hace (sus bloques, sus series, su semana); el molde pone la forma, igual que Hoy:
     · fuerza y rango: la entrada en calor de Hoy (según lo que pide el día y tu equipo) en lugar de la del catálogo,
       sus superseries como «Fuerza · de a dos», L-sit y bandera acostada como «Abdomen» y el cierre de Hoy (bici o posturas).
     · motor: su bloque ya trae la entrada y la vuelta a la calma adentro; se parte en las mismas partes solo al mostrarlo
       (en la sesión sigue siendo uno, sin toques de más en medio del trote).
     · Tu nivel: sus escaleras arrancan en tu escalón (nivelDesde manda sobre el «desde» de la rutina; lo hecho, sobre los dos). */
  const soloEntrada = b => b.clase === "tramos" && b.tramos.every(t => t.clase === "entrada");
  const ABD = new Set(["abdomen"]);
  function parteDe(b, r, ej){
    if (b.prueba || b.hazana) return undefined;
    if (b.clase === "tramos") return b.tramos.every(t => t.clase === "vuelta") ? "cierre" : b.familia === "mo" ? "motor" : "rango";
    if (r.familia === "ra") return "rango";
    return patronesDe(b, ej).every(p => ABD.has(p)) ? "abdomen" : "fuerza";
  }
  function deRutina(r, i, ctx = {}){
    const {ej = {}, equipo = null} = ctx, p = K.rutina.deRutina(r, i, ctx); if (!p) return null;
    const cuerpo = p.bloques.filter(b => !soloEntrada(b)).map(b => ({...b, molde: parteDe(b, r, ej)}));
    const motor = cuerpo.some(b => b.molde === "motor");
    let bloques = cuerpo;
    if (!motor){
      const usados = new Set(cuerpo.flatMap(ejerciciosDe));
      const entrada = r.familia === "ra" ? [] : [{...K.caminos.entrada(cuerpo, {equipo, ej, familia: r.familia}), molde: "entrada"}];
      const cierre = cuerpo.some(b => b.molde === "cierre") || r.familia === "ra" ? [] : [suave(cuerpo, {ej, equipo, usados})];
      bloques = [...entrada, ...cuerpo, ...cierre];
      /* lo de la rutina no se toca: si con la bici el día pasa de la hora, el cierre son las posturas (dos minutos) */
      if (cierre.length && cierre[0].familia === "mo" && minutosDe(bloques) > TOPE) bloques = [...entrada, ...cuerpo, suave(cuerpo, {ej, equipo: null, usados})];
    }
    return {...p, bloques, minutos: minutosDe(bloques), molde: true};
  }

  return {armar, deRutina, TIPOS, CICLO, SEMANAS, MOV, semanaDe, tipoDelDia, suave, reparto, enfoqueDe, hoyVan, posturas, REPARTO, MINUTOS, MOTORES, motor, rotar, frecuencia, diasSemana, ventana, deSemanaDePrueba, conDadas, tocadas, minutosDe, patronesDe, ejerciciosDe, escaleraDe, ESCALERAS, POSTURA};
})();
