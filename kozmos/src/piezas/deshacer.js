/* ===== Deshacer ===== */
/* K.deshacer("Borraste una marca", () => volver()) muestra el aviso; si se toca, corre volver(). Uno por vez.
   Solo para lo que borra, termina o reemplaza algo que deja de verse donde tocaste. Elegir o cambiar algo
   que queda a la vista en el control (rumbo, equipo, días, tema, avisos, la persona, el peso) no lo ofrece. */
K.DESHACER_MS = 5000;
K.deshacer = (texto, volver) => {
  /* un deshacer nuevo reemplaza al anterior, aunque estuviera esperando detrás de un aviso */
  K.deshacer._espera = null;
  K.deshacer.cerrar(true);
  const t = document.createElement("div");
  t.className = "utoast"; t.setAttribute("role", "status");
  t.style.setProperty("--dur", K.DESHACER_MS + "ms");
  t.innerHTML = `<span class="utx">${K.esc(texto)}</span><button type="button" class="utu"><svg class="utr" viewBox="0 0 24 24" aria-hidden="true"><circle class="f" cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="10"/></svg>Deshacer</button>`;
  document.body.appendChild(t);
  K.$(".utu", t).addEventListener("click", () => { K.deshacer.cerrar(); volver(); });
  /* el tiempo se frena mientras lo tenés en foco o el dedo encima, y sigue al salir */
  let queda = K.DESHACER_MS, desde = 0, corre = false;
  /* un aviso que ya se está yendo (o que espera detrás de otro) no toca el tiempo del que está a la vista */
  const correr = () => { if (K.deshacer._el !== t || corre) return; corre = true; desde = Date.now(); clearTimeout(K.deshacer._t); K.deshacer._t = setTimeout(() => K.deshacer.cerrar(), queda); t.classList.remove("quieto"); };
  const frenar = () => { if (K.deshacer._el !== t || !corre) return; corre = false; clearTimeout(K.deshacer._t); queda = Math.max(800, queda - (Date.now() - desde)); t.classList.add("quieto"); };
  t.addEventListener("focusin", frenar); t.addEventListener("focusout", correr);
  t.addEventListener("pointerenter", frenar); t.addEventListener("pointerleave", correr);
  /* un aviso de error no se lleva el deshacer: lo guarda con el tiempo que le quedaba y, al irse el aviso, lo devuelve */
  t._guardar = () => {
    frenar(); K.deshacer._el = null; K.deshacer._espera = t;
    /* el anillo vuelve donde había quedado, no lleno */
    t.style.setProperty("--ya", (queda - K.DESHACER_MS) + "ms");
    t.remove();
  };
  t._devolver = () => { document.body.appendChild(t); K.deshacer._el = t; correr(); };
  K.deshacer._el = t;
  correr();
};
K.deshacer.cerrar = ya => {
  clearTimeout(K.deshacer._t);
  const t = K.deshacer._el; if (!t) return;
  K.deshacer._el = null;
  if (ya || K.reduce()) t.remove();
  else { t.classList.add("out"); setTimeout(() => t.remove(), 220); }
  /* se fue un aviso: vuelve el deshacer que esperaba detrás */
  const u = K.deshacer._espera;
  if (u && t.classList.contains("solo")){ K.deshacer._espera = null; u._devolver(); }
};
/* aviso sin deshacer: algo que no se pudo hacer, dicho en una línea */
K.aviso = texto => {
  const u = K.deshacer._el;
  if (u && u._guardar) u._guardar();
  else if (u){ clearTimeout(K.deshacer._t); K.deshacer._el = null; u.remove(); } /* otro aviso: el nuevo lo reemplaza y el deshacer sigue esperando */
  const t = document.createElement("div");
  t.className = "utoast solo"; t.setAttribute("role", "alert");
  t.innerHTML = `<span class="utx">${K.esc(texto)}</span>`;
  document.body.appendChild(t);
  K.deshacer._el = t; K.deshacer._t = setTimeout(() => K.deshacer.cerrar(), K.DESHACER_MS);
};
