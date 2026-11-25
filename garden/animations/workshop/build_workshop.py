"""Generate native workshop layers. Optional source is the 1672x941 compass artwork."""
import argparse
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
COUNT = 80
SIZE = (640, 360)
TAU = math.tau
# All drawing coordinates below refer to the native 640x360 workshop.
REGIONS = {
    "petals": (451, 41, 177, 123),
    "waterfall": (593, 142, 37, 26),
    "pond": (497, 163, 143, 33),
    "lamp": (126, 158, 186, 126),
    "fire-and-ice": (216, 44, 70, 45),
    "sakura": (445, 34, 195, 129),
}


def envelope(t):
    return math.sin(math.pi * t) ** 2


def draw_effect(name, phase):
    image = Image.new("RGBA", SIZE)
    pen = ImageDraw.Draw(image)
    if name == "petals":
        for i, (x, y, length) in enumerate([(484, 85, 62), (532, 80, 73),
                                             (561, 82, 54), (589, 73, 68), (608, 65, 75)]):
            t = (phase + i * .217) % 1
            px = round(x + 7*t + 3*math.sin(TAU*t + i))
            py = round(y + length*t)
            a = round(222 * envelope(t)**.5)
            pen.point((px, py), fill=(251, 191, 202, a))
            if math.sin(2*TAU*t+i) > -.25:
                pen.point((px+1, py), fill=(211, 123, 160, a))
    elif name == "waterfall":
        for i, (x, y, length, drift) in enumerate([(609,148,12,-2),(612,148,12,-3),
                    (615,146,14,-3),(617,145,15,-3),(621,146,14,-3)]):
            for lag in (0, .5):
                t = (phase*8 + i*.173 + lag) % 1
                px, py = round(x+drift*t), round(y+length*t)
                pen.line((px, py, px, py+1), fill=(201, 218, 242, round(156*envelope(t))))
        for i in range(8):
            t = (4*phase + i*.37) % 1
            px = 607 + 2*i
            pen.line((px,163,px+1,163), fill=(199,214,237,round(132*envelope(t))))
    elif name == "pond":
        for i, (x,y,w) in enumerate([(520,170,4),(543,177,6),(559,172,5),
                                      (576,182,5),(596,176,5),(617,185,6),(632,174,4)]):
            t = (2*phase + i*.309) % 1
            px = x + round(3*math.sin(TAU*(t-.25)))
            half = round(w*envelope(t))
            color = (142,161,194,round(154*envelope(t)))
            pen.line((px-half,y,px,y),fill=color)
            if half>2:
                pen.line((px+2,y+1,px+half,y+1),fill=color)
    elif name == "lamp":
        yy,xx=np.mgrid[:360,:640]
        power=.50+.34*math.sin(TAU*phase)+.16*math.sin(2*TAU*phase+.3)
        # Warm spill on the wall below the lamp and a softer pool on the map.
        pool=np.exp(-((xx-196)/28)**2-((yy-199)/19)**2)*21
        pool+=np.exp(-((xx-234)/40)**2-((yy-252)/16)**2)*16
        lip=np.exp(-((xx-191)/8)**2-((yy-177)/1.9)**2)*78
        alpha=np.uint8(np.clip(np.rint((pool+lip)*power),0,255))
        image=Image.new("RGBA",SIZE,(255,209,126,0))
        image.putalpha(Image.fromarray(alpha))
    elif name == "fire-and-ice":
        for i,(x,y,h) in enumerate([(218,81,6),(224,76,9),(229,80,5),(235,78,7),(241,81,4)]):
            t=(phase*5+i*.23)%1
            tipx=x+round(math.sin(TAU*t+i))
            tipy=y-round(h*t)
            color=(255,176,79,round(200*envelope(t)))
            pen.line((tipx,tipy,tipx,tipy+1),fill=color)
        for i,(x,y) in enumerate([(251,74),(258,69),(265,67),(273,61),(278,72)]):
            t=(phase+i*.207)%1
            power=max(0,1-abs(t-.5)*10)**2
            pen.point((x,y),fill=(236,249,255,round(244*power)))
            if power>.45:
                pen.line((x-1,y,x+1,y),fill=(226,243,255,round(187*power)))
    return image


