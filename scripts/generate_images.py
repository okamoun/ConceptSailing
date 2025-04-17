from PIL import Image, ImageDraw, ImageFont
import os
import math

def draw_star(draw, x, y, size, points=5):
    # Draw a star with given number of points
    outer_radius = size / 2
    inner_radius = outer_radius * 0.4
    center_x, center_y = x + size/2, y + size/2
    
    angles = []
    for i in range(points * 2):
        angle = i * math.pi / points - math.pi / 2
        radius = outer_radius if i % 2 == 0 else inner_radius
        angles.append((
            center_x + radius * math.cos(angle),
            center_y + radius * math.sin(angle)
        ))
    
    draw.polygon(angles, fill='white')

def draw_windsurfing_icon(draw, x, y, size):
    # Draw sail with curve
    sail_points = [(x, y+size), (x+size*0.4, y), (x+size*0.7, y+size*0.3), 
                  (x+size*0.6, y+size*0.6), (x+size*0.3, y+size*0.8), (x, y+size)]
    draw.polygon(sail_points, fill='white')
    # Draw board with fin
    draw.rectangle([x-size*0.1, y+size*0.8, x+size*0.8, y+size*0.9], fill='white')
    draw.polygon([(x+size*0.3, y+size*0.9), (x+size*0.4, y+size), (x+size*0.5, y+size*0.9)], fill='white')
    # Draw waves
    for i in range(3):
        draw.arc([x-size*0.2+i*size*0.3, y+size*0.95, x+size*0.1+i*size*0.3, y+size*1.1], 
                0, 180, fill='white', width=3)

def draw_yoga_icon(draw, x, y, size):
    # Draw person in tree pose
    # Head
    draw.ellipse([x+size*0.45, y, x+size*0.55, y+size*0.1], fill='white')
    # Body
    draw.line([x+size*0.5, y+size*0.1, x+size*0.5, y+size*0.4], fill='white', width=5)
    # Arms in namaste
    draw.line([x+size*0.5, y+size*0.2, x+size*0.3, y+size*0.3], fill='white', width=5)
    draw.line([x+size*0.5, y+size*0.2, x+size*0.7, y+size*0.3], fill='white', width=5)
    # Leg standing
    draw.line([x+size*0.5, y+size*0.4, x+size*0.5, y+size*0.8], fill='white', width=5)
    # Leg bent
    draw.arc([x+size*0.3, y+size*0.4, x+size*0.7, y+size*0.6], 0, 180, fill='white', width=5)
    # Mat
    draw.ellipse([x+size*0.2, y+size*0.8, x+size*0.8, y+size*0.9], fill='white')

def draw_boat_icon(draw, x, y, size):
    # Draw waves
    for i in range(3):
        draw.arc([x+i*size*0.3, y+size*0.8, x+size*0.4+i*size*0.3, y+size], 
                0, 180, fill='white', width=3)
    # Hull
    hull_points = [(x+size*0.2, y+size*0.7), (x+size*0.8, y+size*0.7), 
                   (x+size*0.9, y+size*0.9), (x+size*0.1, y+size*0.9)]
    draw.polygon(hull_points, fill='white')
    # Main sail
    sail_points = [(x+size*0.5, y+size*0.7), (x+size*0.5, y), 
                   (x+size*0.8, y+size*0.3), (x+size*0.5, y+size*0.7)]
    draw.polygon(sail_points, fill='white')
    # Front sail
    front_sail = [(x+size*0.5, y+size*0.7), (x+size*0.5, y+size*0.1), 
                  (x+size*0.65, y+size*0.3), (x+size*0.5, y+size*0.7)]
    draw.polygon(front_sail, fill='white')
    # Mast
    draw.line([x+size*0.5, y, x+size*0.5, y+size*0.7], fill='white', width=3)

def draw_cooking_icon(draw, x, y, size):
    # Draw chef's hat
    draw.ellipse([x+size*0.3, y, x+size*0.7, y+size*0.2], fill='white')
    draw.rectangle([x+size*0.35, y+size*0.1, x+size*0.65, y+size*0.3], fill='white')
    # Draw pot with steam
    draw.rectangle([x+size*0.2, y+size*0.5, x+size*0.8, y+size*0.8], fill='white')
    draw.ellipse([x+size*0.15, y+size*0.45, x+size*0.85, y+size*0.55], fill='white')
    # Handles
    draw.ellipse([x+size*0.1, y+size*0.6, x+size*0.2, y+size*0.7], fill='white')
    draw.ellipse([x+size*0.8, y+size*0.6, x+size*0.9, y+size*0.7], fill='white')
    # Steam
    for i in range(3):
        start_x = x + size*0.3 + i*size*0.2
        draw.arc([start_x, y+size*0.2, start_x+size*0.1, y+size*0.4], 
                0, 180, fill='white', width=3)

