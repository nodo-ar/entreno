/* ===== Poses · empuje: flexiones, planchas, fondos, verticales, planche, L-sit y burpees (ver piezas/figura.js) ===== */
(() => {
  /* un sostenido: la misma pose de punta a punta */
  const {quieto} = K.fig, T = K.fig.TOBILLO;
  /* arriba de la flexión: brazos rectos, cuerpo en línea */
  const arriba = {torso: 111, head: 107, armN: [354, 7], armF: [357, 9], legN: [292, 290], legF: [290, 288], pies: [30, 30]};
  /* abajo: el pecho casi en el piso, codos atrás */
  const abajo = {torso: 99, head: 95, armN: [290, 43], armF: [295, 50], legN: [280, 277], legF: [278, 275], pies: [30, 30]};
  /* arriba en paralelas: brazos rectos, rodillas dobladas atrás */
  const arribaPar = {torso: 174, head: 176, armN: [355, 8], armF: [357, 9], legN: [14, 290], legF: [10, 286]};
  /* parado, listo */
  const paradoB = {...K.fig.PARADO, armN: [6, 14], armF: [2, 10]};
  /* cuclillas con las manos en el piso */
  const cuclillas = {torso: 86, head: 76, armN: [343, 2], armF: [344, 7], legN: [65, 320], legF: [62, 317]};
  /* plancha: los pies atrás */
  const planchaB = {torso: 109, head: 105, armN: [348, 13], armF: [351, 16], legN: [291, 288], legF: [289, 286], pies: [30, 30]};
  /* el salto: brazos arriba (de perfil, el tobillo queda clavado) */
  const saltoB = {torso: 180, head: 186, armN: [162, 166], armF: [160, 164], legN: [0, 0], legF: [356, 356], pies: [-40, -40], alto: 34};
  Object.assign(K.POSES, {
    /* en cuatro patas, el peso va de a poco hacia las manos */
    "munecas-dorso": {fijo: "hN", en: [150, 264], k: [{torso: 102, head: 96, armN: [354, 7], armF: [357, 9], legN: [1, 259], legF: [359, 257]},
      {torso: 103, head: 97, armN: [335, 349], armF: [333, 357], legN: [336, 259], legF: [334, 257]}], ritmo: [2, 1, 2, .6]},
    /* se inclina adelante hasta despegar los pies */
    "cuervo": {fijo: "hN", en: [150, 264], rango: "avanzado", k: [{torso: 96, head: 120, armN: [340, 2], armF: [338, 0], legN: [71, 311], legF: [68, 309]},
      {torso: 77, head: 111, armN: [318, 8], armF: [316, 6], legN: [49, 259], legF: [46, 257]}], ritmo: [1.6, 2, 1.4, .8]},
    /* panza a la pared: la pared queda del lado del pecho */
    "vertical-pared": {fijo: "hN", en: [150, 264], pared: 82, k: quieto({torso: 4, head: 340, armN: [6, 6], armF: [4, 4], legN: [186, 186], legF: [184, 184]})},
    /* cadera arriba, pies en el banco; la cabeza baja entre las manos */
    "pike-elevado": {fijo: "hN", en: [150, 264], banco: [39, 216], k: [{torso: 32, head: 40, armN: [16, 22], armF: [20, 23], legN: [298, 298], legF: [296, 296]},
      {torso: 33, head: 45, armN: [324, 80], armF: [330, 84], legN: [285, 274], legF: [283, 272]}], ritmo: [1.5, .2, 1.1, .3]},
    /* sostenido: brazos rectos, cuerpo en línea */
    "vertical-libre": {fijo: "hN", en: [150, 264], k: quieto({torso: 4, head: 340, armN: [6, 6], armF: [4, 4], legN: [184, 184], legF: [182, 182]})},
    /* espalda a la pared: los talones apoyados atrás */
    "flexion-vertical-pared": {fijo: "hN", en: [150, 264], pared: 174, muestra: 0, k: [{torso: 356, head: 336, armN: [358, 358], armF: [356, 356], legN: [174, 174], legF: [172, 172]},
      {torso: 8, head: 346, armN: [279, 30], armF: [282, 37], legN: [174, 174], legF: [172, 172]}], ritmo: [1.6, .2, 1.2, .4]},
    /* abajo apoya los antebrazos en la barra y vuelve a subir */
    "fondo-ruso": {con: "paralelas", fijo: "hN", en: [150, 178], k: [arribaPar,
      {torso: 140, head: 150, armN: [326, 84], armF: [324, 82], legN: [40, 274], legF: [36, 270]}], ritmo: [1.6, .3, 1.4, .3]},
    /* sostenido: hombros por delante de las manos, en puntas de pie */
    "planche-lean": {fijo: "hN", en: [150, 264], k: quieto({torso: 109, head: 105, armN: [331, 344], armF: [328, 354], legN: [290, 287], legF: [288, 285], pies: [30, 30]})},
    /* manos a la altura de la cadera: el hombro va muy por delante */
    "flexion-pseudo-planche": {fijo: "hN", en: [150, 264], k: [{torso: 108, head: 104, armN: [328, 342], armF: [325, 352], legN: [290, 287], legF: [288, 285], pies: [30, 30]},
      {torso: 97, head: 93, armN: [268, 355], armF: [268, 2], legN: [278, 276], legF: [276, 274], pies: [30, 30]}], ritmo: [1.3, .2, 1, .3]},
    /* sostenido: espalda redonda, rodillas al pecho, pies en el aire */
    "planche-tuck": {fijo: "hN", en: [150, 264], k: quieto({torso: 68, head: 92, armN: [328, 342], armF: [325, 352], legN: [16, 226], legF: [13, 224]})},
    /* sostenido: espalda plana, cadera a la altura del hombro */
    "planche-tuck-avanzado": {fijo: "hN", en: [150, 264], k: quieto({torso: 90, head: 100, armN: [325, 339], armF: [321, 349], legN: [354, 204], legF: [351, 202]})},
    /* sostenido: cuerpo horizontal, piernas estiradas (abiertas: de perfil, apenas separadas) */
    "planche-straddle": {fijo: "hN", en: [150, 264], k: quieto({torso: 92, head: 102, armN: [319, 333], armF: [314, 344], legN: [274, 274], legF: [266, 266]})},
    /* abajo, el brazo lejano queda estirado adelante con la mano en el piso */
    "flexion-arquera": {fijo: "hN", en: [150, 264], k: [{torso: 111, head: 107, armN: [354, 7], armF: [357, 9], legN: [292, 290], legF: [290, 288], pies: [30, 30]},
      {torso: 98, head: 94, armN: [286, 44], armF: [54, 68], legN: [279, 276], legF: [277, 274], pies: [30, 30]}], ritmo: [1.4, .3, 1.1, .3]},
    /* el brazo lejano descansa sobre la cadera */
    "flexion-un-brazo": {fijo: "hN", en: [150, 264], k: [{torso: 111, head: 107, armN: [354, 7], armF: [297, 307], legN: [292, 290], legF: [290, 288], pies: [30, 30]},
      {torso: 99, head: 95, armN: [290, 43], armF: [285, 295], legN: [280, 277], legF: [278, 275], pies: [30, 30]}], ritmo: [1.5, .2, 1.2, .3]},
    /* con el peso colgado de la cintura, baja hasta 90° */
    "fondo-lastre": {con: "paralelas", fijo: "hN", en: [150, 178], lastre: true, k: [arribaPar,
      {torso: 150, head: 158, armN: [297, 20], armF: [298, 24], legN: [30, 280], legF: [26, 276]}], ritmo: [1.3, .2, 1.1, .3]},
    /* manos atrás en el borde del banco, codos hacia atrás */
    "fondo-banco": {fijo: "hN", en: [121, 211], banco: [92, 215], k: [{torso: 176, head: 176, armN: [339, 354], armF: [338, 359], legN: [62, 42], legF: [55, 52]},
      {torso: 168, head: 174, armN: [288, 29], armF: [290, 33], legN: [90, 43], legF: [84, 52]}], ritmo: [1.2, .2, 1, .3]},
    /* manos bajo el pecho: el hombro queda por delante de la mano */
    "flexion-cerrada": {fijo: "hN", en: [150, 264], k: [{torso: 110, head: 106, armN: [343, 355], armF: [343, 2], legN: [292, 289], legF: [290, 287], pies: [30, 30]},
      {torso: 98, head: 94, armN: [275, 20], armF: [277, 27], legN: [279, 276], legF: [277, 274], pies: [30, 30]}], ritmo: [1.2, .2, .9, .3]},
    /* manos en el banco, pies en el piso */
    "flexion-inclinada": {fijo: "hN", en: [160, 209], banco: [178, 213], k: [{torso: 143, head: 139, armN: [354, 7], armF: [357, 9], legN: [324, 322], legF: [322, 320], pies: [30, 30]},
      {torso: 119, head: 115, armN: [258, 338], armF: [257, 344], legN: [301, 298], legF: [299, 296], pies: [30, 30]}], ritmo: [1.1, .2, .9, .3]},
    /* codos atrás a 45°, el pecho casi toca el piso */
    "flexion": {fijo: "hN", en: [150, 264], k: [arriba, abajo], ritmo: [1.1, .2, .9, .3]},
    /* en antebrazos: codo bajo el hombro, cuerpo en línea */
    "plancha": {fijo: "eN", en: [150, T], k: quieto({torso: 99, head: 95, armN: [0, 90], armF: [358, 88], legN: [280, 278], legF: [278, 276], pies: [30, 30]})},
    /* ciclo: rodilla cercana al pecho, cruzan, rodilla lejana */
    "escaladores": {fijo: "hN", en: [150, 264], ciclo: true, k: [{torso: 111, head: 107, armN: [354, 7], armF: [357, 9], legN: [51, 261], legF: [290, 288], pies: [30, 30]},
      {torso: 94, head: 90, armN: [354, 7], armF: [357, 9], legN: [326, 268], legF: [322, 264], pies: [30, 30]},
      {torso: 111, head: 107, armN: [354, 7], armF: [357, 9], legN: [292, 290], legF: [51, 261], pies: [30, 30]},
      {torso: 94, head: 90, armN: [354, 7], armF: [357, 9], legN: [326, 268], legF: [322, 264], pies: [30, 30]}], ritmo: [.8]},
    /* abajo el hombro pasa el codo, el torso apenas inclinado */
    "fondo": {con: "paralelas", fijo: "hN", en: [150, 178], k: [arribaPar,
      {torso: 146, head: 154, armN: [274, 41], armF: [278, 46], legN: [36, 270], legF: [32, 266]}], ritmo: [1.2, .2, 1, .3]},
    /* pies en la silla; baja en 3 segundos */
    "flexion-declinada": {fijo: "hN", en: [150, 264], silla: [9, 224], k: [{torso: 92, head: 88, armN: [354, 7], armF: [357, 9], legN: [273, 271], legF: [271, 269], pies: [30, 30]},
      {torso: 82, head: 78, armN: [278, 5], armF: [279, 11], legN: [264, 262], legF: [262, 260], pies: [30, 30]}], ritmo: [3, .2, 1, .3]},
    /* ciclo: parado, manos al piso, plancha, pies adelante y salto */
    "burpee": {fijo: "tN", en: [164, T], rango: "avanzado", ciclo: true, muestra: 2, k: [paradoB, cuclillas, planchaB, cuclillas, saltoB], ritmo: [3.2]},
    /* como el burpee, con el pecho al piso en la plancha */
    "burpee-flexion": {fijo: "tN", en: [164, T], rango: "avanzado", ciclo: true, muestra: 2, k: [planchaB,
      {torso: 103, head: 99, armN: [309, 41], armF: [312, 46], legN: [284, 281], legF: [282, 279], pies: [30, 30]},
      {torso: 96, head: 92, armN: [286, 46], armF: [291, 53], legN: [278, 275], legF: [276, 273], pies: [30, 30]},
      {torso: 103, head: 99, armN: [309, 41], armF: [312, 46], legN: [284, 281], legF: [282, 279], pies: [30, 30]},
      cuclillas,
      saltoB], ritmo: [4]},
    /* sostenido en el piso: manos al lado de la cadera, piernas al frente */
    "l-sit": {fijo: "hN", en: [150, 264], k: quieto({torso: 156, head: 160, armN: [0, 0], armF: [356, 358], legN: [97, 97], legF: [99, 99]})},
    /* sostenido en paralelas: los pies por encima de la cadera */
    "l-sit-alto": {con: "paralelas", fijo: "hN", en: [150, 196], k: quieto({torso: 172, head: 174, armN: [358, 358], armF: [354, 356], legN: [122, 122], legF: [121, 121]})},
    /* sostenido: torso atrás, manos empujando atrás, piernas cerca de la cara */
    "v-sit": {fijo: "hN", en: [150, 264], rango: "avanzado", k: quieto({torso: 206, head: 194, armN: [358, 2], armF: [354, 0], legN: [152, 152], legF: [154, 154]})}
  });
})();
