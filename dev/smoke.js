// E2E smoke test for JourneyMap (single-file app). Run: node dev/smoke.js   (exit 0 = pass)
const { chromium } = require('playwright-core');
const path = require('path');
const CHROME = process.env.CHROME || 'chromium';
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

let failed = 0; let ran = 0;
function check(name, ok, detail) {
  ran++;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → ' + (detail || '')}`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1680, height: 950 } });
  const errors = [];
  page.on('dialog', d => d.accept());
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  const heads = () => page.evaluate(() => document.querySelectorAll('.colhead').length);
  const cards = () => page.evaluate(() => document.querySelectorAll('.card').length);
  const edges = () => page.evaluate(() => document.querySelectorAll('#edges > path').length);

  await page.goto(URL);
  await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(700);
  const fresh = await page.evaluate(() => ({ doc: !!state.doc, title: state.doc ? state.doc.title : null, landing: document.getElementById('empty').style.display !== 'none', hint: document.getElementById('startHint').style.display === 'flex' }));
  check('new users default to a blank journey', fresh.doc && fresh.title === 'Untitled donor journey' && !fresh.landing, JSON.stringify(fresh));
  check('Torc Works footer present', (await page.evaluate(() => document.querySelector('.appfoot').textContent.includes('TORC WORKS'))));
  check('version stamp is set', (await page.evaluate(() => document.getElementById('verStamp').textContent)) === 'v0.1.14-alpha');
  check('first-run hint shows on the empty blank map', fresh.hint);
  await page.click('#brandHome'); await page.waitForTimeout(250);
  const tileN = await page.evaluate(() => document.querySelectorAll('#tplGrid .tpl').length);
  check('landing shows 6 portfolio tiles', tileN === 6, 'tiles=' + tileN);
  const blankBtn = await page.evaluate(() => !!document.getElementById('blankJourney'));
  check('blank journey button on the label row', blankBtn);
  const icN = await page.evaluate(() => document.querySelectorAll('#tplGrid .tpl .t-ic').length);
  check('landing tile icons inline', icN === 6, 'icons=' + icN);
  const blankOk = await page.evaluate(() => { const b = document.getElementById('blankJourney'); b.click(); return !!state.doc && state.doc.cards.length === 0; });
  check('blank button starts an empty map', blankOk);

  // D-036: save-failure warning (storage full/blocked must never be silent)
  await page.evaluate(() => {
    const orig=localStorage.setItem.bind(localStorage);
    localStorage.setItem=()=>{ throw new DOMException('QuotaExceededError','QuotaExceededError'); };
    saveLibNow();
    localStorage.setItem=orig;
  });
  await page.waitForTimeout(120);
  check('storage failure surfaces a pinned warning', (await page.evaluate(() => document.getElementById('saveWarn').style.display)) === 'flex');
  await page.click('#saveWarnClose'); await page.waitForTimeout(80);
  await page.goto(URL + '#annual');
  await page.waitForTimeout(700);
  const s0 = await heads(), c0 = await cards();
  const tplIdeas = await page.evaluate(() => state.doc.cards.filter(c => c.kind === 'idea').length);
  check('template loads (annual-giving frame: 6 stages / 0 cards)', s0 === 6 && c0 === 0, `stages=${s0} cards=${c0}`);

  // D-035: untouched views are NOT your work — hidden from My maps until touched
  await page.click('#btnMaps'); await page.waitForTimeout(150);
  const untouchRows = await page.evaluate(() => [...document.querySelectorAll('#mapsItems .mrow')].filter(r => r.textContent.includes('Annual giving')).length);
  await page.mouse.click(400, 500); await page.waitForTimeout(80);
  check('untouched template view absent from My maps', untouchRows === 0, 'rows=' + untouchRows);
  await page.fill('#mapTitle', 'Annual giving — my journey');   // a real touch: renaming the map
  await page.waitForTimeout(200);
  await page.click('#btnMaps'); await page.waitForTimeout(150);
  const touchRows = await page.evaluate(() => [...document.querySelectorAll('#mapsItems .mrow')].filter(r => r.textContent.includes('Annual giving')).length);
  await page.mouse.click(400, 500); await page.waitForTimeout(80);
  check('touched map appears in My maps', touchRows >= 1, 'rows=' + touchRows);

  // D-031: the dedicated Frame ⇄ Worked example toggle in the rowbar
  const tgOn = await page.evaluate(() => document.getElementById('tplToggle').style.display === 'flex' && document.querySelector('#tplToggle [data-v="frame"]').classList.contains('on'));
  check('template toggle visible + Frame active on a template map', tgOn);
  await page.click('#tplToggle [data-v="ex"]'); await page.waitForTimeout(350);
  const exM = await page.evaluate(() => ({ title: state.doc.title, cards: state.doc.cards.length, ex: !!state.doc._ex, edges: state.doc.edges.length }));
  check('toggle opens the worked example', exM.title.includes('worked example') && exM.cards === 33 && exM.ex && exM.edges >= 2, JSON.stringify(exM));
  await page.fill('#mapTitle', 'Example I am working on');   // touch the example too (copy-from work counts)
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  await page.click('#tplToggle [data-v="frame"]'); await page.waitForTimeout(350);
  const frM = await page.evaluate(() => ({ title: state.doc.title, cards: state.doc.cards.length, ex: !!state.doc._ex }));
  check('toggle returns to the (zero-card) frame', frM.cards === 0 && !frM.ex && frM.title.includes('my journey'), JSON.stringify(frM));
  check('frame + example stay two separate maps', (await page.evaluate(() => state.lib.maps.filter(m => m.doc._tpl === 'annual-giving').length)) === 2, 'maps=2 expected');

  // D-034: stale example maps (pre-links) self-heal back to >=2 links on open
  await page.evaluate(() => {
    const ex = state.lib.maps.find(m => m.doc._tpl === 'annual-giving' && m.doc._ex);
    ex.doc.edges = []; saveLibNow();
    openMap(state.lib.maps.find(m => m.doc._tpl === 'annual-giving' && !m.doc._ex).id);   // leave the frame
  });
  await page.waitForTimeout(250);
  await page.evaluate(() => { const ex = state.lib.maps.find(m => m.doc._tpl === 'annual-giving' && m.doc._ex); openMap(ex.id); });
  await page.waitForTimeout(300);
  check('stale example map self-heals to >=2 links on open', (await page.evaluate(() => state.doc.edges.length)) >= 2, 'edges=' + (await page.evaluate(() => state.doc.edges.length)));
  const ideaBadge = await page.evaluate(() => { const c = document.querySelector('.card.idea .cmk'); const cs = c ? getComputedStyle(c) : null; return cs ? (cs.backgroundColor + '|' + cs.borderColor) : 'none'; });
  check('idea cards carry a visible badge', ideaBadge.includes('rgb(255, 233, 168)') && ideaBadge.includes('rgb(230, 197, 91)'), ideaBadge);
  await page.evaluate(() => { const fr = state.lib.maps.find(m => m.doc._tpl === 'annual-giving' && !m.doc._ex); openMap(fr.id); });   // back to the zero-card frame for the flow below
  await page.waitForTimeout(250);

  // D-035/B1: the ✨ entry reuses the single example instead of duplicating
  await page.click('#btnTpl'); await page.waitForTimeout(150);
  await page.evaluate(() => { [...document.querySelectorAll('#tplItems .mrow .act')][0].click(); });
  await page.waitForTimeout(300);
  const dedupe = await page.evaluate(() => ({ ex: !!state.doc._ex, one: state.lib.maps.filter(m => m.doc._tpl === 'annual-giving' && m.doc._ex).length }));
  await page.click('#tplToggle [data-v="frame"]'); await page.waitForTimeout(300);
  check('✨ reuses the existing example (no duplicates)', dedupe.ex && dedupe.one === 1, JSON.stringify(dedupe));

  // D-036: lane renaming (any lane) — double-click the episodes chip
  await page.evaluate(() => { const chip=[...document.querySelectorAll('.chip')].find(c=>c.textContent.includes('Recurring episodes')); chip.dispatchEvent(new MouseEvent('dblclick',{bubbles:true})); });
  await page.waitForTimeout(120);
  await page.fill('#rowChips .lanein', 'Our annual calendar');
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  const renamed = await page.evaluate(() => ({ chip: [...document.querySelectorAll('.chip')].some(c => c.textContent.includes('Our annual calendar')), row: (state.doc.rows.find(r=>r.id==='eps') || {}).name }));
  check('lane renames in place (double-click chip)', renamed.chip && renamed.row === 'Our annual calendar', JSON.stringify(renamed));

  await page.click('#btnStage'); await page.waitForTimeout(120);
  check('add stage', (await heads()) === s0 + 1);

  const hb = await page.locator('.colhead').first().boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.waitForTimeout(60);
  await page.locator('.colhead .del').first().click(); await page.waitForTimeout(120);
  check('delete stage', (await heads()) === s0);

  await page.click('#btnUndo'); await page.waitForTimeout(100);
  check('undo restores stage', (await heads()) === s0 + 1);

  // D-021: drag a stage column to reorder it (must keep all cards)
  const stBefore = await page.evaluate(() => state.doc.stages.map(x => x.name));
  const cardsBefore = await cards();
  const fc = await page.locator('.colhead').first().boundingBox();
  const lc = await page.locator('.colhead').last().boundingBox();
  await page.mouse.move(fc.x + 14, fc.y + fc.height / 2);   // grab the number badge, not the name input
  await page.mouse.down();
  await page.mouse.move(fc.x + 60, fc.y + fc.height / 2, { steps: 6 });
  await page.mouse.move(lc.x + lc.width / 2 + 20, lc.y + lc.height / 2, { steps: 16 });
  await page.mouse.up(); await page.waitForTimeout(250);
  const stAfter = await page.evaluate(() => state.doc.stages.map(x => x.name));
  check('drag reorders stage columns', JSON.stringify(stBefore) !== JSON.stringify(stAfter) && stAfter[stAfter.length - 1] === stBefore[0], `${stBefore[0]} → ${stAfter[stAfter.length - 1]}`);
  check('reordering keeps every card', (await cards()) === cardsBefore);

  // frames are zero-card, so build two scratch cards to connect, then clean up
  await page.locator('.cell .addghost').first().click({ position: { x: 20, y: 8 } });
  await page.waitForTimeout(120); await page.fill('#eTitle', 'Scratch A'); await page.keyboard.press('Enter'); await page.waitForTimeout(180);
  await page.locator('.cell').nth(1).locator('.addghost').click({ position: { x: 20, y: 8 } });
  await page.waitForTimeout(120); await page.fill('#eTitle', 'Scratch B'); await page.keyboard.press('Enter'); await page.waitForTimeout(180);
  await page.keyboard.press('c');   // connect mode via C (toolbar button removed)
  const a = await page.locator('.card').nth(0).boundingBox();
  const b = await page.locator('.card').nth(1).boundingBox();
  await page.mouse.click(a.x + a.width / 2, a.y + 14); await page.waitForTimeout(80);
  await page.mouse.click(b.x + b.width / 2, b.y + 14); await page.waitForTimeout(120);
  check('connect creates one flow edge', (await edges()) === 1);
  await page.keyboard.press('Escape'); await page.waitForTimeout(60); // exit connect mode
  await page.evaluate(() => { state.doc.cards = []; state.doc.edges = []; commit(); }); // leave the frame pristine
  await page.waitForTimeout(150);

  const cell0 = await page.locator('.cell').first().boundingBox();
  await page.mouse.move(cell0.x + 40, cell0.y + 40); await page.waitForTimeout(60);
  await page.locator('.cell .addghost').first().click({ position: { x: 20, y: 8 } });
  await page.waitForTimeout(120);
  await page.fill('#eTitle', 'Smoke test card');
  await page.keyboard.press("Enter"); // commit the new card
  await page.waitForTimeout(180);
  check('add card', (await cards()) === c0 + 1, `cards=${await cards()} expected ${c0 + 1}`);
  await page.waitForTimeout(250);
  const hintDbg = await page.evaluate(() => ({ disp: document.getElementById('startHint').style.display, cards: document.querySelectorAll('.card').length, dismissed: state.hintDismissed, emptyOpen: document.getElementById('empty').style.display }));
  check('hint hides once the map has cards', hintDbg.disp === 'none', JSON.stringify(hintDbg));

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
  check('card becomes an Idea (dashed + stored)', ideaInfo.dom === tplIdeas + 1 && ideaInfo.stored.length === tplIdeas + 1 && ideaInfo.stored.includes('idea:1'), JSON.stringify(ideaInfo));
  await page.click('#kindSeg button[data-k="idea"]'); await page.waitForTimeout(150);
  check('Ideas filter isolates idea cards', (await page.evaluate(() => document.querySelectorAll('.card').length)) === tplIdeas + 1);
  await page.click('#kindSeg button[data-k="cur"]'); await page.waitForTimeout(150);
  check('Current filter excludes ideas', (await page.evaluate(() => document.querySelectorAll('.card').length)) === (c0 + 1) - (tplIdeas + 1));
  await page.click('#kindSeg button[data-k="both"]'); await page.waitForTimeout(150);
  check('All filter restores everything', (await page.evaluate(() => document.querySelectorAll('.card').length)) === c0 + 1);

  // D-005: editing is discoverable — click a card directly opens its editor
  await page.waitForTimeout(350);   // let the entrance animation settle before the click
  const n3 = await page.locator('.card').nth(0).boundingBox();
  await page.mouse.click(n3.x + n3.width / 2, n3.y + 14);
  await page.waitForTimeout(150);
  check('clicking a card opens its editor', (await page.evaluate(() => document.getElementById('editor').style.display)) === 'flex');
  await page.fill('#eTitle', 'Edited by click');
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  check('direct editor save persists', (await page.evaluate(() => [...document.querySelectorAll('.card .ctitle')].some(t => t.textContent.replace(/^\s*💡\s*/, '') === 'Edited by click'))));

  // D-008: method page (method & sources explainer) — now under More ▾
  await page.click('#btnMore'); await page.waitForTimeout(150);
  await page.click('#btnMethod'); await page.waitForTimeout(200);
  const meth = await page.evaluate(() => ({ len: document.getElementById('methodBody').textContent.length, kalbach: document.getElementById('methodBody').textContent.includes('Kalbach'), moves: document.getElementById('methodBody').textContent.includes('moves management') }));
  check('method page opens with the source lineage', meth.len > 1500 && meth.kalbach && meth.moves, JSON.stringify(meth));
  await page.click('#methodClose'); await page.waitForTimeout(120);
  check('method page closes', (await page.evaluate(() => document.getElementById('methodWrap').style.display)) === 'none');

  // D-032/D-033: alpha feedback — modal, report assembly, POST-to-inbox + clipboard fallback
  await page.click('#btnMore'); await page.waitForTimeout(150);
  await page.click('#fbOpen'); await page.waitForTimeout(150);
  check('feedback modal opens from More ▾', (await page.evaluate(() => document.getElementById('fbModal').style.display)) === 'flex');
  await page.fill('#fbText', 'Loved the frame, found the toggle quickly');
  const fb = await page.evaluate(() => { const b = feedbackBody(); return { hasVer: b.includes(APP_VERSION), hasBoard: b.includes('stages ·'), hasBrowser: b.includes('Browser:'), noMapJson: !b.includes('Map state') }; });
  check('feedback body has version + board + browser, no map by default', fb.hasVer && fb.hasBoard && fb.hasBrowser && fb.noMapJson, JSON.stringify(fb));
  await page.click('#fbInc');
  check('checking "include my map" embeds the JSON (opt-in)', (await page.evaluate(() => feedbackBody().includes('Map state'))));
  const sent = await page.evaluate(async () => {
    FEEDBACK_TO = 'tester@example.com';   // activate the POST path for this test
    window.fetch = (u, o) => Promise.resolve({ ok: true });
    document.getElementById('fbSend').disabled = false;
    document.getElementById('fbSend').click();
    await new Promise(r => setTimeout(r, 200));
    return { st: document.getElementById('fbStatus').textContent, showsDone: document.getElementById('fbStatus').textContent.includes('thank') };
  });
  check('Send posts and confirms (stubbed fetch)', sent.st.includes('Sent — thank you'), JSON.stringify(sent));
  await page.evaluate(() => { window.fetch = () => Promise.reject(new Error('offline')); document.getElementById('fbSend').disabled = false; document.getElementById('fbSend').click(); });
  await page.waitForTimeout(200);
  check('unreachable inbox falls back to clipboard copy', (await page.evaluate(() => document.getElementById('fbStatus').textContent.includes('clipboard'))));
  await page.click('#fbClose'); await page.waitForTimeout(100);
  check('feedback modal closes', (await page.evaluate(() => document.getElementById('fbModal').style.display)) === 'none');

  // D-007: metrics — chip on card, auto-derived stage strip, suggested-norm autofill
  await page.locator('.card .cedit').first().click(); await page.waitForTimeout(120);
  await page.click('#eMetricToggle'); await page.waitForTimeout(60);
  await page.fill('#eMName', 'Gift reactivation rate');
  const bmAuto = await page.evaluate(() => document.getElementById('eMBm').value);
  check('metric benchmark autofills a suggested norm', bmAuto === '12%', 'bm=' + bmAuto);
  await page.fill('#eMCur', '9%'); await page.fill('#eMTgt', '14%');
  await page.focus('#eTitle'); await page.keyboard.press('Enter'); await page.waitForTimeout(180);
  const mres = await page.evaluate(() => ({ chip: document.querySelectorAll('.cmtr').length, stored: state.doc.cards.filter(c => c.m).length, strips: document.querySelectorAll('.mstrip').length }));
  check('metric chip renders + stores on the card', mres.stored >= 1 && mres.chip === mres.stored && mres.strips >= 1, JSON.stringify(mres));
  // D-012: links are removable from the card editor (build the edge first)
  await page.locator('.cell').nth(1).locator('.addghost').click({ position: { x: 20, y: 8 } });
  await page.waitForTimeout(120); await page.fill('#eTitle', 'Link target'); await page.keyboard.press('Enter'); await page.waitForTimeout(180);
  await page.keyboard.press('c');
  const lk1 = await page.locator('.card').nth(0).boundingBox();
  const lk2 = await page.locator('.card').nth(1).boundingBox();
  await page.mouse.click(lk1.x + lk1.width / 2, lk1.y + 14); await page.waitForTimeout(80);
  await page.mouse.click(lk2.x + lk2.width / 2, lk2.y + 14); await page.waitForTimeout(150);
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  const srcId = await page.evaluate(() => state.doc.edges[0].from);
  await page.locator('.card[data-id="' + srcId + '"] .cedit').first().click(); await page.waitForTimeout(150);
  check('editor lists the card\'s links', (await page.evaluate(() => document.querySelectorAll('#eLinks .el').length)) === 1, 'entries=' + (await page.evaluate(() => document.querySelectorAll('#eLinks .el').length)));
  await page.evaluate(() => { const r = document.querySelector('#eLinks .el .rem'); if (r) r.click(); });
  await page.waitForTimeout(200);
  check('removing the link deletes the edge', (await page.evaluate(() => state.doc.edges.length)) === 0, 'edges=' + (await page.evaluate(() => state.doc.edges.length)));
  await page.keyboard.press('Escape'); await page.waitForTimeout(120);
  await page.evaluate(() => {   // drop the scratch 'Link target' card again
    const t = state.doc.cards.find(c => c.title === 'Link target');
    if (t) state.doc.cards = state.doc.cards.filter(c => c.id !== t.id);
    state.doc.edges = []; commit();
  });
  await page.waitForTimeout(150);
  check('stage header strips auto-derive', mres.strips >= 1, 'strips=' + mres.strips);

  await page.click('#btnExport'); await page.waitForTimeout(120);
  const dlP = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await page.click('#exportMenu [data-fmt="png"]');
  const dl = await dlP;
  check('PNG export downloads a file', !!dl && (await dl.path()) !== null);
  await page.waitForTimeout(200);

  await page.reload(); await page.waitForTimeout(800);
  check('autosave restores on reload', (await cards()) === c0 + 1 && (await heads()) === 7, `cards=${await cards()} stages=${await heads()}`);

  // D-009: maps library (workspace) — mutates the current map, so it runs after the restore check
  await page.click('#btnMaps'); await page.waitForTimeout(120);
  check('My maps lists the current map', (await page.evaluate(() => document.querySelectorAll('#mapsItems .mrow').length)) >= 1);
  await page.mouse.click(1450, 300); await page.waitForTimeout(80);
  await page.click('#btnTpl'); await page.waitForTimeout(120);
  await page.evaluate(() => { [...document.querySelectorAll('#tplItems [data-tpl]')].find(b => b.dataset.tpl === 'blank').click(); });
  await page.waitForTimeout(250);
  check('template creates a new library map', (await page.evaluate(() => state.lib.maps.length)) >= 2);
  await page.click('#btnMaps'); await page.waitForTimeout(120);
  await page.evaluate(() => { [...document.querySelectorAll('#mapsItems .mrow')].find(r => r.textContent.includes('Annual giving') && !r.textContent.includes('worked example')).click(); });
  await page.waitForTimeout(250);
  check('switching maps restores the other doc', (await page.evaluate(() => state.doc.title.includes('Annual giving'))) && (await heads()) === 7);
  await page.click('#btnMaps'); await page.waitForTimeout(120);
  await page.evaluate(() => { [...document.querySelectorAll('#mapsItems .mrow')].find(r => r.textContent.includes('Annual giving')).querySelector('[data-act="dup"]').click(); });
  await page.waitForTimeout(250);
  check('duplicate makes an independent copy', (await page.evaluate(() => state.lib.maps.some(m => m.doc.title.includes('(copy)')))) && (await page.evaluate(() => state.lib.maps.length)) >= 3);
  await page.click('#btnMaps'); await page.waitForTimeout(120);
  await page.evaluate(() => { [...document.querySelectorAll('#mapsItems .mrow')].find(r => r.textContent.includes('(copy)')).querySelector('[data-act="del"]').click(); });
  await page.waitForTimeout(200);
  check('delete removes the copy', !(await page.evaluate(() => state.lib.maps.some(m => m.doc.title.includes('(copy)')))));
  // D-010: the logo returns to the start screen (template picker) over the current map
  await page.click('.brand'); await page.waitForTimeout(200);
  check('logo opens the start screen over the current map', (await page.evaluate(() => document.getElementById('empty').style.display === '')) && (await page.evaluate(() => document.querySelectorAll('.colhead').length)) >= 1);
  await page.click('#startClose'); await page.waitForTimeout(150);
  check('start closes back to the current map', (await page.evaluate(() => document.getElementById('empty').style.display === 'none')) && (await page.evaluate(() => document.querySelectorAll('.colhead').length)) >= 1);
  check('no console/page errors (after library)', errors.length === 0, errors.join(' | ') || 'clean');

  console.log(`\n${ran - failed}/${ran} smoke checks passed`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });