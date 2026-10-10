// E2E smoke test for JourneyMap (single-file app). Run: node smoke.js
const { chromium } = require('playwright-core');
const CHROME = process.env.CHROME || '/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const URL = 'file://' + require('path').join(__dirname, '..', 'index.html');

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1680, height: 950 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  const heads = () => page.evaluate(() => document.querySelectorAll('.colhead').length);
  const cards = () => page.evaluate(() => document.querySelectorAll('.card').length);
  const edges = () => page.evaluate(() => document.querySelectorAll('#edges > path').length);

  await page.goto(URL + '#annual');
  await page.waitForTimeout(700);
  console.log('1 initial: stages=%d cards=%d edges=%d', await heads(), await cards(), await edges());

  // add a stage
  await page.click('#btnStage');
  await page.waitForTimeout(120);
  console.log('2 add stage: stages=%d', await heads());

  // delete first stage (hover reveals the ×)
  const hb = await page.locator('.colhead').first().boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.waitForTimeout(60);
  await page.locator('.colhead .del').first().click();
  await page.waitForTimeout(120);
  console.log('3 delete stage: stages=%d', await heads());

  // undo (restores deleted stage), redo-check buttons
  await page.click('#btnUndo');
  await page.waitForTimeout(100);
  console.log('4 undo: stages=%d (expect 8)', await heads());

  // connect mode: draw one edge
  await page.click('#btnConnect');
  const a = await page.locator('.card').nth(0).boundingBox();
  const b = await page.locator('.card').nth(1).boundingBox();
  await page.mouse.click(a.x + a.width / 2, a.y + 14);
  await page.waitForTimeout(80);
  await page.mouse.click(b.x + b.width / 2, b.y + 14);
  await page.waitForTimeout(120);
  console.log('5 connect: edges=%d (expect 1)', await edges());
  await page.mouse.click(1200, 900); // exit connect
  await page.waitForTimeout(60);

  // add a card via the cell ghost button
  const cell0 = await page.locator('.cell').first().boundingBox();
  await page.mouse.move(cell0.x + 40, cell0.y + 40);
  await page.waitForTimeout(80);
  await page.locator('.cell .addghost').first().click({ position: { x: 20, y: 8 }, timeout: 3000 });
  await page.waitForTimeout(120);
  await page.fill('#eTitle', 'Smoke test card');
  await page.fill('#eNote', 'Made by the automated test');
  await page.mouse.click(60, 700); // click the left gutter inside the workspace → saves the new card
  await page.waitForTimeout(180);
  console.log('6 add card: cards=%d (expect 28)', await cards());

  // drag first card from cell(0,row0) into cell(1,row0)
  const from = await page.locator('.cell').nth(0).locator('.card').first().boundingBox();
  const to = await page.locator('.cell').nth(1).boundingBox();
  const fy = from.y + from.height / 2;
  await page.mouse.move(from.x + 40, fy);
  await page.mouse.down();
  await page.mouse.move(from.x + 40, fy + 4, { steps: 3 });
  await page.mouse.move(to.x + 40, to.y + 30, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const c0 = await page.locator('.cell').nth(0).locator('.card').count();
  const c1 = await page.locator('.cell').nth(1).locator('.card').count();
  console.log('7 drag: cell0=%d cell1=%d (expect 2 / 4)', c0, c1);

  // edit an existing card via ⋯
  await page.locator('.card .cedit').first().click();
  await page.waitForTimeout(120);
  await page.fill('#eTitle', 'Renamed by test');
  await page.mouse.click(60, 700); // outside → save + close
  await page.waitForTimeout(150);
  const renamed = await page.evaluate(() => document.querySelector('.card .ctitle').textContent);
  console.log('8 edit card: title=%s', renamed);

  // undo should remove the edge (most recent commit before edit commit... order varies) — just verify undo works without error
  await page.click('#btnUndo');
  await page.waitForTimeout(120);

  // PNG export via download event
  const dlP = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await page.click('#btnPng');
  const dl = await dlP;
  const pngPath = dl ? await dl.path() : null;
  console.log('9 png export: %s', pngPath ? 'OK ' + pngPath : 'FAILED');
  await page.waitForTimeout(300);

  // reload → autosave restore
  await page.reload();
  await page.waitForTimeout(800);
  console.log('10 reload restore: cards=%d stages=%d', await cards(), await heads());
  console.log('ERRORS:', errors.length ? errors.join('\n  ') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });