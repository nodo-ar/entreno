/* ===== Bienvenida: la primera vez que abrís Kozmos. Qué querés entrenar → con qué y cuánto tiempo → tu nivel → tu primer día =====
   Va arriba de la app, en su propia capa (#bv), con su propio giro de pantallas (el de las pestañas) y el iris al entrar a la prueba
   y a la sesión. El logo cuenta la historia: el disco es tu cosmos, el hueco sos vos, el punto es la estrella que buscás.
   · Se muestra si este teléfono todavía no tiene nada: ni sesiones, ni marcas, ni rumbo, ni rutina, ni la bienvenida hecha.
     Quien ya usa la app no la ve. Las pruebas de la suite la marcan como vista (prefs «bienvenida»).
   · Lo elegido se guarda al llegar a «Tu primer día», todo junto: equipo, minutos, días, rumbo, nivel y la fecha de la bienvenida.
     La prueba, si la hacés, queda como una sesión de prueba (la misma que deja Planes).
   · Si se cierra a la mitad, al abrir de nuevo sigue en el mismo paso con lo elegido (un borrador en este teléfono).
   Detalle en /mnt/project-files/kozmos-bienvenida/detalles.md y en el acta 035. */
K.bienvenida = (() => {
  const E = "cubic-bezier(.2,.7,.2,1)", VUELO = "cubic-bezier(.5,0,.2,1)", BORRADOR = "kozmos.bienvenida.v1";
  const wait = ms => new Promise(ok => setTimeout(ok, ms));
  const quieto = () => K.reduce();
  /* toda animación pasa por acá: con menos movimiento, solo fundidos cortos */
  const an = (el, kf, o = {}) => {
    if (!el) return Promise.resolve();
    if (quieto()){ const fin = kf[kf.length - 1]; if (fin.opacity === undefined && !o.siempre) return Promise.resolve(); return el.animate([{opacity: kf[0].opacity ?? 1}, {opacity: fin.opacity ?? 1}], {duration: Math.min(180, o.duration || 180), fill: "both"}).finished.catch(() => {}); }
    return el.animate(kf, {easing: E, fill: "both", ...o}).finished.catch(() => {});
  };
  const h = (tag, cls, html) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html !== undefined) d.innerHTML = html; return d; };
  /* la vibración de la app: respeta Avisos */
  const vibrar = ms => { if (!["todo", "vibra"].includes(K.prefs.get("avisos", "todo"))) return; try { if (!K.apk?.vibrar(ms)) navigator.vibrate?.(ms); } catch (e) {} };
  const fv = f => `--c:var(--${f});--c-soft:var(--${f}-soft);--c-disco:var(--${f}-disco)`;
  const logo = px => `<svg class="b-logo" viewBox="0 0 84 84" width="${px}" height="${px}" aria-hidden="true"><circle class="d" cx="42" cy="42" r="34" fill="var(--ink)"/><circle class="o" cx="42" cy="42" r="34" fill="none" stroke="var(--ink)" stroke-width="1.4" stroke-dasharray="1.5 4" opacity="0"/><circle class="h" cx="42" cy="42" r="9" fill="var(--bg)"/><g class="g"><circle class="e" cx="60" cy="24" r="4" fill="var(--bg)"/></g></svg>`;
  const centrar = (...xs) => xs.forEach(x => { if (x){ x.style.transformBox = "fill-box"; x.style.transformOrigin = "center"; } });

  /* lo que se elige */
  const FAM = [
    {f: "fu", nom: "Fuerza", tx: "Empujar, tirar y sostener tu propio peso.", fig: "flexion"},
    {f: "mo", nom: "Resistencia", tx: "Correr, pedalear o saltar más tiempo sin cansarte.", fig: "trote"},
    {f: "ra", nom: "Flexibilidad", tx: "Moverte más suelto: cadera, espalda y piernas.", fig: "pike-alcance"}];
  /* el rumbo que arma la bienvenida: las constelaciones de cada cosa que elegiste, las que tu equipo permite */
  const RUMBO = {fu: ["planche", "un-brazo", "parada-de-manos", "draco", "una-pierna", "front-lever", "muscle-up", "bandera"], mo: ["diez-km", "motor", "soga"], ra: ["espagat", "puente"]};
  /* la prueba de un minuto, según lo primero que elegiste */
  const PRUEBA = {fu: "cefeo", ra: "casiopea"};
  const ALC = [[-10, "Llego a las canillas"], [0, "Toco los pies"], [5, "Paso los pies unos dedos"], [10, "Paso los pies con la palma"], [15, "Apoyo las palmas más allá"]];
  const BALDE = v => v < 10 ? "0-9" : v < 20 ? "10-19" : v < 30 ? "20-29" : v < 40 ? "30-39" : "40+";
  const R = 46;

  let S = null, raiz = null, tel = null, arriba = null, actual = null, pila = [], ocupado = false;
  const nuevo = () => ({que: [], eq: [], eqVisto: false, min: 30, dias: 3, niveles: {}, test: null, sesion: null});

  /* ===== cuándo se muestra y el borrador ===== */
  const fresco = () => { const d = K.diario, p = d.perfil; return !d.sesiones.length && !d.mediciones.length && !(p.rumbo || []).length && !p.rutina && !p.equipo && !p.nivel; };
  const leerB = () => { try { return JSON.parse(localStorage.getItem(BORRADOR)); } catch (e) { return null; } };
  const guardarB = paso => { try { localStorage.setItem(BORRADOR, JSON.stringify({paso, pila, S})); } catch (e) {} };
  const borrarB = () => { try { localStorage.removeItem(BORRADOR); } catch (e) {} };
  const toca = () => K.diario.guarda && !K.diario.perfil.bienvenida && K.prefs.get("bienvenida") !== "vista" && !K.sesion.activa() && (fresco() || !!leerB());

  /* ===== las pantallas: cada paso tiene nombre (y un número, si es uno de los movimientos), así se apilan y se retoman ===== */
  const PASOS = {que: () => que(), equipo: () => equipo(), tiempo: () => tiempo(), como: () => como(), mov: i => mov(i), resumen: () => resumen(), nivel: () => nivel(), prueba: () => prueba(), dia: () => dia()};
  const montar = (cls, html) => { const p = h("section", "b-pan " + cls, html); tel.appendChild(p); setTimeout(() => K.fig.animar(), 30); return p; };
  const pasos = n => `<div class="b-pasos" role="img" aria-label="Paso ${n} de 3">${[1, 2, 3].map(k => `<i class="${k < n ? "si ya" : k === n ? "si ahora" : ""}"></i>`).join("")}</div>`;
  const entrada = (p, sel) => { if (quieto()) return; p.querySelectorAll(sel).forEach((x, k) => an(x, [{opacity: 0, transform: "translateY(18px)"}, {opacity: 1, transform: "none"}], {duration: 460, delay: 60 + k * 70})); };
  const volverVisible = si => arriba.querySelector(".b-atras").classList.toggle("oculto", !si);
  const mostrarPaso = (paso, arg) => { const p = PASOS[paso](arg); p._paso = [paso, arg]; actual = p; guardarB([paso, arg]); volverVisible(pila.length > 0 && !p.classList.contains("sinvolver")); return p; };

  /* cambiar de paso: la pantalla gira sobre un centro lejano, debajo del teléfono (como las pestañas). Volver gira al revés */
  async function ir(paso, arg, dir = 1, apilar = true){
    if (ocupado) return; ocupado = true;
    const viejo = actual;
    if (apilar && viejo?._paso) pila.push(viejo._paso);
    const p = mostrarPaso(paso, arg);
    if (viejo){
      viejo.style.pointerEvents = p.style.pointerEvents = "none";
      const piv = `50% ${innerHeight * 3}px`, ang = 9 * dir;
      viejo.style.transformOrigin = p.style.transformOrigin = piv;
      an(viejo, [{transform: "none", opacity: 1}, {transform: `rotate(${-ang * .6}deg)`, opacity: 0, offset: .62}, {transform: `rotate(${-ang}deg)`, opacity: 0}], {duration: 340}).then(() => viejo.remove());
      /* sin quedar con la animación puesta: una pantalla con transform haría de marco a su pie fijo */
      await an(p, [{transform: `rotate(${ang}deg)`, opacity: 0}, {transform: "none", opacity: 1}], {duration: 380, fill: "backwards"});
      p.style.pointerEvents = "";
    }
    ocupado = false;
    return p;
  }
  const atras = () => { if (ocupado || !pila.length || actual?.classList.contains("sinvolver")) return false; const [paso, arg] = pila.pop(); ir(paso, arg, -1, false); return true; };

  /* el iris: desde el botón crece el disco del color y su hueco se abre hasta ser la pantalla siguiente (como al empezar la sesión) */
  async function iris(btn, f, paso){
    if (ocupado) return; ocupado = true;
    const viejo = actual; viejo.style.pointerEvents = "none";
    if (!quieto()){
      const r = btn.getBoundingClientRect(), t = tel.getBoundingClientRect(), x = r.left - t.left + r.width / 2, y = r.top - t.top + r.height / 2, RR = Math.hypot(Math.max(x, t.width - x), Math.max(y, t.height - y));
      const d = h("i", "b-iris"), ho = h("i", "b-iris");
      for (const [el, bg] of [[d, `var(--${f})`], [ho, "var(--bg)"]]) Object.assign(el.style, {left: x - RR + "px", top: y - RR + "px", width: 2 * RR + "px", height: 2 * RR + "px", background: bg});
      tel.append(d, ho);
      an(d, [{transform: "scale(0)"}, {transform: "scale(1)"}], {duration: 420});
      await an(ho, [{transform: "scale(0)"}, {transform: "scale(1)"}], {duration: 420, delay: 220});
      setTimeout(() => { d.remove(); ho.remove(); }, 0);
    }
    if (viejo._paso) pila.push(viejo._paso);
    /* el primer día guarda todo antes de mostrarse: el motor de Hoy arma con lo tuyo */
    if (paso === "dia") await guardarPerfil();
    const p = paso === "fin" ? null : mostrarPaso(paso);
    viejo.remove(); ocupado = false;
    return p;
  }

  /* ===== 0 · arranque: el logo se arma y la estrella da una vuelta. Un toque lo adelanta ===== */
  async function arranque(){
    const p = montar("b-arr sinvolver", `${logo(150)}<div class="b-marca-w"><div class="b-marca">Kozmos</div><div class="b-lema">Per aspera ad astra.</div></div>`);
    actual = p; volverVisible(false);
    const s = p.querySelector("svg"), [d, o, ho] = s.querySelectorAll(".d,.o,.h"), g = s.querySelector(".g"), e = s.querySelector(".e");
    centrar(d, o, ho, e); Object.assign(g.style, {transformBox: "view-box", transformOrigin: "42px 42px"});
    const marca = p.querySelector(".b-marca"), lema = p.querySelector(".b-lema");
    let listo = false; const adelantar = new Promise(ok => p.addEventListener("pointerdown", ok, {once: true}));
    if (!quieto()){
      marca.style.opacity = lema.style.opacity = 0;
      an(d, [{transform: "scale(.4)", opacity: 0}, {transform: "scale(1.06)", opacity: 1, offset: .7}, {transform: "scale(1)", opacity: 1}], {duration: 620});
      an(ho, [{transform: "scale(0)"}, {transform: "scale(1)"}], {duration: 420, delay: 260});
      an(e, [{transform: "scale(0)"}, {transform: "scale(1.6)", offset: .6}, {transform: "scale(1)"}], {duration: 480, delay: 520});
      an(g, [{transform: "rotate(0)"}, {transform: "rotate(360deg)"}], {duration: 1300, delay: 900, easing: "cubic-bezier(.6,0,.3,1)"});
      an(marca, [{transform: "translateY(16px)", opacity: 0}, {transform: "none", opacity: 1}], {duration: 520, delay: 700});
      an(lema, [{opacity: 0}, {opacity: 1}], {duration: 600, delay: 1100});
    }
    await Promise.race([wait(quieto() ? 900 : 2400), adelantar]); listo = true;
    if (actual !== p || !listo) return;
    /* el logo se achica y se va arriba: lo que sigue es tuyo */
    if (!quieto()){
      an(marca, [{opacity: 1}, {opacity: 0, transform: "translateY(-10px)"}], {duration: 240});
      an(lema, [{opacity: 1}, {opacity: 0}], {duration: 200});
      an(o, [{opacity: 0, transform: "scale(1)"}, {opacity: 1, transform: "scale(1.25)", offset: .4}, {opacity: 0, transform: "scale(3.2)"}], {duration: 700});
      await an(s, [{transform: "none", opacity: 1}, {transform: "translateY(-330px) scale(.2)", opacity: 0}], {duration: 520, easing: "cubic-bezier(.5,0,.6,1)"});
    }
    p.remove(); actual = null; pila = [];
    entrada(mostrarPaso("que"), ".b-cab, .b-ops > *, .b-pie");
  }

  /* ===== 1 · qué querés entrenar: uno o más; al elegirlo, su anillo se cierra y la persona se pone a moverse ===== */
  const anillo = (lleno, cls = "") => `<svg class="b-anillo ${cls}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--line)" stroke-width="2.4"/><circle class="arc" cx="50" cy="50" r="${R}" fill="none" stroke="var(--c)" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="${lleno ? "100 0" : "0 100"}" transform="rotate(-90 50 50)"/><g class="sat" opacity="${lleno ? 1 : 0}"><circle cx="${50 + R * Math.SQRT1_2}" cy="${50 - R * Math.SQRT1_2}" r="6" fill="var(--c)" stroke="var(--s1)" stroke-width="2.4"/></g></svg>`;
  /* quieta mientras no la elegís; se mueve cuando es tuya */
  const figura = (id, f, vive) => vive ? K.fig.grande(id, f) : K.fig.grande(id, f, .5);
  function que(){
    const p = montar("b-que", `<div class="b-cab">${pasos(1)}<h1>¿Qué querés entrenar?</h1><p class="mute">Elegí uno o más. Lo cambiás cuando quieras.</p></div>
      <div class="b-ops">${FAM.map(x => { const on = S.que.includes(x.f); return `<button type="button" class="b-op${on ? " on" : ""}" data-f="${x.f}" style="${fv(x.f)}" aria-pressed="${on}"><div class="b-cv">${anillo(on)}<div class="b-dentro">${figura(x.fig, x.f, on)}</div></div><div><b>${x.nom}</b><span>${x.tx}</span></div></button>`; }).join("")}</div>
      <div class="b-pie"><button type="button" class="btn" id="b-seguir"${S.que.length ? "" : " disabled"}>Seguir</button></div>`);
    p.querySelectorAll(".b-op").forEach(b => b.onclick = () => tocarQue(p, b));
    p.querySelector("#b-seguir").onclick = () => { if (S.que.length) ir("equipo"); };
    return p;
  }
  function tocarQue(p, b){
    const f = b.dataset.f, x = FAM.find(y => y.f === f), on = !S.que.includes(f);
    /* el orden en que elegís importa: lo primero decide la prueba */
    S.que = on ? [...S.que, f] : S.que.filter(y => y !== f); vibrar(on ? 12 : 6); guardarB(actual._paso);
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
    b.querySelector(".b-dentro").innerHTML = figura(x.fig, x.f, on); setTimeout(() => K.fig.animar(), 20);
    const arc = b.querySelector(".arc"), sat = b.querySelector(".sat"), cv = b.querySelector(".b-cv");
    sat.style.transformBox = "view-box"; sat.style.transformOrigin = "50px 50px";
    arc.setAttribute("stroke-dasharray", on ? "100 0" : "0 100"); sat.setAttribute("opacity", on ? 1 : 0);
    if (on){
      /* el anillo se cierra dando la vuelta y el punto del logo llega orbitando a su lugar, arriba a la derecha */
      an(arc, [{strokeDasharray: "0 100"}, {strokeDasharray: "100 0"}], {duration: 560, fill: "none"});
      an(sat, [{transform: "rotate(-405deg)", opacity: 0}, {transform: "rotate(-405deg)", opacity: 1, offset: .05}, {transform: "rotate(0)", opacity: 1}], {duration: 560, fill: "none"});
      an(cv, [{transform: "scale(1)"}, {transform: "scale(1.08)", offset: .4}, {transform: "none"}], {duration: 420, fill: "none"});
    } else {
      an(arc, [{strokeDasharray: "100 0"}, {strokeDasharray: "0 100"}], {duration: 300, fill: "none"});
      an(sat, [{opacity: 1, transform: "none"}, {opacity: 0, transform: "scale(.4)"}], {duration: 200, fill: "none"});
    }
    p.querySelector("#b-seguir").disabled = !S.que.length;
  }

  /* ===== 2 · qué tenés: todo tu equipo, el mismo de la app; «Nada, solo el piso» es no tener nada. La marca es el logo, que se arma ===== */
  const marca = si => si ? `<svg class="b-mk" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="34" fill="var(--ink)"/><circle cx="42" cy="42" r="9" fill="var(--s1)"/><circle cx="60" cy="24" r="4.5" fill="var(--s1)"/></svg>`
    : `<svg class="b-mk" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="32" fill="none" stroke="var(--off)" stroke-width="5"/></svg>`;
  function armarMarca(s){ const [d, ho, e] = s.querySelectorAll("circle"); centrar(d, ho, e);
    an(d, [{transform: "scale(.3)"}, {transform: "scale(1.1)", offset: .6}, {transform: "none"}], {duration: 360});
    an(ho, [{transform: "scale(0)"}, {transform: "none"}], {duration: 260, delay: 120});
    an(e, [{transform: "scale(0)"}, {transform: "scale(1.5)", offset: .6}, {transform: "none"}], {duration: 300, delay: 240}); }
  function equipo(){
    const piso = !S.eq.length && S.eqVisto;
    const it = (id, nom, on) => `<button type="button" class="b-eq${on ? " on" : ""}" data-id="${id}" aria-pressed="${on}"><span class="tile">${K.ic(id === "piso" ? "persona" : id === "lastre" ? "peso" : id)}</span><b>${K.esc(nom)}</b>${marca(on)}</button>`;
    const p = montar("b-equipo", `<div class="b-cab">${pasos(2)}<h1>¿Qué tenés para entrenar?</h1><p class="mute">Marcá todo lo que tengas. Se cambia cuando quieras.</p></div>
      <div class="b-eqs">${it("piso", "Nada, solo el piso", piso)}<div class="b-eqg">${K.EQUIPOS.map(([id, nom]) => it(id, nom, S.eq.includes(id))).join("")}</div></div>
      <div class="b-pie"><button type="button" class="btn" id="b-seguir"${S.eq.length || piso ? "" : " disabled"}>Seguir</button></div>`);
    const poner = (b, on) => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); b.querySelector(".b-mk").outerHTML = marca(on); if (on) armarMarca(b.querySelector(".b-mk")); };
    p.querySelectorAll(".b-eq").forEach(b => b.onclick = () => {
      const id = b.dataset.id, pb = p.querySelector('.b-eq[data-id="piso"]'); vibrar(10); S.eqVisto = true;
      if (id === "piso"){ S.eq = []; p.querySelectorAll(".b-eq.on").forEach(o => o !== b && poner(o, false)); if (!b.classList.contains("on")) poner(b, true); }
      else { const on = !S.eq.includes(id); S.eq = on ? [...S.eq, id] : S.eq.filter(x => x !== id); poner(b, on); if (pb.classList.contains("on")) poner(pb, false); }
      p.querySelector("#b-seguir").disabled = !S.eq.length && !pb.classList.contains("on"); guardarB(actual._paso); });
    p.querySelector("#b-seguir").onclick = () => ir("tiempo");
    entrada(p, ".b-cab, .b-eqs > .b-eq, .b-eqg > *, .b-pie");
    return p;
  }

  /* ===== 2b · cuánto tiempo: un reloj de una hora; girás el punto con el dedo, de a cinco minutos. Debajo, los días por semana ===== */
  function tiempo(){
    const p = montar("b-tiempo", `<div class="b-cab">${pasos(2)}<h1>¿Cuánto tiempo tenés?</h1><p class="mute">Por día. Girá el punto.</p></div>
      <div class="b-dial" role="slider" aria-label="Minutos por día" aria-valuemin="10" aria-valuemax="60" aria-valuenow="${S.min}" tabindex="0"><svg viewBox="0 0 100 100" aria-hidden="true">
        ${Array.from({length: 12}, (_, k) => { const a = k / 12 * 2 * Math.PI, r1 = 39, r2 = k % 3 ? 41.5 : 42.5; return `<line class="tick" data-k="${k}" x1="${(50 + r1 * Math.sin(a)).toFixed(2)}" y1="${(50 - r1 * Math.cos(a)).toFixed(2)}" x2="${(50 + r2 * Math.sin(a)).toFixed(2)}" y2="${(50 - r2 * Math.cos(a)).toFixed(2)}" stroke="var(--ink-3)" stroke-width="${k % 3 ? .8 : 1.4}" stroke-linecap="round"/>`; }).join("")}
        <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--s2)" stroke-width="5"/>
        <circle class="arc" cx="50" cy="50" r="${R}" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round" pathLength="100" transform="rotate(-90 50 50)"/>
        <g class="sat"><circle cx="50" cy="${50 - R}" r="6.5" fill="var(--ink)"/><circle cx="50" cy="${50 - R}" r="2.4" fill="var(--bg)"/></g></svg>
        <div class="b-cen"><b class="reloj">${S.min}</b><span>minutos</span></div></div>
      <div class="b-dias"><button type="button" class="b-mm" id="b-dmenos" aria-label="Un día menos">−</button><div class="b-tx"><b class="num">${S.dias}</b><span>días por semana</span></div><button type="button" class="b-mm" id="b-dmas" aria-label="Un día más">+</button></div>
      <div class="b-pie"><button type="button" class="btn" id="b-seguir">Seguir</button></div>`);
    const dial = p.querySelector(".b-dial"), arc = dial.querySelector(".arc"), sat = dial.querySelector(".sat"), num = dial.querySelector(".b-cen b");
    Object.assign(sat.style, {transformBox: "view-box", transformOrigin: "50px 50px"});
    const pintar = m => { arc.setAttribute("stroke-dasharray", `${(m / 60 * 100).toFixed(2)} 100`); sat.style.transform = `rotate(${m / 60 * 360}deg)`;
      dial.querySelectorAll(".tick").forEach(t => t.setAttribute("stroke", +t.dataset.k * 5 <= m ? "var(--ink)" : "var(--ink-3)")); };
    let m = S.min; pintar(m);
    /* llega dando la vuelta desde cero */
    if (!quieto()){ const t0 = performance.now(); const f = t => { const x = Math.min(1, (t - t0) / 900), e = 1 - (1 - x) ** 3; if (!tomado) pintar(Math.max(.01, S.min * e)); if (x < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
    const poner = nm => { nm = Math.max(10, Math.min(60, nm)); if (nm !== S.min){ S.min = nm; num.textContent = nm; vibrar(5); an(num, [{transform: "scale(1.06)"}, {transform: "none"}], {duration: 160, fill: "none"}); guardarB(actual._paso); } dial.setAttribute("aria-valuenow", nm); };
    let tomado = false;
    const angulo = ev => { const r = dial.getBoundingClientRect(), a = Math.atan2(ev.clientX - (r.left + r.width / 2), -(ev.clientY - (r.top + r.height / 2))) * 180 / Math.PI; return (a + 360) % 360; };
    const mover = ev => { if (!tomado) return; const a = angulo(ev);
      /* sin saltar de 60 a 0 al pasar por arriba: se frena en las puntas */
      let mm = a / 360 * 60; if (S.min >= 55 && a < 90) mm = 60; else if (S.min <= 15 && a > 270) mm = 10;
      m = Math.max(10, Math.min(60, mm)); pintar(m); poner(Math.round(m / 5) * 5); };
    dial.addEventListener("pointerdown", ev => { tomado = true; dial.setPointerCapture?.(ev.pointerId); mover(ev); });
    dial.addEventListener("pointermove", mover);
    const soltar = () => { if (!tomado) return; tomado = false; const de = m, a = S.min, t0 = performance.now(); const f = t => { const x = quieto() ? 1 : Math.min(1, (t - t0) / 200); m = de + (a - de) * x; pintar(m); if (x < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
    dial.addEventListener("pointerup", soltar); dial.addEventListener("pointercancel", soltar);
    dial.addEventListener("keydown", ev => { const d = {ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5}[ev.key]; if (d){ ev.preventDefault(); poner(S.min + d); m = S.min; pintar(m); } });
    const db = p.querySelector(".b-dias b"), dm = p.querySelector("#b-dmenos"), dM = p.querySelector("#b-dmas");
    const dias = d => { S.dias = Math.max(2, Math.min(6, S.dias + d)); db.textContent = S.dias; dm.disabled = S.dias <= 2; dM.disabled = S.dias >= 6; vibrar(5); guardarB(actual._paso);
      an(db, [{transform: `translateY(${d * -8}px)`, opacity: 0}, {transform: "none", opacity: 1}], {duration: 220, fill: "none"}); };
    dm.onclick = () => dias(-1); dM.onclick = () => dias(1); dm.disabled = S.dias <= 2; dM.disabled = S.dias >= 6;
    p.querySelector("#b-seguir").onclick = () => ir("como");
    entrada(p, ".b-cab, .b-dial, .b-dias, .b-pie");
    return p;
  }

  /* ===== 3 · tu nivel: lo elegís mirando (de entrada) o lo probás. Un nivel por movimiento (K.nivel) ===== */
  const N = () => K.nivel.NIVELES;
  const movs = () => K.nivel.PREGUNTAS.filter(q => !q.pide || S.eq.includes(q.pide));
  const sats = n => `<span class="b-sats" role="img" aria-label="${N()[n]}">${N().map((_, k) => `<i class="${k <= n ? "si" : ""}"></i>`).join("")}</span>`;
  function como(){
    const p = montar("b-como", `<div class="b-cab">${pasos(3)}<span class="lb">Tu nivel</span><h1>¿Desde dónde arrancás?</h1><p class="mute">Kozmos arranca cada ejercicio a tu medida. Elegí cómo lo sabemos.</p></div>
      <div class="b-eqs b-modos"><button type="button" class="b-eq b-modo" id="b-elijo"><span class="tile">${K.ic("persona")}</span><div><b>Lo elijo yo</b><span>Mirás figuras y tocás lo que te sale. Un minuto.</span></div><em class="b-rec">Rápido</em></button>
        <button type="button" class="b-eq b-modo" id="b-pruebo"><span class="tile">${K.ic("reloj")}</span><div><b>Lo pruebo</b><span>Una prueba ahora y el resto en tu primera semana, después de entrar en calor.</span></div></button></div>
      <p class="mute small b-nota">Lo que elijas se corrige solo: si una serie te sobra o te falta, la próxima ajusta.</p>`);
    entrada(p, ".b-cab, .b-modos > *, .b-nota");
    p.querySelector("#b-elijo").onclick = () => S.que.includes("fu") ? ir("mov", 0) : ir("nivel");
    p.querySelector("#b-pruebo").onclick = () => ir("nivel");
    return p;
  }
  function mov(i){
    const ms = movs(), m = ms[i], sel = S.niveles[m.id], k0 = sel === undefined || sel === "nose" ? -1 : +sel;
    const p = montar("b-mov", `<div class="b-cab">${pasos(3)}<span class="lb">${K.esc(m.nombre)}, ${i + 1} de ${ms.length}</span><h1 class="b-q">${K.esc(m.pregunta)}</h1></div>
      <div class="b-figs">${m.niveles.map((n, k) => `<button type="button" class="b-fg${k0 === k ? " on" : ""}" data-k="${k}" style="${fv("fu")}" aria-pressed="${k0 === k}"><div class="b-cv">${anillo(false, "b-solo")}<div class="b-dentro">${figura(n.ej, "fu", k0 === k)}</div></div><b>${K.esc(n.texto)}</b>${sats(k)}<span class="b-nv">${N()[k]}</span></button>`).join("")}</div>
      <div class="b-pie"><button type="button" class="btn b-lnk" id="b-nose">No sé, arranco por el principio</button></div>`);
    const elegir = v => { if (ocupado) return; S.niveles[m.id] = v; vibrar(12); guardarB(actual._paso);
      const k = v === "nose" ? 0 : +v;
      p.querySelectorAll(".b-fg").forEach((b, j) => { const on = j === k && v !== "nose"; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); b.querySelector(".b-dentro").innerHTML = figura(m.niveles[j].ej, "fu", on); });
      setTimeout(() => K.fig.animar(), 20);
      const b = p.querySelector(`.b-fg[data-k="${k}"]`); an(b.querySelector(".b-cv"), [{transform: "scale(1)"}, {transform: "scale(1.08)", offset: .4}, {transform: "none"}], {duration: 380, fill: "none"});
      if (v !== "nose") b.querySelectorAll(".b-sats i.si").forEach((x, j) => an(x, [{transform: "scale(0)"}, {transform: "scale(1.5)", offset: .6}, {transform: "none"}], {duration: 260, delay: j * 70, fill: "none"}));
      /* un momento para ver lo elegido y sigue solo */
      p.style.pointerEvents = "none";
      setTimeout(() => { if (actual === p){ p.style.pointerEvents = ""; i + 1 < ms.length ? ir("mov", i + 1) : ir("resumen"); } }, quieto() ? 250 : 650); };
    p.querySelectorAll(".b-fg").forEach(b => b.onclick = () => elegir(b.dataset.k));
    p.querySelector("#b-nose").onclick = () => elegir("nose");
    entrada(p, ".b-cab, .b-fg, .b-pie");
    return p;
  }
  /* el nivel como lo guarda la app: lo que elegiste por movimiento y, si probaste flexiones, lo que dice la prueba */
  const nivelDe = () => {
    const n = {...S.niveles, ...(S.test && S.test.id === "cefeo" ? (({fecha, ...x}) => x)(K.nivel.normal({flexiones: BALDE(S.test.valor)})) : {})};
    return Object.keys(n).length ? {...n, fecha: K.hoy()} : null;
  };
  /* las estrellas que tu nivel da por hechas, agrupadas por constelación (para mostrar sus anillos) */
  const anillosDadas = (ids, n = 72) => {
    const porC = {}; ids.forEach(id => { const c = id.split(".")[0]; porC[c] = (porC[c] || 0) + 1; });
    const cielo = K.cielo.calcular(K.CATALOGO, [], K.hoy(), [], S.eq);
    return Object.entries(porC).map(([id, k]) => { const c = cielo.constelaciones.find(x => x.id === id); return c ? `<div class="b-cons" style="${fv(c.familia)}">${K.icono.constelacion({...c, encendidas: k}, n, "", {desde: 0})}<b>${K.esc(c.nombre)}</b><small>${k} de ${c.total}</small></div>` : ""; }).join("");
  };
  function resumen(){
    const ms = movs(), nv = nivelDe(), dadas = K.nivel.dadas(nv, S.eq);
    const p = montar("b-res-n", `<div class="b-cab">${pasos(3)}<span class="lb">Tu nivel</span><h1>Así arrancás.</h1></div>
      <div class="b-lista">${ms.map(m => { const v = S.niveles[m.id], k = v === undefined || v === "nose" ? 0 : +v; return `<div class="b-fila"><span class="b-fmini">${K.icono.ejercicio(m.niveles[k].ej, "fu", 44)}</span><b>${K.esc(m.nombre)}</b><em>${v === "nose" ? "Desde el principio" : `${sats(k)} ${N()[k]}`}</em></div>`; }).join("")}</div>
      ${dadas.length ? `<div class="b-prend"><span class="lb">Tu nivel ya enciende ${dadas.length} ${dadas.length === 1 ? "estrella" : "estrellas"}</span><div class="b-consf">${anillosDadas(dadas)}</div></div>` : ""}
      <div class="b-pie"><button type="button" class="btn" id="b-dia">Ver mi primer día</button><button type="button" class="btn b-lnk" id="b-probar">Prefiero probarlo</button></div>`);
    entrada(p, ".b-cab, .b-fila, .b-prend, .b-pie");
    p.querySelector("#b-dia").onclick = ev => iris(ev.currentTarget, "fu", "dia");
    p.querySelector("#b-probar").onclick = () => ir("nivel");
    return p;
  }

  /* ===== 3b · la prueba de un minuto: la de lo primero que elegiste (solo resistencia: va en el primer día) ===== */
  const laPrueba = () => { const f = S.que.find(x => PRUEBA[x]); return f ? K.hzDe(PRUEBA[f]) : null; };
  function nivel(){
    const x = laPrueba();
    if (!x){
      const p = montar("b-niv", `<div class="b-cab">${pasos(3)}<span class="lb">Tu nivel</span><h1>Lo medimos corriendo.</h1><p class="mute">Son 12 minutos a tu ritmo. Va en tu primer día, con el reloj de la app.</p></div>
        <div class="b-cv b-grande" style="${fv("mo")}">${anillo(false)}<div class="b-dentro" style="background:var(--mo-disco)">${K.fig.grande("trote", "mo")}</div></div>
        <div class="b-pie"><button type="button" class="btn" id="b-seguir">Ver mi primer día</button></div>`);
      an(p.querySelector(".arc"), [{strokeDasharray: "0 100"}, {strokeDasharray: "100 0"}], {duration: 900, delay: 200});
      p.querySelector("#b-seguir").onclick = ev => iris(ev.currentTarget, "mo", "dia");
      return p;
    }
    const fam = x.familia;
    const p = montar("b-niv", `<div class="b-cab">${pasos(3)}<span class="lb">Tu nivel</span><h1>Una prueba de un minuto.</h1><p class="mute">Con eso sabemos por dónde arrancás.</p></div>
      <div class="b-cv b-grande" style="${fv(fam)}">${anillo(false)}<div class="b-dentro" style="background:var(--${fam}-disco)">${K.fig.grande(x.mide.ejercicio, fam)}</div></div>
      <div class="b-hz"><b>${K.esc(x.nombre)}</b><p class="mute">${K.esc(x.texto)}</p></div>
      <div class="b-pie"><button type="button" class="btn" id="b-probar">Probar ahora</button><button type="button" class="btn b-lnk" id="b-luego">Ahora no</button></div>`);
    an(p.querySelector(".arc"), [{strokeDasharray: "0 100"}, {strokeDasharray: "100 0"}], {duration: 900, delay: 200});
    p.querySelector("#b-probar").onclick = ev => iris(ev.currentTarget, fam, "prueba");
    p.querySelector("#b-luego").onclick = ev => iris(ev.currentTarget, fam, "dia");
    return p;
  }
  /* la prueba: el anillo es la escala; cada marca que pasás se prende y vibra */
  function prueba(){
    const x = laPrueba(), fam = x.familia, u = K.rutina.umbrales(x, []), top = u[4] + (u[4] - u[3]), base = Math.min(0, u[0] - (u[1] - u[0]));
    const fr = v => Math.max(0, Math.min(1, (v - base) / (top - base)));
    const marcas = u.map((v, k) => { const a = fr(v) * 2 * Math.PI; return `<circle class="mk" data-k="${k}" cx="${(50 + R * Math.sin(a)).toFixed(2)}" cy="${(50 - R * Math.cos(a)).toFixed(2)}" r="3.2" fill="var(--bg)" stroke="var(--c)" stroke-width="1.4"/>`; }).join("");
    const cuenta = x.mide.tipo === "repeticiones"; S.valor = null;
    const p = montar("b-pru sinvolver", `<div class="b-cab"><span class="lb">${K.esc(x.nombre)}</span><h2>${cuenta ? "Todas las que salgan, sin parar." : "Sentado, piernas estiradas."}</h2></div>
      <div class="b-cv b-grande" style="${fv(fam)}"><svg class="b-anillo" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--c-soft)" stroke-width="3.4"/><circle class="arc" cx="50" cy="50" r="${R}" fill="none" stroke="var(--c)" stroke-width="3.4" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 50 50)"/>${marcas}</svg><div class="b-dentro" style="background:var(--${fam}-disco)">${K.fig.grande(x.mide.ejercicio, fam)}</div></div>
      ${cuenta ? `<div class="b-cuenta"><button type="button" class="b-mm" id="b-menos" aria-label="Una menos">−</button><span class="b-marcador num" id="b-n" aria-live="polite">0</span><button type="button" class="b-mm" id="b-mas" aria-label="Una más">+</button></div><p class="mute b-ayuda">Cuando terminás, contalas. O tocá + en cada una.</p>`
        : `<div class="b-alc">${ALC.map(([v, t]) => `<button type="button" data-v="${v}"><span>${t}</span><em class="num">${v > 0 ? "+" : ""}${v} cm</em></button>`).join("")}</div>`}
      <div class="b-pie"><button type="button" class="btn" id="b-listo" disabled>Listo</button></div>`);
    const arc = p.querySelector(".arc"), mks = [...p.querySelectorAll(".mk")], listo = p.querySelector("#b-listo");
    centrar(...mks);
    const pintar = v => { arc.setAttribute("stroke-dasharray", `${(fr(v) * 100).toFixed(2)} 100`);
      mks.forEach((c, k) => { const si = v >= u[k], era = c.getAttribute("fill") === "var(--c)"; c.setAttribute("fill", si ? "var(--c)" : "var(--bg)");
        if (si && !era){ an(c, [{transform: "scale(1)"}, {transform: "scale(2.2)", offset: .4}, {transform: "none"}], {duration: 420, fill: "none"}); vibrar(18); } }); };
    if (cuenta){
      const nEl = p.querySelector("#b-n"); let k = 0;
      const poner = d => { k = Math.max(0, Math.min(150, k + d)); nEl.textContent = k; S.valor = k; pintar(k); listo.disabled = k < 1; if (d > 0) vibrar(4);
        an(nEl, [{transform: d > 0 ? "translateY(-6px)" : "translateY(6px)", opacity: .4}, {transform: "none", opacity: 1}], {duration: 160, fill: "none"}); };
      p.querySelector("#b-mas").onclick = () => poner(1); p.querySelector("#b-menos").onclick = () => poner(-1);
      /* mantener apretado suma rápido: para el que ya las contó */
      let rep; const b = p.querySelector("#b-mas");
      b.addEventListener("pointerdown", () => { rep = setTimeout(function r(){ poner(1); rep = setTimeout(r, 90); }, 450); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(e => b.addEventListener(e, () => clearTimeout(rep)));
    } else {
      p.querySelectorAll(".b-alc button").forEach(b => b.onclick = () => { p.querySelectorAll(".b-alc button").forEach(o => o.classList.toggle("on", o === b));
        const v = +b.dataset.v, de = S.valor ?? base, t0 = performance.now(); S.valor = v; listo.disabled = false; vibrar(8);
        const f = t => { const xx = quieto() ? 1 : Math.min(1, (t - t0) / 500); pintar(de + (v - de) * (1 - (1 - xx) ** 3)); if (xx < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    }
    listo.onclick = () => { if (!ocupado && S.valor !== null) resultado(p); };
    return p;
  }

  /* la prueba queda como una sesión de prueba, igual que la que deja Planes: la ve Progreso y enciende lo que pasaste */
  async function guardarPrueba(x, v){
    const plan = K.rutina.deHazana(x, {ej: K.EJ, equipo: K.rutina.conPesa(S.eq)}), b = plan.bloques[0], ahora = new Date(), id = K.diario.nuevoId();
    const serie = {ejercicio: x.mide.ejercicio, tipo: x.mide.tipo, ...(b.estrella ? {estrella: b.estrella} : {}), objetivo: b.objetivo, valor: v, hazana: x.id};
    const r = {id, fecha: K.hoy(), inicio: new Date(ahora - 60000).toISOString(), fin: ahora.toISOString(), duracion: 60, cortada: false, catalogo: K.CATALOGO.version,
      hazana: {...plan.hazana, valor: v, completa: true, ...(plan.hazana.v === 2 ? {ejercicio: x.mide.ejercicio, tipo: x.mide.tipo} : {})},
      bloques: [{orden: 0, ...(b.constelacion ? {constelacion: b.constelacion} : {}), ...(b.constelaciones ? {constelaciones: b.constelaciones} : {}), familia: b.familia, ...(b.estrella ? {estrella: b.estrella} : {}), objetivo: b.objetivo, hazana: b.hazana, series: [serie]}]};
    const ms = K.diario.mediciones, ss = K.diario.sesiones;
    r.encendio = K.cielo.nuevas(K.CATALOGO, ms, ms, K.hoy(), ss, [...ss, r]).map(n => n.estrella.id);
    if (S.sesion){ try { await K.diario.borrarSesion(S.sesion); } catch (e) {} }
    await K.diario.guardarSesion(r);
    S.sesion = id; S.test = {id: x.id, valor: v};
    return r;
  }

  /* ===== el resultado: el anillo se cierra en un punto, el punto sube y se prende tu primera estrella, con su magnitud ===== */
  async function resultado(viejo){
    ocupado = true;
    const x = laPrueba(), fam = x.familia, v = S.valor, m = K.rutina.magnitud(x, v, []), u = K.rutina.umbrales(x, []);
    let reg = null; try { reg = await guardarPrueba(x, v); } catch (e) { K.aviso("No se pudo guardar en este teléfono."); }
    const prendidas = (reg?.encendio || []).filter(id => x.estrellas.includes(id));
    const cvV = viejo.querySelector(".b-cv"), r0 = cvV.getBoundingClientRect(), t = tel.getBoundingClientRect();
    viejo.style.pointerEvents = "none";
    if (!quieto()){
      viejo.querySelectorAll(".b-cab, .b-cuenta, .b-ayuda, .b-alc, .b-pie").forEach(e => an(e, [{opacity: 1}, {opacity: 0}], {duration: 220}));
      an(cvV.querySelector(".b-dentro"), [{opacity: 1, transform: "none"}, {opacity: 0, transform: "scale(.6)"}], {duration: 320});
      await an(cvV.querySelector("svg"), [{transform: "none"}, {transform: "scale(1.06)", offset: .3}, {transform: "scale(.03)"}], {duration: 520, easing: "cubic-bezier(.6,0,.4,1)"});
    }
    /* la que sigue: la próxima magnitud (o la primera, si no llegaste) */
    const sig = m === null ? u[0] : m > 1 ? u[5 - m + 1] : null;
    pila.push(["nivel"]);
    const p = montar("b-res sinvolver", `<div class="b-astro" style="${fv(fam)}"><i class="b-brillo"></i><span class="b-mag num">${m ?? "–"}</span></div>
      <div class="b-txt"><span class="lb">${K.esc(x.nombre)}: ${K.esc(K.hzMarca(x, v))}</span><h1>${m ? `Tu primera estrella: magnitud ${m}.` : "Tu marca quedó guardada."}</h1>
      <p class="mute">${m ? `Como en el cielo, cuanto más chico el número, más brilla.${sig !== null ? ` La ${m - 1} está en ${K.esc(K.hzMarca(x, sig))}.` : " Ya estás arriba de todo."}` : `La primera está en ${K.esc(K.hzMarca(x, u[0]))}. Kozmos te lleva.`}</p></div>
      <div class="b-esc">${K.escala(x, v)}</div>
      ${prendidas.length ? `<div class="b-prend"><span class="lb">Y ${prendidas.length === 1 ? "encendiste una estrella" : `encendiste ${prendidas.length} estrellas`} de tu cosmos</span><div class="b-consf">${anillosEncendidas(prendidas)}</div></div>` : ""}
      <div class="b-pie"><button type="button" class="btn" id="b-dia">Ver mi primer día</button></div>`);
    p._paso = ["dia"]; actual = p; guardarB(["dia"]); volverVisible(false);
    const astro = p.querySelector(".b-astro"), mag = astro.querySelector(".b-mag"), brillo = astro.querySelector(".b-brillo"), resto = p.querySelectorAll(".b-txt, .b-esc, .b-prend, .b-pie");
    p.querySelector("#b-dia").onclick = ev => iris(ev.currentTarget, fam, "dia");
    if (quieto()){ viejo.remove(); vibrar([20, 40, 30]); ocupado = false; return; }
    resto.forEach(e => e.style.opacity = 0); mag.style.opacity = 0; brillo.style.opacity = 0;
    /* el punto vuela desde la prueba hasta el centro de la estrella, en curva */
    const ra = astro.getBoundingClientRect(), x0 = r0.left - t.left + r0.width / 2, y0 = r0.top - t.top + r0.height / 2, x1 = ra.left - t.left + ra.width / 2, y1 = ra.top - t.top + ra.height / 2;
    const pto = h("i", "b-chispa"); pto.style.cssText = `${fv(fam)};width:16px;height:16px;margin:-8px 0 0 -8px;left:${x0}px;top:${y0}px;z-index:3`; tel.appendChild(pto);
    const mx = (x0 + x1) / 2 + 80, my = Math.min(y0, y1) - 40;
    await an(pto, Array.from({length: 13}, (_, k) => { const s = k / 12, b = 2 * (1 - s) * s, c = s * s; return {transform: `translate(${b * (mx - x0) + c * (x1 - x0)}px,${b * (my - y0) + c * (y1 - y0)}px) scale(${1 + 1.4 * s})`}; }), {duration: 720, easing: VUELO});
    pto.remove(); viejo.remove(); vibrar([20, 40, 30]);
    /* se prende: ondas redondas como el logo, chispas y el número que aparece (sin magnitud, sin chispas) */
    an(brillo, [{opacity: 0, transform: "scale(.3)"}, {opacity: 1, transform: "scale(1.15)", offset: .5}, {opacity: 1, transform: "none"}], {duration: 900});
    an(mag, [{opacity: 0, transform: "scale(.2)"}, {opacity: 1, transform: "scale(1.12)", offset: .6}, {opacity: 1, transform: "none"}], {duration: 620, delay: 80});
    const cx = x1, cy = y1;
    if (m) for (let k = 0; k < 3; k++){ const o = h("i", "b-onda"); o.style.cssText = `${fv(fam)};left:${cx - 30}px;top:${cy - 30}px;width:60px;height:60px`; tel.appendChild(o);
      an(o, [{transform: "scale(.4)", opacity: .9}, {transform: `scale(${3.2 + k * 1.4})`, opacity: 0}], {duration: 1000 + k * 220, delay: k * 150, easing: "cubic-bezier(.1,.6,.3,1)"}).then(() => o.remove()); }
    if (m) for (let k = 0; k < 14; k++){ const a = k / 14 * 2 * Math.PI, dd = 90 + (k % 3) * 26, ch = h("i", "b-chispa"); ch.style.cssText = `${fv(fam)};left:${cx}px;top:${cy}px`; tel.appendChild(ch);
      an(ch, [{transform: "translate(0,0) scale(1.2)", opacity: 1}, {transform: `translate(${Math.cos(a) * dd}px,${Math.sin(a) * dd}px) scale(.2)`, opacity: 0}], {duration: 800, easing: "cubic-bezier(.1,.7,.3,1)"}).then(() => ch.remove()); }
    await wait(420);
    resto.forEach((e, k) => an(e, [{opacity: 0, transform: "translateY(20px)"}, {opacity: 1, transform: "none"}], {duration: 460, delay: k * 110}));
    ocupado = false;
  }
  const anillosEncendidas = ids => { const cielo = K.cieloActual(); return ids.map(id => { const c = cielo.constelaciones.find(k => k.estrellas.some(e => e.id === id)), e = c && c.estrellas.find(y => y.id === id);
    return c ? `<div class="b-cons" style="${fv(c.familia)}">${K.icono.constelacion(c, 84, "", {desde: 0})}<b>${K.esc(c.nombre)}</b><small>${K.esc(e.nombre)}</small></div>` : ""; }).join(""); };

  /* ===== 4 · tu primer día: se guarda todo lo elegido y el día lo arma el motor de Hoy ===== */
  /* el rumbo: dos o tres constelaciones por cosa elegida, las que tu equipo permite; primero las que tu nivel ya empezó */
  function rumbo(){
    const eq = new Set([...K.rutina.conPesa(S.eq), "pared"]), dadas = new Set([...K.nivel.dadas(nivelDe(), S.eq), ...(S.test ? (K.diario.sesiones.find(s => s.id === S.sesion)?.encendio || []) : [])].map(id => id.split(".")[0]));
    const puede = id => { const c = K.CATALOGO.constelaciones.find(k => k.id === id); return c && (c.estrellas[0].equipo || []).every(e => eq.has(e)); };
    const fs = S.que.length ? S.que : ["fu"];
    return fs.flatMap(f => RUMBO[f].filter(puede).sort((a, b) => dadas.has(b) - dadas.has(a)).slice(0, fs.length > 1 ? 2 : 3));
  }
  /* los días: tantos como elegiste, repartidos en la semana desde hoy */
  const PAT = {2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5]};
  const diasDe = n => { const hoy = K.rutina.diaSemana(K.hoy()); return (PAT[n] || PAT[3]).map(k => (k + hoy) % 7).sort((a, b) => a - b); };
  async function guardarPerfil(){
    const perfil = {equipo: [...S.eq], minutos: S.min, dias: diasDe(S.dias), rumbo: rumbo(), nivel: nivelDe() || undefined, bienvenida: K.hoy()};
    try { await K.diario.lote({perfil}); } catch (e) { K.aviso("No se pudo guardar en este teléfono."); }
    K.prefs.set("bienvenida", "vista");
  }
  function dia(){
    const plan = K.hoyPlan(), eqTx = S.eq.map(id => K.equipoNombre(id).toLowerCase());
    const f0 = S.que[0] || "fu";
    /* las partes del día, en orden, con sus minutos repartidos sobre el total */
    const NOM = {entrada: "Entrada en calor", prueba: "Pruebas", habilidad: "Habilidad", fuerza: "Fuerza", abdomen: "Abdomen", motor: "Motor", cierre: "Cierre"};
    const grupos = []; for (const bl of plan.bloques){ const m = bl.molde || "prueba", g = grupos[grupos.length - 1]; if (g && g.m === m) g.bs.push(bl); else grupos.push({m, bs: [bl]}); }
    const crudo = grupos.map(g => K.dia.minutosDe(g.bs)), tot = crudo.reduce((x, y) => x + y, 0) || 1;
    let resta = plan.minutos;
    const partes = grupos.map((g, k) => { const mm = k === grupos.length - 1 ? resta : Math.max(1, Math.round(crudo[k] / tot * plan.minutos)); resta -= mm;
      const fam = g.bs.find(x => x.familia)?.familia || f0;
      const col = {entrada: "var(--ink-3)", habilidad: `var(--${fam})`, prueba: `var(--${fam})`, fuerza: `var(--${fam}-disco)`, abdomen: `color-mix(in srgb, var(--${fam}) 45%, var(--s2))`, motor: `var(--${fam})`, cierre: `var(--${fam})`}[g.m] || `var(--${fam})`;
      const n = g.bs.reduce((x, bl) => x + (bl.pasos ? new Set(bl.pasos.map(q => q.ejercicio)).size : 1), 0);
      return {...g, mm: Math.max(0, mm), col, n}; });
    const GAP = 1.6; let acc = 0;
    const segs = partes.map(pt => { const len = pt.mm / (plan.minutos || 1) * 100; const s = `<circle class="seg" cx="50" cy="50" r="42" fill="none" stroke="${pt.col}" stroke-width="9" pathLength="100" stroke-dasharray="0 100" data-a="${acc.toFixed(2)}" data-l="${Math.max(.5, len - GAP).toFixed(2)}" transform="rotate(${(-90 + acc * 3.6 + GAP * 1.8).toFixed(2)} 50 50)"/>`; acc += len; return s; }).join("");
    const hoyI = K.rutina.diaSemana(K.hoy()), toca = new Set(K.diario.perfil.dias || []);
    const DIAS1 = ["L", "M", "M", "J", "V", "S", "D"], DIAN = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
    const cielo = K.cieloActual(), rumboH = K.rumbo().map(id => cielo.constelaciones.find(c => c.id === id)).filter(Boolean).map(c => `<div class="b-ruc">${K.icono.constelacion(c, 46)}<span>${K.esc(c.nombre)}</span></div>`).join("");
    const nEj = partes.filter(pt => pt.m !== "entrada").reduce((x, pt) => x + pt.n, 0);
    const con = eqTx.length ? `Con ${K.esc(eqTx.length > 1 ? eqTx.slice(0, -1).join(", ") + " y " + eqTx[eqTx.length - 1] : eqTx[0])}.` : "Sin nada, en el piso.";
    const p = montar("b-dia sinvolver", `<div class="b-cab"><span class="lb">Hoy, ${DIAN[hoyI]}</span><h1>Tu primer día.</h1><p class="mute">${con}</p></div>
      <div class="b-diatop"><div class="b-reloj"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--s2)" stroke-width="9"/>${segs}<g class="sat"><circle cx="50" cy="8" r="5.6" fill="var(--ink)" stroke="var(--bg)" stroke-width="2"/></g></svg>
        <div class="b-cen"><b class="reloj">${quieto() ? plan.minutos : 0}</b><span>minutos</span></div></div>
        <div class="b-partes">${partes.map(pt => `<div class="b-pt"><i style="background:${pt.col}"></i><span>${NOM[pt.m] || pt.m}</span><em class="reloj">${pt.mm}′</em></div>`).join("")}</div></div>
      <div class="b-sec"><span class="lb">Tu semana</span><div class="b-semana">${DIAS1.map((d, k) => `<span class="b-sd${toca.has(k) ? " si" : ""}${k === hoyI ? " hoy" : ""}" aria-label="${DIAN[k]}${toca.has(k) ? ", entrenás" : ""}"><i>${d}</i></span>`).join("")}</div></div>
      ${rumboH ? `<div class="b-sec"><span class="lb">Te lleva a</span><div class="b-rumbo">${rumboH}</div></div>` : ""}
      <button type="button" class="btn b-lnk b-verej" id="b-ver" aria-expanded="false">Ver los ${nEj} ejercicios</button>
      <div class="lista toca-lista b-toca" hidden>${K.filasMolde(plan.bloques)}</div>
      <div class="b-pie"><button type="button" class="btn" id="b-empezar">${K.ic("play")}Empezar</button><button type="button" class="btn b-lnk" id="b-luego">Empezar más tarde</button></div>`);
    entrada(p, ".b-cab, .b-diatop, .b-sec, .b-verej, .b-pie");
    /* el reloj del día: cada parte se dibuja en su turno y el punto del logo da la vuelta delante; los minutos cuentan */
    const svg = p.querySelector(".b-reloj svg"), sat = svg.querySelector(".sat"), num = p.querySelector(".b-reloj .b-cen b"), T = 1300, t0 = performance.now() + 250;
    Object.assign(sat.style, {transformBox: "view-box", transformOrigin: "50px 50px"});
    const sg = [...svg.querySelectorAll(".seg")], pts = [...p.querySelectorAll(".b-pt")];
    const pintar = v => sg.forEach(c => { const a = +c.dataset.a, l = +c.dataset.l; c.setAttribute("stroke-dasharray", `${Math.max(0, Math.min(l, v - a)).toFixed(2)} 100`); });
    if (quieto()){ pintar(100); sat.style.transform = "rotate(360deg)"; }
    else {
      pts.forEach(x => x.style.opacity = 0);
      const paso = t => { const x = Math.max(0, Math.min(1, (t - t0) / T)), e = x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2, v = e * 100;
        pintar(v); sg.forEach((c, k) => { if (v > +c.dataset.a && pts[k] && !pts[k]._ya){ pts[k]._ya = 1; an(pts[k], [{opacity: 0, transform: "translateX(-8px)"}, {opacity: 1, transform: "none"}], {duration: 300}); } });
        sat.style.transform = `rotate(${v * 3.6}deg)`; num.textContent = Math.round(e * plan.minutos);
        if (x < 1) requestAnimationFrame(paso); else { vibrar(14); an(sat, [{transform: "rotate(360deg) scale(1)"}, {transform: "rotate(360deg) scale(1.5)", offset: .4}, {transform: "rotate(360deg) scale(1)"}], {duration: 360}); } };
      requestAnimationFrame(paso);
      p.querySelectorAll(".b-sd.si").forEach((x, k) => an(x, [{transform: "scale(.4)", opacity: 0}, {transform: "none", opacity: 1}], {duration: 320, delay: 700 + k * 80}));
    }
    p.querySelector("#b-ver").onclick = ev => { const l = p.querySelector(".b-toca"), ab = l.hidden; l.hidden = !ab; ev.currentTarget.setAttribute("aria-expanded", ab); ev.currentTarget.textContent = ab ? "Ocultar los ejercicios" : `Ver los ${nEj} ejercicios`;
      if (ab){ an(l, [{opacity: 0, transform: "translateY(12px)"}, {opacity: 1, transform: "none"}], {duration: 320}); l.scrollIntoView({behavior: quieto() ? "auto" : "smooth", block: "start"}); } };
    /* empezar: el iris del color y la sesión de verdad. Más tarde: Hoy, con todo armado */
    p.querySelector("#b-empezar").onclick = async ev => { const b = ev.currentTarget; await iris(b, f0, "fin"); cerrar(); const pl = K.hoyPlan(); if (pl.bloques.length){ K.sesion.empezar(pl); K.ir("#/hoy/sesion"); } else K.ir("#/hoy"); };
    p.querySelector("#b-luego").onclick = () => { cerrar(true); K.ir("#/hoy"); };
    return p;
  }

  /* ===== abrir y cerrar la capa ===== */
  function cerrar(fundir){
    borrarB();
    const r = raiz; raiz = tel = arriba = actual = null; pila = []; ocupado = false;
    document.body.classList.remove("en-bienvenida");
    if (!r) return;
    if (fundir && !quieto()) r.animate([{opacity: 1}, {opacity: 0}], {duration: 260, easing: E, fill: "both"}).onfinish = () => r.remove(); else r.remove();
    K.refrescar();
  }
  function abrir(){
    if (raiz) return;
    raiz = h("div"); raiz.id = "bv"; raiz.setAttribute("role", "dialog"); raiz.setAttribute("aria-modal", "true"); raiz.setAttribute("aria-label", "Bienvenida");
    tel = h("div", "b-tel"); arriba = h("div", "b-arriba", `<button type="button" class="b-ib b-atras oculto" aria-label="Volver">${K.ic("back")}</button>`);
    raiz.append(tel, arriba); document.body.appendChild(raiz); document.body.classList.add("en-bienvenida");
    arriba.querySelector(".b-atras").onclick = atras;
    const b = leerB();
    /* un borrador: sigue en el mismo paso, con lo elegido. La prueba y su resultado no se retoman: vuelve a «Tu nivel» o al primer día */
    if (b && b.S && b.paso && PASOS[b.paso[0]]){
      S = {...nuevo(), ...b.S}; pila = Array.isArray(b.pila) ? b.pila.filter(x => Array.isArray(x) && PASOS[x[0]]) : [];
      const [paso, arg] = b.paso[0] === "prueba" ? ["nivel"] : b.paso;
      if (paso === "dia") guardarPerfil().then(() => { if (raiz) mostrarPaso("dia"); });
      else entrada(mostrarPaso(paso, arg), ".b-cab, .b-pie");
      return;
    }
    S = nuevo(); arranque();
  }
  /* el atrás de Android: vuelve un paso; en el primero (o en la prueba y el resultado) no hace nada y la app sigue abierta */
  return {toca, abrir, cerrar, atras: () => { if (!raiz) return false; atras(); return true; }, abierta: () => !!raiz};
})();
