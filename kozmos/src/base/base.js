/* ===== Base: espacio de nombres, íconos, preferencias y tema ===== */
const K = window.K = {};
K.VERSION = "dev"; /* la pone tools/armar.mjs al armar */

/* íconos de trazo, 24 × 24 (los mismos del prototipo aprobado) */
K.I = {
  hoy:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  cielo:'<circle cx="6" cy="7" r="1.6"/><circle cx="17" cy="5" r="1.6"/><circle cx="12" cy="13" r="1.6"/><circle cx="19" cy="18" r="1.6"/><path d="M7.4 7.8 10.8 12M13.4 12.2 15.8 6.2M13.2 14.2 17.8 17"/>',
  progreso:'<path d="M4 19h16M7 15v-4M12 15V7M17 15v-6"/>',
  vos:'<circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  dots:'<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  check:'<path d="M5 12l5 5 9-10"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  auto:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  chevd:'<path d="M6 9l6 6 6-6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  play:'<path d="M8 5v14l11-7z" fill="currentColor"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  skip:'<path d="M6 5v14l9-7z" fill="currentColor"/><path d="M18 5v14"/>',
  barra:'<path d="M3 6h18M7 6v13M17 6v13"/>',
  paralelas:'<path d="M3 9h7M14 9h7M5 9v10M8 9v10M16 9v10M19 9v10"/>',
  pared:'<path d="M4 5h16v14H4zM4 10h16M4 15h16M10 5v5M15 10v5M9 15v4"/>',
  poste:'<path d="M12 3v18M8 21h8M12 7h6"/>',
  peso:'<path d="M6 8h12l2 12H4z"/><circle cx="12" cy="5" r="2"/>',
  vibra:'<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 9v6M20 9v6"/>',
  caja:'<path d="M4 8h16v11H4zM3 4h18v4H3zM10 12h4"/>',
  bajar:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  subir:'<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>',
  bici:'<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8 8.5 5H7M12 16l3-8"/>',
  soga:'<path d="M5 3v6M19 3v6M5 9c0 9 14 9 14 0"/>',
  mancuernas:'<path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12"/>',
  kettlebell:'<path d="M9 8a3 3 0 0 1 6 0"/><path d="M8.5 8h7l2 4a6 6 0 1 1-11 0z"/>',
  ruta:'<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7"/>',
  hazana:'<path d="M12 3l7 3v5c0 4.6-2.9 7.9-7 10-4.1-2.1-7-5.4-7-10V6z"/><path d="M9.5 12l2 2 3.5-4"/>'
};
K.ic = (k, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${K.I[k] || ""}</svg>`;

/* El logo: disco negro con un punto, y una estrella chica arriba a la derecha */
K.logo = (px = 40) => `<svg width="${px}" height="${px}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="34" fill="var(--ink)"/><circle cx="42" cy="42" r="9" fill="var(--bg)"/><circle cx="60" cy="24" r="4" fill="var(--bg)"/></svg>`;

/* Preferencias: viven en este teléfono. Lo que entrenás va aparte, en el diario (IndexedDB). */
K.PREFS = "kozmos.prefs.v1";
K.prefs = {
  leer(){ try{ return JSON.parse(localStorage.getItem(K.PREFS)) || {}; }catch(e){ return {}; } },
  get(k, d){ const v = K.prefs.leer()[k]; return v === undefined ? d : v; },
  set(k, v){ const p = K.prefs.leer(); p[k] = v; try{ localStorage.setItem(K.PREFS, JSON.stringify(p)); }catch(e){} }
};

/* Tema: automático (sigue al teléfono), claro u oscuro */
K.TEMAS = [["auto", "Automático", "auto"], ["light", "Claro", "sun"], ["dark", "Oscuro", "moon"]];
K.tema = {
  actual(){ return K.prefs.get("tema", "auto"); },
  nombre(t = K.tema.actual()){ return (K.TEMAS.find(x => x[0] === t) || K.TEMAS[0])[1]; },
  aplicar(t = K.tema.actual()){
    const r = document.documentElement;
    if (t === "auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", t);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = getComputedStyle(r).getPropertyValue("--bg").trim() || "#f7f6f2";
  },
  poner(t){ K.prefs.set("tema", t); K.tema.aplicar(t); }
};
K.tema.aplicar();
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => K.tema.aplicar());

/* utilidades */
K.$ = (s, el = document) => el.querySelector(s);
K.$$ = (s, el = document) => [...el.querySelectorAll(s)];
K.reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
K.esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
