module.exports=async(p)=>{
/* efectos completos, como en el teléfono: en este entorno la detección cae en ahorro y esconde errores. Una prueba que quiera otro modo lo fija después. */
await p.evaluate(()=>{ PERF.modo='max'; perfApply(); });
await p.evaluate(()=>{document.querySelector('#newP').click()}); await p.waitForTimeout(200);
await p.evaluate(()=>{document.querySelector('#obNom').value='Fer';document.querySelector('#obPeso').value='82';
  /* desde v267 un perfil nuevo arranca vacío: las pruebas usan el perfil de siempre */
  CFG.diasFS=[0,1,3,5]; CFG.diasBS=[2,4,6]; CFG.diasF=4; CFG.diasB=3; CFG.gtg=true; CFG.lugares[0].equipo={barra:1,paralelas:1,mancuernas:1,tobilleras:1,bici:1,soga:1};
  ob.vals=Object.assign(ob.vals||{},{dom:8,fon:8,flex:8,hang:30,rod:8,bulg:8,mov_isq:1,mov_hom:1,tob:10,sq:1,sk_lsit:0,sk_hs:0,sk_pistol:0,sk_mu:0,bici:5}); });
for(let i=0;i<25;i++){ const st=await p.evaluate(()=>{ const r=document.querySelector('[data-obrut="rot"]'); if(r&&!r.classList.contains('on')){ r.click(); return 'n'; } const e=document.querySelector('#obNext'); if(e){ e.click(); return 'n'; } return 'd'; }); await p.waitForTimeout(40); if(st==='d') break; }
await p.evaluate(()=>{ const h=hoyISO(); const add=x=>SESS.push(x); let id=0;
  for(let d=0; d<140; d++){ const f=addDays(h,-d); const wd=wdIdx(f); const r=(d*37%11);
    if([0,2,4].includes(wd)&&r!==3){ const tipo=["Torso A","Piernas A","Torso B","Piernas B"][Math.floor(d/2)%4]; const p=buildDay(tipo); add({id:'f'+(id++),kind:'fuerza',fecha:f,tipo,dur:45+r,ej:p.ej.slice(0,5).map((e,i)=>({n:e.n,z:e.z,bw:e.bw,fatiga:1+((d+i)%3),series:Array.from({length:3},(_,k)=>({r:e.lo+((d+k)%3),kg:e.bw?(k%2?2.5:0):Math.round((10+ (140-d)/20)*2)/2,t:300+k*150+i*600}))})),vol:900+(140-d)*8}); }
    if([1,3,5].includes(wd)&&r!==5){ const inter=wd===3; const n=inter?480:480; const pp=[]; for(let i=0;i<n;i++){ const ph=inter?(i<120?'w':i>440?'c':(Math.floor((i-120)/42)%2===0?'h':'e')):(i<60?'w':i>450?'c':'e'); const base={w:36,e:52,h:98+(140-d)/30,c:34}[ph]; pp.push([Math.round(base+Math.sin(i)*4),ph,0]); } const I=intResumen(pp); add({id:'b'+(id++),kind:'bici',modo:'bici',fecha:f,tipo:inter?'Bloques 4×4':'Bici tranqui',min:40,kcal:inter?520:360,fatiga:2,int:I}); }
    if(wd===6&&r%2===0){ add({id:'r'+(id++),kind:'bici',modo:'correr',fecha:f,tipo:'Correr',min:30,kcal:380,km:4.6+(140-d)/200,ritmo:6.4-(140-d)/300,splits:[395,388,380,392],ruta:Array.from({length:60},(_,i)=>[-34.6+Math.sin(i/9)*0.004,-58.4+Math.cos(i/9)*0.006,i*30])}); }
    if(r%3===0) add({id:'m'+(id++),kind:'mov',fecha:f,tipo:'Movilidad · completa',min:12,items:['Childs_Pose'],zonas:[['isq','hom','cad','tob','mun'][d%5],'col'],ctx:'full'}); }
  SESS.sort((a,b)=>b.fecha.localeCompare(a.fecha));
  CFG.skHist={mv_tob:[[addDays(h,-60),8],[addDays(h,-30),10],[addDays(h,-5),11]],lsit:[[addDays(h,-50),10],[addDays(h,-30),18],[addDays(h,-10),25]]};
  CFG.skUp=[[addDays(h,-40),'mv_tob',2],[addDays(h,-10),'mv_isq',1],[addDays(h,-3),'mv_hom',2]];
  try{ CFG.skAuto=null; CFG.badges=null; autoUpCheck(); badgeCheck(); CELQ.length=0; CELON=false; document.querySelectorAll('.celov').forEach(x=>x.remove()); }catch(e){}
  saveCfg(); go('home'); });
};
