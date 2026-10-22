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
const ESC = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "escaleras.json"), "utf8"));
ctx.K.ESCALERAS = ESC;
ctx.K.HAZANAS = HAZANAS;
ctx.K.RUTINAS = RUTINAS.map(([, r]) => r);

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
    /* bloques de 4 a 6 semanas: de 3 a 5 de carga y una de prueba, y al menos una semana de prueba en la rutina */
    ok(r.bloque && Number.isInteger(r.bloque.carga) && r.bloque.carga >= 3 && r.bloque.carga <= 5 && r.bloque.prueba === 1 && r.semanas > r.bloque.carga, `${r.id}: bloque ${JSON.stringify(r.bloque)}`);
    ok(r.alimenta.length && r.alimenta.every(e => ESTRELLAS.has(e)), `${r.id}: alimenta una estrella que no existe`);
    ok((r.equipo || []).every(e => EQUIPOS.includes(e)), `${r.id}: equipo desconocido`);
    r.sesiones.forEach((s, i) => {
      ok(s.nombre && s.bloques.length, `${r.id} sesión ${i + 1}: sin nombre o sin bloques`);
      for (const b of s.bloques){
        if (b.tramos){ revisarTramos(b.tramos, ej, `${r.id} sesión ${i + 1}`); continue; }
        ok(Number.isInteger(b.series) && b.series > 0, `${r.id} sesión ${i + 1}: series ${b.series}`);
        ok(!b.rango || (b.rango.length === 2 && b.rango[0] > 0 && b.rango[0] <= b.rango[1]), `${r.id} sesión ${i + 1}: rango ${b.rango}`);
        if (b.escalera){
          /* un bloque de escalera nombra escaleras que existen, y el escalón de arranque es de la primera */
          ok(alts(b.escalera).length && alts(b.escalera).every(id => ESC.escaleras.some(e => e.id === id)), `${r.id} sesión ${i + 1}: escalera ${b.escalera}`);
          ok(!b.desde || ESC.escaleras.find(e => e.id === alts(b.escalera)[0]).pasos.some(p => p.ejercicio === b.desde), `${r.id} sesión ${i + 1}: arranca en ${b.desde}, que no es de la escalera`);
          ok(!b.ejercicio && !b.tipo, `${r.id} sesión ${i + 1}: un bloque de escalera no nombra ejercicio ni tipo`);
          continue;
        }
        ok(alts(b.ejercicio).length && alts(b.ejercicio).every(e => ej[e]), `${r.id} sesión ${i + 1}: ejercicio ${b.ejercicio}`);
        ok(["repeticiones", "segundos"].includes(b.tipo), `${r.id} sesión ${i + 1}: tipo ${b.tipo}`);
        ok(!b.carga || (b.rango && b.tipo === "repeticiones" && alts(b.ejercicio).some(e => (ej[e].equipo || []).includes("lastre"))), `${r.id} sesión ${i + 1}: la carga va con rango y lastre`);
      }
      /* lo que arma la app tiene que poder correrse */
      const p = rutina.deRutina(r, i, {ej});
      ok(p.bloques.length && p.minutos >= 5, `${r.id} sesión ${i + 1}: no arma nada`);
      for (const b of p.bloques) if (!b.clase) ok(b.pasos.every(x => x.objetivo === "max" || (Number.isFinite(x.objetivo) && x.objetivo > 0)), `${r.id} sesión ${i + 1}: objetivo raro`);
    });
  }
});
prueba("catalogo-hazanas", () => {
  /* hazañas v2: pruebas estandarizadas. Miden un ejercicio, tienen escala de cinco (magnitud 5 a 1), estrellas que encienden y cada cuánto */
  const ej = EJM(), FORMATOS = ["maximo", "reloj", "escalera", "tiempo"], nombres = new Set();
  ok(HAZANAS.version === 2 && HAZANAS.hazanas.length === 8, "esperaba las 8 hazañas, en la versión 2");
  /* las ocho de antes siguen (sus marcas guardadas las nombran) */
  ok(["hercules", "pegaso", "sagitario", "orion", "andromeda", "draco", "perseo", "casiopea"].every(id => HAZANAS.hazanas.some(h => h.id === id)), "se perdió una hazaña de antes");
  for (const h of HAZANAS.hazanas){
    ok(FORMATOS.includes(h.formato) && h.nombre && h.prueba && h.texto && h.como, `${h.id}: formato, nombre, prueba o texto`);
    ok(!nombres.has(h.nombre) && /^[A-ZÁÉÍÓÚ]/.test(h.nombre), `${h.id}: el nombre es propio y no se repite`); nombres.add(h.nombre);
    ok(ej[h.mide.ejercicio] && cielo.TIPOS[h.mide.tipo] && h.mide.tipo !== "mejora", `${h.id}: mide algo que no existe`);
    const u = Array.isArray(h.escala) ? h.escala : h.escala.propia, menos = cielo.TIPOS[h.mide.tipo].mejor === "menos" && Array.isArray(h.escala);
    ok(u.length === 5 && u.every(Number.isFinite) && u.every((x, i) => !i || (menos ? x < u[i - 1] : x > u[i - 1])), `${h.id}: la escala no va de la magnitud 5 a la 1`);
    ok(Number.isInteger(h.cada) && h.cada >= 28 && h.cada <= 84, `${h.id}: cada ${h.cada} días`);
    ok(h.estrellas.length >= 1, `${h.id}: no enciende nada`);
    for (const id of h.estrellas){
      const e = ESTRELLA.get(id); ok(e, `${h.id}: la estrella ${id} no existe`);
      const tipo = Array.isArray(h.escala) ? h.mide.tipo : "mejora";
      ok(e.prueba.ejercicio === h.mide.ejercicio && e.prueba.tipo === tipo, `${h.id}: ${id} se mide con otra cosa (${e.prueba.ejercicio} ${e.prueba.tipo})`);
    }
    ok(!h.entrena || (ej[h.entrena.ejercicio] && cielo.TIPOS[h.entrena.tipo] && h.entrena.objetivo > 0 && h.entrena.series > 0), `${h.id}: lo que entrena entre pruebas`);
    ok(h.antes && h.antes.formato, `${h.id}: sin el formato de antes (las marcas viejas se leen con él)`);
    const p = rutina.deHazana(h, {ej});
    ok(p && p.bloques.length === 1 && p.hazana.v === 2 && p.bloques[0].hazana === h.id && p.minutos >= 5, `${h.id}: no arma nada`);
  }
  /* las de solo «la hiciste» pasaron a medir algo */
  for (const id of ["pegaso", "sagitario", "draco", "casiopea"]) ok(HAZANAS.hazanas.find(h => h.id === id).mide, id + ": sigue sin medir nada");
  /* una prueba enciende estrellas en más de una constelación */
  ok(HAZANAS.hazanas.filter(h => new Set(h.estrellas.map(e => e.split(".")[0])).size > 1).length >= 4, "pocas pruebas que enciendan en varias constelaciones");
  /* lo que solo se mide con una prueba tiene su hazaña, y la hazaña dice qué entrenar entre pruebas */
  for (const c of CAT.constelaciones) for (const e of c.estrellas) if (plan.soloPrueba(e.prueba)){
    const h = HAZANAS.hazanas.find(x => x.estrellas.includes(e.id));
    ok(h && h.entrena, `${e.id}: solo se enciende con una prueba y ninguna hazaña la mide (o no dice qué entrenar)`);
  }
  /* las metas de ir (8 y 12 sesiones de intervalos) se fueron: el motor se mide con Motor 12 */
  ok(RET.estrellas.includes("motor.intervalos-8") && RET.estrellas.includes("motor.intervalos-12") && ESTRELLA.get("motor.m12-10") && ESTRELLA.get("motor.m12-20"), "el motor sigue con metas de ir");
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
  const H = id => HAZANAS.hazanas.find(h => h.id === id), ej = EJM();
  const t = rutina.deHazana(H("perseo"), {ej}).bloques[0];
  ok(!t.clase && t.ejercicio === "dominada" && t.tipo === "repeticiones" && t.objetivo === "max" && t.series === 1, "máximo: una serie, todas las que salgan");
  const r = rutina.deHazana(H("pegaso"), {ej}).bloques[0];
  ok(r.tipo === "km" && r.reloj === 720, "reloj: 12 minutos y anotás los km");
  const e = rutina.deHazana(H("andromeda"), {ej}).bloques[0];
  ok(e.clase === "circuito" && e.formato === "escalera" && e.mide.ejercicio === "dominada", "escalera de minutos: un circuito que mide dominadas");
  const o = rutina.deHazana(H("orion"), {ej}).bloques[0];
  ok(o.clase === "circuito" && o.formato === "tiempo" && o.rondas === 1 && o.items[0].reps === 1000 && o.mide.tipo === "tiempo", "mil saltos: por tiempo");
  ok(rutina.mejorEs({antes: {formato: "amrap"}}) === "mas" && rutina.mejorEs({antes: {formato: "chipper"}}) === "menos" && rutina.mejorEs({antes: {formato: "emom"}}) === "hecha", "lo de antes se cuenta como se contaba");
});
prueba("hazana-escala-y-magnitud", () => {
  const H = id => HAZANAS.hazanas.find(h => h.id === id);
  const p = H("perseo"), o = H("orion"), g = H("pegaso"), c = H("casiopea");
  ok([0, 1, 4, 5, 12, 20, 31].map(v => rutina.magnitud(p, v)).join() === ",5,5,4,3,1,1", "Tirón: 1 · 5 · 10 · 15 · 20");
  ok([1000, 900, 700, 541, 480].map(v => rutina.magnitud(o, v)).join() === ",5,4,3,1", "Mil saltos: menos tiempo, mejor magnitud");
  ok([-12, -10, 0, 7, 15].map(v => rutina.magnitud(c, v)).join() === ",5,4,3,1", "Compresión: centímetros, también negativos");
  ok(rutina.umbrales(g, []) === null && rutina.magnitud(g, 6, []) === null, "Motor 12 sin primera vez no tiene escala");
  const vs = [{fecha: "2026-08-01", valor: 6}];
  ok(rutina.umbrales(g, vs).join() === "6,6.3,6.6,6.9,7.2" && rutina.magnitud(g, 6, vs) === 5 && rutina.magnitud(g, 6.7, vs) === 3, "Motor 12: contra tu primera vez");
  /* tus veces: una por sesión, la mejor; lo de antes queda aparte */
  const ses = [
    {id: "v", fecha: "2026-07-01", hazana: {id: "perseo", nivel: 1, valor: 4}, bloques: [{series: [{ejercicio: "perseo", tipo: "hazana", valor: 4}]}]},
    {id: "a", fecha: "2026-08-20", bloques: [{hazana: "perseo", series: [{ejercicio: "dominada", tipo: "repeticiones", valor: 9, hazana: "perseo"}]}]},
    {id: "b", fecha: "2026-10-01", bloques: [{hazana: "perseo", series: [{ejercicio: "dominada", tipo: "repeticiones", valor: 12, hazana: "perseo"}, {ejercicio: "dominada", tipo: "repeticiones", valor: 10, hazana: "perseo"}]}]}];
  const v = rutina.veces(p, ses);
  ok(v.map(x => x.valor).join() === "9,12", "tus veces: " + JSON.stringify(v));
  ok(rutina.anteriores(p, ses).length === 1 && rutina.anteriores(p, ses)[0].nivel === 1, "la de antes queda en tu historia");
  const q = rutina.cuando(p, ses, "2026-10-21");
  ok(q.dias === 20 && q.falta === 22 && rutina.cuando(o, ses, "2026-10-21").falta < 0, "cuándo toca: cada 6 semanas; nunca hecha, ya");
  ok(rutina.proximaPrueba([p, o], ses, "2026-10-21").id === "orion", "la próxima prueba es la que toca antes");
  ok(rutina.proximaPrueba([o, p], ses, "2026-10-21", {ej: EJM(), equipo: ["barra"]}).id === "perseo", "sin soga, Mil saltos no es la próxima");
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
/* ===== Escaleras (Modelo A): el catálogo y las reglas ===== */
const ESTRELLA = new Map(CAT.constelaciones.flatMap(c => c.estrellas.map(e => [e.id, e])));
prueba("catalogo-escaleras", () => {
  const ej = EJM(), ids = new Set(), fams = new Set(CAT.familias.map(f => f.id));
  ok(ESC.escaleras.length >= 8 && ESC.escaleras.length <= 10, `esperaba de 8 a 10 escaleras, hay ${ESC.escaleras.length}`);
  /* qué mide cada ejercicio según las estrellas */
  const mide = new Map(CAT.constelaciones.flatMap(c => c.estrellas.map(e => [e.prueba.ejercicio, e.prueba.tipo])));
  for (const e of ESC.escaleras){
    ok(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id) && !ids.has(e.id), `escalera con id raro o repetido: ${e.id}`); ids.add(e.id);
    ok(e.nombre && e.texto && fams.has(e.familia), `${e.id}: nombre, texto o familia`);
    ok(e.pasos.length >= 3, `${e.id}: una escalera tiene al menos tres escalones`);
    ok(new Set(e.pasos.map(p => p.ejercicio)).size === e.pasos.length, `${e.id}: un ejercicio repetido`);
    for (const p of e.pasos){
      ok(ej[p.ejercicio], `${e.id}: el ejercicio ${p.ejercicio} no existe`);
      ok(["repeticiones", "segundos"].includes(p.tipo), `${e.id}: ${p.ejercicio} con tipo ${p.tipo}`);
      ok(!mide.has(p.ejercicio) || mide.get(p.ejercicio) === p.tipo, `${e.id}: ${p.ejercicio} se mide como ${mide.get(p.ejercicio)} en el cielo y como ${p.tipo} en la escalera`);
      ok(p.tipo !== "segundos" || (Number.isFinite(p.meta) && p.meta >= 10), `${e.id}: ${p.ejercicio} es un sostén sin meta`);
      ok(!p.rango || (p.rango[0] > 0 && p.rango[0] <= p.rango[1]), `${e.id}: ${p.ejercicio} con rango ${p.rango}`);
    }
  }
  /* toda escalera la usa alguna rutina */
  const usadas = new Set(RUTINAS.flatMap(([, r]) => r.sesiones.flatMap(s => s.bloques.flatMap(b => alts(b.escalera)))));
  ok(ESC.escaleras.every(e => usadas.has(e.id)), "escaleras que ninguna rutina usa: " + ESC.escaleras.filter(e => !usadas.has(e.id)).map(e => e.id));
});
prueba("rutina-alimenta-alcanzable", () => {
  /* cada estrella de «Entrena para» tiene que poder encenderse desde la rutina: su ejercicio está en alguna escalera que la
     rutina usa, en un bloque suelto que lo mide igual (o con carga, si se mide en % de tu peso), en lo que anotan sus tramos
     o en una hazaña de su semana de prueba */
  const ej = EJM(), mal = [];
  for (const [, r] of RUTINAS){
    const bs = r.sesiones.flatMap(s => s.bloques);
    const alcanza = new Set();
    for (const b of bs){
      if (b.mide) alcanza.add(b.mide.ejercicio + "|" + b.mide.tipo);
      for (const id of alts(b.escalera)) for (const p of ESC.escaleras.find(e => e.id === id).pasos){ alcanza.add(p.ejercicio + "|" + p.tipo); if (p.carga) alcanza.add(p.ejercicio + "|porcentaje"); }
      for (const e of alts(b.ejercicio)){ if (b.tipo) alcanza.add(e + "|" + b.tipo); if (b.carga) alcanza.add(e + "|porcentaje"); }
    }
    /* y lo que miden las hazañas de su semana de prueba */
    for (const h of rutina.hazanasDe(r, HAZANAS.hazanas, {ej})) for (const id of h.estrellas){ const p = ESTRELLA.get(id).prueba; alcanza.add(p.ejercicio + "|" + p.tipo); }
    for (const id of r.alimenta){ const p = ESTRELLA.get(id).prueba; if (!alcanza.has(p.ejercicio + "|" + p.tipo)) mal.push(`${r.id} → ${id}`); }
  }
  ok(!mal.length, `${mal.length} estrellas de «Entrena para» que la rutina nunca mide: ${mal.join(", ")}`);
});

/* un catálogo chico de escaleras para las reglas */
const ESC_MINI = {version: 1, escaleras: [
  {id: "t", nombre: "Tirar", familia: "fu", texto: "", pasos: [{ejercicio: "colgado", tipo: "segundos", meta: 30}, {ejercicio: "negativa", tipo: "repeticiones", rango: [3, 5]}, {ejercicio: "dominada", tipo: "repeticiones"}, {ejercicio: "arquera", tipo: "repeticiones", rango: [3, 5]}]},
  {id: "s", nombre: "Sostén", familia: "fu", texto: "", pasos: [{ejercicio: "hollow", tipo: "segundos", meta: 40}, {ejercicio: "lsit", tipo: "segundos", meta: 20}]}]};
const conEsc = fn => { const antes = ctx.K.ESCALERAS; ctx.K.ESCALERAS = ESC_MINI; try { return fn(); } finally { ctx.K.ESCALERAS = antes; } };
const EJE = {colgado: {equipo: ["barra"]}, negativa: {equipo: ["barra"]}, dominada: {equipo: ["barra"]}, arquera: {equipo: ["barra"]}, hollow: {}, lsit: {equipo: ["paralelas"]}};
/* una sesión con las series de un escalón: valores, y opcionalmente la sensación de cada una */
let nSes = 0;
const hecha = (esc, ejercicio, vs, {rango = [5, 8], objetivo, sens = [], descarga, tipo = "repeticiones", n} = {}) => ({id: "e" + (++nSes), fecha: "2026-10-" + String(nSes % 28 + 1).padStart(2, "0"),
  bloques: [{series: vs.map((v, k) => ({ejercicio, tipo, valor: v, objetivo: Array.isArray(objetivo) ? objetivo[k] : objetivo ?? rango[0], escalera: esc, rango, n: n ?? vs.length, ...(sens[k] ? {sensacion: sens[k]} : {}), ...(descarga ? {descarga: true} : {})}))}]});
const est = (ss, desde = "dominada", rango = [5, 8], id = "t", equipo = null) => conEsc(() => { const d = rutina.defEscalera(rutina.escalera(id), EJE, equipo, desde, rango); return {st: rutina.escalon(d, ss), d}; });
const metasDe = (ss, b = {series: 3, rango: [5, 8]}, desde = "dominada", id = "t") => conEsc(() => { const {st, d} = est(ss, desde, b.rango, id); return rutina.metas(d, st, b).objetivos.join(); });

prueba("escalera-sumar", () => {
  /* sin historia: el escalón de arranque, todo en el mínimo */
  ok(est([]).st.paso.ejercicio === "dominada" && metasDe([]) === "5,5,5", "sin historia no arranca en el mínimo: " + metasDe([]));
  /* cada serie apunta a lo que hiciste en esa serie más uno, no a tu mejor serie repetida */
  ok(metasDe([hecha("t", "dominada", [8, 5, 4])]) === "8,6,5", "no suma por serie: " + metasDe([hecha("t", "dominada", [8, 5, 4])]));
  ok(metasDe([hecha("t", "dominada", [9, 2])]) === "8,5,5", "fuera del rango no se acota: " + metasDe([hecha("t", "dominada", [9, 2])]));
});
prueba("escalera-subir", () => {
  /* el tope en todas las series dos veces seguidas: subís y volvés al mínimo */
  const una = [hecha("t", "dominada", [8, 8, 8], {objetivo: 8})];
  ok(est(una).st.paso.ejercicio === "dominada" && est(una).st.evento === "igual", "subió con una sola vez en el tope");
  const dos = [...una, hecha("t", "dominada", [8, 8, 8], {objetivo: 8})], s2 = est(dos).st;
  ok(s2.paso.ejercicio === "arquera" && s2.evento === "sube" && s2.nuevo === "sube" && s2.de.ejercicio === "dominada", "no subió con dos veces en el tope: " + s2.paso.ejercicio);
  ok(metasDe(dos) === "3,3,3", "después de subir no vuelve al mínimo del escalón nuevo: " + metasDe(dos));
  /* con «sobró» en la última serie alcanza una vez */
  ok(est([hecha("t", "dominada", [8, 8, 8], {sens: [, , "sobro"]})]).st.paso.ejercicio === "arquera", "«sobró» no alcanza para subir con una vez");
  /* no todas en el tope (o menos series que las pedidas) no sube */
  ok(est([hecha("t", "dominada", [8, 8, 7], {objetivo: 8}), hecha("t", "dominada", [8, 8, 8], {objetivo: 8})]).st.paso.ejercicio === "dominada", "subió sin dos veces seguidas en el tope");
  ok(est([hecha("t", "dominada", [8, 8], {n: 3, objetivo: 8}), hecha("t", "dominada", [8, 8], {n: 3, objetivo: 8})]).st.paso.ejercicio === "dominada", "subió con series de menos");
  /* arriba de todo se queda */
  const cima = est([hecha("t", "arquera", [5, 5, 5], {rango: [3, 5]}), hecha("t", "arquera", [5, 5, 5], {rango: [3, 5]})]).st;
  ok(cima.paso.ejercicio === "arquera" && cima.evento === "cima", "arriba de la escalera: " + cima.evento);
});
prueba("escalera-bajar", () => {
  /* dos sesiones sin llegar al mínimo en la primera serie: un escalón abajo */
  const una = [hecha("t", "dominada", [3, 4, 4])];
  ok(est(una).st.paso.ejercicio === "dominada", "bajó con una sola vez");
  const dos = [...una, hecha("t", "dominada", [4, 5, 5])], s = est(dos).st;
  ok(s.paso.ejercicio === "negativa" && s.evento === "baja" && s.nuevo === "baja", "no bajó con dos veces sin el mínimo: " + s.paso.ejercicio);
  ok(metasDe(dos) === "3,3,3", "abajo arranca en el mínimo del escalón: " + metasDe(dos));
  /* una buena en el medio corta la racha */
  ok(est([hecha("t", "dominada", [3, 4]), hecha("t", "dominada", [6, 5]), hecha("t", "dominada", [4, 4])]).st.paso.ejercicio === "dominada", "la racha no se cortó");
});
prueba("escalera-trabado", () => {
  /* tres sesiones sin mejorar abren una descarga: la mitad de las series, sin sumar; después se vuelve a probar */
  const ss = [hecha("t", "dominada", [6, 6, 5]), hecha("t", "dominada", [6, 5, 5]), hecha("t", "dominada", [6, 6, 5]), hecha("t", "dominada", [5, 6, 6])];
  const s = est(ss).st;
  ok(s.evento === "trabado" && s.descarga, "no se trabó: " + s.evento);
  ok(metasDe(ss) === "5,6", "la descarga no es la mitad de las series sin sumar: " + metasDe(ss));
  const tras = [...ss, hecha("t", "dominada", [5, 6], {descarga: true})], t = est(tras).st;
  ok(t.evento === "descarga" && !t.descarga && t.retest, "después de la descarga no se vuelve a probar");
  ok(metasDe(tras) === "6,7,7", "la prueba después de la descarga no sale de la sesión anterior: " + metasDe(tras));
  /* mejorar de a poco no traba */
  ok(est([hecha("t", "dominada", [5, 5, 5]), hecha("t", "dominada", [6, 5, 5]), hecha("t", "dominada", [6, 6, 5]), hecha("t", "dominada", [6, 6, 6])]).st.evento === "igual", "mejorando, se trabó");
});
prueba("escalera-sostenes", () => {
  const b = {series: 3};
  /* sin marca: la mitad de la meta, hasta sumar 60 s */
  ok(metasDe([], b, "hollow", "s") === "20,20,20", "sostén sin marca: " + metasDe([], b, "hollow", "s"));
  /* con marca: el 70 % de tu mejor, hasta sumar 60 s; si sobró, el 80; si no llegaste, el 50 */
  const h = (vs, sens) => hecha("s", "hollow", vs, {tipo: "segundos", rango: [5, 40], objetivo: 20, sens});
  ok(metasDe([h([30, 20, 20])], b, "hollow", "s") === "21,21,21", "el 70 %: " + metasDe([h([30, 20, 20])], b, "hollow", "s"));
  ok(metasDe([h([30, 20, 20], [, , "sobro"])], b, "hollow", "s") === "24,24,24", "si sobró, el 80 %");
  ok(metasDe([h([30, 20, 10], [, , "no-llego"])], b, "hollow", "s") === "15,15,15,15", "si no llegaste, el 50 %");
  /* el tope es la meta: con todos los sostenes en la meta dos veces, subís */
  const s = est([h([40, 40, 40]), h([41, 40, 40])], "hollow", undefined, "s").st;
  ok(s.paso.ejercicio === "lsit" && s.evento === "sube", "los sostenes no suben: " + s.paso.ejercicio);
  /* menos de 5 s: el escalón de abajo, de una */
  const l = est([hecha("s", "lsit", [3, 2], {tipo: "segundos", rango: [5, 20], objetivo: 10})], "lsit", undefined, "s").st;
  ok(l.paso.ejercicio === "hollow" && l.evento === "baja", "con menos de 5 s no baja: " + l.paso.ejercicio);
  /* sin mejorar tres veces: descarga y, después, un sostén al máximo para medirte */
  const ss = [h([30, 20, 20]), h([21, 21, 21]), h([21, 21, 21]), h([21, 21, 21])];
  ok(est(ss, "hollow", undefined, "s").st.descarga, "los sostenes no se traban");
  ok(metasDe([...ss, h([21, 21], undefined).bloques ? {...h([21, 21]), bloques: [{series: h([21, 21]).bloques[0].series.map(x => ({...x, descarga: true}))}]} : null], b, "hollow", "s").startsWith("max,"), "después de la descarga no hay un sostén al máximo");
});
prueba("escalera-inferir", () => {
  /* sin tocar nada, la sensación sale de lo hecho contra lo pedido */
  ok(rutina.inferir(8, 6, "repeticiones") === "sobro" && rutina.inferir(7, 6, "repeticiones") === "justo" && rutina.inferir(6, 6, "repeticiones") === "justo" && rutina.inferir(5, 6, "repeticiones") === "no-llego", "repeticiones");
  ok(rutina.inferir(25, 20, "segundos") === "sobro" && rutina.inferir(24, 20, "segundos") === "justo" && rutina.inferir(10, 20, "segundos") === "no-llego", "segundos");
  ok(rutina.inferir(8, "max", "repeticiones") === null, "al máximo no se infiere");
  /* lo marcado manda sobre lo inferido */
  ok(rutina.sensDe({valor: 10, objetivo: 6, tipo: "repeticiones", sensacion: "justo"}) === "justo" && rutina.sensDe({valor: 10, objetivo: 6, tipo: "repeticiones"}) === "sobro", "lo marcado no manda");
  /* inferido: 10 cuando se pedían 8 es «sobró», y con todas en el tope alcanza una vez para subir */
  ok(est([hecha("t", "dominada", [8, 8, 10], {objetivo: 8})]).st.paso.ejercicio === "arquera", "«sobró» inferido no sube");
  ok(est([hecha("t", "dominada", [8, 8, 9], {objetivo: 8})]).st.paso.ejercicio === "dominada", "uno de más no es «sobró»");
});
prueba("escalera-equipo-y-viejas", () => {
  conEsc(() => {
    /* sin barra, la escalera es la de lo que podés hacer */
    const d = rutina.defEscalera(rutina.escalera("s"), EJE, [], "lsit");
    ok(d.pasos.length === 1 && d.pasos[0].ejercicio === "hollow", "sin paralelas, el L-sit no es un escalón");
    ok(rutina.elegirEscalera(["t", "s"], EJE, []).id === "s" && rutina.elegirEscalera(["t", "s"], EJE, ["barra"]).id === "t", "elegir la escalera por equipo");
    /* una sesión vieja de rutina (sin escalera anotada) también cuenta, por sus ejercicios */
    const vieja = {id: "v1", fecha: "2026-09-01", rutina: {id: "base_cali", sesion: 0}, bloques: [{series: [6, 6, 6].map(v => ({ejercicio: "dominada", tipo: "repeticiones", valor: v, objetivo: 5}))}]};
    const dd = rutina.defEscalera(rutina.escalera("t"), EJE, null, "negativa", [5, 8]);
    const s = rutina.escalon(dd, [vieja]);
    ok(s.paso.ejercicio === "dominada" && JSON.stringify(rutina.metas(dd, s, {series: 3, rango: [5, 8]}).objetivos) === "[7,7,7]", "la sesión vieja no cuenta: " + s.paso.ejercicio);
    /* lo de un plan del día (con estrella) o de otra escalera no mueve esta */
    const otra = {id: "v2", fecha: "2026-09-02", bloques: [{series: [{ejercicio: "arquera", tipo: "repeticiones", valor: 5, estrella: "x", escalera: "otra"}]}]};
    ok(rutina.escalon(dd, [vieja, otra]).paso.ejercicio === "dominada", "una serie ajena movió la escalera");
  });
});
prueba("escalera-carga", () => {
  /* un bloque suelto con carga (lastre): con todas en el tope dos veces, suma 2,5 kg y vuelve al mínimo */
  const EJL = {"dominada-lastre": {equipo: ["barra", "lastre"]}};
  const b = {ejercicio: "dominada-lastre", tipo: "repeticiones", series: 3, rango: [4, 6], carga: 2.5}, d = rutina.defSuelto("dominada-lastre", b, EJL);
  const l = (vs, kg) => ({id: "l" + (++nSes), fecha: "2026-10-01", bloques: [{series: vs.map(v => ({ejercicio: "dominada-lastre", tipo: "repeticiones", valor: v, objetivo: 4, rango: [4, 6], n: 3, lastreKg: kg, pesoKg: 80}))}]});
  const s = rutina.escalon(d, [l([6, 6, 6], 10), l([6, 6, 6], 10)]);
  ok(s.evento === "carga" && s.kg === 12.5, "no sumó la carga: " + JSON.stringify([s.evento, s.kg]));
  ok(rutina.metas(d, s, b).objetivos.join() === "4,4,4", "con más carga no vuelve al mínimo");
  /* la serie con lastre también enciende las estrellas de % de tu peso */
  const c = cielo.calcular(CAT, [], HOY, [l([5], 10)]).constelaciones.find(k => k.id === "lastre");
  ok(c.estrellas[0].encendida, "12,5 % de tu peso con lastre no encendió «Dominada +10 %»");
});
prueba("escalera-en-la-rutina", () => {
  /* la sesión de una rutina con escaleras: el escalón que toca, sus objetivos y lo que el diario guarda para la próxima */
  const r = RUTINAS.find(([, x]) => x.id === "base_cali")[1], ej = EJM();
  const p = rutina.deRutina(r, 0, {ej, equipo: ["barra"]});
  const a = p.bloques.find(b => !b.clase);
  ok(a.pasos[0].ejercicio === "dominada-negativa" && a.pasos[0].escalera === "tirar" && JSON.stringify(a.pasos[0].rango) === "[3,5]" && a.pasos[0].n === 3, "el primer bloque de la base: " + JSON.stringify(a.pasos[0]));
  ok(a.pasos[1].escalera === "piernas" && a.pasos[1].ejercicio === "sentadilla", "la superserie con piernas");
  /* sin barra, el bloque de tirar pasa a la escalera de remo */
  ok(rutina.deRutina(r, 0, {ej, equipo: []}).bloques.find(b => !b.clase).pasos[0].escalera === "remo", "sin barra no cambia de escalera");
  /* sus escaleras, en orden */
  const es = rutina.escalerasDe(r, {ej, equipo: ["barra"]});
  ok(es.map(x => x.id).join() === "tirar,piernas,fondos,isquios,remo,empujar,lsit" && es[0].i === 2 && es[0].total === 7, "las escaleras de la base: " + es.map(x => `${x.id} ${x.i + 1}/${x.total}`));
  /* el resumen: ▲ en tirar, = en piernas */
  const ses = (id, vs) => ({id, fecha: "2026-10-0" + id.length, rutina: {id: "base_cali", sesion: 0}, bloques: [{series: [
    ...vs.map(v => ({ejercicio: "dominada-negativa", tipo: "repeticiones", valor: v, objetivo: 5, escalera: "tirar", rango: [3, 5], n: 3})),
    ...[9, 9, 9].map(v => ({ejercicio: "sentadilla", tipo: "repeticiones", valor: v, objetivo: 8, escalera: "piernas", rango: [8, 12], n: 3}))]}]});
  const ss = [ses("a", [5, 5, 5]), ses("aa", [5, 5, 5])];
  const cs = rutina.cambios(ss[1], ss, {ej, equipo: ["barra"]});
  const t = cs.find(x => x.id === "tirar"), pi = cs.find(x => x.id === "piernas");
  ok(t && t.evento === "sube" && t.de.ejercicio === "dominada-negativa" && t.a.ejercicio === "dominada", "el resumen no dice que subiste: " + JSON.stringify(t));
  ok(pi && pi.evento === "igual" && pi.proxima.join() === "10,10,10", "el resumen no dice lo que sigue en piernas: " + JSON.stringify(pi));
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
  /* se dibuja: grande y chica son SVG con el disco de la familia y la persona sorteada */
  for (const id of ids){ const g = fig.grande(id, "fu"), c = fig.chica(id, "fu"), pe = fig.persona(id, "fu");
    ok(g.startsWith("<svg") && g.includes("var(--fu-disco)") && g.includes(pe.piel) && !/NaN|undefined/.test(g + c), id + ": no se dibuja bien"); }
  /* el sorteo da para todos: entre los 155 aparecen al menos seis tonos de piel, mujeres y hombres, y cinco peinados */
  const gente = [...ids].map(id => fig.persona(id, "fu"));
  ok(new Set(gente.map(p => p.piel)).size >= 6, "pocos tonos de piel");
  ok(new Set(gente.map(p => p.sexo)).size === 2, "salen todas mujeres o todos hombres");
  ok(new Set(gente.map(p => p.pelo)).size >= 5, "pocos peinados");
  /* lo que se elige en Vos manda en todos los ejercicios; lo que no, sigue al azar */
  fig.fijar({sexo: "mujer", piel: fig.TONOS[2], pelo: "afro"});
  ok(gente.every((_, i) => { const p = fig.persona([...ids][i], "fu"); return p.sexo === "mujer" && p.piel === fig.TONOS[2] && p.pelo === "afro"; }), "lo elegido en Vos no manda");
  fig.fijar({sexo: "hombre", pelo: "afro"});
  ok(fig.persona("dominada", "fu").pelo !== "afro", "un peinado que no le va a un hombre se aplicó igual");
  fig.fijar({});
});
prueba("poses-en-otra-vista", () => {
  /* los ejercicios que de perfil no se entienden van de frente, en tres cuartos o desde arriba: viven en vistas.js (lo genera tools/vistas.mjs)
     y reemplazan a la de perfil con el mismo id. Cada una pasa la revisión entera, con los rangos en 3D y los apoyos quietos */
  const fx = {K: {reduce: () => true}, document: {}}; vm.createContext(fx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "piezas", "figura.js"), "utf8"), fx);
  const dir = path.join(RAIZ, "src", "poses"), fuentes = {};
  for (const f of fs.readdirSync(dir).sort()){ fuentes[f] = fs.readFileSync(path.join(dir, f), "utf8"); vm.runInContext(fuentes[f], fx); }
  const {POSES, fig} = fx.K, ids = [...fuentes["vistas.js"].matchAll(/^"([a-z0-9-]+)": \{/gm)].map(m => m[1]);
  ok(ids.length >= 20, "faltan las poses en otra vista: " + ids.length);
  for (const id of ids){
    ok(POSES[id] && (POSES[id].vista || POSES[id].alzada), id + ": quedó sin vista");
    const otro = Object.keys(fuentes).find(f => f !== "vistas.js" && fuentes[f].includes(`"${id}": {`));
    ok(!otro, id + ": sigue también de perfil en " + otro);
    const m = fig.revisar(id); ok(!m.length, `${id}: ${m.join(" · ")}`);
    ok(!/NaN|undefined/.test(fig.grande(id, "fu")), id + ": no se dibuja bien");
  }
  /* lo que se entiende de perfil sigue de perfil */
  for (const id of ["sentadilla", "flexion", "zancada"]) ok(POSES[id] && !POSES[id].vista && !POSES[id].alzada, id + ": tenía que seguir de perfil");
});

