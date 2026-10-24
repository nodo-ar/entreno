/* ===== Poses · bandas elásticas y cajón: remo, press y buenos días con banda, subida y salto al cajón (ver piezas/figura.js) ===== */
(() => {
  const T = K.fig.TOBILLO;
  /* lo lejano copia a lo cercano, corrido apenas (así se ve detrás); los pies del piso, planos */
  const nrm = a => ((a % 360) + 540) % 360 - 180;
  const dos = (P, da = -2, dl = 2) => ({...P, armF: P.armF || P.armN.map(a => a + da), legF: P.legF || P.legN.map(a => a + dl)});
  const plano = P => ({...P, pies: [-nrm(P.legN[1]), -nrm(P.legF[1])]});
  const pie = P => plano(dos(P));

  /* remo con banda: parado frente al poste, la banda atada a la altura del pecho y las rodillas blandas; arranca con los brazos
     estirados (la banda ya tensa) y los codos van atrás pegados al cuerpo hasta que las manos llegan a las costillas */
  const rmLejos = pie({torso: 177, head: 177, armN: [72, 74], legN: [8, 354]});
  const rmMedio = pie({torso: 179, head: 179, armN: [12, 92], legN: [8, 354]});
  const rmCerca = pie({torso: 182, head: 181, armN: [318, 84], legN: [8, 354]});

  /* press de hombros con banda: parado sobre la banda, sale de los hombros (los codos adelante) y empuja arriba de la cabeza hasta
     estirar los brazos, la panza dura; las manos pasan a los costados de la cabeza (van en 3D, casi de perfil) */
  const brazos = (a, b) => ({armN: a, armF: a, abd: {armN: b, armF: b}});
  const psAbajo = pie({torso: 181, head: 181, ...brazos([22.4, 178.7], [19, 7.1]), legN: [0, 0], legF: [0, 0]});
  const psCara = pie({torso: 181, head: 183, ...brazos([119.2, 219.1], [-72.5, 21]), legN: [0, 0], legF: [0, 0]});
  const psFrente = pie({torso: 180, head: 182, ...brazos([144.2, 210.2], [-28.4, 14.2]), legN: [0, 0], legF: [0, 0]});
  const psArriba = pie({torso: 179, head: 172, ...brazos([171.5, 187.2], [-5.9, -5.9]), legN: [0, 0], legF: [0, 0]});

  /* buenos días con banda: la banda bajo los pies sube por delante, pasa por arriba de los hombros y queda detrás de la nuca; las manos
     la sostienen delante de los hombros. Bisagra de cadera: la cola va atrás, la espalda recta, las rodillas apenas flojas y quietas,
     y el tronco baja hasta casi quedar horizontal */
  const sostiene = t => ({armN: [t - 162, t - 20]});
  const bdArriba = pie({torso: 180, head: 180, ...sostiene(180), legN: [4, 356]});
  const bdMedio = pie({torso: 140, head: 147, ...sostiene(140), legN: [14, 357]});
  const bdAbajo = pie({torso: 102, head: 110, ...sostiene(102), legN: [24, 356]});

  /* subida al cajón: el pie cercano entero arriba del cajón (la tibia casi vertical, la rodilla sobre el pie) y el de atrás en el piso;
     sube empujando con la pierna de arriba, el tronco apenas adelante, y la de atrás se suma recién arriba, sin impulso.
     Baja al revés: el mismo pie de atrás vuelve al piso */
  const sbAbajo = {torso: 163, head: 170, armN: [328, 336], armF: [34, 42], legN: [95.2, 356.1], legF: [336.2, 336.2], pies: [3.9, 23.8]};
  const sbMedio = {torso: 171, head: 175, armN: [348, 356], armF: [16, 24], legN: [60.8, 331.5], legF: [32.3, 295.5], pies: [28.5, -20]};
  const sbArriba = {torso: 179, head: 180, armN: [4, 8], armF: [2, 6], legN: [11.3, 349.6], legF: [9.1, 347.6], pies: [10.4, 12.4]};

  /* salto al cajón: de parado, carga (la cola atrás, los brazos atrás), despega estirando todo con los brazos arriba, recoge las rodillas
     en el aire para pasar el borde y cae suave arriba, con las rodillas dobladas y los brazos adelante; se para y baja caminando hacia
     atrás, un pie y después el otro. «corre» y «alto» llevan el cuerpo del piso al cajón */
  const scParado = {torso: 180, head: 180, armN: [4, 8], armF: [2, 6], legN: [0, 0], legF: [0, 0], pies: [0, 0]};
  const scCarga = {torso: 132, head: 148, armN: [324, 328], armF: [322, 326], legN: [69.8, 331.8], legF: [69.8, 331.8], pies: [28.2, 28.2]};
  const scDespegue = {torso: 168, head: 174, armN: [135, 145], armF: [133, 143], legN: [9.9, 352.4], legF: [9.9, 352.4], pies: [-30, -30], corre: 8, alto: 8};
  const scVuelo = {torso: 158, head: 166, armN: [100, 112], armF: [98, 110], legN: [73.5, 314.5], legF: [73.5, 314.5], pies: [-15, -15], corre: 63, alto: 64};
  const scCae = {torso: 140, head: 152, armN: [72, 84], armF: [70, 82], legN: [75, 328.3], legF: [75, 328.3], pies: [31.7, 31.7], corre: 73, alto: 45};
  const scArriba = {...scParado, corre: 73, alto: 45};
  const scPieAire = {torso: 174, head: 177, armN: [10, 16], armF: [354, 0], legN: [36.6, 336.1], legF: [15.9, 306.9], pies: [23.9, -10], corre: 73, alto: 45};
  const scPieAbajo = {torso: 166, head: 172, armN: [22, 30], armF: [345, 352], legN: [101.8, 5.5], legF: [354.1, 326.6], pies: [-5.5, 33.4], corre: 73, alto: 45};
  const scBaja = {torso: 172, head: 176, armN: [8, 14], armF: [2, 8], legN: [72.8, 335.4], legF: [15.4, 330.1], pies: [-10, 29.9], corre: 33, alto: 27};

  Object.assign(K.POSES, {
    "subida-cajon": {fijo: "fN", en: [178, 223], cajon: [160, 218, 40], k: [sbAbajo, sbMedio, sbArriba], ritmo: [1.2, .4, 1.4, .4], muestra: 1},
    "salto-cajon": {fijo: "fN", en: [125, T], cajon: [185, 245, 45], ciclo: true, ritmo: [5.5], muestra: 3,
      k: [scParado, scCarga, scDespegue, scVuelo, scCae, scArriba, scArriba, scPieAire, scPieAbajo, scBaja]},
    "remo-banda": {fijo: "fN", en: [150, T], poste: 262, banda: [[262, 140], "mano", 50], k: [rmLejos, rmMedio, rmCerca], ritmo: [1, .5, 1.6, .4], muestra: 2},
    "press-banda": {fijo: "fN", en: [150, T], banda: ["pie", "mano", 100], k: [psAbajo, psCara, psFrente, psArriba], ritmo: [1.2, .4, 1.8, .5], muestra: 2},
    "buenos-dias-banda": {fijo: "fN", en: [150, T], banda: ["pie", "nuca", 100], k: [bdArriba, bdMedio, bdAbajo], ritmo: [1.6, .3, 1.3, .5], muestra: 2}
  });
})();
