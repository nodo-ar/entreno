/* ===== Cielo y Constelación (etapa 2): el catálogo, tu cielo calculado y las marcas anotadas a mano ===== */
K.hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
K.cieloActual = () => K.cielo.calcular(K.CATALOGO, K.diario.mediciones, K.hoy(), K.diario.sesiones, K.diario.perfil.equipo || null);
K.familia = id => K.CATALOGO.familias.find(f => f.id === id);
/* la que se abre sola en horizontal: la última que practicaste, o la primera */
K.destacada = cielo => (cielo.constelaciones.filter(c => c.ultima).sort((a, b) => b.ultima.localeCompare(a.ultima))[0] || cielo.constelaciones[0]).id;

/* «2026-10-18» → «Anteayer» o «Jue 15 oct» */
K.fechaCorta = f => {
  const d = K.cielo.dia(K.hoy()) - K.cielo.dia(f);
  if (d === 0) return "Hoy"; if (d === 1) return "Ayer"; if (d === 2) return "Anteayer";
  const [a, m, dd] = f.split("-").map(Number);
  return new Date(a, m - 1, dd).toLocaleDateString("es-AR", {weekday: "short", day: "numeric", month: "short"}).replace(/\./g, "").replace(/^./, x => x.toUpperCase());
};
K.ultimosDias = n => Array.from({length: n}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });

K.P.cielo = r => {
  const cielo = K.cieloActual(), hz = K.horizontal();
  const sel = r.sub || (hz ? K.destacada(cielo) : "");
  const sub = cielo.encendidas ? `${cielo.encendidas} de ${cielo.total} estrellas` : "Todavía sin estrellas";
  const lista = K.CATALOGO.familias.map(f => `<section class="fam"><span class="lb tg"><i class="dot" style="--c:var(--${f.id})"></i>${K.esc(f.nombre)}</span>
    <div class="aj">${cielo.constelaciones.filter(c => c.familia === f.id).map(c => `<button type="button" class="ajr cons-fila" data-ir="#/cielo/${c.id}" data-quieto="1"${c.id === sel ? " data-sel" : ""}>
      <span class="tile ico-tile">${K.icono.constelacion(c, 40)}</span><span>${K.esc(c.nombre)}</span><em class="num${!c.proxima && !c.completa && c.pide.length ? " pide" : ""}">${K.esc(K.cuentaCons(c))}</em>${K.ic("chev", "chev")}</button>`).join("")}</div></section>`).join("");
  /* el cielo entero: cada constelación, su figura adentro del anillo de avance. Lo que pide equipo que no marcaste no aparece */
  const grilla = `<section class="cielo-grilla solo-vertical" aria-label="Tu cosmos">${cielo.constelaciones.filter(c => c.total > 0).map(c =>
    `<button type="button" class="cd cons-tile" data-ir="#/cielo/${c.id}" data-quieto="1" aria-label="${K.esc(`${c.nombre}, ${!c.proxima && !c.completa && c.pide.length ? K.cuentaCons(c).toLowerCase() : `${c.encendidas} de ${c.total} estrellas`}`)}">${K.icono.constelacion(c, 76)}
      <b>${K.esc(c.nombre)}</b><span class="num${!c.proxima && !c.completa && c.pide.length ? " pide" : ""}">${K.esc(K.cuentaCons(c))}</span></button>`).join("")}</section>`;
  /* los anillos se cierran y el satélite llega orbitando la primera vez que abrís el Cielo; después quedan quietos */
  const llega = !K.cieloVisto; K.cieloVisto = true;
  const lado = K.enc({titulo: "Tu cosmos", sub}) +
    (cielo.encendidas ? "" : `<p class="ayuda">Cada constelación es una habilidad. Tocá una y anotá tu primera marca.</p>`) + grilla + lista;
  const c = sel && cielo.constelaciones.find(x => x.id === sel);
  const abierto = !c ? "" : r.sub2 === "anotar" ? K.P.anotar(c, r.sub3) : K.P.constelacion(c);
  return `<div class="split${r.sub ? " en-detalle" : ""}${llega ? " ico-llega" : ""}"><div class="lado">${lado}</div><div class="abierto">${abierto}</div></div>`;
};
/* tres constelaciones, una por familia (la primera de cada una): la puerta de entrada al rumbo */
K.cieloTrio = (px = 64) => { const cs = K.cieloActual().constelaciones;
  return `<span class="ico-trio" aria-hidden="true">${K.CATALOGO.familias.map(f => cs.find(c => c.familia === f.id && c.total > 0)).filter(Boolean).slice(0, 3).map(c => K.icono.constelacion(c, px)).join("")}</span>`; };

