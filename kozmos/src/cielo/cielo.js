/* ===== Cielo: funciones puras. Entra el catálogo, las mediciones y las sesiones; sale el cielo. Nada de esto se guarda. =====
   Una estrella se enciende con una medición que llega a su umbral y queda encendida para siempre.
   Las mediciones cuentan por ejercicio: 25 s de tuck anotados en «Tuck 20 s» también encienden «Tuck 10 s». */
K.cielo = (() => {
  const DIA = 864e5;
  const TIPOS = {
    segundos:       {mejor: "mas",   corto: v => `${v} s`},
    repeticiones:   {mejor: "mas",   corto: v => `×${v}`},
    minutos:        {mejor: "mas",   corto: v => `${v} min`},
    "menos-minutos":{mejor: "menos", corto: v => `${v} min`},
    porcentaje:     {mejor: "mas",   corto: v => `+${v} %`},
    sesiones:       {mejor: "mas",   corto: v => `${v} ${v === 1 ? "sesión" : "sesiones"}`},
    logrado:        {mejor: "mas",   corto: () => "Logrado"}
  };
  /* «2026-10-20» → días desde 1970, sin husos horarios de por medio */
  const dia = f => { const [a, m, d] = String(f).split("-").map(Number); return Date.UTC(a, m - 1, d) / DIA; };
  const llega = (p, v) => TIPOS[p.tipo].mejor === "menos" ? v <= p.umbral : v >= p.umbral;
  const mejorDe = (p, vs) => vs.length ? (TIPOS[p.tipo].mejor === "menos" ? Math.min(...vs) : Math.max(...vs)) : null;

  /* las series de una sesión cuentan como marcas: la mejor de cada ejercicio en cada sesión, con su día */
  function deSesiones(sesiones){
    const r = [];
    for (const s of sesiones || []){
      const mejor = {};
      for (const b of s.bloques || []) for (const x of b.series || []){
        if (!x || !TIPOS[x.tipo] || !Number.isFinite(x.valor)) continue;
        const k = x.ejercicio + "|" + x.tipo, a = mejor[k];
        const gana = !a || (TIPOS[x.tipo].mejor === "menos" ? x.valor < a.valor : x.valor > a.valor);
        if (gana) mejor[k] = {id: s.id + ":" + k, estrella: x.estrella, ejercicio: x.ejercicio, tipo: x.tipo, valor: x.valor, fecha: s.fecha, origen: "serie", sesion: s.id};
      }
      r.push(...Object.values(mejor));
    }
    return r;
  }
  /* «sesiones»: lo anotado a mano es un total; cada sesión hecha después suma una */
  function efectivas(p, ms){
    if (p.tipo !== "sesiones") return ms.map(m => ({valor: m.valor, fecha: m.fecha}));
    let total = 0; const r = [];
    for (const m of [...ms].sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.origen === "serie") - (b.origen === "serie"))){
      total = m.origen === "serie" ? total + (m.valor > 0 ? 1 : 0) : Math.max(total, m.valor);
      r.push({valor: total, fecha: m.fecha});
    }
    return r;
  }

  function calcular(cat, mediciones, hoy, sesiones = []){
    const h = dia(hoy);
    mediciones = [...mediciones, ...deSesiones(sesiones)];
    /* qué ejercicio mide cada estrella, para juntar las marcas por ejercicio y tipo */
    const deEstrella = {};
    const deEj = {};
    for (const c of cat.constelaciones) for (const e of c.estrellas){ deEstrella[e.id] = {c: c.id, p: e.prueba}; deEj[e.prueba.ejercicio + "|" + e.prueba.tipo] ??= {c: c.id, p: e.prueba}; }
    const porEj = {}, porCons = {};
    for (const m of mediciones){
      /* una estrella retirada no borra la marca: cuenta por lo que midió; un dato roto no rompe el cielo */
      const d = deEstrella[m.estrella] || (m.ejercicio && deEj[m.ejercicio + "|" + m.tipo]); if (!d || !Number.isFinite(m.valor)) continue;
      /* manda lo que la marca dice que midió; el catálogo solo completa marcas viejas que no lo guardaron */
      const k = (m.ejercicio || d.p.ejercicio) + "|" + (m.tipo || d.p.tipo);
      (porEj[k] = porEj[k] || []).push(m);
      (porCons[d.c] = porCons[d.c] || []).push(m);
    }
    let encendidasTotal = 0, total = 0;
    const constelaciones = cat.constelaciones.map(c => {
      const ms = porCons[c.id] || [];
      const ultima = ms.length ? ms.reduce((a, m) => m.fecha > a ? m.fecha : a, ms[0].fecha) : null;
      const sin = ultima === null ? null : h - dia(ultima);
      /* brillo: días con práctica en las últimas 6 semanas, hasta 6 */
      const dias = new Set(ms.filter(m => h - dia(m.fecha) < 42 && h >= dia(m.fecha)).map(m => m.fecha));
      const brillo = Math.min(1, dias.size / 6);
      const atenuada = sin !== null && sin > 56, volverAProbar = sin !== null && sin > 112;
      const estrellas = c.estrellas.map(e => {
        const ms2 = efectivas(e.prueba, porEj[e.prueba.ejercicio + "|" + e.prueba.tipo] || []);
        const mejor = mejorDe(e.prueba, ms2.map(m => m.valor));
        const enc = ms2.filter(m => llega(e.prueba, m.valor)).map(m => m.fecha).sort()[0] || null;
        return {...e, mejor, encendida: !!enc, desde: enc};
      });
      const lit = new Set(estrellas.filter(e => e.encendida).map(e => e.id));
      let proxima = null;
      for (const e of estrellas){
        e.estado = e.encendida ? "encendida" : "por-delante";
        if (!proxima && !e.encendida && e.requiere.every(r => lit.has(r))){ e.estado = "proxima"; proxima = e; }
      }
      const encendidas = lit.size;
      encendidasTotal += encendidas; total += estrellas.length;
      return {id: c.id, nombre: c.nombre, familia: c.familia, meta: c.meta, estrellas, encendidas, total: estrellas.length,
        proxima, avance: proxima ? avance(proxima.prueba, proxima.mejor) : 1, completa: encendidas === estrellas.length,
        ultima, brillo, atenuada, volverAProbar, marcas: ms};
    });
    return {constelaciones, encendidas: encendidasTotal, total};
  }
  /* cuánto falta para la próxima: 7 s de 10 s es 0,7 */
  function avance(p, mejor){
    if (mejor === null || mejor === undefined || p.tipo === "logrado") return 0;
    const a = TIPOS[p.tipo].mejor === "menos" ? (mejor > 0 ? p.umbral / mejor : 0) : mejor / p.umbral;
    return Math.max(0, Math.min(1, a));
  }
  const corto = (p, v) => TIPOS[p.tipo].corto(v);
  /* una medición nueva, ¿enciende alguna estrella que antes no estaba? Devuelve las nuevas. */
  function nuevas(cat, antes, despues, hoy, sesAntes = [], sesDespues = sesAntes){
    const a = new Set(), r = [];
    for (const c of calcular(cat, antes, hoy, sesAntes).constelaciones) for (const e of c.estrellas) if (e.encendida) a.add(e.id);
    for (const c of calcular(cat, despues, hoy, sesDespues).constelaciones) for (const e of c.estrellas) if (e.encendida && !a.has(e.id)) r.push({constelacion: c, estrella: e});
    return r;
  }
  return {TIPOS, calcular, avance, corto, llega, nuevas, dia};
})();
