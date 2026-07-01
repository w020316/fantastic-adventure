# -*- coding: utf-8 -*-
"""验证生成的 PDF：渲染整页 + OCR 检查关键内容。"""
import os
import pypdfium2 as pdfium
import easyocr
import sys

sys.stdout.reconfigure(encoding='utf-8')
OUT = r"d:\xm\wz\grbk\resume_verify"
os.makedirs(OUT, exist_ok=True)

PDFS = {
    "backend": r"d:\xm\wz\grbk\resume_output\吴宇威-后端开发-27届应届生.pdf",
    "frontend": r"d:\xm\wz\grbk\resume_output\吴宇威-前端开发-27届应届生.pdf",
}

print("渲染 PDF 为图片...", flush=True)
for tag, path in PDFS.items():
    pdf = pdfium.PdfDocument(path)
    print(f"{tag}: {len(pdf)} 页")
    for i in range(len(pdf)):
        bmp = pdf[i].render(scale=2.5)
        img = bmp.to_pil()
        out = os.path.join(OUT, f"{tag}_p{i+1}.png")
        img.save(out)
    pdf.close()
print("渲染完成，开始 OCR...", flush=True)

reader = easyocr.Reader(['ch_sim', 'en'], gpu=False, verbose=False, download_enabled=False)

KEYWORDS = ["个人博客", "fantastic-adventure", "Next.js", "Prisma", "Fly.io"]
for tag in PDFS:
    print(f"\n{'='*60}\n{tag}\n{'='*60}", flush=True)
    for fn in sorted(os.listdir(OUT)):
        if not fn.startswith(tag):
            continue
        fpath = os.path.join(OUT, fn)
        res = reader.readtext(fpath, detail=0, paragraph=True)
        text = " ".join(res)
        found = [kw for kw in KEYWORDS if kw in text]
        print(f"{fn}: 关键词命中 {found}")
        # 打印含"博客"或"fantastic"的段落
        for r in res:
            if "博客" in r or "fantastic" in r or "Personal" in r or "Blog" in r:
                print(f"  >> {r}")
print("\n验证完成")
