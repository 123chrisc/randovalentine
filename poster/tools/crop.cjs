// Zoom into part of a rendered poster: node crop.cjs <full.png> <out.png> <x0%> <y0%> <x1%> <y1%>
// (percentages of the page). Uses Playwright to crop since PIL may not be available to every caller.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [src, out, x0, y0, x1, y1] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage();
  const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  await p.setContent(`<img id=i src="${data}" style="display:block">`); await p.waitForTimeout(100);
  const { w, h } = await p.evaluate(() => ({ w: i.naturalWidth, h: i.naturalHeight }));
  await p.setViewportSize({ width: w, height: h });
  await p.screenshot({ path: out, clip: { x: w * x0 / 100, y: h * y0 / 100, width: w * (x1 - x0) / 100, height: h * (y1 - y0) / 100 } });
  await b.close(); console.log('wrote', out);
})();
