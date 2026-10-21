/* ===== Poses · piernas y zona media: sentadillas, estocadas, nórdicos, planchas, hollow y dragon flag (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO, parado = {torso: 180, head: 180, armN: [92, 92], armF: [88, 88], legN: [0, 0], legF: [2, 2]};
  /* gira toda la pose «d» grados: para hamacarse sin cambiar la forma */
  const girar = (P, d) => Object.fromEntries(Object.entries(P).map(([k, x]) => [k, Array.isArray(x) ? x.map(a => a + d) : x + d]));
  /* sentadilla: arriba, abajo y el salto con los brazos arriba */
  const abajo = {torso: 148, head: 156, armN: [96, 92], armF: [92, 88], legN: [84, 334], legF: [82, 332]};
  /* shrimp: la mano lejana sostiene el pie de atrás */
  const shrimpArriba = {torso: 180, head: 180, armN: [96, 96], armF: [338, 342], legN: [0, 0], legF: [335, 180]};
  /* nórdico: de rodillas con los pies trabados, cadera estirada */
  const rodillas = {torso: 180, head: 180, armN: [20, 120], armF: [16, 116], legN: [0, 270], legF: [2, 270], pies: [-90, -90]};
  /* pistol: la pierna lejana adelante, sin tocar el piso */
  const pistolArriba = {torso: 174, head: 176, armN: [94, 94], armF: [90, 90], legN: [0, 0], legF: [62, 62]};
  /* estocada con salto: la cadera queda fija en la estocada y «alto» levanta todo el cuerpo en el aire */
  const estocadaN = {torso: 178, head: 180, armN: [20, 110], armF: [340, 70], legN: [66, 6], legF: [353, 270], pies: [0, 30]};
  const aire = {torso: 180, head: 180, armN: [0, 90], armF: [0, 90], alto: 24, pies: [-40, -40]};
  const estocadaF = {...estocadaN, armN: [340, 70], armF: [20, 110], legN: [353, 270], legF: [66, 6], pies: [30, 0]};
  /* rodillas arriba: trote en el lugar, brazos opuestos a las piernas */
  const rodillaN = {torso: 182, head: 182, armN: [330, 60], armF: [40, 130], legN: [92, 2], legF: [0, 0]};
  const rodillaF = {...rodillaN, armN: [40, 130], armF: [330, 60], legN: [0, 0], legF: [92, 2]};
  /* acostado boca arriba con la cabeza a la izquierda (la cabeza apenas levantada); hollow: lumbar al piso y todo apenas despegado */
  const hollow = {torso: 260, head: 248, armN: [252, 254], armF: [250, 252], legN: [100, 100], legF: [98, 98]};
  const espalda = {torso: 270, head: 264, armN: [86, 88], armF: [84, 86]};
  /* dragon flag: hombros en el banco, manos agarradas atrás de la cabeza, cuerpo recto */
  const dfArriba = {torso: 330, head: 292, armN: [247, 331], armF: [245, 329], legN: [150, 150], legF: [148, 148]};
  const dfAbajo = {torso: 285, head: 270, armN: [247, 331], armF: [245, 329], legN: [105, 105], legF: [103, 103]};
  /* en bolita: rodillas al pecho */
  const bolita = P => ({...P, legN: [P.torso + 300, P.torso + 170], legF: [P.torso + 298, P.torso + 168]});
  /* plancha lateral: de perfil se lee como plancha sobre el antebrazo con la mano de arriba hacia el techo (hombro «avanzado») */
  const lateral = {torso: 98, head: 96, armN: [0, 90], armF: [204, 204], legN: [278, 278], legF: [279, 279]};
  /* plancha alta en las manos */
  const plancha = {torso: 108, head: 104, armN: [0, 0], armF: [2, 2], legN: [288, 288], legF: [289, 289]};
  Object.assign(K.POSES, {
    "sentadilla": {fijo: "fN", en: [150, T], k: [parado, abajo], ritmo: [1, .3, 1.4, .3]},
    "shrimp": {fijo: "fN", en: [160, T], k: [shrimpArriba,
      {torso: 176, head: 178, armN: [100, 96], armF: [332, 342], legN: [82, 327], legF: [330, 175]}], ritmo: [1.4, .3, 1.6, .3]},
    "nordico-negativa": {fijo: "kN", en: [120, K.fig.PISO - 6], muestra: .5, k: [rodillas,
      {torso: 112, head: 114, armN: [339, 66], armF: [335, 62], legN: [292, 270], legF: [290, 270], pies: [-90, -90]}], ritmo: [.8, .2, 4.5, .8]},
    "nordico": {fijo: "kN", en: [120, K.fig.PISO - 6], muestra: .5, k: [rodillas,
      {torso: 128, head: 130, armN: [40, 100], armF: [36, 96], legN: [308, 270], legF: [306, 270], pies: [-90, -90]}], ritmo: [2.5, .2, 2, .6]},
    "pistol-silla": {fijo: "fN", en: [160, T], silla: [120, 228], k: [pistolArriba,
      {torso: 155, head: 160, armN: [96, 96], armF: [92, 92], legN: [83, 345], legF: [80, 80]}], ritmo: [1.6, .3, 1.4, .3]},
    "pistol": {fijo: "fN", en: [160, T], k: [pistolArriba,
      {torso: 152, head: 158, armN: [98, 98], armF: [94, 94], legN: [100, 333], legF: [85, 85]}], ritmo: [1.8, .3, 1.6, .3]},
    "sentadilla-profunda": {fijo: "fN", en: [150, T], k: [{...parado, armN: [40, 150], armF: [36, 146]},
      {torso: 157, head: 166, armN: [40, 150], armF: [36, 146], legN: [105, 332], legF: [103, 330]}], ritmo: [1.4, .8, 1.2, .3]},
    "cosaca": {fijo: "fN", en: [150, T], k: [{torso: 176, head: 178, armN: [60, 120], armF: [56, 116], legN: [337, 337], legF: [21, 21]},
      {torso: 150, head: 158, armN: [70, 130], armF: [66, 126], legN: [94, 326], legF: [74, 67]}], ritmo: [1.4, .4, 1.4, .3]},
    "puente-gluteo": {fijo: "sh", en: [104, 257], k: [{...espalda, legN: [140, 18], legF: [139, 18]},
      {...espalda, torso: 295, head: 272, legN: [105, 5], legF: [104, 5]}], ritmo: [.8, 1, 1.2, .4]},
    "sentadilla-bulgara": {fijo: "fN", en: [180, T], banco: [80, 214], k: [{torso: 178, head: 180, armN: [10, 10], armF: [6, 6], legN: [37, 5], legF: [350, 250], pies: [0, -70]},
      {torso: 168, head: 172, armN: [10, 10], armF: [6, 6], legN: [87, 356], legF: [325, 196], pies: [0, -16]}], ritmo: [1.4, .3, 1.2, .3]},
    "peso-muerto-una-pierna": {fijo: "fF", en: [150, T], con: "mancuerna", k: [{torso: 180, head: 180, armN: [2, 2], armF: [358, 358], legN: [2, 2], legF: [0, 0]},
      {torso: 95, head: 100, armN: [0, 0], armF: [356, 356], legN: [272, 272], legF: [8, 352]}], ritmo: [1.6, .3, 1.4, .4]},
    "curl-femoral-deslizante": {fijo: "sh", en: [104, 257], toalla: true, k: [{...espalda, torso: 288, head: 270, legN: [87, 65], legF: [88, 66]},
      {...espalda, torso: 295, head: 272, legN: [109, 4], legF: [108, 4]}], ritmo: [1.4, .3, 1.6, .3]},
    "zancada": {fijo: "fN", en: [190, T], k: [{torso: 180, head: 180, armN: [6, 6], armF: [2, 2], legN: [43, 15], legF: [340, 296]},
      {torso: 180, head: 180, armN: [6, 6], armF: [2, 2], legN: [79, 7], legF: [354, 261], pies: [0, 39]}], ritmo: [1, .3, 1.2, .3]},
    "estocada-salto": {fijo: "hip", en: [150, 205], ciclo: true, k: [estocadaN,
      {...aire, legN: [70, 300], legF: [340, 250]}, {...aire, legN: [350, 262], legF: [60, 300]}, estocadaF,
      {...aire, legN: [340, 250], legF: [70, 300]}, {...aire, legN: [60, 300], legF: [350, 262]}], ritmo: [2.2], muestra: 0},
    "sentadilla-salto": {fijo: "fN", en: [150, T], ciclo: true, k: [{torso: 182, head: 182, armN: [172, 172], armF: [168, 168], legN: [0, 0], legF: [2, 2], alto: 36, pies: [-60, -60]},
      {torso: 160, head: 166, armN: [80, 80], armF: [76, 76], legN: [50, 350], legF: [48, 348]}, abajo,
      {torso: 180, head: 180, armN: [150, 150], armF: [146, 146], legN: [0, 0], legF: [2, 2], alto: 10, pies: [-50, -50]}], ritmo: [2], muestra: 0},
    "saltos-tijera": {fijo: "hip", en: [150, 179], ciclo: true, k: [{...parado, armN: [174, 174], armF: [170, 170], legN: [14, 14], legF: [346, 346]},
      {...parado, armN: [90, 90], armF: [86, 86], legN: [8, 8], legF: [352, 352], alto: 18, pies: [-50, -50]}, {...parado, armN: [4, 4], armF: [0, 0]},
      {...parado, armN: [90, 90], armF: [86, 86], legN: [8, 8], legF: [352, 352], alto: 18, pies: [-50, -50]}], ritmo: [1.2], muestra: 0},
    "rodillas-arriba": {fijo: "hip", en: [150, 179], ciclo: true, k: [rodillaN,
      {...rodillaN, armN: [0, 90], armF: [0, 90], legN: [20, 340], legF: [10, 340]}, rodillaF,
      {...rodillaN, armN: [0, 90], armF: [0, 90], legN: [10, 340], legF: [20, 340]}], ritmo: [1], muestra: 0},
    "rodillas-paralelas": {con: "paralelas", fijo: "hN", en: [150, 172], k: [{torso: 180, head: 180, armN: [0, 0], armF: [358, 358], legN: [2, 2], legF: [4, 4]},
      {torso: 184, head: 182, armN: [0, 0], armF: [358, 358], legN: [92, 2], legF: [90, 0]}], ritmo: [1, 1, 1.4, .4]},
    "hollow": {fijo: "hip", en: [150, 259], k: [hollow, hollow]},
    "hollow-rock": {fijo: "hip", en: [150, 257], k: [girar(hollow, 12), girar(hollow, -10)], ritmo: [.6, .1, .6, .1]},
    "crunch-inverso": {fijo: "sh", en: [110, 257], k: [{...espalda, legN: [180, 90], legF: [178, 88]},
      {...espalda, torso: 290, head: 272, legN: [225, 115], legF: [223, 113]}], ritmo: [1, .3, 1.4, .3]},
    "dragon-flag-bolita": {fijo: "sh", en: [85, 216], banco: [70, 234], k: [bolita(dfArriba), bolita(dfAbajo)], ritmo: [3, .3, 1.4, .4], muestra: 0},
    "dragon-flag-una-pierna": {fijo: "sh", en: [85, 216], banco: [70, 234], k: [{...dfArriba, legF: bolita(dfArriba).legF}, {...dfAbajo, legF: bolita(dfAbajo).legF}], ritmo: [3, .3, 1.4, .4]},
    "dragon-flag": {fijo: "sh", en: [85, 216], banco: [70, 234], k: [dfArriba, dfAbajo], ritmo: [3, .3, 1.6, .4]},
    "dragon-flag-negativa": {fijo: "sh", en: [85, 216], banco: [70, 234], k: [dfArriba, dfAbajo], ritmo: [5, .4, 1.2, .6], muestra: 0},
    "plancha-lateral": {rango: "avanzado", fijo: "eN", en: [150, T], k: [lateral, lateral]},
    "plancha-lateral-pierna": {rango: "avanzado", fijo: "eN", en: [150, T], k: [lateral, {...lateral, legF: [256, 256]}], ritmo: [.8, 2.5, .8, .6]},
    "plancha-dos-apoyos": {fijo: "hN", en: [190, 264], k: [plancha, {...plancha, armF: [102, 102], legN: [275, 275]}], ritmo: [.8, 3, .8, .6]},
    "superman": {fijo: "hip", en: [150, 259], k: [{torso: 92, head: 92, armN: [92, 92], armF: [90, 90], legN: [270, 270], legF: [271, 271]},
      {torso: 100, head: 104, armN: [104, 104], armF: [102, 102], legN: [260, 260], legF: [261, 261]}], ritmo: [1, 2, 1, .6]}
  });
})();
