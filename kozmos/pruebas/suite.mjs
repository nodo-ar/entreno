// Pruebas de la etapa 1 de Kozmos: arma la app, la sirve en un puerto local y la recorre con Playwright.
// Uso: node kozmos/pruebas/suite.mjs [nombre ...]   (sin nombres corre todas)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const require = createRequire(import.meta.url);
const {chromium} = require("playwright");
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(RAIZ, "app");
execFileSync(process.execPath, [path.join(RAIZ, "tools", "armar.mjs"), APP], {stdio: "inherit"});

/* servidor mínimo: el service worker necesita http */
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml"};
let MODO = ""; /* "portal": la página redirige a otra (wifi con ingreso) · "caido": la página contesta 503 */
const srv = http.createServer((q, r) => {
  const ruta = new URL(q.url, "http://x").pathname;
  if (ruta === "/portal.html"){ r.writeHead(200, {"content-type": "text/html; charset=utf-8"}); r.end("<title>Portal</title><h1>Ingresá al wifi</h1>"); return; }
  if (ruta === "/" || ruta === "/index.html"){
    if (MODO === "portal"){ r.writeHead(302, {location: "/portal.html"}); r.end(); return; }
    if (MODO === "caido"){ r.writeHead(503); r.end("caído"); return; }
  }
  let f = decodeURIComponent(new URL(q.url, "http://x").pathname); if (f.endsWith("/")) f += "index.html";
  const p = path.join(APP, f);
  if (!p.startsWith(APP) || !fs.existsSync(p)){ r.writeHead(404); r.end(); return; }
  r.writeHead(200, {"content-type": TIPOS[path.extname(p)] || "application/octet-stream", "cache-control": "no-cache"}); fs.createReadStream(p).pipe(r);
});
await new Promise(ok => srv.listen(0, "127.0.0.1", ok));
const URL0 = `http://127.0.0.1:${srv.address().port}/`;

const b = await chromium.launch();
const PRUEBAS = [];
const prueba = (nombre, fn) => PRUEBAS.push([nombre, fn]);
const ok = (c, m) => { if (!c) throw new Error(m); };
async function pagina(vp = {width: 390, height: 844}, extra = {}){
  const ctx = await b.newContext({viewport: vp, ...extra});
  const p = await ctx.newPage(); p._errores = [];
  p.on("pageerror", e => p._errores.push(String(e)));
  p.on("console", m => { if (m.type() === "error") p._errores.push(m.text()); });
  return {ctx, p};
}
const ir = async (p, h) => { await p.goto(URL0 + h); await p.waitForSelector("main.view"); await p.waitForTimeout(80); };

prueba("arranca-sin-errores", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "");
  ok(await p.textContent(".enc-tit h1") === "Hoy", "no arranca en Hoy");
  ok(await p.evaluate(() => document.fonts.ready.then(() => document.fonts.check('800 16px "Mona Sans"') && document.fonts.check('16px "Geist Mono"'))), "la letra propia no cargó");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("cuatro-pestanas", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "");
  for (const [tab, titulo] of [["cielo", "Cielo"], ["progreso", "Progreso"], ["vos", "Vos"], ["hoy", "Hoy"]]){
    await p.click(`nav.barra button[data-tab="${tab}"]`);
    await p.waitForSelector(`main.view[data-tab="${tab}"]`);
    const h = await p.$$eval(".enc-tit h1", hs => hs.filter(h => h.offsetParent).map(h => h.textContent));
    ok(h[0] === titulo, `${tab}: título ${h[0]}`);
    ok(await p.getAttribute(`nav.barra button[data-tab="${tab}"]`, "aria-current") === "page", `${tab}: la barra no la marca`);
    ok(await p.$$eval('nav.barra [aria-current="page"]', x => x.length) === 1, "más de una pestaña marcada");
  }
  /* el indicador termina debajo de la pestaña elegida */
  await p.waitForTimeout(600);
  const d = await p.evaluate(() => { const i = document.querySelector("nav.barra .ind").getBoundingClientRect(), b = document.querySelector('nav.barra [aria-current="page"]').getBoundingClientRect(); return Math.abs(i.left - b.left) + Math.abs(i.width - b.width); });
  ok(d < 2, "el indicador no coincide con la pestaña: " + d);
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sin-desborde-360", async () => {
  const {ctx, p} = await pagina({width: 360, height: 740});
  for (const h of ["#/hoy", "#/cielo", "#/progreso", "#/vos", "#/vos/acerca", "#/vos/constructor", "#/xyz"]){
    await ir(p, h);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(w <= 360, `${h}: ancho ${w}`);
  }
  await ctx.close();
});

