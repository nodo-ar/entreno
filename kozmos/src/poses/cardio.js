/* ===== Poses · cardio: correr, bici, soga y pesas (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO;
  /* arranque a una mano: pasa por el pecho y termina arriba; la mano lejana queda libre */
  const snatchMedio = {torso: 182, head: 182, armN: [100, 112], armF: [4, 10], legN: [2, 0], legF: [3, 1]};
  /* parado con las mancuernas colgando adelante de los muslos; subiendo fuerza el giro del antebrazo */
  const colgando = {torso: 180, head: 180, armN: [6, 30], armF: [4, 28], legN: [0, 0], legF: [2, 1]};
  const subiendo = {torso: 180, head: 180, armN: [35, 150], armF: [33, 148], legN: [0, 0], legF: [2, 1]};
  const snatchAbajo = {torso: 120, head: 108, armN: [354, 356], armF: [8, 12], legN: [28, 352], legF: [30, 354]};
  /* correr: 6 fases de la pierna cercana; la lejana va media vuelta corrida */
  const trote = [
      {torso: 172, head: 178, armN: [317, 42], armF: [27, 112], legN: [22, 0], legF: [338, 238]},
      {torso: 172, head: 178, armN: [335, 66], armF: [10, 101], legN: [16, 346], legF: [48, 324]},
      {torso: 172, head: 178, armN: [10, 101], armF: [335, 66], legN: [353, 335], legF: [29, 349]},
      {torso: 172, head: 178, armN: [27, 112], armF: [317, 42], legN: [338, 238], legF: [22, 0]},
      {torso: 172, head: 178, armN: [10, 101], armF: [335, 66], legN: [48, 324], legF: [16, 346]},
      {torso: 172, head: 178, armN: [335, 66], armF: [10, 101], legN: [29, 349], legF: [353, 335]}
    ];
  const largo = [
      {torso: 170, head: 176, armN: [310, 35], armF: [30, 115], legN: [21, 3], legF: [336, 228]},
      {torso: 170, head: 176, armN: [330, 61], armF: [10, 101], legN: [16, 346], legF: [52, 326]},
      {torso: 170, head: 176, armN: [10, 101], armF: [330, 61], legN: [347, 337], legF: [31, 351]},
      {torso: 170, head: 176, armN: [30, 115], armF: [310, 35], legN: [336, 228], legF: [21, 3]},
      {torso: 170, head: 176, armN: [10, 101], armF: [330, 61], legN: [52, 326], legF: [16, 346]},
      {torso: 170, head: 176, armN: [330, 61], armF: [10, 101], legN: [31, 351], legF: [347, 337]}
    ];
  const fuerte = [
      {torso: 165, head: 171, armN: [287, 7], armF: [43, 123], legN: [21, 12], legF: [331, 203]},
      {torso: 165, head: 171, armN: [316, 42], armF: [14, 100], legN: [16, 346], legF: [72, 340]},
      {torso: 165, head: 171, armN: [14, 100], armF: [316, 42], legN: [344, 334], legF: [43, 3]},
      {torso: 165, head: 171, armN: [43, 123], armF: [287, 7], legN: [331, 203], legF: [21, 12]},
      {torso: 165, head: 171, armN: [14, 100], armF: [316, 42], legN: [72, 340], legF: [16, 346]},
      {torso: 165, head: 171, armN: [316, 42], armF: [14, 100], legN: [43, 3], legF: [344, 334]}
    ];
  /* caminar: siempre un pie en el piso; la mano cercana lleva el peso, la lejana bracea */
  const marchaM = [
      {torso: 180, head: 182, armN: [12, 16], armF: [18, 30], legN: [18, 8], legF: [351, 341]},
      {torso: 180, head: 182, armN: [12, 16], armF: [2, 10], legN: [9, 351], legF: [25, 345]},
      {torso: 180, head: 182, armN: [12, 16], armF: [345, 355], legN: [351, 341], legF: [18, 8]},
      {torso: 180, head: 182, armN: [12, 16], armF: [2, 10], legN: [25, 345], legF: [9, 351]}
    ];
  const marchaK = [
      {torso: 180, head: 182, armN: [4, 4], armF: [18, 30], legN: [18, 8], legF: [351, 341]},
      {torso: 180, head: 182, armN: [4, 4], armF: [2, 10], legN: [9, 351], legF: [25, 345]},
      {torso: 180, head: 182, armN: [4, 4], armF: [345, 355], legN: [351, 341], legF: [18, 8]},
      {torso: 180, head: 182, armN: [4, 4], armF: [2, 10], legN: [25, 345], legF: [9, 351]}
    ];
  /* bici: el tobillo da la vuelta alrededor del pedal, las manos en el manubrio */
  const bici = [
      {torso: 150, head: 122, armN: [26, 74], armF: [28, 76], legN: [71, 319], legF: [27, 352]},
      {torso: 150, head: 122, armN: [26, 74], armF: [28, 76], legN: [71, 343], legF: [31, 326]},
      {torso: 150, head: 122, armN: [26, 74], armF: [28, 76], legN: [47, 357], legF: [48, 307]},
      {torso: 150, head: 122, armN: [26, 74], armF: [28, 76], legN: [27, 352], legF: [71, 319]},
      {torso: 150, head: 122, armN: [26, 74], armF: [28, 76], legN: [31, 326], legF: [71, 343]},
      {torso: 150, head: 122, armN: [26, 74], armF: [28, 76], legN: [48, 307], legF: [47, 357]}
    ];
  /* soga: apoyo, despegue, aire y caída; una mano adelante y otra atrás para que la soga se lea como lazo */
  const soga = [
      {torso: 178, head: 180, armN: [20, 90], armF: [336, 16], legN: [14, 349], legF: [9, 351]},
      {torso: 178, head: 180, armN: [20, 98], armF: [336, 24], legN: [19, 344], legF: [15, 344]},
      {torso: 178, head: 180, armN: [20, 90], armF: [336, 16], legN: [30, 333], legF: [26, 333]},
      {torso: 178, head: 180, armN: [20, 98], armF: [336, 24], legN: [19, 344], legF: [15, 344]}
    ];
  const doble = [
      {torso: 178, head: 180, armN: [20, 90], armF: [336, 16], legN: [14, 349], legF: [9, 351]},
      {torso: 178, head: 180, armN: [20, 98], armF: [336, 24], legN: [19, 344], legF: [15, 344]},
      {torso: 178, head: 180, armN: [20, 90], armF: [336, 16], legN: [42, 321], legF: [38, 320]},
      {torso: 178, head: 180, armN: [20, 98], armF: [336, 24], legN: [19, 344], legF: [15, 344]}
    ];
  const cruce = [
      {torso: 178, head: 180, armN: [20, 90], armF: [336, 16], legN: [14, 349], legF: [9, 351]},
      {torso: 178, head: 180, armN: [50, 145], armF: [88, 92], legN: [19, 344], legF: [15, 344]},
      {torso: 178, head: 180, armN: [50, 145], armF: [88, 92], legN: [31, 332], legF: [28, 331]},
      {torso: 178, head: 180, armN: [20, 98], armF: [336, 24], legN: [19, 344], legF: [15, 344]}
    ];
  /* pesas */
  const parado = {...K.fig.PARADO, armF: [2, 4], legF: [2, 1]};
  /* swing: abajo bisagra con la pesa entre las piernas, arriba los brazos rectos */
  const swAbajo = {torso: 120, head: 108, armN: [354, 356], armF: [356, 358], legN: [28, 352], legF: [30, 354]};
  const swArriba = {torso: 182, head: 182, armN: [96, 96], armF: [98, 98], legN: [2, 0], legF: [3, 1]};
  const swCabeza = {torso: 182, head: 182, armN: [168, 170], armF: [170, 172], legN: [2, 0], legF: [3, 1]};
  const snatch = {torso: 182, head: 182, armN: [176, 178], armF: [6, 14], legN: [2, 0], legF: [3, 1]};
  const menton = {torso: 180, head: 180, armN: [70, 205], armF: [68, 203], legN: [0, 0], legF: [2, 1]};
  const pressAbajo = {torso: 180, head: 180, armN: [30, 178], armF: [28, 176], legN: [0, 0], legF: [2, 1]};
  const pressArriba = {torso: 180, head: 180, armN: [177, 180], armF: [175, 178], legN: [0, 0], legF: [2, 1]};
  /* sentadilla y bisagras */
  const sentado = {torso: 147, head: 160, armN: [0, 0], armF: [2, 2], legN: [95, 333], legF: [97, 335]};
  const inclinado = {torso: 120, head: 102, armN: [0, 0], armF: [2, 2], legN: [25, 355], legF: [27, 357]};
  const tirando = {torso: 120, head: 102, armN: [282, 0], armF: [284, 2], legN: [25, 355], legF: [27, 357]};
  const rumano = {torso: 100, head: 92, armN: [0, 0], armF: [2, 2], legN: [18, 0], legF: [20, 2]};
  /* remo a una mano: la mano lejana apoyada en el banco, la pierna cercana atrás */
  const rmBase = {torso: 100, head: 92, armN: [0, 0], armF: [339, 46], legN: [351, 318], legF: [41, 351]};
  const rmArriba = {torso: 100, head: 92, armN: [290, 10], armF: [339, 46], legN: [351, 318], legF: [41, 351]};
  /* poste: el cuerpo recto, de inclinado atrás a pegado al poste; las manos quedan en el poste */
  const posteAtras = {torso: 195, head: 183, armN: [63, 109], armF: [65, 111], legN: [15, 15], legF: [17, 16]};
  const postePegado = {torso: 185, head: 173, armN: [18, 135], armF: [20, 137], legN: [5, 5], legF: [7, 6]};
  Object.assign(K.POSES, {
    /* correr: la cadera a una altura fija, los pies tocan de a uno */
    "trote": {fijo: "hip", en: [150, 182], ciclo: true, k: trote, ritmo: [.8]},
    "10km": {fijo: "hip", en: [150, 182], ciclo: true, k: largo, ritmo: [.74]},
    "intervalos": {fijo: "hip", en: [150, 182], ciclo: true, k: fuerte, ritmo: [.58], muestra: 0},
    "bici": {con: "bici", fijo: "hip", en: [140, 160], ciclo: true, k: bici, ritmo: [1.1]},
    /* soga: la soga pasa por abajo en el apoyo */
    "soga": {con: "soga", fijo: "hip", en: [150, 181], ciclo: true, k: soga, ritmo: [.5]},
    "double-under": {con: "soga", soga: "doble", fijo: "hip", en: [150, 181], ciclo: true, k: doble, ritmo: [.7]},
    "criss-cross": {con: "soga", fijo: "hip", en: [150, 181], ciclo: true, k: cruce, ritmo: [1.1], muestra: 1},
    /* pesas */
    "swing-kettlebell": {con: "pesa", fijo: "fN", en: [150, T], k: [swAbajo, swArriba], ritmo: [.5, .2, .6, .2]},
    "swing-mancuerna": {con: "mancuerna", fijo: "fN", en: [150, T], k: [swAbajo, swCabeza], ritmo: [.6, .2, .7, .2]},
    "arranque-kettlebell": {con: "pesa", unaMano: true, fijo: "fN", en: [150, T], k: [snatchAbajo, snatchMedio, snatch], ritmo: [.7, .4, .8, .2]},
    "remo-al-menton": {con: "mancuernas", fijo: "fN", en: [150, T], k: [colgando, subiendo, menton], ritmo: [1, .3, 1.4, .4]},
    "press-hombros": {con: "mancuernas", fijo: "fN", en: [150, T], k: [pressAbajo, pressArriba], ritmo: [1, .3, 1.4, .4]},
    "sentadilla-mancuernas": {con: "mancuernas", fijo: "fN", en: [150, T], k: [parado, sentado], ritmo: [1.5, .3, 1.2, .5]},
    "remo-dos-mancuernas": {con: "mancuernas", fijo: "fN", en: [150, T], k: [inclinado, tirando], ritmo: [.9, .4, 1.3, .4]},
    "peso-muerto-rumano": {con: "mancuernas", fijo: "fN", en: [150, T], k: [parado, rumano], ritmo: [1.8, .3, 1.3, .5]},
    "remo-mancuerna": {con: "mancuerna", banco: [192, 227], fijo: "hip", en: [150, 190], k: [rmBase, rmArriba], ritmo: [.9, .4, 1.3, .4]},
    "remo-poste": {poste: 166, fijo: "fN", en: [150, T], k: [posteAtras, postePegado], ritmo: [1, .4, 1.4, .4]},
    /* caminar con peso de un lado */
    "paseo-maleta": {con: "mancuerna", fijo: "hip", en: [150, 180], ciclo: true, k: marchaM, ritmo: [1.2]},
    "paseo-maleta-kettlebell": {con: "pesa", unaMano: true, fijo: "hip", en: [150, 180], ciclo: true, k: marchaK, ritmo: [1.2]}
  
  });
})();
