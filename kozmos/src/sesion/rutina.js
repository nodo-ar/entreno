/* ===== Rutinas, hazañas y tus días: funciones puras. Entra el catálogo y lo que hiciste; sale la sesión que toca. =====
   Una rutina es un orden de días (A, B, C) con sus semanas; lo que se hace en cada bloque lo decide cómo te fue:
   cada bloque de fuerza nombra una escalera de variantes (catalogo/escaleras.json) y el escalón sale del diario,
   como el cielo, sin guardar nada aparte. Una hazaña es una prueba estandarizada con su escala (magnitud 5 a 1):
   mide un ejercicio, enciende estrellas y se repite cada tanto.
   El formato de los archivos está en docs/kozmos-rutinas.md. */
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

  /* ===== Escaleras y doble progresión =====
     Reglas (Modelo A, aprobado por Fer):
     · Subís: todas las series en el tope del rango dos sesiones seguidas, o una si la última serie «sobró».
       Pasás al escalón siguiente y volvés al mínimo. En un escalón con carga (lastre), sumás la carga en vez de subir.
     · Con mancuernas (un escalón con «kgInicial» y «hastaKg»): arrancás en kgInicial; en el tope sumás la carga y volvés al mínimo;
       si pasarías de hastaKg, subís al escalón siguiente. Dos veces sin el mínimo: la carga de menos (nunca debajo de kgInicial);
       ya en kgInicial, el escalón de abajo. Los kilos van en la serie como «kg» (por mano), no como lastre: no son % de tu peso.
     · Sumás: si no llegaste al tope, cada serie apunta a lo que hiciste en esa serie más uno.
     · Bajás: dos sesiones sin llegar al mínimo en la primera serie. Un escalón abajo, sin culpa.
     · Trabado: tres sesiones sin mejorar abren una descarga (la mitad de las series); después se vuelve a probar.
     · Sostenes: 60 s sumados por sesión, con sostenes del 50 al 80 % de tu mejor marca. Si no llegás a 5 s, el escalón de abajo.
     · La señal por serie («Sobró · Justo · No llegué») es opcional: sin tocar, se infiere por lo hecho contra lo pedido. */
  const MIN_SOSTEN = 5, TOTAL_SOSTEN = 60, SENS = ["sobro", "justo", "no-llego"];
  const escaleras = () => (K.ESCALERAS && K.ESCALERAS.escaleras) || [];
  const escalera = id => escaleras().find(e => e.id === id) || null;
  const puede = (id, ej, equipo) => !equipo || (ej[id]?.equipo || []).every(e => equipo.includes(e));
  /* los ejercicios de un escalón: el de peso («conPeso», si tenés mancuernas), el de siempre y los que lo reemplazan («tambien») */
  const idsPaso = p => [...(p.conPeso ? [p.conPeso.ejercicio] : []), p.ejercicio, ...(p.tambien || [])];
  /* el ejercicio de ese escalón con tu equipo: sin decir tu equipo, el de siempre; con lo que pide el de peso, ese (con sus kilos);
     si no podés el de siempre, el primero de «tambien» que sí (sin kilos: es otro ejercicio) */
  function variante(p, ej, equipo){
    const {conPeso, tambien, ...base} = p;
    if (!equipo) return base;
    if (conPeso && puede(conPeso.ejercicio, ej, equipo)) return {...base, ...conPeso};
    if (puede(p.ejercicio, ej, equipo)) return base;
    const t = (tambien || []).find(id => puede(id, ej, equipo));
    if (!t) return base;
    const {carga, kgInicial, hastaKg, ...sin} = base;
    return {...sin, ejercicio: t};
  }
  /* de una lista de escaleras, la primera que tiene algún escalón que tu equipo permite */
  const elegirEscalera = (ids, ej, equipo) => { const xs = [].concat(ids || []).map(escalera).filter(Boolean);
    return xs.find(e => e.pasos.some(p => puede(p.ejercicio, ej, equipo))) || xs[xs.length - 1] || null; };
  /* la escalera que podés hacer: solo los escalones que tu equipo permite, con su lugar en la escalera entera */
  function defEscalera(esc, ej = {}, equipo = null, desde, rango){
    const todos = esc.pasos.map((p, k) => ({...variante(p, ej, equipo), k})), deTuEquipo = todos.filter(p => puede(p.ejercicio, ej, equipo));
    /* si tu equipo no permite ningún escalón, la escalera entera: la rutina ya avisa lo que pide */
    const pasos = deTuEquipo.length ? deTuEquipo : todos;
    const indice = Object.fromEntries(esc.pasos.flatMap((p, k) => idsPaso(p).map(e => [e, k])));
    const d = desde === undefined ? 0 : indice[desde] ?? 0;
    return {id: esc.id, real: true, nombre: esc.nombre, pasos, indice, rango, desde: Math.max(0, pasos.reduce((j, p, i) => p.k <= d ? i : j, 0))};
  }
  /* un bloque suelto con rango es una escalera de un solo escalón: suma por serie, descarga y, con carga, suma kilos */
  const defSuelto = (e, b, ej = {}) => ({id: "ej:" + e, real: false, pasos: [{ejercicio: e, tipo: b.tipo, k: 0, rango: b.rango,
    ...(b.carga && (ej[e]?.equipo || []).includes("lastre") ? {carga: b.carga} : {})}], indice: {[e]: 0}, desde: 0});

  /* cómo te quedó una serie: lo que marcaste o, sin tocar nada, lo que dicen las repeticiones contra lo pedido */
  function inferir(v, o, tipo){
    if (!Number.isFinite(v) || !Number.isFinite(o)) return null;
    return v >= o + (tipo === "segundos" ? 5 : 2) ? "sobro" : v >= o ? "justo" : "no-llego";
  }
  const sensDe = x => x && (SENS.includes(x.sensacion) ? x.sensacion : inferir(x.valor, x.objetivo, x.tipo));

  /* las series de una sesión que son de esta escalera: las que la nombran o, en sesiones viejas de rutina, las de sus ejercicios */
  const tipoDe = (def, e) => def.pasos.find(p => p.ejercicio === e)?.tipo || (escalera(def.id)?.pasos.find(p => idsPaso(p).includes(e)) || {}).tipo;
  const pertenece = (def, s, x) => !Number.isFinite(x.valor) || !x.ejercicio ? false : def.real
    ? (x.escalera === def.id || (!x.escalera && !x.estrella && !!s.rutina && def.indice[x.ejercicio] !== undefined && tipoDe(def, x.ejercicio) === x.tipo))
    : (!x.escalera && !x.estrella && x.ejercicio === def.pasos[0].ejercicio && x.tipo === def.pasos[0].tipo);

  /* escalon(def, sesiones) → dónde estás en la escalera y qué pasó la última vez. Se recorre el diario en orden;
     el escalón que hiciste manda (si hiciste otro, por equipo o desde otra rutina, ese pasa a ser tu lugar). */
  function escalon(def, sesiones = [], {marcas = []} = {}){
    const P = def.pasos; if (!P.length) return null;
    const pos = e => { const k = def.indice[e] ?? 0; let j = 0; P.forEach((p, i) => { if (p.k <= k) j = i; }); return j; };
    const mejor = {}, anotar = (e, v) => { if (e && Number.isFinite(v) && v > (mejor[e] ?? -Infinity)) mejor[e] = v; };
    for (const m of marcas) if (m.tipo === "segundos") anotar(m.ejercicio, m.valor);
    let i = Math.min(def.desde || 0, P.length - 1), rt = 0, rb = 0, sm = 0, tot = -1;
    let ultimo = null, evento = null, nuevo = null, descarga = false, retest = false, kg = null, sesion = null, desdeI = i, arr = null;
    const limpiar = () => { rt = rb = sm = 0; tot = -1; ultimo = null; };
    /* los kilos de cada escalón con carga: al volver a uno, arrancás con los de la última vez */
    const kgDe = {}, aKg = () => { kg = kgDe[P[i].ejercicio] ?? null; };
    for (const s of sesiones){
      const todas = (s.bloques || []).flatMap(b => b.series || []);
      const xs = todas.filter(x => pertenece(def, s, x));
      if (xs.length){
        const j = Math.max(...xs.map(x => pos(x.ejercicio))); /* si hiciste dos escalones, cuenta el más alto */
        if (j !== i){ i = j; limpiar(); nuevo = null; descarga = false; retest = false; aKg(); }
        desdeI = i; sesion = s.id;
        const p = P[i], sosten = def.real && p.tipo === "segundos", ys = xs.filter(x => pos(x.ejercicio) === i);
        /* con mancuernas la serie guarda «kg»; con lastre, «lastreKg» */
        const kgS = Math.max(0, ...ys.map(x => x.kg ?? x.lastreKg ?? 0)); if (p.carga && kgS > 0){ kg = kgS; kgDe[p.ejercicio] = kg; }
        const mano = !!p.carga && p.kgInicial !== undefined, kgAhora = kg ?? p.kgInicial ?? 0;
        /* la descarga no cuenta para subir ni bajar: después de ella se vuelve a probar */
        if (ys.some(x => x.descarga)){ descarga = false; retest = true; evento = "descarga"; nuevo = null; }
        else {
          const vs = ys.map(x => x.valor);
          /* lo que se compara: las series que salen de un rango (o, en sesiones viejas, todas al mismo objetivo) */
          const evalua = ys.every(x => x.n !== undefined) || (!ys.some(x => x.escalera) && ys.every(x => x.objetivo === undefined || (Number.isFinite(x.objetivo) && x.objetivo === ys[0].objetivo)));
          if (!evalua){ ultimo = {vs, sens: sensDe(ys[ys.length - 1])}; evento = "libre"; nuevo = null; }
          else {
            const [a, b] = ys[0].rango || p.rango || def.rango || [5, 8], n = ys[0].n || ys.length, sens = sensDe(ys[ys.length - 1]);
            let tope, bajo, mejora;
            if (sosten){ const m = Math.max(...vs); tope = ys.length >= n && vs.every(v => v >= p.meta); bajo = m < MIN_SOSTEN; mejora = m > (mejor[p.ejercicio] ?? -1); }
            else { const t = vs.reduce((x, y) => x + y, 0); tope = ys.length >= n && vs.every(v => v >= b); bajo = vs[0] < a; mejora = t > tot; tot = Math.max(tot, t); }
            rt = tope ? rt + 1 : 0; rb = bajo ? rb + 1 : 0; sm = mejora ? 0 : sm + 1; retest = false;
            ultimo = {vs, sens};
            if (sosten ? bajo : rb >= 2){
              if (mano && kgAhora - p.carga >= p.kgInicial){ kg = kgDe[p.ejercicio] = kgAhora - p.carga; evento = "menos-peso"; nuevo = "baja"; }
              else if (i > 0){ i--; evento = "baja"; nuevo = "baja"; aKg(); } else { evento = "igual"; nuevo = null; }
              limpiar();
            } else if (tope && (rt >= 2 || sens === "sobro")){
              if (mano && kgAhora + p.carga > p.hastaKg){
                if (i < P.length - 1){ i++; evento = "sube"; nuevo = "sube"; aKg(); limpiar(); }
                else { evento = "cima"; nuevo = null; rt = rb = sm = 0; }
              }
              else if (p.carga){ kg = kgDe[p.ejercicio] = kgAhora + p.carga; evento = "carga"; nuevo = "carga"; limpiar(); }
              else if (i < P.length - 1){ i++; evento = "sube"; nuevo = "sube"; aKg(); limpiar(); }
              else { evento = "cima"; nuevo = null; rt = rb = sm = 0; }
            } else if (sm >= 3){ evento = "trabado"; nuevo = null; descarga = true; sm = 0; }
            else { evento = "igual"; nuevo = null; }
          }
        }
      }
      /* una prueba (la de una estrella o una hazaña) de un escalón de esta escalera fija dónde arranca lo que sigue */
      const ps = def.real ? (s.bloques || []).flatMap(b => (b.series || []).filter(x => (b.prueba || x.hazana) && x.completa !== false && Number.isFinite(x.valor)
        && def.indice[x.ejercicio] !== undefined && tipoDe(def, x.ejercicio) === x.tipo)) : [];
      if (ps.length){
        const x = ps.reduce((a, y) => pos(y.ejercicio) > pos(a.ejercicio) || (pos(y.ejercicio) === pos(a.ejercicio) && y.valor > a.valor) ? y : a);
        const j = pos(x.ejercicio), a0 = arranque(P, j, x.valor, def.rango), antesI = i;
        if (!xs.length) desdeI = i;
        if (a0.i !== i){ i = a0.i; aKg(); }
        limpiar(); descarga = false; retest = false; sesion = s.id;
        evento = "prueba"; nuevo = i > antesI ? "sube" : i < antesI ? "baja" : null; arr = a0.objetivo;
        if (P[i].tipo === "segundos") anotar(x.ejercicio, x.valor);
      } else if (xs.length) arr = null;
      for (const x of todas) if (x.tipo === "segundos") anotar(x.ejercicio, x.valor);
    }
    /* con mancuernas y sin historia en ese escalón, los kilos de arranque */
    return {id: def.id, i, total: P.length, paso: P[i], pasos: P, de: P[desdeI], evento, nuevo, descarga, retest, ultimo, kg: kg ?? P[i].kgInicial ?? null, mejor: mejor[P[i].ejercicio] ?? null, sesion, arranque: arr};
  }

  /* dónde arrancás después de una prueba con tu máximo «v» en el escalón j: se trabaja al 75 % del máximo.
     Si eso ya llega al tope, el de arriba; si no llega al mínimo, el de abajo; si no, ese, con cada serie en ese 75 %.
     En un sostén: con la meta, el de arriba; con menos de 5 s, el de abajo. */
  function arranque(P, j, v, rango){
    const p = P[j];
    if (p.tipo === "segundos") return v >= p.meta && j < P.length - 1 ? {i: j + 1, objetivo: null} : v < MIN_SOSTEN && j > 0 ? {i: j - 1, objetivo: null} : {i: j, objetivo: null};
    const [a, b] = p.rango || rango || [5, 8], w = Math.floor(v * .75);
    if (w >= b && j < P.length - 1) return {i: j + 1, objetivo: null};
    if (w < a && j > 0) return {i: j - 1, objetivo: null};
    return {i: j, objetivo: Math.max(a, Math.min(b, w))};
  }
  /* lo que toca la próxima vez en esa escalera: un objetivo por serie */
  function metas(def, st, b = {}){
    const p = st.paso;
    if (def.real && p.tipo === "segundos"){
      /* sostenes: del 50 al 80 % de tu mejor marca (más si sobró, menos si no llegaste), hasta sumar 60 s */
      const M = p.meta, best = st.mejor, f = st.ultimo?.sens === "sobro" ? .8 : st.ultimo?.sens === "no-llego" ? .5 : .7;
      const h = best ? Math.max(MIN_SOSTEN, Math.min(M, Math.round(best * f))) : Math.max(MIN_SOSTEN, Math.round(M / 2));
      let n = Math.max(2, Math.min(8, Math.ceil(TOTAL_SOSTEN / h)));
      if (st.descarga) n = Math.ceil(n / 2);
      const os = Array(n).fill(h); if (st.retest && best) os[0] = "max";
      return {objetivos: os, rango: [MIN_SOSTEN, M], evalua: true};
    }
    if (b.porSerie !== undefined){ const n = b.series || 1; return {objetivos: Array.isArray(b.porSerie) ? b.porSerie : Array(n).fill(b.porSerie), evalua: false}; }
    const [a, c] = p.rango || b.rango || def.rango || [b.objetivo ?? 1, b.objetivo ?? 1], base = st.ultimo?.vs;
    const n = st.descarga ? Math.ceil((b.series || 1) / 2) : b.series || 1;
    const os = Array.from({length: n}, (_, k) => st.arranque ? Math.max(a, Math.min(c, st.arranque)) : !base ? a : Math.max(a, Math.min(c, base[Math.min(k, base.length - 1)] + (st.descarga ? 0 : p.tipo === "segundos" ? 5 : 1))));
    return {objetivos: os, rango: [a, c], evalua: true, antes: base};
  }

  /* las escaleras de una rutina y por dónde vas en cada una, en el orden en que aparecen */
  /* «nivelDesde» (Tu nivel: el escalón de arranque de cada escalera) manda sobre el «desde» de la rutina; lo hecho, sobre los dos */
  function escalerasDe(r, {ej = {}, equipo = null, sesiones = [], marcas = [], nivelDesde} = {}){
    const vistas = new Map();
    for (const s of r.sesiones || []) for (const b of s.bloques || []){
      if (!b.escalera) continue;
      const esc = elegirEscalera(b.escalera, ej, equipo); if (!esc || vistas.has(esc.id)) continue;
      const def = defEscalera(esc, ej, equipo, nivelDesde?.[esc.id] ?? b.desde, b.rango), st = escalon(def, sesiones, {marcas});
      if (st) vistas.set(esc.id, {...st, nombre: esc.nombre, familia: esc.familia});
    }
    return [...vistas.values()];
  }
  /* lo que cambió en cada escalera con una sesión: ▲ subiste, = seguís, ▼ bajás, o sumás carga */
  function cambios(x, sesiones, {ej = {}, equipo = null, marcas = [], rutina = null} = {}){
    const k = sesiones.findIndex(s => s.id === x.id), hasta = k < 0 ? [...sesiones, x] : sesiones.slice(0, k + 1);
    const xs = (x.bloques || []).flatMap(b => b.series || []), r = [];
    /* las escaleras que nombran sus series y, en una prueba, las que tienen ese ejercicio en algún escalón */
    const ids = [...new Set([...xs.filter(y => y.escalera).map(y => y.escalera),
      ...xs.filter(y => y.hazana && y.completa !== false).flatMap(y => escaleras().filter(e => e.pasos.some(p => idsPaso(p).includes(y.ejercicio) && (p.tipo || "repeticiones") === y.tipo)).map(e => e.id))])];
    /* lo suelto con carga (el lastre) también cuenta: sumar kilos es subir */
    const cargas = [];
    for (const s of rutina?.sesiones || []) for (const b of s.bloques || []) if (b.carga && !b.escalera) for (const e of [].concat(b.ejercicio)) if (!cargas.some(c => c[0] === e) && xs.some(y => y.ejercicio === e && !y.escalera)) cargas.push([e, b]);
    const defs = [...ids.map(id => escalera(id)).filter(Boolean).map(esc => defEscalera(esc, ej, equipo)), ...cargas.map(([e, b]) => defSuelto(e, b, ej)).filter(d => d.pasos[0].carga)];
    for (const def of defs){
      const st = escalon(def, hasta, {marcas}); if (!st || st.sesion !== x.id) continue;
      const ys = xs.filter(y => pertenece(def, x, y)), b = {series: ys[0]?.n || ys.length, rango: ys[0]?.rango};
      r.push({id: def.id, nombre: def.real ? def.nombre : null, evento: st.evento, nuevo: st.nuevo, de: st.de, a: st.paso, kg: st.kg, carga: st.paso.carga, proxima: metas(def, st, b).objetivos, i: st.i, total: st.total});
    }
    return r;
  }

  /* lo que se pide en cada serie: la lista de la rutina, una columna según tu mejor marca, o un rango que suma por serie */
  function objetivos(b, ejercicio, sesiones){
    const n = b.series || 1;
    if (b.elegir){
      const m = deSiempre(sesiones, ejercicio, b.tipo) ?? 0;
      return b.elegir.columnas[Math.min(b.elegir.columnas.length - 1, b.elegir.umbrales.filter(u => m >= u).length)];
    }
    if (b.porSerie !== undefined) return Array.isArray(b.porSerie) ? b.porSerie : Array(n).fill(b.porSerie);
    if (b.rango){ const def = defSuelto(ejercicio, b); return metas(def, escalon(def, sesiones), b).objetivos; }
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
    : b.pasos.reduce((t, p) => t + (p.dura || (p.tipo === "segundos" ? (p.objetivo === "max" ? 30 : p.objetivo) + 20 : 45)) + p.descanso, 0);
  const minutos = bs => Math.max(5, Math.round((bs.reduce((t, b) => t + duracion(b), 0) + Math.max(0, bs.length - 1) * ENTRE_BLOQUES) / 300) * 5);

  /* {"repetir": n, "tramos": […]} se despliega: n veces lo mismo, sin escribirlo n veces en el catálogo */
  const desplegar = ts => ts.flatMap(t => t.repetir ? Array.from({length: t.repetir}, () => desplegar(t.tramos)).flat() : [t]);
  const tramos = (ts, ej, equipo) => desplegar(ts).map(t => t.ejercicio ? {...t, ejercicio: elegir(t.ejercicio, ej, equipo)} : {...t});

  /* un bloque de series, listo para el motor: con escalera, el escalón que toca y sus objetivos; suelto, el ejercicio que tu equipo permite */
  function bloqueSeries(r, cb, {ej = {}, equipo = null, sesiones = [], marcas = [], descarga = false, nivelDesde}){
    /* «dura»: los segundos que lleva una serie larga (1000 saltos), para que los minutos del día no mientan */
    const base = {tipo: cb.tipo, descanso: cb.descanso ?? 90, ...(cb.dura ? {dura: cb.dura} : {})};
    let e, tipo = cb.tipo, m, st = null, def = null, extra = {};
    if (cb.escalera){
      const esc = elegirEscalera(cb.escalera, ej, equipo);
      def = defEscalera(esc, ej, equipo, nivelDesde?.[esc.id] ?? cb.desde, cb.rango); st = escalon(def, sesiones, {marcas});
      if (descarga) st = {...st, descarga: true, retest: false};
      e = st.paso.ejercicio; tipo = st.paso.tipo; m = metas(def, st, cb);
      extra = {escalera: esc.id, ...(st.nuevo ? {nuevo: st.nuevo} : {})};
    } else {
      e = elegir(cb.ejercicio, ej, equipo);
      if (cb.rango && cb.porSerie === undefined && !cb.elegir){ def = defSuelto(e, cb, ej); st = escalon(def, sesiones, {marcas}); if (descarga) st = {...st, descarga: true, retest: false}; m = metas(def, st, cb); }
      else { m = {objetivos: objetivos(cb, e, sesiones), evalua: false}; if (descarga) m.objetivos = m.objetivos.slice(0, Math.max(1, Math.ceil(m.objetivos.length / 2))); }
    }
    const carga = st && st.paso.carga;
    /* en la descarga, «n» sigue siendo lo que pide la rutina: lo que se compara la próxima vez */
    if (m.evalua) extra = {...extra, rango: m.rango, n: descarga ? metas(def, {...st, descarga: false}, cb).objetivos.length : m.objetivos.length, ...(st.descarga ? {descarga: true} : {})};
    else if (descarga) extra = {...extra, descarga: true};
    /* «mano»: los kilos son de las mancuernas (por mano), no lastre */
    if (carga) extra = {...extra, carga, ...(st.kg ? {kg: st.kg} : {}), ...(st.paso.kgInicial !== undefined ? {mano: true} : {})};
    return {familia: cb.familia || r.familia, grupo: cb.grupo || null, pasos: m.objetivos.map((o, k) => ({...base, ejercicio: e, tipo, objetivo: o, ...extra,
      ...(m.antes ? {antes: m.antes[Math.min(k, m.antes.length - 1)]} : {})}))};
  }

  /* armarBloques(familia, bloques del catálogo, ctx) → los bloques listos para el motor: lo de tramos con su nombre, cada bloque
     de series con su escalón y los del mismo grupo alternados serie a serie. Lo usa la rutina y sirve para cualquier día armado
     con bloques como los de una rutina. «equipoRutina» y «dia» solo nombran un bloque de tramos sin nombre. */
  function armarBloques(familia, cbs, {ej = {}, equipo = null, sesiones = [], marcas = [], descarga = false, nivelDesde, equipoRutina, dia} = {}){
    const r = {familia};
    const crudos = cbs.map(cb => {
      if (cb.tramos){ const ts = tramos(cb.tramos, ej, equipo);
        /* sin nombre en el catálogo, el bloque se llama por lo que se hace («Trote», «Bici», «Posturas»), no por el día */
        return {clase: "tramos", familia: cb.familia || familia, nombre: cb.nombre || nombreTramos(ts, {mide: cb.mide, equipo: equipoRutina, sesion: dia}, ej), tramos: ts, ...(cb.mide ? {mide: cb.mide} : {}), grupo: null}; }
      return bloqueSeries(r, cb, {ej, equipo, sesiones, marcas, descarga, nivelDesde});
    });
    const bloques = [];
    for (let k = 0; k < crudos.length;){
      const b = crudos[k];
      if (b.clase === "tramos"){ delete b.grupo; b.series = b.tramos.length; bloques.push(b); k++; continue; }
      let j = k + 1; while (b.grupo && j < crudos.length && crudos[j].grupo === b.grupo && !crudos[j].clase) j++;
      const pasos = pasosDe(crudos.slice(k, j));
      bloques.push({familia: b.familia, pasos, series: pasos.length, ejercicio: pasos[0].ejercicio, tipo: pasos[0].tipo, objetivo: pasos[0].objetivo, descanso: pasos[0].descanso});
      k = j;
    }
    return bloques;
  }
  /* la sesión i de una rutina, lista para el motor */
  function deRutina(r, i, ctx = {}){
    const s = r.sesiones[i]; if (!s) return null;
    const bloques = armarBloques(r.familia, s.bloques, {...ctx, equipoRutina: r.equipo, dia: s.nombre});
    return {bloques, minutos: minutos(bloques), rutina: {id: r.id, sesion: i}, nombre: s.nombre, ...(s.nota ? {nota: s.nota} : {})};
  }
  /* dónde estás en una escalera, fuera de cualquier rutina: «desde» es el escalón de arranque si todavía no la hiciste */
  function escalonDe(id, {ej = {}, equipo = null, sesiones = [], marcas = [], desde, rango} = {}){
    const esc = escalera(id); if (!esc) return null;
    const st = escalon(defEscalera(esc, ej, equipo, desde, rango), sesiones, {marcas});
    return st && {...st, nombre: esc.nombre, familia: esc.familia, patron: esc.patron};
  }
  /* todas las escaleras y por dónde vas en cada una ({id: escalón}); «desde» puede traer el arranque de cada una ({tirar: "dominada"}) */
  const escalonesTodos = (ctx = {}) => Object.fromEntries(escaleras().map(e => [e.id, escalonDe(e.id, {...ctx, desde: ctx.desde?.[e.id]})]).filter(([, st]) => st));

  /* ===== Los días de una rutina, para saber qué toca antes de empezar =====
     El nombre de un día, en dos partes: el día y lo que lo califica. El del catálogo si ya dice «Día A» o «Día 1»
     (["Día A", ""]); si no, su lugar en la semana y su nombre (["Día 1", "Máximas"]). Nunca «Día 1» dos veces. */
  const DIA = /^d[ií]a\s/i;
  function nombreDia(r, i){
    const s = r.sesiones[i]; if (!s) return ["", ""];
    const k = i % (r.dias || 1) + 1;
    return !s.nombre ? [`Día ${k}`, ""] : DIA.test(s.nombre) ? [s.nombre, ""] : [`Día ${k}`, s.nombre];
  }
  /* ===== Las semanas de una rutina: carga, prueba y, en las que terminan en un desafío, la meta =====
     Cada bloque son «carga» semanas y después «prueba». Con «meta» en el bloque (true o lo que se busca, «100 flexiones
     seguidas»), la última semana es la meta: completa, sin descarga ni pruebas. Si ahí caía la semana de prueba,
     pasa a la semana anterior y cierra ese bloque. Lo dice el catálogo, no el motor: ninguna rutina tiene su id acá. */
  function semanas(r){
    const bl = r.bloque || {carga: 4, prueba: 1}, L = bl.carga + bl.prueba, N = r.semanas || Math.ceil((r.sesiones || []).length / (r.dias || 1)) || 1;
    const xs = Array.from({length: N}, (_, k) => ({n: k + 1, tipo: k % L >= bl.carga ? "prueba" : "carga", bloque: Math.floor(k / L) + 1}));
    if (bl.meta){
      const u = xs[N - 1];
      if (u.tipo === "prueba" && N > 1 && xs[N - 2].tipo === "carga") xs[N - 2] = {...xs[N - 2], tipo: "prueba", bloque: u.bloque};
      xs[N - 1] = {...u, tipo: "meta"};
    }
    return xs;
  }
  /* el tipo de la semana w (desde 1): «carga», «prueba» o «meta»; después de la última, sigue el ciclo de carga y prueba */
  function tipoSemana(r, w){
    const xs = semanas(r); if (w >= 1 && w <= xs.length) return xs[w - 1];
    const bl = r.bloque || {carga: 4, prueba: 1}, L = bl.carga + bl.prueba;
    return {n: w, tipo: (w - 1) % L >= bl.carga ? "prueba" : "carga", bloque: Math.floor((w - 1) / L) + 1};
  }
  const esSemanaDePrueba = (r, w) => tipoSemana(r, w).tipo === "prueba";
  const esMeta = (r, w) => tipoSemana(r, w).tipo === "meta";
  /* lo que se busca en la meta («100 flexiones seguidas»), o nada si el catálogo solo dice que hay meta */
  const metaDe = r => r.bloque && typeof r.bloque.meta === "string" ? r.bloque.meta : "";
  /* 45 → «45 s», 240 → «4 min», 90 → «1:30» */
  const dur = seg => seg < 60 ? `${seg} s` : seg % 60 ? `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}` : `${seg / 60} min`;
  const TRABAJO = ["fuerte", "trabajo", "postura"];
  /* lo que se hace en un bloque de tramos: lo fuerte, el trabajo o las posturas; si no hay, lo suave (una salida en zona 2) */
  const trabajo = ts => { const w = ts.filter(t => TRABAJO.includes(t.clase)); return w.length ? w : ts.filter(t => t.clase === "suave"); };
  /* sin ejercicios en los tramos: trote, bici, soga o, si no, el nombre del día cuando dice algo («Cruzado») */
  function actividad({mide, equipo = [], sesion = ""} = {}, ej = {}){
    if (mide && mide.ejercicio === "trote") return ej.trote?.nombre || "Trote";
    if ((equipo || []).includes("bici") || mide?.ejercicio === "bici") return "Bici";
    if ((equipo || []).includes("soga")) return "Soga";
    return sesion && !DIA.test(sesion) ? sesion : "Intervalos";
  }
  function nombreTramos(ts, o = {}, ej = {}){
    if (ts.every(t => t.clase === "entrada")) return "Entrada en calor";
    if (ts.every(t => t.clase === "vuelta")) return "Vuelta a la calma";
    const w = trabajo(ts), es = [...new Set(w.filter(t => t.ejercicio).map(t => t.ejercicio))];
    if (es.length === 1) return ej[es[0]]?.nombre || es[0];
    if (es.length > 1) return w.every(t => t.clase === "postura") ? "Posturas" : "Circuito";
    return actividad(o, ej);
  }
  /* las filas de un bloque de tramos: la entrada en calor en una fila; si no, cada ejercicio (ej: su id, para abrir su página) con cuántas veces y cuánto,
     o, sin ejercicios, lo que se hace y su forma: «8 × 1 min» y, aparte (nq, lo que la califica), «1:30 suave» */
  function filasTramos(b, ej = {}){
    const ts = b.tramos, total = ts.reduce((t, x) => t + x.seg, 0), fam = b.familia;
    if (ts.every(t => t.clase === "entrada") || ts.every(t => t.clase === "vuelta")) return [{q: b.nombre, n: `${Math.max(1, Math.round(total / 60))} min`, familia: fam}];
    const w = trabajo(ts), con = w.filter(t => t.ejercicio);
    if (con.length) return [...new Set(con.map(t => t.ejercicio))].map(e => {
      const xs = con.filter(t => t.ejercicio === e), n = xs.length;
      const una = xs[0].reps && xs.every(t => t.reps === xs[0].reps) ? String(xs[0].reps) : xs.every(t => t.seg === xs[0].seg) ? dur(xs[0].seg) : null;
      return {q: ej[e]?.nombre || e, ej: e, n: una ? (n > 1 ? `${n} × ${una}` : una) : dur(xs.reduce((t, x) => t + x.seg, 0)), familia: fam};
    });
    if (!w.length) return [{q: b.nombre, n: `${Math.max(1, Math.round(total / 60))} min`, familia: fam}];
    let n = dur(w.reduce((t, x) => t + x.seg, 0)), nq = "";
    if (w.length > 1 && !w.every(t => t.seg === w[0].seg)) n += ` en ${w.length} tramos`;
    else if (w.length > 1){
      const i = ts.indexOf(w[0]), entre = ts.slice(i + 1, ts.indexOf(w[w.length - 1])).find(t => !TRABAJO.includes(t.clase) && t.clase !== w[0].clase);
      n = `${w.length} × ${dur(w[0].seg)}`;
      if (entre) nq = `${dur(entre.seg)} ${entre.clase === "pausa" ? "de pausa" : "suave"}`;
      /* lo suave largo antes de lo fuerte también es parte del día: «30 min suave + 4 × 20 s» */
      const antes = ts.slice(0, i).filter(t => t.clase === "suave").reduce((t, x) => t + x.seg, 0);
      if (antes >= 300) n = `${dur(antes)} suave + ${n}`;
    }
    return [{q: b.nombre, n, ...(nq ? {nq} : {}), familia: fam}];
  }
  /* las filas de un bloque de series: una por ejercicio (una superserie da dos), con series × rango; sin rango, lo que se pide.
     Los kilos van aparte (kg: «6 kg»): la pantalla los dibuja como su propia ficha */
  const cortoV = (tipo, o) => o === "max" ? "máx" : tipo === "segundos" ? `${o} s` : String(o);
  /* números en fila, sin punto entre ellos: si son iguales, «3 × 4»; si no, con aire (un espacio ancho) entre uno y otro */
  const serie = xs => xs.length > 1 && xs.every(x => x === xs[0]) ? `${xs.length} × ${xs[0]}` : xs.join("\u2002");
  function filasSeries(b, ej = {}, par = null){
    const es = [...new Set(b.pasos.map(p => p.ejercicio))];
    return es.map(e => {
      const ps = b.pasos.filter(p => p.ejercicio === e), p = ps[0], n = ps.length;
      let v;
      const veces = x => n > 1 ? `${n} × ${x}` : x, os = [...new Set(ps.map(x => x.objetivo))];
      if (p.tipo === "logrado") v = `${n} ${n === 1 ? "intento" : "intentos"}`;
      else if (p.rango && p.tipo !== "segundos") v = veces(p.rango[0] === p.rango[1] ? String(p.rango[0]) : `${p.rango[0]}–${p.rango[1]}`);
      else if (os.length === 1) v = veces(cortoV(p.tipo, os[0]));
      /* una pirámide larga no entra en una fila: «11 series, de 1 a máx» */
      else v = n > 5 ? `${n} series, de ${cortoV(p.tipo, ps[0].objetivo)} a ${cortoV(p.tipo, ps[n - 1].objetivo)}` : serie(ps.map(x => cortoV(p.tipo, x.objetivo)));
      const kg = p.kg ? `${String(p.kg).replace(".", ",")} kg` : "";
      /* una superserie (o una triserie) se alterna serie a serie: sus filas van juntas, con «par» y cuántos son */
      return {q: ej[e]?.nombre || e, ej: e, n: v, ...(kg ? {kg} : {}), familia: b.familia, ...(p.escalera ? {escalera: p.escalera} : {}), ...(p.nuevo ? {nuevo: p.nuevo} : {}), ...(p.descarga ? {descarga: true} : {}),
        ...(es.length > 1 && par !== null ? {par, de: es.length} : {})};
    });
  }
  /* las filas de una sesión armada; lo que no es de la rutina (una prueba) va como {otro: bloque} y lo dibuja la pantalla */
  const filas = (bs, ej = {}) => bs.flatMap((b, k) => b.prueba || b.hazana || b.constelacion ? [{otro: b}] : b.clase === "tramos" ? filasTramos(b, ej).map(x => b.descarga ? {...x, descarga: true} : x) : b.pasos ? filasSeries(b, ej, k) : [{otro: b}]);
  /* un día de la rutina como lo harías hoy: tus escalones de ahora, con su nombre, los minutos y la nota */
  function dia(r, i, ctx = {}){
    const p = deRutina(r, i, ctx); if (!p) return null;
    /* en la semana de prueba lo de motor también va a la mitad, como lo arma la sesión */
    const bs = ctx.descarga && K.plan?.mitadTramos ? p.bloques.map(b => b.clase === "tramos" ? K.plan.mitadTramos(b) : b) : p.bloques;
    return {nombre: nombreDia(r, i), minutos: ctx.descarga ? minutos(bs) : p.minutos, filas: filas(bs, ctx.ej), nota: p.nota || ""};
  }

  /* ===== Hazañas: pruebas estandarizadas con escala (Modelo B) =====
     Cada una mide un ejercicio («mide»), tiene una escala de cinco umbrales de la magnitud 5 a la 1 («escala»; con «propia»,
     por persona: el % de mejora contra tu primera vez), las estrellas que puede encender y cada cuántos días se repite («cada»).
     Formatos: «maximo» (una serie, todas las que salgan), «reloj» (un tiempo fijo y anotás lo que hiciste), «escalera»
     (cada minuto una más, hasta que no llegás) y «tiempo» (lo que dice, lo más rápido posible). */
  const CADA = 42;
  function deHazana(h, {ej = {}, equipo = null} = {}){
    const base = {familia: h.familia, hazana: h.id, nombre: h.nombre, mide: h.mide};
    let b;
    if (h.formato === "escalera") b = {...base, clase: "circuito", formato: "escalera", items: [{ejercicio: h.mide.ejercicio}], series: 1, minutos: 0, rondas: 0};
    else if (h.formato === "tiempo") b = {...base, clase: "circuito", formato: "tiempo", rondas: 1, items: (h.items || []).map(x => ({...x, ejercicio: elegir(x.ejercicio, ej, equipo)})), series: 1, minutos: 0};
    else b = {...base, ejercicio: h.mide.ejercicio, tipo: h.mide.tipo, objetivo: "max", series: 1, descanso: 120, ...(h.formato === "reloj" ? {reloj: (h.minutos || 12) * 60} : {})};
    const min = h.formato === "reloj" ? (h.minutos || 12) + 5 : h.formato === "maximo" ? 5 : 15;
    return {bloques: [b], minutos: min, hazana: {id: h.id, v: 2}, nombre: h.nombre};
  }
  const mejorDe = h => K.cielo.TIPOS[h.mide.tipo].mejor;
  const supera = (h, a, b) => mejorDe(h) === "menos" ? a < b : a > b;
  /* tus veces en una hazaña: una por sesión (la mejor), en orden. Cuenta la serie con su nombre, aunque la sesión se haya cortado después */
  function veces(h, sesiones = []){
    const r = [];
    for (const s of sesiones){
      const xs = (s.bloques || []).flatMap(b => b.series || []).filter(x => x.hazana === h.id && x.completa !== false && Number.isFinite(x.valor) && x.ejercicio === h.mide.ejercicio && x.tipo === h.mide.tipo);
      if (xs.length) r.push({fecha: s.fecha, valor: xs.reduce((m, x) => supera(h, x.valor, m) ? x.valor : m, xs[0].valor), sesion: s.id});
    }
    return r;
  }
  /* las de antes: cuando las hazañas eran circuitos con tres niveles. Se ven en tu historia; no entran en la escala */
  const anteriores = (h, sesiones = []) => sesiones.filter(s => s.hazana && s.hazana.id === h.id && s.hazana.v !== 2 && Number.isInteger(s.hazana.nivel))
    .map(s => ({fecha: s.fecha, nivel: s.hazana.nivel, valor: s.hazana.valor, completa: s.hazana.completa !== false && !s.cortada, sesion: s.id}));
  /* los cinco umbrales, de la magnitud 5 a la 1. Con escala propia salen de tu primera vez (sin primera vez, no hay escala) */
  function umbrales(h, vs){
    if (Array.isArray(h.escala)) return h.escala;
    const base = vs && vs.length ? vs[0].valor : null; if (!base) return null;
    return h.escala.propia.map(p => Math.round(base * (1 + p / 100) * 10) / 10);
  }
  /* la magnitud de una marca: 5 (la primera de la escala) a 1; null si no llega a la primera */
  function magnitud(h, v, vs){
    const u = umbrales(h, vs); if (!u || !Number.isFinite(v)) return null;
    let m = null; u.forEach((x, k) => { if (mejorDe(h) === "menos" ? v <= x : v >= x) m = 5 - k; });
    return m;
  }
  /* cuándo toca: días desde la última y cuántos faltan (0 o menos: toca ya). Nunca hecha: toca ya */
  function cuando(h, sesiones, hoy){
    const vs = veces(h, sesiones), u = vs[vs.length - 1], cada = h.cada || CADA;
    if (!u) return {dias: null, falta: -1e6, cada};
    const d = K.cielo.dia(hoy) - K.cielo.dia(u.fecha);
    return {dias: d, falta: cada - d, cada};
  }
  /* la próxima prueba: la que toca antes de las que podés hacer con tu equipo */
  function proximaPrueba(hs, sesiones, hoy, {ej = {}, equipo = null} = {}){
    const puede = h => !equipo || [h.mide.ejercicio, ...(h.items || []).map(x => x.ejercicio)].every(e => (ej[e]?.equipo || []).every(q => equipo.includes(q)));
    const xs = hs.filter(puede); if (!xs.length) return null;
    return xs.reduce((a, h) => cuando(h, sesiones, hoy).falta < cuando(a, sesiones, hoy).falta ? h : a, xs[0]);
  }
  /* las hazañas que van en la semana de prueba de una rutina: las que encienden sus estrellas o miden un escalón de sus escaleras */
  function hazanasDe(r, hs, {ej = {}, equipo = null} = {}){
    const cons = new Set(r.alimenta.map(id => id.split(".")[0]));
    const ejs = new Set(escalerasDe(r, {ej, equipo}).flatMap(x => x.pasos.map(p => p.ejercicio)));
    return hs.filter(h => (h.estrellas || []).some(e => cons.has(e.split(".")[0])) || ejs.has(h.mide.ejercicio));
  }
  /* cómo se contaba una hazaña de antes: el tiempo baja, las rondas suben, lo demás se completaba */
  const mejorEs = h => { const f = h.antes ? h.antes.formato : h.formato; return f === "amrap" ? "mas" : f === "tiempo" || f === "chipper" ? "menos" : "hecha"; };

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
    const i = sesiones.filter(s => s.rutina && s.rutina.id === r.id && (!desde || s.fecha >= desde) && (!s.cortada || s.rutina.mitad !== false)).length;
    const dias = r.dias || 1;
    return {i, total: r.sesiones.length, terminada: i >= r.sesiones.length, semana: Math.floor(i / dias) + 1, dia: i % dias + 1};
  }

  /* tus días: 0 es lunes. Sin elegir, todos los días se entrena */
  const diaSemana = f => { const [a, m, d] = String(f).split("-").map(Number); return (new Date(a, m - 1, d).getDay() + 6) % 7; };
  const toca = (dias, f) => !dias || !dias.length || dias.includes(diaSemana(f));
  /* el próximo día de entrenamiento después de hoy, como número de días que faltan (1 = mañana) */
  const faltan = (dias, f) => { if (!dias || !dias.length) return 1; const h = diaSemana(f); for (let k = 1; k <= 7; k++) if (dias.includes((h + k) % 7)) return k; return 1; };

  return {NIVELES, SENS, duracion, minutos, nombreDia, serie, semanas, tipoSemana, esSemanaDePrueba, esMeta, metaDe, nombreTramos, filasTramos, filasSeries, filas, dia, desplegar, elegir, sePuede, falta, objetivos, deRutina, deHazana, mejorEs, medir, enCurso, diaSemana, toca, faltan, vezPasada, deSiempre,
    escalera, escaleras, elegirEscalera, defEscalera, defSuelto, escalon, idsPaso, variante, armarBloques, escalonDe, escalonesTodos, metas, arranque, inferir, sensDe, escalerasDe, cambios,
    veces, anteriores, umbrales, magnitud, cuando, proximaPrueba, hazanasDe, supera, CADA};
})();
