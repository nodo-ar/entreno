/* ===== Poses · piernas y zona media: sentadillas, estocadas, nórdicos, planchas, hollow y dragon flag (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO, parado = {torso: 180, head: 180, armN: [92, 92], armF: [88, 88], legN: [0, 0], legF: [2, 2]};
  /* pies planos: gira el pie para que la suela quede en el piso aunque la tibia se incline */
  const nrm = a => ((a % 360) + 540) % 360 - 180, plano = P => ({...P, pies: [-nrm(P.legN[1]), -nrm(P.legF[1])]});
  /* gira toda la pose «d» grados: para hamacarse sin cambiar la forma */
  const girar = (P, d) => Object.fromEntries(Object.entries(P).map(([k, x]) => [k, Array.isArray(x) ? x.map(a => a + d) : x + d]));
  /* sentadilla: arriba con los brazos al costado; abajo con los brazos adelante para equilibrar */
  const abajo = plano({torso: 146, head: 156, armN: [96, 100], armF: [92, 96], legN: [84, 332], legF: [82, 330]});
  const paradoBrazos = {...parado, armN: [6, 10], armF: [2, 6], pies: [0, 0]};
  /* shrimp: la mano lejana sostiene el empeine del pie de atrás (en punta); la rodilla de atrás baja hasta rozar el piso */
  const shrimpArriba = {torso: 177, head: 178, armN: [96, 100], armF: [312, 1], legN: [0, 0], legF: [338, 184], pies: [0, -92]};
  const shrimpAbajo = {torso: 159, head: 166, armN: [98, 102], armF: [314, 320], legN: [84, 328], legF: [334, 184], pies: [32, -92]};
  /* nórdico: de rodillas con los pies trabados, cadera estirada */
  const rodillas = {torso: 180, head: 180, armN: [20, 120], armF: [16, 116], legN: [0, 270], legF: [2, 270], pies: [-90, -90]};
  /* pistol: la pierna lejana adelante, sin tocar el piso */
  const pistolArriba = {torso: 176, head: 178, armN: [94, 98], armF: [90, 94], legN: [0, 0], legF: [40, 38], pies: [0, 0]};
  /* estocada con salto: la cadera queda fija en la estocada (90 y 90) y «alto» levanta todo el cuerpo; en el aire las piernas se estiran y se cruzan */
  const estocadaN = {torso: 174, head: 177, armN: [338, 8], armF: [334, 4], legN: [86, 356], legF: [346, 256], pies: [4, 48]};
  const estocadaF = {...estocadaN, legN: [346, 256], legF: [86, 356], pies: [48, 4]};
  const aire = {torso: 180, head: 180, armN: [116, 126], armF: [112, 122], alto: 62};
  /* rodillas arriba: trote en el lugar, brazos opuestos a las piernas */
  const rodillaN = {torso: 178, head: 179, armN: [328, 52], armF: [42, 128], legN: [92, 4], legF: [1, 0], pies: [-16, 0]};
  const rodillaF = {...rodillaN, armN: [42, 128], armF: [328, 52], legN: [1, 0], legF: [92, 4], pies: [0, -16]};
  /* acostado boca arriba con la cabeza a la izquierda (la cabeza apenas levantada); hollow: lumbar al piso y todo apenas despegado */
  const hollow = {torso: 260, head: 248, armN: [252, 254], armF: [250, 252], legN: [100, 99], legF: [98, 97], pies: [-80, -80]};
  const espalda = {torso: 270, head: 264, armN: [86, 88], armF: [84, 86]};
  /* dragon flag: hombros en el banco, manos agarradas atrás de la cabeza, cuerpo recto */
  const dfArriba = {torso: 328, head: 284, armN: [247, 333], armF: [244, 330], legN: [148, 147], legF: [147, 146], pies: [-80, -80]};
  const dfAbajo = {torso: 282, head: 274, armN: [247, 333], armF: [244, 330], legN: [102, 101], legF: [101, 100], pies: [-80, -80]};
  /* una pose intermedia entre dos (para repartir un recorrido lento en un ciclo) */
  const entre = (A, B, t) => Object.fromEntries(Object.entries(A).map(([k, x]) => [k, Array.isArray(x) ? x.map((a, i) => a + (B[k][i] - a) * t) : x + (B[k] - x) * t]));
  /* en bolita: rodillas al pecho (cadera y rodilla a unos 100), los pies en punta */
  const bolita = P => ({...P, legN: [P.torso + 280, P.torso + 172], legF: [P.torso + 278, P.torso + 170], pies: [-40, -40]});
  /* plancha lateral: de perfil se lee como plancha sobre el antebrazo con la mano de arriba hacia el techo (hombro «avanzado») */
  const lateral = {torso: 98, head: 96, armN: [0, 90], armF: [204, 204], legN: [278, 278], legF: [279, 279]};
  /* plancha alta en las manos */
  const plancha = {torso: 108, head: 104, armN: [0, 0], armF: [2, 2], legN: [288, 288], legF: [289, 289]};
  Object.assign(K.POSES, {
    "sentadilla": {fijo: "fN", en: [150, T], k: [paradoBrazos, abajo], ritmo: [1.6, .3, 1.1, .4]},
    "shrimp": {fijo: "fN", en: [160, T], k: [shrimpArriba, shrimpAbajo], ritmo: [2, .3, 1.5, .4]},
    "nordico-negativa": {fijo: "kN", en: [120, K.fig.PISO - 6], muestra: .5, k: [rodillas,
      {torso: 112, head: 114, armN: [339, 66], armF: [335, 62], legN: [292, 270], legF: [290, 270], pies: [-90, -90]}], ritmo: [4.5, .4, 1, .8]},
    "nordico": {fijo: "kN", en: [120, K.fig.PISO - 6], muestra: .5, k: [rodillas,
      {torso: 128, head: 130, armN: [40, 100], armF: [36, 96], legN: [308, 270], legF: [306, 270], pies: [-90, -90]}], ritmo: [3, .3, 2, .6]},
    "pistol-silla": {fijo: "fN", en: [160, T], silla: [116, 232], k: [pistolArriba,
      plano({torso: 148, head: 156, armN: [96, 100], armF: [92, 96], legN: [86, 336], legF: [83, 81]})], ritmo: [2, .4, 1.5, .4]},
    "pistol": {fijo: "fN", en: [160, T], k: [pistolArriba,
      plano({torso: 152, head: 160, armN: [98, 102], armF: [94, 98], legN: [100, 316], legF: [90, 88]})], ritmo: [2, .3, 1.6, .4]},
    "sentadilla-profunda": {fijo: "fN", en: [150, T], k: [{...parado, armN: [26, 130], armF: [22, 126], pies: [0, 0]},
      plano({torso: 157, head: 166, armN: [12, 112], armF: [8, 108], legN: [105, 332], legF: [103, 330]})], ritmo: [1.8, 1, 1.2, .4]},
    /* cosaca: el pie de la pierna estirada no se mueve; la cadera baja en arco sobre la pierna que se dobla */
    "cosaca": {fijo: "fN", en: [150, T], k: [{torso: 176, head: 178, armN: [70, 104], armF: [66, 100], legN: [343, 336], legF: [24, 17], pies: [24, -17]},
      {torso: 167, head: 171, armN: [74, 108], armF: [70, 104], legN: [28, 316], legF: [40, 33], pies: [44, -13]},
      {torso: 158, head: 164, armN: [78, 110], armF: [74, 106], legN: [60, 316], legF: [56, 49], pies: [44, 1]},
      {torso: 150, head: 158, armN: [82, 112], armF: [78, 108], legN: [90, 324], legF: [70, 63], pies: [36, 17]}], ritmo: [1.8, .5, 1.5, .4]},
    "puente-gluteo": {fijo: "sh", en: [104, 257], k: [plano({...espalda, legN: [143, 11], legF: [141, 11]}),
      plano({...espalda, torso: 282, head: 268, legN: [123, 359], legF: [121, 359]}),
      plano({...espalda, torso: 294, head: 271, legN: [106, 357], legF: [105, 358]})], ritmo: [1, 1.5, 1.5, .4]},
    /* búlgara: el empeine de atrás queda quieto sobre el banco; la cadera baja casi recta */
    "sentadilla-bulgara": {fijo: "fN", en: [180, T], banco: [76, 224], k: [{torso: 178, head: 180, armN: [8, 12], armF: [4, 8], legN: [27, 15], legF: [353, 265], pies: [-15, -73]},
      {torso: 172, head: 175, armN: [6, 10], armF: [2, 6], legN: [65, 352], legF: [349, 237], pies: [8, -45]},
      {torso: 166, head: 170, armN: [4, 8], armF: [0, 4], legN: [91, 352], legF: [331, 207], pies: [8, -15]}], ritmo: [2, .3, 1.3, .4]},
    /* peso muerto a una pierna: bisagra de cadera, la cadera va atrás, rodilla de apoyo apenas flexionada y la otra pierna en línea con el tronco */
    "peso-muerto-una-pierna": {fijo: "fF", en: [150, T], con: "mancuerna", k: [{torso: 180, head: 180, armN: [2, 4], armF: [358, 2], legN: [2, 2], legF: [2, 358], pies: [0, 2]},
      {torso: 136, head: 142, armN: [2, 4], armF: [358, 2], legN: [316, 314], legF: [10, 356], pies: [-20, 4]},
      {torso: 94, head: 100, armN: [0, 2], armF: [356, 0], legN: [276, 272], legF: [14, 356], pies: [-10, 4]}], ritmo: [2, .3, 1.5, .4]},
    /* curl deslizante: primero sube la cola y después los talones vienen arrastrando el trapo por el piso */
    "curl-femoral-deslizante": {fijo: "sh", en: [104, 257], toalla: true, k: [{...espalda, legN: [87, 85], legF: [86, 84], pies: [5, 6]},
      {...espalda, torso: 284, head: 266, legN: [105, 43], legF: [103, 45], pies: [32, 30]},
      {...espalda, torso: 291, head: 269, legN: [108, 20], legF: [107, 21], pies: [40, 39]},
      {...espalda, torso: 294, head: 271, legN: [108, 357], legF: [106, 358], pies: [48, 47]}], ritmo: [1.4, .4, 2, .4]},
    /* zancada: los dos pies quietos (el de atrás en punta); la cadera baja casi recta hasta 90 y 90 */
    "zancada": {fijo: "fN", en: [190, T], k: [{torso: 180, head: 180, armN: [6, 10], armF: [2, 6], legN: [43, 27], legF: [356, 289], pies: [-27, 15]},
      {torso: 179, head: 180, armN: [5, 9], armF: [1, 5], legN: [69, 5], legF: [353, 272], pies: [-5, 32]},
      {torso: 178, head: 180, armN: [4, 8], armF: [0, 4], legN: [86, 356], legF: [346, 256], pies: [4, 48]}], ritmo: [1.6, .3, 1.2, .4]},
    "estocada-salto": {fijo: "hip", en: [150, 219], ciclo: true, k: [estocadaN,
      {...aire, alto: 29, armN: [60, 80], armF: [56, 76], legN: [47, 13], legF: [342, 304], pies: [-30, 16]},
      {...aire, legN: [345, 320], legF: [30, 10], pies: [-30, -20]}, estocadaF,
      {...aire, alto: 29, armN: [60, 80], armF: [56, 76], legN: [342, 304], legF: [47, 13], pies: [16, -30]},
      {...aire, legN: [30, 10], legF: [345, 320], pies: [-20, -30]}], ritmo: [2.2], muestra: 0},
    /* sentadilla con salto: en el aire estirado y en punta; cae suave flexionando, carga con los brazos atrás e impulsa con los brazos arriba */
    "sentadilla-salto": {fijo: "fN", en: [150, T], ciclo: true, k: [{torso: 182, head: 182, armN: [168, 172], armF: [164, 168], legN: [0, 0], legF: [2, 2], alto: 28, pies: [-50, -50]},
      plano({torso: 168, head: 172, armN: [80, 86], armF: [76, 82], legN: [30, 350], legF: [28, 348]}),
      plano({torso: 148, head: 158, armN: [326, 334], armF: [322, 330], legN: [74, 340], legF: [72, 338]}),
      {torso: 178, head: 180, armN: [140, 148], armF: [136, 144], legN: [4, 2], legF: [6, 4], alto: 8, pies: [-48, -48]}], ritmo: [1.8], muestra: 0},
    /* saltos de tijera: de perfil la apertura de piernas casi no se ve; se lee por los brazos que suben y bajan y el saltito en punta */
    "saltos-tijera": {fijo: "hip", en: [150, 180], ciclo: true, k: [{...parado, armN: [166, 170], armF: [162, 166], legN: [10, 4], legF: [354, 350], pies: [-4, 10]},
      {...parado, armN: [92, 96], armF: [88, 92], legN: [6, 4], legF: [356, 354], alto: 14, pies: [-46, -46]}, {...parado, armN: [4, 8], armF: [0, 4], legN: [2, 0], legF: [0, 358], pies: [0, 2]},
      {...parado, armN: [92, 96], armF: [88, 92], legN: [6, 4], legF: [356, 354], alto: 14, pies: [-46, -46]}], ritmo: [1.2], muestra: 0},
    "rodillas-arriba": {fijo: "hip", en: [150, 179], ciclo: true, k: [rodillaN,
      {...rodillaN, armN: [2, 88], armF: [358, 84], legN: [22, 352], legF: [6, 354], pies: [-6, 4]}, rodillaF,
      {...rodillaN, armN: [2, 88], armF: [358, 84], legN: [6, 354], legF: [22, 352], pies: [4, -6]}], ritmo: [1], muestra: 0},
    /* elevación de rodillas en paralelas: brazos estirados, tronco quieto; las rodillas pasan apenas la altura de la cadera */
    "rodillas-paralelas": {con: "paralelas", fijo: "hN", en: [150, 150], k: [{torso: 180, head: 180, armN: [0, 0], armF: [358, 358], legN: [3, 1], legF: [5, 3], pies: [-20, -20]},
      {torso: 183, head: 181, armN: [0, 0], armF: [358, 358], legN: [104, 10], legF: [102, 8], pies: [-14, -14]}], ritmo: [1, 1, 1.4, .4]},
    "hollow": {fijo: "hip", en: [150, 259], k: [hollow, {...hollow, torso: 261, head: 250, armN: [253, 255], armF: [251, 253]}], ritmo: [2, .4, 2, .4]},
    /* hollow rock: la misma forma rígida, se hamaca de la espalda alta a la cola sin que los pies toquen */
    "hollow-rock": {fijo: "hip", en: [150, 257], k: [girar(hollow, 10), girar(hollow, -7)], ritmo: [.6, .1, .6, .1]},
    "crunch-inverso": {fijo: "sh", en: [110, 257], k: [{...espalda, legN: [180, 90], legF: [178, 88], pies: [-50, -50]},
      {...espalda, torso: 290, head: 272, legN: [225, 115], legF: [223, 113], pies: [-50, -50]}], ritmo: [1, .3, 1.6, .3]},
    "dragon-flag-bolita": {fijo: "sh", en: [85, 220], banco: [70, 234], k: [bolita(dfArriba), bolita(dfAbajo)], ritmo: [3, .3, 1.6, .4]},
    "dragon-flag-una-pierna": {fijo: "sh", en: [85, 220], banco: [70, 234], k: [{...dfArriba, legF: bolita(dfArriba).legF}, {...dfAbajo, legF: bolita(dfAbajo).legF}], ritmo: [3, .3, 1.4, .4]},
    "dragon-flag": {fijo: "sh", en: [85, 220], banco: [70, 234], k: [dfArriba, dfAbajo], ritmo: [3, .3, 1.6, .4]},
    /* negativa: baja recto en 5 s y vuelve arriba encogiendo las rodillas (más fácil) */
    "dragon-flag-negativa": {fijo: "sh", en: [85, 220], banco: [70, 234], ciclo: true, k: [dfArriba, entre(dfArriba, dfAbajo, .25), entre(dfArriba, dfAbajo, .5), entre(dfArriba, dfAbajo, .75), dfAbajo,
      bolita(entre(dfArriba, dfAbajo, .5))], ritmo: [7.5], muestra: 2},
    "plancha-lateral": {rango: "avanzado", fijo: "eN", en: [150, T], k: [lateral, {...lateral, torso: 99, head: 98, armF: [205, 205]}], ritmo: [2, .4, 2, .4]},
    "plancha-lateral-pierna": {rango: "avanzado", fijo: "eN", en: [150, T], k: [lateral, {...lateral, legF: [256, 256]}], ritmo: [.8, 2.5, .8, .6]},
    "plancha-dos-apoyos": {fijo: "hN", en: [190, 264], k: [plancha, {...plancha, armF: [102, 102], legN: [275, 275]}], ritmo: [.8, 3, .8, .6]},
    "superman": {fijo: "hip", en: [150, 259], k: [{torso: 92, head: 92, armN: [92, 92], armF: [90, 90], legN: [270, 270], legF: [271, 271], pies: [-90, -90]},
      {torso: 100, head: 103, armN: [104, 104], armF: [102, 102], legN: [262, 262], legF: [263, 263], pies: [-90, -90]}], ritmo: [1, 2, 1, .6]}
  });
})();
