/* ===== Motor de sesión: relojes, descansos, avisos y pantalla encendida (rescatado de Entreno) =====
   Es lo único que escribe en el diario mientras entrenás. Los relojes salen de la hora del teléfono, no de contar
   tics: si el teléfono se duerme o la app se cierra, al volver el tiempo sigue siendo el real. Lo que va en curso
   se guarda en este teléfono a cada paso, así una sesión sobrevive a que se cierre la app. */
K.sesion = (() => {
  const VIVO = "kozmos.vivo.v1", MAX = 12 * 3600e3, PREP = 5;
  let S = null, tic = 0;
  const ahora = () => Date.now();
  const s = {};
  const guardarVivo = () => { try { if (S) localStorage.setItem(VIVO, JSON.stringify(S)); else localStorage.removeItem(VIVO); } catch (e) {} };

  s.activa = () => !!S;
  s.estado = () => S;
  s.bloque = () => S.plan.bloques[S.b];
  s.ultima = () => S.b === S.plan.bloques.length - 1 && S.s === s.bloque().series - 1;
  /* lo que corre en la fase y en toda la sesión, sin contar las pausas */
  s.enFase = () => Math.max(0, ((S.pausa ?? ahora()) - S.desde) / 1000);
  /* antes de una serie por segundos hay 5 s para llegar a la barra: el reloj arranca después */
  s.prep = () => Math.max(0, (S.desde - (S.pausa ?? ahora())) / 1000);
  s.queda = () => (S.hasta - (S.pausa ?? ahora())) / 1000;
  s.total = () => Math.max(0, ((S.pausa ?? ahora()) - S.inicio - S.pausado) / 1000);
  s.hechas = () => S.hechos.length;
  /* lo que viene después del descanso, dicho en corto */
  s.proxima = () => {
    const b = s.bloque();
    if (S.s < b.series - 1) return `${K.ej(b.ejercicio).nombre}, ${b.tipo === "logrado" ? "intento" : "serie"} ${S.s + 2} de ${b.series}`;
    const nx = S.plan.bloques[S.b + 1];
    return nx ? K.ej(nx.ejercicio).nombre : "";
  };

  /* ---------- avisos: vibración y sonido ---------- */
  const HAP = {ok: 14, umbral: [10, 40, 10], fin: [180, 90, 180], logro: [18, 40, 18, 40, 30]};
  /* lo que elegiste en Vos, Avisos: vibración y sonido, uno solo o nada */
  const AVISOS = {todo: [1, 1], vibra: [1, 0], suena: [0, 1], nada: [0, 0]};
  const quiere = i => (AVISOS[K.prefs.get("avisos", "todo")] || AVISOS.todo)[i];
  s.vibrar = k => { if (!quiere(0)) return; try { navigator.vibrate?.(HAP[k]); } catch (e) {} };
  let AC = null;
  const audio = () => { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; if (!AC || AC.state === "closed") AC = new C(); if (AC.state === "suspended") AC.resume().catch(() => {}); return AC; } catch (e) { return null; } };
  /* el navegador deja sonar solo después de un toque: el primero de la sesión destraba el audio */
  addEventListener("pointerdown", () => { if (S) audio(); }, {capture: true, passive: true});
  s.beep = (n = 1, f = 880) => { if (!quiere(1)) return; try { const ctx = audio(); if (!ctx) return;
    for (let i = 0; i < n; i++){ const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.value = .001; o.connect(g); g.connect(ctx.destination);
      const t0 = ctx.currentTime + .02 + i * .22; o.start(t0); g.gain.exponentialRampToValueAtTime(.3, t0 + .02); g.gain.exponentialRampToValueAtTime(.001, t0 + .18); o.stop(t0 + .2); } } catch (e) {} };
  /* campana de fin de descanso: dos toques con parciales de campana y cola larga. Con «en», queda programada en el
     reloj del audio: suena a tiempo aunque el teléfono frene los relojes de la página con la pantalla apagada. */
  s.campana = (en = 0) => { if (!quiere(1)) return null; try { const ctx = audio(); if (!ctx) return null; const out = ctx.createGain(); out.gain.value = .8; out.connect(ctx.destination);
    [0, .42].forEach((dt, k) => { const t = ctx.currentTime + Math.max(0, en) + .03 + dt, f0 = k ? 660 : 784; [[1, 1], [2.76, .42], [5.4, .2], [8.93, .08]].forEach(([r, a]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f0 * r; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.45 * a, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + (r > 2 ? .7 : 1.7)); o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.8); }); }); return out; } catch (e) { return null; } };
  let programada = null;
  const desprogramar = () => { try { programada?.disconnect(); } catch (e) {} programada = null; };
  const programar = () => { desprogramar(); if (S && S.fase === "descanso" && S.pausa === null && s.queda() > 0) programada = s.campana(s.queda()); };

  /* ---------- pantalla encendida mientras entrenás ---------- */
  let luz = null;
  const prender = async () => { if (!S || luz || !navigator.wakeLock || document.hidden) return; try { luz = await navigator.wakeLock.request("screen"); luz.addEventListener("release", () => { luz = null; }); } catch (e) {} };
  const apagar = () => { try { luz?.release(); } catch (e) {} luz = null; };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) prender(); });

  /* ---------- el reloj: cada cuarto de segundo se pinta y se revisan los avisos ---------- */
  const correr = () => { clearInterval(tic); if (S) tic = setInterval(latido, 250); };
  function latido(){
    if (!S) return;
    const b = s.bloque(), av = S.avisos;
    if (!S.pausa){
      if (S.fase === "serie" && b.tipo === "segundos" && !av.ya && s.prep() <= 0){ av.ya = true; s.vibrar("ok"); s.beep(1, 1320); }
      if (S.fase === "serie" && (b.tipo === "segundos" || b.tipo === "minutos") && !av.obj && s.prep() <= 0 && s.enFase() >= b.objetivo * (b.tipo === "minutos" ? 60 : 1)){
        av.obj = true; s.vibrar("umbral"); s.beep(2); guardarVivo();
      }
      if (S.fase === "descanso" && !av.fin && s.queda() <= 0){ av.fin = true; s.vibrar("fin"); if (!programada) s.campana(); programada = null; guardarVivo(); }
    }
    s.alLatir?.();
  }

  /* ---------- lo que hacés ---------- */
  const arrancarSerie = () => { S.fase = "serie"; S.desde = ahora() + (s.bloque().tipo === "segundos" ? PREP * 1000 : 0); S.hasta = 0; S.avisos = {}; };
  s.empezar = plan => {
    const t = ahora();
    S = {id: K.diario.nuevoId(), fecha: K.hoy(), inicio: t, pausado: 0, pausa: null, plan, b: 0, s: 0, fase: "serie", desde: t, hasta: 0, total: 0, hechos: [], borrador: null, avisos: {}};
    arrancarSerie(); guardarVivo(); correr(); prender(); audio();
  };
  /* lo que se propone anotar al terminar una serie: lo que corrió el reloj, o el objetivo */
  const propuesta = b => {
    const t = s.enFase();
    if (b.tipo === "segundos") return Math.max(1, Math.floor(t));
    if (b.tipo === "minutos" || b.tipo === "menos-minutos") return Math.max(1, Math.round(t / 60));
    if (b.tipo === "logrado") return 0;
    if (b.tipo === "sesiones") return 1;
    if (b.tipo === "porcentaje"){
      const antes = [...S.hechos].reverse().find(h => h.b === S.b), peso = K.diario.perfil.peso || "";
      return {lastre: antes ? antes.lastreKg : peso ? Math.round(b.objetivo * peso / 100 * 2) / 2 : "", peso};
    }
    return b.objetivo;
  };
  s.listo = () => {
    if (!S || S.fase !== "serie") return;
    if (S.pausa) s.pausar();
    const b = s.bloque(), t = ahora();
    S.borrador = propuesta(b);
    S.avisos = {};
    if (s.ultima()){ S.fase = "cierre"; }
    else {
      const desc = S.s < b.series - 1 ? b.descanso : Math.max(b.descanso, K.plan.ENTRE_BLOQUES);
      S.fase = "descanso"; S.desde = t; S.hasta = t + desc * 1000; S.total = desc;
    }
    s.vibrar("ok"); guardarVivo(); programar();
  };
  /* el valor que estás corrigiendo durante el descanso; queda guardado en cada cambio */
  s.anotar = (campo, v) => {
    if (!S) return;
    if (campo === "valor") S.borrador = v; else S.borrador = {...S.borrador, [campo]: v};
    guardarVivo();
  };
  const numero = s.numero = x => { const v = Number(String(x).replace(",", ".").trim()); return Number.isFinite(v) ? v : NaN; };
  /* lo anotado pasa a ser una serie hecha; vacío o en cero no cuenta, salvo un intento que no salió */
  const asentar = () => {
    const b = s.bloque(), v = S.borrador; S.borrador = null;
    if (v === null || v === undefined) return;
    if (b.tipo === "porcentaje"){
      const l = numero(v.lastre), p = numero(v.peso);
      if (!(l > 0 && p >= 20 && p <= 400)) return;
      S.hechos.push({b: S.b, s: S.s, valor: Math.round(l / p * 100), lastreKg: l, pesoKg: p});
      if (p !== K.diario.perfil.peso) K.diario.perfilPoner("peso", p).catch(() => {});
      return;
    }
    const n = numero(v);
    if (b.tipo === "logrado"){ S.hechos.push({b: S.b, s: S.s, valor: n > 0 ? 1 : 0}); return; }
    if (n > 0 && n <= 100000) S.hechos.push({b: S.b, s: S.s, valor: n});
  };
  const siguiente = () => {
    const b = s.bloque();
    if (S.s < b.series - 1) S.s++; else { S.b++; S.s = 0; }
    arrancarSerie();
  };
  s.seguir = () => {
    if (!S || S.fase !== "descanso") return;
    if (S.pausa) s.pausar();
    desprogramar(); asentar(); siguiente(); s.vibrar("ok"); guardarVivo();
  };
  /* el descanso con − y +: de a 15 s, nunca menos de lo que ya pasó */
  s.ajustar = d => {
    if (!S || S.fase !== "descanso") return;
    const pasado = S.total - Math.max(0, s.queda());
    const n = Math.max(Math.ceil(pasado), S.total + d);
    S.hasta += (n - S.total) * 1000; S.total = n; S.avisos.fin = s.queda() <= 0;
    guardarVivo(); programar();
  };
  /* pausa: los relojes se frenan y al seguir se corren todos juntos */
  s.pausar = () => {
    if (!S) return;
    const t = ahora();
    if (S.pausa === null){ S.pausa = t; }
    else { const d = t - S.pausa; S.desde += d; if (S.hasta) S.hasta += d; S.pausado += d; S.pausa = null; }
    guardarVivo(); programar();
  };
  /* saltear lo que queda del bloque: lo hecho queda */
  s.saltear = () => {
    if (!S) return false;
    if (S.b >= S.plan.bloques.length - 1) return false; /* era el último: se termina */
    if (S.fase !== "serie") asentar();
    if (S.pausa !== null){ S.pausado += ahora() - S.pausa; S.pausa = null; }
    desprogramar(); S.b++; S.s = 0; S.borrador = null; arrancarSerie();
    guardarVivo(); return true;
  };

  /* lo que queda guardado de la sesión: solo lo que hiciste, con lo que midió cada serie */
  s.registro = (cortada) => {
    const fin = Math.max(S.inicio, S.pausa ?? ahora()); /* si el reloj del teléfono volvió atrás, el fin no queda antes del inicio */
    return {id: S.id, fecha: S.fecha, inicio: new Date(S.inicio).toISOString(), fin: new Date(fin).toISOString(),
      duracion: Math.round(s.total()), cortada: !!cortada, catalogo: K.CATALOGO.version, ...(K.diario.perfil.peso ? {pesoKg: K.diario.perfil.peso} : {}),
      bloques: S.plan.bloques.map((b, i) => ({orden: i, constelacion: b.constelacion, familia: b.familia, estrella: b.estrella, objetivo: b.objetivo, ...(b.prueba ? {prueba: true} : {}),
        series: S.hechos.filter(h => h.b === i).map(h => ({ejercicio: b.ejercicio, tipo: b.tipo, estrella: b.estrella, objetivo: b.objetivo, valor: h.valor,
          ...(h.lastreKg !== undefined ? {lastreKg: h.lastreKg, pesoKg: h.pesoKg} : {})}))})).filter(b => b.series.length)};
  };
  /* terminar: asienta lo último, guarda y suelta todo. Devuelve {registro, antes} o null si no había nada hecho. */
  s.terminar = async (cortada = false) => {
    if (!S) return null;
    /* la foto es de antes de asentar: al deshacer, lo que estabas anotando vuelve a estar en pantalla */
    const foto = JSON.parse(JSON.stringify(S));
    if (S.fase !== "serie") asentar();
    const r = s.registro(cortada);
    if (!r.bloques.length){ s.soltar(); return {registro: null, foto}; }
    /* lo que encendió queda escrito: el resumen dice lo mismo aunque después cambie el catálogo o anotes más */
    const ms = K.diario.mediciones, ss = K.diario.sesiones;
    r.encendio = K.cielo.nuevas(K.CATALOGO, ms, ms, K.hoy(), ss, [...ss, r]).map(n => n.estrella.id);
    try { await K.diario.guardarSesion(r); } catch (e) { S = foto; guardarVivo(); throw e; } /* si falla, la sesión sigue tal cual y nada se pierde */
    s.soltar();
    return {registro: r, foto};
  };
  s.soltar = () => { S = null; clearInterval(tic); desprogramar(); guardarVivo(); apagar(); };
  /* deshacer un corte: la sesión vuelve tal cual estaba */
  s.volver = foto => { S = foto; guardarVivo(); correr(); prender(); programar(); };
  /* al abrir la app: una sesión en curso de menos de 12 horas sigue donde estaba. Una vencida, o que nombra una
     constelación que el catálogo ya no tiene, no se tira: lo hecho se guarda como sesión cortada. */
  const sana = x => x && x.plan && Array.isArray(x.plan.bloques) && Array.isArray(x.hechos) && x.plan.bloques[x.b]
    && x.plan.bloques.every(b => K.CATALOGO.constelaciones.some(c => c.id === b.constelacion));
  s.restaurar = async () => {
    let x = null;
    try { x = JSON.parse(localStorage.getItem(VIVO)); } catch (e) {}
    if (!x) return "nada";
    if (sana(x) && ahora() - x.inicio < MAX){
      S = x; if (S.fase === "descanso" && s.queda() <= 0) S.avisos.fin = true; /* lo que venció con la app cerrada no suena de golpe */
      correr(); prender(); programar(); return "sigue";
    }
    if (x.plan && Array.isArray(x.hechos)){
      S = x;
      /* la que quedó olvidada termina en su último paso, no al abrir: si no, 11 horas de «fuerza» inflan minutos y calorías */
      if (S.pausa === null) S.pausa = Math.min(ahora(), Math.max(S.desde || S.inicio, S.hasta || 0));
      try { if (S.fase !== "serie" && S.plan.bloques[S.b]) asentar(); } catch (e) {}
      const r = s.registro(true);
      r.bloques = r.bloques.filter(b => K.CATALOGO.constelaciones.some(c => c.id === b.constelacion) || b.series.length);
      S = null;
      if (r.bloques.length){
        try { await K.diario.guardarSesion(r); } catch (e) { return "no-se-pudo"; } /* queda en «vivo» para la próxima apertura */
        guardarVivo(); return "guardada";
      }
    }
    S = null; guardarVivo(); return "nada";
  };
  /* otra pestaña con Kozmos abierto: la sesión en curso es una sola, la última que se tocó */
  addEventListener("storage", e => {
    if (e.key !== VIVO) return;
    let x = null; try { x = JSON.parse(e.newValue); } catch (err) {}
    S = x && sana(x) ? x : null; desprogramar(); correr();
    if (!S) apagar();
    s.alCambiar?.();
  });
  return s;
})();
