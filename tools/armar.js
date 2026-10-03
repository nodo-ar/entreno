// Arma la página publicable a partir de index.html, sin tocarlo.
// · le agrega la cabecera que antes ponía claude.ai (doctype, charset, viewport)
// · el manifiesto y los íconos para instalarla como app
// · la versión sale del commit: v269 en la etiqueta, v269.N con N cambios encima
// Uso: node tools/armar.js --html prev.html   (solo la página: la vista previa de las pruebas)
//      node tools/armar.js --sitio _site      (el sitio entero: lo que publica GitHub Pages)
const fs=require('fs'); const path=require('path'); const {execSync}=require('child_process');
const RAIZ=path.join(__dirname,'..');
const A=process.argv.slice(2); const arg=k=>{ const i=A.indexOf(k); return i>=0?A[i+1]:null; };

const git=c=>execSync('git '+c,{cwd:RAIZ,stdio:['ignore','pipe','ignore']}).toString().trim();
/* base: la última etiqueta vNNN; si no hay, la APP_V de index.html contando desde el commit que la puso */
function version(base){
  if(process.env.APP_V) return process.env.APP_V;
  try{ const m=git('describe --tags --match "v[0-9]*" --long').match(/^(v\d+)-(\d+)-g[0-9a-f]+$/); if(m) return +m[2]?`${m[1]}.${m[2]}`:m[1]; }catch(e){}
  try{ const c=git(`log -1 --format=%H -S 'const APP_V="${base}"' -- index.html`); if(c){ const n=+git(`rev-list --count ${c}..HEAD`); return n?`${base}.${n}`:base; } }catch(e){}
  return null; }

function pagina(){
  let h=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8');
  const v=version((h.match(/const APP_V="([^"]*)"/)||[])[1]);
  if(v){ const re=/const APP_V="[^"]*"/; if(!re.test(h)) throw new Error('no encuentro APP_V en index.html'); h=h.replace(re,`const APP_V="${v}"`); }
  const cab=['<!doctype html>','<html lang="es">','<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="theme-color" content="#0c0f14" media="(prefers-color-scheme: dark)">',
    '<meta name="theme-color" content="#f3f1ec" media="(prefers-color-scheme: light)">',
    '<link rel="manifest" href="manifest.webmanifest">',
    '<link rel="icon" href="iconos/icono.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="iconos/icono-180.png">'].join('\n');
  return {html:cab+'\n'+h,v}; }

const html=arg('--html'), sitio=arg('--sitio');
if(!html&&!sitio){ console.error('uso: node tools/armar.js --html prev.html | --sitio _site'); process.exit(1); }
const {html:H,v}=pagina();
if(html){ fs.writeFileSync(path.resolve(html),H); }
if(sitio){ const D=path.resolve(sitio); fs.rmSync(D,{recursive:true,force:true}); fs.mkdirSync(D,{recursive:true});
  fs.writeFileSync(path.join(D,'index.html'),H);
  for(const f of ['sw.js','manifest.webmanifest']) fs.copyFileSync(path.join(RAIZ,f),path.join(D,f));
  for(const d of ['ex','prog','iconos']) fs.cpSync(path.join(RAIZ,d),path.join(D,d),{recursive:true});
  fs.writeFileSync(path.join(D,'.nojekyll'),''); }
console.log(`armado ${[html,sitio].filter(Boolean).join(' y ')} · versión ${v||'la de index.html'}`);
