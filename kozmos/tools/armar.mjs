// Arma Kozmos en una carpeta lista para publicar: junta los módulos de src/ en un solo index.html,
// copia el service worker con su versión, el manifiesto, la letra y los íconos.
// Uso: node kozmos/tools/armar.mjs [carpeta]   (por defecto kozmos/app)
import fs from "node:fs";
import path from "node:path";
import {execSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(RAIZ, "src");
const D = path.resolve(process.argv[2] || path.join(RAIZ, "app"));

/* el orden importa: primero la base, después las piezas, las pantallas y el arranque */
const CSS = ["base/letra.css", "base/tokens.css", "base/base.css", "piezas/nav.css", "piezas/encabezado.css", "piezas/menu.css",
  "piezas/deshacer.css", "piezas/isla.css", "piezas/ajustes.css", "piezas/horizontal.css", "pantallas/pantallas.css", "pantallas/cielo.css", "pantallas/hoy.css", "pantallas/progreso.css", "pantallas/rutinas.css"];
const JS = ["base/base.js", "piezas/nav.js", "piezas/encabezado.js", "piezas/menu.js", "piezas/deshacer.js", "piezas/isla.js",
  "cielo/cielo.js", "cielo/dibujo.js", "diario/diario.js", "diario/respaldo.js", "sesion/plan.js", "sesion/rutina.js", "sesion/calorias.js", "sesion/motor.js",
  "pantallas/pantallas.js", "pantallas/cielo.js", "pantallas/hoy.js", "pantallas/rutinas.js", "app.js"];

/* versión: «k-abc1234» por commit (o «k-abc1234+cambios»); KOZMOS_V la fuerza a mano */
function version(){
  if (process.env.KOZMOS_V) return process.env.KOZMOS_V;
  const git = c => execSync("git " + c, {cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"]}).toString().trim();
  /* con cambios sin guardar, la versión lo dice: así dos armados distintos nunca se llaman igual */
  try { return "k-" + git("rev-parse --short=7 HEAD") + (git("status --porcelain -- .") ? "+cambios" : ""); }
  catch (e) { return "k-dev"; }
}
const leer = f => fs.readFileSync(path.join(SRC, f), "utf8");
const V = version();
const css = CSS.map(leer).join("\n");
const js = JS.map(leer).join("\n").replace('K.VERSION = "dev";', `K.VERSION = ${JSON.stringify(V)};`);
if (!js.includes(`K.VERSION = ${JSON.stringify(V)}`)) throw new Error("no encuentro K.VERSION en base.js");
/* el catálogo viaja dentro de la página: así abre sin conexión y sin pedir nada más */
const cat = f => JSON.stringify(JSON.parse(fs.readFileSync(path.join(RAIZ, "catalogo", f), "utf8"))).replace(/</g, "\\u003c");
/* las rutinas, una por archivo, en el orden de sus familias y por nombre */
const RUT = path.join(RAIZ, "catalogo", "rutinas");
const rutinas = (fs.existsSync(RUT) ? fs.readdirSync(RUT).filter(f => f.endsWith(".json")).sort() : []).map(f => JSON.parse(fs.readFileSync(path.join(RUT, f), "utf8")));
const ORDEN = {fu: 0, ra: 1, mo: 2};
rutinas.sort((a, b) => (ORDEN[a.familia] ?? 9) - (ORDEN[b.familia] ?? 9) || a.nombre.localeCompare(b.nombre, "es"));
const hz = fs.existsSync(path.join(RAIZ, "catalogo", "hazanas.json")) ? cat("hazanas.json") : '{"version":1,"hazanas":[]}';
const js2 = js.replace('K.VERSION = ', () => `K.CATALOGO = ${cat("constelaciones.json")};\nK.EJERCICIOS = ${cat("ejercicios.json")};\nK.RUTINAS = ${JSON.stringify(rutinas).replace(/</g, "\\u003c")};\nK.HAZANAS = ${hz};\nK.VERSION = `);
const html = leer("plantilla.html").replace("/*CSS*/", () => css).replace("/*JS*/", () => js2);

fs.rmSync(D, {recursive: true, force: true});
fs.mkdirSync(D, {recursive: true});
fs.writeFileSync(path.join(D, "index.html"), html);
const sw = leer("sw.js");
if (!/const VERSION = "[^"]*"/.test(sw)) throw new Error("no encuentro VERSION en sw.js");
fs.writeFileSync(path.join(D, "sw.js"), sw.replace(/const VERSION = "[^"]*"/, `const VERSION = ${JSON.stringify(V.replace(/[^\w.+-]+/g, "-"))}`));
fs.copyFileSync(path.join(SRC, "manifest.webmanifest"), path.join(D, "manifest.webmanifest"));
for (const d of ["fuentes", "iconos"]) fs.cpSync(path.join(RAIZ, d), path.join(D, d), {recursive: true});
console.log(`armado ${path.relative(process.cwd(), D) || "."} · versión ${V} · ${(Buffer.byteLength(html) / 1024).toFixed(1)} kB`);
