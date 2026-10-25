# Kozmos · cómo arma el motor cada día

Las reglas que aprobó Fer el 25 de octubre de 2026 (simulador: https://claude.ai/artifact/DuBKX763h64pDodc6xNExh). El simulador es una maqueta con el catálogo real; el motor de la app vive en `kozmos/src/sesion/dia.js`. Cada sección dice si ya está construida.

## Lo que se elige

1. **Qué entrenás** (fuerza, resistencia, flexibilidad), en orden: lo primero pesa más (60 y 40, o 50, 30 y 20 del tiempo).
2. **Cómo entrenás** (las formas): traen tu equipo y deciden los estilos de fuerza y la resistencia.
3. **Tus días y tu semana** (`perfil.semana`): «Que Kozmos elija» (`auto`), cuerpo entero (`entero`), arriba y abajo (`aa`), empujar, tirar y piernas (`etp`) o por músculos (`mus`).
4. **Tu tiempo** (`perfil.minutos`).
5. **Tu nivel**: un escalón por movimiento (empujar, tirar, piernas, atrás de las piernas, abdomen) y, solo si los elegiste, aire y flexibilidad.

## Tu semana: el tipo de cada día de fuerza (construido)

- «Que Kozmos elija»: con 3 días o menos, cuerpo entero; con 4, arriba y abajo; con 5 o 6, empujar, tirar y piernas.
- El ciclo avanza solo con los días que tuvieron fuerza (`K.dia.tipoDelDia`), así ningún tipo se saltea.
- Las habilidades van en los días de su movimiento (front lever los de tirar o arriba; una pierna los de piernas o abajo). En cuerpo entero, todas.

| Tipo | Movimientos (en el orden en que se turnan) |
| --- | --- |
| Cuerpo entero | tirar, piernas, empujar, atrás de las piernas, abdomen, remo, hombros |
| Arriba | tirar, empujar, remo, hombros, bíceps, tríceps |
| Abajo | piernas, atrás de las piernas, abdomen, abdomen |
| Empujar | pecho, hombros, fondos, tríceps |
| Tirar | tirar, remo, bíceps, abdomen |
| Piernas | piernas, atrás de las piernas, abdomen, abdomen |
| Pecho y bíceps | pecho, fondos, hombros, bíceps |
| Espalda y tríceps | tirar, remo, tríceps |
| Piernas y abdomen | piernas, atrás de las piernas, abdomen, abdomen |

## El orden dentro del día (construido para la fuerza)

1. **Habilidad**, descansado (criterio de entrenadores, no medido en estudios).
2. **Principales**: varias articulaciones, el músculo grande (tirar, empujar, piernas, atrás de las piernas).
3. **Secundarios**: otro de varias articulaciones para el mismo músculo (remo, hombros, fondos).
4. **Accesorios**: una sola articulación (bíceps, tríceps).
5. **Abdomen**, al final (criterio).

- Dentro de cada escalón del orden se turnan: va primero el que hace más que no tocás. Lo que ya entrena una habilidad va al final de su escalón; si una habilidad ya entrena abdomen, no se suma otro.
- De a dos, solo lo que no se pisa: lados distintos (tira, empuja, piernas) y del mismo escalón del orden o del siguiente. El abdomen va solo.
- Si falta tiempo, se cae lo último del orden: primero el abdomen, después los accesorios. Se cortan movimientos antes que bajar a dos series; con tiempo de sobra, cuatro series.
- Por qué: lo que hacés primero progresa más en fuerza y empezar por lo grande deja mover más carga (ACSM 2009; Simão y otros 2012; Nunes y otros 2021). Para el tamaño del músculo, el orden casi no importa (Nunes 2021). Los pares que no se pisan mantienen la carga (Paz y otros 2017).

## Cuando el día mezcla cosas (construido en parte)

- Lo que elegiste primero va primero (Eddens y otros 2018: con la fuerza antes, las piernas ganan más fuerza; el aire mejora igual en cualquier orden).
- La flexibilidad, siempre al final: estirar quieto más de un minuto antes de hacer fuerza le resta potencia (Behm y otros 2016). Ya lo hace el motor.
- En día de piernas, la resistencia va suave y el día fuerte pasa al próximo. Nunca dos días fuertes seguidos (criterio). Pendiente.

## La versión de cada movimiento (pendiente)

Cada movimiento tiene una versión por estilo de tus formas: con tu cuerpo, kettlebell, mancuernas, barra y discos, máquinas, bandas. Dentro de una sesión se alternan entre movimientos y en la siguiente se cruzan; nunca el mismo ejercicio dos veces en un día. Con tu cuerpo, el escalón de tu nivel; con peso, los kilos de tu nivel. Cada versión progresa por su cuenta.

Huecos que hay que llenar: kettlebell para tirar, empujar y abdomen; gimnasio para fondos y abdomen; las escaleras nuevas de bíceps y tríceps.

## La resistencia (pendiente)

- De cada tres sesiones, dos suaves (que puedas hablar) y una fuerte, a intervalos (Seiler 2010).
- Lo suave es lo que se puede sostener: trote, bici, remo o caminata. Lo fuerte, intervalos con lo que te gusta, con sus escalones. Se turnan entre tus formas.
- Si solo tenés soga o kettlebell, lo suave es caminata rápida.
- La meta de tu rumbo ocupa su lugar (suave o fuerte, según la estrella) cada vez por medio; tu nivel de aire elige la estrella, una más abajo si no entra en tus minutos.
- Vuelta a la calma de 3 minutos después de lo fuerte. Referencia: 150 minutos por semana (Garber y otros 2011).

## La flexibilidad (pendiente)

1. **Posturas de la zona**, de lo general a lo puntual, un minuto cada una en total (2 × 30 s; con yoga, un minuto enlazado). La próxima vez sigue donde quedó (Garber 2011; Thomas y otros 2018: 5 minutos o más por zona por semana).
2. **Tu meta**, con el cuerpo más suelto (criterio).
3. **Fuerza en el rango**: las escaleras de cadera o puente, desde 12 minutos de flexibilidad (criterio).
4. **Respirar**, un minuto.

La zona sale de lo que trabajaste ese día; sin fuerza, se turnan cadera y piernas, hombros y espalda, y todo el cuerpo. Tu nivel de flexibilidad elige el escalón de tu meta.

## Lo que falta construir, en orden

1. Motor por días y orden de la fuerza (este documento, construido).
2. Escaleras de bíceps y tríceps, con sus dibujos.
3. Versiones por forma con su propia progresión, y las versiones con peso que faltan.
4. Resistencia suave y fuerte, y flexibilidad por zonas.
5. «¿Cómo repartís tu semana?» en la bienvenida y en Vos; aire y flexibilidad en Tu nivel.
6. Secuencias de yoga que fluyan (saludo al sol).

## Fuentes

- American College of Sports Medicine (2009). Progression models in resistance training for healthy adults. *Medicine & Science in Sports & Exercise*, 41(3), 687-708.
- Simão R, de Salles BF, Figueiredo T, Dias I, Willardson JM (2012). Exercise order in resistance training. *Sports Medicine*, 42(3), 251-265.
- Nunes JP, Grgic J, Cunha PM y otros (2021). What influence does resistance exercise order have on muscular strength gains and muscle hypertrophy? *European Journal of Sport Science*, 21(2), 149-157.
- Paz GA, Robbins DW y otros (2017). Volume load and neuromuscular fatigue during agonist-antagonist paired-set vs. traditional-set training. *Journal of Strength and Conditioning Research*, 31(10), 2777-2784.
- Seiler S (2010). What is best practice for training intensity and duration distribution in endurance athletes? *International Journal of Sports Physiology and Performance*, 5(3), 276-291.
- Eddens L, van Someren K, Howatson G (2018). The role of intra-session exercise sequence in the interference effect. *Sports Medicine*, 48(1), 177-188.
- Behm DG, Blazevich AJ, Kay AD, McHugh M (2016). Acute effects of muscle stretching on physical performance, range of motion, and injury incidence. *Applied Physiology, Nutrition, and Metabolism*, 41(1), 1-11.
- Garber CE y otros (2011). Quantity and quality of exercise for developing and maintaining fitness in apparently healthy adults. *Medicine & Science in Sports & Exercise*, 43(7), 1334-1359.
- Thomas E, Bianco A, Paoli A, Palma A (2018). The relation between stretching typology and stretching duration: the effects on range of motion. *International Journal of Sports Medicine*, 39(4), 243-254.
- Schoenfeld BJ, Ogborn D, Krieger JW (2016). Effects of resistance training frequency on measures of muscle hypertrophy. *Sports Medicine*, 46(11), 1689-1697.
