/* ===== Ejercicios: la biblioteca, para ver cómo se hace cada uno sin entrenar =====
   Vive en Planes: #/planes/ejercicios (la lista) · #/planes/ejercicios/<id> (uno abierto). Se llega por las puertas del estante
   de Ejercicios, por las caras de una rutina y por el nombre de cada ejercicio en Hoy y en los días de una rutina.
   La lista va por lo que trabaja (un menú) y con qué (otro menú), con la misma fila que las pruebas y las rutinas.
   El ejercicio: la persona haciéndolo, lo que trabaja en el cuerpo, cómo se hace, tu mejor marca, su escalera, la prueba que lo mide,
   lo que enciende y las rutinas que lo usan. En horizontal, la lista a la izquierda y el abierto a la derecha, como Ajustes.
   Nada se guarda, salvo lo elegido en los menús: todo sale del catálogo (K.biblio) y del diario. ===== */

/* el grupo de un ejercicio, con su nombre y su familia: [id, nombre, familia] */
K.ejGrupo = id => K.biblio.grupo(K.biblio.grupoDe(id, K.EJ)) || K.biblio.GRUPOS[5];

/* tus veces con un ejercicio: las series de tus sesiones (las de una prueba también son series) y las marcas anotadas a mano */
K.ejVeces = id => {
  const xs = [];
  for (const s of K.diario.sesiones) for (const b of s.bloques || []) for (const x of b.series || []) if (x.ejercicio === id && Number.isFinite(x.valor) && K.cielo.TIPOS[x.tipo] && x.completa !== false) xs.push({fecha: s.fecha, tipo: x.tipo, valor: x.valor});
  for (const m of K.diario.mediciones) if (m.ejercicio === id && Number.isFinite(m.valor) && K.cielo.TIPOS[m.tipo]) xs.push({fecha: m.fecha, tipo: m.tipo, valor: m.valor});
  return xs;
};
/* la mejor, en lo que más se midió (repeticiones, segundos o km), con cuántos días y la última vez */
K.ejMejor = vs => {
  if (!vs.length) return null;
  const n = {}; for (const v of vs) n[v.tipo] = (n[v.tipo] || 0) + 1;
  const tipo = Object.keys(n).sort((a, b) => n[b] - n[a])[0], menos = K.cielo.TIPOS[tipo].mejor === "menos";
  const xs = vs.filter(v => v.tipo === tipo), m = xs.reduce((a, v) => (menos ? v.valor < a.valor : v.valor > a.valor) ? v : a);
  return {...m, txt: K.cielo.corto({tipo}, m.valor), dias: new Set(vs.map(v => v.fecha)).size, ultima: vs.map(v => v.fecha).sort().pop()};
};

/* ===== Los menús: qué trabaja y con qué (lo elegido queda para la próxima vez).
   «Todo» va sin marca en los dos; cada equipo lleva su ícono, el mismo de Tu equipo; sin nada, la persona sola. ===== */
const ejQue = () => { const v = K.prefs.get("ejercicios.que", "todo"); return K.biblio.grupo(v) ? v : "todo"; };
const ejCon = () => { const v = K.prefs.get("ejercicios.con", "todo"), tengo = !!K.diario.perfil.equipo;
  return v === "tuyo" ? (tengo ? v : "todo") : v === "nada" || v === "todo" || K.EQUIPOS.some(e => e[0] === v) ? v : "todo"; };
