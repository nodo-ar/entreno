#!/usr/bin/env bash
# Notas de una versión de Kozmos, en palabras de la gente: lo que cambió en la app desde la versión anterior
# (los títulos de los commits que tocan kozmos/, sin «Kozmos:» ni el número de PR) y cómo instalarla.
# Uso: bash kozmos/apk/tools/notas.sh <número> <huella>   (escribe en la salida)
set -euo pipefail
N=${1:?falta el número}; HUELLA=${2:-}
REPO=${GITHUB_REPOSITORY:-nodo-ar/entreno}
antes=$(git tag --list 'kozmos-[0-9]*' --sort=-v:refname | grep -Ev "^kozmos-$N\$" | head -1 || true)
echo "## Qué trae"
echo
if [ -z "$antes" ]; then
  echo "- Primera versión de Kozmos para Android. Abre sin conexión desde la primera vez y tus datos quedan en el teléfono."
else
  git log --no-merges --format='%s' "$antes..HEAD" -- kozmos/ ':!kozmos/apk/tools' \
    | sed -E 's/^Kozmos( APK)?: *//; s/ *\(#[0-9]+\)$//' | grep -v '^$' | awk '!v[$0]++' | head -12 \
    | while IFS= read -r l; do printf -- '- %s%s\n' "$(printf %s "${l:0:1}" | tr '[:lower:]' '[:upper:]')" "${l:1}"; done
  [ -n "$(git log --format=%h "$antes..HEAD" -- kozmos/ | head -1)" ] || echo "- Arreglos chicos."
fi
cat <<FIN

## Cómo instalarla

1. En el teléfono, abrí este enlace: https://github.com/$REPO/releases/latest/download/kozmos.apk
2. Cuando termine de bajar, tocá el archivo. Si Android pregunta, permití instalar apps desde ese navegador.
3. Si ya tenías Kozmos, se instala encima y tus datos quedan como estaban.

Antes de una actualización grande conviene guardar un respaldo: Vos → Respaldo → Guardar un respaldo.
FIN
if [ -n "$HUELLA" ]; then
  echo
  echo "<sub>Firma (SHA-256): \`$HUELLA\`. Si alguna vez cambia, no la instales y avisá.</sub>"
fi
