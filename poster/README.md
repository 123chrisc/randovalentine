# otto — conference walk-in poster (A1)

| File | Use |
|---|---|
| `otto-poster-A1-print-3mm-bleed.pdf` | **Send this to the printer.** 600 × 847 mm = A1 trim (594 × 841 mm) + 3 mm bleed. TrimBox/BleedBox set, no crop marks. The green footer runs into the bleed as vector colour. |
| `otto-poster-A1.pdf` | Exact A1, cut from the bleed file's TrimBox (identical artwork). For printers that add their own bleed, or for sharing. |
| `otto-poster-preview.png` | Preview rendered from the A1 PDF. |
| `otto-poster.html` | Source. Edit here, then run `./build.sh`. |

The PDF is vector (except the logos/photos listed below) and scales cleanly to A0/A2.
The QR code links to **https://ottosr.com** (checked by decoding the rendered PDF).

## Notes for the printer
- RGB file, sRGB source. Convert to your press/media profile (relative colorimetric + black-point compensation).
- Brand green **#004416** = sRGB 0/68/22 ≈ Lab 24 / −29 / 22 — please hard-proof the footer and the case-study panel.
- Fonts: Figtree Regular/Medium/SemiBold, embedded. No overprint intended.

## Assets and where they came from
| Asset | Source | Type |
|---|---|---|
| otto wordmark | rebuilt from the brochure PDF (Brother 1816 glyph outlines + frame) | vector |
| Government of Canada | official FIP signature (Wikimedia Commons), FIP red #EB2D37 | vector |
| cessatech | official logo from cessatech.com | vector |
| nature | official logo SVG (Wikipedia) | vector |
| PharmaEssentia | official logo PNG from pharmaessentia.com (2007 px, ~440 ppi at size) | raster |
| Hypertension Canada | hypertension.ca (~250 ppi at size) | raster |
| Women's College Hospital | womenscollegehospital.ca, wordmark only (~234 ppi) | raster |
| Blood Advances | supplied image, cleaned (flat brand colours, no JPEG halo) | raster |
| European Urology | supplied image, traced | vector (traced) |
| the bmj, Annals of Internal Medicine | traced from the original draft poster | vector (traced) |
| Headshots | brochure (Ioannidis, Moher, Church) | raster, ~260–320 ppi |

If you can get official vector files for **the bmj, Annals, Blood Advances and European Urology**, drop them into
`assets/logos/` with the same file names (or update the `src` in `otto-poster.html`) and rebuild.

## Rebuild
```bash
cd poster
./build.sh        # → both PDFs + preview; intermediates go to _build/ (git-ignored)
```
Needs Node + Playwright (Chromium) and Python with PyMuPDF.
