const src=process.argv[2]||'prev.html';
const {chromium}=require('playwright'); const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const errs=[]; const bad=[]; const ok=(c,m)=>{ if(!c) bad.push(m); };
for(const W of [390,360]){ const p=await (await b.newContext({viewport:{width:W,height:800}})).newPage(); p.on('pageerror',e=>errs.push(W+' '+e.message));
await p.goto('http://127.0.0.1:8765/'+src); await p.waitForTimeout(400); await seed(p); await p.waitForTimeout(2200);
const E=(f,a)=>p.evaluate(f,a); const W8=ms=>p.waitForTimeout(ms);
const ovf=async(tag)=>{ const r=await E(()=>{ const vw=innerWidth; const out=[]; document.querySelectorAll('#app *').forEach(e=>{ if(e.closest('.prrec,.prdays,.hrrow,.bdgrail,.swa,.segx,.tvp,.swfil')) return; const r=e.getBoundingClientRect(); if(r.width&&(r.right>vw+1||r.left<-1)) out.push((e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className)+'|'+Math.round(r.left)+'-'+Math.round(r.right)); }); return {sw:document.documentElement.scrollWidth,vw,out:out.slice(0,5)}; }); ok(r.sw<=r.vw&&!r.out.length,`ovf ${W} ${tag} ${JSON.stringify(r)}`); };
await E(()=>{ CELON=true; PERF.modo='eq'; perfApply(); CFG.prog={}; saveCfg(); });
// sin programas: fila de descubrimiento en el inicio
await E(()=>{ go('home'); }); await W8(700);
ok(await E(()=>!!document.querySelector('.mrow.prh')&&!document.querySelector('.hwkp')),'home discovery row');
await E(async()=>{ for(const id of ['base_cali','c0a5']) await progLoad(id); const st=addDays(hoyISO(),-8); CFG.prog={f:{id:'base_cali',start:st},b:{id:'c0a5',start:st}}; SESS.push({id:'s-p1',kind:'fuerza',fecha:addDays(hoyISO(),-6),tipo:'Calistenia · Día A',dur:40,ej:[],vol:0,prog:{id:'base_cali',i:0}}); saveCfg(); render(); }); await W8(700);
const hw=await E(()=>({n:document.querySelectorAll('.hwkp .hwkr').length,disc:!!document.querySelector('.mrow.prh'),lnw:document.querySelectorAll('.lnw').length,ring:document.querySelectorAll('.hwkr .prring').length}));
ok(hw.n===2&&hw.disc&&hw.lnw===0&&hw.ring===2,'home week rows '+JSON.stringify(hw)); await ovf('home');
await E(()=>document.querySelector('.hwkr[data-proghome="base_cali"]').click()); await W8(900);
ok(await E(()=>view==='programa'&&progSel==='base_cali'),'home row -> programa');
const pd=await E(()=>({kv:[...document.querySelectorAll('.prkv dt')].map(x=>x.textContent),wk:document.querySelectorAll('.prplan .prwk i').length,cur:document.querySelectorAll('.prplan .prwk i.cur').length,fs:document.querySelectorAll('.prf').length,on:document.querySelectorAll('.prf.on').length,days:document.querySelectorAll('.prday:not(.sk)').length,dok:document.querySelectorAll('.prday.ok').length,dcur:document.querySelectorAll('.prday.cur').length,sk:document.querySelectorAll('[data-psk]').length,go:(document.querySelector('#prGo')||{}).textContent,p:!!document.querySelector('.prdd')}));
ok(pd.kv.join()==='Objetivo,Progresión,Punto de partida,Equipo,Técnicas'&&pd.wk===8&&pd.cur===1&&pd.fs===3&&pd.on===1&&pd.days===3&&pd.dok===1&&pd.dcur===1&&pd.sk===3&&pd.go==='Ir al Día B'&&!pd.p,'programa mine '+JSON.stringify(pd)); await ovf('prog mine');
await E(()=>document.querySelector('[data-psk="pull"]').click()); await W8(900);
ok(await E(()=>view==='habilidad'&&skSel==='pull'),'psk -> habilidad');
// programa sin paquete: esqueleto y después los días
await E(()=>{ delete PRK.espagat; try{ localStorage.removeItem(LSK+'.pk.espagat'); }catch(e){} }); const skel=await E(()=>{ const h=prDays(progMeta('espagat'),1,null); return (h.match(/prday sk/g)||[]).length; }); await E(()=>{ progSel='espagat'; go('programa'); }); await W8(1500);
const ld=await E(()=>({d:document.querySelectorAll('.prday:not(.sk)').length,th:document.querySelectorAll('.prday .prdth .photo').length,sm:document.querySelector('.prday small').textContent,start:!!document.querySelector('#prStart'),gs:(document.querySelector('.prgs')||{}).textContent}));
ok(skel===4&&ld.d===4&&ld.th>=4&&/×/.test(ld.sm)&&ld.start&&/Reemplaza a tu movilidad de siempre/.test(ld.gs),'espagat load '+skel+' '+JSON.stringify(ld)); await ovf('prog espagat');
await E(()=>{ progSel='z2'; go('programa'); }); await W8(1600);
const z=await E(()=>({pb:document.querySelectorAll('.prday .phasebar').length,pills:document.querySelectorAll('.prkv .pill').length,sub:[...document.querySelectorAll('.prday small')].map(x=>x.textContent).join('|'),gs:document.querySelector('.prgs').textContent,src:!!document.querySelector('.prsrc')}));
ok(z.pb===3&&z.pills===5&&/suave/.test(z.sub)&&/Reemplaza a De 0 a 5 km/.test(z.gs),'z2 '+JSON.stringify(z)); await ovf('prog z2');
await E(()=>{ progSel='cinco'; go('programa'); }); await W8(1500); ok(await E(()=>!document.querySelector('[data-psk]')&&document.querySelector('#prStart').disabled===!has('barra_ol')),'cinco sin árbol'); await ovf('prog cinco');
// catálogo
await E(()=>{ prFil='todo'; progFrom='home'; go('programas'); }); await W8(900);
const [HEROES_N,HEROES_F]=await E(()=>[HEROES.length,HEROES.filter(h=>h.a==='f'||h.a==='x').length]);
const ct=await E(()=>({cur:document.querySelectorAll('.prcur').length,dup:[...document.querySelectorAll('.ajlist [data-prog]:not(.prcur)')].map(x=>x.dataset.prog).filter(x=>x==='base_cali'||x==='c0a5').length,rows:document.querySelectorAll('.prr[data-prog]').length,rot:!!document.querySelector('.prr[data-prog="rot"]'),hr:document.querySelectorAll('.hrt').length,grid:!!document.querySelector('.hrgrid'),rec:[...document.querySelectorAll('.prc .pill')].map(x=>x.textContent),hsub:!!document.querySelector('.hsub'),dots:document.querySelectorAll('.hrt[data-hero="hercules"] .hrv i').length}));
/* desde v263 los desafíos no están en el catálogo de rutinas (tienen su pantalla) y la rotación es una rutina más */
ok(ct.cur===2&&ct.rows===16&&ct.rot&&ct.dup===0&&ct.hr===0&&!ct.grid&&!ct.hsub&&ct.dots===0,'catálogo '+JSON.stringify(ct)); await ovf('cat');
const dupc=await E(()=>{ const ids=[...document.querySelectorAll('[data-prog]')].map(x=>x.dataset.prog); return ids.filter(x=>x==='base_cali').length; }); ok(dupc===1,'sin duplicado '+dupc);
await E(()=>document.querySelector('[data-prf="f"]').click()); await W8(600);
const cf=await E(()=>({hr:document.querySelectorAll('.hrt').length,grid:!!document.querySelector('.hrgrid'),cur:document.querySelectorAll('.prcur').length}));
ok(cf.hr===0&&!cf.grid&&cf.cur===1,'filtro fuerza '+JSON.stringify(cf)); await ovf('cat f');
// pantalla previa: programas / héroes
await E(()=>{ fzSel=null; go('fuerza'); }); await W8(900);
const fz=await E(()=>({g:!!document.querySelector('[data-goprog="f"]'),h:!!document.querySelector('[data-gohero="f"]'),stk:document.querySelectorAll('[data-gohero] .hrstk>span').length,sub:document.querySelector('[data-goprog] small').textContent}));
ok(fz.g&&fz.h&&fz.stk===4&&/en curso/.test(fz.sub),'fzsel '+JSON.stringify(fz)); await ovf('fzsel');
await E(()=>document.querySelector('[data-gohero="f"]').click()); await W8(1400);
const sc=await E(()=>({v:view,f:dsFil,hr:document.querySelectorAll('.hrt').length}));
ok(sc.v==='desafios'&&sc.f==='f'&&sc.hr===HEROES_F,'gohero -> desafíos de fuerza '+JSON.stringify(sc));
ok(await E(()=>{ document.querySelector('#back').click(); return true; }),'back'); await W8(800); ok(await E(()=>view==='fuerza'),'back -> fuerza');
await E(()=>{ bike.sel=null; go('bici'); }); await W8(800); ok(await E(()=>!!document.querySelector('[data-gohero="b"]')),'bici hero row'); await ovf('bksel');
await E(()=>{ estSel={m:'full',z:[]}; go('estirar'); }); await W8(800); ok(await E(()=>!!document.querySelector('[data-gohero="m"]')),'estirar hero row');
// héroes
for(const [id,v,k] of [['hercules',1,'Cada ronda'],['atalanta',2,'La sesión'],['dafne',0,'Posturas'],['odiseo',2,'En orden'],['hipolita',1,'Cada ronda'],['aquiles',0,'Uno por minuto']]){
  await E(([id,v])=>{ heroSel=id; heroV=v; go('heroe'); },[id,v]); await W8(700);
  const r=await E(()=>({st:document.querySelectorAll('.hrd .prdk>div').length,hd:document.querySelector('.ajhd.sgh').firstChild.textContent,fp:!!document.querySelector('.hrfp svg'),ft:!!document.querySelector('.ajft'),pb:!!document.querySelector('.hrint .phasebar')}));
  ok(r.st===3&&r.hd===k&&r.fp&&!r.ft&&(id!=='atalanta'||r.pb),'heroe '+id+' '+JSON.stringify(r)); await ovf('heroe '+id); }
// héroe hecho: fin, marcas, insignia, historial
await E(()=>{ SESS.push({id:'s-h0',kind:'fuerza',fecha:addDays(hoyISO(),-3),tipo:'Hércules',dur:15,ej:[],vol:0,hero:{id:'hercules',v:1,fmt:'tiempo',seg:900,r:5,full:true}}); CELQ.length=0; });
await E(()=>{ heroStart('hercules',1,document.body); }); await W8(400); await E(()=>{ draft.t0-=800000; for(let i=0;i<5;i++) heroAct(); }); await W8(1500);
const fn=await E(()=>({v:view,card:!!document.querySelector('.hrfin'),big:(document.querySelector('.hrfb')||{}).textContent,dl:(document.querySelector('.hrfd .dlt')||{}).textContent,tot:document.querySelectorAll('.hrtr').length,cmp:[...document.querySelectorAll('h3')].some(h=>/Contra la última/.test(h.textContent)),first:[...document.querySelectorAll('.xs.dim')].some(x=>/Primera/.test(x.textContent)),t:(document.querySelector('.hrfin h2')||{}).textContent}));
ok(fn.v==='fin'&&fn.card&&/^13:2\d$/.test(fn.big)&&/^−1:/.test(fn.dl)&&fn.tot===4&&!fn.cmp&&!fn.first&&fn.t==='¡Nuevo récord!','fin héroe '+JSON.stringify(fn)); await ovf('fin');
ok(await E(()=>{ badgeCheck(); return !!(CFG.badges||{}).heroe1&&!!B_GL.heroe; }),'insignia primer héroe');
await E(()=>{ heroSel='hercules'; heroV=1; go('heroe'); }); await W8(700);
const mk=await E(()=>({n:document.querySelectorAll('.hrmk').length,tp:document.querySelectorAll('.hrmk .hrtp').length,best:document.querySelector('.hrd .prdk>div:last-child b').textContent,hvd:document.querySelectorAll('.hrseg .hvd').length}));
ok(mk.n===2&&mk.tp===1&&/^13:2\d$/.test(mk.best)&&mk.hvd===1,'marcas '+JSON.stringify(mk));
await E(()=>{ histTab='lista'; go('hist'); }); await W8(800);
// fin de sesión de programa
await E(async()=>{ const s={id:'s-pf',kind:'fuerza',fecha:hoyISO(),tipo:'Calistenia · Día B',dur:40,ej:[{n:'Sentadilla',z:'cua',bw:true,series:[{r:8,kg:0}],fatiga:0}],vol:0,prog:{id:'base_cali',i:1}}; await saveSession(s); histEx=s.id; finCtx={}; go('fin'); }); await W8(1000);
const fp=await E(()=>({t:(document.querySelector('.finpg .row')||{}).textContent,wk:document.querySelectorAll('.finpg .prwk i').length}));
ok(/Base de calistenia/.test(fp.t)&&/2\/24/.test(fp.t)&&fp.wk===8,'fin programa '+JSON.stringify(fp));
await E(()=>{ const d=document.querySelector('[data-open]'); go('dia'); }); 
await p.close(); }
console.log('BAD',bad); console.log('ERRS',errs); await b.close(); })();