prueba("encabezado-compacto", async () => {
  const {ctx, p} = await pagina({width: 390, height: 360});
  await ir(p, "#/cielo");
  ok(!(await p.evaluate(() => document.body.classList.contains("compacto"))), "arranca compacto");
  await p.mouse.wheel(0, 260); await p.waitForFunction(() => document.body.classList.contains("compacto"));
  ok(await p.textContent("#tbt") === "Cielo", "la barra compacta no dice Cielo");
  await p.mouse.wheel(0, -600); await p.waitForFunction(() => !document.body.classList.contains("compacto"));
  /* las acciones del encabezado (acá, volver) siguen a la vista al desplazar */
  await p.setViewportSize({width: 390, height: 300});
  await ir(p, "#/vos/acerca");
  await p.mouse.wheel(0, 400); await p.waitForTimeout(250);
  const r = await p.evaluate(() => { const b = [...document.querySelectorAll('.enc-acc [data-ir="#/vos"]')].find(x => x.offsetParent).getBoundingClientRect(); return [b.top, b.bottom, scrollY]; });
  ok(r[2] > 0, "Acerca no se desplazó");
  ok(r[0] >= 0 && r[1] <= 300, "volver se fue de la pantalla: " + r);
  await ctx.close();
});

prueba("menu-y-deshacer", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/vos");
  await p.click("#tema-menu");
  await p.waitForSelector('.pop[role="menu"]');
  ok(await p.getAttribute("#tema-menu", "aria-expanded") === "true", "la fila no dice que el menú está abierto");
  ok(await p.evaluate(() => document.activeElement.getAttribute("aria-checked")) === "true", "el foco no arranca en lo elegido");
  await p.keyboard.press("ArrowDown");
  ok(await p.evaluate(() => document.activeElement.dataset.id) === "light", "la flecha no baja");
  await p.keyboard.press("Escape");
  await p.waitForFunction(() => !document.querySelector(".pop:not(.out)"));
  ok(await p.evaluate(() => document.activeElement.id) === "tema-menu", "el foco no vuelve a la fila");
  /* elegir Oscuro: se aplica sin preguntar, el foco queda en la fila y se puede deshacer */
  await p.click("#tema-menu"); await p.click('.pmi[data-id="dark"]');
  ok(await p.getAttribute("html", "data-theme") === "dark", "no pasó a oscuro");
  ok(await p.evaluate(() => document.activeElement.id) === "tema-menu", "después de elegir, el foco se pierde");
  ok((await p.textContent("#tema-menu em")) === "Oscuro", "la fila no muestra el tema nuevo");
  await p.waitForSelector(".utoast");
  ok((await p.textContent(".utoast .utx")).includes("oscuro"), "el aviso no dice qué cambió");
  /* abrir y cerrar otro menú con Escape no se lleva el deshacer */
  await p.click("#tema-menu"); await p.keyboard.press("Escape");
  ok(await p.$(".utoast:not(.out)"), "Escape en el menú borró el deshacer");
  await p.click(".utoast .utu");
  ok(await p.getAttribute("html", "data-theme") === null, "deshacer no volvió a automático");
  ok(await p.evaluate(() => K.tema.actual()) === "auto", "deshacer no guardó automático");
  /* el aviso se va solo, salvo mientras lo tenés en foco */
  await p.evaluate(() => { K.DESHACER_MS = 400; });
  await p.click("#tema-menu"); await p.click('.pmi[data-id="light"]');
  await p.waitForSelector(".utoast"); await p.focus(".utoast .utu"); await p.waitForTimeout(700);
  ok(await p.$(".utoast:not(.out)"), "el deshacer se fue mientras estaba en foco");
  await p.focus("#tema-menu");
  await p.waitForFunction(() => !document.querySelector(".utoast"), null, {timeout: 2000});
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("tema-queda-guardado", async () => {
  const {ctx, p} = await pagina(undefined, {colorScheme: "light"});
  await ir(p, "#/vos");
  await p.click("#tema-menu"); await p.click('.pmi[data-id="dark"]');
  await p.reload(); await p.waitForSelector("main.view");
  ok(await p.getAttribute("html", "data-theme") === "dark", "el tema no quedó guardado");
  const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  ok(bg === "rgb(17, 17, 16)", "el fondo oscuro no es el de la dirección B: " + bg);
  await ctx.close();
});

prueba("horizontal", async () => {
  const {ctx, p} = await pagina({width: 844, height: 390});
  await ir(p, "#/vos");
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("nav.barra")).flexDirection) === "column", "la barra no pasa a riel");
  const vis = () => p.evaluate(() => ["lado", "abierto"].map(c => !!document.querySelector(".split>." + c).offsetParent));
  ok((await vis()).every(Boolean), "Vos no muestra lista y ajuste juntos");
  /* abrir otro ajuste no mueve la lista ni anima la pantalla */
  const antes = await p.evaluate(() => document.querySelector(".split>.lado .aj").getBoundingClientRect().top);
  const pasos = await p.evaluate(() => history.length);
  await p.click('.ajr[data-ir="#/vos/acerca"]');
  await p.waitForFunction(() => document.querySelector(".split>.abierto h1")?.textContent === "Acerca de Kozmos");
  ok(!(await p.evaluate(() => /vt-/.test(document.querySelector("main.view").className))), "la pantalla se animó");
  ok(await p.evaluate(() => document.querySelector(".split>.abierto h1").textContent) === "Acerca de Kozmos", "no abrió Acerca");
  const desp = await p.evaluate(() => document.querySelector(".split>.lado .aj").getBoundingClientRect().top);
  ok(Math.abs(desp - antes) < 1, "la lista se movió");
  ok(await p.evaluate(() => history.length) === pasos, "abrir un ajuste en horizontal sumó un paso al botón atrás");
  /* los dos títulos quedan alineados */
  const tops = await p.evaluate(() => [...document.querySelectorAll(".split h1")].map(h => Math.round(h.getBoundingClientRect().top)));
  ok(tops.length === 2 && Math.abs(tops[0] - tops[1]) <= 1, "los títulos de los dos paneles no se alinean: " + tops);
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 844, "desborde en horizontal");
  /* girar: vertical en un ajuste → horizontal muestra los dos paneles */
  await p.setViewportSize({width: 390, height: 844}); await ir(p, "#/vos/acerca");
  ok(JSON.stringify(await vis()) === "[false,true]", "en vertical el ajuste no ocupa la pantalla");
  await p.setViewportSize({width: 844, height: 390}); await p.waitForTimeout(150);
  ok((await vis()).every(Boolean), "al girar no aparecen los dos paneles");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("isla", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/vos");
  await p.evaluate(() => K.isla.mostrar({texto: "Descanso 1:08", p: .62, familia: "fu", ir: "#/hoy"}));
  const r = await p.evaluate(() => { const i = document.querySelector("#isla").getBoundingClientRect(), a = document.querySelector(".enc-tit").getBoundingClientRect(); return {top: i.top, bottom: i.bottom, cx: i.left + i.width / 2, acc: a.top}; });
  ok(r.top < 60 && Math.abs(r.cx - 195) < 2, "la isla no está arriba al centro");
  ok(r.acc >= r.bottom, "la isla tapa el título");
  await p.click("#isla"); await p.waitForFunction(() => location.hash === "#/hoy");
  await p.evaluate(() => K.isla.ocultar());
  ok(await p.evaluate(() => document.querySelector("#isla").hidden && !document.body.classList.contains("con-isla")), "la isla no se oculta");
  await ctx.close();
});

