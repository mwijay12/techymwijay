import os
from PIL import Image, ImageDraw

def create_icon(size):
    # Render at 4x scale for super anti-aliasing
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Corner radius
    radius = int(canvas_size * 0.2)
    
    # Draw rounded background rectangle with gradient (blue to purple)
    bg = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    bg_draw.rounded_rectangle([0, 0, canvas_size - 1, canvas_size - 1], radius=radius, fill=(255, 255, 255, 255))
    
    # Create gradient fill
    gradient = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    for y in range(canvas_size):
        t = y / max(1, canvas_size - 1)
        # Interpolate between #3b82f6 (59, 130, 246) and #8b5cf6 (139, 92, 246)
        r = int(59 * (1 - t) + 139 * t)
        g = int(130 * (1 - t) + 92 * t)
        b = int(246 * (1 - t) + 246 * t)
        for x in range(canvas_size):
            gradient.putpixel((x, y), (r, g, b, 255))
            
    # Mask gradient with rounded rect
    img.paste(gradient, (0, 0), bg.split()[3])
    draw = ImageDraw.Draw(img)
    
    # Draw code brackets & slash < / > or mic icon
    stroke_w = max(2, int(canvas_size * 0.05))
    color = (255, 255, 255, 255)
    
    cx = canvas_size / 2
    cy = canvas_size / 2
    
    # Left bracket '<'
    left_x1 = int(cx - canvas_size * 0.25)
    left_x2 = int(cx - canvas_size * 0.12)
    top_y = int(cy - canvas_size * 0.18)
    mid_y = int(cy)
    bot_y = int(cy + canvas_size * 0.18)
    
    draw.line([(left_x2, top_y), (left_x1, mid_y), (left_x2, bot_y)], fill=color, width=stroke_w)
    
    # Right bracket '>'
    right_x1 = int(cx + canvas_size * 0.12)
    right_x2 = int(cx + canvas_size * 0.25)
    
    draw.line([(right_x1, top_y), (right_x2, mid_y), (right_x1, bot_y)], fill=color, width=stroke_w)
    
    # Slash '/'
    slash_x1 = int(cx + canvas_size * 0.08)
    slash_x2 = int(cx - canvas_size * 0.08)
    slash_top = int(cy - canvas_size * 0.22)
    slash_bot = int(cy + canvas_size * 0.22)
    
    draw.line([(slash_x1, slash_top), (slash_x2, slash_bot)], fill=color, width=stroke_w)
    
    # Resize down to target size with high quality resampling
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

icons_dir = r"c:\Users\MWIJAY TECH\Desktop\PROJECTS\tech website\extension\icons"
os.makedirs(icons_dir, exist_ok=True)

sizes = [16, 32, 48, 128]
for s in sizes:
    icon_img = create_icon(s)
    icon_path = os.path.join(icons_dir, f"icon{s}.png")
    icon_img.save(icon_path, "PNG")
    print(f"Generated {icon_path} ({s}x{s})")
