// v254: lo mismo se resuelve igual en toda la app
const {chromium}=require('playwright'); const seed=require('./seed.js');
const src=process.argv[2]||'prev.html';
(async()=>{ const b=await chromium.launch(); const errs=[]; let ok=0, bad=0; const T=(c,m)=>{ if(c){ ok++; } else { bad++; console.log('FAIL',m); } };
  const W8=(p,t)=>p.waitForTimeout(t);
  const open=async(W,H,live)=>{ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(600);
    await p.evaluate(live=>{ PERF.modo='max'; perfApply(); CELON=true; ['lp','swipe','scrub','mini2','tree'].forEach(k=>{ try{ hintDone(k); }catch(e){} }); decir=()=>{}; beep=()=>{}; if(live){ bike.modo=modoDefault(); bike.sel=protPorTipo(bike.modo,'tranqui'); bkStart(); MINI.mode='isle'; MINI.ses=miniSesKey(); } },live); return p; };
  const nav=async(p,js,t)=>{ await p.evaluate(js=>{ NAV.length=0; scrollTo(0,0); eval(js); },js); await W8(p,t||1000); };
  const click=async(p,sel,t)=>{ await p.evaluate(sel=>document.querySelector(sel).click(),sel); await W8(p,t||600); };
  const menu=p=>p.evaluate(()=>[...document.querySelectorAll('.cmpop [data-cm]')].map(b=>({v:b.dataset.cm,t:b.querySelector('b').textContent,d:(b.querySelector('small')||{}).textContent||'',on:b.classList.contains('on')})));
  const pick=async(p,v,t)=>{ await p.evaluate(v=>document.querySelector(`.cmpop [data-cm="${v}"]`).click(),v); await W8(p,t||700); };

  // ---------- vertical, con la sesión andando ----------
  { const p=await open(390,844,true);
    // 1. Cuerpo (v261): sin período; capas y ? en una cápsula, como Editar + ⋯ en el día
    await nav(p,"bodySel=null; bodyCapa='f'; go('cuerpo')");
    let c=await p.evaluate(()=>{ const tb=document.querySelector('#app>.view>.topbar'), cap=tb.querySelector(':scope>.tbgrp'), ks=cap?[...cap.children]:[];
      return {n:ks.length,first:ks[0]&&ks[0].id,second:ks[1]&&ks[1].dataset.info,per:!!document.querySelector('#app [data-bmode],#app .pernav,#app #bdRange,#app [data-pn]'),tabs:!!document.querySelector('#app .segx,#app .tbseg'),sub:document.querySelector('#app>.view>.hsub').textContent,h:cap?Math.round(cap.getBoundingClientRect().height):0,glass:cap?getComputedStyle(cap).backdropFilter!=='none':false}; });
    T(c.n===2&&c.first==='capaBtn'&&c.second==='cuerpo:','Cuerpo: capas y ? en una cápsula'); T(c.h===40&&c.glass,'Cuerpo: la cápsula es de vidrio y de 40');
    T(!c.per,'Cuerpo: sin selector de período ni flechas'); T(!c.tabs,'Cuerpo: sin pestañas de texto ni íconos de tipo');
    T(await p.evaluate(()=>{ const w=semanaKey(hoyISO()); return document.querySelector('#app>.view>.hsub').textContent==='Series · esta semana · '+fmtFecha(w)+' – '+fmtFecha(addDays(w,6)); }),'Cuerpo: la bajada dice la capa y la semana ('+c.sub+')');
    // los números son los de esta semana, los mismos que la fila de Fuerza
    c=await p.evaluate(()=>{ const R=bodyWeek(semanaKey(hoyISO())), top=Object.keys(R).sort((a,b)=>R[b].sets-R[a].sets)[0], row=document.querySelector(`.bmlist [data-br="${top}"] .n`); const tmp=document.createElement('div'); tmp.innerHTML=cuerpoRow('x'); return {v:row&&row.textContent,exp:f1(Math.round(R[top].sets*10)/10),zona:document.querySelector('.bmap .prkv dd').textContent,row:tmp.querySelector('b.num').firstChild.textContent.trim()}; });
    T(c.v===c.exp,`Cuerpo: los números son de esta semana (${c.v} vs ${c.exp})`); T(c.zona.startsWith(c.row+' de'),`Cuerpo: "en zona" igual que en Fuerza (${c.zona} / ${c.row})`);
    await click(p,'#capaBtn',500); let mc=await menu(p);
    T(mc.length===3&&mc.map(x=>x.v).join()==='r,f,m'&&mc[1].on&&mc.every(x=>x.d),'Cuerpo: el menú de capas marca la actual y explica cada una');
    await pick(p,'m',700);
    c=await p.evaluate(()=>({capa:bodyCapa,sub:document.querySelector('#app>.view>.hsub').textContent,leg:document.querySelector('.blegend').textContent,lbl:document.querySelector('#capaBtn').getAttribute('aria-label')}));
    T(c.capa==='m'&&/Movilidad/.test(c.lbl),'Cuerpo: elegir Movilidad cambia la capa'); T(/^Movilidad · último estiramiento/.test(c.sub)&&/Estirado/.test(c.leg),'Cuerpo: la bajada y la leyenda dicen qué se ve');
    await nav(p,"bodyCapa='r'; render()",600);
    // con la isla: no se tocan
    c=await p.evaluate(()=>{ const m=document.getElementById('minibar'), cap=document.querySelector('#app .topbar .tbgrp'), bk=document.getElementById('back'); if(!m||m.hidden) return null; const a=m.getBoundingClientRect(), r=cap.getBoundingClientRect(), k=bk.getBoundingClientRect(); return {ok:a.right<=r.left-6&&a.left>=k.right+6}; });
    T(c&&c.ok,'Cuerpo con la sesión: la isla entre volver y la cápsula, sin tocar');

    // 2. Resumen: el período es un menú, sin flechas debajo de volver
    await nav(p,"resumenWk=semanaKey(hoyISO()); resMode='sem'; go('resumen')");
    c=await p.evaluate(()=>({arrows:document.querySelectorAll('#app .pnb,#app [data-pn]').length,m:!!document.getElementById('perMenu'),t:document.querySelector('#perMenu b').textContent,d:document.querySelector('#perMenu small').textContent}));
    T(c.arrows===0&&c.m,'Resumen: sin flechas, el período es un menú'); T(c.t==='Esta semana'&&/\d\d\/\d\d – \d\d\/\d\d/.test(c.d),'Resumen: "Esta semana" y sus fechas');
    await click(p,'#perMenu',500); let m=await menu(p);
    T(m.length>=4&&m[0].t==='Esta semana'&&m[0].on&&m[1].t==='Semana pasada'&&/\d\d\/\d\d – /.test(m[1].d),'Resumen: el menú lista las semanas ('+m.length+')');
    await pick(p,m[1].v); T(await p.evaluate(()=>resumenWk===addDays(semanaKey(hoyISO()),-7)&&document.querySelector('#perMenu b').textContent==='Semana pasada'),'Resumen: elegir otra semana la muestra');
    await click(p,'#app [data-rmode="mes"]',700); await click(p,'#perMenu',500); m=await menu(p);
    T(m.length>=2&&m[1].d==='mes pasado','Resumen Mes: el menú lista los meses'); await pick(p,'-1'); T(await p.evaluate(()=>mesOff===-1&&document.querySelector('#perMenu small').textContent==='mes pasado'),'Resumen Mes: elegir el mes pasado');
    T(await p.evaluate(()=>{ const b=document.getElementById('back').getBoundingClientRect(), pm=document.getElementById('perMenu').getBoundingClientRect(); return pm.top>b.bottom+40; }),'Resumen: el período lejos de volver');
    await p.evaluate(()=>{ resMode='sem'; mesOff=0; resumenWk=semanaKey(hoyISO()); });

    // 3. filtros: un menú con conteos, en la fila de arriba
    await nav(p,"histEx='todo'; todoFil='todas'; go('stat')");
    c=await p.evaluate(()=>({pk:!!document.querySelector('#app .topbar #tfPick'),chips:document.querySelectorAll('#app .swfil,#app [data-tf]').length,lb:document.querySelector('#tfPick span').textContent}));
    T(c.pk&&c.chips===0&&c.lb==='Todo','Sesiones: un menú "Todo" arriba, sin chips');
    await click(p,'#tfPick',500); m=await menu(p);
    T(m.map(x=>x.t).join('/')==='Todo/Fuerza/Cardio/Movilidad'&&m.every(x=>/^\d+ sesi/.test(x.d)),'Sesiones: el menú con Todo · Fuerza · Cardio · Movilidad y conteos');
    T(await p.evaluate(()=>{ const ids=new Set(SESS.map(x=>x.id)); return +document.querySelector('.cmpop [data-cm="todas"] small').textContent.split(' ')[0]===SESS.filter(x=>!(x.kind==='mov'&&x.ref&&ids.has(x.ref))).length; }),'Sesiones: el conteo de Todo es lo que lista');
    await pick(p,'fuerza',800); T(await p.evaluate(()=>todoFil==='fuerza'&&document.querySelector('#tfPick span').textContent==='Fuerza'&&[...document.querySelectorAll('#app .swr[data-sid]')].every(r=>SESS.find(x=>x.id===r.dataset.sid).kind==='fuerza')),'Sesiones: el menú filtra');
    await p.evaluate(()=>{ todoFil='todas'; });
    await nav(p,"prFil='todo'; go('programas')");
    c=await p.evaluate(()=>({pk:!!document.querySelector('#app .topbar #prPickB'),chips:document.querySelectorAll('#app .swfil').length,lk:[...document.querySelectorAll('.ajhd .wklink.prmore')].map(b=>b.textContent+(b.querySelector('svg.gi')?'>':'')),more:document.querySelectorAll('.srow.prmore').length}));
    T(c.pk&&c.chips===0,'Programas: un menú arriba, sin chips'); T(c.more===0&&c.lk.length>0&&c.lk.every(t=>/^Todas · \d+>$/.test(t)),'Programas: "Todas · N" con flecha en el encabezado');
    await click(p,'#prPickB',500); m=await menu(p); T(m.map(x=>x.t).join('/')==='Todo/Fuerza/Objetivos/Cardio/Movilidad/Mixtos'&&m.every(x=>/^\d+ rutinas?$/.test(x.d)),'Programas: el menú con el mismo orden y conteos');
    await p.evaluate(()=>popClose(true)); await W8(p,300);
    await p.evaluate(()=>document.querySelector('.ajhd .wklink.prmore').click()); await W8(p,700); T(await p.evaluate(()=>prFil!=='todo'&&document.querySelector('#prPickB span').textContent===PR_CH.find(c=>c[0]===prFil)[1]),'Programas: el enlace filtra y el menú lo muestra');
    T(await p.evaluate(()=>CAT_FN.todos==='Todo'&&GL_CN.todas==='Todo'&&TFQ_L['']==='Todo'),'la misma palabra en todos los filtros: Todo');

    // 4. "En mis sesiones": el botón de calendario, en el árbol y en Habilidad
    await nav(p,"go('arbol'); setTimeout(()=>treeSelect('push'),900)",1700);
    c=await p.evaluate(()=>{ const t=document.getElementById('tpOn'); return t&&{cls:t.className,pr:t.getAttribute('aria-pressed'),lbl:t.getAttribute('aria-label'),svg:!!t.querySelector('svg'),sw:!!document.querySelector('.tpanel .tpsw'),inRow:!!t.closest('.tpa'),on:(CFG.skillsOn||[]).includes('push')}; });
    T(c&&/tpon2/.test(c.cls)&&c.svg&&!c.sw&&c.inRow,'árbol: el botón de calendario en la fila de acciones, sin interruptor'); T(c&&c.lbl==='En mis sesiones','árbol: con su nombre accesible');
    await p.evaluate(()=>document.getElementById('tpOn').click()); await W8(p,300);
    T(await p.evaluate(on=>(CFG.skillsOn||[]).includes('push')===!on&&document.getElementById('tpOn').getAttribute('aria-pressed')===String(!on)&&document.getElementById('tpOn').classList.contains('on')===!on&&/Va a aparecer|Sale de/.test(document.getElementById('toast').textContent),c.on),'árbol: cambia el plan, se pinta y avisa');
    await nav(p,"skSel='push'; go('habilidad')");
    c=await p.evaluate(()=>{ const s=document.getElementById('skOn'); const row=s&&s.closest('.skgo'); const bs=row?[...row.children].map(x=>x.id||x.className):[]; return {cls:s&&s.className,pr:s&&s.getAttribute('aria-pressed'),row:bs.join(','),sw:!!document.querySelector('#sksheet .tpsw'),on:(CFG.skillsOn||[]).includes('push'),h:s&&Math.round(s.getBoundingClientRect().height),r:s&&getComputedStyle(s).borderRadius}; });
    T(c.cls&&/skcal/.test(c.cls)&&!c.sw,'Habilidad: el mismo botón de calendario, sin interruptor'); T(c.row==='skTestB,skOn,skGoal','Habilidad: Probar, calendario y ⚑ en una fila ('+c.row+')');
    T(c.pr===String(c.on)&&/\bon\b/.test(c.cls)===c.on,'Habilidad: el mismo estado que en el árbol'); T(c.h===50&&c.r==='50%','Habilidad: redondo de 50, como ⚑ y ⋯');
    await p.evaluate(()=>document.getElementById('skOn').click()); await W8(p,300); T(await p.evaluate(()=>!(CFG.skillsOn||[]).includes('push')&&document.getElementById('skOn').getAttribute('aria-pressed')==='false'),'Habilidad: lo saca del plan');

    // 6. gráficos semanales iguales
    for(const [k,col] of [['fuerza','--ember'],['cardio','--aqua'],['movilidad','--lime'],['constancia','--ink-2']]){ await nav(p,`histEx='${k}'; go('stat')`,900);
      const r=await p.evaluate(()=>{ const w=document.querySelector('#app .wkb'); if(!w) return null; const cs=[...w.querySelectorAll('.wkbc')]; const last=cs[cs.length-1]; return {n:cs.length,cur:last.classList.contains('cur')&&last.querySelector('small').textContent==='en curso',c:w.getAttribute('style'),curs:cs.filter(x=>x.classList.contains('cur')).length,soft:getComputedStyle(last.querySelector('i')).backgroundColor!==getComputedStyle(cs[0].querySelector('i')).backgroundColor||cs[0].classList.contains('nd'),h:Math.round(w.getBoundingClientRect().height)}; });
      T(r&&r.n===8&&r.cur&&r.curs===1,`${k}: 8 semanas en barras, la última "en curso"`); T(r&&r.c.includes(col),`${k}: en su color`); T(r&&r.soft,`${k}: la semana en curso, más suave`); T(r&&r.h===156,`${k}: misma altura`); }
    await p.close(); }

  // ---------- vertical, sin sesión ----------
  { const p=await open(390,844,false);
    // 5. Corta va al ⋯; Empezar + ⋯ como Cardio
    await nav(p,"draft=null; go('fuerza')");
    let c=await p.evaluate(()=>{ const row=document.querySelector('#app .fza'); return {kids:[...row.children].map(x=>x.id),w:Math.round(row.querySelector('#goFz').getBoundingClientRect().width),rw:Math.round(row.getBoundingClientRect().width)}; });
    T(c.kids.join()==='goFz,fzMoreSel','Fuerza: Empezar y ⋯, sin Corta en la fila ('+c.kids+')'); T(c.w===c.rw-58,`Fuerza: Empezar ocupa todo el ancho libre (${c.w} de ${c.rw})`);
    await click(p,'#fzMoreSel',600);
    c=await p.evaluate(()=>{ const it=[...document.querySelectorAll('.fzpop .pmi')].map(b=>({a:b.dataset.fz,t:b.querySelector('b').textContent,d:b.querySelector('small').textContent})); return it; });
    T(c[0]&&c[0].a==='corta'&&c[0].t==='Versión corta'&&/~\d+ min/.test(c[0].d),'Fuerza ⋯: la versión corta primero, con sus minutos'); T(!c.some(x=>x.a==='go'),'Fuerza ⋯: sin repetir Empezar');
    await p.evaluate(()=>document.querySelector('.fzpop [data-fz="corta"]').click()); await W8(p,900);
    T(await p.evaluate(()=>!!draft&&!!draft.plan.corta),'Fuerza ⋯: arranca la versión corta');
    await p.evaluate(()=>{ draft=null; try{ saveDraft&&saveDraft(); }catch(e){} });
    // Cardio: la misma fila
    await nav(p,"bike.modo=modoDefault(); bike.sel=null; go('bici')");
    T(await p.evaluate(()=>[...document.querySelector('#app .fza').children].map(x=>x.id).join()==='goBike,bkMoreSel'),'Cardio: Empezar y ⋯, como Fuerza');
    // Empezar: misma altura y letra
    for(const [k,js,sel] of [['Fuerza',"go('fuerza')",'.fza'],['Cardio',"bike.modo=modoDefault(); bike.sel=null; go('bici')",'.fza'],['Movilidad',"estSel={m:estHoy()?'hoy':'full',z:[]}; go('estirar')",'.fza'],['Héroe',"heroSel=HEROES[0].id; heroV=0; go('heroe')",'.prgo'],['Habilidad',"skSel='push'; go('habilidad')",'.skgo']]){ await nav(p,js,900);
      const r=await p.evaluate(sel=>{ const row=document.querySelector('#app '+sel), bs=[...row.children].filter(c=>c.tagName==='BUTTON'), pr=bs[0], rr=row.getBoundingClientRect(); const sec=bs.slice(1).reduce((a,c)=>a+c.getBoundingClientRect().width+8,0); return {h:bs.map(c=>Math.round(c.getBoundingClientRect().height)),fs:getComputedStyle(pr).fontSize,w:Math.round(pr.getBoundingClientRect().width),free:Math.round(rr.width-sec)}; },sel);
      T(r.h.every(h=>h===50)&&r.fs==='15px',`${k}: Empezar y lo de al lado miden 50 (${r.h})`); T(Math.abs(r.w-r.free)<=1,`${k}: el principal ocupa el ancho libre (${r.w} de ${r.free})`); }
    // 7. un solo ⌄
    for(const [k,js] of [['Fuerza',"go('fuerza')"],['Cardio',"bike.modo=modoDefault(); bike.sel=null; go('bici')"],['Catálogo',"catFil='todos'; go('catalogo')"],['Glosario',"ajFrom=null; ajSec='glosario'; go('ajustes')"]]){ await nav(p,js,900);
      const r=await p.evaluate(()=>({tri:document.getElementById('app').innerHTML.includes('▾'),dv:[...document.querySelectorAll('#app .dv')].map(d=>!!d.querySelector('svg')),pk:document.querySelectorAll('#app .dv').length}));
      T(!r.tri&&r.dv.every(Boolean)&&r.pk>0,`${k}: el mismo ⌄ que el resto (${r.pk})`); }
    // 8. meta de pasos en un solo lugar
    await nav(p,"ajFrom=null; ajSec='vos'; go('ajustes')"); T(await p.evaluate(()=>!document.querySelector('#app [data-goal]')),'Tus datos: sin la meta de pasos');
    await nav(p,"ajFrom=null; ajSec='hoy'; go('ajustes')");
    c=await p.evaluate(()=>({g:document.querySelectorAll('#app [data-goal^="pasos:"]').length,list:!!document.querySelector('#app .ajlist.ajcnt'),old:!!document.querySelector('#app .setrow,#app .mini'),d:(document.querySelector('[data-w="pasos"]').closest('.srow').querySelector('.d')||{}).textContent}));
    T(c.g===2&&c.list&&!c.old,'Contadores diarios: lista como el resto de Ajustes, con − y +'); T(/^meta 8\.000/.test(c.d||''),'Contadores diarios: la meta con separador de miles ('+c.d+')');
    await p.evaluate(()=>document.querySelector('[data-goal^="pasos:"]:not([data-goal*="-"])').click()); await W8(p,400);
    T(await p.evaluate(()=>wGoal('pasos')>8000&&document.querySelector('[data-w="pasos"]').closest('.srow').querySelector('.d').textContent.includes(wGoal('pasos').toLocaleString('es-AR'))),'Contadores diarios: + sube la meta');
    await p.close(); }

  // ---------- horizontal ----------
  for(const live of [false,true]){ const p=await open(1180,760,live); const tag=live?' (con la isla)':'';
    await nav(p,"bodySel=null; bodyCapa='f'; go('cuerpo')",1100);
    let c=await p.evaluate(()=>{ const cap=document.querySelector('#app .topbar .tbgrp'), cb=document.querySelector('#capaBtn'), q=document.querySelector('#app .topbar .tbgrp>[data-info]'), h=document.querySelector('#app>.view>h1'), mb=document.getElementById('minibar'); const R=e=>e.getBoundingClientRect(); const s=R(cap), c1=R(cb), qq=R(q); const rg=document.createRange(); rg.selectNodeContents(h); const tr=rg.getBoundingClientRect();
      return {row:Math.abs((c1.top+c1.bottom)/2-(qq.top+qq.bottom)/2)<2,left:c1.right<=qq.left+1,title:tr.right<=s.left-8,h:Math.round(s.height),isle:mb&&!mb.hidden?(R(mb).left>=s.right+6||R(mb).right<=s.left-6):true,per:!!document.querySelector('#app .pernav,#app [data-bmode]')}; });
    T(c.row&&c.left,'horizontal Cuerpo: capas y ? en la cápsula de la fila del título'+tag); T(c.title,'horizontal Cuerpo: no pisan el título'+tag); T(c.h===40,'horizontal Cuerpo: de 40'+tag); T(c.isle,'horizontal Cuerpo: la isla no toca la cápsula'+tag); T(!c.per,'horizontal Cuerpo: sin período'+tag);
    await nav(p,"resumenWk=semanaKey(hoyISO()); resMode='sem'; go('resumen')",1100);
    c=await p.evaluate(()=>{ const pm=document.getElementById('perMenu'), h=document.querySelector('#app>.view>h1'); const a=pm.getBoundingClientRect(), t=h.getBoundingClientRect(); return {under:a.top>=t.bottom-1&&Math.abs(a.left-t.left)<=4,arrows:document.querySelectorAll('#app .pnb').length}; });
    T(c.under&&c.arrows===0,'horizontal Resumen: el período debajo del título, sin flechas'+tag);
    await nav(p,"histEx='todo'; todoFil='todas'; go('stat')",1100);
    T(await p.evaluate(()=>!!document.querySelector('.splhd .topbar #tfPick')&&!document.querySelector('.splhd .swfil')),'horizontal Sesiones: el mismo menú'+tag);
    await nav(p,"prFil='todo'; go('programas')",1100);
    T(await p.evaluate(()=>!!document.querySelector('.splhd .topbar #prPickB')&&!document.querySelector('.splhd .swfil')),'horizontal Programas: el mismo menú'+tag);
    // Empezar en una tarjeta: a la izquierda, 260
    for(const [k,js,sel] of [['Fuerza',"go('fuerza')",'.fza'],['Habilidad',"skSel='push'; go('habilidad')",'.skgo']]){ await nav(p,js,1000);
      const r=await p.evaluate(sel=>{ const row=document.querySelector('#app '+sel), b=row.querySelector('button'), rr=row.getBoundingClientRect(), q=b.getBoundingClientRect(); return {w:Math.round(q.width),l:Math.round(q.left-rr.left),h:Math.round(q.height)}; },sel);
      T((r.w===260||live&&k==='Fuerza')&&r.l===0&&r.h===50,`horizontal ${k}: Empezar a la izquierda (${JSON.stringify(r)})`+tag); }
    await p.close(); }

  // ---------- primer inicio ----------
  for(const [W,H] of [[390,844],[1180,760]]){ const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(500);
    T(await p.evaluate(()=>getComputedStyle(document.getElementById('fab')).display==='none'),`primer inicio ${W}: sin el + al elegir persona`);
    await p.evaluate(()=>document.querySelector('#newP').click()); await W8(p,500);
    let c=await p.evaluate(()=>({sd:document.querySelectorAll('#app [data-sd]').length,sh:document.querySelectorAll('#app [data-sh]').length,old:document.querySelectorAll('#app [data-dp],#app [data-hora],#app [data-horab]').length,fab:getComputedStyle(document.getElementById('fab')).display,sx:document.querySelectorAll('#app .segx.obsx [data-obsx]').length,zc:document.querySelectorAll('#app .zchip[data-obsx]').length}));
    T(c.sd===14&&c.sh>=1&&c.old===0,`primer inicio ${W}: la semana con el bloque de Ajustes`); T(c.fab==='none',`primer inicio ${W}: sin el +`); T(c.sx===2&&c.zc===0,`primer inicio ${W}: Hombre / Mujer en un segmentado`);
    await p.evaluate(()=>document.querySelector('#app [data-obsx="f"]').click()); await W8(p,400);
    T(await p.evaluate(()=>ob.vals.sx==='f'&&document.querySelector('[data-obsx="f"]').classList.contains('on')&&getComputedStyle(document.querySelector('.obsx>.segind')).opacity==='1'),`primer inicio ${W}: el segmentado marca lo elegido`);
    await p.evaluate(()=>{ document.querySelector('#obNom').value='Ana'; document.querySelector('#obAlt').value='170'; document.querySelector('#obEdad').value='33'; document.querySelector('#obPeso').value='61'; });
    const f0=await p.evaluate(()=>(CFG.diasFS||[]).slice());
    await p.evaluate(()=>document.querySelector('[data-sd="diasFS:6"]').click()); await W8(p,400);
    c=await p.evaluate(()=>({n:document.querySelector('#obNom').value,a:document.querySelector('#obAlt').value,e:document.querySelector('#obEdad').value,p:document.querySelector('#obPeso').value,f:CFG.diasFS,sx:ob.vals.sx}));
    T(c.n==='Ana'&&c.a==='170'&&c.e==='33'&&c.p==='61'&&c.sx==='f','primer inicio '+W+': tocar un día no borra lo escrito ('+JSON.stringify(c)+')'); T(c.f.includes(6)!==f0.includes(6),'primer inicio '+W+': el día se marca');
    if(W>1000) T(await p.evaluate(()=>{ const c=[...document.querySelectorAll('#app .cols2>.col')]; return c.length===2&&Math.abs(c[0].querySelector('.card').getBoundingClientRect().top-c[1].querySelector('.card').getBoundingClientRect().top)<2; }),'primer inicio horizontal: datos a la izquierda, semana a la derecha, alineados');
    await p.evaluate(()=>document.getElementById('obNext').click()); await W8(p,600); T(await p.evaluate(()=>ob.step===1&&CFG.nombre==='Ana'&&CFG.altura===170&&CFG.sexo==='f'),`primer inicio ${W}: Seguir guarda y avanza`);
    await p.close(); }

  console.log('ok',ok,'bad',bad,'errs',JSON.stringify(errs.slice(0,4))); await b.close(); })();
