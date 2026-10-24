/* ===== Tu nivel: cinco movimientos, cuatro niveles (funciones puras) =====
   perfil.nivel = {empujar, tirar, piernas, cadera, abdomen, fecha}. Cada movimiento es "0" Inicial, "1" Intermedio,
   "2" Avanzado, "3" Experto o «nose» (No sé). «No sé» y el que falta valen lo mismo: arrancás desde el principio.
   Cada nivel es un ejercicio que se ve (la figura): el que te sale con las repeticiones de la pregunta.
   · desde(nivel, equipo): el escalón de arranque de cada escalera ({tirar: "dominada"}). Lo que hiciste manda sobre esto.
   · dadas(nivel, equipo): las estrellas que tu nivel da por hechas. No se encienden ni escriben marcas: solo corren la próxima.
   · efectiva(c, dadas, {fecha}): la constelación con las dadas a la vista (estado «dada») y la próxima que sigue.
     Un intento real a esa estrella que no llega (anotado o en una sesión, desde que dijiste tu nivel) le saca lo de dada.
   · arrancasEn(c, {escalones, ej}): dónde arranca esa meta hoy: el escalón del camino o la estrella.
   · normal(nivel): lo guardado con las cuatro preguntas de antes (dominadas, flexiones, unaPierna, vertical), pasado a movimientos.
   Conservador a propósito (D1): ante la duda, un escalón más abajo. Detalle en docs/kozmos-rutinas.md («Tu nivel»). */
