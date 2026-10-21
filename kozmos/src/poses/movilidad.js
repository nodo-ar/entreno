/* ===== Poses · movilidad: espagats, pancake, puente, cuatro patas y estiramientos acostado (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO, S = 259, R = 262;
  /* sentado con las piernas estiradas adelante; el tronco y los brazos cuentan el resto */
  const sentado = (torso, head, armN, armF) => ({torso, head, armN, armF, legN: [88, 88], legF: [88, 88]});
  /* acostado boca arriba con la cabeza a la izquierda */
  const boca = {torso: 270, head: 265, armN: [90, 90], armF: [88, 88], legN: [92, 92], legF: [90, 90]};
  /* en cuatro patas: rodillas bajo la cadera, manos bajo los hombros, empeines planos en el piso */
  const cuatro = {torso: 102, head: 104, armN: [0, 0], armF: [2, 2], legN: [0, 270], legF: [2, 270], pies: [-90, -90]};
  const parado = {torso: 180, head: 180, armN: [2, 2], armF: [358, 358], legN: [0, 0], legF: [2, 2]};
  const quieta = P => [P, P], plancha = {torso: 94, head: 96, armN: [0, 0], armF: [2, 2]};
  Object.assign(K.POSES, {
    /* el lateral se ve de frente; de perfil va sentado, piernas abiertas, apoyado atrás con la cadera adelante */
    "espagat-lateral-90": {fijo: "hip", en: [150, S], rango: "avanzado", k: quieta(sentado(196, 186, [350, 350], [347, 347]))},
    /* abierto del todo: brazos en cruz para que se lea el lateral */
    "espagat-lateral": {fijo: "hip", en: [150, S], rango: "avanzado", k: quieta(sentado(184, 184, [92, 92], [305, 305]))},
    "espagat-frontal": {fijo: "hip", en: [150, 253], rango: "avanzado", k: quieta({torso: 180, head: 180, armN: [176, 176], armF: [184, 184], legN: [84, 84], legF: [272, 270], pies: [0, -88]})},
    /* una mano por arriba de la cabeza y la otra por abajo, detrás de la espalda */
    "manos-atras": {fijo: "fN", en: [150, T], k: quieta({...parado, armN: [170, 320], armF: [320, 100]})},
    "dedos-al-piso": {fijo: "fN", en: [150, T], k: quieta({...parado, torso: 60, head: 30, armN: [8, 8], armF: [6, 6], legN: [8, 8], legF: [8, 8]})},
    "hombros-pared": {fijo: "fN", en: [150, T], pared: 92, k: quieta({...parado, torso: 184, head: 182, armN: [182, 182], armF: [186, 186], legN: [6, 6], legF: [6, 6]})},
    "pike-pecho": {fijo: "hip", en: [150, S], rango: "avanzado", k: quieta(sentado(105, 70, [55, 110], [53, 108]))},
    "puente": {fijo: "hN", en: [110, 264], rango: "avanzado", k: quieta({torso: 305, head: 335, armN: [322, 322], armF: [320, 320], legN: [40, 350], legF: [40, 350]})},
    "pancake": {fijo: "hip", en: [150, S], rango: "avanzado", k: quieta(sentado(105, 98, [70, 70], [72, 72]))},
    /* sin columna que se curve: la cabeza y la cadera cuentan el gato y el camello */
    "gato-camello": {fijo: "kN", en: [130, R], estela: "hd", k: [{...cuatro, head: 58}, {...cuatro, head: 135}], ritmo: [3, 1, 3, 1]},
    "curl-up": {fijo: "hip", en: [150, S], estela: "hd", k: [{...boca, armN: [88, 92], armF: [86, 90], legN: [135, 35]},
      {...boca, torso: 262, head: 258, armN: [86, 90], armF: [84, 88], legN: [135, 35]}], ritmo: [1, 8, 1, 2]},
    "plancha-lateral-rodillas": {fijo: "eN", en: [180, 263], k: quieta({torso: 107, head: 110, armN: [0, 90], armF: [287, 287], legN: [287, 270], legF: [285, 270], pies: [-90, -90]})},
    "perro-de-caza-sostenido": {fijo: "kN", en: [130, R], k: quieta({...cuatro, armN: [95, 95], legF: [272, 272]})},
    "respiracion-90-90": {fijo: "hip", en: [120, S], pared: 164, k: quieta({...boca, head: 266, legN: [180, 90], legF: [182, 92]})},
    "bicho-muerto-sostenido": {fijo: "hip", en: [160, S], k: quieta({...boca, armN: [262, 262], armF: [180, 180], legN: [180, 90], legF: [96, 96]})},
    /* las rodillas caen hacia los costados: de perfil se ven dobladas con los pies juntos cerca de la cadera */
    "mariposa-acostado": {fijo: "hip", en: [150, S], k: quieta({...boca, armN: [100, 100], armF: [98, 98], legN: [148, 358], legF: [147, 357]})},
    "aductores-acostado": {fijo: "hip", en: [150, S], k: quieta({...boca, armN: [262, 262], armF: [260, 260], legN: [150, 0], legF: [149, 359]})},
    /* figura 4: el tobillo cercano apoyado sobre la rodilla lejana, que viene al pecho */
    "gluteo-tobillo-rodilla": {fijo: "hip", en: [150, S], k: quieta({...boca, armN: [83, 172], armF: [82, 170], legN: [216, 106], legF: [163, 73]})},
    "isquios-sentado": {fijo: "hip", en: [150, S], k: quieta(sentado(140, 138, [45, 60], [43, 58]))},
    "rodilla-cruzada": {fijo: "hip", en: [150, S], k: quieta({...boca, armN: [82, 182], armF: [262, 262], legN: [190, 100]})},
    "estiramiento-corredor": {fijo: "kF", en: [130, R], k: quieta({torso: 115, head: 112, armN: [3, 3], armF: [1, 1], legN: [58, 58], legF: [0, 270], pies: [0, -90]})},
    "rodilla-al-pecho": {fijo: "hip", en: [150, S], k: quieta({...boca, armN: [82, 182], armF: [81, 180], legN: [215, 85]})},
    "gluteo-banda-it": {fijo: "hip", en: [150, S], k: quieta({...boca, armN: [100, 170], armF: [262, 262], legN: [190, 160]})},
    "piernas-abiertas": {fijo: "hip", en: [150, S], rango: "avanzado", k: quieta(sentado(125, 120, [51, 51], [52, 52]))},
    "isquios-90-90": {fijo: "hip", en: [150, S], estela: "fN", k: [{...boca, torso: 262, head: 258, armN: [80, 172], armF: [79, 170], legN: [190, 100]},
      {...boca, torso: 262, head: 258, armN: [80, 172], armF: [79, 170], legN: [190, 170]}], ritmo: [3, 2, 2, 1]},
    /* alternado: un pie al lado de la mano, cambio con las dos rodillas bajo la cadera, y el otro */
    "groiners": {fijo: "hN", en: [190, 264], rango: "avanzado", ciclo: true, estela: "kN", k: [
      {...plancha, legN: [76, 355], legF: [306, 306], pies: [0, 22]}, {...plancha, legN: [10, 240], legF: [12, 242]},
      {...plancha, legN: [306, 306], legF: [76, 355], pies: [22, 0]}, {...plancha, legN: [12, 242], legF: [10, 240]}], ritmo: [4]},
    "flexor-cadera-arrodillado": {fijo: "fN", en: [180, T], k: quieta({torso: 184, head: 182, armN: [350, 60], armF: [186, 186], legN: [90, 0], legF: [340, 270], pies: [0, -90]})}
  });
})();
