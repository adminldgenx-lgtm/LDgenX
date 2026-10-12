from pathlib import Path
import base64,json

ROOT=Path(__file__).resolve().parents[1]
config=json.loads((ROOT/'data/sectors.json').read_text())
layers=json.loads((ROOT/'data/layers.json').read_text())
files={'landscape':'landscape-4000.webp','mask':'water-mask.png',
       'maskLuma':'water-mask-luma.png','tower':'turbine-tower.png',
       'rotor':'turbine-rotor.png'}
assets={k:'data:image/'+('webp' if v.endswith('.webp') else 'png')+';base64,'+
        base64.b64encode((ROOT/'assets'/v).read_bytes()).decode() for k,v in files.items()}
script=(ROOT/'source/preview-script.js').read_text()
for key,value in {'__CONFIG__':config,'__LAYERS__':layers,'__ASSETS__':assets}.items():
    script=script.replace(key,json.dumps(value,ensure_ascii=False))
html=(ROOT/'source/preview-template.html').read_text().replace('__SCRIPT__',script)
out=ROOT/'atlas-2d-preview.html'
out.write_text(html)
print(out,out.stat().st_size)
