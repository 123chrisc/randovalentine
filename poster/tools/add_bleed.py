"""Add print bleed to a trim-size poster PDF.

The vector page is placed unchanged in the centre of a larger page; the bleed margin is filled by
stretching the outermost row/column of pixels of the page (the edge colours), which is exact for
flat-colour edges such as full-bleed bands. No crop marks are added (most poster printers ask for
bleed without marks).

usage: python3 add_bleed.py trim.pdf out.pdf [bleed_mm=3]
"""
import sys
import pymupdf as fitz

src_path, out_path = sys.argv[1], sys.argv[2]
bleed_mm = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
b = bleed_mm / 25.4 * 72

src = fitz.open(src_path)
sp = src[0]
W, H = sp.rect.width, sp.rect.height
pix = sp.get_pixmap(dpi=100, alpha=False)

def pix_clip(x0, y0, x1, y1):
    # copy a sub-rectangle of the rendered page into its own pixmap
    out = fitz.Pixmap(fitz.csRGB, fitz.IRect(x0, y0, x1, y1), False)
    out.copy(pix, fitz.IRect(x0, y0, x1, y1))
    out.set_origin(0, 0)
    return out

pw, ph = pix.width, pix.height
doc = fitz.open()
page = doc.new_page(width=W + 2 * b, height=H + 2 * b)
# edges: 1-px strips stretched across the bleed
page.insert_image(fitz.Rect(b, 0, b + W, b), pixmap=pix_clip(0, 2, pw, 3), keep_proportion=False)
page.insert_image(fitz.Rect(b, b + H, b + W, H + 2 * b), pixmap=pix_clip(0, ph - 3, pw, ph - 2), keep_proportion=False)
page.insert_image(fitz.Rect(0, b, b, b + H), pixmap=pix_clip(2, 0, 3, ph), keep_proportion=False)
page.insert_image(fitz.Rect(b + W, b, W + 2 * b, b + H), pixmap=pix_clip(pw - 3, 0, pw - 2, ph), keep_proportion=False)
# corners: single pixel colours
for (x, y), (px, py) in {(0, 0): (2, 2), (b + W, 0): (pw - 3, 2), (0, b + H): (2, ph - 3), (b + W, b + H): (pw - 3, ph - 3)}.items():
    c = [v / 255 for v in pix.pixel(px, py)[:3]]
    page.draw_rect(fitz.Rect(x, y, x + b, y + b), color=None, fill=c, width=0)
# the real vector page on top, at trim position
page.show_pdf_page(fitz.Rect(b, b, b + W, b + H), src, 0)
# TrimBox / BleedBox so print software knows where to cut
page.set_trimbox(fitz.Rect(b, b, b + W, b + H))
page.set_bleedbox(page.rect)
doc.save(out_path, garbage=3, deflate=True)
print(f"{out_path}: {(W + 2*b)/72*25.4:.1f} x {(H + 2*b)/72*25.4:.1f} mm (trim {W/72*25.4:.0f} x {H/72*25.4:.0f} mm + {bleed_mm} mm bleed)")
