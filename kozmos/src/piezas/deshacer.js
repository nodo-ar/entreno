/* ===== Deshacer ===== */
/* K.deshacer("Tema oscuro", () => volver()) muestra el aviso; si se toca, corre volver(). Uno por vez. */
K.DESHACER_MS = 5000;
K.deshacer = (texto, volver) => {
  K.deshacer.cerrar(true);
  const t = document.createElement("div");
  t.className = "utoast"; t.setAttribute("role", "status");
  t.style.setProperty("--dur", K.DESHACER_MS + "ms");
  t.innerHTML = `<span class="utx">${K.esc(texto)}</span><button type="button" class="utu"><svg class="utr" viewBox="0 0 24 24" aria-hidden="true"><circle class="f" cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="10"/></svg>Deshacer</button>`;
  document.body.appendChild(t);
  K.$(".utu", t).addEventListener("click", () => { K.deshacer.cerrar(); volver(); });
  /* el tiempo se frena mientras lo tenés en foco o el dedo encima, y sigue al salir */
  let queda = K.DESHACER_MS, desde = 0;
  const correr = () => { desde = Date.now(); clearTimeout(K.deshacer._t); K.deshacer._t = setTimeout(() => K.deshacer.cerrar(), queda); t.classList.remove("quieto"); };
  const frenar = () => { clearTimeout(K.deshacer._t); queda = Math.max(800, queda - (Date.now() - desde)); t.classList.add("quieto"); };
  t.addEventListener("focusin", frenar); t.addEventListener("focusout", correr);
  t.addEventListener("pointerenter", frenar); t.addEventListener("pointerleave", correr);
  correr();
  K.deshacer._el = t;
};
K.deshacer.cerrar = ya => {
  clearTimeout(K.deshacer._t);
  const t = K.deshacer._el; if (!t) return;
  K.deshacer._el = null;
  if (ya || K.reduce()){ t.remove(); return; }
  t.classList.add("out"); setTimeout(() => t.remove(), 220);
};
