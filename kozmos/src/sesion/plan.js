/* ===== Plan del día: funciones puras. Entra tu rumbo, tu cielo y tus sesiones; sale lo que toca hoy. =====
   Cada constelación de tu rumbo aporta un bloque que entrena su próxima estrella con su mismo ejercicio.
   Siempre hay algo de motor y de rango, aunque no estén en tu rumbo, porque un cielo de una sola familia se rompe. */
K.plan = (() => {
  /* cuántas series y cuánto descanso según cómo se mide */
  const SERIES = {segundos: 4, repeticiones: 4, porcentaje: 4, logrado: 3, minutos: 1, "menos-minutos": 1, sesiones: 1};
  const DESCANSO = {segundos: 90, repeticiones: 120, porcentaje: 150, logrado: 90, minutos: 0, "menos-minutos": 0, sesiones: 0};
  const ENTRE_BLOQUES = 120;
  const MOTOR = "motor", RANGO = "espagat"; /* los de siempre, si nunca practicaste otro de esa familia */

  /* a qué apunta cada serie: tu mejor marca un poco más; cerca del umbral (80 %), el umbral mismo */
  function objetivo(p, mejor){
    const u = p.umbral;
    if (p.tipo === "logrado" || p.tipo === "sesiones") return 1;
    if (p.tipo === "menos-minutos") return u;
    if (mejor === null || mejor === undefined) return p.tipo === "minutos" ? u : Math.max(1, Math.ceil(u / 2));
    if (K.cielo.avance(p, mejor) >= .8) return u;
    const paso = p.tipo === "minutos" ? 5 : Math.max(1, Math.round(u * .1));
    return Math.min(u, Math.max(1, Math.round(mejor) + paso));
  }
  /* minutos que lleva, aproximados */
  function duracion(b){
    const t = b.tipo, o = b.objetivo, n = b.series;
    const trabajo = t === "segundos" ? o + 30 : t === "minutos" || t === "menos-minutos" ? o * 60 : t === "sesiones" ? 28 * 60 : 45;
    return n * trabajo + (n - 1) * b.descanso;
  }

  /* las estrellas que solo se encienden con una prueba (una hazaña): puntos, centímetros, km, tiempo o mejora.
     Entre pruebas, el día entrena lo que la hazaña dice que la prepara («entrena»), sin apuntar a la estrella. */
  const SOLO = ["puntos", "cm", "km", "tiempo", "mejora"];
  const soloPrueba = p => !!p && SOLO.includes(p.tipo);
  const hazanas = () => (K.HAZANAS && K.HAZANAS.hazanas) || [];
  /* la hazaña que mide una estrella */
  const hazanaDe = eid => hazanas().find(h => (h.estrellas || []).includes(eid)) || null;
  function bloque(c, extra, volviste){
    const p = c.proxima, pr = p.prueba;
    if (soloPrueba(pr)){
      const h = hazanaDe(p.id), en = h && h.entrena; if (!en) return null;
      const series = extra ? Math.min(2, en.series) : en.series;
      return {constelacion: c.id, familia: c.familia, ejercicio: en.ejercicio, tipo: en.tipo, objetivo: en.objetivo, series, descanso: DESCANSO[en.tipo], extra: !!extra, entrena: h.id};
    }
    let o = objetivo(pr, p.mejor);
    if (extra && pr.tipo === "minutos") o = Math.min(o, 15);
    /* volvés después de 3 semanas o más: la primera vez arranca al 70 % */
    if (volviste && !["logrado", "sesiones", "menos-minutos"].includes(pr.tipo)) o = Math.max(1, Math.round(o * .7));
    const series = extra && SERIES[pr.tipo] > 1 ? 2 : SERIES[pr.tipo];
    return {constelacion: c.id, familia: c.familia, estrella: p.id, ejercicio: pr.ejercicio, tipo: pr.tipo, umbral: pr.umbral, objetivo: o, series, descanso: DESCANSO[pr.tipo], extra: !!extra};
  }

  /* la prueba de una estrella: una sola serie que apunta al umbral, con manos libres si se mide con reloj */
  /* lo que se cuenta de a una sesión no se prueba de un intento; los 10 km tampoco: la app no mide distancia,
     y un toque antes de tiempo anotaría menos minutos y encendería la estrella sin haber corrido */
  const SIN_PRUEBA = ["sesiones", "menos-minutos", ...SOLO];
  const sePrueba = c => !!c.proxima && !SIN_PRUEBA.includes(c.proxima.prueba.tipo);
  function prueba(c){
    const p = c.proxima, pr = p.prueba;
    return {constelacion: c.id, familia: c.familia, estrella: p.id, ejercicio: pr.ejercicio, tipo: pr.tipo, umbral: pr.umbral, objetivo: pr.umbral, series: 1, descanso: 0, extra: false, prueba: true};
  }

  /* armar(cielo, rumbo, sesiones, hoy) → {bloques, minutos, volviste, ventana} */
  function armar(cielo, rumbo, sesiones, hoy){
    const cs = cielo.constelaciones, por = id => cs.find(c => c.id === id);
    const elegidas = (rumbo || []).map(por).filter(c => c && c.proxima);
    const ultima = sesiones.length ? sesiones[sesiones.length - 1] : null;
    const volviste = !!ultima && K.cielo.dia(hoy) - K.cielo.dia(ultima.fecha) >= 21;
    /* sin repetir la misma constelación de fuerza dos días seguidos, si hay otra para hacer */
    const ayer = new Set(sesiones.filter(s => K.cielo.dia(hoy) - K.cielo.dia(s.fecha) === 1).flatMap(s => (s.bloques || []).map(b => b.constelacion)));
    let fuerza = elegidas.filter(c => c.familia === "fu");
    const descansada = fuerza.filter(c => !ayer.has(c.id));
    if (descansada.length) fuerza = descansada;
    const usadas = [...fuerza, ...elegidas.filter(c => c.familia !== "fu")];
    const bloques = usadas.map(c => bloque(c, false, volviste)).filter(Boolean);
    /* la de esa familia que practicaste último, o la de siempre */
    const sumar = (fam, def) => {
      if (usadas.some(c => c.familia === fam)) return;
      /* si la de siempre pide equipo que no tenés, la primera de esa familia que sí puedas hacer */
      const c = cs.filter(x => x.familia === fam && x.proxima && x.ultima).sort((a, b) => b.ultima.localeCompare(a.ultima))[0]
        || (por(def)?.proxima ? por(def) : cs.find(x => x.familia === fam && x.proxima));
      if (c && c.proxima){ const b = bloque(c, true, volviste); if (b) bloques.push(b); }
    };
    sumar("ra", RANGO); sumar("mo", MOTOR);
    /* orden: fuerza primero, después rango, el motor al final */
    const pos = {fu: 0, ra: 1, mo: 2};
    bloques.sort((a, b) => pos[a.familia] - pos[b.familia]);
    /* ventana de prueba: con tu mejor marca al 80 % de la próxima estrella, la sesión empieza probándola, descansado.
       Al volver de 3 semanas o más no se abre: primero se recupera. */
    const ventana = volviste ? [] : usadas.filter(c => sePrueba(c) && c.proxima.mejor !== null && c.avance >= .8);
    /* lo que se hace en una sola serie (una salida de bici, un trote) no se repite: la prueba ya es el entrenamiento del día */
    const solas = new Set(ventana.filter(c => SERIES[c.proxima.prueba.tipo] === 1).map(c => c.id));
    for (let i = bloques.length - 1; i >= 0; i--) if (solas.has(bloques[i].constelacion)) bloques.splice(i, 1);
    bloques.unshift(...ventana.map(prueba));
    const seg = bloques.reduce((t, b) => t + duracion(b), 0) + Math.max(0, bloques.length - 1) * ENTRE_BLOQUES;
    return {bloques, minutos: Math.max(5, Math.round(seg / 300) * 5), volviste, ventana: ventana.map(c => c.id)};
  }
  /* la vez pasada: tu mejor serie de ese ejercicio en la última sesión que lo tuvo */
  function vezPasada(sesiones, ejercicio, tipo){
    for (let i = sesiones.length - 1; i >= 0; i--){
      const xs = (sesiones[i].bloques || []).flatMap(b => b.series || []).filter(x => x.ejercicio === ejercicio && x.tipo === tipo && Number.isFinite(x.valor));
      if (xs.length) return K.cielo.TIPOS[tipo].mejor === "menos" ? Math.min(...xs.map(x => x.valor)) : Math.max(...xs.map(x => x.valor));
    }
    return null;
  }

  /* ===== Semana de prueba (Modelo B, aprobado por Fer) =====
     Una rutina se arma en bloques: «carga» semanas y una de prueba. La semana de prueba es una descarga (la mitad de las
     series) más las pruebas: las próximas estrellas de lo que entrenás y una o dos hazañas. Lo que sacás enciende
     estrellas y fija dónde arranca el bloque siguiente en cada escalera (eso lo lee rutina.escalon del diario).
     Con rutina, las semanas son las de la rutina (las sesiones hechas, de a «dias» por semana): «Prueba en la semana 5».
     Una rutina que termina en un desafío (100 flexiones, los 10 km) tiene su última semana como meta: completa, sin descarga,
     y su semana de prueba pasa a la anterior (K.rutina.semanas).
     Sin rutina, cuentan las semanas del calendario en que entrenaste desde la última prueba.
     Al volver de 3 semanas o más no hay prueba: primero se recupera, como en la ventana del 80 %. */
  const BLOQUE = {carga: 4, prueba: 1};
  const lunes = f => { const d = K.cielo.dia(f); return d - ((d + 3) % 7); }; /* el 1970-01-01 fue jueves */
  function semanaDePrueba(perfil = {}, sesiones = [], hoy, {rutinas = K.RUTINAS || []} = {}){
    const ultima = sesiones.length ? sesiones[sesiones.length - 1] : null;
    const volviste = !!ultima && K.cielo.dia(hoy) - K.cielo.dia(ultima.fecha) >= 21;
    const x = perfil.rutina, r = x && rutinas.find(y => y.id === x.id);
    if (r){
      const cur = K.rutina.enCurso(r, x.desde, sesiones); if (cur.terminada) return null;
      /* las semanas las dice la rutina (K.rutina.semanas): carga, prueba y, si termina en un desafío, la meta */
      const bl = r.bloque || BLOQUE, w = Math.floor(cur.i / (r.dias || 1)), xs = K.rutina.semanas(r), sem = K.rutina.tipoSemana(r, w + 1), b = sem.bloque - 1;
      const esPrueba = sem.tipo === "prueba", toca = esPrueba && !volviste;
      const enBloque = xs.filter(y => y.bloque === sem.bloque && y.n <= w + 1).length;
      /* la semana (desde 1) de la próxima prueba, o esta; null si la rutina no tiene otra */
      const proxima = (xs.find(y => y.n >= w + 1 && y.tipo === "prueba") || {}).n ?? null;
      const meta = xs.find(y => y.tipo === "meta");
      const deEsta = sesiones.filter(s => s.semanaPrueba && s.semanaPrueba.rutina === r.id && s.semanaPrueba.bloque === b + 1 && (!x.desde || s.fecha >= x.desde));
      return {toca, aplazada: esPrueba && volviste, rutina: r.id, semana: w + 1, bloque: b + 1, carga: bl.carga, prueba: bl.prueba, enBloque,
        proxima, conPruebas: toca && !deEsta.some(s => s.semanaPrueba.pruebas), meta: sem.tipo === "meta", ...(meta ? {semanaMeta: meta.n} : {})};
    }
    /* sin rutina: semanas de calendario con alguna sesión desde la última semana de prueba */
    if (!sesiones.length) return null;
    const h = lunes(hoy), ult = [...sesiones].reverse().find(s => s.semanaPrueba);
    const desde = ult ? lunes(ult.fecha) : -Infinity;
    if (ult && desde === h) return {toca: !volviste, rutina: null, semana: null, bloque: ult.semanaPrueba.bloque, carga: BLOQUE.carga, prueba: BLOQUE.prueba, conPruebas: !volviste && !ult.semanaPrueba.pruebas, enBloque: BLOQUE.carga + 1};
    const semanas = new Set(sesiones.filter(s => lunes(s.fecha) > desde && lunes(s.fecha) < h).map(s => lunes(s.fecha))).size;
    const bloque = (ult ? ult.semanaPrueba.bloque : 0) + 1, toca = semanas >= BLOQUE.carga && !volviste;
    return {toca, aplazada: semanas >= BLOQUE.carga && volviste, rutina: null, semana: null, bloque, carga: BLOQUE.carga, prueba: BLOQUE.prueba, conPruebas: toca,
      enBloque: Math.min(semanas, BLOQUE.carga) + (toca ? 1 : 0), faltan: Math.max(0, BLOQUE.carga - semanas)};
  }

  /* las pruebas de la semana: las próximas estrellas de las constelaciones que entrenás y una o dos hazañas.
     cons: las constelaciones (tu rumbo, o a las que lleva tu rutina); ejs: los ejercicios de tus escaleras */
  function pruebasDeLaSemana({cielo, cons = [], ejs = [], sesiones = [], equipo = null, ej = {}, hoy}){
    const cs = cons.map(id => cielo.constelaciones.find(c => c.id === id)).filter(Boolean);
    /* las estrellas: una por constelación, sin las que llevan minutos (una salida larga no es una prueba de un intento) */
    const estrellas = cs.filter(c => sePrueba(c) && c.proxima.prueba.tipo !== "minutos").slice(0, 3);
    const puede = h => !equipo || [h.mide.ejercicio, ...(h.items || []).map(x => x.ejercicio)].every(e => (ej[e]?.equipo || []).every(q => equipo.includes(q)));
    const ids = new Set(cs.map(c => c.id));
    const viene = h => (h.estrellas || []).some(e => ids.has(e.split(".")[0])) || ejs.includes(h.mide.ejercicio);
    const falta = h => K.rutina.cuando(h, sesiones, hoy).falta;
    const hs = hazanas().filter(puede);
    let elegidas = hs.filter(viene).sort((a, b) => falta(a) - falta(b));
    if (!elegidas.length) elegidas = hs.sort((a, b) => falta(a) - falta(b)).slice(0, 1);
    /* la segunda, solo si también toca (o nunca la hiciste) */
    elegidas = elegidas.filter((h, i) => i === 0 || (i === 1 && falta(h) <= 0)).slice(0, 2);
    /* lo que pueden encender: las estrellas sin encender que se miden con eso, en todo el cielo */
    const todas = cielo.constelaciones.flatMap(c => c.estrellas.map(e => ({c, e})));
    const enc = new Set();
    for (const c of estrellas){ const p = c.proxima.prueba; for (const {e} of todas) if (!e.encendida && !e.sinEquipo && e.prueba.ejercicio === p.ejercicio && e.prueba.tipo === p.tipo) enc.add(e.id); }
    for (const h of elegidas) for (const id of h.estrellas || []){ const x = todas.find(y => y.e.id === id); if (x && !x.e.encendida && !x.e.sinEquipo) enc.add(id); }
    return {estrellas, hazanas: elegidas, encienden: [...enc]};
  }

  /* la sesión de la semana de prueba, armada por el motor: pruebas primero (descansado), la descarga y el motor al final.
     plan: la sesión que tocaba (de tu rutina o de tu rumbo); sp: lo que dice semanaDePrueba */
  function deSemanaDePrueba(plan, sp, {cielo, cons = [], ejs = [], sesiones = [], equipo = null, ej = {}, hoy}){
    const descarga = plan.bloques.map(b => b.clase === "tramos" ? mitadTramos(b) : b.pasos ? b
      : b.prueba ? null : {...b, series: Math.max(1, Math.ceil(b.series / 2)), descarga: true}).filter(Boolean);
    const pr = sp.conPruebas ? pruebasDeLaSemana({cielo, cons, ejs, sesiones, equipo, ej, hoy}) : {estrellas: [], hazanas: [], encienden: []};
    const bh = pr.hazanas.map(h => K.rutina.deHazana(h, {ej, equipo, sesiones}).bloques[0]);
    const antes = [...pr.estrellas.map(prueba), ...bh.filter(b => b.familia !== "mo")], despues = bh.filter(b => b.familia === "mo");
    const bloques = [...antes, ...descarga, ...despues];
    const seg = bloques.reduce((t, b) => t + (b.pasos || b.clase ? 300 : duracion(b)), 0);
    return {...plan, bloques, minutos: Math.max(plan.minutos || 5, Math.round(seg / 300) * 5), ventana: [],
      semanaPrueba: {bloque: sp.bloque, ...(sp.rutina ? {rutina: sp.rutina, semana: sp.semana} : {}), pruebas: antes.length + despues.length},
      pruebas: {estrellas: pr.estrellas.map(c => c.proxima.id), hazanas: pr.hazanas.map(h => h.id), encienden: pr.encienden}};
  }
  /* un bloque de tramos, a la mitad: la entrada y la vuelta quedan, de lo del medio se hace la primera mitad */
  function mitadTramos(b){
    const ts = b.tramos, i0 = ts.findIndex(t => t.clase !== "entrada"), i1 = ts.length - [...ts].reverse().findIndex(t => t.clase !== "vuelta");
    if (i0 < 0 || i1 <= i0) return b;
    const medio = ts.slice(i0, i1), n = Math.ceil(medio.length / 2), nuevo = [...ts.slice(0, i0), ...medio.slice(0, n % 2 && medio.length > 1 ? n + 1 : n), ...ts.slice(i1)];
    /* lo que no se pudo partir (una sola salida larga) queda igual y no se dice «más liviana» */
    return nuevo.length < ts.length ? {...b, tramos: nuevo, series: nuevo.length, descarga: true} : b;
  }
  return {armar, objetivo, vezPasada, prueba, sePrueba, soloPrueba, hazanaDe, semanaDePrueba, pruebasDeLaSemana, deSemanaDePrueba, mitadTramos, ENTRE_BLOQUES};
})();
