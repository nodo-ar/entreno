/* ===== Respaldo: todo tu diario en un archivo, y de vuelta. Funciones puras; la pantalla está en Vos. =====
   El archivo es JSON: {app: "kozmos", formato: 1, version, exportado, catalogo, mediciones, sesiones, perfil}.
   Traer un respaldo suma lo que falta y no borra nada: lo que ya está (mismo id) no se toca, así que traer el mismo
   archivo dos veces no duplica. Del perfil entra solo lo que este teléfono todavía no tiene.
   Primero se revisa el archivo entero y recién después se guarda todo junto. Detalle en docs/kozmos-respaldo.md. */
K.respaldo = (() => {
  const APP = "kozmos", FORMATO = 1;
  const armar = (diario, version, catalogo, ahora = new Date()) => ({app: APP, formato: FORMATO, version, exportado: ahora.toISOString(), catalogo,
    mediciones: diario.mediciones, sesiones: diario.sesiones, perfil: diario.perfil});
  const nombre = hoy => `kozmos-respaldo_${hoy}.json`;

  /* qué se acepta: lo que no pasa se descarta y se cuenta */
  const obj = v => !!v && typeof v === "object" && !Array.isArray(v);
  const txt = (v, max = 120) => typeof v === "string" && v.length > 0 && v.length <= max;
  const fecha = f => typeof f === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f) && (() => { const [a, m, d] = f.split("-").map(Number), x = new Date(Date.UTC(a, m - 1, d)); return x.getUTCMonth() === m - 1 && x.getUTCDate() === d; })();
  const num = (v, max) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
  const tipo = t => t === undefined || Object.prototype.hasOwnProperty.call(K.cielo.TIPOS, t);
  const medicion = m => obj(m) && txt(m.id, 80) && txt(m.estrella) && fecha(m.fecha) && num(m.valor, 1e6) && tipo(m.tipo)
    && (m.ejercicio === undefined || txt(m.ejercicio)) && (m.origen === undefined || txt(m.origen, 20));
  const serie = x => obj(x) && txt(x.ejercicio) && tipo(x.tipo) && x.tipo !== undefined && num(x.valor, 1e6);
  const sesion = x => obj(x) && txt(x.id, 80) && fecha(x.fecha) && num(x.duracion, 864000) && Array.isArray(x.bloques)
    && x.bloques.every(b => obj(b) && txt(b.constelacion) && Array.isArray(b.series) && b.series.every(serie));
  const PERFIL = {
    peso: v => num(v, 400) && v >= 20,
    rumbo: v => Array.isArray(v) && v.length <= 3 && v.every(x => txt(x)),
    equipo: v => Array.isArray(v) && v.every(x => txt(x, 40))
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
