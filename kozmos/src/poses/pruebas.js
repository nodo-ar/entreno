/* ===== Poses · lo que solo se mide en una prueba (las hazañas): usan el dibujo del ejercicio que se le parece =====
   Se leen al dibujar, así toman la vista que tenga ese ejercicio (de perfil o la de vistas.js). Dibujo propio: en el backlog. */
(() => {
  const igual = {"del-piso": "sentadilla-profunda", "pike-alcance": "pike-pecho", "bici-12": "bici", "mil-saltos": "soga"};
  for (const [id, de] of Object.entries(igual)) Object.defineProperty(K.POSES, id, {get: () => K.POSES[de], enumerable: true, configurable: true});
})();
