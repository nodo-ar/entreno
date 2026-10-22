// Pruebas de Kozmos: primero las que no necesitan pantalla (catálogo y cielo); después arma la app,
// la sirve en un puerto local y la recorre con Playwright.
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
execFileSync(process.execPath, [path.join(RAIZ, "pruebas", "puras.mjs")], {stdio: ["ignore", "ignore", "inherit"]}); /* si falla, corta acá */
console.log("ok     sin pantalla (catálogo y cielo)");
execFileSync(process.execPath, [path.join(RAIZ, "tools", "armar.mjs"), APP], {stdio: "inherit"});
/* la versión de la APK (necesita «npm ci» en kozmos/apk); se sirve en /apk/ */
const APK = path.join(RAIZ, "apk", "www");
let sinApk = "";
try { execFileSync(process.execPath, [path.join(RAIZ, "tools", "armar.mjs"), APK, "--apk"], {stdio: ["ignore", "inherit", "pipe"]}); }
catch (e) { sinApk = "no se pudo armar la APK (¿falta «npm ci» en kozmos/apk?)"; }

/* servidor mínimo: el service worker necesita http */
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml", ".png": "image/png"};
let MODO = ""; /* "portal": la página redirige a otra (wifi con ingreso) · "caido": la página contesta 503 */
const srv = http.createServer((q, r) => {
  const ruta = new URL(q.url, "http://x").pathname;
  if (ruta === "/portal.html"){ r.writeHead(200, {"content-type": "text/html; charset=utf-8"}); r.end("<title>Portal</title><h1>Ingresá al wifi</h1>"); return; }
  if (ruta === "/" || ruta === "/index.html"){
    if (MODO === "portal"){ r.writeHead(302, {location: "/portal.html"}); r.end(); return; }
    if (MODO === "caido"){ r.writeHead(503); r.end("caído"); return; }
  }
  let f = decodeURIComponent(new URL(q.url, "http://x").pathname); if (f.endsWith("/")) f += "index.html";
  const base = f.startsWith("/apk/") ? APK : APP, p = path.join(base, base === APK ? f.slice(4) : f);
  if (!p.startsWith(base) || !fs.existsSync(p)){ r.writeHead(404); r.end(); return; }
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

prueba("cinco-pestanas", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "");
  ok(JSON.stringify(await p.$$eval("nav.barra button", bs => bs.map(b => b.dataset.tab))) === '["hoy","planes","cielo","progreso","vos"]', "la barra no es Hoy, Planes, Cielo, Progreso, Vos");
  for (const [tab, titulo] of [["planes", "Planes"], ["cielo", "Cielo"], ["progreso", "Progreso"], ["vos", "Vos"], ["hoy", "Hoy"]]){
    await p.click(`nav.barra button[data-tab="${tab}"]`);
    await p.waitForSelector(`main.view[data-tab="${tab}"]`);
    const h = await p.$$eval(".enc-tit h1", hs => hs.filter(h => h.offsetParent).map(h => h.textContent));
    ok(h[0] === titulo, `${tab}: título ${h[0]}`);
    ok(await p.getAttribute(`nav.barra button[data-tab="${tab}"]`, "aria-current") === "page", `${tab}: la barra no la marca`);
    ok(await p.$$eval('nav.barra [aria-current="page"]', x => x.length) === 1, "más de una pestaña marcada");
    /* la etiqueta, solo en la elegida */
    await p.waitForTimeout(500);
    const nm = await p.$$eval("nav.barra button", bs => bs.filter(b => b.querySelector(".nm").getBoundingClientRect().width > 1).map(b => b.dataset.tab));
    ok(JSON.stringify(nm) === JSON.stringify([tab]), `${tab}: la etiqueta se ve en ${nm}`);
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
  for (const h of ["#/hoy", "#/cielo", "#/cielo/front-lever", "#/cielo/parada-de-manos/anotar", "#/cielo/lastre/anotar/1", "#/cielo/espagat/anotar/4", "#/progreso", "#/vos", "#/vos/acerca", "#/vos/dias", "#/planes", "#/planes/rutinas/base_cali", "#/planes/hazanas/orion", "#/hoy/rutinas", "#/vos/constructor", "#/xyz"]){
    await ir(p, h);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(w <= 360, `${h}: ancho ${w}`);
  }
  await ctx.close();
});

prueba("encabezado-compacto", async () => {
  const {ctx, p} = await pagina({width: 360, height: 640});
  await ir(p, "#/cielo");
  ok(!(await p.evaluate(() => document.body.classList.contains("compacto"))), "arranca compacto");
  await p.mouse.wheel(0, 260); await p.waitForFunction(() => document.body.classList.contains("compacto"));
  ok(await p.textContent("#tbt") === "Cielo", "la barra compacta no dice Cielo");
  await p.mouse.wheel(0, -600); await p.waitForFunction(() => !document.body.classList.contains("compacto"));
  /* las acciones del encabezado (acá, volver) siguen a la vista al desplazar */
  await p.setViewportSize({width: 390, height: 300});
  await ir(p, "#/vos/acerca");
  await p.mouse.wheel(0, 400); await p.waitForTimeout(250);
  const r = await p.evaluate(() => { const b = [...document.querySelectorAll('.enc-acc [data-volver="#/vos"]')].find(x => x.offsetParent).getBoundingClientRect(); return [b.top, b.bottom, scrollY]; });
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
  await p.waitForSelector(".utoast:not(.out)"); await p.focus(".utoast:not(.out) .utu"); await p.waitForTimeout(700);
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
  const h1 = () => p.evaluate(() => [...document.querySelectorAll(".enc-tit h1")].find(h => h.offsetParent).textContent);
  await ir(p, "#/cielo/xyz"); ok(await h1() === "Cielo", "#/cielo/xyz no cae en Cielo");
  await ir(p, "#/cielo/front-lever/otra"); ok(await h1() === "Front lever", "#/cielo/front-lever/otra no cae en la constelación");
  await ir(p, "#/cielo/front-lever/anotar/99"); ok(await h1() === "Anotar una marca", "una estrella que no existe no abre anotar");
  ok(await p.textContent("#f-estrella em") === "Colgado activo 60 s", "con una estrella que no existe no arranca en la próxima");
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


/* ===== Etapa 2: el cielo ===== */
const titulo = p => p.evaluate(() => [...document.querySelectorAll(".enc-tit h1")].find(h => h.offsetParent)?.textContent);
const esperarTitulo = (p, t) => p.waitForFunction(t => [...document.querySelectorAll(".enc-tit h1")].find(h => h.offsetParent)?.textContent === t, t);
const estadosFL = p => p.$$eval(".est-fila", fs => fs.map(f => f.classList.contains("encendida") ? "e" : f.classList.contains("proxima") ? "p" : "-").join(""));

prueba("cielo-catalogo", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/cielo");
  ok(await p.$$eval(".cons-fila", x => x.length) === 14, "no hay 14 constelaciones en la lista");
  ok(await p.$$eval(".cielo-svg .cons", x => x.length) === 14, "no hay 14 constelaciones en el cielo");
  ok(await p.textContent(".enc-tit small") === "Todavía sin estrellas", "el cielo vacío dice otra cosa");
  ok(await p.$$eval(".cielo-svg .es.on", x => x.length) === 0, "hay estrellas encendidas sin marcas");
  ok(await p.$$eval(".cielo-svg .es.nx", x => x.length) === 14, "cada constelación tiene que mostrar su próxima");
  await p.click('.cons-fila[data-ir="#/cielo/front-lever"]');
  await esperarTitulo(p, "Front lever");
  ok(await estadosFL(p) === "p-------", "Front lever vacía: " + await estadosFL(p));
  /* el cielo también se abre tocando la constelación, o con el teclado */
  await ir(p, "#/cielo");
  await p.focus('.cielo-svg .cons[data-ir="#/cielo/soga"]'); await p.keyboard.press("Enter");
  await esperarTitulo(p, "Soga");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("anotar-enciende-y-queda", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/cielo");
  await p.click('.cons-fila[data-ir="#/cielo/front-lever"]'); await esperarTitulo(p, "Front lever");
  await p.click('.btn[data-ir="#/cielo/front-lever/anotar"]'); await esperarTitulo(p, "Anotar una marca");
  /* arranca vacío: un toque sin mirar no puede encender una estrella */
  ok(await p.inputValue("#f-valor") === "", "arranca con un número puesto");
  await p.click("#f-guardar"); await p.waitForSelector(".utoast.solo");
  ok(await titulo(p) === "Anotar una marca", "guardó sin número");
  await p.fill("#f-valor", "60"); await p.click("#f-guardar"); await esperarTitulo(p, "Front lever");
  await p.waitForSelector(".utoast");
  ok((await p.textContent(".utoast .utx")) === "Encendiste una estrella en Front lever.", "el aviso no festeja la estrella: " + await p.textContent(".utoast .utx"));
  ok(await estadosFL(p) === "ep------", "no se encendió: " + await estadosFL(p));
  ok(await p.$(".cons-svg .es.nace"), "la estrella nueva no se anima");
  /* guardar vuelve con el botón atrás: no quedan pasos de más */
  ok(await p.evaluate(() => location.hash) === "#/cielo/front-lever", "no volvió a la constelación");
  await p.goBack(); await esperarTitulo(p, "Cielo");
  ok(await p.textContent(".enc-tit small") === "1 de 95 estrellas", "Cielo no cuenta la estrella: " + await p.textContent(".enc-tit small"));
  ok(await p.textContent('.cons-fila[data-ir="#/cielo/front-lever"] em') === "1 de 8", "la fila no cuenta la estrella");
  ok(await p.evaluate(() => { const m = K.diario.mediciones[0]; return m.ejercicio === "colgado-activo" && m.tipo === "segundos" && m.catalogo === K.CATALOGO.version; }), "la marca no guarda qué midió");
  /* queda guardada en el teléfono */
  await p.reload(); await p.waitForSelector("main.view");
  ok(await p.textContent(".enc-tit small") === "1 de 95 estrellas", "al volver a abrir se perdió la marca");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("anotar-deshacer-y-borrar", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/cielo/front-lever/anotar/1");
  await p.fill("#f-valor", "60"); await p.click("#f-guardar"); await esperarTitulo(p, "Front lever");
  await p.click(".utoast .utu");
  await p.waitForFunction(() => !document.querySelector(".est-fila.encendida"));
  await p.reload(); await p.waitForSelector(".est-fila");
  ok(await estadosFL(p) === "p-------", "deshacer no borró la marca guardada");
  /* una marca que no enciende nada, y borrarla con deshacer */
  await ir(p, "#/cielo/front-lever/anotar/1");
  await p.fill("#f-valor", "45"); await p.click("#f-guardar"); await esperarTitulo(p, "Front lever");
  ok((await p.textContent(".utoast .utx")) === "Anotaste 45 s en Colgado activo 60 s", "aviso: " + await p.textContent(".utoast .utx"));
  ok((await p.textContent(".cons-estado .ln")).includes("45 s"), "no muestra la mejor marca");
  ok(await p.getAttribute(".cons-estado .bar", "aria-valuenow") === "75", "el avance no es 45 de 60");
  await p.click(".marca [data-borrar]");
  await p.waitForFunction(() => !document.querySelector(".marca"));
  ok((await p.textContent(".utoast .utx")) === "Borraste una marca", "borrar no ofrece deshacer");
  await p.click(".utoast .utu"); await p.waitForSelector(".marca");
  await p.reload(); await p.waitForSelector(".marca");
  ok(await p.$$eval(".marca", x => x.length) === 1, "deshacer el borrado no la devolvió");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("anotar-tipos", async () => {
  const {ctx, p} = await pagina();
  /* el mismo ejercicio: 25 s en «Tuck 20 s» encienden también «Tuck 10 s» */
  await ir(p, "#/cielo/front-lever/anotar/4");
  ok(await p.textContent("#f-estrella em") === "Tuck 20 s", "no abre la estrella pedida");
  await p.fill("#f-valor", "25"); await p.click("#f-guardar"); await esperarTitulo(p, "Front lever");
  ok((await p.textContent(".utoast .utx")) === "Encendiste 2 estrellas en Front lever.", "aviso: " + await p.textContent(".utoast .utx"));
  ok(await estadosFL(p) === "p-ee----", "tuck 10 y 20: " + await estadosFL(p));
  /* un número que no es número no se guarda */
  await ir(p, "#/cielo/front-lever/anotar/1");
  await p.fill("#f-valor", "abc"); await p.click("#f-guardar");
  await p.waitForSelector(".utoast.solo");
  ok(await titulo(p) === "Anotar una marca", "guardó un valor roto");
  /* dos toques seguidos guardan una sola marca */
  await ir(p, "#/cielo/soga/anotar/1"); await p.fill("#f-valor", "50");
  await p.evaluate(() => { document.querySelector("#f-guardar").click(); document.querySelector("#f-guardar").click(); });
  await esperarTitulo(p, "Soga");
  ok(await p.evaluate(() => K.diario.mediciones.filter(m => m.estrella === "soga.100").length) === 1, "el doble toque guardó dos marcas");
  /* tocar la pestaña en la que estás vuelve a su raíz sin apilar */
  await ir(p, "#/cielo/soga/anotar/1"); const hl = await p.evaluate(() => history.length);
  await p.click('nav.barra button[data-tab="cielo"]'); await esperarTitulo(p, "Cielo");
  ok(await p.evaluate(() => history.length) === hl, "la pestaña sumó un paso");
  await ir(p, "#/cielo/front-lever/anotar/1");
  /* − y + */
  await p.fill("#f-valor", "10"); await p.click('[data-paso="1"]'); await p.click('[data-paso="1"]'); await p.click('[data-paso="-1"]');
  ok(await p.inputValue("#f-valor") === "11", "− y + no suman de a uno");
  /* lo logrado: un solo botón */
  await ir(p, "#/cielo/espagat/anotar/5");
  ok(await p.textContent("#f-guardar") === "Lo logré" && !(await p.$("#f-valor")), "lo logrado pide un número");
  await p.click("#f-guardar"); await esperarTitulo(p, "Espagat");
  ok(await p.$eval(".est-fila:nth-child(5)", f => f.classList.contains("encendida")), "«Lateral completo» no se encendió");
  /* lastre: kilos y tu peso, y el peso queda para la próxima */
  await ir(p, "#/cielo/lastre/anotar/1");
  await p.fill("#f-peso", "80"); await p.fill("#f-lastre", "8");
  ok(await p.textContent("#f-pct") === "+10 %", "8 de 80 no da +10 %: " + await p.textContent("#f-pct"));
  await p.click("#f-guardar"); await esperarTitulo(p, "Lastre");
  ok(await p.$eval(".est-fila", f => f.classList.contains("encendida")), "+10 % no enciende «Dominada +10 %»");
  await ir(p, "#/cielo/lastre/anotar/2");
  ok(await p.inputValue("#f-peso") === "80", "no recuerda tu peso");
  ok(await p.inputValue("#f-lastre") === "", "el lastre arranca con un número puesto");
  /* el día se elige con un menú */
  await ir(p, "#/cielo/soga/anotar/1");
  await p.click("#f-fecha"); await p.click('.pmi:nth-of-type(2)');
  ok(await p.textContent("#f-fecha em") === "Ayer", "no cambia el día");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("cielo-horizontal", async () => {
  const {ctx, p} = await pagina({width: 844, height: 390});
  await ir(p, "#/cielo");
  const vis = () => p.evaluate(() => ["lado", "abierto"].map(c => !!document.querySelector(".split>." + c).offsetParent));
  ok((await vis()).every(Boolean), "Cielo no muestra lista y constelación juntas");
  ok(await p.evaluate(() => document.querySelector(".split>.abierto h1").textContent) === "Parada de manos", "no abre la primera constelación");
  ok(await p.$(".cons-fila[data-sel]") && await p.getAttribute(".cons-fila[data-sel]", "data-ir") === "#/cielo/parada-de-manos", "la fila abierta no se marca");
  const antes = await p.evaluate(() => [document.querySelector(".split>.lado .aj").getBoundingClientRect().top, history.length]);
  await p.click('.cons-fila[data-ir="#/cielo/motor"]');
  await p.waitForFunction(() => document.querySelector(".split>.abierto h1")?.textContent === "Motor");
  const desp = await p.evaluate(() => [document.querySelector(".split>.lado .aj").getBoundingClientRect().top, history.length]);
  ok(Math.abs(desp[0] - antes[0]) < 1 && desp[1] === antes[1], "abrir una constelación movió la lista o sumó un paso");
  ok(!(await p.evaluate(() => [...document.querySelectorAll('.split>.abierto [data-raiz]')].some(b => b.offsetParent && getComputedStyle(b).visibility !== "hidden"))), "en horizontal se ve volver a la lista");
  /* anotar se abre a la derecha, con volver a la constelación */
  await p.click('.split>.abierto .btn[data-ir="#/cielo/motor/anotar"]');
  await p.waitForFunction(() => document.querySelector(".split>.abierto h1")?.textContent === "Anotar una marca");
  ok((await vis()).every(Boolean), "anotar tapó la lista");
  ok(!(await p.evaluate(() => /vt-/.test(document.querySelector("main.view").className) || /vt-/.test(document.querySelector(".split>.lado").className))), "al anotar se movió la lista");
  await p.fill("#f-valor", "25"); await p.click("#f-guardar");
  await p.waitForFunction(() => document.querySelector(".split>.abierto h1")?.textContent === "Motor");
  ok(await p.textContent('.cons-fila[data-ir="#/cielo/motor"] em') === "1 de 6", "la lista no se actualizó");
  const tops = await p.evaluate(() => [...document.querySelectorAll(".split h1")].map(h => Math.round(h.getBoundingClientRect().top)));
  ok(Math.abs(tops[0] - tops[1]) <= 1, "los títulos de los dos paneles no se alinean: " + tops);
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 844, "desborde en horizontal");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("volver-sin-pasos-de-mas", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/cielo");
  const h0 = await p.evaluate(() => history.length);
  await p.click('.cons-fila[data-ir="#/cielo/draco"]'); await esperarTitulo(p, "Draco");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Cielo");
  await p.click('.cons-fila[data-ir="#/cielo/draco"]'); await esperarTitulo(p, "Draco");
  ok(await p.evaluate(() => history.length) === h0 + 1, "volver sumó pasos al historial");
  /* entrar directo a una constelación (por ejemplo, desde un enlace): volver lleva al cielo igual */
  await ir(p, "#/cielo/draco/anotar");
  await p.reload(); await p.waitForSelector("main.view");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Draco");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Cielo");
  await ctx.close();
});

prueba("sin-lugar-para-guardar", async () => {
  /* un navegador que no deja usar IndexedDB: se ve igual, avisa y no se rompe */
  const {ctx, p} = await pagina();
  await p.addInitScript(() => { Object.defineProperty(window, "indexedDB", {get(){ throw new Error("bloqueado"); }}); });
  await ir(p, "#/cielo/front-lever/anotar");
  ok(await p.$(".aviso-tenue"), "no avisa que no puede guardar");
  await p.fill("#f-valor", "60"); await p.click("#f-guardar"); await p.waitForSelector(".utoast.solo");
  ok((await p.textContent(".utoast .utx")).startsWith("No se pudo guardar"), "no dice que no pudo guardar");
  ok(await titulo(p) === "Anotar una marca", "hizo como que guardó");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

/* ===== Etapa 3: la sesión, con reloj falso ===== */
async function conReloj(vp){
  const r = await pagina(vp);
  await r.ctx.addInitScript(() => { window.__V = []; Object.defineProperty(navigator, "vibrate", {value: x => { window.__V.push(JSON.stringify(x)); return true; }, configurable: true}); });
  await r.p.clock.install({time: new Date("2026-10-20T10:00:00")});
  return r;
}
const rumbo = async (p, ids) => { await p.evaluate(ids => K.diario.perfilPoner("rumbo", ids).then(() => K.refrescar()), ids); await p.waitForSelector("#s-empezar"); };
const fase = p => p.evaluate(() => K.sesion.estado()?.fase || null);
const reloj = (p, k) => p.textContent(`[data-r="${k}"]`);
const tick = async (p, ms) => { await p.clock.runFor(ms); await p.evaluate(() => K.sesion.alLatir()); };

prueba("sesion-entera", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  /* el primer día, sin rumbo, Hoy ofrece que Kozmos arme el día (paso 1 de 3) */
  ok((await p.textContent(".como-op .t1")) === "Que Kozmos arme tu día", "sin rumbo no ofrece elegirlo");
  await p.click('.como-op[data-ir="#/hoy/rumbo"]'); await esperarTitulo(p, "Tu rumbo");
  await p.click('[data-rumbo="front-lever"]');
  await p.waitForSelector('[data-rumbo="front-lever"][aria-pressed="true"]', {timeout: 3000}).catch(() => { throw new Error("no marca la elegida"); });
  await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  const filas = await p.$$eval(".toca", fs => fs.map(f => f.textContent.replace(/\s+/g, " ").trim()));
  ok(filas.length === 3 && filas[0].includes("Colgado activo") && filas[0].includes("4 × 30 s"), "hoy toca: " + filas.join(" | "));
  await p.click("#s-empezar"); await p.waitForSelector(".ses.serie");
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("nav.barra")).display === "none"), "la barra se ve en la sesión");
  /* 5 s para llegar a la barra; recién ahí corre el reloj */
  await tick(p, 2000);
  ok(await reloj(p, "fase") === "3" && await reloj(p, "fase-lb") === "Preparate", "falta la cuenta para prepararse: " + await reloj(p, "fase"));
  await tick(p, 34000);
  ok(await reloj(p, "fase") === "0:31", "el reloj de la serie: " + await reloj(p, "fase"));
  ok((await p.evaluate(() => window.__V)).includes("[10,40,10]"), "no vibró al llegar a los 30 s");
  await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.inputValue("#s-valor") === "31", "propone lo que corrió el reloj");
  await p.click('[data-spaso="1"]'); await p.click('[data-spaso="1"]'); await p.click('[data-spaso="-1"]');
  ok(await p.inputValue("#s-valor") === "32", "− y + no cambian el valor");
  await tick(p, 30000);
  ok(await reloj(p, "queda") === "1:00", "el descanso: " + await reloj(p, "queda"));
  await p.click('[data-desc="15"]'); ok(await reloj(p, "queda") === "1:15", "+15 s no suma");
  await p.click('[data-desc="-15"]'); await p.click('[data-desc="-15"]'); ok(await reloj(p, "queda") === "0:45", "−15 s no resta");
  await tick(p, 46000);
  ok(await p.$(".ses.descanso.fin"), "el fin del descanso no se ve en toda la pantalla");
  ok(await reloj(p, "queda-lb") === "Ya podés seguir", "al terminar el descanso no lo dice");
  ok((await p.evaluate(() => window.__V)).some(v => v === "[180,90,180]"), "no vibró al terminar el descanso");
  await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  ok(await p.textContent(".ses-tit .lb") === "Serie 2 de 4", "no pasó a la serie 2");
  /* el resto de la sesión, rápido */
  for (let i = 0; i < 30 && await fase(p) !== "cierre"; i++){
    if (await fase(p) === "serie"){ await tick(p, 36000); await p.click("#s-listo"); }
    else { await tick(p, 150000); await p.click("#s-seguir"); }
  }
  ok(await fase(p) === "cierre", "no llegó a la última serie");
  await p.click("#s-terminar"); await p.waitForSelector(".res");
  ok((await p.textContent(".res-tit")) === "Sentadilla profunda libre 30 s, encendida.", "el resumen no muestra la estrella nueva: " + await p.textContent(".res-tit"));
  ok(await p.$(".res .es.nace"), "la estrella nueva no se enciende en su constelación");
  const datos = await p.$$eval(".res-dato .num", xs => xs.map(x => x.textContent));
  ok(datos[1] === "7" && datos[2] === "1", "series y estrellas: " + datos);
  /* queda guardada: al abrir de nuevo, Hoy lo dice y el cielo la tiene */
  await p.reload(); await p.waitForSelector("main.view");
  await p.click("[data-volver]"); await esperarTitulo(p, "Hoy");
  ok((await p.textContent(".hoy .ajr")).includes("Hoy ya entrenaste"), "Hoy no muestra lo hecho");
  await ir(p, "#/cielo/espagat");
  ok((await estadosFL(p)).startsWith("ep"), "el cielo no tiene la estrella de la sesión");
  ok(await p.$('.marca .marca-ses'), "la marca de la sesión no aparece en tus marcas");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-sobrevive", async () => {
  /* el teléfono mata la app en pleno descanso: al abrir, sigue donde estaba y con el tiempo real */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await p.waitForSelector(".ses.serie");
  await tick(p, 12000); await p.click("#s-listo"); await p.fill("#s-valor", "14");
  await tick(p, 20000);
  await p.reload(); await p.waitForSelector(".ses.descanso");
  /* el reloj falso de la prueba sigue andando con el tiempo real que tarda la recarga (más si la serie tuvo figura en movimiento):
     se admiten hasta 3 s de corrimiento; lo que importa es que no vuelva a arrancar ni se quede en lo que marcaba */
  const queda = await reloj(p, "queda"), sq = queda.split(":").reduce((m, x) => m * 60 + +x, 0);
  ok(sq <= 70 && sq >= 67, "el descanso no siguió con el tiempo real: " + queda);
  ok(await p.inputValue("#s-valor") === "14", "se perdió lo anotado");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-vencida-se-guarda", async () => {
  /* entrenaste de noche, cerraste sin tocar Terminar y abrís al otro día: lo hecho no se tira, queda como sesión cortada */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await tick(p, 30000); await p.click("#s-listo"); await p.fill("#s-valor", "22");
  await p.clock.fastForward(13 * 3600e3);
  await p.reload(); await p.waitForSelector("main.view");
  await p.waitForSelector(".utoast.solo");
  ok((await p.textContent(".utoast .utx")) === "La sesión que quedó abierta se guardó como cortada.", "no avisa que la guardó");
  ok(await p.evaluate(() => !K.sesion.activa() && K.diario.sesiones.length === 1 && K.diario.sesiones[0].cortada && K.diario.sesiones[0].bloques[0].series[0].valor === 22), "la sesión vencida se perdió");
  ok(await p.evaluate(() => localStorage.getItem("kozmos.vivo.v1") === null), "la sesión vencida quedó colgada");
  /* termina en su último paso (el fin del descanso), no 13 horas después */
  const dur = await p.evaluate(() => K.diario.sesiones[0].duracion);
  ok(dur > 100 && dur < 300, "la sesión olvidada infla los minutos: " + dur + " s");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-dos-pestanas", async () => {
  /* la sesión en curso es una sola: si la terminás en una pestaña, la otra la suelta y no la pisa */
  const {ctx, p} = await pagina();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await p.waitForTimeout(5200); await p.click("#s-listo");
  const q = await ctx.newPage(); q._errores = []; q.on("pageerror", e => q._errores.push(String(e)));
  await q.goto(URL0 + "#/hoy/sesion"); await q.waitForSelector(".ses.descanso");
  await p.click("#s-cortar"); await p.waitForSelector(".res");
  await q.waitForFunction(() => !K.sesion.activa() && !document.querySelector(".ses"), null, {timeout: 3000}).catch(() => { throw new Error("la otra pestaña sigue con la sesión"); });
  ok(await p.evaluate(() => K.diario.sesiones.length === 1), "no quedó una sola sesión");
  ok(p._errores.length + q._errores.length === 0, "errores: " + [...p._errores, ...q._errores].join(" | "));
  await ctx.close();
});

prueba("migracion-v1", async () => {
  /* una base de la etapa 2 (versión 1, con marcas) se abre con la versión 2 sin perder nada */
  const {ctx, p} = await pagina();
  await p.goto(URL0 + "no-existe.html");
  await p.evaluate(() => new Promise((ok, mal) => {
    const r = indexedDB.open("kozmos", 1);
    r.onupgradeneeded = () => { const b = r.result; b.createObjectStore("mediciones", {keyPath: "id"}).createIndex("estrella", "estrella"); b.createObjectStore("perfil"); };
    r.onsuccess = () => { const t = r.result.transaction(["mediciones", "perfil"], "readwrite");
      t.objectStore("mediciones").put({id: "m1", estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 61, fecha: "2026-10-18", origen: "anotado", creada: "2026-10-18T10:00:00Z"});
      t.objectStore("perfil").put(80, "peso");
      t.oncomplete = () => { r.result.close(); ok(); }; t.onerror = mal; };
    r.onerror = mal;
  }));
  p._errores.length = 0; /* el 404 de la página de apoyo no cuenta */
  await ir(p, "#/cielo/front-lever");
  ok(await p.evaluate(() => K.diario.guarda && K.diario.mediciones.length === 1 && K.diario.perfil.peso === 80 && Array.isArray(K.diario.sesiones)), "la migración perdió datos");
  ok((await estadosFL(p)).startsWith("ep"), "la marca de la etapa 2 no enciende su estrella");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-cortar-y-deshacer", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  /* sin nada hecho, la ✕ sale sin guardar y se puede deshacer */
  await p.click("#s-empezar"); await p.waitForSelector(".ses.serie");
  await p.click("#s-cortar"); await esperarTitulo(p, "Hoy");
  ok((await p.textContent(".utoast .utx")) === "Saliste de la sesión", "no ofrece deshacer la salida");
  await p.click(".utu"); await p.waitForSelector(".ses.serie");
  /* con una serie hecha, guarda lo hecho y muestra el resumen */
  await tick(p, 25000); await p.click("#s-listo");
  await p.click("#s-cortar"); await p.waitForSelector(".res");
  ok((await p.textContent(".res-tit")) === "Lo hecho cuenta.", "el resumen de una sesión cortada");
  ok((await p.textContent(".utoast .utx")) === "Sesión cortada. Lo hecho cuenta.", "no ofrece deshacer el corte");
  ok((await p.$$eval(".res-dato .lb", xs => xs.map(x => x.textContent)))[2] === "mejor marca", "un día sin estrella muestra tu mejor serie, no un cero");
  ok(await p.evaluate(() => K.diario.sesiones.length === 1 && K.diario.sesiones[0].cortada && K.diario.sesiones[0].bloques[0].series[0].valor === 20), "no guardó la serie hecha");
  await p.click(".utu"); await p.waitForSelector(".ses.descanso");
  ok(await p.evaluate(() => K.diario.sesiones.length === 0), "deshacer no borró la sesión guardada");
  ok(await p.inputValue("#s-valor") === "20", "al deshacer se perdió lo anotado");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-isla-y-pausa", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await tick(p, 10000); await p.click("#s-listo");
  /* salís a mirar el cielo: el descanso sigue arriba, en la isla */
  await p.click("#s-mas"); await p.click('.pmi[data-id="cielo"]'); await esperarTitulo(p, "Cielo");
  await tick(p, 2000);
  ok((await p.textContent("#isla")).trim() === "Descanso 1:28", "la isla: " + await p.textContent("#isla"));
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("nav.barra")).display !== "none"), "afuera de la sesión la barra tiene que verse");
  await p.click("#isla"); await p.waitForSelector(".ses.descanso");
  ok(await p.evaluate(() => document.querySelector("#isla").hidden), "la isla queda en la sesión");
  /* la pausa frena el descanso */
  await p.click("#s-mas"); await p.click('.pmi[data-id="pausa"]');
  const antes = await reloj(p, "queda"); await tick(p, 15000);
  ok(await reloj(p, "queda") === antes && await p.$(".ses-pausa"), "la pausa no frenó el reloj");
  await p.click("#s-mas"); await p.click('.pmi[data-id="pausa"]'); await tick(p, 3000);
  ok(await reloj(p, "queda") !== antes, "al seguir, el reloj no corre");
  /* saltear el ejercicio pasa al bloque siguiente con lo hecho guardado */
  await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await p.waitForSelector(".ses.serie");
  ok(await p.evaluate(() => K.sesion.estado().b === 1 && K.sesion.estado().hechos.length === 1), "saltear no pasó al bloque 2");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-intento", async () => {
  /* lo que no se mide (logrado): sí o no de un toque, y arranca en «Todavía no» para no encender nada sin querer */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["puente"]);
  await p.click("#s-empezar"); await p.waitForSelector(".ses.serie"); await p.click("#s-listo");
  ok(await p.getAttribute('[data-salio="0"]', "aria-pressed") === "true", "no arranca en «Todavía no»");
  await p.click('[data-salio="1"]'); ok(await p.getAttribute('[data-salio="1"]', "aria-pressed") === "true", "el sí no queda marcado");
  await p.click("#s-seguir");
  ok(await p.evaluate(() => K.sesion.estado().hechos[0].valor === 1), "el intento logrado no quedó");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-horizontal", async () => {
  const {ctx, p} = await conReloj({width: 844, height: 390});
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  ok(await p.evaluate(() => { const a = document.querySelector(".hoy-a").getBoundingClientRect(), b = document.querySelector(".hoy-b").getBoundingClientRect(); return b.left >= a.right; }), "Hoy en horizontal no va en dos columnas");
  await p.click("#s-empezar"); await p.waitForSelector(".ses.serie");
  for (const f of ["serie", "descanso"]){
    const r = await p.evaluate(() => { const a = document.querySelector(".ses-a").getBoundingClientRect(), b = document.querySelector(".ses-b").getBoundingClientRect(), btn = document.querySelector(".ses-b .btn:last-child").getBoundingClientRect();
      return {lado: b.left >= a.right - 1, ve: btn.bottom <= innerHeight, ancho: document.documentElement.scrollWidth <= innerWidth}; });
    ok(r.lado && r.ve && r.ancho, `${f}: ${JSON.stringify(r)}`);
    if (f === "serie"){ await tick(p, 5000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso"); }
  }
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-sin-lugar", async () => {
  /* sin IndexedDB la sesión anda igual, y al terminar avisa que no pudo guardar en vez de hacer como que sí */
  const {ctx, p} = await conReloj();
  await p.addInitScript(() => { Object.defineProperty(window, "indexedDB", {get(){ throw new Error("bloqueado"); }}); });
  await ir(p, "#/hoy/rumbo"); await p.click('[data-rumbo="front-lever"]'); await p.waitForSelector('[aria-pressed="true"]'); await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  ok(await p.$(".aviso-tenue"), "Hoy no avisa que no puede guardar");
  await p.click("#s-empezar"); await tick(p, 5000); await p.click("#s-listo");
  await p.click("#s-cortar"); await p.waitForSelector(".utoast.solo");
  ok((await p.textContent(".utoast .utx")).startsWith("No se pudo guardar"), "no dice que no pudo guardar");
  ok(await p.$(".ses.descanso"), "la sesión tiene que seguir abierta");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

/* ===== Etapa 4: prueba de estrella, tu equipo, tu peso, Progreso y respaldo ===== */
/* el diario entero, con las claves del perfil en orden: así dos teléfonos se pueden comparar */
const diarioDe = p => p.evaluate(() => JSON.stringify([K.diario.mediciones, K.diario.sesiones, Object.fromEntries(Object.entries(K.diario.perfil).sort())]));
const anotarMarca = (p, m) => p.evaluate(m => K.diario.anotar({ejercicio: "colgado-activo", tipo: "segundos", estrella: "front-lever.colgado-60s", fecha: K.hoy(), ...m}).then(() => K.refrescar()), m);

prueba("prueba-de-estrella", async () => {
  /* desde la constelación: Preparate, el reloj corre solo, vibra al llegar y un toque en cualquier lado la termina */
  const {ctx, p} = await conReloj();
  await ir(p, "#/cielo/front-lever");
  await p.click('[data-probar="front-lever"]'); await p.waitForSelector(".ses.prueba");
  ok((await p.textContent(".ses-tit h1")) === "Colgado activo 60 s", "la prueba no dice qué estrella: " + await p.textContent(".ses-tit h1"));
  await tick(p, 2000);
  ok(await reloj(p, "fase") === "3" && await reloj(p, "fase-lb") === "Preparate", "falta la cuenta para prepararse");
  await p.click(".ses.prueba .ses-luego"); await tick(p, 100);
  ok(await fase(p) === "serie", "un toque mientras te preparás cortó la prueba");
  await tick(p, 64000);
  ok(await reloj(p, "fase") === "61" && await reloj(p, "fase-lb") === "de 60 s", "el reloj de la prueba: " + await reloj(p, "fase"));
  ok(await p.$(".prueba-anillo.listo"), "el anillo no se llena al llegar");
  ok((await p.evaluate(() => window.__V)).includes("[10,40,10]"), "no vibró al llegar a los 60 s");
  await p.click(".ses.prueba .ses-ind"); await p.waitForSelector(".res");
  ok((await p.textContent(".res-tit")) === "Colgado activo 60 s, encendida.", "la prueba no encendió la estrella: " + await p.textContent(".res-tit"));
  ok(await p.evaluate(() => K.diario.sesiones[0].bloques[0].prueba === true && K.diario.sesiones[0].bloques[0].series[0].valor === 61), "lo que corrió el reloj no quedó anotado");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("prueba-que-no-llega", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/cielo/front-lever"); await p.click('[data-probar="front-lever"]'); await p.waitForSelector(".ses.prueba");
  await tick(p, 47000); await p.click("#s-listo"); await p.waitForSelector(".res");
  ok((await p.textContent(".res-tit")) === "Todavía no.", "una prueba que no llega: " + await p.textContent(".res-tit"));
  ok((await p.textContent(".res-txt p")).startsWith("42 s de 60 s"), "no dice cuánto faltó: " + await p.textContent(".res-txt p"));
  const datos = await p.$$eval(".res-dato", xs => xs.map(x => [...x.children].map(c => c.textContent).join(" ")));
  ok(datos.join("|") === "42 s esta vez", "una prueba muestra lo de esta vez, sin minutos ni series: " + datos.join("|"));
  /* la ✕ vuelve a la constelación de donde salió */
  await p.click('.ses-acc [data-volver]'); await esperarTitulo(p, "Front lever");
  await ctx.close();
});

prueba("ventana-de-prueba", async () => {
  /* con tu mejor marca al 80 %, Hoy abre la ventana y la sesión empieza por la prueba */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await anotarMarca(p, {valor: 50, fecha: "2026-10-18"});
  ok((await p.textContent(".hoy-ventana")).includes("probá Colgado activo 60 s"), "Hoy no avisa la ventana");
  ok((await p.textContent(".toca.es-prueba")).includes("60 s"), "la prueba no va primera en lo que toca");
  await p.click("#s-empezar"); await p.waitForSelector(".ses.prueba");
  await tick(p, 30000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.inputValue("#s-valor") === "25", "después de la prueba se anota lo que corrió: " + await p.inputValue("#s-valor"));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("tu-equipo", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/vos");
  ok((await p.textContent('[data-ir="#/vos/equipo"] em')) === "Todo", "sin elegir, cuenta todo");
  await p.click('[data-ir="#/vos/equipo"]'); await esperarTitulo(p, "Tu equipo");
  await p.click('[data-equipo="soga"]'); await p.waitForSelector('[data-equipo="soga"][aria-pressed="false"]');
  ok((await p.textContent(".utoast .utx")) === "Sacaste soga", "no ofrece deshacer");
  await ir(p, "#/cielo");
  ok(!(await p.$('.cielo-svg [data-ir="#/cielo/soga"]')), "sin soga, Soga sigue en el cielo");
  await ir(p, "#/cielo/soga");
  ok((await p.textContent(".cons-estado .t1")) === "Pide soga.", "la constelación no dice qué pide");
  ok(await p.$$eval(".est-fila.sin-equipo", xs => xs.length) === 7 && await p.$$eval(".cons-svg .es.sin", xs => xs.length) === 7, "abierta, se ven todas, tenues");
  ok(!(await p.$("[data-probar]")) && await p.$('.dos-btn [data-ir="#/vos/equipo"]'), "sin soga, en vez de probar ofrece ir a tu equipo");
  /* deshacer devuelve todo */
  await ir(p, "#/vos/equipo"); await p.click('[data-equipo="soga"]'); await p.waitForSelector(".utoast"); await p.click(".utu");
  await p.waitForSelector('[data-equipo="soga"][aria-pressed="false"]');
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("peso-y-calorias", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/vos/peso");
  await p.fill("#v-peso", "1000"); await p.click("#v-peso-listo"); await p.waitForSelector(".utoast.solo");
  ok(await titulo(p) === "Tu peso", "un peso imposible no se guarda");
  await p.fill("#v-peso", "70"); await p.click('[data-ppaso="1"]'); await p.click("#v-peso-listo"); await esperarTitulo(p, "Vos");
  ok((await p.textContent('[data-ir="#/vos/peso"] em')) === "70,5 kg", "no guardó el peso: " + await p.textContent('[data-ir="#/vos/peso"] em'));
  /* una sesión de bici: el resumen dice las calorías, aproximadas */
  await ir(p, "#/hoy"); await rumbo(p, ["motor"]);
  await p.click("#s-empezar"); await p.waitForSelector(".ses.serie");
  await tick(p, 20 * 60000); await p.click("#s-listo");
  for (let i = 0; i < 20 && await fase(p) !== "cierre"; i++){
    if (await fase(p) === "serie"){ await tick(p, await p.evaluate(() => K.sesion.bloque().tipo === "minutos") ? 20 * 60000 : 36000); await p.click("#s-listo"); }
    else { await tick(p, 150000); await p.click("#s-seguir"); }
  }
  await p.click("#s-terminar"); await p.waitForSelector(".res");
  const k = await p.textContent(".res-kcal .num");
  ok(/^\d+ kcal$/.test(k) && parseInt(k) >= 150 && parseInt(k) <= 400, "las calorías: " + k);
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("progreso", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await tick(p, 40000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
  await anotarMarca(p, {valor: 61});
  await ir(p, "#/progreso");
  ok(await p.$(".semanas"), "no están las semanas");
  ok((await p.textContent(".prog-sem .ln.small .num")).startsWith("1 min"), "esta semana: " + await p.textContent(".prog-sem .ln.small .num"));
  ok((await p.textContent(".prog-est b")) === "Colgado activo 60 s", "no lista la estrella encendida este mes");
  await p.click('.ajr[data-ir^="#/progreso/"]'); await p.waitForSelector(".res");
  ok(await titulo(p) === "Hoy", "la sesión abierta no dice su día: " + await titulo(p));
  /* borrar la sesión: sin preguntar, con deshacer */
  await p.click("#res-mas"); await p.click('.pmi[data-id="borrar"]'); await esperarTitulo(p, "Progreso");
  ok((await p.textContent(".utoast .utx")) === "Borraste la sesión de hoy", "no ofrece deshacer el borrado");
  ok(await p.evaluate(() => K.diario.sesiones.length) === 0, "no la borró");
  await p.click(".utu"); await p.waitForFunction(() => K.diario.sesiones.length === 1);
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("progreso-horizontal", async () => {
  const {ctx, p} = await conReloj({width: 844, height: 390});
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await tick(p, 40000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
  await ir(p, "#/progreso");
  ok(await p.$(".split>.lado .semanas") && await p.$(".split>.abierto .res"), "en horizontal, la lista a la izquierda y la sesión a la derecha");
  const w = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(w <= 844, "se desborda: " + w);
  await ctx.close();
});

prueba("respaldo-de-ida-y-vuelta", async () => {
  /* se guarda el archivo, se trae en un teléfono limpio y queda todo igual; traerlo dos veces no duplica */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await tick(p, 40000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
  await anotarMarca(p, {valor: 20, fecha: "2026-10-15"});
  await p.evaluate(() => K.diario.perfilPoner("peso", 72));
  await ir(p, "#/vos/respaldo");
  const [d] = await Promise.all([p.waitForEvent("download"), p.click("#rs-guardar")]);
  ok(d.suggestedFilename() === "kozmos-respaldo_2026-10-20.json", "nombre del archivo: " + d.suggestedFilename());
  const f = await d.path();
  await ir(p, "#/vos"); ok((await p.textContent('[data-ir="#/vos/respaldo"] em')) === "Hoy", "no recuerda cuándo se guardó");
  const antes = await diarioDe(p);
  const {ctx: c2, p: p2} = await pagina();
  await ir(p2, "#/vos/respaldo");
  await p2.setInputFiles("#rs-archivo", f); await p2.waitForSelector(".utoast");
  ok((await p2.textContent(".utoast .utx")) === "Trajiste 1 sesión y 1 marca", "el aviso: " + await p2.textContent(".utoast .utx"));
  const despues = await diarioDe(p2);
  ok(antes === despues, "el respaldo no vuelve igual: " + antes.length + " / " + despues.length);
  await p2.reload(); await p2.waitForSelector("main.view");
  ok(await diarioDe(p2) === antes, "después de cerrar y abrir, no quedó guardado");
  await p2.setInputFiles("#rs-archivo", f); await p2.waitForSelector(".utoast.solo");
  ok((await p2.textContent(".utoast .utx")) === "Ya tenías todo.", "traerlo dos veces: " + await p2.textContent(".utoast .utx"));
  /* un archivo cualquiera no toca nada */
  await p2.setInputFiles("#rs-archivo", {name: "x.json", mimeType: "application/json", buffer: Buffer.from('{"app":"barra-y-bici","sess":[]}')});
  await p2.waitForFunction(() => document.querySelector(".utoast .utx")?.textContent === "Ese archivo no es un respaldo de Kozmos.");
  ok(p2._errores.length === 0 && p._errores.length === 0, "errores: " + [...p._errores, ...p2._errores].join(" | "));
  await c2.close(); await ctx.close();
});

prueba("respaldo-deshacer", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/vos/respaldo");
  const o = {app: "kozmos", formato: 1, mediciones: [{id: "m1", estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 61, fecha: "2026-10-01"}], sesiones: [], perfil: {equipo: ["barra"]}};
  await p.setInputFiles("#rs-archivo", {name: "r.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(o))});
  await p.waitForSelector(".utoast .utu");
  ok(await p.evaluate(() => K.diario.mediciones.length === 1 && K.diario.perfil.equipo.join() === "barra"), "no entró");
  await p.click(".utu"); await p.waitForFunction(() => K.diario.mediciones.length === 0 && !K.diario.perfil.equipo);
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("avisos", async () => {
  /* solo sonido: no vibra */
  const {ctx, p} = await conReloj();
  await ir(p, "#/vos"); await p.click("#avisos-menu"); await p.click('.pmi[data-id="suena"]');
  ok((await p.textContent("#avisos-menu em")) === "Solo sonido", "no cambió");
  await ir(p, "#/cielo/front-lever"); await p.click('[data-probar="front-lever"]'); await p.waitForSelector(".ses.prueba");
  await tick(p, 66000);
  ok((await p.evaluate(() => window.__V)).length === 0, "vibró con «Solo sonido»");
  await ctx.close();
});

/* ===== Etapa 5: rutinas, hazañas y tus días ===== */
const menuHoy = async (p, id) => { await p.click("#hoy-mas"); await p.click(`.pmi[data-id="${id}"]`); };
const aPlanes = async p => { await p.click('nav.barra button[data-tab="planes"]'); await esperarTitulo(p, "Planes"); };
prueba("rutina-cardio-entera", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["motor"]);
  await aPlanes(p);
  ok(await p.$$eval('.lado .ajr[data-ir^="#/planes/rutinas/"]', x => x.length) === 26, "no están las 26 rutinas");
  await p.click('[data-ir="#/planes/rutinas/c0a5"]'); await esperarTitulo(p, "Correr tus primeros 5 km");
  ok(await p.$$eval(".rut-dia", x => x.length) === 3, "la semana no tiene 3 días");
  await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  ok((await p.textContent(".hoy-origen")).includes("sem 1 de 9"), "Hoy no muestra la rutina: " + await p.textContent(".hoy-origen"));
  await p.click("#s-empezar"); await p.waitForSelector(".ses.tramo");
  ok(await p.textContent(".ses-tit h1") === "Entrada en calor", "el primer tramo: " + await p.textContent(".ses-tit h1"));
  await tick(p, 301000);
  ok(await p.evaluate(() => K.sesion.estado().s === 1) && await p.textContent(".ses-tit h1") === "Fuerte", "no pasó solo al tramo siguiente");
  ok((await p.evaluate(() => window.__V)).length > 0, "no vibró al cambiar de tramo");
  /* la pausa frena el tramo */
  await p.click("#s-pausa"); const antes = await reloj(p, "queda"); await tick(p, 20000);
  ok(await reloj(p, "queda") === antes, "la pausa no frenó el tramo"); await p.click("#s-pausa");
  for (let i = 0; i < 40 && await fase(p) !== "cierre"; i++) await tick(p, 60000);
  ok(await fase(p) === "cierre", "no llegó al final: " + await fase(p));
  await p.click("#s-terminar"); await p.waitForSelector(".res");
  const reg = await p.evaluate(() => K.diario.sesiones[K.diario.sesiones.length - 1]);
  ok(reg.rutina?.id === "c0a5" && reg.rutina.sesion === 0, "la sesión no quedó como de la rutina");
  ok(reg.bloques[0].series.some(x => x.ejercicio === "trote" && x.tipo === "minutos" && x.valor === 1), "no anotó el trote: " + JSON.stringify(reg.bloques[0].series));
  ok((await p.textContent(".res")).includes("Lo que sigue"), "el resumen no dice lo que sigue");
  await p.click("[data-volver]"); await esperarTitulo(p, "Hoy");
  ok((await p.textContent(".hoy-rut")).includes("1 de 27"), "la rutina no avanzó");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rutina-superserie", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.evaluate(() => K.diario.perfilPoner("equipo", ["barra"]));
  /* una prueba de otra constelación (o una larga, de minutos) no se mete antes de la rutina */
  await p.evaluate(() => K.diario.anotar({estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 55, fecha: "2026-10-19", catalogo: 1}));
  await ir(p, "#/planes/rutinas/base_cali"); await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  ok(await p.evaluate(() => K.hoyPlan().bloques.every(b => !b.prueba)), "la rutina arranca con una prueba que no entrena");
  await p.click("#s-empezar"); await p.waitForSelector(".ses.tramo");
  /* la entrada en calor se puede saltear entera */
  await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await p.waitForSelector(".ses.serie");
  const ejs = [];
  for (let i = 0; i < 4; i++){
    ejs.push(await p.evaluate(() => K.sesion.paso().ejercicio));
    await tick(p, 30000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
    if (i === 0){ await tick(p, 1000); ok(!(await p.$(".ses.descanso.fin")) && await reloj(p, "queda-lb") === "Sin descanso", "entre los dos de la superserie no hay descanso ni destello"); }
    await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  }
  ok(ejs.join() === "dominada-negativa,sentadilla,dominada-negativa,sentadilla", "la superserie no alterna: " + ejs);
  /* cortada después de la mitad no cuenta... y la sesión real, con su entrada en calor, vuelve entera del respaldo */
  await p.click("#s-cortar"); await p.waitForSelector(".res");
  const r = await p.evaluate(() => { const x = K.respaldo.leer(JSON.stringify(K.respaldo.armar(K.diario, K.VERSION, K.CATALOGO.version))); return {d: x.descartadas, n: x.sesiones.length, err: x.error, cal: K.diario.sesiones.at(-1).bloques[0].series[0]}; });
  ok(!r.err && r.d === 0 && r.n === 1, "el respaldo pierde la sesión de rutina: " + JSON.stringify(r));
  ok(r.cal.ejercicio === null && r.cal.tipo === "tramos", "la entrada en calor no queda como tramos: " + JSON.stringify(r.cal));
  ok(await p.evaluate(() => K.rutinaActual().cur.i === 0), "una sesión cortada antes de la mitad hizo avanzar la rutina");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* ===== Escaleras: el escalón de cada ejercicio sale del diario ===== */
/* dos sesiones de la base: la negativa en el tope dos veces (▲), sentadillas en el medio (=) y fondos en el banco sin el mínimo (▼) */
const sEsc = (id, fecha, i, grupos) => ({id, fecha, inicio: `${fecha}T18:00:00.000Z`, fin: `${fecha}T18:45:00.000Z`, duracion: 2700, cortada: false, catalogo: 1, rutina: {id: "base_cali", sesion: i},
  bloques: grupos.map(([esc, ej, vs, rango, o], k) => ({orden: k + 1, familia: "fu", objetivo: o, series: vs.map(v => ({ejercicio: ej, tipo: "repeticiones", objetivo: o, valor: v, ...(esc ? {escalera: esc, rango, n: vs.length} : {})}))}))});
const HIST_ESC = [
  sEsc("e1", "2026-10-14", 0, [["tirar", "dominada-negativa", [5, 5, 5], [3, 5], 5], ["piernas", "sentadilla", [9, 9, 9], [8, 12], 9], ["fondos", "fondo-banco", [4, 4, 3], [6, 10], 6]]),
  sEsc("e2", "2026-10-16", 1, [["tirar", "dominada-negativa", [5, 5, 5], [3, 5], 5], ["piernas", "sentadilla", [10, 10, 9], [8, 12], 10], ["fondos", "fondo-banco", [5, 4, 4], [6, 10], 6]])];
const sembrarEsc = (p, ss = HIST_ESC) => p.evaluate(async ss => {
  await K.diario.perfilPoner("rumbo", ["front-lever"]); await K.diario.perfilPoner("equipo", ["barra"]);
  for (const s of ss) await K.diario.guardarSesion(s);
  await K.diario.perfilPoner("rutina", {id: "base_cali", desde: "2026-10-01"}); K.refrescar();
}, ss);
/* de la entrada en calor a la primera serie de fuerza */
const aLaSerie = async p => { await p.click("#s-empezar"); await p.waitForSelector(".ses.tramo"); await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await p.waitForSelector(".ses.serie"); };

prueba("escalera-sensacion", async () => {
  /* cómo te quedó la serie: tres botones opcionales en el descanso, que se guardan en la serie; sin tocar, valen las repeticiones */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarEsc(p, []); await p.waitForSelector("#s-empezar");
  await aLaSerie(p);
  ok((await p.textContent(".ses-donde")).includes("Tirar"), "la sesión no dice la escalera: " + await p.textContent(".ses-donde"));
  await tick(p, 20000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.$$eval(".ses-b .sens [data-sens]", bs => bs.map(b => b.textContent).join()) === "Sobró,Justo,No llegué", "faltan los tres botones");
  ok(await p.$$eval(".sens [aria-pressed=true]", x => x.length) === 0, "arranca con algo elegido");
  ok(await p.getAttribute('[data-sens="justo"]', "class").then(c => c.includes("inf")), "no marca lo que dicen las repeticiones (el objetivo justo)");
  /* subís las repeticiones: lo que dirían cambia sin volver a dibujar */
  await p.click('[data-spaso="1"][data-campo="valor"]'); await p.click('[data-spaso="1"][data-campo="valor"]');
  ok(await p.getAttribute('[data-sens="sobro"]', "class").then(c => c.includes("inf")), "con dos de más no dice que sobró");
  await p.click('[data-sens="sobro"]'); ok(await p.getAttribute('[data-sens="sobro"]', "aria-pressed") === "true", "el toque no queda marcado");
  await p.click('[data-sens="sobro"]'); ok(await p.$$eval(".sens [aria-pressed=true]", x => x.length) === 0, "tocar de nuevo no lo saca");
  await p.click('[data-sens="no-llego"]');
  /* el botón está al alcance del pulgar: en la mitad de abajo */
  ok(await p.evaluate(() => document.querySelector(".sens").getBoundingClientRect().top > innerHeight / 2), "los botones no quedan abajo");
  await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  await tick(p, 20000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso"); await p.click("#s-seguir");
  const h = await p.evaluate(() => K.sesion.estado().hechos.filter(x => x.tipo === "repeticiones"));
  ok(h[0].sensacion === "no-llego" && h[0].escalera === "tirar" && h[0].rango.join() === "3,5" && h[0].n === 3 && h[0].valor === 5, "la serie no guarda escalera, rango y sensación: " + JSON.stringify(h[0]));
  ok(h[1].escalera === "piernas" && !("sensacion" in h[1]), "sin tocar, la serie no lleva sensación: " + JSON.stringify(h[1]));
  /* y llega al diario y al respaldo */
  await p.click("#s-cortar"); await p.waitForSelector(".res");
  const r = await p.evaluate(() => { const x = K.diario.sesiones.at(-1).bloques.flatMap(b => b.series).find(y => y.escalera === "tirar"), b = K.respaldo.leer(JSON.stringify(K.respaldo.armar(K.diario, K.VERSION, K.CATALOGO.version))); return {x, d: b.descartadas, err: b.error}; });
  ok(r.x.sensacion === "no-llego" && r.x.rango.join() === "3,5" && !r.err && r.d === 0, "el diario o el respaldo pierden la serie: " + JSON.stringify(r));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("escalera-isla", async () => {
  /* subiste de escalón: la serie lo dice y la isla también */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarEsc(p); await p.waitForSelector("#s-empezar");
  await aLaSerie(p);
  ok(await p.evaluate(() => K.sesion.paso().ejercicio) === "dominada", "no subió a la dominada: " + await p.evaluate(() => K.sesion.paso().ejercicio));
  ok((await p.textContent(".ses-tit .lb")).includes("▲ nuevo"), "la serie no dice que es nuevo: " + await p.textContent(".ses-tit .lb"));
  ok((await p.textContent(".ses-reloj")).includes("repeticiones"), "falta lo que toca");
  await tick(p, 4000);
  await p.click("#s-mas"); await p.click('.pmi[data-id="cielo"]'); await esperarTitulo(p, "Cielo"); await tick(p, 500);
  ok((await p.textContent("#isla")).trim().startsWith("Dominada · ▲ nuevo "), "la isla: " + await p.textContent("#isla"));
  /* en la serie que sigue (sentadilla, mismo escalón) no hay marca */
  await p.click("#isla"); await p.waitForSelector(".ses.serie"); await p.click("#s-listo"); await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  ok(!(await p.textContent(".ses-tit .lb")).includes("▲"), "la sentadilla dice que es nueva");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("escalera-resumen", async () => {
  /* el resumen de una sesión: ▲ subiste, = seguís (con lo que toca la próxima), ▼ bajás */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarEsc(p);
  await ir(p, "#/progreso/e2"); await p.waitForSelector(".res-esc");
  const fs = await p.$$eval(".res-esc li", ls => ls.map(l => [l.className, l.querySelector(".res-signo").textContent, l.querySelector(".ses-fila").textContent.trim()]));
  const de = n => fs.find(f => f[2].startsWith(n)) || [];
  ok(de("Tirar")[0] === "sube" && de("Tirar")[1] === "▲" && de("Tirar")[2].includes("Dominada negativa → Dominada"), "tirar: " + JSON.stringify(de("Tirar")));
  ok(de("Piernas")[0] === "igual" && de("Piernas")[1] === "=" && de("Piernas")[2].includes("11 · 11 · 10"), "piernas: " + JSON.stringify(de("Piernas")));
  ok(de("Fondos")[0] === "baja" && de("Fondos")[1] === "▼" && de("Fondos")[2].includes("Flexión cerrada"), "fondos: " + JSON.stringify(de("Fondos")));
  /* la primera sesión: todavía nada cambia */
  await ir(p, "#/progreso/e1"); await p.waitForSelector(".res-esc");
  ok(await p.$$eval(".res-esc li.sube, .res-esc li.baja", x => x.length) === 0, "en la primera sesión ya cambió algo");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("escalera-hoy", async () => {
  /* Tu avance: el escalón de cada escalera, igual en Hoy y en Planes */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarEsc(p); await p.waitForSelector(".hoy-rut .esc-mini");
  const filas = async sel => p.$$eval(sel + " .esc-mini li", ls => ls.map(l => [l.querySelector(".em-nom").textContent, l.querySelector(".em-n").textContent, l.querySelector(".esc-sub").getAttribute("aria-label"), l.querySelectorAll(".esc-sub i").length]));
  const h = await filas(".hoy-rut");
  ok(h.map(f => f[0]).join() === "Tirar,Piernas,Fondos,Isquios,Remo,Empujar,L-sit", "las escaleras de Hoy: " + h.map(f => f[0]));
  ok(JSON.stringify(h[0]) === '["Tirar","4/7","Escalón 4 de 7: Dominada",7]', "tirar en Hoy: " + JSON.stringify(h[0]));
  ok(h[2][1] === "1/2" && h[2][2].endsWith("Flexión cerrada"), "fondos en Hoy (sin paralelas): " + JSON.stringify(h[2]));
  /* una escalerita: los escalones suben de alto, lo hecho en tinta y el de ahora en color */
  ok(await p.$eval(".hoy-rut .esc-mini li .esc-sub", x => x.querySelectorAll("i.d").length === 3 && x.querySelector("i.n") === x.children[3] && x.children[0].offsetHeight < x.children[6].offsetHeight), "la escalerita de tirar no se dibuja bien");
  ok(!(await p.textContent(".hoy-rut")).includes("de 24"), "Hoy sigue mostrando las semanas en vez de los escalones");
  await ir(p, "#/planes/rutinas/base_cali"); await p.waitForSelector(".rut-esc");
  ok(JSON.stringify(await filas(".rut-esc")) === JSON.stringify(h), "Planes no muestra lo mismo que Hoy");
  ok((await p.textContent(".rut")).includes("Tus escalones"), "Planes no dice que son tus escalones");
  /* el escalón es tuyo, no de la rutina: otra rutina con la misma escalera arranca donde estás */
  await ir(p, "#/planes/rutinas/prim_dom"); await p.waitForSelector(".rut-esc");
  ok((await p.textContent(".rut")).includes("Sus escaleras") && JSON.stringify((await filas(".rut-esc"))[0]) === JSON.stringify(h[0]), "otra rutina no arranca en tu escalón: " + JSON.stringify((await filas(".rut-esc"))[0]));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("escalera-diario-viejo", async () => {
  /* las sesiones guardadas antes de las escaleras (sin escalera, rango ni sensación) cargan, cuentan y ubican el escalón */
  const {ctx, p} = await conReloj();
  const viejas = [sEsc("v1", "2026-10-12", 0, [[null, "dominada-negativa", [5, 5, 5], null, 5], [null, "sentadilla", [10, 10, 10], null, 10]]),
    sEsc("v2", "2026-10-14", 1, [[null, "dominada-negativa", [5, 5, 4], null, 5], [null, "sentadilla", [10, 10, 10], null, 10]])];
  await ir(p, "#/hoy"); await sembrarEsc(p, viejas); await p.reload(); await p.waitForSelector(".hoy-rut .esc-mini");
  const r = await p.evaluate(() => ({i: K.rutinaActual().cur.i, n: K.diario.sesiones.length, es: K.rutina.escalerasDe(K.rutinaActual().r, K.ctxRutina()).map(x => x.id + ":" + x.paso.ejercicio).join()}));
  ok(r.n === 2 && r.i === 2, "las sesiones viejas no cuentan: " + JSON.stringify(r));
  ok(r.es.startsWith("tirar:dominada-negativa,piernas:sentadilla"), "el escalón no sale de las sesiones viejas: " + r.es);
  /* el resumen viejo se abre igual, y el respaldo las devuelve enteras */
  await ir(p, "#/progreso/v2"); await p.waitForSelector(".res");
  const b = await p.evaluate(() => { const x = K.respaldo.leer(JSON.stringify(K.respaldo.armar(K.diario, K.VERSION, K.CATALOGO.version))); return {d: x.descartadas, n: x.sesiones.length, err: x.error}; });
  ok(!b.err && b.d === 0 && b.n === 2, "el respaldo pierde sesiones viejas: " + JSON.stringify(b));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* ===== Los días de una rutina: qué toca cada día, sin «Día 1 · Día 1» ===== */
prueba("rutina-dias-nombres", async () => {
  /* en las 26 rutinas: un día por tarjeta, sin el nombre repetido, y cada día dice qué se hace */
  const {ctx, p} = await pagina();
  await ir(p, "#/planes");
  const rs = await p.evaluate(() => K.RUTINAS.map(r => [r.id, r.dias]));
  ok(rs.length === 26, "no están las 26 rutinas");
  for (const [id, dias] of rs){
    await ir(p, `#/planes/rutinas/${id}`); await p.waitForSelector(".rut-dia");
    const ds = await p.$$eval(".rut-dia", xs => xs.map(x => ({t: x.querySelector(".lb, span")?.textContent || "", filas: x.querySelectorAll(".ln.toca").length})));
    ok(ds.length === dias, `${id}: ${ds.length} días, esperaba ${dias}`);
    for (const d of ds){
      ok(!/d[ií]a\s+\S+\s*·\s*d[ií]a\s/i.test(d.t), `${id}: el día dice «${d.t}»`);
      ok(d.filas > 0, `${id}: «${d.t}» no dice qué se hace`);
    }
  }
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rutina-dias-te-toca", async () => {
  /* la rutina que seguís: lo hecho de la semana, «Te toca» igual que Hoy, cada escalera con tu escalón y series × rango */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarEsc(p); await p.waitForSelector(".hoy-toca");
  const hoy = await p.$$eval(".hoy-toca .ln.toca .tg", xs => xs.flatMap(x => x.textContent.split(" + ").map(y => y.trim())));
  await ir(p, "#/planes/rutinas/base_cali"); await p.waitForSelector(".rut-dia.te-toca");
  ok(await p.$$eval(".rut-dia.hecho", x => x.length) === 2, "no marca los dos días hechos de la semana");
  const toca = await p.$eval(".rut-dia.te-toca", x => ({t: x.querySelector(".lb").textContent, filas: [...x.querySelectorAll(".ln.toca")].map(y => [y.querySelector(".tg").textContent, y.querySelector(".num").textContent])}));
  ok(toca.t === "Te toca · Día C", "el día que toca dice: " + toca.t);
  ok(hoy.every(q => toca.filas.some(([n]) => n === q)), `«Te toca» no es lo de Hoy: ${hoy} / ${toca.filas.map(f => f[0])}`);
  const tirar = await p.evaluate(() => K.ej(K.rutina.escalerasDe(K.rutinaDe("base_cali"), K.ctxRutina()).find(x => x.id === "tirar").paso.ejercicio).nombre);
  ok(toca.filas.some(([n, v]) => n === tirar && /^\d+ × \d+–\d+$/.test(v)), `la escalera de tirar no dice ${tirar} con series × rango: ` + JSON.stringify(toca.filas));
  ok(await p.evaluate(() => [...document.querySelectorAll(".rut-dia .ln.toca")].every(x => x.scrollWidth <= x.clientWidth + 1) && document.documentElement.scrollWidth <= innerWidth), "una fila de los días se desborda");
  /* otra semana, con el menú: la de prueba lo dice y no hay «Te toca»; elegir no guarda nada ni suma pasos */
  const h0 = await p.evaluate(() => history.length);
  await p.click("#rut-sem"); await p.click('.pmi[data-id="4"]'); await p.waitForSelector(".rut-dias ~ *, .hoy-sp");
  ok((await p.textContent(".rut .hoy-sp")).includes("Semana 4: prueba"), "la semana de prueba no lo dice");
  ok(!(await p.$(".rut-dia.te-toca")) && (await p.textContent("#rut-sem")).includes("Semana 4"), "el menú no cambió de semana");
  ok(await p.evaluate(() => history.length) === h0, "elegir la semana suma pasos al botón atrás");
  /* una rutina que no seguís: los días con tus escalones, como si la empezaras hoy */
  await ir(p, "#/planes/rutinas/gimnasta"); await p.waitForSelector(".rut-dia");
  ok(!(await p.$(".rut-dia.te-toca")) && (await p.textContent(".rut-dias-tx")).includes("Si la empezás hoy"), "una rutina ajena no dice que es con tus escalones");
  const tirarG = await p.evaluate(() => K.ej(K.rutina.escalerasDe(K.rutinaDe("gimnasta"), K.ctxRutina()).find(x => x.id === "tirar").paso.ejercicio).nombre);
  ok((await p.textContent(".rut-dia")).includes(tirarG), "el día A de Gimnasta no arranca en tu escalón de tirar: " + tirarG);
  /* motor: qué es y cuánto; y en Hoy el bloque ya no se llama como el día */
  await ir(p, "#/planes/rutinas/c0a5"); await p.waitForSelector(".rut-dia");
  ok(/Trote\s*8 × 1 min · 1:30 suave/.test(await p.textContent(".rut-dia")), "Correr tus primeros 5 km no dice el trote: " + await p.textContent(".rut-dia"));
  await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  ok(!/^D[ií]a/.test(await p.textContent(".hoy-toca .ln.toca .tg")), "en Hoy el bloque de motor se llama como el día");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rutina-dias-horizontal", async () => {
  /* en horizontal, los días van en la rutina abierta a la derecha, como Ajustes, sin desbordar */
  const {ctx, p} = await conReloj({width: 844, height: 390});
  await ir(p, "#/hoy"); await sembrarEsc(p);
  await ir(p, "#/planes/rutinas/base_cali"); await p.waitForSelector(".split>.abierto .rut-dia.te-toca");
  /* la pantalla entra girando: se mide cuando quedó quieta */
  await p.waitForFunction(() => !document.getAnimations().some(a => a.playState === "running"), null, {timeout: 3000}).catch(() => {});
  const r = await p.evaluate(() => { const a = document.querySelector(".split>.lado").getBoundingClientRect(), b = document.querySelector(".split>.abierto").getBoundingClientRect(), d = document.querySelector(".split>.abierto .rut-dias").getBoundingClientRect();
    return {lado: b.left >= a.right - 1 && d.left >= b.left - 1 && d.right <= b.right + 1, r: [a.left, a.right, b.left, b.right, d.left, d.right].map(Math.round), ancho: document.documentElement.scrollWidth <= innerWidth,
      filas: [...document.querySelectorAll(".rut-dia .ln.toca")].every(x => x.scrollWidth <= x.clientWidth + 1)}; });
  ok(r.lado && r.ancho && r.filas, "los días en horizontal: " + JSON.stringify(r));
  await p.click(".split>.abierto #rut-sem"); await p.click('.pmi[data-id="3"]'); await p.waitForFunction(() => document.querySelector("#rut-sem")?.textContent.includes("Semana 3"));
  ok(await p.$(".split>.abierto .rut-dias") && await p.$('.split>.lado .ajr[data-sel], .split>.lado .pl-rut[data-sel]'), "al cambiar de semana se pierde lo abierto");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("escalera-horizontal", async () => {
  /* en horizontal los tres botones entran en la columna de la derecha, con Seguir a la vista; el resumen y Hoy también */
  const {ctx, p} = await conReloj({width: 844, height: 390});
  await ir(p, "#/hoy"); await sembrarEsc(p); await p.waitForSelector(".hoy-rut .esc-mini");
  const cols = sel => p.evaluate(([a, b]) => { const x = document.querySelector(a).getBoundingClientRect(), y = document.querySelector(b).getBoundingClientRect(); return y.left >= x.right - 1 && document.documentElement.scrollWidth <= innerWidth; }, sel);
  ok(await cols([".hoy-a", ".hoy-b"]), "Hoy en horizontal no va en dos columnas");
  await aLaSerie(p); await tick(p, 20000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  const r = await p.evaluate(() => { const a = document.querySelector(".ses-a").getBoundingClientRect(), b = document.querySelector(".ses-b").getBoundingClientRect(), s = document.querySelector(".sens").getBoundingClientRect(), btn = document.querySelector("#s-seguir").getBoundingClientRect();
    return {lado: b.left >= a.right - 1 && s.left >= a.right - 1, ve: btn.bottom <= innerHeight && s.top >= 0, ancho: document.documentElement.scrollWidth <= innerWidth}; });
  ok(r.lado && r.ve && r.ancho, "descanso: " + JSON.stringify(r));
  await ir(p, "#/hoy/resumen/e2"); await p.waitForSelector(".res-esc");
  ok(await cols([".res-a", ".res-b"]) && await p.evaluate(() => document.querySelector(".res-esc").getBoundingClientRect().left >= document.querySelector(".res-a").getBoundingClientRect().right - 1), "el resumen en horizontal: los escalones no van a la derecha");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* ===== Pruebas (Modelo B): las hazañas miden algo, tienen escala y encienden estrellas en el Cielo ===== */
const hzSes = (id, fecha, hz, ej, tipo, v) => ({id, fecha, inicio: `${fecha}T19:00:00.000Z`, fin: `${fecha}T19:05:00.000Z`, duracion: 300, cortada: false, catalogo: 1, encendio: [],
  hazana: {id: hz, v: 2, valor: v, completa: true, ejercicio: ej, tipo},
  bloques: [{orden: 0, familia: "fu", objetivo: "max", hazana: hz, series: [{ejercicio: ej, tipo, objetivo: "max", valor: v, hazana: hz}]}]});
const sembrarSes = (p, ss, perfil = {}) => p.evaluate(async ([ss, perfil]) => { for (const [k, v] of Object.entries(perfil)) await K.diario.perfilPoner(k, v); for (const s of ss) await K.diario.guardarSesion(s); K.refrescar(); }, [ss, perfil]);
const escribir = async (p, v) => { await p.fill("#s-valor", String(v)); await p.evaluate(v => K.ses.escribir("valor", String(v)), v); };
prueba("hazana-prueba-maximo", async () => {
  /* Dominadas al máximo (perseo): ×15 enciende en dos constelaciones a la vez y el resumen muestra la escala */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await aPlanes(p);
  ok(await p.$$eval('.lado [data-ir^="#/planes/hazanas/"]', x => new Set(x.map(y => y.dataset.ir)).size) === 8, "no están las 8 pruebas");
  await ir(p, "#/planes/hazanas/perseo"); await esperarTitulo(p, "Dominadas al máximo");
  ok(!(await p.$("#hz-nivel")), "quedó el menú de niveles");
  ok((await p.textContent(".hz-escala")).includes("Todavía no la hiciste") && await p.$$eval(".hz-escala .esc-pie span", x => x.length) === 5, "la escala no tiene sus cinco magnitudes");
  await p.click("#hz-empezar"); await p.waitForSelector(".ses.serie");
  ok(await p.$(".ses-escala .escala") && (await p.textContent(".ses-tit .lb")).includes("Dominadas al máximo"), "la sesión no dice qué prueba es ni muestra la escala");
  await tick(p, 30000); await p.click("#s-listo"); await p.waitForSelector(".ses.cierre");
  await escribir(p, 15); await p.click("#s-terminar"); await p.waitForSelector(".res");
  const reg = await p.evaluate(() => K.diario.sesiones.at(-1));
  ok(reg.hazana?.id === "perseo" && reg.hazana.v === 2 && reg.hazana.valor === 15 && reg.hazana.ejercicio === "dominada" && reg.bloques[0].series[0].hazana === "perseo", "la prueba no quedó guardada: " + JSON.stringify(reg.hazana));
  ok(reg.encendio.includes("muscle-up.dominadas-10") && reg.encendio.includes("un-brazo.dominadas-15"), "no encendió en las dos constelaciones: " + reg.encendio);
  ok(await p.$$eval(".res-varias .res-una", x => x.length) === 2, "el resumen no muestra las dos constelaciones");
  ok(await p.$(".res-pruebas .escala .esc-yo") && (await p.textContent(".res-tit")).includes("×15") && (await p.textContent(".res-tit")).includes("m2"), "el resumen no muestra la marca en su escala: " + await p.textContent(".res-tit"));
  ok((await p.textContent(".res-nuevas")).includes("Dominadas ×10"), "no lista las estrellas nuevas");
  /* la prueba abierta: tu marca, cuándo toca y tus veces */
  await ir(p, "#/planes/hazanas/perseo");
  ok((await p.textContent(".hz-ult")).includes("×15") && (await p.textContent(".hz-escala")).includes("En 6 semanas") && (await p.textContent(".hz-veces")).includes("m2"), "la prueba no muestra tu marca: " + await p.textContent(".hz-escala"));
  ok(await p.evaluate(() => K.cieloActual().constelaciones.find(c => c.id === "muscle-up").estrellas[0].encendida), "el Cielo no la leyó");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("hazana-escalera-y-reloj", async () => {
  /* Dominadas minuto a minuto (andromeda): cada minuto una dominada más; «No llegué» cuenta el último minuto completo */
  const {ctx, p} = await conReloj();
  await ir(p, "#/planes/hazanas/andromeda"); await p.click("#hz-empezar"); await p.waitForSelector(".ses.circuito");
  await tick(p, 5000); ok(await reloj(p, "fase") === "×1", "el primer minuto no pide una: " + await reloj(p, "fase"));
  await tick(p, 4 * 60000 + 2000); ok(await reloj(p, "fase") === "×5", "el quinto minuto no pide cinco: " + await reloj(p, "fase"));
  await p.click("#s-vuelta"); await p.waitForSelector(".ses.cierre");
  ok(await p.inputValue("#s-valor") === "4", "no propone el último minuto completo: " + await p.inputValue("#s-valor"));
  await p.click("#s-terminar"); await p.waitForSelector(".res");
  let x = await p.evaluate(() => K.diario.sesiones.at(-1).bloques[0].series[0]);
  ok(x.ejercicio === "dominada" && x.valor === 4 && x.hazana === "andromeda", "la escalera no anotó las dominadas: " + JSON.stringify(x));
  /* 12 minutos en bici (pegaso): el reloj corre doce minutos y después se anotan los km; la segunda vez mide la mejora */
  for (const [km, n] of [[6.2, 1], [6.9, 2]]){
    await ir(p, "#/planes/hazanas/pegaso"); await p.click("#hz-empezar"); await p.waitForSelector(".ses.serie");
    ok((await reloj(p, "fase")).startsWith("12:") || (await reloj(p, "fase")).startsWith("11:"), "Motor 12 no cuenta doce minutos: " + await reloj(p, "fase"));
    await tick(p, 12 * 60000 + 1000); ok((await reloj(p, "fase-lb")).includes("anotá"), "al llegar no pide anotar");
    await p.click("#s-listo"); await p.waitForSelector(".ses.cierre");
    ok((await p.textContent(".ses-anota .lb")).includes("km"), "no pregunta los km");
    await escribir(p, km); await p.click("#s-terminar"); await p.waitForSelector(".res");
    if (n === 1) await p.clock.runFor(86400000);
  }
  const mj = await p.evaluate(() => K.cielo.deSesiones(K.diario.sesiones).filter(m => m.tipo === "mejora").map(m => m.valor));
  ok(mj.length === 2 && mj[0] === 0 && Math.abs(mj[1] - 11.3) < .05, "la mejora contra tu primera vez no se calcula: " + mj);
  /* Sentarte y pararte (sagitario): de medio punto, de 0 a 10; Alcance de piernas (casiopea): los centímetros bajan de cero */
  await ir(p, "#/planes/hazanas/sagitario"); await p.click("#hz-empezar"); await p.waitForSelector(".ses.serie"); await p.click("#s-listo"); await p.waitForSelector(".ses.cierre");
  await escribir(p, 9.5); await p.click('[data-spaso="1"]'); await p.click('[data-spaso="1"]');
  ok(await p.inputValue("#s-valor") === "10", "los puntos pasan de 10: " + await p.inputValue("#s-valor"));
  await p.click('[data-spaso="-1"]'); ok(await p.inputValue("#s-valor") === "9.5", "los puntos no van de medio en medio");
  await p.click("#s-cortar"); await p.waitForSelector(".res");
  await ir(p, "#/planes/hazanas/casiopea"); await p.click("#hz-empezar"); await p.waitForSelector(".ses.serie"); await p.click("#s-listo"); await p.waitForSelector(".ses.cierre");
  await escribir(p, 0); await p.click('[data-spaso="-1"]'); await p.click('[data-spaso="-1"]');
  ok(await p.inputValue("#s-valor") === "-2", "los centímetros no bajan de cero");
  await p.click("#s-terminar"); await p.waitForSelector(".res");
  x = await p.evaluate(() => K.diario.sesiones.at(-1).bloques[0].series[0]);
  ok(x.tipo === "cm" && x.valor === -2, "no guardó los centímetros negativos: " + JSON.stringify(x));
  const b = await p.evaluate(() => { const r = K.respaldo.leer(JSON.stringify(K.respaldo.armar(K.diario, K.VERSION, K.CATALOGO.version))); return {d: r.descartadas, n: r.sesiones.length, err: r.error}; });
  ok(!b.err && b.d === 0 && b.n === 5, "el respaldo pierde pruebas: " + JSON.stringify(b));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("hazana-datos-viejos", async () => {
  /* las hazañas de antes (por niveles) cargan, se ven en tu historia y en la prueba, y no cuentan como marcas */
  const {ctx, p} = await conReloj();
  const viejas = [{id: "hv1", fecha: "2026-07-12", inicio: "2026-07-12T19:00:00.000Z", fin: "2026-07-12T19:20:00.000Z", duracion: 1200, cortada: false, catalogo: 1, encendio: [], hazana: {id: "hercules", nivel: 1, valor: 845, completa: true},
      bloques: [{orden: 0, familia: "fu", clase: "circuito", nombre: "Hércules", series: [{ejercicio: "hercules", tipo: "hazana", valor: 845}]}]},
    {id: "hv2", fecha: "2026-07-20", inicio: "2026-07-20T19:00:00.000Z", fin: "2026-07-20T19:20:00.000Z", duracion: 1200, cortada: false, catalogo: 1, encendio: [], hazana: {id: "perseo", nivel: 2, valor: 7, completa: true},
      bloques: [{orden: 0, familia: "fu", clase: "circuito", nombre: "Perseo", series: [{ejercicio: "perseo", tipo: "hazana", valor: 7}]}]}];
  await ir(p, "#/hoy"); await sembrarSes(p, viejas); await p.reload(); await p.waitForSelector("main.view");
  await ir(p, "#/progreso/hv1"); await p.waitForSelector(".res");
  ok((await p.textContent(".res-txt")).includes("versión anterior") && (await p.textContent(".res-datos")).includes("14:05"), "el resumen viejo: " + await p.textContent(".res-txt"));
  await ir(p, "#/progreso"); ok((await p.textContent(".lado")).includes("Flexiones a ritmo · Intermedio"), "Progreso no muestra la hazaña vieja");
  await ir(p, "#/planes/hazanas/perseo");
  ok((await p.textContent(".hz-veces")).includes("versión anterior") && (await p.textContent(".hz-escala")).includes("Todavía no la hiciste"), "la prueba no separa la versión anterior");
  ok(await p.evaluate(() => K.cielo.deSesiones(K.diario.sesiones).length === 0), "las hazañas viejas cuentan como marcas");
  const b = await p.evaluate(() => { const r = K.respaldo.leer(JSON.stringify({...K.respaldo.armar(K.diario, K.VERSION, K.CATALOGO.version), formato: 1})); return {d: r.descartadas, n: r.sesiones.length, err: r.error}; });
  ok(!b.err && b.d === 0 && b.n === 2, "un respaldo de formato 1 no se lee: " + JSON.stringify(b));
  ok(!(await p.evaluate(() => document.body.innerText)).includes("undefined"), "aparece «undefined»");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("planes-proxima-prueba", async () => {
  /* arriba de Planes, la próxima prueba: la que toca antes, con su escala, tus veces y «Probar ahora» */
  const {ctx, p} = await conReloj();
  const otras = [["hercules", "flexion", "repeticiones", 22], ["sagitario", "del-piso", "puntos", 7], ["andromeda", "dominada", "repeticiones", 5], ["casiopea", "pike-alcance", "cm", 2],
    ["pegaso", "bici-12", "km", 6], ["orion", "mil-saltos", "tiempo", 700], ["draco", "l-sit", "segundos", 12]].map(([h, e, t, v], k) => hzSes("o" + k, "2026-10-10", h, e, t, v));
  await ir(p, "#/hoy"); await sembrarSes(p, [hzSes("t1", "2026-08-12", "perseo", "dominada", "repeticiones", 9), hzSes("t2", "2026-09-01", "perseo", "dominada", "repeticiones", 12), ...otras]);
  await ir(p, "#/planes"); await p.waitForSelector(".pl-prox");
  const t = await p.textContent(".pl-prox");
  ok(t.includes("Dominadas al máximo") && t.includes("toca ya") && t.includes("×12") && t.includes("m3"), "la próxima prueba no es Dominadas al máximo con tu última: " + t);
  ok(await p.$(".pl-prox .figura") && await p.$(".pl-prox .escala .esc-yo") && await p.$(".pl-prox .escala .esc-antes") && await p.$(".pl-prox .hz-linea"), "a la tarjeta le falta la figura, la escala o tus veces");
  ok(!(await p.$('.lado .ajr[data-ir="#/planes/hazanas/perseo"]')), "la próxima se repite en la lista");
  ok((await p.textContent('.ajr[data-ir="#/planes/hazanas/hercules"]')).includes("hace 10 días"), "la lista no dice cuándo la hiciste");
  await ir(p, "#/planes/hazanas/perseo");
  ok((await p.textContent(".hz-escala")).includes("+3 desde agosto"), "no se compara con la vez anterior: " + await p.textContent(".hz-escala"));
  await ir(p, "#/planes"); await p.click("#pl-probar"); await p.waitForSelector(".ses.serie");
  ok(await p.evaluate(() => K.sesion.bloque().hazana === "perseo"), "«Probar ahora» no arranca la próxima prueba");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("planes-familia", async () => {
  /* las pruebas y las rutinas se filtran por familia con un menú desplegable, no con chips; la elección queda */
  const {ctx, p} = await pagina();
  await ir(p, "#/planes");
  ok(!(await p.$(".chip, .chips")), "hay chips en Planes");
  await p.click("#pl-fam-pruebas"); await p.waitForSelector(".pop");
  ok(await p.$$eval('.pop .pmi[role="menuitemradio"]', x => x.length) === 4, "el menú no tiene Todas y las tres familias");
  await p.click('.pmi[data-id="mo"]'); await p.waitForFunction(() => document.querySelector("#pl-fam-pruebas").textContent.includes("Motor"));
  const fams = await p.$$eval('.lado .aj .ajr[data-ir^="#/planes/hazanas/"]', xs => xs.map(x => x.dataset.ir.split("/").pop()));
  ok(fams.length && fams.every(id => ["pegaso", "orion"].includes(id)), "el filtro de pruebas: " + fams);
  await p.click("#pl-fam-rutinas"); await p.click('.pmi[data-id="ra"]'); await p.waitForFunction(() => document.querySelector("#pl-fam-rutinas").textContent.includes("Rango"));
  const rs = await p.evaluate(() => [...document.querySelectorAll('.lado .ajr[data-ir^="#/planes/rutinas/"]')].map(x => K.rutinaDe(x.dataset.ir.split("/").pop()).familia));
  ok(rs.length && rs.every(f => f === "ra"), "el filtro de rutinas: " + rs);
  await p.reload(); await p.waitForSelector("#pl-fam-pruebas");
  ok((await p.textContent("#pl-fam-pruebas")).includes("Motor") && (await p.textContent("#pl-fam-rutinas")).includes("Rango"), "la familia elegida no queda");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rutina-linea-escalon", async () => {
  /* debajo de «Seguir esta rutina», una línea: el escalón es tuyo; siguiéndola, la rutina dice cuándo es la prueba */
  const {ctx, p} = await pagina();
  await ir(p, "#/planes/rutinas/prim_dom"); await p.waitForSelector("#rut-seguir");
  ok(await p.evaluate(() => { const b = document.querySelector("#rut-seguir"), l = document.querySelector(".rut-escalon"); return l && l.textContent.includes("El escalón es tuyo") && b.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING; }), "falta la línea del escalón debajo de «Seguir esta rutina»");
  ok((await p.textContent(".rut-bloque")).includes("de carga y 1 de prueba"), "la rutina no dice cómo son sus bloques");
  await ir(p, "#/planes/rutinas/z2"); ok(!(await p.$(".rut-escalon")), "una rutina sin escaleras habla de escalones");
  await ir(p, "#/planes/rutinas/prim_dom"); await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  await ir(p, "#/planes/rutinas/prim_dom");
  ok(!(await p.$(".rut-escalon")) && /Prueba en la semana \d/.test(await p.textContent(".rut-bloque")), "siguiéndola no dice cuándo es la prueba: " + await p.textContent(".rut-bloque"));
  await ir(p, "#/planes");
  ok(/Prueba en la semana \d/.test(await p.textContent(".pl-rut")) && await p.$(".pl-rut .esc-mini"), "Tu rutina en Planes no muestra escalones y prueba");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* ===== Filas de Hoy y la meta (vuelta 20) ===== */
/* «Empezar» al alcance del pulgar: entero en la pantalla, en la mitad de abajo y sin tapar la barra */
const alPulgar = p => p.evaluate(() => { const b = document.querySelector("#s-empezar").getBoundingClientRect(), n = document.querySelector("nav.barra")?.getBoundingClientRect();
  const sobreBarra = !n || n.width < n.height || b.bottom <= n.top + 1; return {ok: b.top >= innerHeight * .5 && b.bottom <= innerHeight && sobreBarra, r: [b.top, b.bottom, innerHeight].map(Math.round)}; });
prueba("hoy-filas-superserie", async () => {
  /* Hoy dice lo mismo que el día de la rutina: una fila por ejercicio con series × rango; la superserie, junta y dicha */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarEsc(p); await p.waitForSelector(".hoy-toca .toca-par");
  const hoy = await p.$$eval(".hoy-toca .ln.toca", xs => xs.map(y => [y.querySelector(".tg").textContent, y.querySelector(".num").textContent]));
  ok(hoy.every(([q]) => !q.includes(" + ")), "Hoy sigue juntando la superserie en una fila: " + JSON.stringify(hoy));
  const pares = await p.$$eval(".hoy-toca .toca-par", xs => xs.map(x => [x.querySelectorAll(".ln.toca").length, x.querySelector(".toca-par-tx")?.textContent]));
  ok(pares.length >= 1 && pares.every(([n, t]) => n === 2 && t === "en superserie"), "la superserie no va junta: " + JSON.stringify(pares));
  ok(await p.evaluate(() => !document.querySelector(".hoy-toca .chip, .hoy-toca .pill")), "Hoy usa chips");
  /* al pulgar arriba de todo, sin desplazar */
  const a = await alPulgar(p); ok(a.ok, "«Empezar» no queda al alcance del pulgar: " + JSON.stringify(a.r));
  await ir(p, "#/planes/rutinas/base_cali"); await p.waitForSelector(".rut-dia.te-toca");
  const dia = await p.$eval(".rut-dia.te-toca", x => [...x.querySelectorAll(".ln.toca")].map(y => [y.querySelector(".tg").textContent, y.querySelector(".num").textContent]));
  ok(JSON.stringify(dia) === JSON.stringify(hoy), `Hoy y el día de la rutina no dicen lo mismo: ${JSON.stringify(hoy)} / ${JSON.stringify(dia)}`);
  ok(await p.$$eval(".rut-dia.te-toca .toca-par", x => x.length) === pares.length, "el día de la rutina no junta la superserie igual que Hoy");
  /* la sesión sigue alternando la superserie */
  await ir(p, "#/hoy"); await aLaSerie(p);
  const ejs = [await p.evaluate(() => K.sesion.paso().ejercicio)];
  await p.click("#s-listo"); await p.waitForSelector(".ses.descanso"); await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  ejs.push(await p.evaluate(() => K.sesion.paso().ejercicio));
  ok(ejs[0] !== ejs[1], "la sesión dejó de alternar la superserie: " + ejs);
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
  /* en horizontal, igual: «Empezar» entero y a mano */
  const h = await conReloj({width: 844, height: 390});
  await ir(h.p, "#/hoy"); await sembrarEsc(h.p); await h.p.waitForSelector(".hoy-toca .toca-par");
  const b = await alPulgar(h.p); ok(b.ok, "en horizontal, «Empezar» no queda a mano: " + JSON.stringify(b.r));
  ok(await h.p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll(".hoy-toca .ln.toca")].every(x => x.scrollWidth <= x.clientWidth + 1)), "Hoy desborda en horizontal");
  ok(h.p._errores.length === 0, "errores: " + h.p._errores.join(" | "));
  await h.ctx.close();
});
/* cuatro sesiones de la Base con las mismas sentadillas: tres sin mejorar, la escalera de piernas se traba y toca más liviana */
const HIST_TRABA = ["2026-10-06", "2026-10-08", "2026-10-10", "2026-10-13"].map((f, i) => sEsc("t" + i, f, i, [["tirar", "dominada-negativa", [3 + i, 3, 3], [3, 5], 3], ["piernas", "sentadilla", [9, 9, 9], [8, 12], 9]]));
prueba("hoy-mas-liviana", async () => {
  /* una escalera en descarga lo dice en Hoy y en el día de la rutina, como la serie en la sesión */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarEsc(p, HIST_TRABA); await p.waitForSelector(".hoy-toca .toca-marca");
  const filas = await p.$$eval(".hoy-toca .ln.toca", xs => xs.map(y => [y.querySelector(".tg").textContent, y.querySelector(".toca-marca")?.textContent || ""]));
  ok(filas.some(([q, m]) => q === "Sentadilla" && m === "más liviana"), "la sentadilla trabada no dice más liviana: " + JSON.stringify(filas));
  ok(filas.filter(([, m]) => m).every(([q]) => q === "Sentadilla"), "dice más liviana lo que no lo es: " + JSON.stringify(filas));
  await ir(p, "#/planes/rutinas/base_cali"); await p.waitForSelector(".rut-dia.te-toca");
  ok(await p.$eval(".rut-dia.te-toca", x => [...x.querySelectorAll(".ln.toca")].some(y => y.querySelector(".tg").textContent === "Sentadilla" && y.querySelector(".toca-marca")?.textContent === "más liviana")), "el día de la rutina no dice más liviana");
  /* la semana de prueba de la rutina: cada fila de la descarga lo dice */
  await p.click("#rut-sem"); await p.click('.pmi[data-id="4"]'); await p.waitForSelector(".rut .hoy-sp");
  ok(await p.$$eval(".rut-dia", xs => xs.every(x => [...x.querySelectorAll(".ln.toca")].filter(y => !/Entrada|Vuelta/.test(y.textContent)).every(y => y.querySelector(".toca-marca")))), "en la semana de prueba una fila no dice más liviana");
  /* y en la sesión, la serie también */
  await ir(p, "#/hoy");
  await p.click("#s-empezar"); await tick(p, 1000);
  const enSentadilla = () => p.evaluate(() => K.sesion.activa() && !K.sesion.bloque().clase && K.sesion.paso().ejercicio === "sentadilla" && !!document.querySelector(".ses.serie"));
  for (let k = 0; k < 12 && !(await enSentadilla()); k++){
    if (await p.$("#s-seguir")){ await p.click("#s-seguir"); await tick(p, 300); continue; }
    if (await p.evaluate(() => K.sesion.activa() && !K.sesion.bloque().clase)){ await p.click("#s-listo"); await tick(p, 300); continue; }
    await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await tick(p, 300);
  }
  ok((await p.textContent(".ses-marca")) === "más liviana", "la sesión no dice más liviana en la sentadilla");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* sesiones hechas de una rutina de motor, para llegar a una semana */
const sRut = (rid, n, fechas) => fechas.slice(0, n).map((f, i) => ({id: rid + i, fecha: f, inicio: `${f}T18:00:00.000Z`, fin: `${f}T18:20:00.000Z`, duracion: 1200, cortada: false, catalogo: 1, rutina: {id: rid, sesion: i},
  bloques: [{orden: 1, familia: "mo", clase: "tramos", nombre: "Soga", series: [{ejercicio: null, tipo: "tramos", valor: 600}]}]}));
prueba("rutina-meta", async () => {
  /* 100 flexiones: la semana 5 es de prueba y la 6, la meta, completa */
  const {ctx, p} = await conReloj();
  await ir(p, "#/planes/rutinas/cien"); await p.waitForSelector(".rut-dia");
  ok((await p.textContent(".rut-bloque")).includes("Prueba en la semana 5; la 6, la meta"), "el bloque no dice dónde está la meta: " + await p.textContent(".rut-bloque"));
  await p.click("#rut-sem"); await p.waitForSelector(".pmi");
  const items = await p.$$eval(".pmi", xs => xs.map(x => x.textContent.trim()));
  ok(items.includes("Semana 5: prueba") && items.includes("Semana 6: la meta") && !items.includes("Semana 6: prueba"), "el menú de semanas: " + items);
  await p.click('.pmi[data-id="6"]'); await p.waitForSelector(".rut .hoy-meta");
  ok((await p.textContent(".rut .hoy-meta")).trim() === "Semana 6: la meta · 100 flexiones seguidas", "la meta no se dice: " + await p.textContent(".rut .hoy-meta"));
  ok(!(await p.$(".rut-dia .toca-marca")) && (await p.textContent("#rut-sem")).includes("Semana 6: la meta"), "la meta va más liviana");
  await p.click("#rut-sem"); await p.click('.pmi[data-id="5"]'); await p.waitForSelector(".rut .hoy-sp:not(.hoy-meta)");
  ok((await p.textContent(".rut .hoy-sp")).includes("Semana 5: prueba") && await p.$(".rut-dia .toca-marca"), "la semana 5 no es la de prueba");
  /* siguiendo Soga hasta 1000 saltos: la semana 3 es de prueba y la 4, la meta, sin pruebas ni descarga */
  await ir(p, "#/hoy");
  const sembrarSoga = n => p.evaluate(async ss => { await K.diario.perfilPoner("equipo", ["soga"]); for (const s of ss) await K.diario.guardarSesion(s);
    await K.diario.perfilPoner("rutina", {id: "soga", desde: "2026-09-21"}); K.refrescar(); }, sRut("soga", n, DIAS_B));
  await sembrarSoga(6); await p.waitForSelector(".hoy-toca");
  ok((await p.textContent(".hoy-sp")).startsWith("Semana de prueba"), "la semana 3 de Soga no es de prueba");
  await p.evaluate(async ss => { for (const s of ss) await K.diario.guardarSesion(s); K.refrescar(); }, sRut("soga", 9, DIAS_B).slice(6));
  await p.waitForSelector(".hoy-meta"); await p.waitForFunction(() => document.querySelectorAll(".hoy-toca").length === 1);
  ok((await p.textContent(".hoy-meta")).trim() === "Semana 4: la meta · 1000 saltos seguidos", "Hoy no dice la meta: " + await p.textContent(".hoy-meta"));
  ok(!(await p.$(".hoy-toca .es-prueba")) && !(await p.$(".hoy-toca .toca-marca")), "la meta trae pruebas o va más liviana: " + await p.textContent(".hoy-toca"));
  ok((await p.textContent(".hoy-origen")).includes("sem 4 de 4"), "la meta no es la semana 4");
  await ir(p, "#/planes"); await p.waitForSelector(".pl-rut");
  ok((await p.textContent(".pl-rut")).includes("Esta semana es la meta"), "Tu rutina en Planes no dice la meta: " + await p.textContent(".pl-rut"));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* nueve sesiones de la Base: tres semanas de carga, y hoy toca la semana de prueba */
const DIAS_B = ["2026-09-21", "2026-09-23", "2026-09-25", "2026-09-28", "2026-09-30", "2026-10-02", "2026-10-12", "2026-10-14", "2026-10-16"];
prueba("semana-de-prueba-hoy", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  await sembrarEsc(p, DIAS_B.map((f, i) => sEsc("b" + i, f, i, [["tirar", "dominada-negativa", [5, 5, 5], [3, 5], 5], ["empujar", "flexion", [8, 8, 7], [6, 10], 8]])));
  await p.evaluate(() => K.diario.perfilPoner("rutina", {id: "base_cali", desde: "2026-09-21"}).then(() => K.refrescar()));
  await p.waitForSelector(".hoy-sp");
  const tx = await p.textContent(".hoy-sp");
  ok(/^Semana de prueba · \d+ pruebas · encienden hasta \d+ estrellas$/.test(tx.trim()), "Hoy no avisa la semana de prueba: " + tx);
  ok(await p.$$eval(".hoy-toca .toca.es-prueba", x => x.length) >= 2, "las pruebas no van en lo que toca");
  /* la sesión: pruebas primero; se anota la de Empuje y el resto se saltea */
  await p.click("#s-empezar"); await tick(p, 1000);
  for (let k = 0; k < 20 && !(await p.evaluate(() => K.sesion.bloque().hazana === "hercules")); k++){ await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await tick(p, 300); }
  ok(await p.evaluate(() => K.sesion.bloque().hazana === "hercules"), "la sesión de prueba no trae Empuje");
  await p.click("#s-listo"); await p.waitForSelector("#s-valor"); await escribir(p, 25);
  if (await p.$("#s-seguir")) await p.click("#s-seguir");
  for (let k = 0; k < 20 && await p.evaluate(() => K.sesion.activa()); k++){
    if (await p.$("#s-terminar")){ await p.click("#s-terminar"); break; }
    await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await tick(p, 300);
  }
  await p.waitForSelector(".res");
  const x = await p.evaluate(() => K.diario.sesiones.at(-1));
  ok(x.semanaPrueba?.bloque === 1 && x.semanaPrueba.rutina === "base_cali" && x.semanaPrueba.semana === 4 && x.semanaPrueba.pruebas >= 1, "la sesión no dice que fue de prueba: " + JSON.stringify(x.semanaPrueba));
  ok((await p.textContent(".res-txt")).includes("Semana de prueba") && await p.$(".res-pruebas .escala"), "el resumen no muestra la prueba");
  /* el resto de la semana es liviana, sin pruebas */
  await ir(p, "#/hoy"); await p.waitForSelector(".hoy-sp");
  ok((await p.textContent(".hoy-sp")).includes("más liviana") && !(await p.$(".hoy-toca .es-prueba")), "después de las pruebas, la semana sigue con pruebas");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("pruebas-horizontal", async () => {
  /* en horizontal, Planes es como Ajustes: la lista a la izquierda (la próxima prueba arriba) y la abierta a la derecha */
  const {ctx, p} = await conReloj({width: 844, height: 390});
  await ir(p, "#/planes");
  ok(await p.evaluate(() => { const a = document.querySelector(".split>.lado").getBoundingClientRect(), b = document.querySelector(".split>.abierto").getBoundingClientRect(), c = document.querySelector(".lado .pl-prox").getBoundingClientRect();
    return b.left >= a.right - 1 && c.right <= a.right + 1 && document.documentElement.scrollWidth <= innerWidth; }), "Planes en horizontal no sigue el patrón de Ajustes");
  ok(await p.$(".pl-prox[data-sel]") && await p.$(".split>.abierto #hz-empezar"), "a la derecha no está la próxima prueba");
  ok(await p.$$eval("#hz-empezar", x => x.length) === 1, "hay dos botones con el mismo id");
  await p.click('.lado [data-ir="#/planes/hazanas/orion"]'); await p.waitForFunction(() => document.querySelector(".split>.abierto .enc-tit h1")?.textContent === "1000 saltos de soga");
  ok(await p.evaluate(() => history.length) === 2, "abrir una prueba suma pasos al botón atrás");
  await p.click(".split>.abierto #hz-empezar"); await p.waitForSelector(".ses.circuito"); await tick(p, 5000); await tick(p, 600000);
  await p.click("#s-vuelta"); await p.waitForSelector(".ses.cierre"); await p.click("#s-terminar"); await p.waitForSelector(".res-pruebas");
  ok(await p.evaluate(() => { const a = document.querySelector(".res-a").getBoundingClientRect(), b = document.querySelector(".res-pruebas").getBoundingClientRect(); return b.left >= a.right - 1 && document.documentElement.scrollWidth <= innerWidth; }), "el resumen de la prueba en horizontal no va en dos columnas");
  ok(/10:0\d/.test(await p.textContent(".res-tit")), "Mil saltos no anotó el tiempo: " + await p.textContent(".res-tit"));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("tus-dias", async () => {
  /* el 20 de octubre de 2026 es martes: con lunes, miércoles y viernes, hoy descansás */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await ir(p, "#/vos/dias");
  for (const d of [0, 2, 4]) await p.click(`[data-dia="${d}"]`);
  await p.waitForFunction(() => JSON.stringify(K.diario.perfil.dias) === "[0,2,4]");
  await ir(p, "#/vos");
  ok((await p.textContent('[data-ir="#/vos/dias"]')).includes("Lun, mié y vie"), "Vos no resume tus días: " + await p.textContent('[data-ir="#/vos/dias"]'));
  await ir(p, "#/hoy");
  ok((await p.textContent(".hoy-descanso")).includes("Hoy descansás."), "no avisa que hoy descansás");
  ok((await p.textContent(".hoy-descanso")).includes("mañana"), "no dice cuándo sigue");
  await p.click("#hoy-igual"); await p.waitForSelector("#s-empezar");
  ok(!(await p.$(".hoy-descanso")), "Entrenar igual no muestra la sesión");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("planes-horizontal", async () => {
  const {ctx, p} = await pagina({width: 844, height: 390});
  await ir(p, "#/planes");
  ok(await p.evaluate(() => { const a = document.querySelector(".split>.lado").getBoundingClientRect(), b = document.querySelector(".split>.abierto").getBoundingClientRect(); return b.left >= a.right - 1 && b.width > 200; }), "Planes en horizontal no va en dos columnas");
  ok(await p.$(".split>.abierto #hz-empezar"), "a la derecha no está la próxima prueba abierta");
  /* los nombres de las pruebas entran enteros, también el más largo */
  const cortados = await p.$$eval(".lado .ajr .ses-fila", xs => xs.filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent));
  ok(!cortados.length, "nombres cortados en horizontal: " + cortados);
  await p.click('[data-ir="#/planes/rutinas/z2"]'); await p.waitForFunction(() => document.querySelector(".split>.abierto .enc-tit h1")?.textContent === "Bici suave y larga", null, {timeout: 3000}).catch(() => { throw new Error("no abre la elegida a la derecha"); });
  ok(await p.evaluate(() => history.length) === 2, "en horizontal, abrir una rutina no suma pasos al botón atrás");
  ok(await p.$('.split>.lado .ajr[data-sel][data-ir="#/planes/rutinas/z2"]'), "la rutina abierta no queda marcada en la lista");
  await p.click('[data-ir="#/planes/hazanas/andromeda"]'); await p.waitForFunction(() => document.querySelector(".split>.abierto .enc-tit h1")?.textContent === "Dominadas minuto a minuto", null, {timeout: 3000}).catch(() => { throw new Error("no abre la hazaña a la derecha"); });
  ok(await p.$(".split>.abierto #hz-empezar"), "a la derecha no está la hazaña abierta");
  /* siguiendo una rutina, Planes abre la tuya */
  await p.evaluate(() => K.diario.perfilPoner("rutina", {id: "z2", desde: K.hoy()}));
  await ir(p, "#/planes");
  ok(await p.textContent(".split>.abierto .enc-tit h1") === "Bici suave y larga", "siguiendo una rutina, Planes no abre la tuya");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rutina-dejar-y-deshacer", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/planes/rutinas/z2"); await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  await menuHoy(p, "dejar");
  await p.waitForFunction(() => !K.diario.perfil.rutina);
  ok((await p.textContent(".utoast .utx")).includes("Dejaste Bici suave y larga"), "el aviso no dice qué dejaste");
  await p.click(".utoast .utu");
  await p.waitForFunction(() => K.diario.perfil.rutina?.id === "z2", null, {timeout: 3000}).catch(() => { throw new Error("deshacer no vuelve a la rutina"); });
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

/* ===== Planes: rutinas y hazañas en su pestaña; Hoy dice de dónde sale lo de hoy ===== */
prueba("planes-pestana", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/hoy");
  /* el ⋯ de Hoy ya no lleva a rutinas ni a hazañas */
  await p.click("#hoy-mas"); await p.waitForSelector(".pop");
  const ids = await p.$$eval(".pmi", xs => xs.map(x => x.dataset.id));
  ok(!ids.includes("rutinas") && !ids.includes("hazanas") && ids.includes("rumbo") && ids.includes("anotar"), "el ⋯ de Hoy: " + ids);
  await p.keyboard.press("Escape");
  /* el ícono de Planes no es el de «Anotar algo hecho» ni el de ninguna otra pestaña */
  const ics = await p.evaluate(() => ({planes: K.I.planes, otros: [K.I.cal, K.I.hoy, K.I.cielo, K.I.progreso, K.I.vos]}));
  ok(ics.planes && !ics.otros.includes(ics.planes), "Planes no tiene su ícono");
  await aPlanes(p);
  ok(await p.evaluate(() => location.hash) === "#/planes", "la ruta de Planes no es #/planes");
  /* pruebas arriba, rutinas abajo */
  const [yh, yr] = await p.evaluate(() => ["#pl-hazanas", "#pl-rutinas"].map(s => document.querySelector(s).getBoundingClientRect().top));
  ok(yh < yr, "las hazañas no van arriba de las rutinas");
  ok(await p.$$eval('.lado [data-ir^="#/planes/hazanas/"]', x => new Set(x.map(y => y.dataset.ir)).size) === 8 && await p.$$eval('.lado .ajr[data-ir^="#/planes/rutinas/"]', x => x.length) === 26, "Planes no tiene las 8 pruebas y las 26 rutinas");
  /* abrir una hazaña y volver a Planes */
  await p.click('[data-ir="#/planes/hazanas/orion"]'); await esperarTitulo(p, "1000 saltos de soga");
  ok(await p.evaluate(() => location.hash) === "#/planes/hazanas/orion", "la hazaña no vive en Planes");
  ok(await p.getAttribute('nav.barra button[data-tab="planes"]', "aria-current") === "page", "adentro de una hazaña, la barra no marca Planes");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Planes");
  /* tocar Planes estando en Planes no suma pasos */
  await p.click('[data-ir="#/planes/rutinas/z2"]'); await esperarTitulo(p, "Bici suave y larga");
  const h0 = await p.evaluate(() => history.length);
  await p.click('nav.barra button[data-tab="planes"]'); await esperarTitulo(p, "Planes");
  ok(await p.evaluate(() => history.length) === h0, "volver a la raíz de Planes sumó pasos");
  ok(!(await p.evaluate(() => document.body.innerText)).includes("undefined"), "aparece «undefined»");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rutas-viejas", async () => {
  /* rutinas y hazañas vivían en Hoy: los enlaces viejos llevan a Planes sin sumar pasos */
  const {ctx, p} = await pagina();
  for (const [vieja, nueva, titulo] of [["#/hoy/rutinas", "#/planes", "Planes"], ["#/hoy/rutinas/base_cali", "#/planes/rutinas/base_cali", "Base de calistenia"],
    ["#/hoy/hazanas", "#/planes", "Planes"], ["#/hoy/hazanas/orion", "#/planes/hazanas/orion", "1000 saltos de soga"], ["#/hoy/rutinas/xyz", "#/planes/rutinas/xyz", "Planes"]]){
    await ir(p, vieja); await esperarTitulo(p, titulo);
    ok(await p.evaluate(() => location.hash) === nueva, `${vieja} no pasa a ${nueva}: ` + await p.evaluate(() => location.hash));
  }
  /* también navegando adentro de la app, sin dejar la vieja en el historial */
  await ir(p, "#/hoy"); const h0 = await p.evaluate(() => history.length);
  await p.evaluate(() => K.ir("#/hoy/hazanas/draco")); await esperarTitulo(p, "L-sit sostenido");
  ok(await p.evaluate(() => location.hash) === "#/planes/hazanas/draco", "K.ir a una ruta vieja no la cambia");
  ok(await p.evaluate(() => history.length) === h0 + 1, "la ruta vieja sumó un paso de más");
  await p.goBack(); await esperarTitulo(p, "Hoy");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("origen-de-hoy", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever", "motor"]);
  /* con rumbo: la fila dice de dónde sale y lleva a cambiarlo */
  const o = await p.textContent(".hoy-origen");
  ok(o.includes("Sale de tu rumbo") && o.includes("Front lever · Motor"), "la fila de origen con rumbo: " + o);
  await p.click(".hoy-origen .ajr"); await esperarTitulo(p, "Tu rumbo");
  await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  /* con rutina: su nombre, la semana y un toque a la rutina */
  await ir(p, "#/planes/rutinas/base_cali"); await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  const r = await p.textContent(".hoy-origen");
  ok(r.includes("Sale de tu rutina") && r.includes("Base de calistenia") && /sem 1 de \d+/.test(r), "la fila de origen con rutina: " + r);
  ok(!(await p.textContent(".hoy-rut")).includes("Base de calistenia"), "el nombre de la rutina se repite en la tarjeta");
  await p.click(".hoy-origen .ajr"); await esperarTitulo(p, "Base de calistenia");
  ok(await p.evaluate(() => location.hash) === "#/planes/rutinas/base_cali", "la fila no lleva a la rutina en Planes");
  ok(await p.$(".enc-acc #rut-mas"), "la rutina no ofrece dejarla");
  /* el ícono de rutina ya no es la órbita que parecía un ojo, y el rumbo tiene el suyo (no el de Cielo) */
  ok(await p.evaluate(() => !K.I.ruta.includes("ellipse") && K.I.rumbo && K.I.rumbo !== K.I.cielo), "los íconos de rutina y rumbo");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("primer-dia", async () => {
  /* el primer día, Hoy guía en tres pasos; con la primera sesión, la guía se va */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  const paso = () => p.$eval('.pasos [aria-current="step"]', x => x.textContent).catch(() => null);
  ok(await paso() === "1Elegí cómo", "Hoy no arranca en el paso 1: " + await paso());
  ok(await p.$$eval(".como-op", x => x.length) === 2 && await p.$('.ajr[data-ir^="#/planes/hazanas/"]'), "no ofrece rumbo, rutina y hazaña");
  /* elegir una rutina lleva a Planes, que es el paso 2 */
  await p.click('.como-op[data-ir="#/planes"]'); await esperarTitulo(p, "Planes");
  ok(await paso() === "2Elegí qué", "Planes no es el paso 2");
  await p.click('nav.barra button[data-tab="hoy"]'); await esperarTitulo(p, "Hoy");
  /* que Kozmos arme el día: Tu rumbo es el paso 2 */
  await p.click('.como-op[data-ir="#/hoy/rumbo"]'); await esperarTitulo(p, "Tu rumbo");
  ok(await paso() === "2Elegí qué", "Tu rumbo no es el paso 2");
  await p.click('[data-rumbo="front-lever"]'); await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  ok(await paso() === "3Empezá", "con rumbo, Hoy no es el paso 3: " + await paso());
  ok((await p.textContent(".hoy-origen")).includes("Front lever"), "el paso 3 no dice de dónde sale");
  /* la primera sesión: durante la sesión no hay guía, y al volver ya no está */
  await p.click("#s-empezar"); await p.waitForSelector(".ses.serie");
  await tick(p, 25000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
  await p.evaluate(() => K.deshacer.cerrar(true));
  await p.click("[data-volver]"); await esperarTitulo(p, "Hoy");
  ok(!(await p.$(".pasos")), "la guía sigue después de la primera sesión");
  await ir(p, "#/hoy/rumbo"); ok(!(await p.$(".pasos")), "Tu rumbo sigue con la guía");
  await ir(p, "#/planes"); ok(!(await p.$(".pasos")), "Planes sigue con la guía");
  /* sin rumbo y con historia, vuelve la tarjeta de siempre, no la guía */
  await p.evaluate(() => K.diario.perfilPoner("rumbo", [])); await ir(p, "#/hoy");
  ok(!(await p.$(".pasos")) && await p.$(".rumbo-vacio"), "sin rumbo y con historia volvió la guía");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

/* ===== Logo en movimiento y la barra con estrellas ===== */
prueba("logo-en-movimiento", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/hoy");
  /* el arranque se va solo, en menos de un segundo; en la misma apertura no vuelve */
  await p.waitForSelector(".mov-arranque", {state: "detached", timeout: 1200}).catch(() => { throw new Error("el arranque no se fue"); });
  await p.reload(); await p.waitForSelector("main.view");
  ok(!(await p.$(".mov-arranque")), "el arranque volvió a aparecer en la misma apertura");
  /* la estrella existe solo en la pestaña elegida */
  const estrellas = () => p.$$eval("nav.barra button", bs => bs.map(b => getComputedStyle(b.querySelector(".orb")).opacity));
  ok(JSON.stringify(await estrellas()) === '["1","0","0","0","0"]', "la estrella no está solo en Hoy: " + await estrellas());
  await p.click('nav.barra [data-tab="cielo"]'); await p.waitForSelector('nav.barra [data-tab="cielo"][aria-current]'); await p.waitForTimeout(300);
  ok(JSON.stringify(await estrellas()) === '["0","0","1","0","0"]', "la estrella no pasó a Cielo: " + await estrellas());
  /* la pantalla que se va gira y desaparece: no queda nada encima */
  await p.waitForFunction(() => document.querySelectorAll("main").length === 1, null, {timeout: 2000}).catch(() => { throw new Error("la pantalla vieja quedó en la página"); });
  await p.click('nav.barra [data-tab="vos"]'); await p.waitForSelector('nav.barra [data-tab="vos"][aria-current]'); await p.waitForTimeout(500);
  ok(await p.$eval('nav.barra [data-tab="vos"] .v1', x => getComputedStyle(x).fill) !== await p.$eval('nav.barra [data-tab="hoy"] circle', x => getComputedStyle(x).fill), "Vos no se prendió con sus colores");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
  /* si el navegador no deja leer el almacenamiento de la sesión, la app arranca igual, sin errores */
  const t = await pagina();
  await t.p.addInitScript(() => Object.defineProperty(window, "sessionStorage", {get(){ throw new DOMException("bloqueado", "SecurityError"); }}));
  await ir(t.p, "#/hoy"); await t.p.waitForTimeout(300);
  ok(t.p._errores.length === 0, "sin sessionStorage hubo errores: " + t.p._errores.join(" | "));
  await t.ctx.close();
  /* abrir sobre una sesión en curso: nada tapa la pantalla y el primer toque llega */
  const q = await pagina();
  await ir(q.p, "#/hoy"); await q.p.waitForSelector(".mov-arranque", {state: "detached"}); await rumbo(q.p, ["front-lever"]);
  await q.p.click("#s-empezar"); await q.p.waitForSelector("#s-listo");
  const q2 = await q.ctx.newPage(); await q2.goto(URL0 + "#/hoy/sesion"); await q2.waitForSelector("#s-listo"); await q2.waitForTimeout(150);
  ok(!(await q2.$(".mov-arranque")), "el arranque tapó una sesión en curso");
  await q.ctx.close();
  /* con movimiento reducido no hay arranque */
  const r = await pagina(undefined, {reducedMotion: "reduce"});
  await ir(r.p, "#/hoy");
  ok(!(await r.p.$(".mov-arranque")), "con movimiento reducido igual hubo arranque");
  await r.ctx.close();
});

prueba("persona-de-los-dibujos", async () => {
  /* en Vos se elige la persona de los dibujos: todo al azar de entrada, lo elegido manda en todos los ejercicios y se puede deshacer */
  const {ctx, p} = await pagina();
  await ir(p, "#/vos");
  ok((await p.$$eval("[data-rasgo] em", x => x.map(e => e.textContent))).every(t => t === "Al azar"), "de entrada no está todo al azar");
  await p.click("#rasgo-sexo"); await p.click('.pmi[data-id="hombre"]');
  ok((await p.textContent("#rasgo-sexo em")) === "Hombre", "la fila no muestra lo elegido");
  ok(await p.evaluate(() => document.activeElement.id) === "rasgo-sexo", "después de elegir, el foco se pierde");
  ok(await p.evaluate(() => Object.keys(K.POSES).every(id => K.fig.persona(id, "fu").sexo === "hombre")), "lo elegido no manda en los dibujos");
  /* con hombre elegido, el pelo ofrece solo sus peinados */
  await p.click("#rasgo-pelo");
  const pelos = await p.$$eval(".pmi", x => x.map(e => e.dataset.id));
  ok(pelos.includes("rulos") && !pelos.includes("colita"), "el pelo ofrece peinados que no van: " + pelos.join(","));
  await p.click('.pmi[data-id="rulos"]');
  await p.click("#rasgo-piel"); await p.click(".pmi:nth-of-type(3)");
  ok(await p.evaluate(() => K.prefs.get("persona", {}).pelo === "rulos" && !!K.prefs.get("persona", {}).piel), "no se guardó lo elegido");
  /* pasar a mujer devuelve al azar un peinado que no le va */
  await p.click("#rasgo-sexo"); await p.click('.pmi[data-id="mujer"]');
  ok(await p.evaluate(() => !K.prefs.get("persona", {}).pelo), "quedó un peinado de hombre para una mujer");
  await p.waitForSelector(".utoast"); await p.click(".utoast .utu");
  ok(await p.evaluate(() => K.prefs.get("persona", {}).sexo === "hombre" && K.prefs.get("persona", {}).pelo === "rulos"), "deshacer no volvió a lo de antes");
  /* sobrevive a cerrar y abrir */
  await p.reload(); await p.waitForSelector("main.view");
  ok(await p.evaluate(() => K.fig.persona("dominada", "fu").pelo === "rulos"), "al abrir de nuevo se perdió la persona elegida");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("maniqui", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.evaluate(() => K.diario.perfilPoner("equipo", ["barra"]));
  /* en la rutina, cada estrella de «Entrena para» muestra a su persona en un círculo */
  await ir(p, "#/planes/rutinas/base_cali");
  const filas = await p.$$eval(".ajr[data-ir^='#/cielo/']", fs => fs.map(f => !!f.querySelector(".fig-chica svg.fig")));
  ok(filas.length && filas.every(Boolean), "una estrella de la rutina sin dibujo: " + filas);
  await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  await p.click("#s-empezar"); await p.waitForSelector(".ses.tramo");
  await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await p.waitForSelector(".ses.serie");
  /* en la serie hay una sola figura y se mueve: el dibujo cambia con el tiempo */
  ok(await p.$$eval("svg.fig[data-fig]", x => x.length) === 1, "en la serie no hay una figura que se mueva");
  const antes = await p.$eval("svg.fig[data-fig]", x => x.innerHTML);
  await tick(p, 1200);
  ok(await p.$eval("svg.fig[data-fig]", x => x.innerHTML) !== antes, "la figura de la serie quedó quieta");
  /* en pausa la figura se queda donde está; al seguir, vuelve a moverse */
  await p.click("#s-mas"); await p.click('.pmi[data-id="pausa"]'); await p.waitForSelector(".ses-pausa");
  const quieta = await p.$eval("svg.fig[data-fig]", x => x.lastChild.innerHTML);
  await tick(p, 1500);
  ok(await p.$eval("svg.fig[data-fig]", x => x.lastChild.innerHTML) === quieta, "en pausa la figura sigue moviéndose");
  await p.click("#s-mas"); await p.click('.pmi[data-id="pausa"]'); await p.waitForFunction(() => !document.querySelector(".ses-pausa"));
  await tick(p, 1200);
  ok(await p.$eval("svg.fig[data-fig]", x => x.lastChild.innerHTML) !== quieta, "después de la pausa la figura no vuelve a moverse");
  /* la figura no tapa el número ni el botón */
  const caja = s => p.$eval(s, x => { const r = x.getBoundingClientRect(); return {t: r.top, b: r.bottom}; });
  const fig = await caja(".ses-fig"), num = await caja(".ses-reloj"), btn = await caja("#s-listo");
  ok(fig.b <= num.t + 1 && num.b <= btn.t, "la figura se encima con el número o el botón");
  /* en el descanso aparece el que sigue, en chico */
  await tick(p, 30000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.$(".ses-luego .fig-chica svg.fig"), "el descanso no muestra el ejercicio que sigue");
  /* al irse de la sesión no queda ninguna figura moviéndose (el reloj se apaga solo) */
  await p.click("#s-cortar"); await p.waitForSelector(".res"); await tick(p, 200);
  ok(!(await p.$("svg.fig[data-fig]")), "quedó una figura animada fuera de la sesión");
  /* en un circuito, cada ejercicio de la lista lleva su persona chiquita */
  await ir(p, "#/planes/hazanas/andromeda"); await p.click("#hz-empezar"); await p.waitForSelector(".ses.circuito");
  const conFig = await p.$$eval(".circ-items .ln", ls => ls.filter(l => l.querySelector(".fig-chica svg.fig")).length);
  ok(conFig > 0, "el circuito no muestra a nadie en la lista");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
  /* con movimiento reducido la figura está, pero quieta */
  const r = await pagina(undefined, {reducedMotion: "reduce"});
  await ir(r.p, "#/hoy"); await rumbo(r.p, ["front-lever"]); await r.p.click("#s-empezar"); await r.p.waitForSelector("#s-listo");
  ok(await r.p.$(".ses-fig svg.fig") && !(await r.p.$("svg.fig[data-fig]")), "con movimiento reducido la figura no queda quieta");
  await r.ctx.close();
  /* en horizontal entran la figura, el número y el botón, sin desplazar */
  const h = await pagina({width: 844, height: 390});
  await ir(h.p, "#/hoy"); await rumbo(h.p, ["front-lever"]); await h.p.click("#s-empezar"); await h.p.waitForSelector("#s-listo"); await h.p.waitForTimeout(1200); /* que termine de abrirse el disco */
  const fuera = await h.p.evaluate(() => [".ses-fig", ".ses-reloj", "#s-listo"].filter(s => { const r = document.querySelector(s).getBoundingClientRect(); return r.bottom > innerHeight + 1 || r.right > innerWidth + 1 || !r.height; }));
  ok(!fuera.length, "en horizontal no entra: " + fuera);
  await h.ctx.close();
});

/* ===== La APK de Android: la página de kozmos/apk/www con un Capacitor de mentira (el simulacro) =====
   El simulacro hace de puente nativo: anota cada llamada a un plugin en window.__nat y contesta como Android. */
async function enApk(vp, {cancelar = false} = {}){
  if (sinApk) throw new Error(sinApk);
  const r = await pagina(vp);
  await r.ctx.addInitScript(({cancelar}) => {
    window.__nat = []; window.__oyentes = {};
    const m = (...ns) => ns.map(name => ({name, rtype: "promise"}));
    const oir = [{name: "addListener", rtype: "callback"}, {name: "removeListener", rtype: "promise"}];
    window.androidBridge = {postMessage(){}};
    window.Capacitor = {Plugins: {}, PluginHeaders: [
      {name: "App", methods: [...m("exitApp", "minimizeApp", "getInfo"), ...oir]},
      {name: "Filesystem", methods: m("writeFile", "readFile")},
      {name: "Share", methods: m("share", "canShare")},
      {name: "SystemBars", methods: m("setStyle", "show", "hide")},
      {name: "Pantalla", methods: m("encender", "apagar", "vibrar")}],
      nativeCallback(plugin, metodo, op, cb){ window.__nat.push([plugin, metodo, op]); if (metodo === "addListener") window.__oyentes[plugin + "." + op.eventName] = cb; return "cb" + window.__nat.length; },
      nativePromise(plugin, metodo, op){
        window.__nat.push([plugin, metodo, op]);
        if (plugin === "Filesystem" && metodo === "writeFile"){ window.__archivo = op; return Promise.resolve({uri: "file:///data/user/0/ar.kozmos/cache/" + op.path}); }
        if (plugin === "Share" && metodo === "share") return cancelar ? Promise.reject(new Error("Share canceled")) : Promise.resolve({activityType: "com.google.android.gm"});
        return Promise.resolve({});
      }};
  }, {cancelar});
  return r;
}
const irApk = async (p, h = "") => { await p.goto(URL0 + "apk/" + h); await p.waitForSelector("main.view"); await p.waitForTimeout(80); };
const nat = (p, plugin, metodo) => p.evaluate(([a, b]) => window.__nat.filter(x => x[0] === a && (!b || x[1] === b)), [plugin, metodo]);
const atras = p => p.evaluate(() => window.__oyentes["App.backButton"]({canGoBack: true}));

prueba("apk-sin-service-worker", async () => {
  /* adentro de la APK no se registra el service worker y no hay manifiesto: la APK nueva trae la página nueva */
  const {ctx, p} = await enApk();
  await irApk(p);
  ok(await p.evaluate(() => !!K.apk && document.documentElement.classList.contains("apk")), "no se dio cuenta de que está en la APK");
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => navigator.serviceWorker.getRegistrations().then(r => r.length)) === 0, "registró el service worker");
  ok(!(await p.$('link[rel="manifest"]')), "quedó el manifiesto de la web");
  ok(!fs.existsSync(path.join(APK, "sw.js")) && !fs.existsSync(path.join(APK, "manifest.webmanifest")), "el armado de la APK trae sw.js o el manifiesto");
  ok(await p.textContent(".enc-tit h1") === "Hoy", "no arranca en Hoy");
  ok(await p.evaluate(() => document.fonts.ready.then(() => document.fonts.check('800 16px "Mona Sans"'))), "la letra no cargó");
  /* barras del sistema: iconos oscuros en claro y claros en oscuro, siguiendo el tema elegido */
  ok((await nat(p, "SystemBars", "setStyle")).at(-1)?.[2].style === "LIGHT", "las barras no siguen el tema claro");
  await p.evaluate(() => K.tema.poner("dark"));
  ok((await nat(p, "SystemBars", "setStyle")).at(-1)[2].style === "DARK", "las barras no siguen el tema oscuro");
  /* la web sigue igual: ahí no hay K.apk y el service worker se registra */
  const w = await pagina(); await ir(w.p, "");
  ok(await w.p.evaluate(() => K.apk === null && navigator.serviceWorker.ready.then(() => true)), "en la web cambió algo");
  ok(p._errores.length === 0 && w.p._errores.length === 0, "errores: " + [...p._errores, ...w.p._errores].join(" | "));
  await w.ctx.close(); await ctx.close();
});

prueba("apk-respaldo", async () => {
  /* guardar: el archivo va a la caché por Filesystem y se comparte por Share; traer: el selector de archivos de siempre */
  const {ctx, p} = await enApk();
  await irApk(p);
  await p.evaluate(async () => { await K.diario.perfilPoner("peso", 72); await K.diario.lote({poner: {mediciones: [{id: "m1", estrella: "front-lever.colgado-60s", ejercicio: "colgado-activo", tipo: "segundos", valor: 61, fecha: "2026-10-01"}], sesiones: []}}); });
  await irApk(p, "#/vos/respaldo");
  let bajo = false; p.on("download", () => { bajo = true; });
  await p.click("#rs-guardar"); await p.waitForSelector(".utoast");
  ok((await p.textContent(".utoast .utx")).startsWith("Respaldo guardado: 0 sesiones y 1 marca"), "el aviso: " + await p.textContent(".utoast .utx"));
  const a = await p.evaluate(() => window.__archivo);
  ok(a.directory === "CACHE" && a.encoding === "utf8" && /^kozmos-respaldo_\d{4}-\d{2}-\d{2}\.json$/.test(a.path), "el archivo: " + JSON.stringify({...a, data: undefined}));
  const sh = (await nat(p, "Share", "share"))[0][2];
  ok(sh.files.length === 1 && sh.files[0].endsWith("/cache/" + a.path), "no compartió el archivo: " + JSON.stringify(sh));
  ok(!bajo, "intentó descargar con <a download>");
  /* lo que se compartió vuelve entero en un teléfono limpio */
  const o = JSON.parse(a.data);
  ok(o.app === "kozmos" && o.mediciones.length === 1 && o.perfil.peso === 72, "el respaldo no tiene lo anotado");
  const l = await enApk(); await irApk(l.p, "#/vos/respaldo");
  await l.p.setInputFiles("#rs-archivo", {name: a.path, mimeType: "application/json", buffer: Buffer.from(a.data)});
  await l.p.waitForSelector(".utoast .utu");
  ok((await l.p.textContent(".utoast .utx")) === "Trajiste 1 marca", "al traerlo: " + await l.p.textContent(".utoast .utx"));
  ok(await l.p.evaluate(() => K.diario.mediciones.length === 1 && K.diario.perfil.peso === 72), "no entró");
  /* si la persona cierra el menú de compartir sin elegir, no se da por guardado */
  const c = await enApk(undefined, {cancelar: true}); await irApk(c.p, "#/vos/respaldo");
  await c.p.click("#rs-guardar"); await c.p.waitForTimeout(500);
  ok(!(await c.p.$(".utoast")) && (await c.p.evaluate(() => K.prefs.get("respaldo", null))) === null, "lo dio por guardado sin compartir");
  ok([p, l.p, c.p].every(x => x._errores.length === 0), "errores: " + [...p._errores, ...l.p._errores, ...c.p._errores].join(" | "));
  await c.ctx.close(); await l.ctx.close(); await ctx.close();
});

prueba("apk-atras", async () => {
  /* el botón atrás de Android: menú abierto → se cierra; adentro → vuelve; otra pestaña → Hoy; Hoy → sale */
  const {ctx, p} = await enApk();
  await irApk(p);
  ok((await nat(p, "App", "addListener")).some(x => x[2].eventName === "backButton"), "no escucha el botón atrás");
  await p.click('nav.barra button[data-tab="cielo"]'); await p.waitForSelector('main.view[data-tab="cielo"]');
  await p.click(".cst[data-ir], [data-ir^='#/cielo/']"); await p.waitForFunction(() => K.ruta().hondo === 1);
  ok(await atras(p) === "atras", "adentro de una constelación no vuelve");
  await p.waitForFunction(() => location.hash === "#/cielo");
  ok(await atras(p) === "atras", "no vuelve a Hoy por lo recorrido");
  await p.waitForFunction(() => K.ruta().tab === "hoy");
  ok(await atras(p) === "salir", "en Hoy no sale");
  ok((await nat(p, "App", "exitApp")).length === 1, "no llamó a salir");
  /* entrando directo a algo hondo, sin recorrido: sube a la raíz y después a Hoy */
  const d = await enApk(); await irApk(d.p, "#/vos/acerca");
  ok(await atras(d.p) === "arriba", "desde Acerca no sube"); await d.p.waitForFunction(() => location.hash === "#/vos");
  ok(await atras(d.p) === "hoy", "desde Vos no va a Hoy"); await d.p.waitForFunction(() => location.hash === "#/hoy");
  /* un menú abierto se cierra primero */
  await irApk(d.p, "#/vos"); await d.p.click("#tema-menu"); await d.p.waitForSelector('[role="menu"]');
  ok(await atras(d.p) === "menu", "no cerró el menú");
  ok(await d.p.evaluate(() => !K.menu._abierto && location.hash === "#/vos"), "con el menú abierto se movió de pantalla");
  ok(p._errores.length === 0 && d.p._errores.length === 0, "errores: " + [...p._errores, ...d.p._errores].join(" | "));
  await d.ctx.close(); await ctx.close();
});

prueba("apk-planes", async () => {
  /* el botón atrás recorre Planes: rutina → Planes → Hoy → sale */
  const {ctx, p} = await enApk();
  await irApk(p);
  await p.click('nav.barra button[data-tab="planes"]'); await esperarTitulo(p, "Planes");
  await p.click('[data-ir="#/planes/rutinas/z2"]'); await esperarTitulo(p, "Bici suave y larga");
  ok(await atras(p) === "atras", "desde una rutina no vuelve"); await esperarTitulo(p, "Planes");
  ok(await atras(p) === "atras", "desde Planes no vuelve a Hoy"); await esperarTitulo(p, "Hoy");
  ok(await atras(p) === "salir", "en Hoy no sale");
  /* entrando directo a una hazaña: sube a Planes y después a Hoy */
  const d = await enApk(); await irApk(d.p, "#/planes/hazanas/orion"); await esperarTitulo(d.p, "1000 saltos de soga");
  ok(await atras(d.p) === "arriba", "desde una hazaña no sube"); await d.p.waitForFunction(() => location.hash === "#/planes");
  ok(await atras(d.p) === "hoy", "desde Planes no va a Hoy"); await d.p.waitForFunction(() => location.hash === "#/hoy");
  /* una ruta vieja (por ejemplo, la de una sesión que quedó abierta) cae en Planes y atrás sube a Planes */
  const v = await enApk(); await irApk(v.p, "#/hoy/rutinas/z2"); await esperarTitulo(v.p, "Bici suave y larga");
  ok(await v.p.evaluate(() => location.hash) === "#/planes/rutinas/z2", "la ruta vieja no pasó a Planes en la APK");
  ok(await atras(v.p) === "arriba", "desde la ruta vieja no sube"); await v.p.waitForFunction(() => location.hash === "#/planes");
  ok([p, d.p, v.p].every(x => x._errores.length === 0), "errores: " + [...p._errores, ...d.p._errores, ...v.p._errores].join(" | "));
  await v.ctx.close(); await d.ctx.close(); await ctx.close();
});

prueba("apk-sesion", async () => {
  /* con una sesión en curso, atrás nunca la pierde: vuelve a Hoy con la isla y, en Hoy, deja la app en segundo plano */
  const {ctx, p} = await enApk();
  await p.clock.install({time: new Date("2026-10-20T10:00:00")});
  await irApk(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.click("#s-empezar"); await tick(p, 3000); await p.waitForSelector("#s-listo");
  ok((await nat(p, "Pantalla", "encender")).length >= 1, "no dejó la pantalla encendida");
  await p.evaluate(() => K.sesion.vibrar("ok"));
  ok(JSON.stringify((await nat(p, "Pantalla", "vibrar")).at(-1)?.[2]) === '{"patron":[14]}', "no vibra por el plugin");
  await atras(p); await p.waitForFunction(() => location.hash === "#/hoy");
  ok(await p.evaluate(() => K.sesion.activa()), "atrás cortó la sesión");
  ok(await p.evaluate(() => !document.querySelector("#isla").hidden), "no quedó la isla");
  ok(await atras(p) === "segundo-plano", "con la sesión en curso, atrás no la deja en segundo plano");
  ok((await nat(p, "App", "minimizeApp")).length === 1 && (await nat(p, "App", "exitApp")).length === 0, "cerró la app con la sesión en curso");
  ok(await p.evaluate(() => K.sesion.activa()), "la sesión se perdió");
  /* al cortarla, la pantalla se puede apagar de nuevo */
  await p.click("#isla"); await tick(p, 1000); await p.waitForSelector("#s-cortar"); await p.click("#s-cortar"); await tick(p, 1000);
  ok(await p.evaluate(() => !K.sesion.activa()), "no terminó la sesión");
  ok((await nat(p, "Pantalla", "apagar")).length >= 1, "la pantalla quedó encendida después de la sesión");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
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