def canopy(scene, phase):
    x,y,w,h=REGIONS["sakura"]
    rest=np.asarray(scene.crop((x,y,x+w,y+h))).copy()
    r,g,b=rest.astype(int).transpose(2,0,1)
    pink=(r>95)&(r>g*1.2)&(b>g*1.02)
    yy,xx=np.mgrid[:h,:w]
    gx,gy=xx+x,yy+y
    # Limit changes to the open window, below the angled transom.
    pane=(gy>91-(gx-443)*.31)&(gy<159)
    pink &= pane
    animated=rest.copy()
    for cx,cy,rx,ry,delay in [(484,96,34,22,.02),(517,103,32,18,.12),
                               (556,87,35,21,.22),(589,70,23,15,.31),
                               (536,117,24,18,.18)]:
        dist=((gx-cx)/rx)**2+((gy-cy)/ry)**2
        bend=np.maximum(0,1-dist)*(.8*math.sin(TAU*phase-delay)+
                                     .35*math.sin(2*TAU*phase-delay))*1.65
        sx=np.clip(xx-np.rint(bend).astype(int),0,w-1)
        sy=np.clip(yy-np.rint(np.maximum(0,bend)*.5).astype(int),0,h-1)
        select=(dist<1)&pane&(pink|pink[sy,sx])
        animated[select]=rest[sy[select],sx[select]]
    tile=Image.fromarray(animated).convert("RGBA")
    tile.putalpha(Image.fromarray(np.any(animated!=rest,axis=2).astype('uint8')*255))
    return tile


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',nargs='?',type=Path)
    source=parser.parse_args().source
    scene=None
    if source:
        with Image.open(source) as art:
            if art.size not in [(1672,941), SIZE]:
                raise ValueError("Use the compass workshop artwork or its native 640x360 export.")
            scene=art.convert("RGB").resize(SIZE,Image.Resampling.BOX)
        scene.save(HERE/'workshop-640x360.png')
    layers={}
    layout={}
    for name,(x,y,w,h) in REGIONS.items():
        if name=='sakura' and scene is None:
            continue
        frames=[]
        sheet=Image.new('RGBA',(10*w,8*h))
        for i in range(COUNT):
            phase=i/COUNT
            tile=canopy(scene,phase) if name=='sakura' else draw_effect(name,phase).crop((x,y,x+w,y+h))
            sheet.paste(tile,(i%10*w,i//10*h))
            frames.append(tile)
        assert any(tile.getchannel('A').getbbox() for tile in frames)
        sheet.save(HERE/(name+'-sheet.png'),optimize=True)
        layers[name]=frames
        layout[name]=dict(x=x,y=y,width=w,height=h,sheet=name+'-sheet.png')
    order=[k for k in ('sakura','petals','waterfall','pond','lamp','fire-and-ice') if k in layers]
    (HERE/'layers.json').write_text(json.dumps(dict(canvas=SIZE,frames=COUNT,columns=10,
        rows=8,frameMs=100,drawOrder=order,layers=layout),indent=2)+'\n')
    if scene is not None:
        views=[]
        for i in range(COUNT):
            frame=scene.convert('RGBA')
            for name in order:
                frame.alpha_composite(layers[name][i],REGIONS[name][:2])
            views.append(frame.convert('RGB').resize((1280,720),Image.Resampling.NEAREST))
        views[0].save(HERE/'workshop-preview.apng',save_all=True,append_images=views[1:],
                      duration=100,loop=0)
        with Image.open(HERE/'workshop-preview.apng') as preview:
            assert preview.n_frames==COUNT
            for i,frame in enumerate(views):
                preview.seek(i)
                assert preview.convert('RGB').tobytes()==frame.tobytes()


if __name__=='__main__':
    main()
