/* ===== Calorías: funciones puras. Solo por sesión y siempre aproximadas: sin pulsómetro no se puede medir mejor. =====
   Cuenta MET × kilos × horas. Los MET salen del Compendio de Actividades Físicas (ver Acerca, Fuentes).
   El tiempo de lo que se mide en minutos (bici, trote) se sabe; el resto de la sesión se reparte entre fuerza y rango
   según cuántas series tuvo cada uno. Sin tu peso no hay cuenta. */
K.calorias = (() => {
  /* MET por familia, y por ejercicio cuando el ejercicio dice algo más preciso */
  const FAMILIA = {fu: 3.8, ra: 2.3, mo: 7.0};      /* calistenia moderada · elongación suave · bici fija, general */
  const EJERCICIO = {bici: 7.0, intervalos: 8.8, trote: 7.0, "10km": 9.8, soga: 11.8, "double-under": 11.8, "criss-cross": 11.8};
  const SALTOS_POR_MIN = 110, INTERVALOS_MIN = 28;
  const met = b => EJERCICIO[b.series?.[0]?.ejercicio] ?? FAMILIA[b.familia] ?? 3.5;
  /* los segundos que se saben de un bloque, o null si se reparten con el resto */
  const sabido = b => {
    const ss = b.series || [];
    const t = ss[0]?.tipo, e = ss[0]?.ejercicio;
    if (ss.some(x => Number.isFinite(x.seg))) return ss.reduce((s, x) => s + (x.seg || 0), 0); /* tramos: los segundos hechos */
    if (t === "minutos" || t === "menos-minutos") return ss.reduce((a, x) => a + x.valor * 60, 0);
    if (t === "sesiones") return ss.filter(x => x.valor > 0).length * INTERVALOS_MIN * 60;
    if (t === "repeticiones" && EJERCICIO[e] === 11.8) return ss.reduce((a, x) => a + x.valor / SALTOS_POR_MIN * 60, 0);
    return null;
  };
  /* sesion: lo guardado en el diario; peso en kilos → kcal redondeadas a 10, o null.
     Manda el peso que tenías ese día (queda guardado con la sesión); si no está, el de hoy. Menos de 30 no se muestra. */
  function deSesion(x, peso){
    if (x && x.pesoKg) peso = x.pesoKg;
    if (!(peso >= 20 && peso <= 400) || !x || !(x.duracion > 0)) return null;
    const bs = (x.bloques || []).filter(b => (b.series || []).length);
    if (!bs.length) return null;
    let resto = x.duracion, kcal = 0;
    const libres = [];
    for (const b of bs){
      const s = sabido(b);
      if (s === null){ libres.push(b); continue; }
      const t = Math.min(s, Math.max(0, resto)); resto -= t; kcal += met(b) * peso * t / 3600;
    }
    /* lo que queda de la sesión (series por tiempo o repeticiones y los descansos) va a fuerza y rango por partes */
    const n = libres.reduce((a, b) => a + b.series.length, 0);
    if (n && resto > 0) for (const b of libres) kcal += met(b) * peso * (resto * b.series.length / n) / 3600;
    const r = Math.round(kcal / 10) * 10;
    return r >= 30 ? r : null;
  }
  return {deSesion};
})();
