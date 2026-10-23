/* ===== Isla =====
   K.isla.mostrar({texto:"Descanso 1:08", p:.62, familia:"fu", ir:"#/sesion", marca:"▲ nuevo"}) y K.isla.ocultar()
   La usa la sesión (etapa 3) cuando salís a mirar otra pantalla con un reloj corriendo.
   Se arma una vez y después solo cambia lo que cambia (el reloj, el aro): así el nombre que pasea no vuelve a empezar a cada latido. */
const MQ = {vel: 30, pausa: 1800}; /* el nombre largo pasea a 30 px/s y descansa 1,8 s en cada punta */
K.isla = {
  mostrar({texto, p = 0, familia = "fu", ir = "", marca = ""}){
    let b = K.$("#isla"); const nace = !b || b.hidden;
    if (!b){
      b = document.createElement("button"); b.id = "isla"; b.type = "button";
      b.addEventListener("click", () => { if (b.dataset.ir) K.ir(b.dataset.ir); });
      document.body.appendChild(b);
    }
    b.hidden = false; b.dataset.ir = ir;
    b.style.setProperty("--c", `var(--${familia})`); b.style.setProperty("--p", Math.max(0, Math.min(1, p)));
    /* el reloj del final queda siempre entero; lo nuevo va como su signo («▲»), en el color de la familia */
    const m = /^(.*\S)\s+(\d+:\d\d)$/.exec(texto), nombre = m ? m[1] : texto, rl = m ? m[2] : "", signo = marca.split(" ")[0];
    const forma = `${nombre}|${signo}|${rl ? 1 : 0}`;
    if (b.dataset.forma !== forma){
      b.dataset.forma = forma;
      b.innerHTML = `<span class="ir" aria-hidden="true"></span><span class="tx"><span class="tx-in">${K.esc(nombre)}</span></span>`
        + (signo ? ` <span class="mk" aria-hidden="true">${K.esc(signo)}</span>` : "") + (rl ? ` <span class="rl">${K.esc(rl)}</span>` : "");
      K.isla.pasear(b); /* se mide con el reloj ya puesto: es lo que le queda al nombre */
    }
    /* el reloj cambia solo su texto; si cambia de ancho (de 9:59 a 10:00), al nombre le queda otro lugar y se vuelve a medir */
    const r = b.querySelector(".rl"); if (r && r.textContent !== rl){ const otro = r.textContent.length !== rl.length; r.textContent = rl; if (otro) K.isla.pasear(b); }
    b.setAttribute("aria-label", marca ? `${nombre}, ${marca}${rl ? " " + rl : ""}` : texto);
    document.body.classList.add("con-isla");
    /* recién salido de la sesión: el anillo del descanso se achica hasta el aro de la isla y la isla se estira desde ahí */
    const a = K._anillo; K._anillo = null;
    if (nace && a && Date.now() - a.t < 1500 && !K.reduce()) K.isla.nacer(b, a.r);
  },
  /* un nombre que no entra pasea de punta a punta, ida y vuelta, despacio y con una pausa en cada punta.
     Si entra, queda quieto; sin movimiento (o en un teléfono que lo pide), queda quieto y cortado con «…».
     El paso lo marca setTimeout (como el reloj de la figura): las pruebas lo pueden adelantar con su reloj. */
  pasear(b = K.$("#isla")){
    clearTimeout(K.isla._mq); K.isla._mq = null;
    const tx = b && b.querySelector(".tx"), en = tx && tx.firstElementChild; if (!en) return;
    tx.classList.remove("pasea"); en.style.transition = "none"; en.style.transform = ""; delete b.dataset.mq;
    if (K.reduce() || b.hidden) return;
    tx.classList.add("pasea");
    const d = Math.ceil(en.scrollWidth - tx.clientWidth);
    if (d <= 1){ tx.classList.remove("pasea"); return; }
    const ms = Math.round(d / MQ.vel * 1000);
    /* inicio → ida → fin → vuelta → inicio: «data-mq» dice en qué tramo va (los bordes esfumados siguen a lo que queda tapado) */
    const tramo = ida => {
      if (!en.isConnected) return;
      b.dataset.mq = ida ? "ida" : "vuelta";
      en.style.transition = `transform ${ms}ms linear`; en.style.transform = ida ? `translateX(${-d}px)` : "";
      K.isla._mq = setTimeout(() => { b.dataset.mq = ida ? "fin" : "inicio"; K.isla._mq = setTimeout(() => tramo(!ida), MQ.pausa); }, ms);
    };
    b.dataset.mq = "inicio";
    K.isla._mq = setTimeout(() => tramo(true), MQ.pausa);
  },
  nacer(b, r){
    b.style.animation = "none"; /* sin su entrada de siempre, que la mediría achicada */
    const d = document.createElement("div"), ir = b.querySelector(".ir").getBoundingClientRect(), E = "cubic-bezier(.5,0,.2,1)";
    d.className = "isla-nace"; d.setAttribute("aria-hidden", "true"); d.style.setProperty("--c", b.style.getPropertyValue("--c"));
    Object.assign(d.style, {left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px"});
    document.body.appendChild(d);
    const s = ir.width / r.width, dx = ir.left + ir.width / 2 - (r.left + r.width / 2), dy = ir.top + ir.height / 2 - (r.top + r.height / 2);
    d.animate([{transform: "none"}, {transform: `translate(${dx}px,${dy}px) scale(${s})`}], {duration: 360, easing: E, fill: "forwards"}).onfinish = () => d.remove();
    setTimeout(() => d.remove(), 500);
    /* oculta mientras el anillo viaja; después se estira desde el aro (su entrada de siempre vuelve para la próxima) */
    b.animate([{clipPath: "inset(0 calc(100% - 40px) 0 0 round 20px)", opacity: 0}, {clipPath: "inset(0 calc(100% - 40px) 0 0 round 20px)", opacity: 1, offset: .5}, {clipPath: "inset(0 0 0 0 round 20px)", opacity: 1}],
      {duration: 600, easing: "cubic-bezier(.2,.7,.2,1)"}).onfinish = () => { b.style.animation = ""; };
  },
  ocultar(){ const b = K.$("#isla"); clearTimeout(K.isla._mq); K.isla._mq = null; if (b){ b.hidden = true; delete b.dataset.forma; delete b.dataset.mq; } document.body.classList.remove("con-isla"); }
};
/* al girar el teléfono cambia lo que entra: se vuelve a medir */
addEventListener("resize", () => { const b = K.$("#isla"); if (b && !b.hidden) K.isla.pasear(b); });
