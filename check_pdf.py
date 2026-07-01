# -*- coding: utf-8 -*-
"""深入检查 PDF 结构：文字、图片、字体"""
from pypdf import PdfReader
from pypdf.generic import IndirectObject
import os

fp = r"C:\Users\86181\Desktop\实习\吴宇威-后端开发-27届应届生.pdf"
reader = PdfReader(fp)
print("页数:", len(reader.pages))
print("加密:", reader.is_encrypted)
print("元数据:", reader.metadata)
print()

for i, page in enumerate(reader.pages):
    print(f"===== 第 {i+1} 页 =====")
    print("MediaBox:", page.mediabox)
    print("Resources keys:", list(page.get('/Resources', {}).keys()) if '/Resources' in page else "无")
    res = page.get('/Resources')
    if res:
        # 字体
        fonts = res.get('/Font') if '/Font' in res else None
        if fonts:
            print("字体:", fonts)
        # 图片
        xobj = res.get('/XObject') if '/XObject' in res else None
        if xobj:
            print("XObject:", xobj)
            if isinstance(xobj, IndirectObject):
                xobj = xobj.get_object()
            for name, obj in xobj.items():
                o = obj
                if isinstance(o, IndirectObject):
                    o = o.get_object()
                print(f"  {name}: Subtype={o.get('/Subtype')}, Width={o.get('/Width')}, Height={o.get('/Height')}")
    # 内容流
    contents = page.get('/Contents')
    print("Contents type:", type(contents))
    if contents:
        try:
            data = page.get_contents()
            for c in data:
                raw = c.get_data().decode('latin-1', errors='replace')
                print("内容流前 500 字符:")
                print(raw[:500])
        except Exception as e:
            print("读内容流出错:", e)
    print()
