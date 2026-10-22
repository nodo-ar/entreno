/* ===== Caminos: funciones puras para armar un día con los moldes del motor B (las usa el día que viene en el PR siguiente) =====
   · patronDe: qué movimiento entrena un ejercicio (tirar, empujar, piernas, bisagra, abdomen, movilidad), de su escalera o del catálogo.
   · caminoDe: para una estrella, si todavía estás abajo en la escalera que lleva a ella, el camino («Camino a …»); si no, la estrella.
   · entrada: la entrada en calor de un día, con piezas de catalogo/entradas.json según lo que el día pide y tu equipo.
   Nada se guarda: todo sale del catálogo y del diario, como el cielo. Detalle en docs/kozmos-rutinas.md. */
K.caminos = (() => {
  const PATRONES = ["tirar", "empujar", "piernas", "bisagra", "abdomen", "movilidad"];
  const escaleras = () => K.rutina.escaleras();
  /* las escaleras que tienen ese ejercicio en algún escalón (también como «conPeso» o «tambien»), con el lugar del escalón */
  const enEscaleras = id => escaleras().flatMap(e => e.pasos.map((p, k) => ({e, k, p})).filter(x => K.rutina.idsPaso(x.p).includes(id)));

  /* patronDe(ej, catálogo de ejercicios) → la lista de patrones: los del ejercicio si el catálogo los dice, si no los de sus escaleras */
  function patronDe(id, ej = {}){
    const propio = ej[id]?.patron;
    if (propio) return [].concat(propio);
    return [...new Set(enEscaleras(id).map(x => x.e.patron).filter(Boolean))];
  }

  /* caminoDe(estrella, {escalones}) → {camino: true, escalera, hasta, nombre} si la estrella es el escalón k de una escalera
     (o lo dice su «camino») y tu escalón está debajo; si no, {camino: false, estrella}.
     «escalones» es lo de K.rutina.escalonesTodos: {id de escalera: dónde estás}. */
  function caminoDe(estrella, {escalones = {}} = {}){
    const e = estrella.prueba?.ejercicio, cat = estrella.camino;
    let id = null, k = -1;
    if (cat){ const esc = K.rutina.escalera(cat.escalera); id = esc ? esc.id : null; k = esc ? esc.pasos.findIndex(p => K.rutina.idsPaso(p).includes(cat.hasta)) : -1; }
    else { const x = enEscaleras(e).find(y => (y.p.tipo || "repeticiones") === estrella.prueba.tipo) || enEscaleras(e)[0]; if (x){ id = x.e.id; k = x.k; } }
    const st = id && escalones[id];
    if (!st || k < 0 || st.paso.k >= k) return {camino: false, estrella: estrella.id};
    return {camino: true, estrella: estrella.id, escalera: id, hasta: K.rutina.escalera(id).pasos[k].ejercicio, k, desde: st.paso.ejercicio, nombre: `Camino a ${estrella.nombre}`};
  }

  /* ===== La entrada en calor =====
     Primero algo que suba el pulso (2 min de bici si tenés bici; si no, saltos de tijera), después de a una pieza por lo que
     el día pide (barra, manos, piernas) y lo general hasta llegar a unos 5 minutos (de 5 a 6), y al final el primer
     ejercicio suave. Solo piezas que tu equipo permite: sin decir tu equipo, el que usan los ejercicios del día. */
  const OBJETIVO = 300, TOPE = 360;
  const piezas = () => (K.ENTRADAS && K.ENTRADAS.piezas) || [];
  const ejerciciosDe = bs => bs.flatMap(b => b.pasos ? b.pasos.map(p => p.ejercicio) : b.clase ? [] : [b.ejercicio]).filter(Boolean);
  /* lo que pide un día: «barra» si algo cuelga de la barra, «manos» si se empuja con las manos, «piernas» si hay piernas o bisagra */
  function pide(bs, ej = {}){
    const r = new Set();
    for (const id of ejerciciosDe(bs)){
      const ps = patronDe(id, ej);
      if ((ej[id]?.equipo || []).includes("barra")) r.add("barra");
      if (ps.includes("empujar")) r.add("manos");
      if (ps.includes("piernas") || ps.includes("bisagra")) r.add("piernas");
    }
    return ["barra", "manos", "piernas"].filter(x => r.has(x));
  }
  function entrada(bs = [], {equipo = null, ej = {}, familia} = {}){
    const usa = new Set(ejerciciosDe(bs).flatMap(id => ej[id]?.equipo || [])), tengo = equipo || [...usa];
    const puede = x => (x.equipo || []).every(e => tengo.includes(e));
    const todas = piezas(), ult = todas.find(x => x.ultima), sirve = todas.filter(x => !x.ultima && !x.pulso && puede(x));
    const pulso = todas.find(x => x.pulso && puede(x));
    const elegidas = [pulso, ult].filter(Boolean);
    let t = elegidas.reduce((a, x) => a + x.seg, 0);
    const meter = x => { if (!x || elegidas.includes(x) || t >= OBJETIVO || t + x.seg > TOPE) return; elegidas.push(x); t += x.seg; };
    /* de a una pieza por cada cosa que pide el día, en rondas (primero las que son solo para eso); después, lo general */
    const propias = n => sirve.filter(x => x.para.includes(n)), listas = pide(bs, ej).map(n => [...propias(n).filter(x => !x.para.includes("general")), ...propias(n).filter(x => x.para.includes("general"))]);
    for (let r = 0; listas.some(l => l[r]); r++) for (const l of listas) meter(l[r]);
    for (const x of sirve.filter(x => x.para.includes("general"))) meter(x);
    /* en el orden del catálogo: el pulso, lo general, lo de cada parte y el primer ejercicio suave al final */
    const ts = todas.filter(x => elegidas.includes(x)).map(x => ({clase: "entrada", seg: x.seg, nota: x.nota, ...(x.ejercicio ? {ejercicio: x.ejercicio} : {})}));
    return {clase: "tramos", familia: familia || bs.find(b => b.familia)?.familia || "fu", nombre: "Entrada en calor", tramos: ts, series: ts.length};
  }

  return {PATRONES, patronDe, caminoDe, entrada, pide, enEscaleras};
})();
