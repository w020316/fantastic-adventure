# -*- coding: utf-8 -*-
"""增强 OCR：放大 + 灰度 + 对比度，对每张图单独识别"""
import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import easyocr

img_dir = r"d:\xm\wz\grbk\resume_images"
print("初始化 OCR...")
reader = easyocr.Reader(['ch_sim', 'en'], gpu=False, verbose=False)
print("OCR 就绪\n")

for tag in ["backend", "frontend"]:
    print("=" * 70)
    print(tag.upper())
    print("=" * 70)
    for fn in sorted(os.listdir(img_dir)):
        if not fn.startswith(f"{tag}_"):
            continue
        fpath = os.path.join(img_dir, fn)
        im = Image.open(fpath).convert('RGB')
        # 放大 2 倍
        im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        # 灰度
        im = ImageOps.grayscale(im)
        # 提高对比度
        im = ImageEnhance.Contrast(im).enhance(2.0)
        # 锐化
        im = ImageEnhance.Sharpness(im).enhance(2.0)
        # 保存临时
        tmp = fpath + "_enh.png"
        im.save(tmp)
        try:
            result = reader.readtext(tmp, detail=1, paragraph=False)
            texts = [r[1] for r in result]
            joined = ' | '.join(texts).strip()
        except Exception as e:
            joined = f"[err {e}]"
        os.remove(tmp)
        print(f"{fn}:")
        if texts:
            for t in texts:
                print(f"    {t}")
        else:
            print("    (空)")
    print()
