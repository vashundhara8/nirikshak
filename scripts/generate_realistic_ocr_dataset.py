import os
import json
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

def generate_document_image(doc_type, values, layout_style=1):
    img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    try:
        font_title = ImageFont.truetype("arial.ttf", 30)
        font_text = ImageFont.truetype("arial.ttf", 20)
    except:
        font_title = ImageFont.load_default()
        font_text = ImageFont.load_default()

    y = 50
    # Title
    title = f"GOVERNMENT DOCUMENT - {doc_type.replace('_', ' ')}"
    draw.text((50, y), title, font=font_title, fill=(0, 0, 0))
    y += 80

    for k, v in values.items():
        if layout_style == 1:
            line = f"{k}: {v}"
            draw.text((50, y), line, font=font_text, fill=(0, 0, 0))
            y += 40
        elif layout_style == 2:
            # Different layout: key on one line, value on next
            draw.text((50, y), f"{k}:", font=font_text, fill=(0, 0, 0))
            y += 25
            draw.text((100, y), str(v), font=font_text, fill=(0, 0, 0))
            y += 40

    return img

def apply_condition(img, condition):
    if condition == "clean":
        return img
    elif condition == "rotated_90":
        return img.rotate(90, expand=True, fillcolor="white")
    elif condition == "skewed":
        return img.rotate(random.uniform(-5, 5), expand=True, fillcolor="white")
    elif condition == "faint":
        return img.point(lambda p: min(255, p + 80))
    elif condition == "low_res":
        orig_size = img.size
        small = img.resize((img.width // 4, img.height // 4), Image.NEAREST)
        return small.resize(orig_size, Image.NEAREST)
    elif condition == "noisy":
        pixels = img.load()
        for i in range(img.width):
            for j in range(img.height):
                if random.random() < 0.05:
                    pixels[i, j] = (0, 0, 0)
        return img
    elif condition == "jpeg_compression":
        # Save and reload with low quality to simulate JPEG artifacts
        import io
        b = io.BytesIO()
        img.save(b, format="JPEG", quality=10)
        b.seek(0)
        return Image.open(b)
    elif condition == "stamp_interference":
        draw = ImageDraw.Draw(img)
        # Draw a big red circle to simulate a stamp over text
        draw.ellipse((300, 300, 500, 500), outline="red", width=5)
        return img
    elif condition == "shadows":
        # Create a gradient shadow effect
        shadow = Image.new('L', img.size, color=0)
        draw = ImageDraw.Draw(shadow)
        for i in range(img.height):
            draw.line((0, i, img.width, i), fill=int(255 * (i / img.height)))
        # blend
        img.putalpha(255)
        shadow_layer = Image.new('RGBA', img.size, color=(0, 0, 0, 0))
        shadow_layer.putalpha(shadow)
        img = Image.alpha_composite(img.convert('RGBA'), shadow_layer)
        return img.convert('RGB')
    
    return img

def main():
    out_dir = "dataset/ocr_realistic"
    docs_dir = os.path.join(out_dir, "documents")
    os.makedirs(docs_dir, exist_ok=True)
    
    conditions = [
        "clean", "rotated_90", "skewed", "faint", "low_res", 
        "noisy", "jpeg_compression", "stamp_interference", "shadows"
    ]
    
    templates = {
        "ST_CERTIFICATE": {
            "Applicant Name": "Synthetic User ST",
            "Date of Birth": "2000-01-01",
            "Category": "ST",
            "Domicile State": "Maharashtra",
            "Issuing Authority": "Tehsildar"
        },
        "INCOME_CERTIFICATE": {
            "Applicant Name": "Synthetic User Income",
            "Annual Family Income": "50000",
            "Income Source": "Agriculture",
            "Financial Year": "2023-2024"
        },
        "DOMICILE_CERTIFICATE": {
            "Applicant Name": "Synthetic User Domicile",
            "Resident State": "Karnataka",
            "Status": "Permanent"
        },
        "AADHAR": {
            "Name": "Synthetic Aadhaar User",
            "DOB": "1995-10-15",
            "Gender": "Male",
            "Aadhar Number": "0000 0000 0000"
        },
        "MARKSHEET": {
            "Student Name": "Synthetic Marksheet User",
            "Date of Birth": "2002-05-20",
            "Institution": "Synthetic College",
            "Course / Programme": "B.Sc",
            "Academic Year": "2022-2023",
            "Examination": "Final Year",
            "Percentage": "85.5",
            "Result": "PASS"
        }
    }
    
    ground_truth = []
    
    doc_counter = 1
    for doc_type, fields in templates.items():
        for condition in conditions:
            doc_id = f"OCR-TEST-{doc_counter:04d}"
            
            # Generate image
            img = generate_document_image(doc_type, fields, layout_style=random.choice([1, 2]))
            img = apply_condition(img, condition)
            
            # Save as PDF
            app_id = "OCR_TEST_APP"
            app_dir = os.path.join(docs_dir, app_id)
            os.makedirs(app_dir, exist_ok=True)
            file_path = os.path.join(app_dir, f"{doc_id}.pdf")
            img.save(file_path, "PDF", resolution=100.0)
            
            # Record ground truth
            gt_entry = {
                "document_id": doc_id,
                "application_id": app_id,
                "document_type": doc_type,
                "expected_quality": condition,
                "expected_fields": list(fields.keys()),
                "expected_field_values": []
            }
            
            for k, v in fields.items():
                gt_entry["expected_field_values"].append({
                    "field_name": k,
                    "raw_expected_value": v,
                    "normalized_expected_value": str(v).upper().strip(),
                    "source_of_truth": "synthetic_generator"
                })
                
            ground_truth.append(gt_entry)
            doc_counter += 1
            
    with open(os.path.join(out_dir, "ground_truth.json"), "w") as f:
        json.dump(ground_truth, f, indent=4)
        
    print(f"Generated {doc_counter - 1} synthetic realistic documents in {docs_dir}")

if __name__ == "__main__":
    main()
