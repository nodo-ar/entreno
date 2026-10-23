/* ===== Biblioteca: lo que trabaja cada ejercicio y cada rutina, y el nivel de rutinas y pruebas (funciones puras) =====
   Todo sale del catálogo (formato en docs/kozmos-rutinas.md, «Zonas, grupos y niveles»):
   · zonas y apoyo: en cada escalera; un ejercicio de una escalera las hereda, salvo que diga las suyas. Los sueltos dicen las suyas.
     «zonas» es lo que trabaja de lleno; «apoyo», lo que acompaña (se ve suave).
   · grupo: dónde va en la biblioteca. Si no lo dice, el patrón (el suyo o el de su escalera).
   · nivel (1 a 3) en cada rutina y cada prueba; las pruebas dicen además su tema (la fila de la vitrina). ===== */
K.biblio = (() => {
  const ZONAS = [["espalda", "Espalda"], ["pecho", "Pecho"], ["hombros", "Hombros"], ["brazos", "Brazos"], ["abdomen", "Abdomen"],
    ["cadera", "Cadera"], ["gluteos", "Glúteos"], ["piernas", "Piernas"], ["corazon", "Corazón"]];
  /* los grupos de la biblioteca, en orden, con el color de su familia */
  const GRUPOS = [["tirar", "Tirar", "fu"], ["empujar", "Empujar", "fu"], ["piernas", "Piernas", "fu"], ["bisagra", "Isquios y glúteos", "fu"],
    ["abdomen", "Abdomen", "fu"], ["movilidad", "Movilidad", "ra"], ["motor", "Motor", "mo"]];
  const NIVELES = ["Inicial", "Intermedio", "Avanzado"];
  const zonaTx = id => (ZONAS.find(z => z[0] === id) || [id, id])[1];
  const grupo = id => GRUPOS.find(g => g[0] === id) || null;

  /* el grupo de un ejercicio: el suyo o el primer patrón */
  const grupoDe = (id, ej = {}) => ej[id]?.grupo || K.caminos.patronDe(id, ej)[0] || null;
  /* lo que trabaja un ejercicio: lo suyo o lo de su escalera */
  function zonasDe(id, ej = {}){
    const x = ej[id];
    if (x && x.zonas) return {zonas: [...x.zonas], apoyo: [...(x.apoyo || [])]};
    const e = K.caminos.enEscaleras(id)[0];
    return e && e.e.zonas ? {zonas: [...e.e.zonas], apoyo: [...(e.e.apoyo || [])]} : {zonas: [], apoyo: []};
  }

  /* ===== Lo que hace una rutina: sus ejercicios (en cada escalera, el de tu escalón) y sus zonas, con su peso =====
     Cada serie suma 1 a sus zonas y 0,4 a su apoyo; cada minuto de un tramo, lo mismo. Lo que llega al 45 % de la zona
     más trabajada va lleno (2); lo que pasa del 12 %, suave (1). */
  const plano = ts => ts.flatMap(t => t.repetir ? Array.from({length: t.repetir}, () => plano(t.tramos)).flat() : [t]);
  const SIN = ["entrada", "descanso", "pausa", "vuelta"];
  const actividad = (r, b) => { const m = b.mide && b.mide.ejercicio, eq = r.equipo || [];
    return m === "trote" || m === "10km" ? "trote" : eq.includes("bici") || m === "bici" ? "bici" : eq.includes("soga") ? "soga" : "trote"; };
  function hace(r, {ej = {}, equipo = null, sesiones = [], marcas = [], nivelDesde = {}} = {}){
    const vol = new Map(), zs = {};
    const sumar = (id, v) => { if (!id || !v) return; vol.set(id, (vol.get(id) || 0) + v);
      const z = zonasDe(id, ej); for (const k of z.zonas) zs[k] = (zs[k] || 0) + v; for (const k of z.apoyo) zs[k] = (zs[k] || 0) + v * .4; };
    for (const s of r.sesiones) for (const b of s.bloques){
      if (b.escalera){ const id = [].concat(b.escalera)[0], st = K.rutina.escalonDe(id, {ej, equipo, sesiones, marcas, desde: nivelDesde && nivelDesde[id]});
        sumar(st ? st.paso.ejercicio : K.rutina.escalera(id)?.pasos[0].ejercicio, b.series || 1); }
      else if (b.ejercicio) sumar(K.rutina.elegir([].concat(b.ejercicio), ej, equipo), b.series || 1);
      if (b.tramos) for (const t of plano(b.tramos)) if (!SIN.includes(t.clase)) sumar(t.ejercicio ? K.rutina.elegir([].concat(t.ejercicio), ej, equipo) : actividad(r, b), (t.seg || 60) / 60);
    }
    const max = Math.max(0, ...Object.values(zs)), zonas = {};
    for (const [z] of ZONAS) if (max && zs[z] / max >= .45) zonas[z] = 2; else if (max && zs[z] / max > .12) zonas[z] = 1;
    return {zonas, ejs: [...vol].sort((a, b) => b[1] - a[1]).map(x => x[0]), fuertes: ZONAS.map(z => z[0]).filter(z => zonas[z] === 2), suaves: ZONAS.map(z => z[0]).filter(z => zonas[z] === 1)};
  }
  /* lo que trabaja un ejercicio, con el mismo peso que una rutina: lo de lleno, 2; el apoyo, 1 */
  const pesoDe = (id, ej = {}) => { const z = zonasDe(id, ej), o = {}; for (const k of z.apoyo) o[k] = 1; for (const k of z.zonas) o[k] = 2; return o; };

  /* ===== La vitrina: un tema por fila (los grupos que tienen pruebas) y un nivel por columna ===== */
  const vitrina = hs => GRUPOS.map(([id, nombre, fam]) => ({id, nombre, fam, pruebas: [1, 2, 3].map(n => hs.find(h => h.tema === id && h.nivel === n) || null)}))
    .filter(t => t.pruebas.some(Boolean));

  return {ZONAS, GRUPOS, NIVELES, zonaTx, grupo, grupoDe, zonasDe, hace, pesoDe, vitrina};
})();
