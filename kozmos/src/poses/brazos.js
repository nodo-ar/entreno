/* ===== Poses · bíceps y tríceps: curls y extensiones, con tu cuerpo y con peso (ver piezas/figura.js) =====
   En los de tu cuerpo la mano no se mueve del marco, la barra o la mesa y los pies no se mueven del piso: el ángulo del tronco
   y el codo salen de esas dos cosas (el brazo se resuelve como dos segmentos entre el hombro y la mano) */
(() => {
  const T = K.fig.TOBILLO, PISO = K.fig.PISO;
  const nrm = a => ((a % 360) + 540) % 360 - 180;
  const dos = (P, da = -2, dl = 2) => ({...P, armF: P.armF || P.armN.map(a => a + da), legF: P.legF || P.legN.map(a => a + dl)});
  const plano = P => ({...P, pies: [-nrm(P.legN[1]), -nrm(P.legF[1])]});
  const pie = P => plano(dos(P));
  /* el cuerpo recto de los pies al hombro: las piernas siguen al tronco */
  const recto = (torso, armN, p = 0) => ({torso, head: torso - 2, armN, legN: [torso - 180, torso - 180], legF: [torso - 179, torso - 179], pies: [p, p]});

  /* ===== bíceps ===== */
  /* curl parado: el brazo de arriba queda pegado al cuerpo (apenas adelante al final) y solo se dobla el codo, sin hamacarse */
  const parado = {torso: 180, head: 180, legN: [0, 0], legF: [2, 1]};
  const clAbajo = pie({...parado, armN: [2, 6]}), clMedio = pie({...parado, armN: [4, 90]}), clArriba = pie({...parado, head: 178, armN: [10, 148]});
  /* a una mano (la kettlebell): el otro brazo cuelga al costado */
  const una = P => ({...P, armF: [358, 2]});
  /* en el marco de la puerta: agarrado con una mano a la altura de la cara, el cuerpo recto inclinado atrás sobre los talones;
     al doblar el codo el cuerpo viene hacia el marco y la mano termina frente a la frente. El codo queda adelante y abajo */
  const ptAtras = plano({...recto(199.5, [94.4, 118.1]), armF: [12, 16]});
  const ptMedio = plano({...recto(193, [62.8, 154.1]), armF: [6, 10]});
  const ptCerca = plano({...recto(187, [50.8, 178.3]), armF: [2, 6]});
  /* curl con tu peso en la barra baja: colgado de la barra con las palmas hacia vos, el cuerpo en tabla y los talones en el piso;
     el hombro no se mueve, solo el codo: los codos quedan apuntando a la barra y la frente sube hasta ella */
  const cb = (t, a) => ({...recto(t, a), armF: [a[0] - 2, a[1] - 2]});
  const CB = [cb(250, [162.8, 178]), cb(246, [140, 209.1]), cb(242, [132.1, 229.1]), cb(238, [131.9, 249.9]), cb(233, [146.8, 282.5])];

  /* ===== tríceps ===== */
  /* extensión en la mesada: las manos en el borde, el cuerpo en tabla inclinado y en punta de pies; se doblan solo los codos
     (apuntan al piso, adelante) y la frente baja hasta las manos, y vuelve estirando los brazos */
  const ms = (t, a, p) => ({...recto(t, a, p), armF: [a[0] + 2, a[1] + 2]});
  const MS = [ms(136, [52.8, 68], -6), ms(132, [31.1, 99.5], -2), ms(128, [24.6, 120.1], 2), ms(124, [26.2, 141.3], 6), ms(120, [37.7, 165.9], 10)];
  /* lo mismo en la barra baja, más abajo y más horizontal: cuesta más */
  const BB = [ms(125, [49.8, 65], 5), ms(121, [30.6, 96.9], 9), ms(117, [26.8, 118.2], 13), ms(113, [31.3, 139.3], 17), ms(109, [44, 160.9], 21)];
  /* en el piso: de apoyado en los antebrazos (los codos bajo los hombros) a los brazos rectos, sin mover las manos ni los pies */
  const psAbajo = {...recto(99.7, [0, 90], 40), armF: [2, 92]};
  const psMedio = {...recto(103.4, [6.5, 70.4], 37), armF: [8.5, 72.4]};
  const psArriba = {...recto(107.1, [33.2, 33.2], 33), armF: [35.2, 35.2]};
  /* sobre la cabeza con una pesa (las dos manos): los codos al techo y quietos; la pesa baja detrás de la nuca y sube */
  const scArriba = pie({...parado, armN: [172, 178]}), scMedio = pie({...parado, armN: [170, 245]}), scAbajo = pie({...parado, head: 182, armN: [168, 316]});
  /* press francés en el piso: acostado, las rodillas dobladas; los brazos de arriba quedan quietos, apenas hacia la cabeza,
     y la barra baja hasta pasar justo por arriba de la frente */
  const piso = {torso: 270, head: 264, legN: [140.2, 17.7], legF: [142.2, 19.7]};
  const pfArriba = {...piso, armN: [192, 192], armF: [190, 190]};
  const pfMedio = {...piso, armN: [194, 256], armF: [192, 254]};
  const pfAbajo = {...piso, armN: [196, 318], armF: [194, 316]};
  /* hacia abajo en la polea alta (o con la banda atada arriba): el tronco apenas adelante y los codos pegados al costado;
     de las manos en el pecho a los brazos rectos abajo */
  const abajo = {torso: 173, head: 175, legN: [4, 0], legF: [6, 2]};
  const pdArriba = pie({...abajo, armN: [355, 128]}), pdMedio = pie({...abajo, armN: [355, 64]}), pdAbajo = pie({...abajo, armN: [357, 5]});

  /* la polea de abajo (curl) y la de arriba (tríceps): un caño con su roldana y la pila de pesas al costado */
  const POLEA_BAJA = [["l", 206, 112, 206, PISO], ["l", 192, PISO - 1, 228, PISO - 1], ["k", 212, 150, 14, 60], ["r", 199, 250, 5]];
  const POLEA_ALTA = [["l", 212, 82, 212, PISO], ["l", 198, PISO - 1, 234, PISO - 1], ["l", 212, 86, 196, 86], ["k", 218, 190, 14, 60], ["r", 196, 92, 5]];

  Object.assign(K.POSES, {
    /* bíceps */
    "curl-puerta": {poste: 151, fijo: "fN", en: [140, T], k: [ptAtras, ptMedio, ptCerca], ritmo: [1.2, .4, 1.6, .4], muestra: 2},
    "remo-supino": {con: "barra-baja", fijo: "hN", en: [170, 174], barraAtras: true, k: [
      {torso: 250, head: 248, armN: [135, 135], armF: [133, 133], legN: [70, 70], legF: [71, 71]},
      {torso: 242, head: 241, armN: [78, 176], armF: [76, 174], legN: [62, 62], legF: [63, 63]},
      {torso: 233, head: 233, armN: [39, 178], armF: [37, 176], legN: [53, 53], legF: [54, 54]}], ritmo: [1, .5, 1.5, .5]},
    "curl-barra-baja": {con: "barra-baja", fijo: "hN", en: [178.3, 159.5], barraAtras: true, k: CB, ritmo: [1.2, .4, 1.8, .5], muestra: 2},
    "curl-mancuernas": {con: "mancuernas", fijo: "fN", en: [150, T], k: [clAbajo, clMedio, clArriba], ritmo: [1, .4, 1.8, .4], muestra: 1},
    "curl-kettlebell": {con: "pesa", unaMano: true, fijo: "fN", en: [150, T], k: [una(clAbajo), una(clMedio), una(clArriba)], ritmo: [1, .4, 1.8, .4], muestra: 1},
    "curl-barra": {con: "discos", fijo: "fN", en: [150, T], k: [clAbajo, clMedio, clArriba], ritmo: [1.1, .4, 1.9, .4], muestra: 1},
    "curl-polea": {fijo: "fN", en: [150, T], maq: POLEA_BAJA, mov: [["cable", 199, 250, 8]], k: [clAbajo, clMedio, clArriba], ritmo: [1, .4, 1.8, .4], muestra: 1},
    "curl-banda": {fijo: "fN", en: [150, T], banda: ["pie", "mano", 60], k: [clAbajo, clMedio, clArriba], ritmo: [1, .4, 1.8, .4], muestra: 1},
    /* tríceps */
    "extension-triceps-mesada": {mesa: [250, 274, 195], fijo: "fN", en: [100, T], k: MS, ritmo: [1.6, .3, 1.1, .4], muestra: 1},
    "extension-triceps-piso": {fijo: "hN", en: [150, 264], k: [psAbajo, psMedio, psArriba], ritmo: [1.2, .3, 1.6, .4], muestra: 1},
    "extension-triceps-barra": {con: "barra-baja", fijo: "hN", en: [262.1, 213.5], barraX: 236, barraAtras: true, k: BB, ritmo: [1.6, .3, 1.1, .4], muestra: 1},
    "extension-mancuerna": {con: "mancuerna", fijo: "fN", en: [150, T], k: [scArriba, scMedio, scAbajo], ritmo: [1.6, .3, 1.1, .4], muestra: 1},
    "extension-kettlebell": {con: "pesa", fijo: "fN", en: [150, T], k: [scArriba, scMedio, scAbajo], ritmo: [1.6, .3, 1.1, .4], muestra: 1},
    "press-frances": {con: "discos", fijo: "hip", en: [175, 257], k: [pfArriba, pfMedio, pfAbajo], ritmo: [1.6, .3, 1.1, .4], muestra: 1},
    "extension-polea": {fijo: "fN", en: [150, T], maq: POLEA_ALTA, mov: [["cable", 196, 92, 8]], k: [pdArriba, pdMedio, pdAbajo], ritmo: [1, .4, 1.6, .4], muestra: 1},
    "extension-banda": {fijo: "fN", en: [150, T], poste: 196, banda: [[196, 92], "mano", 70], k: [pdArriba, pdMedio, pdAbajo], ritmo: [1, .4, 1.6, .4], muestra: 1}
  });
})();
