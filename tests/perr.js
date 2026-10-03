const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on('pageerror',e=>console.log('ERR',e.message,e.stack&&e.stack.split('\n')[1])); p.on('console',m=>{ if(m.type()==='error') console.log('CON',m.text()); });
  await p.goto('http://127.0.0.1:8765/'+process.argv[2]); await p.waitForTimeout(1500); console.log('done'); await b.close(); })();