/* ===== Modelo B: las hazañas como pruebas, el cielo que las lee y la semana de prueba ===== */
const HZ = id => HAZANAS.hazanas.find(h => h.id === id);
/* una sesión con una prueba de hazaña: la serie dice de qué hazaña es */
const deHz = (id, fecha, h, v, extra = {}) => ({id, fecha, duracion: 300, hazana: {id: h, v: 2, valor: v, ejercicio: HZ(h).mide.ejercicio, tipo: HZ(h).mide.tipo, completa: true},
  bloques: [{familia: HZ(h).familia, hazana: h, series: [{ejercicio: HZ(h).mide.ejercicio, tipo: HZ(h).mide.tipo, objetivo: "max", valor: v, hazana: h}]}], ...extra});
const encendidas = (ss, ms = []) => cielo.calcular(CAT, ms, "2026-10-21", ss).constelaciones.flatMap(c => c.estrellas.filter(e => e.encendida).map(e => e.id));
prueba("cielo-desde-hazana", () => {
  /* Perseo con 16 dominadas enciende en dos constelaciones a la vez: muscle-up y un brazo */
  const on = encendidas([deHz("a", "2026-10-20", "perseo", 16)]);
  ok(on.includes("muscle-up.dominadas-10") && on.includes("un-brazo.dominadas-15"), "Tirón no encendió en las dos: " + on);
  ok(cielo.nuevas(CAT, [], [], "2026-10-21", [], [deHz("a", "2026-10-20", "perseo", 16)]).map(n => n.constelacion.id).sort().join() === "muscle-up,un-brazo", "nuevas en dos constelaciones");
  /* la sesión guarda lo que midió también arriba: alcanza con eso */
  const sola = {...deHz("b", "2026-10-20", "hercules", 41), bloques: []};
  ok(encendidas([sola]).filter(id => id.includes("flexiones")).sort().join() === "planche.flexiones-30,un-brazo.flexiones-40", "la marca de la hazaña, sin series");
  /* Motor 12: la primera vez es la base; la mejora en % enciende */
  const m = [deHz("c", "2026-08-01", "pegaso", 6), deHz("d", "2026-09-15", "pegaso", 6.7)];
  ok(encendidas(m).includes("motor.m12-10") && !encendidas(m).includes("motor.m12-20"), "Motor 12 +11,7 % enciende +10 %, no +20 %");
  ok(!encendidas([m[0]]).includes("motor.m12-10"), "la primera vez sola no es mejora");
  /* el orden del diario no importa: la base es la primera por fecha */
  ok(encendidas([m[1], m[0]]).includes("motor.m12-10"), "la base sale de la fecha, no del orden");
  /* centímetros negativos: valen como marca, sin encender */
  ok(!encendidas([deHz("e", "2026-10-20", "casiopea", -4)]).some(id => id.includes("alcance")) && encendidas([deHz("f", "2026-10-20", "casiopea", 11)]).filter(id => id.includes("alcance")).length === 2, "Compresión: de −4 nada, de +11 las dos");
  /* Mil saltos: lo que no llegó al final no es marca */
  ok(!encendidas([deHz("g", "2026-10-20", "orion", 300, {hazana: {id: "orion", v: 2, valor: 300, completa: false}})].map(x => ({...x, bloques: x.bloques.map(b => ({...b, series: b.series.map(y => ({...y, completa: false}))}))}))).includes("soga.mil-12"), "un corte en Mil saltos encendió");
  ok(encendidas([deHz("h", "2026-10-20", "orion", 700)]).includes("soga.mil-12"), "11:40 en Mil saltos enciende «en 12 min»");
});
prueba("hazana-datos-viejos", () => {
  /* una sesión de hazaña de antes (circuito con nivel): carga, cuenta en tu historia y no se lee como marca */
  const vieja = {id: "v1", fecha: "2026-09-01", duracion: 900, hazana: {id: "hercules", nivel: 2, valor: 640, completa: true},
    bloques: [{orden: 0, familia: "fu", clase: "circuito", nombre: "Hércules", series: [{ejercicio: "hercules", tipo: "hazana", objetivo: 1, valor: 640}]}]};
  const archivo = JSON.stringify({app: "kozmos", formato: 1, version: "k-viejo", exportado: "2026-09-02T00:00:00Z", catalogo: 1, mediciones: [], sesiones: [vieja], perfil: {}});
  const r = respaldo.leer(archivo);
  ok(!r.error && r.sesiones.length === 1 && r.descartadas === 0, "un respaldo de antes no carga: " + (r.error || r.descartadas));
  ok(cielo.deSesiones([vieja]).length === 0, "la hazaña de antes se leyó como marca");
  ok(rutina.anteriores(HZ("hercules"), [vieja]).length === 1 && rutina.veces(HZ("hercules"), [vieja]).length === 0, "la de antes no entra en la escala, pero queda");
  /* y con el mismo valor guardado, valor sigue diciendo lo de antes: 640 son segundos de circuito, no flexiones */
  ok(!encendidas([vieja]).some(id => id.includes("flexiones")), "640 segundos de Hércules encendieron flexiones");
});
prueba("respaldo-pruebas", () => {
  const ses = [deHz("a", "2026-10-20", "casiopea", -6, {semanaPrueba: {bloque: 2, rutina: "base_cali", semana: 10, pruebas: 2}}), deHz("b", "2026-10-20", "pegaso", 6.4)];
  const txt = JSON.stringify(respaldo.armar({mediciones: [], sesiones: ses, perfil: {}}, "k", 1, new Date("2026-10-21T00:00:00Z")));
  const r = respaldo.leer(txt);
  ok(JSON.parse(txt).formato === 2 && !r.error && r.descartadas === 0 && JSON.stringify(r.sesiones) === JSON.stringify(ses), "la ida y vuelta de una prueba pierde algo: " + (r.error || r.descartadas));
  const mal = respaldo.leer(JSON.stringify({...JSON.parse(txt), sesiones: [{...ses[0], hazana: {id: "casiopea", v: 2, tipo: "cm", valor: -900}}]}));
  ok(mal.sesiones.length === 0 && mal.descartadas === 1, "centímetros imposibles entraron");
});
/* una rutina chica para la semana de prueba: 2 días por semana, bloques de 2 + 1 */
const RP = {id: "rp", nombre: "RP", familia: "fu", semanas: 6, dias: 2, bloque: {carga: 2, prueba: 1}, alimenta: ["muscle-up.explosiva-3"],
  sesiones: Array.from({length: 12}, () => ({nombre: "A", bloques: [{escalera: "tirar", series: 3, rango: [5, 8], descanso: 90, desde: "dominada"}, {ejercicio: "sentadilla", tipo: "repeticiones", series: 4, objetivo: 10}]}))};
