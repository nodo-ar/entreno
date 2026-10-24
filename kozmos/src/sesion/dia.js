/* ===== El día del motor B: un molde para cada día (funciones puras) =====
   Entra tu cosmos, tu rumbo, tus sesiones y tu equipo; sale el día, siempre con la misma forma:
   entrada en calor · habilidad, descansado (dos metas de tu rumbo, rotando) · fuerza de a dos (lo que equilibra el día) ·
   abdomen · cierre (rango o motor). Sin tope de metas: con más metas, cada una toca menos veces por semana.
   Nada se guarda: todo sale del catálogo y del diario. Detalle en docs/kozmos-rutinas.md («El día del motor»). */
K.dia = (() => {
  const HABILIDADES = 2, SERIES = 3, RANGO = [5, 8], ENTRE = 120, TOPE = 60;
  /* las escaleras de fuerza para cada patrón, en orden: la primera que tu equipo permite y que el día no usó */
  const ESCALERAS = {tirar: ["remo", "tirar"], empujar: ["fondos", "empujar"], piernas: ["piernas"], bisagra: ["isquios"]};
  const ABDOMEN = ["lsit", "dragon"];
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
      {ej: ctx.ej, equipo: ctx.equipo, sesiones: ctx.sesiones, marcas: ctx.marcas, descarga: ctx.descarga})[0];
  };

  /* la habilidad de una meta: la prueba si la ventana está abierta; el camino si estás abajo en la escalera que lleva a la
     estrella; si no, la estrella misma (los sostenes, del 50 al 80 % de tu mejor marca, hasta sumar unos 60 s) */
  function habilidad(c, ctx){
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

  /* ===== Tus minutos =====
     aTuTiempo(bloques, minutos, partes): el día armado, ajustado a los minutos que elegiste (perfil.minutos).
     Sin elegir, como siempre: hasta la hora (TOPE). Para achicar, en este orden y hasta entrar: el abdomen queda para otro día,
     la fuerza va con 2 series, la bici del cierre pasa a posturas, se va el segundo par de fuerza y después la segunda habilidad.
     La entrada en calor, una habilidad y el cierre quedan siempre. Para agrandar (sobran 10 minutos o más): la fuerza va
     con 4 series y, si el cierre es la bici suave, se estira hasta 20 minutos. Nunca pasa de lo que elegiste. */
  const MINUTOS = [20, 30, 40, 45, 50, 60, 75, 90];
  /* motor a intervalos, para un día largo: con lo que tengas (kettlebell, bici, soga o nada), el que menos hiciste.
     Cada uno tiene sus escalones: cada tres veces, el que sigue (más trabajo, menos pausa; del swing al arranque) */
  const MOTORES = [
    {con: "kettlebell", nombre: "Kettlebell a intervalos", pasos: [
      {ej: "swing-kettlebell", t: 20, p: 40, n: 10}, {ej: "swing-kettlebell", t: 30, p: 30, n: 10},
      {ej: "arranque-kettlebell", t: 15, p: 15, n: 16, nota: "Brazo alterno"}, {ej: "arranque-kettlebell", t: 20, p: 10, n: 20, nota: "Brazo alterno"}]},
    {con: "bici", nombre: "Bici a intervalos", fuerte: true, pasos: [
      {ej: "bici", t: 30, p: 90, n: 6}, {ej: "bici", t: 30, p: 60, n: 8}, {ej: "bici", t: 40, p: 40, n: 8}, {ej: "bici", t: 20, p: 10, n: 8}]},
    {con: "soga", nombre: "Soga a intervalos", pasos: [{ej: "soga", t: 30, p: 30, n: 8}, {ej: "soga", t: 40, p: 20, n: 10}, {ej: "soga", t: 60, p: 30, n: 10}]},
    {con: null, nombre: "Intervalos sin equipo", pasos: [
      {ej: "saltos-tijera", t: 20, p: 40, n: 10}, {ej: "escaladores", t: 30, p: 30, n: 10}, {ej: "burpee", t: 20, p: 20, n: 12}, {ej: "burpee", t: 20, p: 10, n: 16}]}
  ];
  const vecesMotor = (nombre, sesiones) => sesiones.filter(s => (s.bloques || []).some(b => b.molde === "motor" && b.nombre === nombre)).length;
  function motor(equipo, sesiones = [], volviste = false, extra = 0){
    /* con equipo para el motor, ese; sin nada, los intervalos sin equipo */
    const con = MOTORES.filter(m => m.con && equipo && equipo.includes(m.con)), xs = con.length ? con : MOTORES.filter(m => !m.con), veces = m => vecesMotor(m.nombre, sesiones);
    const m = xs.sort((a, b) => veces(a) - veces(b))[0]; if (!m) return null;
    const k = Math.min(m.pasos.length - 1, Math.max(0, Math.floor(veces(m) / 3) - (volviste ? 1 : 0))), x = {...m.pasos[k], n: m.pasos[k].n + extra};
    const [tr, pa] = m.fuerte ? ["fuerte", "suave"] : ["trabajo", "pausa"], tramos = [];
    for (let i = 0; i < x.n; i++){ tramos.push({clase: tr, seg: x.t, ejercicio: x.ej, ...(x.nota ? {nota: x.nota} : {})}); if (i < x.n - 1) tramos.push({clase: pa, seg: x.p, ...(m.fuerte ? {ejercicio: x.ej} : {})}); }
    return {clase: "tramos", familia: "mo", nombre: m.nombre, molde: "motor", escalon: k, tramos, series: x.n};
  }
  /* el cierre de bici suave que arma suave() */
  const esBici = b => b.familia === "mo" && b.tramos?.length === 1 && b.tramos[0].ejercicio === "bici" && b.tramos[0].clase === "suave";
  function aTuTiempo(bloques, minutos, {abdomen, hab = [], cierre, conSeries, ej, equipo, usados, sesiones = [], volviste = false}){
    const M = Number.isFinite(minutos) && minutos > 0 ? minutos : TOPE, entra = bs => minutosDe(bs) <= M;
    const dos = bs => bs.map(b => b.molde === "fuerza" && b.series > 4 ? {...b, pasos: b.pasos.slice(0, 4).map(x => ({...x, n: 2})), series: 4} : b);
    const achicar = [
      bs => bs.filter(b => b !== abdomen),
      dos,
      bs => bs.map(b => b === cierre && esBici(b) ? suave(bs.filter(x => x !== b && x.molde !== "entrada"), {ej, equipo: null, usados}) : b),
      bs => { const f = bs.filter(b => b.molde === "fuerza"); return f.length > 1 ? bs.filter(b => b !== f[f.length - 1]) : bs; },
      bs => { const h = bs.filter(b => b.molde === "habilidad"); return h.length > 1 ? bs.filter(b => b !== h[h.length - 1]) : bs; },
      bs => { const f = bs.filter(b => b.molde === "fuerza"); return hab.length && f.length ? bs.filter(b => b !== f[0]) : bs; }
    ];
    let bs = bloques;
    for (const paso of achicar){ if (entra(bs)) break; bs = paso(bs); }
    if (!Number.isFinite(minutos) || M - minutosDe(bs) < 10) return bs;
    /* agrandar: cada paso solo si sigue entrando */
    const mas = bs.map(b => b.molde === "fuerza" ? conSeries(b, 4) : b);
    if (entra(mas)) bs = mas;
    /* con 10 minutos o más de sobra, motor a intervalos antes del cierre; si todavía sobra, más vueltas (hasta el doble) */
    if (M - minutosDe(bs) >= 10){
      const i = bs.findIndex(b => b.molde === "cierre"), con = m => [...bs.slice(0, i < 0 ? bs.length : i), m, ...(i < 0 ? [] : bs.slice(i))];
      const m0 = motor(equipo, sesiones, volviste);
      if (m0 && entra(con(m0))){
        let m = m0;
        for (let extra = 1; extra <= m0.series; extra++){ const mx = motor(equipo, sesiones, volviste, extra); if (!entra(con(mx))) break; m = mx; }
        bs = con(m);
      }
    }
    const bici = bs.find(b => b.molde === "cierre" && esBici(b));
    if (bici){
      const libre = (M - minutosDe(bs)) * 60, seg = Math.min(1200, bici.tramos[0].seg + Math.floor(libre / 300) * 300);
      if (seg > bici.tramos[0].seg) bs = bs.map(b => b === bici ? {...b, tramos: [{...b.tramos[0], seg}]} : b);
    }
    return bs;
  }
  const minutosDe = bs => Math.max(5, Math.round((bs.reduce((t, b) => t + dur(b), 0) + Math.max(0, bs.length - 1) * ENTRE) / 300) * 5);

  /* armar(cielo, rumbo, sesiones, hoy, ctx) → {bloques, minutos, volviste, ventana, rotacion, pide, pie, molde: true}
     ctx: {ej, equipo, marcas, nivelDesde (el escalón de arranque de cada escalera), dadas (estrellas que tu nivel da por hechas),
     descarga (la semana de prueba: las escaleras a la mitad), dias (tus días por semana)} */
  function armar(cielo, rumbo = [], sesiones = [], hoy, {ej = {}, equipo = null, marcas = [], nivelDesde, dadas, descarga = false, minutos = null} = {}){
    const por = id => cielo.constelaciones.find(c => c.id === id);
    const delRumbo = (rumbo || []).map(por).filter(Boolean).map(c => conDadas(c, dadas));
    /* lo que pide equipo que no marcaste queda afuera, y se dice */
    const pide = delRumbo.filter(c => !c.proxima && !c.completa && c.pide.length).map(c => ({id: c.id, nombre: c.nombre, pide: c.pide}));
    const vivas = delRumbo.filter(c => c.proxima);
    const fu = vivas.filter(c => c.familia === "fu"), otras = vivas.filter(c => c.familia !== "fu");
    const volviste = volvisteDe(sesiones, hoy);
    const abiertas = new Set(volviste ? [] : vivas.filter(abre).map(c => c.id));
    const escalones = K.rutina.escalonesTodos({ej, equipo, sesiones, marcas, desde: nivelDesde});
    const ctx = {ej, equipo, sesiones, marcas, escalones, desde: nivelDesde, descarga, volviste, abiertas};
    const usadosEj = new Set(), usadasEsc = new Set(), usar = b => { ejerciciosDe(b).forEach(e => usadosEj.add(e)); escaleraDe(b).forEach(e => usadasEsc.add(e)); };
    const choca = b => ejerciciosDe(b).some(e => usadosEj.has(e)) || escaleraDe(b).some(e => usadasEsc.has(e));

    /* 1 · habilidad: dos metas distintas en el orden de la rotación. Dos metas con el mismo ejercicio (o la misma escalera)
       van en un solo bloque «para» las dos. Si la segunda entrena lo mismo que la primera y la que sigue no, va la que sigue. */
    const orden = rotar(fu, sesiones, hoy, {ventana: [...abiertas]});
    const hab = [], cand = orden.map(c => ({c, b: habilidad(c, ctx)})).filter(x => x.b);
    const principal = b => patronesDe(b, ej)[0];
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
    /* sin habilidad posible en tu rumbo: rango o motor toman ese lugar (D2) */
    const otrasOrden = rotar(otras, sesiones, hoy, {ventana: [...abiertas]});
    if (!hab.length && otrasOrden.length){
      const c = otrasOrden.shift(), b = abiertas.has(c.id) ? K.plan.prueba(c) : K.plan.bloque(c, false, volviste);
      if (b){ hab.push({...b, molde: "habilidad", constelaciones: [c.id]}); usar(b); }
    }

    /* 2 · fuerza de a dos: lo que le falta al día. Cada par lleva un tirón o un empuje (el que menos series tiene) y
       piernas o bisagra; si una habilidad ya entrena piernas o bisagra, ese lugar es para el tirón o el empuje que más falta */
    const sets = {tirar: 0, empujar: 0, piernas: 0, bisagra: 0, abdomen: 0};
    for (const b of hab) for (const p of patronesDe(b, ej)) if (p in sets) sets[p] += b.series || 1;
    const semana = {tirar: 0, empujar: 0};
    for (const s of sesiones) if (d(hoy) - d(s.fecha) < 7 && d(hoy) >= d(s.fecha)) for (const b of s.bloques || []) for (const x of b.series || [])
      for (const p of K.caminos.patronDe(x.ejercicio, ej)) if (p in semana) semana[p]++;
    const cubre = new Set(hab.flatMap(b => patronesDe(b, ej)));
    const elegir = pat => (ESCALERAS[pat] || []).find(id => !usadasEsc.has(id) && sePuedeEscalera(id, ej, equipo) && escalones[id] && !usadosEj.has(escalones[id].paso.ejercicio)) || null;
    /* el de arriba que más falta: menos series hoy, después menos esta semana; empatados, el que todavía tiene escalera libre */
    const falta = () => ["tirar", "empujar"].sort((a, b) => sets[a] - sets[b] || semana[a] - semana[b] || !elegir(a) - !elegir(b))[0];
    const lugares = [];
    for (const pierna of ["piernas", "bisagra"]){
      const arriba = falta(); lugares.push(arriba); sets[arriba] += SERIES;
      const abajo = cubre.has(pierna) ? falta() : pierna; lugares.push(abajo); sets[abajo] += SERIES;
    }
    const fuerza = [], pares = [];
    for (let k = 0; k < lugares.length; k += 2){
      const ids = [];
      /* si lo de arriba que tocaba no tiene escalera libre con tu equipo, el otro de arriba */
      for (const pat of lugares.slice(k, k + 2)){ const otro = {tirar: "empujar", empujar: "tirar"}[pat], id = elegir(pat) || (otro && elegir(otro)); if (id){ ids.push(id); usadasEsc.add(id); usadosEj.add(escalones[id].paso.ejercicio); } }
      if (!ids.length) continue;
      const grupo = ids.length > 1 ? "AB"[k / 2] : null;
      const cbs = ids.map((id, i) => ({escalera: id, series: SERIES, rango: RANGO, desde: nivelDesde?.[id], ...(grupo ? {grupo} : {}), descanso: grupo && i === 0 ? 0 : ENTRE}));
      const b = K.rutina.armarBloques("fu", cbs, {ej, equipo, sesiones, marcas, descarga: descarga || volviste})[0];
      fuerza.push({...b, molde: "fuerza"}); pares.push(cbs);
    }
    /* la fuerza de a dos con más series (para un día más largo): el mismo par, armado de nuevo */
    const conSeries = (b, n) => { const i = fuerza.indexOf(b); return i < 0 ? b : {...K.rutina.armarBloques("fu", pares[i].map(x => ({...x, series: n})), {ej, equipo, sesiones, marcas, descarga: descarga || volviste})[0], molde: "fuerza"}; };

    /* 3 · abdomen: si ninguna habilidad lo entrena (la bandera acostada y la bandera humana ya lo hacen), la escalera que hace más que no tocás */
    let abdomen = null;
    if (!cubre.has("abdomen")){
      const ult = id => { let f = ""; for (const s of sesiones) if ((s.bloques || []).some(b => (b.series || []).some(x => x.escalera === id)) && s.fecha > f) f = s.fecha; return f; };
      const id = ABDOMEN.filter(x => !usadasEsc.has(x) && escalones[x] && !usadosEj.has(escalones[x].paso.ejercicio)).sort((a, b) => ult(a).localeCompare(ult(b)))[0];
      if (id){ abdomen = {...deEscalera("fu", id, {series: escalones[id].paso.tipo === "segundos" ? 2 : SERIES, descanso: 60, ctx: {...ctx, descarga: descarga || volviste}}), molde: "abdomen"}; usar(abdomen); }
    }

    /* 4 · cierre: lo de rango o motor de tu rumbo (lo que hace más que no tocás); si no, 5 min de bici suave si tenés bici (así el abdomen entra en la hora); si no, posturas */
    let cierre = null;
    const oc = otrasOrden.find(c => !hab.some(h => h.constelaciones.includes(c.id)));
    if (oc){ const b = abiertas.has(oc.id) ? K.plan.prueba(oc) : K.plan.bloque(oc, true, volviste); if (b && !choca(b)) cierre = {...b, molde: "cierre", constelaciones: [oc.id]}; }
    if (!cierre) cierre = suave([...hab, ...fuerza, ...(abdomen ? [abdomen] : [])], {ej, equipo, usados: usadosEj});
    usar(cierre);

    /* 5 · la entrada en calor adelante, según lo que pide el día y tu equipo */
    let cuerpo = [...hab, ...fuerza, ...(abdomen ? [abdomen] : []), cierre];
    const entrada = {...K.caminos.entrada(cuerpo, {equipo, ej}), molde: "entrada"};
    let bloques = [entrada, ...cuerpo];
    bloques = aTuTiempo(bloques, minutos, {abdomen, hab, cierre, conSeries, ej, equipo, usados: usadosEj, sesiones, volviste});

    const rotacion = orden.map(c => c.id), hoyVan = new Set(hab.flatMap(b => b.constelaciones));
    const despues = orden.filter(c => !hoyVan.has(c.id)).slice(0, 2);
    /* «La próxima»: las dos que siguen en la rotación (sus ids; la pantalla las dibuja con el punto de su familia) */
    const proxima = despues.map(c => c.id);
    return {bloques, minutos: minutosDe(bloques), volviste, ventana: hab.filter(b => b.prueba).flatMap(b => b.constelaciones).concat(cierre.prueba ? cierre.constelaciones : []),
      rotacion, pide, proxima, molde: true};
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

  return {armar, deRutina, suave, aTuTiempo, MINUTOS, MOTORES, motor, rotar, frecuencia, diasSemana, ventana, deSemanaDePrueba, conDadas, tocadas, minutosDe, patronesDe, ejerciciosDe, escaleraDe, ESCALERAS, POSTURA};
})();
