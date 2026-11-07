"""Crop Chromium's PDF to the exact trim size and set document metadata.

Chromium rounds the page up slightly (A1 comes out ~594.1 x 841.4 mm), leaving a hairline of white
at the right and bottom edges. Content is laid out from the top-left, so we keep the top-left
594 x 841 mm and drop the sliver.

usage: python3 finalize_pdf.py in.pdf out.pdf [width_mm=594] [height_mm=841]
"""
import sys
import pymupdf as fitz

src, out = sys.argv[1], sys.argv[2]
wmm = float(sys.argv[3]) if len(sys.argv) > 3 else 594
hmm = float(sys.argv[4]) if len(sys.argv) > 4 else 841
W, H = wmm / 25.4 * 72, hmm / 25.4 * 72

doc = fitz.open(src)
page = doc[0]
mb = page.mediabox  # PDF coordinates, origin bottom-left
top = mb.y1
# keep [0 .. W] horizontally and the top H points vertically
page.set_mediabox(fitz.Rect(mb.x0, top - H, mb.x0 + W, top))
doc.set_metadata({"title": "otto — From PICO to dossier, in hours, not weeks.", "author": "otto (ottosr.com)",
                  "subject": "Conference poster, A1", "creator": "HTML/CSS → Chromium", "producer": "PyMuPDF"})
doc.save(out, garbage=3, deflate=True)
r = fitz.open(out)[0].rect
print(f"{out}: {r.width/72*25.4:.2f} x {r.height/72*25.4:.2f} mm")
