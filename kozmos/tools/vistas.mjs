// Arma las poses de los ejercicios que de perfil no se entienden (de frente, tres cuartos o desde arriba) y las escribe en src/poses/vistas.js.
// Escribir una pose en 3D a mano obliga a sacar abducciones y giros: acá se dice adónde va cada mano y cada pie (o adónde apunta cada hueso)
// y un buscador chico resuelve los ángulos. Lo que apoya (pies, manos, codos, rodillas) se clava: entre una pose y la otra no se desliza.
// Uso: node kozmos/tools/vistas.mjs   (después: node kozmos/pruebas/puras.mjs, que pasa cada pose por K.fig.revisar)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = {K: {reduce: () => true}, document: {}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, "src", "piezas", "figura.js"), "utf8"), ctx);
const K = ctx.K, PISO = K.fig.PISO, T = K.fig.TOBILLO, RAD = Math.PI / 180;

/* ===== cuentas ===== */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], sumar = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const len = a => Math.hypot(...a), nor = a => { const l = len(a) || 1; return a.map(x => x / l); }, dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
/* una dirección con ángulos fáciles de pensar: «adelante» (x), «abajo» (y), «costado» (z, hacia el lado cercano) */
const dir = (x, y, z) => nor([x, y, z]);
/* Nelder-Mead chiquito */
function busca(fn, x0, paso = 4, it = 800){
  const n = x0.length; let S = [x0, ...x0.map((_, i) => x0.map((x, j) => x + (i === j ? paso : 0)))].map(x => [x, fn(x)]);
  for (let k = 0; k < it; k++){ S.sort((a, b) => a[1] - b[1]); if (S[n][1] - S[0][1] < 1e-12 && k > 50) break;
    const c = Array(n).fill(0); S.slice(0, n).forEach(([x]) => x.forEach((v, i) => c[i] += v / n));
    const w = S[n][0], r = c.map((v, i) => v + (v - w[i])), fr = fn(r);
    if (fr < S[0][1]){ const e = c.map((v, i) => v + 2 * (v - w[i])), fe = fn(e); S[n] = fe < fr ? [e, fe] : [r, fr]; }
    else if (fr < S[n - 1][1]) S[n] = [r, fr];
    else { const q = c.map((v, i) => v + .5 * (w[i] - v)), fq = fn(q); if (fq < S[n][1]) S[n] = [q, fq]; else S = S.map(([x], i) => i ? (y => [y, fn(y)])(x.map((v, j) => S[0][0][j] + .5 * (v - S[0][0][j]))) : S[0]); } }
  S.sort((a, b) => a[1] - b[1]); return S[0][0];
}
/* la posición 3D de una articulación (x adelante, y abajo, z hacia el lado cercano), con la cadera en el origen */
const p3 = (P, k) => { const J = K.fig.esqueleto({fijo: "hip", en: [0, 0]}, {...P, vista: 0, alzada: 0, alto: 0}); return [J[k][0], J[k][1], J.z[k]]; };
const r1 = x => Math.round(x * 10) / 10, redondo = P => JSON.parse(JSON.stringify(P, (k, v) => typeof v === "number" ? r1(v) : v));
const sg = (x, i) => Array.isArray(x) ? x[i] : (x || 0);
/* el espejo: lo cercano pasa a lejano (para los ejercicios que alternan lados) */
const espejo = P => { const o = {...P, armN: P.armF, armF: P.armN, legN: P.legF, legF: P.legN}; if (P.pies) o.pies = [P.pies[1], P.pies[0]];
  for (const c of ["abd", "gira"]) if (P[c]) o[c] = Object.fromEntries([["armN", P[c].armF], ["armF", P[c].armN], ["legN", P[c].legF], ["legF", P[c].legN]].filter(([, v]) => v !== undefined));
  if (P.inclina) o.inclina = -P.inclina; if (P.rueda) o.rueda = -P.rueda; return o; };
/* cambia un número de la pose (o de «abd»/«gira»): mas(P, {head: 1.5, "abd.armN": 2}) */
const mas = (P, d) => { const o = JSON.parse(JSON.stringify(P));
  for (const [k, x] of Object.entries(d)){ const [a, b] = k.split("."); if (b){ o[a] = o[a] || {}; o[a][b] = Array.isArray(o[a][b]) ? o[a][b].map((v, i) => v + sg(x, i)) : (o[a][b] || 0) + x; }
    else o[a] = Array.isArray(o[a]) ? o[a].map((v, i) => v + sg(x, i)) : (o[a] || 0) + x; }
  return o; };

