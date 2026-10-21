#!/usr/bin/env bash
# La firma de Kozmos: deja el almacén de claves listo para Gradle sin que nadie lo vea.
#
# Dónde vive: cifrado con la frase del secreto KOZMOS_FIRMA, como adjunto «kozmos-firma.cifrada» de un BORRADOR de
# release llamado «kozmos-firma» (los borradores no son públicos: solo los ve quien puede escribir en el repo).
# - Si está: lo baja y lo descifra con la frase. Si la frase no lo abre, frena (nunca crea otra firma encima).
# - Si no está y nunca se publicó una versión: crea la firma una sola vez, la cifra, prueba que se descifra y la guarda.
# - Si no está pero ya hay versiones publicadas: frena. Una firma nueva no se instala encima de la vieja.
#
# Uso (lo corre el workflow «Kozmos · versión»):
#   KOZMOS_FIRMA=… GH_TOKEN=… GITHUB_REPOSITORY=dueño/repo bash kozmos/apk/tools/firma.sh <carpeta>
# Deja <carpeta>/kozmos.p12 y, en $GITHUB_ENV, KOZMOS_ALMACEN y KOZMOS_ALMACEN_CLAVE (enmascarada en el registro).
set -euo pipefail

D=${1:?falta la carpeta}
TAG=kozmos-firma
ARCH=kozmos-firma.cifrada
ENV_OUT=${GITHUB_ENV:-/dev/null}
SUMARIO=${GITHUB_STEP_SUMMARY:-/dev/null}
# AES-256 con la clave derivada de la frase por PBKDF2 (600.000 vueltas): adivinar una frase de cinco palabras no termina nunca
CIFRA=(-aes-256-cbc -pbkdf2 -iter 600000 -md sha256 -salt)

falla(){ echo "::error title=Firma de Kozmos::$1"; echo "### No se armó: $1" >> "$SUMARIO"; exit 1; }

[ -n "${KOZMOS_FIRMA:-}" ] || falla "Falta el secreto KOZMOS_FIRMA. Cargalo en Settings → Secrets and variables → Actions → New repository secret (pasos en kozmos/apk/README.md). Sin él no se publica una versión."
largo=$(printf %s "$KOZMOS_FIRMA" | wc -m); palabras=$(printf %s "$KOZMOS_FIRMA" | wc -w)
if [ "$largo" -lt 25 ] || [ "$palabras" -lt 4 ]; then
  falla "La frase de KOZMOS_FIRMA es muy corta: tienen que ser al menos 4 palabras y 25 letras (mejor 5 o 6 palabras sueltas). Cambiá el secreto por una más larga."
fi

mkdir -p "$D"; chmod 700 "$D"
umask 077

# los releases del repo, borradores incluidos (el token del workflow puede verlos porque tiene permiso de escritura)
lista=$(gh api --paginate "repos/$GITHUB_REPOSITORY/releases?per_page=100" \
  --jq '.[] | [.tag_name, ([.assets[] | select(.name == "'"$ARCH"'") | .url] | first // "")] | @tsv')
url=$(awk -F'\t' -v t="$TAG" '$1 == t && $2 != "" { print $2; exit }' <<<"$lista")

if [ -n "$url" ]; then
  gh api -H "Accept: application/octet-stream" "$url" > "$D/$ARCH"
  if ! openssl enc -d "${CIFRA[@]}" -pass env:KOZMOS_FIRMA -in "$D/$ARCH" | tar -xz -C "$D"; then
    falla "La frase de KOZMOS_FIRMA no abre la firma guardada. ¿Cambió el secreto? Volvé a cargar la frase original. No se crea una firma nueva: las APK firmadas con otra no se instalan encima."
  fi
  echo "Firma de Kozmos: la guardada (descifrada con la frase)."
else
  if grep -Eq '^kozmos-[0-9]+[[:space:]]' <<<"$lista"; then
    falla "Ya hay versiones de Kozmos publicadas pero no encuentro la firma (el borrador «$TAG» con «$ARCH»). No creo otra: no se instalaría encima. Si se borró, hay que recuperarla (README de kozmos/apk)."
  fi
  clave=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 40)
  printf %s "$clave" > "$D/clave"
  keytool -genkeypair -keystore "$D/kozmos.p12" -storetype PKCS12 -storepass "$clave" -keypass "$clave" \
    -alias kozmos -keyalg RSA -keysize 4096 -validity 18250 -dname "CN=Kozmos, O=Nodo, C=AR" >/dev/null 2>&1
  tar -cz -C "$D" kozmos.p12 clave | openssl enc -e "${CIFRA[@]}" -pass env:KOZMOS_FIRMA -out "$D/$ARCH"
  # antes de guardarla, se prueba que la frase la abre y que adentro está lo mismo
  mkdir -p "$D/prueba"
  openssl enc -d "${CIFRA[@]}" -pass env:KOZMOS_FIRMA -in "$D/$ARCH" | tar -xz -C "$D/prueba"
  cmp -s "$D/prueba/kozmos.p12" "$D/kozmos.p12" && cmp -s "$D/prueba/clave" "$D/clave" || falla "La firma cifrada no se pudo descifrar al probarla. No se guardó nada."
  rm -rf "$D/prueba"
  gh release create "$TAG" "$D/$ARCH" --repo "$GITHUB_REPOSITORY" --draft --title "Firma de Kozmos · no borrar" --notes \
"Este borrador guarda la firma de la APK de Kozmos, cifrada con la frase del secreto KOZMOS_FIRMA. No lo publiques ni lo borres: sin la firma, las versiones nuevas no se instalan encima de las viejas. Sin la frase, el archivo no sirve para nada."
  echo "Firma de Kozmos: nueva, creada y guardada cifrada en el borrador «$TAG»."
  echo "### Se creó la firma de Kozmos" >> "$SUMARIO"
  echo "Quedó cifrada en el borrador de release «$TAG». Bajá una copia de ese archivo y guardala junto con la frase (README de kozmos/apk)." >> "$SUMARIO"
fi

clave=$(cat "$D/clave")
echo "::add-mask::$clave"
huella=$(keytool -list -v -keystore "$D/kozmos.p12" -storetype PKCS12 -storepass "$clave" -alias kozmos 2>/dev/null | awk -F': ' '/SHA256:/ { print $2; exit }')
[ -n "$huella" ] || falla "No pude leer la firma descifrada."
echo "Huella SHA-256 de la firma: $huella"
{
  echo "KOZMOS_ALMACEN=$D/kozmos.p12"
  echo "KOZMOS_ALMACEN_CLAVE=$clave"
  echo "KOZMOS_HUELLA=$huella"
} >> "$ENV_OUT"
