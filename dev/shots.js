// Regenerate screenshots + the exported PNG artifact. Run: node dev/shots.js
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const CHROME = process.env.CHROME || '/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const APP = path.join(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const shots = [
    ['jm2-empty.png', '', 1680, 950, 1200],
    ['jm2-annual.png', '#annual', 1440, 900, 1500],
    ['jm2-annual-full.png', '#annual', 1440, 900, 1500], // same file, fit-width shows all stages
    ['jm2-major.png', '#major', 1440, 900, 1500],
    ['jm2-blank.png', '#blank', 1440, 900, 1500],
  ];
  for (const [f, hash, w, h, wait] of shots) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + APP + hash);
    await p.waitForTimeout(wait);
    await p.screenshot({ path: '/tmp/' + f });
    await p.close();
  }
  // exported artifact
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('file://' + APP + '#annual');
  await p.waitForTimeout(1200);
  const dlP = p.waitForEvent('download', { timeout: 10000 }).catch(() => null);
  await p.click('#btnExport'); await p.waitForTimeout(150);
  await p.click('#exportMenu [data-fmt="png"]');
  const dl = await dlP;
  if (dl) { fs.copyFileSync(await dl.path(), '/tmp/jm2-export.png'); console.log('exported artifact → /tmp/jm2-export.png'); }
  else console.log('EXPORT FAILED');
  await p.close();
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
