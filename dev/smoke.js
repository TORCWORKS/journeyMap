// E2E smoke test for JourneyMap (single-file app). Run: node dev/smoke.js   (exit 0 = pass)
const { chromium } = require('playwright-core');
const path = require('path');
const CHROME = process.env.CHROME || '/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

let failed = 0;
function check(name, ok, detail) {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → ' + (detail || '')}`);
}

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
  const s0 = await heads(), c0 = await cards();
  check('template loads (annual-giving, 7 stages / 32 cards)', s0 === 7 && c0 === 32, `stages=${s0} cards=${c0}`);

  await page.click('#btnStage'); await page.waitForTimeout(120);
  check('add stage', (await heads()) === s0 + 1);

  const hb = await page.locator('.colhead').first().boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.waitForTimeout(60);
  await page.locator('.colhead .del').first().click(); await page.waitForTimeout(120);
  check('delete stage', (await heads()) === s0);

  await page.click('#btnUndo'); await page.waitForTimeout(100);
  check('undo restores stage', (await heads()) === s0 + 1);

  await page.click('#btnConnect');
  const a = await page.locator('.card').nth(0).boundingBox();
  const b = await page.locator('.card').nth(1).boundingBox();
  await page.mouse.click(a.x + a.width / 2, a.y + 14); await page.waitForTimeout(80);
  await page.mouse.click(b.x + b.width / 2, b.y + 14); await page.waitForTimeout(120);
  check('connect creates one flow edge', (await edges()) === 1);
  await page.mouse.click(60, 700); await page.waitForTimeout(60); // exit connect

  const cell0 = await page.locator('.cell').first().boundingBox();
  await page.mouse.move(cell0.x + 40, cell0.y + 40); await page.waitForTimeout(60);
  await page.locator('.cell .addghost').first().click({ position: { x: 20, y: 8 } });
  await page.waitForTimeout(120);
  await page.fill('#eTitle', 'Smoke test card');
  await page.mouse.click(60, 700); // outside editor → commits
  await page.waitForTimeout(180);
  check('add card', (await cards()) === c0 + 1, `cards=${await cards()} expected ${c0 + 1}`);

  const cBefore0 = await page.locator('.cell').nth(0).locator('.card').count();
  const cBefore1 = await page.locator('.cell').nth(1).locator('.card').count();
  const from = await page.locator('.cell').nth(0).locator('.card').first().boundingBox();
  const to = await page.locator('.cell').nth(1).boundingBox();
  const fy = from.y + from.height / 2;
  await page.mouse.move(from.x + 40, fy); await page.mouse.down();
  await page.mouse.move(from.x + 40, fy + 4, { steps: 3 });
  await page.mouse.move(to.x + 40, to.y + 30, { steps: 14 });
  await page.mouse.up(); await page.waitForTimeout(200);
  const cAfter0 = await page.locator('.cell').nth(0).locator('.card').count();
  const cAfter1 = await page.locator('.cell').nth(1).locator('.card').count();
  check('drag moves card between cells', cAfter0 === cBefore0 - 1 && cAfter1 === cBefore1 + 1, `${cBefore0}→${cAfter0}, ${cBefore1}→${cAfter1}`);

  await page.locator('.card .cedit').first().click(); await page.waitForTimeout(120);
  await page.fill('#eTitle', 'Renamed by test');
  await page.mouse.click(60, 700); await page.waitForTimeout(150);
  check('edit card persists', (await page.evaluate(() => document.querySelector('.card .ctitle').textContent)) === 'Renamed by test');

  const dlP = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await page.click('#btnPng');
  const dl = await dlP;
  check('PNG export downloads a file', !!dl && (await dl.path()) !== null);
  await page.waitForTimeout(200);

  await page.reload(); await page.waitForTimeout(800);
  check('autosave restores on reload', (await cards()) === c0 + 1 && (await heads()) === 8, `cards=${await cards()} stages=${await heads()}`);
  check('no console/page errors', errors.length === 0, errors.join(' | ') || 'clean');

  console.log(`\n${14 - failed}/14 smoke checks passed`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });