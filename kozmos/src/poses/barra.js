/* ===== Poses · barra: colgarse, dominadas, front lever, muscle-up y elevaciones (ver piezas/figura.js; la bandera y las dominadas de frente viven en vistas.js) ===== */
(() => {
  const B = {con: "barra", fijo: "hN", en: [150, 42]};
  /* el sostenido respira: el pecho apenas sube y la cabeza acompaña */
  const respira = (p, d = 1) => ({...p, torso: p.torso + d, head: p.head + d, armN: p.armN.map(a => a + d * .5), armF: p.armF.map(a => a + d * .5)});
  const RESP = [2, .4, 2, .4];

  /* colgado: brazos rectos, cuerpo bajo las manos, rodillas apenas flojas y los pies sueltos: se lee en el aire */
  const colgado = {torso: 181, head: 176, armN: [180, 180], armF: [177, 178], legN: [5, 351], legF: [8, 356], pies: [-40, -36]};
  /* pasivo: hombros en las orejas, la cabeza cae adelante y el cuerpo baja un poco */
  const pasivo = {...colgado, torso: 179, head: 162, alto: -3};
  /* activo: hombros abajo, pecho afuera, la cara asoma delante de los brazos, piernas juntas apenas adelante */
  const activo = {torso: 188, head: 171, armN: [190, 190], armF: [184, 185], legN: [14, 8], legF: [17, 11], pies: [-52, -48]};

  /* dominada: a mitad de camino los codos bajan por delante y el hombro sube casi derecho */
  const medio = {torso: 187, head: 183, armN: [101, 214], armF: [99, 211], legN: [12, 0], legF: [15, 4], pies: [-36, -32]};
  /* arriba: mentón sobre la barra, pecho cerca, el cuerpo apenas atrás y las piernas apenas adelante */
  const arriba = {torso: 194, head: 188, armN: [33, 181], armF: [31, 178], legN: [20, 6], legF: [23, 10], pies: [-34, -30]};
  /* asistida: las rodillas dobladas, los pies atrás como si uno apoyara en una silla */
  const asisAbajo = {...colgado, legN: [20, 280], legF: [24, 286], pies: [-30, -26]};
  const asisMedio = {...medio, legN: [26, 284], legF: [30, 290], pies: [-30, -26]};
  const asisArriba = {...arriba, legN: [32, 290], legF: [36, 296], pies: [-30, -26]};
  /* explosiva: el pecho llega a la barra, los hombros por encima y los codos bien abajo */
  const pecho = {torso: 200, head: 192, armN: [4, 144], armF: [2, 141], legN: [26, 12], legF: [29, 16], pies: [-34, -30]};
  /* supina: palmas hacia uno, codos adelante, el cuerpo más derecho */
  const supMedio = {...medio, torso: 184, head: 181, armN: [112, 226], armF: [110, 223]};
  const supina = {torso: 184, head: 180, armN: [57, 207], armF: [55, 204], legN: [10, 358], legF: [13, 2], pies: [-36, -32]};
  /* a un brazo: tira el brazo lejano y el cercano cuelga suelto al costado, bien a la vista (la mano fija es la lejana) */
  const U = {...B, fijo: "hF"};
  const unoCol = {...colgado, torso: 182, head: 180, armF: [180, 180], armN: [6, 18]};
  const unoMedio = {...supMedio, armF: [112, 226], armN: [10, 26]}, unoArr = {...supina, armF: [57, 207], armN: [14, 34]};

  /* muscle-up: tirón alto (la barra al pecho bajo), la vuelta por encima y el fondo arriba */
  const tiron = {torso: 200, head: 194, armN: [359, 131], armF: [357, 128], legN: [25, 14], legF: [28, 18], pies: [-40, -36]};
  /* la vuelta: hombros por encima de la barra, codos altos atrás, el cuerpo inclinado adelante */
  const vuelta = {torso: 145, head: 140, armN: [265, 26], armF: [263, 24], legN: [20, 8], legF: [24, 12], pies: [-40, -36]};
  /* arriba de la barra: brazos rectos, la barra a la altura de la cadera, el cuerpo apenas adelante */
  const apoyo = {torso: 170, head: 168, armN: [355, 355], armF: [353, 353], legN: [6, 0], legF: [10, 4], pies: [-44, -40]};
  /* con impulso: el balanceo atrás (arco, piernas atrás) y el tirón con la cadera a la barra (cuerpo hacia atrás, piernas adelante) */
  const hamaca = {torso: 172, head: 170, armN: [188, 188], armF: [185, 186], legN: [345, 335], legF: [349, 339], pies: [-50, -46]};
  const kip = {torso: 255, head: 250, armN: [140, 150], armF: [138, 148], legN: [86, 80], legF: [90, 84], pies: [-60, -56]};

  /* en el front lever la barra va detrás: las piernas pasan entre los brazos, no se apoyan en ella */
  const FL = {...B, barraAtras: true};
  /* front lever: boca arriba, brazos rectos; cuanto más largo el cuerpo, más inclinado el brazo (la mano sobre el centro del cuerpo) */
  const lever = {torso: 270, head: 266, armN: [135, 135], armF: [133, 133], legN: [90, 90], legF: [91, 91], pies: [-80, -80]};
  const bolita = {...lever, torso: 264, head: 250, armN: [158, 158], armF: [156, 156], legN: [212, 62], legF: [214, 64], pies: [-60, -60]};
  const tuck = {...lever, armN: [152, 152], armF: [150, 150], legN: [218, 74], legF: [220, 77], pies: [-70, -70]};
  const tuckAv = {...lever, armN: [150, 150], armF: [148, 148], legN: [166, 64], legF: [168, 67], pies: [-70, -70]};
  const unaPierna = {...lever, armN: [141, 141], armF: [139, 139], legN: [90, 90], legF: [219, 76]};
  const straddle = {...lever, armN: [138, 138], armF: [136, 136], legN: [94, 94], legF: [85, 85]};
  /* remo desde el tuck: los codos pasan el cuerpo hacia el piso y la barra llega al ombligo; el cuerpo sigue horizontal */
  const tuckRemo = {...tuck, armN: [62, 152], armF: [60, 150]};

  /* remo invertido: talones en el piso, el cuerpo recto gira sobre ellos */
  const remoAbajo = {torso: 250, head: 248, armN: [135, 135], armF: [133, 133], legN: [70, 70], legF: [71, 71]};
  const remoMedio = {torso: 242, head: 241, armN: [78, 176], armF: [76, 174], legN: [62, 62], legF: [63, 63]};
  const remoArriba = {torso: 233, head: 233, armN: [39, 178], armF: [37, 176], legN: [53, 53], legF: [54, 54]};

  /* elevaciones colgado: al subir las piernas la cadera se va atrás para equilibrar */
  const rodillas = {torso: 169, head: 172, armN: [172, 172], armF: [169, 170], legN: [116, 16], legF: [118, 19], pies: [-40, -36]};
  const piernas = {torso: 170, head: 174, armN: [173, 173], armF: [170, 171], legN: [90, 90], legF: [93, 93], pies: [-60, -56]};
  const piernasCol = {...colgado, legN: [4, 2], legF: [7, 5], pies: [-50, -46]};
  const pies = {torso: 218, head: 210, armN: [156, 156], armF: [154, 154], legN: [182, 182], legF: [185, 185], pies: [-70, -66]};

  Object.assign(K.POSES, {
    /* dominadas */
    "dominada-negativa": {...B, k: [colgado, medio, arriba], ritmo: [.7, .5, 4.5, .8]},
    "dominada": {...B, k: [colgado, medio, arriba], ritmo: [1, .4, 1.6, .5]},
    /* asistida: un pie atrás en una silla, la rodilla doblada; la pierna empuja lo justo */
    "dominada-asistida": {...B, k: [asisAbajo, asisMedio, asisArriba], ritmo: [1.2, .4, 1.8, .5]},
    "dominada-explosiva": {...B, k: [colgado, medio, pecho], ritmo: [.45, .25, 1.5, .8]},
    "dominada-lastre": {...B, lastre: true, k: [colgado, medio, arriba], ritmo: [1.2, .5, 1.8, .6]},
    "dominada-supina": {...B, k: [colgado, supMedio, supina], ritmo: [1, .4, 1.6, .5]},
    "dominada-un-brazo-negativa": {...U, k: [unoCol, unoMedio, unoArr], ritmo: [.8, .5, 5.5, .8]},
    "dominada-un-brazo": {...U, k: [unoCol, unoMedio, unoArr], ritmo: [1.6, .5, 2, .6]},
    /* colgarse */
    "colgado-activo": {...B, k: [activo, respira(activo)], ritmo: RESP},
    /* el mentón sobre la barra, quieto (la prueba de colgado con brazos flexionados) */
    "colgado-arriba": {...B, k: [arriba, respira(arriba)], ritmo: RESP},
    "colgado-un-brazo": {...U, k: [unoCol, respira(unoCol)], ritmo: RESP},
    "retraccion-escapular": {...B, k: [pasivo, activo], ritmo: [1, 1, 1.2, .8]},
    /* muscle-up */
    "muscle-up-negativa": {...B, rango: "avanzado", k: [colgado, medio, tiron, vuelta, apoyo], ritmo: [1, .6, 5, .8], muestra: 3},
    "muscle-up-impulso": {...B, rango: "avanzado", k: [hamaca, kip, tiron, vuelta, apoyo], ritmo: [1.3, .6, 1.8, .6], muestra: 1},
    "muscle-up": {...B, rango: "avanzado", k: [colgado, medio, tiron, vuelta, apoyo], ritmo: [1.8, .6, 2.2, .6]},
    /* front lever y sus pasos: sostenidos */
    "fl-bolita": {...FL, k: [bolita, respira(bolita)], ritmo: RESP},
    "fl-tuck": {...FL, k: [tuck, respira(tuck)], ritmo: RESP},
    "fl-tuck-avanzado": {...FL, k: [tuckAv, respira(tuckAv)], ritmo: RESP},
    "fl-una-pierna": {...FL, k: [unaPierna, respira(unaPierna)], ritmo: RESP},
    "fl-straddle": {...FL, k: [straddle, respira(straddle)], ritmo: RESP},
    "front-lever": {...FL, k: [lever, respira(lever)], ritmo: RESP},
    "remo-fl-tuck": {...FL, k: [tuck, tuckRemo], ritmo: [1, .4, 1.4, .5]},
    /* remo invertido en la barra baja */
    "remo-invertido": {con: "barra-baja", fijo: "hN", en: [170, 174], barraAtras: true, k: [remoAbajo, remoMedio, remoArriba], ritmo: [1, .5, 1.5, .5]},
    /* elevaciones colgado */
    "rodillas-colgado": {...B, k: [colgado, rodillas], ritmo: [1, .4, 1.6, .5]},
    "piernas-colgado": {...B, k: [piernasCol, piernas], ritmo: [1.2, .4, 1.8, .5]},
    "pies-a-la-barra": {...B, rango: "avanzado", k: [piernasCol, piernas, pies], ritmo: [1.2, .3, 1.6, .5]}
  });
})();
