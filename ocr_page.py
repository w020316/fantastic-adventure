# -*- coding: utf-8 -*-
"""对整页高分辨率 PNG 做整页 OCR（保留位置，按 y 坐标排序输出）。"""
import os
import sys
import easyocr

PAGES = [
    ("backend_p1", r"d:\xm\wz\grbk\resume_pages\backend_p1.png"),
    ("backend_p2", r"d:\xm\wz\grbk\resume_pages\backend_p2.png"),
    ("frontend_p1", r"d:\xm\wz\grbk\resume_pages\frontend_p1.png"),
    ("frontend_p2", r"d:\xm\wz\grbk\resume_pages\frontend_p2.png"),
]

sys.stdout.reconfigure(encoding='utf-8')
print("初始化 OCR（首次加载约 30-60 秒）...", flush=True)
reader = easyocr.Reader(['ch_sim', 'en'], gpu=False, verbose=False,
                        download_enabled=False)
print("OCR 就绪\n", flush=True)

for tag, path in PAGES:
    if not os.path.exists(path):
        print(f"[缺失] {path}")
        continue
    print("=" * 70)
    print(tag)
    print("=" * 70, flush=True)
    # 整页 OCR，detail=1 保留坐标，按文字密度调参
    res = reader.readtext(
        path,
        detail=1,
        paragraph=False,
        text_threshold=0.5,
        low_text=0.3,
        link_threshold=0.3,
        canvas_size=2560,
        mag_ratio=1.5,
    )
    if not res:
        print("  (无识别)")
        continue
    # 按 y 坐标（box 顶部）排序
    res_sorted = sorted(res, key=lambda r: r[0][0][1])
    for box, text, conf in res_sorted:
        t = text.strip()
        if t:
            y = int(box[0][1])
            print(f"  y={y:4d} [{conf:.2f}] {t}")
    print(flush=True)
print("完成")
