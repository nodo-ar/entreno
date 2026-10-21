/* ===== Barra flotante ===== */
K.PESTANAS = [["hoy", "Hoy"], ["cielo", "Cielo"], ["progreso", "Progreso"], ["vos", "Vos"]];
K.nav = {
  armar(){
    const n = document.createElement("nav");
    n.className = "barra"; n.setAttribute("aria-label", "Secciones");
    n.innerHTML = `<span class="ind" aria-hidden="true"></span>` + K.PESTANAS.map(([k, t]) =>
      `<button type="button" data-tab="${k}" aria-label="${t}">${K.ic(k)}<span class="nm">${t}</span></button>`).join("");
    /* tocar la pestaña en la que ya estás vuelve a su raíz sin sumar pasos */
    n.addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) K.ir("#/" + b.dataset.tab, K.ruta().tab === b.dataset.tab); });
    document.body.appendChild(n);
    addEventListener("resize", () => K.nav.indicador(true));
    return n;
  },
  /* La pestaña elegida se ensancha mientras aparece su nombre. Para que el indicador viaje directo a su lugar final,
     se mide el estado final sin transiciones, se vuelve al anterior y recién ahí se anima todo junto. */
  marcar(tab){
    const n = K.$("nav.barra"); if (!n) return;
    const bs = K.$$("button[data-tab]", n), viejo = bs.find(b => b.getAttribute("aria-current"));
    const poner = t => bs.forEach(b => b.dataset.tab === t ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
    n.classList.add("medir"); poner(tab);
    const b = bs.find(x => x.dataset.tab === tab), fin = {x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight};
    const animar = n.classList.contains("lista") && viejo && viejo !== b && !K.reduce();
    if (animar){ poner(viejo.dataset.tab); n.offsetWidth; }
    n.classList.remove("medir"); n.offsetWidth;
    poner(tab); K.nav.mover(fin, !animar);
    /* la estrella de la pestaña llega orbitando */
    if (animar) K.mov.llegar(b, tab);
  },
  mover(f, sinAnim){
    const n = K.$("nav.barra"), i = K.$(".ind", n), vertical = getComputedStyle(n).flexDirection === "column";
    if (sinAnim) i.style.transition = "none";
    if (vertical){ i.style.transform = `translateY(${f.y - 5}px)`; i.style.width = ""; i.style.height = f.h + "px"; }
    else { i.style.transform = `translateX(${f.x}px)`; i.style.height = ""; i.style.width = f.w + "px"; }
    n.classList.add("lista");
    if (sinAnim){ i.offsetWidth; i.style.transition = ""; }
  },
  indicador(){
    const n = K.$("nav.barra"), b = n && K.$('button[aria-current="page"]', n);
    if (b) K.nav.mover({x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight}, true);
  }
};
