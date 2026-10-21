/* ===== Poses · barra: colgarse, dominadas, front lever, muscle-up, bandera y elevaciones (ver piezas/figura.js) ===== */
(() => {
  const B = {con: "barra", fijo: "hN", en: [150, 50]};
  /* colgado: brazos rectos, piernas juntas apenas adelante */
  const colgado = {torso: 180, head: 180, armN: [180, 180], armF: [176, 178], legN: [4, 352], legF: [8, 356]};
  /* colgado pasivo: todo suelto, la cabeza cae entre los hombros */
  const pasivo = {...colgado, torso: 178, head: 170, armN: [180, 180], armF: [177, 179], legN: [6, 354], legF: [10, 358]};
  /* colgado activo: hombros abajo, pecho afuera, la cabeza atrás y las piernas apenas atrás */
  const activo = {torso: 192, head: 198, armN: [178, 178], armF: [175, 177], legN: [0, 350], legF: [4, 354]};
  /* arriba de la dominada: pecho a la barra, mentón por encima */
  const arriba = {torso: 178, head: 176, armN: [40, 175], armF: [37, 173], legN: [12, 350], legF: [16, 354]};
  const pecho = {torso: 168, head: 172, armN: [28, 176], armF: [26, 174], legN: [18, 346], legF: [22, 350]};
  /* supina: codos adelante, cuerpo derecho y pegado a la barra */
  const supina = {...arriba, torso: 174, head: 172, armN: [28, 178], armF: [27, 176]};
  /* ancha: el cuerpo se va atrás y saca pecho; los codos abiertos se ven cortos */
  const ancha = {...arriba, torso: 194, head: 186, armN: [56, 166], armF: [52, 164], legN: [22, 356], legF: [26, 0]};
  /* a un brazo: el otro suelto al costado */
  const unoCol = {...colgado, armF: [6, 12]}, unoArr = {...arriba, armF: [8, 30]};
  /* muscle-up: apoyado arriba de la barra, brazos estirados, la barra a la altura de la cadera */
  const apoyo = {torso: 172, head: 170, armN: [12, 12], armF: [10, 10], legN: [2, 356], legF: [6, 0]};
  /* la vuelta: hombros por encima de la barra, codos atrás y arriba, cuerpo inclinado adelante */
  const vuelta = {torso: 142, head: 150, armN: [264, 24], armF: [264, 24], legN: [20, 4], legF: [24, 8]};
  /* el tirón con impulso: la cadera va hacia la barra y las piernas adelante */
  const pechoKip = {...pecho, legN: [40, 12], legF: [44, 16]};
  /* el balanceo: cuerpo atrás, piernas atrás, para tomar impulso */
  const hamaca = {torso: 196, head: 192, armN: [186, 186], armF: [182, 184], legN: [350, 352], legF: [354, 356]};
  /* front lever: horizontal boca arriba, brazos rectos a la barra */
  const lever = {torso: 270, head: 268, armN: [160, 160], armF: [158, 158], legN: [90, 90], legF: [92, 92]};
  const bolita = {...lever, torso: 250, head: 228, legN: [199, 56], legF: [200, 58]};
  const tuck = {...lever, legN: [218, 74], legF: [220, 76]};
  const tuckAv = {...lever, legN: [180, 58], legF: [182, 60]};
  /* remo desde el tuck: codos atrás y la barra al ombligo, el cuerpo sigue horizontal */
  const tuckRemo = {...tuck, armN: [70, 170], armF: [68, 168]};
  /* bandera: cuerpo horizontal, brazo de arriba tira y el de abajo empuja contra el poste */
  const bandera = {torso: 270, head: 270, armN: [288, 288], armF: [252, 252], legN: [90, 90], legF: [90, 90]};
  const P = {fijo: "hN", en: [100, 158], poste: 100, rango: "avanzado"};
  /* remo invertido: talones en el piso, cuerpo recto */
  const remoAbajo = {torso: 249, head: 247, armN: [131, 131], armF: [129, 129], legN: [69, 69], legF: [71, 71]};
  const remoArriba = {torso: 235, head: 252, armN: [50, 170], armF: [48, 168], legN: [55, 55], legF: [57, 57]};
  /* elevaciones colgado */
  const rodillas = {...colgado, torso: 174, head: 176, armN: [176, 176], armF: [173, 175], legN: [96, 6], legF: [100, 10]};
  const piernas = {...colgado, torso: 176, head: 178, legN: [92, 92], legF: [95, 95]};
  const pies = {...colgado, torso: 215, head: 205, armN: [150, 150], armF: [148, 148], legN: [182, 182], legF: [184, 184]};

  Object.assign(K.POSES, {
    /* dominadas */
    "dominada-negativa": {...B, estela: "hd", k: [arriba, colgado], ritmo: [.6, .4, 4.5, .8], muestra: 0},
    "dominada": {...B, estela: "hd", k: [colgado, arriba], ritmo: [1, .4, 1.4, .5]},
    "dominada-explosiva": {...B, estela: "hd", k: [colgado, pecho], ritmo: [.5, .3, 1.4, .6]},
    "dominada-arquera": {...B, estela: "hd", k: [colgado, {...arriba, armF: [94, 94]}], ritmo: [1.2, .4, 1.6, .5]},
    "dominada-lastre": {...B, lastre: true, estela: "hd", k: [colgado, arriba], ritmo: [1.2, .5, 1.6, .6]},
    "dominada-supina": {...B, estela: "hd", k: [colgado, supina], ritmo: [1, .4, 1.4, .5]},
    "dominada-ancha": {...B, estela: "hd", k: [{...colgado, torso: 184}, ancha], ritmo: [1.1, .4, 1.5, .5]},
    "dominada-un-brazo-negativa": {...B, estela: "hd", k: [unoArr, unoCol], ritmo: [.6, .4, 5, .8], muestra: 0},
    "dominada-un-brazo": {...B, estela: "hd", k: [unoCol, unoArr], ritmo: [1.4, .5, 1.8, .6]},
    /* colgarse */
    "colgado-activo": {...B, k: [activo, activo]},
    "colgado-un-brazo": {...B, k: [unoCol, unoCol]},
    "retraccion-escapular": {...B, estela: "hd", k: [pasivo, activo], ritmo: [1.5, 1.2, 1.5, .8]},
    /* muscle-up */
    "muscle-up-negativa": {...B, estela: "sh", k: [apoyo, vuelta, pecho], ritmo: [.6, .5, 4, .8], muestra: 0},
    "muscle-up-impulso": {...B, estela: "sh", k: [hamaca, pechoKip, vuelta, apoyo], ritmo: [1.2, .6, 1.8, .6]},
    "muscle-up": {...B, estela: "sh", k: [colgado, pecho, vuelta, apoyo], ritmo: [1.6, .6, 2, .6]},
    /* front lever y sus pasos: sostenidos */
    "fl-bolita": {...B, k: [bolita, bolita]},
    "fl-tuck": {...B, k: [tuck, tuck]},
    "fl-tuck-avanzado": {...B, k: [tuckAv, tuckAv]},
    "fl-una-pierna": {...B, k: [{...lever, legF: [220, 76]}, {...lever, legF: [220, 76]}]},
    "fl-straddle": {...B, k: [{...lever, legN: [100, 100], legF: [80, 80]}, {...lever, legN: [100, 100], legF: [80, 80]}]},
    "front-lever": {...B, k: [lever, lever]},
    "remo-fl-tuck": {...B, barraAtras: true, estela: "sh", k: [tuck, tuckRemo], ritmo: [1, .5, 1.4, .5]},
    /* bandera humana en el poste */
    "bandera-rodillas": {...P, k: [{...bandera, legN: [200, 90], legF: [202, 92]}, {...bandera, legN: [200, 90], legF: [202, 92]}]},
    "bandera-abierta": {...P, k: [{...bandera, legN: [104, 104], legF: [76, 76]}, {...bandera, legN: [104, 104], legF: [76, 76]}]},
    "bandera": {...P, k: [bandera, bandera]},
    /* remo invertido en la barra baja */
    "remo-invertido": {con: "barra-baja", fijo: "hN", en: [170, 175], barraAtras: true, estela: "sh", k: [remoAbajo, remoArriba], ritmo: [1, .5, 1.4, .5]},
    /* elevaciones colgado */
    "rodillas-colgado": {...B, estela: "kN", k: [colgado, rodillas], ritmo: [1, .4, 1.4, .5]},
    "piernas-colgado": {...B, estela: "fN", k: [colgado, piernas], ritmo: [1.2, .4, 1.6, .5]},
    "pies-a-la-barra": {...B, rango: "avanzado", estela: "fN", k: [{...colgado, legN: [6, 6], legF: [9, 9]}, pies], ritmo: [1.2, .3, 1.6, .5]}
  });
})();
