#!/bin/bash
# Arma la vista previa con el mismo script que publica: así se prueba lo mismo que se sube.
# Uso (desde la raíz): bash tests/mkprev.sh prev.html
cd "$(dirname "$0")/.." && node tools/armar.js --html "${@: -1}"
