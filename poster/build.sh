#!/usr/bin/env bash
# Build all poster outputs from the HTML source (default final/otto-poster.html):
#   otto-poster-A1-print-3mm-bleed.pdf   600 x 847 mm, 3 mm vector bleed, TrimBox/BleedBox set  ← send to the printer
#   otto-poster-A1.pdf                   594 x 841 mm, cut from the bleed file's TrimBox (identical artwork)
#   otto-poster-preview.png              rendered from the A1 PDF, so it shows exactly what prints
# Intermediate files go to _build/ (never next to the deliverables).
set -euo pipefail
cd "$(dirname "$0")"   # run from the poster/ folder
SRC=${1:-otto-poster.html}; OUT=${2:-.}; TMP=_build
mkdir -p "$TMP"
BLEED_HTML="$(dirname "$SRC")/_bleed.html"   # must sit next to the source so relative asset paths resolve
sed -e 's/<html lang="en">/<html lang="en" class="bleed">/' \
    -e 's#</head>#<style>@page{ size:600mm 847mm; margin:0; }</style></head>#' "$SRC" > "$BLEED_HTML"
node tools/render.cjs "$BLEED_HTML" "$TMP/chromium-bleed" --w=600 --h=847 | grep -E "LAYOUT|layout check|^- |fonts used" || true
rm -f "$BLEED_HTML"
python3 tools/finalize_pdf.py bleed "$TMP/chromium-bleed.pdf" "$OUT/otto-poster-A1-print-3mm-bleed.pdf" 600 847 3 2>&1 | grep -v Warning || true
python3 tools/finalize_pdf.py trim  "$OUT/otto-poster-A1-print-3mm-bleed.pdf" "$OUT/otto-poster-A1.pdf" 2>&1 | grep -v Warning || true
python3 - "$OUT" "$TMP" <<'PY' 2>&1 | { grep -v Warning || true; }
import math, sys, pymupdf as f
out, tmp = sys.argv[1:3]
p = f.open(f'{out}/otto-poster-A1.pdf')[0]
for dpi, path in ((48, f'{out}/otto-poster-preview.png'), (96, f'{tmp}/check-96dpi.png')):
    z = dpi / 72; w, h = math.floor(p.rect.width * z), math.floor(p.rect.height * z)   # drop the partly-covered last row/col
    p.get_pixmap(matrix=f.Matrix(z, z), clip=f.Rect(0, 0, w / z, h / z), alpha=False).save(path)
PY
echo "built: $OUT/otto-poster-A1-print-3mm-bleed.pdf  $OUT/otto-poster-A1.pdf  $OUT/otto-poster-preview.png   (check image: $TMP/check-96dpi.png)"
