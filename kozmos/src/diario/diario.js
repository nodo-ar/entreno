/* ===== Diario: lo que hace cada persona, en IndexedDB de este teléfono =====
   Base «kozmos». Versión 1: «mediciones» (intentos contra una estrella) y «perfil» (clave → valor).
   Versión 2: «sesiones» (cada entrenamiento hecho, con sus bloques y series).
   Al arrancar se lee todo a memoria; cada cambio se escribe y recién entonces se da por hecho. */
K.diario = (() => {
  const BASE = "kozmos", VERSION = 2;
  let db = null;
  const d = {mediciones: [], sesiones: [], perfil: {}, guarda: false};
  const pedir = r => new Promise((ok, mal) => { r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); });
  const tx = (store, modo, fn) => new Promise((ok, mal) => {
    const t = db.transaction(store, modo); const r = fn(t.objectStore(store));
    t.oncomplete = () => ok(r && r.result); t.onerror = t.onabort = () => mal(t.error || new Error("no se pudo guardar"));
  });
  d.abrir = async () => {
    try {
      const r = indexedDB.open(BASE, VERSION);
      /* migraciones por pasos: cada versión nueva suma su paso y nunca borra lo que había */
      r.onupgradeneeded = ev => {
        const b = r.result;
        if (ev.oldVersion < 1){
          b.createObjectStore("mediciones", {keyPath: "id"}).createIndex("estrella", "estrella");
          b.createObjectStore("perfil");
        }
        if (ev.oldVersion < 2) b.createObjectStore("sesiones", {keyPath: "id"}).createIndex("fecha", "fecha");
      };
      /* si otra pestaña vieja traba la base, no se espera para siempre: la app abre igual y avisa al anotar */
      let tarde = false;
      const abierta = pedir(r);
      /* si llega después del tiempo límite, se cierra: una conexión olvidada trabaría una actualización futura */
      abierta.then(x => { if (tarde) x.close(); }, () => {});
      db = await Promise.race([abierta, new Promise((_, mal) => setTimeout(() => { tarde = true; mal(new Error("la base no responde")); }, 4000))]);
      /* otra pestaña con una versión nueva pide la base: se suelta para no trabarla y se avisa */
      db.onversionchange = () => { db.close(); db = null; d.guarda = false; d.motivo = "otra-version"; };
      await d.releer();
      d.guarda = true;
    } catch (e) { db = null; d.guarda = false; }
    return d;
  };
  /* vuelve a leer todo (por ejemplo, al volver a la pestaña: otra pudo haber anotado algo) */
  d.releer = async () => {
    if (!db) return false;
    const t = db.transaction(["mediciones", "perfil", "sesiones"]);
    const [ms, ks, vs, ss] = await Promise.all([pedir(t.objectStore("mediciones").getAll()), pedir(t.objectStore("perfil").getAllKeys()), pedir(t.objectStore("perfil").getAll()), pedir(t.objectStore("sesiones").getAll())]);
    const firma = () => JSON.stringify([d.mediciones.map(m => m.id), d.sesiones.map(x => x.id), d.perfil]);
    const antes = firma();
    d.mediciones = ms.sort(orden);
    d.sesiones = ss.sort(orden);
    d.perfil = Object.fromEntries(ks.map((k, i) => [k, vs[i]]));
    return antes !== firma();
  };
  /* lo primero que se guarda pide que el navegador no borre estos datos por falta de espacio */
  const persistir = () => { if (!d._persiste){ d._persiste = true; navigator.storage?.persist?.().catch(() => {}); } };
  const orden = (a, b) => (a.fecha + a.creada).localeCompare(b.fecha + b.creada);
  const id = d.nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  /* anotar: {estrella, valor, fecha, origen, ...} → la medición guardada; si no se puede guardar, error y no queda nada */
  d.anotar = async m => {
    if (!db) throw new Error(d.motivo || "sin lugar para guardar");
    const n = {id: id(), origen: "anotado", creada: new Date().toISOString(), ...m};
    await tx("mediciones", "readwrite", s => s.put(n));
    persistir();
    d.mediciones = [...d.mediciones, n].sort(orden);
    return n;
  };
  d.devolver = async m => { /* deshacer un borrado: vuelve tal cual estaba */
    if (!db) throw new Error("sin lugar para guardar");
    await tx("mediciones", "readwrite", s => s.put(m));
    d.mediciones = [...d.mediciones.filter(x => x.id !== m.id), m].sort(orden);
  };
  d.borrar = async mid => {
    if (!db) throw new Error("sin lugar para guardar");
    await tx("mediciones", "readwrite", s => s.delete(mid));
    d.mediciones = d.mediciones.filter(x => x.id !== mid);
  };
  /* una sesión terminada (o cortada) se guarda entera de una vez; deshacer la borra */
  d.guardarSesion = async x => {
    if (!db) throw new Error(d.motivo || "sin lugar para guardar");
    const n = {creada: new Date().toISOString(), ...x};
    await tx("sesiones", "readwrite", s => s.put(n));
    persistir();
    d.sesiones = [...d.sesiones.filter(y => y.id !== n.id), n].sort(orden);
    return n;
  };
  d.borrarSesion = async sid => {
    if (!db) throw new Error("sin lugar para guardar");
    await tx("sesiones", "readwrite", s => s.delete(sid));
    d.sesiones = d.sesiones.filter(x => x.id !== sid);
  };
  d.perfilPoner = async (k, v) => {
    if (!db) throw new Error("sin lugar para guardar");
    await tx("perfil", "readwrite", s => s.put(v, k));
    d.perfil = {...d.perfil, [k]: v};
  };
  return d;
})();
