/* ===== Poses · movilidad: espagats, pancake, puente, cuatro patas y estiramientos acostado (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO, S = 259, R = 262;
  /* sentado con las piernas estiradas adelante; el tronco y los brazos cuentan el resto */
  const sentado = (torso, head, armN, armF) => ({torso, head, armN, armF, legN: [88, 88], legF: [88, 88]});
  /* acostado boca arriba con la cabeza a la izquierda */
  const boca = {torso: 270, head: 265, armN: [90, 90], armF: [88, 88], legN: [92, 92], legF: [90, 90]};
  /* en cuatro patas: rodillas bajo la cadera, manos bajo los hombros, empeines planos en el piso */
  const cuatro = K.fig.CUATRO;
  const parado = {...K.fig.PARADO, armN: [2, 2], armF: [358, 358]};
  /* groiners: plancha alta en línea (tobillo, cadera y hombro), la rodilla recogida bajo el pecho y el paso hondo al lado de la mano */
  const planchaG = {torso: 112, head: 106, armN: [0, 0], armF: [1, 1], legN: [292, 292], legF: [291, 291], pies: [40, 40]};
  const lado = (x, adelante, atras, pa, pb) => x === "N" ? {legN: adelante, legF: atras, pies: [pa, pb]} : {legN: atras, legF: adelante, pies: [pb, pa]};
  const despega = x => ({torso: 104, head: 100, armN: [0, 0], armF: [1, 1], ...lado(x, [330, 245], [296, 296], 0, 40)});
  const recoge = x => ({torso: 96, head: 92, armN: [0, 0], armF: [1, 1], ...lado(x, [70, 290], [302, 302], 10, 40)});
  const paso = (x, d = 0) => ({torso: 128 + d, head: 112 + d, armN: [355, 355], armF: [356, 356], ...lado(x, [113 - d / 2, 333 - d], [281 + d / 2, 281 + d / 2], 27 + d, 43)});
  /* un lado entero: despega el pie, recoge la rodilla, apoya al lado de la mano, se queda un momento y vuelve por el mismo camino */
  const groin = x => [despega(x), recoge(x), paso(x), paso(x, 1.5), recoge(x), despega(x), planchaG];
  /* los sostenidos respiran: la misma pose y otra con el pecho, la cabeza y los hombros apenas corridos (sumas en grados) */
  const RESP = [2, .4, 2, .4];
  const mas = (P, d) => ({...P, ...Object.fromEntries(Object.entries(d).map(([k, x]) => [k, Array.isArray(x) ? P[k].map((a, i) => a + (x[i] || 0)) : P[k] + x]))});
  const respira = (P, d) => [P, mas(P, d)];
  Object.assign(K.POSES, {
    /* el lateral se ve de frente; de perfil va sentado con las piernas adelante: cadera adelante, espalda recta y apenas inclinada, manos al piso entre las piernas */
    "espagat-lateral-90": {fijo: "hip", en: [150, S], rango: "avanzado", ritmo: RESP,
      k: respira(sentado(158, 164, [2, 12], [0, 10]), {torso: 1.5, head: 2, armN: [1.5, 2], armF: [1.5, 2]})},
    /* abierto del todo: brazos en cruz para que se lea el lateral */
    "espagat-lateral": {fijo: "hip", en: [150, S], rango: "avanzado", ritmo: RESP,
      k: respira(sentado(180, 180, [92, 96], [288, 284]), {torso: -1, head: -1.5, armN: [-2, -2], armF: [2, 2]})},
    "espagat-frontal": {fijo: "hip", en: [150, 258], rango: "avanzado", ritmo: RESP,
      k: respira({torso: 180, head: 181, armN: [196, 196], armF: [198, 199], legN: [87, 87], legF: [273, 271], pies: [0, -88]}, {torso: 1.5, head: 1.5, armN: [2, 2], armF: [2, 2]})},
    /* una mano por arriba de la cabeza y la otra por abajo, detrás de la espalda */
    "manos-atras": {fijo: "fN", en: [150, T], rango: "avanzado", ritmo: RESP,
      k: respira({...parado, head: 177, armN: [200, 350], armF: [322, 112]}, {torso: 1, head: 1.5, armN: [1, 1], armF: [1, 1]})},
    "dedos-al-piso": {fijo: "fN", en: [150, T], ritmo: RESP,
      k: respira({...parado, torso: 60, head: 30, armN: [8, 8], armF: [6, 6], legN: [8, 8], legF: [9, 9], pies: [-8, -9]}, {torso: 1.5, head: 2.5, armN: [-1, -1], armF: [-1, -1]})},
    "hombros-pared": {fijo: "fN", en: [150, T], pared: 86, rango: "avanzado", ritmo: RESP,
      k: respira({...parado, torso: 184, head: 183, armN: [188, 190], armF: [190, 192], legN: [6, 6], legF: [6.5, 6.5], pies: [-6, -6.5]}, {torso: -1, head: -1, armN: [1, 1], armF: [1, 1]})},
    "pike-pecho": {fijo: "hip", en: [150, S], rango: "avanzado", ritmo: RESP,
      k: respira(sentado(104, 92, [55, 120], [56, 120]), {torso: 1, head: 1.5, armN: [-1, -1], armF: [-1, -1]})},
    "puente": {fijo: "hN", en: [110, 264], rango: "avanzado", ritmo: RESP,
      k: respira({torso: 305, head: 333, armN: [322, 323], armF: [320, 321], legN: [35, 355], legF: [37, 357], pies: [5, 3]}, {torso: .7, head: 2})},
    "pancake": {fijo: "hip", en: [150, S], rango: "avanzado", ritmo: RESP,
      k: respira({...sentado(106, 101, [69, 70], [71, 71]), legN: [90, 90], legF: [90, 90]}, {torso: 1, head: 2, armN: [-1, -1], armF: [-1, -1]})},
    /* sin columna que se curve: gato = cabeza hacia las rodillas y el cuerpo apenas atrás; camello = el pecho va un poco adelante
       sobre las manos y la mirada sube sin quebrar el cuello. Manos y rodillas no se mueven. Despacio, 3 s por lado */
    "gato-camello": {fijo: "kN", en: [130, R], k: [{...cuatro, torso: 102.3, head: 58, armN: [2, 2], armF: [3, 3], legN: [.9, 270], legF: [2.5, 270]},
      {...cuatro, torso: 102.6, head: 127, armN: [356, 356], armF: [357, 357], legN: [352.9, 270], legF: [354.5, 270]}], ritmo: [3, 1, 3, 1]},
    /* las manos quedan bajo la lumbar mientras se despegan apenas la cabeza y los hombros, con el cuello neutro; 8 s arriba */
    "curl-up": {fijo: "hip", en: [150, S], k: [{...boca, armN: [88, 93], armF: [87, 92], legN: [135, 35], pies: [-35, 0]},
      {...boca, torso: 263, head: 260, armN: [80, 86], armF: [79, 85], legN: [135, 35], pies: [-35, 0]}], ritmo: [1, 8, 1, 2]},
    /* como la plancha lateral: antebrazo bajo el hombro y la mano de arriba al techo; acá las rodillas dobladas en el piso y la cadera en línea */
    "plancha-lateral-rodillas": {fijo: "eN", en: [180, 263], rango: "avanzado", ritmo: RESP,
      k: respira({torso: 106, head: 104, armN: [0, 90], armF: [211, 213], legN: [286, 236], legF: [285, 232], pies: [-80, -80]}, {torso: .8, head: 1.5, armF: [1, 1]})},
    /* brazo cercano adelante y pierna lejana atrás, los dos a la altura del tronco; la cabeza mira al piso para que el brazo pase por arriba */
    "perro-de-caza-sostenido": {fijo: "kN", en: [130, R], ritmo: RESP,
      k: respira({...cuatro, head: 92, armN: [106, 108], legF: [274, 274], pies: [-90, -5]}, {head: 1.5, armN: [1, 1], legF: [-1, -1]})},
    /* pies en la pared, cadera y rodillas a 90°: inhala 4 s (el pecho sube apenas), exhala largo 6 s (las costillas bajan y la pelvis se acomoda) */
    "respiracion-90-90": {fijo: "hip", en: [120, S], pared: 164, muestra: 0, ritmo: [4, .5, 6, .8],
      k: [{...boca, head: 266, armN: [92, 92], armF: [90, 91], legN: [181, 91], legF: [183, 93]},
        {...boca, torso: 268.5, head: 264, armN: [91, 91], armF: [89, 90], legN: [180, 90], legF: [182, 92]}]},
    /* el brazo que se estira por arriba de la cabeza es el lejano (pasa detrás de la cabeza) y la pierna contraria, la cercana, baja cerca del piso */
    "bicho-muerto-sostenido": {fijo: "hip", en: [160, S], ritmo: RESP,
      k: respira({...boca, armN: [181, 181], armF: [263, 264], legN: [97, 97], legF: [181, 91]}, {torso: -.8, head: -1.5, armN: [-1, -1], armF: [-1, -1]})},
    /* las rodillas caen hacia los costados: de perfil se ven dobladas con los pies juntos cerca de la cadera */
    "mariposa-acostado": {fijo: "hip", en: [150, S], ritmo: RESP,
      k: respira({...boca, armN: [96, 98], armF: [94, 96], legN: [150, 359], legF: [147, 2], pies: [6, 3]}, {torso: -.8, head: -1.5, armN: [1, 1], armF: [1, 1]})},
    /* igual que la mariposa pero con la mano lejana detrás de la cabeza (el codo asoma arriba); la cercana suelta al costado */
    "aductores-acostado": {fijo: "hip", en: [150, S], ritmo: RESP,
      k: respira({...boca, armN: [93, 95], armF: [222, 12], legN: [150, 359], legF: [146, 3], pies: [6, 2]}, {torso: -.8, head: -1.5, armN: [1, 1], armF: [-1, -1]})},
    /* figura 4: la pierna lejana viene al pecho (cadera 100°, rodilla 90°) y las manos la toman detrás del muslo;
       el tobillo cercano cruza apoyado sobre ese muslo, cerca de la rodilla (de perfil la rodilla abierta queda hacia el pecho) */
    "gluteo-tobillo-rodilla": {fijo: "hip", en: [150, S], rango: "avanzado", ritmo: RESP,
      k: respira({...boca, armN: [108, 130], armF: [106, 128], legN: [224, 116], legF: [190, 100]}, {torso: -.8, head: -1.5, legF: [1.5, 1.5], legN: [1.5, 1.5], armN: [1, 1], armF: [1, 1]})},
    "isquios-sentado": {fijo: "hip", en: [150, S], rango: "avanzado", ritmo: RESP,
      k: respira(sentado(132, 128, [52, 62], [50, 60]), {torso: 1.5, head: 2, armN: [-1, -1], armF: [-1, -1]})},
    /* la rodilla doblada a 90° va hacia el hombro contrario: la mano lejana la guía y la cercana queda suelta en el piso */
    "rodilla-cruzada": {fijo: "hip", en: [150, S], ritmo: RESP,
      k: respira({...boca, armN: [92, 94], armF: [120, 141], legN: [200, 110], legF: [91, 91]}, {torso: -.8, head: -1.5, legN: [1.5, 1.5], armF: [1, 1]})},
    /* medio espagat: la cadera atrás sobre la rodilla de apoyo, la pierna de adelante estirada con la punta arriba y el pecho largo hacia ella, manos al piso */
    "estiramiento-corredor": {fijo: "kF", en: [130, R], rango: "avanzado", ritmo: RESP,
      k: respira({torso: 103, head: 99, armN: [2, 4], armF: [0, 2], legN: [59, 59], legF: [4, 270], pies: [0, -90]}, {torso: 1, head: 2, armN: [-1, -1], armF: [-1, -1]})},
    /* la rodilla bien doblada contra el pecho, abrazada con las dos manos sobre la canilla; la otra pierna estirada */
    "rodilla-al-pecho": {fijo: "hip", en: [150, S], ritmo: RESP,
      k: respira({...boca, armN: [110, 152], armF: [111, 151], legN: [215, 85], legF: [91, 91]}, {torso: -.8, head: -1.5, legN: [1.5, 1.5], armN: [1, 1], armF: [1, 1]})},
    /* la pierna cercana estirada y cruzada, tirada por la mano lejana hacia el otro hombro; el otro brazo suelto en el piso */
    "gluteo-banda-it": {fijo: "hip", en: [150, S], ritmo: RESP,
      k: respira({...boca, armN: [92, 94], armF: [103, 142], legN: [200, 198], legF: [91, 91]}, {torso: -.8, head: -1.5, legN: [1.5, 1.5], armF: [1, 1]})},
    "piernas-abiertas": {fijo: "hip", en: [150, S], rango: "avanzado", ritmo: RESP,
      k: respira(sentado(115, 111, [20, 90], [22, 91]), {torso: 1, head: 2, armN: [-3, 0], armF: [-3, 0]})},
    /* el muslo queda quieto (cadera 105°, las manos detrás) y la rodilla se estira de a poco y vuelve */
    "isquios-90-90": {fijo: "hip", en: [150, S], k: [{...boca, armN: [108, 130], armF: [107, 129], legN: [195, 105], legF: [91, 91]},
      {...boca, armN: [108, 130], armF: [107, 129], legN: [195, 182], legF: [91, 91]}], ritmo: [3, 2, 2, 1]},
    /* alternado y sin apuro: plancha → la rodilla viene bajo el pecho (la cadera sube apenas) → el pie apoya al lado de la mano con la cadera baja → vuelve → plancha, y el otro.
       Las manos quedan clavadas; los hombros se adelantan un poco sobre ellas cuando el pie llega */
    "groiners": {fijo: "hN", en: [190, 264], rango: "avanzado", ciclo: true, muestra: 3, k: [
      planchaG, ...groin("N"), ...groin("F").slice(0, -1)], ritmo: [8]},
    /* media rodilla: la de adelante a 90° sobre el tobillo, la de atrás en el piso con el empeine apoyado; la cadera va adelante (extensión de la de atrás)
       con el tronco derecho y el brazo del lado de atrás arriba */
    "flexor-cadera-arrodillado": {fijo: "fN", en: [180, T], ritmo: RESP,
      k: respira({torso: 182, head: 181, armN: [352, 64], armF: [185.5, 185], legN: [90, 0], legF: [339, 270], pies: [0, -90]}, {torso: 1, head: 1.5, armF: [1.5, 1.5], armN: [-1, 0]})}
  });
})();