/* ===== el codo (o la rodilla) entre dos puntos: dos huesos y hacia dónde se dobla ===== */
function codo(A, B, L1, L2, polo){ const ab = sub(B, A), D = Math.min(len(ab), L1 + L2 - .01), u = nor(ab), x = (L1 * L1 - L2 * L2 + D * D) / (2 * D), y = Math.sqrt(Math.max(L1 * L1 - x * x, 0));
  const p = nor(sub(polo, u.map(k => k * dot(polo, u)))); return sumar(sumar(A, u, x), p, y); }
/* apunta el segmento «seg» (0 el de arriba, 1 el de abajo) del miembro «key» hacia «d»; con «pie», también la dirección del pie (del tobillo a la punta) */
let peor = 0;
function apunta(P, key, seg, d, pie){
  const s = key.slice(-1), leg = key.startsWith("leg"), ja = (seg ? (leg ? "k" : "e") : (leg ? "p" : "s")) + s, jb = (seg ? (leg ? "f" : "h") : (leg ? "k" : "e")) + s;
  const arma = x => { const Q = {...P, [key]: [...P[key]], abd: {...(P.abd || {})}, gira: {...(P.gira || {})}, pies: [...(P.pies || [0, 0])]};
    Q[key][seg] = x[0]; const b = [sg(Q.abd[key], 0), sg(Q.abd[key], 1)], g = [sg(Q.gira[key], 0), sg(Q.gira[key], 1)]; b[seg] = x[1]; if (x.length > 2) g[seg] = x[2];
    Q.abd[key] = b; Q.gira[key] = g; if (x.length > 3) Q.pies[s === "N" ? 0 : 1] = x[3]; return Q; };
  const err = x => { const Q = arma(x), e = d2(nor(sub(p3(Q, jb), p3(Q, ja))), d); if (!pie) return e; return e + d2(nor(sub(p3(Q, "t" + s), p3(Q, "f" + s))), pie); };
  /* primero desde los ángulos que ya tiene (así una pose sale pareja con la anterior y el paso entre las dos no da vueltas raras) */
  const x0 = [P[key][seg], sg(P.abd?.[key], seg), ...(pie ? [sg(P.gira?.[key], seg), (P.pies || [0, 0])[s === "N" ? 0 : 1]] : [])];
  let mejor = (x => [x, err(x)])(busca(err, busca(err, x0, 3, 2500), .5, 2500));
  /* si no llega, un barrido grueso para arrancar cerca, y después el buscador fino */
  if (mejor[1] > 1e-7){ const ini = []; for (let a = 0; a < 360; a += 30) for (let b = -90; b <= 180; b += 30) ini.push([a, b, ...(pie ? [0, 0] : [])]);
    for (const [xi] of ini.map(x => [x, err(x)]).sort((p, q) => p[1] - q[1]).slice(0, 4)){ let x = busca(err, xi, 8, 2500); x = busca(err, x, 1, 2500); const e = err(x); if (e < mejor[1] - 1e-9) mejor = [x, e]; } }
  peor = Math.max(peor, mejor[1]); if (mejor[1] > 1e-4) console.log(`  ojo: ${key} ${seg} no llega (error ${mejor[1].toFixed(5)})`);
  return arma(mejor[0]);
}
/* lleva la punta del miembro (mano o tobillo) a «obj» (con la cadera en el origen); el codo o la rodilla se dobla hacia «polo» */
const LARGO = {arm: [30, 27], leg: [43, 41]};
function alcanza(P, key, obj, polo, pie){
  const s = key.slice(-1), leg = key.startsWith("leg"), A = p3(P, (leg ? "p" : "s") + s), [L1, L2] = LARGO[leg ? "leg" : "arm"];
  const m = codo(A, obj, L1, L2, polo);
  P = apunta(P, key, 0, nor(sub(m, A))); P = apunta(P, key, 1, nor(sub(obj, m)), pie);
  const fin = p3(P, (leg ? "f" : "h") + s), falta = len(sub(fin, obj)); if (falta > .6) console.log(`  ojo: ${key} queda a ${falta.toFixed(1)} de donde va (después de ${Object.keys(POSES).pop()})`);
  return P;
}
/* clava: en Q, lo de «puntos» queda donde estaba en P respecto del punto fijo (la mano en el piso, el pie quieto) */
const MIEMBRO = {h: "arm", f: "leg", t: "leg"}, MEDIO = {h: "e", f: "k", t: "k"};
function clava(P, Q, fijo, puntos){
  for (const k of puntos){ const s = k.slice(-1), key = MIEMBRO[k[0]] + s, obj = sumar(p3(Q, fijo), sub(p3(P, k), p3(P, fijo)));
    const base = p3(Q, (key.startsWith("leg") ? "p" : "s") + s), polo = sub(p3(Q, MEDIO[k[0]] + s), base);
    const pie = key.startsWith("leg") ? nor(sub(p3(P, "t" + s), p3(P, "f" + s))) : undefined;
    Q = alcanza(Q, key, obj, polo, pie); }
  return Q;
}

