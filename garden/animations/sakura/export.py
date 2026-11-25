import numpy as np,json,os;from PIL import Image
F=np.load('frames.npy');src=np.array(Image.open('native.png').convert('RGB'))
RX0,RY0=262,0;h,w=F.shape[1:3];base=src[RY0:RY0+h,RX0:RX0+w]
cols=12;rows=(len(F)+cols-1)//cols
sheet=np.zeros((rows*h,cols*w,4),np.uint8)
os.makedirs('pv',exist_ok=True)
for i,f in enumerate(F):
    a=(np.abs(f.astype(int)-base.astype(int)).sum(2)>0)
    y,x=divmod(i,cols);sheet[y*h:(y+1)*h,x*w:(x+1)*w]=np.dstack([f,(a*255).astype(np.uint8)])
    o=src.copy();o[RY0:RY0+h,RX0:RX0+w]=f
    Image.fromarray(o).resize((1920,1080),Image.NEAREST).save(f'pv/{i:03d}.png')
    Image.fromarray(f).resize((w*3,h*3),Image.NEAREST).save(f'pv/c{i:03d}.png')
Image.fromarray(sheet).save('out/sakura-sway-sheet.png',optimize=True)
