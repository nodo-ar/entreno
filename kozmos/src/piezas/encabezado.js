/* ===== Encabezado ===== */
/* enc({titulo, sub, volver, raiz, acciones}): volver es una ruta (raiz: vuelve a la lista, que en horizontal ya está a la vista);
   acciones es el HTML de los botones de la derecha (por ejemplo el ⋯) */
K.enc = ({titulo, sub = "", volver = "", raiz = false, acciones = "", det = false}) =>
  /* las acciones van fuera del encabezado para que queden pegadas arriba mientras se desplaza toda la pantalla */
  `<div class="enc-acc">${volver ? `<button class="ib" type="button" data-volver="${volver}"${raiz ? " data-raiz" : ""} aria-label="Volver">${K.ic("back")}</button>` : ""}<span class="esp"></span>${acciones}</div>
   <header class="enc"><div class="enc-tit${det ? " det" : ""}">${sub ? `<small class="lb">${K.esc(sub)}</small>` : ""}<h1>${K.esc(titulo)}</h1></div></header>`;
K.mas = (id, etiqueta = "Más opciones") => `<button class="ib" type="button" id="${id}" aria-haspopup="menu" aria-expanded="false" aria-label="${etiqueta}">${K.ic("dots")}</button>`;

K.encabezado = {
  armar(){
    const t = document.createElement("div");
    t.id = "tbar"; t.setAttribute("aria-hidden", "true"); t.innerHTML = `<div id="tbt"></div>`;
    document.body.prepend(t);
  },
  /* mira el título de la pantalla nueva: si sale por arriba, se ve la barra compacta con el mismo nombre */
  observar(view){
    K.encabezado._o?.disconnect();
    document.body.classList.remove("compacto");
    const h = K.$$(".enc-tit h1", view).find(x => x.offsetParent !== null); if (!h) return;
    K.$("#tbt").textContent = h.textContent;
    const o = K.encabezado._o = new IntersectionObserver(([e]) => {
      document.body.classList.toggle("compacto", !e.isIntersecting && e.boundingClientRect.top < 60);
    }, {rootMargin: "-60px 0px 0px 0px"});
    o.observe(h);
  }
};
