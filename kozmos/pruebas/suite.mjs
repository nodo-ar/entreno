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
  ok(JSON.stringify(await p.$$eval("nav.barra button", bs => bs.map(b => b.dataset.tab))) === '["hoy","planes","cielo","progreso","vos"]', "la barra no es Hoy, Planes, Cosmos, Progreso, Vos");
  ok(JSON.stringify(await p.$$eval("nav.barra button", bs => bs.map(b => b.getAttribute("aria-label")))) === '["Hoy","Planes","Cosmos","Progreso","Vos"]', "la barra no dice Cosmos");
  for (const [tab, titulo] of [["planes", "Planes"], ["cielo", "Tu cosmos"], ["progreso", "Progreso"], ["vos", "Vos"], ["hoy", "Hoy"]]){
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
  for (const h of ["#/hoy", "#/cielo", "#/cielo/front-lever", "#/cielo/parada-de-manos/anotar", "#/cielo/lastre/anotar/1", "#/cielo/espagat/anotar/4", "#/progreso", "#/vos", "#/vos/acerca", "#/vos/dias", "#/planes", "#/planes/rutinas/base_cali", "#/planes/hazanas/orion", "#/planes/pruebas", "#/planes/pruebas/centauro", "#/planes/ejercicios", "#/planes/ejercicios/dominada", "#/hoy/rutinas", "#/vos/constructor", "#/xyz"]){
    await ir(p, h);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(w <= 360, `${h}: ancho ${w}`);
  }
  /* el molde del día con muchas metas, y sus partes en la sesión (vuelta 28) */
  await p.evaluate(async () => { await K.diario.perfilPoner("equipo", ["barra", "paralelas", "pared", "poste", "mancuernas", "bici"]); await K.diario.perfilPoner("rumbo", ["front-lever", "planche", "muscle-up", "una-pierna", "draco", "lastre"]); K.refrescar(); });
  for (const h of ["#/hoy", "#/hoy/rumbo", "#/cielo"]){ await ir(p, h); const w = await p.evaluate(() => document.documentElement.scrollWidth); ok(w <= 360, `${h} con seis metas: ancho ${w}`); }
  await ir(p, "#/hoy"); await p.click("#s-empezar"); await p.waitForSelector(".ses");
  for (let k = 0; k < 7 && await p.evaluate(() => K.sesion.activa()); k++){
    const w = await p.evaluate(() => document.documentElement.scrollWidth); ok(w <= 360, `la sesión, bloque ${k}: ancho ${w}`);
    await p.evaluate(() => { K.sesion.saltear(); K.refrescar(); }); await p.waitForTimeout(150);
  }
  await ctx.close();
});

prueba("encabezado-compacto", async () => {
  const {ctx, p} = await pagina({width: 360, height: 640});
  await ir(p, "#/cielo");
  ok(!(await p.evaluate(() => document.body.classList.contains("compacto"))), "arranca compacto");
  await p.mouse.wheel(0, 260); await p.waitForFunction(() => document.body.classList.contains("compacto"));
  ok(await p.textContent("#tbt") === "Tu cosmos", "la barra compacta no dice Tu cosmos");
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
  /* elegir Oscuro: se aplica sin preguntar, el foco queda en la fila y se ve en la fila; no ofrece deshacer */
  await p.click("#tema-menu"); await p.click('.pmi[data-id="dark"]');
  ok(await p.getAttribute("html", "data-theme") === "dark", "no pasó a oscuro");
  ok(await p.evaluate(() => document.activeElement.id) === "tema-menu", "después de elegir, el foco se pierde");
  ok((await p.textContent("#tema-menu em")) === "Oscuro", "la fila no muestra el tema nuevo");
  await p.waitForTimeout(300);
  ok(!(await p.$(".utoast")), "cambiar el tema ofrece deshacer");
  /* volver atrás es elegir otro */
  await p.click("#tema-menu"); await p.click('.pmi[data-id="auto"]');
  ok(await p.getAttribute("html", "data-theme") === null, "no volvió a automático");
  ok(await p.evaluate(() => K.tema.actual()) === "auto", "no guardó automático");
  /* abrir y cerrar un menú con Escape no se lleva un deshacer pendiente (el de borrar, por ejemplo) */
  await p.evaluate(() => K.deshacer("Borraste una marca", () => {}));
  await p.click("#tema-menu"); await p.keyboard.press("Escape");
  ok(await p.$(".utoast:not(.out)"), "Escape en el menú borró el deshacer");
  await p.click(".utoast .utu");
  /* el aviso se va solo, salvo mientras lo tenés en foco */
  await p.evaluate(() => { K.DESHACER_MS = 400; K.deshacer("Borraste una marca", () => {}); });
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
  /* abrir otro ajuste no mueve la lista ni anima la pantalla (la fila se toca donde se ve: la lista ya no vuelve arriba al redibujarse) */
  await p.evaluate(() => document.querySelector('.ajr[data-ir="#/vos/acerca"]').scrollIntoView({block: "nearest"}));
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
  const tops = await p.evaluate(() => { document.querySelector(".split>.lado").scrollTop = 0; return [...document.querySelectorAll(".split h1")].map(h => Math.round(h.getBoundingClientRect().top)); });
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
  await ir(p, "#/cielo/xyz"); ok(await h1() === "Tu cosmos", "#/cielo/xyz no cae en Tu cosmos");
  await ir(p, "#/cielo/front-lever/otra"); ok(await h1() === "Front lever", "#/cielo/front-lever/otra no cae en la constelación");
  await ir(p, "#/cielo/front-lever/anotar/99"); ok(await h1() === "Anotar una marca", "una estrella que no existe no abre anotar");
  ok(await p.textContent("#f-estrella em") === "Colgado con hombros firmes 60 s", "con una estrella que no existe no arranca en la próxima");
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
  ok(await p.$$eval(".cielo-grilla .cons-tile svg.ico-cons", x => x.length) === 14, "no hay 14 constelaciones en el cielo");
  ok(await p.textContent(".enc-tit small") === "Todavía sin estrellas", "el cielo vacío dice otra cosa");
  ok(await p.$$eval(".cielo-grilla .ico-arco, .cielo-grilla .ico-sat", x => x.length) === 0, "hay anillos con avance sin marcas");
  await p.click('.cons-fila[data-ir="#/cielo/front-lever"]');
  await esperarTitulo(p, "Front lever");
  ok(await estadosFL(p) === "p-------", "Front lever vacía: " + await estadosFL(p));
  /* el cielo también se abre tocando la constelación, o con el teclado */
  await ir(p, "#/cielo");
  await p.focus('.cielo-grilla .cons-tile[data-ir="#/cielo/soga"]'); await p.keyboard.press("Enter");
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
  await p.goBack(); await esperarTitulo(p, "Tu cosmos");
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
  ok((await p.textContent(".utoast .utx")) === "Anotaste 45 s en Colgado con hombros firmes 60 s", "aviso: " + await p.textContent(".utoast .utx"));
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
  /* el mismo ejercicio: 25 s en «Horizontal con rodillas al pecho 20 s» encienden también la de 10 s */
  await ir(p, "#/cielo/front-lever/anotar/4");
  ok(await p.textContent("#f-estrella em") === "Horizontal con rodillas al pecho 20 s", "no abre la estrella pedida");
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
  await p.click('nav.barra button[data-tab="cielo"]'); await esperarTitulo(p, "Tu cosmos");
  ok(await p.evaluate(() => history.length) === hl, "la pestaña sumó un paso");
  await ir(p, "#/cielo/front-lever/anotar/1");
  /* − y + */
  await p.fill("#f-valor", "10"); await p.click('[data-paso="1"]'); await p.click('[data-paso="1"]'); await p.click('[data-paso="-1"]');
  ok(await p.inputValue("#f-valor") === "11", "− y + no suman de a uno");
  /* lo logrado: un solo botón */
  await ir(p, "#/cielo/espagat/anotar/5");
  ok(await p.textContent("#f-guardar") === "Lo logré" && !(await p.$("#f-valor")), "lo logrado pide un número");
  await p.click("#f-guardar"); await esperarTitulo(p, "Espagat");
  ok(await p.$eval(".est-fila:nth-child(5)", f => f.classList.contains("encendida")), "«Espagat abierto al costado» no se encendió");
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
  /* la fila se toca donde se ve: la lista ya no vuelve arriba al redibujarse (vuelta 32), así que se mide con la fila a la vista */
  await p.evaluate(() => document.querySelector('.cons-fila[data-ir="#/cielo/motor"]').scrollIntoView({block: "nearest"}));
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
  const tops = await p.evaluate(() => { document.querySelector(".split>.lado").scrollTop = 0; return [...document.querySelectorAll(".split h1")].map(h => Math.round(h.getBoundingClientRect().top)); });
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
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Tu cosmos");
  await p.click('.cons-fila[data-ir="#/cielo/draco"]'); await esperarTitulo(p, "Draco");
  ok(await p.evaluate(() => history.length) === h0 + 1, "volver sumó pasos al historial");
  /* entrar directo a una constelación (por ejemplo, desde un enlace): volver lleva al cielo igual */
  await ir(p, "#/cielo/draco/anotar");
  await p.reload(); await p.waitForSelector("main.view");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Draco");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Tu cosmos");
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
async function conReloj(vp, hora = "2026-10-20T10:00:00"){
  const r = await pagina(vp);
  await r.ctx.addInitScript(() => { window.__V = []; Object.defineProperty(navigator, "vibrate", {value: x => { window.__V.push(JSON.stringify(x)); return true; }, configurable: true}); });
  await r.p.clock.install({time: new Date(hora)});
  return r;
}
const rumbo = async (p, ids) => { await p.evaluate(ids => K.diario.perfilPoner("rumbo", ids).then(() => K.refrescar()), ids); await p.waitForSelector("#s-empezar"); };
/* Empezar y saltear la entrada en calor (las pruebas que miran la habilidad; la entrada tiene las suyas) */
const empezar = async p => { await p.click("#s-empezar"); await p.waitForSelector(".ses"); if (await p.$(".ses.tramo")){ await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); } await p.waitForSelector(".ses.serie, .ses.prueba"); };
const fase = p => p.evaluate(() => K.sesion.estado()?.fase || null);
const reloj = (p, k) => p.textContent(`[data-r="${k}"]`);
const tick = async (p, ms) => { await p.clock.runFor(ms); await p.evaluate(() => K.sesion.alLatir()); };

prueba("sesion-entera", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  /* el primer día, sin rumbo, Hoy ofrece que Kozmos arme el día (paso 1 de 3) */
  ok((await p.textContent(".como-op .t1")) === "Que Kozmos arme tu día", "sin rumbo no ofrece elegirlo");
  await p.click('.como-op[data-ir="#/hoy/equipo"]'); await esperarTitulo(p, "Tu equipo");
  await p.click('[data-equipo="barra"]'); await p.waitForSelector('[data-equipo="barra"][aria-pressed="true"]');
  /* Tu nivel sin contestar es «No sé»: arranca desde el principio */
  await p.click("#eq-seguir"); await esperarTitulo(p, "Tu nivel"); await p.click("#nv-seguir"); await esperarTitulo(p, "Tu rumbo");
  await p.click('[data-rumbo="front-lever"]');
  await p.waitForSelector('[data-rumbo="front-lever"][aria-pressed="true"]', {timeout: 3000}).catch(() => { throw new Error("no marca la elegida"); });
  await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  const filas = await p.$$eval(".toca", fs => fs.map(f => f.textContent.replace(/\s+/g, " ").trim()));
  /* el molde del día: entrada, la habilidad de tu meta, fuerza de a dos, abdomen y cierre */
  ok(filas.length >= 6 && filas[0].includes("Colgado con hombros firmes") && filas[0].includes("2 × 30 s"), "hoy toca: " + filas.join(" | "));
  ok(await p.$$eval(".hoy-toca .toca-sec", xs => xs.length) >= 3, "el molde no muestra sus partes");
  /* la entrada en calor va primero y pasa sola, tramo a tramo */
  await p.click("#s-empezar"); await p.waitForSelector(".ses.tramo");
  ok(await p.evaluate(() => getComputedStyle(document.querySelector("nav.barra")).display === "none"), "la barra se ve en la sesión");
  for (let i = 0; i < 30 && await fase(p) === "tramo"; i++) await tick(p, 20000);
  if (await fase(p) === "descanso"){ await p.click("#s-seguir"); }
  await p.waitForSelector(".ses.serie");
  ok(await p.evaluate(() => K.sesion.estado().b === 1 && K.sesion.estado().hechos.length === 1), "la entrada no quedó hecha antes de la habilidad");
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
  ok(await p.textContent(".ses-tit .lb") === "Serie 2 de 2", "no pasó a la serie 2");
  /* la segunda serie se estira a 60 s (más los 5 s para llegar a la barra): enciende la estrella */
  await tick(p, 70000); await p.click("#s-listo");
  /* el resto de la sesión, rápido */
  for (let i = 0; i < 60 && await fase(p) !== "cierre"; i++){
    const f = await fase(p);
    if (f === "serie"){ const seg = await p.evaluate(() => K.sesion.paso().tipo === "segundos" ? K.sesion.paso().objetivo : 30); await tick(p, (seg + 6) * 1000); await p.click("#s-listo"); }
    else if (f === "tramo") await tick(p, 20000);
    else { await tick(p, 150000); await p.click("#s-seguir"); }
  }
  ok(await fase(p) === "cierre", "no llegó a la última serie");
  await p.click("#s-terminar"); await p.waitForSelector(".res");
  ok((await p.textContent(".res-tit")) === "Colgado con hombros firmes 60 s, encendida.", "el resumen no muestra la estrella nueva: " + await p.textContent(".res-tit"));
  ok(await p.$(".res svg.ico-cons.crece"), "el anillo de la constelación no crece con la estrella nueva");
  const datos = await p.$$eval(".res-dato .num", xs => xs.map(x => x.textContent));
  const guardadas = await p.evaluate(() => K.diario.sesiones[0].bloques.reduce((a, b) => a + b.series.length, 0));
  ok(datos[1] === String(guardadas) && guardadas >= 12 && +datos[2] >= 1, "series y estrellas: " + datos + " (guardadas " + guardadas + ")");
  /* queda guardada: al abrir de nuevo, Hoy lo dice y el cielo la tiene */
  await p.reload(); await p.waitForSelector("main.view");
  await p.click("[data-volver]"); await esperarTitulo(p, "Hoy");
  ok((await p.textContent(".hoy .ajr")).includes("Hoy ya entrenaste"), "Hoy no muestra lo hecho");
  await ir(p, "#/cielo/front-lever");
  ok((await estadosFL(p)).startsWith("ep"), "el cielo no tiene la estrella de la sesión");
  ok(await p.$('.marca .marca-ses'), "la marca de la sesión no aparece en tus marcas");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-sobrevive", async () => {
  /* el teléfono mata la app en pleno descanso: al abrir, sigue donde estaba y con el tiempo real */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await empezar(p); await p.waitForSelector(".ses.serie");
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
  await empezar(p); await tick(p, 30000); await p.click("#s-listo"); await p.fill("#s-valor", "22");
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
  await empezar(p); await p.waitForTimeout(5200); await p.click("#s-listo");
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
  await empezar(p); await p.waitForSelector(".ses.serie");
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
  await empezar(p); await tick(p, 10000); await p.click("#s-listo");
  /* salís a mirar el cielo: el descanso sigue arriba, en la isla */
  await p.click("#s-mas"); await p.click('.pmi[data-id="cielo"]'); await esperarTitulo(p, "Tu cosmos");
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
  ok(await p.evaluate(() => K.sesion.estado().b === 2 && K.sesion.estado().hechos.length === 1), "saltear no pasó al bloque siguiente (el 0 es la entrada)");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sesion-intento", async () => {
  /* lo que no se mide (logrado): sí o no de un toque, y arranca en «Todavía no» para no encender nada sin querer */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["puente"]);
  await empezar(p); await p.waitForSelector(".ses.serie"); await p.click("#s-listo");
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
  await empezar(p); await p.waitForSelector(".ses.serie");
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
  await empezar(p); await tick(p, 5000); await p.click("#s-listo");
  await p.click("#s-cortar"); await p.waitForSelector(".utoast.solo");
  ok((await p.textContent(".utoast .utx")).startsWith("No se pudo guardar"), "no dice que no pudo guardar");
  ok(await p.$(".ses.descanso"), "la sesión tiene que seguir abierta");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});


/* ===== Un molde para cada día (motor B) ===== */
const sembrarMolde = (p, {rumbo: r, equipo = ["barra"], dias} = {}) => p.evaluate(async ([r, equipo, dias]) => {
  await K.diario.perfilPoner("equipo", equipo); if (dias) await K.diario.perfilPoner("dias", dias); await K.diario.perfilPoner("rumbo", r); K.refrescar(); }, [r, equipo, dias]);
