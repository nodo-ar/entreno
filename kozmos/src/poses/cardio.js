/* ===== Poses · cardio: correr, bici, soga y pesas (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO;
  /* correr: una zancada en 6 tiempos de la pierna cercana (contacto, apoyo medio, despegue, y el balanceo);
     la lejana va medio ciclo corrida y cada brazo va opuesto a su pierna. «alto» hace que el pie de apoyo toque y la cadera baje en el apoyo */
  const trote = [
      {torso: 175, head: 180, armN: [311,9], armF: [22,131], legN: [24, 9], legF: [353, 283], pies: [-4, -18], alto: 4.0},
      {torso: 175, head: 180, armN: [333,61], armF: [5,104], legN: [15, 331], legF: [19, 291], pies: [29, 2], alto: 0.8},
      {torso: 175, head: 180, armN: [1,99], armF: [335,64], legN: [345, 315], legF: [31, 333], pies: [-5, 8], alto: 3.8},
      {torso: 175, head: 180, armN: [20,128], armF: [313,12], legN: [352, 282], legF: [25, 10], pies: [-18, -4], alto: 4.0},
      {torso: 175, head: 180, armN: [3,101], armF: [335,64], legN: [18, 290], legF: [16, 332], pies: [2, 29], alto: 0.8},
      {torso: 175, head: 180, armN: [333,61], armF: [3,102], legN: [30, 332], legF: [346, 316], pies: [8, -5], alto: 3.8}
    ];
  const largo = [
      {torso: 173, head: 179, armN: [305,1], armF: [24,135], legN: [25, 10], legF: [352, 274], pies: [-5, -18], alto: 3.5},
      {torso: 173, head: 179, armN: [329,59], armF: [5,106], legN: [16, 332], legF: [22, 282], pies: [28, 2], alto: 0.9},
      {torso: 173, head: 179, armN: [1,101], armF: [331,62], legN: [342, 312], legF: [35, 331], pies: [-2, 8], alto: 2.6},
      {torso: 173, head: 179, armN: [22,132], armF: [307,4], legN: [351, 273], legF: [26, 11], pies: [-18, -5], alto: 3.5},
      {torso: 173, head: 179, armN: [3,103], armF: [331,62], legN: [21, 281], legF: [17, 333], pies: [2, 28], alto: 0.9},
      {torso: 173, head: 179, armN: [329,59], armF: [3,104], legN: [34, 330], legF: [343, 313], pies: [8, -2], alto: 2.6}
    ];
  /* fuerte: más inclinado, la rodilla sube más y el talón llega cerca de la cola */
  const fuerte = [
      {torso: 170, head: 177, armN: [292,354], armF: [32,145], legN: [27, 9], legF: [351, 255], pies: [-4, -18], alto: 3.0},
      {torso: 170, head: 177, armN: [322,52], armF: [6,109], legN: [18, 332], legF: [35, 273], pies: [28, 2], alto: 0.5},
      {torso: 170, head: 177, armN: [2,104], armF: [324,55], legN: [338, 310], legF: [51, 323], pies: [0, 8], alto: 2.9},
      {torso: 170, head: 177, armN: [30,142], armF: [294,357], legN: [350, 254], legF: [28, 10], pies: [-18, -4], alto: 3.0},
      {torso: 170, head: 177, armN: [4,106], armF: [324,55], legN: [34, 272], legF: [19, 333], pies: [2, 28], alto: 0.5},
      {torso: 170, head: 177, armN: [322,52], armF: [4,107], legN: [50, 322], legF: [339, 311], pies: [8, 0], alto: 2.9}
    ];
  /* caminar con peso: siempre un pie en el piso (talón, plano, punta); la cadera sube en el apoyo medio.
     La mano cercana lleva el peso quieta; la lejana bracea opuesta a su pierna */
  const marchaM = [
      {torso: 180, head: 181, armN: [3,4], armF: [22,40], legN: [24, 20], legF: [347, 312], pies: [-8, 6], alto: -5.7},
      {torso: 180, head: 181, armN: [3,4], armF: [8,20], legN: [12, 358], legF: [9, 310], pies: [2, 20], alto: 0.0},
      {torso: 180, head: 181, armN: [3,4], armF: [352,0], legN: [352, 346], legF: [27, 4], pies: [14, 0], alto: -1.1},
      {torso: 180, head: 181, armN: [3,4], armF: [342,350], legN: [346, 312], legF: [25, 20], pies: [6, -8], alto: -5.7},
      {torso: 180, head: 181, armN: [3,4], armF: [354,4], legN: [8, 310], legF: [13, 358], pies: [20, 2], alto: 0.0},
      {torso: 180, head: 181, armN: [3,4], armF: [10,24], legN: [26, 4], legF: [353, 346], pies: [0, 14], alto: -1.1}
    ];
  const marchaK = [
      {torso: 180, head: 181, armN: [2,2], armF: [22,40], legN: [24, 20], legF: [347, 312], pies: [-8, 6], alto: -5.7},
      {torso: 180, head: 181, armN: [2,2], armF: [8,20], legN: [12, 358], legF: [9, 310], pies: [2, 20], alto: 0.0},
      {torso: 180, head: 181, armN: [2,2], armF: [352,0], legN: [352, 346], legF: [27, 4], pies: [14, 0], alto: -1.1},
      {torso: 180, head: 181, armN: [2,2], armF: [342,350], legN: [346, 312], legF: [25, 20], pies: [6, -8], alto: -5.7},
      {torso: 180, head: 181, armN: [2,2], armF: [354,4], legN: [8, 310], legF: [13, 358], pies: [20, 2], alto: 0.0},
      {torso: 180, head: 181, armN: [2,2], armF: [10,24], legN: [26, 4], legF: [353, 346], pies: [0, 14], alto: -1.1}
    ];
  /* bici: el pie da la vuelta al pedal (arriba, adelante, abajo, atrás); las manos quedan en el manubrio */
  const bici = [
      {torso: 148, head: 166, armN: [30,69], armF: [25,72], legN: [62,307], legF: [28,339], pies: [51, 3]},
      {torso: 148, head: 166, armN: [30,69], armF: [25,72], legN: [67,331], legF: [26,316], pies: [23, 30]},
      {torso: 148, head: 166, armN: [30,69], armF: [25,72], legN: [48,343], legF: [38,297], pies: [3, 57]},
      {torso: 148, head: 166, armN: [30,69], armF: [25,72], legN: [28,339], legF: [62,307], pies: [3, 51]},
      {torso: 148, head: 166, armN: [30,69], armF: [25,72], legN: [26,316], legF: [67,331], pies: [30, 23]},
      {torso: 148, head: 166, armN: [30,69], armF: [25,72], legN: [38,297], legF: [48,343], pies: [57, 3]}
    ];
  /* soga: amortigua, empuja, vuela (la soga pasa bajo los pies) y toca, siempre en la punta de los pies.
     Una mano adelante y otra atrás para que la soga se lea como lazo */
  const soga = [
      {torso: 178, head: 180, armN: [2,56], armF: [324,356], legN: [12, 348], legF: [14, 347], pies: [-6, -7], alto: -2.5},
      {torso: 178, head: 180, armN: [4,64], armF: [326,4], legN: [4, 357], legF: [6, 356], pies: [-29, -30], alto: 2.3},
      {torso: 178, head: 180, armN: [1,65], armF: [323,5], legN: [4, 355], legF: [6, 354], pies: [-29, -30], alto: 9.6},
      {torso: 178, head: 180, armN: [0,58], armF: [322,358], legN: [6, 355], legF: [8, 354], pies: [-25, -26], alto: 1.6}
    ];
  /* doble: salto más alto, piernas casi rectas y punta abajo */
  const doble = [
      {torso: 178, head: 180, armN: [8,64], armF: [328,4], legN: [14, 346], legF: [16, 345], pies: [-4, -5], alto: -3.2},
      {torso: 178, head: 180, armN: [10,74], armF: [330,14], legN: [5, 357], legF: [7, 356], pies: [-33, -34], alto: 3.0},
      {torso: 178, head: 180, armN: [8,78], armF: [328,18], legN: [6, 354], legF: [8, 353], pies: [-40, -41], alto: 17.6},
      {torso: 178, head: 180, armN: [6,66], armF: [326,6], legN: [7, 355], legF: [9, 354], pies: [-27, -28], alto: 1.9}
    ];
  /* pesas: parado, pies planos */
  const parado = {...K.fig.PARADO, armF: [2, 4], legF: [2, 1]};
  /* swing: abajo bisagra con la pesa entre los muslos; la cadera se estira primero y la pesa sigue flotando */
  const swAbajo = {torso: 125, head: 130, armN: [315, 317], armF: [317, 319], legN: [26, 354], legF: [28, 355], pies: [6, 5]};
  const swMedio = {torso: 178, head: 178, armN: [36, 38], armF: [38, 40], legN: [2, 0], legF: [3, 1]};
  const swArriba = {torso: 181, head: 180, armN: [90, 92], armF: [92, 94], legN: [1, 0], legF: [2, 1]};
  const swCabeza = {torso: 180, head: 180, armN: [174, 176], armF: [176, 178], legN: [0, 0], legF: [2, 1]};
  /* arranque: a una mano; la pesa sube pegada (tirón alto con el codo) y termina con el brazo recto arriba */
  const snAbajo = {torso: 125, head: 130, armN: [315, 317], armF: [332, 340], legN: [26, 354], legF: [28, 355], pies: [6, 5]};
  const snCadera = {torso: 176, head: 178, armN: [26, 48], armF: [352, 358], legN: [2, 0], legF: [3, 1]};
  const snTiron = {torso: 180, head: 179, armN: [52, 168], armF: [356, 2], legN: [0, 0], legF: [2, 1]};
  const snArriba = {torso: 180, head: 181, armN: [178, 180], armF: [358, 2], legN: [0, 0], legF: [2, 1]};
  /* remo al mentón: las manos suben pegadas al cuerpo y los codos terminan a la altura del pecho */
  const colgando = {torso: 180, head: 180, armN: [4, 8], armF: [2, 6], legN: [0, 0], legF: [2, 1]};
  const mtUno = {...colgando, armN: [352, 72], armF: [350, 70]};
  const mtDos = {...colgando, armN: [22, 145], armF: [20, 143]};
  const menton = {...colgando, head: 178, armN: [62, 204], armF: [60, 202]};
  /* press: la mancuerna sube vertical sobre el hombro; la cabeza se corre apenas al pasar */
  const pressAbajo = {torso: 180, head: 180, armN: [28, 158], armF: [31, 162], legN: [0, 0], legF: [2, 1]};
  const pressMedio = {...pressAbajo, head: 182, armN: [98, 199], armF: [103, 202]};
  const pressArriba = {...pressAbajo, armN: [165, 177], armF: [165, 181]};
  /* sentadilla: tronco paralelo a la tibia, la cadera pasa la línea de la rodilla, talones abajo */
  const sentado = {torso: 148, head: 160, armN: [0, 0], armF: [2, 2], legN: [96, 333], legF: [98, 334], pies: [27, 26]};
  /* remo con dos mancuernas: bisagra quieta; los codos van a la cadera y el antebrazo queda vertical */
  const inclinado = {torso: 120, head: 108, armN: [356, 358], armF: [358, 0], legN: [28, 358], legF: [30, 359], pies: [2, 1]};
  const tirando = {...inclinado, armN: [290, 0], armF: [292, 2]};
  /* rumano: rodillas blandas fijas, la cola va atrás y las mancuernas bajan cerca de las piernas */
  const rmParado = {torso: 180, head: 180, armN: [6, 6], armF: [4, 4], legN: [6, 358], legF: [8, 359], pies: [2, 1]};
  const rumano = {torso: 105, head: 97, armN: [329, 330], armF: [331, 332], legN: [16, 356], legF: [18, 357], pies: [4, 3]};
  /* remo a una mano: la mano lejana apoyada en la silla, la pierna cercana atrás en la punta del pie */
  const rmBase = {torso: 112, head: 104, armN: [0, 2], armF: [25, 25], legN: [340, 322], legF: [35, 5], pies: [13, -5]};
  const rmArriba = {...rmBase, armN: [286, 0]};
  /* poste: cuerpo recto que gira sobre los tobillos; las manos no se mueven del poste */
  const posteAtras = {torso: 200, head: 194, armN: [85, 90], armF: [83, 88], legN: [20, 20], legF: [21, 21], pies: [-20, -21]};
  const posteMedio = {torso: 191, head: 185, armN: [30, 130], armF: [28, 128], legN: [11, 11], legF: [12, 12], pies: [-11, -12]};
  const postePegado = {torso: 183, head: 178, armN: [355, 135], armF: [353, 133], legN: [3, 3], legF: [4, 4], pies: [-3, -4]};
  Object.assign(K.POSES, {
    /* correr: la cadera a una altura fija (sube y baja con «alto»), los pies tocan de a uno */
    "trote": {fijo: "hip", en: [150, 186], ciclo: true, k: trote, ritmo: [.76]},
    "10km": {fijo: "hip", en: [150, 186], ciclo: true, k: largo, ritmo: [.7]},
    "intervalos": {fijo: "hip", en: [150, 186], ciclo: true, k: fuerte, ritmo: [.64]},
    "bici": {con: "bici", fijo: "hip", en: [140, 160], ciclo: true, k: bici, ritmo: [.72]},
    /* soga: la soga pasa por abajo en el vuelo */
    "soga": {con: "soga", fijo: "hip", en: [150, 176], ciclo: true, k: soga, ritmo: [.46]},
    "double-under": {con: "soga", soga: "doble", fijo: "hip", en: [150, 176], ciclo: true, k: doble, ritmo: [.56]},
    /* pesas */
    "swing-kettlebell": {con: "pesa", fijo: "fN", en: [150, T], k: [swAbajo, swMedio, swArriba], ritmo: [.6, .12, .6, .1]},
    "swing-mancuerna": {con: "mancuerna", fijo: "fN", en: [150, T], k: [swAbajo, swMedio, swCabeza], ritmo: [.7, .2, .7, .12], muestra: .8},
    "arranque-kettlebell": {con: "pesa", unaMano: true, fijo: "fN", en: [150, T], k: [snAbajo, snCadera, snTiron, snArriba], ritmo: [.8, .5, .9, .2]},
    "remo-al-menton": {con: "mancuernas", fijo: "fN", en: [150, T], k: [colgando, mtUno, mtDos, menton], ritmo: [1, .3, 1.5, .4]},
    "press-hombros": {con: "mancuernas", fijo: "fN", en: [150, T], k: [pressAbajo, pressMedio, pressArriba], ritmo: [1.1, .4, 1.6, .4]},
    "sentadilla-mancuernas": {con: "mancuernas", fijo: "fN", en: [150, T], k: [parado, sentado], ritmo: [2, .3, 1.2, .5]},
    "remo-dos-mancuernas": {con: "mancuernas", fijo: "fN", en: [150, T], k: [inclinado, tirando], ritmo: [1, .5, 1.5, .4]},
    "peso-muerto-rumano": {con: "mancuernas", fijo: "fN", en: [150, T], k: [rmParado, rumano], ritmo: [2, .3, 1.4, .4]},
    "remo-mancuerna": {con: "mancuerna", silla: [228, 221, "der"], fijo: "fF", en: [170, T], k: [rmBase, rmArriba], ritmo: [1, .5, 1.5, .4]},
    "remo-poste": {poste: 151, fijo: "fN", en: [140, T], k: [posteAtras, posteMedio, postePegado], ritmo: [1, .5, 1.5, .4], muestra: 0},
    /* caminar con peso de un lado */
    "paseo-maleta": {con: "mancuerna", fijo: "hip", en: [150, 180], ciclo: true, k: marchaM, ritmo: [1.1]},
    "paseo-maleta-kettlebell": {con: "pesa", unaMano: true, fijo: "hip", en: [150, 180], ciclo: true, k: marchaK, ritmo: [1.1]}
  });
})();
