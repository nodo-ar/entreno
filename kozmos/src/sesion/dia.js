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

  const dur = b => b.pasos || b.clase ? K.rutina.duracion(b) : K.plan.duracion(b);
  const minutosDe = bs => Math.max(5, Math.round((bs.reduce((t, b) => t + dur(b), 0) + Math.max(0, bs.length - 1) * ENTRE) / 300) * 5);

  /* armar(cielo, rumbo, sesiones, hoy, ctx) → {bloques, minutos, volviste, ventana, rotacion, pide, pie, molde: true}
     ctx: {ej, equipo, marcas, nivelDesde (el escalón de arranque de cada escalera), dadas (estrellas que tu nivel da por hechas),
     descarga (la semana de prueba: las escaleras a la mitad), dias (tus días por semana)} */
  function armar(cielo, rumbo = [], sesiones = [], hoy, {ej = {}, equipo = null, marcas = [], nivelDesde, dadas, descarga = false} = {}){
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
    const fuerza = [];
    for (let k = 0; k < lugares.length; k += 2){
      const ids = [];
      /* si lo de arriba que tocaba no tiene escalera libre con tu equipo, el otro de arriba */
      for (const pat of lugares.slice(k, k + 2)){ const otro = {tirar: "empujar", empujar: "tirar"}[pat], id = elegir(pat) || (otro && elegir(otro)); if (id){ ids.push(id); usadasEsc.add(id); usadosEj.add(escalones[id].paso.ejercicio); } }
      if (!ids.length) continue;
      const grupo = ids.length > 1 ? "AB"[k / 2] : null;
      const cbs = ids.map((id, i) => ({escalera: id, series: SERIES, rango: RANGO, desde: nivelDesde?.[id], ...(grupo ? {grupo} : {}), descanso: grupo && i === 0 ? 0 : ENTRE}));
      const b = K.rutina.armarBloques("fu", cbs, {ej, equipo, sesiones, marcas, descarga: descarga || volviste})[0];
      fuerza.push({...b, molde: "fuerza"});
    }

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
    if (!cierre && equipo && equipo.includes("bici") && !usadosEj.has("bici"))
      cierre = {clase: "tramos", familia: "mo", nombre: ej.bici?.nombre || "Bici", molde: "cierre", tramos: [{clase: "suave", seg: 300, ejercicio: "bici", nota: "Suave, que puedas hablar"}], series: 1};
    if (!cierre){
      const pats = [...hab, ...fuerza, ...(abdomen ? [abdomen] : [])].flatMap(b => patronesDe(b, ej));
      const xs = [];
      for (const e of [...pats.map(p => POSTURA[p]), ...POSTURAS]) if (e && !xs.includes(e) && !usadosEj.has(e) && xs.length < 3) xs.push(e);
      cierre = {clase: "tramos", familia: "ra", nombre: "Posturas", molde: "cierre", tramos: xs.map(e => ({clase: "postura", seg: 40, ejercicio: e})), series: xs.length};
    }
    usar(cierre);

    /* 5 · la entrada en calor adelante, según lo que pide el día y tu equipo */
    let cuerpo = [...hab, ...fuerza, ...(abdomen ? [abdomen] : []), cierre];
    const entrada = {...K.caminos.entrada(cuerpo, {equipo, ej}), molde: "entrada"};
    let bloques = [entrada, ...cuerpo];
    /* de 40 a 55 minutos: si pasa de 60, el abdomen queda para otro día; si igual pasa, la fuerza va con 2 series */
    if (abdomen && minutosDe(bloques) > TOPE) bloques = bloques.filter(b => b !== abdomen);
    if (minutosDe(bloques) > TOPE) bloques = bloques.map(b => b.molde === "fuerza" ? {...b, pasos: b.pasos.slice(0, 4).map(x => ({...x, n: 2})), series: 4} : b);

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

  return {armar, rotar, frecuencia, diasSemana, ventana, deSemanaDePrueba, conDadas, tocadas, minutosDe, patronesDe, ejerciciosDe, escaleraDe, ESCALERAS, POSTURA};
})();