K.nivel = (() => {
  const NIVELES = ["Inicial", "Intermedio", "Avanzado", "Experto"];
  /* por movimiento: la pregunta y, por nivel, lo que se ve (texto y figura), el escalón de arranque y lo que da por hecho */
  const MOVIMIENTOS = [
    {id: "empujar", nombre: "Empujar", pregunta: "¿Cuál te sale, 8 seguidas?", niveles: [
      {texto: "Flexión con las manos en alto", ej: "flexion-inclinada", desde: {empujar: "flexion-inclinada", fondos: "flexion-cerrada"}},
      {texto: "Flexión en el piso", ej: "flexion", desde: {empujar: "flexion", fondos: "fondo-banco"}},
      {texto: "Flexión con los pies en alto", ej: "flexion-declinada", desde: {empujar: "flexion-declinada", fondos: "fondo"}, dadas: ["planche.flexiones-30"]},
      {texto: "Flexión cargando un brazo", ej: "flexion-arquera", desde: {empujar: "flexion-arquera", fondos: "fondo"}, dadas: ["un-brazo.flexiones-40"]}]},
    {id: "tirar", nombre: "Tirar", pide: "barra", pregunta: "¿Cuál te sale, 5 seguidas?", niveles: [
      {texto: "Colgarme de la barra", ej: "colgado-activo", desde: {tirar: "dominada-negativa", remo: "remo-poste"}},
      {texto: "Dominada", ej: "dominada", desde: {tirar: "dominada", remo: "remo-invertido"}, dadas: ["front-lever.colgado-60s"]},
      {texto: "Dominada rápida, pecho a la barra", ej: "dominada-explosiva", desde: {tirar: "dominada-explosiva", remo: "remo-invertido"}, dadas: ["muscle-up.dominadas-10", "front-lever.bolita-10s"]},
      {texto: "Dominada cargando un brazo", ej: "dominada-arquera", desde: {tirar: "dominada-arquera", remo: "remo-un-brazo"}, dadas: ["un-brazo.dominadas-15"]}]},
    {id: "piernas", nombre: "Piernas", pregunta: "¿Cuál te sale, 8 por pierna?", niveles: [
      {texto: "Sentadilla", ej: "sentadilla", desde: {piernas: "sentadilla"}},
      {texto: "Un pie atrás, en alto", ej: "sentadilla-bulgara", desde: {piernas: "sentadilla-bulgara"}},
      {texto: "Una pierna, hasta una silla", ej: "pistol-silla", desde: {piernas: "pistol-silla"}, dadas: ["una-pierna.pistol-silla-5"]},
      {texto: "Una pierna, hasta abajo", ej: "pistol", desde: {piernas: "pistol"}, dadas: ["una-pierna.pistol-3"]}]},
    {id: "cadera", nombre: "Atrás de las piernas", pregunta: "¿Cuál te sale, 8 seguidas?", niveles: [
      {texto: "Puente de glúteo", ej: "puente-gluteo", desde: {isquios: "puente-gluteo"}},
      {texto: "Bisagra en una pierna", ej: "peso-muerto-una-pierna", desde: {isquios: "peso-muerto-una-pierna"}},
      {texto: "Curl deslizando los pies", ej: "curl-femoral-deslizante", desde: {isquios: "curl-femoral-deslizante"}},
      {texto: "De rodillas, bajar despacio", ej: "nordico", desde: {isquios: "nordico-negativa"}}]},
    {id: "abdomen", nombre: "Abdomen", pregunta: "¿Cuál aguantás 20 segundos?", niveles: [
      {texto: "Plancha", ej: "plancha", desde: {lsit: "plancha"}},
      {texto: "Banana boca arriba", ej: "hollow", desde: {lsit: "hollow"}},
      {texto: "Piernas en L, en el aire", ej: "l-sit", desde: {lsit: "l-sit"}, dadas: ["draco.lsit-10s"]},
      {texto: "Piernas en V, en el aire", ej: "v-sit", desde: {lsit: "v-sit"}, dadas: ["draco.lsit-20s"]}]}
  ];
  /* cada movimiento como pregunta de menú: los cuatro niveles y «No sé» al final */
  const PREGUNTAS = MOVIMIENTOS.map(m => ({...m, opciones: [...m.niveles.map((n, i) => [String(i), NIVELES[i], n.texto]), ["nose", "No sé"]]}));
  /* los movimientos que valen con tu equipo: sin barra no se pregunta por tirar; sin decir tu equipo, todos */
  const preguntas = equipo => PREGUNTAS.filter(q => !q.pide || !equipo || equipo.includes(q.pide));

  /* lo de antes: cuatro preguntas por cantidad. Se aceptan al leer (y en un respaldo) y se pasan a movimientos */
  const VIEJAS = {dominadas: ["0", "1-4", "5-9", "10-14", "15+", "nose"], flexiones: ["0-9", "10-19", "20-29", "30-39", "40+", "nose"], unaPierna: ["no", "silla", "completa", "nose"], vertical: ["no", "pared", "libre", "nose"]};
  const PASA = {
    dominadas: {"0": {tirar: "0"}, "1-4": {tirar: "1"}, "5-9": {tirar: "1"}, "10-14": {tirar: "2"}, "15+": {tirar: "3"}, nose: {tirar: "nose"}},
    flexiones: {"0-9": {empujar: "0", abdomen: "0"}, "10-19": {empujar: "1", abdomen: "0"}, "20-29": {empujar: "1", abdomen: "1"}, "30-39": {empujar: "2", abdomen: "2"}, "40+": {empujar: "3", abdomen: "2"}, nose: {empujar: "nose"}},
    unaPierna: {no: {piernas: "0", cadera: "0"}, silla: {piernas: "2", cadera: "1"}, completa: {piernas: "3", cadera: "2"}, nose: {piernas: "nose", cadera: "nose"}}
  };
  const nueva = (id, v) => PREGUNTAS.some(q => q.id === id && q.opciones.some(o => o[0] === v));
  const valida = (id, v) => nueva(id, v) || !!VIEJAS[id]?.includes(v);
  /* normal(nivel) → {empujar, …, fecha} con solo respuestas que existen; lo dicho por movimiento manda sobre lo de antes */
  function normal(nivel){
    if (!nivel || typeof nivel !== "object") return nivel;
    const r = {};
    for (const [k, v] of Object.entries(nivel)) for (const [m, x] of Object.entries(PASA[k]?.[v] || {})) if (!(m in r)) r[m] = x;
    for (const q of PREGUNTAS) if (nueva(q.id, nivel[q.id])) r[q.id] = nivel[q.id];
    if (nivel.fecha) r.fecha = nivel.fecha;
    return r;
  }
  /* el nivel (0 a 3) de un movimiento que vale con tu equipo; si no, null */
  const de = (nivel, id, equipo) => { const n = normal(nivel), v = n?.[id]; return preguntas(equipo).some(q => q.id === id) && nueva(id, v) && v !== "nose" ? +v : null; };

  /* el escalón de arranque por escalera (ids de K.ESCALERAS). Si tu equipo no permite ese escalón, la escalera usa el
     de abajo que sí (K.rutina.defEscalera): el fondo sin paralelas es el fondo en banco */
  function desde(nivel, equipo = null){
    const r = {};
    for (const m of MOVIMIENTOS){ const i = de(nivel, m.id, equipo); if (i !== null) Object.assign(r, m.niveles[i].desde); }
    return r;
  }
  /* las estrellas dadas por hechas: cada nivel suma las suyas a las de los de abajo */
  function dadas(nivel, equipo = null){
    const r = [];
    for (const m of MOVIMIENTOS){
      const i = de(nivel, m.id, equipo); if (i === null) continue;
      for (const n of m.niveles.slice(0, i + 1)) for (const e of n.dadas || []) if (!r.includes(e)) r.push(e);
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
  /* lo que se guarda: lo de antes pasado a movimientos, solo niveles que existen, con la fecha de hoy */
  const poner = (nivel = {}, id, v, hoy) => { if (!nueva(id, v)) return nivel; const n = normal(nivel || {}) || {}; delete n.fecha; return {...n, [id]: v, fecha: hoy}; };
  const respondidas = (nivel, equipo = null) => { const n = normal(nivel); return preguntas(equipo).filter(q => n && nueva(q.id, n[q.id])).length; };

  return {NIVELES, MOVIMIENTOS, PREGUNTAS, preguntas, valida, normal, desde, dadas, efectiva, aplicar, activas, arrancasEn, poner, respondidas};
})();
