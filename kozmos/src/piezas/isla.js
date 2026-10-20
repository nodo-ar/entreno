/* ===== Isla =====
   K.isla.mostrar({texto:"Descanso 1:08", p:.62, familia:"fu", ir:"#/sesion"}) · K.isla.ocultar()
   La usa la sesión (etapa 3) cuando salís a mirar otra pantalla con un reloj corriendo. */
K.isla = {
  mostrar({texto, p = 0, familia = "fu", ir = ""}){
    let b = K.$("#isla");
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
  },
  ocultar(){ const b = K.$("#isla"); if (b) b.hidden = true; document.body.classList.remove("con-isla"); }
};
