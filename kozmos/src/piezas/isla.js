/* ===== Isla =====
   K.isla.mostrar({texto:"Descanso 1:08", p:.62, familia:"fu", ir:"#/sesion"}) · K.isla.ocultar()
   La usa la sesión (etapa 3) cuando salís a mirar otra pantalla con un reloj corriendo. */
K.isla = {
  mostrar({texto, p = 0, familia = "fu", ir = ""}){
    let b = K.$("#isla"); const nace = !b || b.hidden;
    if (!b){
      b = document.createElement("button"); b.id = "isla"; b.type = "button";
      b.addEventListener("click", () => { if (b.dataset.ir) K.ir(b.dataset.ir); });
      document.body.appendChild(b);
    }
    b.hidden = false; b.dataset.ir = ir;
    b.style.setProperty("--c", `var(--${familia})`); b.style.setProperty("--p", Math.max(0, Math.min(1, p)));
    b.innerHTML = `<span class="ir" aria-hidden="true"></span><span>${K.esc(texto)}</span>`;
    b.setAttribute("aria-label", texto);
    document.body.classList.add("con-isla");
    /* recién salido de la sesión: el anillo del descanso se achica hasta el aro de la isla y la isla se estira desde ahí */
    const a = K._anillo; K._anillo = null;
    if (nace && a && Date.now() - a.t < 1500 && !K.reduce()) K.isla.nacer(b, a.r);
  },
  nacer(b, r){
    const d = document.createElement("div"), ir = b.querySelector(".ir").getBoundingClientRect(), E = "cubic-bezier(.5,0,.2,1)";
    d.className = "isla-nace"; d.setAttribute("aria-hidden", "true"); d.style.setProperty("--c", b.style.getPropertyValue("--c"));
    Object.assign(d.style, {left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px"});
    document.body.appendChild(d);
    const s = ir.width / r.width, dx = ir.left + ir.width / 2 - (r.left + r.width / 2), dy = ir.top + ir.height / 2 - (r.top + r.height / 2);
    d.animate([{transform: "none"}, {transform: `translate(${dx}px,${dy}px) scale(${s})`}], {duration: 420, easing: E, fill: "forwards"}).onfinish = () => d.remove();
    setTimeout(() => d.remove(), 600);
    b.style.animation = "none";
    b.animate([{clipPath: "inset(0 calc(100% - 40px) 0 0 round 20px)", opacity: 1}, {clipPath: "inset(0 0 0 0 round 20px)", opacity: 1}], {duration: 380, delay: 400, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards"});
    b.animate([{opacity: 0}, {opacity: 0}], {duration: 400, fill: "backwards"});
  },
  ocultar(){ const b = K.$("#isla"); if (b) b.hidden = true; document.body.classList.remove("con-isla"); }
};
