# -*- coding: utf-8 -*-
"""深度 OCR：多种预处理 + 参数组合，攻克所有图片"""
import os
import numpy as np
import cv2
from PIL import Image, ImageEnhance, ImageOps
import easyocr

img_dir = r"d:\xm\wz\grbk\resume_images"
print("初始化 OCR...")
reader = easyocr.Reader(['ch_sim', 'en'], gpu=False, verbose=False)
print("OCR 就绪\n")

def ocr_variants(img_pil):
    """对一张图应用多种预处理，返回所有识别文本"""
    results = []
    arr = np.array(img_pil.convert('RGB'))
    variants = []

    # 原图放大2倍
    h, w = arr.shape[:2]
    big = cv2.resize(arr, (w*2, h*2), interpolation=cv2.INTER_CUBIC)
    variants.append(("big2x", big))

    # 灰度+Otsu二值化
    gray = cv2.cvtColor(big, cv2.COLOR_RGB2GRAY)
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    variants.append(("otsu", otsu))

    # 自适应阈值
    adap = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 10)
    variants.append(("adaptive", adap))

    # 反色（处理浅色文字）
    inv = cv2.bitwise_not(gray)
    _, otsu_inv = cv2.threshold(inv, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    variants.append(("invert_otsu", otsu_inv))

    # 增强对比度
    pil_big = Image.fromarray(big)
    pil_big = ImageOps.grayscale(pil_big)
    pil_big = ImageEnhance.Contrast(pil_big).enhance(3.0)
    variants.append(("contrast3", np.array(pil_big)))

    seen = set()
    for name, im in variants:
        for params in [
            dict(text_threshold=0.5, low_text=0.3, link_threshold=0.3, canvas_size=2560, mag_ratio=2.0),
            dict(text_threshold=0.7, low_text=0.4, link_threshold=0.4, canvas_size=2560, mag_ratio=1.5),
            dict(text_threshold=0.4, low_text=0.2, link_threshold=0.2, canvas_size=2560, mag_ratio=3.0),
        ]:
            try:
                res = reader.readtext(im, detail=1, paragraph=False, **params)
                for box, text, conf in res:
                    t = text.strip()
                    if t and t not in seen and conf > 0.3:
                        seen.add(t)
                        results.append((name, conf, t))
            except Exception as e:
                pass
    return results

for tag in ["backend", "frontend"]:
    print("=" * 70)
    print(tag.upper())
    print("=" * 70)
    # 只处理可能含文字的图：Image6, Image7，以及窄长条 Image1-5
    for fn in sorted(os.listdir(img_dir)):
        if not fn.startswith(f"{tag}_") or fn.endswith("_enh.png"):
            continue
        fpath = os.path.join(img_dir, fn)
        im = Image.open(fpath)
        # 跳过小图标
        if im.width < 100 or im.height < 30:
            continue
        print(f"\n--- {fn} ({im.size}) ---")
        res = ocr_variants(im)
        if res:
            # 去重，按置信度排序
            best = {}
            for name, conf, t in res:
                if t not in best or conf > best[t][0]:
                    best[t] = (conf, name)
            for t, (conf, name) in sorted(best.items(), key=lambda x: -x[1][0]):
                print(f"  [{conf:.2f}|{name}] {t}")
        else:
            print("  (无识别)")
    print()
