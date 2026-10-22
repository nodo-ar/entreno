/* ===== Pantallas: Progreso y Vos (Cielo vive en cielo.js; Hoy y la sesión, en hoy.js) ===== */
K.P = {};

/* Vacío: la misma pieza en todas las pantallas sin datos (dibujo chico, título y una frase, alineados a la izquierda) */
K.vacio = (dibujo, titulo, texto, cls = "") => `<section class="cd vacio ${cls}"><div class="ilus" aria-hidden="true">${dibujo}</div><b>${titulo}</b><p>${texto}</p></section>`;

/* el equipo que pide alguna estrella o rutina del catálogo */
K.EQUIPOS = [["barra", "Barra"], ["paralelas", "Paralelas"], ["pared", "Pared libre"], ["poste", "Poste"], ["lastre", "Lastre"], ["mancuernas", "Mancuernas"], ["kettlebell", "Kettlebell"], ["bici", "Bici"], ["soga", "Soga"]];
K.equipoNombre = id => (K.EQUIPOS.find(x => x[0] === id) || [id, id])[1];
/* sin elegir todavía, cuenta como que tenés todo: nada se esconde hasta que lo digas */
K.equipo = () => K.diario.perfil.equipo || K.EQUIPOS.map(x => x[0]);
/* 70.5 → «70,5» */
K.kg = v => String(v).replace(".", ",");