const queTx = id => id === "todo" ? "Todo" : K.biblio.grupo(id)[1];
const conTx = id => id === "todo" ? "Con cualquier cosa" : id === "tuyo" ? "Con lo que tenés" : id === "nada" ? "Sin nada" : `Con ${K.equipoNombre(id).toLowerCase()}`;
/* las puertas del estante de Ejercicios eligen el grupo antes de abrir la lista */
K.ejElegirQue = que => K.prefs.set("ejercicios.que", que === "todo" || K.biblio.grupo(que) ? que : "todo");
K.ejMenu = btn => {
  const volverArriba = () => { K.ir("#/planes/ejercicios", true); K.refrescar(); scrollTo(0, 0); const l = K.$(".split>.lado"); if (l) l.scrollTop = 0; };
  if (btn.id === "ej-que"){ const v = ejQue();
    K.menu.abrir(btn, {titulo: "Qué trabaja", items: [{id: "todo", texto: "Todo", elegido: v === "todo"}, ...K.biblio.GRUPOS.map(([id, t, f]) => ({id, texto: t, color: `var(--${f})`, elegido: v === id}))],
      elegir: id => { K.prefs.set("ejercicios.que", id); volverArriba(); }});
    return; }
  const v = ejCon(), tengo = !!K.diario.perfil.equipo;
  K.menu.abrir(btn, {titulo: "Con qué", items: [{id: "todo", texto: conTx("todo"), elegido: v === "todo"}, ...(tengo ? [{id: "tuyo", texto: conTx("tuyo"), ic: "caja", elegido: v === "tuyo"}] : []),
      {id: "nada", texto: conTx("nada"), ic: "persona", elegido: v === "nada"}, ...K.EQUIPOS.map(([id]) => ({id, texto: conTx(id), ic: id === "lastre" ? "peso" : id, elegido: v === id}))],
    elegir: id => { K.prefs.set("ejercicios.con", id); volverArriba(); }});
};
const pasa = (x, que, con) => {
  if (que !== "todo" && K.ejGrupo(x.id)[0] !== que) return false;
  const eq = x.equipo || [];
  if (con === "nada") return !eq.length;
  if (con === "tuyo") return eq.every(e => K.diario.perfil.equipo.includes(e));
  if (con !== "todo") return eq.includes(con);
  return true;
};
/* con qué se hace, con mayúscula: «Barra», «Barra y paralelas» */
const conQue = eq => eq.length ? K.pide(eq).replace(/^./, c => c.toUpperCase()) : "";
/* lo que va debajo del nombre: con qué se hace o, si pide algo que no marcaste, «Pide barra» */
const ejSub = x => { const eq = x.equipo || [], q = K.diario.perfil.equipo, falta = q ? eq.filter(e => !q.includes(e)) : [];
  return falta.length ? `Pide ${K.pide(falta)}` : conQue(eq); };
const ejFila = (x, sel) => { const [, , fam] = K.ejGrupo(x.id), m = K.ejMejor(K.ejVeces(x.id)), sub = ejSub(x);
  return `<button type="button" class="ajr" data-ir="#/planes/ejercicios/${x.id}" data-quieto="1"${sel === x.id ? " data-sel" : ""}><span class="tile ico-tile">${K.icono.ejercicio(x.id, fam, 40)}</span>
    <span class="ses-fila">${K.nw(x.nombre)}${sub ? `<small class="mute">${K.esc(sub)}</small>` : ""}</span><em class="num">${m ? K.esc(m.txt) : ""}</em>${K.ic("chev", "chev")}</button>`; };

K.P.ejercicios = r => {
  const que = ejQue(), con = ejCon(), todos = K.EJERCICIOS.ejercicios, xs = todos.filter(x => pasa(x, que, con));
  const orden = (a, b) => a.nombre.localeCompare(b.nombre, "es");
  const grupos = K.biblio.GRUPOS.map(([g, t, f]) => ({g, t, f, ys: xs.filter(x => K.ejGrupo(x.id)[0] === g).sort(orden)})).filter(y => y.ys.length);
  /* en horizontal algo queda abierto: el elegido o el primero de la lista */
  const sel = r.sub2 && K.EJ[r.sub2] ? r.sub2 : K.horizontal() && grupos.length ? grupos[0].ys[0].id : "";
  const filtros = `<div class="pl-fila ej-filtros"><button type="button" class="pl-fam" id="ej-que" aria-haspopup="menu" aria-expanded="false" aria-label="Qué trabaja: ${K.esc(queTx(que))}"><span>${K.esc(queTx(que))}</span>${K.ic("chevd")}</button>
    <button type="button" class="pl-fam" id="ej-con" aria-haspopup="menu" aria-expanded="false" aria-label="Con qué: ${K.esc(conTx(con))}"><span>${K.esc(conTx(con))}</span>${K.ic("chevd")}</button></div>`;
  /* por lo que trabaja, con su etiqueta, el punto de su familia y cuántos son */
  const lista = grupos.map(({g, t, f, ys}) => `<section class="fam ej-grupo" id="ej-g-${g}"><span class="lb tg"><i class="dot" style="--c:var(--${f})"></i>${K.jer(K.esc(t), ys.length)}</span><div class="aj">${ys.map(x => ejFila(x, sel)).join("")}</div></section>`).join("");
  const n = xs.length === todos.length ? `${todos.length} ejercicios` : `${xs.length} de ${todos.length} ejercicios`;
  const lado = K.enc({titulo: "Ejercicios", sub: n, volver: "#/planes"}) + filtros + (lista || `<p class="mute small pl-nada">Nada con esto. Probá con otro equipo.</p>`);
  return `<div class="split ej-split${r.sub2 ? " en-detalle" : ""}"><div class="lado">${lado}</div><div class="abierto">${sel ? K.P.ejercicio(sel) : ""}</div></div>`;
};

