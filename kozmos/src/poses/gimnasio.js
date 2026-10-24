/* ===== Poses · gimnasio: barra con discos, máquinas y poleas, banco, kettlebell, anillas y remo (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO, PISO = K.fig.PISO;
  /* lo lejano copia a lo cercano, corrido apenas (así se ve detrás); los pies del piso, planos */
  const nrm = a => ((a % 360) + 540) % 360 - 180;
  const dos = (P, da = -2, dl = 2) => ({...P, armF: P.armF || P.armN.map(a => a + da), legF: P.legF || P.legN.map(a => a + dl)});
  const plano = P => ({...P, pies: [-nrm(P.legN[1]), -nrm(P.legF[1])]});
  const pie = P => plano(dos(P));

  /* peso muerto: arranca con los discos en el piso, la barra sobre el medio del pie y pegada a la tibia;
     sube en línea recta (las rodillas se van atrás para dejarla pasar) y termina parado, la cadera adelante */
  const pmPiso = pie({torso: 112, head: 134, armN: [344.7, 349.5], legN: [69.5, 341.6]});
  const pmRodilla = pie({torso: 124, head: 148, armN: [349.7, 354.5], legN: [49.5, 352]});
  const pmMuslo = pie({torso: 148, head: 166, armN: [355.7, .5], legN: [35.9, 347.8]});
  const pmArriba = pie({torso: 181, head: 181, armN: [3.7, 8.5], legN: [356.2, 356.2]});

  /* sentadilla con barra: la barra sobre los trapecios, detrás del cuello, y siempre sobre el medio del pie.
     Las manos la agarran abiertas (los brazos salen al costado: van en 3D) y los codos apuntan abajo.
     Abajo la cadera pasa la línea de la rodilla, el tronco inclinado como la tibia, los talones en el piso */
  const atras = (t, a0, a1) => ({armN: [a0 + t - 180, a1 + t - 180], armF: [a0 + t - 180, a1 + t - 180], abd: {armN: [33, -12], armF: [33, -12]}});
  const sqArriba = pie({torso: 177, head: 180, ...atras(177, 354.6, 191.1), legN: [355.8, 355.8]});
  const sqUno = pie({torso: 166, head: 172, ...atras(166, 354.6, 191.1), legN: [25.3, 340.3]});
  const sqDos = pie({torso: 156, head: 166, ...atras(156, 354.6, 191.1), legN: [57.3, 327.3]});
  const sqAbajo = pie({torso: 148, head: 160, ...atras(148, 354.6, 191.1), legN: [96.6, 328.6]});

  /* press con barra: la barra sale de adelante de los hombros, la cabeza se corre atrás para dejarla pasar y vuelve
     adelante cuando la barra queda arriba, sobre el medio del pie. Los codos, adelante y un poco afuera (van en 3D) */
  const brazos = (a, b) => ({armN: a, armF: a, abd: {armN: b, armF: b}});
  const prAbajo = pie({torso: 181, head: 181, ...brazos([5, 154.4], [31.7, 9.5]), legN: [0, 0], legF: [0, 0]});
  const prCara = pie({torso: 181, head: 189, ...brazos([29.1, 185.5], [100.8, 31.8]), legN: [0, 0], legF: [0, 0]});
  const prFrente = pie({torso: 180, head: 184, ...brazos([9.5, 182], [135.9, 19.1]), legN: [0, 0], legF: [0, 0]});
  const prArriba = pie({torso: 179, head: 178, ...brazos([.6, 178.6], [156.5, .7]), legN: [0, 0], legF: [0, 0]});

  /* remo con barra: bisagra quieta (el tronco a unos 45°, rodillas blandas, la barra bajo los hombros);
     los codos van atrás pegados al cuerpo y la barra toca la panza, abajo del ombligo */
  const rbColgando = pie({torso: 132, head: 118, armN: [0, 0], legN: [46, 1]});
  const rbArriba = {...rbColgando, armN: [296.1, 14], armF: [294.1, 12]};

  /* press de banca: acostado en el banco, la espalda y la cola apoyadas, los pies firmes en el piso.
     La barra baja hasta tocar el pecho (los codos un poco abajo del banco) y sube hasta estirar los brazos sobre los hombros */
  const banca = {torso: 270, head: 268, legN: [78.9, 6.7], legF: [80.9, 8.7]};
  const bcArriba = plano({...banca, armN: [176, 182], armF: [174, 180]});
  const bcMedio = plano({...banca, armN: [111.8, 224.3], armF: [109.8, 222.3]});
  const bcPecho = plano({...banca, armN: [66.7, 210.2], armF: [64.7, 208.2]});
  /* en el piso: acostado, rodillas dobladas; abajo el brazo apoya en el piso y el antebrazo queda vertical */
  const piso = {torso: 270, head: 264, legN: [140.2, 17.7], legF: [142.2, 19.7]};
  const ppArriba = plano({...piso, armN: [176, 182], armF: [174, 180]});
  const ppAbajo = plano({...piso, armN: [78, 180], armF: [80, 182]});
  const BANCA = {bancoPlano: [80, 200, 225], fijo: "hip", en: [175, 214]};

  /* sentadilla copa: la kettlebell agarrada de los cuernos contra el pecho, los codos abajo; baja hasta pasar la rodilla con el pecho alto */
  const copa = t => ({armN: [7.9 + t - 180, 151.5 + t - 180], armF: [5.9 + t - 180, 149.5 + t - 180]});
  const cpArriba = pie({torso: 180, head: 180, ...copa(180), legN: [0, 0]});
  const cpAbajo = pie({torso: 153, head: 162, ...copa(153), legN: [100, 330]});
  /* press con kettlebell a una mano: sale del hombro (la pesa apoyada en el dorso del antebrazo, el codo pegado), el codo se abre
     apenas al subir y termina con el brazo recto arriba; la otra mano, al costado */
  const kb = (a, b, head = 180) => pie({torso: 180, head, armN: a, armF: [2, 4], abd: {armN: b}, legN: [0, 0], legF: [0, 0]});
  const kbHombro = kb([22.8, 177.1], [-8, 13.5]), kbMedio = kb([145.4, 195], [-63.2, 49.9], 183), kbAlto = kb([169.4, 185.4], [-36.6, 36.3], 182), kbArriba = kb([172.6, 186.2], [-3.3, 2], 178);
  /* flexión pike: manos y pies en el piso, la cadera arriba; baja la cabeza adelante de las manos con los codos atrás.
     Los pies en punta, quietos */
  const pkArriba = {torso: 40.9, head: 46, armN: [40.9, 40.9], armF: [42.9, 42.9], legN: [340.6, 340.6], legF: [339.6, 339.6], pies: [-20.6, -19.6]};
  const pkAbajo = {torso: 44, head: 50, armN: [335.4, 76.3], armF: [337.4, 77.3], legN: [324, 324], legF: [323, 323], pies: [-4, -3]};

  /* jalón al pecho: sentado con los muslos trabados bajo el rodillo, el tronco apenas atrás; la barra ancha baja del cable
     hasta arriba del pecho con los codos hacia abajo (los brazos abiertos van en 3D) */
  const jalon = (a, b) => ({torso: 192, head: 186, armN: a, armF: a, abd: {armN: b, armF: b}, legN: [80, 2], legF: [80, 2], pies: [-2, -2]});
  const jlArriba = jalon([160.4, 161.5], [-28.3, -24.4]), jlMedio = {...jalon([167.8, 159.4], [-91.3, 3.6]), head: 188}, jlPecho = {...jalon([207.9, 137.8], [-140.3, -20.6]), head: 184};
  const JALON = [["l", 232, PISO, 232, 58, 152, 58], ["r", 159, 65, 5], ["k", 238, 200, 16, 66], ["l", 112, PISO - 1, 250, PISO - 1],
    ["l", 143, 230, 143, PISO], ["p", 116, 223, 54, 8], ["l", 232, 205, 192, 205], ["c", 188, 205, 6.5]];

  /* remo sentado en polea: sentado en el banco bajo, los pies contra la plataforma y las rodillas apenas dobladas;
     el cable sale de la roldana de abajo y el agarre llega a la panza con los codos atrás, el tronco derecho */
  const polea = {head: 180, legN: [108.1, 78.2], legF: [110.1, 80.2], pies: [0, 0]};
  const rpLejos = {...polea, torso: 174, head: 172, armN: [66.1, 72.9], armF: [64.1, 70.9]};
  const rpMedio = {...polea, torso: 178, armN: [23.7, 91.1], armF: [21.7, 89.1]};
  const rpPanza = {...polea, torso: 183, head: 182, armN: [331, 70.4], armF: [329, 68.4]};
  const POLEA = [["l", 86, PISO - 1, 234, PISO - 1], ["l", 100, 234, 100, PISO], ["l", 160, 234, 160, PISO], ["p", 86, 227, 90, 8],
    ["l", 218, 190, 214, 240, 214, PISO], ["l", 228, PISO, 228, 214], ["r", 226, 214, 5]];

  /* press de pecho en máquina: sentado, la espalda contra el respaldo y los pies en el piso; los agarres salen a la altura del pecho
     (los codos atrás y abiertos: van en 3D) y la palanca, que cuelga de arriba, va adelante hasta estirar los brazos sin trabar */
  const sentadoM = {torso: 186, head: 183, legN: [78.7, 8.2], legF: [80.7, 10.2], pies: [-8.2, -10.2]};
  const pm3 = (a, b) => ({...sentadoM, armN: a, armF: a, abd: {armN: b, armF: b}});
  const ppPecho = pm3([348.9, 122.3], [64.3, 81.9]), ppMedio = pm3([28.3, 122], [67.6, 90.5]), ppLejos = pm3([63.6, 99.3], [42.5, 43.5]);
  const PECHO = [["l", 84, PISO - 1, 200, PISO - 1], ["l", 125, 231, 125, PISO], ["p", 100, 223, 50, 8], ["a", 112.9, 218.6, 106.4, 157.4],
    ["l", 96, PISO, 96, 80, 159, 80, 159, 82], ["r", 159, 86, 4]];

  /* prensa a 45°: recostado en el asiento, la cola y la espalda pegadas al respaldo y las manos en los agarres del costado;
     los pies planos en la plataforma, que corre por su riel: baja hasta doblar bien las rodillas (sin que la cola se despegue) y vuelve sin trabar */
  const prensa = (l, p) => ({torso: 248, head: 240, armN: [70, 95], armF: [68, 93], legN: l, legF: [l[0] + 2, l[1] + 2], pies: [p, p - 2]});
  const pnArriba = prensa([153, 122.3], 12.7), pnMedio = prensa([175.8, 99.4], 35.6), pnAbajo = prensa([190.6, 85.4], 49.6);
  const PRENSA = [["l", 40, PISO - 1, 232, PISO - 1], ["l", 104, PISO, 110, 236], ["l", 56, PISO, 58, 210], ["a", 115.1, 227.1, 48.4, 200.1], ["a", 116, 229, 136, 224],
    ["l", 155.4, 210.5, 218.6, 147.3], ["l", 162, 204, 162, PISO], ["l", 218.6, 147.3, 218.6, PISO]];

  /* curl femoral en máquina: boca abajo en el banco, las rodillas apenas afuera del borde (alineadas con el eje de la palanca)
     y el rodillo detrás de los tobillos; los talones van a la cola sin despegar la cadera. Las manos, en los agarres de adelante */
  const femoral = (sh, sf) => ({torso: 92, head: 100, armN: [343.2, 38.2], armF: [341.2, 36.2], legN: [270, sh], legF: [268, sf], pies: [-20, -20]});
  const cfEstirado = femoral(258, 256), cfMedio = {...femoral(200, 198), pies: [-10, -10]}, cfArriba = {...femoral(147, 145), pies: [0, 0]};
  const FEMORAL = [["l", 96, PISO - 1, 246, PISO - 1], ["l", 132, 209, 132, PISO], ["l", 228, 209, 228, PISO], ["p", 112, 200, 132, 9],
    ["l", 132, 222, 107, 196], ["r", 107, 196, 4], ["l", 214, 209, 214, 244]];

  /* remo en anillas: colgado de las anillas con los brazos estirados, el cuerpo en tabla y los talones en el piso;
     el cuerpo gira sobre los talones y el pecho sube hasta las manos, los codos pegados */
  const raAbajo = {torso: 250, head: 248, armN: [135, 135], armF: [133, 133], legN: [70, 70], legF: [71, 71]};
  const raMedio = {torso: 242, head: 241, armN: [78, 176], armF: [76, 174], legN: [62, 62], legF: [63, 63]};
  const raArriba = {torso: 233, head: 233, armN: [39, 178], armF: [37, 176], legN: [53, 53], legF: [54, 54]};
  /* fondo en anillas: arriba los brazos estirados con las anillas pegadas al cuerpo; baja hasta que el hombro pasa el codo
     (el tronco se inclina adelante) y vuelve; las piernas, dobladas atrás como en las paralelas */
  const faArriba = {torso: 177, head: 178, armN: [358, 2], armF: [360, 4], legN: [14, 292], legF: [10, 288]};
  const faAbajo = {torso: 142, head: 150, armN: [265, 20], armF: [266, 25], legN: [26, 270], legF: [22, 266]};

  /* remo en máquina: los pies atados a los apoyos y el asiento que corre por el riel bajo la cadera (la cadera no sube ni baja).
     La pasada: el enganche (rodillas al pecho, brazos estirados), empujan las piernas, el tronco va atrás y los brazos llevan el agarre
     a las costillas; la vuelta, al revés y el doble de lenta: brazos, tronco y recién ahí las rodillas */
  const remo = (torso, head, armN, legN, p) => ({torso, head, armN, armF: [armN[0] - 2, armN[1] - 2], legN, legF: [legN[0] + 2, legN[1] + 2], pies: [p, p - 2]});
  const rmEnganche = remo(150, 160, [83.8, 83.8], [125.5, 0], 50), rmPiernas = remo(155, 164, [79.6, 79.6], [116.2, 31.5], 18.5);
  const rmFinal = remo(200, 192, [347.2, 112.6], [79, 79], -29), rmBrazos = remo(200, 192, [73.8, 73.8], [79, 79], -29);
  const rmTronco = remo(152, 162, [69.4, 69.4], [79, 79], -29), rmVuelta = remo(150, 160, [76.6, 76.6], [118.1, 27.7], 22.3);
  /* el riel en el piso, el volante en su caja adelante con la pantalla, y el apoyo de los pies inclinado */
  const REMO = [["l", 66, 252, 258, 252], ["l", 72, 252, 72, PISO], ["l", 250, 252, 255, PISO], ["r", 252, 228, 14], ["l", 248, 214, 242, 174], ["k", 234, 162, 15, 11],
    ["l", 194.8, 249, 207.3, 234.7], ["l", 201, 241.8, 206, 252]];

  Object.assign(K.POSES, {
    "remo-maquina": {fijo: "fN", en: [190, 238], rango: "avanzado", ciclo: true, maq: REMO, mov: [["carro", 231, -18, 14, 252], ["cable", 244, 218]],
      k: [rmEnganche, rmPiernas, rmFinal, rmBrazos, rmTronco, rmVuelta], ritmo: [2.4], muestra: 2},
    "remo-anillas": {fijo: "hN", en: [170, 174], mov: [["anilla", 40]], k: [raAbajo, raMedio, raArriba], ritmo: [1, .5, 1.5, .5]},
    "fondo-anillas": {fijo: "hN", en: [150, 150], mov: [["anilla", 40]], k: [faArriba, faAbajo], ritmo: [1.6, .2, 1.1, .4], muestra: 1},
    "curl-femoral-maquina": {fijo: "hip", en: [150, 190], maq: FEMORAL, mov: [["rodillo", 107, 196, 5]], k: [cfEstirado, cfMedio, cfArriba], ritmo: [1, .4, 1.8, .4], muestra: 2},
    "prensa": {fijo: "hip", en: [120, 215], maq: PRENSA, mov: [["plataforma", 135, 26]], k: [pnArriba, pnMedio, pnAbajo], ritmo: [1.8, .3, 1.3, .5], muestra: 2},
    "press-pecho-maquina": {fijo: "hip", en: [130, 214], maq: PECHO, mov: [["palanca", 159, 86]], k: [ppPecho, ppMedio, ppLejos], ritmo: [1.1, .3, 1.7, .5], muestra: 0},
    "remo-polea": {fijo: "hip", en: [130, 219], maq: POLEA, mov: [["cable", 226, 214]], k: [rpLejos, rpMedio, rpPanza], ritmo: [1, .6, 1.6, .4], muestra: 2},
    "jalon-pecho": {fijo: "hip", en: [150, 214], maq: JALON, mov: [["cable", 159, 70]], k: [jlArriba, jlMedio, jlPecho], ritmo: [1.1, .4, 1.8, .5], muestra: 2},
    "sentadilla-copa": {con: "pesa", copa: true, fijo: "fN", en: [150, T], k: [cpArriba, cpAbajo], ritmo: [1.8, .3, 1.2, .5]},
    "press-kettlebell": {con: "pesa", unaMano: true, fijo: "fN", en: [150, T], k: [kbHombro, kbMedio, kbAlto, kbArriba], ritmo: [1.1, .4, 1.6, .5], muestra: 0},
    "flexion-pike": {fijo: "hN", en: [150, 264], muestra: .6, k: [pkArriba, pkAbajo], ritmo: [1.8, .2, 1.1, .4]},
    "press-banca": {...BANCA, con: "discos", rack: [92, 150], k: [bcArriba, bcMedio, bcPecho], ritmo: [1.8, .3, 1.2, .5], muestra: 1},
    "press-banca-mancuernas": {...BANCA, con: "mancuernas", k: [bcArriba, bcMedio, bcPecho], ritmo: [1.8, .3, 1.2, .5], muestra: 1},
    "press-piso-mancuernas": {con: "mancuernas", fijo: "hip", en: [175, 257], k: [ppArriba, ppAbajo], ritmo: [1.6, .4, 1.1, .5], muestra: .5},
    "remo-barra": {con: "discos", fijo: "fN", en: [150, T], k: [rbColgando, rbArriba], ritmo: [1, .5, 1.6, .4]},
    "press-militar": {con: "discos", fijo: "fN", en: [150, T], k: [prAbajo, prCara, prFrente, prArriba], ritmo: [1.2, .4, 1.8, .5]},
    "sentadilla-barra": {con: "discos", fijo: "fN", en: [150, T], k: [sqArriba, sqUno, sqDos, sqAbajo], ritmo: [1.8, .3, 1.3, .5]},
    "peso-muerto-barra": {con: "discos", rango: "avanzado", fijo: "fN", en: [150, T], k: [pmPiso, pmRodilla, pmMuslo, pmArriba], ritmo: [1.4, .4, 1.8, .6]}
  });
})();
