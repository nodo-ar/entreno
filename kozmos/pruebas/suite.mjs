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
  for (const h of ["#/hoy", "#/cielo", "#/cielo/front-lever", "#/cielo/parada-de-manos/anotar", "#/cielo/lastre/anotar/1", "#/cielo/espagat/anotar/4", "#/progreso", "#/vos", "#/vos/acerca", "#/vos/constructor", "#/xyz"]){
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
  ok(await p.textContent(".enc-tit small") === "1 de 86 estrellas", "Cielo no cuenta la estrella: " + await p.textContent(".enc-tit small"));
  ok(await p.textContent('.cons-fila[data-ir="#/cielo/front-lever"] em') === "1 de 8", "la fila no cuenta la estrella");
  ok(await p.evaluate(() => { const m = K.diario.mediciones[0]; return m.ejercicio === "colgado-activo" && m.tipo === "segundos" && m.catalogo === K.CATALOGO.version; }), "la marca no guarda qué midió");
  /* queda guardada en el teléfono */
  await p.reload(); await p.waitForSelector("main.view");
  ok(await p.textContent(".enc-tit small") === "1 de 86 estrellas", "al volver a abrir se perdió la marca");
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
  await ir(p, "#/cielo/espagat/anotar/4");
  ok(await p.textContent("#f-guardar") === "Lo logré" && !(await p.$("#f-valor")), "lo logrado pide un número");
  await p.click("#f-guardar"); await esperarTitulo(p, "Espagat");
  ok(await p.$eval(".est-fila:nth-child(4)", f => f.classList.contains("encendida")), "«Lateral completo» no se encendió");
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
  ok((await p.textContent(".rumbo-vacio .t1")) === "Elegí tu rumbo.", "sin rumbo no pide elegirlo");
  await p.click('[data-ir="#/hoy/rumbo"]'); await esperarTitulo(p, "Tu rumbo");
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
  ok(await reloj(p, "queda") === "1:10", "el descanso no siguió con el tiempo real: " + await reloj(p, "queda"));
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
