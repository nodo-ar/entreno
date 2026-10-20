// Dibuja los íconos de Kozmos a partir de iconos/kozmos.svg (se corre a mano cuando cambia el logo).
// Uso: node kozmos/tools/iconos.mjs   (necesita Playwright)
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const require = createRequire(import.meta.url);
const {chromium} = require("playwright");
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "iconos");
const FONDO = "#f7f6f2", TINTA = "#111111";
/* d: lado en px · disco: diámetro del disco sobre el lado · fondo: si lleva el papel detrás */
const logo = (d, disco, fondo) => {
  const r = 34 * disco / .81, c = 42; /* el logo base ocupa 68/84 = 0,81 del lado */
  const k = r / 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 84 84">${fondo ? `<rect width="84" height="84" fill="${FONDO}"/>` : ""}
<circle cx="${c}" cy="${c}" r="${r}" fill="${TINTA}"/><circle cx="${c}" cy="${c}" r="${9 * k}" fill="${FONDO}"/><circle cx="${c + 18 * k}" cy="${c - 18 * k}" r="${4 * k}" fill="${FONDO}"/></svg>`;
};
const SALIDAS = [["icon-192.png", 192, .78, true], ["icon-512.png", 512, .78, true], ["maskable-512.png", 512, .6, true],
  ["apple-touch-icon.png", 180, .74, true], ["favicon-32.png", 32, .97, false]];

fs.writeFileSync(path.join(DIR, "kozmos.svg"), logo(84, .81, false));
const b = await chromium.launch();
const p = await b.newPage();
for (const [f, d, disco, fondo] of SALIDAS){
  await p.setViewportSize({width: d, height: d});
  await p.setContent(`<style>html,body{margin:0;background:transparent}</style>${logo(d, disco, fondo)}`);
  await p.screenshot({path: path.join(DIR, f), omitBackground: !fondo, clip: {x: 0, y: 0, width: d, height: d}});
  console.log("listo", f);
}
await b.close();