/* un recorrido con pasos intermedios resueltos uno por uno, cada uno desde el anterior: así lo que está clavado (la mano en la barra, el pie en el piso)
   no se corre entre pose y pose, y el paso de una a otra no da vueltas raras */
const lerpN = (a, b, t) => Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * t) : a + (b - a) * t;
function camino(claves, pasos, arma){ const out = []; let prev = null;
  for (let i = 0; i < claves.length - 1; i++) for (let j = i ? 1 : 0; j <= pasos; j++){ const t = j / pasos;
    prev = arma(Object.fromEntries(Object.keys(claves[i]).map(k => [k, lerpN(claves[i][k], claves[i + 1][k], t)])), prev); out.push(prev); }
  return out; }
/* arranca los miembros que se van a resolver desde cómo quedaron en la pose anterior */
const semilla = (P, prev, ks) => { if (!prev) return P; const o = {...P, abd: {...(P.abd || {})}, gira: {...(P.gira || {})}, pies: [...(prev.pies || P.pies || [0, 0])]};
  for (const k of ks){ o[k] = [...prev[k]]; if (prev.abd?.[k] !== undefined) o.abd[k] = prev.abd[k]; if (prev.gira?.[k] !== undefined) o.gira[k] = prev.gira[k]; } return o; };

const POSES = {}, RESP = [2, .4, 2, .4];

/* ===================== de frente ===================== */

/* saltos de tijera: cerrado → en el aire → abierto (manos arriba, pies más anchos que los hombros) → en el aire; ~1 s por salto completo */
{
  const b = {torso: 180, head: 180, armN: [2, 8], armF: [2, 8], legN: [4, 356], legF: [4, 356], pies: [0, 0]};
  const cerrado = {...b, legN: [8, 352], legF: [8, 352], abd: {armN: 8, armF: 8, legN: 1, legF: 1}, gira: {legN: 8, legF: 8}};
  const aire = {...b, legN: [2, 359], legF: [2, 359], abd: {armN: [92, 100], armF: [92, 100], legN: 9, legF: 9}, gira: {legN: 10, legF: 10}, alto: 9, pies: [-30, -30]};
  const abierto = {...b, legN: [9, 351], legF: [9, 351], armN: [4, 4], armF: [4, 4], abd: {armN: [166, 170], armF: [166, 170], legN: 17, legF: 17}, gira: {legN: 14, legF: 14}};
  POSES["saltos-tijera"] = {fijo: "hip", en: [150, 180], pisa: true, vista: 90, ciclo: true, ritmo: [1.1], muestra: 2, k: [cerrado, aire, abierto, aire]};
}

/* planchas laterales: apoyada en el antebrazo de abajo (el lejano), el codo bajo el hombro; el cuerpo rueda de costado hasta que el pie (o la rodilla) de abajo toca */
const lateral = (base, toca, dy = 0) => {
  const pose = ro => ({...base, abd: {...(base.abd || {}), armF: [ro, 0], armN: 180 - ro}, rueda: ro});
  const ro = busca(([r]) => { const P = pose(r); return (p3(P, toca)[1] - p3(P, "eF")[1] - dy) ** 2; }, [72], 3)[0];
  return pose(ro);
};
{
  /* el cuerpo en línea de hombros a pies; el brazo de arriba al techo. Respira la cabeza y el brazo de arriba; los apoyos quedan quietos */
  const P = lateral({torso: 180, head: 180, armF: [0, 90], armN: [0, 2], legN: [0, 0], legF: [0, 0], pies: [0, 0], abd: {legN: -1}}, "fF");
  POSES["plancha-lateral"] = {fijo: "eF", en: [150, 263], vista: 90, rango: "avanzado", ritmo: RESP, k: [P, mas(P, {head: 1.5, "abd.armN": -1.5})]};
  /* la pierna de arriba sube unos 35° y se sostiene sin que la cadera baje */
  POSES["plancha-lateral-pierna"] = {fijo: "eF", en: [150, 263], vista: 90, rango: "avanzado", ritmo: [.8, 2.5, .8, .6], k: [P, mas(P, {"abd.legN": 36, head: 1})]};
  /* de rodillas: las rodillas dobladas a 90° con las canillas atrás; apoya el antebrazo y la rodilla de abajo. Tres cuartos, para que se vean las rodillas dobladas */
  const R = lateral({torso: 180, head: 180, armF: [0, 90], armN: [0, 2], legN: [0, 272], legF: [0, 270], pies: [-88, -90], abd: {legN: -1}}, "kF", -1.5);
  POSES["plancha-lateral-rodillas"] = {fijo: "eF", en: [150, 263], vista: 62, rango: "avanzado", ritmo: RESP, k: [R, mas(R, {head: 1.5, "abd.armN": -1.5})]};
}