/* de dónde se vino: volver lleva a la pantalla anterior (Hoy, una rutina, otro ejercicio); sin anterior, a la lista */
const ejVolver = () => { const P = K._pila || [], a = P[P.length - 2]; return a && a !== location.hash ? a : "#/planes/ejercicios"; };

/* ===== Un ejercicio ===== */
K.P.ejercicio = id => {
  const x = K.ej(id), [, gt, fam] = K.ejGrupo(id), eq = x.equipo || [], q = K.diario.perfil.equipo, falta = q ? eq.filter(e => !q.includes(e)) : [];
  const enc = K.enc({titulo: x.nombre, sub: gt, volver: K.horizontal() ? "#/planes/ejercicios" : ejVolver(), raiz: true, det: true});
  /* la persona haciéndolo, grande y moviéndose, como en la serie */
  const fig = K.POSES[id] ? `<div class="ej-fig">${K.fig.grande(id, fam)}</div>` : "";
  /* lo que trabaja: el cuerpo, de frente y de espaldas, como en las rutinas */
  const z = K.biblio.pesoDe(id, K.EJ), hay = Object.keys(z).length;
  const cuerpo = hay ? `<section class="cd ru-vista ej-vista" style="--c:var(--${fam})"><div class="ru-v-top">${K.cuerpo(z, fam, {alto: 140})}<div class="ru-v-tx"><span class="lb">Qué trabaja</span>${K.zonasTx(z)}</div></div></section>` : "";
  /* cómo se hace: la indicación de la sesión, con qué y cómo se cuenta */
  const como = `<section class="cd ej-como"><span class="lb">Cómo se hace</span><p>${K.esc(x.indicacion)}</p>
    <span class="ln small"><span class="mute">Con</span><span>${eq.length ? K.esc(conQue(eq)) : "Nada"}</span></span>
    <span class="ln small"><span class="mute">Se cuenta</span><span>${x.mide === "segundos" ? "En segundos" : x.mide === "km" ? "En kilómetros" : "En repeticiones"}${x.lado ? ", de cada lado" : ""}</span></span></section>
    ${falta.length ? `<p class="aviso-tenue">Pide ${K.esc(K.pide(falta))}. Si lo tenés, marcalo en tu equipo.</p>` : ""}`;
  /* tu mejor marca, en cuántos días y la última vez */
  const m = K.ejMejor(K.ejVeces(id));
  const marca = `<section class="cd ej-marca"><div class="ln"><span class="lb">Tu mejor marca</span>${m ? `<span class="num ej-mejor">${K.esc(m.txt)}</span>` : ""}</div>${m
    ? `<span class="ln mute small"><span>${m.dias} ${m.dias === 1 ? "día" : "días"}</span><span>${K.jer("La última", K.esc(K.fechaCorta(m.ultima)))}</span></span>` : `<p class="mute small">Todavía no lo hiciste.</p>`}</section>`;
  /* su escalera, de más fácil a más difícil: este marcado, los de al lado y el tuyo */
  const en = K.caminos.enEscaleras(id)[0];
  let escalera = "";
  if (en){
    const st = K.rutina.escalonDe(en.e.id, {...K.ctxRutina(), desde: K.desdeTuNivel()?.[en.e.id]}), tuyo = st ? st.paso.k ?? -1 : -1;
    const filas = en.e.pasos.map((p, k) => { const es = k === en.k, e2 = es ? id : p.ejercicio;
      const nota = es && k === tuyo ? K.jer("Este", "el tuyo") : es ? "Este" : k === tuyo ? "El tuyo" : k === en.k - 1 ? "Más fácil" : k === en.k + 1 ? "Más difícil" : "";
      const ic = `<span class="tile ico-tile">${K.icono.ejercicio(e2, fam, 40)}</span>`, nom = `<span class="ses-fila">${K.nw(K.ej(e2).nombre)}<small class="mute">Escalón ${k + 1}</small></span>`;
      return es ? `<div class="ajr ej-este" aria-current="true">${ic}${nom}<em class="num">${nota}</em><span></span></div>`
        : `<button type="button" class="ajr" data-ir="#/planes/ejercicios/${e2}" data-quieto="1">${ic}${nom}<em class="num">${nota}</em>${K.ic("chev", "chev")}</button>`; }).join("");
    escalera = `<span class="lb pie">${K.jer(`Escalera de ${K.esc(en.e.nombre.toLowerCase())}`, `${en.e.pasos.length} escalones`)}</span><section class="aj ej-esc">${filas}</section>`;
  }
  /* la prueba que lo mide: su medalla, con su tema y su nivel */
  const hs = K.HAZANAS.hazanas.filter(h => h.mide && h.mide.ejercicio === id);
  const pruebas = hs.length ? `<span class="lb pie">${hs.length > 1 ? "Las pruebas que lo miden" : "La prueba que lo mide"}</span><section class="aj">${hs.map(h => { const t = K.biblio.grupo(h.tema);
    return `<button type="button" class="ajr" data-ir="#/planes/pruebas/${h.id}"><span class="tile ico-tile">${K.medallaNivel(h, 40)}</span>
      <span class="ses-fila">${K.esc(h.nombre)}<small class="mute">${K.jer(K.esc(t ? t[1] : "Prueba"), h.nivel ? K.biblio.NIVELES[h.nivel - 1].toLowerCase() : "")}</small></span><em></em>${K.ic("chev", "chev")}</button>`; }).join("")}</section>` : "";
  /* las estrellas que enciende, con su constelación en su anillo */
  const cielo = K.cieloActual();
  const est = cielo.constelaciones.flatMap(c => c.estrellas.filter(e => e.prueba.ejercicio === id).map(e => ({c, e})));
  const enciende = est.length ? `<span class="lb pie">Enciende</span><section class="aj">${est.map(({c, e}) => K.estFila(c, e, K.jer(K.esc(c.nombre), `m${e.magnitud}`), e.encendida ? "Encendida" : e.estado === "proxima" ? "La próxima" : "")).join("")}</section>` : "";
  /* las rutinas que lo usan, directo o por su escalera (con su nivel, como en el estante) */
  const escs = new Set(K.caminos.enEscaleras(id).map(y => y.e.id)), nombra = b => JSON.stringify([b.ejercicio, b.tramos, b.items]).includes(`"${id}"`);
  const rs = K.RUTINAS.filter(r => r.sesiones.some(s => s.bloques.some(b => [].concat(b.escalera || []).some(e => escs.has(e)) || nombra(b))))
    .sort((a, b) => a.nivel - b.nivel || a.nombre.localeCompare(b.nombre, "es"));
  const rutinas = rs.length ? `<span class="lb pie">${K.jer("Rutinas que lo usan", rs.length)}</span><section class="aj">${rs.map(r => `<button type="button" class="ajr" data-ir="#/planes/rutinas/${r.id}"><span class="tile ico-tile">${K.icono.rutina(r, 40)}</span>
    <span class="ses-fila">${K.esc(r.nombre)}<small class="mute">${K.biblio.NIVELES[r.nivel - 1]}</small></span><em class="nv-em">${K.nivelIc(r.nivel)}</em>${K.ic("chev", "chev")}</button>`).join("")}</section>` : "";
  return enc + `<div class="ej" style="--c:var(--${fam})">${fig}${cuerpo}${como}${marca}${escalera}${pruebas}${enciende}${rutinas}</div>`;
};
