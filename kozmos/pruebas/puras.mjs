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
const {cielo} = ctx.K;

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

let fallas = 0;
for (const [n, fn] of PRUEBAS){
  try { fn(); console.log("ok    ", n); } catch (e) { fallas++; console.log("FALLA ", n, "·", e.message); }
}
console.log(fallas ? `FALLAN ${fallas} sin pantalla` : `TODO OK sin pantalla · ${PRUEBAS.length} pruebas`);
process.exitCode = fallas ? 1 : 0;
