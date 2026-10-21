/* ===== Poses · estirar: casi todo sostenido y quieto, sin ritmo (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO, parado = {torso: 180, head: 180, armN: [4, 6], armF: [358, 2], legN: [0, 0], legF: [2, 2]};
  /* un estiramiento sostenido: la misma pose dos veces */
  const quieto = p => [p, p];
  Object.assign(K.POSES, {
    /* de lado no se ve de perfil: apoyado en el codo, talón al glúteo con la mano */
    "cuadriceps-costado": {fijo: "hip", en: [170, 259], k: quieto({torso: 120, head: 124, armN: [270, 286], armF: [0, 90], legN: [270, 120], legF: [270, 270], pies: [0, -90]})},
    "flexor-cadera-de-pie": {fijo: "fN", en: [175, T], k: quieto({...parado, torso: 183, armN: [330, 60], armF: [326, 56], legN: [28, 350], legF: [334, 324]})},
    "codos-atras": {fijo: "fN", en: [150, T], k: quieto({...parado, torso: 182, head: 178, armN: [320, 51], armF: [316, 48]})},
    "dorsal-arriba": {fijo: "fN", en: [150, T], k: quieto({...parado, torso: 174, head: 176, armN: [166, 166], armF: [150, 200]})},
    /* contra la pared o el marco: el brazo va atrás (hombro a −75°, avanzado) y el cuerpo se inclina apenas adelante, que es el «girá hacia afuera» visto de perfil */
    "pecho-pared": {fijo: "fN", en: [150, T], pared: 88, rango: "avanzado", k: quieto({...parado, torso: 172, head: 176, armN: [277, 355], armF: [10, 14]})},
    "munecas-cuatro-patas": {fijo: "kN", en: [145, 262], k: [{torso: 102, head: 100, armN: [0, 0], armF: [2, 2], legN: [0, 270], legF: [2, 270], pies: [-90, -90]},
      {torso: 104, head: 104, armN: [21, 41], armF: [23, 43], legN: [40, 270], legF: [42, 270], pies: [-90, -90]}], ritmo: [3, 2, 3, 1]},
    "postura-nino": {fijo: "kN", en: [150, 262], rango: "avanzado", k: quieto({torso: 82, head: 74, armN: [77, 77], armF: [79, 79], legN: [65, 270], legF: [64, 270], pies: [-90, -90]})},
    "manos-atras-sentado": {fijo: "hip", en: [150, 259], rango: "avanzado", k: quieto({torso: 214, head: 200, armN: [335, 335], armF: [335, 335], legN: [87, 87], legF: [88, 88]})},
    "triceps-sobre-cabeza": {fijo: "fN", en: [150, T], k: quieto({...parado, armN: [185, 335], armF: [130, 247]})},
    "circulos-muneca": {fijo: "fN", en: [150, T], ciclo: true, estela: "hN", k: [
      {...parado, armN: [4, 70], armF: [358, 66]}, {...parado, armN: [6, 90], armF: [0, 86]},
      {...parado, armN: [4, 110], armF: [358, 106]}, {...parado, armN: [2, 90], armF: [356, 86]}], ritmo: [3]},
    /* de frente en la realidad: el brazo cruzado se ve estirado adelante y la otra mano lo aprieta en el codo */
    "hombro-cruzado": {fijo: "fN", en: [150, T], k: quieto({...parado, armN: [90, 90], armF: [35, 147]})},
    /* acostado de lado, el brazo de arriba largo pasando la cabeza */
    "dorsal-de-costado": {fijo: "hip", en: [150, 259], k: quieto({torso: 94, head: 92, armN: [99, 97], armF: [88, 88], legN: [272, 270], legF: [270, 270], pies: [-90, -90]})},
    "biceps-pared": {fijo: "fN", en: [150, T], pared: 61, rango: "avanzado", k: quieto({...parado, torso: 172, head: 176, armN: [277, 277], armF: [10, 14]})},
    /* a diferencia del hombro cruzado: brazo bajo adelante y la otra mano tira de la mano */
    "muneca-costado": {fijo: "fN", en: [150, T], k: quieto({...parado, armN: [60, 60], armF: [38, 81]})},
    "pecho-manos-nuca": {fijo: "fN", en: [150, T], rango: "avanzado", k: quieto({...parado, torso: 184, head: 178, armN: [200, 350], armF: [196, 346]})},
    "brazos-al-techo": {fijo: "fN", en: [150, T], k: quieto({...parado, armN: [180, 180], armF: [178, 178]})},
    "pecho-marco-puerta": {fijo: "fN", en: [175, T], poste: 115, rango: "avanzado", k: quieto({...parado, torso: 172, head: 176, armN: [277, 277], armF: [10, 14], legN: [20, 355], legF: [340, 340]})},
    "isquios-pierna-arriba": {fijo: "hip", en: [150, 259], k: quieto({torso: 271, head: 262, armN: [120, 160], armF: [118, 158], legN: [200, 200], legF: [88, 88]})},
    "flexor-cuadriceps-estocada": {fijo: "kN", en: [130, 262], k: quieto({torso: 190, head: 186, armN: [348, 348], armF: [29, 43], legN: [340, 190], legF: [90, 0]})},
    "cuadriceps-pie-elevado": {fijo: "fF", en: [190, T], silla: [118, 223], k: quieto({torso: 182, head: 180, armN: [10, 40], armF: [6, 36], legN: [350, 220], legF: [60, 0]})},
    "hombros-silla": {fijo: "fN", en: [120, T], silla: [251, 219], k: quieto({torso: 92, head: 92, armN: [96, 96], armF: [94, 94], legN: [0, 0], legF: [2, 2]})},
    "tocar-los-pies": {fijo: "fN", en: [150, T], rango: "avanzado", k: quieto({torso: 56, head: 18, armN: [321, 348], armF: [319, 346], legN: [12, 352], legF: [11, 353]})},
    "puente-gluteo-sostenido": {fijo: "sh", en: [100, 260], k: quieto({torso: 293, head: 262, armN: [90, 90], armF: [92, 92], legN: [113, 345], legF: [115, 347]})}
  });
})();
