// Template library gate (D-002): structural integrity of every portfolio template,
// lane lifecycle (toggle / custom add / delete), deep links, and old-doc migration.
// Run: node dev/templates.js      (exit 0 = pass)
const { chromium } = require('playwright-core');
const path = require('path');
const CHROME = process.env.CHROME || '/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

const EXPECT = {
  'annual-giving':     { stages: 6, cards: 33, eps: true  },
  'change-makers':     { stages: 6, cards: 29, eps: true  },
  'signature-events':  { stages: 6, cards: 30, eps: true  },
  'community-events':  { stages: 5, cards: 26, eps: true  },
  'planned-giving':    { stages: 6, cards: 30, eps: true  },
  'corporate-sponsorship': { stages: 6, cards: 30, eps: true  },
  'leadership-giving': { stages: 6, cards: 30, eps: true  },
  'blank':             { stages: 5, cards: 0,  eps: false },
};

let failed = 0;
function check(name, ok, detail) {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → ' + (detail || '')}`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept('Test lane'));

  // structural integrity per template
  for (const [k, exp] of Object.entries(EXPECT)) {
    await page.goto(URL + '#' + k);
    await page.waitForTimeout(60);
    await page.evaluate(() => localStorage.clear());
    await page.reload(); await page.waitForTimeout(450);
    const m = await page.evaluate(() => {
      const doc = state.doc;
      return {
        stages: doc.stages.length, cards: doc.cards.length, rows: doc.rows.map(r => r.id),
        badStage: doc.cards.some(c => !doc.stages.find(s => s.id === c.stage)),
        badRow: doc.cards.some(c => !doc.rows.find(r => r.id === c.row)),
        emptyTitles: doc.cards.filter(c => !String(c.title || '').trim()).length,
        notesLong: doc.cards.filter(c => String(c.note || '').length > 260).length,
      };
    });
    check(`${k}: ${exp.stages} stages / ${exp.cards} cards`, m.stages === exp.stages && m.cards === exp.cards, JSON.stringify(m));
    check(`${k}: all card refs resolve`, !m.badStage && !m.badRow && m.emptyTitles === 0 && m.notesLong === 0, `badStage=${m.badStage} badRow=${m.badRow} emptyTitles=${m.emptyTitles} notesLong=${m.notesLong}`);
    check(`${k}: lane set correct${exp.eps ? ' (incl. episodes lane)' : ''}`, exp.eps === m.rows.includes('eps') && m.rows.length === (exp.eps ? 5 : 4), m.rows.join(','));
    check(`${k}: has a gaps lane (optimizer hooks)`, m.rows.includes('gap'));
    const q=await page.evaluate(()=>{ const rows=state.doc.rows; return {n:rows.map(r=>String(r.q||'').trim()).filter(Boolean).length, total:rows.length}; });
    check(`${k}: every lane carries a guiding question`, q.n===q.total, q.n+'/'+q.total);
  }

  // lane lifecycle on a 5-lane template
  await page.goto(URL + '#change-makers');
  await page.waitForTimeout(60);
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(450);
  const chips0 = await page.evaluate(() => document.querySelectorAll('.chip').length);
  check('5 lane chips (incl. episodes)', chips0 === 5);
  await page.evaluate(() => [...document.querySelectorAll('.chip')].find(c => c.textContent.includes('Campaign calendar')).click());
  await page.waitForTimeout(150);
  check('hide lane reduces gutters by one', (await page.evaluate(() => document.querySelectorAll('.lanehead').length)) === 4);
  await page.evaluate(() => [...document.querySelectorAll('.chip')].find(c => c.textContent.includes('Campaign calendar')).click());
  await page.waitForTimeout(150);
  check('re-show lane restores gutters', (await page.evaluate(() => document.querySelectorAll('.lanehead').length)) === 5);
  await page.click('#btnAddRow'); await page.waitForTimeout(200);
  check('custom lane added to doc + chips', await page.evaluate(() =>
    state.doc.rows.some(r => r.name === 'Test lane') && document.querySelectorAll('.chip').length === 6));
  await page.evaluate(() => [...document.querySelectorAll('.chip')].find(c => c.textContent.includes('Test lane')).querySelector('.x').click());
  await page.waitForTimeout(200);
  check('custom lane deletable', await page.evaluate(() =>
    !state.doc.rows.some(r => r.name === 'Test lane') && document.querySelectorAll('.chip').length === 5));

  // old-doc migration: a v0.1.0 map (no rows) must load with the 4 default lanes
  await page.evaluate(() => {
    clearTimeout(saveT);                     // cancel any pending autosave first (D-021 flushes on unload)
    state.lib={maps:[],current:null};        // empty the in-memory library so the unload flush has nothing to write
    localStorage.removeItem('djm.lib.v1');   // migration fires when the library is missing or empty
    localStorage.removeItem('djm.doc.v1');
    const old = { app: 'journeymap', v: 1, doc: { title: 'Legacy map', stages: [{ id: 's1', name: 'Awareness' }],
      cards: [{ id: 'c1', stage: 's1', row: 'exp', title: 'T', note: 'N' }], edges: [] } };
    localStorage.setItem('djm.doc.v1', JSON.stringify(old.doc));
  });
  await page.reload(); await page.waitForTimeout(450);
  const mig = await page.evaluate(() => ({ rows: state.doc.rows.length, cardRowKept: state.doc.cards[0].row, stages: state.doc.stages.length }));
  check('legacy doc migrates to 4 default lanes', mig.rows === 4 && mig.cardRowKept === 'exp' && mig.stages === 1, JSON.stringify(mig));
  const migQ=await page.evaluate(()=>({lhq:document.querySelector('.lanehead .lhq')?document.querySelector('.lanehead .lhq').textContent.trim():'', chipTitle:document.querySelector('.chip')?document.querySelector('.chip').title:''}));
  check('legacy lanes still get guiding questions (fallback)', migQ.lhq.length>10 && migQ.chipTitle.length>10, JSON.stringify(migQ));

  check('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  const total = Object.keys(EXPECT).length * 5 + 7 + 1 + 1;
  console.log(`\n${total - failed}/${total} template checks passed`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });