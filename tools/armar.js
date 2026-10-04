// Arma el sitio que publica GitHub Pages: copia la app tal cual y le pone la versión.
// La versión sale del commit: "v269" en la etiqueta, "v269+N · abc1234" con N commits encima.
// Uso: node tools/armar.js _site
const fs=require('fs'); const path=require('path'); const {execSync}=require('child_process');
const RAIZ=path.join(__dirname,'..'); const D=path.resolve(process.argv[2]||'_site');
const git=c=>execSync('git '+c,{cwd:RAIZ,stdio:['ignore','pipe','ignore']}).toString().trim();

/* base: la última etiqueta vNNN; si todavía no está, la APP_V de index.html contando desde el commit que la puso */
function version(base){
  const fmt=(t,n,sha)=>+n?`${t}+${n} · ${sha}`:t;
  try{ const m=git('describe --tags --match "v[0-9]*" --long --abbrev=7').match(/^(v\d+)-(\d+)-g([0-9a-f]+)$/); if(m) return fmt(m[1],m[2],m[3]); }catch(e){}
  try{ const c=git(`log -1 --format=%H -S 'const APP_V="${base}"' -- index.html`); if(c) return fmt(base,git(`rev-list --count ${c}..HEAD`),git('rev-parse --short=7 HEAD')); }catch(e){}
  return null; }

let h=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8');
const re=/const APP_V="([^"]*)"/; const m=h.match(re); if(!m) throw new Error('no encuentro APP_V en index.html');
const v=version(m[1]); if(v) h=h.replace(re,`const APP_V="${v}"`);
fs.rmSync(D,{recursive:true,force:true}); fs.mkdirSync(D,{recursive:true});
fs.writeFileSync(path.join(D,'index.html'),h);
for(const f of ['sw.js','manifest.webmanifest']) fs.copyFileSync(path.join(RAIZ,f),path.join(D,f));
for(const d of ['ex','prog','iconos','assets/fonts']) fs.cpSync(path.join(RAIZ,d),path.join(D,d),{recursive:true});
fs.writeFileSync(path.join(D,'.nojekyll'),'');
console.log(`armado ${path.relative(RAIZ,D)} · versión ${v||m[1]}`);
