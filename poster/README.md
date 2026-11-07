# otto — conference walk-in poster (A1)

| File | Use |
|---|---|
| `otto-poster-A1-print-3mm-bleed.pdf` | **Send this to the printer.** 600 × 847 mm = A1 trim + 3 mm bleed (TrimBox set, no crop marks). |
| `otto-poster-A1.pdf` | Exact A1 (594 × 841 mm) vector PDF, for printers that add their own bleed, or for sharing. |
| `otto-poster-preview.png` | Low-res preview. |
| `otto-poster.html` | Source. Edit text/layout here and re-export. |

The PDF is vector and scales cleanly to A0/A2. The QR code links to **https://ottosr.com**; it was checked by decoding the rendered poster.

## Assets
- `assets/otto-logo-*.svg` — the real otto wordmark, rebuilt as vectors from the brochure (Brother 1816 glyph outlines + frame).
- `assets/fonts/` — Figtree (SIL OFL), the closest free match to the brochure's Brother 1816.
- `assets/logos/` — partner and journal logos, **traced from the draft poster image**. Swap in the official vector files before
  printing if you have them (same file names; colour = `name.svg`).
- `assets/people/` — headshots from the brochure (low resolution: fine at viewing distance, soft up close).

## Re-export after edits
```bash
cd poster
node tools/render.cjs otto-poster.html                                  # → otto-poster.pdf/.png, reports layout problems
python3 tools/finalize_pdf.py otto-poster.pdf otto-poster-A1.pdf        # crop to exact A1
python3 tools/add_bleed.py otto-poster-A1.pdf otto-poster-A1-print-3mm-bleed.pdf
```
Needs Node + Playwright (Chromium) and Python with PyMuPDF.
