/* ===== Menú flotante =====
   K.menu.abrir(boton, {titulo, items:[{id, texto, ic, elegido}|"-"], elegir(id)})
   Es la forma de elegir entre opciones en toda la app: nada de filas de chips. */
K.menu = {
  abrir(btn, {titulo = "", items, elegir}){
    K.menu.cerrar(true);
    const radio = items.some(it => it !== "-" && "elegido" in it);
    const sc = document.createElement("div"); sc.className = "popscrim";
    const m = document.createElement("div"); m.className = "pop"; m.setAttribute("role", "menu");
    if (titulo) m.setAttribute("aria-label", titulo);
    m.innerHTML = (titulo ? `<span class="lb pt">${K.esc(titulo)}</span>` : "") + items.map(it => it === "-" ? `<div class="psep" role="separator"></div>` :
      `<button type="button" class="pmi" role="${radio && "elegido" in it ? "menuitemradio" : "menuitem"}" data-id="${it.id}"${"elegido" in it ? ` aria-checked="${!!it.elegido}"` : ""}>${it.ic ? K.ic(it.ic) : "<span></span>"}<span>${K.esc(it.texto)}</span>${"elegido" in it ? K.ic("check", "ck") : "<span></span>"}</button>`).join("");
    document.body.append(sc, m);
    /* lugar: debajo del botón, alineado a su borde derecho si está a la derecha; crece desde la esquina del botón */
    const r = btn.getBoundingClientRect(), W = m.offsetWidth, H = m.offsetHeight, vw = innerWidth, vh = innerHeight;
    const der = r.left + r.width / 2 > vw / 2;
    let x = der ? r.right - W : r.left, y = r.bottom + 8;
    x = Math.max(12, Math.min(x, vw - W - 12));
    if (y + H > vh - 12) y = Math.max(12, r.top - H - 8);
    m.style.left = x + "px"; m.style.top = y + "px";
    /* nace como un círculo desde el centro del botón */
    const ox = r.left + r.width / 2 - x, oy = r.top + r.height / 2 - y, R = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
    m._circ = [`circle(0px at ${ox}px ${oy}px)`, `circle(${R}px at ${ox}px ${oy}px)`];
    if (!K.reduce()) m.animate([{clipPath: m._circ[0], opacity: .6}, {clipPath: m._circ[1], opacity: 1}], {duration: 240, easing: "cubic-bezier(.2,.7,.2,1)"});
    btn.setAttribute("aria-expanded", "true");
    const its = K.$$(".pmi", m);
    (its.find(b => b.getAttribute("aria-checked") === "true") || its[0])?.focus();
    const fin = id => { K.menu.cerrar(); btn.focus(); if (id) elegir(id); };
    sc.addEventListener("click", () => fin());
    m.addEventListener("click", e => { const b = e.target.closest(".pmi"); if (b) fin(b.dataset.id); });
    m.addEventListener("keydown", e => {
      const i = its.indexOf(document.activeElement);
      if (e.key === "Escape" || e.key === "Tab"){ e.preventDefault(); e.stopPropagation(); fin(); }
      else if (e.key === "ArrowDown"){ e.preventDefault(); its[(i + 1) % its.length].focus(); }
      else if (e.key === "ArrowUp"){ e.preventDefault(); its[(i - 1 + its.length) % its.length].focus(); }
    });
    K.menu._abierto = {m, sc, btn};
  },
  cerrar(ya){
    const a = K.menu._abierto; if (!a) return;
    K.menu._abierto = null;
    a.btn.setAttribute("aria-expanded", "false");
    a.sc.remove();
    if (ya || K.reduce()){ a.m.remove(); return; }
    a.m.classList.add("out"); a.m.inert = true;
    a.m.animate([{clipPath: a.m._circ[1], opacity: 1}, {clipPath: a.m._circ[0], opacity: .3}], {duration: 160, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards"}).onfinish = () => a.m.remove();
    setTimeout(() => a.m.remove(), 300);
  }
};
