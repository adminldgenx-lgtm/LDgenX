#!/usr/bin/env python3
"""Download only content assets explicitly published by the collected site."""
import concurrent.futures as cf
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from PIL import Image
from collect_site import ROOT, HOSTS, fetch, dump, parse_page

def main():
    bundle = json.loads((ROOT / "data/pages.json").read_text())
    pages = bundle["pages"]
    # Rebuild Markdown locally from the preserved bytes; do not refetch pages.
    for i,p in enumerate(pages):
        if p.get("status") == 200 and p.get("raw_html_path"):
            p["body"] = (ROOT / p["raw_html_path"]).read_bytes()
            pages[i] = parse_page(p)
    dump(ROOT / "data/pages.json", bundle)
    assets = {}
    for page in pages:
        if page.get("status") != 200:
            continue
        candidates = []
        for image in page.get("images", []):
            for s in image["sources"]:
                candidates.append((s["url"], "image", image.get("alt", ""), s["attribute"]))
        for link in page.get("links", []):
            if re.search(r"\.(?:png|jpe?g|webp|gif|svg|pdf|docx?|xlsx?|csv)(?:\?|$)", link["url"], re.I):
                kind = "image" if re.search(r"\.(png|jpe?g|webp|gif|svg)(?:\?|$)", link["url"],re.I) else "document"
                candidates.append((link["url"],kind,link["text"],"link"))
        for url,kind,alt,attr in candidates:
            p=urlsplit(url)
            if p.hostname not in HOSTS or not p.path.startswith("/uploads/"):
                continue
            a=assets.setdefault(url,{"url":url,"kind":kind,"used_on":[],"alt_texts":[],"attributes":[]})
            for key,value in [("used_on",page["requested_url"]),("alt_texts",alt),("attributes",attr)]:
                if value and value not in a[key]: a[key].append(value)
    print("Published asset URLs:",len(assets),flush=True)
    content_files = {}
    records=[]
    with cf.ThreadPoolExecutor(max_workers=4) as pool:
        futures={pool.submit(fetch,url,True):a for url,a in assets.items()}
        for future in cf.as_completed(futures):
            a=futures[future]
            r=future.result()
            a.update({k:v for k,v in r.items() if k!='body'})
            data=r.get('body')
            if data is not None:
                if "text/html" in r.get("content_type",""):
                    a["error"]="HTML response instead of the published asset"
                else:
                    sha=hashlib.sha256(data).hexdigest()
                    filename=re.sub(r'[^A-Za-z0-9._-]','-',Path(urlsplit(a['url']).path).name)
                    folder='assets/images' if a['kind']=='image' else 'assets/documents'
                    local=content_files.get(sha)
                    if local is None:
                        local=folder+'/'+sha[:12]+'__'+filename
                        p=ROOT/local; p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(data)
                        content_files[sha]=local
                    a.update({"local_path":local,"bytes":len(data),"sha256":sha})
                    if a['kind']=='image' and not filename.lower().endswith('.svg'):
                        try:
                            with Image.open(ROOT/local) as im:
                                a.update({"width":im.width,"height":im.height,"mode":im.mode,"format":im.format})
                                im.verify()
                        except Exception as e:
                            a['validation_error']=str(e)
            records.append(a)
            dump(ROOT/'data/assets.json',{"assets":sorted(records,key=lambda a:a['url']),"requested_count":len(assets)})
            if len(records)%20==0 or len(records)==len(assets):
                print("Assets processed:",len(records),"unique files:",len(content_files),"errors:",sum('error' in a or a.get('status')!=200 for a in records),flush=True)
    print('ASSETS COMPLETE',len(records),'URLs;',len(content_files),'unique files',flush=True)

if __name__=='__main__':
    main()
