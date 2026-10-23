/* ===== Tu nivel: cuatro preguntas para no arrancar de cero (funciones puras) =====
   perfil.nivel = {dominadas, flexiones, unaPierna, vertical, fecha}. Cada respuesta es una de las opciones de abajo;
   «nose» (No sé) y la que falta valen lo mismo: arrancás desde el principio.
   · desde(nivel, equipo): el escalón de arranque de cada escalera ({tirar: "dominada"}). Lo que hiciste manda sobre esto.
   · dadas(nivel, equipo): las estrellas que tu nivel da por hechas. No se encienden ni escriben marcas: solo corren la próxima.
   · efectiva(c, dadas, {fecha}): la constelación con las dadas a la vista (estado «dada») y la próxima que sigue.
     Un intento real a esa estrella que no llega (anotado o en una sesión, desde que dijiste tu nivel) le saca lo de dada.
   · arrancasEn(c, {escalones, ej}): dónde arranca esa meta hoy: el escalón del camino o la estrella.
   Conservador a propósito (D1): ante la duda, un escalón más abajo. Detalle en docs/kozmos-rutinas.md («Tu nivel»). */
K.nivel = (() => {
  const PREGUNTAS = [
    {id: "dominadas", nombre: "Dominadas seguidas", pide: "barra", opciones: [["0", "Ninguna"], ["1-4", "De 1 a 4"], ["5-9", "De 5 a 9"], ["10-14", "De 10 a 14"], ["15+", "15 o más"], ["nose", "No sé"]]},
    {id: "flexiones", nombre: "Flexiones seguidas", opciones: [["0-9", "Menos de 10"], ["10-19", "De 10 a 19"], ["20-29", "De 20 a 29"], ["30-39", "De 30 a 39"], ["40+", "40 o más"], ["nose", "No sé"]]},
    {id: "unaPierna", nombre: "Sentadilla a una pierna", opciones: [["no", "Todavía no"], ["silla", "Hasta una silla"], ["completa", "Completa, hasta abajo"], ["nose", "No sé"]]},
    {id: "vertical", nombre: "Parada de manos", pide: "pared", opciones: [["no", "Todavía no"], ["pared", "Contra la pared"], ["libre", "Libre"], ["nose", "No sé"]]}
  ];
  /* las preguntas que valen con tu equipo: sin barra no se pregunta por dominadas; sin decir tu equipo, todas */
  const preguntas = equipo => PREGUNTAS.filter(q => !q.pide || !equipo || equipo.includes(q.pide));
  const valida = (id, v) => PREGUNTAS.some(q => q.id === id && q.opciones.some(o => o[0] === v));
  /* lo que dijiste en una pregunta que vale con tu equipo; si no, nada */
  const de = (nivel, id, equipo) => nivel && preguntas(equipo).some(q => q.id === id) && valida(id, nivel[id]) && nivel[id] !== "nose" ? nivel[id] : null;

  /* el escalón de arranque por escalera (ids de K.ESCALERAS). Si tu equipo no permite ese escalón, la escalera usa el
     de abajo que sí (K.rutina.defEscalera): el fondo sin paralelas es el fondo en banco */
  const DESDE = {
    dominadas: {"0": {tirar: "dominada-negativa", remo: "remo-poste"}, "1-4": {tirar: "dominada", remo: "remo-invertido"}, "5-9": {tirar: "dominada", remo: "remo-invertido"},
      "10-14": {tirar: "dominada-explosiva", remo: "remo-invertido"}, "15+": {tirar: "dominada-arquera", remo: "remo-invertido"}},
    flexiones: {"0-9": {empujar: "flexion-inclinada", fondos: "flexion-cerrada", lsit: "plancha"}, "10-19": {empujar: "flexion", fondos: "fondo-banco", lsit: "plancha"},
      "20-29": {empujar: "flexion-pausa", fondos: "fondo-banco", lsit: "hollow"}, "30-39": {empujar: "flexion-declinada", fondos: "fondo", lsit: "l-sit"},
      "40+": {empujar: "flexion-arquera", fondos: "fondo", lsit: "l-sit"}},
    unaPierna: {no: {piernas: "sentadilla", isquios: "puente-gluteo"}, silla: {piernas: "pistol-silla", isquios: "peso-muerto-una-pierna"}, completa: {piernas: "pistol", isquios: "curl-femoral-deslizante"}}
  };
  /* las estrellas dadas por hechas: cada respuesta suma las suyas a las de la de abajo */
  const DADAS = {
    dominadas: {"5-9": ["front-lever.colgado-60s"], "10-14": ["muscle-up.dominadas-10", "front-lever.bolita-10s"], "15+": ["un-brazo.dominadas-15"]},
    flexiones: {"30-39": ["planche.flexiones-30"], "40+": ["un-brazo.flexiones-40"]},
    unaPierna: {silla: ["una-pierna.pistol-silla-5"], completa: ["una-pierna.pistol-3"]},
    vertical: {pared: ["parada-de-manos.munecas-15s", "parada-de-manos.cuervo-10s", "parada-de-manos.pared-30s"], libre: ["parada-de-manos.pared-60s"]}
  };

  function desde(nivel, equipo = null){
    const r = {};
    for (const id of Object.keys(DESDE)){ const v = de(nivel, id, equipo); if (v && DESDE[id][v]) Object.assign(r, DESDE[id][v]); }
    return r;
  }
  function dadas(nivel, equipo = null){
    const r = [];
    for (const q of PREGUNTAS){
      const v = de(nivel, q.id, equipo); if (!v) continue;
      const orden = q.opciones.map(o => o[0]), hasta = orden.indexOf(v);
      for (const o of orden.slice(0, hasta + 1)) for (const e of DADAS[q.id]?.[o] || []) if (!r.includes(e)) r.push(e);
    }
    return r;
  }

  /* un intento real que no llegó: una marca de esa misma estrella (anotada, o de una serie que la probaba) desde que dijiste tu nivel */
  const fallida = (e, marcas, fecha) => (marcas || []).some(m => m.estrella === e.id && (!fecha || m.fecha >= fecha) && Number.isFinite(m.valor) && !K.cielo.llega(e.prueba, m.valor));
  /* efectiva(c, dadas, {fecha}) → la constelación con «dada» en las estrellas que tu nivel da por hechas (sin encender)
     y la próxima de verdad: la primera sin encender ni dar, con lo que pide encendido o dado */
  function efectiva(c, dadasIds, {fecha} = {}){
    if (!dadasIds || !dadasIds.length) return c;
    const ids = new Set(dadasIds), lit = new Set(c.estrellas.filter(e => e.encendida).map(e => e.id));
    const es = c.estrellas.map(e => ({...e, dada: !e.encendida && !e.sinEquipo && ids.has(e.id) && !fallida(e, c.marcas, fecha)}));
    if (!es.some(e => e.dada)) return c;
    const listo = new Set([...lit, ...es.filter(e => e.dada).map(e => e.id)]);
    let proxima = null;
    for (const e of es){
      e.estado = e.encendida ? "encendida" : e.dada ? "dada" : e.sinEquipo ? "sin-equipo" : "por-delante";
      if (!proxima && e.estado === "por-delante" && e.requiere.every(r => listo.has(r))){ e.estado = "proxima"; proxima = e; }
    }
    const pide = proxima || c.completa ? [] : [...new Set(es.flatMap(e => e.encendida || e.dada ? [] : e.falta))];
    return {...c, estrellas: es, proxima, avance: proxima ? K.cielo.avance(proxima.prueba, proxima.mejor) : 1, pide, dadas: es.filter(e => e.dada).length};
  }
  /* el cosmos entero con tus dadas: lo encendido y los totales no cambian */
  const aplicar = (cielo, dadasIds, o) => !dadasIds || !dadasIds.length ? cielo : {...cielo, constelaciones: cielo.constelaciones.map(c => efectiva(c, dadasIds, o))};
  /* las dadas que siguen en pie (un intento que no llegó las saca) y no están encendidas */
  const activas = (cielo, dadasIds, o) => aplicar(cielo, dadasIds, o).constelaciones.flatMap(c => c.estrellas.filter(e => e.dada).map(e => e.id));

  /* arrancasEn(c, {escalones, ej}) → {texto, ejercicio, camino} o null: si estás abajo en la escalera que lleva a la próxima,
     el escalón donde arrancás; si no, la próxima estrella */
  function arrancasEn(c, {escalones = {}, ej = {}} = {}){
    if (!c || !c.proxima) return null;
    const cam = K.caminos.caminoDe(c.proxima, {escalones});
    if (cam.camino){ const e = escalones[cam.escalera].paso.ejercicio; return {texto: `Arrancás en ${ej[e]?.nombre || e}`, ejercicio: e, camino: true}; }
    return {texto: `Arrancás en ${c.proxima.nombre}`, estrella: c.proxima.id, camino: false};
  }

  /* lo que se guarda: solo respuestas que existen, con la fecha de hoy */
  const poner = (nivel = {}, id, v, hoy) => valida(id, v) ? {...Object.fromEntries(Object.entries(nivel || {}).filter(([k, x]) => valida(k, x))), [id]: v, fecha: hoy} : nivel;
  const respondidas = nivel => PREGUNTAS.filter(q => nivel && valida(q.id, nivel[q.id])).length;

  return {PREGUNTAS, preguntas, valida, desde, dadas, efectiva, aplicar, activas, arrancasEn, poner, respondidas};
})();
