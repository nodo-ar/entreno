#!/usr/bin/env node
// Elige el invitado al azar de una vuelta del Equipo Nodo.
// Siempre el mismo para el mismo proyecto y vuelta; nunca el elegido ni uno de la vuelta anterior.
// Uso: node tools/elegir-equipo.mjs <proyecto> <vuelta> [invitado-elegido] [azar-de-la-vuelta-anterior]
// Ej.:  node tools/elegir-equipo.mjs landing-nodo 4 cartografa
// Si el plantel cambió desde la vuelta anterior, pasá quién salió al azar entonces (está en el acta).

const PLANTEL = [
  'guionista', 'tonto', 'nulo', 'editora', 'directora-de-arte', 'animador', 'periodista',
  'ingeniera-de-campo', 'abuela', 'soberano', 'abogada', 'atacante', 'competidor',
  'historiador', 'tesorera', 'marco-aurelio', 'cartografa',
];

const [proyecto, vueltaTxt, elegido = '', anteriorDicho = ''] = process.argv.slice(2);
if (!proyecto || !vueltaTxt) {
  console.error('Uso: node tools/elegir-equipo.mjs <proyecto> <vuelta> [invitado-elegido] [azar-anterior]');
  process.exit(1);
}
const vuelta = Number.parseInt(vueltaTxt, 10);
if (!Number.isInteger(vuelta) || vuelta < 1) { console.error('La vuelta es un número desde 1.'); process.exit(1); }
if (elegido && !PLANTEL.includes(elegido)) { console.error(`"${elegido}" no está en el plantel: ${PLANTEL.join(', ')}`); process.exit(1); }

// FNV-1a: el mismo texto da siempre el mismo número
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const azar = (v, excluir) => {
  const libres = PLANTEL.filter((x) => !excluir.includes(x));
  return libres[hash(`${proyecto}#${v}`) % libres.length];
};

// la vuelta anterior se recalcula con la misma regla, para no repetir
const anterior = anteriorDicho || (vuelta > 1 ? azar(vuelta - 1, []) : null);
const invitado = azar(vuelta, [elegido, anterior].filter(Boolean));

console.log(JSON.stringify({
  proyecto, vuelta,
  nucleo: ['la persona', 'casandra', 'la tijera'],
  elegido: elegido || null,
  azar: invitado,
}, null, 2));