/* bandera humana: el cuerpo horizontal, la cabeza junto al poste; el brazo de arriba tira, el de abajo empuja. Las dos manos clavadas en el poste */
{
  const a = 151, P = {torso: 180, head: 180, armN: [0, 0], armF: [0, 0], legN: [0, 0], legF: [1, 1], pies: [-72, -72], abd: {armN: a, armF: a, legN: -4, legF: -4}, rueda: 90};
  /* sostener: las piernas apenas suben y bajan y la cabeza acompaña; las manos no se mueven */
  const vive = P => mas(P, {head: 1.5, "abd.legN": 1.2, "abd.legF": 1.2});
  const B = {fijo: "hN", en: [190, 150], poste: 190, vista: 90, rango: "avanzado", ritmo: RESP};
  POSES["bandera"] = {...B, k: [P, vive(P)]};
  /* abierta: las piernas rectas en V, cada una unos 30° afuera */
  const A = {...P, abd: {...P.abd, legN: 30, legF: 30}};
  POSES["bandera-abierta"] = {...B, k: [A, vive(A)]};
  /* con rodillas: los muslos vienen al pecho y las canillas cuelgan. De frente el pliegue va hacia la cámara y se pierde:
     va en tres cuartos (62°) con la cámara algo alzada (40°), así se ven doblados cadera y rodilla y el poste sigue a la vista */
  const Rd = {...P, legN: [112, 10], legF: [114, 12], pies: [-50, -50], abd: {...P.abd, legN: 4, legF: 4}};
  POSES["bandera-rodillas"] = {...B, vista: 62, alzada: 40, k: [Rd, vive(Rd)]};
}

/* cosaca: pies anchos y quietos; la cadera baja en arco sobre una pierna mientras la otra queda estirada con la punta arriba, y pasa al otro lado */
{
  const W = 96, xf = 8, ZC = W / 2;
  const cos = (q, prev) => {
    const zN = ZC - (ZC - 13) * q, zF = zN - W, cad = 9, hy = Math.sqrt(84 * 84 * .998 - (zF + cad) ** 2 - xf * xf);
    let P = semilla({torso: 180 - 22 * q, head: 180 - 8 * q, armN: [0, 0], armF: [0, 0], legN: [0, 0], legF: [0, 0], pies: [0, 0], abd: {}, gira: {}}, prev, ["armN", "armF", "legN", "legF"]);
    const fN = [xf, hy, zN], fF = [xf, hy, zF];
    /* la rodilla cercana va hacia donde apuntan los dedos (adelante y afuera) */
    const pieN = nor([Math.cos(26 * RAD), 0, Math.sin(26 * RAD)]), pieF = nor([Math.cos(22 * RAD) * (1 - q) + .32 * q, -.96 * q, -Math.sin(22 * RAD) * (1 - q)]);
    P = alcanza(P, "legN", fN, [Math.cos(28 * RAD), -.1, Math.sin(28 * RAD)], pieN);
    P = alcanza(P, "legF", fF, [1, 0, 0], pieF);
    /* las manos juntas adelante del pecho; los codos abajo y afuera */
    const sh = p3(P, "sh"), adelante = [Math.sin((P.torso - 90) * RAD), Math.cos((P.torso - 90) * RAD), 0];
    const mano = sumar(sumar(sh, adelante, 20 + 8 * q), [0, 1, 0], 14 - 4 * q);
    for (const [k, s] of [["armN", 1], ["armF", -1]]) P = alcanza(P, k, [mano[0], mano[1], 2.5 * s], [0, 1, .7 * s]);
    return P; };
  const ks = camino([{q: 1}, {q: 0}], 8, ({q}, prev) => cos(q, prev));
  POSES["cosaca"] = {fijo: "fN", en: [150 + W * .5, T], vista: 90, k: [...ks, ...ks.slice(0, -1).reverse().map(espejo)], ritmo: [2.6, .6, 2.6, .6], muestra: 0};
}

/* sentados con las piernas abiertas: la cadera en el piso, las piernas largas con la rodilla y la punta al techo.
   Con las piernas a 45° del frente, la cámara se alza un poco (40°) para que se vea la V en el piso */