K.P.constelacion = c => {
  const fam = K.familia(c.familia), p = c.proxima, recien = K._recien || [];
  K._recien = null;
  let estado = "";
  if (c.completa) estado = `<section class="cd cons-estado"><span class="lb" style="color:var(--${c.familia})">Constelación completa</span><b class="t1">${K.esc(c.nombre)}, completa.</b><p class="mute">Ya es parte de tu cosmos.</p></section>`;
  else if (p) estado = `<section class="cd cons-estado"><span class="lb">Próxima estrella · m${p.magnitud}</span><b class="t1">${K.nw(p.nombre)}</b>
      <div class="bar" style="--c:var(--${c.familia})" role="progressbar" aria-label="Avance hacia ${K.esc(p.nombre)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(c.avance * 100)}"><i style="width:${(c.avance * 100).toFixed(1)}%"></i></div>
      <span class="ln mute"><span>Tu mejor marca</span>${p.mejor === null ? "<span>Todavía ninguna</span>" : `<span class="num">${K.esc(K.cielo.corto(p.prueba, p.mejor))}</span>`}</span></section>`;
  else if (c.pide.length) estado = `<section class="cd cons-estado"><span class="lb">Lo que sigue</span><b class="t1">Pide ${K.esc(K.pide(c.pide))}.</b><p class="mute">Si lo tenés, marcalo en tu equipo.</p></section>`;
  const tenue = c.volverAProbar ? `<p class="aviso-tenue">Hace más de 16 semanas sin práctica. Probala de nuevo cuando quieras.</p>`
    : c.atenuada ? `<p class="aviso-tenue">${K.esc(c.nombre)} se está apagando: hace más de 8 semanas sin práctica.</p>` : "";
  /* lo que pide equipo que no marcaste se ve igual acá, tenue y diciendo qué pide */
  const ESTADO = {encendida: "encendida", proxima: "próxima", "por-delante": "por delante", "sin-equipo": "pide equipo que no marcaste"};
  const filas = c.estrellas.map(e => `<button type="button" class="est-fila ${e.estado}" data-ir="#/cielo/${c.id}/anotar/${e.orden}" style="--c:var(--${c.familia})">
      <span class="st" aria-hidden="true"></span><span class="nom">${K.nw(e.nombre)}<span class="vh">, ${ESTADO[e.estado]}</span></span>
      <span class="num mg">${e.estado === "sin-equipo" ? K.esc("Pide " + K.pide(e.falta))
        : e.mejor !== null && e.estado !== "encendida" ? K.esc(K.cielo.corto(e.prueba, e.mejor)) : "m" + e.magnitud}</span></button>`).join("");
  /* probar la próxima es lo principal; anotar algo hecho por tu cuenta queda al lado */
  const probar = p && K.plan.sePrueba(c);
  /* la que se mide con una prueba (Del piso, Motor 12…) se prueba desde la prueba: Probar lleva a su pantalla */
  const hzP = p && !probar && K.plan.soloPrueba(p.prueba) && K.plan.hazanaDe(p.id);
  const botones = c.pide.length ? `<div class="dos-btn"><button type="button" class="btn sec" data-ir="#/cielo/${c.id}/anotar">Anotar</button><button type="button" class="btn" data-ir="#/vos/equipo">Tu equipo</button></div>`
    : probar ? `<div class="dos-btn"><button type="button" class="btn sec" data-ir="#/cielo/${c.id}/anotar">Anotar</button><button type="button" class="btn" data-probar="${c.id}">${K.ic("play")}Probar</button></div>`
    : hzP ? `<div class="dos-btn"><button type="button" class="btn sec" data-ir="#/cielo/${c.id}/anotar">Anotar</button><button type="button" class="btn" data-ir="#/planes/hazanas/${hzP.id}">${K.ic("play")}Probar</button></div>`
    : `<button type="button" class="btn" data-ir="#/cielo/${c.id}/anotar">Anotar una marca</button>`;
  const marcas = [...c.marcas].reverse().slice(0, 12).map(m => {
    const e = c.estrellas.find(x => x.id === m.estrella) || c.estrellas.find(x => x.prueba.ejercicio === m.ejercicio && x.prueba.tipo === m.tipo) || c.estrellas[0];
    /* lo anotado a mano se borra acá; lo de una sesión es parte de la sesión */
    const fin = m.origen === "serie" ? `<span class="marca-ses lb" title="En una sesión">${K.ic("play")}</span>`
      : `<button type="button" class="ib chico" data-borrar="${K.esc(m.id)}" aria-label="Borrar la marca de ${K.esc(e.nombre)}">${K.ic("x")}</button>`;
    return `<div class="marca"><span class="num mute">${K.esc(K.fechaCorta(m.fecha))}</span><span>${K.nw(e.nombre)}</span><span class="num">${K.esc(K.cielo.corto({tipo: m.tipo || e.prueba.tipo}, m.valor))}</span>${fin}</div>`;
  }).join("");
  /* arriba, la figura en su anillo (como la medalla de una prueba) y, de fondo y tenue, las estrellas de la constelación */
  const nuevas = recien.filter(id => c.estrellas.some(e => e.id === id)).length;
  return K.enc({titulo: c.nombre, sub: fam.nombre, volver: "#/cielo", raiz: true, det: true}) +
    `<p class="cons-meta mute">${K.esc(c.meta)}</p>
    <section class="cd cons-cab"><div class="cons-fondo" aria-hidden="true">${K.dibujo.una(c, recien)}</div>
      <span class="cons-ico">${K.icono.constelacion(c, 96, `${c.nombre}, ${c.encendidas} de ${c.total} estrellas`, nuevas ? {desde: c.encendidas - nuevas} : {})}</span></section>${tenue}${estado}
    ${botones}
    <section class="cd est-lista" aria-label="Estrellas de ${K.esc(c.nombre)}">${filas}</section>
    ${marcas ? `<span class="lb pie">Tus marcas</span><section class="cd marcas">${marcas}</section>` : ""}${rutinasDe(c)}`;
};
/* las rutinas que llevan a alguna estrella de esta constelación */
const rutinasDe = c => {
  const ids = new Set(c.estrellas.map(e => e.id)), rs = K.RUTINAS.filter(r => r.alimenta.some(id => ids.has(id)));
  return rs.length ? `<span class="lb pie">Rutinas que llevan acá</span><section class="aj">${rs.map(r => `<button type="button" class="ajr" data-ir="#/planes/rutinas/${r.id}"><span class="tile ico-tile">${K.icono.rutina(r, 40)}</span>
    <span>${K.esc(r.nombre)}</span><em class="num">${r.semanas} sem</em>${K.ic("chev", "chev")}</button>`).join("")}</section>` : "";
};

