/* ===== Respaldo: todo tu diario en un archivo, y de vuelta. Funciones puras; la pantalla está en Vos. =====
   El archivo es JSON: {app: "kozmos", formato: 2, version, exportado, catalogo, mediciones, sesiones, perfil}.
   Formato 2 (Modelo B): las hazañas son pruebas (hazana.v = 2, sin nivel), las series de una prueba dicen de qué hazaña son,
   lo que se mide en cm puede ser negativo y la sesión de una semana de prueba lo dice (semanaPrueba). Lee también el 1.
   Traer un respaldo suma lo que falta y no borra nada: lo que ya está (mismo id) no se toca, así que traer el mismo
   archivo dos veces no duplica. Del perfil entra solo lo que este teléfono todavía no tiene.
   Primero se revisa el archivo entero y recién después se guarda todo junto. Detalle en docs/kozmos-respaldo.md. */
K.respaldo = (() => {
  const APP = "kozmos", FORMATO = 2;
  const armar = (diario, version, catalogo, ahora = new Date()) => ({app: APP, formato: FORMATO, version, exportado: ahora.toISOString(), catalogo,
    mediciones: diario.mediciones, sesiones: diario.sesiones, perfil: diario.perfil});
  const nombre = hoy => `kozmos-respaldo_${hoy}.json`;

  /* qué se acepta: lo que no pasa se descarta y se cuenta */
  const obj = v => !!v && typeof v === "object" && !Array.isArray(v);
  const txt = (v, max = 120) => typeof v === "string" && v.length > 0 && v.length <= max;
  const fecha = f => typeof f === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f) && (() => { const [a, m, d] = f.split("-").map(Number), x = new Date(Date.UTC(a, m - 1, d)); return x.getUTCMonth() === m - 1 && x.getUTCDate() === d; })();
  const num = (v, max) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
  const tipo = t => t === undefined || Object.prototype.hasOwnProperty.call(K.cielo.TIPOS, t);
  /* lo que anotan los tramos y las hazañas no enciende estrellas, pero es parte de la sesión */
  const tipoSerie = t => tipo(t) || t === "tramos" || t === "hazana";
  const medicion = m => obj(m) && txt(m.id, 80) && txt(m.estrella) && fecha(m.fecha) && valor(m.valor, m.tipo) && tipo(m.tipo)
    && (m.ejercicio === undefined || txt(m.ejercicio)) && (m.origen === undefined || txt(m.origen, 20));
  /* los centímetros de una prueba pueden ser negativos: no llegaste a la punta de los pies */
  const valor = (v, t) => t === "cm" ? typeof v === "number" && Number.isFinite(v) && v >= -100 && v <= 300 : num(v, 1e6);
  const serie = x => obj(x) && (txt(x.ejercicio) || (x.tipo === "tramos" && x.ejercicio == null)) && tipoSerie(x.tipo) && x.tipo !== undefined && valor(x.valor, x.tipo)
    && (x.hazana === undefined || txt(x.hazana)) && (x.kg === undefined || num(x.kg, 200));
  /* una hazaña de antes (con su nivel) o una prueba (v 2), con lo que midió */
  const hazana = h => obj(h) && txt(h.id) && (h.v === 2 ? (h.ejercicio === undefined || txt(h.ejercicio)) && (h.tipo === undefined || tipo(h.tipo)) && valor(h.valor, h.tipo) : entero(h.nivel, 2) && num(h.valor, 1e6));
  const entero = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
  const sesion = x => obj(x) && txt(x.id, 80) && fecha(x.fecha) && num(x.duracion, 864000) && Array.isArray(x.bloques)
    && x.bloques.every(b => obj(b) && (b.constelacion === undefined || txt(b.constelacion)) && (b.constelaciones === undefined || Array.isArray(b.constelaciones) && b.constelaciones.length <= 64 && b.constelaciones.every(c => txt(c)))
      && (b.molde === undefined || txt(b.molde, 20)) && Array.isArray(b.series) && b.series.every(serie))
    && (x.rutina === undefined || obj(x.rutina) && txt(x.rutina.id) && entero(x.rutina.sesion, 1000))
    && (x.hazana === undefined || hazana(x.hazana))
    && (x.semanaPrueba === undefined || obj(x.semanaPrueba) && entero(x.semanaPrueba.bloque, 1000));
  const PERFIL = {
    peso: v => num(v, 400) && v >= 20,
    /* sin tope de metas (motor B): hasta todas las constelaciones del catálogo */
    rumbo: v => Array.isArray(v) && v.length <= ((K.CATALOGO && K.CATALOGO.constelaciones.length) || 64) && new Set(v).size === v.length && v.every(x => txt(x)),
    equipo: v => Array.isArray(v) && v.every(x => txt(x, 40)),
    rutina: v => obj(v) && txt(v.id) && fecha(v.desde),
    /* los minutos de cada día: uno de los de Tu tiempo */
    minutos: v => Number.isInteger(v) && v >= 10 && v <= 120,
    dias: v => Array.isArray(v) && v.length <= 7 && v.every(d => entero(d, 6)) && new Set(v).size === v.length,
    /* tu nivel: solo respuestas que existen (K.nivel.PREGUNTAS, o las cuatro preguntas de antes) y la fecha en que las diste */
    nivel: v => obj(v) && Object.keys(v).length > 0 && Object.entries(v).every(([k, x]) => k === "fecha" ? fecha(x) : !!K.nivel && K.nivel.valida(k, x))
  };

  /* leer(texto) → {mediciones, sesiones, perfil, descartadas} o {error} con el motivo dicho para la persona */
  function leer(texto){
    let o;
    try { o = JSON.parse(texto); } catch (e) { return {error: "Ese archivo no es un respaldo de Kozmos."}; }
    if (!obj(o) || o.app !== APP || !Array.isArray(o.mediciones) || !Array.isArray(o.sesiones)) return {error: "Ese archivo no es un respaldo de Kozmos."};
    if (typeof o.formato !== "number" || o.formato > FORMATO) return {error: "Ese respaldo es de una versión más nueva. Actualizá Kozmos y probá de nuevo."};
    let descartadas = 0;
    const filtrar = (xs, ok) => { const vistos = new Set(); return xs.filter(x => { if (!ok(x)){ descartadas++; return false; } if (vistos.has(x.id)) return false; vistos.add(x.id); return true; }); };
    const mediciones = filtrar(o.mediciones, medicion), sesiones = filtrar(o.sesiones, sesion);
    const perfil = obj(o.perfil) ? Object.fromEntries(Object.entries(o.perfil).filter(([k, v]) => PERFIL[k] && PERFIL[k](v))) : {};
    return {mediciones, sesiones, perfil, descartadas};
  }
  /* sumar(diario, leido) → lo que hay que escribir y cómo deshacerlo */
  function sumar(diario, r){
    const hayM = new Set(diario.mediciones.map(x => x.id)), hayS = new Set(diario.sesiones.map(x => x.id));
    const mediciones = r.mediciones.filter(x => !hayM.has(x.id)), sesiones = r.sesiones.filter(x => !hayS.has(x.id));
    const perfil = Object.fromEntries(Object.entries(r.perfil).filter(([k]) => diario.perfil[k] === undefined));
    return {
      cambios: {poner: {mediciones, sesiones}, perfil},
      deshacer: {sacar: {mediciones: mediciones.map(x => x.id), sesiones: sesiones.map(x => x.id)}, perfil: Object.fromEntries(Object.keys(perfil).map(k => [k, undefined]))},
      cuenta: {mediciones: mediciones.length, sesiones: sesiones.length, perfil: Object.keys(perfil).length, descartadas: r.descartadas}
    };
  }
  return {armar, nombre, leer, sumar, FORMATO};
})();
