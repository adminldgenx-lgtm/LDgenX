"""Create a registered technical water matte from image colour measurements.

This is an approximate segmentation mask, not a geographic classification.
Raster dimensions and pixel positions stay aligned with the source artwork.
"""
from pathlib import Path
from PIL import Image
from scipy import ndimage
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
rgb=np.asarray(Image.open(ROOT/'assets/landscape-native.png')).astype(float)
r,b=rgb[:,:,0],rgb[:,:,2]
dry=(r>b*.9)&(r>18)
dry=ndimage.binary_closing(dry,iterations=2)
labels,_=ndimage.label(dry)
sizes=np.bincount(labels.ravel())
dry=np.isin(labels,np.where(sizes>60)[0]);dry[labels==0]=False
# Fill small dark gaps in foliage, while leaving the larger lagoon regions open.
holes,count=ndimage.label(~dry)
sizes=np.bincount(holes.ravel())
border=np.unique(np.concatenate([holes[0],holes[-1],holes[:,0],holes[:,-1]]))
fill=[]
for label in range(1,count+1):
    if label in border:continue
    if sizes[label]>=400:
        y,x=ndimage.center_of_mass(np.ones_like(holes),holes,label)
        if .24<x/rgb.shape[1]<.64 and .44<y/rgb.shape[0]<.67:continue
    fill.append(label)
dry[np.isin(holes,fill)]=True
water=ndimage.gaussian_filter((~ndimage.binary_dilation(dry,iterations=1)).astype(float),.65)
water[dry]=0
Image.fromarray(np.uint8(np.clip(water*255,0,255))).save(ROOT/'assets/water-mask-luma-native.png')
print('Native water matte created')