/* ===== Anotar una marca a mano: estrella, valor y día. Se guarda y se ofrece deshacer. ===== */
const UNIDAD = {segundos: "segundos", repeticiones: "repeticiones", minutos: "minutos", "menos-minutos": "minutos en 10 km", sesiones: "sesiones", porcentaje: "% de tu peso",
  puntos: "puntos, de 0 a 10", cm: "cm más allá de los pies", km: "km", tiempo: "segundos", mejora: "% sobre tu primera vez"};
K.P.anotar = (c, orden) => {
  const e0 = c.estrellas.find(e => e.orden === orden) || c.proxima || c.estrellas[c.estrellas.length - 1];
  /* lo que se va escribiendo queda en K._form mientras sigas en esta constelación */
  const F = K._forms = K._forms || {};
  let f = F[c.id];
  if (!f || (orden && f.orden !== orden)){
    const pr = e0.prueba;
    /* arranca en tu mejor marca de esa prueba, o vacío: nunca en el umbral, para que nadie encienda una estrella sin querer */
    f = F[c.id] = {c: c.id, orden, estrella: e0.id, fecha: K.hoy(), valor: e0.mejor ?? "", lastre: "", peso: K.diario.perfil.peso || ""};
  }
  K._form = f;
  const e = c.estrellas.find(x => x.id === f.estrella), pr = e.prueba;
  const paso = (id, et, v, unidad) => `<div class="pmw"><div class="pm"><button type="button" class="pmb" data-paso="-1" data-campo="${id}" aria-label="Menos">−</button>
      <input class="pmv num" id="f-${id}" data-campo="${id}" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="${et}" value="${v}"><button type="button" class="pmb" data-paso="1" data-campo="${id}" aria-label="Más">+</button></div><span class="lb">${unidad}</span></div>`;
  let valor;
  if (pr.tipo === "logrado") valor = `<p class="mute">Marcalo cuando te salga de punta a punta, sin ayuda.</p>`;
  else if (pr.tipo === "porcentaje") valor = `<div class="dos-pasos">${paso("lastre", "Lastre en kilos", f.lastre, "kg de lastre")}${paso("peso", "Tu peso en kilos", f.peso, "kg tu peso")}</div>
      <p class="calc"><span class="num" id="f-pct">${K.pct(f)}</span> de tu peso</p>`;
  /* la mejora sale de tus veces en la prueba, no se anota a mano */
  else if (pr.tipo === "mejora"){ const h = K.plan.hazanaDe(e.id); valor = `<p class="mute">Se mide con ${K.esc(h ? h.nombre : "su prueba")}: tu primera vez es la base y cada vez nueva se compara con ella.</p>${h ? `<button type="button" class="btn sec" data-ir="#/planes/hazanas/${h.id}">Ir a la prueba</button>` : ""}`; }
  else valor = paso("valor", UNIDAD[pr.tipo], f.valor, UNIDAD[pr.tipo]);
  const sin = K.diario.guarda ? "" : `<p class="aviso-tenue">Este navegador no deja guardar datos. Lo que anotes se pierde al cerrar.</p>`;
  return K.enc({titulo: "Anotar una marca", sub: c.nombre, volver: `#/cielo/${c.id}`, det: true}) +
    `<section class="aj">
      <button type="button" class="ajr" id="f-estrella" aria-haspopup="menu" aria-expanded="false"><span class="tile">${K.ic("cielo")}</span><span>Estrella</span><em>${K.esc(e.nombre)}</em>${K.ic("chevd", "chev")}</button>
      <button type="button" class="ajr" id="f-fecha" aria-haspopup="menu" aria-expanded="false"><span class="tile">${K.ic("cal")}</span><span>Día</span><em>${K.esc(K.fechaCorta(f.fecha))}</em>${K.ic("chevd", "chev")}</button>
    </section>
    <section class="cd anotar-valor">${valor}<p class="ln mute"><span>Para encenderla</span><span class="num">${K.esc(K.cielo.corto(pr, pr.umbral))}</span></p></section>${sin}
    ${pr.tipo === "mejora" ? "" : `<button type="button" class="btn" id="f-guardar">${pr.tipo === "logrado" ? "Lo logré" : "Guardar"}</button>`}`;
};
K.pct = f => { const l = numero(f.lastre), p = numero(f.peso); return p > 0 && l >= 0 ? K.cielo.TIPOS.porcentaje.corto(Math.round(l / p * 100)) : "—"; };
const numero = s => { const v = Number(String(s).replace(",", ".").trim()); return Number.isFinite(v) ? v : NaN; };

