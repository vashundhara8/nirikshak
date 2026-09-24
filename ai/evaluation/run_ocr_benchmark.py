import os
import json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from document_intelligence.pipeline import DocumentPipeline
from evaluation.metrics import MetricsCalculator

def generate_image_pdf(text_lines, filepath, condition):
    # Create a white image
    img = Image.new('RGB', (800, 1000), color='white')
    d = ImageDraw.Draw(img)
    
    # Try to load a font, otherwise use default
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
        
    y_text = 50
    for line in text_lines:
        d.text((50, y_text), line, font=font, fill=(0, 0, 0))
        y_text += 40
        
    # Apply conditions
    if condition == "ROTATED":
        img = img.rotate(15, fillcolor='white')
    elif condition == "FAINT":
        # Make the image brighter/faint
        img = img.point(lambda p: p + 100)
    elif condition == "NOISY":
        # Add random noise
        pixels = img.load()
        for i in range(img.size[0]):
            for j in range(img.size[1]):
                if random.random() < 0.1:
                    pixels[i, j] = (200, 200, 200)
                    
    # Save as PDF
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, "PDF", resolution=100.0)

def main():
    print("Generating OCR test corpus...")
    test_dir = "dataset/ocr_benchmark"
    os.makedirs(test_dir, exist_ok=True)
    
    conditions = ["CLEAN", "ROTATED", "FAINT", "NOISY"]
    
    gt_data = []
    
    # Generate one synthetic document per condition
    for cond in conditions:
        doc_id = f"synthetic_income_{cond.lower()}"
        app_id = "test_app_ocr"
        
        text_lines = [
            "GOVERNMENT OF INDIA",
            "INCOME CERTIFICATE",
            "",
            "This is to certify that John Doe",
            "Date of Birth: 01/01/2000",
            "Category: SC",
            "Annual Income: Rs. 45000",
            "Valid for Academic Year: 2023-2024"
        ]
        
        filepath = os.path.join(test_dir, app_id, f"{doc_id}.pdf")
        generate_image_pdf(text_lines, filepath, cond)
        
        gt = {
            "document_id": doc_id,
            "application_id": app_id,
            "document_type": "INCOME_CERTIFICATE",
            "expected_quality": cond,
            "expected_field_values": [
                {"field_name": "name", "normalized_expected_value": "JOHN DOE"},
                {"field_name": "dob", "normalized_expected_value": "2000-01-01"},
                {"field_name": "income", "normalized_expected_value": "45000"}
            ]
        }
        gt_data.append(gt)
        
    # Run pipeline
    pipeline = DocumentPipeline()
    metrics = MetricsCalculator()
    
    results = {"tp": 0, "fp": 0, "fn": 0}
    
    for gt in gt_data:
        print(f"Evaluating condition: {gt['expected_quality']}...")
        filepath = os.path.join(test_dir, gt["application_id"], f"{gt['document_id']}.pdf")
        result = pipeline.process_document(filepath, gt["document_id"], gt["application_id"])
        
        print(f"Extraction method used: {result.extraction_method}")
        
        for field_gt in gt["expected_field_values"]:
            fname = field_gt["field_name"]
            expected = field_gt["normalized_expected_value"]
            
            if fname in result.fields:
                pred = result.fields[fname].normalized_value
                if metrics.exact_match(pred, expected):
                    results["tp"] += 1
                else:
                    results["fp"] += 1
                    print(f"Mismatch {fname}: expected {expected}, got {pred}")
            else:
                results["fn"] += 1
                print(f"Missing {fname}")
                
    p, r, f1 = metrics.precision_recall_f1(**results)
    print("\nOCR Extraction Metrics:")
    print(f"Precision: {p:.2f}, Recall: {r:.2f}, F1: {f1:.2f}")
    
    print("\nOCR PHASE B COMPLETE.")

if __name__ == "__main__":
    main()
