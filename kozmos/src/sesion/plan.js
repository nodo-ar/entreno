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

  function bloque(c, extra, volviste){
    const p = c.proxima, pr = p.prueba;
    let o = objetivo(pr, p.mejor);
    if (extra && pr.tipo === "minutos") o = Math.min(o, 15);
    /* volvés después de 3 semanas o más: la primera vez arranca al 70 % */
    if (volviste && !["logrado", "sesiones", "menos-minutos"].includes(pr.tipo)) o = Math.max(1, Math.round(o * .7));
    const series = extra && SERIES[pr.tipo] > 1 ? 2 : SERIES[pr.tipo];
    return {constelacion: c.id, familia: c.familia, estrella: p.id, ejercicio: pr.ejercicio, tipo: pr.tipo, umbral: pr.umbral, objetivo: o, series, descanso: DESCANSO[pr.tipo], extra: !!extra};
  }

  /* armar(cielo, rumbo, sesiones, hoy) → {bloques, minutos} */
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
    const bloques = usadas.map(c => bloque(c, false, volviste));
    /* la de esa familia que practicaste último, o la de siempre */
    const sumar = (fam, def) => {
      if (usadas.some(c => c.familia === fam)) return;
      const c = cs.filter(x => x.familia === fam && x.proxima && x.ultima).sort((a, b) => b.ultima.localeCompare(a.ultima))[0] || por(def);
      if (c && c.proxima) bloques.push(bloque(c, true, volviste));
    };
    sumar("ra", RANGO); sumar("mo", MOTOR);
    /* orden: fuerza primero, después rango, el motor al final */
    const pos = {fu: 0, ra: 1, mo: 2};
    bloques.sort((a, b) => pos[a.familia] - pos[b.familia]);
    const seg = bloques.reduce((t, b) => t + duracion(b), 0) + Math.max(0, bloques.length - 1) * ENTRE_BLOQUES;
    return {bloques, minutos: Math.max(5, Math.round(seg / 300) * 5), volviste};
  }
  /* la vez pasada: tu mejor serie de ese ejercicio en la última sesión que lo tuvo */
  function vezPasada(sesiones, ejercicio, tipo){
    for (let i = sesiones.length - 1; i >= 0; i--){
      const xs = (sesiones[i].bloques || []).flatMap(b => b.series || []).filter(x => x.ejercicio === ejercicio && x.tipo === tipo && Number.isFinite(x.valor));
      if (xs.length) return K.cielo.TIPOS[tipo].mejor === "menos" ? Math.min(...xs.map(x => x.valor)) : Math.max(...xs.map(x => x.valor));
    }
    return null;
  }
  return {armar, objetivo, vezPasada, ENTRE_BLOQUES};
})();
