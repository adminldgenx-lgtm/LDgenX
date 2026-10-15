#!/usr/bin/env python3
"""Draft OCR only. Scientific values must be checked against source files."""
import concurrent.futures as cf
import csv
import json
import os
import subprocess
from pathlib import Path
from collect_site import ROOT,dump

def extract(item):
    path,records=item
    output=ROOT/'source/image-text-drafts'/Path(path).stem
    output.parent.mkdir(parents=True,exist_ok=True)
    env=dict(os.environ,OMP_THREAD_LIMIT='1')
    run=subprocess.run(['tesseract',str(ROOT/path),str(output),'-l','eng','--psm','11','txt','tsv'],
                       capture_output=True,text=True,env=env,timeout=60)
    txt=output.with_suffix('.txt')
    tsv=output.with_suffix('.tsv')
    words=[]
    if tsv.exists():
        with tsv.open() as f:
            for r in csv.DictReader(f,delimiter='\t'):
                if r.get('text','').strip() and float(r.get('conf','-1'))>=0:
                    words.append(float(r['conf']))
        tsv.unlink()
    return {'asset_path':path,'source_urls':[r['url'] for r in records],
            'alt_texts':sorted(set(x for r in records for x in r.get('alt_texts',[]))),
            'text':txt.read_text().strip() if txt.exists() else '',
            'ocr_text_path':str(txt.relative_to(ROOT)) if txt.exists() else None,
            'mean_word_confidence':round(sum(words)/len(words),1) if words else None,
            'status':'automatic_draft_requires_review','ocr_language_model':'eng',
            'error':run.stderr[-300:] if run.returncode else None}

def main():
    d=json.loads((ROOT/'data/assets.json').read_text())
    by_path={}
    for r in d['assets']:
        if r.get('local_path') and r.get('kind')=='image' and not r['local_path'].endswith('.svg'):
            by_path.setdefault(r['local_path'],[]).append(r)
    rows=[]
    with cf.ThreadPoolExecutor(max_workers=4) as pool:
        futures=[pool.submit(extract,item) for item in by_path.items()]
        for f in cf.as_completed(futures):
            rows.append(f.result())
            if len(rows)%30==0:print('Draft image transcriptions:',len(rows),flush=True)
    dump(ROOT/'data/image-text-drafts.json',{'warning':'Automatic OCR, not validated scientific data. French text uses the installed English OCR model. Original assets are authoritative.','records':sorted(rows,key=lambda r:r['asset_path'])})
    print('OCR COMPLETE',len(rows),'assets;',sum(len(r['text'])>=8 for r in rows),'with detected text',flush=True)

if __name__=='__main__':main()