const partes = p => p.$$eval(".hoy-toca .toca-sec", xs => xs.map(x => x.querySelector(".lb")?.textContent || x.textContent));
prueba("hoy-molde", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarMolde(p, {rumbo: ["front-lever", "planche"], equipo: ["barra", "bici"]}); await p.waitForSelector("#s-empezar");
  /* el día por partes, siempre en el mismo orden */
  /* con la bici, el cierre son 5 min de bici y el abdomen entra en la hora */
  ok(JSON.stringify(await partes(p)) === JSON.stringify(["Entrada en calor", "Habilidad descansado", "Fuerza de a dos", "Abdomen", "Cierre"]), "las partes: " + await partes(p));
  ok(await p.evaluate(() => K.hoyPlan().minutos <= 60), "el día pasa la hora");
  const marcas = await p.$$eval(".hoy-toca .toca-marca", xs => xs.map(x => x.textContent));
  /* cada cosa en su renglón: la meta; y en el camino, el camino y debajo la meta */
  ok(marcas[0] === "Para Front lever" && /^Camino a .+/.test(marcas[1]) && marcas[2] === "Para Planche", "las habilidades no dicen para qué meta son: " + marcas);
  ok(await p.$$eval(".hoy-toca .toca-par", x => x.length) === 2 && !(await p.$(".hoy-toca .toca-par-tx")), "la fuerza no va de a dos (o repite «en superserie»)");
  /* «Hoy toca» a la izquierda; a la derecha, el reloj y los minutos (sin la cuenta de bloques) */
  ok((await p.textContent(".hoy-toca .ln .lb")) === "Hoy toca" && /^\d+ min$/.test(await p.textContent(".hoy-toca > .ln:first-child .num")) && await p.$(".hoy-toca > .ln:first-child .num .dur svg"), "no dice los minutos con su reloj: " + await p.textContent(".hoy-toca > .ln:first-child"));
  /* la sesión arranca por la entrada en calor (con la bici) y sigue con la primera habilidad */
  await p.click("#s-empezar"); await p.waitForSelector(".ses.tramo");
  ok((await p.textContent(".ses-tit .lb")).startsWith("Entrada en calor"), "no arranca por la entrada en calor: " + await p.textContent(".ses-tit .lb"));
  await tick(p, 30000); await p.evaluate(() => { K.sesion.saltear(); K.refrescar(); }); await p.waitForSelector(".ses.serie");
  /* dónde estás: el nombre del bloque y un punto por bloque, el de ahora marcado */
  ok((await p.textContent(".ses-donde")) === "Front lever" && (await p.textContent(".ses-tit h1")) === "Colgado con hombros firmes", "la habilidad: " + await p.textContent(".ses-donde"));
  ok(await p.evaluate(() => { const d = document.querySelector(".ses-donde .pdots"), n = K.sesion.estado().plan.bloques.length; return d && d.children.length === n && d.children[K.sesion.estado().b].className === "n" && d.getAttribute("aria-label") === `Bloque ${K.sesion.estado().b + 1} de ${n}`; }), "los puntos de los bloques");
  /* una serie del camino a la planche: guarda la escalera, y lo guardado dice para qué metas era cada bloque */
  await p.evaluate(() => { K.sesion.saltear(); K.refrescar(); }); await p.waitForSelector(".ses.serie");
  ok((await p.textContent(".ses-donde")) === "Planche", "el camino no dice su meta: " + await p.textContent(".ses-donde"));
  await p.click("#s-listo"); await p.waitForSelector(".ses.descanso"); await p.fill("#s-valor", "7");
  await p.click("#s-cortar"); await p.waitForSelector(".res");
  const g = await p.evaluate(() => K.diario.sesiones[0]);
  const ent = g.bloques.find(b => b.molde === "entrada"), cam = g.bloques.find(b => b.molde === "habilidad");
  ok(ent && ent.series[0].ejercicio == null, "la entrada en calor guardada cuenta como bici: " + JSON.stringify(ent && ent.series));
  ok(cam && cam.constelaciones.join() === "planche" && cam.series[0].escalera === "empujar" && cam.series[0].rango && cam.series[0].n === 3, "el camino guardado: " + JSON.stringify(cam));
  /* el resumen dice tus escalones también sin rutina */
  ok(await p.$(".res-esc") && (await p.textContent(".res-esc")).includes("Empujar"), "el resumen del molde no dice el escalón");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rumbo-sin-tope", async () => {
  /* un martes fijo: lo que Hoy arma depende del día de la semana (un viernes, con días 1, 3 y 5, toca otra cosa) */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarMolde(p, {rumbo: [], equipo: ["barra", "paralelas", "pared", "poste"], dias: [1, 3, 5]});
  await ir(p, "#/hoy/rumbo");
  ok((await p.textContent(".ayuda")) === "Elegí las que quieras. Kozmos rota lo que toca cada día.", "el texto de Tu rumbo: " + await p.textContent(".ayuda"));
  const ids = ["front-lever", "planche", "muscle-up", "una-pierna", "draco"];
  for (const id of ids){ await p.click(`[data-rumbo="${id}"]`); await p.waitForSelector(`[data-rumbo="${id}"][aria-pressed="true"]`); }
  ok(!(await p.$(".utoast")), "sumar una quinta avisa");
  ok(await p.evaluate(() => K.rumbo().length) === 5, "no guardó las cinco");
  /* con tus 3 días: dos habilidades por día, entre cinco metas, cada una 1 o 2 veces por semana */
  /* «5 elegidas» a la izquierda; a la derecha, el calendario y cada cuánto toca cada una */
  ok((await p.textContent(".rumbo-cuanto")) === "5 elegidas 1–2× por semana" && await p.getAttribute(".rumbo-cuanto .frec", "aria-label") === "Cada una, 1 o 2 veces por semana" && await p.$(".rumbo-cuanto .frec svg"), "la línea de frecuencia: " + await p.textContent(".rumbo-cuanto"));
  ok(await p.evaluate(() => { const a = document.querySelector(".rumbo-cuanto b").getBoundingClientRect(), b = document.querySelector(".rumbo-cuanto .frec").getBoundingClientRect(), c = document.querySelector(".rumbo-cuanto").getBoundingClientRect(); return a.left - c.left < 2 && c.right - b.right < 2; }), "las elegidas no van a la izquierda y la frecuencia a la derecha");
  ok(await p.evaluate(() => { const a = document.querySelector(".rumbo-cuanto").getBoundingClientRect(), b = document.querySelector(".rumbo-listo").getBoundingClientRect(); return a.bottom <= b.top && b.bottom <= innerHeight; }), "la línea no queda arriba de «Listo»");
  /* sin barra, lo que la pide dice «Pide barra», nunca «0 de 0»; en Tu rumbo y en tu cosmos */
  await p.evaluate(() => K.diario.perfilPoner("equipo", []).then(() => K.refrescar())); await p.waitForTimeout(200);
  const filas = await p.$$eval(".rumbo-fila", xs => Object.fromEntries(xs.map(x => [x.dataset.rumbo, x.querySelector("em").textContent])));
  ok(filas["muscle-up"] === "Pide barra" && filas["bandera"] === "Pide poste" && filas["lastre"] === "Pide barra, paralelas y lastre" && filas["planche"] === "0 de 7", "las filas: " + JSON.stringify(filas));
  ok(!Object.values(filas).includes("0 de 0"), "una fila dice 0 de 0");
  ok((await p.textContent(".rumbo-cuanto")).startsWith("5 elegidas las que podés ") && (await p.getAttribute(".rumbo-cuanto .frec", "aria-label")).startsWith("cada una, "), "con metas que piden equipo: " + await p.textContent(".rumbo-cuanto"));
  await ir(p, "#/cielo");
  ok(!(await p.textContent("main.view")).includes("0 de 0"), "tu cosmos dice 0 de 0");
  await ir(p, "#/cielo/muscle-up"); ok(!(await p.textContent("main.view")).includes("0 de 0"), "la constelación dice 0 de 0");
  /* Hoy arma el día igual, con lo que se puede, y dice qué piden las otras con el atajo a Tu equipo */
  await ir(p, "#/hoy");
  ok((await p.textContent(".hoy-pide")).includes("Muscle-up pide barra") && await p.getAttribute(".hoy-pide", "data-ir") === "#/vos/equipo", "Hoy no dice qué piden");
  ok((await partes(p)).includes("Habilidad descansado"), "Hoy sin habilidad con planche en el rumbo");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("hoy-rota", async () => {
  /* tres metas: hoy van dos; mañana, la que quedó (y no la de ayer, si hay otra) */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarMolde(p, {rumbo: ["front-lever", "planche", "una-pierna"]}); await p.waitForSelector("#s-empezar");
  const metas = () => p.$$eval(".hoy-toca .toca-marca", xs => xs.map(x => x.textContent).filter(t => /para /i.test(t)));
  const hoy = await metas();
  ok(hoy.length === 2 && hoy[0] === "Para Front lever" && hoy[1] === "Para Planche", "hoy: " + hoy);
  /* «La próxima»: la etiqueta y cada una con el punto de su familia */
  ok((await p.textContent(".hoy-pie")) === "La próxima Una pierna" && await p.$$eval(".hoy-pie .hoy-pie-n .tg .dot", x => x.length) === 1, "el pie no dice lo que sigue: " + await p.textContent(".hoy-pie"));
  await p.click("#s-empezar"); await p.waitForSelector(".ses.tramo");
  await p.evaluate(() => { K.sesion.saltear(); K.refrescar(); }); await p.waitForSelector(".ses.serie");
  await tick(p, 30000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
  /* al otro día */
  await p.clock.fastForward(24 * 3600e3); await ir(p, "#/hoy"); await p.waitForSelector("#s-empezar");
  const man = await metas();
  ok(man.some(t => t.includes("Una pierna")) && !man.some(t => t.includes("Front lever")), "mañana: " + man);
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("hoy-molde-horizontal", async () => {
  const {ctx, p} = await conReloj({width: 844, height: 390});
  await ir(p, "#/hoy"); await sembrarMolde(p, {rumbo: ["front-lever", "planche", "muscle-up", "una-pierna", "draco"], equipo: ["barra", "paralelas", "pared"], dias: [1, 3, 5]}); await p.waitForSelector("#s-empezar");
  const r = await p.evaluate(() => { const a = document.querySelector(".hoy-a").getBoundingClientRect(), b = document.querySelector(".hoy-b").getBoundingClientRect();
    return {lado: b.left >= a.right, ancho: document.documentElement.scrollWidth <= innerWidth, filas: [...document.querySelectorAll(".hoy-toca .ln.toca")].every(x => x.scrollWidth <= x.clientWidth + 1),
      origen: document.querySelector(".hoy-origen .ses-fila").scrollWidth <= document.querySelector(".hoy-origen .ses-fila").clientWidth + 1}; });
  ok(r.lado && r.ancho && r.filas && r.origen, "Hoy en horizontal: " + JSON.stringify(r));
  ok((await p.textContent(".hoy-origen")).includes("y 3 más"), "con cinco metas, la fila de origen: " + await p.textContent(".hoy-origen"));
  /* Tu rumbo: la lista a la izquierda; la frecuencia y «Listo» abajo a la derecha */
  await ir(p, "#/hoy/rumbo");
  const q = await p.evaluate(() => { const l = document.querySelector(".fam").getBoundingClientRect(), c = document.querySelector(".rumbo-cuanto").getBoundingClientRect(), b = document.querySelector(".rumbo-listo").getBoundingClientRect();
    return {der: c.left >= l.right && b.left >= l.right, arriba: c.bottom <= b.top, ve: b.bottom <= innerHeight, ancho: document.documentElement.scrollWidth <= innerWidth}; });
  ok(q.der && q.arriba && q.ve && q.ancho, "Tu rumbo en horizontal: " + JSON.stringify(q));
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
  ok((await p.textContent(".ses-tit h1")) === "Colgado con hombros firmes 60 s", "la prueba no dice qué estrella: " + await p.textContent(".ses-tit h1"));
  await tick(p, 2000);
  ok(await reloj(p, "fase") === "3" && await reloj(p, "fase-lb") === "Preparate", "falta la cuenta para prepararse");
  await p.click(".ses.prueba .ses-luego"); await tick(p, 100);
  ok(await fase(p) === "serie", "un toque mientras te preparás cortó la prueba");
  await tick(p, 64000);
  ok(await reloj(p, "fase") === "61" && await reloj(p, "fase-lb") === "de 60 s", "el reloj de la prueba: " + await reloj(p, "fase"));
  ok(await p.$(".prueba-anillo.listo"), "el anillo no se llena al llegar");
  ok((await p.evaluate(() => window.__V)).includes("[10,40,10]"), "no vibró al llegar a los 60 s");
  await p.click(".ses.prueba .ses-ind"); await p.waitForSelector(".res");
  ok((await p.textContent(".res-tit")) === "Colgado con hombros firmes 60 s, encendida.", "la prueba no encendió la estrella: " + await p.textContent(".res-tit"));
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
  ok((await p.textContent(".hoy-ventana")).includes("probá Colgado con hombros firmes 60 s"), "Hoy no avisa la ventana");
  ok((await p.textContent(".toca.es-prueba")).includes("60 s"), "la prueba no va primera en lo que toca");
  await empezar(p); await p.waitForSelector(".ses.prueba");
  await tick(p, 30000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.inputValue("#s-valor") === "25", "después de la prueba se anota lo que corrió: " + await p.inputValue("#s-valor"));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("tu-equipo", async () => {
  const {ctx, p} = await pagina();
  await ir(p, "#/vos");
  ok((await p.textContent('[data-ir="#/vos/equipo"] em')) === "Sin elegir", "sin elegir, la fila no lo dice");
  await p.click('[data-ir="#/vos/equipo"]'); await esperarTitulo(p, "Tu equipo");
  /* sin elegir no se ve nada marcado, pero el cielo sigue mostrando todo hasta que lo digas */
  ok(await p.$$eval('[data-equipo][aria-pressed="true"], [data-equipo] .ck', x => x.length) === 0, "sin elegir, se ve equipo marcado");
  ok(await p.evaluate(() => K.diario.perfil.equipo == null && K.cieloActual().constelaciones.find(c => c.id === "soga").total > 0), "mirar tu equipo cambió lo que cuenta el cielo");
  await p.click('[data-equipo="soga"]'); await p.waitForSelector('[data-equipo="soga"][aria-pressed="true"] .ck');
  ok(await p.evaluate(() => JSON.stringify(K.diario.perfil.equipo)) === '["soga"]', "marcar desde nada no guarda solo la soga");
  await p.click('[data-equipo="soga"]'); await p.waitForSelector('[data-equipo="soga"][aria-pressed="false"]');
  ok(!(await p.$('[data-equipo="soga"] .ck')), "la fila sigue con la marca de elegida");
  await p.waitForTimeout(300); ok(!(await p.$(".utoast")), "elegir equipo ofrece deshacer");
  await ir(p, "#/cielo");
  ok(!(await p.$('.cielo-grilla [data-ir="#/cielo/soga"]')), "sin soga, Soga sigue en el cielo");
  await ir(p, "#/cielo/soga");
  ok((await p.textContent(".cons-estado .t1")) === "Pide soga.", "la constelación no dice qué pide");
  ok(await p.$$eval(".est-fila.sin-equipo", xs => xs.length) === 7 && await p.$$eval(".cons-svg .es.sin", xs => xs.length) === 7, "abierta, se ven todas, tenues");
  ok(!(await p.$("[data-probar]")) && await p.$('.dos-btn [data-ir="#/vos/equipo"]'), "sin soga, en vez de probar ofrece ir a tu equipo");
  /* otro toque lo vuelve atrás */
  await ir(p, "#/vos/equipo"); await p.click('[data-equipo="soga"]'); await p.waitForSelector('[data-equipo="soga"][aria-pressed="true"] .ck');
  ok(await p.evaluate(() => K.equipo().includes("soga")), "otro toque no devolvió la soga");
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
  await empezar(p); await p.waitForSelector(".ses.serie");
  await tick(p, 20 * 60000); await p.click("#s-listo");
  for (let i = 0; i < 60 && await fase(p) !== "cierre"; i++){
    if (await fase(p) === "serie"){ await tick(p, await p.evaluate(() => K.sesion.bloque().tipo === "minutos") ? 20 * 60000 : 36000); await p.click("#s-listo"); }
    else if (await fase(p) === "tramo") await tick(p, 60000);
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
  await empezar(p); await tick(p, 40000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
  await anotarMarca(p, {valor: 61});
  await ir(p, "#/progreso");
  ok(await p.$(".semanas"), "no están las semanas");
  ok((await p.textContent(".prog-sem .ln.small .num")).startsWith("1 min"), "esta semana: " + await p.textContent(".prog-sem .ln.small .num"));
  ok((await p.textContent(".prog-est b")) === "Colgado con hombros firmes 60 s", "no lista la estrella encendida este mes");
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
  await empezar(p); await tick(p, 40000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
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
  await empezar(p); await tick(p, 40000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
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
  ok(await p.$$eval('.lado .ru-card[data-ir^="#/planes/rutinas/"]', x => x.length) === 26, "no están las 26 rutinas");
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
  /* la entrada en calor se puede saltear a mitad: lo que corrió queda (salteada al toque no se guarda, vuelta 28) */
  await tick(p, 20000); await p.click("#s-mas"); await p.click('.pmi[data-id="saltear"]'); await p.waitForSelector(".ses.serie");
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
  await p.click("#s-mas"); await p.click('.pmi[data-id="cielo"]'); await esperarTitulo(p, "Tu cosmos"); await tick(p, 500);
  /* en la isla, lo nuevo va como su signo, en el color de la familia, entre el nombre y el reloj */
  ok(await p.textContent("#isla .tx") === "Dominada" && await p.textContent("#isla .mk") === "▲" && /^Dominada, ▲ nuevo \d+:\d\d$/.test(await p.getAttribute("#isla", "aria-label")), "la isla: " + await p.textContent("#isla") + " / " + await p.getAttribute("#isla", "aria-label"));
  /* en la serie que sigue (sentadilla, mismo escalón) no hay marca */
  await p.click("#isla"); await p.waitForSelector(".ses.serie"); await p.click("#s-listo"); await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  ok(!(await p.textContent(".ses-tit .lb")).includes("▲"), "la sentadilla dice que es nueva");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* la isla con un nombre largo: si no entra, pasea de punta a punta, despacio y con pausa en cada punta; si entra, quieta;
   sin movimiento, quieta y cortada con «…». El paso lo lleva setTimeout: el reloj falso lo adelanta igual siempre */
prueba("isla-pasea", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/cielo");
  const poner = (t, marca = "") => p.evaluate(([t, marca]) => K.isla.mostrar({texto: t, p: .4, familia: "fu", ir: "#/hoy", marca}), [t, marca]);
  const estado = () => p.evaluate(() => { const b = document.querySelector("#isla"), tx = b.querySelector(".tx"), en = b.querySelector(".tx-in");
    return {mq: b.dataset.mq || "", tr: en.style.transform, ms: parseFloat((/(\d+)ms/.exec(en.style.transition) || [])[1]) || 0, pasea: tx.classList.contains("pasea"), d: en.scrollWidth - tx.clientWidth,
      rl: b.querySelector(".rl")?.textContent || "", corta: getComputedStyle(tx).textOverflow, sobra: tx.scrollWidth > tx.clientWidth + 1}; });
  const largo = "Remo en horizontal con rodillas al pecho, la versión más larga";
  await poner(`${largo} 0:05`, "▲ nuevo");
  let e = await estado();
  ok(e.pasea && e.mq === "inicio" && e.tr === "" && e.d > 20, "un nombre largo no se prepara para pasear: " + JSON.stringify(e));
  /* la pausa del principio, y después la ida: hacia la izquierda, a unos 30 px por segundo */
  await p.clock.runFor(1500); e = await estado(); ok(e.mq === "inicio", "arrancó sin pausa: " + JSON.stringify(e));
  await p.clock.runFor(400); e = await estado();
  const v = e.d / (e.ms / 1000);
  ok(e.mq === "ida" && new RegExp(`translateX\\(-${e.d}px\\)`).test(e.tr) && v >= 25 && v <= 35, "no pasea o va muy rápido: " + JSON.stringify(e) + " " + v);
  /* el reloj de la isla sigue corriendo sin hacerlo volver a empezar */
  await poner(`${largo} 0:06`, "▲ nuevo"); e = await estado();
  ok(e.mq === "ida" && e.rl === "0:06" && e.tr !== "", "el reloj reinició el paseo: " + JSON.stringify(e));
  /* al llegar a la punta, otra pausa; después vuelve */
  await p.clock.runFor(e.ms); e = await estado(); ok(e.mq === "fin", "no para en la punta: " + JSON.stringify(e));
  await p.clock.runFor(1900); e = await estado(); ok(e.mq === "vuelta" && e.tr === "", "no vuelve: " + JSON.stringify(e));
  await p.clock.runFor(e.ms + 100); e = await estado(); ok(e.mq === "inicio", "no vuelve al principio: " + JSON.stringify(e));
  /* otro nombre (el bloque que sigue): si entra, queda quieto */
  await poner("Dominada 0:01"); e = await estado();
  ok(!e.pasea && !e.mq && e.tr === "" && !e.sobra, "un nombre que entra se mueve: " + JSON.stringify(e));
  await p.clock.runFor(10000); e = await estado(); ok(!e.mq && e.tr === "", "un nombre que entra empezó a pasear: " + JSON.stringify(e));
  /* y vuelve a pasear con otro largo */
  await poner(`${largo}, otra vez 0:02`); await p.clock.runFor(1900); e = await estado(); ok(e.mq === "ida", "el nombre nuevo no pasea: " + JSON.stringify(e));
  /* sin movimiento: quieta, cortada con «…» */
  await p.emulateMedia({reducedMotion: "reduce"});
  await poner(`${largo}, sin moverse 0:03`); await p.clock.runFor(5000); e = await estado();
  ok(!e.pasea && !e.mq && e.tr === "" && e.corta === "ellipsis" && e.sobra, "sin movimiento, la isla se mueve o no se corta: " + JSON.stringify(e));
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
  ok(de("Piernas")[0] === "igual" && de("Piernas")[1] === "=" && de("Piernas")[2].includes("La próxima: 11\u200211\u200210"), "piernas: " + JSON.stringify(de("Piernas")));
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
  const filas = async sel => p.$$eval(sel + " .esc-mini li", ls => ls.map(l => [l.querySelector(".em-nom").textContent, l.querySelector(".em-n").textContent, l.querySelector(".esc-sub").getAttribute("aria-label"), l.querySelectorAll(".esc-sub rect").length]));
  const h = await filas(".hoy-rut");
  ok(h.map(f => f[0]).join() === "Tirar,Piernas,Fondos,Isquios,Remo,Empujar,L-sit", "las escaleras de Hoy: " + h.map(f => f[0]));
  ok(JSON.stringify(h[0]) === '["Tirar","4/7","Escalón 4 de 7: Dominada",7]', "tirar en Hoy: " + JSON.stringify(h[0]));
  ok(h[2][1] === "1/2" && h[2][2].endsWith("Flexión cerrada"), "fondos en Hoy (sin paralelas): " + JSON.stringify(h[2]));
  /* una escalerita: los escalones suben de alto, lo hecho en tinta y el de ahora en color */
  ok(await p.$eval(".hoy-rut .esc-mini li .esc-sub", x => { const r = x.querySelectorAll("rect"); return x.querySelectorAll("rect.d").length === 3 && x.querySelector("rect.n") === r[3] && +r[0].getAttribute("height") < +r[6].getAttribute("height"); }), "la escalerita de tirar no se dibuja bien");
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
    ok(ds.every(d => !/·/.test(d.t)), `${id}: un día separa con «·»: ` + ds.map(d => d.t));
    ok(ds.length === dias, `${id}: ${ds.length} días, esperaba ${dias}`);
    for (const d of ds){
      ok(!/d[ií]a\s+\S+\s+d[ií]a\s/i.test(d.t), `${id}: el día dice «${d.t}»`);
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
  ok(toca.t === "Te toca Día C", "el día que toca dice: " + toca.t);
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
  ok(/Trote\s*8 × 1 min 1:30 suave/.test(await p.textContent(".rut-dia")) && (await p.textContent(".rut-dia .toca-n .q")) === "1:30 suave", "Correr tus primeros 5 km no dice el trote: " + await p.textContent(".rut-dia"));
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
/* ===== Kilos con mancuernas (vuelta 27): el escalón con carga pide los kilos de cada mancuerna, nunca tu peso ===== */
/* dos sesiones de la Base con el remo con mancuerna en el tope y 6 kg: la próxima, 8 kg */
const sKg = (id, fecha, i) => ({id, fecha, inicio: `${fecha}T18:00:00.000Z`, fin: `${fecha}T18:45:00.000Z`, duracion: 2700, cortada: false, catalogo: 1, rutina: {id: "base_cali", sesion: i},
  bloques: [{orden: 1, familia: "fu", objetivo: 12, series: [12, 12, 12].map(v => ({ejercicio: "remo-mancuerna", tipo: "repeticiones", objetivo: 12, valor: v, escalera: "remo", rango: [8, 12], n: 3, kg: 6}))}]});
const sembrarKg = p => p.evaluate(async ss => {
  await K.diario.perfilPoner("rumbo", ["front-lever"]); await K.diario.perfilPoner("equipo", ["mancuernas"]); await K.diario.perfilPoner("peso", 72);
  for (const s of ss) await K.diario.guardarSesion(s);
  await K.diario.perfilPoner("rutina", {id: "base_cali", desde: "2026-10-01"}); K.refrescar();
}, [sKg("k1", "2026-10-14", 0), sKg("k2", "2026-10-16", 1)]);
prueba("serie-con-kilos", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarKg(p); await p.waitForSelector("#s-empezar");
  /* Hoy y el día de la rutina dicen los kilos en la fila */
  /* la fila: lo que toca y, debajo, en la misma columna, los kilos como su propia ficha con la mancuerna */
  const fila = async (sel, q) => p.$$eval(sel + " .ln.toca", (ls, q) => { const l = ls.find(l => l.querySelector(".tg").textContent.startsWith(q)); if (!l) return "";
    const n = l.querySelector(".toca-n"), k = n.querySelector(".kg"), a = n.firstElementChild.getBoundingClientRect(), b = k ? k.getBoundingClientRect() : null;
    return `${n.firstElementChild.textContent}|${k ? k.textContent : ""}|${k && k.querySelector("svg") && Math.abs(a.right - b.right) < 1.5 && b.top >= a.bottom - 1 ? "debajo" : "fuera"}`; }, q);
  ok((await fila("main", "Remo a un brazo con pesa")) === "3 × 8–12|8 kg|debajo", "Hoy: " + await fila("main", "Remo a un brazo con pesa"));
  ok((await fila("main", "Sentadilla con pesa")).endsWith("|4 kg|debajo"), "la sentadilla con mancuernas: " + await fila("main", "Sentadilla con pesa"));
  /* la serie: los kilos de la mancuerna y que es más peso */
  await aLaSerie(p);
  ok(await p.evaluate(() => K.sesion.paso().ejercicio) === "remo-mancuerna", "la primera serie: " + await p.evaluate(() => K.sesion.paso().ejercicio));
  ok((await p.textContent(".ses-reloj .kg")) === "8 kg por mano" && await p.$(".ses-reloj .kg svg") && (await p.textContent(".ses-tit .lb .ses-marca")) === "▲ más peso", "la serie: " + await p.textContent(".ses-reloj") + " · " + await p.textContent(".ses-tit .lb"));
  /* el descanso pide los kilos por mano, con los de la serie puestos; tu peso no */
  await tick(p, 30000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.getAttribute("#s-kg", "aria-label") === "Kilos por mano" && await p.inputValue("#s-kg") === "8" && !(await p.$("#s-peso")) && !(await p.$("#s-lastre")), "el descanso no pide los kilos por mano");
  ok((await p.textContent(".ses-anota")).includes("kg por mano"), "falta «kg por mano»");
  await p.click('[data-spaso="1"][data-campo="kg"]'); ok(await p.inputValue("#s-kg") === "9", "el + de los kilos no suma de a uno");
  await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  /* en la superserie, la sentadilla lleva sus propios kilos, no los del remo */
  ok(await p.evaluate(() => K.sesion.paso().ejercicio) === "sentadilla-mancuernas", "no alterna con la sentadilla");
  await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.inputValue("#s-kg") === "4", "la sentadilla arranca con los kilos del remo: " + await p.inputValue("#s-kg"));
  await p.click("#s-seguir"); await p.waitForSelector(".ses.serie"); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso");
  ok(await p.inputValue("#s-kg") === "9", "el remo no sigue con lo que pusiste en su serie anterior: " + await p.inputValue("#s-kg"));
  await p.click("#s-seguir"); await p.waitForSelector(".ses.serie");
  /* lo guardado: «kg» en la serie, sin lastre ni tu peso; no hace marcas de % de tu peso; el respaldo lo lleva */
  await p.click("#s-cortar"); await p.waitForSelector(".res");
  const r = await p.evaluate(() => { const xs = K.diario.sesiones.at(-1).bloques.flatMap(b => b.series).filter(x => x.ejercicio === "remo-mancuerna"), b = K.respaldo.leer(JSON.stringify(K.respaldo.armar(K.diario, K.VERSION, K.CATALOGO.version)));
    return {kg: xs.map(x => x.kg), raro: xs.some(x => "lastreKg" in x || "pesoKg" in x), d: b.descartadas, err: b.error, pct: K.cieloActual().constelaciones.flatMap(c => c.marcas || []).filter(m => /mancuerna/.test(m.ejercicio || "")).length}; });
  ok(r.kg.join() === "9,9" && !r.raro && !r.err && r.d === 0 && r.pct === 0, "lo guardado: " + JSON.stringify(r));
  /* el resumen de la segunda sesión sembrada: ▲ más peso, +2 kg */
  await ir(p, "#/progreso/k2"); await p.waitForSelector(".res-esc");
  const li = await p.$$eval(".res-esc li", ls => ls.map(l => [l.className, l.querySelector(".res-signo").textContent, l.querySelector(".ses-fila").textContent.trim()]));
  ok(li.some(([c, g, t]) => c === "sube" && g === "▲" && t.startsWith("Remo") && t.includes("+2 kg ahora 8 kg")), "el resumen: " + JSON.stringify(li));
  /* la rutina en Planes: los días dicen los kilos, los últimos que pusiste (9, aunque la sesión se cortó) */
  await ir(p, "#/planes/rutinas/base_cali"); await p.waitForSelector(".rut-dia");
  ok((await fila(".rut-dia", "Remo a un brazo con pesa")).endsWith("|9 kg|debajo"), "Planes: " + await fila(".rut-dia", "Remo a un brazo con pesa"));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
/* ===== Pesas primero (vuelta 35): con una kettlebell sola hay remo, sentadilla y peso muerto con la pesa ===== */
prueba("solo-kettlebell", async () => {
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await p.evaluate(async () => { await K.diario.perfilPoner("equipo", ["kettlebell"]); await K.diario.perfilPoner("rumbo", ["front-lever", "una-pierna"]); K.refrescar(); });
  await p.waitForSelector("#s-empezar");
  const ejs = await p.evaluate(() => K.hoyPlan().bloques.flatMap(b => b.pasos || []).map(x => x.ejercicio));
  ok(ejs.includes("remo-mancuerna") && !ejs.includes("remo-poste") && ejs.some(e => ["sentadilla-mancuernas", "peso-muerto-rumano"].includes(e)), "el día con una kettlebell: " + [...new Set(ejs)]);
  ok((await p.textContent("main .hoy-toca")).includes("Remo a un brazo con pesa"), "Hoy no muestra el remo con pesa");
  /* en la biblioteca: con kettlebell aparece lo de una pesa, y lo dice «Con una mancuerna o kettlebell» */
  await p.evaluate(() => { K.prefs.set("ejercicios.que", "todo"); K.prefs.set("ejercicios.con", "kettlebell"); }); await ir(p, "#/planes/ejercicios");
  ok(await p.$('[data-ir="#/planes/ejercicios/remo-mancuerna"]') && await p.$('[data-ir="#/planes/ejercicios/swing-kettlebell"]') && !(await p.$('[data-ir="#/planes/ejercicios/press-hombros"]')), "con kettlebell, la biblioteca no muestra lo de una pesa");
  await ir(p, "#/planes/ejercicios/remo-mancuerna"); await esperarTitulo(p, "Remo a un brazo con pesa");
  ok((await p.textContent(".ej-como")).includes("Una mancuerna o kettlebell") && !(await p.$(".aviso-tenue")), "el ejercicio no dice con qué: " + await p.textContent(".ej-como"));
  /* sin pesas, pide una */
  await p.evaluate(() => K.diario.perfilPoner("equipo", ["barra"])); await ir(p, "#/planes/ejercicios/sentadilla-mancuernas"); await esperarTitulo(p, "Sentadilla con pesa");
  ok((await p.textContent(".aviso-tenue")).startsWith("Pide una mancuerna o kettlebell."), "sin pesas no la pide: " + await p.textContent(".aviso-tenue"));
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
  ok(await p.$$eval('.lado [data-ir^="#/planes/hazanas/"]', x => new Set(x.map(y => y.dataset.ir)).size) === 14, "no están las 14 pruebas");
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
  /* Del piso y arriba (sagitario): de medio punto, de 0 a 10; Alcance de piernas (casiopea): los centímetros bajan de cero */
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
  await ir(p, "#/progreso"); ok((await p.textContent(".lado")).includes("Flexiones a ritmo Intermedio"), "Progreso no muestra la hazaña vieja");
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
  /* arriba de Planes, para vos: la próxima prueba (la que toca antes) con su medalla y tu última; la escala, tus veces y «Probar ahora», al abrirla (vuelta 32) */
  const {ctx, p} = await conReloj();
  const otras = [["hercules", "flexion", "repeticiones", 22], ["sagitario", "del-piso", "puntos", 7], ["andromeda", "dominada", "repeticiones", 5], ["casiopea", "pike-alcance", "cm", 2],
    ["pegaso", "bici-12", "km", 6], ["orion", "mil-saltos", "tiempo", 700], ["draco", "l-sit", "segundos", 12],
    /* las seis de la vuelta 32: una prueba que nunca hiciste toca ya, así que también se siembran */
    ["lira", "colgado-arriba", "segundos", 30], ["cefeo", "flexion", "repeticiones", 12], ["tauro", "silla-minuto", "repeticiones", 34], ["fenix", "plancha", "segundos", 70],
    ["cisne", "plancha-lateral", "segundos", 40], ["centauro", "cooper", "km", 2]].map(([h, e, t, v], k) => hzSes("o" + k, "2026-10-10", h, e, t, v));
  await ir(p, "#/hoy"); await sembrarSes(p, [hzSes("t1", "2026-08-12", "perseo", "dominada", "repeticiones", 9), hzSes("t2", "2026-09-01", "perseo", "dominada", "repeticiones", 12), ...otras]);
  await ir(p, "#/planes"); await p.waitForSelector(".pl-prox");
  const t = await p.textContent(".pl-prox");
  ok(t.includes("Dominadas al máximo") && t.includes("Toca ya") && t.includes("×12") && t.includes("m3"), "la próxima prueba no es Dominadas al máximo con tu última: " + t);
  ok(await p.$(".pl-prox svg.ico-medalla.ganada"), "a la tarjeta le falta la medalla");
  /* en la vitrina, la próxima va marcada; las demás dicen su magnitud */
  ok(await p.$$eval(".vt-m.prox", x => x.map(y => y.dataset.ir).join()) === "#/planes/hazanas/perseo", "la vitrina no marca la próxima");
  ok((await p.textContent('.vt-m[data-ir="#/planes/hazanas/hercules"]')).includes("m"), "la vitrina no dice la magnitud de Flexiones a ritmo");
  await ir(p, "#/planes/pruebas");
  ok((await p.textContent('.vt-m[data-ir="#/planes/pruebas/hercules"]')).includes("×22"), "la vitrina entera no dice tu marca");
  await ir(p, "#/planes/hazanas/perseo");
  ok((await p.textContent(".hz-escala")).includes("+3 desde agosto"), "no se compara con la vez anterior: " + await p.textContent(".hz-escala"));
  ok(await p.$(".hz-escala .escala .esc-yo") && await p.$(".hz-escala .escala .esc-antes"), "la prueba abierta sin su escala");
  await ir(p, "#/planes"); await p.click(".pl-prox"); await esperarTitulo(p, "Dominadas al máximo");
  await p.click("#hz-empezar"); await p.waitForSelector(".ses.serie");
  ok(await p.evaluate(() => K.sesion.bloque().hazana === "perseo"), "«Probar ahora» no arranca la próxima prueba");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("planes-familia", async () => {
  /* las rutinas se filtran por familia con un menú desplegable, no con chips; la elección queda. Las pruebas van en la vitrina, por tema y nivel (vuelta 32) */
  const {ctx, p} = await pagina();
  await ir(p, "#/planes");
  ok(!(await p.$(".chip, .chips")), "hay chips en Planes");
  ok(!(await p.$("#pl-fam-pruebas")), "las pruebas todavía tienen menú de familia");
  await p.click("#pl-fam-rutinas"); await p.waitForSelector(".pop");
  ok(await p.$$eval('.pop .pmi[role="menuitemradio"]', x => x.length) === 4, "el menú no tiene Todas y las tres familias");
  await p.click('.pmi[data-id="ra"]'); await p.waitForFunction(() => document.querySelector("#pl-fam-rutinas").textContent.includes("Rango"));
  const rs = await p.evaluate(() => [...document.querySelectorAll('.lado .ru-card[data-ir^="#/planes/rutinas/"]')].map(x => K.rutinaDe(x.dataset.ir.split("/").pop()).familia));
  ok(rs.length && rs.every(f => f === "ra"), "el filtro de rutinas: " + rs);
  await p.reload(); await p.waitForSelector("#pl-fam-rutinas");
  ok((await p.textContent("#pl-fam-rutinas")).includes("Rango"), "la familia elegida no queda");
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
  ok(/Prueba en la semana \d/.test(await p.textContent(".pl-rut")) && await p.$(".pl-rut .sem-pts"), "Tu rutina en Planes no muestra sus semanas y la prueba");
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
  /* boceto m25: la rutina va en el molde: la superserie va junta bajo «Fuerza · de a dos», sin repetir «en superserie» */
  const pares = await p.$$eval(".hoy-toca .toca-par", xs => xs.map(x => [x.querySelectorAll(".ln.toca").length, x.querySelector(".toca-par-tx")?.textContent || ""]));
  ok(pares.length >= 1 && pares.every(([n, t]) => n === 2 && t === ""), "la superserie no va junta: " + JSON.stringify(pares));
  ok((await p.textContent(".hoy-toca")).includes("Fuerzade a dos") || await p.$$eval(".hoy-toca .toca-sec", xs => xs.some(x => /Fuerza/.test(x.textContent) && /de a dos/.test(x.textContent))), "la rutina no dice «Fuerza · de a dos»");
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
prueba("hoy-sin-repetir-constelacion", async () => {
  /* si el ejercicio ya lleva el nombre de la constelación, la fila de Hoy no lo repite */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  const [a, b] = await p.evaluate(() => [K.filaToca({constelacion: "parada-de-manos", ejercicio: "vertical-pared", tipo: "segundos", objetivo: [30]})[0], K.filaToca({constelacion: "front-lever", ejercicio: "fl-bolita", tipo: "segundos", objetivo: [10]})[0]]);
  /* el nombre del ejercicio abre su página (vuelta 32): se compara el texto sin el enlace, y el enlace aparte */
  const sinLink = s => s.replace(/<button type="button" class="ej-ln" data-ir="[^"]*">([^<]*)<\/button>/g, "$1");
  ok(sinLink(a) === "Parada de manos contra la pared" && a.includes('data-ir="#/planes/ejercicios/vertical-pared"'), "repite la constelación: " + a);
  /* la constelación, un tono más suave; el ejercicio, en tinta */
  ok(sinLink(b) === '<span class="q">Front lever</span> Horizontal hecho bolita' && b.includes('data-ir="#/planes/ejercicios/fl-bolita"'), "sacó la constelación de más: " + b);
  const q = await p.evaluate(() => [K.queToca({tipo: "repeticiones", series: 4, objetivo: 5}), K.queToca({tipo: "repeticiones", series: 1, objetivo: 5}), K.queToca({tipo: "segundos", series: 4, objetivo: 10})]);
  ok(q.join("|") === "4 × 5|×5|4 × 10 s", "las repeticiones en Hoy: " + q.join("|"));
  await ctx.close();
});
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
  /* boceto m25: el cierre del molde (posturas o bici) no es de la rutina: no va más liviano */
  ok(await p.$$eval(".rut-dia", xs => xs.every(x => { let parte = ""; return [...x.querySelectorAll(".toca-sec, .ln.toca")].filter(y => { if (y.classList.contains("toca-sec")){ parte = y.textContent; return false; } return !/Cierre/.test(parte) && !/Entrada|Vuelta/.test(y.textContent); }).every(y => y.querySelector(".toca-marca")); })), "en la semana de prueba una fila no dice más liviana");
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
  ok((await p.textContent(".rut .hoy-meta")).trim() === "Semana 6: la meta 100 flexiones seguidas", "la meta no se dice: " + await p.textContent(".rut .hoy-meta"));
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
  ok((await p.textContent(".hoy-meta")).trim() === "Semana 4: la meta 1000 saltos seguidos", "Hoy no dice la meta: " + await p.textContent(".hoy-meta"));
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
  ok(/^Semana de prueba \d+ pruebas que encienden hasta \d+ estrellas$/.test(tx.trim()) && await p.$(".hoy-sp .aparte"), "Hoy no avisa la semana de prueba: " + tx);
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
  /* lo que agrega va en su renglón, con mayúscula: «Más liviana, para llegar descansado» */
  ok((await p.textContent(".hoy-sp .aparte")).includes("Más liviana") && !(await p.$(".hoy-toca .es-prueba")), "después de las pruebas, la semana sigue con pruebas");
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
  /* los estantes entran en la lista, sin salirse de su columna, y sus tarjetas miden lo mismo */
  ok(await p.evaluate(() => { const a = document.querySelector(".split>.lado").getBoundingClientRect(); return [...document.querySelectorAll(".lado .estante")].every(e => { const r = e.getBoundingClientRect(); return r.left >= a.left - 1 && r.right <= a.right + 1; }); }), "un estante se sale de la lista");
  ok(await p.$$eval(".lado .ru-card", xs => new Set(xs.map(x => Math.round(x.getBoundingClientRect().height))).size) === 1, "las tarjetas de rutinas no miden lo mismo en horizontal");
  await p.click('[data-ir="#/planes/rutinas/z2"]'); await p.waitForFunction(() => document.querySelector(".split>.abierto .enc-tit h1")?.textContent === "Bici suave y larga", null, {timeout: 3000}).catch(() => { throw new Error("no abre la elegida a la derecha"); });
  ok(await p.evaluate(() => history.length) === 2, "en horizontal, abrir una rutina no suma pasos al botón atrás");
  ok(await p.$('.split>.lado .ru-card[data-sel][data-ir="#/planes/rutinas/z2"]'), "la rutina abierta no queda marcada en la lista");
  /* la elegida queda a la vista en su estante */
  ok(await p.evaluate(() => { const c = document.querySelector('.ru-card[data-sel]').getBoundingClientRect(), e = document.querySelector(".ru-est").getBoundingClientRect(); return c.left >= e.left - 1 && c.right <= e.right + 1; }), "la rutina elegida queda fuera de su estante");
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
  /* para vos arriba; después rutinas, ejercicios y pruebas (vuelta 32) */
  const [yv, yr, ye, yh] = await p.evaluate(() => [".pv-fila", "#pl-rutinas", "#pl-ejercicios", "#pl-hazanas"].map(s => document.querySelector(s).getBoundingClientRect().top));
  ok(yv < yr && yr < ye && ye < yh, "el orden de Planes no es para vos, rutinas, ejercicios y pruebas");
  ok(await p.$$eval('.lado [data-ir^="#/planes/hazanas/"]', x => new Set(x.map(y => y.dataset.ir)).size) === 14 && await p.$$eval('.lado .ru-card[data-ir^="#/planes/rutinas/"]', x => x.length) === 26, "Planes no tiene las 14 pruebas y las 26 rutinas");
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
  ok(o.includes("Sale de tu rumbo") && o.includes("Front lever y Motor"), "la fila de origen con rumbo: " + o);
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
  /* el primer día hay una sola guía, la de «Que Kozmos arme tu día» (Tu equipo, Tu nivel, Tu rumbo); con la primera sesión se va */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  const paso = () => p.$eval('.pasos [aria-current="step"]', x => x.textContent).catch(() => null);
  ok(!(await p.$(".pasos")), "Hoy muestra una guía además de la de adentro");
  ok(await p.$$eval(".como-op", x => x.length) === 2 && await p.$('.ajr[data-ir^="#/planes/hazanas/"]'), "no ofrece rumbo, rutina y hazaña");
  /* elegir una rutina lleva a Planes, sin pasos (la guía es la de armar tu día) */
  await p.click('.como-op[data-ir="#/planes"]'); await esperarTitulo(p, "Planes");
  ok(!(await p.$(".pasos")), "Planes muestra pasos");
  await p.click('nav.barra button[data-tab="hoy"]'); await esperarTitulo(p, "Hoy");
  /* que Kozmos arme el día: Tu equipo, Tu nivel y Tu rumbo */
  await p.click('.como-op[data-ir="#/hoy/equipo"]'); await esperarTitulo(p, "Tu equipo");
  ok(await paso() === "1Tu equipo", "Tu equipo no es el paso 1: " + await paso());
  await p.click('[data-equipo="barra"]'); await p.waitForSelector('[data-equipo="barra"][aria-pressed="true"]');
  await p.click("#eq-seguir"); await esperarTitulo(p, "Tu nivel");
  ok(await paso() === "2Tu nivel", "Tu nivel no es el paso 2: " + await paso());
  await p.click("#nv-seguir"); await esperarTitulo(p, "Tu rumbo");
  ok(await paso() === "3Tu rumbo", "Tu rumbo no es el paso 3: " + await paso());
  await p.click('[data-rumbo="front-lever"]'); await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  ok(!(await p.$(".pasos")), "con rumbo, Hoy sigue con una guía");
  ok((await p.textContent(".hoy-origen")).includes("Front lever"), "Hoy no dice de dónde sale");
  /* la primera sesión: durante la sesión no hay guía, y al volver ya no está */
  await empezar(p); await p.waitForSelector(".ses.serie");
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
  await empezar(q.p); await q.p.waitForSelector("#s-listo");
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
  /* en Vos se elige la persona de los dibujos: todo al azar de entrada, lo elegido manda en todos los ejercicios y queda a la vista en la fila */
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
  ok((await p.textContent("#rasgo-sexo em")) === "Mujer" && (await p.textContent("#rasgo-pelo em")) === "Al azar", "la fila no muestra lo elegido");
  await p.waitForTimeout(300); ok(!(await p.$(".utoast")), "elegir la persona ofrece deshacer");
  /* volver atrás es elegir de nuevo */
  await p.click("#rasgo-sexo"); await p.click('.pmi[data-id="hombre"]');
  await p.click("#rasgo-pelo"); await p.click('.pmi[data-id="rulos"]');
  ok(await p.evaluate(() => K.prefs.get("persona", {}).sexo === "hombre" && K.prefs.get("persona", {}).pelo === "rulos"), "no volvió a lo de antes");
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
  /* en la rutina, cada estrella de «Entrena para» muestra su constelación: la persona en su anillo (vuelta 22) */
  await ir(p, "#/planes/rutinas/base_cali");
  const filas = await p.$$eval(".ajr[data-ir^='#/cielo/']", fs => fs.map(f => !!f.querySelector(".tile svg.ico-cons")));
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
  await ir(r.p, "#/hoy"); await rumbo(r.p, ["front-lever"]); await empezar(r.p); await r.p.waitForSelector("#s-listo");
  ok(await r.p.$(".ses-fig svg.fig") && !(await r.p.$("svg.fig[data-fig]")), "con movimiento reducido la figura no queda quieta");
  await r.ctx.close();
  /* en horizontal entran la figura, el número y el botón, sin desplazar */
  const h = await pagina({width: 844, height: 390});
  await ir(h.p, "#/hoy"); await rumbo(h.p, ["front-lever"]); await empezar(h.p); await h.p.waitForSelector("#s-listo"); await h.p.waitForTimeout(1200); /* que termine de abrirse el disco */
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
  await empezar(p); await tick(p, 3000); await p.waitForSelector("#s-listo");
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

/* ===== Los íconos, opción B (vuelta 21): primero solo en Planes ===== */
prueba("planes-iconos-b", async () => {
  /* las pruebas son medallas (a color si ya tenés una magnitud, en gris si no) con los satélites de su nivel; las rutinas, el cuerpo con lo que trabajan
     y sus ejercicios, cada uno con su persona sobre un círculo del color de su familia (vuelta 32) */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarSes(p, [hzSes("t1", "2026-09-01", "hercules", "flexion", "repeticiones", 22)]);
  await ir(p, "#/planes"); await p.evaluate(() => { K.prefs.set("planes.rutinas", "todas"); K.refrescar(); }); await p.waitForTimeout(150);
  const med = await p.$$eval(".vt-m:not(.vacia)", bs => bs.map(b => { const sv = b.querySelector("svg.ico-medalla"), r = sv ? sv.getBoundingClientRect() : null;
    return {ir: b.dataset.ir, cls: sv ? sv.getAttribute("class") : "", sat: !!(sv && sv.querySelector(".ico-sat")), w: r ? r.width : 0, html: sv ? sv.outerHTML : ""}; }));
  ok(med.length === await p.evaluate(() => K.HAZANAS.hazanas.length) && med.every(f => /ico-medalla/.test(f.cls) && Math.abs(f.w - 46) < 1), "la vitrina sin sus medallas de 46 px: " + med.length);
  /* ganada: a color y con el satélite; sin ganar: gris y sin satélite */
  const fl = med.find(f => f.ir.endsWith("/hercules")), sin = med.filter(f => !f.ir.endsWith("/hercules"));
  ok(fl && /ganada/.test(fl.cls) && fl.sat && fl.html.includes("var(--fu)"), "la prueba ganada no es una medalla a color con su satélite");
  ok(sin.every(f => !/ganada/.test(f.cls) && !f.sat && f.html.includes("var(--off)") && !/var\(--(fu|mo|ra)\)/.test(f.html)), "una prueba sin hacer no está en gris");
  /* la rutina: el cuerpo con lo que trabaja en el color de su familia y sus ejercicios en su círculo */
  const R = await p.evaluate(() => K.RUTINAS.map(r => [r.id, r.familia]));
  for (const [id, fam] of R){ const c = await p.$eval(`.ru-card[data-ir="#/planes/rutinas/${id}"]`, x => ({cu: x.querySelector("svg.cuerpo")?.outerHTML || "", ej: [...x.querySelectorAll(".ej-caras svg.ico-ej")].map(y => y.outerHTML)}));
    ok(c.cu.includes(`var(--${fam})`) && c.ej.length && c.ej.every(h => h.includes(`var(--${fam}-soft)`)), id + ": la tarjeta no va en el color de su familia"); }
  /* solo con los colores de la app: nada de colores sueltos */
  const htmls = [...med.map(f => f.html), ...await p.$$eval(".ru-card svg", xs => xs.map(x => x.outerHTML))];
  ok(htmls.every(h => !/#[0-9a-f]{3,8}\b|rgb\(/i.test(h) && !/NaN|undefined/.test(h)), "un ícono con un color suelto o un número roto");
  /* la próxima prueba (52 px) y la prueba abierta (88 px), con la misma medalla */
  ok(await p.$eval(".pl-prox svg.ico-medalla", x => Math.round(x.getBoundingClientRect().width)) === 52, "la tarjeta de la próxima prueba sin su medalla");
  await ir(p, "#/planes/hazanas/hercules");
  ok(await p.$eval(".hz-fig svg.ico-medalla.ganada", x => Math.round(x.getBoundingClientRect().width)).catch(() => 0) === 88, "la prueba abierta sin su medalla");
  /* la tarjeta «Tu rutina» lleva sus semanas en puntos, como la tarjeta de su estante */
  await ir(p, "#/planes/rutinas/tabata"); await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy"); await ir(p, "#/planes");
  ok(await p.$(".pl-rut svg.sem-pts") && await p.$('.ru-card[data-ir="#/planes/rutinas/tabata"] svg.sem-pts'), "la tarjeta «Tu rutina» sin sus semanas");
  /* en horizontal, la lista y lo abierto entran sin desplazar de costado */
  await p.setViewportSize({width: 844, height: 390});
  for (const h of ["#/planes", "#/planes/hazanas/orion", "#/planes/rutinas/tabata"]){ await ir(p, h);
    ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 844, h + ": desborda");
    ok(await p.$$eval(".lado svg.ico-medalla", x => x.length) >= 14 && await p.$$eval(".lado svg.cuerpo", x => x.length) >= 26, h + ": la lista sin íconos"); }
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("planes-iconos-satelite", async () => {
  /* el satélite llega orbitando la primera vez que abrís Planes, después queda quieto; con movimiento reducido, nunca se mueve */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarSes(p, [hzSes("t1", "2026-09-01", "hercules", "flexion", "repeticiones", 22)]);
  await p.evaluate(() => K.ir("#/planes")); await p.waitForSelector(".ico-sat");
  ok(await p.$eval(".ico-sat", x => getComputedStyle(x).animationName) === "ico-orbita", "el satélite no llega orbitando");
  await p.evaluate(() => K.ir("#/planes/hazanas/hercules")); await p.waitForTimeout(150); await p.evaluate(() => K.ir("#/planes")); await p.waitForSelector(".ico-sat");
  ok(await p.$eval(".ico-sat", x => getComputedStyle(x).animationName) === "none", "el satélite orbita cada vez que volvés");
  await ctx.close();
  const r = await pagina(undefined, {reducedMotion: "reduce"});
  await ir(r.p, "#/hoy"); await sembrarSes(r.p, [hzSes("t1", "2026-09-01", "hercules", "flexion", "repeticiones", 22)]);
  await r.p.evaluate(() => K.ir("#/planes")); await r.p.waitForSelector(".ico-sat");
  ok(await r.p.$eval(".ico-sat", x => getComputedStyle(x).animationName) === "none", "con movimiento reducido el satélite se mueve");
  await r.ctx.close();
});
prueba("planes-iconos-rapidos", async () => {
  /* los 33 íconos de Planes se calculan una vez y se guardan: la primera vez en poco tiempo, después casi nada */
  const {ctx, p} = await pagina();
  await ir(p, "#/hoy");
  const t = await p.evaluate(() => { const m = f => { const a = performance.now(); f(); return performance.now() - a; };
    const primera = m(() => K.P.planes({tab: "planes"})); const otra = m(() => { for (let i = 0; i < 5; i++) K.P.planes({tab: "planes"}); }) / 5; return {primera, otra}; });
  ok(t.primera < 250, "la primera vez tarda " + JSON.stringify(t));
  ok(t.otra < Math.max(25, t.primera / 2), "los íconos no se guardan: " + JSON.stringify(t));
  await ctx.close();
});

/* ===== Los íconos B en el resto (vuelta 22): el Cielo con anillos y la misma figura en todas partes ===== */
const anotarMarcas = (p, ms) => p.evaluate(async ms => { for (const [estrella, ejercicio, tipo, valor, fecha] of ms) await K.diario.anotar({estrella, ejercicio, tipo, valor, fecha, catalogo: 1}); K.refrescar(); }, ms);
/* ===== Planes en estantes (vuelta 32): estantes iguales, la vitrina, la biblioteca y los nombres que abren cada ejercicio ===== */
prueba("planes-estantes", async () => {
  /* todo estante es igual: se desliza de costado, frena en cada tarjeta, la siguiente asoma y sus tarjetas miden lo mismo */
  const {ctx, p} = await pagina();
  await ir(p, "#/planes");
  const e = await p.evaluate(() => [...document.querySelectorAll(".estante")].map(x => { const cs = getComputedStyle(x), its = [...x.children].map(y => y.firstElementChild.getBoundingClientRect());
    return {cls: x.className, snap: cs.scrollSnapType, sobra: x.scrollWidth > x.clientWidth, altos: new Set(its.map(r => Math.round(r.height))).size, asoma: its.some(r => r.left < innerWidth && r.right > innerWidth),
      frena: [...x.children].every(y => getComputedStyle(y).scrollSnapAlign.includes("start"))}; }));
  ok(e.length === 2 && e.map(x => x.cls).join() === "estante ru-est,estante ej-est", "Planes no tiene el estante de rutinas y el de ejercicios: " + e.map(x => x.cls));
  for (const x of e) ok(/x/.test(x.snap) && /mandatory/.test(x.snap) && x.frena && x.sobra && x.altos === 1 && x.asoma, x.cls + ": " + JSON.stringify(x));
  /* en la tarjeta: el nombre empieza a la misma altura en todas, y el cuerpo, el nivel, sus semanas y sus ejercicios */
  ok(await p.$$eval(".ru-card .ru-nom", xs => new Set(xs.map(x => Math.round(x.getBoundingClientRect().top - x.closest(".ru-card").getBoundingClientRect().top))).size) === 1, "los nombres de las rutinas no arrancan a la misma altura");
  ok(await p.$$eval(".ru-card", xs => xs.every(x => x.querySelector("svg.cuerpo") && x.querySelector(".nv .nv-ic") && x.querySelector("svg.sem-pts") && x.querySelector(".ej-caras svg"))), "una tarjeta sin el cuerpo, el nivel, las semanas o los ejercicios");
  /* de inicial a avanzado: los satélites del nivel dicen lo mismo que el catálogo */
  const nv = await p.$$eval(".ru-card", xs => xs.map(x => [K.rutinaDe(x.dataset.ir.split("/").pop()).nivel, x.querySelectorAll(".nv-ic circle").length]));
  ok(nv.every(([n, c]) => c === 1 + 2 * n) && nv.every((x, i) => !i || nv[i - 1][0] <= x[0]), "el nivel de las rutinas: " + JSON.stringify(nv));
  /* deslizar un estante no mueve la página; volver a Planes lo deja donde estaba */
  await p.evaluate(() => { document.querySelector(".ru-est").scrollLeft = 600; }); await p.waitForTimeout(200);
  const x0 = await p.evaluate(() => document.querySelector(".ru-est").scrollLeft);
  ok(x0 > 300 && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "el estante no se desliza solo");
  await p.click("#pl-fam-rutinas"); await p.click('.pmi[data-id="todas"]'); await p.waitForTimeout(200);
  ok(Math.abs(await p.evaluate(() => document.querySelector(".ru-est").scrollLeft) - x0) < 2, "redibujar Planes manda el estante al principio");
  /* el cuerpo: lo que trabaja de lleno en el color de la familia y lo de apoyo, suave; con el corazón si trabaja */
  const cu = await p.evaluate(() => { const r = K.rutinaDe("z2"), h = K.rutinaHace(r); return {z: h.zonas, sv: K.cuerpo(h.zonas, r.familia)}; });
  ok(cu.z.corazon === 2 && cu.sv.includes("var(--mo)") && /aria-label="Trabaja [^"]*corazón/.test(cu.sv), "una rutina de bici no trabaja el corazón: " + JSON.stringify(cu.z));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("planes-vitrina", async () => {
  /* las pruebas, en una vitrina: un tema por fila y un nivel por columna; la grande dice el nombre y tu marca, y abre cada una */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await sembrarSes(p, [hzSes("t1", "2026-09-01", "lira", "colgado-arriba", "segundos", 42)]);
  await ir(p, "#/planes");
  const v = await p.$$eval(".vt-cd:not(.grande) .vt-fila", fs => fs.map(f => [f.querySelector(".vt-tema").textContent.trim(), [...f.querySelectorAll(".vt-m")].map(m => m.classList.contains("vacia") ? "" : m.dataset.ir.split("/").pop())]));
  const esperado = await p.evaluate(() => K.biblio.vitrina(K.HAZANAS.hazanas).map(t => [t.nombre, t.pruebas.map(h => h ? h.id : "")]));
  ok(JSON.stringify(v) === JSON.stringify(esperado), "la vitrina: " + JSON.stringify(v));
  ok(v.length === 6 && v.every(([, c]) => c.length === 3), "la vitrina no tiene seis temas de tres niveles");
  ok(await p.$$eval(".vt-cd .vt-cab .vt-nv", xs => xs.map(x => x.textContent.trim()).join()) === "Inicial,Intermedio,Avanzado", "las columnas no son los tres niveles");
  ok((await p.textContent(".pl-tit#pl-hazanas")).includes("1 de 14"), "el título no cuenta las medallas: " + await p.textContent(".pl-tit#pl-hazanas"));
  /* «Ver todas»: la vitrina grande */
  await p.click('#pl-hazanas .pl-ver'); await esperarTitulo(p, "Pruebas");
  ok(await p.evaluate(() => location.hash) === "#/planes/pruebas" && await p.$$eval(".vt.grande .vt-m:not(.vacia) b", x => x.length) === 14, "la vitrina grande no nombra las 14 pruebas");
  ok((await p.textContent('.vt-m[data-ir="#/planes/pruebas/lira"]')).includes("42 s"), "la vitrina grande no dice tu marca");
  /* abrir una: su tema y su nivel arriba del nombre, la medalla con sus satélites y la fuente al pie */
  await p.click('.vt-m[data-ir="#/planes/pruebas/centauro"]'); await esperarTitulo(p, "12 minutos corriendo");
  const t = await p.evaluate(() => [...document.querySelectorAll(".enc-sub, .enc-tit .lb, .enc-tit small")].map(x => x.textContent).join("|") + "||" + document.querySelector(".hzn").textContent);
  ok(t.includes("Motor, intermedio") && t.includes("Fuente: Cooper (1968)"), "la prueba nueva no dice su tema, su nivel o su fuente: " + t.slice(0, 200));
  ok((await p.$$eval(".hz-fig svg circle[r='6']", x => x.length)) === 2, "la medalla no lleva los dos satélites de intermedio");
  await p.click(".enc-acc [data-volver]:visible"); await esperarTitulo(p, "Pruebas");
  /* en horizontal: la vitrina a la izquierda, la abierta a la derecha */
  await p.setViewportSize({width: 844, height: 390}); await ir(p, "#/planes/pruebas/tauro");
  ok(await p.evaluate(() => { const a = document.querySelector(".split>.lado").getBoundingClientRect(), b = document.querySelector(".split>.abierto").getBoundingClientRect(); return b.left >= a.right - 1 && document.querySelector(".split>.abierto .enc-tit h1").textContent === "Silla, un minuto" && !!document.querySelector('.lado .vt-m[data-sel][data-ir="#/planes/pruebas/tauro"]'); }), "la vitrina en horizontal no sigue el patrón de Ajustes");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("biblioteca-ejercicios", async () => {
  /* la biblioteca: las puertas de Planes abren la lista de lo que trabajan; dos menús (qué trabaja y con qué); cada ejercicio con su persona y su escalera */
  const {ctx, p} = await pagina();
  await ir(p, "#/planes");
  const pu = await p.$$eval(".ej-puerta", xs => xs.map(x => x.dataset.ejque));
  ok(pu.join() === "tirar,empujar,piernas,bisagra,abdomen,movilidad,motor,todo", "las puertas: " + pu);
  await p.click('.ej-puerta[data-ejque="tirar"]'); await esperarTitulo(p, "Ejercicios");
  ok(await p.evaluate(() => location.hash) === "#/planes/ejercicios" && (await p.textContent("#ej-que")).includes("Tirar"), "la puerta no abre la lista de Tirar");
  ok(await p.$$eval(".ej-grupo", x => x.map(y => y.id).join()) === "ej-g-tirar", "la lista no es solo Tirar");
  /* «Qué trabaja» y «Con qué», con menús */
  await p.click("#ej-que"); await p.waitForSelector(".pop");
  ok(await p.$$eval('.pop .pmi[role="menuitemradio"]', x => x.length) === 8, "el menú «Qué trabaja» no tiene Todo y los siete grupos");
  await p.click('.pmi[data-id="todo"]'); await p.waitForFunction(() => document.querySelectorAll(".ej-grupo").length === 7);
  await p.click("#ej-con"); await p.click('.pmi[data-id="nada"]'); await p.waitForFunction(() => document.querySelector("#ej-con").textContent.includes("Sin nada"));
  ok(await p.$$eval('.ej-grupo .ajr', xs => xs.every(x => !(K.EJ[x.dataset.ir.split("/").pop()].equipo || []).length)), "«Sin nada» muestra ejercicios con equipo");
  const n = await p.$$eval(".ej-grupo .ajr", x => x.length), todos = await p.evaluate(() => K.EJERCICIOS.ejercicios.length);
  ok(n > 20 && n < todos && (await p.textContent(".enc-sub, .enc-tit")).includes(`${n} de ${todos}`), "la lista no dice cuántos muestra");
  await p.reload(); await p.waitForSelector("#ej-con");
  ok((await p.textContent("#ej-con")).includes("Sin nada"), "lo elegido en «Con qué» no queda");
  await p.click("#ej-con"); await p.click('.pmi[data-id="todo"]'); await p.waitForFunction(() => document.querySelector("#ej-con").textContent.includes("cualquier"));
  /* un ejercicio: la persona, el cuerpo, cómo se hace, tu marca, su escalera (más fácil y más difícil), la prueba que lo mide y las rutinas que lo usan */
  await p.click('.ajr[data-ir="#/planes/ejercicios/dominada"]'); await esperarTitulo(p, "Dominada");
  for (const s of [".ej-fig svg", ".ej-vista svg.cuerpo", ".ej-como", ".ej-marca", ".ej-esc .ej-este", '.ajr[data-ir="#/planes/pruebas/perseo"] svg.ico-medalla', '.ajr[data-ir^="#/planes/rutinas/"]'])
    ok(await p.$(s), "al ejercicio le falta " + s);
  const esc = await p.$$eval(".ej-esc .ajr", xs => xs.map(x => [x.querySelector(".ses-fila").firstChild.textContent, x.querySelector("em").textContent]));
  const k = esc.findIndex(x => x[1].startsWith("Este"));
  ok(k > 0 && esc[k - 1][1] === "Más fácil" && esc[k + 1][1].match(/Más difícil|El tuyo/), "la escalera: " + JSON.stringify(esc));
  await p.click('.ej-esc .ajr[data-ir="#/planes/ejercicios/dominada-negativa"]'); await esperarTitulo(p, "Dominada negativa");
  await p.click(".enc-acc [data-volver]:visible"); await esperarTitulo(p, "Dominada");
  /* en horizontal, la lista y el abierto; la fila abierta queda a la vista en la lista */
  await p.setViewportSize({width: 844, height: 390}); await ir(p, "#/planes/ejercicios/pistol-silla");
  ok(await p.evaluate(() => { const l = document.querySelector(".split>.lado").getBoundingClientRect(), s = document.querySelector('.split>.lado .ajr[data-sel][data-ir="#/planes/ejercicios/pistol-silla"]')?.getBoundingClientRect(), b = document.querySelector(".split>.abierto").getBoundingClientRect();
    return s && s.top >= l.top - 1 && s.bottom <= l.bottom + 1 && b.left >= l.right - 1 && document.documentElement.scrollWidth <= innerWidth; }), "en horizontal, la fila abierta no queda a la vista o no va en dos columnas");
  const h0 = await p.evaluate(() => history.length);
  await p.click('.lado .ajr[data-ir="#/planes/ejercicios/sentadilla"]'); await p.waitForFunction(() => document.querySelector(".split>.abierto .enc-tit h1")?.textContent === "Sentadilla");
  ok(await p.evaluate(() => history.length) === h0, "en horizontal, abrir un ejercicio suma pasos al botón atrás");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("ejercicio-enlaces", async () => {
  /* en Hoy y en los días de una rutina, el nombre de cada ejercicio abre su página; volver vuelve de donde viniste. El resto de la fila no cambia */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever", "planche"]);
  const ls = await p.$$eval(".hoy-toca .ej-ln", xs => xs.map(x => [x.textContent, x.dataset.ir, K.EJ[x.dataset.ir.split("/").pop()]?.nombre]));
  ok(ls.length >= 3 && ls.every(([t, h, n]) => h.startsWith("#/planes/ejercicios/") && t === n), "Hoy sin nombres que abran su ejercicio: " + JSON.stringify(ls));
  /* la fila sigue igual: el nombre a la izquierda y lo que toca a la derecha, en la misma línea */
  ok(await p.$$eval(".hoy-toca .ln.toca", xs => xs.every(x => { const q = x.querySelector(".toca-q").getBoundingClientRect(), n = x.querySelector(".toca-n").getBoundingClientRect(); return n.left >= q.right - 1 && Math.abs(n.top - q.top) < 8; })), "las filas cambiaron de forma");
  await p.click(".hoy-toca .toca-n >> nth=0"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => location.hash) === "#/hoy", "tocar lo que toca abre algo");
  const [nom, h] = ls[0];
  await p.click(`.hoy-toca .ej-ln[data-ir="${h}"] >> nth=0`); await esperarTitulo(p, nom);
  ok(await p.evaluate(() => location.hash) === h && await p.getAttribute('nav.barra button[data-tab="planes"]', "aria-current") === "page", "el ejercicio no se abre en Planes");
  await p.click(".enc-acc [data-volver]:visible"); await esperarTitulo(p, "Hoy");
  /* lo mismo en los días de una rutina */
  await ir(p, "#/planes/rutinas/base_cali"); await p.waitForSelector(".rut-dia .ej-ln");
  const r = await p.$eval(".rut-dia .ej-ln", x => [x.textContent, x.dataset.ir]);
  await p.click(".rut-dia .ej-ln >> nth=0"); await esperarTitulo(p, r[0]);
  await p.click(".enc-acc [data-volver]:visible"); await esperarTitulo(p, "Base de calistenia");
  /* y en la rutina, sus ejercicios con su persona */
  ok(await p.$$eval('.ru-vista .ej-cara[data-ir^="#/planes/ejercicios/"]', x => x.length) >= 6, "la rutina no muestra sus ejercicios");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
const icos = (p, sel) => p.$$eval(sel, xs => xs.map(x => ({cls: x.getAttribute("class"), w: x.clientWidth, arco: !!x.querySelector(".ico-arco"), sat: !!x.querySelector(".ico-sat"), html: x.outerHTML})));
prueba("iconos-b-cielo", async () => {
  /* cada constelación es su figura adentro de un anillo de avance: en la grilla (76 px), en la lista (40 px) y abierta (96 px) */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  await anotarMarcas(p, [["front-lever.colgado-60s", "colgado-activo", "segundos", 62, "2026-09-10"], ["diez-km.60min", "trote", "minutos", 62, "2026-08-01"], ["diez-km.sub-50", "10km", "menos-minutos", 48, "2026-09-01"]]);
  await ir(p, "#/cielo");
  const g = await icos(p, ".cielo-grilla .cons-tile svg.ico-cons"), l = await icos(p, ".cons-fila .tile svg.ico-cons");
  ok(g.length === 14 && g.every(x => x.w === 76), "la grilla no tiene sus 14 anillos de 76 px: " + g.map(x => x.w));
  ok(l.length === 14 && l.every(x => x.w === 40), "la lista no tiene sus anillos de 40 px");
  ok(!(await p.$(".cielo-svg, .leyenda")), "quedó el cielo de estrellas");
  const tile = async id => (await icos(p, `.cons-tile[data-ir="#/cielo/${id}"] svg.ico-cons`))[0];
  const fl = await tile("front-lever"), km = await tile("diez-km"), pl = await tile("planche");
  ok(fl.arco && fl.sat && !/completa/.test(fl.cls) && fl.html.includes("var(--fu)") && fl.html.includes("var(--fu-soft)"), "Front lever no muestra su avance con el satélite en la punta");
  ok(/completa/.test(km.cls) && km.sat && km.html.includes('stroke-dasharray="100 0"'), "10 km completa no cierra el anillo con el satélite");
  ok(!pl.arco && !pl.sat && pl.html.includes("var(--fu-soft)"), "Planche sin estrellas no queda en la pista sola");
  ok(g.every(x => !/#[0-9a-f]{3,8}\b|rgb\(|NaN|undefined/i.test(x.html)), "un anillo con un color suelto o un número roto");
  /* abierta: la figura en su anillo y, de fondo y tenue, las estrellas */
  await ir(p, "#/cielo/front-lever");
  ok((await icos(p, ".cons-cab .cons-ico svg.ico-cons"))[0]?.w === 96, "la constelación abierta sin su anillo");
  ok(await p.$eval(".cons-fondo", x => +getComputedStyle(x).opacity).catch(() => 1) < .5 && await p.$(".cons-fondo .cons-svg"), "las estrellas no quedan de fondo y tenues");
  ok((await icos(p, ".cons-fondo ~ * svg.ico-cons, .ajr svg.ico-rutina")).length >= 2, "las rutinas que llevan acá sin su ícono");
  /* en horizontal: la lista con sus anillos y la abierta al lado, sin desplazar de costado */
  await p.setViewportSize({width: 844, height: 390}); await ir(p, "#/cielo/parada-de-manos");
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 844 && (await icos(p, ".lado .cons-fila svg.ico-cons")).length === 14 && await p.$(".abierto .cons-cab svg.ico-cons"), "el Cielo en horizontal");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("iconos-b-en-todas", async () => {
  /* lo mismo se dibuja igual en todas partes: la prueba es su medalla, la constelación su anillo y la rutina su círculo */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  /* el primer día: tres anillos para el rumbo y la medalla para «¿Solo por hoy?» */
  ok((await icos(p, ".como-dib .ico-trio svg.ico-cons")).length === 3, "el primer día no muestra los anillos del rumbo");
  ok((await icos(p, '.ajr[data-ir^="#/planes/hazanas/"] .tile svg.ico-medalla')).length === 1, "«¿Solo por hoy?» sin su medalla");
  await sembrarSes(p, [hzSes("t1", "2026-09-01", "hercules", "flexion", "repeticiones", 22)]);
  await rumbo(p, ["front-lever", "parada-de-manos"]); await ir(p, "#/hoy");
  ok((await icos(p, ".hoy-origen .tile svg.ico-cons"))[0]?.w === 40 && (await icos(p, ".hoy-prox svg.ico-cons"))[0]?.w === 64, "Hoy con rumbo: la fila y la próxima estrella sin su anillo");
  await ir(p, "#/hoy/rumbo");
  ok((await icos(p, ".rumbo-fila .tile svg.ico-cons")).length === 14, "Tu rumbo sin anillos");
  /* en una rutina: «Entrena para» y en una prueba: «Enciende», con el anillo de la constelación */
  await ir(p, "#/planes/rutinas/base_cali");
  ok((await icos(p, '.rut .ajr[data-ir^="#/cielo/"] .tile svg.ico-cons')).length >= 3, "«Entrena para» sin anillos");
  await ir(p, "#/planes/hazanas/perseo");
  ok((await icos(p, '.hzn .ajr[data-ir^="#/cielo/"] .tile svg.ico-cons')).length >= 2, "«Enciende» sin anillos");
  /* seguir una rutina: Hoy dice de dónde sale con su círculo */
  await ir(p, "#/planes/rutinas/base_cali"); await p.click("#rut-seguir"); await esperarTitulo(p, "Hoy");
  ok((await icos(p, ".hoy-origen .tile svg.ico-rutina"))[0]?.w === 40, "«Sale de tu rutina» sin su círculo");
  /* Progreso: la prueba con su medalla a color */
  await ir(p, "#/progreso");
  const pr = await icos(p, '.ajr[data-ir="#/progreso/t1"] .tile svg');
  ok(pr[0] && /ico-medalla ganada/.test(pr[0].cls), "Progreso: la prueba sin su medalla");
  /* nada del dibujo viejo en ninguna pantalla */
  for (const h of ["#/hoy", "#/cielo", "#/cielo/front-lever", "#/progreso", "#/planes", "#/planes/rutinas/base_cali", "#/planes/hazanas/perseo", "#/progreso/t1"]){ await ir(p, h);
    ok(!(await p.$("#app svg.figura, #app .cielo-svg, #app .fig-tile, #app .tile.anillo")), h + ": queda un dibujo viejo"); }
  ok(await p.$(".res-fig svg.ico-medalla.ganada"), "el resumen de la prueba sin su medalla");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("iconos-b-cielo-llega", async () => {
  /* la primera vez que abrís el Cielo los anillos se cierran y el satélite los acompaña; después, quietos; con movimiento reducido, nunca */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await anotarMarcas(p, [["front-lever.colgado-60s", "colgado-activo", "segundos", 62, "2026-09-10"]]);
  await p.evaluate(() => K.ir("#/cielo")); await p.waitForSelector(".cons-tile .ico-arco");
  ok(await p.$eval(".cons-tile .ico-arco", x => getComputedStyle(x).animationName) === "ico-arco" && await p.$eval(".cons-tile .ico-sat", x => getComputedStyle(x).animationName) === "ico-gira", "el anillo no se cierra la primera vez");
  await p.evaluate(() => K.ir("#/hoy")); await p.waitForTimeout(150); await p.evaluate(() => K.ir("#/cielo")); await p.waitForSelector(".cons-tile .ico-arco");
  ok(await p.$eval(".cons-tile .ico-arco", x => getComputedStyle(x).animationName) === "none", "el anillo se anima cada vez");
  await ctx.close();
  const r = await pagina(undefined, {reducedMotion: "reduce"});
  await ir(r.p, "#/hoy"); await anotarMarcas(r.p, [["front-lever.colgado-60s", "colgado-activo", "segundos", 62, "2026-09-10"]]);
  await r.p.evaluate(() => K.ir("#/cielo")); await r.p.waitForSelector(".cons-tile .ico-arco");
  ok(await r.p.$eval(".cons-tile .ico-arco", x => getComputedStyle(x).animationName) === "none", "con movimiento reducido el anillo se mueve");
  await r.ctx.close();
});
prueba("iconos-b-cielo-rapido", async () => {
  /* el Cielo arma sus 28 anillos rápido la primera vez y después salen de la memoria */
  const {ctx, p} = await pagina();
  await ir(p, "#/hoy");
  const t = await p.evaluate(() => { const m = f => { const a = performance.now(); f(); return performance.now() - a; };
    const primera = m(() => K.P.cielo({tab: "cielo"})); const otra = m(() => { for (let i = 0; i < 5; i++) K.P.cielo({tab: "cielo"}); }) / 5; return {primera, otra}; });
  ok(t.primera < 250, "la primera vez tarda " + JSON.stringify(t));
  ok(t.otra < Math.max(30, t.primera / 2), "los anillos no se guardan: " + JSON.stringify(t));
  await ctx.close();
});

/* ===== Vuelta 23: la medianoche y el deshacer que espera detrás de un aviso ===== */
/* el teléfono durmió: la hora salta sin que corra ningún reloj, y al volver a la app llega «visibilitychange» */
const despertar = async (p, hora) => { await p.clock.setSystemTime(new Date(hora)); await p.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); await p.waitForTimeout(120); };
prueba("medianoche-anotar", async () => {
  /* empezaste a anotar a las 23:58 y guardás pasada la medianoche: el día que no elegiste es el de hoy, no el de ayer */
  const {ctx, p} = await conReloj(undefined, "2026-10-20T23:58:00");
  await ir(p, "#/cielo/front-lever/anotar");
  ok(await p.textContent("#f-fecha em") === "Hoy", "el día no arranca en hoy");
  await p.fill("#f-valor", "45");
  await p.clock.runFor(3 * 60e3);
  ok(await p.evaluate(() => K._form.fecha) === "2026-10-21", "pasada la medianoche, Anotar sigue en ayer: " + await p.evaluate(() => K._form.fecha));
  ok(await p.textContent("#f-fecha em") === "Hoy", "la fila del día no dice hoy: " + await p.textContent("#f-fecha em"));
  ok(await p.inputValue("#f-valor") === "45", "se perdió lo escrito");
  await p.click("#f-guardar"); await p.waitForFunction(() => K.diario.mediciones.length === 1);
  ok(await p.evaluate(() => K.diario.mediciones.at(-1).fecha) === "2026-10-21", "la marca se guardó con la fecha de ayer");
  /* lo mismo si el teléfono durmió y no corrió ningún reloj: al guardar vale el día de hoy */
  await ir(p, "#/cielo/espagat/anotar"); await p.fill("#f-valor", "30");
  await p.clock.setSystemTime(new Date("2026-10-22T00:10:00"));
  await p.click("#f-guardar"); await p.waitForFunction(() => K.diario.mediciones.length === 2);
  ok(await p.evaluate(() => K.diario.mediciones.at(-1).fecha) === "2026-10-22", "sin relojes, la marca se guardó con la fecha de ayer");
  /* el día que elegiste a mano se respeta */
  await ir(p, "#/cielo/front-lever/anotar"); await p.click("#f-fecha"); await p.click('.pmi[data-id="2026-10-21"]');
  await despertar(p, "2026-10-23T08:00:00");
  ok(await p.evaluate(() => K._form.fecha) === "2026-10-21", "pisó el día que elegiste");
  ok(await p.textContent("#f-fecha em") === "Anteayer", "la fila del día no se redibujó: " + await p.textContent("#f-fecha em"));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("medianoche-hoy", async () => {
  /* entrenaste a la noche y dejaste la app abierta: a la mañana, Hoy es otro día */
  const {ctx, p} = await conReloj(undefined, "2026-10-20T23:50:00");
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await p.evaluate(s => K.diario.guardarSesion(s).then(() => K.refrescar()), sEsc("n1", "2026-10-20", 0, [[null, "sentadilla", [9, 9, 9], null, 9]]));
  await p.waitForFunction(() => document.querySelector(".hoy").textContent.includes("Hoy ya entrenaste"));
  await despertar(p, "2026-10-21T07:30:00");
  ok(!(await p.textContent(".hoy")).includes("Hoy ya entrenaste"), "a la mañana, Hoy sigue en ayer");
  ok(await p.$("#s-empezar"), "no ofrece empezar el día nuevo");
  /* con la app a la vista, a la medianoche también cambia */
  await p.evaluate(s => K.diario.guardarSesion(s).then(() => K.refrescar()), sEsc("n2", "2026-10-21", 1, [[null, "sentadilla", [9, 9, 9], null, 9]]));
  await p.waitForFunction(() => document.querySelector(".hoy").textContent.includes("Hoy ya entrenaste"));
  await p.clock.runFor(17 * 3600e3);
  ok(!(await p.textContent(".hoy")).includes("Hoy ya entrenaste"), "a la medianoche, Hoy sigue en ayer");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("medianoche-sesion-sigue", async () => {
  /* una sesión que cruza la medianoche sigue tal cual: mismo paso, lo anotado y la fecha de su inicio */
  const {ctx, p} = await conReloj(undefined, "2026-10-20T23:59:00");
  await ir(p, "#/hoy"); await rumbo(p, ["front-lever"]);
  await empezar(p); await p.waitForSelector(".ses.serie");
  await tick(p, 30000); await p.click("#s-listo"); await p.waitForSelector(".ses.descanso"); await p.fill("#s-valor", "22");
  const antes = await p.evaluate(() => [K.sesion.estado().id, K.sesion.estado().b, K.sesion.estado().s]);
  await tick(p, 40000);
  ok(await p.evaluate(() => new Date().getDate()) === 21, "la prueba no cruzó la medianoche");
  ok(await p.$(".ses.descanso"), "la sesión cambió de paso");
  ok(await p.inputValue("#s-valor") === "22", "se perdió lo anotado");
  const ahora = await p.evaluate(() => [K.sesion.estado().id, K.sesion.estado().b, K.sesion.estado().s]);
  ok(JSON.stringify(ahora) === JSON.stringify(antes), "la sesión no es la misma: " + ahora + " · " + antes);
  ok(await p.evaluate(() => K.sesion.estado().fecha) === "2026-10-20", "la sesión cambió su fecha de inicio");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("aviso-y-deshacer", async () => {
  /* un aviso de error no se lleva el deshacer: espera detrás, con el tiempo que le quedaba, y vuelve cuando el aviso se va.
     El deshacer es el de borrar algo; el aviso, uno de error (el rumbo ya no tiene tope, vuelta 28) */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy/rumbo");
  const ids = await p.evaluate(() => K.CATALOGO.constelaciones.slice(0, 4).map(c => c.id));
  const deshacer = '.utoast:not(.solo):not(.out)', aviso = ".utoast.solo:not(.out)";
  const avisar = () => p.evaluate(() => K.aviso("No se pudo guardar en este teléfono."));
  const borrar = (t = "Borraste una marca") => p.evaluate(t => { window.__deshecho = window.__deshecho || []; K.deshacer(t, () => window.__deshecho.push(t)); }, t);
  for (const id of ids.slice(0, 3)) await p.click(`[data-rumbo="${id}"]`);
  ok(!(await p.$(".utoast")), "elegir el rumbo ofrece deshacer");
  await borrar(); await p.waitForSelector(deshacer);
  /* un aviso de error, y otro encima del primero, no se llevan el deshacer */
  await avisar(); await p.waitForSelector(aviso);
  ok((await p.textContent(aviso + " .utx")).startsWith("No se pudo guardar"), "no muestra el aviso");
  ok(!(await p.$(deshacer)), "el deshacer queda tapado debajo del aviso");
  await p.clock.runFor(1000); await avisar();
  ok(await p.$$eval(".utoast:not(.out)", x => x.length) === 1, "quedan dos avisos a la vez");
  await p.clock.runFor(5100);
  ok(!(await p.$(aviso)), "el aviso no se fue");
  ok(await p.$(deshacer), "el aviso de error se llevó el deshacer");
  ok((await p.textContent(deshacer + " .utx")) === "Borraste una marca", "volvió otro deshacer: " + await p.textContent(deshacer + " .utx"));
  await p.click(deshacer + " .utu");
  ok(await p.evaluate(() => JSON.stringify(window.__deshecho)) === '["Borraste una marca"]', "el deshacer que volvió no deshace");
  /* vuelve con el tiempo que le quedaba, y el anillo donde había quedado (el puntero se aparta: encima, el tiempo se frena) */
  await p.mouse.move(5, 5);
  await borrar(); await p.waitForSelector(deshacer);
  await p.clock.runFor(3000);
  await avisar(); await p.waitForSelector(aviso);
  await p.keyboard.press("Escape");
  ok(!(await p.$(aviso)) && await p.$(deshacer), "Escape en el aviso no devuelve el deshacer");
  { const dl = await p.$eval(deshacer + " .utr circle:not(.f)", c => getComputedStyle(c).animationDelay); ok(parseFloat(dl) <= -2.9 && parseFloat(dl) >= -3.5, "el anillo vuelve lleno: " + dl); }
  await p.clock.runFor(1500);
  ok(await p.$(deshacer), "el deshacer que volvió se fue antes de tiempo");
  await p.clock.runFor(900);
  ok(!(await p.$(deshacer)), "el deshacer que volvió dura de nuevo los 5 s");
  /* un deshacer nuevo reemplaza al que esperaba: nunca vuelve uno viejo */
  await borrar("Borraste la sesión de hoy"); await p.waitForSelector(deshacer); await p.clock.runFor(300);
  await avisar(); await p.waitForSelector(aviso);
  await borrar(); await p.waitForSelector(deshacer);
  ok((await p.textContent(deshacer + " .utx")) === "Borraste una marca", "no muestra el deshacer nuevo");
  await p.clock.runFor(5500);
  ok(!(await p.$(".utoast")), "volvió un deshacer viejo");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sin-deshacer-al-elegir", async () => {
  /* elegir o cambiar algo que queda a la vista en el control no ofrece deshacer; borrar sí */
  const {ctx, p} = await pagina();
  const sinDeshacer = async (que) => { await p.waitForTimeout(400); ok(!(await p.$(".utoast")), que + " ofrece deshacer"); };
  /* rumbo: se marca la fila, otro toque la desmarca */
  await ir(p, "#/hoy/rumbo");
  const id = await p.evaluate(() => K.CATALOGO.constelaciones[0].id);
  await p.click(`[data-rumbo="${id}"]`); await p.waitForSelector(`[data-rumbo="${id}"][aria-pressed="true"] .ck`);
  await sinDeshacer("sumar al rumbo");
  await p.click(`[data-rumbo="${id}"]`); await p.waitForSelector(`[data-rumbo="${id}"][aria-pressed="false"]`);
  await sinDeshacer("sacar del rumbo");
  ok(await p.evaluate(() => K.rumbo().length === 0), "otro toque no lo sacó del rumbo");
  /* equipo */
  await ir(p, "#/vos/equipo");
  await p.click('[data-equipo="soga"]'); await p.waitForSelector('[data-equipo="soga"][aria-pressed="true"] .ck');
  await sinDeshacer("sumar equipo");
  await p.click('[data-equipo="soga"]'); await p.waitForSelector('[data-equipo="soga"][aria-pressed="false"]');
  await sinDeshacer("sacar equipo");
  /* días */
  await ir(p, "#/vos/dias");
  await p.click('[data-dia="1"]'); await p.waitForSelector('[data-dia="1"][aria-pressed="true"] .ck');
  await sinDeshacer("elegir un día");
  /* tema */
  await ir(p, "#/vos");
  await p.click("#tema-menu"); await p.click('.pmi[data-id="light"]');
  ok(await p.getAttribute("html", "data-theme") === "light" && (await p.textContent("#tema-menu em")) === "Claro", "el tema no se ve elegido");
  await sinDeshacer("cambiar el tema");
  /* avisos */
  await p.click("#avisos-menu"); await p.click('.pmi[data-id="vibra"]');
  ok((await p.textContent("#avisos-menu em")) === "Solo vibración", "los avisos no se ven elegidos");
  await sinDeshacer("cambiar los avisos");
  /* peso */
  await ir(p, "#/vos/peso"); await p.fill("#v-peso", "72"); await p.click("#v-peso-listo"); await esperarTitulo(p, "Vos");
  ok((await p.textContent('[data-ir="#/vos/peso"] em')) === "72 kg", "el peso no se ve en su fila");
  await sinDeshacer("guardar el peso");
  /* borrar una marca sigue ofreciendo deshacer */
  await p.evaluate(() => K.diario.anotar({ejercicio: "colgado-activo", tipo: "segundos", estrella: "front-lever.colgado-60s", fecha: K.hoy(), valor: 45}));
  await ir(p, "#/cielo/front-lever"); await p.waitForSelector(".marca");
  await p.click(".marca [data-borrar]"); await p.waitForFunction(() => !document.querySelector(".marca"));
  await p.waitForSelector(".utoast:not(.solo) .utu");
  ok((await p.textContent(".utoast .utx")) === "Borraste una marca", "borrar una marca no ofrece deshacer");
  await p.click(".utoast .utu"); await p.waitForSelector(".marca");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

/* ===== El primer día y Cosmos (vuelta 26) ===== */
prueba("cosmos-nombre", async () => {
  /* la pestaña se llama Cosmos y la pantalla, Tu cosmos; en ninguna pantalla queda «cielo» a la vista */
  const {ctx, p} = await conReloj();
  const sinCielo = async donde => {
    const t = await p.evaluate(() => document.body.innerText + " " + [...document.querySelectorAll("[aria-label]")].map(x => x.getAttribute("aria-label")).join(" ") + " " + document.title);
    const m = /.{0,30}cielo.{0,30}/i.exec(t); ok(!m, `${donde}: dice «${m && m[0]}»`);
  };
  await ir(p, "#/hoy"); await sinCielo("Hoy, el primer día");
  await p.click('nav.barra button[data-tab="cielo"]'); await esperarTitulo(p, "Tu cosmos");
  await p.waitForTimeout(500);
  ok(await p.textContent('nav.barra [aria-current="page"] .nm') === "Cosmos", "la barra no dice Cosmos");
  ok(await p.evaluate(() => document.title) === "Tu cosmos", "el título de la página: " + await p.evaluate(() => document.title));
  await sinCielo("Tu cosmos vacío");
  for (const h of ["#/cielo/front-lever", "#/cielo/front-lever/anotar", "#/planes", "#/progreso", "#/vos", "#/vos/equipo", "#/hoy/equipo", "#/hoy/rumbo"]){ await ir(p, h); await sinCielo(h); }
  /* con historia: Hoy, la sesión con su menú, el resumen y Progreso */
  await ir(p, "#/hoy"); await rumbo(p, ["espagat"]); await sinCielo("Hoy con rumbo");
  await empezar(p); await p.waitForSelector(".ses.serie");
  await p.click("#s-mas"); await p.waitForSelector('.pmi[data-id="cielo"]');
  ok((await p.textContent('.pmi[data-id="cielo"]')).trim() === "Mirar tu cosmos", "el menú de la sesión: " + await p.textContent('.pmi[data-id="cielo"]'));
  await sinCielo("el menú de la sesión");
  await p.click('.pmi[data-id="cielo"]'); await esperarTitulo(p, "Tu cosmos"); await sinCielo("Tu cosmos con la isla");
  await ir(p, "#/hoy/sesion"); await tick(p, 40000); await p.click("#s-listo"); await p.click("#s-cortar"); await p.waitForSelector(".res");
  await p.evaluate(() => K.deshacer.cerrar(true)); await sinCielo("el resumen");
  for (const h of ["#/hoy", "#/cielo", "#/progreso"]){ await ir(p, h); await sinCielo(h + " con historia"); }
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("primer-dia-equipo", async () => {
  /* «Que Kozmos arme tu día»: Tu equipo (nada marcado) → Seguir → Tu rumbo → Listo → Hoy con lo que toca */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy");
  ok(await p.evaluate(() => K.diario.perfil.equipo == null), "arranca con equipo elegido");
  await p.click('.como-op[data-ir="#/hoy/equipo"]'); await esperarTitulo(p, "Tu equipo");
  ok(await p.$$eval("[data-equipo]", x => x.length) === 9 && await p.$$eval('[data-equipo][aria-pressed="true"], [data-equipo] .ck', x => x.length) === 0, "el primer día hay equipo marcado de entrada");
  ok((await p.textContent("main.view .ayuda")) === "Marcá lo que tenés. Sin nada también se entrena.", "la ayuda: " + await p.textContent("main.view .ayuda"));
  ok((await p.textContent("main.view .enc-tit small")) === "Para empezar", "el paso no dice Para empezar");
  ok(JSON.stringify(await p.$$eval(".pasos li span", x => x.map(y => y.textContent))) === '["Tu equipo","Tu nivel","Tu rumbo"]', "los pasos no son Tu equipo, Tu nivel y Tu rumbo");
  /* volver desde el paso 1 vuelve a Hoy; seguir sin marcar nada guarda que no tenés equipo */
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Hoy");
  ok(await p.evaluate(() => K.diario.perfil.equipo == null), "volver guardó equipo");
  await p.click('.como-op[data-ir="#/hoy/equipo"]'); await esperarTitulo(p, "Tu equipo");
  await p.click("#eq-seguir"); await esperarTitulo(p, "Tu nivel");
  ok(await p.evaluate(() => JSON.stringify(K.diario.perfil.equipo)) === "[]", "seguir sin marcar no guardó []");
  await p.click("#nv-seguir"); await esperarTitulo(p, "Tu rumbo");
  /* volver desde Tu rumbo vuelve a Tu nivel, y de ahí a Tu equipo; marcar la barra queda guardado */
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Tu nivel");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Tu equipo");
  await p.click('[data-equipo="barra"]'); await p.waitForSelector('[data-equipo="barra"][aria-pressed="true"] .ck');
  await p.click('[data-equipo="pared"]'); await p.waitForSelector('[data-equipo="pared"][aria-pressed="true"] .ck');
  await p.click("#eq-seguir"); await esperarTitulo(p, "Tu nivel"); await p.click("#nv-seguir"); await esperarTitulo(p, "Tu rumbo");
  ok(await p.evaluate(() => JSON.stringify(K.diario.perfil.equipo)) === '["barra","pared"]', "el equipo guardado: " + await p.evaluate(() => JSON.stringify(K.diario.perfil.equipo)));
  ok(await p.$eval('.pasos [aria-current="step"]', x => x.textContent) === "3Tu rumbo" && await p.$$eval(".pasos li.hecho", x => x.length) === 2, "Tu rumbo no es el paso 3 con el 1 y el 2 hechos");
  await p.click('[data-rumbo="front-lever"]'); await p.waitForSelector('[data-rumbo="front-lever"][aria-pressed="true"]');
  await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  ok(await p.$("#s-empezar") && await p.$$eval(".hoy-toca .toca", x => x.length) > 0, "Hoy no tiene plan");
  ok(!(await p.$(".pasos")), "Hoy sigue con una guía");
  /* «Listo» volvió a Hoy salteando los pasos: atrás no vuelve a Tu rumbo ni a Tu equipo */
  ok(await p.evaluate(() => JSON.stringify(K._pila)) === '["#/hoy"]', "quedaron pasos en la pila: " + await p.evaluate(() => JSON.stringify(K._pila)));
  /* fuera del primer día, Tu equipo de Vos sigue como siempre */
  await ir(p, "#/vos/equipo"); await esperarTitulo(p, "Tu equipo");
  const vos = await p.evaluate(() => [document.querySelector("main.view .abierto .enc-tit small")?.textContent, [...document.querySelectorAll(".pasos")].some(x => !x.closest("[inert]")), document.querySelector(".pie-fijo .btn")?.textContent]);
  ok(JSON.stringify(vos) === '["Ajustes",false,"Listo"]', "Vos → Tu equipo cambió: " + JSON.stringify(vos));
  await p.click(".pie-fijo .btn"); await esperarTitulo(p, "Vos");
  ok((await p.textContent('[data-ir="#/vos/equipo"] em')) === "Barra y Pared libre", "la fila de Vos no dice lo marcado");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});

prueba("sin-nav-al-elegir", async () => {
  /* en Tu rumbo y Tu equipo no hay barra: su botón principal queda abajo, al alcance del pulgar; en Hoy la barra vuelve */
  const medir = p => p.evaluate(() => {
    const n = document.querySelector("nav.barra"), r = n.getBoundingClientRect(), b = document.querySelector(".pie-fijo .btn")?.getBoundingClientRect();
    const v = r.bottom > 2 && r.top < innerHeight - 2 && r.right > 2 && r.left < innerWidth - 2;
    return {nav: v && !n.inert, b: b && {top: b.top, bottom: b.bottom, left: b.left, right: b.right}, h: innerHeight, w: innerWidth};
  });
  const esperarNav = (p, si) => p.waitForFunction(si => { const n = document.querySelector("nav.barra"), r = n.getBoundingClientRect(); return (r.bottom > 2 && r.top < innerHeight - 2 && r.right > 2 && r.left < innerWidth - 2 && !n.inert) === si; }, si, {timeout: 3000});
  for (const vp of [{width: 390, height: 844}, {width: 844, height: 390}]){
    const {ctx, p} = await pagina(vp), donde = `${vp.width}×${vp.height}`;
    const pulgar = async (que, texto) => {
      await esperarNav(p, false).catch(() => { throw new Error(`${donde} · ${que}: la barra sigue a la vista`); });
      const m = await medir(p);
      ok(m.b && m.b.bottom <= m.h && m.h - m.b.bottom <= 120 && m.h - m.b.top <= 120, `${donde} · ${que}: el botón no queda abajo: ${JSON.stringify(m.b)}`);
      ok((await p.textContent(".pie-fijo .btn")) === texto, `${donde} · ${que}: el botón dice ${await p.textContent(".pie-fijo .btn")}`);
      /* lo último de la lista no queda tapado por el botón */
      await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(150);
      const u = await p.evaluate(() => { const xs = [...document.querySelectorAll("main.view .ajr")]; const r = xs[xs.length - 1].getBoundingClientRect(); return {bottom: r.bottom, right: r.right}; });
      const b = (await medir(p)).b;
      ok(u.bottom <= b.top + 1 || u.right <= b.left + 1, `${donde} · ${que}: el botón tapa la última fila: ${JSON.stringify(u)} ${JSON.stringify(b)}`);
      await p.evaluate(() => scrollTo(0, 0));
    };
    /* el primer día: Tu equipo (Seguir) y Tu rumbo (Listo) */
    await ir(p, "#/hoy"); await esperarNav(p, true);
    await p.click('.como-op[data-ir="#/hoy/equipo"]'); await esperarTitulo(p, "Tu equipo"); await pulgar("Tu equipo del primer día", "Seguir");
    await p.click("#eq-seguir"); await esperarTitulo(p, "Tu nivel"); await pulgar("Tu nivel del primer día", "Seguir");
    await p.click("#nv-seguir"); await esperarTitulo(p, "Tu rumbo"); await pulgar("Tu rumbo del primer día", "Listo");
    ok(await p.$(".enc-acc [data-volver]"), `${donde}: volver no está arriba`);
    await p.click('[data-rumbo="espagat"]'); await p.waitForSelector('[data-rumbo="espagat"][aria-pressed="true"]'); await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
    await esperarNav(p, true).catch(() => { throw new Error(`${donde}: en Hoy la barra no volvió`); });
    /* fuera del primer día: Tu rumbo desde Hoy */
    await p.evaluate(() => K.diario.anotar({ejercicio: "colgado-activo", tipo: "segundos", estrella: "front-lever.colgado-60s", fecha: K.hoy(), valor: 45}));
    await ir(p, "#/hoy"); await p.click(".hoy-origen .ajr"); await esperarTitulo(p, "Tu rumbo"); await pulgar("Tu rumbo desde Hoy", "Listo");
    ok(!(await p.$(".pasos")), `${donde}: fuera del primer día Tu rumbo muestra los pasos`);
    await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy"); await esperarNav(p, true);
    if (vp.width < vp.height){
      /* Vos → Tu equipo es su propia pantalla: sin barra y con «Listo» */
      await ir(p, "#/vos"); await p.click('[data-ir="#/vos/equipo"]'); await esperarTitulo(p, "Tu equipo"); await pulgar("Tu equipo desde Vos", "Listo");
      await p.click(".pie-fijo .btn"); await esperarTitulo(p, "Vos"); await esperarNav(p, true);
    } else {
      /* en horizontal, Tu equipo es lo abierto a la derecha de Vos: la lista y la barra quedan quietas */
      await ir(p, "#/vos/equipo"); await p.waitForTimeout(300);
      ok((await medir(p)).nav && !(await p.$(".pie-fijo")), `${donde}: en Vos la barra se fue o sobra el botón`);
    }
    ok(await p.evaluate(() => document.documentElement.scrollWidth) <= vp.width, `${donde}: desborda`);
    ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
    await ctx.close();
  }
});

/* ===== Tu nivel (PR3) ===== */
const elegirNivel = async (p, q, v) => { await p.click(`[data-nivel="${q}"]`); await p.waitForSelector(".pop .pmi"); await p.click(`.pop .pmi[data-id="${v}"]`); await p.waitForFunction(([q, v]) => K.diario.perfil.nivel?.[q] === v, [q, v]); await p.waitForTimeout(150); };
prueba("primer-dia-nivel", async () => {
  /* el segundo paso del primer día: cinco movimientos, cada uno un menú (sin chips) con sus cuatro niveles y «No sé»; sin barra abajo; elegir queda guardado sin deshacer */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await p.click('.como-op[data-ir="#/hoy/equipo"]'); await esperarTitulo(p, "Tu equipo");
  await p.click('[data-equipo="barra"]'); await p.waitForSelector('[data-equipo="barra"][aria-pressed="true"]');
  await p.click('[data-equipo="pared"]'); await p.waitForSelector('[data-equipo="pared"][aria-pressed="true"]');
  await p.click("#eq-seguir"); await esperarTitulo(p, "Tu nivel");
  ok(await p.$eval('.pasos [aria-current="step"]', x => x.textContent) === "2Tu nivel" && (await p.textContent("main.view .enc-tit small")) === "Para empezar", "Tu nivel no es el paso 2");
  ok(JSON.stringify(await p.$$eval("[data-nivel]", xs => xs.map(x => [x.dataset.nivel, x.getAttribute("aria-haspopup"), x.querySelector("em").textContent]))) ===
    '[["empujar","menu","Elegí"],["tirar","menu","Elegí"],["piernas","menu","Elegí"],["cadera","menu","Elegí"],["abdomen","menu","Elegí"]]', "los cinco movimientos, vacíos y con menú");
  ok(await p.$$eval("[data-nivel] .tile svg", x => x.length) === 5, "un movimiento sin su figura");
  ok(await p.$("[data-sin-nav]") && (await p.textContent(".pie-fijo .btn")) === "Seguir", "Tu nivel con barra o sin Seguir");
  ok(!(await p.$(".chip, .chips")), "Tu nivel usa chips");
  /* cada menú: los cuatro niveles, cada uno con su ejercicio, y «No sé» al final */
  for (const q of ["empujar", "tirar", "piernas", "cadera", "abdomen"]){
    await p.click(`[data-nivel="${q}"]`); await p.waitForSelector(".pop .pmi");
    const ops = await p.$$eval(".pop .pmi", xs => xs.map(x => [x.getAttribute("role"), x.textContent.trim(), !!x.querySelector(".q")]));
    ok(ops.length === 5 && ops.map(o => o[1].split(" ")[0]).join() === "Inicial,Intermedio,Avanzado,Experto,No" && ops.slice(0, 4).every(o => o[2]) && ops[4][1] === "No sé" && ops.every(o => o[0] === "menuitemradio"), q + ": " + JSON.stringify(ops));
    await p.keyboard.press("Escape"); await p.waitForTimeout(250);
  }
  ok(await p.evaluate(() => K.diario.perfil.nivel === undefined), "abrir un menú guardó algo");
  /* elegir: queda en la fila, guardado con la fecha, y sin deshacer; la escalerita de Tirar sube */
  const tirar = () => p.$$eval(".nv-arranca .esc-sub", xs => xs[0].getAttribute("aria-label"));
  ok((await tirar()).includes("Colgado"), "sin nivel, Tirar no arranca abajo: " + await tirar());
  const fig = q => p.$eval(`[data-nivel="${q}"] .tile`, x => x.innerHTML);
  const fig0 = await fig("tirar");
  await elegirNivel(p, "tirar", "2");
  ok((await p.textContent('[data-nivel="tirar"] em')) === "Avanzado" && (await p.textContent('[data-nivel="tirar"] small')) === "Dominada rápida, pecho a la barra" && await p.evaluate(() => K.diario.perfil.nivel.fecha === K.hoy()), "la elección no se ve o no tiene fecha");
  ok(await fig("tirar") !== fig0, "la figura no cambió con el nivel");
  ok(!(await p.$(".utoast")), "elegir ofrece deshacer");
  ok((await tirar()).includes("Dominada explosiva"), "con tirar avanzado, Tirar no arranca en la explosiva: " + await tirar());
  await elegirNivel(p, "empujar", "nose");
  ok((await p.textContent('[data-nivel="empujar"] em')) === "No sé", "No sé no se ve elegido");
  /* volver y entrar de nuevo: lo elegido sigue */
  await p.click("#nv-seguir"); await esperarTitulo(p, "Tu rumbo");
  await p.click(".enc-acc [data-volver]"); await esperarTitulo(p, "Tu nivel");
  ok((await p.textContent('[data-nivel="tirar"] em')) === "Avanzado", "volver perdió lo elegido");
  await p.click("#nv-seguir"); await esperarTitulo(p, "Tu rumbo");
  await p.click('[data-rumbo="muscle-up"]'); await p.waitForSelector('[data-rumbo="muscle-up"][aria-pressed="true"]');
  await p.click('[data-rumbo="front-lever"]'); await p.waitForSelector('[data-rumbo="front-lever"][aria-pressed="true"]');
  await p.click(".rumbo-listo"); await esperarTitulo(p, "Hoy");
  /* Hoy arranca desde tu nivel: ninguna habilidad pide una estrella dada, y la fuerza de tirar arranca en tu escalón */
  const plan = await p.evaluate(() => { const pl = K.hoyPlan(); return {est: pl.bloques.filter(b => b.molde === "habilidad").map(b => b.estrella || b.nombre), tirar: pl.bloques.flatMap(b => b.pasos || []).filter(x => x.escalera === "tirar").map(x => x.ejercicio)}; });
  ok(!plan.est.some(e => ["muscle-up.dominadas-10", "front-lever.colgado-60s", "front-lever.bolita-10s"].includes(e)), "Hoy pide una dada: " + JSON.stringify(plan.est));
  ok(plan.tirar.every(e => e === "dominada-explosiva"), "tirar no arranca en tu escalón: " + JSON.stringify(plan.tirar));
  ok(!(await p.$(".pasos")), "Hoy sigue con la guía");
  /* sin barra no se pregunta por tirar */
  await p.evaluate(() => K.diario.perfilPoner("equipo", [])); await ir(p, "#/vos/nivel");
  ok(!(await p.$('[data-nivel="tirar"]')) && await p.$$eval("[data-nivel]", x => x.length) === 4, "sin barra, igual pregunta por tirar");
  /* lo guardado con las preguntas de antes se ve por movimiento */
  await p.evaluate(() => K.diario.perfilPoner("nivel", {flexiones: "30-39", unaPierna: "silla", fecha: K.hoy()})); await p.evaluate(() => K.refrescar());
  ok((await p.textContent('[data-nivel="empujar"] em')) === "Avanzado" && (await p.textContent('[data-nivel="piernas"] em')) === "Avanzado" && (await p.textContent('[data-nivel="cadera"] em')) === "Intermedio", "lo de antes no se ve por movimiento");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("rumbo-arrancas-en", async () => {
  /* en Tu rumbo, cada elegida que todavía no empezaste dice dónde arranca; con tu nivel, más arriba */
  const {ctx, p} = await conReloj();
  await ir(p, "#/hoy"); await p.evaluate(() => K.diario.perfilPoner("equipo", ["barra"])); await ir(p, "#/hoy/rumbo");
  ok(!(await p.$(".rumbo-arranca")), "sin elegir, dice dónde arranca");
  await p.click('[data-rumbo="muscle-up"]'); await p.waitForSelector('[data-rumbo="muscle-up"] .rumbo-arranca');
  const tx = () => p.textContent('[data-rumbo="muscle-up"] .rumbo-arranca');
  const colgado = await p.evaluate(() => K.ej("colgado-activo").nombre), dom10 = await p.evaluate(() => K.estrella("muscle-up.dominadas-10").nombre), ruso = await p.evaluate(() => K.estrella("muscle-up.fondo-ruso").nombre);
  ok(await tx() === "Arrancás en " + colgado, "sin nivel: " + await tx());
  ok(!(await p.$('[data-rumbo="front-lever"] .rumbo-arranca')), "una no elegida dice dónde arranca");
  await p.evaluate(() => K.diario.perfilPoner("nivel", {tirar: "1", fecha: K.hoy()})); await p.evaluate(() => K.refrescar());
  ok(await tx() === "Arrancás en " + dom10, "con tirar intermedio: " + await tx());
  await p.evaluate(() => K.diario.perfilPoner("nivel", {tirar: "2", fecha: K.hoy()})); await p.evaluate(() => K.refrescar());
  ok((await tx()).startsWith("Arrancás en ") && !(await tx()).includes(dom10) && !(await tx()).includes("·"), "con 10 a 14, la dada: " + await tx());
  ok(await p.evaluate(() => K.cieloActual().constelaciones.find(c => c.id === "muscle-up").proxima.id) === "muscle-up.fondo-ruso" && (await tx()).length > 12, "la próxima con 10 a 14 no es " + ruso);
  /* empezada (con una marca), ya no dice dónde arranca */
  await p.evaluate(() => K.diario.anotar({estrella: "muscle-up.dominadas-10", ejercicio: "dominada", tipo: "repeticiones", valor: 11, fecha: K.hoy()})); await p.evaluate(() => K.refrescar());
  ok(!(await p.$('[data-rumbo="muscle-up"] .rumbo-arranca')), "empezada, sigue diciendo dónde arranca");
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 390, "desborda");
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("vos-tu-nivel", async () => {
  /* Vos tiene la fila Tu nivel; la constelación muestra lo dado por hecho punteado, sin encender; un intento que no llega lo saca */
  const {ctx, p} = await conReloj();
  await ir(p, "#/vos");
  ok((await p.textContent('[data-ir="#/vos/nivel"] em')) === "Sin decir", "la fila dice: " + await p.textContent('[data-ir="#/vos/nivel"] em'));
  await p.click('[data-ir="#/vos/nivel"]'); await esperarTitulo(p, "Tu nivel");
  ok((await p.textContent("main.view .enc-tit small")) === "Ajustes" && !(await p.$(".pasos")) && (await p.textContent(".pie-fijo .btn")) === "Listo", "Tu nivel desde Vos no es un ajuste");
  ok(await p.$$eval("[data-nivel]", x => x.length) === 5, "sin decir tu equipo, no están los cinco");
  await elegirNivel(p, "abdomen", "3");
  await p.click(".pie-fijo .btn"); await esperarTitulo(p, "Vos");
  ok((await p.textContent('[data-ir="#/vos/nivel"] em')) === "1 de 5", "la fila no cuenta lo dicho: " + await p.textContent('[data-ir="#/vos/nivel"] em'));
  /* la constelación: dos dadas, punteadas, ninguna encendida; tu cosmos sin estrellas */
  const draco = await p.evaluate(() => K.CATALOGO.constelaciones.find(c => c.id === "draco").nombre);
  await ir(p, "#/cielo/draco"); await esperarTitulo(p, draco);
  const est = () => p.$$eval(".est-fila", fs => fs.map(f => f.classList.contains("dada") ? "d" : f.classList.contains("encendida") ? "e" : f.classList.contains("proxima") ? "p" : "-").join(""));
  ok(await est() === "ddp-----", "las estrellas: " + await est());
  ok((await p.textContent(".cons-dadas b")) === "2 estrellas dadas por hechas", "la línea de dadas: " + await p.textContent(".cons-dadas b"));
  ok(await p.$eval(".est-fila.dada .st", x => getComputedStyle(x).borderTopStyle) === "dashed", "la dada no es punteada");
  ok((await p.textContent(".est-fila.dada")).includes("dada por hecha"), "el lector no dice que es dada");
  await ir(p, "#/cielo"); ok((await p.textContent("main.view .enc-tit small")) === "Todavía sin estrellas", "las dadas encendieron estrellas");
  /* un intento real al L-sit de 20 s que llega a 15: le saca lo de dada (vuelve a ser la próxima) y enciende de verdad la de 10 s */
  await p.evaluate(() => K.diario.anotar({estrella: "draco.lsit-20s", ejercicio: "l-sit", tipo: "segundos", valor: 15, fecha: K.hoy()}));
  await ir(p, "#/cielo/draco"); await esperarTitulo(p, draco);
  ok(await est() === "ep------" && !(await p.$(".cons-dadas")), "el intento corto no la sacó: " + await est());
  /* el respaldo lleva tu nivel */
  const r = await p.evaluate(() => K.respaldo.leer(JSON.stringify(K.respaldo.armar(K.diario, K.VERSION, 1))).perfil.nivel);
  ok(r && r.abdomen === "3", "el respaldo no lleva tu nivel: " + JSON.stringify(r));
  ok(p._errores.length === 0, "errores: " + p._errores.join(" | "));
  await ctx.close();
});
prueba("nivel-horizontal", async () => {
  /* 844 × 390: el primer día, Tu nivel sin barra y con Seguir abajo a la derecha; en Vos, lo abierto a la derecha con la barra quieta */
  const {ctx, p} = await pagina({width: 844, height: 390});
  await ir(p, "#/hoy"); await p.click('.como-op[data-ir="#/hoy/equipo"]'); await esperarTitulo(p, "Tu equipo");
  await p.click('[data-equipo="barra"]'); await p.waitForSelector('[data-equipo="barra"][aria-pressed="true"]');
  await p.click("#eq-seguir"); await esperarTitulo(p, "Tu nivel");
  const b = await p.$eval(".pie-fijo .btn", x => { const r = x.getBoundingClientRect(); return {l: r.left, b: r.bottom, t: x.textContent}; });
  ok(b.t === "Seguir" && b.l > 844 / 2 && 390 - b.b <= 60, "Seguir no queda abajo a la derecha: " + JSON.stringify(b));
  /* el menú entra entero en la pantalla */
  await p.click('[data-nivel="piernas"]'); await p.waitForSelector(".pop .pmi");
  const m = await p.$eval(".pop", x => { const r = x.getBoundingClientRect(); return {t: r.top, b: r.bottom, l: r.left, r: r.right}; });
  ok(m.t >= 0 && m.b <= 390 && m.l >= 0 && m.r <= 844, "el menú se sale: " + JSON.stringify(m));
  await p.click('.pop .pmi[data-id="3"]'); await p.waitForFunction(() => K.diario.perfil.nivel?.piernas === "3");
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 844, "desborda");
  await ir(p, "#/vos/nivel"); await p.waitForTimeout(300);
  ok(await p.$(".split .abierto [data-nivel]") && !(await p.$(".pie-fijo")) && await p.$('.lado [data-ir="#/vos/nivel"][data-sel]'), "en Vos, Tu nivel no es lo abierto a la derecha");
  ok((await p.textContent('[data-nivel="piernas"] em')) === "Experto" && (await p.textContent('[data-nivel="piernas"] small')) === "Una pierna, hasta abajo", "lo elegido no se ve en Vos");
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 844, "Vos desborda");
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