const S = 259, piso = PISO - S;
const abiertas = (abre, torso, head) => { let P = {torso, head, armN: [0, 0], armF: [0, 0], legN: [90, 90], legF: [90, 90], pies: [0, 0], abd: {}, gira: {}};
  for (const [k, s] of [["legN", 1], ["legF", -1]]){ const d = dir(Math.cos(abre * RAD), .03, s * Math.sin(abre * RAD)), A = p3(P, "p" + k.slice(-1));
    P = alcanza(P, k, sumar(A, d, 83.98), dir(0, -1, 0), dir(0, -1, 0)); }
  return P; };
{
  /* espagat lateral: abierto del todo, el tronco derecho y los brazos en cruz */
  const P = {torso: 180, head: 180, armN: [0, 6], armF: [0, 6], legN: [0, 0], legF: [0, 0], pies: [0, 0], abd: {armN: 84, armF: 84, legN: 87, legF: 87}, gira: {legN: 88, legF: 88, armN: -20, armF: -20}};
  POSES["espagat-lateral"] = {fijo: "hip", en: [150, 254], vista: 90, rango: "avanzado", ritmo: RESP, k: [P, mas(P, {torso: .8, head: 1.5, "abd.armN": 2, "abd.armF": 2})]};
  /* a 90°: cada pierna a 45° del frente; la cadera adelante y la espalda recta, apenas inclinada, con las manos en el piso entre las piernas */
  const manos = P => { for (const [k, s] of [["armN", 1], ["armF", -1]]) P = alcanza(P, k, [30, piso - 4, 11 * s], [-.4, 0, s]); return P; };
  const A = manos(abiertas(45, 155, 165));
  POSES["espagat-lateral-90"] = {fijo: "hip", en: [150, S], vista: 90, alzada: 40, rango: "avanzado", ritmo: RESP, k: [A, clava(A, mas(A, {torso: 1.5, head: 2}), "hip", ["hN", "hF"])]};
  /* pancake: las piernas bien abiertas y el pecho baja hacia el piso desde la cadera; los brazos largos adelante con las manos en el piso */
  const manosLejos = (P, x) => { for (const [k, s] of [["armN", 1], ["armF", -1]]) P = alcanza(P, k, [x, piso - 5.5, 9 * s], [0, -.3, s]); return P; };
  const Pk = manosLejos(abiertas(56, 108, 100), 95);
  POSES["pancake"] = {fijo: "hip", en: [150, S], vista: 90, alzada: 40, rango: "avanzado", ritmo: RESP, k: [Pk, clava(Pk, mas(Pk, {torso: -1.5, head: -2}), "hip", ["hN", "hF"])]};
  /* piernas abiertas: la base del pancake, menos hondo; las manos apoyadas más cerca */
  const Pa = manosLejos(abiertas(52, 128, 120), 80);
  POSES["piernas-abiertas"] = {fijo: "hip", en: [150, S], vista: 90, alzada: 40, rango: "avanzado", ritmo: RESP, k: [Pa, clava(Pa, mas(Pa, {torso: -1.5, head: -2}), "hip", ["hN", "hF"])]};
}

/* parados */
const PARADO = {torso: 180, head: 180, armN: [0, 0], armF: [0, 0], legN: [0, 0], legF: [0, 0], pies: [0, 0], abd: {armN: 8, armF: 8, legN: 2, legF: 2}, gira: {legN: 8, legF: 8}};
{
  /* dorsal arriba: un brazo largo arriba junto a la oreja y el tronco se inclina al lado contrario; la otra mano en la cintura */
  const cintura = (P, inc) => { const Q = {...P, inclina: inc}; return alcanza(Q, "armF", sumar(p3(Q, "pF"), [3, -12, -8]), [-.6, .2, -1]); };
  const base = {...PARADO, abd: {...PARADO.abd, armN: 168}, gira: {...PARADO.gira, armN: 0}};
  const P = cintura(base, -17), Q = cintura(base, -20);
  POSES["dorsal-arriba"] = {fijo: "fN", en: [150, T], vista: 90, rango: "avanzado", ritmo: RESP, k: [P, mas(Q, {head: -1})]};
  /* hombro cruzado: el brazo cercano estirado cruza por delante del pecho; el antebrazo lejano lo engancha arriba del codo y lo acerca */
  const cruzado = (cruza, abraza) => { let Q = alcanza({...PARADO}, "armN", sumar(p3(PARADO, "sN"), dir(.32, .12, -1), 56.9), [1, 0, 0]);
    const codoN = p3(Q, "eN"); Q = alcanza(Q, "armF", sumar(codoN, [6.5, -1.5, 3 + abraza]), [.25, 1, -.4]); return Q; };
  const H = cruzado(0, 0), H2 = cruzado(0, 1.2);
  POSES["hombro-cruzado"] = {fijo: "fN", en: [150, T], vista: 90, ritmo: RESP, k: [H, mas(H2, {head: 1})]};
}

