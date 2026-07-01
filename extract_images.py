# -*- coding: utf-8 -*-
"""提取 PDF 中的所有图片为 jpg/png"""
from pypdf import PdfReader
from pypdf.generic import IndirectObject
import os

out_dir = r"d:\xm\wz\grbk\resume_images"
os.makedirs(out_dir, exist_ok=True)

files = {
    "backend": r"C:\Users\86181\Desktop\实习\吴宇威-后端开发-27届应届生.pdf",
    "frontend": r"C:\Users\86181\Desktop\实习\吴宇威-前端开发-27届应届生.pdf",
}

for tag, fp in files.items():
    reader = PdfReader(fp)
    for pidx, page in enumerate(reader.pages):
        res = page.get('/Resources')
        if not res:
            continue
        xobj = res.get('/XObject')
        if not xobj:
            continue
        if isinstance(xobj, IndirectObject):
            xobj = xobj.get_object()
        for name, obj in xobj.items():
            o = obj.get_object() if isinstance(obj, IndirectObject) else obj
            if o.get('/Subtype') != '/Image':
                continue
            data = o.get_data()
            w = o.get('/Width')
            h = o.get('/Height')
            filt = str(o.get('/Filter', '')).replace('/', '')
            ext = 'jpg' if 'DCT' in filt else ('png' if 'Fl' in filt or 'Flate' in filt else 'bin')
            safe_name = name.replace('/', '')
            fname = f"{tag}_p{pidx+1}_{safe_name}_{w}x{h}.{ext}"
            fpath = os.path.join(out_dir, fname)
            with open(fpath, 'wb') as f:
                f.write(data)
            print(f"{fname}  {len(data)} bytes  filter={filt}")
print("done")
