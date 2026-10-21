// Pruebas sin pantalla: el catálogo (que esté bien armado) y las funciones del cielo, con casos escritos a mano.
// Uso: node kozmos/pruebas/puras.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {execSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAT = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "constelaciones.json"), "utf8"));
const RET = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "retirados.json"), "utf8"));
const ctx = {K: {}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "cielo", "cielo.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "sesion", "plan.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "sesion", "calorias.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "diario", "respaldo.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "sesion", "rutina.js"), "utf8"), ctx);
const {cielo, plan, calorias, respaldo, rutina} = ctx.K;
const RUT_DIR = path.join(RAIZ, "catalogo", "rutinas");
const RUTINAS = fs.readdirSync(RUT_DIR).filter(f => f.endsWith(".json")).map(f => [f, JSON.parse(fs.readFileSync(path.join(RUT_DIR, f), "utf8"))]);
const HAZANAS = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "hazanas.json"), "utf8"));
const EJ = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "ejercicios.json"), "utf8"));

const PRUEBAS = [];
const prueba = (n, fn) => PRUEBAS.push([n, fn]);
const ok = (c, m) => { if (!c) throw new Error(m); };

/* ===== El catálogo ===== */
prueba("catalogo-ids", () => {
  const vistos = new Set(), formato = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const c of CAT.constelaciones){
    ok(formato.test(c.id), `id de constelación raro: ${c.id}`);
    ok(!vistos.has(c.id), `id repetido: ${c.id}`); vistos.add(c.id);
    ok(!RET.constelaciones.includes(c.id), `reusa un id retirado: ${c.id}`);
    for (const e of c.estrellas){
      const [a, b] = e.id.split(".");
      ok(a === c.id && formato.test(b || ""), `id de estrella raro: ${e.id}`);
      ok(!vistos.has(e.id), `id repetido: ${e.id}`); vistos.add(e.id);
      ok(!RET.estrellas.includes(e.id), `reusa un id retirado: ${e.id}`);
    }
  }
});
prueba("catalogo-campos", () => {
  const fams = new Set(CAT.familias.map(f => f.id));
  for (const c of CAT.constelaciones){
    ok(fams.has(c.familia), `${c.id}: familia desconocida ${c.familia}`);
    ok(c.nombre && c.meta, `${c.id}: falta nombre o meta`);
    ok(c.estrellas.length >= 2, `${c.id}: menos de dos estrellas`);
    c.estrellas.forEach((e, i) => {
      ok(e.orden === i + 1, `${e.id}: orden ${e.orden}, esperaba ${i + 1}`);
      ok(Number.isInteger(e.magnitud) && e.magnitud >= 1 && e.magnitud <= 5, `${e.id}: magnitud ${e.magnitud}`);
      ok(i === 0 || e.magnitud <= c.estrellas[i - 1].magnitud, `${e.id}: la magnitud sube en lugar de bajar`);
      ok(cielo.TIPOS[e.prueba.tipo], `${e.id}: tipo de prueba desconocido ${e.prueba.tipo}`);
      ok(typeof e.prueba.ejercicio === "string" && e.prueba.ejercicio, `${e.id}: falta el ejercicio`);
      ok(Number.isFinite(e.prueba.umbral) && e.prueba.umbral > 0, `${e.id}: umbral ${e.prueba.umbral}`);
      ok(e.prueba.tipo !== "logrado" || e.prueba.umbral === 1, `${e.id}: lo logrado tiene umbral 1`);
    });
    ok(c.estrellas[c.estrellas.length - 1].magnitud === 1 && c.estrellas[0].magnitud === 5, `${c.id}: va de m5 a m1`);
  }
});
prueba("catalogo-requisitos", () => {
  const todas = new Map(CAT.constelaciones.flatMap(c => c.estrellas.map(e => [e.id, e])));
  for (const e of todas.values()) for (const r of e.requiere) ok(todas.has(r), `${e.id}: requiere ${r}, que no existe`);
  /* sin círculos */
  const estado = new Map();
  const visitar = (id, camino) => {
    if (estado.get(id) === 2) return;
    ok(estado.get(id) !== 1, "requisitos en círculo: " + [...camino, id].join(" → "));
    estado.set(id, 1); for (const r of todas.get(id).requiere) visitar(r, [...camino, id]); estado.set(id, 2);
  };
  for (const id of todas.keys()) visitar(id, []);
});
prueba("catalogo-ejercicios", () => {
  /* el mismo ejercicio se mide siempre igual, y dentro de una constelación su umbral crece con el orden */
  const tipo = new Map();
  for (const c of CAT.constelaciones){
    const ult = new Map();
    for (const e of c.estrellas){
      const p = e.prueba;
      ok(!tipo.has(p.ejercicio) || tipo.get(p.ejercicio) === p.tipo, `${e.id}: ${p.ejercicio} se mide como ${p.tipo} y como ${tipo.get(p.ejercicio)}`);
      tipo.set(p.ejercicio, p.tipo);
      if (ult.has(p.ejercicio)) ok(cielo.TIPOS[p.tipo].mejor === "menos" ? p.umbral < ult.get(p.ejercicio) : p.umbral > ult.get(p.ejercicio), `${e.id}: no es más difícil que la anterior del mismo ejercicio`);
      ult.set(p.ejercicio, p.umbral);
    }
  }
});

