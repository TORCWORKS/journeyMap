// Connector geometry test (D-001): asserts arrows attach to card borders, not float near them.
// Independent of the app's own geometry code — it measures the rendered path against real card rects.
// Run: node dev/connectors.js      (exit 0 = pass)
const { chromium } = require('playwright-core');
const path = require('path');
const CHROME = process.env.CHROME || '/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

const CHECKS = [];
function check(name, ok, detail) { CHECKS.push({ name, ok, detail }); }

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(URL + '#annual');
  await page.waitForTimeout(800);

  // connect the first two cards (adjacent stages, same lane)
  await page.keyboard.press('c');
  const els = await page.locator('.card').all();
  const a = await els[0].boundingBox(), b = await els[1].boundingBox();
  await page.mouse.click(a.x + a.width / 2, a.y + a.height / 2);
  await page.waitForTimeout(80);
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);   // let the card entrance animation + settle re-draw finish

  async function measure(label) {
    const m = await page.evaluate(() => {
      const grid = document.getElementById('grid');
      const svg = document.getElementById('edges');
      const gb = grid.getBoundingClientRect();
      const zr = (grid.offsetWidth ? gb.width / grid.offsetWidth : 1) || 1;
      const box = el => { const r = el.getBoundingClientRect();
        return { x: (r.left - gb.left) / zr, y: (r.top - gb.top) / zr, w: r.width / zr, h: r.height / zr }; };
      const els = [...document.querySelectorAll('.card')];
      const p = svg.querySelector('path[marker-end]');
      const circle = svg.querySelector('circle');
      const marker = svg.querySelector('marker');
      const nums = p.getAttribute('d').match(/-?[\d.]+/g).map(Number); // M x y C c1x c1y c2x c2y x y
      return {
        zoom: getComputedStyle(grid).zoom,
        A: box(els[0]), B: box(els[1]),
        d: p.getAttribute('d'), nums,
        svgW: +svg.getAttribute('width'), svgH: +svg.getAttribute('height'),
        nub: { cx: +circle.getAttribute('cx'), cy: +circle.getAttribute('cy') },
        refX: marker.getAttribute('refX'), markerUnits: marker.getAttribute('markerUnits'),
        lineCap: p.getAttribute('stroke-linecap'),
      };
    });
    const { nums, A, B } = m;
    const s = { x: nums[0], y: nums[1] }, e = { x: nums[6], y: nums[7] };
    const onBoundary = (pt, R) => {
      const T = 1.5;
      const withinX = pt.x >= R.x - T && pt.x <= R.x + R.w + T;
      const withinY = pt.y >= R.y - T && pt.y <= R.y + R.h + T;
      const onV = (Math.abs(pt.x - R.x) <= T || Math.abs(pt.x - (R.x + R.w)) <= T) && withinY;
      const onH = (Math.abs(pt.y - R.y) <= T || Math.abs(pt.y - (R.y + R.h)) <= T) && withinX;
      return onV || onH;
    };
    const inside = (pt, R, margin = 2) =>
      pt.x > R.x + margin && pt.x < R.x + R.w - margin && pt.y > R.y + margin && pt.y < R.y + R.h - margin;
    // bezier midpoint at t=0.5
    const mid = {
      x: 0.125 * nums[0] + 0.375 * nums[2] + 0.375 * nums[4] + 0.125 * nums[6],
      y: 0.125 * nums[1] + 0.375 * nums[3] + 0.375 * nums[5] + 0.125 * nums[7],
    };
    check(`${label}: start anchor ON source card border`, onBoundary(s, A), `start=(${s.x.toFixed(1)},${s.y.toFixed(1)}) A=${JSON.stringify(A)}`);
    check(`${label}: end anchor ON target card border`, onBoundary(e, B), `end=(${e.x.toFixed(1)},${e.y.toFixed(1)}) B=${JSON.stringify(B)}`);
    check(`${label}: connection spans real distance (not collapsed)`, Math.hypot(e.x - s.x, e.y - s.y) > 12, `dist=${Math.hypot(e.x - s.x, e.y - s.y).toFixed(1)}`);
    check(`${label}: curve does not pass through either card`, !inside(mid, A) && !inside(mid, B), `mid=(${mid.x.toFixed(1)},${mid.y.toFixed(1)})`);
    check(`${label}: origin nub sits on the path start`, Math.hypot(m.nub.cx - s.x, m.nub.cy - s.y) < 0.6, `nub=(${m.nub.cx},${m.nub.cy})`);
    check(`${label}: arrow tip coincides with path end (refX=10, userSpaceOnUse)`, m.refX === '10' && m.markerUnits === 'userSpaceOnUse', `refX=${m.refX} units=${m.markerUnits}`);
    check(`${label}: line cap is butt (no overshoot past the tip)`, m.lineCap === 'butt', `cap=${m.lineCap}`);
    check(`${label}: svg sized to the grid in layout px`, m.svgW > 1000 && m.svgH > 200, `svg=${m.svgW}x${m.svgH}`);
    return m.zoom;
  }

  const z1 = await measure('fit-zoom');

  // D-006: the dragged card must stay glued to the cursor at ANY zoom
  async function trackTest(label) {
    const src = await page.locator('.card').nth(1).boundingBox();
    const endX = src.x + 150, endY = src.y + 100;
    await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2);
    await page.mouse.down();
    // fine-grained steps mimic real continuous pointermoves; coarse jumps (e.g. 12)
    // trigger the drag threshold mid-jump and skew the anchor by one step
    await page.mouse.move(endX, endY, { steps: 72 });
    await page.waitForTimeout(60);
    const t = await page.evaluate(() => {
      const el = document.querySelector('.card.dragging');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
    });
    check(`${label}: dragged card stays glued to the cursor`, !!t && Math.hypot(t.cx - endX, t.cy - endY) < 2, t ? `card=(${t.cx.toFixed(1)},${t.cy.toFixed(1)}) cursor=(${endX.toFixed(1)},${endY.toFixed(1)})` : 'no dragging card');
    const d2 = await page.evaluate(() => document.querySelector('#edges path[marker-end]') && document.querySelector('#edges path[marker-end]').getAttribute('d'));
    await page.mouse.up();
    await page.waitForTimeout(200);
    return d2;
  }
  const duringFit = await trackTest('fit-zoom');
  check('connector follows the card during drag (fit-zoom)', duringFit && z1 !== duringFit, 'path changed while dragging');

  await page.selectOption('#zoomSel', '1');
  await page.waitForTimeout(350);
  await measure('100%');
  const before = await page.evaluate(() => document.querySelector('#edges path[marker-end]') ? document.querySelector('#edges path[marker-end]').getAttribute('d') : null);
  const during100 = await trackTest('100%');
  check('connector follows the card during drag (100%)', before !== during100, 'path changed while dragging');

  check('no console/page errors', errors.length === 0, errors.join(' | ') || 'clean');

  let failed = 0;
  for (const c of CHECKS) {
    if (!c.ok) failed++;
    console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.ok ? '' : '  → ' + c.detail}`);
  }
  console.log(`\n${CHECKS.length - failed}/${CHECKS.length} connector checks passed (fit zoom was ${z1})`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
