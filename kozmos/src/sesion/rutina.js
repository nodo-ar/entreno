/* ===== Rutinas, hazañas y tus días: funciones puras. Entra el catálogo y lo que hiciste; sale la sesión que toca. =====
   Una rutina es un camino fijo de semanas: la sesión que toca es la que sigue a las que ya hiciste, sin fechas que se
   pierdan. Una hazaña es una prueba de cierre con tres niveles. El formato de los archivos está en docs/kozmos-rutinas.md. */
K.rutina = (() => {
  const NIVELES = ["Inicial", "Intermedio", "Completo"];
  const ENTRE_BLOQUES = 120, REP = 4; /* segundos que lleva, más o menos, cada repetición */

  /* de una lista de alternativas, la primera que tu equipo permite; si ninguna, la última (la más simple) */
  const elegir = (alts, ej, equipo) => {
    const xs = [].concat(alts || []);
    return xs.find(id => !equipo || (ej[id]?.equipo || []).every(e => equipo.includes(e))) || xs[xs.length - 1];
  };
  /* ¿se puede hacer con tu equipo? Cada bloque tiene que tener al menos una alternativa posible */
  const sePuede = (alts, ej, equipo) => !equipo || [].concat(alts || []).some(id => (ej[id]?.equipo || []).every(e => equipo.includes(e)));
  const falta = (r, ej, equipo) => equipo ? (r.equipo || []).filter(e => !equipo.includes(e)) : [];

  /* tu mejor serie de un ejercicio: la de la última vez que lo hiciste, o la de siempre */
  const series = (sesiones, ejercicio, tipo) => sesiones.map(s => (s.bloques || []).flatMap(b => b.series || []).filter(x => x.ejercicio === ejercicio && x.tipo === tipo && Number.isFinite(x.valor)).map(x => x.valor)).filter(v => v.length);
  const vezPasada = (sesiones, ejercicio, tipo) => { const v = series(sesiones, ejercicio, tipo); return v.length ? Math.max(...v[v.length - 1]) : null; };
  const deSiempre = (sesiones, ejercicio, tipo) => { const v = series(sesiones, ejercicio, tipo).flat(); return v.length ? Math.max(...v) : null; };

  /* lo que se pide en cada serie: la lista de la rutina, una columna según tu mejor marca, o un rango que sube de a uno */
  function objetivos(b, ejercicio, sesiones){
    const n = b.series || 1;
    if (b.elegir){
      const m = deSiempre(sesiones, ejercicio, b.tipo) ?? 0;
      return b.elegir.columnas[Math.min(b.elegir.columnas.length - 1, b.elegir.umbrales.filter(u => m >= u).length)];
    }
    if (b.porSerie !== undefined) return Array.isArray(b.porSerie) ? b.porSerie : Array(n).fill(b.porSerie);
    if (b.rango){
      const [lo, hi] = b.rango, antes = vezPasada(sesiones, ejercicio, b.tipo);
      return Array(n).fill(antes === null ? lo : Math.max(lo, Math.min(hi, antes + 1)));
    }
    return Array(n).fill(b.objetivo ?? 1);
  }

  /* los bloques de series del mismo grupo se alternan serie a serie (superserie): A1, A2, A1, A2… */
  function pasosDe(bs){
    const r = [], n = Math.max(...bs.map(b => b.pasos.length));
    for (let k = 0; k < n; k++) for (const b of bs) if (k < b.pasos.length) r.push(b.pasos[k]);
    return r;
  }
  const duracion = b => b.clase === "tramos" ? b.tramos.reduce((t, x) => t + x.seg, 0)
    : b.clase === "circuito" ? (b.minutos ? b.minutos * 60 : b.rondas * b.items.reduce((t, x) => t + (x.min ? x.min * 60 : x.seg ? x.seg + 10 : x.reps * REP), 0))
    : b.pasos.reduce((t, p) => t + (p.tipo === "segundos" ? (p.objetivo === "max" ? 30 : p.objetivo) + 20 : 45) + p.descanso, 0);
  const minutos = bs => Math.max(5, Math.round((bs.reduce((t, b) => t + duracion(b), 0) + Math.max(0, bs.length - 1) * ENTRE_BLOQUES) / 300) * 5);

  /* {"repetir": n, "tramos": […]} se despliega: n veces lo mismo, sin escribirlo n veces en el catálogo */
  const desplegar = ts => ts.flatMap(t => t.repetir ? Array.from({length: t.repetir}, () => desplegar(t.tramos)).flat() : [t]);
  const tramos = (ts, ej, equipo) => desplegar(ts).map(t => t.ejercicio ? {...t, ejercicio: elegir(t.ejercicio, ej, equipo)} : {...t});

  /* la sesión i de una rutina, lista para el motor */
  function deRutina(r, i, {ej = {}, equipo = null, sesiones = []} = {}){
    const s = r.sesiones[i]; if (!s) return null;
    const crudos = s.bloques.map(cb => {
      if (cb.tramos) return {clase: "tramos", familia: r.familia, nombre: cb.nombre || s.nombre, tramos: tramos(cb.tramos, ej, equipo), ...(cb.mide ? {mide: cb.mide} : {}), grupo: null};
      const e = elegir(cb.ejercicio, ej, equipo), os = objetivos(cb, e, sesiones);
      return {familia: r.familia, grupo: cb.grupo || null, pasos: os.map(o => ({ejercicio: e, tipo: cb.tipo, objetivo: o, descanso: cb.descanso ?? 90}))};
    });
    const bloques = [];
    for (let k = 0; k < crudos.length;){
      const b = crudos[k];
      if (b.clase === "tramos"){ delete b.grupo; b.series = b.tramos.length; bloques.push(b); k++; continue; }
      let j = k + 1; while (b.grupo && j < crudos.length && crudos[j].grupo === b.grupo && !crudos[j].clase) j++;
      const pasos = pasosDe(crudos.slice(k, j));
      bloques.push({familia: r.familia, pasos, series: pasos.length, ejercicio: pasos[0].ejercicio, tipo: pasos[0].tipo, objetivo: pasos[0].objetivo, descanso: pasos[0].descanso});
      k = j;
    }
    return {bloques, minutos: minutos(bloques), rutina: {id: r.id, sesion: i}, nombre: s.nombre, ...(s.nota ? {nota: s.nota} : {})};
  }

  /* una hazaña en un nivel (0, 1 o 2), lista para el motor */
  function deHazana(h, nivel, {ej = {}, equipo = null} = {}){
    const n = h.niveles[nivel]; if (!n) return null;
    const items = (n.items || []).map(x => x.ejercicio ? {...x, ejercicio: elegir(x.ejercicio, ej, equipo)} : {...x});
    const base = {familia: h.familia, hazana: h.id, nivel, nombre: h.nombre};
    let b;
    if (h.formato === "tiempo" || h.formato === "chipper" || h.formato === "amrap")
      b = {...base, clase: "circuito", formato: h.formato === "amrap" ? "amrap" : "tiempo", rondas: h.formato === "chipper" ? 1 : (n.rondas || 1), minutos: n.minutos || 0, items, series: 1};
    else if (h.formato === "emom")
      b = {...base, clase: "tramos", tramos: Array.from({length: n.minutos}, (_, m) => ({clase: "trabajo", seg: 60, ...items[m % items.length]}))};
    else b = {...base, clase: "tramos", tramos: tramos(n.tramos || [], ej, equipo)};
    if (b.clase === "tramos") b.series = b.tramos.length;
    return {bloques: [b], minutos: minutos([b]), hazana: {id: h.id, nivel}, nombre: h.nombre};
  }
  /* cómo se cuenta una hazaña: el tiempo baja, las rondas suben, lo demás se completa */
  const mejorEs = h => h.formato === "amrap" ? "mas" : h.formato === "tiempo" || h.formato === "chipper" ? "menos" : "hecha";
  /* tu mejor en una hazaña y un nivel, o null */
  function mejorHazana(h, nivel, sesiones){
    const vs = sesiones.filter(s => s.hazana && s.hazana.id === h.id && s.hazana.nivel === nivel && Number.isFinite(s.hazana.valor) && s.hazana.valor > 0 && s.hazana.completa !== false && !s.cortada).map(s => s.hazana.valor);
    if (!vs.length) return null;
    return mejorEs(h) === "menos" ? Math.min(...vs) : Math.max(...vs);
  }

  /* lo que anota un bloque de tramos al terminar, según lo que se hizo de cada tramo (segundos) */
  function medir(b, hechos){
    const m = b.mide; if (!m) return null;
    const total = hechos.reduce((t, x) => t + x, 0), pedido = b.tramos.reduce((t, x) => t + x.seg, 0);
    if (m.tipo === "sesiones") return total >= pedido * .8 ? 1 : 0;
    if (m.de === "fuerte-seguido"){
      const f = b.tramos.map((t, k) => t.clase === "fuerte" ? hechos[k] || 0 : 0);
      return Math.round(Math.max(0, ...f) / 60);
    }
    return Math.round(total / 60);
  }

  /* la rutina que seguís y por dónde vas: la sesión que toca es la que sigue a las hechas desde que la elegiste */
  function enCurso(r, desde, sesiones){
    if (!r) return null;
    const i = sesiones.filter(s => s.rutina && s.rutina.id === r.id && (!desde || s.fecha >= desde)).length;
    const dias = r.dias || 1;
    return {i, total: r.sesiones.length, terminada: i >= r.sesiones.length, semana: Math.floor(i / dias) + 1, dia: i % dias + 1};
  }

  /* tus días: 0 es lunes. Sin elegir, todos los días se entrena */
  const diaSemana = f => { const [a, m, d] = String(f).split("-").map(Number); return (new Date(a, m - 1, d).getDay() + 6) % 7; };
  const toca = (dias, f) => !dias || !dias.length || dias.includes(diaSemana(f));
  /* el próximo día de entrenamiento después de hoy, como número de días que faltan (1 = mañana) */
  const faltan = (dias, f) => { if (!dias || !dias.length) return 1; const h = diaSemana(f); for (let k = 1; k <= 7; k++) if (dias.includes((h + k) % 7)) return k; return 1; };

  return {NIVELES, desplegar, elegir, sePuede, falta, objetivos, deRutina, deHazana, mejorEs, mejorHazana, medir, enCurso, diaSemana, toca, faltan, vezPasada, deSiempre};
})();
