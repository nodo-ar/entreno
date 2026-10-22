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
  s.enPausa = () => !!S && S.pausa !== null;
  s.bloque = () => S.plan.bloques[S.b];
  /* la serie que va: los bloques de rutina llevan una lista de pasos (con superseries, de ejercicios distintos) */
  const pasoDe = (b, k) => b.pasos ? b.pasos[k] : {ejercicio: b.ejercicio, tipo: b.tipo, objetivo: b.objetivo, descanso: b.descanso,
    ...(b.hazana ? {hazana: b.hazana} : {}), ...(b.reloj ? {reloj: b.reloj} : {}), ...(b.descarga ? {descarga: true} : {})};
  s.paso = () => pasoDe(s.bloque(), S.s);
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
    if (!b.clase && S.s < b.series - 1){ const p = pasoDe(b, S.s + 1); return `${K.ej(p.ejercicio).nombre}, ${p.tipo === "logrado" ? "intento" : "serie"} ${S.s + 2} de ${b.series}`; }
    const nx = S.plan.bloques[S.b + 1];
    return nx ? s.nombreBloque(nx) : "";
  };
  /* el ejercicio que viene, para dibujarlo mientras descansás */
  s.proximoEj = () => {
    const b = s.bloque();
    if (!b.clase && S.s < b.series - 1) return {id: pasoDe(b, S.s + 1).ejercicio, fam: b.familia};
    const nx = S.plan.bloques[S.b + 1];
    return nx && !nx.clase ? {id: pasoDe(nx, 0).ejercicio, fam: nx.familia} : null;
  };
  s.nombreBloque = b => b.clase ? b.nombre || "" : K.ej(pasoDe(b, 0).ejercicio).nombre;

  /* ---------- avisos: vibración y sonido ---------- */
  const HAP = {ok: 14, umbral: [10, 40, 10], fin: [180, 90, 180], logro: [18, 40, 18, 40, 30]};
  /* lo que elegiste en Vos, Avisos: vibración y sonido, uno solo o nada */
  const AVISOS = {todo: [1, 1], vibra: [1, 0], suena: [0, 1], nada: [0, 0]};
  const quiere = i => (AVISOS[K.prefs.get("avisos", "todo")] || AVISOS.todo)[i];
  s.vibrar = k => { if (!quiere(0)) return; try { if (!K.apk?.vibrar(HAP[k])) navigator.vibrate?.(HAP[k]); } catch (e) {} };
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
  /* en la APK, la ventana misma queda encendida (no depende de que el WebView tenga wake lock) */
  const prender = async () => { if (S && K.apk){ K.apk.luz(true); return; } if (!S || luz || !navigator.wakeLock || document.hidden) return; try { luz = await navigator.wakeLock.request("screen"); luz.addEventListener("release", () => { luz = null; }); } catch (e) {} };
  const apagar = () => { K.apk?.luz(false); try { luz?.release(); } catch (e) {} luz = null; };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) prender(); });

  /* ---------- el reloj: cada cuarto de segundo se pinta y se revisan los avisos ---------- */
  const correr = () => { clearInterval(tic); if (S) tic = setInterval(latido, 250); };
  function latido(){
    if (!S) return;
    const b = s.bloque(), av = S.avisos;
    if (!S.pausa){
      const p = s.paso() || {};
      if (S.fase === "serie" && p.tipo === "segundos" && !av.ya && s.prep() <= 0){ av.ya = true; s.vibrar("ok"); s.beep(1, 1320); }
      if (S.fase === "serie" && (p.tipo === "segundos" || p.tipo === "minutos") && Number.isFinite(p.objetivo) && !av.obj && s.prep() <= 0 && s.enFase() >= p.objetivo * (p.tipo === "minutos" ? 60 : 1)){
        av.obj = true; s.vibrar("umbral"); s.beep(2); guardarVivo();
      }
      /* una prueba con reloj fijo (Motor 12): al llegar al tiempo, campana y a anotar */
      if (S.fase === "serie" && p.reloj && !av.obj && s.enFase() >= p.reloj){ av.obj = true; s.vibrar("fin"); s.campana(); guardarVivo(); }
      /* los tramos pasan solos, también los que vencieron con la pantalla apagada */
      if (S.fase === "tramo"){
        let paso = false;
        while (S && S.fase === "tramo" && S.pausa === null && s.queda() <= 0){ avanzarTramo(); paso = true; }
        if (paso){ s.vibrar(S && S.fase === "tramo" ? "ok" : "fin"); s.beep(S && S.fase === "tramo" ? 1 : 2, 1320); guardarVivo(); s.alTramo?.(); }
        else if (!av.cuenta && s.queda() <= 3 && b.tramos[S.s + 1]){ av.cuenta = true; s.beep(1, 660); }
      }
      if (S && S.fase === "circuito" && s.prep() <= 0 && !av.ya){ av.ya = true; s.vibrar("ok"); s.beep(1, 1320); }
      if (S && S.fase === "circuito" && b.formato === "amrap" && s.prep() <= 0 && s.queda() <= 0){ finCircuito(); s.vibrar("fin"); s.campana(); guardarVivo(); s.alTramo?.(); }
      /* la escalera de minutos: cada minuto nuevo, un pitido y una más */
      if (S && S.fase === "circuito" && b.formato === "escalera" && s.prep() <= 0){ const m = Math.floor(s.enFase() / 60); if (m > (av.min ?? 0)){ av.min = m; s.vibrar("ok"); s.beep(2, 1320); s.alTramo?.(); } }
      if (S && S.fase === "descanso" && !av.fin && s.queda() <= 0){ av.fin = true; s.vibrar("fin"); if (!programada) s.campana(); programada = null; guardarVivo(); }
    }
    s.alLatir?.();
  }

  /* ---------- lo que hacés ---------- */
  const arrancarSerie = () => {
    const b = s.bloque(), t = ahora(); S.avisos = {};
    if (b.clase === "tramos"){ S.fase = "tramo"; S.th = []; S.desde = t; S.hasta = t + b.tramos[S.s].seg * 1000; return; }
    /* una hazaña arranca con 5 s para acomodarse; con tiempo límite, el reloj baja */
    if (b.clase === "circuito"){ S.fase = "circuito"; S.vueltas = 0; S.desde = t + PREP * 1000; S.hasta = b.formato === "amrap" ? S.desde + b.minutos * 60e3 : 0; return; }
    S.fase = "serie"; S.desde = t + (s.paso().tipo === "segundos" ? PREP * 1000 : 0); S.hasta = 0;
  };
  /* ---------- tramos: cada uno dura lo suyo y pasa solo al siguiente ---------- */
  /* lo que se hizo de un bloque de tramos queda como una serie: lo que mide la rutina, o los segundos hechos */
  const cerrarTramos = () => {
    const b = s.bloque(), hechos = b.tramos.map((x, k) => S.th[k] ?? 0), total = hechos.reduce((a, x) => a + x, 0);
    const v = b.mide ? K.rutina.medir(b, hechos) : null, ej = b.tramos.find(x => x.ejercicio)?.ejercicio || null;
    const completa = total >= b.tramos.reduce((a, x) => a + x.seg, 0) * .8;
    if (b.mide && v > 0) S.hechos.push({b: S.b, s: 0, ejercicio: b.mide.ejercicio, tipo: b.mide.tipo, valor: v, seg: total});
    else if (total > 0) S.hechos.push({b: S.b, s: 0, ejercicio: b.hazana || ej, tipo: b.hazana ? "hazana" : "tramos", valor: b.hazana ? (completa ? 1 : 0) : total, seg: total, completa});
  };
  const avanzarTramo = (hecho = s.bloque().tramos[S.s].seg) => {
    const b = s.bloque();
    S.th[S.s] = hecho; S.avisos = {};
    if (S.s < b.tramos.length - 1){ S.s++; S.desde = S.hasta; S.hasta = S.desde + b.tramos[S.s].seg * 1000; return; }
    /* el último tramo: el bloque queda hecho y sigue el descanso entre bloques, o el cierre */
    const fin = S.hasta; cerrarTramos(); S.s = 0;
    if (S.b === S.plan.bloques.length - 1){ S.fase = "cierre"; S.borrador = null; S.desde = fin; return; }
    S.fase = "descanso"; S.borrador = null; S.desde = fin; S.hasta = fin + K.plan.ENTRE_BLOQUES * 1000; S.total = K.plan.ENTRE_BLOQUES;
  };
  /* saltear un tramo: lo que corrió cuenta, y arranca el que sigue */
  s.saltearTramo = () => {
    if (!S || S.fase !== "tramo") return;
    if (S.pausa !== null) s.pausar();
    const b = s.bloque(), t = ahora(), hecho = Math.min(b.tramos[S.s].seg, Math.max(0, (t - S.desde) / 1000));
    S.hasta = t; avanzarTramo(hecho);
    s.vibrar("ok"); guardarVivo(); programar();
  };
  /* ---------- circuito: vueltas contra el reloj, o todas las que entren ---------- */
  const finCircuito = () => {
    const b = s.bloque();
    /* la escalera de minutos cuenta el último minuto completo: es lo que hiciste en ese minuto */
    S.borrador = b.formato === "amrap" ? S.vueltas : b.formato === "escalera" ? Math.floor(s.enFase() / 60) : Math.round(s.enFase());
    S.fase = "cierre"; S.pausa = null; S.desde = b.formato === "amrap" ? S.hasta : ahora(); S.avisos = {};
  };
  s.vuelta = d => {
    if (!S || S.fase !== "circuito" || s.prep() > 0) return;
    if (S.pausa !== null) s.pausar();
    const b = s.bloque();
    if (b.formato === "escalera"){ finCircuito(); s.vibrar("fin"); guardarVivo(); return; } /* «No llegué»: se termina */
    S.vueltas = Math.max(0, S.vueltas + (d || 1));
    if (d !== -1 && b.formato === "tiempo" && S.vueltas >= b.rondas){ finCircuito(); s.vibrar("logro"); s.campana(); }
    else s.vibrar("ok");
    guardarVivo();
  };
  s.empezar = plan => {
    const t = ahora();
    S = {id: K.diario.nuevoId(), fecha: K.hoy(), inicio: t, pausado: 0, pausa: null, plan, b: 0, s: 0, fase: "serie", desde: t, hasta: 0, total: 0, hechos: [], borrador: null, avisos: {}};
    arrancarSerie(); guardarVivo(); correr(); prender(); audio();
  };
  /* lo que se propone anotar al terminar una serie: lo que corrió el reloj, o el objetivo */
  const propuesta = b => {
    const t = s.enFase();
    if (b.objetivo === "max") return b.tipo === "segundos" ? Math.max(1, Math.floor(t)) : K.plan.vezPasada(K.diario.sesiones, b.ejercicio, b.tipo) ?? "";
    if (b.tipo === "segundos") return Math.max(1, Math.floor(t));
    if (b.tipo === "minutos" || b.tipo === "menos-minutos") return Math.max(1, Math.round(t / 60));
    if (b.tipo === "logrado") return 0;
    if (b.tipo === "sesiones") return 1;
    /* con carga: las repeticiones y los kilos, que arrancan en los de la serie anterior del mismo ejercicio (en una superserie
       el otro ejercicio lleva sus propios kilos). Con mancuernas, los kilos por mano y sin tu peso: no son % de tu peso */
    if (b.carga && b.mano){
      const antes = [...S.hechos].reverse().find(h => h.b === S.b && h.ejercicio === b.ejercicio && h.kg !== undefined);
      return {valor: b.objetivo, kg: antes ? antes.kg : b.kg ?? ""};
    }
    if (b.carga){
      const antes = [...S.hechos].reverse().find(h => h.b === S.b && h.ejercicio === b.ejercicio && h.lastreKg !== undefined);
      return {valor: b.objetivo, lastre: antes ? antes.lastreKg : b.kg ?? "", peso: K.diario.perfil.peso || ""};
    }
    if (b.tipo === "porcentaje"){
      const antes = [...S.hechos].reverse().find(h => h.b === S.b), peso = K.diario.perfil.peso || "";
      return {lastre: antes ? antes.lastreKg : peso ? Math.round(b.objetivo * peso / 100 * 2) / 2 : "", peso};
    }
    return b.objetivo;
  };
  s.listo = () => {
    if (!S || S.fase !== "serie") return;
    if (S.pausa) s.pausar();
    const b = s.bloque(), p = s.paso(), t = ahora();
    S.borrador = propuesta(p); S.sens = null;
    S.avisos = {};
    if (s.ultima()){ S.fase = "cierre"; }
    else {
      const desc = S.s < b.series - 1 ? p.descanso : Math.max(p.descanso, K.plan.ENTRE_BLOQUES);
      S.fase = "descanso"; S.desde = t; S.hasta = t + desc * 1000; S.total = desc;
      if (!desc) S.avisos.fin = true; /* sin descanso (superserie): nada que avisar */
    }
    s.vibrar("ok"); guardarVivo(); programar();
  };
  /* el valor que estás corrigiendo durante el descanso; queda guardado en cada cambio */
  s.anotar = (campo, v) => {
    if (!S) return;
    /* con lastre el borrador lleva repeticiones y kilos juntos: cambiar uno no borra el otro */
    if (campo === "valor" && !(S.borrador !== null && typeof S.borrador === "object")) S.borrador = v; else S.borrador = {...S.borrador, [campo]: v};
    guardarVivo();
  };
  /* cómo te quedó la serie: sobró, justo o no llegué. Tocar la elegida la saca y vuelve a valer lo que dicen las repeticiones */
  s.sentir = v => {
    if (!S || !K.rutina.SENS.includes(v)) return;
    S.sens = S.sens === v ? null : v; guardarVivo();
  };
  /* lo que dirían las repeticiones si no tocás nada */
  s.sensInferida = () => {
    if (!S || S.fase === "serie" || !S.plan.bloques[S.b] || s.bloque().clase) return null;
    const b = s.paso(), v = numero(b.carga ? S.borrador?.valor : S.borrador);
    return Number.isFinite(v) && v > 0 && Number.isFinite(b.objetivo) ? K.rutina.inferir(v, b.objetivo, b.tipo) : null;
  };
  const numero = s.numero = x => { const v = Number(String(x).replace(",", ".").trim()); return Number.isFinite(v) ? v : NaN; };
  /* lo anotado pasa a ser una serie hecha; vacío o en cero no cuenta, salvo un intento que no salió */
  const asentar = () => {
    if (S.fase === "tramo"){ S.th[S.s] = Math.min(s.bloque().tramos[S.s].seg, s.enFase()); cerrarTramos(); return; } /* cortado a mitad de un tramo: vale lo que corrió */
    const b0 = s.bloque();
    if (b0.clase === "circuito"){
      /* una hazaña: completa si llegó al final; cortada a la mitad, queda lo hecho sin contar como marca */
      const completa = S.fase === "cierre", v = numero(completa ? S.borrador : b0.formato === "amrap" ? S.vueltas : b0.formato === "escalera" ? Math.floor(s.enFase() / 60) : Math.round(s.enFase())); S.borrador = null;
      /* una prueba (Modelo B) anota lo que mide: la escalera de minutos vale aunque se corte; el tiempo, solo si llegaste */
      if (b0.mide){ if (v > 0) S.hechos.push({b: S.b, s: 0, ejercicio: b0.mide.ejercicio, tipo: b0.mide.tipo, valor: v, hazana: b0.hazana, completa: completa || b0.formato === "escalera"}); return; }
      if (v > 0) S.hechos.push({b: S.b, s: 0, ejercicio: b0.hazana, tipo: "hazana", valor: v, completa});
      return;
    }
    if (b0.clase) return; /* tramos ya cerrados */
    const b = s.paso(), v = S.borrador, sens = S.sens; S.borrador = null; S.sens = null;
    /* con escalera, la serie guarda en qué escalera iba, el rango y cuántas pedía: con eso se calcula el escalón que sigue */
    const marca = {ejercicio: b.ejercicio, tipo: b.tipo, objetivo: b.objetivo, ...(b.escalera ? {escalera: b.escalera} : {}), ...(b.hazana ? {hazana: b.hazana} : {}),
      ...(b.rango ? {rango: b.rango, n: b.n} : {}), ...(b.descarga ? {descarga: true} : {}), ...(sens ? {sensacion: sens} : {})};
    if (v === null || v === undefined) return;
    if (b.carga && b.mano){
      const n = numero(v.valor), k = numero(v.kg);
      if (!(n > 0 && n <= 100000)) return;
      S.hechos.push({b: S.b, s: S.s, ...marca, valor: n, ...(k >= 0 && k <= 200 ? {kg: k} : {})});
      return;
    }
    if (b.carga){
      const n = numero(v.valor), l = numero(v.lastre), pk = numero(v.peso);
      if (!(n > 0 && n <= 100000)) return;
      const kg = l >= 0 && l <= 400 ? {lastreKg: l, ...(pk >= 20 && pk <= 400 ? {pesoKg: pk} : {})} : {};
      S.hechos.push({b: S.b, s: S.s, ...marca, valor: n, ...kg});
      if (pk >= 20 && pk <= 400 && pk !== K.diario.perfil.peso) K.diario.perfilPoner("peso", pk).catch(() => {});
      return;
    }
    if (b.tipo === "porcentaje"){
      const l = numero(v.lastre), pk = numero(v.peso);
      if (!(l > 0 && pk >= 20 && pk <= 400)) return;
      S.hechos.push({b: S.b, s: S.s, ...marca, valor: Math.round(l / pk * 100), lastreKg: l, pesoKg: pk});
      if (pk !== K.diario.perfil.peso) K.diario.perfilPoner("peso", pk).catch(() => {});
      return;
    }
    const n = numero(v);
    if (b.tipo === "logrado"){ S.hechos.push({b: S.b, s: S.s, ...marca, valor: n > 0 ? 1 : 0}); return; }
    /* lo de las pruebas: los puntos van de 0 a 10; los centímetros pueden ser cero o negativos (no llegaste a los pies) */
    if (b.tipo === "puntos"){ if (Number.isFinite(n) && String(v).trim() !== "" && n >= 0 && n <= 10) S.hechos.push({b: S.b, s: S.s, ...marca, valor: n}); return; }
    if (b.tipo === "cm"){ if (Number.isFinite(n) && String(v).trim() !== "" && n >= -50 && n <= 100) S.hechos.push({b: S.b, s: S.s, ...marca, valor: n}); return; }
    if (n > 0 && n <= 100000) S.hechos.push({b: S.b, s: S.s, ...marca, valor: n});
  };
  const siguiente = () => {
    const b = s.bloque();
    if (!b.clase && S.s < b.series - 1) S.s++; else { S.b++; S.s = 0; }
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
    const pl = S.plan, hz = pl.hazana && S.hechos.find(h => h.tipo === "hazana" || h.hazana === pl.hazana.id);
    return {id: S.id, fecha: S.fecha, inicio: new Date(S.inicio).toISOString(), fin: new Date(fin).toISOString(),
      duracion: Math.round(s.total()), cortada: !!cortada, catalogo: K.CATALOGO.version, ...(K.diario.perfil.peso ? {pesoKg: K.diario.perfil.peso} : {}),
      /* cortada, una sesión de rutina cuenta para avanzar solo si hiciste al menos la mitad: el que corta por falta de tiempo no queda trabado */
      ...(pl.rutina ? {rutina: {...pl.rutina, ...(cortada ? {mitad: S.hechos.length * 2 >= pl.bloques.reduce((t, b) => t + (b.series || 1), 0)} : {})}} : {}),
      ...(pl.hazana ? {hazana: {...pl.hazana, valor: hz ? hz.valor : 0, completa: !!(hz && hz.completa !== false), ...(pl.hazana.v === 2 && hz ? {ejercicio: hz.ejercicio, tipo: hz.tipo} : {})}} : {}),
      ...(pl.semanaPrueba ? {semanaPrueba: {...pl.semanaPrueba, pruebas: S.hechos.filter(h => h.hazana || pl.bloques[h.b]?.prueba).length}} : {}),
      bloques: pl.bloques.map((b, i) => ({orden: i, ...(b.constelacion ? {constelacion: b.constelacion} : {}), familia: b.familia, ...(b.estrella ? {estrella: b.estrella} : {}),
        objetivo: b.objetivo, ...(b.prueba ? {prueba: true} : {}), ...(b.clase ? {clase: b.clase, nombre: b.nombre} : {}), ...(b.hazana ? {hazana: b.hazana} : {}),
        series: S.hechos.filter(h => h.b === i).map(h => ({ejercicio: "ejercicio" in h ? h.ejercicio : b.ejercicio, tipo: h.tipo ?? b.tipo, ...(b.estrella ? {estrella: b.estrella} : {}), objetivo: h.objetivo ?? b.objetivo, valor: h.valor,
          ...(h.seg !== undefined ? {seg: Math.round(h.seg)} : {}), ...(h.kg !== undefined ? {kg: h.kg} : {}), ...(h.lastreKg !== undefined ? {lastreKg: h.lastreKg, ...(h.pesoKg !== undefined ? {pesoKg: h.pesoKg} : {})} : {}),
          ...(h.escalera ? {escalera: h.escalera} : {}), ...(h.rango ? {rango: h.rango, n: h.n} : {}), ...(h.descarga ? {descarga: true} : {}), ...(h.sensacion ? {sensacion: h.sensacion} : {}),
          ...(h.hazana ? {hazana: h.hazana, ...(h.completa === false ? {completa: false} : {})} : {})}))})).filter(b => b.series.length)};
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
    && x.plan.bloques.every(b => !b.constelacion || K.CATALOGO.constelaciones.some(c => c.id === b.constelacion));
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
      r.bloques = r.bloques.filter(b => b.series.length);
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
