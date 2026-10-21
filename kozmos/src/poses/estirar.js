/* ===== Poses · estirar: casi todo sostenido, con una respiración sutil para que se vea viva (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO, parado = K.fig.PARADO;
  /* sostenido vivo: la pose y su respiración (torso y cabeza 1 a 2°, los brazos apenas); «b: 0» deja los brazos quietos (manos apoyadas) */
  const RESPIRA = [2, .4, 2, .4];
  const respira = (p, {t = 1.5, c = 2, b = 1} = {}) => ({k: [p, {...p, torso: p.torso + t, head: p.head + c,
    armN: [p.armN[0] + b, p.armN[1] + b], armF: [p.armF[0] + b, p.armF[1] + b]}], ritmo: RESPIRA});
  Object.assign(K.POSES, {
    /* estocada corta: la pierna de atrás casi estirada sobre la punta, la cadera adelante y el tronco derecho, manos en la cintura */
    "flexor-cadera-de-pie": {fijo: "fN", en: [175, T], rango: "avanzado", ...respira({...parado, torso: 183, head: 180, armN: [330, 60], armF: [326, 57], legN: [42, 4], legF: [328, 322], pies: [0, 8]}, {t: 1, b: 0})},
    /* manos en la cintura, codos bien atrás y juntos, pecho abierto */
    "codos-atras": {fijo: "fN", en: [150, T], ...respira({...parado, torso: 182, head: 179, armN: [316, 50], armF: [312, 47]}, {b: 0})},
    /* contra la pared o el marco: el brazo va atrás (hombro a −75°, avanzado) y el cuerpo se inclina apenas adelante, que es el «girá hacia afuera» visto de perfil */
    "pecho-pared": {fijo: "fN", en: [150, T], pared: 88, rango: "avanzado", ...respira({...parado, torso: 172, head: 176, armN: [278, 356], armF: [10, 16]}, {t: 1, c: 1.5, b: 0})},
    /* las palmas no se mueven y los codos quedan estirados: la cola va atrás hacia los talones y el brazo se inclina */
    "munecas-cuatro-patas": {fijo: "kN", en: [145, 262], k: [{...K.fig.CUATRO, head: 100},
      {torso: 105, head: 103, armN: [30, 30], armF: [31, 31], legN: [40, 270], legF: [42, 270], pies: [-90, -90]}], ritmo: [3, 2, 3, 1]},
    /* cola en los talones, frente al piso y brazos largos; al respirar la espalda sube apenas y las manos no se mueven */
    "postura-nino": {fijo: "kN", en: [150, 262], rango: "avanzado", ...respira({torso: 82, head: 75, armN: [77, 77], armF: [79, 79], legN: [65, 270], legF: [64, 270], pies: [-90, -90]}, {t: 1.2, c: 1, b: -1.2})},
    /* sentado con las piernas largas, manos en el piso detrás de la cola y brazos estirados, pecho abierto */
    "manos-atras-sentado": {fijo: "hip", en: [150, 259], rango: "avanzado", ...respira({torso: 210, head: 202, armN: [340, 340], armF: [338, 338], legN: [87, 87], legF: [88, 88]}, {t: -1.2, c: -1, b: 0})},
    /* el codo cercano al techo un poco detrás de la cabeza (que se vea la cara), la mano entre los omóplatos; la otra mano empuja el codo */
    "triceps-sobre-cabeza": {fijo: "fN", en: [150, T], rango: "avanzado", ...respira({...parado, head: 175, armN: [199, 345], armF: [143, 255]}, {t: 1, c: 1, b: 0})},
    /* el motor no tiene muñeca: codos doblados, antebrazos adelante a la altura del pecho y las manos dibujan un círculo chico y lento */
    "circulos-muneca": {fijo: "fN", en: [150, T], ciclo: true, k: [
      {...parado, armN: [32, 90], armF: [29, 88]}, {...parado, armN: [25, 104], armF: [22, 102]},
      {...parado, armN: [18, 90], armF: [15, 88]}, {...parado, armN: [25, 76], armF: [22, 74]}], ritmo: [3]},
    /* como el pecho en la pared, pero con el brazo estirado y la palma a la altura del hombro */
    "biceps-pared": {fijo: "fN", en: [150, T], pared: 61, rango: "avanzado", ...respira({...parado, torso: 172, head: 176, armN: [278, 278], armF: [10, 16]}, {t: 1, c: 1.5, b: 0})},
    /* a diferencia del hombro cruzado: brazo bajo adelante y la otra mano tira de la mano */
    "muneca-costado": {fijo: "fN", en: [150, T], ...respira({...parado, armN: [60, 60], armF: [38, 81]}, {t: 1, c: 1.5, b: 0})},
    /* codos arriba y bien atrás, manos en la nuca, el pecho se abre (el tronco apenas atrás) */
    "pecho-manos-nuca": {fijo: "fN", en: [150, T], rango: "avanzado", ...respira({...parado, torso: 185, head: 181, armN: [203, 353], armF: [200, 350]}, {t: 1, c: 1.5, b: 0})},
    /* dedos cruzados arriba: los dos brazos largos al techo, apenas detrás de la oreja para que se vea la cara */
    "brazos-al-techo": {fijo: "fN", en: [150, T], ...respira({...parado, armN: [183, 181], armF: [181, 180]}, {t: 1, c: 1.5, b: 1})},
    /* el mismo brazo que en la pared (antebrazo apoyado en el marco), con un paso adelante */
    "pecho-marco-puerta": {fijo: "fN", en: [175, T], poste: 141, rango: "avanzado", ...respira({...parado, torso: 172, head: 176, armN: [278, 356], armF: [10, 16], legN: [20, 355], legF: [340, 340]}, {t: 1, c: 1.5, b: 0})},
    /* boca arriba, la pierna cercana larga al techo tomada detrás de la rodilla; al exhalar se acerca un poco */
    "isquios-pierna-arriba": {fijo: "hip", en: [150, 259], k: [{torso: 271, head: 262, armN: [120, 160], armF: [118, 158], legN: [200, 200], legF: [88, 88]},
      {torso: 270, head: 261, armN: [121, 162], armF: [119, 160], legN: [202, 202], legF: [88, 88]}], ritmo: RESPIRA},
    /* rodilla de atrás en el piso, la mano de ese lado lleva el pie al glúteo, cadera adelante y tronco derecho; la otra mano en el muslo de adelante */
    "flexor-cuadriceps-estocada": {fijo: "kN", en: [130, 262], rango: "avanzado", ...respira({torso: 185, head: 182, armN: [333, 348], armF: [3, 42], legN: [330, 185], legF: [93, 353], pies: [-45, 0]}, {t: 1, c: 1.5, b: 0})},
    /* el empeine de atrás apoyado plano en el borde del asiento, la rodilla de atrás baja delante de la silla, tronco derecho y manos en la cintura */
    "cuadriceps-pie-elevado": {fijo: "fF", en: [190, T], silla: [88, 223], ...respira({torso: 182, head: 180, armN: [330, 60], armF: [326, 57], legN: [342, 227], legF: [65, 5], pies: [-47, 0]}, {t: 1, c: 1.5, b: 0})},
    /* manos arriba del respaldo, piernas largas con la cadera sobre los pies y el pecho que baja entre los brazos */
    "hombros-silla": {fijo: "fN", en: [120, T], silla: [249, 219], rango: "avanzado", ...respira({torso: 86, head: 88, armN: [102, 102], armF: [100, 100], legN: [0, 0], legF: [2, 2]}, {t: 1, c: 1, b: 0})},
    /* plegado adelante con las rodillas apenas flojas, la cadera un poco detrás de los talones, cabeza y brazos colgando hasta los pies */
    "tocar-los-pies": {fijo: "fN", en: [150, T], rango: "avanzado", ...respira({torso: 56, head: 18, armN: [316, 346], armF: [313, 344], legN: [12, 0], legF: [11, 1]}, {t: 1.5, c: 2, b: 1})},
    /* sube la cadera despacio hasta la línea hombro-cadera-rodilla y la sostiene; los pies y los hombros no se mueven */
    "puente-gluteo-sostenido": {fijo: "sh", en: [100, 260], k: [
      {torso: 271, head: 262, armN: [90, 90], armF: [92, 92], legN: [137, 31], legF: [138, 32], pies: [-31, -32]},
      {torso: 291, head: 262, armN: [90, 90], armF: [92, 92], legN: [111, 20], legF: [112, 21], pies: [-20, -21]}], ritmo: [4, 6, 3, 1]}
  });
})();
