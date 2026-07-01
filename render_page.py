# -*- coding: utf-8 -*-
"""按 PDF 内容流的位置矩阵拼接整页图片，再 OCR"""
from pypdf import PdfReader
from pypdf.generic import IndirectObject
from PIL import Image
import io
import os
import re
import easyocr

files = {
    "backend": r"C:\Users\86181\Desktop\实习\吴宇威-后端开发-27届应届生.pdf",
    "frontend": r"C:\Users\86181\Desktop\实习\吴宇威-前端开发-27届应届生.pdf",
}
out_dir = r"d:\xm\wz\grbk\resume_pages"
os.makedirs(out_dir, exist_ok=True)

def parse_content(content_bytes):
    """解析内容流，返回 [(img_name, a,b,c,d,e,f)] 列表"""
    text = content_bytes.decode('latin-1', errors='replace')
    # token 化
    tokens = re.findall(r'[^\s]+', text)
    results = []
    stack = []
    i = 0
    while i < len(tokens):
        if tokens[i] == 'cm':
            # 前 6 个是矩阵参数
            params = stack[-6:]
            results.append(('cm', [float(p) for p in params]))
            stack = stack[:-6]
        elif tokens[i] == 'Do':
            # 前一个是图片名
            name = stack[-1]
            results.append(('Do', name))
            stack = stack[:-1]
        else:
            stack.append(tokens[i])
        i += 1
    return results

def render_page(page, out_path):
    media = page.mediabox
    W = float(media.width)
    H = float(media.height)
    canvas = Image.new('RGB', (int(W), int(H)), (255, 255, 255))
    res = page.get('/Resources')
    xobj = res.get('/XObject')
    if isinstance(xobj, IndirectObject):
        xobj = xobj.get_object()
    # 读取图片对象
    imgs = {}
    for name, obj in xobj.items():
        o = obj.get_object() if isinstance(obj, IndirectObject) else obj
        if o.get('/Subtype') == '/Image':
            data = o.get_data()
            w = int(o.get('/Width'))
            h = int(o.get('/Height'))
            filt = str(o.get('/Filter', ''))
            try:
                if 'DCT' in filt:
                    im = Image.open(io.BytesIO(data)).convert('RGB')
                elif 'Flate' in filt or 'Fl' in filt:
                    cs = str(o.get('/ColorSpace', ''))
                    bpc = int(o.get('/BitsPerComponent', 8))
                    if 'Gray' in cs or bpc == 1:
                        im = Image.frombytes('L', (w, h), data)
                    else:
                        im = Image.frombytes('RGB', (w, h), data)
                else:
                    im = Image.frombytes('RGB', (w, h), data)
            except Exception as e:
                print(f"  图片 {name} 打开失败: {e}")
                continue
            imgs[name] = im
    # 解析内容流（Contents 可能是单个流或数组）
    contents = page.get('/Contents')
    if isinstance(contents, IndirectObject):
        contents = contents.get_object()
    raw = b''
    if isinstance(contents, list) or hasattr(contents, '__iter__') and not isinstance(contents, (bytes, str)):
        for c in contents:
            co = c.get_object() if isinstance(c, IndirectObject) else c
            raw += co.get_data()
    else:
        raw = contents.get_data()
    ops = parse_content(raw)
    cur_matrix = [1,0,0,1,0,0]
    for op, val in ops:
        if op == 'cm':
            cur_matrix = val
        elif op == 'Do' and val in imgs:
            a,b,c,d,e,f = cur_matrix
            im = imgs[val]
            # 放置尺寸
            pw = abs(a)
            ph = abs(d)
            px = e
            py = f
            # PDF y 是左下原点，转 PIL 左上原点
            pil_x = int(px)
            pil_y = int(H - py - ph)
            if pw > 0 and ph > 0:
                resized = im.resize((int(pw), int(ph)))
                canvas.paste(resized, (pil_x, pil_y))
    canvas.save(out_path)
    return canvas

print("初始化 OCR...")
reader = easyocr.Reader(['ch_sim', 'en'], gpu=False, verbose=False)
print("OCR 就绪\n")

for tag, fp in files.items():
    reader_pdf = PdfReader(fp)
    for pidx, page in enumerate(reader_pdf.pages):
        out_path = os.path.join(out_dir, f"{tag}_page{pidx+1}.png")
        print(f"渲染 {tag} 第{pidx+1}页...")
        canvas = render_page(page, out_path)
        print(f"  尺寸: {canvas.size}, OCR 中...")
        result = reader.readtext(out_path, detail=0, paragraph=True)
        print(f"  ===== {tag} 第{pidx+1}页 OCR 结果 =====")
        for line in result:
            print(f"  {line}")
        print()
