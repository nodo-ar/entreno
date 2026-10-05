// El recorredor, ayudante de la cartógrafa. Ejemplo de la landing de Nodo: adaptá U, las vistas y las tareas.
// Uso: node tools/recorredor.js  (necesita Playwright y la página servida en U)
const {chromium}=require('playwright');const U=process.env.U||'http://127.0.0.1:8790/v3test.html',O=process.env.O||'./recorrido/';
require('fs').mkdirSync(O,{recursive:true});
(async()=>{const b=await chromium.launch();const out=[];
for(const [tag,w,h,cs] of [['d',1280,800,'dark'],['dl',1440,900,'light'],['m',390,844,'light'],['md',360,740,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:h},colorScheme:cs,hasTouch:tag[0]==='m'});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(U);await p.waitForTimeout(1200);
 const st=()=>p.evaluate(()=>({y:Math.round(scrollY),cap:(document.querySelector('.nav a[aria-current]')||{}).textContent||null,chip:document.getElementById('cap-t').textContent,n:document.getElementById('cap-n').textContent,paso:(document.querySelector('#pasos button[aria-current]')||{dataset:{}}).dataset.k,beat:document.querySelector('.beat.on').dataset.b,solid:document.getElementById('top').classList.contains('solid')}));
 await p.screenshot({path:O+tag+'_0top.png'});
 // pasos: ir al 2 y al 4
 for(const k of [2,4]){await p.click(`#pasos button[data-k="${k}"]`);await p.waitForTimeout(1600);const s=await st();out.push([tag,'paso '+k,s.beat==String(k)&&s.paso==String(k)?'ok':'FALLA',JSON.stringify(s)]);await p.screenshot({path:O+tag+'_paso'+k+'.png'});}
 // saltar el recorrido
 await p.click('.saltar-r');await p.waitForTimeout(1600);let s=await st();out.push([tag,'saltar',s.chip.startsWith('Casos')||s.cap==='Casos'?'ok':'FALLA',JSON.stringify(s)]);await p.screenshot({path:O+tag+'_casos.png'});
 // secciones desde el menú o la barra
 for(const [cap,id] of [['Cómo funciona','fiable'],['Apps','apps'],['Por qué','porque'],['Tus datos','recorrido']]){
  if(w>=960){await p.click(`.nav a[href="#${id}"]`);}else{await p.click('#menu-b');await p.waitForTimeout(450);if(cap==='Apps')await p.screenshot({path:O+tag+'_menu.png'});await p.click(`#menu a[href="#${id}"]`);}
  await p.waitForTimeout(1700);s=await st();const top=await p.evaluate(i=>Math.round(document.getElementById(i).getBoundingClientRect().top),id);
  out.push([tag,cap,(s.cap===cap||s.chip===cap)&&Math.abs(top)<80?'ok':'FALLA',JSON.stringify(s)+' top='+top]);
  if(cap!=='Tus datos')await p.screenshot({path:O+tag+'_'+id+'.png'});}
 // instalar desde arriba
 await p.click('.top .btn.luz');await p.waitForTimeout(1700);s=await st();out.push([tag,'Instalar',s.chip==='Instalar'?'ok':'FALLA',JSON.stringify(s)]);
 if(w<960){await p.click('#menu-b');await p.waitForTimeout(400);await p.keyboard.press('Escape');await p.waitForTimeout(400);const o=await p.evaluate(()=>({open:document.getElementById('menu').classList.contains('open'),foco:document.activeElement.id,inert:document.querySelector('main').inert}));out.push([tag,'Esc cierra',!o.open&&o.foco==='menu-b'&&!o.inert?'ok':'FALLA',JSON.stringify(o)]);}
 // teclado
 await p.goto(U);await p.waitForTimeout(800);await p.keyboard.press('Tab');const f=await p.evaluate(()=>document.activeElement.textContent.trim());out.push([tag,'1er Tab',f==='Saltar el recorrido'?'ok':'FALLA',f]);await p.screenshot({path:O+tag+'_tab.png'});
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);out.push([tag,'sin desborde',ov?'FALLA':'ok','']);out.push([tag,'errores',errs.length?'FALLA':'ok',errs.slice(0,3).join(' | ')]);
 const tgt=await p.evaluate(()=>[...document.querySelectorAll('.top a,.top button,#pasos button,#pasos a')].filter(e=>e.offsetWidth).map(e=>{const r=e.getBoundingClientRect();return [e.textContent.trim().slice(0,14),Math.round(r.width),Math.round(r.height)]}).filter(x=>x[2]<32||x[1]<32));out.push([tag,'objetivos <32px',tgt.length?'MIRAR':'ok',JSON.stringify(tgt)]);
 await p.close();}
await b.close();for(const r of out)console.log(r.join(' · '));})();