prueba("catalogo-contra-main", () => {
  /* lo que ya está en main pudo llegar a teléfonos: una estrella no desaparece sin retirarse, y su prueba no cambia nunca.
     Si hay que cambiar una prueba, la estrella lleva id nuevo y la vieja va a retirados.json. */
  let viejo;
  try { viejo = JSON.parse(execSync("git show origin/main:kozmos/catalogo/constelaciones.json", {cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"]}).toString()); }
  catch (e) { return; } /* todavía no hay catálogo en main */
  const hoy = new Map(CAT.constelaciones.flatMap(c => c.estrellas.map(e => [e.id, e])));
  for (const c of viejo.constelaciones){
    ok(CAT.constelaciones.some(x => x.id === c.id) || RET.constelaciones.includes(c.id), `la constelación ${c.id} desapareció sin retirarse`);
    for (const e of c.estrellas){
      if (RET.estrellas.includes(e.id)){ ok(!hoy.has(e.id), `${e.id} está retirada y sigue en el catálogo`); continue; }
      ok(hoy.has(e.id), `${e.id} desapareció sin retirarse`);
      ok(JSON.stringify(hoy.get(e.id).prueba) === JSON.stringify(e.prueba), `${e.id} cambió su prueba: lleva id nuevo y la vieja se retira`);
    }
  }
});

/* ===== El cielo, con un catálogo chico escrito a mano ===== */
const MINI = {familias: [{id: "fu", nombre: "F"}], constelaciones: [
  {id: "fl", nombre: "Front lever", familia: "fu", meta: "", estrellas: [
    {id: "fl.colgado", nombre: "Colgado 60 s", magnitud: 5, orden: 1, prueba: {ejercicio: "colgado", tipo: "segundos", umbral: 60}, requiere: []},
    {id: "fl.tuck-10", nombre: "Tuck 10 s", magnitud: 3, orden: 2, prueba: {ejercicio: "tuck", tipo: "segundos", umbral: 10}, requiere: ["fl.colgado"]},
    {id: "fl.tuck-20", nombre: "Tuck 20 s", magnitud: 1, orden: 3, prueba: {ejercicio: "tuck", tipo: "segundos", umbral: 20}, requiere: ["fl.tuck-10"]}]},
  {id: "km", nombre: "10 km", familia: "fu", meta: "", estrellas: [
    {id: "km.60", nombre: "60 min", magnitud: 5, orden: 1, prueba: {ejercicio: "trote", tipo: "minutos", umbral: 60}, requiere: []},
    {id: "km.sub50", nombre: "Bajo 50", magnitud: 1, orden: 2, prueba: {ejercicio: "10km", tipo: "menos-minutos", umbral: 50}, requiere: ["km.60"]}]},
  {id: "es", nombre: "Espagat", familia: "fu", meta: "", estrellas: [
    {id: "es.lat", nombre: "Lateral", magnitud: 5, orden: 1, prueba: {ejercicio: "lat", tipo: "logrado", umbral: 1}, requiere: []},
    {id: "es.fro", nombre: "Frontal", magnitud: 1, orden: 2, prueba: {ejercicio: "fro", tipo: "logrado", umbral: 1}, requiere: ["es.lat"]}]}]};
const HOY = "2026-10-20";
const m = (estrella, valor, fecha = HOY) => ({id: estrella + valor + fecha, estrella, valor, fecha});
const cons = (ms, id, hoy = HOY) => cielo.calcular(MINI, ms, hoy).constelaciones.find(c => c.id === id);
const estados = c => c.estrellas.map(e => e.estado[0]).join("");

prueba("cielo-vacio", () => {
  const r = cielo.calcular(MINI, [], HOY);
  ok(r.encendidas === 0 && r.total === 7, `vacío: ${r.encendidas} de ${r.total}`);
  const c = r.constelaciones[0];
  ok(c.estrellas.map(e => e.estado).join() === "proxima,por-delante,por-delante", "la primera tiene que ser la próxima: " + estados(c));
  ok(c.avance === 0 && c.proxima.mejor === null, "sin marcas, avance 0");
});
prueba("cielo-enciende-con-el-umbral", () => {
  ok(cons([m("fl.colgado", 59)], "fl").estrellas[0].estado === "proxima", "59 de 60 no enciende");
  const c = cons([m("fl.colgado", 60)], "fl");
  ok(c.estrellas[0].estado === "encendida" && c.estrellas[1].estado === "proxima", "60 de 60 enciende y pasa a la siguiente: " + estados(c));
  ok(c.encendidas === 1 && c.total === 3, "cuenta 1 de 3");
});
prueba("cielo-mismo-ejercicio", () => {
  /* 25 s de tuck anotados en «Tuck 20 s» encienden también «Tuck 10 s» */
  const c = cons([m("fl.colgado", 60), m("fl.tuck-20", 25)], "fl");
  ok(c.estrellas.every(e => e.estado === "encendida") && c.completa, "no enciende las dos de tuck: " + estados(c));
  /* pero una marca de otro ejercicio no cuenta */
  const d = cons([m("fl.colgado", 600)], "fl");
  ok(d.estrellas[1].estado === "proxima" && d.estrellas[1].mejor === null, "el colgado cuenta como tuck");
});
prueba("cielo-avance", () => {
  const c = cons([m("fl.colgado", 60), m("fl.tuck-10", 7)], "fl");
  ok(Math.abs(c.avance - .7) < 1e-9, "7 de 10 tiene que dar 0,7: " + c.avance);
  ok(c.proxima.mejor === 7, "la mejor marca es 7");
  ok(Math.abs(cons([m("km.60", 60), m("km.sub50", 55)], "km").avance - 50 / 55) < 1e-9, "en menos-minutos, 55 para 50 es 50/55");
  ok(cons([m("km.60", 60), m("km.sub50", 49)], "km").completa, "49 min enciende «bajo 50»");
  ok(cons([m("km.60", 60), m("km.sub50", 51)], "km").estrellas[1].estado === "proxima", "51 min no enciende «bajo 50»");
  ok(cons([m("fl.colgado", 300)], "fl").estrellas[0].estado === "encendida", "pasarse del umbral también enciende");
});
prueba("cielo-encendida-para-siempre", () => {
  /* una marca peor después no apaga nada */
  const c = cons([m("fl.colgado", 60, "2026-01-01"), m("fl.colgado", 10, "2026-10-01")], "fl", HOY);
  ok(c.estrellas[0].estado === "encendida" && c.estrellas[0].desde === "2026-01-01", "una marca peor apagó la estrella");
});
prueba("cielo-saltear-orden", () => {
  /* si se enciende una más adelante sin las anteriores, la próxima es la primera que falta */
  /* 15 s anotados en «Tuck 20 s» encienden «Tuck 10 s» y dejan «Tuck 20 s» como próxima */
  const c = cons([m("fl.colgado", 60), m("fl.tuck-20", 15)], "fl");
  ok(estados(c) === "eep", "estados: " + c.estrellas.map(e => e.estado).join(","));
  const d = cons([m("fl.tuck-20", 25)], "fl");
  ok(d.estrellas[0].estado === "proxima" && d.estrellas[1].estado === "encendida" && d.estrellas[2].estado === "encendida", "sin el colgado, la próxima es el colgado: " + d.estrellas.map(e => e.estado).join(","));
});
prueba("cielo-logrado", () => {
  const c = cons([m("es.lat", 1)], "es");
  ok(c.estrellas[0].estado === "encendida" && c.estrellas[1].estado === "proxima" && c.avance === 0, "lo logrado enciende y la próxima no tiene avance parcial");
});
prueba("cielo-atenuado", () => {
  const mk = f => cons([m("fl.colgado", 60, f)], "fl", HOY);
  ok(!mk("2026-08-25").atenuada, "56 días todavía no atenúa");
  ok(mk("2026-08-24").atenuada && !mk("2026-08-24").volverAProbar, "57 días atenúa");
  ok(mk("2026-06-29").volverAProbar, "más de 16 semanas sugiere volver a probar");
  ok(mk("2026-06-29").estrellas[0].estado === "encendida", "atenuada no es apagada");
  ok(cons([], "fl").atenuada === false, "sin marcas no hay nada que atenuar");
});
prueba("cielo-brillo", () => {
  const dias = ["2026-10-20", "2026-10-18", "2026-10-15", "2026-10-10", "2026-10-01", "2026-09-20", "2026-09-10"].map(f => m("fl.colgado", 30, f));
  ok(cons(dias.slice(0, 3), "fl").brillo === .5, "3 días en 6 semanas es medio brillo");
  ok(cons(dias, "fl").brillo === 1, "6 días o más es brillo pleno");
  ok(cons([m("fl.colgado", 30, "2026-08-01")], "fl").brillo === 0, "práctica vieja no da brillo");
});
prueba("cielo-marca-guarda-lo-que-midio", () => {
  /* una marca vieja dice que midió segundos de tuck; si el catálogo pasara esa estrella a repeticiones, no se mezcla */
  const otro = JSON.parse(JSON.stringify(MINI));
  otro.constelaciones[0].estrellas[1].prueba = {ejercicio: "tuck", tipo: "repeticiones", umbral: 10};
  const c = cielo.calcular(otro, [{id: "a", estrella: "fl.tuck-10", ejercicio: "tuck", tipo: "segundos", valor: 12, fecha: HOY}], HOY).constelaciones[0];
  ok(c.estrellas[1].estado !== "encendida", "12 segundos se leyeron como 12 repeticiones");
  ok(cons([{id: "b", estrella: "fl.tuck-20", ejercicio: "tuck", tipo: "segundos", valor: 12, fecha: HOY}], "fl").estrellas[1].encendida, "una marca con lo que midió no cuenta");
});
prueba("cielo-datos-rotos", () => {
  const r = cielo.calcular(MINI, [m("no.existe", 10), {id: "x", estrella: "fl.colgado", valor: NaN, fecha: HOY}, {id: "y", estrella: "fl.colgado", valor: "60", fecha: HOY}], HOY);
  ok(r.encendidas === 0, "un dato roto encendió algo");
});
prueba("cielo-nuevas", () => {
  const antes = [m("fl.colgado", 60)], despues = [...antes, m("fl.tuck-20", 25)];
  const n = cielo.nuevas(MINI, antes, despues, HOY).map(x => x.estrella.id).sort();
  ok(JSON.stringify(n) === '["fl.tuck-10","fl.tuck-20"]', "nuevas: " + n);
  ok(cielo.nuevas(MINI, despues, despues, HOY).length === 0, "sin cambios no hay nuevas");
});
prueba("cielo-textos", () => {
  const p = t => ({tipo: t, umbral: 1});
  const casos = [["segundos", 8, "8 s"], ["repeticiones", 3, "×3"], ["minutos", 45, "45 min"], ["porcentaje", 25, "+25 %"], ["sesiones", 1, "1 sesión"], ["sesiones", 8, "8 sesiones"], ["logrado", 1, "Logrado"]];
  for (const [t, v, s] of casos) ok(cielo.corto(p(t), v) === s, `${t} ${v}: «${cielo.corto(p(t), v)}»`);
});
prueba("cielo-catalogo-real", () => {
  const r = cielo.calcular(CAT, [], HOY);
  ok(r.constelaciones.length === 14, "no son 14 constelaciones");
  ok(r.constelaciones.every(c => c.proxima && c.proxima.orden === 1), "en un cielo vacío, la próxima de cada una es la primera");
});

/* ===== Los ejercicios del catálogo ===== */
prueba("catalogo-ejercicios", () => {
  const ids = new Set();
  for (const e of EJ.ejercicios){
    ok(!ids.has(e.id), `ejercicio repetido: ${e.id}`); ids.add(e.id);
    ok(e.nombre && e.indicacion && e.indicacion.length <= 90, `${e.id}: falta el nombre o la indicación es larga`);
  }
  for (const c of CAT.constelaciones) for (const e of c.estrellas) ok(ids.has(e.prueba.ejercicio), `${e.id} pide un ejercicio que no está: ${e.prueba.ejercicio}`);
});

/* ===== Las series de una sesión cuentan como marcas ===== */
const ses = (id, fecha, series) => ({id, fecha, bloques: [{constelacion: "fl", series}]});
const sx = (estrella, ejercicio, tipo, valor) => ({estrella, ejercicio, tipo, valor});
prueba("sesion-enciende", () => {
  /* decisión de Fer: una serie que llega al umbral enciende la estrella */
  const s = ses("a", HOY, [sx("fl.colgado", "colgado", "segundos", 40), sx("fl.colgado", "colgado", "segundos", 61)]);
  const c = cielo.calcular(MINI, [], HOY, [s]).constelaciones[0];
  ok(c.estrellas[0].encendida && c.estrellas[0].mejor === 61, "la mejor serie no encendió: " + estados(c));
  ok(c.marcas.length === 1 && c.marcas[0].origen === "serie", "cada sesión deja una sola marca por ejercicio, la mejor");
  const n = cielo.nuevas(MINI, [], [], HOY, [], [s]);
  ok(n.length === 1 && n[0].estrella.id === "fl.colgado", "nuevas no la ve");
});
prueba("sesion-series-rotas", () => {
  const s = ses("a", HOY, [sx("fl.colgado", "colgado", "segundos", NaN), null, sx("x", "colgado", "inventado", 99), sx("fl.retirada", "colgado", "segundos", 60)]);
  const c = cielo.calcular(MINI, [], HOY, [s, {id: "b", fecha: HOY}]).constelaciones[0];
  /* una estrella retirada no borra lo que hiciste: cuenta por el ejercicio que midió */
  ok(c.estrellas[0].encendida, "la serie de una estrella retirada no contó por su ejercicio");
});
prueba("sesion-cuenta-sesiones", () => {
  const M = {familias: MINI.familias, constelaciones: [{id: "mo", nombre: "Motor", familia: "fu", meta: "", estrellas: [
    {id: "mo.i3", nombre: "3 sesiones", magnitud: 3, orden: 1, prueba: {ejercicio: "intervalos", tipo: "sesiones", umbral: 3}, requiere: []}]}]};
  const una = (id, f) => ({id, fecha: f, bloques: [{series: [sx("mo.i3", "intervalos", "sesiones", 1)]}]});
  const c2 = cielo.calcular(M, [], HOY, [una("a", "2026-10-01"), una("b", "2026-10-05")]).constelaciones[0];
  ok(c2.estrellas[0].mejor === 2 && !c2.estrellas[0].encendida, "dos sesiones tienen que contar 2: " + c2.estrellas[0].mejor);
  /* lo anotado a mano es un total; lo hecho después suma */
  const c3 = cielo.calcular(M, [{id: "x", estrella: "mo.i3", valor: 2, fecha: "2026-10-02"}], HOY, [una("a", "2026-10-01"), una("b", "2026-10-05")]).constelaciones[0];
  ok(c3.estrellas[0].mejor === 3 && c3.estrellas[0].desde === "2026-10-05", "2 anotadas más una después tienen que ser 3: " + c3.estrellas[0].mejor);
});

/* ===== El plan del día ===== */
const cieloReal = (ms = [], ss = []) => cielo.calcular(CAT, ms, HOY, ss);
prueba("plan-objetivo", () => {
  const P = t => ({tipo: t, umbral: 10});
  ok(plan.objetivo(P("segundos"), null) === 5, "sin marcas, la mitad del umbral");
  ok(plan.objetivo(P("segundos"), 5) === 6, "con 5 s, apunta a 6");
  ok(plan.objetivo(P("segundos"), 8) === 10, "al 80 %, el umbral: se abre la ventana de prueba");
  ok(plan.objetivo({tipo: "repeticiones", umbral: 100}, 40) === 50, "soga: suma de a 10 %");
  ok(plan.objetivo({tipo: "minutos", umbral: 40}, null) === 40 && plan.objetivo({tipo: "minutos", umbral: 40}, 20) === 25, "minutos: de a 5");
  ok(plan.objetivo({tipo: "logrado", umbral: 1}, null) === 1, "logrado: un intento");
});
prueba("plan-rumbo", () => {
  const p = plan.armar(cieloReal(), ["front-lever"], [], HOY);
  ok(p.bloques.map(b => b.constelacion).join() === "front-lever,espagat,motor", "fuerza, después rango y motor de regalo: " + p.bloques.map(b => b.constelacion));
  ok(p.bloques[0].ejercicio === "colgado-activo" && p.bloques[0].series === 4 && p.bloques[0].objetivo === 30, "front lever arranca con colgado 4 × 30 s");
  ok(p.bloques[1].extra && p.bloques[1].series === 2 && p.bloques[2].extra && p.bloques[2].objetivo === 15, "los de regalo son cortos");
  ok(p.minutos >= 15 && p.minutos % 5 === 0, "minutos redondos: " + p.minutos);
  const t = plan.armar(cieloReal(), ["front-lever", "diez-km", "puente"], [], HOY);
  ok(t.bloques.length === 3 && t.bloques.every(b => !b.extra), "con motor y rango en el rumbo, no suma de regalo");
  ok(plan.armar(cieloReal(), [], [], HOY).bloques.every(b => b.extra), "sin rumbo, solo lo de siempre");
  ok(plan.armar(cieloReal(), ["no-existe"], [], HOY).bloques.length === 2, "un id viejo en el rumbo no rompe");
});
prueba("plan-no-repite-ayer", () => {
  const ayer = {id: "a", fecha: "2026-10-19", bloques: [{constelacion: "front-lever", series: []}]};
  const p = plan.armar(cieloReal([], [ayer]), ["front-lever", "planche"], [ayer], HOY);
  ok(!p.bloques.some(b => b.constelacion === "front-lever") && p.bloques.some(b => b.constelacion === "planche"), "repitió front lever: " + p.bloques.map(b => b.constelacion));
  const solo = plan.armar(cieloReal([], [ayer]), ["front-lever"], [ayer], HOY);
  ok(solo.bloques[0].constelacion === "front-lever", "si es la única, va igual");
});
prueba("plan-volviste", () => {
  const vieja = {id: "a", fecha: "2026-09-20", bloques: []};
  const ms = [{id: "x", estrella: "front-lever.colgado-60s", valor: 40, fecha: "2026-09-20"}];
  const p = plan.armar(cieloReal(ms, [vieja]), ["front-lever"], [vieja], HOY);
  ok(p.volviste && p.bloques[0].objetivo === Math.round(46 * .7), "después de 3 semanas, al 70 %: " + p.bloques[0].objetivo);
});
prueba("plan-vez-pasada", () => {
  const ss = [ses("a", "2026-10-10", [sx("e", "fl-tuck", "segundos", 7), sx("e", "fl-tuck", "segundos", 9)]), ses("b", "2026-10-12", [sx("e", "colgado-activo", "segundos", 30)])];
  ok(plan.vezPasada(ss, "fl-tuck", "segundos") === 9, "la vez pasada es la mejor serie de la última sesión con ese ejercicio");
  ok(plan.vezPasada(ss, "pistol", "repeticiones") === null, "sin antes, nada");
});

/* ===== Etapa 4: equipo, ventana de prueba, calorías y respaldo ===== */
prueba("cielo-equipo", () => {
  const c = cielo.calcular(CAT, [], HOY, [], ["barra"]), por = id => c.constelaciones.find(x => x.id === id);
  ok(por("soga").total === 0 && !por("soga").proxima && por("soga").pide.join() === "soga" && !por("soga").completa, "sin soga, Soga no tiene próxima y pide soga");
  ok(por("motor").pide.join() === "bici", "sin bici, Motor pide bici: " + por("motor").pide);
  ok(por("front-lever").total === 8 && por("front-lever").proxima.id === "front-lever.colgado-60s", "con barra, front lever entero");
  ok(por("diez-km").proxima && por("diez-km").pide.length === 0, "trotar no pide nada");
  const piden = CAT.constelaciones.flatMap(k => k.estrellas).filter(e => (e.equipo || []).some(x => x !== "barra")).length;
  ok(cielo.calcular(CAT, [], HOY).total === c.total + piden && c.constelaciones.every(k => k.estrellas.length === CAT.constelaciones.find(x => x.id === k.id).estrellas.length), "sin elegir equipo se ve todo; elegido, el total baja y las estrellas siguen ahí");
  /* lo que ya encendiste cuenta aunque hoy no tengas el equipo */
  const ms = [{id: "s", estrella: "soga.saltos-100", ejercicio: "soga", tipo: "repeticiones", valor: 120, fecha: HOY}];
  const sg = cielo.calcular(CAT, ms, HOY, [], ["barra"]).constelaciones.find(x => x.id === "soga");
  ok(sg.encendidas === 1 && sg.total === 1, "una estrella encendida sin el equipo sigue contando: " + sg.encendidas + " de " + sg.total);
});
prueba("cielo-equipo-inalcanzable", () => {
  /* una estrella que solo se alcanza pasando por otra que pide equipo no cuenta en el total */
  const M = {familias: [{id: "fu"}], constelaciones: [{id: "k", nombre: "K", familia: "fu", meta: "", estrellas: [
    {id: "k.a", nombre: "A", magnitud: 5, orden: 1, prueba: {ejercicio: "a", tipo: "segundos", umbral: 10}, requiere: []},
    {id: "k.b", nombre: "B", magnitud: 4, orden: 2, prueba: {ejercicio: "b", tipo: "segundos", umbral: 10}, requiere: ["k.a"], equipo: ["barra"]},
    {id: "k.c", nombre: "C", magnitud: 3, orden: 3, prueba: {ejercicio: "c", tipo: "segundos", umbral: 10}, requiere: ["k.b"]}]}]};
  const c = cielo.calcular(M, [{id: "1", estrella: "k.a", valor: 12, fecha: HOY}], HOY, [], []).constelaciones[0];
  ok(c.total === 1 && c.encendidas === 1 && !c.completa && !c.proxima && c.pide.join() === "barra", "sin barra: 1 de 1, no completa, pide barra: " + JSON.stringify([c.total, c.encendidas, c.completa, c.pide]));
});
prueba("plan-equipo", () => {
  const p = plan.armar(cielo.calcular(CAT, [], HOY, [], ["barra"]), ["front-lever", "soga"], [], HOY);
  ok(!p.bloques.some(b => b.constelacion === "soga" || b.constelacion === "motor"), "sin soga ni bici no aparecen: " + p.bloques.map(b => b.constelacion));
  ok(p.bloques.some(b => b.familia === "mo"), "el motor de regalo busca otro que puedas hacer: " + p.bloques.map(b => b.constelacion));
});
prueba("plan-ventana", () => {
  /* colgado 50 s de 60 s: 83 %, se abre la ventana y la sesión empieza probándola */
  const ms = [{id: "x", estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 50, fecha: "2026-10-18"}];
  const p = plan.armar(cieloReal(ms), ["front-lever"], [], HOY), b = p.bloques[0];
  ok(b.prueba && b.series === 1 && b.objetivo === 60 && b.estrella === "front-lever.colgado-60s", "primero, la prueba: " + JSON.stringify(b));
  ok(p.ventana.join() === "front-lever" && p.bloques[1].constelacion === "front-lever" && !p.bloques[1].prueba, "después, el entrenamiento de siempre");
  const flojo = plan.armar(cieloReal([{...ms[0], valor: 40}]), ["front-lever"], [], HOY);
  ok(!flojo.bloques.some(x => x.prueba) && !flojo.ventana.length, "al 67 % no hay prueba");
  const vieja = {id: "a", fecha: "2026-09-20", bloques: []};
  ok(!plan.armar(cieloReal([{...ms[0], fecha: "2026-09-20"}], [vieja]), ["front-lever"], [vieja], HOY).ventana.length, "al volver de 3 semanas, primero se recupera");
  /* bici 17 de 20 min: la prueba es la salida del día, no se suma otra */
  const bi = plan.armar(cieloReal([{id: "b", estrella: "motor.bici-20", ejercicio: "bici", tipo: "minutos", valor: 17, fecha: "2026-10-18"}]), ["motor"], [], HOY);
  ok(bi.bloques.filter(x => x.constelacion === "motor").length === 1 && bi.bloques[0].prueba, "bici: una sola salida, la de la prueba: " + bi.bloques.map(x => x.constelacion + (x.prueba ? "*" : "")));
  ok(!plan.sePrueba({proxima: {prueba: {tipo: "menos-minutos", umbral: 50}, mejor: 52}}), "los 10 km no se prueban a manos libres: un toque antes de tiempo encendería la estrella");
  const c = cieloReal().constelaciones.find(x => x.id === "motor");
  ok(plan.sePrueba(cieloReal().constelaciones.find(x => x.id === "front-lever")) && plan.sePrueba(c), "bici 20 min se prueba");
});
prueba("calorias", () => {
  /* 40 min: 20 de bici (7 MET) y 20 de fuerza (3,8 MET), 70 kg → 163 + 89 = 252 → 250 */
  const x = {duracion: 2400, bloques: [{familia: "fu", series: [{ejercicio: "fl-tuck", tipo: "segundos", valor: 10}, {ejercicio: "fl-tuck", tipo: "segundos", valor: 12}]},
    {familia: "mo", series: [{ejercicio: "bici", tipo: "minutos", valor: 20}]}]};
  ok(calorias.deSesion(x, 70) === 250, "40 min con 20 de bici, 70 kg: " + calorias.deSesion(x, 70));
  ok(calorias.deSesion(x, undefined) === null && calorias.deSesion(x, 5) === null, "sin peso (o con uno imposible) no hay cuenta");
  ok(calorias.deSesion({duracion: 600, bloques: [{familia: "mo", series: [{ejercicio: "bici", tipo: "minutos", valor: 60}]}]}, 70) === 80, "lo anotado nunca pasa lo que duró la sesión: 10 min de bici");
  ok(calorias.deSesion({duracion: 60, bloques: [{familia: "ra", series: [{ejercicio: "cosaca", tipo: "segundos", valor: 15}]}]}, 70) === null, "menos de 30 no se muestra");
  ok(calorias.deSesion({...x, pesoKg: 70}, 100) === 250, "manda el peso que tenías ese día, no el de hoy");
});
prueba("respaldo-ida-y-vuelta", () => {
  const d = {mediciones: [{id: "m1", estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 40, fecha: "2026-10-01", origen: "anotado", creada: "2026-10-01T10:00:00.000Z"}],
    sesiones: [ses("s1", "2026-10-02", [sx("front-lever.colgado-60s", "colgado-activo", "segundos", 45)])].map(x => ({...x, duracion: 1800})), perfil: {peso: 72, rumbo: ["front-lever"], equipo: ["barra"]}};
  const txt = JSON.stringify(respaldo.armar(d, "k-prueba", 1, new Date("2026-10-20T12:00:00Z")));
  const r = respaldo.leer(txt);
  ok(!r.error && r.descartadas === 0, "el respaldo propio tiene que leerse entero: " + (r.error || r.descartadas));
  const vacio = {mediciones: [], sesiones: [], perfil: {}}, s = respaldo.sumar(vacio, r);
  ok(JSON.stringify(s.cambios.poner.mediciones) === JSON.stringify(d.mediciones) && JSON.stringify(s.cambios.poner.sesiones) === JSON.stringify(d.sesiones) && JSON.stringify(s.cambios.perfil) === JSON.stringify(d.perfil), "a un teléfono nuevo entra todo, tal cual");
  const otra = respaldo.sumar(d, r).cuenta;
  ok(!otra.mediciones && !otra.sesiones && !otra.perfil, "traer lo que ya está no suma nada");
  ok(respaldo.sumar({...vacio, perfil: {peso: 80}}, r).cambios.perfil.peso === undefined, "del perfil, lo del teléfono manda");
  ok(respaldo.leer("{no es json").error && respaldo.leer(JSON.stringify({app: "barra-y-bici", sess: []})).error, "otro archivo: se rechaza entero");
  ok(/más nueva/.test(respaldo.leer(JSON.stringify({app: "kozmos", formato: 9, mediciones: [], sesiones: []})).error), "de una versión más nueva: se rechaza y lo dice");
  const roto = JSON.parse(txt); roto.mediciones.push({id: "m2", estrella: "x", valor: -3, fecha: "2026-02-30"}, d.mediciones[0]); roto.sesiones.push({id: "s2", fecha: "2026-10-03", duracion: 60, bloques: [{constelacion: "x", series: [{ejercicio: "e", tipo: "inventado", valor: 1}]}]});
  roto.perfil.peso = 9000;
  const rr = respaldo.leer(JSON.stringify(roto));
  ok(rr.descartadas === 2 && rr.mediciones.length === 1 && rr.sesiones.length === 1 && rr.perfil.peso === undefined, "lo roto se descarta y se cuenta; lo repetido entra una vez: " + JSON.stringify([rr.descartadas, rr.mediciones.length, rr.sesiones.length, rr.perfil]));
});

/* ===== Rutinas y hazañas (etapa 5) ===== */
const EJM = () => Object.fromEntries(EJ.ejercicios.map(e => [e.id, e]));
const ESTRELLAS = new Set(CAT.constelaciones.flatMap(c => c.estrellas.map(e => e.id)));
const EQUIPOS = ["barra", "paralelas", "pared", "poste", "lastre", "bici", "soga", "mancuernas", "kettlebell"];
const CLASES = ["entrada", "fuerte", "suave", "pausa", "trabajo", "postura", "vuelta"];
const alts = x => [].concat(x || []);
function revisarTramos(ts, ej, donde){
  ok(Array.isArray(ts) && ts.length, `${donde}: tramos vacíos`);
  for (const t of rutina.desplegar(ts)){
    ok(CLASES.includes(t.clase), `${donde}: clase de tramo ${t.clase}`);
    ok(Number.isInteger(t.seg) && t.seg > 0, `${donde}: tramo sin segundos`);
    for (const e of alts(t.ejercicio)) ok(ej[e], `${donde}: ejercicio ${e} no existe`);
  }
}
prueba("catalogo-rutinas", () => {
  const ej = EJM(), ids = new Set(), fams = new Set(CAT.familias.map(f => f.id));
  ok(RUTINAS.length === 26, `esperaba 26 rutinas, hay ${RUTINAS.length}`);
  for (const [f, r] of RUTINAS){
    ok(f === r.id + ".json", `${f}: el archivo se llama como su id`);
    ok(!ids.has(r.id), `rutina repetida: ${r.id}`); ids.add(r.id);
    ok(fams.has(r.familia) && r.nombre && r.texto, `${r.id}: familia, nombre o texto`);
    ok(r.sesiones.length === r.semanas * r.dias, `${r.id}: ${r.sesiones.length} sesiones para ${r.semanas} × ${r.dias}`);
    ok(r.alimenta.length && r.alimenta.every(e => ESTRELLAS.has(e)), `${r.id}: alimenta una estrella que no existe`);
    ok((r.equipo || []).every(e => EQUIPOS.includes(e)), `${r.id}: equipo desconocido`);
    r.sesiones.forEach((s, i) => {
      ok(s.nombre && s.bloques.length, `${r.id} sesión ${i + 1}: sin nombre o sin bloques`);
      for (const b of s.bloques){
        if (b.tramos){ revisarTramos(b.tramos, ej, `${r.id} sesión ${i + 1}`); continue; }
        ok(alts(b.ejercicio).length && alts(b.ejercicio).every(e => ej[e]), `${r.id} sesión ${i + 1}: ejercicio ${b.ejercicio}`);
        ok(["repeticiones", "segundos"].includes(b.tipo), `${r.id} sesión ${i + 1}: tipo ${b.tipo}`);
      }
      /* lo que arma la app tiene que poder correrse */
      const p = rutina.deRutina(r, i, {ej});
      ok(p.bloques.length && p.minutos >= 5, `${r.id} sesión ${i + 1}: no arma nada`);
      for (const b of p.bloques) if (!b.clase) ok(b.pasos.every(x => x.objetivo === "max" || (Number.isFinite(x.objetivo) && x.objetivo > 0)), `${r.id} sesión ${i + 1}: objetivo raro`);
    });
  }
});
prueba("catalogo-hazanas", () => {
  const ej = EJM(), FORMATOS = ["tiempo", "chipper", "amrap", "emom", "intervalos", "flujo"];
  ok(HAZANAS.hazanas.length === 8, "esperaba 8 hazañas");
  for (const h of HAZANAS.hazanas){
    ok(FORMATOS.includes(h.formato) && h.nombre && h.texto, `${h.id}: formato, nombre o texto`);
    ok(h.niveles.length === 3, `${h.id}: siempre tres niveles`);
    h.niveles.forEach((n, k) => {
      if (n.tramos) revisarTramos(n.tramos, ej, `${h.id} nivel ${k}`);
      else ok(n.items.length && n.items.every(x => alts(x.ejercicio).every(e => ej[e])), `${h.id} nivel ${k}: ítems`);
      const p = rutina.deHazana(h, k, {ej});
      ok(p && p.bloques.length === 1 && p.minutos >= 5, `${h.id} nivel ${k}: no arma nada`);
    });
  }
});
const R = (bloques, extra = {}) => ({id: "r", familia: "fu", semanas: 1, dias: 1, alimenta: [], sesiones: [{nombre: "Uno", bloques}], ...extra});
const EJP = {dominada: {equipo: ["barra"]}, remo: {}, flexion: {}, fondo: {equipo: ["paralelas"]}};
prueba("rutina-equipo-elige", () => {
  const r = R([{ejercicio: ["dominada", "remo"], tipo: "repeticiones", series: 2, objetivo: 5}]);
  ok(rutina.deRutina(r, 0, {ej: EJP, equipo: ["barra"]}).bloques[0].ejercicio === "dominada", "con barra, la dominada");
  ok(rutina.deRutina(r, 0, {ej: EJP, equipo: []}).bloques[0].ejercicio === "remo", "sin barra, la alternativa");
  ok(rutina.deRutina(r, 0, {ej: EJP}).bloques[0].ejercicio === "dominada", "sin equipo cargado, la primera");
  ok(JSON.stringify(rutina.falta({equipo: ["barra", "soga"]}, EJP, ["barra"])) === '["soga"]' && rutina.falta({equipo: ["soga"]}, EJP, null).length === 0, "lo que pide y no tenés");
});
prueba("rutina-rango-sube", () => {
  const r = R([{ejercicio: "flexion", tipo: "repeticiones", series: 3, rango: [5, 8]}]);
  const obj = ses => rutina.deRutina(r, 0, {ej: EJP, sesiones: ses}).bloques[0].pasos.map(p => p.objetivo).join();
  const hizo = v => [{bloques: [{series: [{ejercicio: "flexion", tipo: "repeticiones", valor: v}]}]}];
  ok(obj([]) === "5,5,5", "la primera vez, el mínimo");
  ok(obj(hizo(6)) === "7,7,7", "después, uno más que tu mejor serie de la vez pasada");
  ok(obj(hizo(20)) === "8,8,8" && obj(hizo(2)) === "5,5,5", "dentro del rango");
});
prueba("rutina-superserie", () => {
  const r = R([{ejercicio: "flexion", tipo: "repeticiones", series: 2, objetivo: 10, grupo: "A"}, {ejercicio: "remo", tipo: "repeticiones", series: 2, objetivo: 8, grupo: "A"},
    {ejercicio: "flexion", tipo: "segundos", series: 1, porSerie: "max"}]);
  const p = rutina.deRutina(r, 0, {ej: EJP});
  ok(p.bloques.length === 2, "el grupo A se junta en un bloque");
  ok(p.bloques[0].pasos.map(x => x.ejercicio).join() === "flexion,remo,flexion,remo", "se alternan serie a serie");
  ok(p.bloques[1].pasos[0].objetivo === "max", "un solo «max» vale para todas las series");
});
prueba("rutina-elegir-columna", () => {
  const r = R([{ejercicio: "flexion", tipo: "repeticiones", series: 2, elegir: {umbrales: [5, 10], columnas: [[2, 3], [5, 6], [10, 12]]}}]);
  const col = v => rutina.deRutina(r, 0, {ej: EJP, sesiones: v === null ? [] : [{bloques: [{series: [{ejercicio: "flexion", tipo: "repeticiones", valor: v}]}]}]}).bloques[0].pasos.map(p => p.objetivo).join();
  ok(col(null) === "2,3" && col(4) === "2,3" && col(5) === "5,6" && col(30) === "10,12", "tu mejor serie elige la columna");
});
prueba("rutina-tramos-y-medir", () => {
  const r = R([{nombre: "Trote", tramos: [{clase: "entrada", seg: 300}, {repetir: 3, tramos: [{clase: "fuerte", seg: 120}, {clase: "suave", seg: 60}]}], mide: {ejercicio: "trote", tipo: "minutos", de: "fuerte-seguido"}}]);
  const b = rutina.deRutina(r, 0).bloques[0];
  ok(b.clase === "tramos" && b.tramos.length === 7 && b.series === 7, "repetir se despliega");
  ok(rutina.medir(b, [300, 120, 60, 180, 60, 120, 60]) === 3, "fuerte-seguido: el tramo fuerte más largo, en minutos");
  ok(rutina.medir({...b, mide: {de: "total"}}, [600, 600]) === 20, "total: todo el bloque");
  ok(rutina.medir({...b, mide: {tipo: "sesiones"}}, [300, 120, 60, 120, 60, 120, 60]) === 1 && rutina.medir({...b, mide: {tipo: "sesiones"}}, [300]) === 0, "sesiones: cuenta si hiciste el 80 %");
});
prueba("hazana-formatos", () => {
  const items = [{ejercicio: ["dominada", "remo"], reps: 5}, {ejercicio: "flexion", reps: 10}];
  const h = f => ({id: "h", nombre: "H", familia: "fu", formato: f, niveles: [{rondas: 3, minutos: 6, items}, {}, {}]});
  const t = rutina.deHazana(h("tiempo"), 0, {ej: EJP, equipo: []}).bloques[0];
  ok(t.clase === "circuito" && t.rondas === 3 && t.items[0].ejercicio === "remo", "por tiempo: circuito con el equipo que tenés");
  ok(rutina.deHazana(h("chipper"), 0).bloques[0].rondas === 1, "chipper: una sola vuelta");
  ok(rutina.deHazana(h("amrap"), 0).bloques[0].formato === "amrap", "amrap");
  const e = rutina.deHazana(h("emom"), 0).bloques[0];
  ok(e.clase === "tramos" && e.tramos.length === 6 && e.tramos.every(x => x.seg === 60) && e.tramos[1].ejercicio === "flexion", "emom: un minuto por ítem, alternando");
  const em = rutina.deHazana({...h("emom"), niveles: [{minutos: 4, items: [{ejercicio: "flexion", seg: 30}]}]}, 0).bloques[0];
  ok(em.tramos.every(x => x.seg === 60 && x.trabajo === 30), "emom: un ítem por segundos no acorta el minuto");
  ok(rutina.mejorEs(h("tiempo")) === "menos" && rutina.mejorEs(h("amrap")) === "mas" && rutina.mejorEs(h("emom")) === "hecha", "cómo se cuenta lo mejor");
  const ss = [{hazana: {id: "h", nivel: 0, valor: 300}}, {hazana: {id: "h", nivel: 0, valor: 250}}, {hazana: {id: "h", nivel: 0, valor: 100, completa: false}},
    {hazana: {id: "h", nivel: 0, valor: 90}, cortada: true}, {hazana: {id: "h", nivel: 1, valor: 50}}];
  ok(rutina.mejorHazana(h("tiempo"), 0, ss) === 250 && rutina.mejorHazana(h("amrap"), 0, ss) === 300 && rutina.mejorHazana(h("tiempo"), 2, ss) === null, "lo cortado o incompleto no es marca");
});
prueba("rutina-en-curso", () => {
  const r = {id: "r", dias: 3, sesiones: Array(9).fill({})};
  const s = (f, id = "r") => ({fecha: f, rutina: {id, sesion: 0}});
  ok(JSON.stringify(rutina.enCurso(r, "2026-10-01", [])) === JSON.stringify({i: 0, total: 9, terminada: false, semana: 1, dia: 1}), "sin hacer nada, la primera");
  const c = rutina.enCurso(r, "2026-10-01", [s("2026-09-30"), s("2026-10-01"), s("2026-10-02"), s("2026-10-03"), s("2026-10-04", "otra")]);
  ok(c.i === 3 && c.semana === 2 && c.dia === 1, "cuenta las de esta rutina desde que la elegiste");
  ok(rutina.enCurso(r, "", Array(9).fill(s("2026-10-01"))).terminada, "todas hechas: terminada");
  ok(rutina.enCurso(r, "", [{...s("2026-10-01"), cortada: true, rutina: {id: "r", sesion: 0, mitad: false}}, {...s("2026-10-02"), cortada: true, rutina: {id: "r", sesion: 0, mitad: true}}]).i === 1, "cortada antes de la mitad no cuenta");
});
prueba("tus-dias", () => {
  ok(rutina.diaSemana("2026-10-19") === 0 && rutina.diaSemana("2026-10-25") === 6, "0 es lunes, 6 es domingo");
  ok(rutina.toca(undefined, "2026-10-20") && rutina.toca([], "2026-10-20"), "sin elegir, todos los días");
  ok(rutina.toca([0, 2, 4], "2026-10-21") && !rutina.toca([0, 2, 4], "2026-10-20"), "lunes, miércoles y viernes");
  ok(rutina.faltan([0, 2, 4], "2026-10-20") === 1 && rutina.faltan([0, 2, 4], "2026-10-23") === 3 && rutina.faltan([1], "2026-10-20") === 7, "cuántos días faltan para el próximo");
});
prueba("respaldo-rutinas", () => {
  const s = {id: "s1", fecha: "2026-10-20", duracion: 1200, rutina: {id: "z2", sesion: 0}, hazana: {id: "hercules", nivel: 1, valor: 600, completa: true},
    bloques: [{familia: "mo", clase: "tramos", nombre: "Bici", series: [{ejercicio: null, tipo: "tramos", valor: 1, seg: 1200}]}]};
  const d = {mediciones: [], sesiones: [s], perfil: {rutina: {id: "z2", desde: "2026-10-01"}, dias: [0, 2, 4]}};
  const r = respaldo.leer(JSON.stringify(respaldo.armar(d, "k-prueba", 1, new Date("2026-10-20T12:00:00Z"))));
  ok(!r.error && r.descartadas === 0 && r.sesiones.length === 1, "una sesión de rutina y hazaña se lee entera: " + (r.error || r.descartadas));
  ok(JSON.stringify(r.perfil.rutina) === JSON.stringify(d.perfil.rutina) && JSON.stringify(r.perfil.dias) === "[0,2,4]", "la rutina y tus días viajan en el perfil");
  const mal = respaldo.leer(JSON.stringify({...respaldo.armar({...d, perfil: {dias: [9]}}, "k", 1, new Date()), sesiones: [{...s, rutina: {id: 3}}]}));
  ok(mal.sesiones.length === 0 && mal.perfil.dias === undefined, "lo roto no entra");
});
prueba("hazanas-figura", () => {
  /* cada hazaña se dibuja con su constelación: estrellas dentro de la caja y líneas entre estrellas que existen */
  for (const h of HAZANAS.hazanas){
    const f = h.figura;
    ok(f && Array.isArray(f.estrellas) && f.estrellas.length >= 2, h.id + ": sin figura");
    ok(f.estrellas.every(e => e.length === 2 && e.every(v => Number.isFinite(v) && v >= 0 && v <= 100)), h.id + ": una estrella fuera de la caja");
    ok(Array.isArray(f.lineas) && f.lineas.every(([a, b]) => a !== b && f.estrellas[a] && f.estrellas[b]), h.id + ": una línea a una estrella que no está");
  }
});

/* ===== El maniquí: cada ejercicio tiene su persona, y cada pose es posible ===== */
prueba("poses-de-cada-ejercicio", () => {
  const fx = {K: {reduce: () => true}, document: {}}; vm.createContext(fx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "piezas", "figura.js"), "utf8"), fx);
  for (const f of fs.readdirSync(path.join(RAIZ, "src", "poses")).sort()) vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "poses", f), "utf8"), fx);
  const {POSES, fig} = fx.K, ids = new Set(EJ.ejercicios.map(e => e.id));
  const faltan = [...ids].filter(id => !POSES[id]), sobran = Object.keys(POSES).filter(id => !ids.has(id));
  ok(!faltan.length, "sin pose: " + faltan.join(", "));
  ok(!sobran.length, "pose de un ejercicio que no está: " + sobran.join(", "));
  /* la revisión del motor: articulaciones dentro de lo posible y nada atravesando el piso, en todo el recorrido */
  const mal = Object.keys(POSES).map(id => [id, fig.revisar(id)]).filter(([, m]) => m.length);
  ok(!mal.length, mal.map(([id, m]) => `${id}: ${m.join(" · ")}`).join(" | "));
  /* se dibuja: grande y chica son SVG con la persona sorteada (tono y pelo) */
  for (const id of ids){ const g = fig.grande(id, "fu"), c = fig.chica(id, "fu");
    ok(g.startsWith("<svg") && /--tono:#[0-9a-f]{6}/.test(g) && !/NaN|undefined/.test(g + c), id + ": no se dibuja bien"); }
  /* el sorteo de la piel da para todos: entre los 155 aparecen al menos seis tonos */
  ok(new Set([...ids].map(id => fig.persona(id).match(/--tono:(#\w+)/)[1])).size >= 6, "pocos tonos de piel");
});

let fallas = 0;
for (const [n, fn] of PRUEBAS){
  try { fn(); console.log("ok    ", n); } catch (e) { fallas++; console.log("FALLA ", n, "·", e.message); }
}
console.log(fallas ? `FALLAN ${fallas} sin pantalla` : `TODO OK sin pantalla · ${PRUEBAS.length} pruebas`);
process.exitCode = fallas ? 1 : 0;