const deRut = (i, fecha, extra = {}) => ({id: "r" + i, fecha, duracion: 1800, rutina: {id: "rp", sesion: i}, bloques: [{series: [{ejercicio: "sentadilla", tipo: "repeticiones", valor: 10}]}], ...extra});
prueba("semana-de-prueba-cuando", () => {
  const perfil = {rutina: {id: "rp", desde: "2026-09-01"}}, op = {rutinas: [RP]};
  const ses = n => Array.from({length: n}, (_, i) => deRut(i, `2026-10-${String(i + 1).padStart(2, "0")}`));
  const a = plan.semanaDePrueba(perfil, ses(3), "2026-10-04", op);
  ok(!a.toca && a.semana === 2 && a.proxima === 3 && a.bloque === 1, "semana 2: todavía carga, prueba en la 3: " + JSON.stringify(a));
  const b = plan.semanaDePrueba(perfil, ses(4), "2026-10-05", op);
  ok(b.toca && b.conPruebas && b.semana === 3 && b.proxima === 3, "semana 3: toca la prueba: " + JSON.stringify(b));
  /* hecha la prueba, el resto de la semana es solo la descarga */
  const hecha = [...ses(4), deRut(4, "2026-10-05", {semanaPrueba: {rutina: "rp", bloque: 1, semana: 3, pruebas: 2}})];
  const c = plan.semanaDePrueba(perfil, hecha, "2026-10-06", op);
  ok(c.toca && !c.conPruebas, "la segunda sesión de la semana de prueba va sin pruebas");
  const d = plan.semanaDePrueba(perfil, [...hecha, deRut(5, "2026-10-07")], "2026-10-08", op);
  ok(!d.toca && d.bloque === 2 && d.proxima === 6, "después, el bloque 2 con prueba en la semana 6: " + JSON.stringify(d));
  /* al volver de 3 semanas o más, primero se recupera */
  const e = plan.semanaDePrueba(perfil, ses(4), "2026-11-01", op);
  ok(!e.toca && e.aplazada, "volviendo de 3 semanas abrió la prueba");
  /* sin rutina: cuatro semanas entrenadas desde la última prueba */
  const sem = ["2026-09-21", "2026-09-29", "2026-10-06", "2026-10-13"].map((f, i) => ({id: "s" + i, fecha: f, duracion: 600, bloques: []}));
  ok(!plan.semanaDePrueba({}, sem.slice(0, 3), "2026-10-14").toca && plan.semanaDePrueba({}, sem, "2026-10-20").toca, "con rumbo: a la quinta semana");
  const conP = [...sem, {id: "p", fecha: "2026-10-20", duracion: 600, bloques: [], semanaPrueba: {bloque: 1, pruebas: 3}}];
  const f = plan.semanaDePrueba({}, conP, "2026-10-22");
  ok(f.toca && !f.conPruebas, "con rumbo, el resto de la semana de prueba va sin pruebas");
  ok(!plan.semanaDePrueba({}, conP, "2026-10-27").toca, "la semana siguiente vuelve la carga");
  ok(plan.semanaDePrueba({}, [], "2026-10-27") === null, "sin nada hecho, no hay semana de prueba");
});
prueba("semana-de-prueba-sesion", () => {
  const ej = EJM(), equipo = ["barra"], ses = Array.from({length: 4}, (_, i) => deRut(i, `2026-10-0${i + 1}`));
  const cieloA = cielo.calcular(CAT, [], "2026-10-05", ses, equipo);
  const base = rutina.deRutina(RP, 4, {ej, equipo, sesiones: ses, descarga: true});
  const sp = plan.semanaDePrueba({rutina: {id: "rp", desde: "2026-09-01"}}, ses, "2026-10-05", {rutinas: [RP]});
  const pl = plan.deSemanaDePrueba(base, sp, {cielo: cieloA, cons: ["muscle-up"], ejs: ["dominada"], sesiones: ses, equipo, ej, hoy: "2026-10-05"});
  const pr = pl.bloques.filter(b => b.prueba || b.hazana), resto = pl.bloques.filter(b => !b.prueba && !b.hazana);
  /* las pruebas van primero: la próxima estrella de muscle-up y Perseo (mide dominadas, el escalón de la rutina) */
  ok(pl.bloques[0].prueba && pl.bloques[0].estrella === "muscle-up.dominadas-10", "la primera, la próxima estrella: " + pl.bloques[0].estrella);
  ok(pr.some(b => b.hazana === "perseo") && pl.pruebas.hazanas.length >= 1 && pl.pruebas.hazanas.length <= 2, "las hazañas de la semana: " + pl.pruebas.hazanas);
  ok(pl.bloques.indexOf(pr[pr.length - 1]) < pl.bloques.indexOf(resto[0]), "las pruebas, antes de la descarga");
  /* la descarga: la mitad de las series, marcadas */
  const tir = resto.find(b => b.pasos && b.pasos[0].escalera === "tirar"), sen = resto.find(b => b.pasos && b.pasos[0].ejercicio === "sentadilla");
  ok(tir.pasos.length === 2 && tir.pasos.every(x => x.descarga && x.n === 3) && sen.pasos.length === 2 && sen.pasos.every(x => x.descarga), "la descarga no es la mitad: " + [tir.pasos.length, sen.pasos.length]);
  ok(pl.semanaPrueba.bloque === 1 && pl.semanaPrueba.rutina === "rp" && pl.pruebas.encienden.includes("muscle-up.dominadas-10") && pl.pruebas.encienden.includes("un-brazo.dominadas-15"), "lo que pueden encender: " + pl.pruebas.encienden);
  /* sin pruebas pendientes (ya hechas esta semana), solo la descarga */
  const sola = plan.deSemanaDePrueba(base, {...sp, conPruebas: false}, {cielo: cieloA, cons: ["muscle-up"], sesiones: ses, equipo, ej, hoy: "2026-10-06"});
  ok(sola.bloques.every(b => !b.prueba && !b.hazana) && sola.pruebas.hazanas.length === 0, "con las pruebas hechas, siguen apareciendo");
  /* con rumbo: la descarga parte el plan del día por la mitad */
  const dia = plan.armar(cieloA, ["front-lever"], ses, "2026-10-05");
  const pd = plan.deSemanaDePrueba(dia, {bloque: 1, conPruebas: true}, {cielo: cieloA, cons: ["front-lever"], sesiones: ses, equipo, ej, hoy: "2026-10-05"});
  const fl = pd.bloques.find(b => b.constelacion === "front-lever" && !b.prueba);
  ok(fl && fl.descarga && fl.series === Math.ceil(dia.bloques.find(b => b.constelacion === "front-lever").series / 2), "con rumbo, la mitad de las series");
});
prueba("bloque-desde-la-prueba", () => {
  /* lo que sacás en la prueba fija dónde arranca el bloque siguiente en cada escalera */
  const ej = EJM(), equipo = ["barra"];
  const def = rutina.defEscalera(rutina.escalera("tirar"), ej, equipo, "dominada", [5, 8]);
  const trabajo = {id: "w", fecha: "2026-10-01", rutina: {id: "rp", sesion: 0}, bloques: [{series: [5, 5, 4].map(v => ({ejercicio: "dominada", tipo: "repeticiones", valor: v, objetivo: 5, escalera: "tirar", rango: [5, 8], n: 3}))}]};
  const desc = {id: "d", fecha: "2026-10-08", rutina: {id: "rp", sesion: 6}, semanaPrueba: {rutina: "rp", bloque: 1, pruebas: 1}, bloques: [{series: [5, 5].map(v => ({ejercicio: "dominada", tipo: "repeticiones", valor: v, objetivo: 5, escalera: "tirar", rango: [5, 8], n: 3, descarga: true}))}]};
  const conHz = v => ({...desc, bloques: [{hazana: "perseo", series: [{ejercicio: "dominada", tipo: "repeticiones", valor: v, objetivo: "max", hazana: "perseo"}]}, ...desc.bloques]});
  const i = ss => { const st = rutina.escalon(def, ss); return {e: st.paso.ejercicio, ev: st.evento, os: rutina.metas(def, st, {series: 3}).objetivos.join()}; };
  ok(i([trabajo, desc]).ev === "descarga", "sin prueba, la descarga sola");
  const a = i([trabajo, conHz(12)]);
  ok(a.e === "dominada-explosiva" && a.ev === "prueba", "con 12 dominadas, el bloque arranca en la explosiva: " + JSON.stringify(a));
  const b = i([trabajo, conHz(9)]);
  ok(b.e === "dominada" && b.os === "6,6,6", "con 9, sigue en la dominada con cada serie al 75 %: " + JSON.stringify(b));
  const c = i([trabajo, conHz(4)]);
  ok(c.e === "dominada-negativa", "con 4, el bloque arranca un escalón abajo: " + JSON.stringify(c));
  /* también la prueba de una estrella (la explosiva de muscle-up), aunque la rutina esté más abajo */
  const est = {...desc, bloques: [{prueba: true, estrella: "muscle-up.explosiva-3", series: [{ejercicio: "dominada-explosiva", tipo: "repeticiones", valor: 5, objetivo: 3, estrella: "muscle-up.explosiva-3"}]}, ...desc.bloques]};
  ok(i([trabajo, est]).e === "dominada-explosiva", "la prueba de una estrella de la escalera no movió el escalón");
  /* y en el resumen: el cambio dice que fue por la prueba */
  const cs = rutina.cambios(conHz(12), [trabajo, conHz(12)], {ej, equipo}).find(x => x.id === "tirar");
  ok(cs && cs.evento === "prueba" && cs.a.ejercicio === "dominada-explosiva" && cs.de.ejercicio === "dominada", "el resumen no dice dónde arrancás: " + JSON.stringify(cs && {e: cs.evento, de: cs.de, a: cs.a}));
});
prueba("plan-solo-con-prueba", () => {
  /* una estrella que solo se enciende con una prueba (Del piso) no se persigue serie a serie: el día entrena lo que la prepara */
  const ms = [{id: "m", estrella: "una-pierna.pistol-silla-5", ejercicio: "pistol-silla", tipo: "repeticiones", valor: 6, fecha: "2026-10-10"}];
  const ci = cielo.calcular(CAT, ms, "2026-10-21", []);
  ok(ci.constelaciones.find(c => c.id === "una-pierna").proxima.id === "una-pierna.del-piso-8", "la próxima de una pierna es Del piso");
  const p = plan.armar(ci, ["una-pierna"], [], "2026-10-21"), b = p.bloques.find(x => x.constelacion === "una-pierna");
  ok(b && b.ejercicio === "sentadilla-profunda" && b.entrena === "sagitario" && !b.estrella && !b.prueba, "el día no entrena lo de Sagitario: " + JSON.stringify(b));
  ok(!plan.sePrueba(ci.constelaciones.find(c => c.id === "una-pierna")), "una estrella de prueba no abre la ventana suelta");
});

let fallas = 0;
for (const [n, fn] of PRUEBAS){
  try { fn(); console.log("ok    ", n); } catch (e) { fallas++; console.log("FALLA ", n, "·", e.message); }
}
console.log(fallas ? `FALLAN ${fallas} sin pantalla` : `TODO OK sin pantalla · ${PRUEBAS.length} pruebas`);
process.exitCode = fallas ? 1 : 0;
