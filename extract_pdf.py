# -*- coding: utf-8 -*-
"""提取简历 PDF 文本，了解结构与内容"""
from pypdf import PdfReader
import os

files = [
    r"C:\Users\86181\Desktop\实习\吴宇威-后端开发-27届应届生.pdf",
    r"C:\Users\86181\Desktop\实习\吴宇威-前端开发-27届应届生.pdf",
]

for fp in files:
    print("=" * 70)
    print("FILE:", os.path.basename(fp))
    print("=" * 70)
    reader = PdfReader(fp)
    print("页数:", len(reader.pages))
    print("-" * 70)
    for i, page in enumerate(reader.pages):
        print(f"\n===== 第 {i+1} 页 =====")
        text = page.extract_text()
        print(text)
    print("\n\n")
