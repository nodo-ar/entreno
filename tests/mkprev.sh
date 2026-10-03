#!/bin/bash
# Arma una vista previa local del index.html del artifact (le agrega el charset).
# Uso: bash tests/mkprev.sh index.html tests/prev.html
awk 'NR==1{print "<meta charset=\"utf-8\">" $0; next} NR==3{print ""; next} {print}' "$1" > "$2"