/* ===== Progreso: tus semanas, lo que encendiste y lo que se apaga. En horizontal, tus sesiones a la izquierda y la abierta a la derecha. ===== */
/* semanas de lunes a domingo: cuántas semanas atrás cae un día (0 es esta) */
const lunes = f => { const [a, m, d] = f.split("-").map(Number); return K.cielo.dia(f) - (new Date(a, m - 1, d).getDay() + 6) % 7; };
K.semanas = (sesiones, hoy, n = 7) => {
  const l0 = lunes(hoy), ms = Array(n).fill(0);
  for (const s of sesiones){ const k = (l0 - lunes(s.fecha)) / 7; if (k >= 0 && k < n) ms[n - 1 - k] += s.duracion / 60; }
  return ms.map(Math.round);
};
K.P.progreso = r => {
  const ses = K.diario.sesiones, hz = K.horizontal();
  const enc = K.enc({titulo: "Progreso", sub: "Últimas 7 semanas"});
  if (!ses.length && !K.diario.mediciones.length) return enc +
    K.vacio(`<svg viewBox="0 0 140 56">${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${i * 20 + 2}" y="44" width="14" height="8" rx="4" fill="var(--s2)"/>`).join("")}</svg>`,
      "Todavía no hay semanas", "Después de tu primera sesión vas a ver tus minutos y tus marcas.");
  const cielo = K.cieloActual(), hoy = K.hoy();
  /* minutos por semana: la de ahora en tinta */
  const w = K.semanas(ses, hoy), max = Math.max(30, ...w), con = w.filter(x => x > 0), prom = con.length ? Math.round(con.reduce((a, b) => a + b, 0) / con.length) : 0;
  const barras = `<svg class="semanas" viewBox="0 0 240 96" role="img" aria-label="Minutos por semana, de hace 6 semanas a esta: ${w.join(", ")}">${w.map((v, i) =>
    `<rect x="${i * 34 + 5}" y="${(88 - v / max * 80).toFixed(1)}" width="24" height="${Math.max(v / max * 80, 3).toFixed(1)}" rx="6" fill="${i === 6 ? "var(--ink)" : "var(--s2)"}"/>`).join("")}</svg>`;
  /* de qué semana es cada barra: el lunes de la primera y «esta» */
  const l6 = new Date(); l6.setDate(l6.getDate() - (l6.getDay() + 6) % 7 - 42);
  const ejes = `<div class="ln semanas-eje lb" aria-hidden="true"><span>${l6.toLocaleDateString("es-AR", {day: "numeric", month: "short"}).replace(".", "")}</span><span>Esta</span></div>`;
  const semanas = `<section class="cd prog-sem"><div class="ln"><span class="lb">Minutos por semana</span><span class="num lb">${prom ? `promedio ${prom}` : ""}</span></div>${barras}${ejes}
    <div class="ln small"><span class="mute">Esta semana</span><span class="num">${w[6]} min</span></div></section>`;
  /* lo encendido este mes, lo más nuevo arriba */
  const mes = hoy.slice(0, 7), nuevas = cielo.constelaciones.flatMap(c => c.estrellas.filter(e => e.desde && e.desde.startsWith(mes)).map(e => ({c, e}))).sort((a, b) => b.e.desde.localeCompare(a.e.desde));
  const encendidas = `<section class="cd prog-lista"><span class="lb">Estrellas encendidas este mes</span>${nuevas.length ? nuevas.slice(0, 8).map(({c, e}) =>
    `<div class="prog-est"><i class="dot" style="--c:var(--${c.familia})"></i><b>${K.esc(e.nombre)}</b><span class="mute small">${K.esc(c.nombre)} · ${K.esc(K.fechaCorta(e.desde))}</span></div>`).join("") : `<p class="mute small">Todavía ninguna este mes.</p>`}</section>`;
  /* lo que se apaga: más de 8 semanas sin práctica (nunca se pierde) */
  const tenues = cielo.constelaciones.filter(c => c.atenuada && c.encendidas).sort((a, b) => a.ultima.localeCompare(b.ultima));
  const apaga = tenues.length ? `<section class="cd prog-lista"><span class="lb">Lo que se apaga</span>${tenues.map(c =>
    `<button type="button" class="ln fila-ir" data-ir="#/cielo/${c.id}"><span class="tg"><i class="dot" style="--c:var(--${c.familia})"></i>${K.esc(c.nombre)}</span><span class="num mute">hace ${Math.floor((K.cielo.dia(hoy) - K.cielo.dia(c.ultima)) / 7)} sem</span></button>`).join("")}</section>` : "";
  /* tus sesiones: la abierta se ve a la derecha en horizontal, o en su propia pantalla en vertical */
  const lista = [...ses].reverse().slice(0, 30);
  const sel = r.sub || (hz && lista[0] ? lista[0].id : "");
  const filas = lista.length ? `<span class="lb pie">Tus sesiones</span><section class="aj">${lista.map(s => {
    const est = (s.encendio || []).length, pr = s.bloques.length === 1 && s.bloques[0].prueba && K.estrella(s.bloques[0].estrella);
    const ru = s.rutina && K.rutinaDe(s.rutina.id), hz = s.hazana && K.HAZANAS.hazanas.find(h => h.id === s.hazana.id);
    const que = [pr ? `Prueba · ${pr.nombre}` : hz ? (s.hazana.v === 2 ? hz.nombre : `${hz.nombre} · ${K.rutina.NIVELES[s.hazana.nivel] || ""}`) : s.semanaPrueba ? `Semana de prueba${ru ? ` · ${ru.nombre}` : ""}` : ru ? ru.nombre : "", s.cortada ? "Cortada" : ""].filter(Boolean).join(" · ");
    return `<button type="button" class="ajr" data-ir="#/progreso/${K.esc(s.id)}" data-quieto="1"${s.id === sel ? " data-sel" : ""}>${hz ? `<span class="tile ico-tile">${K.icono.chico.hazana(hz, 40)}</span>` : ru && !pr ? `<span class="tile ico-tile">${K.icono.chico.rutina(ru, 40)}</span>` : `<span class="tile">${K.ic(pr ? "cielo" : "play")}</span>`}
      <span class="ses-fila">${K.esc(K.fechaCorta(s.fecha))}${que ? `<small class="mute">${K.esc(que)}</small>` : ""}</span><em class="num">${est ? `${est} ${est === 1 ? "estrella" : "estrellas"} · ` : ""}${Math.max(1, Math.round(s.duracion / 60))} min</em>${K.ic("chev", "chev")}</button>`;
  }).join("")}</section>` : "";
  const abierto = sel && ses.some(s => s.id === sel) ? K.P.resumen(sel, "progreso") : "";
  return `<div class="split${r.sub ? " en-detalle" : ""}"><div class="lado">${enc}${semanas}${encendidas}${apaga}${filas}</div><div class="abierto">${abierto}</div></div>`;
};

/* ===== Vos: tu equipo, tu peso, avisos, tema, respaldo y acerca. Lo abierto va a la derecha en horizontal y como otra pantalla en vertical. ===== */
const AVISOS = [["todo", "Vibración y sonido"], ["vibra", "Solo vibración"], ["suena", "Solo sonido"], ["nada", "Sin avisos"]];
K.avisosNombre = (v = K.prefs.get("avisos", "todo")) => (AVISOS.find(x => x[0] === v) || AVISOS[0])[1];
const resumenEquipo = () => {
  const q = K.diario.perfil.equipo;
  if (!q) return "Todo";
  if (!q.length) return "Nada";
  const ns = K.EQUIPOS.filter(x => q.includes(x[0])).map(x => x[1]);
  return ns.length > 2 ? `${ns.length} cosas` : ns.join(" y ");
};
/* «hace 3 días», «hoy» o «nunca»: cuándo guardaste el último respaldo en este teléfono */
K.ultimoRespaldo = () => {
  const f = K.prefs.get("respaldo", ""); if (!f) return "Nunca";
  const d = K.cielo.dia(K.hoy()) - K.cielo.dia(f);
  return d <= 0 ? "Hoy" : d === 1 ? "Ayer" : `Hace ${d} días`;
};
/* tus días: «Lun, mié y vie», o «Todos» si no elegiste */
const CORTOS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
K.resumenDias = () => {
  const d = K.diario.perfil.dias;
  if (!d || !d.length || d.length === 7) return "Todos";
  const xs = [...d].sort().map(i => CORTOS[i]), txt = xs.length > 1 ? xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1] : xs[0];
  return txt[0].toUpperCase() + txt.slice(1);
};
K.P.vos = r => {
  const sub = ["acerca", "equipo", "peso", "respaldo", "dias"].includes(r.sub) ? r.sub : "", hz = K.horizontal();
  if (sub !== "peso") K._peso = null; /* lo que escribiste y no guardaste no queda esperándote */
  const abre = sub || (hz ? "equipo" : "");
  const fila = (id, ic, nom, val) => `<button type="button" class="ajr" data-ir="#/vos/${id}" data-quieto="1"${abre === id ? " data-sel" : ""}><span class="tile">${K.ic(ic)}</span><span>${nom}</span><em>${K.esc(val)}</em>${K.ic("chev", "chev")}</button>`;
  const peso = K.diario.perfil.peso;
  return `<div class="split${sub ? " en-detalle" : ""}"><div class="lado">${K.enc({titulo: "Vos", sub: "Ajustes"})}
    <div class="aj">${fila("equipo", "barra", "Tu equipo", resumenEquipo())}${fila("dias", "dias", "Tus días", K.resumenDias())}${fila("peso", "peso", "Tu peso", peso ? `${K.kg(peso)} kg` : "Sin cargar")}
      <button type="button" class="ajr" id="avisos-menu" aria-haspopup="menu" aria-expanded="false"><span class="tile">${K.ic("vibra")}</span><span>Avisos</span><em>${K.esc(K.avisosNombre())}</em>${K.ic("chevd", "chev")}</button></div>
    <span class="lb pie">La persona de los dibujos</span>
    <div class="aj">${K.personaFilas()}</div>
    <div class="aj">
      <button type="button" class="ajr" id="tema-menu" aria-haspopup="menu" aria-expanded="false"><span class="tile">${K.ic("auto")}</span><span>Tema</span><em>${K.esc(K.tema.nombre())}</em>${K.ic("chevd", "chev")}</button>
      ${fila("respaldo", "caja", "Respaldo", K.ultimoRespaldo())}${fila("acerca", "info", "Acerca de Kozmos", "")}
    </div></div>
    <div class="abierto">${({acerca: K.P.acerca, equipo: K.P.equipo, dias: K.P.dias, peso: K.P.peso, respaldo: K.P.respaldo})[abre]?.() || ""}</div></div>`;
};
K.P.acerca = () => K.enc({titulo: "Acerca de Kozmos", sub: "Ajustes", volver: "#/vos", raiz: true, det: true}) +
  `<section class="cd acerca">${K.logo(64)}<h2>Kozmos</h2>
   <p class="lema"><i>Per aspera ad astra.</i> Por lo difícil, a las estrellas.</p>
   <p class="mute">Funciona sin conexión. Lo que hacés queda en este teléfono: sin cuentas ni servidores.</p>
   <span class="lb">Versión <span class="num">${K.esc(K.VERSION)}</span></span></section>
   <span class="lb pie">Fuentes</span>
   <section class="cd fuentes small"><p><b>Calorías.</b> Ainsworth BE y otros (2011). 2011 Compendium of Physical Activities: a second update of codes and MET values. <i>Medicine &amp; Science in Sports &amp; Exercise</i>, 43(8), 1575-1581.</p></section>
   <p class="pie small mute">Letra: Mona Sans y Geist Mono, con licencia SIL Open Font License.</p>`;

/* tu equipo: cada toque queda guardado, con deshacer */
K.P.equipo = () => {
  const q = K.equipo();
  return K.enc({titulo: "Tu equipo", sub: "Ajustes", volver: "#/vos", raiz: true, det: true}) +
    `<p class="ayuda">Marcá lo que tenés. Lo que pide otra cosa no aparece en tu cielo ni en lo que toca hoy.</p>
    <section class="aj">${K.EQUIPOS.map(([id, n]) => `<button type="button" class="ajr rumbo-fila" data-equipo="${id}" aria-pressed="${q.includes(id)}"><span class="tile">${K.ic(id === "lastre" ? "peso" : id)}</span><span>${n}</span><em></em>${q.includes(id) ? K.ic("check", "ck") : "<span></span>"}</button>`).join("")}</section>`;
};
K.equipoTocar = async id => {
  const antes = K.diario.perfil.equipo, q = K.equipo(), n = q.includes(id) ? q.filter(x => x !== id) : [...q, id];
  const poner = async v => { try { await K.diario.lote({perfil: {equipo: v}}); return true; } catch (e) { K.aviso("No se pudo guardar en este teléfono."); return false; } finally { K.refrescar(); } };
  if (!await poner(n)) return;
  K.deshacer(`${n.length > q.length ? "Sumaste" : "Sacaste"} ${K.equipoNombre(id).toLowerCase()}`, () => poner(antes));
};

/* tus días: los que entrenás. Los demás, Hoy te deja descansar. Sin elegir, todos. */
K.P.dias = () => {
  const d = K.diario.perfil.dias || [];
  return K.enc({titulo: "Tus días", sub: "Ajustes", volver: "#/vos", raiz: true, det: true}) +
    `<p class="ayuda">Marcá los días que entrenás. Los otros, Hoy te deja descansar. Una rutina sigue donde quedó, sin perder nada.</p>
    <section class="aj">${K.DIAS.map((n, i) => `<button type="button" class="ajr rumbo-fila" data-dia="${i}" aria-pressed="${d.includes(i)}"><span class="tile num">${CORTOS[i][0].toUpperCase()}</span><span>${n[0].toUpperCase() + n.slice(1)}</span><em></em>${d.includes(i) ? K.ic("check", "ck") : "<span></span>"}</button>`).join("")}</section>`;
};
K.diaTocar = async i => {
  const antes = K.diario.perfil.dias, d = antes || [], n = (d.includes(i) ? d.filter(x => x !== i) : [...d, i]).sort();
  const poner = async v => { try { await K.diario.lote({perfil: {dias: v && v.length ? v : undefined}}); return true; } catch (e) { K.aviso("No se pudo guardar en este teléfono."); return false; } finally { K.refrescar(); } };
  if (!await poner(n)) return;
  K.deshacer(`${n.length > d.length ? "Sumaste" : "Sacaste"} el ${K.DIAS[i]}`, () => poner(antes));
};

/* tu peso: para las calorías y para Lastre. Se guarda al tocar Listo; vacío lo saca. */
K.P.peso = () => {
  const p = K.kg(K._peso ?? K.diario.perfil.peso ?? "");
  return K.enc({titulo: "Tu peso", sub: "Ajustes", volver: "#/vos", raiz: true, det: true}) +
    `<p class="ayuda">Para las calorías de cada sesión y para Lastre. Queda en este teléfono.</p>
    <section class="cd"><div class="pmw"><div class="pm"><button type="button" class="pmb" data-ppaso="-1" aria-label="Menos">−</button>
      <input class="pmv num" id="v-peso" inputmode="decimal" autocomplete="off" placeholder="—" aria-label="Tu peso en kilos" value="${K.esc(p)}"><button type="button" class="pmb" data-ppaso="1" aria-label="Más">+</button></div><span class="lb">kilos</span></div></section>
    <button type="button" class="btn" id="v-peso-listo">Listo</button>`;
};
K.pesoPaso = d => {
  const el = K.$("#v-peso"), v = Number(String(el.value || K.diario.perfil.peso || 70).replace(",", "."));
  K._peso = Math.max(20, Math.min(400, Math.round(((Number.isFinite(v) ? v : 70) + d * .5) * 2) / 2));
  el.value = K.kg(K._peso);
};
K.pesoListo = async () => {
  const txt = String(K.$("#v-peso").value).trim(), v = Number(txt.replace(",", ".")), antes = K.diario.perfil.peso;
  if (txt && !(v >= 20 && v <= 400)){ K.aviso("Tiene que estar entre 20 y 400 kg."); K.$("#v-peso").focus(); return; }
  const n = txt ? Math.round(v * 2) / 2 : undefined;
  try { await K.diario.lote({perfil: {peso: n}}); } catch (e) { K.aviso("No se pudo guardar en este teléfono."); return; }
  K._peso = null; K.volver("#/vos");
  if (n !== antes) K.deshacer(n ? `Tu peso: ${K.kg(n)} kg` : "Sacaste tu peso", async () => { try { await K.diario.lote({perfil: {peso: antes}}); } catch (e) {} K.refrescar(); });
};

/* respaldo: guardar todo en un archivo y traerlo de vuelta (suma, no borra nada) */
K.P.respaldo = () => K.enc({titulo: "Respaldo", sub: "Ajustes", volver: "#/vos", raiz: true, det: true}) +
  `<section class="aj">
    <button type="button" class="ajr" id="rs-guardar"><span class="tile">${K.ic("bajar")}</span><span>Guardar un respaldo</span><em></em><span></span></button>
    <button type="button" class="ajr" id="rs-traer"><span class="tile">${K.ic("subir")}</span><span>Traer un respaldo</span><em>Suma, no borra</em><span></span></button>
  </section><input type="file" id="rs-archivo" hidden>
  <p class="pie small mute">El archivo tiene todo lo que entrenaste y anotaste. Guardalo fuera del teléfono, por ejemplo en tu correo, por si lo perdés o lo cambiás.</p>`;
K.resp = {
  async guardar(){
    const o = K.respaldo.armar(K.diario, K.VERSION, K.CATALOGO.version), txt = JSON.stringify(o), nombre = K.respaldo.nombre(K.hoy());
    const listo = () => { K.prefs.set("respaldo", K.hoy()); K.refrescar(); const n = o.sesiones.length;
      K.aviso(`Respaldo guardado: ${n} ${n === 1 ? "sesión" : "sesiones"} y ${o.mediciones.length} ${o.mediciones.length === 1 ? "marca" : "marcas"}.`); };
    /* en la APK, el archivo se comparte con el menú de Android (el WebView no descarga ni comparte archivos) */
    if (K.apk){
      let llego; try { llego = await K.apk.compartir(nombre, txt); } catch (e) { K.aviso("No se pudo guardar el archivo."); return; }
      if (llego) listo(); return;
    }
    /* en el teléfono se comparte (Drive, correo, WhatsApp): así sabemos que llegó a algún lado */
    try {
      const f = new File([txt], nombre, {type: "application/json"});
      if (navigator.canShare?.({files: [f]})){ await navigator.share({files: [f], title: "Respaldo de Kozmos"}); listo(); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([txt], {type: "application/json"})); a.download = nombre;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { K.aviso("No se pudo guardar el archivo."); return; }
    listo();
  },
  async traer(f){
    if (!f) return;
    let txt; try { txt = await f.text(); } catch (e) { K.aviso("No se pudo leer ese archivo."); return; }
    const r = K.respaldo.leer(txt);
    if (r.error){ K.aviso(r.error); return; }
    const s = K.respaldo.sumar(K.diario, r), c = s.cuenta;
    if (!c.sesiones && !c.mediciones && !c.perfil){ K.aviso(c.descartadas ? "No había nada que se pudiera traer." : "Ya tenías todo."); return; }
    try { await K.diario.lote(s.cambios); } catch (e) { K.aviso("No hay lugar en el teléfono para este respaldo. No se trajo nada."); return; }
    K.refrescar();
    const partes = [c.sesiones && `${c.sesiones} ${c.sesiones === 1 ? "sesión" : "sesiones"}`, c.mediciones && `${c.mediciones} ${c.mediciones === 1 ? "marca" : "marcas"}`].filter(Boolean);
    K.deshacer(`${partes.length ? "Trajiste " + partes.join(" y ") : "Trajiste tus ajustes"}${c.descartadas ? ` · ${c.descartadas} con datos rotos, afuera` : ""}`, async () => {
      try { await K.diario.lote(s.deshacer); } catch (e) { K.aviso("No se pudo deshacer."); } K.refrescar(); });
  }
};

/* la persona de los dibujos: cada rasgo sale al azar en cada ejercicio, salvo el que elijas acá */
const RASGOS = {
  sexo: {nombre: "Mujer u hombre", ic: "persona", ops: [["mujer", "Mujer"], ["hombre", "Hombre"]]},
  piel: {nombre: "Piel", ops: ["Muy clara", "Clara", "Trigueña clara", "Trigueña", "Morena clara", "Morena", "Oscura", "Muy oscura"].map((n, i) => [K.fig.TONOS[i], n]), color: true},
  pelo: {nombre: "Pelo", ic: "pelo", ops: [["colita", "Colita"], ["rodete", "Rodete"], ["largo", "Largo"], ["melena", "Melena"], ["afro", "Afro"], ["corto", "Corto"], ["rapado", "Rapado"], ["rulos", "Rulos"], ["pelado", "Pelado"]]},
  colorPelo: {nombre: "Color de pelo", ops: ["Negro", "Castaño oscuro", "Castaño", "Castaño claro", "Rubio oscuro", "Rubio", "Colorado", "Canoso"].map((n, i) => [K.fig.PELOS[i], n]), color: true}
};
const persona = () => K.prefs.get("persona", {}) || {};
/* el pelo depende de si es mujer u hombre: con uno elegido, se ofrecen sus peinados */
const opsDe = k => k !== "pelo" || !persona().sexo ? RASGOS[k].ops : RASGOS.pelo.ops.filter(([v]) => K.fig.ESTILOS[persona().sexo].includes(v));
const valor = k => (RASGOS[k].ops.find(([v]) => v === persona()[k]) || [, "Al azar"])[1];
K.personaFilas = () => Object.entries(RASGOS).map(([k, r]) => { const v = persona()[k];
  /* el color elegido, o una rueda con todos si sale al azar */
  const tile = !r.color ? K.ic(r.ic) : `<i class="dot sw" style="${v ? `--c:${v}` : `background:conic-gradient(${r.ops.map(o => o[0]).join(",")})`}"></i>`;
  return `<button type="button" class="ajr" id="rasgo-${k}" data-rasgo="${k}" aria-haspopup="menu" aria-expanded="false"><span class="tile">${tile}</span><span>${r.nombre}</span><em>${K.esc(valor(k))}</em>${K.ic("chevd", "chev")}</button>`; }).join("");
K.personaPoner = p => { K.prefs.set("persona", p); K.fig.fijar(p); };
K.menuRasgo = btn => { const k = btn.dataset.rasgo, r = RASGOS[k];
  K.menu.abrir(btn, {titulo: r.nombre, items: [{id: "azar", texto: "Al azar", ic: "azar", elegido: !persona()[k]}, "-",
      ...opsDe(k).map(([v, n]) => ({id: v, texto: n, ...(r.color ? {color: v} : {}), elegido: persona()[k] === v}))],
    elegir: id => { const antes = persona(), nuevo = {...antes};
      if (id === "azar") delete nuevo[k]; else nuevo[k] = id;
      /* si cambiás a mujer u hombre, un peinado que no le va vuelve al azar */
      if (k === "sexo" && nuevo.pelo && nuevo.sexo && !K.fig.ESTILOS[nuevo.sexo].includes(nuevo.pelo)) delete nuevo.pelo;
      if (JSON.stringify(nuevo) === JSON.stringify(antes)) return;
      K.personaPoner(nuevo); K.refrescar();
      K.deshacer(`${r.nombre}: ${id === "azar" ? "al azar" : valor(k).toLowerCase()}`, () => { K.personaPoner(antes); K.refrescar(); }); }}); };
K.menuTema = btn => K.menu.abrir(btn, {titulo: "Tema",
  items: K.TEMAS.map(([v, n, ic]) => ({id: v, texto: n, ic, elegido: K.tema.actual() === v})),
  elegir: id => K.cambiarTema(id)});
K.menuAvisos = btn => K.menu.abrir(btn, {titulo: "Avisos",
  items: AVISOS.map(([v, n]) => ({id: v, texto: n, elegido: K.prefs.get("avisos", "todo") === v})),
  elegir: id => { const antes = K.prefs.get("avisos", "todo"); if (id === antes) return; K.prefs.set("avisos", id); K.refrescar();
    K.deshacer(`Avisos: ${K.avisosNombre(id).toLowerCase()}`, () => { K.prefs.set("avisos", antes); K.refrescar(); }); }});

/* cambiar el tema siempre se puede deshacer */
K.cambiarTema = t => {
  const antes = K.tema.actual(); if (t === antes) return;
  K.tema.poner(t); K.refrescar();
  K.deshacer(`Tema ${K.tema.nombre(t).toLowerCase()}`, () => { K.tema.poner(antes); K.refrescar(); });
};
