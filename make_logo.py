from PIL import Image, ImageDraw
import math, os

OUT = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(OUT, exist_ok=True)

def make_icon(size):
    scale = size / 512.0
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Rounded square background, blue gradient simulated with two tones
    r = int(112 * scale)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=(37, 87, 167, 255))
    # Lighter top band for depth
    d.rounded_rectangle([0, 0, size - 1, int(size * 0.52)], radius=r, fill=(47, 110, 200, 255))
    d.rectangle([0, int(size * 0.30), size, int(size * 0.52)], fill=(47, 110, 200, 255))
    # Radius ring, white, dashed effect by drawing arcs
    cx, cy = size * 0.50, size * 0.46
    ring_r = size * 0.33
    w = max(2, int(size * 0.035))
    d.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r], outline=(255, 255, 255, 255), width=w)
    # Small dots on the ring, north east and south west
    for ang in (45, 225):
        a = math.radians(ang)
        x = cx + ring_r * math.cos(a)
        y = cy - ring_r * math.sin(a)
        dot = max(3, int(size * 0.035))
        d.ellipse([x - dot, y - dot, x + dot, y + dot], fill=(255, 196, 0, 255))
    # Map pin, white
    pin_w = size * 0.30
    pin_h = size * 0.34
    pin_top = cy - pin_h * 0.55
    pin_cx = cx
    # Pin circle
    d.ellipse([pin_cx - pin_w / 2, pin_top, pin_cx + pin_w / 2, pin_top + pin_w], fill=(255, 255, 255, 255))
    # Pin point
    d.polygon([(pin_cx - pin_w * 0.42, pin_top + pin_w * 0.55), (pin_cx + pin_w * 0.42, pin_top + pin_w * 0.55), (pin_cx, pin_top + pin_h)], fill=(255, 255, 255, 255))
    # Pin center, blue dot
    hole_r = size * 0.065
    hole_cy = pin_top + pin_w * 0.50
    d.ellipse([pin_cx - hole_r, hole_cy - hole_r, pin_cx + hole_r, hole_cy + hole_r], fill=(37, 87, 167, 255))
    # Small job briefcase hint at bottom, yellow bar
    bar_w = size * 0.42
    bar_h = max(4, int(size * 0.055))
    bar_y = size * 0.82
    d.rounded_rectangle([cx - bar_w / 2, bar_y, cx + bar_w / 2, bar_y + bar_h], radius=bar_h // 2, fill=(255, 196, 0, 255))
    return img

for s in (16, 32, 48, 128, 256, 512):
    im = make_icon(s)
    im.save(os.path.join(OUT, f"icon{s}.png"))
    print(f"icon{s}.png", im.size)
print("done")
