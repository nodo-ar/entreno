// Corre todas las pruebas: node suite.js prevX.html [-j 2] [--normal] [chk261 chk262 ...]
// · modo rápido por defecto (fast.js), de a varias en paralelo
// · lo que falla se repite solo y en modo normal: si ahí pasa, era del modo rápido o de tiempos
const {spawn}=require('child_process'); const fs=require('fs'); const os=require('os');
const A=process.argv.slice(2); const src=A.find(a=>/\.html$/.test(a))||'prev216.html';
const J=+(A[A.indexOf('-j')+1]||0)||Math.max(1,os.cpus().length); const normal=A.includes('--normal');
const LISTA=['chk210','chk205','chk202','chk204','chk214','chk215','chk216','chk218','chk219','chk220','chk221','chk223','chk224','chk225','chk226','chk227','chk228','chk229','chk230','chk231','chk232','chk233','chk234','chk235','chk236','chk237','chk238','chk239','chk240','chk241','chk242','chk243','chk244','chk245','chk246','chk247','chk248','chk249','chk250','chk251','chk252','chk253','chk254','chk255','chk256','chk257','chk258','chk259','chk260','chk261','chk262','chk263','chk264','chk265','chk266','chk267','chk268','chk269','chk270','chk271'];
const pedidas=A.filter(a=>/^chk\d+$/.test(a)); const tests=(pedidas.length?pedidas:LISTA).filter(t=>fs.existsSync(`t_${t}.js`));
/* las que dependen de tiempos reales (gestos, animaciones medidas): van en modo normal */
const LENTAS=new Set((fs.existsSync('suite_lentas.txt')?fs.readFileSync('suite_lentas.txt','utf8'):'').split(/\s+/).filter(Boolean));
const correr=(t,rapido)=>new Promise(res=>{ const t0=Date.now(); const args=[...(rapido?['-r','./fast.js']:[]),`t_${t}.js`,src];
  const ch=spawn('node',args,{cwd:__dirname}); let out=''; ch.stdout.on('data',d=>out+=d); ch.stderr.on('data',d=>out+=d);
  const k=setTimeout(()=>{ out+='\nTIMEOUT'; ch.kill('SIGKILL'); },300e3);
  ch.on('close',code=>{ clearTimeout(k); const fallas=out.split('\n').filter(l=>/^FAIL |TIMEOUT|Error:|^\s+at /.test(l)).slice(0,4);
    const fa=out.match(/FALLAS:\n([\s\S]*?)\n(?:ERRS|$)/); if(fa) fallas.unshift(...fa[1].split('\n').filter(Boolean).slice(0,4));
    const ok=code===0&&!fallas.length&&/(bad 0|TODO OK|^BAD \[\]$)/m.test(out)&&!/^BAD \[\s*\n\s*"/m.test(out); res({t,ok,s:(Date.now()-t0)/1000,fallas,out,rapido}); }); });
/* las que miden gestos con tiempos finos: van solas al final, sin otra prueba al lado */
const SOLAS=new Set((fs.existsSync('suite_solas.txt')?fs.readFileSync('suite_solas.txt','utf8'):'').split(/\s+/).filter(Boolean));
const TP=fs.existsSync('suite_tiempos.json')?JSON.parse(fs.readFileSync('suite_tiempos.json','utf8')):{};
(async()=>{ const T0=Date.now(); const ord=L=>L.sort((a,b)=>(TP[b]||60)-(TP[a]||60)); const solas=tests.filter(t=>SOLAS.has(t)); const R=[];
  /* primero las rápidas, después las de tiempos reales (entre ellas no se pisan tanto), al final las que van solas */
  const fases=normal?[ord(tests.filter(t=>!SOLAS.has(t)))]:[ord(tests.filter(t=>!SOLAS.has(t)&&!LENTAS.has(t))),ord(tests.filter(t=>!SOLAS.has(t)&&LENTAS.has(t)))];
  for(const cola of fases){ const worker=async()=>{ while(cola.length){ const t=cola.shift(); const r=await correr(t,!normal&&!LENTAS.has(t)); R.push(r); process.stdout.write(`${r.ok?'✓':'✗'} ${t} ${r.s.toFixed(0)}s${r.rapido?'':' (normal)'}\n`); } };
    await Promise.all(Array.from({length:J},worker)); }
  for(const t of solas){ const r=await correr(t,false); R.push(r); process.stdout.write(`${r.ok?'✓':'✗'} ${t} ${r.s.toFixed(0)}s (sola)\n`); }
  const mal=R.filter(r=>!r.ok); const fin=[];
  /* repetir sirve para descartar fallas de tiempos (1–3 pruebas); si fallan muchas es un cambio real: no se repiten y se informan ya */
  if(mal.length>3){ console.log(`\n${mal.length} fallas: no se repiten (son del cambio, no de tiempos)`); mal.forEach(r=>fin.push([r,r])); }
  else for(const r of mal){ const r2=await correr(r.t,false); process.stdout.write(`  repito ${r.t} en modo normal: ${r2.ok?'pasa':'falla'} (${r2.s.toFixed(0)}s)\n`); fin.push([r,r2]); }
  const reales=fin.filter(([,b])=>!b.ok);
  R.forEach(r=>{ if(r.ok) TP[r.t]=Math.round(r.s); }); fs.writeFileSync('suite_tiempos.json',JSON.stringify(TP));
  fs.writeFileSync('suite_ultima.log',R.map(r=>`== ${r.t} ${r.ok?'ok':'FALLA'} ${r.s.toFixed(1)}s\n${r.out}`).join('\n'));
  console.log(`\n${tests.length} pruebas en ${((Date.now()-T0)/60000).toFixed(1)} min · ${J} en paralelo${normal?' · modo normal':''}`);
  if(fin.length) console.log(`fallaron en la primera vuelta y pasaron solas, en modo normal: ${fin.filter(([,b])=>b.ok).map(([a])=>a.t).join(', ')||'—'}`);
  if(reales.length){ console.log('FALLAN:'); reales.forEach(([,b])=>console.log(`  ${b.t}: ${b.fallas.join(' · ')}`)); } else console.log('TODO OK');
})();
