// El árbol de la bienvenida: cada camino (qué entrenás y en qué orden, con qué, cuánto tiempo, tu nivel y cómo te gusta
// entrenar) contra el motor de verdad, y lo que cada camino tiene que dar. Lo usan las pruebas sin pantalla (una muestra)
// y, entero, node kozmos/pruebas/arbol.mjs [salida.json]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const leer = f => JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", f), "utf8"));
export function cargar(){
  const ctx = {K: {}}; vm.createContext(ctx);
  for (const f of ["cielo/cielo.js", "sesion/plan.js", "sesion/rutina.js", "sesion/caminos.js", "sesion/nivel.js", "sesion/dia.js"])
    vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", f), "utf8"), ctx);
  const K = ctx.K, EJ = leer("ejercicios.json");
  K.ESCALERAS = leer("escaleras.json"); K.ENTRADAS = leer("entradas.json"); K.HAZANAS = leer("hazanas.json");
  const RD = path.join(RAIZ, "catalogo", "rutinas");
  K.RUTINAS = fs.readdirSync(RD).filter(f => f.endsWith(".json")).map(f => JSON.parse(fs.readFileSync(path.join(RD, f), "utf8")));
  K.EJ = Object.fromEntries((EJ.ejercicios || EJ).map(e => [e.id, e]));
  K.CAT = leer("constelaciones.json");
  return K;
}

/* lo mismo que arma la bienvenida: dos o tres metas por cosa elegida, las que tu equipo permite */
export const RUMBO = {fu: ["planche", "un-brazo", "parada-de-manos", "draco", "una-pierna", "front-lever", "muscle-up", "bandera"], mo: ["diez-km", "motor", "soga"], ra: ["espagat", "puente"]};
export const NIV = {inicial: {empujar: "0", tirar: "0", piernas: "0", cadera: "0", abdomen: "0"}, experto: {empujar: "3", tirar: "3", piernas: "3", cadera: "3", abdomen: "3"},
  mezclado: {empujar: "2", tirar: "0", piernas: "1", cadera: "3", abdomen: "1"}, nose: {empujar: "nose", tirar: "nose", piernas: "nose", cadera: "nose", abdomen: "nose"}};
export const CONOCE = ["barra", "paralelas", "pared", "poste", "lastre", "mancuernas", "kettlebell", "bici", "soga"];
export const QUE = [["fu"], ["mo"], ["ra"], ["fu", "mo"], ["mo", "fu"], ["fu", "ra"], ["ra", "fu"], ["mo", "ra"], ["ra", "mo"], ["fu", "mo", "ra"], ["mo", "fu", "ra"], ["ra", "mo", "fu"]];
export const MINUTOS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
const HOY = "2026-10-24";

export function dia(K, {que, eq, min, niv = null, formas = []}){
  const conP = K.rutina.conPesa(eq), tengo = new Set([...conP, "pared"]);
  const puede = id => { const c = K.CAT.constelaciones.find(k => k.id === id); return c && (c.estrellas[0].equipo || []).every(e => tengo.has(e)); };
  const rumbo = que.flatMap(f => RUMBO[f].filter(puede).slice(0, que.length > 1 ? 2 : 3));
  const n = niv && que.includes("fu") ? {...NIV[niv], fecha: HOY} : null;
  if (n && !eq.includes("barra")) delete n.tirar;
  const c0 = K.cielo.calcular(K.CAT, [], HOY, [], conP), dadas = n ? K.nivel.activas(c0, K.nivel.dadas(n, conP), {fecha: HOY}) : [];
  const cielo = n ? K.nivel.aplicar(c0, dadas, {fecha: HOY}) : c0;
  return K.dia.armar(cielo, rumbo, [], HOY, {ej: K.EJ, equipo: conP, marcas: [], nivelDesde: n ? K.nivel.desde(n, conP) : undefined, dadas, minutos: min, enfoque: que, formas});
}

/* lo que cada camino tiene que dar; devuelve los problemas (vacío si está bien) */
const PARTE = {fu: ["habilidad", "fuerza", "abdomen"], mo: ["resistencia"], ra: ["flexibilidad"]};
export function revisar(K, caso, p){
  const mal = [], ejs = b => K.dia.ejerciciosDe(b), tengo = new Set([...K.rutina.conPesa(caso.eq), "pared"]);
  /* el tiempo: lo que elegiste, cinco minutos menos como mucho */
  if (p.minutos > caso.min || p.minutos < caso.min - 5) mal.push(`tiempo ${p.minutos} de ${caso.min}`);
  /* cada cosa que va hoy tiene su parte, y nada de lo que no elegiste */
  const van = p.partes;
  for (const f of van) if (!p.bloques.some(b => PARTE[f].includes(b.molde))) mal.push(`sin ${f}`);
  for (const f of ["fu", "mo", "ra"]) if (!van.includes(f) && p.bloques.some(b => PARTE[f].includes(b.molde))) mal.push(`${f} sin pedirlo`);
  if (!van.length || van.some(f => !caso.que.includes(f))) mal.push("partes " + van);
  /* lo primero que elegiste pesa más */
  const seg = f => p.bloques.filter(b => PARTE[f].includes(b.molde)).reduce((t, b) => t + K.dia.minutosDe([b]), 0);
  for (let i = 1; i < van.length; i++) if (van[i] !== "ra" && seg(van[i]) > seg(van[i - 1]) + 5) mal.push(`${van[i]} pesa más que ${van[i - 1]}`);
  /* nada que pida equipo que no tenés, y nada repetido (la entrada en calor no cuenta) */
  const todos = p.bloques.filter(b => b.molde !== "entrada").flatMap(ejs);
  const falta = [...new Set(todos.flatMap(e => (K.EJ[e]?.equipo || []).filter(q => !tengo.has(q))))];
  if (falta.length) mal.push("falta " + falta);
  const rep = [...new Set(todos.filter((e, i) => todos.indexOf(e) !== i))].filter(e => !p.bloques.some(b => b.molde === "resistencia" && ejs(b).includes(e)));
  if (rep.length) mal.push("repite " + rep);
  /* la flexibilidad, al final */
  if (van.includes("ra") && p.bloques[p.bloques.length - 1].molde !== "flexibilidad") mal.push("flexibilidad no cierra");
  return mal;
}

export function* casos({eqs = null, niveles = Object.keys(NIV), minutos = MINUTOS, ques = QUE} = {}){
  const EQS = eqs || Array.from({length: 512}, (_, k) => CONOCE.filter((_, i) => k >> i & 1));
  for (const que of ques) for (const nv of (que.includes("fu") ? niveles : [null])) for (const eq of EQS) for (const min of minutos) yield {que, eq, min, niv: nv};
}

if (process.argv[1] === fileURLToPath(import.meta.url)){
  const K = cargar(), out = [], cuenta = {};
  let n = 0;
  for (const c of casos()){
    let p, mal;
    try { p = dia(K, c); mal = revisar(K, c, p); } catch (e) { mal = ["error " + e.message]; }
    n++;
    for (const m of mal){ const k = m.replace(/[0-9]+/g, "#"); cuenta[k] = (cuenta[k] || 0) + 1; if (out.length < 4000) out.push({...c, mal}); }
  }
  console.log(n, "caminos");
  console.log(Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 40));
  if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(out));
}
