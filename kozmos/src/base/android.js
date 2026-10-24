/* ===== Android: lo que cambia cuando Kozmos corre adentro de la APK (Capacitor). En la web, K.apk es null y nada cambia. =====
   La APK trae la página adentro y la abre desde https://localhost: no hay servidor ni service worker.
   - Respaldo: el archivo se escribe en la caché de la app (Filesystem) y se comparte (Share): Drive, correo, WhatsApp.
     Traer un respaldo usa el mismo <input type="file"> de la web: el WebView de Capacitor abre el selector de archivos.
   - Atrás: cierra el menú abierto; en Hoy sale; si no, vuelve por lo recorrido, o a la raíz de la pestaña y después a Hoy.
     Con una sesión en curso no cierra: deja la app en segundo plano y la sesión sigue corriendo.
   - Pantalla encendida y vibración: con el plugin propio «Pantalla» (kozmos/apk/android/.../PantallaPlugin.java).
   - Barras del sistema: iconos oscuros sobre el tema claro y claros sobre el oscuro. */
K.apk = (() => {
  const C = window.Capacitor;
  if (!C || typeof C.registerPlugin !== "function" || !C.isNativePlatform?.() || C.getPlatform?.() !== "android") return null;
  const P = n => C.isPluginAvailable(n) ? C.registerPlugin(n) : null;
  const App = P("App"), Archivos = P("Filesystem"), Compartir = P("Share"), Barras = P("SystemBars"), Pantalla = P("Pantalla");
  const nada = () => {};
  const apk = {
    /* guardar el respaldo: true si llegó a algún lado, false si la persona cerró sin elegir */
    async compartir(nombre, texto){
      if (!Archivos || !Compartir) throw new Error("sin plugins de archivos");
      const {uri} = await Archivos.writeFile({path: nombre, data: texto, directory: "CACHE", encoding: "utf8"});
      try { await Compartir.share({title: "Respaldo de Kozmos", files: [uri], dialogTitle: "Guardar el respaldo"}); }
      catch (e) { if (/cancel/i.test(String(e && (e.message || e)))) return false; throw e; }
      return true;
    },
    luz(prendida){ if (Pantalla) Pantalla[prendida ? "encender" : "apagar"]().catch(nada); },
    vibrar(patron){ if (!Pantalla) return false; Pantalla.vibrar({patron: [].concat(patron)}).catch(nada); return true; },
    /* el botón atrás de Android */
    atras(){
      if (K.menu._abierto){ K.menu.cerrar(); return "menu"; }
      /* en la bienvenida, un paso atrás (o nada, si no hay a dónde volver) */
      if (K.bienvenida?.atras()) return "bienvenida";
      const {tab, hondo} = K.ruta();
      /* en Hoy, sale; con una sesión en curso queda en segundo plano y sigue corriendo */
      if (tab === "hoy" && !hondo){
        if (K.sesion.activa()){ App?.minimizeApp().catch(nada); return "segundo-plano"; }
        App?.exitApp().catch(nada); return "salir";
      }
      if (K._pila.length > 1){ history.back(); return "atras"; }
      if (hondo > 0){ const v = K.$("main.view [data-volver]"); K.ir(v ? v.dataset.volver : "#/" + tab, true); return "arriba"; }
      K.ir("#/hoy", true); return "hoy";
    },
    barras(){
      if (!Barras) return;
      const t = K.tema.actual(), oscuro = t === "dark" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
      Barras.setStyle({style: oscuro ? "DARK" : "LIGHT"}).catch(nada);
    }
  };
  App?.addListener("backButton", () => apk.atras());
  const aplicar = K.tema.aplicar;
  K.tema.aplicar = t => { aplicar(t); apk.barras(); };
  apk.barras();
  document.documentElement.classList.add("apk");
  return apk;
})();
