# -*- coding: utf-8 -*-
"""用 pypdfium2 把 PDF 每页渲染成高分辨率 PNG，便于整页 OCR。"""
import os
import pypdfium2 as pdfium

PDFS = {
    "backend": r"C:\Users\86181\Desktop\实习\吴宇威-后端开发-27届应届生.pdf",
    "frontend": r"C:\Users\86181\Desktop\实习\吴宇威-前端开发-27届应届生.pdf",
}
OUT_DIR = r"d:\xm\wz\grbk\resume_pages"
os.makedirs(OUT_DIR, exist_ok=True)

for tag, path in PDFS.items():
    if not os.path.exists(path):
        print(f"[缺失] {path}")
        continue
    pdf = pdfium.PdfDocument(path)
    n = len(pdf)
    print(f"{tag}: {n} 页")
    for i in range(n):
        # scale=4 约等于 288 DPI（默认 72）
        bitmap = pdf[i].render(scale=4)
        pil = bitmap.to_pil()
        out = os.path.join(OUT_DIR, f"{tag}_p{i+1}.png")
        pil.save(out, "PNG")
        print(f"  -> {out}  {pil.size}")
    pdf.close()
print("完成")