def draw_party_icon(draw, x, y, size):
    # Draw multiple music notes
    note_positions = [(0.2, 0.3), (0.5, 0.2), (0.7, 0.4)]
    for px, py in note_positions:
        note_x, note_y = x + size*px, y + size*py
        # Note head
        draw.ellipse([note_x, note_y, note_x+size*0.15, note_y+size*0.1], fill='white')
        # Note stem
        draw.line([note_x+size*0.15, note_y+size*0.05, note_x+size*0.15, note_y+size*0.3], 
                  fill='white', width=3)
        # Note flag
        draw.arc([note_x+size*0.15, note_y+size*0.15, note_x+size*0.25, note_y+size*0.25], 
                 0, 180, fill='white', width=3)
    
    # Draw stars
    star_positions = [(0.15, 0.6), (0.45, 0.5), (0.75, 0.7), (0.6, 0.3)]
    for px, py in star_positions:
        draw_star(draw, x + size*px, y + size*py, size*0.15)

def draw_history_icon(draw, x, y, size):
    # Draw ancient column
    # Capital
    draw.rectangle([x+size*0.35, y, x+size*0.65, y+size*0.1], fill='white')
    draw.arc([x+size*0.3, y+size*0.1, x+size*0.7, y+size*0.2], 0, 180, fill='white')
    # Column shaft with fluting
    draw.rectangle([x+size*0.4, y+size*0.2, x+size*0.6, y+size*0.8], fill='white')
    for i in range(3):
        line_x = x + size*(0.45 + i*0.075)
        draw.line([line_x, y+size*0.2, line_x, y+size*0.8], fill='#3B82F6', width=2)
    # Base
    draw.rectangle([x+size*0.3, y+size*0.8, x+size*0.7, y+size*0.9], fill='white')
    draw.rectangle([x+size*0.2, y+size*0.9, x+size*0.8, y+size], fill='white')

def create_placeholder(name, text, width=800, height=600):
    # Create new image with blue background
    image = Image.new('RGB', (width, height), '#3B82F6')
    draw = ImageDraw.Draw(image)
    
    # Add icon based on image type
    icon_size = 200
    icon_x = (width - icon_size) // 2
    icon_y = height // 4

    if 'windsurfing' in name or 'wind' in name:
        draw_windsurfing_icon(draw, icon_x, icon_y, icon_size)
    elif 'yoga' in name or 'wellness' in name:
        draw_yoga_icon(draw, icon_x, icon_y, icon_size)
    elif 'sailing' in name or 'hero' in name or 'family-adventure' in name:
        draw_boat_icon(draw, icon_x, icon_y, icon_size)
    elif 'cooking' in name or 'gastronomy' in name:
        draw_cooking_icon(draw, icon_x, icon_y, icon_size)
    elif 'night' in name or 'party' in name:
        draw_party_icon(draw, icon_x, icon_y, icon_size)
    elif 'history' in name:
        draw_history_icon(draw, icon_x, icon_y, icon_size)
    
    # Add text
    try:
        font = ImageFont.truetype('Arial.ttf', 48)
    except:
        font = ImageFont.load_default()
    
    # Get text size
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    # Draw text below icon
    text_x = (width - text_width) // 2
    text_y = height * 2 // 3
    draw.text((text_x, text_y), text, font=font, fill='white')
    
    # Save image
    os.makedirs('../public/images', exist_ok=True)
    image.save(f'../public/images/{name}.jpg', 'JPEG', quality=95)

# Create all placeholder images
images = [
    ('hero', 'Sailing Adventures'),
    ('windsurfing', 'Windsurfing'),
    ('family-sailing', 'Family Sailing'),
    ('yoga', 'Yoga & Wellness'),
    ('wellness', 'Wellness Retreat'),
    ('greek-history', 'Greek History'),
    ('greek-cooking', 'Greek Cooking'),
    ('family-adventure', 'Family Adventure'),
    ('island-nights', 'Island Nights'),
    ('gastronomy', 'Gastronomy'),
    ('cooking-class', 'Cooking Class')
]

for name, text in images:
    create_placeholder(name, text)
