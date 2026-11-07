// Render a poster HTML to a vector A1 PDF + PNG previews, and report layout problems.
// usage: node render.cjs <poster.html> [outBase] [--w=594 --h=841 (mm)]
// outputs: <outBase>.pdf, <outBase>.png (preview ~1120px wide), <outBase>-full.png (~2245px wide, for zoomed inspection)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const args = process.argv.slice(2);
  const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
  const [file, outArg] = args.filter(a => !a.startsWith('--'));
  const W = +(opt.w || 594), H = +(opt.h || 841);
  const out = outArg || file.replace(/\.html?$/, '');
  const pxW = Math.round(W / 25.4 * 96), pxH = Math.round(H / 25.4 * 96);
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const msgs = [];
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') msgs.push('console ' + m.type() + ': ' + m.text()); });
  p.on('requestfailed', r => msgs.push('request failed: ' + r.url()));
  await p.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  // ---- layout QA ----
  const report = await p.evaluate(([pxW, pxH]) => {
    const issues = [];
    const desc = el => {
      let s = el.tagName.toLowerCase();
      if (el.id) s += '#' + el.id;
      if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).join('.');
      const t = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      return s + (t ? ` "${t}"` : '');
    };
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (el.hasAttribute('data-clip')) continue;   // intentional crop (e.g. photo circles)
      if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== 'visible')
        issues.push(`clipped horizontally (${el.scrollWidth}>${el.clientWidth}px): ${desc(el)}`);
      if (el.scrollHeight > el.clientHeight + 2 && cs.overflowY !== 'visible' && el.clientHeight > 0)
        issues.push(`clipped vertically (${el.scrollHeight}>${el.clientHeight}px): ${desc(el)}`);
      if (r.right > pxW + 1 || r.bottom > pxH + 1 || r.left < -1 || r.top < -1)
        if (!el.closest('[data-bleed]')) issues.push(`outside the page (${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}): ${desc(el)}`);
    }
    // missing fonts: list families actually used vs loaded
    const used = new Set();
    for (const el of document.querySelectorAll('body *')) used.add(getComputedStyle(el).fontFamily);
    const loaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight);
    const imgs = [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => 'broken image: ' + i.src);
    const docH = document.documentElement.scrollHeight, docW = document.documentElement.scrollWidth;
    if (docH > pxH + 1) issues.push(`document is taller than one page (${docH}px > ${pxH}px) — content will spill to a 2nd PDF page`);
    if (docW > pxW + 1) issues.push(`document is wider than the page (${docW}px > ${pxW}px)`);
    return { issues: issues.concat(imgs), used: [...used], loaded: [...new Set(loaded)] };
  }, [pxW, pxH]);
  await p.pdf({ path: out + '.pdf', width: W + 'mm', height: H + 'mm', printBackground: true, pageRanges: '1' });
  await p.screenshot({ path: out + '-full.png', clip: { x: 0, y: 0, width: pxW, height: pxH } });
  await b.close();
  // half-size preview
  const b2 = await chromium.launch();
  const p2 = await (await b2.newContext({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 0.5 })).newPage();
  await p2.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(300);
  await p2.screenshot({ path: out + '.png', clip: { x: 0, y: 0, width: pxW, height: pxH } });
  await b2.close();
  console.log(`page ${W}x${H}mm = ${pxW}x${pxH} CSS px`);
  console.log('wrote', out + '.pdf', out + '.png', out + '-full.png');
  console.log('fonts used:', report.used.join(' | '));
  console.log('fonts loaded:', report.loaded.join(', ') || '(none)');
  if (msgs.length) console.log(msgs.join('\n'));
  console.log(report.issues.length ? 'LAYOUT ISSUES:\n- ' + [...new Set(report.issues)].slice(0, 60).join('\n- ') : 'layout check: no overflow/clipping detected');
})();