prueba("sin-conexion", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "");
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload(); await p.waitForSelector("main.view");
  ok(await p.evaluate(() => !!navigator.serviceWorker.controller), "el service worker no controla la página");
  await ctx.setOffline(true);
  await p.reload(); await p.waitForSelector("main.view", {timeout: 8000});
  ok(await p.textContent(".enc-tit h1") === "Hoy", "sin conexión no abre");
  ok(await p.evaluate(() => document.fonts.ready.then(() => document.fonts.check('800 16px "Mona Sans"'))), "sin conexión no hay letra");
  await ctx.close();
});

prueba("pesos-de-letra", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/vos");
  await p.click("#tema-menu"); await p.waitForSelector(".pop");
  const w = await p.evaluate(() => {
    const fw = s => getComputedStyle(document.querySelector(s)).fontWeight;
    return {lb: fw(".lb"), sel: fw('.pmi[aria-checked="true"]'), nosel: fw('.pmi[aria-checked="false"]'), valor: fw(".ajr em"), fila: fw(".ajr"), tab: fw('nav.barra [aria-current="page"]')};
  });
  ok(w.sel === "700" && w.nosel === "600" && w.fila === "600", "lo elegido no va en 700 y lo demás en 600: " + JSON.stringify(w));
  ok(w.lb === "700" && w.valor === "700" && w.tab === "700", "texto de 13 px o menos no va en 700: " + JSON.stringify(w));
  await ctx.close();
});

