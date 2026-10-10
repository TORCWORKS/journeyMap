const {chromium}=require('playwright-core');
const path=require('path');
const CHROME=process.env.CHROME||'/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const APP='file://'+path.join(__dirname,'..','index.html');
(async()=>{
  const b=await chromium.launch({executablePath:CHROME});
  const shots=[['jm5-empty.png','',1440,900],['jm5-annual.png','#annual-giving',1440,900],
    ['jm5-signature.png','#signature-events',1440,900],['jm5-corporate.png','#corporate-sponsorship',1440,900],
    ['jm5-planned.png','#planned-giving',1440,900]];
  for(const [f,h,w,ht] of shots){
    const p=await b.newPage({viewport:{width:w,height:ht}});
    await p.goto(APP+h); await p.waitForTimeout(60);
    if(h) await p.evaluate(()=>localStorage.clear());
    if(h){ await p.reload(); await p.waitForTimeout(1000); }
    else await p.waitForTimeout(600);
    await p.screenshot({path:'/tmp/'+f}); await p.close();
  }
  await b.close();
  console.log('wrote 5 template shots');
})().catch(e=>{console.error('FATAL',e);process.exit(1)});
