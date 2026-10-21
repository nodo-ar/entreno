/* ===== Poses · empuje: flexiones, planchas, fondos, verticales, planche, L-sit y burpees (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO;
  /* un sostenido que respira: el torso y la cabeza apenas, los brazos casi nada (d en grados) */
  const respira = (p, d = 1.5, b = .5) => [p, {...p, torso: p.torso + d, head: p.head + d * 1.5,
    armN: [p.armN[0] + b, p.armN[1] + b], armF: [p.armF[0] + b, p.armF[1] + b]}];
  const RESPIRA = [2, .4, 2, .4];
  /* arriba de la flexión: brazos rectos, cuerpo en línea */
  const arriba = {torso: 111, head: 107, armN: [354, 7], armF: [357, 9], legN: [292, 290], legF: [290, 288], pies: [30, 30]};
  /* abajo: el pecho casi en el piso, codos atrás */
  const abajo = {torso: 95, head: 91, armN: [268, 39], armF: [272, 45], legN: [276, 274], legF: [274, 272], pies: [30, 30]};
  /* arriba en paralelas: brazos rectos, rodillas dobladas atrás */
  const arribaPar = {torso: 174, head: 176, armN: [356, 6], armF: [358, 8], legN: [16, 292], legF: [12, 288]};
  /* abajo en paralelas: el hombro baja a la altura del codo, el torso inclinado 30° */
  const abajoPar = {torso: 147, head: 155, armN: [268, 21], armF: [269, 26], legN: [26, 270], legF: [22, 266]};
  /* burpee: la mano cercana es el punto fijo (en el piso no se mueve); parado y en el aire, «alto» la sube.
     Los brazos van adelante (parado) y arriba adelante (salto) para que los pies no se corran */
  const paradoB = {torso: 180, head: 180, armN: [45, 48], armF: [42, 46], legN: [0, 0], legF: [2, 2], alto: 102};
  /* bajando (y subiendo): rodillas dobladas, el torso adelante y las manos camino al piso */
  const agachando = {torso: 150, head: 138, armN: [10, 16], armF: [8, 14], legN: [30, 340], legF: [28, 338], alto: 70};
  /* cuclillas con las manos en el piso, en puntas de pie */
  const cuclillas = {torso: 86, head: 76, armN: [343, 2], armF: [344, 7], legN: [65, 320], legF: [62, 317]};
  /* el vuelo de los pies: atrás (de cuclillas a la plancha) y adelante (de la plancha a parado), la cadera alta y las rodillas dobladas */
  const vueloAtras = {torso: 98, head: 94, armN: [356, 6], armF: [358, 8], legN: [330, 247], legF: [327, 244], pies: [10, 10]};
  const vueloAdelante = {torso: 96, head: 92, armN: [356, 4], armF: [358, 6], legN: [22, 262], legF: [19, 260], pies: [10, 10]};
  /* el salto: cuerpo estirado, brazos arriba adelante, pies en punta */
  const saltoB = {torso: 179, head: 184, armN: [136, 140], armF: [133, 138], legN: [0, 0], legF: [357, 357], pies: [-40, -40], alto: 211};
  Object.assign(K.POSES, {
    /* en cuatro patas con el dorso de las manos en el piso: la cadera va de a poco hacia los talones y estira */
    "munecas-dorso": {fijo: "hN", en: [150, 264], k: [{torso: 102, head: 98, armN: [359, 1], armF: [1, 2], legN: [1, 271], legF: [359, 270], pies: [-90, -90]},
      {torso: 103, head: 100, armN: [13, 16], armF: [15, 17], legN: [20, 271], legF: [18, 270], pies: [-90, -90]}], ritmo: [2.5, 1.5, 2, .8]},
    /* se inclina adelante hasta despegar los pies */
    "cuervo": {fijo: "hN", en: [150, 264], rango: "avanzado", k: [{torso: 96, head: 120, armN: [340, 2], armF: [338, 0], legN: [71, 311], legF: [68, 309]},
      {torso: 77, head: 111, armN: [318, 8], armF: [316, 6], legN: [49, 259], legF: [46, 257], pies: [-60, -62]}], ritmo: [1.6, 2, 1.4, .8]},
    /* panza a la pared: la pared del lado del pecho, las puntas apoyadas; la cabeza entre los brazos, lejos del piso */
    "vertical-pared": {fijo: "hN", en: [150, 264], pared: 93, k: respira({torso: 4, head: 22, armN: [2, 3], armF: [0, 1], legN: [184, 184], legF: [182, 182], pies: [-73, -75]}, .8, 0), ritmo: RESPIRA},
    /* cadera arriba, pies en el banco; la cabeza baja entre las manos */
    "pike-elevado": {fijo: "hN", en: [150, 264], banco: [39, 216], muestra: .6, k: [{torso: 34, head: 44, armN: [14, 20], armF: [17, 22], legN: [299, 299], legF: [297, 297], pies: [-7, -6]},
      {torso: 42, head: 42, armN: [316, 58], armF: [319, 62], legN: [281, 281], legF: [279, 279], pies: [11, 12]}], ritmo: [1.8, .2, 1.1, .4]},
    /* sostenido: muñeca, hombro, cadera y tobillo en línea; la cabeza entre los brazos; se corrige apenas con los dedos */
    "vertical-libre": {fijo: "hN", en: [150, 264], k: respira({torso: 1, head: 19, armN: [0, 1], armF: [358, 359], legN: [182, 182], legF: [179, 179], pies: [-80, -80]}, 1, 1), ritmo: RESPIRA},
    /* espalda a la pared: los talones bajan por la pared y la cabeza va adelante de las manos, hacia la pared */
    "flexion-vertical-pared": {fijo: "hN", en: [150, 264], pared: 179, muestra: .55, k: [{torso: 353, head: 3, armN: [358, 359], armF: [356, 358], legN: [168, 168], legF: [166, 167], pies: [-85, -85]},
      {torso: 359, head: 7, armN: [285, 34], armF: [283, 31], legN: [173, 173], legF: [171, 172], pies: [-85, -85]}], ritmo: [2, .2, 1.2, .4]},
    /* baja como un fondo, lleva los codos atrás hasta apoyar los antebrazos en la barra y vuelve */
    "fondo-ruso": {con: "paralelas", fijo: "hN", en: [150, 150], k: [arribaPar, abajoPar,
      {torso: 148, head: 158, armN: [356, 84], armF: [358, 86], legN: [30, 270], legF: [26, 266]}], ritmo: [2.2, .5, 2, .4]},
    /* sostenido: hombros por delante de las manos, en puntas de pie */
    "planche-lean": {fijo: "hN", en: [150, 264], k: respira({torso: 109, head: 105, armN: [335, 340], armF: [333, 341], legN: [290, 288], legF: [288, 286], pies: [30, 30]}, -1.2), ritmo: RESPIRA},
    /* manos a la altura de la cadera: el hombro va muy por delante */
    "flexion-pseudo-planche": {fijo: "hN", en: [150, 264], muestra: .6, k: [{torso: 108, head: 104, armN: [328, 342], armF: [325, 352], legN: [290, 287], legF: [288, 285], pies: [30, 30]},
      {torso: 97, head: 93, armN: [268, 355], armF: [268, 2], legN: [278, 276], legF: [276, 274], pies: [30, 30]}], ritmo: [1.6, .2, 1.1, .4]},
    /* sostenido: espalda redonda, rodillas al pecho, pies en el aire */
    "planche-tuck": {fijo: "hN", en: [150, 264], k: respira({torso: 74, head: 82, armN: [328, 331], armF: [326, 332], legN: [23, 233], legF: [21, 231], pies: [-70, -72]}), ritmo: RESPIRA},
    /* sostenido: espalda plana, cadera a la altura del hombro */
    "planche-tuck-avanzado": {fijo: "hN", en: [150, 264], k: respira({torso: 90, head: 96, armN: [326, 329], armF: [324, 330], legN: [12, 222], legF: [9, 220], pies: [-70, -72]}), ritmo: RESPIRA},
    /* sostenido: cuerpo horizontal, piernas estiradas (abiertas: de perfil, apenas separadas) */
    "planche-straddle": {fijo: "hN", en: [150, 264], k: respira({torso: 91, head: 97, armN: [325, 328], armF: [323, 329], legN: [273, 273], legF: [266, 266], pies: [-80, -80]}), ritmo: RESPIRA},
    /* abajo, el brazo lejano queda estirado adelante con la mano en el piso (de perfil, la mano abierta al costado se desliza adelante) */
    "flexion-arquera": {fijo: "hN", en: [150, 264], k: [arriba,
      {torso: 103, head: 99, armN: [307, 42], armF: [45, 51], legN: [283, 281], legF: [281, 279], pies: [30, 30]},
      {torso: 96, head: 92, armN: [273, 42], armF: [66, 68], legN: [277, 275], legF: [275, 273], pies: [30, 30]}], ritmo: [1.6, .3, 1.2, .4]},
    /* la mano libre en la espalda: el codo asoma por arriba */
    "flexion-un-brazo": {fijo: "hN", en: [150, 264], muestra: .65, k: [{...arriba, armF: [251, 320]},
      {torso: 97, head: 93, armN: [279, 44], armF: [237, 306], legN: [277, 275], legF: [275, 273], pies: [30, 30]}], ritmo: [1.8, .2, 1.3, .4]},
    /* con el peso colgado de la cintura, baja hasta 90° */
    "fondo-lastre": {con: "paralelas", fijo: "hN", en: [150, 150], lastre: true, k: [{...arribaPar, legN: [10, 286], legF: [6, 282]},
      {torso: 156, head: 162, armN: [278, 10], armF: [280, 14], legN: [18, 270], legF: [14, 266]}], ritmo: [1.8, .2, 1.2, .4]},
    /* manos atrás en el borde del banco, codos hacia atrás; los talones no se mueven y abajo las rodillas ceden un poco */
    "fondo-banco": {fijo: "hN", en: [121, 211], banco: [92, 215], rango: "avanzado", muestra: .7, k: [{torso: 188, head: 183, armN: [357, 359], armF: [358, 0], legN: [56, 50], legF: [54, 49]},
      {torso: 186, head: 181, armN: [301, 44], armF: [303, 46], legN: [97, 33], legF: [95, 32]}], ritmo: [1.5, .2, 1, .4]},
    /* manos bajo el pecho: el hombro queda por delante de la mano */
    "flexion-cerrada": {fijo: "hN", en: [150, 264], muestra: .65, k: [{torso: 110, head: 106, armN: [343, 355], armF: [343, 2], legN: [292, 289], legF: [290, 287], pies: [30, 30]},
      {torso: 96, head: 92, armN: [265, 17], armF: [267, 24], legN: [276, 274], legF: [274, 272], pies: [30, 30]}], ritmo: [1.4, .2, 1, .4]},
    /* manos en el borde del banco, pies en el piso: el pecho baja hasta el borde */
    "flexion-inclinada": {fijo: "hN", en: [154, 209], banco: [182, 213], muestra: .65, k: [{torso: 137, head: 133, armN: [9, 18], armF: [13, 20], legN: [318, 316], legF: [316, 314], pies: [-8, -10]},
      {torso: 117, head: 113, armN: [254, 26], armF: [258, 35], legN: [298, 296], legF: [296, 294], pies: [12, 10]}], ritmo: [1.4, .2, 1, .4]},
    /* codos atrás a 45°, el pecho casi toca el piso */
    "flexion": {fijo: "hN", en: [150, 264], muestra: .65, k: [arriba, abajo], ritmo: [1.4, .2, 1, .4]},
    /* la misma flexión, con dos segundos quieta abajo */
    "flexion-pausa": {fijo: "hN", en: [150, 264], muestra: .65, k: [arriba, abajo], ritmo: [1.4, 2, 1, .4]},
    /* en antebrazos: codo bajo el hombro, cuerpo en línea */
    "plancha": {fijo: "eN", en: [150, T], k: respira({torso: 99, head: 95, armN: [0, 90], armF: [358, 88], legN: [280, 278], legF: [278, 276], pies: [30, 30]}, -1, 0), ritmo: RESPIRA},
    /* ciclo: rodilla cercana al pecho, cruzan en el aire con la cadera apenas arriba, rodilla lejana */
    "escaladores": {fijo: "hN", en: [150, 264], ciclo: true, k: [
      {torso: 110, head: 106, armN: [354, 7], armF: [357, 9], legN: [57, 275], legF: [290, 288], pies: [0, 30]},
      {torso: 97, head: 93, armN: [351, 6], armF: [354, 8], legN: [15, 266], legF: [343, 262], pies: [0, 10]},
      {torso: 110, head: 106, armN: [354, 7], armF: [357, 9], legN: [292, 290], legF: [55, 273], pies: [30, 0]},
      {torso: 97, head: 93, armN: [351, 6], armF: [354, 8], legN: [341, 260], legF: [17, 268], pies: [10, 0]}], ritmo: [.9]},
    /* abajo el hombro llega a la altura del codo, el torso inclinado unos 30° */
    "fondo": {con: "paralelas", fijo: "hN", en: [150, 150], k: [arribaPar, abajoPar], ritmo: [1.5, .2, 1, .4]},
    /* pies en la silla: el cuerpo gira sobre las puntas, que no se mueven; baja en 3 segundos */
    "flexion-declinada": {fijo: "hN", en: [150, 264], silla: [22, 218], muestra: .65, k: [{torso: 89, head: 85, armN: [344, 359], armF: [344, 3], legN: [269, 269], legF: [267, 267], pies: [39, 41]},
      {torso: 76, head: 72, armN: [290, 61], armF: [297, 69], legN: [256, 256], legF: [254, 254], pies: [53, 55]}], ritmo: [3, .2, 1, .4]},
    /* ciclo: parado, manos al piso, pies atrás a la plancha, pies adelante, de pie y salto */
    "burpee": {fijo: "hN", en: [194, 264], rango: "avanzado", ciclo: true, muestra: 9, k: [paradoB, agachando, cuclillas, vueloAtras, arriba, vueloAdelante, cuclillas, agachando, paradoB, saltoB], ritmo: [3.6]},
    /* como el burpee, con una flexión entera en la plancha (el salto va entre dos «parado»: «alto» no puede saltar más de 180 entre dos poses) */
    "burpee-flexion": {fijo: "hN", en: [194, 264], rango: "avanzado", ciclo: true, muestra: .44, k: [paradoB, agachando, cuclillas, vueloAtras, arriba, abajo, arriba, vueloAdelante, cuclillas, agachando, paradoB, saltoB], ritmo: [4.6]},
    /* sostenido en el piso: manos al lado de la cadera, la cola despegada, piernas al frente a la altura de la cadera */
    "l-sit": {fijo: "hN", en: [150, 264], k: respira({torso: 157, head: 168, armN: [0, 0], armF: [357, 358], legN: [90, 90], legF: [92, 92], pies: [-80, -80]}, 1, 0), ritmo: RESPIRA},
    /* sostenido en paralelas: los pies por encima de la cadera */
    "l-sit-alto": {con: "paralelas", fijo: "hN", en: [150, 196], k: respira({torso: 168, head: 176, armN: [0, 0], armF: [357, 358], legN: [118, 118], legF: [116, 116], pies: [-80, -80]}, 1, 0), ritmo: RESPIRA},
    /* sostenido: torso atrás, manos empujando atrás, piernas cerca de la cara */
    "v-sit": {fijo: "hN", en: [150, 264], rango: "avanzado", k: respira({torso: 210, head: 196, armN: [0, 0], armF: [357, 358], legN: [170, 170], legF: [172, 172], pies: [-80, -80]}, 1, 0), ritmo: RESPIRA}
  });
})();
