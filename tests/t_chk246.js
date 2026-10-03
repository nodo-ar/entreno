const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[], bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); else console.log('ok ',m); };
const p=await (await b.newContext({viewport:{width:844,height:390}})).newPage(); p.on('pageerror',e=>errs.push(e.message)); const E=(f,a)=>p.evaluate(f,a), W8=ms=>p.waitForTimeout(ms);
await p.goto('http://127.0.0.1:8765/'+src); await W8(500); await seed(p); await W8(600);
await E(()=>{ document.querySelectorAll('.celov').forEach(x=>x.remove()); CELON=true; ['lp','swipe','scrub','mini2'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; CFG.altura=180; CFG.edad=29; CFG.sexo='m'; saveCfg(); });
// ---- Todas las sesiones: lista y detalle
await E(()=>{ todoSel=null; histEx='todo'; go('stat'); }); await W8(1200);
const t1=await E(()=>{ const a=document.querySelector('#app'); const on=a.querySelector('.splside .swr.on'); const s=on&&SESS.find(x=>x.id===on.dataset.sid); const h=a.querySelector('#splHost .view.emb h1'); return {spl:!!a.querySelector('.spl'),on:!!on,h:h&&h.textContent.trim(),t:s&&s.tipo,backs:a.querySelectorAll('#back').length,hd:!!a.querySelector('.splside .splhd h1')}; });
ok(t1.spl&&t1.on&&t1.h===t1.t&&t1.backs===1&&t1.hd,'Todas: lista a la izquierda con la elegida marcada y su detalle a la derecha · '+JSON.stringify(t1));
ok(await E(()=>document.querySelector('#app .splhd h1').textContent.trim()==='Sesiones'&&!!document.querySelector('#app .splhd #tfPick')&&!document.querySelector('#app .splside .chipsrow,#app .splside .swfil')),'Todas: título corto y el filtro en un menú');
await E(()=>document.querySelector('#tfPick').click()); await W8(500);
await E(()=>document.querySelector('.cmpop [data-cm="fuerza"]').click()); await W8(900);
ok(await E(()=>todoFil==='fuerza'&&/Fuerza/.test(document.querySelector('#tfPick').textContent)&&[...document.querySelectorAll('#app .splside .swr[data-sid]')].every(r=>SESS.find(x=>x.id===r.dataset.sid).kind==='fuerza')),'Todas: el menú filtra la lista');
await E(()=>{ todoFil='todas'; render(); }); await W8(700);
await E(()=>{ const r=[...document.querySelectorAll('#app .splside .swr[data-sid] .swf[data-open]')][2]; r.click(); }); await W8(900);
const t2=await E(()=>{ const on=document.querySelector('#app .splside .swr.on'); const s=SESS.find(x=>x.id===on.dataset.sid); return {v:view,h:document.querySelector('#app #splHost h1').textContent.trim(),t:s.tipo,i:[...document.querySelectorAll('#app .splside .swr[data-sid]')].indexOf(on)}; });
ok(t2.v==='stat'&&t2.h===t2.t&&t2.i===2,'Todas: tocar otra la muestra a la derecha sin salir · '+JSON.stringify(t2));
await E(()=>document.querySelector('#back').click()); await W8(900); ok(await E(()=>view!=='stat'),'Todas: volver sale de la lista');
// ---- Programas
await E(()=>{ prPick=null; prFil='todo'; progFrom='home'; go('programas'); }); await W8(1400);
const p1=await E(()=>{ const a=document.querySelector('#app'); const on=a.querySelector('.splside [data-prog].on'); const m=on&&(on.dataset.prog==='rot'?ROT_P:progMeta(on.dataset.prog)); return {spl:!!a.querySelector('.spl'),on:!!on,h:(a.querySelector('#splHost h1')||{}).textContent,n:m&&m.n}; });
ok(p1.spl&&p1.on&&p1.h&&p1.h.trim()===p1.n,'Programas: el elegido marcado y su ficha a la derecha · '+p1.n);
ok(await E(()=>!document.querySelector('#app .splside [data-hero]')),'Rutinas: sin desafíos en la lista');
await E(()=>{ prPick=null; dsFil='todo'; go('desafios'); }); await W8(1000);
await E(()=>document.querySelectorAll('#app .splside [data-hero]')[1].click()); await W8(1000);
ok(await E(()=>view==='desafios'&&prPick.t==='h'&&!!document.querySelector('#app .splside [data-hero].on')&&document.querySelector('#app #splHost h1').textContent.includes(heroOf(prPick.id).n)),'Desafíos: el elegido se abre a la derecha');
await E(()=>{ prPick=null; prFil='todo'; go('programas'); }); await W8(1000);
ok(await E(()=>!document.querySelector('#app .swfil')&&!!document.querySelector('#app .splhd #prPickB')),'Programas: sin fila de filtros, menú en el encabezado');
await E(()=>document.querySelector('#prPickB').click()); await W8(500);
await E(()=>document.querySelector('.cmpop [data-cm="b"]').click()); await W8(900);
ok(await E(()=>prFil==='b'&&document.querySelectorAll('#app .splside .on[data-prog],#app .splside .on[data-hero]').length===1&&!!document.querySelector('#app #splHost h1')),'Programas: al filtrar, queda uno elegido');
// ---- Ajustes: todo a la derecha
await E(()=>{ ajSec=null; go('ajustes'); }); await W8(1000);
for(const [sec,chk] of [['equipo','#splHost .view'],['catalogo','#splHost input'],['molestias','#splHost .view'],['programas','#splHost [data-prog]']]){
  await E(sec=>document.querySelector(`#app .ajside [data-sec="${sec}"]`).click(),sec); await W8(1000);
  ok(await E(([sec,chk])=>view==='ajustes'&&ajSec===sec&&!!document.querySelector('#app '+chk)&&getComputedStyle(document.querySelector('#app .ajmh')).display!=='none'&&!document.querySelector('#app #splHost h1')&&document.querySelectorAll('#back').length===1&&![...document.querySelectorAll('#app #splHost .topbar')].some(t=>t.offsetHeight>0&&!t.querySelector('button')),[sec,chk]),'Ajustes: '+sec+' se abre a la derecha, con un solo título y sin hueco arriba');
}
await E(()=>document.querySelector('#app #splHost [data-prog]').click()); await W8(1300);
ok(await E(()=>view==='programas'&&prPick&&prPick.t==='p'&&!!document.querySelector('#app .splside [data-prog].on')),'Ajustes › Programas: tocar uno lo abre en Programas, elegido');
await E(()=>{ ajSec='molestias'; molSel=null; go('ajustes'); }); await W8(1000);
ok(await E(()=>!document.querySelector('#app #fmNo,#app #fmOk')),'Ajustes › Molestias: sin Cancelar ni Listo');
await E(()=>{ CFG.molestias=[]; saveCfg(); render(); }); await W8(600);
await E(()=>document.querySelector('#app #splHost [data-art="rodilla"]').click()); await W8(700);
ok(await E(()=>molActivas().some(m=>m.a==='rodilla')&&!!document.querySelector('#utoast .utu')&&document.querySelector('#app #splHost [data-art="rodilla"]').classList.contains('on')&&/1 activa/.test(document.querySelector('#app .ajside [data-sec="molestias"]').textContent)),'Ajustes › Molestias: tocar una zona la guarda al instante');
await E(()=>document.querySelector('#utoast .utu').click()); await W8(700);
ok(await E(()=>!molActivas().some(m=>m.a==='rodilla')),'Ajustes › Molestias: deshacer la saca');
await E(()=>{ const hoy=hoyISO(); CFG.molestias=[{a:'hombro',desde:hoy,hasta:addDays(hoy,6)}]; saveCfg(); molDur=7; render(); }); await W8(600);
await E(()=>document.querySelector('#app #splHost [data-dur="14"]').click()); await W8(600);
ok(await E(()=>molActivas()[0].hasta===addDays(hoyISO(),13)),'Ajustes › Molestias: la duración extiende la activa');
await E(()=>{ CFG.molestias=[]; saveCfg(); }); await W8(200);
// ---- alineación: el título del panel en la línea del título de la izquierda, mismos anchos
const hdr=async()=>E(()=>{ const c=s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return r.y+r.height/2; }; return {l:c('#app .splhd>h1,#app .ajside>h1'),r:c('#app .splmain>.view>h1,#app .ajmh'),w:Math.round((document.querySelector('#app .splside,#app .ajside')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width)}; });
const H=[];
for(const f of [()=>{ ajSec='semana'; go('ajustes'); },()=>{ todoSel=null; histEx='todo'; go('stat'); },()=>{ prPick=null; prFil='todo'; go('programas'); },()=>{ catFrom='home'; exSel=null; go('catalogo'); }]){ await E(f); await W8(900); H.push(await hdr()); }
ok(H.every(h=>h.l&&h.r&&Math.abs(h.l-h.r)<=3)&&H.every(h=>h.w===H[0].w),'Vistas divididas: títulos alineados y el mismo ancho a la izquierda · '+JSON.stringify(H));
// ---- columna izquierda: encabezado sin fondo, la lista corre sola, la elegida pinta toda la franja
const fillOk=async sel=>E(sel=>{ const r=document.querySelector(sel); if(!r) return 'sin '+sel; const c=r.parentElement.getBoundingClientRect(), a=r.getBoundingClientRect(); return Math.abs(a.left-c.left)<=1.5&&Math.abs(c.right-a.right)<=1.5?true:[a.left-c.left,c.right-a.right]; },sel);
const FL=[];
for(const [f,sel] of [[()=>{ bike.running=false; bkPick=null; go('bici'); },'#app .splscr .fzr.on'],[()=>{ fzPick=null; draft=null; go('fuerza'); },'#app .splscr .fzr.on'],[()=>{ estPick=null; go('estirar'); },'#app .splscr .fzr.on'],[()=>{ prPick=null; prFil='todo'; go('programas'); },'#app .splscr .prr.on'],[()=>{ catFrom='home'; exSel=null; go('catalogo'); },'#app .splscr .srow.on'],[()=>{ ajSec='equipo'; go('ajustes'); },'#app .ajroot .ajrow.on']]){ await E(f); await W8(900); FL.push(await fillOk(sel)); }
ok(FL.every(x=>x===true),'Columna izquierda: la elegida llega a los bordes de su tarjeta · '+JSON.stringify(FL));
await E(()=>{ todoSel=null; todoFil='todas'; histEx='todo'; go('stat'); }); await W8(900);
const sc1=await E(async()=>{ const h=document.querySelector('#app .splhd'), s=document.querySelector('#app .splscr'); const cs=getComputedStyle(h); const y0=h.getBoundingClientRect().top; s.scrollTop=200; await new Promise(r=>setTimeout(r,200)); return {bg:cs.backgroundColor,bf:cs.backdropFilter,moved:s.scrollTop>0,hy:Math.abs(h.getBoundingClientRect().top-y0),win:window.scrollY}; });
ok((sc1.bg==='rgba(0, 0, 0, 0)'||sc1.bg==='transparent')&&(sc1.bf==='none'||!sc1.bf)&&sc1.moved&&sc1.hy<1&&sc1.win===0,'Columna izquierda: encabezado sin fondo y quieto; la lista corre debajo · '+JSON.stringify(sc1));
await E(()=>{ catFrom='ajustes'; exSel=Object.values(CAT).filter(exOk).slice(-3)[0].n; go('catalogo'); }); await W8(1100);
ok(await E(()=>{ const r=document.querySelector('#app .splscr .srow.on'), q=document.querySelector('#app .splscr').getBoundingClientRect(); const b=r&&r.getBoundingClientRect(); return !!b&&b.top>=q.top-1&&b.bottom<=q.bottom+1; }),'Catálogo: al entrar con uno elegido de abajo, queda a la vista');
// ---- Catálogo: lista y ficha
await E(()=>{ catFrom='home'; exSel=null; go('catalogo'); }); await W8(1000);
const c1=await E(()=>{ const on=document.querySelector('#app .splside [data-ex].on'); return {on:on&&on.dataset.ex,h:(document.querySelector('#app .splmain h1')||{}).textContent,sel:exSel,pad:getComputedStyle(document.querySelector('#app .splmain h1')).paddingRight}; });
ok(c1.on&&c1.on===c1.sel&&c1.h===c1.sel&&c1.pad==='0px','Catálogo: el elegido y su ficha a la derecha · '+JSON.stringify(c1));
const c2=await E(()=>{ const r=[...document.querySelectorAll('#app .splside [data-ex]')][2]; r.click(); return r.dataset.ex; }); await W8(900);
ok(await E(n=>view==='catalogo'&&exSel===n&&document.querySelector('#app .splmain h1').textContent===n,c2),'Catálogo: tocar otro cambia la ficha sin salir');
// ---- Cardio y Movilidad
await E(()=>{ bike.running=false; bkPick=null; go('bici'); }); await W8(1100);
const b1=await E(()=>{ const r=[...document.querySelectorAll('#app .splside [data-bsel]')]; const on=document.querySelector('#app .splside [data-bsel].on'); return {n:r.length,on:on&&on.dataset.bsel,h:document.querySelector('#app .splmain .fzhero b').textContent}; });
ok(b1.n>=3&&b1.on&&b1.h.startsWith(b1.on),'Cardio: la sugerida marcada y a la derecha · '+JSON.stringify(b1));
const b2=await E(()=>{ const r=[...document.querySelectorAll('#app .splside [data-bsel]')][2]; r.click(); return r.dataset.bsel; }); await W8(900);
ok(await E(k=>bkPick===k&&document.querySelector('#app .splmain .fzhero b').textContent.startsWith(k)&&!document.querySelector('.pop'),b2),'Cardio: tocar otra la muestra a la derecha, sin menú');
await E(()=>{ estPick=null; go('estirar'); }); await W8(1100);
await E(()=>document.querySelector('#app #estZ').click()); await W8(800);
await E(()=>document.querySelector('#app [data-ezp]').click()); await W8(800);
ok(await E(()=>estPick==='zonas'&&estSel.z.length>=1&&!document.querySelector('#app #estGo').disabled),'Movilidad: elegir zonas se arma a la derecha');
// ---- Fuerza
await E(()=>{ draft=null; fzPick=null; go('fuerza'); }); await W8(1300);
const f1=await E(()=>{ const a=document.querySelector('#app'); const on=a.querySelector('.splside .fzr.on'); return {spl:!!a.querySelector('.spl'),on:on&&on.dataset.fsel,tag:!!(on&&on.querySelector('.fztag')),h:a.querySelector('.splmain .fzhero b').textContent,sug:nextTipo()}; });
ok(f1.spl&&f1.on===f1.sug&&f1.tag&&f1.h===f1.sug,'Fuerza: la que toca marcada y a la derecha · '+JSON.stringify(f1));
const alt=await E(()=>{ const r=[...document.querySelectorAll('#app .splside [data-fsel]')].find(x=>x.dataset.fsel!==nextTipo()&&x.dataset.fsel!=='Libre'); r.click(); return r.dataset.fsel; }); await W8(900);
ok(await E(alt=>document.querySelector('#app .splmain .fzhero b').textContent===alt&&/Otra opción/.test(document.querySelector('#app .splmain .fzhero small').textContent)&&!document.querySelector('.pop'),alt),'Fuerza: tocar otra la muestra a la derecha, sin menú · '+alt);
await E(()=>document.querySelector('#goFz').click()); await W8(1300);
ok(await E(alt=>!!draft&&draft.tipo===alt,alt),'Fuerza: Empezar arranca la elegida');
// ---- sesión: historial a la derecha
await E(()=>{ cur=0; loadStepper(); render(); }); await W8(900);
const hs=await E(()=>{ const x=document.querySelector('#excard .exprev'); return x&&{d:getComputedStyle(x).display,n:x.querySelectorAll('.expr1').length}; });
ok(hs&&hs.d==='block'&&hs.n>=1,'Sesión: el historial del ejercicio ocupa el panel derecho · '+JSON.stringify(hs));
await E(()=>{ draft=null; try{ saveDraft&&saveDraft(); }catch(e){} go('home'); }); await W8(600);
// ---- Cuerpo: control segmentado, marcas, figura
await E(()=>{ resumenWk=semanaKey(hoyISO()); resMode='sem'; go('resumen'); }); await W8(1000);
const sg=async()=>E(()=>{ const i=document.querySelector('#app .segx .segind, #tbact .segx .segind'), bt=document.querySelector('#app .segx button.on, #tbact .segx button.on'); const a=i.getBoundingClientRect(), c=bt.getBoundingClientRect(); return Math.abs(a.width-c.width)<2&&Math.abs(a.left-c.left)<2; });
ok(await sg(),'Segmentado: la pastilla mide lo que su botón');
await p.setViewportSize({width:1000,height:420}); await W8(600); ok(await sg(),'Segmentado: al cambiar el ancho, la pastilla acompaña');
await E(()=>{ bodySel=null; bodyCapa='f'; go('cuerpo'); }); await W8(900);
ok(await E(()=>{ const g=document.querySelector('#app .topbar .tbgrp'), c=g&&g.querySelector('#capaBtn'), q=g&&g.querySelector('[data-info]'); if(!c||!q) return false; const G=g.getBoundingClientRect(), r=c.getBoundingClientRect(), t=q.getBoundingClientRect(); return /Series/.test(c.getAttribute('aria-label'))&&r.left>=G.left&&t.right<=G.right&&r.right<=t.left+1; }),'Cuerpo: capas y ? dentro de su cápsula, la capa en la etiqueta');
await p.setViewportSize({width:844,height:390}); await W8(400);
ok(await E(()=>document.querySelectorAll('#app .bmlh .tk').length===2&&!/lime/.test(getComputedStyle(document.querySelector('#app .track.band')).backgroundImage)),'Cuerpo: marcas neutras en 10 y 20, sin la franja verde');
ok(await E(()=>{ const a=document.querySelector('#app .bmap .bsil').getAttribute('d'); CFG.sexo='f'; render(); const b=document.querySelector('#app .bmap .bsil').getAttribute('d'); CFG.sexo='m'; render(); return a===BODY_SIL&&b===BODY_SIL_F; }),'Cuerpo: figura de mujer según el perfil');
// ---- Vos y Ajustes
await E(()=>{ go('vos'); }); await W8(1000);
ok(await E(()=>!document.querySelector('#app .vlist')&&/180 cm · 29 años/.test(document.querySelector('#vDatos').textContent)),'Vos: tus datos bajo el nombre, sin la lista de abajo');
await E(()=>document.querySelector('#vDatos').click()); await W8(900); ok(await E(()=>view==='ajustes'&&ajSec==='vos'),'Vos: tus datos abre Ajustes');
ok(await E(()=>!!document.querySelector('#app [data-sec="molestias"]')),'Ajustes: Molestias en Entrenamiento');
// ---- Insignias
ok(await E(()=>['hiit1','hiit10','cuerpo14','enzona','racha4','racha12','estirado'].every(id=>BADGES.some(b=>b.id===id))&&BADGES.every(b=>!/^(Subí|Llegá|Superá|Terminá)/.test(b.d))),'Insignias: las nuevas y sin segunda persona · '+await E(()=>BADGES.length));
// ---- vertical: sin dos paneles
await p.setViewportSize({width:390,height:844}); await W8(500);
for(const [v,f] of [['todas',()=>{ histEx='todo'; go('stat'); }],['programas',()=>{ go('programas'); }],['fuerza',()=>{ draft=null; go('fuerza'); }]]){ await E(f); await W8(900); ok(await E(()=>!document.querySelector('#app .spl')),'Vertical: '+v+' sin dos paneles'); }
console.log(bad.length?'FALLAS:\n'+bad.join('\n'):'TODO OK','\nERRS',JSON.stringify(errs.slice(0,5))); await b.close(); })();
