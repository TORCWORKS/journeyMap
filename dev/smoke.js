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
  await page.keyboard.press('Escape'); await page.waitForTimeout(60); // exit connect mode

  const cell0 = await page.locator('.cell').first().boundingBox();
  await page.mouse.move(cell0.x + 40, cell0.y + 40); await page.waitForTimeout(60);
  await page.locator('.cell .addghost').first().click({ position: { x: 20, y: 8 } });
  await page.waitForTimeout(120);
  await page.fill('#eTitle', 'Smoke test card');
  await page.keyboard.press("Enter"); // commit the new card
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
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  check('edit card persists', (await page.evaluate(() => document.querySelector('.card .ctitle').textContent)) === 'Renamed by test');

  // D-004: card kinds (Current | Idea) + filter
  await page.locator('.card .cedit').first().click(); await page.waitForTimeout(120);
  await page.click('.kbtn[data-k="idea"]'); await page.waitForTimeout(60);
  await page.selectOption('#ePrio', '1');
  await page.focus('#eTitle');
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  const ideaInfo=await page.evaluate(()=>({dom:[...document.querySelectorAll('.card')].filter(c=>c.classList.contains('idea')).length, stored:state.doc.cards.filter(c=>c.kind==='idea').map(c=>c.kind+':'+c.p)}));
  check('card becomes an Idea (dashed + stored)', ideaInfo.dom === 1 && ideaInfo.stored.length === 1 && ideaInfo.stored[0] === 'idea:1', JSON.stringify(ideaInfo));
  await page.click('#kindSeg button[data-k="idea"]'); await page.waitForTimeout(150);
  check('Ideas filter isolates idea cards', (await page.evaluate(() => document.querySelectorAll('.card').length)) === 1);
  await page.click('#kindSeg button[data-k="cur"]'); await page.waitForTimeout(150);
  check('Current filter excludes ideas', (await page.evaluate(() => document.querySelectorAll('.card').length)) === (c0 + 1 - 1));
  await page.click('#kindSeg button[data-k="both"]'); await page.waitForTimeout(150);
  check('All filter restores everything', (await page.evaluate(() => document.querySelectorAll('.card').length)) === c0 + 1);

  // D-005: editing is discoverable — click a card directly opens its editor
  const n3 = await page.locator('.card').nth(2).boundingBox();
  await page.mouse.click(n3.x + n3.width / 2, n3.y + 14);
  await page.waitForTimeout(150);
  check('clicking a card opens its editor', (await page.evaluate(() => document.getElementById('editor').style.display)) === 'flex');
  await page.fill('#eTitle', 'Edited by click');
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  check('direct editor save persists', (await page.evaluate(() => [...document.querySelectorAll('.card .ctitle')].some(t => t.textContent === 'Edited by click'))));

  // D-007: metrics — chip on card, auto-derived stage strip, suggested-norm autofill
  await page.locator('.card .cedit').first().click(); await page.waitForTimeout(120);
  await page.click('#eMetricToggle'); await page.waitForTimeout(60);
  await page.fill('#eMName', 'Gift reactivation rate');
  const bmAuto = await page.evaluate(() => document.getElementById('eMBm').value);
  check('metric benchmark autofills a suggested norm', bmAuto === '12%', 'bm=' + bmAuto);
  await page.fill('#eMCur', '9%'); await page.fill('#eMTgt', '14%');
  await page.focus('#eTitle'); await page.keyboard.press('Enter'); await page.waitForTimeout(180);
  const mres = await page.evaluate(() => ({ chip: document.querySelectorAll('.cmtr').length, stored: state.doc.cards.filter(c => c.m).length, strips: document.querySelectorAll('.mstrip').length }));
  check('metric chip renders + stores (seeded + added)', mres.stored >= 4 && mres.chip === mres.stored, JSON.stringify(mres));
  check('stage header strips auto-derive', mres.strips >= 1, 'strips=' + mres.strips);

  const dlP = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await page.click('#btnPng');
  const dl = await dlP;
  check('PNG export downloads a file', !!dl && (await dl.path()) !== null);
  await page.waitForTimeout(200);

  await page.reload(); await page.waitForTimeout(800);
  check('autosave restores on reload', (await cards()) === c0 + 1 && (await heads()) === 8, `cards=${await cards()} stages=${await heads()}`);
  check('no console/page errors', errors.length === 0, errors.join(' | ') || 'clean');

  console.log(`\n${23 - failed}/23 smoke checks passed`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });