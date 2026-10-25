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
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "sesion", "caminos.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "sesion", "biblioteca.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "sesion", "nivel.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "sesion", "dia.js"), "utf8"), ctx);
const {cielo, plan, calorias, respaldo, rutina, caminos, nivel, dia: molde, biblio} = ctx.K;
const RUT_DIR = path.join(RAIZ, "catalogo", "rutinas");
const RUTINAS = fs.readdirSync(RUT_DIR).filter(f => f.endsWith(".json")).map(f => [f, JSON.parse(fs.readFileSync(path.join(RUT_DIR, f), "utf8"))]);
const HAZANAS = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "hazanas.json"), "utf8"));
const EJ = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "ejercicios.json"), "utf8"));
const ESC = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "escaleras.json"), "utf8"));
ctx.K.ESCALERAS = ESC;
const ENT = JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", "entradas.json"), "utf8"));
ctx.K.ENTRADAS = ENT;
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

prueba("catalogo-nombres-claros", () => {
  /* cada estrella y cada ejercicio dicen qué hacés, en palabras de todos los días (acta 024).
     Las constelaciones guardan su nombre («Muscle-up», «Front lever», «Planche»…) y «L-sit» se queda. */
  const JERGA = /\b(tuck|straddle|pike|pistol|shrimp|n[óo]rdico|dragon flag|planche lean|cuervo|criss-cross|double under|muscle-up|arquera|pseudo planche|v-sit|cosaca)\b/i;
  const nombres = [...CAT.constelaciones.flatMap(c => c.estrellas.map(e => [e.id, e.nombre])), ...EJ.ejercicios.map(e => [e.id, e.nombre]), ...ESC.escaleras.map(e => [e.id, e.nombre])];
  for (const [id, n] of nombres) ok(!JERGA.test(n), `${id}: «${n}» usa jerga (${n.match(JERGA)?.[0]})`);
  /* la regla no deja afuera nombres que ya están aprobados */
  ok(["Muscle-up", "Front lever", "Planche", "Draco", "Espagat"].every(n => CAT.constelaciones.some(c => c.nombre === n)), "cambió el nombre de una constelación");
  ok(EJ.ejercicios.some(e => e.nombre === "L-sit"), "«L-sit» tiene que quedar");
  /* cambiar un nombre nunca cambia un id: la historia de cada uno sigue contando */
  const main = f => { try { return JSON.parse(execSync(`git show origin/main:kozmos/catalogo/${f}`, {cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"]}).toString()); } catch (e) { return null; } };
  const ids = {
    "constelaciones.json": c => [...c.constelaciones.map(x => x.id), ...c.constelaciones.flatMap(x => x.estrellas.map(e => e.id))],
    "ejercicios.json": c => c.ejercicios.map(x => x.id),
    "escaleras.json": c => c.escaleras.map(x => x.id),
    "hazanas.json": c => c.hazanas.map(x => x.id)};
  const hoy = {"constelaciones.json": CAT, "ejercicios.json": EJ, "escaleras.json": ESC, "hazanas.json": HAZANAS};
  for (const [f, de] of Object.entries(ids)){
    const viejo = main(f); if (!viejo) continue;
    const ahora = new Set(de(hoy[f])), falta = de(viejo).filter(id => !ahora.has(id) && !RET.estrellas?.includes(id) && !RET.constelaciones?.includes(id));
    ok(!falta.length, `${f}: ids que ya no están: ${falta.join(", ")}`);
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
  /* motor B (reescrita del plan de antes): la habilidad sale de tu rumbo; rango y motor ya no se suman de regalo:
     el cierre es lo de rango o motor de tu rumbo y, si no hay, posturas */
  const p = armarDia(["front-lever"]), h = deMolde(p.bloques, "habilidad");
  ok(h.length === 1 && h[0].constelaciones.join() === "front-lever" && h[0].ejercicio === "colgado-activo" && h[0].series === 2 && h[0].objetivo === 30, "front lever arranca con colgado 2 × 30 s: " + JSON.stringify(h.map(b => [b.ejercicio, b.series, b.objetivo])));
  ok(!p.bloques.some(b => (b.constelaciones || []).some(id => id !== "front-lever")), "suma constelaciones de regalo: " + p.bloques.map(b => b.constelaciones));
  ok(p.minutos >= 15 && p.minutos % 5 === 0, "minutos redondos: " + p.minutos);
  /* con motor y rango en el rumbo, cada uno tiene su parte del día (vuelta 36): la resistencia con los 10 km y la flexibilidad
     al final con el puente, sin otro cierre */
  const t = armarDia(["front-lever", "diez-km", "puente"]), r = deMolde(t.bloques, "resistencia"), fl = deMolde(t.bloques, "flexibilidad");
  ok(r.some(b => (b.constelaciones || []).join() === "diez-km") && fl.some(b => (b.constelaciones || []).join() === "puente"), "cada uno en su parte: " + t.bloques.map(b => b.molde + ":" + (b.constelaciones || "")));
  ok(t.bloques[t.bloques.length - 1].molde === "flexibilidad" && !deMolde(t.bloques, "cierre").length, "la flexibilidad cierra el día: " + t.bloques.map(b => b.molde));
  ok(armarDia([]).bloques.every(b => !b.constelaciones), "sin rumbo, nada de constelaciones");
  ok(armarDia(["no-existe"]).bloques.length >= 4, "un id viejo en el rumbo no rompe");
});
prueba("plan-no-repite-ayer", () => {
  /* reescrita para el motor B: una sesión de antes (un bloque por constelación) también cuenta como ayer */
  const ayer = {id: "a", fecha: "2026-10-19", bloques: [{constelacion: "front-lever", series: []}]};
  const hab = p => deMolde(p.bloques, "habilidad").flatMap(b => b.constelaciones);
  const p = armarDia(["front-lever", "planche"], {ss: [ayer]});
  ok(!hab(p).includes("front-lever") && hab(p).includes("planche"), "repitió front lever: " + hab(p));
  ok(hab(armarDia(["front-lever"], {ss: [ayer]}))[0] === "front-lever", "si es la única, va igual");
});
prueba("plan-volviste", () => {
  /* reescrita para el motor B: los sostenes salen del 70 % de tu mejor marca (28 s de 40) y al volver, del 70 % de eso */
  const vieja = {id: "a", fecha: "2026-09-20", bloques: []};
  const ms = [{id: "x", estrella: "front-lever.colgado-60s", valor: 40, fecha: "2026-09-20"}];
  const p = armarDia(["front-lever"], {ms, ss: [vieja]}), b = deMolde(p.bloques, "habilidad")[0];
  ok(p.volviste && b.objetivo === Math.round(Math.round(40 * .7) * .7), "después de 3 semanas, al 70 %: " + b.objetivo);
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
  /* reescrita para el motor B: lo que pide equipo que no tenés no aparece y se dice qué pide; ya no hay motor de regalo */
  const p = armarDia(["front-lever", "soga"], {equipo: ["barra"]});
  ok(!p.bloques.some(b => (b.constelaciones || []).some(id => id === "soga" || id === "motor")) && !ejsDia(p.bloques).some(e => e === "soga" || e === "bici"), "sin soga ni bici aparecen: " + p.bloques.map(b => b.constelaciones));
  ok(p.pide.map(x => x.id + ":" + x.pide.join("+")).join() === "soga:soga", "no dice que soga pide soga: " + JSON.stringify(p.pide));
});
prueba("plan-ventana", () => {
  /* reescrita para el motor B. Colgado 50 s de 60 s: 83 %, se abre la ventana y la habilidad del día es la prueba */
  const ms = [{id: "x", estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 50, fecha: "2026-10-18"}];
  const p = armarDia(["front-lever"], {ms}), b = deMolde(p.bloques, "habilidad")[0];
  ok(b.prueba && b.series === 1 && b.objetivo === 60 && b.estrella === "front-lever.colgado-60s", "primero, la prueba: " + JSON.stringify(b));
  ok(p.ventana.join() === "front-lever" && !p.bloques.some(x => x !== b && (x.constelaciones || []).includes("front-lever")), "la prueba es el entrenamiento de front lever del día");
  ok(!armarDia(["front-lever"], {ms: [{...ms[0], valor: 40}]}).bloques.some(x => x.prueba) && !armarDia(["front-lever"], {ms: [{...ms[0], valor: 40}]}).ventana.length, "al 67 % no hay prueba");
  const vieja = {id: "a", fecha: "2026-09-20", bloques: []};
  ok(!armarDia(["front-lever"], {ms: [{...ms[0], fecha: "2026-09-20"}], ss: [vieja]}).ventana.length, "al volver de 3 semanas, primero se recupera");
  /* bici 17 de 20 min: la prueba es la salida del día, no se suma otra */
  const bi = armarDia(["motor"], {ms: [{id: "b", estrella: "motor.bici-20", ejercicio: "bici", tipo: "minutos", valor: 17, fecha: "2026-10-18"}], equipo: ["bici"]});
  const mo = bi.bloques.filter(x => (x.constelaciones || []).includes("motor"));
  ok(mo.length === 1 && mo[0].prueba && ejsDia(bi.bloques).filter(e => e === "bici").length === 1, "bici: una sola salida, la de la prueba: " + bi.bloques.map(x => x.molde + (x.prueba ? "*" : "")));
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
const EQUIPOS = ["barra", "paralelas", "anillas", "bandas", "cajon", "pared", "poste", "lastre", "bici", "remadora", "soga", "mancuernas", "kettlebell", "discos", "banco", "maquinas", "pesa"];
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
  ok(RUTINAS.length === 31, `esperaba 31 rutinas, hay ${RUTINAS.length}`);
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
  /* vuelta 32: a las 8 de antes se suman 6, con su escala de normas publicadas (y su fuente) */
  const VIEJAS = ["hercules", "pegaso", "sagitario", "orion", "andromeda", "draco", "perseo", "casiopea"];
  ok(HAZANAS.version === 2 && HAZANAS.hazanas.length === 14, "esperaba las 14 pruebas, en la versión 2");
  /* las ocho de antes siguen (sus marcas guardadas las nombran), primero y en su orden: la semana de prueba elige igual que antes */
  ok(HAZANAS.hazanas.slice(0, 8).every(h => VIEJAS.includes(h.id)), "se perdió una hazaña de antes o cambió de lugar");
  for (const h of HAZANAS.hazanas.slice(8)) ok(h.fuente && !h.antes, `${h.id}: una prueba nueva lleva su fuente y no tiene formato de antes`);
  for (const h of HAZANAS.hazanas){
    ok(FORMATOS.includes(h.formato) && h.nombre && h.prueba && h.texto && h.como, `${h.id}: formato, nombre, prueba o texto`);
    ok(!nombres.has(h.nombre) && /^[A-ZÁÉÍÓÚ0-9]/.test(h.nombre), `${h.id}: el nombre empieza en mayúscula o número y no se repite`); nombres.add(h.nombre);
    ok(ej[h.mide.ejercicio] && cielo.TIPOS[h.mide.tipo] && h.mide.tipo !== "mejora", `${h.id}: mide algo que no existe`);
    const u = Array.isArray(h.escala) ? h.escala : h.escala.propia, menos = cielo.TIPOS[h.mide.tipo].mejor === "menos" && Array.isArray(h.escala);
    ok(u.length === 5 && u.every(Number.isFinite) && u.every((x, i) => !i || (menos ? x < u[i - 1] : x > u[i - 1])), `${h.id}: la escala no va de la magnitud 5 a la 1`);
    ok(Number.isInteger(h.cada) && h.cada >= 28 && h.cada <= 84, `${h.id}: cada ${h.cada} días`);
    /* las de antes encienden estrellas; una nueva puede dar solo su medalla */
    ok(h.estrellas.length >= 1 || !VIEJAS.includes(h.id), `${h.id}: no enciende nada`);
    for (const id of h.estrellas){
      const e = ESTRELLA.get(id); ok(e, `${h.id}: la estrella ${id} no existe`);
      const tipo = Array.isArray(h.escala) ? h.mide.tipo : "mejora";
      ok(e.prueba.ejercicio === h.mide.ejercicio && e.prueba.tipo === tipo, `${h.id}: ${id} se mide con otra cosa (${e.prueba.ejercicio} ${e.prueba.tipo})`);
    }
    ok(!h.entrena || (ej[h.entrena.ejercicio] && cielo.TIPOS[h.entrena.tipo] && h.entrena.objetivo > 0 && h.entrena.series > 0), `${h.id}: lo que entrena entre pruebas`);
    ok(!VIEJAS.includes(h.id) || (h.antes && h.antes.formato), `${h.id}: sin el formato de antes (las marcas viejas se leen con él)`);
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
  ok(ESC.escaleras.length >= 8 && ESC.escaleras.length <= 12, `esperaba de 8 a 12 escaleras, hay ${ESC.escaleras.length}`);
  /* qué mide cada ejercicio según las estrellas */
  const mide = new Map(CAT.constelaciones.flatMap(c => c.estrellas.map(e => [e.prueba.ejercicio, e.prueba.tipo])));
  for (const e of ESC.escaleras){
    ok(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id) && !ids.has(e.id), `escalera con id raro o repetido: ${e.id}`); ids.add(e.id);
    ok(e.nombre && e.texto && fams.has(e.familia), `${e.id}: nombre, texto o familia`);
    ok(e.pasos.length >= 3, `${e.id}: una escalera tiene al menos tres escalones`);
    const todos = e.pasos.flatMap(rutina.idsPaso);
    ok(new Set(todos).size === todos.length, `${e.id}: un ejercicio repetido`);
    ok(["tirar", "empujar", "piernas", "bisagra", "abdomen", "movilidad"].includes(e.patron), `${e.id}: sin patrón`);
    for (const p of e.pasos){
      /* las variantes del escalón: existen, y los kilos (de mancuernas, kettlebell, barra y discos o máquina) arrancan abajo del techo
         y suben de a algo; «total» (los kilos de todo lo que levantás) es de lo que se levanta con una sola cosa; «manda», de barra o máquina */
      for (const id of rutina.idsPaso(p)) ok(ej[id], `${e.id}: la variante ${id} no existe`);
      for (const q of [p, ...[].concat(p.conPeso || [])].filter(x => x && x.carga !== undefined)){
        ok(q.carga > 0 && q.kgInicial > 0 && q.hastaKg > q.kgInicial && Number.isInteger((q.hastaKg - q.kgInicial) / q.carga), `${e.id}: kilos de ${q.ejercicio}: ${[q.carga, q.kgInicial, q.hastaKg]}`);
        const eq = ej[q.ejercicio].equipo || [];
        ok(["pesa", "mancuernas", "kettlebell", "discos", "maquinas"].some(x => eq.includes(x)), `${e.id}: ${q.ejercicio} lleva kilos y no pide pesas`);
        ok(!q.total || ["kettlebell", "discos", "maquinas", "pesa"].some(x => eq.includes(x)), `${e.id}: ${q.ejercicio} con kilos en total y dos mancuernas`);
        ok(!q.manda || ["discos", "maquinas"].some(x => eq.includes(x)), `${e.id}: ${q.ejercicio} manda sin barra ni máquina`); }
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
  /* y como el remo ya está en el primer bloque, el bloque de remo de más abajo se saltea: la misma escalera no va dos veces en un día */
  for (const eq of [[], ["mancuernas"], ["poste"]]) for (let i = 0; i < r.sesiones.length; i++){ const ps = rutina.deRutina(r, i, {ej, equipo: eq}).bloques.flatMap(b => b.pasos || []).filter(x => x.escalera === "remo");
    ok(ps.length === 3, `sin barra (${eq}), día ${i + 1}: ${ps.length} series de remo`); }
  /* con barra, los dos bloques siguen */
  ok(rutina.deRutina(r, 0, {ej, equipo: ["barra"]}).bloques.flatMap(b => b.pasos || []).filter(x => x.escalera === "remo").length === 3, "con barra se perdió el remo");
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

prueba("hazanas-sin-figura", () => {
  /* desde la vuelta 22 una prueba se dibuja de lo que mide (su medalla): la constelación dibujada a mano ya no viaja en el catálogo */
  for (const h of HAZANAS.hazanas) ok(!("figura" in h), h.id + ": todavía lleva su figura dibujada a mano");
  const src = ["cielo/dibujo.js", "pantallas/hoy.js", "pantallas/pantallas.js", "pantallas/rutinas.js", "pantallas/cielo.js"].map(f => fs.readFileSync(path.join(RAIZ, "src", f), "utf8")).join("\n");
  ok(!/dibujo\.(figura|anillo|grande)\b|\.figura\b/.test(src), "queda un dibujo viejo de prueba o de constelación");
});

/* ===== Los íconos, opción B (vuelta 21): medallas y pictogramas que salen del maniquí ===== */
let ICX = null;
const icx = () => ICX || (ICX = (() => {
  const fx = {K: {reduce: () => true, esc: s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c])),
    CATALOGO: CAT, HAZANAS, ESCALERAS: ESC, RUTINAS: RUTINAS.map(([, r]) => r)}, document: {}}; vm.createContext(fx);
  for (const f of ["piezas/figura.js", "poses/barra.js", "poses/empuje.js", "poses/piernas.js", "poses/movilidad.js", "poses/estirar.js", "poses/cardio.js", "poses/gimnasio.js", "poses/bandas.js", "poses/vistas.js", "poses/pruebas.js", "piezas/iconos.js"])
    vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", f), "utf8"), fx);
  return fx.K;
})());
/* lo que hace una rutina, en todos sus bloques: ejercicios, escalones de sus escaleras, lo de sus tramos y su equipo */
const loQueHace = r => { const xs = new Set(), plano = ts => ts.flatMap(t => t.repetir ? plano(t.tramos) : [t]);
  for (const s of r.sesiones) for (const b of s.bloques){
    for (const e of [].concat(b.ejercicio || [])) xs.add(e);
    for (const id of [].concat(b.escalera || [])) for (const q of (ESC.escaleras.find(x => x.id === id)?.pasos || [])) xs.add(q.ejercicio);
    for (const t of plano(b.tramos || [])) for (const e of [].concat(t.ejercicio || [])) xs.add(e);
    if (b.mide) xs.add(b.mide.ejercicio);
  }
  for (const q of r.equipo || []) xs.add(q);
  return xs; };
prueba("iconos-b-poses", () => {
  const {icono, POSES} = icx();
  /* la prueba: la pose de lo que mide */
  for (const h of HAZANAS.hazanas) ok(icono.poseHazana(h) === h.mide.ejercicio && POSES[h.mide.ejercicio], `${h.id}: el ícono no sale de lo que mide`);
  /* la rutina: algo que la rutina hace de verdad (o su actividad: bici, trote, soga) */
  for (const [f, r] of RUTINAS){ const q = icono.poseRutina(r), hace = loQueHace(r);
    ok(q && POSES[q], `${f}: sin pose`);
    ok(hace.has(q) || (q === "trote" && [...hace].some(x => /trote|10km/.test(x))) || (q === "bici" && hace.has("bici")), `${f}: la pose ${q} no es algo que la rutina hace`); }
  const R = id => RUTINAS.find(([, r]) => r.id === id)[1];
  ok(icono.poseRutina(R("tronco")) === "l-sit" && icono.poseRutina(R("cien")) === "flexion" && icono.poseRutina(R("z2")) === "bici" && icono.poseRutina(R("c0a5")) === "trote", "las rutinas no muestran lo que entrenan");
  /* el encuadre: solo poses que existen, y lo que se cambia es la manera de mirar (no qué ejercicio es) */
  for (const [id, o] of Object.entries(icono.ENCUADRE)){
    ok(POSES[id], `encuadre de una pose que no está: ${id}`);
    ok(!o.pose || POSES[o.pose], `${id}: se mira como ${o.pose}, que no está`);
    ok(Object.keys(o).every(k => ["pose", "vista", "abrir", "piso", "junta", "u"].includes(k)), `${id}: un ajuste desconocido`); }
  /* las dominadas se ven de frente, colgadas de la barra (todas igual: las distingue el nombre) */
  for (const id of ["dominada", "dominada-arquera"]) ok(icono.encuadre(id).pose === "dominada-ancha", `${id}: no se ve de frente`);
  /* nada se elige por id de prueba o rutina en el código */
  const src = fs.readFileSync(path.join(RAIZ, "src", "piezas", "iconos.js"), "utf8");
  const ids = [...HAZANAS.hazanas.map(h => h.id), ...RUTINAS.map(([, r]) => r.id)].filter(id => id.length > 3 && !POSES[id]);
  ok(!ids.some(id => new RegExp(`["']${id}["']`).test(src)), "el módulo nombra una prueba o una rutina: " + ids.filter(id => new RegExp(`["']${id}["']`).test(src)).join(", "));
});
/* los números de un SVG: puntos, centros y radios */
const numeros = sv => [...sv.matchAll(/(?:points|cx|cy|r|stroke-width)="([^"]+)"/g)].flatMap(m => m[1].match(/-?\d+(\.\d+)?/g) || []).map(Number);
prueba("iconos-b-dibujo", () => {
  const {icono} = icx();
  for (const h of HAZANAS.hazanas){
    const si = icono.medalla(h, true, 40), no = icono.medalla(h, false, 40);
    for (const sv of [si, no]){ ok(sv.startsWith("<svg") && !/NaN|undefined|null/.test(sv), `${h.id}: la medalla no se dibuja`);
      ok(!/#[0-9a-f]{3,8}\b|rgb\(/i.test(sv), `${h.id}: un color suelto`);
      ok(numeros(sv).every(n => n >= -2 && n <= 102), `${h.id}: algo se sale de la caja`); }
    /* ganada: a color con el satélite; sin ganar: gris, sin satélite */
    ok(si.includes(`var(--${h.familia})`) && si.includes("ico-sat") && /class="ico ico-medalla ganada"/.test(si), `${h.id}: la ganada no va a color con su satélite`);
    ok(!no.includes("ico-sat") && no.includes("var(--off)") && !/var\(--(fu|mo|ra)\)/.test(no), `${h.id}: la que falta no va en gris`);
  }
  for (const [f, r] of RUTINAS){ const sv = icono.rutina(r, 40);
    ok(sv.startsWith("<svg") && !/NaN|undefined|null/.test(sv) && !/#[0-9a-f]{3,8}\b|rgb\(/i.test(sv), `${f}: el ícono no se dibuja limpio`);
    ok(sv.includes(`fill="var(--${r.familia}-soft)"`) && sv.includes(`stroke="var(--${r.familia})"`), `${f}: no va en el color de su familia`);
    ok(numeros(sv).every(n => n >= -2 && n <= 102), `${f}: algo se sale del círculo`); }
  /* se guarda: la segunda vez es el mismo texto */
  ok(icono.rutina(RUTINAS[0][1], 40) === icono.rutina(RUTINAS[0][1], 40), "el ícono cambia de una vez a otra");
});
/* vuelta 32: el nivel de una prueba son los satélites de su medalla (1 a 3); ganada, el primero es el del logo; y cada ejercicio tiene su ícono */
prueba("iconos-medalla-nivel", () => {
  const {icono, POSES} = icx();
  const sats = sv => (sv.match(/ r="6" fill="var\(--(off|fu|mo|ra)\)"/g) || []).length;
  for (const h of HAZANAS.hazanas){
    const si = icono.medalla(h, true, 40), no = icono.medalla(h, false, 40);
    ok(sats(si) === h.nivel && sats(no) === h.nivel, `${h.id}: la medalla no lleva ${h.nivel} satélites (${sats(si)} y ${sats(no)})`);
    ok((si.match(/class="ico-sat"/g) || []).length === 1 && !no.includes("ico-sat"), `${h.id}: el satélite del logo va solo en la ganada, y uno`);
    ok(numeros(si).every(n => n >= -2 && n <= 102), `${h.id}: un satélite se sale de la caja`);
  }
  /* sin nivel (una medalla vieja que no lo dice), como antes: el satélite solo si está ganada */
  const h0 = {...HAZANAS.hazanas[0]}; delete h0.nivel;
  ok(sats(icono.medalla(h0, false, 40)) === 0 && icono.medalla(h0, true, 40).includes("ico-sat"), "sin nivel, la medalla cambió");
  for (const x of EJ.ejercicios.filter(x => POSES[x.id])){ const sv = icono.ejercicio(x.id, "mo", 40);
    ok(sv.startsWith("<svg") && !/NaN|undefined|null/.test(sv) && !/#[0-9a-f]{3,8}\b|rgb\(/i.test(sv) && sv.includes('fill="var(--mo-soft)"') && sv.includes('stroke="var(--mo)"'), `${x.id}: el ícono del ejercicio no se dibuja limpio`); }
});
prueba("iconos-b-legibles-40px", () => {
  /* a 40 px, la figura llena su círculo y los trazos se ven: lo que en el boceto costaba (front lever, parada de manos, planche) también */
  const {icono} = icx();
  const medir = (id, d) => { const sv = icono.picto(id, {d}), xs = [], ys = [];
    for (const m of sv.matchAll(/points="([^"]+)"/g)) for (const q of m[1].split(" ")){ const [x, y] = q.split(",").map(Number); xs.push(x); ys.push(y); }
    for (const m of sv.matchAll(/cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)){ const [x, y, r] = m.slice(1).map(Number); xs.push(x - r, x + r); ys.push(y - r, y + r); }
    const anchos = [...sv.matchAll(/<polyline[^>]*stroke="currentColor" stroke-width="([\d.]+)"/g)].map(m => +m[1]), cab = [...sv.matchAll(/<circle[^>]*r="([\d.]+)" fill="currentColor"/g)].map(m => +m[1]);
    return {largo: Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)), trazo: Math.max(...anchos), cabeza: cab[cab.length - 1]}; };
  const px = 40 / 100;
  for (const id of ["front-lever", "vertical-libre", "planche-straddle", "dominada", "flexion", "bici", "l-sit", "mil-saltos"]){
    const m = medir(id, 62);
    ok(m.largo >= 62 * .7, `${id}: la figura no llena su círculo (${m.largo.toFixed(1)} de 62)`);
    ok(m.trazo * px >= 1.5 && m.cabeza * px >= 1.1, `${id}: a 40 px el trazo (${(m.trazo * px).toFixed(2)} px) o la cabeza (${(m.cabeza * px).toFixed(2)} px) no se ven`); }
  /* la parada de manos se ve de frente, con los brazos abiertos y el piso; el planche, con el piso */
  const pm = icono.encuadre("vertical-libre"), pl = icono.encuadre("planche-straddle");
  ok(pm.vista === 90 && pm.abrir > 0 && pm.piso && pl.piso, "la parada de manos o el planche sin su encuadre");
});

prueba("iconos-b-constelacion", () => {
  /* el Cielo: la figura de la última estrella (la meta) adentro de un anillo de avance, como los de Actividad */
  const {icono, POSES} = icx();
  for (const c of CAT.constelaciones){
    const id = icono.poseConstelacion(c), ult = [...c.estrellas].reverse().find(e => POSES[e.prueba.ejercicio]);
    ok(id && id === ult.prueba.ejercicio, `${c.id}: la figura no es la de su última estrella`);
    const n = c.estrellas.length;
    for (const k of [0, 1, Math.ceil(n / 2), n]){ const sv = icono.constelacion({...c, total: n, encendidas: k}, 40);
      ok(sv.startsWith("<svg") && !/NaN|undefined|null/.test(sv) && !/#[0-9a-f]{3,8}\b|rgb\(/i.test(sv), `${c.id} ${k}/${n}: no se dibuja limpio`);
      ok(numeros(sv).every(v => v >= -2 && v <= 102), `${c.id} ${k}/${n}: algo se sale de la caja`);
      ok(sv.includes(`stroke="var(--${c.familia}-soft)"`), `${c.id}: la pista no va en el color suave de su familia`);
      ok(k ? sv.includes("ico-arco") && sv.includes(`stroke="var(--${c.familia})"`) && sv.includes("ico-sat") : !sv.includes("ico-arco") && !sv.includes("ico-sat"), `${c.id} ${k}/${n}: el arco o el satélite no siguen al avance`);
      if (k === n){ const m = sv.match(/class="ico-sat"[^>]*><circle cx="([\d.]+)" cy="([\d.]+)"/); ok(/ico-cons completa/.test(sv) && sv.includes('stroke-dasharray="100 0"') && m && +m[1] > 75 && +m[2] < 25, `${c.id}: completa no cierra el anillo con el satélite arriba a la derecha, como el logo`); }
    }
    /* la figura entra en el anillo sin tocarlo */
    const sv = icono.constelacion({...c, total: n, encendidas: 0}, 40), pts = [];
    for (const m of sv.matchAll(/<polyline points="([^"]+)"[^>]*stroke-width="([\d.]+)"/g)) for (const q of m[1].split(" ")){ const [x, y] = q.split(",").map(Number); pts.push([x, y, +m[2] / 2]); }
    for (const m of sv.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="var\(--ink\)"/g)) pts.push([+m[1], +m[2], +m[3]]);
    ok(pts.length && pts.every(([x, y, r]) => Math.hypot(x - 50, y - 50) + r <= 44 - 4), `${c.id}: la figura toca el anillo`);
  }
  /* al encender, el arco crece desde lo que había: --p es lo nuevo */
  const fl = CAT.constelaciones.find(c => c.estrellas.length === 8), sv = icono.constelacion({...fl, total: 8, encendidas: 3}, 150, "", {desde: 1});
  ok(/ico-cons crece/.test(sv) && sv.includes("--p:25") && sv.includes("--a:90deg"), "el arco no crece solo lo nuevo");
  ok(!/crece/.test(icono.constelacion({...fl, total: 8, encendidas: 3}, 150)), "crece sin estrellas nuevas");
  /* las metas que más costaban se leen a 40 px: front lever, parada de manos y planche llenan el anillo con trazo y cabeza visibles */
  for (const id of ["front-lever", "vertical-libre", "planche-straddle", "bandera", "dragon-flag", "muscle-up"]){
    const s2 = icono.picto(id, {d: 70}), xs = [], ys = [];
    for (const m of s2.matchAll(/points="([^"]+)"/g)) for (const q of m[1].split(" ")){ const [x, y] = q.split(",").map(Number); xs.push(x); ys.push(y); }
    for (const m of s2.matchAll(/cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)){ const [x, y, r] = m.slice(1).map(Number); xs.push(x - r, x + r); ys.push(y - r, y + r); }
    const largo = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)), trazo = Math.max(...[...s2.matchAll(/stroke="currentColor" stroke-width="([\d.]+)"/g)].map(m => +m[1]));
    ok(largo >= 70 * .7 && trazo * .4 >= 1.5, `${id}: a 40 px no se lee (largo ${largo.toFixed(1)}, trazo ${(trazo * .4).toFixed(2)} px)`); }
  /* la bandera lleva su poste y el dragon flag, su banco: sin eso son una persona acostada */
  ok(icono.esqueleto("bandera").poste !== undefined && icono.esqueleto("dragon-flag").banco, "la bandera o el dragon flag sin lo que los sostiene");
  /* ningún ícono se elige por el id de una constelación */
  const src = fs.readFileSync(path.join(RAIZ, "src", "piezas", "iconos.js"), "utf8");
  const ids = CAT.constelaciones.map(c => c.id).filter(id => !POSES[id]);
  ok(!ids.some(id => new RegExp(`["']${id}["']`).test(src)), "el módulo nombra una constelación");
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
  const dia = molde.armar(cieloA, ["front-lever"], ses, "2026-10-05", {ej, equipo}); /* motor B: el día del molde, en vez del plan de antes */
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
  const p = molde.armar(ci, ["una-pierna"], [], "2026-10-21", {ej: EJM()}), b = p.bloques.find(x => x.constelacion === "una-pierna"); /* motor B */
  ok(b && b.ejercicio === "sentadilla-profunda" && b.entrena === "sagitario" && !b.estrella && !b.prueba, "el día no entrena lo de Sagitario: " + JSON.stringify(b));
  ok(!plan.sePrueba(ci.constelaciones.find(c => c.id === "una-pierna")), "una estrella de prueba no abre la ventana suelta");
});

/* ===== Los días de una rutina ===== */
prueba("rutina-nombre-dia", () => {
  /* nunca «Día 1» dos veces: si el catálogo ya dice el día, va solo; si no, su lugar y, aparte, su nombre */
  for (const [f, r] of RUTINAS) r.sesiones.forEach((s, i) => {
    const [d, n] = rutina.nombreDia(r, i);
    ok(d && !/^d[ií]a\s/i.test(n), `${f}: día ${i}: «${d}» «${n}»`);
    ok(/^Día \S+/.test(d), `${f}: día ${i} no empieza con «Día»: «${d}»`);
  });
  const r = RUTINAS.find(([f]) => f === "armstrong.json")[1], b = RUTINAS.find(([f]) => f === "base_cali.json")[1];
  ok(rutina.nombreDia(r, 6).join("|") === "Día 2|Pirámide" && rutina.nombreDia(b, 4).join("|") === "Día B|", "nombres: " + rutina.nombreDia(r, 6) + " / " + rutina.nombreDia(b, 4));
  ok(rutina.esSemanaDePrueba(b, 4) && !rutina.esSemanaDePrueba(b, 5) && rutina.esSemanaDePrueba(b, 8), "la semana de prueba de la Base es la 4 y la 8");
});
prueba("rutina-dias-filas", () => {
  /* cada día de cada rutina, con y sin equipo, en semana común y de prueba, dice qué se hace y cuánto */
  const ej = Object.fromEntries(EJ.ejercicios.map(e => [e.id, e]));
  for (const equipo of [null, ["barra", "paralelas", "bici", "soga", "mancuernas", "kettlebell", "lastre", "pared"], []]) for (const [f, r] of RUTINAS) for (let w = 1; w <= r.semanas; w++) for (let k = 0; k < r.dias; k++){
    const i = (w - 1) * r.dias + k, d = rutina.dia(r, i, {ej, equipo, descarga: rutina.esSemanaDePrueba(r, w)});
    ok(d && d.minutos >= 5 && d.filas.length, `${f}: día ${i} vacío`);
    for (const x of d.filas){
      ok(!x.otro && x.q && x.n && !/undefined|NaN|null/.test(x.q + x.n), `${f}: día ${i}: fila rara ${JSON.stringify(x)}`);
      ok(!/^d[ií]a\s/i.test(x.q), `${f}: día ${i}: un bloque se llama como el día («${x.q}»)`);
    }
  }
  const base = RUTINAS.find(([f]) => f === "base_cali.json")[1], c0 = RUTINAS.find(([f]) => f === "c0a5.json")[1];
  const a = rutina.dia(base, 0, {ej, equipo: ["barra"]});
  ok(a.nombre.join("|") === "Día A|" && a.filas.some(x => x.q === "Dominada negativa" && x.n === "3 × 3–5" && x.escalera === "tirar"), "la Base no dice la escalera con series × rango: " + JSON.stringify(a.filas));
  /* en la semana de prueba, la mitad de las series */
  ok(rutina.dia(base, 9, {ej, equipo: ["barra"], descarga: true}).filas.some(x => x.q === "Dominada negativa" && x.n === "2 × 3–5"), "la semana de prueba no va a la mitad");
  ok(JSON.stringify(rutina.dia(c0, 0, {ej}).filas.map(x => [x.q, x.n, x.nq])) === '[["Trote","8 × 1 min","1:30 suave"]]', "el trote: " + JSON.stringify(rutina.dia(c0, 0, {ej}).filas));
  /* el bloque de motor se llama por lo que se hace, también en la sesión */
  ok(rutina.deRutina(c0, 0, {ej}).bloques[0].nombre === "Trote", "el bloque de trote se llama " + rutina.deRutina(c0, 0, {ej}).bloques[0].nombre);
});

/* ===== Filas de Hoy y la meta (vuelta 20) ===== */
/* las rutinas que terminan en un desafío o en una prueba de lo que buscan: decidido caso por caso (acta 020) */
const CON_META = ["c0a5", "c5a10", "cien", "gibala", "gimnasta", "kb1515", "soga"];
prueba("rutina-meta-en-el-catalogo", () => {
  const ej = Object.fromEntries(EJ.ejercicios.map(e => [e.id, e]));
  ok(JSON.stringify(RUTINAS.filter(([, r]) => r.bloque.meta).map(([, r]) => r.id).sort()) === JSON.stringify(CON_META), "las rutinas con meta: " + RUTINAS.filter(([, r]) => r.bloque.meta).map(([, r]) => r.id));
  for (const [f, r] of RUTINAS){
    const xs = rutina.semanas(r), L = r.bloque.carga + r.bloque.prueba, N = r.semanas;
    ok(xs.length === N && xs.every((x, k) => x.n === k + 1 && ["carga", "prueba", "meta"].includes(x.tipo)), `${f}: semanas ${JSON.stringify(xs)}`);
    ok(xs.some(x => x.tipo === "prueba"), `${f}: ninguna semana de prueba`);
    /* nunca dos semanas livianas seguidas, ni una prueba pegada a otra */
    xs.forEach((x, k) => ok(x.tipo !== "prueba" || k === 0 || xs[k - 1].tipo === "carga", `${f}: la semana ${x.n} de prueba sigue a otra que no es de carga`));
    if (!r.bloque.meta){
      /* sin meta, el ciclo de siempre: «carga» semanas y una de prueba */
      ok(xs.every(x => (x.tipo === "prueba") === ((x.n - 1) % L >= r.bloque.carga)), `${f}: sin meta cambió el ciclo`);
      continue;
    }
    ok(r.bloque.meta === true || (typeof r.bloque.meta === "string" && r.bloque.meta.length && r.bloque.meta.length <= 30), `${f}: la meta se dice corta: ${r.bloque.meta}`);
    /* la última semana es la meta, completa: ni descarga ni «más liviana» */
    ok(xs[N - 1].tipo === "meta" && rutina.esMeta(r, N) && !rutina.esSemanaDePrueba(r, N) && xs.filter(x => x.tipo === "meta").length === 1, `${f}: la última semana no es la meta`);
    for (let k = 0; k < r.dias; k++){
      const d = rutina.dia(r, (N - 1) * r.dias + k, {ej, equipo: null, descarga: rutina.esSemanaDePrueba(r, N)});
      ok(d.filas.every(x => !x.descarga), `${f}: la meta tiene una fila más liviana: ${JSON.stringify(d.filas)}`);
    }
    /* si la semana de prueba caía en la última, pasó a la anterior y cierra ese bloque */
    if ((N - 1) % L >= r.bloque.carga) ok(xs[N - 2].tipo === "prueba" && xs[N - 2].bloque === xs[N - 1].bloque, `${f}: la semana de prueba no pasó a la ${N - 1}`);
  }
  /* los casos que se ven: 100 flexiones prueba en la 5 y la meta en la 6; De 5 a 10 km, pruebas en la 4 y la 7 */
  const tipos = id => rutina.semanas(RUTINAS.find(([, r]) => r.id === id)[1]).map(x => x.tipo[0]).join("");
  ok(tipos("cien") === "ccccpm" && tipos("c5a10") === "cccpccpm" && tipos("soga") === "ccpm" && tipos("c0a5") === "cccpcccpm" && tipos("base_cali") === "cccpcccp", "semanas: " + ["cien", "c5a10", "soga", "c0a5", "base_cali"].map(tipos));
});
/* 100 flexiones chica: 6 semanas de a 2 días, bloques de 2 + 1, con meta: prueba en la 3 y la 5, la 6 es la meta */
const RM = {...RP, id: "rm", bloque: {carga: 2, prueba: 1, meta: "la meta"}};
const deRm = (i, fecha, extra = {}) => ({...deRut(i, fecha, extra), rutina: {id: "rm", sesion: i}});
prueba("semana-de-prueba-y-meta", () => {
  const perfil = {rutina: {id: "rm", desde: "2026-09-01"}}, op = {rutinas: [RM]};
  const ses = n => Array.from({length: n}, (_, i) => deRm(i, `2026-10-${String(i + 1).padStart(2, "0")}`));
  const en = n => plan.semanaDePrueba(perfil, ses(n), `2026-10-${String(n + 1).padStart(2, "0")}`, op);
  ok(JSON.stringify(rutina.semanas(RM).map(x => x.tipo + x.bloque)) === '["carga1","carga1","prueba1","carga2","prueba2","meta2"]', "las semanas: " + JSON.stringify(rutina.semanas(RM)));
  const a = en(6);
  ok(!a.toca && a.semana === 4 && a.proxima === 5 && a.bloque === 2 && a.semanaMeta === 6, "semana 4: la prueba se adelanta a la 5: " + JSON.stringify(a));
  const b = en(8);
  ok(b.toca && b.conPruebas && b.semana === 5 && b.bloque === 2 && !b.meta, "semana 5: la prueba movida: " + JSON.stringify(b));
  const c = en(10);
  ok(!c.toca && c.meta && c.semana === 6 && c.proxima === null && c.semanaMeta === 6, "semana 6: la meta, sin prueba: " + JSON.stringify(c));
  /* sin meta, la misma rutina prueba en la 6 */
  ok(plan.semanaDePrueba({rutina: {id: "rp", desde: "2026-09-01"}}, ses(10).map(s => ({...s, rutina: {id: "rp", sesion: s.rutina.sesion}})), "2026-10-11", {rutinas: [RP]}).toca, "sin meta, la semana 6 dejó de ser de prueba");
  /* la sesión de la meta va completa: la de la semana de prueba, a la mitad */
  const ej = EJM(), equipo = ["barra"];
  const lleno = rutina.deRutina(RM, 10, {ej, equipo, sesiones: ses(10)}), liv = rutina.deRutina(RM, 8, {ej, equipo, sesiones: ses(8), descarga: true});
  ok(lleno.bloques.every(x => !x.pasos || x.pasos.every(p => !p.descarga)) && lleno.bloques[0].pasos.length === 3 && liv.bloques[0].pasos.length === 2, "la meta no va completa o la prueba no va liviana");
});
prueba("rutina-filas-superserie", () => {
  /* Hoy y los días: una fila por ejercicio; los de una superserie llevan el mismo «par» y cuántos son */
  const ej = Object.fromEntries(EJ.ejercicios.map(e => [e.id, e])), base = RUTINAS.find(([f]) => f === "base_cali.json")[1];
  const p = rutina.deRutina(base, 0, {ej, equipo: ["barra", "paralelas"]}), fs = rutina.filas(p.bloques, ej);
  const pares = fs.filter(x => x.par !== undefined);
  ok(pares.length >= 4 && pares.every(x => x.de === 2), "la Base no junta sus superseries: " + JSON.stringify(fs.map(x => [x.q, x.par, x.de])));
  /* los dos de un par van seguidos y son de un mismo bloque de la sesión, que los alterna serie a serie */
  for (const k of new Set(pares.map(x => x.par))){
    const i = fs.findIndex(x => x.par === k);
    ok(fs[i + 1] && fs[i + 1].par === k, "un par separado: " + k);
    const b = p.bloques[k], es = [...new Set(b.pasos.map(x => x.ejercicio))];
    ok(es.length === 2 && b.pasos[0].ejercicio !== b.pasos[1].ejercicio, "la sesión ya no alterna el par " + k);
  }
  ok(fs.filter(x => x.par === undefined && !x.otro).every(x => x.q), "una fila suelta rara");
  /* lo que no es superserie no se junta: 100 flexiones, una fila por bloque */
  const cien = RUTINAS.find(([f]) => f === "cien.json")[1];
  ok(rutina.filas(rutina.deRutina(cien, 2, {ej}).bloques, ej).every(x => x.par === undefined), "100 flexiones junta lo que no es superserie");
  /* una triserie (Gimnasta, día B) dice que son tres */
  const g = RUTINAS.find(([f]) => f === "gimnasta.json")[1], fg = rutina.filas(rutina.deRutina(g, 1, {ej, equipo: ["barra", "paralelas"]}).bloques, ej);
  ok(fg.some(x => x.de === 3), "la triserie de Gimnasta: " + JSON.stringify(fg.map(x => [x.q, x.de])));
});
prueba("rutina-filas-mas-liviana", () => {
  /* en la semana de prueba y en una escalera trabada, la fila dice «más liviana», como la serie en la sesión */
  const ej = EJM(), equipo = ["barra"];
  const liv = rutina.filas(rutina.deRutina(RP, 6, {ej, equipo, descarga: true}).bloques, ej);
  ok(liv.length === 2 && liv.every(x => x.descarga), "la semana de prueba: " + JSON.stringify(liv));
  ok(rutina.filas(rutina.deRutina(RP, 0, {ej, equipo}).bloques, ej).every(x => !x.descarga), "una semana común dice más liviana");
  /* trabado: tres sesiones sin mejorar en tirar; sentadilla no tiene escalera y queda igual */
  const tr = Array.from({length: 4}, (_, i) => ({id: "t" + i, fecha: `2026-10-0${i + 1}`, rutina: {id: "rp", sesion: i}, bloques: [{series: [5, 5, 5].map(v => ({ejercicio: "dominada", tipo: "repeticiones", valor: v, objetivo: 5, escalera: "tirar", rango: [5, 8], n: 3}))}]}));
  const fs = rutina.filas(rutina.deRutina(RP, 4, {ej, equipo, sesiones: tr}).bloques, ej);
  ok(fs.find(x => x.escalera === "tirar")?.descarga && !fs.find(x => !x.escalera).descarga, "trabado: " + JSON.stringify(fs));
  /* lo de motor partido a la mitad también; una sola salida larga no se parte y no se dice */
  const ej2 = Object.fromEntries(EJ.ejercicios.map(e => [e.id, e])), soga = RUTINAS.find(([f]) => f === "soga.json")[1], c0 = RUTINAS.find(([f]) => f === "c0a5.json")[1];
  ok(rutina.dia(soga, 0, {ej: ej2, descarga: true}).filas.some(x => x.q === "Soga" && x.descarga), "la soga partida no dice más liviana");
  ok(rutina.dia(c0, 24, {ej: ej2, descarga: true}).filas.every(x => !x.descarga), "una salida que no se parte dice más liviana");
});
prueba("catalogo-rarezas-019", () => {
  /* las notas dicen los minutos de lo suave o del día entero, nunca otros */
  const flat = ts => ts.flatMap(t => t.repetir ? Array.from({length: t.repetir}, () => flat(t.tramos)).flat() : [t]);
  for (const [f, r] of RUTINAS) r.sesiones.forEach((s, i) => {
    const m = (s.nota || "").match(/^(\d+) min\s/); if (!m) return;
    const ts = flat(s.bloques.flatMap(b => b.tramos || [])), suave = ts.filter(t => t.clase === "suave").reduce((a, t) => a + t.seg, 0) / 60, total = ts.reduce((a, t) => a + t.seg, 0) / 60;
    ok(Math.abs(m[1] - suave) <= 1 || Math.abs(m[1] - total) <= 1, `${f}: día ${i + 1}: la nota dice ${m[1]} min y hay ${suave} suaves de ${total}`);
  });
  /* Tabata: lo que hay que sumar se entiende solo («más de 9» ¿de qué?) */
  const tab = RUTINAS.find(([f]) => f === "tabata.json")[1];
  ok(tab.sesiones.every(s => !/más de 9/.test(s.nota || "")) && tab.sesiones.some(s => /Si terminás los \d+ con aire para otro, subí un nivel de resistencia\./.test(s.nota || "")), "la nota de Tabata");
  /* los 1000 saltos llevan unos 10 minutos: el día no puede decir 5 */
  const soga = RUTINAS.find(([f]) => f === "soga.json")[1], ej = Object.fromEntries(EJ.ejercicios.map(e => [e.id, e]));
  ok(rutina.dia(soga, 11, {ej}).minutos >= 10, "el desafío de la soga dura " + rutina.dia(soga, 11, {ej}).minutos + " min");
});

prueba("cien-pide-las-100", () => {
  /* la semana de la meta de 100 flexiones cierra con el intento de las 100 seguidas */
  const cien = RUTINAS.find(([f]) => f === "cien.json")[1], fin = cien.sesiones.at(-1);
  ok(fin.bloques.some(b => b.ejercicio === "flexion" && b.objetivo === 100 && b.series === 1), "el último día no pide 100 seguidas");
  ok(/100 flexiones seguidas/.test(fin.nota || ""), "el último día no lo dice");
  ok(cien.sesiones.slice(0, -1).every(s => s.bloques.every(b => b.objetivo !== 100)), "las 100 aparecen antes del último día");
});

/* ===== Los cimientos del motor B (vuelta 27): patrones, equipo, kilos, entrada en calor y caminos ===== */
const desdeMain = f => { try { return execSync(`git show origin/main:kozmos/${f}`, {cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"]}).toString(); } catch (e) { return null; } };
prueba("catalogo-patrones", () => {
  const ej = EJM(), P = caminos.PATRONES;
  for (const e of ESC.escaleras) ok(P.includes(e.patron), `${e.id}: patrón ${e.patron}`);
  ok(["tirar", "remo"].every(id => rutina.escalera(id).patron === "tirar") && ["empujar", "fondos"].every(id => rutina.escalera(id).patron === "empujar")
    && rutina.escalera("isquios").patron === "bisagra" && rutina.escalera("dragon").patron === "abdomen" && rutina.escalera("cadera").patron === "movilidad", "los patrones de las escaleras");
  for (const e of EJ.ejercicios) if (e.patron) ok(Array.isArray(e.patron) && e.patron.length && e.patron.every(x => P.includes(x)), `${e.id}: patrón ${e.patron}`);
  /* cada ejercicio de una estrella de fuerza y de cada escalón (con sus variantes) dice qué entrena */
  const fu = CAT.constelaciones.filter(c => c.familia === "fu").flatMap(c => c.estrellas.map(s => s.prueba.ejercicio));
  const pasos = ESC.escaleras.flatMap(e => e.pasos.flatMap(rutina.idsPaso));
  const sin = [...new Set([...fu, ...pasos])].filter(id => !caminos.patronDe(id, ej).length);
  ok(!sin.length, "sin patrón: " + sin.join(", "));
  ok(caminos.patronDe("bandera", ej).join() === "abdomen,empujar,tirar" && caminos.patronDe("muscle-up", ej).join() === "tirar,empujar" && caminos.patronDe("fl-tuck", ej).join() === "tirar", "los patrones de las habilidades");
  ok(caminos.patronDe("remo-mesa", ej).join() === "tirar" && caminos.patronDe("sentadilla-mancuernas", ej).join() === "piernas" && caminos.patronDe("peso-muerto-rumano", ej).join() === "bisagra", "los de las variantes salen de su escalera");
});
prueba("catalogo-equipo-coherente", () => {
  /* una estrella nunca pide menos que su ejercicio; y si pide más, es porque la constelación entera lo pide (está anotado acá) */
  const ej = EJM(), PIDE_MAS = /^(parada-de-manos\.(munecas-15s|cuervo-10s|pike-elevado-8|libre-)|lastre\.|motor\.intervalos-1$)/;
  for (const c of CAT.constelaciones) for (const s of c.estrellas){
    const de = ej[s.prueba.ejercicio].equipo || [], pide = s.equipo || [];
    ok(de.every(x => pide.includes(x)), `${s.id}: el ejercicio pide ${de} y la estrella ${pide}`);
    ok(pide.every(x => de.includes(x)) || PIDE_MAS.test(s.id), `${s.id}: la estrella pide ${pide} y el ejercicio ${de}`);
  }
  /* las dos flexiones de Un brazo no piden barra (acta 027) */
  for (const id of ["un-brazo.flexion-arquera-5", "un-brazo.flexion-3"]) ok(!ESTRELLA.get(id).equipo, `${id} pide equipo`);
  const sinBarra = cielo.calcular(CAT, [], HOY, [], []).constelaciones.find(c => c.id === "un-brazo").estrellas;
  ok(["un-brazo.flexiones-40", "un-brazo.flexion-arquera-5", "un-brazo.flexion-3"].every(id => sinBarra.find(e => e.id === id).estado !== "sin-equipo"), "sin barra, las flexiones de Un brazo quedan fuera");
  /* lo que se agarra de la barra, el poste o la pared lo dice */
  const pide = {barra: ["fl-bolita", "fl-tuck", "fl-tuck-avanzado", "fl-una-pierna", "fl-straddle", "front-lever", "colgado-un-brazo", "fondo-ruso"], poste: ["bandera-rodillas", "bandera-abierta", "bandera"], pared: ["vertical-pared", "flexion-vertical-pared"], soga: ["double-under", "criss-cross"]};
  for (const [q, ids] of Object.entries(pide)) for (const id of ids) ok((ej[id].equipo || []).includes(q), `${id} no pide ${q}`);
  /* los remos sin barra no piden nada: una mesa y una puerta hay en todas las casas */
  for (const id of ["remo-mesa", "remo-toalla-puerta", "remo-poste"]) ok(ej[id] && !(ej[id].equipo || []).length, `${id} pide equipo`);
  for (const id of EQUIPOS) ok(EQUIPOS.includes(id), id);
  for (const e of EJ.ejercicios) for (const q of e.equipo || []) ok(EQUIPOS.includes(q) || q === "pesa", `${e.id}: equipo desconocido ${q}`);
});
prueba("catalogo-entradas", () => {
  const ej = EJM(), ids = new Set(), PARA = ["general", "barra", "manos", "piernas"];
  ok(ENT.piezas.length >= 12 && ENT.piezas.length <= 18, "piezas: " + ENT.piezas.length);
  for (const x of ENT.piezas){
    ok(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(x.id) && !ids.has(x.id), `pieza con id raro o repetido: ${x.id}`); ids.add(x.id);
    /* qué (nota) y cuánto (dosis), cada uno en su campo y cortos: la pantalla los pone en dos renglones, sin «·» */
    ok(typeof x.nota === "string" && x.nota && !/·/.test(x.nota) && x.nota.length <= 30, `${x.id}: la nota dice qué, corta: ${x.nota}`);
    ok(typeof x.dosis === "string" && x.dosis && !/·/.test(x.dosis) && (x.nota + x.dosis).length <= 50, `${x.id}: la dosis dice cuánto, corta: ${x.dosis}`);
    ok(Number.isInteger(x.seg) && x.seg >= 15 && x.seg <= 180, `${x.id}: segundos ${x.seg}`);
    ok(Array.isArray(x.para) && x.para.length && x.para.every(p => PARA.includes(p)), `${x.id}: para ${x.para}`);
    ok((x.equipo || []).every(q => EQUIPOS.includes(q)), `${x.id}: equipo ${x.equipo}`);
    ok(!x.ejercicio || ej[x.ejercicio], `${x.id}: el ejercicio ${x.ejercicio} no existe`);
  }
  ok(ENT.piezas.filter(x => x.ultima).length === 1 && ENT.piezas.at(-1).ultima, "una sola pieza última, al final");
  ok(ENT.piezas.some(x => x.pulso && !(x.equipo || []).length), "falta algo para subir el pulso sin equipo");
  for (const n of ["barra", "manos", "piernas"]) ok(ENT.piezas.filter(x => x.para.includes(n)).length >= 2, `pocas piezas para ${n}`);
});
prueba("catalogo-caminos", () => {
  /* un «camino» explícito nombra una escalera y uno de sus escalones, y solo está cuando no se deduce (el ejercicio no está en una escalera) */
  const con = CAT.constelaciones.flatMap(c => c.estrellas).filter(s => s.camino);
  ok(con.length >= 1 && ESTRELLA.get("muscle-up.fondo-ruso").camino?.escalera === "fondos", "falta el camino del fondo ruso");
  for (const s of con){
    const esc = rutina.escalera(s.camino.escalera);
    ok(esc && esc.pasos.some(p => rutina.idsPaso(p).includes(s.camino.hasta)), `${s.id}: el camino no lleva a un escalón: ${JSON.stringify(s.camino)}`);
    ok(!caminos.enEscaleras(s.prueba.ejercicio).length, `${s.id}: su ejercicio ya está en una escalera; el camino sobra`);
  }
});
/* las sesiones fuera de una rutina (un día del motor): la serie dice su escalera */
const deDia = (id, fecha, esc, ej, vs, {rango = [8, 12], kg, objetivo} = {}) => ({id, fecha, bloques: [{familia: "fu", series: vs.map(v => ({ejercicio: ej, tipo: "repeticiones", valor: v, objetivo: objetivo ?? Math.min(v, rango[1]), escalera: esc, rango, n: vs.length, ...(kg !== undefined ? {kg} : {})}))}]});
prueba("escalera-fuera-de-rutina", () => {
  const ej = EJM();
  const st = rutina.escalonDe("remo", {ej, equipo: ["barra"], sesiones: [deDia("a", "2026-10-01", "remo", "remo-poste", [12, 12, 12]), deDia("b", "2026-10-03", "remo", "remo-poste", [12, 12, 12])]});
  ok(st.paso.ejercicio === "remo-toalla-puerta" && st.evento === "sube" && st.nombre === "Remo" && st.patron === "tirar", "sin rutina, el remo no subió: " + JSON.stringify([st.paso.ejercicio, st.evento]));
  const todos = rutina.escalonesTodos({ej, equipo: ["barra"]});
  ok(Object.keys(todos).join() === ESC.escaleras.map(e => e.id).join() && todos.tirar.paso.ejercicio === "colgado-activo", "todas las escaleras: " + Object.keys(todos));
  ok(rutina.escalonDe("nada", {ej}) === null, "una escalera que no existe");
});
prueba("escalera-desde", () => {
  const ej = EJM();
  ok(rutina.escalonDe("tirar", {ej, equipo: ["barra"], desde: "dominada"}).paso.ejercicio === "dominada", "«desde» no fija el arranque");
  ok(rutina.escalonesTodos({ej, equipo: ["barra"], desde: {tirar: "dominada-negativa"}}).tirar.paso.ejercicio === "dominada-negativa", "«desde» por escalera");
  /* lo hecho manda sobre «desde» */
  const ss = [deDia("a", "2026-10-01", "tirar", "dominada-explosiva", [4, 4, 4], {rango: [3, 5]})];
  ok(rutina.escalonDe("tirar", {ej, equipo: ["barra"], desde: "dominada", sesiones: ss}).paso.ejercicio === "dominada-explosiva", "«desde» le ganó al diario");
  /* «desde» puede ser una variante: el remo debajo de la mesa es el escalón del remo invertido */
  ok(rutina.escalonDe("remo", {ej, equipo: [], desde: "remo-mesa"}).paso.ejercicio === "remo-mesa", "arrancar en el remo debajo de la mesa");
});
prueba("escalera-kilos", () => {
  /* con mancuernas: arranca en kgInicial, en el tope dos veces suma la carga y vuelve al mínimo, al pasar hastaKg sube */
  const ej = EJM(), eq = rutina.conPesa(["mancuernas"]), st = ss => rutina.escalonDe("remo", {ej, equipo: eq, desde: "remo-mancuerna", sesiones: ss});
  const r = (id, vs, kg) => deDia(id, "2026-10-" + id.padStart(2, "0"), "remo", "remo-mancuerna", vs, {kg});
  const s0 = st([]);
  ok(s0.paso.ejercicio === "remo-mancuerna" && s0.kg === 6 && s0.paso.carga === 2, "sin historia, 6 kg: " + JSON.stringify([s0.paso.ejercicio, s0.kg]));
  const una = st([r("1", [12, 12, 12], 6)]);
  ok(una.evento === "igual" && una.kg === 6, "una vez en el tope no suma: " + una.evento);
  const dos = st([r("1", [12, 12, 12], 6), r("2", [12, 12, 12], 6)]);
  ok(dos.evento === "carga" && dos.nuevo === "carga" && dos.kg === 8 && dos.paso.ejercicio === "remo-mancuerna", "dos veces en el tope: +2 kg: " + JSON.stringify([dos.evento, dos.kg]));
  const d = rutina.defEscalera(rutina.escalera("remo"), ej, eq, "remo-mancuerna");
  ok(rutina.metas(d, dos, {series: 3}).objetivos.join() === "8,8,8", "con más peso no vuelve al mínimo");
  /* lo que pusiste manda: con 15 kg en el tope dos veces ya no hay carga que sumar (16 es el techo): subís, sin kilos */
  const arriba = st([r("1", [12, 12, 12], 16), r("2", [12, 12, 12], 16)]);
  ok(arriba.evento === "sube" && arriba.paso.ejercicio === "remo-mesa" && arriba.kg === null, "pasado hastaKg no sube: " + JSON.stringify([arriba.evento, arriba.paso.ejercicio, arriba.kg]));
  ok(st([r("1", [12, 12, 12], 14), r("2", [12, 12, 12], 14)]).kg === 16, "de 14 a 16 suma");
  /* dos veces sin el mínimo: 2 kg menos; ya en kgInicial, el escalón de abajo */
  const menos = st([r("1", [6, 6, 6], 10), r("2", [6, 6, 6], 10)]);
  ok(menos.evento === "menos-peso" && menos.nuevo === "baja" && menos.kg === 8 && menos.paso.ejercicio === "remo-mancuerna", "no bajó el peso: " + JSON.stringify([menos.evento, menos.kg]));
  const abajo = st([r("1", [6, 6, 6], 6), r("2", [6, 6, 6], 6)]);
  ok(abajo.evento === "baja" && abajo.paso.ejercicio === "remo-poste", "en kgInicial no bajó de escalón: " + JSON.stringify([abajo.evento, abajo.paso.ejercicio]));
  /* el resumen: ▲ +2 kg */
  const ss = [r("1", [12, 12, 12], 6), r("2", [12, 12, 12], 6)], c = rutina.cambios(ss[1], ss, {ej, equipo: eq}).find(x => x.id === "remo");
  ok(c && c.evento === "carga" && c.kg === 8 && c.carga === 2, "el resumen no dice +2 kg: " + JSON.stringify(c));
  /* «kg» no es lastre: no hace marcas de % de tu peso (aunque la sesión tenga tu peso) */
  const x = {...deDia("k", HOY, "remo", "dominada-lastre", [5], {kg: 40}), pesoKg: 80};
  ok(!cielo.calcular(CAT, [], HOY, [x]).constelaciones.find(k => k.id === "lastre").estrellas[0].encendida, "40 kg por mano encendieron «Dominada +10 %»");
  /* en la rutina: la serie lleva los kilos y que son por mano; la fila del día los dice */
  const base = RUTINAS.find(([, y]) => y.id === "base_cali")[1], hist = [{...r("1", [10, 9, 9], 6), rutina: {id: "base_cali", sesion: 1}}];
  const dia = rutina.deRutina(base, 1, {ej, equipo: eq, sesiones: hist}), p = dia.bloques.flatMap(b => b.pasos || []).find(y => y.escalera === "remo");
  ok(p && p.ejercicio === "remo-mancuerna" && p.kg === 6 && p.mano && p.carga === 2, "el paso con mancuerna: " + JSON.stringify(p));
  ok(rutina.filas(dia.bloques, ej).some(f => f.escalera === "remo" && f.kg === "6 kg" && !/kg/.test(f.n)), "la fila no dice los kilos: " + JSON.stringify(rutina.filas(dia.bloques, ej).filter(f => f.escalera === "remo")));
  /* el respaldo lleva «kg» y no deja pasar kilos imposibles */
  const d1 = {mediciones: [], sesiones: [{...x, duracion: 600}], perfil: {}}, leido = respaldo.leer(JSON.stringify(respaldo.armar(d1, "k", 1)));
  ok(leido.descartadas === 0 && leido.sesiones[0].bloques[0].series[0].kg === 40, "el respaldo pierde los kilos");
  const malo = JSON.parse(JSON.stringify(d1)); malo.sesiones[0].bloques[0].series[0].kg = 900;
  ok(respaldo.leer(JSON.stringify(respaldo.armar(malo, "k", 1))).descartadas === 1, "900 kg por mano entran al respaldo");
});
prueba("escalera-con-peso", () => {
  const ej = EJM(), paso = (id, equipo, desde) => rutina.escalonDe(id, {ej, equipo, desde}).paso;
  /* con mancuernas, la sentadilla es con mancuernas y lleva sus kilos; sin ellas, o sin decir tu equipo, la de siempre */
  const conM = paso("piernas", rutina.conPesa(["mancuernas"]));
  ok(conM.ejercicio === "sentadilla-mancuernas" && conM.kgInicial === 4 && conM.carga === 2 && conM.k === 0, "con mancuernas: " + JSON.stringify(conM));
  ok(paso("piernas", []).ejercicio === "sentadilla" && !paso("piernas", []).carga && paso("piernas", null).ejercicio === "sentadilla", "sin mancuernas o sin decir");
  ok(paso("isquios", rutina.conPesa(["mancuernas"])).ejercicio === "peso-muerto-rumano", "el puente con peso es el peso muerto rumano");
  /* las sentadillas de antes cuentan para el mismo escalón */
  const ss = [deDia("a", "2026-10-01", "piernas", "sentadilla", [12, 12, 12]), deDia("b", "2026-10-03", "piernas", "sentadilla-mancuernas", [12, 12, 12], {kg: 4})];
  const st = rutina.escalonDe("piernas", {ej, equipo: rutina.conPesa(["mancuernas"]), sesiones: ss});
  ok(st.paso.ejercicio === "sentadilla-mancuernas" && st.evento === "carga" && st.kg === 6, "la sentadilla de antes no cuenta: " + JSON.stringify([st.paso.ejercicio, st.evento, st.kg]));
  /* sin barra el remo invertido es debajo de la mesa; sin mancuernas, la mancuerna es la toalla en la puerta (sin kilos) */
  ok(paso("remo", [], "remo-invertido").ejercicio === "remo-mesa" && paso("remo", ["barra"], "remo-invertido").ejercicio === "remo-invertido", "el remo debajo de la mesa");
  const t = paso("remo", [], "remo-mancuerna");
  ok(t.ejercicio === "remo-toalla-puerta" && t.carga === undefined && t.kgInicial === undefined, "la toalla en la puerta no lleva kilos: " + JSON.stringify(t));
  /* sin equipo el remo tiene sus tres primeros escalones */
  ok(rutina.defEscalera(rutina.escalera("remo"), ej, []).pasos.map(p => p.ejercicio).join() === "remo-poste,remo-toalla-puerta,remo-mesa", "el remo sin equipo");
});
prueba("dia-a-tu-tiempo", () => {
  /* tus minutos (vuelta 35): el día entra en lo que elegiste; sin elegir, como siempre (hasta la hora) */
  const eq = rutina.conPesa(["barra", "paralelas", "mancuernas", "kettlebell", "bici"]), rumbo = ["front-lever", "una-pierna", "planche"];
  const dia = m => armarDia(rumbo, {equipo: eq, minutos: m}), partes = d => d.bloques.map(b => b.molde);
  ok(JSON.stringify(dia(null)) === JSON.stringify(armarDia(rumbo, {equipo: eq})), "sin elegir cambió el día");
  for (const m of molde.MINUTOS){ const d = dia(m);
    ok(d.minutos <= Math.max(m, 20), `${m} min: el día dura ${d.minutos}`);
    ok(partes(d)[0] === "entrada" && partes(d).includes("habilidad") && partes(d).at(-1) === "cierre", `${m} min: le falta la entrada, una habilidad o el cierre: ${partes(d)}`);
    if (m >= 45) ok(d.minutos >= m - 10, `${m} min: sobran más de 10 (${d.minutos})`); }
  /* poco tiempo: la fuerza se achica antes que la habilidad, cortando movimientos antes que series; mucho, la fuerza va con
     4 series y hay motor a intervalos */
  const c = dia(30), l = dia(90), fz = d => d.bloques.filter(b => b.molde === "fuerza");
  ok(fz(c).length <= 1 && fz(c).every(b => b.pasos.every(x => x.n >= 3)), "a 30 min, la fuerza: " + fz(c).map(b => b.pasos.length));
  ok(fz(l).length === 2 && fz(l).every(b => b.pasos.every(x => x.n === 4)) && partes(l).includes("motor") && partes(l).indexOf("motor") === partes(l).length - 2, "a 90 min: " + partes(l));
  /* el motor: con kettlebell, swings; el que menos hiciste; cada tres veces, el escalón que sigue */
  const m0 = molde.motor(["kettlebell"]);
  ok(m0.nombre === "Kettlebell a intervalos" && m0.tramos[0].ejercicio === "swing-kettlebell" && m0.escalon === 0 && m0.molde === "motor", "el motor con kettlebell: " + JSON.stringify(m0).slice(0, 200));
  const ses = n => Array.from({length: n}, (_, i) => ({id: "m" + i, fecha: "2026-10-0" + (i + 1), bloques: [{molde: "motor", nombre: "Kettlebell a intervalos", series: [{valor: 1}]}]}));
  ok(molde.motor(["kettlebell"], ses(3)).escalon === 1 && molde.motor(["kettlebell"], ses(6)).tramos[0].ejercicio === "arranque-kettlebell", "el motor no sube");
  ok(molde.motor(["kettlebell", "soga"], ses(1)).nombre === "Soga a intervalos" && molde.motor(null).nombre === "Intervalos sin equipo", "el motor no rota");
  for (const x of molde.MOTORES) for (const q of x.pasos) ok(EJM()[q.ej], "el motor pide un ejercicio que no existe: " + q.ej);
});
prueba("pesas-primero", () => {
  /* una pesa es una pesa: con mancuernas o con una kettlebell salen los ejercicios de una sola pesa (vuelta 35) */
  const ej = EJM(), conP = rutina.conPesa, paso = (id, equipo, desde) => rutina.escalonDe(id, {ej, equipo, desde}).paso;
  ok(conP(["kettlebell"]).includes("pesa") && conP(["mancuernas", "barra"]).includes("pesa") && !conP(["barra"]).includes("pesa") && conP(null) === null && conP(["pesa", "kettlebell"]).length === 2, "conPesa");
  for (const id of ["remo-mancuerna", "sentadilla-bulgara", "peso-muerto-una-pierna", "sentadilla-mancuernas", "peso-muerto-rumano"]) ok(ej[id].equipo.join() === "pesa", id + " no es de una pesa");
  /* solo con una kettlebell: la sentadilla y el peso muerto llevan la pesa y sus kilos */
  const kb = conP(["kettlebell"]);
  ok(paso("piernas", kb).ejercicio === "sentadilla-copa" && paso("piernas", kb).kgInicial === 8 && paso("isquios", kb).ejercicio === "peso-muerto-rumano", "con una kettlebell, sin pesa en piernas o isquios");
  ok(paso("piernas", conP(["mancuernas"])).ejercicio === "sentadilla-mancuernas" && paso("piernas", conP(["mancuernas"])).kgInicial === 4, "con mancuernas, la sentadilla con pesa");
  /* pesas primero: con una pesa, el remo arranca en el remo a un brazo con pesa aunque tu nivel diga el poste; sin pesa, en el poste */
  for (const eq of [kb, conP(["mancuernas"]), conP(["mancuernas", "barra"])]) ok(paso("remo", eq).ejercicio === "remo-mancuerna" && paso("remo", eq, "remo-poste").ejercicio === "remo-mancuerna" && paso("remo", eq).kgInicial === 6, "con pesa, el remo no arranca con kilos: " + JSON.stringify(eq));
  ok(paso("remo", []).ejercicio === "remo-poste" && paso("remo", ["barra"]).ejercicio === "remo-poste" && paso("remo", null).ejercicio === "remo-poste", "sin pesa, el remo no arranca en el poste");
  /* más arriba manda tu nivel, y lo hecho manda sobre todo: dos veces sin el mínimo con 6 kg baja al poste */
  ok(paso("remo", conP(["mancuernas", "barra"]), "remo-invertido").ejercicio === "remo-invertido", "tu nivel más arriba no manda");
  const ss = ["1", "3"].map(d => deDia(d, "2026-10-0" + d, "remo", "remo-mancuerna", [4, 4, 3], {kg: 6}));
  ok(rutina.escalonDe("remo", {ej, equipo: kb, sesiones: ss}).paso.ejercicio === "remo-poste", "lo hecho no manda sobre las pesas");
  /* el día del motor: con una kettlebell, sin barra, el remo y las piernas van con la pesa */
  const d = armarDia(["front-lever", "una-pierna"], {equipo: kb}), ejs = d.bloques.flatMap(b => b.pasos || []).map(x => x.ejercicio);
  ok(ejs.includes("remo-mancuerna") && !ejs.includes("remo-poste"), "el día con una kettlebell: " + [...new Set(ejs)]);
});
prueba("gimnasio-kilos", () => {
  /* con barra y discos o con máquinas, la versión con kilos es la escalera: arrancás ahí, tu nivel pone los kilos (vuelta 37) */
  const ej = EJM(), gym = ["discos", "banco", "maquinas"], paso = (id, equipo, o = {}) => rutina.escalonDe(id, {ej, equipo: rutina.conPesa(equipo), ...o});
  const sb = paso("piernas", gym);
  ok(sb.paso.ejercicio === "sentadilla-barra" && sb.paso.total && sb.kg === 20, "sentadilla con barra: " + JSON.stringify([sb.paso.ejercicio, sb.kg]));
  ok(paso("piernas", gym, {desde: "pistol"}).paso.ejercicio === "sentadilla-barra" && paso("piernas", gym, {desde: "pistol"}).kg === 70, "experto con barra: arranca con más kilos, no en la pistol");
  ok(paso("piernas", ["maquinas"]).paso.ejercicio === "prensa" && paso("empujar", gym).paso.ejercicio === "press-banca" && paso("empujar", ["maquinas"]).paso.ejercicio === "press-pecho-maquina", "máquinas y banca");
  ok(paso("empujar", ["discos"]).paso.ejercicio === "flexion-inclinada" && paso("arriba", ["discos"]).paso.ejercicio === "press-militar", "sin banco no hay press de banca; el press de hombros sí");
  ok(paso("tirar", ["maquinas"]).paso.ejercicio === "jalon-pecho" && paso("tirar", ["barra", "maquinas"], {desde: "dominada"}).paso.ejercicio === "dominada", "el jalón es para llegar a la dominada, no la reemplaza");
  ok(paso("arriba", ["kettlebell"]).paso.ejercicio === "press-kettlebell" && paso("arriba", ["mancuernas"]).paso.ejercicio === "press-hombros" && paso("arriba", []).paso.ejercicio === "flexion-pike", "empujar arriba");
  ok(paso("remo", ["anillas"]).paso.ejercicio === "remo-anillas" && paso("fondos", ["anillas"], {desde: "fondo"}).paso.ejercicio === "fondo-anillas", "anillas");
  /* la habilidad va con tu cuerpo, y cada cuenta por su lado: el press no baja la planche ni la planche te saca del press */
  ok(paso("empujar", gym, {sinPeso: true}).paso.ejercicio === "flexion-inclinada", "sin peso, la flexión");
  const press = ["1", "3"].map(d => deDia("p" + d, "2026-10-0" + d, "empujar", "press-banca", [8, 8, 8], {rango: [5, 8], kg: 40}));
  const flex = ["5", "7"].map(d => deDia("f" + d, "2026-10-0" + d, "empujar", "flexion-arquera", [6, 6, 6], {rango: [3, 6]}));
  ok(paso("empujar", gym, {sesiones: [...press, ...flex]}).paso.ejercicio === "press-banca" && paso("empujar", gym, {sesiones: [...press, ...flex]}).kg === 45, "la planche te sacó del press: " + JSON.stringify(paso("empujar", gym, {sesiones: [...press, ...flex]}).paso.ejercicio));
  ok(paso("empujar", gym, {sinPeso: true, sesiones: [...flex, ...press]}).paso.ejercicio === "flexion-pseudo-planche", "el press bajó la planche");
  /* el día: con gimnasio, la fuerza lleva kilos en total; el motor, la máquina de remo o la mancuerna */
  const d = armarDia(["front-lever"], {equipo: rutina.conPesa(gym), minutos: 45}), xs = deMolde(d.bloques, "fuerza").flatMap(b => b.pasos);
  ok(xs.some(x => x.ejercicio === "sentadilla-barra" || x.ejercicio === "peso-muerto-barra") && xs.filter(x => x.kg).every(x => x.total && x.mano), "el día de gimnasio: " + xs.map(x => x.ejercicio));
  ok(molde.motor(["remadora"]).nombre === "Remo a intervalos" && molde.motor(["mancuernas"]).nombre === "Mancuerna a intervalos", "el motor con máquina de remo o mancuernas");
});
prueba("accesorios", () => {
  /* bandas, cajón y paralelas: la versión con lo que tenés, sin kilos, en la misma escalera (vuelta 38) */
  const ej = EJM(), paso = (id, equipo, o = {}) => rutina.escalonDe(id, {ej, equipo: rutina.conPesa(equipo), ...o});
  ok(paso("remo", ["bandas"]).paso.ejercicio === "remo-banda" && paso("arriba", ["bandas"]).paso.ejercicio === "press-banda" && paso("isquios", ["bandas"]).paso.ejercicio === "buenos-dias-banda", "con bandas");
  ok(paso("tirar", ["barra", "bandas"], {desde: "dominada-asistida"}).paso.ejercicio === "dominada-banda" && paso("tirar", ["bandas"]).paso.ejercicio !== "dominada-banda", "la dominada con banda pide barra");
  ok(paso("piernas", ["cajon"], {desde: "zancada"}).paso.ejercicio === "subida-cajon", "con cajón, la subida");
  ok(paso("lsit", ["paralelas"], {desde: "l-sit"}).paso.ejercicio === "l-sit-paralelas" && paso("remo", ["paralelas"], {desde: "remo-invertido"}).paso.ejercicio === "remo-paralelas", "con paralelas");
  ok(!paso("remo", ["bandas"]).paso.kgInicial && !paso("remo", ["bandas"]).kg, "las bandas no llevan kilos");
  ok(molde.motor(["cajon"]).nombre === "Cajón a intervalos", "el motor con cajón");
  /* lo que va sin kilos cuenta también para la habilidad: el L-sit en paralelas te sube en el L-sit del piso */
  const ls = [{id: "l1", fecha: "2026-10-01", bloques: [{familia: "fu", series: [20, 20, 20].map(v => ({ejercicio: "l-sit-paralelas", tipo: "segundos", valor: v, escalera: "lsit"}))}]}];
  const conCuerpo = paso("lsit", ["paralelas"], {sinPeso: true, desde: "hollow", sesiones: ls});
  ok(conCuerpo.paso.ejercicio === "l-sit", "el L-sit en paralelas cuenta sin peso: " + conCuerpo.paso.ejercicio);
});
prueba("empujes-se-turnan", () => {
  /* el principal no se turna con los secundarios: en cuerpo entero, las flexiones son el empuje y los hombros vienen después.
     Los secundarios se turnan entre ellos cuando no entran todos: el que más hace que no tocás */
  const p = armarDia(["front-lever"], {equipo: ["barra", "paralelas"]}), es = deMolde(p.bloques, "fuerza").flatMap(b => [...new Set(b.pasos.map(x => x.escalera))]);
  ok(es.includes("empujar") && (!es.includes("arriba") || es.indexOf("empujar") < es.indexOf("arriba")), "las flexiones antes que los hombros: " + es);
  const ss = [], usados = [];
  for (const d of ["02", "04", "06"]){
    const q = armarDia([], {equipo: ["barra", "paralelas"], ss, hoy: "2026-10-" + d, minutos: 30, tipo: "empujar"});
    const xs = deMolde(q.bloques, "fuerza").flatMap(b => b.pasos);
    ok(xs[0].escalera === "empujar", "el día de empujar arranca por el pecho: " + xs.map(x => x.escalera));
    const e = xs.find(x => ["arriba", "fondos"].includes(x.escalera));
    if (e){ usados.push(e.escalera); ss.push(deDia("d" + d, "2026-10-" + d, e.escalera, e.ejercicio, [6, 6, 6])); }
  }
  ok(usados.length >= 2 && usados[0] !== usados[1], "los secundarios no se turnan: " + usados);
});
prueba("entrada-elige", () => {
  const ej = EJM(), b = (...ids) => ids.map(e => ({familia: "fu", pasos: [{ejercicio: e, tipo: "repeticiones", objetivo: 5}]}));
  const seg = x => x.tramos.reduce((a, t) => a + t.seg, 0), notas = x => x.tramos.map(t => t.nota);
  const todo = caminos.entrada(b("dominada", "flexion", "sentadilla"), {ej, equipo: ["barra", "bici"]});
  ok(todo.clase === "tramos" && todo.nombre === "Entrada en calor" && todo.tramos.every(t => t.clase === "entrada") && todo.series === todo.tramos.length, "no es un bloque de tramos de entrada");
  ok(/^Bici suave/.test(notas(todo)[0]) && todo.tramos[0].ejercicio === "bici", "con bici, arranca en la bici: " + notas(todo)[0]);
  ok(/^Primer ejercicio suave/.test(notas(todo).at(-1)), "no termina con el primer ejercicio suave");
  ok(notas(todo).some(n => /^Colgarse|^Encogerse/.test(n)) && notas(todo).some(n => /^Flexiones apoyado|^Muñecas/.test(n)) && notas(todo).some(n => /^Sentadillas|^Zancadas|^Círculos de cadera|^Puente/.test(n)), "no hay de todo lo que pide el día: " + notas(todo));
  /* sin equipo: nada de barra ni de bici; el pulso, con saltos */
  const nada = caminos.entrada(b("flexion", "sentadilla"), {ej, equipo: []});
  ok(/^Saltos de tijera/.test(notas(nada)[0]) && !notas(nada).some(n => /^Colgarse|^Encogerse|^Bici/.test(n)), "sin equipo: " + notas(nada));
  /* sin decir tu equipo: lo que usan los ejercicios del día (la barra de las dominadas), nunca la bici */
  const nulo = caminos.entrada(b("dominada"), {ej, equipo: null});
  ok(notas(nulo).some(n => /^Colgarse/.test(n)) && !notas(nulo).some(n => /^Bici/.test(n)), "sin decir el equipo: " + notas(nulo));
  /* unos cinco minutos: de 4:30 a 6, en todos los casos */
  for (const x of [todo, nada, nulo, caminos.entrada([], {ej, equipo: []}), caminos.entrada(b("pistol", "nordico"), {ej, equipo: ["bici"]})]) ok(seg(x) >= 240 && seg(x) <= 360, "la entrada dura " + seg(x) + " s: " + notas(x));
  /* el motor la puede correr como cualquier entrada en calor de rutina: una fila con sus minutos */
  ok(JSON.stringify(rutina.filasTramos(todo, ej)) === JSON.stringify([{q: "Entrada en calor", n: `${Math.round(seg(todo) / 60)} min`, familia: "fu"}]), "la fila de la entrada");
});
prueba("camino-de-estrella", () => {
  const ej = EJM(), en = (id, desde, equipo = ["barra", "paralelas"]) => ({[id]: rutina.escalonDe(id, {ej, equipo, desde})});
  /* estás abajo en la escalera de la estrella: el camino; ya en su escalón, la estrella */
  const c = caminos.caminoDe(ESTRELLA.get("muscle-up.explosiva-3"), {escalones: en("tirar", "dominada")});
  ok(c.camino && c.escalera === "tirar" && c.hasta === "dominada-explosiva" && c.desde === "dominada" && c.nombre === "Camino a " + ESTRELLA.get("muscle-up.explosiva-3").nombre, "el camino: " + JSON.stringify(c));
  ok(!caminos.caminoDe(ESTRELLA.get("muscle-up.explosiva-3"), {escalones: en("tirar", "dominada-explosiva")}).camino, "en su escalón sigue el camino");
  ok(!caminos.caminoDe(ESTRELLA.get("muscle-up.explosiva-3"), {escalones: en("tirar", "dominada-arquera")}).camino, "más arriba sigue el camino");
  ok(caminos.caminoDe(ESTRELLA.get("un-brazo.flexion-3"), {escalones: en("empujar", "flexion", [])}).escalera === "empujar", "la flexión a un brazo, por empujar");
  /* el camino del catálogo: el fondo ruso se llega por los fondos */
  const f = caminos.caminoDe(ESTRELLA.get("muscle-up.fondo-ruso"), {escalones: en("fondos", "fondo-banco")});
  ok(f.camino && f.escalera === "fondos" && f.hasta === "fondo", "el fondo ruso: " + JSON.stringify(f));
  ok(!caminos.caminoDe(ESTRELLA.get("muscle-up.fondo-ruso"), {escalones: en("fondos", "fondo")}).camino, "con fondos, el fondo ruso es la estrella");
  /* sin escalera (el front lever recogido) o sin saber dónde estás: la estrella */
  ok(!caminos.caminoDe(ESTRELLA.get("front-lever.tuck-10s"), {escalones: rutina.escalonesTodos({ej})}).camino, "una estrella sin escalera");
  ok(!caminos.caminoDe(ESTRELLA.get("muscle-up.explosiva-3"), {}).camino, "sin escalones");
});
prueba("rutina-armar-bloques", () => {
  /* armarBloques es lo que hacía deRutina por dentro: con el catálogo de main, el código de main y el de ahora dan lo mismo,
     byte a byte, en las 31 rutinas, todos sus días, cinco equipos, con y sin descarga y con historia */
  const viejo = desdeMain("src/sesion/rutina.js"), escM = desdeMain("catalogo/escaleras.json"), ejM = desdeMain("catalogo/ejercicios.json");
  const ej = EJM(), equipos = [null, [], ["barra"], ["mancuernas"], ["barra", "paralelas", "pared", "poste", "lastre", "bici", "soga", "mancuernas", "kettlebell"]];
  const hist = ESC.escaleras.flatMap((e, i) => [0, 1].map(j => deDia(`h${i}${j}`, `2026-09-${String(i * 2 + j + 1).padStart(2, "0")}`, e.id, e.pasos[Math.min(2, e.pasos.length - 1)].ejercicio, [8, 8, 8], {rango: [5, 8]})));
  hist.push({id: "hl", fecha: "2026-09-30", rutina: {id: "lastre", sesion: 0}, bloques: [{series: [6, 6, 6].map(v => ({ejercicio: "dominada-lastre", tipo: "repeticiones", valor: v, objetivo: 4, rango: [4, 6], n: 3, lastreKg: 10, pesoKg: 80}))}]});
  if (viejo && escM && ejM){
    const cx = {K: {ESCALERAS: JSON.parse(escM)}}; vm.createContext(cx); vm.runInContext(viejo, cx);
    const ejV = Object.fromEntries(JSON.parse(ejM).ejercicios.map(e => [e.id, e]));
    const antes = ctx.K.ESCALERAS; ctx.K.ESCALERAS = JSON.parse(escM);
    try {
      /* las escaleras que main no tiene (vuelta 37: empujar arriba) cambian su día a propósito: ese día no se compara */
      const enMain = new Set(JSON.parse(escM).escaleras.map(e => e.id)), nueva = s => s.bloques.some(b => alts(b.escalera).some(e => !enMain.has(e)));
      for (const [f, r] of RUTINAS) for (let i = 0; i < r.sesiones.length; i++) if (!nueva(r.sesiones[i])) for (const equipo of equipos) for (const descarga of [false, true]) for (const sesiones of [[], hist]){
        const o = {ej: ejV, equipo, sesiones, marcas: [], descarga};
        const n = rutina.deRutina(r, i, {...o, equipo: rutina.conPesa(equipo)}), v = cx.K.rutina.deRutina(r, i, cx.K.rutina.conPesa ? {...o, equipo: cx.K.rutina.conPesa(equipo)} : o);
        /* lo único que cambia a propósito: sin el equipo de su primera escalera, la misma escalera no va dos veces en un día; la segunda se saltea (vuelta 33) */
        const escs = d => d.bloques.flatMap(b => b.pasos || []).map(x => x.escalera).filter(Boolean), salteado = JSON.stringify([...new Set(escs(n))].sort()) === JSON.stringify([...new Set(escs(v))].sort()) && escs(n).length < escs(v).length;
        /* y con pesas, el remo arranca en el remo a un brazo con pesa, no agarrado del marco de la puerta (vuelta 35): lo demás, igual.
           Si main ya sabe de pesas, se le pasa el mismo equipo y tiene que dar idéntico */
        const sinRemo = d => JSON.stringify(d.bloques.map(b => ({...b, pasos: (b.pasos || []).filter(x => x.escalera !== "remo")}))).replaceAll('"remo-mancuerna"', '"remo-poste"'), pesas = !!equipo && equipo.includes("mancuernas") && sinRemo(n) === sinRemo(v);
        if (!(JSON.stringify(n) === JSON.stringify(v) || salteado || pesas) && process.env.DIF) console.log(f, i, JSON.stringify(equipo), sesiones.length, "\n", sinRemo(n).slice(0, 3000), "\n", sinRemo(v).slice(0, 3000));
        ok(JSON.stringify(n) === JSON.stringify(v) || salteado || pesas, `${f} día ${i + 1} (${JSON.stringify(equipo)}, ${descarga ? "descarga" : "carga"}): cambió`);
      }
    } finally { ctx.K.ESCALERAS = antes; }
  }
  /* y con el catálogo de ahora, deRutina es armarBloques */
  for (const [f, r] of RUTINAS) r.sesiones.forEach((s, i) => { const o = {ej, equipo: rutina.conPesa(["mancuernas"]), sesiones: hist};
    ok(JSON.stringify(rutina.deRutina(r, i, o).bloques) === JSON.stringify(rutina.armarBloques(r.familia, s.bloques, {...o, equipoRutina: r.equipo, dia: s.nombre})), `${f} día ${i + 1}`); });
});

/* ===== El día del motor B: un molde para cada día ===== */
const TODO = ["barra", "paralelas", "pared", "poste", "lastre", "bici", "soga", "mancuernas", "kettlebell"];
const armarDia = (rumbo, {ms = [], ss = [], equipo = null, hoy = HOY, ...o} = {}) => molde.armar(cielo.calcular(CAT, ms, hoy, ss, equipo), rumbo, ss, hoy, {ej: EJM(), equipo, marcas: [], ...o});
const deMolde = (bs, m) => bs.filter(b => b.molde === m);
/* los ejercicios de trabajo de un día (la entrada en calor no cuenta: es para todo el día) */
const ejsDia = bs => bs.filter(b => b.molde !== "entrada").flatMap(b => molde.ejerciciosDe(b));
const escsDia = bs => bs.flatMap(b => b.pasos ? [...new Set(b.pasos.map(p => p.escalera).filter(Boolean))] : []);
/* una sesión hecha con lo que dio el día: los bloques con sus constelaciones (y las series que se piden, al tope si «tope») */
const hechaDia = (id, fecha, pl, {tope = false} = {}) => ({id, fecha, duracion: 2400, bloques: pl.bloques.filter(b => b.constelacion || b.constelaciones || b.pasos).map((b, i) => ({orden: i, familia: b.familia,
  ...(b.constelacion ? {constelacion: b.constelacion} : {}), ...(b.constelaciones ? {constelaciones: b.constelaciones} : {}), ...(b.molde ? {molde: b.molde} : {}),
  series: b.pasos ? b.pasos.map(p => ({ejercicio: p.ejercicio, tipo: p.tipo, objetivo: p.objetivo, valor: tope && p.rango ? p.rango[1] : Number.isFinite(p.objetivo) ? p.objetivo : 5,
    ...(p.escalera ? {escalera: p.escalera} : {}), ...(p.rango ? {rango: p.rango, n: p.n} : {})})) : []}))});
prueba("dia-molde", () => {
  const p = armarDia(["front-lever", "planche"], {equipo: ["barra"]}), ms = p.bloques.map(b => b.molde);
  ok(p.molde && ms.join() === "entrada,habilidad,habilidad,fuerza,fuerza,abdomen,cierre", "el molde: " + ms);
  ok(p.bloques[0].clase === "tramos" && p.bloques[0].nombre === "Entrada en calor", "primero la entrada en calor");
  const [a, b] = deMolde(p.bloques, "habilidad");
  ok(a.constelaciones.join() === "front-lever" && b.constelaciones.join() === "planche", "las dos metas de tu rumbo: " + [a.constelaciones, b.constelaciones]);
  ok(a.ejercicio === "colgado-activo" && a.estrella === "front-lever.colgado-60s" && a.series === 2 && a.objetivo === 30, "front lever, sostenes de 30 s hasta sumar 60: " + JSON.stringify([a.ejercicio, a.series, a.objetivo]));
  /* la fuerza va de a dos: cada par alterna dos ejercicios, sin descanso entre ellos y 2 min después del par */
  for (const f of deMolde(p.bloques, "fuerza")){
    const es = [...new Set(f.pasos.map(x => x.ejercicio))];
    ok(es.length === 2 && f.pasos.length === 6 && f.pasos[0].ejercicio !== f.pasos[1].ejercicio, "un par de fuerza: " + f.pasos.map(x => x.ejercicio));
    ok(f.pasos.every((x, k) => x.descanso === (k % 2 ? 120 : 0)), "descansos del par: " + f.pasos.map(x => x.descanso));
    ok(f.pasos.every(x => x.escalera && x.rango && x.n === 3), "cada serie dice su escalera, su rango y cuántas pide");
  }
  ok(p.minutos >= 35 && p.minutos <= 60 && p.minutos % 5 === 0, "de 40 a 55 minutos, más o menos: " + p.minutos);
  ok(!p.ventana.length && !p.volviste, "sin ventana ni vuelta");
  /* sin rumbo: igual hay día (fuerza, abdomen y cierre), sin habilidad */
  const s = armarDia([], {equipo: []});
  ok(!deMolde(s.bloques, "habilidad").length && deMolde(s.bloques, "fuerza").length >= 2 && s.bloques[0].molde === "entrada", "sin rumbo: " + s.bloques.map(b => b.molde));
  ok(armarDia(["no-existe", "planche"], {equipo: []}).bloques.some(b => (b.constelaciones || []).includes("planche")), "un id viejo en el rumbo no rompe");
});
prueba("dia-tu-semana", () => {
  /* el tipo de cada día de fuerza (docs/kozmos-motor.md): «Que Kozmos elija» según tus días; si no, el ciclo que elegiste,
     que avanza con cada día que tuvo fuerza */
  const dias = n => Array(n).fill(0), eq = ["barra", "paralelas", "pared"];
  ok(molde.semanaDe("auto", 3) === "entero" && molde.semanaDe("auto", 4) === "aa" && molde.semanaDe("auto", 5) === "etp" && molde.semanaDe("auto", 6) === "etp" && molde.semanaDe("mus", 3) === "mus", "que Kozmos elija");
  let ss = []; const tipos = [];
  for (const f of ["2026-10-12", "2026-10-13", "2026-10-15", "2026-10-16", "2026-10-19"]){ const p = armarDia(["front-lever", "una-pierna"], {equipo: eq, ss, hoy: f, dias: dias(4)}); tipos.push(p.dia); ss = [...ss, hechaDia("d" + f, f, p)]; }
  ok(tipos.join() === "arriba,abajo,arriba,abajo,arriba", "con cuatro días, arriba y abajo: " + tipos);
  ok(armarDia([], {equipo: eq, semana: "etp", ss: [hechaDia("x", "2026-10-20", armarDia([], {equipo: eq}))]}).dia === "tirar", "el ciclo sigue donde quedó");
  /* las habilidades van en los días de su movimiento: front lever los de arriba, una pierna los de abajo */
  const ar = armarDia(["front-lever", "una-pierna"], {equipo: eq, tipo: "arriba"}), ab = armarDia(["front-lever", "una-pierna"], {equipo: eq, tipo: "abajo"});
  ok(deMolde(ar.bloques, "habilidad").flatMap(b => b.constelaciones).join() === "front-lever" && deMolde(ab.bloques, "habilidad").flatMap(b => b.constelaciones).join() === "una-pierna", "cada habilidad en su día");
  ok(!deMolde(ab.bloques, "fuerza").flatMap(b => b.pasos).some(x => ["tirar", "empujar"].includes(rutina.escalera(x.escalera).patron)), "el día de abajo no tira ni empuja");
});
prueba("dia-orden", () => {
  /* en todos los tipos de día, con cualquier equipo y tiempo: principales, secundarios, accesorios y abdomen, en ese orden;
     de a dos, solo lo que no se pisa */
  const NIV = Object.fromEntries(Object.entries(molde.MOV).map(([k, v]) => [k, v.t]));
  const nivEsc = {tirar: 1, empujar: 1, piernas: 1, isquios: 1, remo: 2, arriba: 2, fondos: 2, lsit: 4, dragon: 4};
  const lado = {tirar: "tira", remo: "tira", empujar: "empuja", arriba: "empuja", fondos: "empuja", piernas: "piernas", isquios: "piernas", lsit: "abdomen", dragon: "abdomen"};
  let n = 0;
  for (const tipo of Object.keys(molde.TIPOS)) for (const equipo of [[], ["barra"], ["barra", "paralelas", "pared"], TODO]) for (const minutos of [20, 30, 45, 60, 90]){
    const p = armarDia(["front-lever", "planche", "una-pierna"], {equipo, tipo, minutos});
    const bs = p.bloques.filter(b => b.molde === "fuerza" || b.molde === "abdomen"), xs = bs.map(b => [...new Set(b.pasos.map(x => x.escalera))]);
    /* el primer movimiento de cada bloque marca su lugar en el orden; un movimiento que cayó a otra escalera (sin barra, el remo) conserva el suyo */
    const lug = xs.map(e => Math.min(...e.map(id => nivEsc[id] ?? 3)));
    ok(lug.every((v, i) => i === 0 || v >= lug[i - 1] || (lug[i - 1] === 2 && v === 1)), `${tipo} ${equipo} ${minutos}: fuera de orden: ${JSON.stringify(xs)}`);
    for (const e of xs) if (e.length === 2) ok(lado[e[0]] !== lado[e[1]], `${tipo} ${equipo} ${minutos}: un par que se pisa: ${e}`);
    ok(p.minutos <= Math.max(minutos, 20), `${tipo} ${minutos}: se pasa (${p.minutos})`);
    n++;
  }
  ok(n === 180 && NIV.tirar === 1 && NIV.biceps === 3, "casos: " + n);
});
prueba("dia-sin-repetidos", () => {
  /* todas las combinaciones de tres metas de fuerza, con cuatro equipos: nada dos veces y todo posible con tu equipo */
  const fu = CAT.constelaciones.filter(c => c.familia === "fu").map(c => c.id), ej = EJM();
  const combos = [];
  for (let i = 0; i < fu.length; i++) for (let j = i + 1; j < fu.length; j++) for (let k = j + 1; k < fu.length; k++) combos.push([fu[i], fu[j], fu[k]]);
  let n = 0;
  for (const equipo of [null, [], ["barra"], TODO]) for (const r of combos){
    const p = armarDia(r, {equipo}), es = ejsDia(p.bloques), xs = escsDia(p.bloques), hab = deMolde(p.bloques, "habilidad");
    ok(new Set(es).size === es.length, `${r} ${JSON.stringify(equipo)}: un ejercicio dos veces: ${es}`);
    ok(new Set(xs).size === xs.length, `${r} ${JSON.stringify(equipo)}: una escalera dos veces: ${xs}`);
    ok(!equipo || es.every(e => (ej[e]?.equipo || []).every(q => equipo.includes(q))), `${r} ${JSON.stringify(equipo)}: pide lo que no tenés: ${es.filter(e => (ej[e]?.equipo || []).some(q => !(equipo || []).includes(q)))}`);
    ok(hab.length <= 2 && hab.every(b => b.constelaciones.every(id => r.includes(id))), `${r}: habilidades ${hab.map(b => b.constelaciones)}`);
    ok(p.bloques[0].molde === "entrada" && p.bloques.at(-1).molde === "cierre" && p.minutos <= 60, `${r} ${JSON.stringify(equipo)}: molde o minutos (${p.minutos})`);
    n++;
  }
  ok(n === combos.length * 4 && combos.length === 84, "no recorrió todo: " + n);
});
prueba("dia-dos-metas-un-ejercicio", () => {
  /* muscle-up (10 dominadas) y un brazo (15 dominadas): el mismo camino, un solo bloque para las dos */
  const p = armarDia(["muscle-up", "un-brazo"], {equipo: ["barra"]}), hab = deMolde(p.bloques, "habilidad");
  ok(hab.length === 1 && hab[0].constelaciones.join() === "muscle-up,un-brazo" && hab[0].camino && hab[0].pasos.every(x => x.escalera === "tirar"), "dos metas, un camino: " + JSON.stringify(hab.map(b => [b.constelaciones, b.nombre])));
  /* front lever (colgado) y muscle-up (camino desde el colgado): el mismo ejercicio, un bloque */
  const q = armarDia(["front-lever", "muscle-up", "planche"], {equipo: ["barra"]}), hq = deMolde(q.bloques, "habilidad");
  ok(hq.length === 2 && hq[0].constelaciones.join() === "front-lever,muscle-up" && hq[1].constelaciones.join() === "planche", "front lever y muscle-up juntos: " + JSON.stringify(hq.map(b => b.constelaciones)));
  ok(ejsDia(q.bloques).filter(e => e === "colgado-activo").length === 1, "el colgado dos veces");
});
prueba("dia-equilibrio", () => {
  const pats = b => [...new Set(b.pasos.map(x => rutina.escalera(x.escalera).patron))];
  /* cuerpo entero: los cuatro principales de a dos, uno de arriba con uno de abajo. Front lever tira: el tirón va al final de los principales */
  const p = armarDia(["front-lever"], {equipo: ["barra", "paralelas"]}), [f1, f2] = deMolde(p.bloques, "fuerza");
  ok(pats(f1).sort().join() === "empujar,piernas" && pats(f2).sort().join() === "bisagra,tirar", "el equilibrio con front lever: " + [pats(f1), pats(f2)]);
  ok(f2.pasos.some(x => x.escalera === "remo") && f1.pasos.some(x => x.escalera === "empujar"), "fuerza con flexiones y remo, no lo de las habilidades: " + [f1.pasos.map(x => x.escalera), f2.pasos.map(x => x.escalera)]);
  /* planche empuja: el primer par no empuja */
  const q = armarDia(["planche"], {equipo: ["barra"]});
  ok(!pats(deMolde(q.bloques, "fuerza")[0]).includes("empujar"), "con planche, el primer par empuja");
  /* una pierna ya entrena piernas: las piernas van al final de los principales y la bisagra queda */
  const u = armarDia(["una-pierna"], {equipo: ["barra"]}), fu = deMolde(u.bloques, "fuerza").flatMap(pats);
  ok(!pats(deMolde(u.bloques, "fuerza")[0]).includes("piernas") && fu.includes("bisagra"), "con una pierna: " + fu);
  /* la bandera humana entrena abdomen: el día no suma abdomen; sin abdomen en las habilidades, sí */
  ok(!deMolde(armarDia(["bandera"], {equipo: ["poste"]}).bloques, "abdomen").length, "con bandera, abdomen de más");
  ok(deMolde(p.bloques, "abdomen").length === 1, "sin abdomen");
  ok(!deMolde(armarDia(["draco"], {equipo: []}).bloques, "abdomen").length, "con draco, abdomen de más");
  /* con bici y sin meta de rango o motor, el cierre es de 5 min de bici y el abdomen queda */
  const bc = armarDia(["front-lever", "planche"], {equipo: ["barra", "paralelas", "bici"]}), ci = deMolde(bc.bloques, "cierre")[0];
  ok(ci && ci.tramos?.[0]?.ejercicio === "bici" && ci.tramos[0].seg === 300 && deMolde(bc.bloques, "abdomen").length === 1 && bc.minutos <= 60, "bici de 5 min con abdomen: " + bc.bloques.map(b => b.molde) + " · " + bc.minutos + " min");
  /* dentro de los principales, primero el que hace más que no tocás */
  const tiro = {id: "t", fecha: "2026-10-18", bloques: [{familia: "fu", series: Array(6).fill({ejercicio: "dominada", escalera: "tirar", tipo: "repeticiones", valor: 6})}]};
  const v = armarDia([], {equipo: ["barra"], ss: [tiro]});
  ok(!pats(deMolde(v.bloques, "fuerza")[0]).includes("tirar"), "después de tirar, el primer par no tira: " + pats(deMolde(v.bloques, "fuerza")[0]));
});
prueba("dia-desde-tu-escalon", () => {
  /* tu nivel (PR3) dice dónde arrancás en cada escalera; lo que hiciste manda */
  /* (las flexiones y los hombros, hechos hace poco, dejan a los fondos como el empuje que más hace que no tocás) */
  const fondo = p => deMolde(p.bloques, "fuerza").flatMap(b => b.pasos).find(x => x.escalera === "fondos")?.ejercicio;
  const otros = [deDia("e", "2026-10-12", "empujar", "flexion", [6, 6, 6]), deDia("a", "2026-10-12", "arriba", "flexion-pike", [6, 6, 6])];
  const emp = {equipo: ["barra", "paralelas"], tipo: "empujar"};
  ok(fondo(armarDia(["front-lever"], {...emp, ss: otros})) === "flexion-cerrada", "sin nivel, el primer escalón");
  ok(fondo(armarDia(["front-lever"], {...emp, nivelDesde: {fondos: "fondo"}, ss: otros})) === "fondo", "con nivel, desde el fondo");
  const hist = deDia("h", "2026-10-10", "fondos", "fondo-banco", [8, 8, 8], {rango: [5, 8]});
  ok(fondo(armarDia(["front-lever"], {...emp, nivelDesde: {fondos: "fondo"}, ss: [hist, ...otros]})) === "fondo-banco", "lo hecho manda sobre el nivel");
  /* el camino también arranca en tu escalón: muscle-up desde la dominada es la estrella, no el camino */
  const mu = armarDia(["muscle-up"], {equipo: ["barra"], nivelDesde: {tirar: "dominada"}}), h = deMolde(mu.bloques, "habilidad")[0];
  ok(!h.camino && h.estrella === "muscle-up.dominadas-10", "desde la dominada, la estrella: " + JSON.stringify([h.ejercicio, h.camino]));
  const mu0 = deMolde(armarDia(["muscle-up"], {equipo: ["barra"]}).bloques, "habilidad")[0];
  ok(mu0.camino && mu0.nombre.startsWith("Camino a ") && mu0.pasos[0].ejercicio === "colgado-activo", "sin nivel, el camino: " + mu0.nombre);
  /* las estrellas que tu nivel da por hechas: la próxima es la que sigue */
  const d = deMolde(armarDia(["front-lever"], {equipo: ["barra"], dadas: ["front-lever.colgado-60s"]}).bloques, "habilidad")[0];
  ok(d.estrella === "front-lever.bolita-10s", "con el colgado dado, la bolita: " + d.estrella);
});
prueba("dia-rotacion", () => {
  /* cinco metas: dos por día, primero las que nunca tocaste (en el orden de tu rumbo), después la que hace más que no tocás */
  const r = ["front-lever", "planche", "una-pierna", "draco", "parada-de-manos"], equipo = ["barra", "pared"];
  let ss = []; const dias = [], fechas = ["2026-10-12", "2026-10-14", "2026-10-16", "2026-10-19", "2026-10-21", "2026-10-23"];
  for (const f of fechas){ const p = armarDia(r, {equipo, ss, hoy: f}); dias.push(deMolde(p.bloques, "habilidad").flatMap(b => b.constelaciones)); ss = [...ss, hechaDia("d" + f, f, p)]; }
  ok(dias[0].join() === "front-lever,planche", "el primer día, las dos primeras: " + dias[0]);
  ok(dias.slice(0, 3).flat().length >= 5 && r.every(id => dias.slice(0, 3).flat().includes(id)), "en tres días tocó todas: " + JSON.stringify(dias.slice(0, 3)));
  const cuenta = id => dias.flat().filter(x => x === id).length;
  ok(r.every(id => cuenta(id) >= 2 && cuenta(id) <= 3), "repartidas parejo en seis días: " + r.map(id => id + " " + cuenta(id)));
  /* lo de ayer no se repite si hay otra */
  const ayer = {id: "a", fecha: "2026-10-19", bloques: [{constelaciones: ["front-lever"], series: []}]};
  const p = armarDia(["front-lever", "planche"], {equipo, ss: [ayer]});
  ok(!deMolde(p.bloques, "habilidad").some(b => b.constelaciones.includes("front-lever")), "repitió front lever: " + deMolde(p.bloques, "habilidad").map(b => b.constelaciones));
  ok(deMolde(armarDia(["front-lever"], {equipo, ss: [ayer]}).bloques, "habilidad")[0].constelaciones.join() === "front-lever", "si es la única, va igual");
  /* el pie dice lo que viene */
  const q = armarDia(r, {equipo});
  ok(q.proxima.join() === "una-pierna,draco" && q.rotacion.join() === r.join(), "la próxima: " + q.proxima);
  /* la segunda no entrena lo mismo que la primera si la que sigue no: front lever y la dominada (las dos tiran) */
  const t = armarDia(["front-lever", "lastre", "planche"], {equipo: TODO, nivelDesde: {tirar: "dominada"}}), ht = deMolde(t.bloques, "habilidad");
  ok(ht.map(b => b.constelaciones.join()).join("|") === "front-lever|planche", "dos que tiran el mismo día: " + ht.map(b => b.constelaciones));
});
prueba("dia-rotacion-ventana", () => {
  /* colgado 50 s de 60: la ventana abre y la prueba es la habilidad del día, primero aunque no le toque */
  const ms = [{id: "x", estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 50, fecha: "2026-10-18"}];
  const ayer = {id: "a", fecha: "2026-10-17", bloques: [{constelaciones: ["front-lever"], series: []}]};
  const p = armarDia(["planche", "una-pierna", "front-lever"], {ms, ss: [ayer], equipo: ["barra"]}), h = deMolde(p.bloques, "habilidad");
  ok(h[0].prueba && h[0].series === 1 && h[0].objetivo === 60 && h[0].estrella === "front-lever.colgado-60s", "primero, la prueba: " + JSON.stringify(h[0]));
  ok(p.ventana.join() === "front-lever" && h.length === 2 && h[1].constelaciones.join() === "planche", "después, la que toca: " + h.map(b => b.constelaciones));
  ok(molde.ventana(cieloReal(ms), ["front-lever", "planche"], [], HOY).map(c => c.id).join() === "front-lever", "la ventana para una rutina");
});
prueba("dia-frecuencia", () => {
  ok(molde.frecuencia(5, 3) === 1.2 && molde.frecuencia(1, 3) === 3 && molde.frecuencia(2, 3) === 3 && molde.frecuencia(3, 3) === 2 && molde.frecuencia(6, 4) === 4 / 3, "frecuencia = min(D, 2D/n)");
  ok(molde.frecuencia(0, 3) === 0, "sin metas, cero");
  ok(molde.diasSemana({dias: [0, 2, 4]}, [], HOY) === 3, "tus días mandan");
  const ss = ["2026-09-25", "2026-09-29", "2026-10-02", "2026-10-06", "2026-10-09", "2026-10-13", "2026-10-15", "2026-10-19", "2026-10-19"].map((f, i) => ({id: "s" + i, fecha: f, bloques: []}));
  ok(molde.diasSemana({}, ss, HOY) === 2, "sin tus días, lo de las últimas 4 semanas: " + molde.diasSemana({}, ss, HOY));
  ok(molde.diasSemana({}, [], HOY) === 3, "sin nada, 3");
});
prueba("dia-equipo", () => {
  /* sin poste ni barra: la bandera y el front lever quedan afuera y se dice qué piden */
  const p = armarDia(["bandera", "front-lever", "planche"], {equipo: []}), ej = EJM();
  ok(p.pide.map(x => x.id + ":" + x.pide).join() === "bandera:poste,front-lever:barra", "lo que piden: " + JSON.stringify(p.pide));
  ok(deMolde(p.bloques, "habilidad").map(b => b.constelaciones.join()).join() === "planche", "la habilidad que sí podés");
  ok(ejsDia(p.bloques).every(e => !(ej[e]?.equipo || []).length), "un ejercicio pide equipo: " + ejsDia(p.bloques).filter(e => (ej[e]?.equipo || []).length));
  /* sin barra el tirón es el remo (en el poste, debajo de la mesa o con toalla) */
  ok(deMolde(p.bloques, "fuerza").some(b => b.pasos.some(x => x.escalera === "remo")), "sin barra no tira");
  /* sin barra, el segundo tirón no tiene escalera: los principales siguen de a dos */
  ok(deMolde(p.bloques, "fuerza").slice(0, 2).every(b => new Set(b.pasos.map(x => x.ejercicio)).size === 2), "un par quedó solo: " + deMolde(p.bloques, "fuerza").map(b => b.pasos.map(x => x.ejercicio)));
  /* nada de tu rumbo se puede: el día se arma igual, con fuerza (D2) */
  const s = armarDia(["bandera"], {equipo: []});
  ok(!deMolde(s.bloques, "habilidad").length && deMolde(s.bloques, "fuerza").length >= 2 && s.pide.length === 1, "solo con fuerza: " + s.bloques.map(b => b.molde));
  /* con rango en tu rumbo, va en su parte, la flexibilidad (vuelta 36: ya no toma el lugar de la habilidad) */
  const e = armarDia(["bandera", "espagat"], {equipo: []}), fe = deMolde(e.bloques, "flexibilidad");
  ok(!deMolde(e.bloques, "habilidad").length && fe[0]?.constelaciones?.join() === "espagat", "espagat en la flexibilidad: " + JSON.stringify(e.bloques.map(b => [b.molde, b.constelaciones])));
  /* el cierre: con rango en tu rumbo, la flexibilidad con la meta; si no, bici suave con bici; si no, posturas */
  const pu = armarDia(["planche", "puente"], {equipo: []}).bloques;
  ok(pu[pu.length - 1].molde === "flexibilidad" && deMolde(pu, "flexibilidad")[0].constelaciones.join() === "puente", "el final con puente");
  const cb = deMolde(armarDia(["planche"], {equipo: ["bici"]}).bloques, "cierre")[0];
  ok(cb.clase === "tramos" && cb.tramos[0].ejercicio === "bici" && cb.tramos[0].seg === 300, "con bici, 5 min suaves");
  const cp = deMolde(armarDia(["planche"], {equipo: []}).bloques, "cierre")[0];
  ok(cp.clase === "tramos" && cp.tramos.length === 3 && cp.tramos.every(t => t.clase === "postura" && t.seg === 40 && ej[t.ejercicio]), "sin bici, tres posturas: " + JSON.stringify(cp.tramos));
  ok(cp.tramos[0].ejercicio === "codos-atras", "la primera postura, por lo que empujó el día: " + cp.tramos[0].ejercicio);
});
prueba("dia-volviste", () => {
  const vieja = {id: "a", fecha: "2026-09-20", bloques: []};
  const ms = [{id: "x", estrella: "front-lever.colgado-60s", valor: 50, fecha: "2026-09-20"}];
  const p = armarDia(["front-lever", "muscle-up"], {ms, ss: [vieja], equipo: ["barra"]}), h = deMolde(p.bloques, "habilidad");
  /* 50 s: los sostenes irían a 35 s; al volver, al 70 % de eso. Sin ventana, aunque esté al 83 % */
  ok(p.volviste && !p.ventana.length && h[0].objetivo === 25 && !h[0].prueba, "al volver: " + JSON.stringify([h[0].objetivo, h[0].prueba]));
  ok(deMolde(p.bloques, "fuerza").every(b => b.pasos.every(x => x.descarga)), "la fuerza no va más liviana");
});
prueba("dia-semana-de-prueba", () => {
  const sem = ["2026-09-21", "2026-09-29", "2026-10-06", "2026-10-13"].map((f, i) => ({id: "s" + i, fecha: f, duracion: 600, bloques: []}));
  const ci = cielo.calcular(CAT, [], HOY, sem, ["barra"]), sp = plan.semanaDePrueba({}, sem, HOY);
  ok(sp.toca && sp.conPruebas, "toca la semana de prueba");
  const base = armarDia(["front-lever"], {ss: sem, equipo: ["barra"], descarga: true});
  const pd = molde.deSemanaDePrueba(base, sp, {cielo: ci, cons: ["front-lever"], sesiones: sem, equipo: ["barra"], ej: EJM(), hoy: HOY});
  ok(pd.bloques[0].molde === "entrada", "la entrada sigue adelante: " + pd.bloques.map(b => b.molde || (b.prueba ? "prueba" : b.hazana ? "hazaña" : "?")));
  ok(pd.bloques[1].prueba && pd.semanaPrueba.pruebas >= 1, "después, las pruebas");
  const fl = pd.bloques.find(b => b.constelacion === "front-lever" && !b.prueba), fl0 = deMolde(base.bloques, "habilidad")[0];
  ok(fl && fl.descarga && fl.series === Math.ceil(fl0.series / 2), "la habilidad, a la mitad");
  ok(deMolde(pd.bloques, "fuerza").every(b => b.pasos.every(x => x.descarga && x.n === 3) && b.pasos.length === 2 * new Set(b.pasos.map(x => x.ejercicio)).size), "la fuerza, a la mitad: " + deMolde(pd.bloques, "fuerza").map(b => b.pasos.length));
});
prueba("dia-sesiones-viejas", () => {
  /* una sesión del plan de antes (un bloque por constelación) cuenta para rotar */
  const vieja = {id: "a", fecha: "2026-10-18", bloques: [{constelacion: "front-lever", familia: "fu", series: [{estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 20}]}]};
  const p = armarDia(["front-lever", "planche", "una-pierna"], {ss: [vieja], equipo: ["barra"]});
  ok(deMolde(p.bloques, "habilidad").map(b => b.constelaciones.join()).join() === "planche,una-pierna", "front lever, hecho hace dos días, va después: " + deMolde(p.bloques, "habilidad").map(b => b.constelaciones));
  ok(molde.tocadas(vieja).has("front-lever"), "la sesión vieja no toca front lever");
  /* las series de una rutina mueven las escaleras del molde */
  const rut = {...deDia("r", "2026-10-15", "remo", "remo-invertido", [8, 8, 8], {rango: [5, 8]}), rutina: {id: "base_cali", sesion: 0}};
  /* (la dominada, hecha después, deja al remo como el tirón que más hace que no tocás) */
  const dom = deDia("t", "2026-10-16", "tirar", "dominada", [5, 5, 5], {rango: [5, 8]});
  ok(deMolde(armarDia(["planche"], {ss: [rut, dom], equipo: ["barra"]}).bloques, "fuerza").flatMap(b => b.pasos).some(x => x.ejercicio === "remo-invertido"), "el remo de la rutina no cuenta");
});
prueba("respaldo-rumbo-sin-tope", () => {
  const ids = CAT.constelaciones.map(c => c.id), arch = r => JSON.stringify({app: "kozmos", formato: 2, mediciones: [], sesiones: [], perfil: {rumbo: r}});
  const antes = ctx.K.CATALOGO; ctx.K.CATALOGO = CAT;
  try {
    ok(respaldo.leer(arch(ids.slice(0, 6))).perfil.rumbo?.length === 6, "seis metas no vuelven del respaldo");
    ok(respaldo.leer(arch(ids)).perfil.rumbo?.length === ids.length, "todo el catálogo no vuelve");
    ok(!respaldo.leer(arch([...ids, "otra"])).perfil.rumbo, "más metas que constelaciones");
  } finally { ctx.K.CATALOGO = antes; }
  /* las sesiones del molde vuelven enteras, con sus constelaciones */
  const s = {id: "m", fecha: HOY, duracion: 600, bloques: [{orden: 0, familia: "fu", molde: "habilidad", constelaciones: ["muscle-up", "un-brazo"], series: [{ejercicio: "dominada", tipo: "repeticiones", valor: 5, escalera: "tirar", rango: [5, 8], n: 3}]}]};
  const l = respaldo.leer(JSON.stringify({app: "kozmos", formato: 2, mediciones: [], sesiones: [s, {...s, id: "x", bloques: [{...s.bloques[0], constelaciones: "muscle-up"}]}], perfil: {}}));
  ok(l.sesiones.length === 1 && JSON.stringify(l.sesiones[0]) === JSON.stringify(s) && l.descartadas === 1, "la sesión del molde: " + JSON.stringify(l));
});
prueba("dia-serie-escalera", () => {
  /* lo que guarda cada serie mueve el escalón: el camino y la fuerza dicen escalera, rango y n; la estrella, solo su estrella */
  const p = armarDia(["muscle-up", "front-lever"], {equipo: ["barra"], nivelDesde: {tirar: "dominada-negativa"}});
  for (const b of p.bloques.filter(b => b.pasos)) ok(b.pasos.every(x => x.escalera && x.rango && x.n), "una serie de escalera sin escalera: " + b.molde);
  const st = deMolde(p.bloques, "habilidad").find(b => b.estrella);
  ok(st && !st.pasos && !st.escalera, "la estrella no lleva escalera");
  /* dos días al tope: el camino sube un escalón */
  const cam = () => deMolde(armarDia(["muscle-up"], {equipo: ["barra"], nivelDesde: {tirar: "dominada-asistida"}, ss, hoy: "2026-10-24"}).bloques, "habilidad")[0];
  let ss = [];
  const d0 = armarDia(["muscle-up"], {equipo: ["barra"], nivelDesde: {tirar: "dominada-asistida"}});
  ok(deMolde(d0.bloques, "habilidad")[0].pasos[0].ejercicio === "dominada-asistida", "arranca en la asistida");
  ss = [hechaDia("a", "2026-10-20", d0, {tope: true}), hechaDia("b", "2026-10-22", d0, {tope: true})];
  ok(cam().pasos[0].ejercicio === "dominada-negativa" && cam().pasos[0].nuevo === "sube", "no subió: " + cam().pasos[0].ejercicio);
});

/* ===== Tu nivel: cinco movimientos y cuatro niveles (vuelta 34; antes, cuatro preguntas por cantidad) ===== */
const TODO_EQ = ["barra", "paralelas", "pared", "poste", "lastre", "mancuernas", "kettlebell", "bici", "soga"];
prueba("nivel-desde", () => {
  /* cada movimiento, sus cuatro niveles (Inicial a Experto) y «No sé» al final; cada nivel es un ejercicio que existe */
  ok(nivel.PREGUNTAS.map(q => q.id).join() === "empujar,tirar,piernas,cadera,abdomen", "los movimientos: " + nivel.PREGUNTAS.map(q => q.id));
  ok(nivel.PREGUNTAS.every(q => q.opciones.map(o => o[1]).join() === "Inicial,Intermedio,Avanzado,Experto,No sé" && q.pregunta && q.niveles.every(n => n.texto && EJM()[n.ej])), "un movimiento sin sus cuatro niveles, su pregunta o su figura");
  /* la tabla conservadora (D1): cada nivel, el escalón de arranque de sus escaleras */
  const d = n => nivel.desde(n, TODO_EQ);
  ok(JSON.stringify(d({tirar: "0"})) === '{"tirar":"dominada-negativa","remo":"remo-poste"}', "tirar inicial: " + JSON.stringify(d({tirar: "0"})));
  ok(d({tirar: "1"}).tirar === "dominada" && d({tirar: "1"}).remo === "remo-invertido" && d({tirar: "2"}).tirar === "dominada-explosiva" && d({tirar: "3"}).tirar === "dominada-arquera" && d({tirar: "3"}).remo === "remo-un-brazo", "tirar");
  ok(JSON.stringify(d({empujar: "0"})) === '{"empujar":"flexion-inclinada","fondos":"flexion-cerrada","arriba":"flexion-pike"}' && d({empujar: "1"}).fondos === "fondo-banco" && d({empujar: "2"}).empujar === "flexion-declinada" && d({empujar: "3"}).empujar === "flexion-arquera", "empujar");
  ok(d({piernas: "1"}).piernas === "sentadilla-bulgara" && d({piernas: "3"}).piernas === "pistol" && d({cadera: "2"}).isquios === "curl-femoral-deslizante" && d({cadera: "3"}).isquios === "nordico-negativa", "piernas y atrás de las piernas");
  ok(d({abdomen: "0"}).lsit === "plancha" && d({abdomen: "2"}).lsit === "l-sit" && d({abdomen: "3"}).lsit === "v-sit", "abdomen");
  /* un movimiento no mueve las escaleras de otro: empujar ya no decide el abdomen */
  ok(!("lsit" in d({empujar: "3"})) && !("piernas" in d({cadera: "3"})), "un movimiento movió otra escalera");
  /* todos los escalones existen en su escalera */
  for (const q of nivel.PREGUNTAS) for (const [v] of q.opciones) for (const [esc, e] of Object.entries(d({[q.id]: v}))){
    const x = ESC.escaleras.find(y => y.id === esc); ok(x && x.pasos.some(p => rutina.idsPaso(p).includes(e)), `${q.id} ${v}: ${esc}/${e} no existe`);
  }
  /* sin el equipo del escalón, la escalera usa el de abajo que sí: el fondo sin paralelas es el fondo en banco */
  const ej = EJM();
  ok(rutina.escalonesTodos({ej, equipo: [], desde: d({empujar: "3"})}).fondos.paso.ejercicio === "fondo-banco", "sin paralelas, el fondo en banco");
  ok(rutina.escalonesTodos({ej, equipo: ["paralelas"], desde: d({empujar: "3"})}).fondos.paso.ejercicio === "fondo", "con paralelas, el fondo");
  /* sin barra no se pregunta por tirar, y lo que dijiste antes no cuenta */
  ok(nivel.preguntas([]).map(q => q.id).join() === "empujar,piernas,cadera,abdomen" && nivel.preguntas(null).length === 5, "los movimientos con tu equipo");
  ok(!nivel.desde({tirar: "3"}, []).tirar, "sin barra, tirar mueve algo");
});
prueba("nivel-dadas", () => {
  const dd = (n, eq = TODO_EQ) => nivel.dadas(n, eq);
  ok(dd({tirar: "0"}).length === 0, "inicial da algo");
  ok(dd({tirar: "1"}).join() === "front-lever.colgado-60s", "tirar intermedio: " + dd({tirar: "1"}));
  ok(dd({tirar: "2"}).join() === "front-lever.colgado-60s,muscle-up.dominadas-10,front-lever.bolita-10s", "tirar avanzado: " + dd({tirar: "2"}));
  ok(dd({tirar: "3"}).includes("un-brazo.dominadas-15") && dd({tirar: "3"}).length === 4, "tirar experto");
  ok(dd({empujar: "1"}).length === 0 && dd({empujar: "2"}).join() === "planche.flexiones-30" && dd({empujar: "3"}).join() === "planche.flexiones-30,un-brazo.flexiones-40", "empujar");
  ok(dd({piernas: "2"}).join() === "una-pierna.pistol-silla-5" && dd({piernas: "3"}).join() === "una-pierna.pistol-silla-5,una-pierna.pistol-3", "piernas");
  ok(dd({abdomen: "2"}).join() === "draco.lsit-10s" && dd({abdomen: "3"}).join() === "draco.lsit-10s,draco.lsit-20s" && dd({cadera: "3"}).length === 0, "abdomen y atrás de las piernas");
  /* todas existen en el catálogo */
  for (const q of nivel.PREGUNTAS) for (const [v] of q.opciones) for (const e of dd({[q.id]: v})) ok(ESTRELLAS.has(e), "no existe: " + e);
  ok(dd({tirar: "3"}, []).length === 0, "sin barra, tirar da algo");
  /* en tu cosmos se ven dadas, sin encender: lo encendido y los totales no cambian, la próxima es la que sigue */
  const c0 = cielo.calcular(CAT, [], HOY, [], TODO_EQ), c1 = nivel.aplicar(c0, dd({tirar: "2"}), {fecha: HOY});
  const fl = c1.constelaciones.find(c => c.id === "front-lever");
  ok(c1.encendidas === 0 && c1.total === c0.total && fl.encendidas === 0, "las dadas encendieron algo");
  ok(fl.dadas === 2 && fl.estrellas.filter(e => e.estado === "dada").map(e => e.id).join() === "front-lever.colgado-60s,front-lever.bolita-10s" && fl.estrellas.every(e => !e.dada || !e.encendida), "las dadas del front lever");
  ok(fl.proxima.id === "front-lever.tuck-10s" && fl.estrellas.find(e => e.id === "front-lever.tuck-10s").estado === "proxima", "la próxima: " + fl.proxima.id);
  ok(nivel.aplicar(c0, []) === c0, "sin dadas, el cosmos es el mismo");
  /* el día del motor usa la misma regla: K.dia.conDadas es K.nivel.efectiva */
  ok(molde.conDadas(c0.constelaciones.find(c => c.id === "front-lever"), ["front-lever.colgado-60s"]).proxima.id === "front-lever.bolita-10s", "conDadas y efectiva dicen distinto");
});
prueba("nivel-no-se", () => {
  /* «No sé» (o no contestar) es arrancar desde el principio: ni escalones ni dadas */
  const nose = {empujar: "nose", tirar: "nose", piernas: "nose", cadera: "nose", abdomen: "nose", fecha: HOY};
  ok(JSON.stringify(nivel.desde(nose, TODO_EQ)) === "{}" && nivel.dadas(nose, TODO_EQ).length === 0, "No sé movió algo");
  ok(JSON.stringify(nivel.desde(undefined, TODO_EQ)) === "{}" && nivel.dadas(null, TODO_EQ).length === 0, "sin nivel movió algo");
  /* una respuesta rara no cuenta y no se guarda; lo de antes no se guarda con la forma de antes */
  ok(JSON.stringify(nivel.desde({tirar: "9"}, TODO_EQ)) === "{}", "una respuesta rara cuenta");
  ok(nivel.poner({}, "tirar", "9", HOY).tirar === undefined && nivel.poner({}, "dominadas", "5-9", HOY).dominadas === undefined, "se guardó una respuesta rara");
  const n = nivel.poner(nivel.poner({}, "tirar", "1", "2026-10-01"), "empujar", "nose", HOY);
  ok(n.tirar === "1" && n.empujar === "nose" && n.fecha === HOY && nivel.respondidas(n) === 2 && nivel.respondidas(n, []) === 1, "poner: " + JSON.stringify(n));
  /* el día sin nivel es el mismo que con todo en No sé */
  const a = armarDia(["front-lever", "planche"], {equipo: ["barra"]}), b = armarDia(["front-lever", "planche"], {equipo: ["barra"], nivelDesde: nivel.desde(nose, ["barra"]), dadas: nivel.dadas(nose, ["barra"])});
  ok(JSON.stringify(a.bloques) === JSON.stringify(b.bloques), "No sé cambió el día");
});
prueba("nivel-de-antes", () => {
  /* lo guardado con las cuatro preguntas de antes se lee como movimientos, un escalón abajo ante la duda */
  ok(JSON.stringify(nivel.normal({dominadas: "5-9", flexiones: "30-39", unaPierna: "silla", vertical: "pared", fecha: "2026-10-01"})) === '{"tirar":"1","empujar":"2","abdomen":"2","piernas":"2","cadera":"1","fecha":"2026-10-01"}', "normal: " + JSON.stringify(nivel.normal({dominadas: "5-9", flexiones: "30-39", unaPierna: "silla", vertical: "pared", fecha: "2026-10-01"})));
  ok(nivel.desde({dominadas: "10-14"}, TODO_EQ).tirar === "dominada-explosiva" && nivel.desde({flexiones: "20-29"}, TODO_EQ).lsit === "hollow" && nivel.desde({unaPierna: "completa"}, TODO_EQ).piernas === "pistol", "lo de antes no mueve sus escaleras");
  /* lo dicho por movimiento manda sobre lo de antes; poner guarda la forma nueva */
  ok(nivel.normal({flexiones: "40+", empujar: "1"}).empujar === "1", "lo de antes ganó");
  const p = nivel.poner({dominadas: "15+", flexiones: "nose", fecha: "2026-10-01"}, "piernas", "1", HOY);
  ok(JSON.stringify(p) === `{"tirar":"3","empujar":"nose","piernas":"1","fecha":"${HOY}"}`, "poner sobre lo de antes: " + JSON.stringify(p));
  ok(nivel.valida("dominadas", "5-9") && nivel.valida("vertical", "libre") && nivel.valida("abdomen", "3") && !nivel.valida("abdomen", "4") && !nivel.valida("vertical", "3"), "valida");
});
prueba("nivel-confirma", () => {
  /* lo dado se confirma haciéndolo: si llegás, se enciende de verdad; un intento real que no llega le saca lo de dada */
  const dd = nivel.dadas({dominadas: "10-14"}, TODO_EQ), muDe = ms => nivel.aplicar(cielo.calcular(CAT, ms, HOY, [], TODO_EQ), dd, {fecha: "2026-10-15"}).constelaciones.find(c => c.id === "muscle-up");
  const mu = muDe([]);
  ok(mu.estrellas[0].estado === "dada" && mu.proxima.id === "muscle-up.fondo-ruso", "dada: " + mu.proxima.id);
  const m = (v, fecha = HOY) => ({id: "m" + v + fecha, estrella: "muscle-up.dominadas-10", ejercicio: "dominada", tipo: "repeticiones", valor: v, fecha, origen: "anotado"});
  const llego = muDe([m(11)]);
  ok(llego.encendidas === 1 && llego.estrellas[0].estado === "encendida" && !llego.dadas, "llegaste y no se encendió");
  const corto = muDe([m(7)]);
  ok(corto.encendidas === 0 && corto.estrellas[0].estado === "proxima" && corto.proxima.id === "muscle-up.dominadas-10" && !corto.dadas, "un intento corto no sacó lo de dada");
  /* un intento de antes de decir tu nivel no cuenta; las series de entrenamiento (sin la estrella) tampoco */
  ok(muDe([m(7, "2026-10-01")]).estrellas[0].estado === "dada", "un intento de antes sacó lo de dada");
  const serie = {id: "s", fecha: HOY, duracion: 900, bloques: [{familia: "fu", series: [{ejercicio: "dominada", tipo: "repeticiones", valor: 6, escalera: "tirar", rango: [5, 8], n: 3}]}]};
  const conSerie = nivel.aplicar(cielo.calcular(CAT, [], HOY, [serie], TODO_EQ), dd, {fecha: "2026-10-15"}).constelaciones.find(c => c.id === "muscle-up");
  ok(conSerie.estrellas[0].estado === "dada", "una serie de 6 dominadas sacó lo de dada");
  ok(JSON.stringify(nivel.activas(cielo.calcular(CAT, [m(7)], HOY, [], TODO_EQ), dd, {fecha: "2026-10-15"})) === '["front-lever.colgado-60s","front-lever.bolita-10s"]', "las activas");
  /* la semana de prueba prueba la próxima de verdad: la dada no se vuelve a probar */
  const c = nivel.aplicar(cielo.calcular(CAT, [], HOY, [], TODO_EQ), dd, {fecha: HOY});
  const pr = plan.deSemanaDePrueba({bloques: [], minutos: 0}, {conPruebas: true, bloque: 1}, {cielo: c, cons: ["muscle-up"], sesiones: [], equipo: TODO_EQ, ej: EJM(), hoy: HOY});
  ok(!pr.pruebas.estrellas.includes("muscle-up.dominadas-10"), "la semana de prueba prueba una dada: " + pr.pruebas.estrellas);
});
prueba("nivel-arrancas-en", () => {
  const ej = EJM(), eq = ["barra"], esc = n => rutina.escalonesTodos({ej, equipo: eq, desde: nivel.desde(n, eq)});
  const c0 = cielo.calcular(CAT, [], HOY, [], eq), mu = c0.constelaciones.find(c => c.id === "muscle-up");
  /* sin nivel, muscle-up arranca abajo en la escalera de tirar */
  const a = nivel.arrancasEn(mu, {escalones: esc(undefined), ej});
  ok(a.camino && a.ejercicio === "colgado-activo" && a.texto === "Arrancás en " + ej["colgado-activo"].nombre, "sin nivel: " + JSON.stringify(a));
  /* con 5 a 9 dominadas, ya estás en la dominada: arranca en la estrella */
  const b = nivel.arrancasEn(mu, {escalones: esc({dominadas: "5-9"}), ej});
  ok(!b.camino && b.estrella === "muscle-up.dominadas-10" && b.texto === "Arrancás en " + mu.proxima.nombre, "con 5 a 9: " + JSON.stringify(b));
  /* con 10 a 14, la dada corre la estrella */
  const c1 = nivel.aplicar(c0, nivel.dadas({dominadas: "10-14"}, eq), {fecha: HOY}), mu1 = c1.constelaciones.find(c => c.id === "muscle-up");
  const d = nivel.arrancasEn(mu1, {escalones: esc({dominadas: "10-14"}), ej});
  ok(mu1.proxima.id === "muscle-up.fondo-ruso" && d.texto === (d.camino ? "Arrancás en " + ej[d.ejercicio].nombre : "Arrancás en " + mu1.proxima.nombre), "con 10 a 14: " + JSON.stringify(d));
  ok(!d.texto.includes("·"), "el texto lleva «·»");
  /* lo que pide equipo que no marcaste no arranca en ningún lado */
  ok(nivel.arrancasEn(cielo.calcular(CAT, [], HOY, [], []).constelaciones.find(c => c.id === "muscle-up"), {escalones: {}, ej}) === null, "sin barra, muscle-up arranca");
});
prueba("respaldo-nivel", () => {
  /* tu nivel viaja en el respaldo; lo que no es una respuesta conocida queda afuera */
  const arch = n => JSON.stringify({app: "kozmos", formato: 2, mediciones: [], sesiones: [], perfil: {nivel: n}});
  const n = {dominadas: "5-9", flexiones: "nose", unaPierna: "silla", vertical: "pared", fecha: HOY};
  ok(JSON.stringify(respaldo.leer(arch(n)).perfil.nivel) === JSON.stringify(n), "tu nivel no vuelve: " + JSON.stringify(respaldo.leer(arch(n)).perfil));
  ok(JSON.stringify(respaldo.leer(arch({flexiones: "10-19"})).perfil.nivel) === '{"flexiones":"10-19"}', "una sola respuesta no vuelve");
  ok(!respaldo.leer(arch({dominadas: "mil"})).perfil.nivel, "una respuesta rara vuelve");
  /* el de ahora, por movimiento, también; un nivel que no existe, no */
  const m = {empujar: "2", tirar: "nose", abdomen: "3", fecha: HOY};
  ok(JSON.stringify(respaldo.leer(arch(m)).perfil.nivel) === JSON.stringify(m) && !respaldo.leer(arch({empujar: "4"})).perfil.nivel, "el nivel por movimiento no vuelve");
  ok(!respaldo.leer(arch({...n, otra: "x"})).perfil.nivel, "una pregunta que no existe vuelve");
  ok(!respaldo.leer(arch({...n, fecha: "2026-13-40"})).perfil.nivel, "una fecha rota vuelve");
  ok(!respaldo.leer(arch("5-9")).perfil.nivel && !respaldo.leer(arch(["5-9"])).perfil.nivel, "un nivel que no es un objeto vuelve");
  /* traerlo no pisa el que ya tenés */
  const l = respaldo.leer(arch(n));
  ok(respaldo.sumar({mediciones: [], sesiones: [], perfil: {nivel: {flexiones: "0-9"}}}, l).cuenta.perfil === 0, "pisó tu nivel");
});
/* boceto m25: un día de rutina en el molde de Hoy, con sus escaleras desde tu nivel */
prueba("rutina-en-molde", () => {
  const R = id => RUTINAS.find(([, x]) => x.id === id)[1], ej = EJM(), equipo = ["barra", "paralelas", "mancuernas"];
  const nd = nivel.desde({dominadas: "5-9", unaPierna: "silla"}, equipo);
  const sin = molde.deRutina(R("base_cali"), 0, {ej, equipo}), con = molde.deRutina(R("base_cali"), 0, {ej, equipo, nivelDesde: nd});
  const tirar = d => d.bloques.flatMap(b => b.pasos || []).find(x => x.escalera === "tirar").ejercicio;
  ok(tirar(sin) === "dominada-negativa" && tirar(con) === "dominada", "tu nivel no mueve el escalón de tirar de la rutina: " + tirar(sin) + " / " + tirar(con));
  ok(con.molde && JSON.stringify([...new Set(con.bloques.map(b => b.molde))]) === JSON.stringify(["entrada", "fuerza", "abdomen", "cierre"]), "la Base no va en el molde: " + con.bloques.map(b => b.molde));
  ok(con.bloques.filter(b => b.molde === "entrada").length === 1, "dos entradas en calor");
  /* lo hecho manda sobre el nivel */
  const s = [{id: "x", fecha: "2026-10-01", rutina: {id: "base_cali", sesion: 0}, bloques: [{series: [3, 3, 3].map(v => ({ejercicio: "dominada-negativa", tipo: "repeticiones", objetivo: 3, valor: v, escalera: "tirar", rango: [3, 5], n: 3}))}]}];
  ok(tirar(molde.deRutina(R("base_cali"), 1, {ej, equipo, sesiones: s, nivelDesde: nd})) === "dominada-negativa", "tu nivel pisa lo que hiciste");
  /* motor: un solo bloque (la sesión no cambia), en su parte */
  const c = molde.deRutina(R("c0a5"), 0, {ej, equipo});
  ok(c.bloques.length === 1 && c.bloques[0].molde === "motor" && c.minutos === rutina.deRutina(R("c0a5"), 0, {ej, equipo}).minutos, "Correr 5 km cambió su sesión");
  /* todas las rutinas arman sus días en el molde, con cada bloque en una parte */
  for (const [, r] of RUTINAS) for (let i = 0; i < r.sesiones.length; i++){ const d = molde.deRutina(r, i, {ej, equipo, nivelDesde: nd}); ok(d.bloques.every(b => b.molde), `${r.id} ${i}: un bloque sin parte`); }
});
prueba("rutina-minutos", () => {
  /* los minutos de la tarjeta de una rutina son los de sus días como los arma Hoy (con entrada en calor y cierre): a lo sumo 5 de diferencia
     con la mediana, con todo el equipo y sin historia (vuelta 33: la Base decía 50 y sus días daban 65) */
  const ej = EJM(), med = xs => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor((s.length - 1) / 2)]; };
  for (const [f, r] of RUTINAS){ const m = med(r.sesiones.map((_, i) => molde.deRutina(r, i, {ej, equipo: TODO}).minutos));
    ok(Math.abs(r.minutos - m) <= 5, `${f}: dice ${r.minutos} min y sus días dan ${m}`); }
});
prueba("dia-con-nivel", () => {
  /* el día con tu nivel: la fuerza arranca en tu escalón, el camino también, y las dadas corren la próxima */
  const eq = ["barra", "paralelas"], n = {dominadas: "10-14", flexiones: "30-39", unaPierna: "silla", fecha: HOY};
  const c0 = cielo.calcular(CAT, [], HOY, [], eq), dd = nivel.activas(c0, nivel.dadas(n, eq), {fecha: HOY});
  const p = molde.armar(nivel.aplicar(c0, dd, {fecha: HOY}), ["muscle-up", "front-lever", "una-pierna"], [], HOY, {ej: EJM(), equipo: eq, marcas: [], nivelDesde: nivel.desde(n, eq), dadas: dd});
  const hab = deMolde(p.bloques, "habilidad"), pasos = deMolde(p.bloques, "fuerza").flatMap(b => b.pasos);
  const esc = id => pasos.find(x => x.escalera === id)?.ejercicio;
  ok(!hab.some(b => (b.estrella || "").endsWith("dominadas-10") || b.estrella === "front-lever.colgado-60s" || b.estrella === "front-lever.bolita-10s"), "el día pide una dada: " + hab.map(b => b.estrella || b.nombre));
  ok(hab.some(b => b.constelaciones.includes("muscle-up")) ? hab.find(b => b.constelaciones.includes("muscle-up")).estrella !== "muscle-up.dominadas-10" : true, "muscle-up pide la dada");
  for (const [id, e] of [["fondos", "fondo"], ["empujar", "flexion-declinada"], ["piernas", "pistol-silla"], ["remo", "remo-invertido"], ["tirar", "dominada-explosiva"]])
    if (esc(id)) ok(esc(id) === e, `${id} arranca en ${esc(id)}, no en ${e}`);
  ok(pasos.length > 0 && ["fondos", "empujar", "remo", "tirar"].some(id => esc(id)), "sin fuerza de arriba");
  /* todo sigue entrando en el molde: sin repetidos y en la hora */
  ok(new Set(ejsDia(p.bloques)).size === ejsDia(p.bloques).length && p.minutos <= 60, "repetidos o más de una hora: " + p.minutos);
});

/* ===== Sin «·» (vuelta 30): nada de lo que se ve separa con un punto medio; se separa con jerarquía o con un dibujo =====
   Revisa el código de la app (sin sus comentarios) y todos los textos del catálogo. */
/* ===== Vuelta 32: zonas, grupos y niveles en el catálogo (Planes en estantes) ===== */
prueba("catalogo-zonas", () => {
  const Z = new Set(biblio.ZONAS.map(z => z[0])), ej = EJM(), val = (xs, q) => Array.isArray(xs) && xs.every(z => Z.has(z)) && new Set(xs).size === xs.length || `${q}`;
  ok(biblio.ZONAS.map(z => z[0]).join() === "espalda,pecho,hombros,brazos,abdomen,cadera,gluteos,piernas,corazon", "las nueve zonas, con corazón");
  for (const e of ESC.escaleras){
    ok(Array.isArray(e.zonas) && e.zonas.length && val(e.zonas) === true && val(e.apoyo || []) === true, `${e.id}: zonas o apoyo raros`);
    ok(!(e.apoyo || []).some(z => e.zonas.includes(z)), `${e.id}: una zona de lleno y de apoyo a la vez`);
  }
  for (const x of EJ.ejercicios){
    const z = biblio.zonasDe(x.id, ej);
    ok(z.zonas.length >= 1, `${x.id}: no dice qué trabaja (ni su escalera)`);
    ok(z.zonas.every(k => Z.has(k)) && z.apoyo.every(k => Z.has(k)), `${x.id}: una zona que no existe`);
    ok(!z.apoyo.some(k => z.zonas.includes(k)), `${x.id}: una zona de lleno y de apoyo a la vez`);
    ok(!x.apoyo || x.zonas, `${x.id}: apoyo sin zonas propias`);
    /* lo de una escalera lo dice la escalera: un ejercicio repite sus zonas solo si son otras */
    const en = caminos.enEscaleras(x.id)[0];
    ok(!(x.zonas && en && JSON.stringify(x.zonas) === JSON.stringify(en.e.zonas)), `${x.id}: repite las zonas de su escalera`);
  }
  /* lo de motor trabaja el corazón; lo de estirar no */
  for (const x of EJ.ejercicios) if (biblio.grupoDe(x.id, ej) === "motor") ok(biblio.zonasDe(x.id, ej).zonas.includes("corazon"), `${x.id}: motor sin corazón`);
  ok(!biblio.zonasDe("isquios-sentado", ej).zonas.includes("corazon") && biblio.zonasDe("dominada", ej).zonas.join() === "espalda,brazos", "las zonas de siempre");
  ok(biblio.zonasDe("munecas-dorso", ej).zonas.join() === "brazos", "un ejercicio dice lo suyo sobre lo de su escalera");
});
prueba("catalogo-grupos", () => {
  const G = new Set(biblio.GRUPOS.map(g => g[0])), ej = EJM();
  for (const x of EJ.ejercicios){
    ok(G.has(biblio.grupoDe(x.id, ej)), `${x.id}: sin grupo en la biblioteca`);
    ok(!x.grupo || G.has(x.grupo), `${x.id}: grupo raro ${x.grupo}`);
    /* el grupo se escribe solo donde el patrón no lo dice */
    ok(!x.grupo || !caminos.patronDe(x.id, ej).length, `${x.id}: dice su grupo y también su patrón`);
  }
  for (const [g] of biblio.GRUPOS) ok(EJ.ejercicios.filter(x => biblio.grupoDe(x.id, ej) === g).length >= 4, `${g}: casi vacío`);
});
prueba("catalogo-niveles", () => {
  for (const [f, r] of RUTINAS) ok([1, 2, 3].includes(r.nivel), `${f}: sin nivel de 1 a 3`);
  for (const n of [1, 2, 3]) ok(RUTINAS.filter(([, r]) => r.nivel === n).length >= 3, `pocas rutinas de nivel ${n}`);
  /* el nivel dice desde dónde conviene empezarla: lo de cero es inicial, lo de lastre y gimnasta, avanzado */
  const N = id => RUTINAS.find(([, r]) => r.id === id)[1].nivel;
  ok(N("prim_dom") === 1 && N("c0a5") === 1 && N("base_cali") === 1 && N("lastre") === 3 && N("gimnasta") === 3 && N("cien") === 2, "niveles al revés");
  const G = new Set(biblio.GRUPOS.map(g => g[0])), celdas = new Set();
  for (const h of HAZANAS.hazanas){
    ok([1, 2, 3].includes(h.nivel) && G.has(h.tema), `${h.id}: nivel o tema raros`);
    ok(!celdas.has(h.tema + h.nivel), `${h.id}: dos pruebas en el mismo lugar de la vitrina`); celdas.add(h.tema + h.nivel);
  }
  /* cada tema arranca en inicial; la vitrina no deja huecos a la izquierda */
  for (const t of biblio.vitrina(HAZANAS.hazanas)) ok(t.pruebas[0], `${t.id}: no tiene prueba inicial`);
  ok(biblio.vitrina(HAZANAS.hazanas).map(t => t.id).join() === "tirar,empujar,piernas,abdomen,movilidad,motor", "los temas de la vitrina");
});
prueba("hazanas-nuevas-escalas", () => {
  const H = id => HAZANAS.hazanas.find(h => h.id === id), mg = (id, vs) => vs.map(v => rutina.magnitud(H(id), v)).join();
  /* colgado con brazos flexionados (de 15 a 70 s), flexiones (ACSM), silla en un minuto, plancha, plancha de costado y 12 minutos corriendo */
  ok(mg("lira", [10, 15, 40, 70, 90]) === ",5,3,1,1", "mentón sobre la barra");
  ok(mg("cefeo", [4, 5, 17, 29]) === ",5,3,1", "flexiones seguidas");
  ok(mg("tauro", [24, 25, 40, 50, 60]) === ",5,3,2,1", "silla, un minuto");
  ok(mg("fenix", [20, 60, 125, 200]) === ",4,2,1", "plancha");
  ok(mg("cisne", [29, 45, 90]) === ",4,2", "plancha de costado");
  ok(mg("centauro", [1.5, 1.6, 2.2, 2.9]) === ",5,3,1", "12 minutos corriendo");
  const t = rutina.deHazana(H("tauro"), {ej: EJM()}).bloques[0];
  ok(t.ejercicio === "silla-minuto" && t.tipo === "repeticiones" && t.reloj === 60, "la silla: un minuto de reloj y anotás cuántas");
  const c = rutina.deHazana(H("centauro"), {ej: EJM()}).bloques[0];
  ok(c.tipo === "km" && c.reloj === 720, "Cooper: 12 minutos y anotás los km");
  /* ninguna se elige antes que las de siempre en la semana de prueba sin rumbo: las nuevas van al final del catálogo */
  ok(HAZANAS.hazanas.findIndex(h => h.id === "lira") > HAZANAS.hazanas.findIndex(h => h.id === "draco"), "las nuevas, al final");
});
prueba("biblio-rutina-hace", () => {
  const ej = EJM(), R = id => RUTINAS.find(([, r]) => r.id === id)[1], h = id => biblio.hace(R(id), {ej});
  ok(["espalda", "pecho", "brazos", "piernas"].every(z => h("base_cali").zonas[z] === 2), "Base: cuerpo entero, de lleno: " + JSON.stringify(h("base_cali").zonas));
  ok(h("c0a5").zonas.corazon === 2 && h("c0a5").zonas.piernas === 2 && !h("c0a5").zonas.pecho, "correr: corazón y piernas");
  ok(h("cadera").fuertes.includes("cadera") && !h("cadera").zonas.corazon, "cadera: la cadera");
  ok(h("tronco").fuertes.join() === "abdomen" || h("tronco").fuertes.includes("abdomen"), "abdomen firme: el abdomen");
  ok(h("cien").fuertes.includes("pecho") && h("prim_dom").fuertes.includes("espalda"), "flexiones y dominadas");
  for (const [f, r] of RUTINAS){ const x = biblio.hace(r, {ej});
    ok(x.fuertes.length >= 1 && x.ejs.length >= 1 && x.ejs.every(id => ej[id]), `${f}: no dice qué trabaja o un ejercicio no existe`); }
  /* en una escalera cuenta tu escalón: desde tu nivel, la dominada y no la negativa */
  const d = biblio.hace(R("base_cali"), {ej, nivelDesde: {tirar: "dominada"}});
  ok(d.ejs.includes("dominada") && !d.ejs.includes("dominada-negativa"), "no usa tu escalón: " + d.ejs.join());
  ok(JSON.stringify(biblio.pesoDe("dominada", ej)) === '{"hombros":1,"abdomen":1,"espalda":2,"brazos":2}', "el peso de un ejercicio");
});

prueba("sin-punto-medio", () => {
  const SRC = path.join(RAIZ, "src"), malos = [];
  const todos = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(x => x.isDirectory() ? todos(path.join(d, x.name)) : [path.join(d, x.name)]);
  for (const f of todos(SRC).filter(f => /\.(js|html|css|webmanifest)$/.test(f))){
    const sin = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*\/\/.*$/gm, "");
    sin.split("\n").forEach((l, i) => { if (/·/.test(l)) malos.push(`${path.relative(RAIZ, f)}: ${l.trim().slice(0, 90)}`); });
  }
  /* el catálogo: cada texto, en cualquier archivo */
  const textos = (v, donde) => typeof v === "string" ? (/·/.test(v) ? [`${donde}: ${v}`] : []) : v && typeof v === "object" ? Object.entries(v).flatMap(([k, x]) => textos(x, `${donde}.${k}`)) : [];
  const CATD = path.join(RAIZ, "catalogo");
  for (const f of [...fs.readdirSync(CATD).filter(f => f.endsWith(".json")).map(f => path.join(CATD, f)), ...fs.readdirSync(RUT_DIR).filter(f => f.endsWith(".json")).map(f => path.join(RUT_DIR, f))])
    malos.push(...textos(JSON.parse(fs.readFileSync(f, "utf8")), path.relative(RAIZ, f)));
  ok(!malos.length, `queda el «·» en ${malos.length} lugares: ${malos.slice(0, 8).join(" | ")}`);
  /* y los textos que arman las funciones puras tampoco lo traen */
  const ej = Object.fromEntries(EJ.ejercicios.map(e => [e.id, e]));
  for (const [f, r] of RUTINAS) for (let i = 0; i < r.sesiones.length; i++){
    const d = rutina.dia(r, i, {ej, equipo: ["barra", "paralelas", "mancuernas", "bici", "soga", "lastre"]});
    ok(!/·/.test(JSON.stringify([d.nombre, d.filas])), `${f}: día ${i}: ${JSON.stringify([d.nombre, d.filas])}`);
  }
  ok(rutina.serie(["4", "4", "4"]) === "3 × 4" && rutina.serie(["11", "11", "10"]) === "11\u200211\u200210", "los números en fila: " + rutina.serie(["11", "11", "10"]));
});

let fallas = 0;
/* el árbol de la bienvenida (vuelta 36): una muestra de los caminos contra el motor de verdad, con lo que cada uno tiene que dar
   (el tiempo que elegiste, cinco menos como mucho; una parte por cosa elegida y la primera pesa más; nada que pida equipo que
   no tenés; nada repetido; la flexibilidad al final). El árbol entero: node kozmos/pruebas/arbol.mjs */
const arbol = await import("./arbol.mjs");
prueba("arbol-caminos", () => {
  const K = arbol.cargar(), eqs = [[], ["pared"], ["barra", "paralelas"], ["mancuernas"], ["kettlebell", "soga"], ["bici"], ["discos", "banco", "maquinas"], ["maquinas"], ["anillas", "remadora"], arbol.TODO];
  const mal = [];
  for (const c of arbol.casos({eqs, niveles: ["mezclado", "experto"]})){ const m = arbol.revisar(K, c, arbol.dia(K, c)); if (m.length) mal.push(JSON.stringify(c) + " " + m); }
  ok(!mal.length, `${mal.length} caminos fallan: ${mal.slice(0, 3).join(" | ")}`);
});
prueba("arbol-formas", () => {
  /* cómo te gusta entrenar orienta la resistencia y la flexibilidad: con qué es el motor y su meta, y las posturas de yoga */
  const K = arbol.cargar(), todo = arbol.TODO, nombres = p => p.bloques.filter(b => b.molde === "resistencia").map(b => b.nombre || b.ejercicio);
  const con = f => arbol.dia(K, {que: ["mo"], eq: todo, min: 40, formas: [f]});
  ok(nombres(con("correr")).includes("Trote y caminata"), "correr: " + nombres(con("correr")));
  ok(nombres(con("bici")).some(n => /bici/i.test(n)), "bici: " + nombres(con("bici")));
  ok(nombres(con("soga")).includes("Soga a intervalos"), "soga: " + nombres(con("soga")));
  ok(nombres(con("rusas")).includes("Kettlebell a intervalos"), "pesas rusas: " + nombres(con("rusas")));
  ok(con("soga").bloques.find(b => b.molde === "resistencia").constelaciones?.join() === "soga", "la meta de soga primero");
  const y = arbol.dia(K, {que: ["ra"], eq: [], min: 20, formas: ["yoga"]}).bloques.find(b => b.nombre === "Secuencia de posturas");
  ok(y && y.tramos[0].ejercicio === "gato-camello" && y.tramos.every(t => t.seg >= 60), "yoga: " + JSON.stringify(y?.tramos?.slice(0, 2)));
});
prueba("arbol-turnos", () => {
  /* con poco tiempo para todo, una o dos cosas por día y se turnan: lo que viene más atrasado contra su parte, primero */
  const K = arbol.cargar(), r = K.dia.reparto(["fu", "mo", "ra"], 20);
  ok(r.partes.length === 1 && r.partes[0].f === "fu" && r.alterna.join() === "mo,ra", "20 min, el primer día: " + JSON.stringify(r));
  const hecha = f => ({id: f, fecha: "2026-10-23", bloques: [{familia: f, molde: f === "fu" ? "fuerza" : "resistencia"}]});
  ok(K.dia.hoyVan(["fu", "mo"], 15, [hecha("fu")], "2026-10-24").join() === "mo", "después de fuerza, resistencia");
  ok(K.dia.reparto(["mo", "fu"], 30).partes.map(x => x.f + x.minutos).join() === "mo15,fu10", "60 y 40, en el orden elegido: " + JSON.stringify(K.dia.reparto(["mo", "fu"], 30)));
  ok(K.dia.reparto(["fu", "mo", "ra"], 50).partes.map(x => x.minutos).join() === "23,14,8", "50, 30 y 20: " + JSON.stringify(K.dia.reparto(["fu", "mo", "ra"], 50)));
});

for (const [n, fn] of PRUEBAS){
  try { fn(); console.log("ok    ", n); } catch (e) { fallas++; console.log("FALLA ", n, "·", e.message); }
}
console.log(fallas ? `FALLAN ${fallas} sin pantalla` : `TODO OK sin pantalla · ${PRUEBAS.length} pruebas`);
process.exitCode = fallas ? 1 : 0;
