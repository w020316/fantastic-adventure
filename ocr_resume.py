# -*- coding: utf-8 -*-
"""用 easyocr 识别简历图片文字"""
import os
import easyocr

img_dir = r"d:\xm\wz\grbk\resume_images"
print("初始化 OCR (首次会下载中文模型)...")
reader = easyocr.Reader(['ch_sim', 'en'], gpu=False, verbose=False)
print("OCR 就绪")
print()

for tag in ["backend", "frontend"]:
    print("=" * 60)
    print(tag.upper(), "简历")
    print("=" * 60)
    for pidx in [1, 2]:
        print(f"--- 第 {pidx} 页 ---")
        # 该页所有图片，按 Image 编号排序
        page_imgs = []
        for fn in os.listdir(img_dir):
            if fn.startswith(f"{tag}_p{pidx}_"):
                # 提取 Image 编号用于排序
                num = int(fn.split('_Image')[1].split('_')[0])
                page_imgs.append((num, fn))
        page_imgs.sort()
        for num, fn in page_imgs:
            fpath = os.path.join(img_dir, fn)
            try:
                result = reader.readtext(fpath, detail=0, paragraph=True)
                text = ' | '.join(result).strip()
            except Exception as e:
                text = f"[OCR错误: {e}]"
            if text:
                print(f"  [{num}] {text}")
        print()