/* acostado de costado, sobre el lado lejano */
{
  /* dorsal de costado: el brazo de abajo estirado por encima de la cabeza hace de almohada; el de arriba va en arco por encima de la cabeza */
  const base = {torso: 180, head: 180, armN: [0, 0], armF: [0, 0], legN: [4, 2], legF: [0, 0], pies: [-30, -30], abd: {armN: 186, armF: 176, legN: -2}, gira: {armN: 30, armF: 30}};
  const pose = ([ro, inc]) => ({...base, rueda: ro, inclina: inc});
  /* el hombro y la cadera de abajo en el piso */
  const x = busca(([ro, inc]) => { const P = pose([ro, inc]); return (p3(P, "sF")[1] - p3(P, "pF")[1]) ** 2 + (ro - 90) ** 2 * .01; }, [90, 0], 3);
  const P = pose(x);
  POSES["dorsal-de-costado"] = {fijo: "pF", en: [150, PISO - 9], vista: 90, rango: "avanzado", ritmo: RESP, k: [P, mas(P, {"abd.armN": 3, head: 1})]};
}

/* barra de frente: la barra cruza, las dos manos clavadas; «barraX» centra la barra (y sus postes) entre las manos */
{
  /* dominada con agarre ancho: los codos bajan abiertos y el pecho llega a la barra; de frente se ve el ancho */
  const Z = 40;
  /* «bajo»: cuánto quedan los hombros debajo de la barra; las manos van ahí arriba, a «Z» del centro */
  const cuelga = (base, bajo, corre, polo) => { let P = {...base}; const sh = p3(P, "sh");
    for (const [k, s] of [["armN", 1], ["armF", -1]]) P = alcanza(P, k, [sh[0] + 3, sh[1] - bajo, s * Z - corre], [polo[0], polo[1], polo[2] * s]);
    return P; };
  const cuerpo = {torso: 182, head: 180, armN: [180, 180], armF: [180, 180], legN: [6, 354], legF: [8, 356], pies: [-40, -40], abd: {legN: -1, legF: -1}, gira: {}};
  const subir = (q, prev) => cuelga(semilla({...cuerpo, torso: q.torso, head: q.head, legN: q.legN, legF: q.legF}, prev, ["armN", "armF"]), q.bajo, 0, q.polo);
  POSES["dominada-ancha"] = {con: "barra", fijo: "hN", en: [150, 42], barraX: 150 + Z, vista: 90, ritmo: [1.1, .4, 1.7, .5], k: camino([
    {bajo: Math.sqrt(57 * 57 * .9999 - (Z - 16.2) ** 2), torso: 182, head: 180, legN: [6, 354], legF: [8, 356], polo: [0, 1, 1]},
    {bajo: 32, torso: 186, head: 183, legN: [10, 358], legF: [12, 360], polo: [.3, 1, .9]},
    {bajo: 10, torso: 190, head: 186, legN: [16, 364], legF: [18, 366], polo: [.4, 1, .8]}], 3, subir)};
  /* arquera: manos muy anchas; el cuerpo sube hacia la mano cercana y el otro brazo queda estirado */
  const Za = 45;
  const arco = (base, bajo, polo) => { let P = {...base}; const sh = p3(P, "sh");
    /* el brazo lejano recto: de ahí sale cuánto se corre el cuerpo hacia la mano cercana */
    const corre = Math.sqrt(57 * 57 * .9995 - bajo * bajo) - (Za - 16.2);
    P = alcanza(P, "armN", [sh[0] + 2, sh[1] - bajo, Za - corre], [polo[0], polo[1], polo[2]]);
    P = alcanza(P, "armF", [sh[0] + 2, sh[1] - bajo, -Za - corre], [0, 1, -.3]);
    return P; };
  const tira = (q, prev) => arco(semilla({...cuerpo, torso: q.torso, head: q.head, legN: q.legN, legF: q.legF}, prev, ["armN", "armF"]), q.bajo, q.polo);
  POSES["dominada-arquera"] = {con: "barra", fijo: "hN", en: [150, 42], barraX: 150 + Za, vista: 90, rango: "avanzado", ritmo: [1.3, .4, 1.7, .5], k: camino([
    {bajo: Math.sqrt(57 * 57 * .9995 - (Za - 16.2) ** 2), torso: 182, head: 180, legN: [6, 354], legF: [8, 356], polo: [0, 1, 1]},
    {bajo: 34, torso: 184, head: 182, legN: [9, 358], legF: [11, 360], polo: [.3, 1, .9]},
    {bajo: 20, torso: 186, head: 183, legN: [12, 362], legF: [14, 364], polo: [.3, 1, .9]}], 3, tira)};
}

