import json
import os
import random
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import Color

random.seed(12345)

INPUT_JSON = "applications/post_matric/applications.json"
OUTPUT_DIR = "documents/post_matric"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

with open(INPUT_JSON, 'r') as f:
    apps = json.load(f)

manifest = []
doc_counter = 1

def create_synthetic_pdf(filepath, doc_id, app, doc_type, quality, defect_mods):
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    
    # OCR Challenge Simulations
    if quality == "ROTATED":
        c.translate(width/2, height/2)
        c.rotate(5)
        c.translate(-width/2, -height/2)
    elif quality == "FAINT":
        c.setFillColorRGB(0.7, 0.7, 0.7)
    else:
        c.setFillColorRGB(0, 0, 0)
    
    # Draw Watermark
    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(Color(1, 0, 0, alpha=0.15))
    c.saveState()
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, "SYNTHETIC / BENCHMARK / NOT VALID")
    c.restoreState()
    
    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, height - 1 * inch, f"SYNTHETIC DOCUMENT: {doc_type}")
    
    c.setFont("Helvetica", 10)
    c.drawString(1 * inch, height - 1.3 * inch, "THIS IS A TESTING DOCUMENT. NOT A REAL CERTIFICATE.")
    
    c.setFont("Helvetica-Bold", 12)
    y = height - 2 * inch
    c.drawString(1 * inch, y, f"Document ID: {doc_id}")
    y -= 0.3 * inch
    c.drawString(1 * inch, y, f"Application ID: {app['application_id']}")
    y -= 0.5 * inch
    
    c.setFont("Helvetica", 12)
    
    # Determine base values
    name = app['student']['name']
    dob = app['student']['dob']
    income = app['income']['family_income_annum']
    category = "ST"  # Base expected
    
    institution = app['institution']['institute_name']
    course = app['course']['course_name']
    academic_year = app.get('academic_year', "2026-2027")

    # Apply intentional defects from scenarios
    if 'NAME_MISMATCH' in defect_mods and doc_type == "MARKSHEET":
        name = name + " (Variant)"
    if 'DOB_MISMATCH' in defect_mods and doc_type == "ST_CERTIFICATE":
        parts = dob.split('-')
        dob = f"{int(parts[0])+1}-{parts[1]}-{parts[2]}" # change year
    if 'CATEGORY_ISSUE' in defect_mods and doc_type == "ST_CERTIFICATE":
        category = app['category']['claimed_category'] # Might be SC/OBC
    if 'INCOME_ISSUE' in defect_mods and doc_type == "INCOME_CERTIFICATE":
        # Keep the income from app which is already modified by scenario
        pass
    if 'INSTITUTION_COURSE_ISSUE' in defect_mods and doc_type == "MARKSHEET":
        institution = "XYZ University"
        course = "Bachelor of Commerce"
        
    # Draw fields based on document type
    fields = []
    if doc_type == "ST_CERTIFICATE":
        fields = [
            ("Applicant Name", name),
            ("Date of Birth", dob),
            ("Category", category),
            ("Domicile State", app['category']['domicile_state']),
            ("Issuing Authority", "Synthetic State Authority")
        ]
    elif doc_type == "INCOME_CERTIFICATE":
        fields = [
            ("Applicant Name", name),
            ("Annual Family Income", f"INR {income}"),
            ("Income Source", app['income']['income_source']),
            ("Financial Year", "2025-2026")
        ]
    elif doc_type == "DOMICILE_CERTIFICATE":
        fields = [
            ("Applicant Name", name),
            ("Resident State", app['category']['domicile_state']),
            ("Status", "Permanent Resident")
        ]
    elif doc_type == "AADHAR":
        fields = [
            ("Name", name),
            ("DOB", dob),
            ("Gender", app['student']['gender']),
            ("Aadhar Number", f"XXXX-XXXX-{random.randint(1000, 9999)}")
        ]
    elif doc_type == "MARKSHEET":
        fields = [
            ("Student Name", name),
            ("Date of Birth", dob),
            ("Institution", institution),
            ("Course / Programme", course),
            ("Academic Year", academic_year),
            ("Examination", app['education']['last_qualified_exam']),
            ("Percentage", f"{app['education']['last_qualified_marks_percent']}%"),
            ("Result", "PASS")
        ]
    elif doc_type == "PASSPORT_PHOTO":
        fields = [
            ("Image", "[SYNTHETIC FACE PLACEHOLDER]"),
            ("Applicant", name)
        ]
    
    for label, val in fields:
        c.drawString(1.2 * inch, y, f"{label}: {val}")
        y -= 0.3 * inch
        
    c.save()
    return [{"field": f[0], "value": f[1]} for f in fields]

for app in apps:
    app_id = app['application_id']
    app_dir = os.path.join(OUTPUT_DIR, app_id)
    if not os.path.exists(app_dir):
        os.makedirs(app_dir)
        
    # Determine defects to apply based on tags
    tags = app['scenario_tags']
    defect_mods = []
    if "NAME_MISMATCH" in tags: defect_mods.append("NAME_MISMATCH")
    if "DOB_MISMATCH" in tags: defect_mods.append("DOB_MISMATCH")
    if "CATEGORY_ISSUE" in tags: defect_mods.append("CATEGORY_ISSUE")
    if any(t in tags for t in ["INCOME_ABOVE_LIMIT", "MULTIPLE_DEFICIENCIES"]): 
        defect_mods.append("INCOME_ISSUE")
    if "INSTITUTION/COURSE/OTHER_SCHOLARSHIP" in tags:
        defect_mods.append("INSTITUTION_COURSE_ISSUE")
        
    for doc in app['documents_expected']:
        doc_type = doc['document_type']
        
        # Determine quality
        qualities = ["CLEAN", "CLEAN", "CLEAN", "ROTATED", "FAINT"]
        quality = random.choice(qualities) if "VALID_BASELINE" not in tags else "CLEAN"
        
        doc_id = f"DOC-{doc_counter:06d}"
        filename = f"{doc_id}.pdf"
        filepath = os.path.join(app_dir, filename)
        
        expected_fields = create_synthetic_pdf(filepath, doc_id, app, doc_type, quality, defect_mods)
        
        manifest.append({
            "document_id": doc_id,
            "application_id": app_id,
            "document_type": doc_type,
            "filename": filename,
            "format": "PDF",
            "quality_label": quality,
            "scenario_role": "BASELINE" if "VALID_BASELINE" in tags else "DEFECTIVE_SCENARIO" if doc_type in ["MARKSHEET", "ST_CERTIFICATE", "INCOME_CERTIFICATE"] else "CONTEXT",
            "synthetic": True,
            "watermarked": True,
            "expected_fields": expected_fields,
            "intentional_defects": defect_mods,
            "source_application_field_refs": "applications.json",
            "notes": "Generated by synthetic document generator."
        })
        
        doc_counter += 1

with open(os.path.join(OUTPUT_DIR, 'document_manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=4)

print(f"Generated {doc_counter - 1} documents for {len(apps)} applications.")
