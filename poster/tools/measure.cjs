// node measure.cjs <html> <css selector>... → bounding boxes in mm
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [file, ...sels] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2245, height: 3179 } });
  await p.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  const out = await p.evaluate((sels) => sels.flatMap(s => [...document.querySelectorAll(s)].map((e, i) => {
    const r = e.getBoundingClientRect(), k = 25.4 / 96;
    return `${s}[${i}]  x ${(r.left*k).toFixed(1)}–${(r.right*k).toFixed(1)}  y ${(r.top*k).toFixed(1)}–${(r.bottom*k).toFixed(1)}  (w ${(r.width*k).toFixed(1)} h ${(r.height*k).toFixed(1)})`;
  })), sels);
  console.log(out.join('\n')); await b.close();
})();