/* criss-cross: un salto con los brazos abiertos y el siguiente con los antebrazos cruzados por delante de la cadera; la soga da dos vueltas */
{
  const piernas = [
    {legN: [10, 350], legF: [12, 349], pies: [-10, -11], alto: -1.5}, {legN: [4, 357], legF: [6, 356], pies: [-31, -32], alto: 2.7}, {legN: [4, 355], legF: [6, 354], pies: [-29, -30], alto: 10.6},
    {legN: [10, 350], legF: [12, 349], pies: [-10, -11], alto: -1.5}, {legN: [4, 357], legF: [6, 356], pies: [-31, -32], alto: 2.7}, {legN: [4, 355], legF: [6, 354], pies: [-29, -30], alto: 10.6}];
  const base = {torso: 178, head: 180, armN: [0, 0], armF: [0, 0], abd: {legN: 2, legF: 2}, gira: {legN: 6, legF: 6}};
  /* abiertos: codos cerca del cuerpo, las manos al costado de la cadera; cruzados: las manos se pasan al otro lado, la cercana por delante */
  const brazos = (P, cruza) => { const sh = p3(P, "sh");
    for (const [k, s] of [["armN", 1], ["armF", -1]]){ const obj = cruza ? [sh[0] + 24 + (s > 0 ? 3 : 0), sh[1] + 42, -s * 8] : [sh[0] + 10, sh[1] + 50, s * 34];
      P = alcanza(P, k, obj, cruza ? [-.3, .2, s] : [-.5, 0, s * .5]); }
    return P; };
  const k = piernas.map((pl, i) => brazos({...base, ...pl, abd: {...base.abd}, gira: {...base.gira}}, i === 2 || i === 3 || i === 4));
  POSES["criss-cross"] = {con: "soga", vueltas: 2, sogaPie: 1 / 3, fijo: "hip", en: [150, 176], vista: 90, ciclo: true, k, ritmo: [.94], muestra: 3};
}

/* ===================== desde arriba: acostado boca arriba ===================== */
const BOCA = {torso: 270, head: 266, armN: [90, 90], armF: [90, 90], legN: [90, 90], legF: [90, 90], pies: [0, 0], abd: {}, gira: {}};
const ARRIBA = {fijo: "hip", en: [150, S], vista: 90, alzada: 90, ritmo: RESP};
{
  /* mariposa: las plantas juntas y las rodillas caen a los costados */
  const pose = x => ({...BOCA, armN: [90, 90], armF: [90, 90], legN: [x[0], x[1]], legF: [x[0], x[1]], gira: {legN: [x[2], x[3]], legF: [x[2], x[3]]}, abd: {armN: 16, armF: 16}, pies: [10, 10]});
  const x = busca(x => { const P = pose(x), f = p3(P, "fN"), k = p3(P, "kN"); return d2(f, [33, 4, 4]) + (k[1] + 2) ** 2; }, [150, 0, 60, 60], 8, 2000);
  const P = pose(x);
  /* al soltar el aire las rodillas caen un poco más; los pies quedan juntos */
  const suelta = P => clava(P, mas(P, {"gira.legN": [2, 0], "gira.legF": [2, 0], torso: -.6, head: -1}), "hip", ["fN", "fF"]);
  POSES["mariposa-acostado"] = {...ARRIBA, k: [P, suelta(P)]};
  /* aductores: igual, con la mano lejana detrás de la cabeza (el codo apoyado afuera) */
  let A = alcanza(P, "armF", sumar(p3(P, "hd"), [-5, 5, -3]), [.15, -.25, -1]);
  POSES["aductores-acostado"] = {...ARRIBA, k: [A, suelta(A)]};
}
{
  /* rodilla cruzada: la rodilla cercana doblada a 90° viene hacia el hombro contrario; la mano lejana la guía y la cercana queda en el piso */
  const flex = (f, cruza) => dir(Math.cos(f * RAD) * Math.cos(cruza * RAD), -Math.sin(f * RAD) * Math.cos(cruza * RAD), -Math.sin(cruza * RAD));
  const rodilla = (f, cruza) => { let P = {...BOCA, abd: {armN: 40}, legF: [91, 91], pies: [0, -10]};
    const pN = p3(P, "pN"), kN = sumar(pN, flex(f, cruza), 43), fN = sumar(kN, dir(.75, .15, -.65), 41);
    P = alcanza(P, "legN", fN, sub(kN, pN), dir(.3, -.6, -.3));
    P = alcanza(P, "armF", sumar(p3(P, "kN"), [2, -3, 7]), [0, .6, -1]);
    return P; };
  POSES["rodilla-cruzada"] = {...ARRIBA, k: [rodilla(122, 24), rodilla(125, 27)]};
  /* glúteo y banda IT: la pierna cercana estirada cruza hacia el hombro contrario, tomada por la mano lejana; el otro brazo suelto en el piso */
  const banda = (f, cruza) => { let P = {...BOCA, abd: {armN: 80}, legF: [91, 91], pies: [0, -10]};
    const pN = p3(P, "pN"), fN = sumar(pN, flex(f, cruza), 83.98);
    const sh = flex(f, cruza), pt = flex(f + 90, 0), pie = nor(sub(pt, sh.map(x => x * dot(pt, sh))));
    P = alcanza(P, "legN", fN, dir(.2, -1, 0), pie);
    P = alcanza(P, "armF", sumar(pN, flex(f, cruza), 34), [0, .6, -1]);
    return P; };
  POSES["gluteo-banda-it"] = {...ARRIBA, k: [banda(104, 38), banda(106, 41)]};
  /* figura 4: la pierna lejana viene al pecho con la rodilla a 90° y las manos detrás del muslo; el tobillo cercano cruza sobre ese muslo y la rodilla cercana se abre */
  const cuatro = f => { let P = {...BOCA, head: 262};
    const pF = p3(P, "pF"), kF = sumar(pF, dir(Math.cos(f * RAD), -Math.sin(f * RAD), 0), 43), fF = sumar(kF, [41, 0, 0]);
    P = alcanza(P, "legF", fF, sub(kF, pF), dir(.2, -1, 0));
    const tobillo = sumar(sumar(pF, sub(kF, pF), .8), [-6, -4, 4]), pN = p3(P, "pN");
    P = alcanza(P, "legN", tobillo, dir(.2, -.5, 1), dir(-.2, -.6, -.8));
    for (const [k, s] of [["armN", 1], ["armF", -1]]) P = alcanza(P, k, sumar(sumar(pF, sub(kF, pF), .78), [5, 0, 5 * s]), [0, .5, s]);
    return P; };
  POSES["gluteo-tobillo-rodilla"] = {...ARRIBA, rango: "avanzado", k: [cuatro(122), cuatro(125)]};
}
/* cuádriceps de costado (desde arriba): acostado sobre el lado lejano, apoyado en el antebrazo; el talón de arriba va al glúteo y la mano lo toma */
{
  const base = {torso: 180, head: 180, armN: [0, 0], armF: [0, 0], legN: [354, 202], legF: [0, 0], pies: [-50, -20], abd: {legN: -2}, gira: {}, rueda: 90};
  const pose = inc => { let P = {...base, inclina: inc};
    P = apunta(P, "armF", 0, [0, 1, 0]); P = apunta(P, "armF", 1, [1, 0, 0]);
    return P; };
  /* el codo de abajo a la altura del pie de abajo: los dos en el piso */
  const inc = busca(([i]) => { const P = pose(i); return (p3(P, "eF")[1] - p3(P, "fF")[1]) ** 2; }, [35], 3)[0];
  let P = pose(inc);
  /* al soltar el aire el muslo va un poco atrás y la mano lo acompaña */
  const Q = mas(P, {head: 1.5, legN: [-2, -2]});
  /* la mano toma la canilla, cerca del tobillo, en el punto que le queda más a mano */
  const toma = P => { const f = p3(P, "fN"), k = p3(P, "kN"), s = p3(P, "sN"), t = busca(([t]) => len(sub(sumar(f, sub(k, f), Math.max(.05, Math.min(.45, t))), s)), [.2], .1, 200)[0];
    return alcanza(P, "armN", sumar(sumar(f, sub(k, f), Math.max(.05, Math.min(.45, t))), [0, -3, 2]), [-1, -.4, 0]); };
  POSES["cuadriceps-costado"] = {fijo: "eF", en: [170, 263], vista: 90, alzada: 90, rango: "avanzado", ritmo: RESP, k: [toma(P), toma(Q)]};
}

/* ===================== escribe ===================== */
const txt = `/* ===== Poses · vistas: los ejercicios que de perfil no se entienden, de frente, en tres cuartos o desde arriba.
   Lo genera tools/vistas.mjs (no editar a mano): ahí está cada movimiento contado y el ajuste que deja quietos los apoyos ===== */
Object.assign(K.POSES, {\n${Object.entries(POSES).map(([id, f]) => `${JSON.stringify(id)}: ${JSON.stringify({...f, k: f.k.map(redondo)})}`).join(",\n")}\n});\n`;
fs.writeFileSync(path.join(RAIZ, "src", "poses", "vistas.js"), txt);
console.log(`vistas.js: ${Object.keys(POSES).length} ejercicios · ${Object.keys(POSES).join(" ")} · peor ajuste ${peor.toExponential(1)}`);
