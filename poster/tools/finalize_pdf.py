"""Turn Chromium's bleed render into the two print PDFs (same artwork in both).

  python3 finalize_pdf.py bleed  chromium.pdf  out-bleed.pdf   [W=600 H=847 bleed=3]  (mm)
      → exact 600 × 847 mm page (Chromium rounds the page up slightly), TrimBox inset 3 mm, BleedBox = page
  python3 finalize_pdf.py trim   out-bleed.pdf out-trim.pdf
      → exact 594 × 841 mm page cut from the bleed PDF's TrimBox, so the green footer runs past the trim edge
"""
import sys, datetime
import pymupdf as fitz

pt = lambda mm: mm / 25.4 * 72
mode, src_path, out_path = sys.argv[1:4]
now = datetime.datetime.now(datetime.timezone.utc).strftime("D:%Y%m%d%H%M%S+00'00'")
meta = {"title": "otto — From PICO to dossier, in hours, not weeks.", "author": "otto (ottosr.com)",
        "creator": "HTML/CSS → Chromium", "producer": "PyMuPDF", "creationDate": now, "modDate": now}

src = fitz.open(src_path)
out = fitz.open()
if mode == "bleed":
    W, H, B = (pt(float(v)) for v in (sys.argv[4:7] if len(sys.argv) > 6 else (600, 847, 3)))
    page = out.new_page(width=W, height=H)
    page.show_pdf_page(page.rect, src, 0, clip=fitz.Rect(0, 0, W, H))
    page.set_trimbox(fitz.Rect(B, B, W - B, H - B))
    page.set_bleedbox(page.rect)
    meta["subject"] = "Conference poster, A1 with 3 mm bleed — send this file to the printer"
else:
    sp = src[0]; t = sp.trimbox
    page = out.new_page(width=t.width, height=t.height)
    page.show_pdf_page(page.rect, src, 0, clip=t)
    page.set_trimbox(page.rect)
    meta["subject"] = "Conference poster, A1 trim size (no bleed)"
out.set_metadata(meta)
out.save(out_path, garbage=4, deflate=True)
r = fitz.open(out_path)[0]
print(f"{out_path}: {r.rect.width/72*25.4:.2f} x {r.rect.height/72*25.4:.2f} mm, trim {r.trimbox.width/72*25.4:.2f} x {r.trimbox.height/72*25.4:.2f} mm")