prueba("rutas-raras", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/vos/constructor");
  ok(await p.evaluate(() => [...document.querySelectorAll(".enc-tit h1")].find(h => h.offsetParent).textContent) === "Vos", "#/vos/constructor no muestra Vos");
  await ir(p, "#/xyz");
  ok(await p.textContent(".enc-tit h1") === "Hoy", "una ruta desconocida no cae en Hoy");
  ok(!(await p.evaluate(() => document.body.innerText)).includes("undefined"), "aparece «undefined»");
  await ctx.close();
});

prueba("portal-y-red-caida", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "");
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload(); await p.waitForSelector("main.view");
  ok(await p.evaluate(() => !!navigator.serviceWorker.controller), "el service worker no controla la página");
  try {
    /* un wifi con ingreso redirige: se sigue viendo Kozmos y no se guarda el portal */
    MODO = "portal"; await p.reload(); await p.waitForSelector("main.view", {timeout: 8000});
    ok(await p.textContent(".enc-tit h1") === "Hoy", "con el portal no se ve Kozmos");
    await ctx.setOffline(true); await p.reload(); await p.waitForSelector("main.view", {timeout: 8000});
    ok(await p.title() === "Kozmos", "sin conexión quedó guardado el portal");
    await ctx.setOffline(false);
    /* la red contesta 503 (por ejemplo, mientras se publica): la copia guardada */
    MODO = "caido"; await p.reload(); await p.waitForSelector("main.view", {timeout: 8000});
    ok(await p.textContent(".enc-tit h1") === "Hoy", "con la red caída no abre la copia guardada");
  } finally { MODO = ""; }
  await ctx.close();
});

prueba("movimiento-reducido", async () => {
  const {ctx, p} = await pagina(undefined, {reducedMotion: "reduce"});
  await ir(p, "#/hoy");
  await p.click('nav.barra button[data-tab="cielo"]');
  ok(!(await p.evaluate(() => /vt-/.test(document.querySelector("main.view").className))), "anima con movimiento reducido");
  await ctx.close();
});

const elegidas = process.argv.slice(2);
let fallas = 0; const t0 = Date.now();
for (const [n, fn] of PRUEBAS){
  if (elegidas.length && !elegidas.includes(n)) continue;
  try { await fn(); console.log("ok    ", n); }
  catch (e) { fallas++; console.log("FALLA ", n, "·", e.message.split("\n")[0]); }
}
await b.close(); srv.close();
console.log(fallas ? `FALLAN ${fallas}` : "TODO OK", `· ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(fallas ? 1 : 0);