K.anotar = {
  menuEstrella(btn){
    const c = K.cieloActual().constelaciones.find(x => x.id === K._form.c);
    K.menu.abrir(btn, {titulo: "Estrella", items: c.estrellas.map(e => ({id: e.id, texto: e.nombre, elegido: e.id === K._form.estrella})),
      elegir: id => { const e = c.estrellas.find(x => x.id === id), f = K._form; f.estrella = id; f.orden = e.orden;
        if (e.prueba.tipo !== "porcentaje") f.valor = e.mejor ?? "";
        history.replaceState(null, "", `#/cielo/${c.id}/anotar/${e.orden}`); K._pila[K._pila.length - 1] = location.hash; K.refrescar(); }});
  },
  menuFecha(btn){
    K.menu.abrir(btn, {titulo: "Día", items: K.ultimosDias(7).map(d => ({id: d, texto: K.fechaCorta(d), elegido: d === K._form.fecha})),
      elegir: d => { K._form.fecha = d; K._form.fechaElegida = d !== K.hoy(); K.refrescar(); }});
  },
  paso(campo, s){
    const f = K._form, e = K.estrella(f.estrella), {inc, min, max} = K.pasoDe(e ? e.prueba.tipo : "repeticiones", campo);
    const v = numero(f[campo]); f[campo] = Math.max(min, Math.min(max, Math.round(((Number.isFinite(v) ? v : 0) + s * inc) * 10) / 10));
    K.$("#f-" + campo).value = f[campo]; const p = K.$("#f-pct"); if (p) p.textContent = K.pct(f);
  },
  escribir(campo, txt){ K._form[campo] = txt; const p = K.$("#f-pct"); if (p) p.textContent = K.pct(K._form); },
  async guardar(){
    if (K.anotar._guardando) return;
    K.anotar._guardando = true; const b = K.$("#f-guardar"); if (b) b.disabled = true;
    try { await K.anotar._guardar(); } finally { K.anotar._guardando = false; const b2 = K.$("#f-guardar"); if (b2) b2.disabled = false; }
  },
  async _guardar(){
    K.alDia(); /* si pasó la medianoche sin que nadie mirara, el día sin elegir es el de hoy */
    const f = K._form, cat = K.CATALOGO, c = cat.constelaciones.find(x => x.id === f.c), e = c.estrellas.find(x => x.id === f.estrella), pr = e.prueba;
    /* cada marca guarda qué midió: si un día el catálogo cambia, la marca se sigue leyendo igual */
    let m = {estrella: e.id, ejercicio: pr.ejercicio, tipo: pr.tipo, catalogo: cat.version, fecha: f.fecha};
    if (pr.tipo === "logrado") m.valor = 1;
    else if (pr.tipo === "porcentaje"){
      const l = numero(f.lastre), p = numero(f.peso);
      if (!(p >= 20 && p <= 400)){ K.aviso("Revisá tu peso: tiene que estar entre 20 y 400 kg."); K.$("#f-peso")?.focus(); return; }
      if (!(l > 0 && l <= 400)){ K.aviso("Poné cuántos kilos de lastre colgaste."); K.$("#f-lastre")?.focus(); return; }
      m = {...m, valor: Math.round(l / p * 100), lastreKg: l, pesoKg: p};
    } else {
      const v = numero(f.valor);
      const {min, max} = K.pasoDe(pr.tipo), cero = pr.tipo === "cm" || pr.tipo === "puntos";
      if (pr.tipo === "mejora") return;
      if (String(f.valor).trim() === "" || !Number.isFinite(v) || v < min || v > max || (!cero && v <= 0)){ K.aviso(cero ? `Poné un número de ${min} a ${max}.` : "Poné un número mayor que cero."); K.$("#f-valor")?.focus(); return; }
      m.valor = v;
    }
    const antes = K.diario.mediciones;
    let n;
    try {
      n = await K.diario.anotar(m);
      if (pr.tipo === "porcentaje" && m.pesoKg !== K.diario.perfil.peso) await K.diario.perfilPoner("peso", m.pesoKg).catch(() => {});
    } catch (err) { K.aviso(K.diario.motivo === "otra-version" ? "Kozmos se actualizó en otra pestaña. Cerrá y volvé a abrir para seguir anotando." : "No se pudo guardar en este teléfono. Revisá el espacio libre."); return; }
    const nuevas = K.cielo.nuevas(cat, antes, K.diario.mediciones, K.hoy());
    delete K._forms[c.id]; K._form = null; K._recien = nuevas.map(x => x.estrella.id);
    K.volver(`#/cielo/${c.id}`);
    const txt = nuevas.length ? (nuevas.some(x => x.constelacion.completa) ? `${c.nombre}, completa. Ya es parte de tu cosmos.` : `Encendiste ${nuevas.length > 1 ? nuevas.length + " estrellas" : "una estrella"} en ${c.nombre}.`)
      : `Anotaste ${K.cielo.corto(pr, m.valor)} en ${e.nombre}`;
    K.deshacer(txt, async () => { try { await K.diario.borrar(n.id); } catch (err) { K.aviso("No se pudo deshacer."); } K.refrescar(); });
  },
  async borrar(id){
    const m = K.diario.mediciones.find(x => x.id === id); if (!m) return;
    try { await K.diario.borrar(id); } catch (err) { K.aviso("No se pudo borrar."); return; }
    K.refrescar();
    K.deshacer("Borraste una marca", async () => { try { await K.diario.devolver(m); } catch (err) { K.aviso("No se pudo deshacer."); } K.refrescar(); });
  }
};
