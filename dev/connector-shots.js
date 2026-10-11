// Visual artifacts for connector review (D-001): in-app at fit zoom, in-app at 100%, and the exported PNG.
const {chromium}=require('playwright-core');
const path=require('path'), fs=require('fs');
const CHROME=process.env.CHROME||'/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const APP='file://'+path.join(__dirname,'..','index.html')+'#annual';
(async()=>{
  const b=await chromium.launch({executablePath:CHROME});
  // make a small chain: card0 -> card1, card1 -> a card two stages over
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto(APP); await p.waitForTimeout(900);
  const els=await p.locator('.card').all();
  const bb=async i=>await els[i].boundingBox();
  await p.keyboard.press('c');
  for(const [i,j] of [[0,1],[1,3],[2,4]]){
    const a=await bb(i), c=await bb(j);
    await p.mouse.click(a.x+a.width/2,a.y+a.height/2); await p.waitForTimeout(70);
    await p.mouse.click(c.x+c.width/2,c.y+c.height/2); await p.waitForTimeout(90);
  }
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.screenshot({path:'/tmp/jm4-app-fit.png'});
  // zoomed detail around the connectors
  await p.selectOption('#zoomSel','1'); await p.waitForTimeout(400);
  await p.screenshot({path:'/tmp/jm4-app-100.png', clip:{x:120,y:120,width:900,height:420}});
  const dlP=p.waitForEvent('download',{timeout:10000});
  await p.click('#btnPng');
  const dl=await dlP; fs.copyFileSync(await dl.path(),'/tmp/jm4-export-arrows.png');
  console.log('wrote /tmp/jm4-app-fit.png, /tmp/jm4-app-100.png, /tmp/jm4-export-arrows.png');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
